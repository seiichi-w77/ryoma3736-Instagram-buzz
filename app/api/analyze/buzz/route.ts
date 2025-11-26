/**
 * Buzz Analysis API
 * Analyzes Instagram content for viral potential and engagement patterns
 * POST /api/analyze/buzz
 *
 * F3-1: バズ分析機能 (P0)
 * - AI-powered buzz analysis using Gemini API
 * - Analyzes transcription text for viral potential
 * - Generates buzz score (0-100)
 * - Identifies key hooks and trending topics
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeBuzzPotential,
  quickBuzzScore,
  extractKeyHooks,
  identifyTrendingTopics,
  analyzeTranscriptSimplified,
} from '@/lib/ai/buzz-analyzer';
import { analyzeBuzzWithGemini } from '@/lib/ai/gemini';

/**
 * Request body interface
 */
interface BuzzAnalysisRequest {
  content: string;
  transcription?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  hashtags?: string[];
  contentType?: 'photo' | 'carousel' | 'reel' | 'story';
  analysisMode?: 'full' | 'quick' | 'hooks-only' | 'trends-only' | 'simplified';
  accountInfo?: {
    followerCount?: number;
    avgEngagementRate?: number;
    niche?: string;
  };
}

/**
 * Response interface
 */
interface BuzzAnalysisResponse {
  status: 'success' | 'error';
  data?: unknown;
  error?: string;
  timestamp: string;
  analysisMode?: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): body is BuzzAnalysisRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;

  // Either content or transcription must be provided
  const hasContent = typeof req.content === 'string' && req.content.length > 0;
  const hasTranscription = typeof req.transcription === 'string' && req.transcription.length > 0;

  if (!hasContent && !hasTranscription) {
    return false;
  }

  // Check length constraints
  const textToCheck = (req.transcription as string) || (req.content as string);
  return textToCheck.length <= 10000;
}

/**
 * POST handler for buzz analysis
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString(),
        } as BuzzAnalysisResponse,
        { status: 400 }
      );
    }

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          status: 'error',
          error:
            'Invalid request body. Required: content or transcription (string, 1-10000 chars)',
          timestamp: new Date().toISOString(),
        } as BuzzAnalysisResponse,
        { status: 400 }
      );
    }

    const req = body as BuzzAnalysisRequest;
    const analysisMode = req.analysisMode || 'full';
    const contentToAnalyze = req.transcription || req.content;

    // Handle different analysis modes
    let analysisResult: unknown;

    switch (analysisMode) {
      case 'quick':
        // Quick buzz score only
        const quickScore = await quickBuzzScore(contentToAnalyze);
        analysisResult = {
          buzzScore: quickScore,
          analysisMode: 'quick',
        };
        break;

      case 'hooks-only':
        // Extract key hooks only
        const hooks = await extractKeyHooks(contentToAnalyze, 5);
        analysisResult = {
          keyHooks: hooks,
          analysisMode: 'hooks-only',
        };
        break;

      case 'trends-only':
        // Identify trending topics only
        const topics = await identifyTrendingTopics(contentToAnalyze);
        analysisResult = {
          trendingTopics: topics,
          analysisMode: 'trends-only',
        };
        break;

      case 'simplified':
        // Simplified format (Issue #22 requirements)
        if (req.transcription) {
          analysisResult = await analyzeTranscriptSimplified(
            req.transcription,
            req.contentType === 'reel' ? 'reel' : req.contentType === 'story' ? 'story' : 'post'
          );
        } else {
          // Fallback for content (not transcription)
          const fullAnalysis = await analyzeBuzzPotential(contentToAnalyze, {
            contentType: req.contentType === 'reel' ? 'reel' : req.contentType === 'story' ? 'story' : 'post',
          });
          const { toSimplifiedFormat } = await import('@/lib/ai/buzz-analyzer');
          analysisResult = toSimplifiedFormat(fullAnalysis);
        }
        break;

      case 'full':
      default:
        // Full comprehensive analysis
        if (req.transcription) {
          // Use new buzz-analyzer for transcription-based analysis
          analysisResult = await analyzeBuzzPotential(req.transcription, {
            contentType: req.contentType === 'reel' ? 'reel' : req.contentType === 'story' ? 'story' : 'post',
            currentMetrics: {
              likes: req.likes,
              comments: req.comments,
              shares: req.shares,
              views: req.views,
            },
            accountInfo: req.accountInfo,
            includeCompetitorAnalysis: true,
          });
        } else {
          // Fallback to original Gemini analysis for general content
          const legacyResult = await analyzeBuzzWithGemini(req.content, {
            likes: req.likes,
            comments: req.comments,
            shares: req.shares,
            views: req.views,
          });
          analysisResult = {
            ...legacyResult,
            contentType: req.contentType,
            engagementMetrics: {
              likes: req.likes,
              comments: req.comments,
              shares: req.shares,
              views: req.views,
            },
          };
        }
        break;
    }

    // Return success response
    return NextResponse.json(
      {
        status: 'success',
        data: analysisResult,
        analysisMode,
        timestamp: new Date().toISOString(),
      } as BuzzAnalysisResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Buzz analysis error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      } as BuzzAnalysisResponse,
      { status: 500 }
    );
  }
}

/**
 * GET handler - returns API documentation
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: '/api/analyze/buzz',
      method: 'POST',
      description: 'Analyze Instagram content for buzz potential and viral factors',
      version: '2.0',
      features: [
        'AI-powered buzz analysis',
        'Transcription-based analysis',
        'Key hooks identification',
        'Trending topics detection',
        'Viral potential scoring',
        'Multiple analysis modes',
      ],
      request: {
        content: 'string (1-10000 chars) - Required if transcription not provided',
        transcription: 'string (1-10000 chars) - Required if content not provided (recommended for Reels)',
        analysisMode: 'string (full|quick|hooks-only|trends-only|simplified) - Optional, default: full',
        likes: 'number - Optional',
        comments: 'number - Optional',
        shares: 'number - Optional',
        views: 'number - Optional',
        hashtags: 'string[] - Optional',
        contentType: 'string (photo|carousel|reel|story) - Optional',
        accountInfo: {
          followerCount: 'number - Optional',
          avgEngagementRate: 'number - Optional',
          niche: 'string - Optional',
        },
      },
      response: {
        full: {
          buzzScore: 'number (0-100)',
          sentiment: 'string (positive|negative|neutral)',
          viralPotential: 'string (low|medium|high|very-high)',
          keyHooks: 'array of hooks with strength ratings',
          trendingTopics: 'array of trending topics',
          contentStructure: 'object with opening strength, retention factors, CTA, pacing',
          targetAudience: 'object with demographics and interests',
          recommendations: 'array of prioritized suggestions',
          predictedMetrics: 'object with estimated views, engagement, virality probability',
        },
        quick: {
          buzzScore: 'number (0-100)',
        },
        hooksOnly: {
          keyHooks: 'array of key hooks',
        },
        trendsOnly: {
          trendingTopics: 'array of trending topics',
        },
        simplified: {
          buzzScore: 'number (0-100)',
          factors: 'array of buzz factor strings',
          sentiment: 'string (positive|negative|neutral)',
          keyThemes: 'array of key theme strings',
          recommendations: 'array of recommendation strings',
        },
      },
      examples: [
        {
          name: 'Full Analysis with Transcription',
          request: {
            transcription: 'Check this out! You won\'t believe what happens next...',
            contentType: 'reel',
            views: 50000,
            likes: 5000,
            analysisMode: 'full',
          },
        },
        {
          name: 'Quick Buzz Score',
          request: {
            transcription: 'Amazing life hack everyone needs to know!',
            analysisMode: 'quick',
          },
        },
        {
          name: 'Extract Key Hooks',
          request: {
            transcription: 'The secret to viral content is simple...',
            analysisMode: 'hooks-only',
          },
        },
        {
          name: 'Simplified Analysis (Issue #22 Format)',
          request: {
            transcription: 'AIを活用した時短術を紹介します。驚きの結果が...',
            contentType: 'reel',
            analysisMode: 'simplified',
          },
        },
      ],
    },
    { status: 200 }
  );
}
