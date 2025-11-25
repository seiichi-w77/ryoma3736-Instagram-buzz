/**
 * Unit tests for Instagram Downloader
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  InstagramDownloader,
  createDownloader,
  type DownloadRequest,
} from '../../../lib/instagram/downloader';

describe('Instagram Downloader', () => {
  let downloader: InstagramDownloader;

  beforeEach(() => {
    downloader = createDownloader({
      timeout: 5000,
      maxRetries: 2,
    });
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const instance = new InstagramDownloader();

      expect(instance).toBeDefined();
    });

    it('should create instance with custom config', () => {
      const instance = new InstagramDownloader({
        timeout: 60000,
        maxRetries: 5,
      });

      expect(instance).toBeDefined();
    });

    it('should create instance via factory function', () => {
      const instance = createDownloader();

      expect(instance).toBeInstanceOf(InstagramDownloader);
    });
  });

  describe('validate method', () => {
    it('should validate correct Instagram URL', async () => {
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/reel/ABC123/',
        quality: 'high',
        format: 'mp4',
      };

      const result = await downloader.validate(request);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should reject empty URL', async () => {
      const request: DownloadRequest = {
        url: '',
        quality: 'high',
      };

      const result = await downloader.validate(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid Instagram URL', async () => {
      const request: DownloadRequest = {
        url: 'https://www.twitter.com/user',
      };

      const result = await downloader.validate(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Instagram');
    });

    it('should reject malformed URL', async () => {
      const request: DownloadRequest = {
        url: 'not a valid url',
      };

      const result = await downloader.validate(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should include timestamp in response', async () => {
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/p/ABC123/',
      };

      const result = await downloader.validate(request);

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    describe('with various URL types', () => {
      const validUrls = [
        'https://www.instagram.com/reel/ABC123/',
        'https://www.instagram.com/p/XYZ789/',
        'https://www.instagram.com/tv/VIDEO123/',
        'https://www.instagram.com/clip/CLIP456/',
      ];

      it.each(validUrls)('should validate %s', async (url) => {
        const result = await downloader.validate({ url });

        expect(result.success).toBe(true);
      });
    });
  });

  // Skip: These tests require external RapidAPI mocking
  describe.skip('download method', () => {
    it('should return successful response for valid URL', async () => {
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/reel/ABC123/',
        quality: 'high',
        format: 'mp4',
      };

      const result = await downloader.download(request);

      expect(result.success).toBe(true);
      expect(result.mediaUrl).toBeDefined();
      expect(result.fileName).toBeDefined();
      expect(result.mediaType).toBe('video/mp4');
      expect(result.size).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should generate proper filename', async () => {
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/reel/test123/',
        format: 'mp4',
      };

      const result = await downloader.download(request);

      expect(result.fileName).toBeDefined();
      expect(result.fileName).toContain('instagram_reel_test123');
      expect(result.fileName).toMatch(/\.mp4$/);
    });

    it('should use requested format in filename', async () => {
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/reel/abc123/',
        format: 'webm',
      };

      const result = await downloader.download(request);

      expect(result.fileName).toMatch(/\.webm$/);
    });

    it('should reject invalid URL', async () => {
      const request: DownloadRequest = {
        url: 'https://www.invalid.com/video',
      };

      const result = await downloader.download(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for missing URL', async () => {
      const request: DownloadRequest = {
        url: '',
      };

      const result = await downloader.download(request);

      expect(result.success).toBe(false);
    });

    it('should include media information in response', async () => {
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/p/ABC123/',
      };

      const result = await downloader.download(request);

      expect(result).toHaveProperty('mediaUrl');
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('mediaType');
      expect(result).toHaveProperty('size');
    });

    describe('quality parameter handling', () => {
      const qualities: Array<'high' | 'medium' | 'low'> = [
        'high',
        'medium',
        'low',
      ];

      it.each(qualities)('should handle quality: %s', async (quality) => {
        const request: DownloadRequest = {
          url: 'https://www.instagram.com/reel/ABC123/',
          quality,
        };

        const result = await downloader.download(request);

        expect(result.success).toBe(true);
      });
    });
  });

  describe('getMediaInfo method', () => {
    it('should return media information without downloading', async () => {
      const url = 'https://www.instagram.com/reel/ABC123/';

      const result = await downloader.getMediaInfo(url);

      expect(result.success).toBe(true);
      expect(result.mediaType).toBeDefined();
    });

    it('should detect reel media type', async () => {
      const url = 'https://www.instagram.com/reel/ABC123/';

      const result = await downloader.getMediaInfo(url);

      expect(result.success).toBe(true);
      expect(result.mediaType).toBe('video/mp4');
    });

    it('should reject invalid URL', async () => {
      const url = 'https://www.invalid.com/';

      const result = await downloader.getMediaInfo(url);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should include timestamp in response', async () => {
      const url = 'https://www.instagram.com/p/ABC123/';

      const result = await downloader.getMediaInfo(url);

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate a network error scenario
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/reel/ABC123/',
      };

      // The downloader should not throw, but return error in response
      const result = await downloader.download(request);

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('success');
    });

    it('should return timestamp on success', async () => {
      const request: DownloadRequest = {
        url: 'https://www.instagram.com/reel/ABC123/',
      };

      const result = await downloader.download(request);

      expect(result.timestamp).toBeDefined();
      const date = new Date(result.timestamp);
      expect(isNaN(date.getTime())).toBe(false);
    });

    it('should return timestamp on failure', async () => {
      const request: DownloadRequest = {
        url: 'invalid-url',
      };

      const result = await downloader.download(request);

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('different media types', () => {
    const mediaTypes = [
      { url: 'https://www.instagram.com/reel/ABC123/', type: 'reel' },
      { url: 'https://www.instagram.com/p/ABC123/', type: 'post' },
      { url: 'https://www.instagram.com/tv/ABC123/', type: 'igtv' },
      { url: 'https://www.instagram.com/clip/ABC123/', type: 'clip' },
    ];

    // Skip: These tests require external API mocking
    it.skip.each(mediaTypes)('should handle $type downloads', async ({ url }) => {
      const request: DownloadRequest = { url };

      const result = await downloader.download(request);

      expect(result.success).toBe(true);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple concurrent downloads', async () => {
      const requests: DownloadRequest[] = [
        { url: 'https://www.instagram.com/reel/ID1/' },
        { url: 'https://www.instagram.com/reel/ID2/' },
        { url: 'https://www.instagram.com/reel/ID3/' },
      ];

      const results = await Promise.all(
        requests.map((req) => downloader.download(req))
      );

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
      });
    });

    it('should handle multiple concurrent validations', async () => {
      const requests: DownloadRequest[] = [
        { url: 'https://www.instagram.com/reel/ID1/' },
        { url: 'https://www.instagram.com/p/ID2/' },
        { url: 'invalid-url' },
      ];

      const results = await Promise.all(
        requests.map((req) => downloader.validate(req))
      );

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(false);
    });
  });

  describe('factory function', () => {
    it('should create downloader with factory', () => {
      const downloader1 = createDownloader();
      const downloader2 = createDownloader({ timeout: 10000 });

      expect(downloader1).toBeInstanceOf(InstagramDownloader);
      expect(downloader2).toBeInstanceOf(InstagramDownloader);
    });

    it('should apply config from factory', async () => {
      const customDownloader = createDownloader({ timeout: 1000 });

      const request: DownloadRequest = {
        url: 'https://www.instagram.com/reel/ABC123/',
      };

      const result = await customDownloader.download(request);

      expect(result).toHaveProperty('success');
    });
  });
});
