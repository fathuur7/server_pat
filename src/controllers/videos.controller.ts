import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { processEpisodeToHLS } from "../services/video.service";

/** Safely cast a multer body field (string | string[]) to string | undefined */
const str = (v: unknown): string | undefined =>
  Array.isArray(v) ? (v[0] as string) : (v as string | undefined);

/** Safely cast a multer body field (string | string[]) to number | undefined */
const num = (v: unknown): number | undefined => {
  if (Array.isArray(v)) v = v[0];
  if (typeof v !== "string") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO SERIES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/videos — public list */
export const getVideos = async (req: Request, res: Response): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const genre = typeof req.query.genre === "string" ? req.query.genre : undefined;
  const excludeGenre = typeof req.query.excludeGenre === "string" ? req.query.excludeGenre : undefined;
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "10"), 10);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }
  if (genre) {
    where.genres = {
      some: {
        name: { equals: genre, mode: "insensitive" }
      }
    };
  }
  if (excludeGenre) {
    where.genres = {
      ...where.genres,
      none: {
        name: { equals: excludeGenre, mode: "insensitive" }
      }
    };
  }

  // Determine sorting logic
  let orderBy: any = { createdAt: "desc" };
  if (sort === "likes") {
    orderBy = { likes: "desc" };
  } else if (sort === "views") {
    orderBy = { views: "desc" };
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { 
        _count: { select: { episodes: true } },
        genres: true
      },
    }),
    prisma.video.count({ where }),
  ]);

  res.json({ success: true, data: videos, meta: { total, page, limit } });
};

/** GET /api/videos/featured — first 6 for hero */
export const getFeaturedVideos = async (_req: Request, res: Response): Promise<void> => {
  const data = await prisma.video.findMany({
    where: { status: { not: "DRAFT" } },
    take: 6,
    orderBy: { views: "desc" },
    include: { 
      _count: { select: { episodes: true } },
      genres: true
    },
  });
  res.json({ success: true, data });
};

/** GET /api/videos/my-videos — creator's own series */
export const getMyVideos = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

  const videos = await prisma.video.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: { 
      _count: { select: { episodes: true } },
      genres: true
    },
  });
  res.json({ success: true, data: videos });
};

/** GET /api/videos/:id — single series with episodes (tracks view by IP) */
export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  const id = str(req.params.id) ?? "";
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      episodes: { orderBy: { episodeNumber: "asc" } },
      author: { select: { id: true, name: true } },
      _count: { select: { episodes: true } },
      genres: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } }
      }
    },
  });

  if (!video) { res.status(404).json({ success: false, message: "Series not found" }); return; }

  // View tracking is now handled per-episode by POST /api/videos/:videoId/episodes/:episodeId/view

  // Return liked status for authenticated user on a per-episode basis
  // Also return saved status for the series
  const userId = req.user?.userId;
  let userLikes = new Set<string>();
  let saved = false;

  if (userId) {
    const existingLikes = await prisma.episodeLike.findMany({
      where: { userId, episode: { videoId: id } },
    });
    existingLikes.forEach(like => userLikes.add(like.episodeId));

    const existingSave = await prisma.savedVideo.findUnique({
      where: { userId_videoId: { userId, videoId: id } }
    });
    saved = !!existingSave;
  }

  const episodesWithLikes = video.episodes.map(ep => ({
    ...ep,
    liked: userLikes.has(ep.id)
  }));

  res.json({ 
    success: true, 
    data: { 
      ...video, 
      episodes: episodesWithLikes,
      saved 
    } 
  });
};

/** POST /api/videos — create a new series (no file upload) */
export const createVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const title = str(req.body.title);
    const description = str(req.body.description);
    const userId = req.user?.userId;
    
    // Parse genres from body. Could be array of strings or comma-separated string
    let genreNames: string[] = [];
    if (Array.isArray(req.body.genres)) {
      genreNames = req.body.genres;
    } else if (typeof req.body.genres === "string") {
      genreNames = req.body.genres.split(",").map((g: string) => g.trim()).filter((g: string) => g.length > 0);
    } else if (typeof req.body.genre === "string") {
      // Fallback for old single 'genre' string
      genreNames = req.body.genre.split(",").map((g: string) => g.trim()).filter((g: string) => g.length > 0);
    }

    if (!title) { res.status(400).json({ success: false, message: "Title is required" }); return; }
    if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnailFile = files?.["thumbnail"]?.[0];
    const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null;

    const video = await prisma.video.create({
      data: { 
        title, 
        description, 
        thumbnailUrl, 
        authorId: userId,
        genres: {
          connectOrCreate: genreNames.map(name => ({
            where: { name: name.toUpperCase() },
            create: { name: name.toUpperCase() }
          }))
        }
      },
      include: { genres: true }
    });
    res.status(201).json({ success: true, data: video });
  } catch (err) {
    console.error("Create video error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** PATCH /api/videos/:id — update series metadata */
export const updateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = str(req.params.id) ?? "";
    const userId = req.user?.userId;
    const title = str(req.body.title);
    const description = str(req.body.description);
    const status = str(req.body.status) as "DRAFT" | "ONGOING" | "COMPLETED" | undefined;

    // Parse genres
    let genreNames: string[] | undefined;
    if (req.body.genres !== undefined) {
      if (Array.isArray(req.body.genres)) {
        genreNames = req.body.genres;
      } else if (typeof req.body.genres === "string") {
        genreNames = req.body.genres.split(",").map((g: string) => g.trim()).filter((g: string) => g.length > 0);
      }
    } else if (req.body.genre !== undefined) {
      if (typeof req.body.genre === "string") {
        genreNames = req.body.genre.split(",").map((g: string) => g.trim()).filter((g: string) => g.length > 0);
      }
    }

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) { res.status(404).json({ success: false, message: "Series not found" }); return; }
    if (video.authorId !== userId) { res.status(403).json({ success: false, message: "Forbidden" }); return; }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnailFile = files?.["thumbnail"]?.[0];
    const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : undefined;

    const updated = await prisma.video.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(genreNames !== undefined && {
          genres: {
            set: [], // Disconnect old ones
            connectOrCreate: genreNames.map(name => ({
              where: { name: name.toUpperCase() },
              create: { name: name.toUpperCase() }
            }))
          }
        }),
      },
      include: { genres: true }
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update video error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EPISODES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/videos/:videoId/episodes */
export const getEpisodes = async (req: Request, res: Response): Promise<void> => {
  const videoId = str(req.params.videoId) ?? "";
  const episodes = await prisma.episode.findMany({
    where: { videoId },
    orderBy: { episodeNumber: "asc" },
  });
  res.json({ success: true, data: episodes });
};

/** GET /api/videos/:videoId/episodes/:episodeId */
export const getEpisodeById = async (req: Request, res: Response): Promise<void> => {
  const episodeId = str(req.params.episodeId) ?? "";
  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) { res.status(404).json({ success: false, message: "Episode not found" }); return; }
  res.json({ success: true, data: episode });
};

/** POST /api/videos/:videoId/episodes — upload new episode */
export const uploadEpisode = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = str(req.params.videoId) ?? "";
    const title = str(req.body.title);
    const description = str(req.body.description);
    const episodeNumber = str(req.body.episodeNumber);
    const userId = req.user?.userId;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const videoFile = files?.["file"]?.[0];
    const thumbnailFile = files?.["thumbnail"]?.[0];

    if (!videoFile) { res.status(400).json({ success: false, message: "No video file provided" }); return; }
    if (!episodeNumber) { res.status(400).json({ success: false, message: "Episode number is required" }); return; }

    // Verify ownership
    const series = await prisma.video.findUnique({ where: { id: videoId } });
    if (!series) { res.status(404).json({ success: false, message: "Series not found" }); return; }
    if (series.authorId !== userId) { res.status(403).json({ success: false, message: "Forbidden" }); return; }

    const manualThumbnailUrl = thumbnailFile
      ? `/uploads/thumbnails/${thumbnailFile.filename}`
      : undefined;

    const episode = await prisma.episode.create({
      data: {
        videoId,
        episodeNumber: parseInt(episodeNumber, 10),
        title: title ?? null,
        description: description ?? null,
        thumbnailUrl: manualThumbnailUrl ?? null,
        status: "PROCESSING",
      },
    });

    // Start async HLS processing
    processEpisodeToHLS(episode.id, videoFile.path, !manualThumbnailUrl);

    res.status(201).json({
      success: true,
      message: "Episode uploaded and is now processing",
      data: episode,
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      res.status(409).json({ success: false, message: "Episode number already exists for this series" });
      return;
    }
    console.error("Upload episode error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** POST /api/videos/:videoId/episodes/:episodeId/like — toggle like (1 per user per episode) */
export const likeEpisode = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = str(req.params.videoId) ?? "";
    const episodeId = str(req.params.episodeId) ?? "";
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ success: false, message: "Login required to like" }); return; }

    const existing = await prisma.episodeLike.findUnique({
      where: { userId_episodeId: { userId, episodeId } },
    });

    let liked: boolean;
    if (existing) {
      // Unlike
      await prisma.$transaction([
        prisma.episodeLike.delete({ where: { userId_episodeId: { userId, episodeId } } }),
        prisma.episode.update({ where: { id: episodeId }, data: { likes: { decrement: 1 } } }),
        prisma.video.update({ where: { id: videoId }, data: { likes: { decrement: 1 } } })
      ]);
      liked = false;
    } else {
      // Like
      await prisma.$transaction([
        prisma.episodeLike.create({ data: { userId, episodeId } }),
        prisma.episode.update({ where: { id: episodeId }, data: { likes: { increment: 1 } } }),
        prisma.video.update({ where: { id: videoId }, data: { likes: { increment: 1 } } })
      ]);
      liked = true;
    }

    const episode = await prisma.episode.findUnique({ where: { id: episodeId }, select: { likes: true } });
    const video = await prisma.video.findUnique({ where: { id: videoId }, select: { likes: true } });

    res.json({ success: true, data: { likes: episode?.likes ?? 0, videoLikes: video?.likes ?? 0, liked } });
  } catch (error) {
    console.error("Like episode error:", error);
    res.status(500).json({ success: false, message: "Failed to like episode" });
  }
};

/** POST /api/videos/:videoId/episodes/:episodeId/view — track episode view (1 per IP) */
export const viewEpisode = async (req: Request, res: Response): Promise<void> => {
  const videoId = str(req.params.videoId) ?? "";
  const episodeId = str(req.params.episodeId) ?? "";
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";

  try {
    // Attempt to track view for this IP and episode
    await prisma.episodeView.create({
      data: { episodeId, ipAddress: ip },
    });

    // If successful (no unique constraint error), increment both episode and video views
    await prisma.$transaction([
      prisma.episode.update({ where: { id: episodeId }, data: { views: { increment: 1 } } }),
      prisma.video.update({ where: { id: videoId }, data: { views: { increment: 1 } } })
    ]);

    res.json({ success: true, message: "View tracked" });
  } catch (error: any) {
    // P2002 means the IP has already viewed this episode (unique constraint failed)
    if (error?.code === "P2002") {
      res.json({ success: true, message: "Already viewed" }); // Not an error to the client
      return;
    }
    console.error("View tracking error:", error);
    res.status(500).json({ success: false, message: "Failed to track view" });
  }
};

/** POST /api/videos/:id/comments — Add a comment to a video */
export const addComment = async (req: Request, res: Response): Promise<void> => {
  const id = str(req.params.id) ?? "";
  const { text } = req.body;
  const userId = req.user?.userId;

  if (!userId || !text) {
    res.status(400).json({ success: false, message: "Invalid request data" });
    return;
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        videoId: id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: comment });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};
