import { api } from './api';

export interface YouTubeVideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  channelTitle: string;
  publishedAt: string;
  isEmbeddable: boolean;
  isAvailable: boolean;
}

export interface VideoValidationResult {
  videoId: string;
  isValid: boolean;
  message: string;
}

export interface BatchValidationResult {
  results: Record<string, boolean>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * Validate a YouTube video ID
 */
export async function validateYouTubeVideo(videoId: string): Promise<VideoValidationResult> {
  const response = await api.get(`/admin/youtube/validate/${videoId}`);
  return response.data.data;
}

/**
 * Get metadata for a YouTube video
 */
export async function getYouTubeVideoMetadata(videoId: string): Promise<YouTubeVideoMetadata> {
  const response = await api.get(`/admin/youtube/metadata/${videoId}`);
  return response.data.data;
}

/**
 * Extract YouTube video ID from a URL
 */
export async function extractYouTubeVideoId(url: string): Promise<string> {
  const response = await api.post('/admin/youtube/extract-id', { url });
  return response.data.data.videoId;
}

/**
 * Batch validate multiple YouTube video IDs
 */
export async function batchValidateYouTubeVideos(
  videoIds: string[]
): Promise<BatchValidationResult> {
  const response = await api.post('/admin/youtube/batch-validate', { videoIds });
  return response.data.data;
}

/**
 * Extract video ID from URL or return as-is if already an ID
 */
export function extractVideoIdFromInput(input: string): string | null {
  // If it's already a video ID (11 characters, alphanumeric with dashes/underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // Try to extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
