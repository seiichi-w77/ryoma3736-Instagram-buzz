import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface YtDlpResult {
  success: boolean;
  url?: string;
  title?: string;
  uploader?: string;
  thumbnail?: string;
  duration?: number;
  description?: string;
  error?: string;
}

export interface YtDlpDownloadResult extends YtDlpResult {
  filePath?: string;
  fileSize?: number;
}

/**
 * Fetch Instagram video metadata using yt-dlp
 *
 * @param instagramUrl - Instagram post URL (reel, post, story)
 * @returns YtDlpResult with video metadata or error
 *
 * @example
 * ```typescript
 * const result = await fetchWithYtDlp('https://www.instagram.com/reel/ABC123/');
 * if (result.success) {
 *   console.log('Video URL:', result.url);
 *   console.log('Uploader:', result.uploader);
 * }
 * ```
 */
export async function fetchWithYtDlp(instagramUrl: string): Promise<YtDlpResult> {
  const TIMEOUT_MS = 30000;

  try {
    // Check if yt-dlp is installed
    try {
      await execAsync('which yt-dlp', { timeout: 5000 });
    } catch {
      return {
        success: false,
        error: 'yt-dlp is not installed. Please install it: brew install yt-dlp',
      };
    }

    // Execute yt-dlp with JSON output
    const command = `yt-dlp --dump-json --no-download "${instagramUrl}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: TIMEOUT_MS,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    if (stderr && !stdout) {
      return {
        success: false,
        error: `yt-dlp error: ${stderr}`,
      };
    }

    // Parse JSON output
    const data = JSON.parse(stdout);

    return {
      success: true,
      url: data.url || data.formats?.[0]?.url,
      title: data.title,
      uploader: data.uploader || data.uploader_id,
      thumbnail: data.thumbnail,
      duration: data.duration,
      description: data.description,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        return {
          success: false,
          error: `yt-dlp timeout after ${TIMEOUT_MS / 1000} seconds`,
        };
      }

      return {
        success: false,
        error: `yt-dlp execution failed: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}

/**
 * Download Instagram video file to disk using yt-dlp
 *
 * @param instagramUrl - Instagram post URL (reel, post, story)
 * @param outputDir - Directory to save the downloaded file (default: public/downloads/videos)
 * @returns YtDlpDownloadResult with file path and metadata
 *
 * @example
 * ```typescript
 * const result = await downloadFile('https://www.instagram.com/reel/ABC123/');
 * if (result.success && result.filePath) {
 *   console.log('Downloaded to:', result.filePath);
 *   console.log('File size:', result.fileSize, 'bytes');
 * }
 * ```
 */
export async function downloadFile(
  instagramUrl: string,
  outputDir: string = 'public/downloads/videos'
): Promise<YtDlpDownloadResult> {
  const TIMEOUT_MS = 120000; // 2 minutes for actual download

  try {
    // Check if yt-dlp is installed
    try {
      await execAsync('which yt-dlp', { timeout: 5000 });
    } catch {
      return {
        success: false,
        error: 'yt-dlp is not installed. Please install it: brew install yt-dlp',
      };
    }

    // Ensure output directory exists
    const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
    if (!fs.existsSync(absoluteOutputDir)) {
      fs.mkdirSync(absoluteOutputDir, { recursive: true });
    }

    // Generate unique filename based on video ID
    const timestamp = Date.now();
    const outputTemplate = path.join(absoluteOutputDir, `%(id)s_${timestamp}.%(ext)s`);

    // Execute yt-dlp to download file
    // -f "best[ext=mp4]/best" - prefer mp4 format
    // --no-playlist - don't download playlists
    // --print-json - print metadata as JSON after download
    const command = `yt-dlp -f "best[ext=mp4]/best" --no-playlist -o "${outputTemplate}" --print-json "${instagramUrl}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: TIMEOUT_MS,
      maxBuffer: 1024 * 1024 * 50, // 50MB buffer for JSON output
    });

    if (stderr && !stdout) {
      return {
        success: false,
        error: `yt-dlp error: ${stderr}`,
      };
    }

    // Parse JSON output to get metadata and filename
    const data = JSON.parse(stdout);

    // Construct the actual file path
    const videoId = data.id || 'unknown';
    const ext = data.ext || 'mp4';
    const filePath = path.join(absoluteOutputDir, `${videoId}_${timestamp}.${ext}`);

    // Verify file exists and get size
    if (!fs.existsSync(filePath)) {
      // Try alternative filename pattern
      const files = fs.readdirSync(absoluteOutputDir);
      const downloadedFile = files.find(f => f.includes(videoId));

      if (downloadedFile) {
        const actualPath = path.join(absoluteOutputDir, downloadedFile);
        const stats = fs.statSync(actualPath);

        return {
          success: true,
          filePath: actualPath,
          fileSize: stats.size,
          url: data.url || data.formats?.[0]?.url,
          title: data.title,
          uploader: data.uploader || data.uploader_id,
          thumbnail: data.thumbnail,
          duration: data.duration,
          description: data.description,
        };
      }

      return {
        success: false,
        error: 'Download completed but file not found',
      };
    }

    const stats = fs.statSync(filePath);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      url: data.url || data.formats?.[0]?.url,
      title: data.title,
      uploader: data.uploader || data.uploader_id,
      thumbnail: data.thumbnail,
      duration: data.duration,
      description: data.description,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        return {
          success: false,
          error: `yt-dlp download timeout after ${TIMEOUT_MS / 1000} seconds`,
        };
      }

      return {
        success: false,
        error: `yt-dlp download failed: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred during download',
    };
  }
}
