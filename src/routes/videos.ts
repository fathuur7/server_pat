import { Router } from "express";
import {
  getVideos,
  getFeaturedVideos,
  getMyVideos,
  getVideoById,
  createVideo,
  updateVideo,
  getEpisodes,
  getEpisodeById,
  uploadEpisode,
  likeEpisode,
  viewEpisode,
  addComment,
} from "../controllers/videos.controller";
import { protect, isCreator } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/",         getVideos);
router.get("/featured", getFeaturedVideos);

// ── Authenticated (Creator) — must come BEFORE /:id ──────────────────────────
router.get("/my-videos", protect, getMyVideos);

// ── Public (parameterized) ────────────────────────────────────────────────────
router.get("/:id",                              getVideoById);
router.get("/:videoId/episodes",               getEpisodes);
router.get("/:videoId/episodes/:episodeId",    getEpisodeById);
router.post("/:videoId/episodes/:episodeId/view", viewEpisode);
router.post("/:videoId/episodes/:episodeId/like", protect, likeEpisode);
router.post("/:id/comments", protect, addComment);

router.post(
  "/",
  protect,
  isCreator,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  createVideo
);

router.patch(
  "/:id",
  protect,
  isCreator,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateVideo
);

router.post(
  "/:videoId/episodes",
  protect,
  isCreator,
  upload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
  uploadEpisode
);

export default router;
