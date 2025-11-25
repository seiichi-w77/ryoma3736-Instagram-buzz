/**
 * Instagram Media Downloader Module
 * Handles downloading videos and media from Instagram
 */

import { validateInstagramUrl } from './validator';

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
      // In a production environment, you would:
      // 1. Use Instagram API (if you have access)
      // 2. Use a third-party service like instagrapi, yt-dlp, or similar
      // 3. Implement proper media extraction from Instagram's network requests
      //
      // For this example, we'll return a simulated response structure

      const fileName = this.generateFileName(request);
      const mediaUrl = await this.fetchMediaUrl(request);

      return {
        success: true,
        mediaUrl,
        fileName,
        mediaType: 'video/mp4',
        size: 1024 * 1024 * 5, // Simulated 5MB
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
   * Fetches the media URL from Instagram
   * This is a placeholder that would be implemented with actual API calls
   *
   * @param request - The download request
   * @returns The media URL
   */
  private async fetchMediaUrl(request: DownloadRequest): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const validation = validateInstagramUrl(request.url);
    const mediaId = validation.mediaId || 'unknown';

    // In production, this would fetch actual media from Instagram
    return `https://media.cdn.example.com/instagram/${mediaId}/video.${request.format || 'mp4'}`;
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
