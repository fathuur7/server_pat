import { Request, Response } from "express";
import {
  startTranscode,
  getJob,
  listJobs,
  streamExistsOnDisk,
} from "../services/transcoder";
import type { ApiResponse, HlsJob } from "../types";
import { getBaseUrl, buildVariantsFromDisk } from "../utils/helpers";

/**
 * Handle new video uploads and trigger HLS transcoding.
 */
export const uploadVideo = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No video file uploaded" });
    return;
  }

  const rawId = req.body.videoId;
  const videoId: string | undefined =
    typeof rawId === "string" && rawId.trim() ? rawId.trim() : undefined;

  if (!videoId) {
    res.status(400).json({
      success: false,
      message: "Field 'videoId' is required (e.g. 'neon-vigilante-ep04')",
    });
    return;
  }

  if (streamExistsOnDisk(videoId)) {
    const existing = listJobs().find(
      (j) => j.videoId === videoId && j.status === "ready"
    );
    if (existing) {
      const response: ApiResponse<HlsJob> = {
        success: true,
        data: existing,
        message: "Stream already exists for this videoId",
      };
      res.status(200).json(response);
      return;
    }
  }

  const job = startTranscode(videoId, req.file.path, getBaseUrl(req));
  const response: ApiResponse<HlsJob> = {
    success: true,
    data: job,
    message: "Transcode started. Poll /api/stream/jobs/:jobId for status.",
  };
  res.status(202).json(response);
};

/**
 * Get a list of all currently active or completed local transcode jobs.
 */
export const getJobs = (_req: Request, res: Response): void => {
  const response: ApiResponse<HlsJob[]> = { success: true, data: listJobs() };
  res.json(response);
};

/**
 * Poll details for a specific transcoding job.
 */
export const getJobById = (req: Request, res: Response): void => {
  const jobId = String(req.params.jobId);
  const job = getJob(jobId);
  if (!job) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: `Job '${jobId}' not found`,
    };
    res.status(404).json(response);
    return;
  }
  const response: ApiResponse<HlsJob> = { success: true, data: job };
  res.json(response);
};

/**
 * Get stream info and variant playlists (HLS).
 */
export const getStreamInfo = (req: Request, res: Response): void => {
  const videoId = String(req.params.videoId);

  if (!streamExistsOnDisk(videoId)) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: `No HLS stream found for '${videoId}'. Upload and transcode first.`,
    };
    res.status(404).json(response);
    return;
  }

  const job = listJobs().find((j) => j.videoId === videoId && j.status === "ready");
  const base = getBaseUrl(req);
  const masterPlaylistUrl = `${base}/streams/${videoId}/master.m3u8`;
  const variants = job?.variants ?? buildVariantsFromDisk(videoId, base);

  const response: ApiResponse<object> = {
    success: true,
    data: { videoId, masterPlaylistUrl, variants },
  };
  res.json(response);
};
