/**
 * Caption Generation API
 * Generates engaging Instagram captions optimized for specific post types
 * POST /api/generate/caption
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCaption } from '@/lib/ai/claude';

/**
 * Request body interface
 */
interface CaptionGenerationRequest {
  topic: string;
  imageType?: 'portrait' | 'landscape' | 'carousel' | 'reel';
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
  includeHashtags?: boolean;
  maxLength?: number;
  targetAudience?: string;
}

/**
 * Response interface
 */
interface CaptionGenerationResponse {
  status: 'success' | 'error';
  data?: {
    caption: string;
    hashtags: string[];
    callToAction: string;
    estimatedEngagement: string;
    metadata: {
      characterCount: number;
      wordCount: number;
      hashtagCount: number;
      imageType: string;
      tone: string;
      engagement_tips?: string[];
    };
  };
  error?: string;
  timestamp: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): body is CaptionGenerationRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;
  const maxLength = req.maxLength as number | undefined;

  return (
    typeof req.topic === 'string' &&
    req.topic.length > 0 &&
    req.topic.length <= 500 &&
    (!maxLength || (typeof maxLength === 'number' && maxLength > 0))
  );
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * POST handler for caption generation
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
        } as CaptionGenerationResponse,
        { status: 400 }
      );
    }

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          status: 'error',
          error:
            'Invalid request body. Required: topic (string, 1-500 chars)',
          timestamp: new Date().toISOString(),
        } as CaptionGenerationResponse,
        { status: 400 }
      );
    }

    // Call Claude API for generation
    const generationResult = await generateCaption(
      body.topic,
      body.imageType || 'portrait',
      body.tone || 'casual',
      body.includeHashtags !== false
    );

    // Calculate metadata
    const charCount = generationResult.caption.length;
    const wordCount = countWords(generationResult.caption);
    const hashtagCount = generationResult.hashtags.length;

    // Return success response
    return NextResponse.json(
      {
        status: 'success',
        data: {
          ...generationResult,
          metadata: {
            characterCount: charCount,
            wordCount,
            hashtagCount,
            imageType: body.imageType || 'portrait',
            tone: body.tone || 'casual',
          },
        },
        timestamp: new Date().toISOString(),
      } as CaptionGenerationResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Caption generation error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      } as CaptionGenerationResponse,
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
      endpoint: '/api/generate/caption',
      method: 'POST',
      description: 'Generate engaging Instagram captions optimized for engagement',
      request: {
        topic: 'string (1-500 chars) - Required',
        imageType:
          'string (portrait|landscape|carousel|reel) - Optional (default: portrait)',
        tone: 'string (professional|casual|funny|inspirational) - Optional (default: casual)',
        includeHashtags: 'boolean - Optional (default: true)',
        maxLength: 'number - Optional max character length',
        targetAudience:
          'string - Optional audience description for personalization',
      },
      response: {
        status: 'success | error',
        data: {
          caption: 'string - The generated caption',
          hashtags: 'string[] - Recommended hashtags',
          callToAction: 'string - Engagement call-to-action',
          estimatedEngagement: 'string (low|medium|high)',
          metadata: {
            characterCount: 'number',
            wordCount: 'number',
            hashtagCount: 'number',
            imageType: 'string',
            tone: 'string',
          },
        },
      },
      examples: {
        request: {
          topic: 'New product launch for sustainable coffee',
          imageType: 'carousel',
          tone: 'inspirational',
          includeHashtags: true,
          targetAudience: 'eco-conscious millennials',
        },
        response: {
          caption:
            'Excited to introduce our new sustainable coffee blend...',
          hashtags: [
            '#sustainability',
            '#ecocoffee',
            '#sustainableLiving',
          ],
          callToAction: 'Try it today and join the sustainable movement!',
          estimatedEngagement: 'high',
          metadata: {
            characterCount: 210,
            wordCount: 32,
            hashtagCount: 3,
          },
        },
      },
      tips: [
        'Include question in CTA for higher engagement',
        'Use 3-5 relevant hashtags for feed posts',
        'Captions with emojis get 25% more engagement',
        'Best posting times are 6am, 12pm, and 8pm',
        'Use line breaks to improve readability',
      ],
    },
    { status: 200 }
  );
}
