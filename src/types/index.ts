export interface Video {
  id: string;
  src: string;
  alt: string;
  duration: string;
  title: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  thumbnail: string;
  alt: string;
}

export interface VideoDetail extends Video {
  seriesTitle: string;
  episodeNumber: number;
  description: string;
  tags: string[];
  rating: number;
  reviewCount: string;
  episodes: Episode[];
}

export interface Category {
  bg: string;
  icon: string;
  iconColor: string;
  titleColor: string;
  descColor: string;
  title: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// ── HLS types ──────────────────────────────────────────────────────────────────

export type HlsStatus = "pending" | "processing" | "ready" | "error";

export interface HlsVariant {
  /** Label shown in player UI, e.g. "1080p" */
  label: string;
  /** Video bitrate in kbps */
  videoBitrate: number;
  /** Audio bitrate in kbps */
  audioBitrate: number;
  /** Output resolution, e.g. "1920x1080" */
  resolution: string;
  /** Relative URL of this variant's playlist */
  playlistUrl: string;
}

export interface HlsJob {
  id: string;
  videoId: string;
  /** Absolute path of the source file that was uploaded */
  sourcePath: string;
  status: HlsStatus;
  /** URL of the master playlist (available when status === "ready") */
  masterPlaylistUrl?: string;
  /** Available quality variants */
  variants: HlsVariant[];
  createdAt: string;
  updatedAt: string;
  /** Human-readable error message when status === "error" */
  error?: string;
  /** Transcode progress 0–100 */
  progress?: number;
}
