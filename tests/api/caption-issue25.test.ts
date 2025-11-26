/**
 * Issue #25 - Caption Generation Feature Test
 * Validates new caption generation according to SUB-5 requirements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/generate/caption/route';

// Mock the caption generator
vi.mock('@/lib/ai/caption-generator', () => ({
  generateInstagramCaption: vi.fn(),
  validateInstagramCaption: vi.fn(),
  formatInstagramCaption: vi.fn(),
}));

import {
  generateInstagramCaption,
  validateInstagramCaption,
  formatInstagramCaption,
} from '@/lib/ai/caption-generator';

describe('Issue #25 - Caption Generation Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate caption from transcription and buzz analysis', async () => {
    // Mock response matching expected output
    const mockCaption = {
      caption: '🔥 AIで作業時間が半分に...\n\n保存して後で試してみてね！',
      hook: '🔥 AIで作業時間が半分に...',
      hashtags: ['#AI活用', '#時短術', '#ChatGPT'],
      callToAction: '保存して後で試してみてね！',
      characterCount: 35,
      hashtagCount: 3,
      estimatedEngagement: 'high' as const,
      style: 'conversational' as const,
    };

    vi.mocked(generateInstagramCaption).mockResolvedValue(mockCaption);
    vi.mocked(validateInstagramCaption).mockReturnValue({
      valid: true,
      errors: [],
      warnings: [],
    });
    vi.mocked(formatInstagramCaption).mockReturnValue(
      '🔥 AIで作業時間が半分に...\n\n保存して後で試してみてね！\n\n#AI活用 #時短術 #ChatGPT'
    );

    // Request matching SUB-5 input spec
    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: {
            text: 'AIツールを使うことで作業時間が半分になりました',
          },
          buzzAnalysis: {
            buzzScore: 85,
            sentiment: 'positive',
            keyThemes: ['AI', '生産性'],
          },
          tone: 'casual',
          imageType: 'reel',
          includeHashtags: true,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    // Verify response structure matches SUB-5 output spec
    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.caption).toBeDefined();
    expect(data.data.caption.caption).toContain('AI');
    expect(data.data.caption.hashtags).toBeInstanceOf(Array);
    expect(data.data.caption.callToAction).toBeDefined();
  });

  it('should respect 2200 character limit', async () => {
    const mockCaption = {
      caption: 'A'.repeat(2200),
      hook: 'Test hook',
      hashtags: ['#test'],
      callToAction: 'Test CTA',
      characterCount: 2200,
      hashtagCount: 1,
      estimatedEngagement: 'medium' as const,
      style: 'conversational' as const,
    };

    vi.mocked(generateInstagramCaption).mockResolvedValue(mockCaption);
    vi.mocked(validateInstagramCaption).mockReturnValue({
      valid: true,
      errors: [],
      warnings: [],
    });
    vi.mocked(formatInstagramCaption).mockReturnValue('A'.repeat(2200));

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: {
            text: 'Long video transcription...',
          },
          buzzAnalysis: {
            buzzScore: 80,
            sentiment: 'positive',
          },
          maxLength: 2200,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.caption.characterCount).toBeLessThanOrEqual(2200);
  });

  it('should generate hashtags when requested', async () => {
    const mockCaption = {
      caption: 'Test caption',
      hook: 'Test hook',
      hashtags: ['#productivity', '#AI', '#tips'],
      callToAction: 'Follow for more!',
      characterCount: 12,
      hashtagCount: 3,
      estimatedEngagement: 'medium' as const,
      style: 'educational' as const,
    };

    vi.mocked(generateInstagramCaption).mockResolvedValue(mockCaption);
    vi.mocked(validateInstagramCaption).mockReturnValue({
      valid: true,
      errors: [],
      warnings: [],
    });
    vi.mocked(formatInstagramCaption).mockReturnValue('Test caption');

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: {
            text: 'Test transcription',
          },
          buzzAnalysis: {
            buzzScore: 75,
            sentiment: 'positive',
          },
          includeHashtags: true,
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.caption.hashtags.length).toBeGreaterThan(0);
  });

  it('should handle different caption styles', async () => {
    const mockCaption = {
      caption: 'Inspirational caption text',
      hook: 'Inspiring hook',
      hashtags: ['#motivation'],
      callToAction: 'Share this!',
      characterCount: 25,
      hashtagCount: 1,
      estimatedEngagement: 'high' as const,
      style: 'inspirational' as const,
    };

    vi.mocked(generateInstagramCaption).mockResolvedValue(mockCaption);
    vi.mocked(validateInstagramCaption).mockReturnValue({
      valid: true,
      errors: [],
      warnings: [],
    });
    vi.mocked(formatInstagramCaption).mockReturnValue('Inspirational caption text');

    const request = new NextRequest(
      'http://localhost:3000/api/generate/caption',
      {
        method: 'POST',
        body: JSON.stringify({
          transcription: {
            text: 'Motivational content',
          },
          buzzAnalysis: {
            buzzScore: 90,
            sentiment: 'positive',
          },
          style: 'inspirational',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.caption.style).toBe('inspirational');
  });
});
