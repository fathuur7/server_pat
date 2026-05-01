import { Router } from "express";
import { upload } from "../utils/upload";
import { uploadVideo, getJobs, getJobById, getStreamInfo } from "../controllers/stream.controller";

const router = Router();

// ────────────────────────────────────────────────────────────────────────────────
// POST /api/stream/upload
// multipart/form-data fields:
//   video   — video file (mp4 / mov / mkv / avi / webm)
//   videoId — slug matching a video entry, e.g. "neon-vigilante-ep04"
// ────────────────────────────────────────────────────────────────────────────────
router.post("/upload", upload.single("video"), uploadVideo);

// ────────────────────────────────────────────────────────────────────────────────
// GET /api/stream/jobs — list all transcode jobs
// ────────────────────────────────────────────────────────────────────────────────
router.get("/jobs", getJobs);

// ────────────────────────────────────────────────────────────────────────────────
// GET /api/stream/jobs/:jobId — poll single job
// ────────────────────────────────────────────────────────────────────────────────
router.get("/jobs/:jobId", getJobById);

// ────────────────────────────────────────────────────────────────────────────────
// GET /api/stream/:videoId — stream info (master URL + variants)
// ────────────────────────────────────────────────────────────────────────────────
router.get("/:videoId", getStreamInfo);

export default router;
