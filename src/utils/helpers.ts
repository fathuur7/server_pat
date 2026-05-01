import { Request } from "express";
import fs from "fs";
import path from "path";
import { STREAMS_DIR } from "../services/transcoder";

export function getBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}

export function buildVariantsFromDisk(
  videoId: string,
  base: string
): Array<{ label: string; playlistUrl: string }> {
  const videoDir = path.join(STREAMS_DIR, videoId);
  if (!fs.existsSync(videoDir)) return [];

  return fs
    .readdirSync(videoDir)
    .filter((name) => {
      const full = path.join(videoDir, name);
      return (
        fs.statSync(full).isDirectory() &&
        fs.existsSync(path.join(full, "index.m3u8"))
      );
    })
    .map((label) => ({
      label,
      playlistUrl: `${base}/streams/${videoId}/${label}/index.m3u8`,
    }));
}
