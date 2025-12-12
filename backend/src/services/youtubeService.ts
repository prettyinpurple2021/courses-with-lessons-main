import axios from 'axios';
import { logger } from '../utils/logger.js';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number; // in seconds
  channelTitle: string;
  publishedAt: string;
  isEmbeddable: boolean;
  isAvailable: boolean;
}

/**
 * Validate if a YouTube video ID exists and is accessible
 */
export async function validateYouTubeVideoId(videoId: string): Promise<boolean> {
  if (!YOUTUBE_API_KEY) {
    logger.warn('YouTube API key not configured. Skipping validation.');
    return true; // Allow if API key not configured
  }

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'status',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      // Check if video is embeddable and not private
      return (
        video.status.embeddable &&
        video.status.privacyStatus !== 'private'
      );
    }

    return false;
  } catch (error) {
    logger.error('YouTube API validation error', { error, videoId });
    return false;
  }
}

/**
 * Fetch metadata for a YouTube video
 */
export async function getYouTubeVideoMetadata(
  videoId: string
): Promise<YouTubeVideoMetadata | null> {
  if (!YOUTUBE_API_KEY) {
    logger.warn('YouTube API key not configured. Returning minimal metadata.');
    return {
      id: videoId,
      title: 'Video',
      description: '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0,
      channelTitle: '',
      publishedAt: new Date().toISOString(),
      isEmbeddable: true,
      isAvailable: true,
    };
  }

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,status',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const video = response.data.items[0];
    const duration = parseISO8601Duration(video.contentDetails.duration);

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail:
        video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.default?.url,
      duration,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      isEmbeddable: video.status.embeddable,
      isAvailable: video.status.privacyStatus !== 'private',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseData = axios.isAxiosError(error) ? error.response?.data : null;
    logger.error('YouTube API metadata error', { error: responseData || errorMessage, videoId });
    return null;
  }
}

/**
 * Parse ISO 8601 duration format (e.g., PT1H2M10S) to seconds
 */
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Handle direct video ID
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url;
  }

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Batch validate multiple YouTube video IDs
 */
export async function batchValidateYouTubeVideos(
  videoIds: string[]
): Promise<Map<string, boolean>> {
  if (!YOUTUBE_API_KEY) {
    logger.warn('YouTube API key not configured. Skipping batch validation.');
    return new Map(videoIds.map((id) => [id, true]));
  }

  const results = new Map<string, boolean>();

  // YouTube API allows up to 50 IDs per request
  const batchSize = 50;
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);

    try {
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
          part: 'status',
          id: batch.join(','),
          key: YOUTUBE_API_KEY,
        },
      });

      // Mark all videos in batch as invalid initially
      batch.forEach((id) => results.set(id, false));

      // Update valid videos
      if (response.data.items) {
        response.data.items.forEach((video: any) => {
          const isValid =
            video.status.embeddable &&
            video.status.privacyStatus !== 'private';
          results.set(video.id, isValid);
        });
      }
    } catch (error) {
      logger.error('YouTube API batch validation error', { error, batchSize: batch.length });
      // Mark all videos in failed batch as invalid
      batch.forEach((id) => results.set(id, false));
    }
  }

  return results;
}
