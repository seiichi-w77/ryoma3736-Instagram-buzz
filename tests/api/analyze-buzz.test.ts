/**
 * Unit tests for /api/analyze/buzz route
 * Tests buzz analysis functionality with mocked Claude API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/analyze/buzz/route';

// Mock the Gemini AI module
vi.mock('@/lib/ai/gemini', () => ({
  analyzeBuzzWithGemini: vi.fn(),
}));

import { analyzeBuzzWithGemini } from '@/lib/ai/gemini';

describe('POST /api/analyze/buzz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze buzz for valid content', async () => {
    const mockAnalysisResult = {
      buzzScore: 75,
      sentiment: 'positive',
      keyThemes: ['engagement', 'trend'],
      recommendations: ['Add hashtags', 'Post at peak hours'],
      analysis: 'Strong engagement potential',
    };

    vi.mocked(analyzeBuzzWithGemini).mockResolvedValue(mockAnalysisResult);

    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Check out my new product launch!',
        likes: 150,
        comments: 45,
        shares: 20,
        views: 1000,
        contentType: 'carousel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.buzzScore).toBe(75);
    expect(data.data.sentiment).toBe('positive');
    expect(data.data.keyThemes).toEqual(['engagement', 'trend']);
    expect(data.data.contentType).toBe('carousel');
    expect(data.data.engagementMetrics).toEqual({
      likes: 150,
      comments: 45,
      shares: 20,
      views: 1000,
    });
    expect(data.timestamp).toBeDefined();
  });

  it('should handle missing content field', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        likes: 100,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid request body');
  });

  it('should handle empty content', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        content: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should handle content exceeding max length', async () => {
    const tooLongContent = 'a'.repeat(10001);

    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        content: tooLongContent,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid JSON');
  });

  it('should handle Claude API errors', async () => {
    vi.mocked(analyzeBuzzWithGemini).mockRejectedValue(
      new Error('API rate limit exceeded')
    );

    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Test content',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
    expect(data.error).toContain('API rate limit exceeded');
  });

  it('should analyze with minimal metrics', async () => {
    const mockAnalysisResult = {
      buzzScore: 50,
      sentiment: 'neutral',
      keyThemes: ['general'],
      recommendations: ['Improve content quality'],
      analysis: 'Average engagement potential',
    };

    vi.mocked(analyzeBuzzWithGemini).mockResolvedValue(mockAnalysisResult);

    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Simple post',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.engagementMetrics).toEqual({
      likes: undefined,
      comments: undefined,
      shares: undefined,
      views: undefined,
    });
  });

  it('should include timestamp in response', async () => {
    const mockAnalysisResult = {
      buzzScore: 60,
      sentiment: 'positive',
      keyThemes: [],
      recommendations: [],
      analysis: 'Test',
    };

    vi.mocked(analyzeBuzzWithGemini).mockResolvedValue(mockAnalysisResult);

    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe('string');
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
  });
});

describe('GET /api/analyze/buzz', () => {
  it('should return API documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.endpoint).toBe('/api/analyze/buzz');
    expect(data.method).toBe('POST');
    expect(data.description).toBeDefined();
    expect(data.request).toBeDefined();
    expect(data.response).toBeDefined();
  });

  it('should include comprehensive request documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.request.content).toBeDefined();
    expect(data.request.likes).toBeDefined();
    expect(data.request.comments).toBeDefined();
    expect(data.request.shares).toBeDefined();
    expect(data.request.views).toBeDefined();
    expect(data.request.hashtags).toBeDefined();
    expect(data.request.contentType).toBeDefined();
  });

  it('should include response structure documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.response.status).toBeDefined();
    expect(data.response.data).toBeDefined();
    expect(data.response.data.buzzScore).toBeDefined();
    expect(data.response.data.sentiment).toBeDefined();
    expect(data.response.data.keyThemes).toBeDefined();
    expect(data.response.data.recommendations).toBeDefined();
  });
});
