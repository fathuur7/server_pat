import { Request, Response, NextFunction } from "express";

/**
 * Middleware untuk menangani request ke route yang belum terdaftar (404)
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: "Route not found" });
};

/**
 * Middleware untuk menangani error global di aplikasi
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Multer file size error
  if (err.message?.toLowerCase().includes("file too large")) {
    return res.status(413).json({ success: false, message: "File too large (max 4 GB)" });
  }

  console.error("[ERROR]", err.message);
  res.status(500).json({ success: false, message: err.message ?? "Internal server error" });
};
