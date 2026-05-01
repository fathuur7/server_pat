import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// Get user's vault (saved videos)
export const getVault = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const savedVideos = await prisma.savedVideo.findMany({
      where: { userId },
      include: {
        video: {
          include: {
            genres: true,
            _count: {
              select: { episodes: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Extract the video objects
    const videos = savedVideos.map(sv => sv.video);

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error("Failed to fetch vault:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Toggle save/unsave video
export const toggleSavedVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = String(req.params.videoId);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Check if video exists
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      res.status(404).json({ success: false, message: "Video not found" });
      return;
    }

    // Check if already saved
    const existingSave = await prisma.savedVideo.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    });

    if (existingSave) {
      // Unsave
      await prisma.savedVideo.delete({
        where: { id: existingSave.id }
      });
      res.json({ success: true, data: { saved: false }, message: "Video removed from vault" });
    } else {
      // Save
      await prisma.savedVideo.create({
        data: {
          userId,
          videoId
        }
      });
      res.json({ success: true, data: { saved: true }, message: "Video added to vault" });
    }
  } catch (error) {
    console.error("Failed to toggle saved video:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
