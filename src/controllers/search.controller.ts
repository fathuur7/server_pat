import { Request, Response } from "express";
import { VideoModel } from "../models/video.model";
import { ApiResponse, Video } from "../types";

export const searchVideos = (req: Request, res: Response): void => {
  const q = req.query.q;

  if (!q || typeof q !== "string" || q.trim() === "") {
    const response: ApiResponse<Video[]> = {
      success: false,
      data: [],
      message: "Query parameter 'q' is required",
    };
    res.status(400).json(response);
    return;
  }

  // We can leverage our VideoModel instead of repeating the filter logic
  const response = VideoModel.findAll({ q: q.trim(), limit: 50 });

  res.json({
    success: true,
    data: response.data,
    message: `Found ${response.data.length} result(s) for "${q}"`,
  });
};
