import { Request, Response, NextFunction } from "express";

/**
 * Middleware untuk menyetel header CORS dan MIME Type secara spesifik untuk file statis HLS.
 */
export const hlsHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.path.endsWith(".m3u8")) {
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  } else if (req.path.endsWith(".ts")) {
    res.setHeader("Content-Type", "video/mp2t");
  }
  
  // Mengizinkan semua domain mengakses segmen HLS jika dipanggil dari player
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
};
