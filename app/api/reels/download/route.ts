/**
 * Instagram Reels Download API Route
 * Handles POST requests to download Instagram reels
 * Endpoint: POST /api/reels/download
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDownloader, type DownloadRequest } from '@/lib/instagram/downloader';

/**
 * Request body type for download API
 */
interface ApiDownloadRequest {
  url: string;
  quality?: 'high' | 'medium' | 'low';
  format?: 'mp4' | 'webm';
}

/**
 * API response type
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

/**
 * Generates a unique request ID for tracking
 *
 * @returns Unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates the request body
 *
 * @param body - The request body
 * @returns Validation result with error message if invalid
 */
function validateRequestBody(body: unknown): {
  valid: boolean;
  error?: string;
  data?: ApiDownloadRequest;
} {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: 'Request body must be a JSON object',
    };
  }

  const request = body as Record<string, unknown>;

  if (!request.url || typeof request.url !== 'string') {
    return {
      valid: false,
      error: 'URL field is required and must be a string',
    };
  }

  if (
    request.quality &&
    !['high', 'medium', 'low'].includes(request.quality as string)
  ) {
    return {
      valid: false,
      error: 'Quality must be one of: high, medium, low',
    };
  }

  if (request.format && !['mp4', 'webm'].includes(request.format as string)) {
    return {
      valid: false,
      error: 'Format must be one of: mp4, webm',
    };
  }

  const validRequest: ApiDownloadRequest = {
    url: request.url,
    quality: (request.quality as ApiDownloadRequest['quality']) || 'high',
    format: (request.format as ApiDownloadRequest['format']) || 'mp4',
  };

  return {
    valid: true,
    data: validRequest,
  };
}

/**
 * POST handler for Instagram reels download
 *
 * @param request - The Next.js request object
 * @returns JSON response with download status and URL
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();

  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          timestamp,
          requestId,
        },
        { status: 400 }
      );
    }

    // Validate request body
    const validation = validateRequestBody(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          timestamp,
          requestId,
        },
        { status: 400 }
      );
    }

    const downloadRequest: DownloadRequest = validation.data!;

    // Create downloader instance
    const downloader = createDownloader({
      timeout: 30000,
      maxRetries: 3,
    });

    // Download the media
    const downloadResponse = await downloader.download(downloadRequest);

    if (!downloadResponse.success) {
      return NextResponse.json(
        {
          success: false,
          error: downloadResponse.error,
          timestamp,
          requestId,
        },
        { status: 400 }
      );
    }

    // Return successful response in the format expected by the dashboard
    return NextResponse.json(
      {
        success: true,
        data: {
          url: downloadResponse.mediaUrl,
          title: downloadResponse.title,
          description: downloadResponse.description,
          thumbnail: downloadResponse.thumbnail,
          duration: downloadResponse.duration,
          author: downloadResponse.author,
          // Also include additional metadata for backward compatibility
          mediaUrl: downloadResponse.mediaUrl,
          fileName: downloadResponse.fileName,
          mediaType: downloadResponse.mediaType,
          size: downloadResponse.size,
        },
        timestamp,
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${errorMessage}`,
        timestamp,
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 *
 * @returns CORS headers
 */
export function OPTIONS(): NextResponse {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
