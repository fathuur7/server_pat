import { Video, VideoDetail, PaginatedResponse } from "../types";
import { videos } from "../data/videos";
import { getVideoDetail, videoDetails } from "../data/videoDetails";

export class VideoModel {
  /**
   * Mengambil semua video dengan opsi fitur list & search
   */
  static findAll({
    q,
    page = 1,
    limit = 10,
  }: {
    q?: string;
    page?: number;
    limit?: number;
  }): PaginatedResponse<Video> {
    let result = [...videos];

    if (q) {
      const query = q.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(query) || v.alt.toLowerCase().includes(query)
      );
    }

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit));
    const start = (pageNum - 1) * limitNum;
    const paginated = result.slice(start, start + limitNum);

    return {
      success: true,
      data: paginated,
      total: result.length,
      page: pageNum,
      limit: limitNum,
    };
  }

  /**
   * Mengambil video berdasarkan ID.
   */
  static findById(id: string): { exists: boolean; detail: VideoDetail } {
    const exists = id in videoDetails;
    const detail = getVideoDetail(id);
    return { exists, detail };
  }

  /**
   * Mengambil 3 video untuk featured hero section.
   */
  static findFeatured(): Video[] {
    return videos.slice(0, 3);
  }
}
