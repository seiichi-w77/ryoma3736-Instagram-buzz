/**
 * Threads Generation API
 * Generates engaging Threads (Meta) post content
 * POST /api/generate/threads
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateThreads } from '@/lib/ai/claude';

/**
 * Request body interface
 */
interface ThreadsGenerationRequest {
  topic: string;
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
  style?: 'technical' | 'storytelling' | 'quick-tips';
  includeHashtags?: boolean;
  includeCallToAction?: boolean;
}

/**
 * Response interface
 */
interface ThreadsGenerationResponse {
  status: 'success' | 'error';
  data?: {
    thread: string[];
    hashtags: string[];
    callToAction: string;
    characterCount: number;
    totalParts: number;
    estimatedReadTime: string;
  };
  error?: string;
  timestamp: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): body is ThreadsGenerationRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;
  return (
    typeof req.topic === 'string' &&
    req.topic.length > 0 &&
    req.topic.length <= 500
  );
}

/**
 * Calculates total character count for the thread
 */
function calculateCharacterCount(thread: string[]): number {
  return thread.reduce((total, post) => total + post.length, 0);
}

/**
 * POST handler for threads generation
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
        } as ThreadsGenerationResponse,
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
        } as ThreadsGenerationResponse,
        { status: 400 }
      );
    }

    // Call Claude API for generation
    const generationResult = await generateThreads(
      body.topic,
      body.tone || 'casual',
      body.style || 'storytelling'
    );

    // Calculate metrics
    const charCount = calculateCharacterCount(generationResult.thread);
    const readTimeSeconds = Math.ceil(
      (generationResult.thread.reduce(
        (total, post) => total + post.split(' ').length,
        0
      ) /
        200) * 60
    );

    // Return success response
    return NextResponse.json(
      {
        status: 'success',
        data: {
          ...generationResult,
          characterCount: charCount,
          totalParts: generationResult.thread.length,
          estimatedReadTime: `${Math.ceil(readTimeSeconds / 60)} minutes`,
        },
        timestamp: new Date().toISOString(),
      } as ThreadsGenerationResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Threads generation error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      } as ThreadsGenerationResponse,
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
      endpoint: '/api/generate/threads',
      method: 'POST',
      description: 'Generate engaging Threads post content',
      request: {
        topic: 'string (1-500 chars) - Required',
        tone: 'string (professional|casual|funny|inspirational) - Optional',
        style: 'string (technical|storytelling|quick-tips) - Optional',
        includeHashtags: 'boolean - Optional (default: true)',
        includeCallToAction: 'boolean - Optional (default: true)',
      },
      response: {
        status: 'success | error',
        data: {
          thread: 'string[] - Array of thread posts (5-8 parts)',
          hashtags: 'string[] - Relevant hashtags',
          callToAction: 'string - Engagement CTA',
          characterCount: 'number - Total characters',
          totalParts: 'number - Number of posts in thread',
          estimatedReadTime: 'string - Estimated reading time',
        },
      },
      examples: {
        request: {
          topic:
            'Best practices for sustainable living',
          tone: 'inspirational',
          style: 'storytelling',
        },
        response: {
          thread: [
            'Starting a sustainability journey...',
            'Here\'s what I learned...',
          ],
          hashtags: ['#sustainability', '#ecolifestyle'],
          callToAction: 'Share your sustainability tips!',
        },
      },
    },
    { status: 200 }
  );
}
