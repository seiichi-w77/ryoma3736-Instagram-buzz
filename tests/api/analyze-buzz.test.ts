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

// Mock the buzz analyzer module
vi.mock('@/lib/ai/buzz-analyzer', () => ({
  analyzeBuzzPotential: vi.fn(),
  quickBuzzScore: vi.fn(),
  extractKeyHooks: vi.fn(),
  identifyTrendingTopics: vi.fn(),
  analyzeTranscriptSimplified: vi.fn(),
  toSimplifiedFormat: vi.fn(),
}));

import { analyzeBuzzWithGemini } from '@/lib/ai/gemini';
import { analyzeBuzzPotential, analyzeTranscriptSimplified } from '@/lib/ai/buzz-analyzer';

describe('POST /api/analyze/buzz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze transcript text as per Issue #22 requirements', async () => {
    const mockBuzzResult = {
      buzzScore: 85,
      sentiment: 'positive' as const,
      viralPotential: 'high' as const,
      keyHooks: [
        { text: '感情的なフック', hookType: 'emotional' as const, strength: 9 },
        { text: '具体的な数字', hookType: 'shocking' as const, strength: 8 },
      ],
      trendingTopics: [
        { topic: 'AI活用', relevance: 90, trendStrength: 'trending' as const },
        { topic: '時短術', relevance: 85, trendStrength: 'viral' as const },
      ],
      contentStructure: {
        openingStrength: 9,
        retentionFactors: ['ストーリーテリング', '具体例'],
        callToActionPresent: false,
        pacing: 'good' as const,
      },
      targetAudience: {
        primaryDemographic: 'ビジネスパーソン',
        ageRange: '25-40',
        interests: ['AI', '生産性向上'],
      },
      recommendations: [
        {
          priority: 'high' as const,
          category: 'content' as const,
          suggestion: '冒頭にもっと強いフックを',
          expectedImpact: 'より高い初回視聴率',
        },
        {
          priority: 'medium' as const,
          category: 'engagement' as const,
          suggestion: 'CTAを明確に',
          expectedImpact: 'コメント率向上',
        },
      ],
      predictedMetrics: {
        estimatedViews: '50K-100K',
        estimatedEngagementRate: '8-12%',
        viralityProbability: 85,
      },
    };

    vi.mocked(analyzeBuzzPotential).mockResolvedValue(mockBuzzResult);

    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        transcription: 'これはテスト用の文字起こしテキストです。AIを活用して時短術を紹介しています。',
        contentType: 'reel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.buzzScore).toBe(85);
    expect(data.data.sentiment).toBe('positive');
    expect(data.data.keyHooks).toBeDefined();
    expect(data.data.trendingTopics).toBeDefined();
    expect(data.data.recommendations).toBeDefined();
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

  it('should return simplified format when analysisMode is simplified', async () => {
    const mockSimplifiedResult = {
      buzzScore: 85,
      factors: ['感情的なフック', '具体的な数字', 'ストーリーテリング'],
      sentiment: 'positive' as const,
      keyThemes: ['AI活用', '時短術'],
      recommendations: ['冒頭にもっと強いフックを', 'CTAを明確に'],
    };

    vi.mocked(analyzeTranscriptSimplified).mockResolvedValue(mockSimplifiedResult);

    const request = new NextRequest('http://localhost:3000/api/analyze/buzz', {
      method: 'POST',
      body: JSON.stringify({
        transcription: 'AIを活用した時短術を紹介します',
        contentType: 'reel',
        analysisMode: 'simplified',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.buzzScore).toBe(85);
    expect(data.data.factors).toEqual(['感情的なフック', '具体的な数字', 'ストーリーテリング']);
    expect(data.data.sentiment).toBe('positive');
    expect(data.data.keyThemes).toEqual(['AI活用', '時短術']);
    expect(data.data.recommendations).toEqual(['冒頭にもっと強いフックを', 'CTAを明確に']);
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

    expect(data.response).toBeDefined();
    expect(data.response.full).toBeDefined();
    expect(data.response.full.buzzScore).toBeDefined();
    expect(data.response.full.sentiment).toBeDefined();
    expect(data.response.full.keyHooks).toBeDefined();
    expect(data.response.full.recommendations).toBeDefined();
  });
});
