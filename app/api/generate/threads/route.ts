/**
 * Threads Generation API
 * Generates engaging Threads (Meta) post content from Instagram Reel analysis
 * POST /api/generate/threads
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateThreadsWithGemini } from '@/lib/ai/gemini';
import {
  generateThreadsPost,
  generateThreadsVariations,
  formatThreadsPost,
  validateThreadsPost,
  type BuzzAnalysis,
  type Transcription,
  type ThreadsPost,
} from '@/lib/ai/threads-generator';

/**
 * Request body interface
 */
interface ThreadsGenerationRequest {
  // New primary inputs (F3-2 requirements)
  transcription?: {
    text: string;
    language?: string;
    duration?: number;
    confidence?: number;
  };
  buzzAnalysis?: {
    buzzScore: number;
    sentiment: string;
    keyThemes: string[];
    recommendations: string[];
    analysis: string;
  };

  // Legacy inputs (backward compatibility)
  topic?: string;
  url?: string;
  content?: string;

  // Options
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational' | 'educational';
  style?: 'technical' | 'storytelling' | 'quick-tips';
  includeHashtags?: boolean;
  includeCallToAction?: boolean;
  maxLength?: number;
  targetAudience?: string;
  generateVariations?: boolean;
  variationCount?: number;
}

/**
 * Response interface
 */
interface ThreadsGenerationResponse {
  status: 'success' | 'error';
  data?: {
    // Primary post
    post?: ThreadsPost;
    formattedPost?: string;

    // Legacy format (for backward compatibility)
    thread?: string[];
    hashtags?: string[];
    callToAction?: string;
    characterCount?: number;
    totalParts?: number;
    estimatedReadTime?: string;

    // Variations (if requested)
    variations?: ThreadsPost[];

    // Metadata
    metadata?: {
      tone: string;
      estimatedEngagement: string;
      characterCount: number;
      hashtagCount: number;
      usedTranscription: boolean;
      usedBuzzAnalysis: boolean;
      validationResult?: {
        valid: boolean;
        errors: string[];
      };
    };
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

  // Check for new F3-2 format: transcription + buzzAnalysis
  const hasTranscription = Boolean(
    req.transcription &&
    typeof req.transcription === 'object' &&
    typeof (req.transcription as { text?: unknown }).text === 'string' &&
    (req.transcription as { text: string }).text.length > 0
  );

  const hasBuzzAnalysis = Boolean(
    req.buzzAnalysis &&
    typeof req.buzzAnalysis === 'object' &&
    typeof (req.buzzAnalysis as { buzzScore?: unknown }).buzzScore === 'number'
  );

  // Legacy format: topic, url, or content
  const hasTopic =
    typeof req.topic === 'string' &&
    req.topic.length > 0 &&
    req.topic.length <= 500;
  const hasUrl = typeof req.url === 'string' && req.url.length > 0;
  const hasContent = typeof req.content === 'string' && req.content.length > 0;

  // Valid if has new format OR legacy format
  const hasNewFormat = hasTranscription && hasBuzzAnalysis;
  const hasLegacyFormat = hasTopic || hasUrl || hasContent;

  return hasNewFormat || hasLegacyFormat;
}

/**
 * Extracts topic from request body (url, content, or topic)
 */
function extractTopic(body: ThreadsGenerationRequest): string {
  if (body.topic) {
    return body.topic;
  }

  if (body.url) {
    // Extract domain or last segment of URL as topic
    try {
      const urlObj = new URL(body.url);
      const pathSegments = urlObj.pathname.split('/').filter(seg => seg.length > 0);
      if (pathSegments.length > 0) {
        return pathSegments[pathSegments.length - 1].replace(/-/g, ' ');
      }
      return urlObj.hostname;
    } catch {
      return body.url;
    }
  }

  if (body.content) {
    // Use first 200 chars of content as topic
    return body.content.substring(0, 200);
  }

  return 'General topic';
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
            'Invalid request body. Required: (transcription + buzzAnalysis) OR (topic/url/content)',
          timestamp: new Date().toISOString(),
        } as ThreadsGenerationResponse,
        { status: 400 }
      );
    }

    const requestBody = body as ThreadsGenerationRequest;

    // Determine if using new F3-2 format (transcription + buzzAnalysis)
    const useNewFormat =
      requestBody.transcription && requestBody.buzzAnalysis;

    let result: ThreadsPost | ThreadsPost[];
    let usedTranscription = false;
    let usedBuzzAnalysis = false;

    if (useNewFormat && requestBody.transcription && requestBody.buzzAnalysis) {
      // NEW F3-2 FORMAT: Use transcription + buzz analysis
      usedTranscription = true;
      usedBuzzAnalysis = true;

      const transcription: Transcription = {
        text: requestBody.transcription.text,
        language: requestBody.transcription.language,
        duration: requestBody.transcription.duration,
        confidence: requestBody.transcription.confidence,
      };

      const buzzAnalysis: BuzzAnalysis = {
        buzzScore: requestBody.buzzAnalysis.buzzScore,
        sentiment: requestBody.buzzAnalysis.sentiment,
        keyThemes: requestBody.buzzAnalysis.keyThemes,
        recommendations: requestBody.buzzAnalysis.recommendations,
        analysis: requestBody.buzzAnalysis.analysis,
      };

      // Generate variations if requested
      if (requestBody.generateVariations) {
        const count = Math.min(
          Math.max(requestBody.variationCount || 3, 1),
          3
        );
        result = await generateThreadsVariations(
          transcription,
          buzzAnalysis,
          count,
          {
            tone: requestBody.tone,
            maxLength: requestBody.maxLength || 500,
            includeHashtags: requestBody.includeHashtags !== false,
            includeCallToAction: requestBody.includeCallToAction !== false,
            targetAudience: requestBody.targetAudience,
          }
        );
      } else {
        result = await generateThreadsPost(transcription, buzzAnalysis, {
          tone: requestBody.tone,
          maxLength: requestBody.maxLength || 500,
          includeHashtags: requestBody.includeHashtags !== false,
          includeCallToAction: requestBody.includeCallToAction !== false,
          targetAudience: requestBody.targetAudience,
        });
      }
    } else {
      // LEGACY FORMAT: Use topic/url/content (backward compatibility)
      const topic = extractTopic(requestBody);
      const legacyResult = await generateThreadsWithGemini(
        topic,
        (requestBody.tone as 'professional' | 'casual' | 'funny' | 'inspirational') || 'casual',
        requestBody.style || 'storytelling'
      );

      // Convert legacy format to new format
      const charCount = calculateCharacterCount(legacyResult.thread);
      const readTimeSeconds = Math.ceil(
        (legacyResult.thread.reduce(
          (total, post) => total + post.split(' ').length,
          0
        ) /
          200) *
          60
      );

      return NextResponse.json(
        {
          status: 'success',
          data: {
            thread: legacyResult.thread,
            hashtags: legacyResult.hashtags,
            callToAction: legacyResult.callToAction,
            characterCount: charCount,
            totalParts: legacyResult.thread.length,
            estimatedReadTime: `${Math.ceil(readTimeSeconds / 60)} minutes`,
          },
          timestamp: new Date().toISOString(),
        } as ThreadsGenerationResponse,
        { status: 200 }
      );
    }

    // Handle single post response
    if (!Array.isArray(result)) {
      const post = result;
      const validation = validateThreadsPost(post);
      const formatted = formatThreadsPost(post);

      return NextResponse.json(
        {
          status: 'success',
          data: {
            post,
            formattedPost: formatted,
            metadata: {
              tone: post.tone,
              estimatedEngagement: post.estimatedEngagement,
              characterCount: post.characterCount,
              hashtagCount: post.hashtags.length,
              usedTranscription,
              usedBuzzAnalysis,
              validationResult: validation,
            },
          },
          timestamp: new Date().toISOString(),
        } as ThreadsGenerationResponse,
        { status: 200 }
      );
    }

    // Handle variations response
    const variations = result;
    const primaryPost = variations[0];
    const validation = validateThreadsPost(primaryPost);
    const formatted = formatThreadsPost(primaryPost);

    return NextResponse.json(
      {
        status: 'success',
        data: {
          post: primaryPost,
          formattedPost: formatted,
          variations,
          metadata: {
            tone: primaryPost.tone,
            estimatedEngagement: primaryPost.estimatedEngagement,
            characterCount: primaryPost.characterCount,
            hashtagCount: primaryPost.hashtags.length,
            usedTranscription,
            usedBuzzAnalysis,
            validationResult: validation,
          },
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
      description:
        'Generate engaging Threads post content from Instagram Reel analysis (F3-2)',
      version: '2.0',
      formats: {
        new: {
          description:
            'Primary format using transcription and buzz analysis (F3-2 requirements)',
          required: ['transcription', 'buzzAnalysis'],
          request: {
            transcription: {
              text: 'string - Transcription text from video',
              language: 'string - Optional language code',
              duration: 'number - Optional video duration in seconds',
              confidence: 'number - Optional transcription confidence (0-1)',
            },
            buzzAnalysis: {
              buzzScore: 'number (0-100) - Buzz potential score',
              sentiment: 'string - Sentiment analysis result',
              keyThemes: 'string[] - Key themes identified',
              recommendations: 'string[] - Recommendations for improvement',
              analysis: 'string - Detailed analysis text',
            },
            tone: 'string (professional|casual|funny|inspirational|educational) - Optional',
            maxLength: 'number - Optional max characters (default: 500)',
            includeHashtags: 'boolean - Optional (default: true)',
            includeCallToAction: 'boolean - Optional (default: true)',
            targetAudience: 'string - Optional target audience description',
            generateVariations: 'boolean - Optional generate multiple versions',
            variationCount: 'number (1-3) - Optional number of variations',
          },
          response: {
            status: 'success | error',
            data: {
              post: {
                text: 'string - Main Threads post text',
                hashtags: 'string[] - Relevant hashtags',
                characterCount: 'number - Character count',
                estimatedEngagement: 'string (low|medium|high)',
                tone: 'string - Tone used',
                callToAction: 'string - Optional CTA',
              },
              formattedPost: 'string - Ready-to-post formatted text',
              variations: 'ThreadsPost[] - Optional variations if requested',
              metadata: {
                tone: 'string',
                estimatedEngagement: 'string',
                characterCount: 'number',
                hashtagCount: 'number',
                usedTranscription: 'boolean',
                usedBuzzAnalysis: 'boolean',
                validationResult: {
                  valid: 'boolean',
                  errors: 'string[]',
                },
              },
            },
          },
          example: {
            request: {
              transcription: {
                text: 'Hey everyone! Today I want to share 3 tips for sustainable living...',
                language: 'en',
                duration: 45,
              },
              buzzAnalysis: {
                buzzScore: 85,
                sentiment: 'positive',
                keyThemes: ['sustainability', 'eco-friendly', 'lifestyle'],
                recommendations: ['Add more visual examples', 'Include statistics'],
                analysis: 'High engagement potential due to trending topic',
              },
              tone: 'inspirational',
              includeHashtags: true,
            },
            response: {
              post: {
                text: 'Just discovered 3 game-changing tips for sustainable living that actually work!...',
                hashtags: ['#sustainability', '#ecofriendly', '#greenlifestyle'],
                characterCount: 187,
                estimatedEngagement: 'high',
                tone: 'inspirational',
              },
              formattedPost: 'Just discovered 3 game-changing tips...\n\n#sustainability #ecofriendly',
            },
          },
        },
        legacy: {
          description: 'Legacy format for backward compatibility',
          request: {
            topic: 'string (1-500 chars) - Optional (if url or content provided)',
            url: 'string - Optional URL to extract topic from',
            content: 'string - Optional content to use as topic',
            tone: 'string (professional|casual|funny|inspirational) - Optional',
            style: 'string (technical|storytelling|quick-tips) - Optional',
          },
          response: {
            thread: 'string[] - Array of thread posts',
            hashtags: 'string[] - Relevant hashtags',
            callToAction: 'string - Engagement CTA',
          },
        },
      },
      notes: [
        'F3-2 Implementation: Accepts transcription + buzz analysis as primary input',
        'Generates engaging Threads posts (max 500 characters)',
        'Includes relevant hashtags based on buzz analysis',
        'Validates posts against Threads platform requirements',
        'Supports multiple tone variations',
        'Can generate up to 3 variations in one request',
        'Backward compatible with legacy topic-based format',
      ],
    },
    { status: 200 }
  );
}
