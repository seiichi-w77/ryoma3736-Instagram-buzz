/**
 * Unit tests for /api/generate/caption route
 * Tests caption generation functionality with mocked Claude API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/generate/caption/route';

// Mock the Claude AI module
vi.mock('@/lib/ai/claude', () => ({
  generateCaption: vi.fn(),
}));

import { generateCaption } from '@/lib/ai/claude';

describe('POST /api/generate/caption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate caption for valid topic', async () => {
    const mockCaption = {
      caption: 'Check out our latest product! Amazing quality and design.',
      hashtags: ['#newproduct', '#quality', '#design'],
      callToAction: 'Get yours today!',
      estimatedEngagement: 'high',
    };

    vi.mocked(generateCaption).mockResolvedValue(mockCaption);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'New product launch',
          imageType: 'carousel',
          tone: 'inspirational',
          includeHashtags: true,
          targetAudience: 'eco-conscious millennials',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.caption).toBe(mockCaption.caption);
    expect(data.data.hashtags).toHaveLength(3);
    expect(data.data.callToAction).toBe('Get yours today!');
    expect(data.data.metadata.hashtagCount).toBe(3);
    expect(data.data.metadata.characterCount).toBeGreaterThan(0);
    expect(data.data.metadata.wordCount).toBeGreaterThan(0);
    expect(data.data.metadata.imageType).toBe('carousel');
    expect(data.data.metadata.tone).toBe('inspirational');
  });

  it('should generate caption with default parameters', async () => {
    const mockCaption = {
      caption: 'Great content!',
      hashtags: [],
      callToAction: 'Follow us!',
      estimatedEngagement: 'medium',
    };

    vi.mocked(generateCaption).mockResolvedValue(mockCaption);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'General topic',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.metadata.imageType).toBe('portrait');
    expect(data.data.metadata.tone).toBe('casual');
  });

  it('should handle missing topic field', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          imageType: 'landscape',
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
      'http://localhost:3000/api/generate/caption',
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
      'http://localhost:3000/api/generate/caption',
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

  it('should handle negative maxLength parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Valid topic',
          maxLength: -100,
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
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: 'not valid json',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid JSON');
  });

  it('should handle Claude API errors', async () => {
    vi.mocked(generateCaption).mockRejectedValue(
      new Error('Service unavailable')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
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
    expect(data.error).toContain('Service unavailable');
  });

  it('should correctly count words in caption', async () => {
    const mockCaption = {
      caption: 'One two three four five six seven eight nine ten',
      hashtags: [],
      callToAction: 'Action',
      estimatedEngagement: 'low',
    };

    vi.mocked(generateCaption).mockResolvedValue(mockCaption);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Word count test',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.data.metadata.wordCount).toBe(10);
  });

  it('should handle caption with special characters', async () => {
    const mockCaption = {
      caption: 'Love 🔥 this! @brand #goals 💯',
      hashtags: ['#goals'],
      callToAction: 'Double tap!',
      estimatedEngagement: 'high',
    };

    vi.mocked(generateCaption).mockResolvedValue(mockCaption);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Emoji test',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.metadata.characterCount).toBeGreaterThan(0);
  });

  it('should include timestamp in response', async () => {
    const mockCaption = {
      caption: 'Test',
      hashtags: [],
      callToAction: 'Test',
      estimatedEngagement: 'low',
    };

    vi.mocked(generateCaption).mockResolvedValue(mockCaption);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Test',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe('string');
  });
});

describe('GET /api/generate/caption', () => {
  it('should return API documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.endpoint).toBe('/api/generate/caption');
    expect(data.method).toBe('POST');
    expect(data.description).toBeDefined();
    expect(data.request).toBeDefined();
    expect(data.response).toBeDefined();
  });

  it('should include all request parameters', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.request.topic).toBeDefined();
    expect(data.request.imageType).toBeDefined();
    expect(data.request.tone).toBeDefined();
    expect(data.request.includeHashtags).toBeDefined();
    expect(data.request.maxLength).toBeDefined();
    expect(data.request.targetAudience).toBeDefined();
  });

  it('should include examples and tips', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.examples).toBeDefined();
    expect(data.tips).toBeDefined();
    expect(Array.isArray(data.tips)).toBe(true);
    expect(data.tips.length).toBeGreaterThan(0);
  });
});
