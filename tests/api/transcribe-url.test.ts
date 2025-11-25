/**
 * @fileoverview Tests for /api/reels/transcribe-url endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the modules
vi.mock('@/lib/transcribe/whisper', () => ({
  WhisperClient: vi.fn().mockImplementation(() => ({
    transcribeVideo: vi.fn().mockResolvedValue({
      text: 'Mock transcription text',
      language: 'en',
      duration: 30,
      segments: [],
    }),
    transcribeAudio: vi.fn().mockResolvedValue({
      text: 'Mock audio transcription',
      language: 'en',
      duration: 30,
      segments: [],
    }),
  })),
}));

vi.mock('@/lib/transcribe/formatter', () => ({
  formatTranscription: vi.fn().mockReturnValue('Formatted transcription'),
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
}));

// Mock fetch for video download
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('/api/reels/transcribe-url', () => {
  let POST: (req: NextRequest) => Promise<Response>;
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = 'test-key';

    // Mock successful video download
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'video/mp4' }),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
    });

    const module = await import(
      '@/app/api/reels/transcribe-url/route'
    );
    POST = module.POST;
    GET = module.GET;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  describe('POST', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/reels/transcribe-url', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid JSON');
    });

    it('should return 400 when URL is missing', async () => {
      const request = new NextRequest('http://localhost/api/reels/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('URL is required');
    });

    it('should return 500 when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;

      const request = new NextRequest('http://localhost/api/reels/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/video.mp4' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('OpenAI API key');
    });

    it('should successfully transcribe a video from URL', async () => {
      const request = new NextRequest('http://localhost/api/reels/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/video.mp4',
          language: 'en',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.text).toBe('Mock transcription text');
      expect(data.data.language).toBe('en');
    });

    it('should handle auto language detection', async () => {
      const request = new NextRequest('http://localhost/api/reels/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/video.mp4',
          language: 'auto',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 when video download fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const request = new NextRequest('http://localhost/api/reels/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/notfound.mp4' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to download video');
    });
  });

  describe('GET', () => {
    it('should return API documentation', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/reels/transcribe-url');
      expect(data.method).toBe('POST');
      expect(data.request).toBeDefined();
      expect(data.response).toBeDefined();
    });
  });
});
