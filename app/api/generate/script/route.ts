/**
 * Reel Script Generation API
 * Generates professional Reel scripts with pacing and timing information
 * POST /api/generate/script
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReelScript } from '@/lib/ai/claude';

/**
 * Request body interface
 */
interface ReelScriptGenerationRequest {
  topic: string;
  duration?: number;
  style?: 'educational' | 'entertaining' | 'tutorial' | 'motivational';
  platform?: 'instagram' | 'tiktok' | 'youtube';
}

/**
 * Response interface
 */
interface ReelScriptGenerationResponse {
  status: 'success' | 'error';
  data?: {
    script: string;
    pacing: Array<{
      timeRange: string;
      description: string;
      voiceover?: string;
    }>;
    musicSuggestion: string;
    transitionTips: string[];
    metadata: {
      duration: number;
      style: string;
      platform: string;
      estimatedWordCount: number;
      estimatedSpeakingPace: string;
    };
  };
  error?: string;
  timestamp: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): body is ReelScriptGenerationRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;
  const duration = req.duration as number | undefined;

  return (
    typeof req.topic === 'string' &&
    req.topic.length > 0 &&
    req.topic.length <= 500 &&
    (!duration || (typeof duration === 'number' && duration > 0 && duration <= 300))
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
 * POST handler for reel script generation
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
        } as ReelScriptGenerationResponse,
        { status: 400 }
      );
    }

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          status: 'error',
          error:
            'Invalid request body. Required: topic (string, 1-500 chars). Optional: duration (number, 1-300 seconds)',
          timestamp: new Date().toISOString(),
        } as ReelScriptGenerationResponse,
        { status: 400 }
      );
    }

    const duration = body.duration || 30;
    const style = body.style || 'entertaining';
    const platform = body.platform || 'instagram';

    // Call Claude API for generation
    const generationResult = await generateReelScript(
      body.topic,
      duration,
      style
    );

    // Calculate metadata
    const wordCount = countWords(generationResult.script);
    const speakingPace =
      duration > 0 ? Math.round(wordCount / (duration / 60)) : 0;

    // Return success response
    return NextResponse.json(
      {
        status: 'success',
        data: {
          ...generationResult,
          metadata: {
            duration,
            style,
            platform,
            estimatedWordCount: wordCount,
            estimatedSpeakingPace: `${speakingPace} words per minute`,
          },
        },
        timestamp: new Date().toISOString(),
      } as ReelScriptGenerationResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Reel script generation error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      } as ReelScriptGenerationResponse,
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
      endpoint: '/api/generate/script',
      method: 'POST',
      description:
        'Generate professional Reel scripts with detailed pacing and timing',
      request: {
        topic: 'string (1-500 chars) - Required',
        duration: 'number (1-300 seconds) - Optional (default: 30)',
        style:
          'string (educational|entertaining|tutorial|motivational) - Optional',
        platform: 'string (instagram|tiktok|youtube) - Optional',
      },
      response: {
        status: 'success | error',
        data: {
          script: 'string - Full narrative script',
          pacing: 'object[] - Scene-by-scene breakdown with timing',
          musicSuggestion: 'string - Recommended music mood',
          transitionTips: 'string[] - Transition recommendations',
          metadata: {
            duration: 'number - Video duration in seconds',
            style: 'string - Content style',
            platform: 'string - Target platform',
            estimatedWordCount: 'number',
            estimatedSpeakingPace: 'string - Words per minute',
          },
        },
      },
      examples: {
        request: {
          topic: 'How to make the perfect iced coffee',
          duration: 30,
          style: 'tutorial',
          platform: 'instagram',
        },
        response: {
          script: 'Full script text here...',
          pacing: [
            {
              timeRange: '0-5s',
              description: 'Close-up of coffee beans',
              voiceover: 'Welcome to coffee making 101',
            },
          ],
          musicSuggestion: 'Upbeat and energetic',
          metadata: {
            estimatedSpeakingPace: '150 words per minute',
          },
        },
      },
    },
    { status: 200 }
  );
}
