import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import expressApp from "express"; // (Keep default import valid too)
import { STREAMS_DIR } from "./services/transcoder";

// ── Middlewares ──
import { corsMiddleware } from "./middlewares/cors.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { hlsHeadersMiddleware } from "./middlewares/hls.middleware";

// ── Routers ──
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import videosRouter from "./routes/videos";
import categoriesRouter from "./routes/categories";
import searchRouter from "./routes/search";
import streamRouter from "./routes/stream";
import vaultRouter from "./routes/vault";

const app = expressApp();
const PORT = process.env.PORT ?? 4000;

// ── Core Middleware ────────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static: serve HLS segments & playlists ────────────────────────────────────
app.use("/streams", hlsHeadersMiddleware, express.static(STREAMS_DIR));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/videos", videosRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/search", searchRouter);
app.use("/api/stream", streamRouter);
app.use("/api/vault", vaultRouter);

// ── Handlers (404 & Global Errors) ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n   NadaSaku API  →  http://localhost:${PORT}`);
  console.log(`\n   REST`);
  console.log(`     GET  /health`);
  console.log(`     GET  /api/videos`);
  console.log(`     GET  /api/videos/featured`);
  console.log(`     GET  /api/videos/:id`);
  console.log(`     GET  /api/categories`);
  console.log(`     GET  /api/search?q=<query>`);
  console.log(`\n   HLS`);
  console.log(`     POST /api/stream/upload          ← upload & transcode video`);
  console.log(`     GET  /api/stream/jobs            ← list transcode jobs`);
  console.log(`     GET  /api/stream/jobs/:jobId     ← poll job status`);
  console.log(`     GET  /api/stream/:videoId        ← get stream info`);
  console.log(`     GET  /streams/:videoId/master.m3u8  ← HLS master playlist`);
  console.log(`\n   ⚠  FFmpeg must be installed and in PATH for transcoding`);
});

export default app;
