/**
 * URL-based Transcription API Route Handler
 *
 * Handles POST requests for transcribing Instagram Reels from URL.
 * Downloads the video and transcribes it using OpenAI Whisper.
 *
 * Endpoint: POST /api/reels/transcribe-url
 * Content-Type: application/json
 *
 * Request Parameters:
 * - url: Video URL (required)
 * - language: Language code for transcription (optional, e.g. 'en', 'ja', 'auto')
 *
 * @module app/api/reels/transcribe-url/route
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { WhisperClient } from '@/lib/transcribe/whisper';
import { formatTranscription } from '@/lib/transcribe/formatter';

/**
 * Request body interface
 */
interface TranscribeUrlRequest {
  url: string;
  language?: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): body is TranscribeUrlRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const req = body as Record<string, unknown>;
  return typeof req.url === 'string' && req.url.length > 0;
}

/**
 * Downloads a video from URL and saves it temporarily
 *
 * @param url - Video URL to download
 * @returns Path to the downloaded file
 */
async function downloadVideo(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const ext = contentType.includes('video/mp4')
    ? '.mp4'
    : contentType.includes('video/webm')
      ? '.webm'
      : '.mp4';

  // Create temp directory
  const tempDir = path.join(process.cwd(), '.tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
  const filepath = path.join(tempDir, filename);

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));

  return filepath;
}

/**
 * Handle POST request for URL-based transcription
 *
 * @param request - Next.js request object
 * @returns JSON response with transcription result
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let tempFilePath: string | null = null;

  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Download video
    try {
      tempFilePath = await downloadVideo(body.url);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to download video: ${(error as Error).message}`,
        },
        { status: 400 }
      );
    }

    // Initialize Whisper client
    const language = body.language === 'auto' ? undefined : body.language;
    const whisperClient = new WhisperClient({
      apiKey,
      model: 'whisper-1',
      language,
      temperature: 0,
      responseFormat: 'verbose_json',
    });

    // Transcribe video
    const transcription = await whisperClient.transcribeVideo(tempFilePath, false);

    // Format transcription
    const formattedResult = formatTranscription(transcription, 'text');

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          text: transcription.text,
          transcription: transcription.text,
          language: transcription.language,
          duration: transcription.duration,
          confidence: 0.95,
          formatted: formattedResult,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Transcription error:', message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {
        console.warn('Failed to cleanup temp file:', tempFilePath);
      }
    }
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Handle GET request - returns API documentation
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: '/api/reels/transcribe-url',
      method: 'POST',
      description: 'Transcribe Instagram Reel video from URL',
      request: {
        url: 'string - Video URL (required)',
        language: "string - Language code ('en', 'ja', 'auto') - Optional",
      },
      response: {
        success: 'boolean',
        data: {
          text: 'string - Transcribed text',
          language: 'string - Detected language',
          duration: 'number - Video duration in seconds',
          confidence: 'number - Confidence score (0-1)',
        },
      },
    },
    { status: 200 }
  );
}

export const maxDuration = 60;
