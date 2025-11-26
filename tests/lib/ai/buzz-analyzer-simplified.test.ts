/**
 * Unit tests for simplified buzz analyzer functions (Issue #22)
 * Tests the simplified format conversion and analysis
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  toSimplifiedFormat,
  type BuzzAnalysis,
  type SimplifiedBuzzAnalysis,
} from '@/lib/ai/buzz-analyzer';

// Mock the Gemini API
vi.mock('@/lib/ai/gemini', () => ({
  callGemini: vi.fn().mockResolvedValue('{}'),
}));

// Mock the entire buzz-analyzer module to avoid real API calls
vi.mock('@/lib/ai/buzz-analyzer', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai/buzz-analyzer')>('@/lib/ai/buzz-analyzer');
  return {
    ...actual,
    analyzeBuzzPotential: vi.fn(),
  };
});

import { analyzeBuzzPotential, analyzeTranscriptSimplified } from '@/lib/ai/buzz-analyzer';

describe('toSimplifiedFormat', () => {
  it('should convert full analysis to simplified format', () => {
    const fullAnalysis: BuzzAnalysis = {
      buzzScore: 85,
      sentiment: 'positive',
      viralPotential: 'high',
      keyHooks: [
        { text: 'Hook 1', hookType: 'emotional', strength: 9 },
        { text: 'Hook 2', hookType: 'curiosity', strength: 8 },
        { text: 'Hook 3', hookType: 'shocking', strength: 7 },
      ],
      trendingTopics: [
        { topic: 'AI活用', relevance: 90, trendStrength: 'trending' },
        { topic: '時短術', relevance: 85, trendStrength: 'viral' },
      ],
      contentStructure: {
        openingStrength: 9,
        retentionFactors: ['ストーリーテリング'],
        callToActionPresent: false,
        pacing: 'good',
      },
      targetAudience: {
        primaryDemographic: 'ビジネスパーソン',
        ageRange: '25-40',
        interests: ['AI'],
      },
      recommendations: [
        {
          priority: 'high',
          category: 'content',
          suggestion: '冒頭にもっと強いフックを',
          expectedImpact: 'より高い初回視聴率',
        },
        {
          priority: 'medium',
          category: 'engagement',
          suggestion: 'CTAを明確に',
          expectedImpact: 'コメント率向上',
        },
        {
          priority: 'low',
          category: 'timing',
          suggestion: 'ピーク時間に投稿',
          expectedImpact: '視聴数増加',
        },
      ],
      predictedMetrics: {
        estimatedViews: '50K-100K',
        estimatedEngagementRate: '8-12%',
        viralityProbability: 85,
      },
    };

    const simplified = toSimplifiedFormat(fullAnalysis);

    expect(simplified.buzzScore).toBe(85);
    expect(simplified.sentiment).toBe('positive');
    expect(simplified.factors).toEqual([
      '感情的なフック',
      '好奇心を刺激',
      '驚きの要素',
    ]);
    expect(simplified.keyThemes).toEqual(['AI活用', '時短術']);
    expect(simplified.recommendations).toEqual([
      '冒頭にもっと強いフックを',
      'CTAを明確に',
    ]);
  });

  it('should handle empty arrays in full analysis', () => {
    const fullAnalysis: BuzzAnalysis = {
      buzzScore: 50,
      sentiment: 'neutral',
      viralPotential: 'medium',
      keyHooks: [],
      trendingTopics: [],
      contentStructure: {
        openingStrength: 5,
        retentionFactors: [],
        callToActionPresent: false,
        pacing: 'good',
      },
      targetAudience: {
        primaryDemographic: 'General',
        ageRange: '18-35',
        interests: [],
      },
      recommendations: [],
      predictedMetrics: {
        estimatedViews: '1K-5K',
        estimatedEngagementRate: '2-4%',
        viralityProbability: 30,
      },
    };

    const simplified = toSimplifiedFormat(fullAnalysis);

    expect(simplified.buzzScore).toBe(50);
    expect(simplified.factors).toEqual([]);
    expect(simplified.keyThemes).toEqual([]);
    expect(simplified.recommendations).toEqual([]);
  });

  it('should limit factors to top 5 hooks', () => {
    const fullAnalysis: BuzzAnalysis = {
      buzzScore: 90,
      sentiment: 'positive',
      viralPotential: 'very-high',
      keyHooks: [
        { text: 'Hook 1', hookType: 'emotional', strength: 10 },
        { text: 'Hook 2', hookType: 'curiosity', strength: 9 },
        { text: 'Hook 3', hookType: 'shocking', strength: 9 },
        { text: 'Hook 4', hookType: 'relatable', strength: 8 },
        { text: 'Hook 5', hookType: 'educational', strength: 8 },
        { text: 'Hook 6', hookType: 'humorous', strength: 7 },
        { text: 'Hook 7', hookType: 'emotional', strength: 6 },
      ],
      trendingTopics: [],
      contentStructure: {
        openingStrength: 10,
        retentionFactors: [],
        callToActionPresent: true,
        pacing: 'good',
      },
      targetAudience: {
        primaryDemographic: 'General',
        ageRange: '18-35',
        interests: [],
      },
      recommendations: [],
      predictedMetrics: {
        estimatedViews: '100K+',
        estimatedEngagementRate: '15%+',
        viralityProbability: 95,
      },
    };

    const simplified = toSimplifiedFormat(fullAnalysis);

    expect(simplified.factors).toHaveLength(5);
    expect(simplified.factors).toEqual([
      '感情的なフック',
      '好奇心を刺激',
      '驚きの要素',
      '共感できる内容',
      '教育的価値',
    ]);
  });
});

// Integration tests for analyzeTranscriptSimplified are covered in the API route tests
// These tests would require real Gemini API calls or more complex mocking
