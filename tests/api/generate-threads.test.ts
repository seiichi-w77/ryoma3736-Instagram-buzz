/**
 * Unit tests for /api/generate/threads route
 * Tests Threads content generation functionality with mocked Claude API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/generate/threads/route';

// Mock the Claude AI module
vi.mock('@/lib/ai/claude', () => ({
  generateThreads: vi.fn(),
}));

import { generateThreads } from '@/lib/ai/claude';

describe('POST /api/generate/threads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate threads for valid topic', async () => {
    const mockThreads = {
      thread: [
        'Starting a sustainability journey...',
        'Here is what I learned...',
        'Simple changes matter...',
        'Join the movement!',
        'Together we can make a difference!',
      ],
      hashtags: ['#sustainability', '#ecolifestyle', '#eco-friendly'],
      callToAction: 'Share your sustainability tips!',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Best practices for sustainable living',
          tone: 'inspirational',
          style: 'storytelling',
          includeHashtags: true,
          includeCallToAction: true,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(Array.isArray(data.data.thread)).toBe(true);
    expect(data.data.thread.length).toBe(5);
    expect(data.data.hashtags).toHaveLength(3);
    expect(data.data.callToAction).toBeDefined();
    expect(data.data.characterCount).toBeGreaterThan(0);
    expect(data.data.totalParts).toBe(5);
    expect(data.data.estimatedReadTime).toBeDefined();
  });

  it('should use default parameters when not provided', async () => {
    const mockThreads = {
      thread: ['Part 1', 'Part 2'],
      hashtags: [],
      callToAction: 'Learn more',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Basic topic',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(Array.isArray(data.data.thread)).toBe(true);
  });

  it('should handle missing topic field', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          tone: 'casual',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid request body');
  });

  it('should handle empty topic', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: '',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should handle topic exceeding max length', async () => {
    const tooLongTopic = 'a'.repeat(501);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: tooLongTopic,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: 'not json',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid JSON');
  });

  it('should handle Claude API errors', async () => {
    vi.mocked(generateThreads).mockRejectedValue(
      new Error('Generation failed')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test topic',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Generation failed');
  });

  it('should calculate character count correctly', async () => {
    const mockThreads = {
      thread: ['Hello world', 'Test thread content here'],
      hashtags: [],
      callToAction: 'Check it out',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Count test',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    // "Hello world" (11) + "Test thread content here" (24) = 35
    expect(data.data.characterCount).toBe(35);
  });

  it('should calculate total parts correctly', async () => {
    const mockThreads = {
      thread: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
      hashtags: ['#tag'],
      callToAction: 'Action',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Multi-part thread',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.data.totalParts).toBe(6);
  });

  it('should estimate read time correctly', async () => {
    // Create a thread with roughly 300 words (assumed 200 words per minute = 90 seconds = 1.5 minutes)
    const words = Array(60).fill('word').join(' '); // 60 words = 300 chars roughly
    const mockThreads = {
      thread: [words, words, words, words, words],
      hashtags: [],
      callToAction: 'Read more',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Reading time test',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.data.estimatedReadTime).toContain('minutes');
  });

  it('should handle various tone options', async () => {
    const mockThreads = {
      thread: ['Test'],
      hashtags: [],
      callToAction: 'Test',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const tones = ['professional', 'casual', 'funny', 'inspirational'];

    for (const tone of tones) {
      const request = new NextRequest(
        'http://localhost:3000/api/generate/threads',
        {
          method: 'POST',
          body: JSON.stringify({
            topic: 'Tone test',
            tone,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    }
  });

  it('should handle various style options', async () => {
    const mockThreads = {
      thread: ['Test'],
      hashtags: [],
      callToAction: 'Test',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const styles = ['technical', 'storytelling', 'quick-tips'];

    for (const style of styles) {
      const request = new NextRequest(
        'http://localhost:3000/api/generate/threads',
        {
          method: 'POST',
          body: JSON.stringify({
            topic: 'Style test',
            style,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
    }
  });

  it('should include timestamp in response', async () => {
    const mockThreads = {
      thread: ['Test'],
      hashtags: [],
      callToAction: 'Test',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Timestamp test',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe('string');
  });

  it('should handle hashtag and CTA options', async () => {
    const mockThreads = {
      thread: ['Test thread'],
      hashtags: [],
      callToAction: 'Check it',
    };

    vi.mocked(generateThreads).mockResolvedValue(mockThreads);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/threads',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Options test',
          includeHashtags: false,
          includeCallToAction: false,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
  });
});

describe('GET /api/generate/threads', () => {
  it('should return API documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.endpoint).toBe('/api/generate/threads');
    expect(data.method).toBe('POST');
    expect(data.description).toBeDefined();
    expect(data.request).toBeDefined();
    expect(data.response).toBeDefined();
  });

  it('should include all request parameters', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.request.topic).toBeDefined();
    expect(data.request.tone).toBeDefined();
    expect(data.request.style).toBeDefined();
    expect(data.request.includeHashtags).toBeDefined();
    expect(data.request.includeCallToAction).toBeDefined();
  });

  it('should include response structure', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.response.status).toBeDefined();
    expect(data.response.data).toBeDefined();
    expect(data.response.data.thread).toBeDefined();
    expect(data.response.data.hashtags).toBeDefined();
    expect(data.response.data.callToAction).toBeDefined();
    expect(data.response.data.totalParts).toBeDefined();
    expect(data.response.data.estimatedReadTime).toBeDefined();
  });

  it('should include examples', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.examples).toBeDefined();
    expect(data.examples.request).toBeDefined();
    expect(data.examples.response).toBeDefined();
  });
});
