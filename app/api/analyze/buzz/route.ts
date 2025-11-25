/**
 * Buzz Analysis API
 * Analyzes Instagram content for viral potential and engagement patterns
 * POST /api/analyze/buzz
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeBuzz } from '@/lib/ai/claude';

/**
 * Request body interface
 */
interface BuzzAnalysisRequest {
  content: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  hashtags?: string[];
  contentType?: 'photo' | 'carousel' | 'reel' | 'story';
}

/**
 * Response interface
 */
interface BuzzAnalysisResponse {
  status: 'success' | 'error';
  data?: {
    buzzScore: number;
    sentiment: string;
    keyThemes: string[];
    recommendations: string[];
    analysis: string;
    contentType?: string;
    engagementMetrics?: {
      likes?: number;
      comments?: number;
      shares?: number;
      views?: number;
    };
  };
  error?: string;
  timestamp: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): body is BuzzAnalysisRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;
  return (
    typeof req.content === 'string' &&
    req.content.length > 0 &&
    req.content.length <= 10000
  );
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
            'Invalid request body. Required: content (string, 1-10000 chars)',
          timestamp: new Date().toISOString(),
        } as BuzzAnalysisResponse,
        { status: 400 }
      );
    }

    // Call Claude API for analysis
    const analysisResult = await analyzeBuzz(body.content, {
      likes: body.likes,
      comments: body.comments,
      shares: body.shares,
      views: body.views,
    });

    // Return success response
    return NextResponse.json(
      {
        status: 'success',
        data: {
          ...analysisResult,
          contentType: body.contentType,
          engagementMetrics: {
            likes: body.likes,
            comments: body.comments,
            shares: body.shares,
            views: body.views,
          },
        },
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
      description: 'Analyze Instagram content for buzz potential',
      request: {
        content: 'string (1-10000 chars) - Required',
        likes: 'number - Optional',
        comments: 'number - Optional',
        shares: 'number - Optional',
        views: 'number - Optional',
        hashtags: 'string[] - Optional',
        contentType:
          'string (photo|carousel|reel|story) - Optional',
      },
      response: {
        status: 'success | error',
        data: {
          buzzScore: 'number (0-100)',
          sentiment: 'string (positive|negative|neutral)',
          keyThemes: 'string[]',
          recommendations: 'string[]',
          analysis: 'string',
        },
      },
    },
    { status: 200 }
  );
}
