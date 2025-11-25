/**
 * Instagram Media Downloader Module
 * Handles downloading videos and media from Instagram
 */

import { validateInstagramUrl } from './validator';

/**
 * RapidAPI response structure (Instagram Scraper API v2)
 * Note: Structure may vary, so we use flexible typing
 */
interface RapidAPIResponse {
  data?: {
    video_url?: string;
    items?: Array<{
      video_url?: string;
      video_versions?: Array<{ url?: string }>;
      title?: string;
      caption?: { text?: string };
      user?: { username?: string; full_name?: string };
      owner?: { username?: string };
      thumbnail_url?: string;
      image_versions2?: { candidates?: Array<{ url?: string }> };
      video_duration?: number;
    }>;
  };
  items?: Array<{
    video_url?: string;
    video_versions?: Array<{ url?: string }>;
    title?: string;
    caption?: { text?: string };
    user?: { username?: string; full_name?: string };
    owner?: { username?: string };
    thumbnail_url?: string;
    image_versions2?: { candidates?: Array<{ url?: string }> };
    video_duration?: number;
  }>;
  video_url?: string;
  [key: string]: unknown;
}

/**
 * Download response with media information
 */
export interface DownloadResponse {
  success: boolean;
  mediaUrl?: string;
  fileName?: string;
  mediaType?: string;
  size?: number;
  error?: string;
  timestamp: string;
  title?: string;
  author?: string;
  thumbnail?: string;
  duration?: number;
  description?: string;
}

/**
 * Download request payload
 */
export interface DownloadRequest {
  url: string;
  quality?: 'high' | 'medium' | 'low';
  format?: 'mp4' | 'webm';
}

/**
 * Configuration for the downloader
 */
export interface DownloaderConfig {
  timeout?: number; // milliseconds
  maxRetries?: number;
  userAgent?: string;
  proxyUrl?: string;
}

/**
 * Default downloader configuration
 */
const DEFAULT_CONFIG: Required<DownloaderConfig> = {
  timeout: 30000,
  maxRetries: 3,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  proxyUrl: '',
};

/**
 * Instagram Media Downloader
 * Handles validation and downloading of Instagram media
 */
export class InstagramDownloader {
  private config: Required<DownloaderConfig>;

  /**
   * Creates a new Instagram downloader instance
   *
   * @param config - Optional configuration overrides
   */
  constructor(config?: Partial<DownloaderConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validates and prepares a download request
   *
   * @param request - The download request
   * @returns Download response with validation result
   */
  async validate(request: DownloadRequest): Promise<DownloadResponse> {
    const timestamp = new Date().toISOString();

    if (!request.url) {
      return {
        success: false,
        error: 'URL is required',
        timestamp,
      };
    }

    // Validate Instagram URL
    const validation = validateInstagramUrl(request.url);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid Instagram URL',
        timestamp,
      };
    }

    return {
      success: true,
      timestamp,
    };
  }

  /**
   * Downloads a media file from Instagram URL
   * Uses a mock implementation - in production, use proper Instagram API or scraping library
   *
   * @param request - The download request
   * @returns Download response with media information
   */
  async download(request: DownloadRequest): Promise<DownloadResponse> {
    const timestamp = new Date().toISOString();

    // First validate the URL
    const validation = await this.validate(request);
    if (!validation.success) {
      return validation;
    }

    try {
      const fileName = this.generateFileName(request);
      const mediaData = await this.fetchMediaUrl(request);

      return {
        success: true,
        mediaUrl: mediaData.mediaUrl,
        fileName,
        mediaType: 'video/mp4',
        size: 1024 * 1024 * 5, // Size would need to be fetched from actual media
        title: mediaData.title,
        author: mediaData.author,
        thumbnail: mediaData.thumbnail,
        duration: mediaData.duration,
        description: mediaData.description,
        timestamp,
      };
    } catch (error) {
      return {
        success: false,
        error: `Download failed: ${(error as Error).message}`,
        timestamp,
      };
    }
  }

  /**
   * Gets media information without downloading
   * Useful for preview or metadata extraction
   *
   * @param url - The Instagram URL
   * @returns Media information
   */
  async getMediaInfo(url: string): Promise<DownloadResponse> {
    const timestamp = new Date().toISOString();

    const validation = validateInstagramUrl(url);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid Instagram URL',
        timestamp,
      };
    }

    return {
      success: true,
      mediaType: validation.type === 'reel' ? 'video/mp4' : 'image/jpeg',
      timestamp,
    };
  }

  /**
   * Generates a filename for the downloaded media
   *
   * @param request - The download request
   * @returns Generated filename
   */
  private generateFileName(request: DownloadRequest): string {
    const validation = validateInstagramUrl(request.url);
    const mediaId = validation.mediaId || 'unknown';
    const type = validation.type || 'media';
    const format = request.format || 'mp4';
    const timestamp = Date.now();

    return `instagram_${type}_${mediaId}_${timestamp}.${format}`;
  }

  /**
   * Fetches the media URL and metadata from Instagram using RapidAPI
   *
   * @param request - The download request
   * @returns Object containing mediaUrl and metadata
   */
  private async fetchMediaUrl(request: DownloadRequest): Promise<{
    mediaUrl: string;
    title?: string;
    author?: string;
    thumbnail?: string;
    duration?: number;
    description?: string;
  }> {
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
      throw new Error(
        'RAPIDAPI_KEY is not configured. Please set it in your environment variables.'
      );
    }

    try {
      // Build the API URL with query parameters
      const apiUrl = new URL('https://instagram-scraper-api2.p.rapidapi.com/v1/post_info');
      apiUrl.searchParams.append('code_or_id_or_url', request.url);

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(
          `RapidAPI request failed with status ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Extract media information from the API response
      // The structure may vary, so we need to handle different formats
      const mediaUrl = this.extractMediaUrl(data, request);
      const metadata = this.extractMetadata(data);

      return {
        mediaUrl,
        ...metadata,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout: Instagram API took too long to respond');
        }
        throw new Error(`Failed to fetch Instagram media: ${error.message}`);
      }
      throw new Error('Failed to fetch Instagram media: Unknown error');
    }
  }

  /**
   * Extracts the media URL from the RapidAPI response
   *
   * @param data - The API response data
   * @param _request - The download request (unused)
   * @returns The media URL
   */
  private extractMediaUrl(data: RapidAPIResponse, _request: DownloadRequest): string {
    // Try different possible locations for the video URL
    const videoUrl =
      data?.data?.video_url ||
      data?.data?.items?.[0]?.video_url ||
      data?.items?.[0]?.video_versions?.[0]?.url ||
      data?.video_url;

    if (!videoUrl) {
      throw new Error('No video URL found in Instagram API response');
    }

    return videoUrl;
  }

  /**
   * Extracts metadata from the RapidAPI response
   *
   * @param data - The API response data
   * @returns Metadata object
   */
  private extractMetadata(data: RapidAPIResponse): {
    title?: string;
    author?: string;
    thumbnail?: string;
    duration?: number;
    description?: string;
  } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item: any = data?.data?.items?.[0] || data?.items?.[0] || data?.data || {};

    return {
      title: item.title || item.caption?.text || undefined,
      author:
        item.user?.username ||
        item.owner?.username ||
        item.user?.full_name ||
        undefined,
      thumbnail:
        item.thumbnail_url ||
        item.image_versions2?.candidates?.[0]?.url ||
        undefined,
      duration: item.video_duration || undefined,
      description: item.caption?.text || undefined,
    };
  }
}

/**
 * Creates a downloader instance with default configuration
 *
 * @param config - Optional configuration
 * @returns InstagramDownloader instance
 */
export function createDownloader(
  config?: Partial<DownloaderConfig>
): InstagramDownloader {
  return new InstagramDownloader(config);
}
