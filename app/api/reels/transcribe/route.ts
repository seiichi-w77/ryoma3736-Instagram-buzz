/**
 * Transcription API Route Handler
 *
 * Handles POST requests for transcribing Instagram Reels audio content.
 * Supports both direct audio uploads and video file processing.
 *
 * Endpoint: POST /api/reels/transcribe
 * Content-Type: multipart/form-data
 *
 * Request Parameters:
 * - file: Audio or video file (required)
 * - format: Output format ('text'|'markdown'|'srt'|'script'|'complete') (default: 'text')
 * - verbose: Include detailed segments (boolean, default: false)
 * - language: Language code for transcription (optional, e.g. 'en', 'ja')
 *
 * Response:
 * - 200: Transcription completed successfully
 * - 400: Invalid request parameters
 * - 413: File too large
 * - 415: Unsupported file type
 * - 500: Server error
 *
 * @module app/api/reels/transcribe/route
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { WhisperClient } from '@/lib/transcribe/whisper';
import {
  formatTranscription,
} from '@/lib/transcribe/formatter';

/**
 * Supported file types for transcription
 */
const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
];

const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
];

const SUPPORTED_TYPES = [...SUPPORTED_AUDIO_TYPES, ...SUPPORTED_VIDEO_TYPES];

/**
 * Maximum file size in bytes (500MB)
 */
const MAX_FILE_SIZE = 500 * 1024 * 1024;

/**
 * Maximum file size for direct Whisper API (25MB)
 * For larger files, audio extraction and chunking would be needed
 */
const WHISPER_MAX_SIZE = 25 * 1024 * 1024;

/**
 * Request validation result
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
  file?: {
    path: string;
    mimetype: string;
    size: number;
  };
  format?: 'text' | 'markdown' | 'srt' | 'script' | 'complete';
  verbose?: boolean;
  language?: string;
}

/**
 * Validate incoming request and file
 *
 * @param request - Next.js request object
 * @returns Validation result
 */
async function validateRequest(request: NextRequest): Promise<ValidationResult> {
  // Check request method
  if (request.method !== 'POST') {
    return { valid: false, error: 'Method not allowed. Use POST.' };
  }

  // Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    return { valid: false, error: 'Failed to parse form data' };
  }

  // Get file from form data
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'File is required' };
  }

  // Validate file type
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported types: ${SUPPORTED_TYPES.join(', ')}`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Warning for large files
  if (file.size > WHISPER_MAX_SIZE) {
    console.warn(
      `File size (${file.size / 1024 / 1024}MB) exceeds Whisper API limit (${WHISPER_MAX_SIZE / 1024 / 1024}MB). This may cause issues.`
    );
  }

  // Save file temporarily
  const tempDir = path.join(process.cwd(), '.tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
  const filepath = path.join(tempDir, filename);

  try {
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
  } catch (error) {
    return { valid: false, error: 'Failed to save uploaded file' };
  }

  // Get format parameter
  const format = formData.get('format') as string || 'text';
  if (!['text', 'markdown', 'srt', 'script', 'complete'].includes(format)) {
    fs.unlinkSync(filepath);
    return { valid: false, error: 'Invalid format parameter' };
  }

  // Get verbose parameter
  const verbose = formData.get('verbose') === 'true';

  // Get language parameter
  const language = formData.get('language') as string | undefined;

  return {
    valid: true,
    file: {
      path: filepath,
      mimetype: file.type,
      size: file.size,
    },
    format: format as 'text' | 'markdown' | 'srt' | 'script' | 'complete',
    verbose,
    language,
  };
}

/**
 * Handle POST request for transcription
 *
 * @param request - Next.js request object
 * @returns JSON response with transcription result
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate request
    const validation = await validateRequest(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { file, format, verbose, language } = validation;
    if (!file) {
      return NextResponse.json(
        { error: 'File validation failed' },
        { status: 400 }
      );
    }

    // Initialize Whisper client
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const whisperClient = new WhisperClient({
      apiKey,
      model: 'base',
      language,
      temperature: 0,
      responseFormat: 'verbose_json',
    });

    // Transcribe file
    let transcription;
    try {
      if (SUPPORTED_VIDEO_TYPES.includes(file.mimetype)) {
        // Handle video file
        transcription = await whisperClient.transcribeVideo(file.path, verbose);
      } else {
        // Handle audio file
        transcription = await whisperClient.transcribeAudio(file.path, verbose);
      }
    } catch (error) {
      throw new Error(`Transcription failed: ${(error as Error).message}`);
    }

    // Format transcription result
    const formattedResult = formatTranscription(transcription, format);

    // Prepare response
    const response = {
      success: true,
      data: {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        format,
        formatted: formattedResult,
        segments: verbose ? transcription.segments : undefined,
      },
      metadata: {
        fileSize: file.size,
        processingTime: `${new Date().toISOString()}`,
      },
    };

    return NextResponse.json(response, { status: 200 });
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
    // Clean up uploaded file
    // Note: In production, implement proper cleanup strategy
  }
}

/**
 * Handle OPTIONS request for CORS
 *
 * @param _request - Next.js request object (unused)
 * @returns CORS headers
 */
export async function OPTIONS(_request: NextRequest): Promise<NextResponse> {
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
 * Configure route segment
 */
export const maxDuration = 60;

// Note: For body size limits in Next.js 14, use middleware or adjust in vercel.json
// Default is 4MB, increase in middleware if needed
