/**
 * Unit tests for /api/generate/script route
 * Tests Reel script generation functionality with mocked Claude API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/generate/script/route';

// Mock the Claude AI module
vi.mock('@/lib/ai/claude', () => ({
  generateReelScript: vi.fn(),
}));

import { generateReelScript } from '@/lib/ai/claude';

describe('POST /api/generate/script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate script for valid topic', async () => {
    const mockScript = {
      script: 'Welcome to coffee making 101. First, gather your ingredients...',
      pacing: [
        {
          timeRange: '0-5s',
          description: 'Close-up of coffee beans',
          voiceover: 'Welcome to coffee making 101',
        },
        {
          timeRange: '5-10s',
          description: 'Pouring water',
          voiceover: 'Add hot water carefully',
        },
      ],
      musicSuggestion: 'Upbeat and energetic',
      transitionTips: ['Fade between scenes', 'Use quick cuts'],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'How to make the perfect iced coffee',
          duration: 30,
          style: 'tutorial',
          platform: 'instagram',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.script).toBeDefined();
    expect(Array.isArray(data.data.pacing)).toBe(true);
    expect(data.data.musicSuggestion).toBe('Upbeat and energetic');
    expect(data.data.metadata.duration).toBe(30);
    expect(data.data.metadata.style).toBe('tutorial');
    expect(data.data.metadata.platform).toBe('instagram');
    expect(data.data.metadata.estimatedWordCount).toBeGreaterThan(0);
    expect(data.data.metadata.estimatedSpeakingPace).toContain('words per minute');
  });

  it('should use default parameters when not provided', async () => {
    const mockScript = {
      script: 'Test script',
      pacing: [],
      musicSuggestion: 'Relaxing',
      transitionTips: [],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
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
    expect(data.data.metadata.duration).toBe(30);
    expect(data.data.metadata.style).toBe('entertaining');
    expect(data.data.metadata.platform).toBe('instagram');
  });

  it('should handle missing topic field', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          duration: 45,
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
      'http://localhost:3000/api/generate/script',
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
      'http://localhost:3000/api/generate/script',
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

  it('should reject duration exceeding 300 seconds', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Valid topic',
          duration: 301,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
  });

  it('should reject negative duration', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Valid topic',
          duration: -5,
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
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: 'invalid json',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Invalid JSON');
  });

  it('should handle Claude API errors', async () => {
    vi.mocked(generateReelScript).mockRejectedValue(
      new Error('Claude API error')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
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
    expect(data.error).toContain('Claude API error');
  });

  it('should calculate speaking pace correctly', async () => {
    const mockScript = {
      script: 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen',
      pacing: [],
      musicSuggestion: 'Test',
      transitionTips: [],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
      {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Speed test',
          duration: 60,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    // 15 words in 60 seconds = 15 words per minute
    expect(data.data.metadata.estimatedSpeakingPace).toBe('15 words per minute');
  });

  it('should handle script with various styles', async () => {
    const mockScript = {
      script: 'Educational content',
      pacing: [],
      musicSuggestion: 'Educational',
      transitionTips: [],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const styles = ['educational', 'entertaining', 'tutorial', 'motivational'];

    for (const style of styles) {
      const request = new NextRequest(
        'http://localhost:3000/api/generate/script',
        {
          method: 'POST',
          body: JSON.stringify({
            topic: 'Test',
            style,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.style).toBe(style);
    }
  });

  it('should include timestamp in response', async () => {
    const mockScript = {
      script: 'Test',
      pacing: [],
      musicSuggestion: 'Test',
      transitionTips: [],
    };

    vi.mocked(generateReelScript).mockResolvedValue(mockScript);

    const request = new NextRequest(
      'http://localhost:3000/api/generate/script',
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

describe('GET /api/generate/script', () => {
  it('should return API documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.endpoint).toBe('/api/generate/script');
    expect(data.method).toBe('POST');
    expect(data.description).toBeDefined();
    expect(data.request).toBeDefined();
    expect(data.response).toBeDefined();
  });

  it('should include all request parameters', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.request.topic).toBeDefined();
    expect(data.request.duration).toBeDefined();
    expect(data.request.style).toBeDefined();
    expect(data.request.platform).toBeDefined();
  });

  it('should include examples and response structure', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.examples).toBeDefined();
    expect(data.examples.request).toBeDefined();
    expect(data.examples.response).toBeDefined();
    expect(data.examples.response.pacing).toBeDefined();
  });
});
