import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import type { HlsJob, HlsStatus, HlsVariant } from "../types";

// ── Paths ──────────────────────────────────────────────────────────────────────
export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
export const STREAMS_DIR = path.resolve(process.cwd(), "streams");

// Ensure directories exist at startup
[UPLOADS_DIR, STREAMS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── In-memory job store ────────────────────────────────────────────────────────
// In production this should be replaced by a database (e.g. Redis / Postgres)
const jobs = new Map<string, HlsJob>();

export function getJob(jobId: string): HlsJob | undefined {
  return jobs.get(jobId);
}

export function listJobs(): HlsJob[] {
  return Array.from(jobs.values());
}

// ── Quality ladder ─────────────────────────────────────────────────────────────
interface QualityPreset {
  label: string;
  resolution: string;
  videoBitrate: number; // kbps
  audioBitrate: number; // kbps
}

const QUALITY_PRESETS: QualityPreset[] = [
  { label: "360p",  resolution: "640x360",   videoBitrate: 800,  audioBitrate: 96  },
  { label: "720p",  resolution: "1280x720",  videoBitrate: 2800, audioBitrate: 128 },
  { label: "1080p", resolution: "1920x1080", videoBitrate: 5000, audioBitrate: 192 },
];

// Segment duration in seconds
const HLS_SEGMENT_DURATION = 6;

// ── Helper ─────────────────────────────────────────────────────────────────────
function updateJob(id: string, patch: Partial<HlsJob>): void {
  const job = jobs.get(id);
  if (!job) return;
  jobs.set(id, { ...job, ...patch, updatedAt: new Date().toISOString() });
}

// ── Transcode one quality variant ──────────────────────────────────────────────
function transcodeVariant(
  sourcePath: string,
  outputDir: string,
  preset: QualityPreset,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const variantDir = path.join(outputDir, preset.label);
    if (!fs.existsSync(variantDir)) fs.mkdirSync(variantDir, { recursive: true });

    const playlistPath = path.join(variantDir, "index.m3u8");
    const segmentPattern = path.join(variantDir, "segment%03d.ts");

    ffmpeg(sourcePath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size(preset.resolution)
      .videoBitrate(preset.videoBitrate)
      .audioBitrate(preset.audioBitrate)
      .addOutputOption("-profile:v", "baseline")
      .addOutputOption("-level", "3.0")
      .addOutputOption("-start_number", "0")
      .addOutputOption("-hls_time", String(HLS_SEGMENT_DURATION))
      .addOutputOption("-hls_list_size", "0")          // keep all segments
      .addOutputOption("-hls_segment_filename", segmentPattern)
      .addOutputOption("-f", "hls")
      .on("progress", (info) => {
        if (info.percent != null) onProgress(Math.round(info.percent));
      })
      .on("error", reject)
      .on("end", () => resolve(playlistPath))
      .save(playlistPath);
  });
}

// ── Write master playlist ──────────────────────────────────────────────────────
function writeMasterPlaylist(
  outputDir: string,
  variants: HlsVariant[]
): string {
  const masterPath = path.join(outputDir, "master.m3u8");

  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", ""];

  variants.forEach((v) => {
    const bandwidth = v.videoBitrate * 1000 + v.audioBitrate * 1000;
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${v.resolution},NAME="${v.label}"`);
    // Relative path: label/index.m3u8
    lines.push(`${v.label}/index.m3u8`);
    lines.push("");
  });

  fs.writeFileSync(masterPath, lines.join("\n"), "utf8");
  return masterPath;
}

// ── Public: start transcode job ────────────────────────────────────────────────
export function startTranscode(
  videoId: string,
  sourcePath: string,
  baseUrl: string
): HlsJob {
  const jobId = uuidv4();
  const outputDir = path.join(STREAMS_DIR, videoId);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const now = new Date().toISOString();
  const job: HlsJob = {
    id: jobId,
    videoId,
    sourcePath,
    status: "processing",
    variants: [],
    createdAt: now,
    updatedAt: now,
    progress: 0,
  };

  jobs.set(jobId, job);

  // Run all variants in parallel for speed
  const variantWork = QUALITY_PRESETS.map((preset) =>
    transcodeVariant(sourcePath, outputDir, preset, (pct) => {
      // Average progress across variants isn't perfect but good enough
      updateJob(jobId, { progress: pct });
    }).then(
      (): HlsVariant => ({
        label: preset.label,
        videoBitrate: preset.videoBitrate,
        audioBitrate: preset.audioBitrate,
        resolution: preset.resolution,
        playlistUrl: `${baseUrl}/streams/${videoId}/${preset.label}/index.m3u8`,
      })
    )
  );

  Promise.all(variantWork)
    .then((variants) => {
      writeMasterPlaylist(outputDir, variants);

      updateJob(jobId, {
        status: "ready" as HlsStatus,
        variants,
        masterPlaylistUrl: `${baseUrl}/streams/${videoId}/master.m3u8`,
        progress: 100,
      });

      console.log(`[HLS] ✅ Job ${jobId} (${videoId}) ready`);
    })
    .catch((err: Error) => {
      updateJob(jobId, { status: "error", error: err.message });
      console.error(`[HLS] ❌ Job ${jobId} failed:`, err.message);
    });

  return jobs.get(jobId)!;
}

// ── Public: check if a stream already exists on disk ──────────────────────────
export function streamExistsOnDisk(videoId: string): boolean {
  const masterPath = path.join(STREAMS_DIR, videoId, "master.m3u8");
  return fs.existsSync(masterPath);
}
