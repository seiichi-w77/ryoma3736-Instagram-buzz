/**
 * Unit tests for /api/reels/download route
 * Tests Instagram Reels download functionality with mocked downloader
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '@/app/api/reels/download/route';

// Mock the Instagram downloader module
vi.mock('@/lib/instagram/downloader', () => ({
  createDownloader: vi.fn(),
}));

import { createDownloader } from '@/lib/instagram/downloader';

describe('POST /api/reels/download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should download reel with valid URL', async () => {
    const mockDownloader = {
      download: vi.fn().mockResolvedValue({
        success: true,
        mediaUrl: 'https://media.example.com/reel123.mp4',
        fileName: 'instagram_reel_123_1234567890.mp4',
        mediaType: 'video/mp4',
        size: 5242880,
      }),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.instagram.com/reel/ABC123XYZ/',
          quality: 'high',
          format: 'mp4',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.mediaUrl).toBe('https://media.example.com/reel123.mp4');
    expect(data.data.fileName).toContain('instagram_reel');
    expect(data.data.mediaType).toBe('video/mp4');
    expect(data.data.size).toBe(5242880);
    expect(data.timestamp).toBeDefined();
    expect(data.requestId).toBeDefined();
  });

  it('should handle download with default quality', async () => {
    const mockDownloader = {
      download: vi.fn().mockResolvedValue({
        success: true,
        mediaUrl: 'https://media.example.com/video.mp4',
        fileName: 'instagram_reel_456_1234567890.mp4',
        mediaType: 'video/mp4',
        size: 3145728,
      }),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.instagram.com/reel/ABC456XYZ/',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle download with webm format', async () => {
    const mockDownloader = {
      download: vi.fn().mockResolvedValue({
        success: true,
        mediaUrl: 'https://media.example.com/video.webm',
        fileName: 'instagram_reel_789_1234567890.webm',
        mediaType: 'video/webm',
        size: 2097152,
      }),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.instagram.com/reel/ABC789XYZ/',
          format: 'webm',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle missing URL field', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          quality: 'high',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('URL field is required');
  });

  it('should handle empty URL', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: '',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should reject invalid quality parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.instagram.com/reel/ABC123XYZ/',
          quality: 'ultra',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Quality must be one of');
  });

  it('should reject invalid format parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.instagram.com/reel/ABC123XYZ/',
          format: 'avi',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Format must be one of');
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: 'not json',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid JSON');
  });

  it('should handle downloader errors', async () => {
    const mockDownloader = {
      download: vi.fn().mockResolvedValue({
        success: false,
        error: 'Invalid Instagram URL',
      }),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://invalid-url.com/fake',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid Instagram URL');
  });

  it('should handle thrown exceptions', async () => {
    const mockDownloader = {
      download: vi.fn().mockRejectedValue(new Error('Network timeout')),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.instagram.com/reel/ABC123XYZ/',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Network timeout');
  });

  it('should generate unique request IDs', async () => {
    const mockDownloader = {
      download: vi.fn().mockResolvedValue({
        success: true,
        mediaUrl: 'https://media.example.com/video.mp4',
        fileName: 'video.mp4',
        mediaType: 'video/mp4',
        size: 1024,
      }),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const requestIds = new Set<string>();

    for (let i = 0; i < 3; i++) {
      const request = new NextRequest(
        'http://localhost:3000/api/reels/download',
        {
          method: 'POST',
          body: JSON.stringify({
            url: 'https://www.instagram.com/reel/ABC123XYZ/',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      requestIds.add(data.requestId);
    }

    expect(requestIds.size).toBe(3);
  });

  it('should include proper request body validation', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 123, // Should be string
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should handle quality variations', async () => {
    const mockDownloader = {
      download: vi.fn().mockResolvedValue({
        success: true,
        mediaUrl: 'https://media.example.com/video.mp4',
        fileName: 'video.mp4',
        mediaType: 'video/mp4',
        size: 1024,
      }),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const qualities = ['high', 'medium', 'low'];

    for (const quality of qualities) {
      const request = new NextRequest(
        'http://localhost:3000/api/reels/download',
        {
          method: 'POST',
          body: JSON.stringify({
            url: 'https://www.instagram.com/reel/ABC123XYZ/',
            quality,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    }
  });

  it('should create downloader with correct config', async () => {
    const mockDownloader = {
      download: vi.fn().mockResolvedValue({
        success: true,
        mediaUrl: 'https://media.example.com/video.mp4',
        fileName: 'video.mp4',
        mediaType: 'video/mp4',
        size: 1024,
      }),
    } as any;

    vi.mocked(createDownloader).mockReturnValue(mockDownloader);

    const request = new NextRequest(
      'http://localhost:3000/api/reels/download',
      {
        method: 'POST',
        body: JSON.stringify({
          url: 'https://www.instagram.com/reel/ABC123XYZ/',
        }),
      }
    );

    await POST(request);

    expect(createDownloader).toHaveBeenCalledWith({
      timeout: 30000,
      maxRetries: 3,
    });
  });
});

describe('OPTIONS /api/reels/download', () => {
  it('should return CORS headers', async () => {
    const response = OPTIONS();

    expect(response.status).toBe(200);
  });

  it('should include Access-Control-Allow-Origin header', async () => {
    const response = OPTIONS();
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');

    expect(corsHeader).toBe('*');
  });

  it('should include Access-Control-Allow-Methods header', async () => {
    const response = OPTIONS();
    const methodsHeader = response.headers.get('Access-Control-Allow-Methods');

    expect(methodsHeader).toBe('POST, OPTIONS');
  });

  it('should include Access-Control-Allow-Headers header', async () => {
    const response = OPTIONS();
    const headersHeader = response.headers.get('Access-Control-Allow-Headers');

    expect(headersHeader).toBe('Content-Type');
  });
});
