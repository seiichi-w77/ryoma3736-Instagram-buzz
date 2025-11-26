/**
 * Caption Generation API
 * Generates engaging Instagram captions optimized for Reels
 * POST /api/generate/caption
 * F3-4 Implementation: Caption generation from transcription + buzz analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCaptionWithGemini } from '@/lib/ai/gemini';
import {
  generateInstagramCaption,
  generateCaptionVariations,
  formatInstagramCaption,
  validateInstagramCaption,
  type BuzzAnalysis,
  type Transcription,
  type InstagramCaption,
  type CaptionStyle,
} from '@/lib/ai/caption-generator';

/**
 * Request body interface
 */
interface CaptionGenerationRequest {
  // New F3-4 format: transcription + buzzAnalysis
  transcription?: {
    text: string;
    language?: string;
    duration?: number;
    confidence?: number;
  };
  buzzAnalysis?: {
    buzzScore: number;
    sentiment: string;
    viralPotential?: string;
    keyThemes?: string[];
    keyHooks?: Array<{
      text: string;
      hookType: string;
      strength: number;
    }>;
    trendingTopics?: Array<{
      topic: string;
      relevance: number;
      trendStrength: string;
    }>;
    recommendations?: string[];
    analysis?: string;
    targetAudience?: {
      primaryDemographic: string;
      ageRange: string;
      interests: string[];
    };
  };

  // Legacy format (backward compatibility)
  topic?: string;
  url?: string;
  content?: string;
  imageType?: 'portrait' | 'landscape' | 'carousel' | 'reel';
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';

  // Options (applies to both formats)
  style?: CaptionStyle;
  includeHashtags?: boolean;
  hashtagCount?: number;
  maxLength?: number;
  targetAudience?: string;
  brandVoice?: string;
  includeEmojis?: boolean;
  includeCallToAction?: boolean;
  includePostingTime?: boolean;
  generateVariations?: boolean;
  variationCount?: number;
}

/**
 * Response interface
 */
interface CaptionGenerationResponse {
  status: 'success' | 'error';
  data?: {
    // New F3-4 format
    caption?: InstagramCaption;
    formattedCaption?: string;
    variations?: InstagramCaption[];

    // Legacy format (backward compatibility)
    legacyCaption?: string;
    hashtags?: string[];
    callToAction?: string;
    estimatedEngagement?: string;

    // Metadata
    metadata?: {
      characterCount: number;
      wordCount?: number;
      hashtagCount: number;
      style?: string;
      imageType?: string;
      tone?: string;
      usedTranscription?: boolean;
      usedBuzzAnalysis?: boolean;
      validationResult?: {
        valid: boolean;
        errors: string[];
        warnings: string[];
      };
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

  // Check for new F3-4 format: transcription + buzzAnalysis
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

  // Check for legacy format
  const hasTopic = typeof req.topic === 'string' && req.topic.length > 0 && req.topic.length <= 500;
  const hasUrl = typeof req.url === 'string' && req.url.length > 0;
  const hasContent = typeof req.content === 'string' && req.content.length > 0;

  // Validate optional constraints
  const maxLength = req.maxLength as number | undefined;
  const hasValidMaxLength = !maxLength || (typeof maxLength === 'number' && maxLength > 0 && maxLength <= 2200);

  const hashtagCount = req.hashtagCount as number | undefined;
  const hasValidHashtagCount = !hashtagCount || (typeof hashtagCount === 'number' && hashtagCount >= 10 && hashtagCount <= 30);

  // Valid if has new format OR legacy format
  const hasNewFormat = hasTranscription && hasBuzzAnalysis;
  const hasLegacyFormat = hasTopic || hasUrl || hasContent;

  return (hasNewFormat || hasLegacyFormat) && hasValidMaxLength && hasValidHashtagCount;
}

/**
 * Extracts topic from request body (url, content, or topic)
 */
function extractTopic(body: CaptionGenerationRequest): string {
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
            'Invalid request body. Required: (transcription + buzzAnalysis) OR (topic/url/content)',
          timestamp: new Date().toISOString(),
        } as CaptionGenerationResponse,
        { status: 400 }
      );
    }

    const requestBody = body as CaptionGenerationRequest;

    // Determine if using new F3-4 format
    const useNewFormat =
      requestBody.transcription && requestBody.buzzAnalysis;

    let result: InstagramCaption | InstagramCaption[];
    let usedTranscription = false;
    let usedBuzzAnalysis = false;

    if (useNewFormat && requestBody.transcription && requestBody.buzzAnalysis) {
      // NEW F3-4 FORMAT: Use transcription + buzz analysis
      usedTranscription = true;
      usedBuzzAnalysis = true;

      const transcription: Transcription = {
        text: requestBody.transcription.text,
        language: requestBody.transcription.language,
        duration: requestBody.transcription.duration,
        confidence: requestBody.transcription.confidence,
      };

      const buzzAnalysis: BuzzAnalysis = requestBody.buzzAnalysis;

      // Generate variations if requested
      if (requestBody.generateVariations) {
        const count = Math.min(
          Math.max(requestBody.variationCount || 3, 1),
          3
        );
        result = await generateCaptionVariations(
          transcription,
          buzzAnalysis,
          count,
          {
            style: requestBody.style,
            maxLength: requestBody.maxLength || 2200,
            hashtagCount: requestBody.hashtagCount || 25,
            includeEmojis: requestBody.includeEmojis !== false,
            includeCallToAction: requestBody.includeCallToAction !== false,
            includePostingTime: requestBody.includePostingTime || false,
            targetAudience: requestBody.targetAudience,
            brandVoice: requestBody.brandVoice,
          }
        );
      } else {
        result = await generateInstagramCaption(transcription, buzzAnalysis, {
          style: requestBody.style,
          maxLength: requestBody.maxLength || 2200,
          hashtagCount: requestBody.hashtagCount || 25,
          includeEmojis: requestBody.includeEmojis !== false,
          includeCallToAction: requestBody.includeCallToAction !== false,
          includePostingTime: requestBody.includePostingTime || false,
          targetAudience: requestBody.targetAudience,
          brandVoice: requestBody.brandVoice,
        });
      }
    } else {
      // LEGACY FORMAT: Use topic/url/content
      const topic = extractTopic(requestBody);
      const legacyResult = await generateCaptionWithGemini(
        topic,
        requestBody.imageType || 'reel',
        (requestBody.tone as 'professional' | 'casual' | 'funny' | 'inspirational') || 'casual',
        requestBody.includeHashtags !== false
      );

      // Return legacy format response
      const charCount = legacyResult.caption.length;
      const wordCount = countWords(legacyResult.caption);

      return NextResponse.json(
        {
          status: 'success',
          data: {
            legacyCaption: legacyResult.caption,
            hashtags: legacyResult.hashtags,
            callToAction: legacyResult.callToAction,
            estimatedEngagement: legacyResult.estimatedEngagement,
            metadata: {
              characterCount: charCount,
              wordCount,
              hashtagCount: legacyResult.hashtags.length,
              imageType: requestBody.imageType || 'reel',
              tone: requestBody.tone || 'casual',
            },
          },
          timestamp: new Date().toISOString(),
        } as CaptionGenerationResponse,
        { status: 200 }
      );
    }

    // Handle single caption response
    if (!Array.isArray(result)) {
      const caption = result;
      const validation = validateInstagramCaption(caption);
      const formatted = formatInstagramCaption(caption);

      return NextResponse.json(
        {
          status: 'success',
          data: {
            caption,
            formattedCaption: formatted,
            metadata: {
              characterCount: caption.characterCount,
              hashtagCount: caption.hashtagCount,
              style: caption.style,
              usedTranscription,
              usedBuzzAnalysis,
              validationResult: validation,
            },
          },
          timestamp: new Date().toISOString(),
        } as CaptionGenerationResponse,
        { status: 200 }
      );
    }

    // Handle variations response
    const variations = result;
    const primaryCaption = variations[0];
    const validation = validateInstagramCaption(primaryCaption);
    const formatted = formatInstagramCaption(primaryCaption);

    return NextResponse.json(
      {
        status: 'success',
        data: {
          caption: primaryCaption,
          formattedCaption: formatted,
          variations,
          metadata: {
            characterCount: primaryCaption.characterCount,
            hashtagCount: primaryCaption.hashtagCount,
            style: primaryCaption.style,
            usedTranscription,
            usedBuzzAnalysis,
            validationResult: validation,
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
      description: 'Generate engaging Instagram captions for Reels (F3-4 Implementation)',
      version: '2.0',
      formats: {
        new: {
          description: 'Primary format using transcription and buzz analysis (F3-4 requirements)',
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
              viralPotential: 'string - Optional viral potential rating',
              keyThemes: 'string[] - Optional key themes identified',
              keyHooks: 'Array - Optional key hooks with type and strength',
              trendingTopics: 'Array - Optional trending topics',
              recommendations: 'string[] - Optional recommendations',
              analysis: 'string - Optional detailed analysis',
              targetAudience: 'object - Optional target demographic data',
            },
            style: 'string (storytelling|educational|promotional|conversational|inspirational|humorous) - Optional',
            maxLength: 'number (max 2200) - Optional caption length limit',
            hashtagCount: 'number (10-30) - Optional number of hashtags (default: 25)',
            includeEmojis: 'boolean - Optional include emojis (default: true)',
            includeCallToAction: 'boolean - Optional include CTA (default: true)',
            includePostingTime: 'boolean - Optional posting time suggestion',
            targetAudience: 'string - Optional target audience description',
            brandVoice: 'string - Optional brand voice/tone',
            generateVariations: 'boolean - Optional generate multiple versions',
            variationCount: 'number (1-3) - Optional number of variations',
          },
          response: {
            status: 'success | error',
            data: {
              caption: {
                caption: 'string - Complete Instagram caption text',
                hook: 'string - Attention-grabbing opening line',
                hashtags: 'string[] - Relevant hashtags (20-30)',
                callToAction: 'string - Engagement CTA',
                characterCount: 'number - Caption character count',
                hashtagCount: 'number - Number of hashtags',
                estimatedEngagement: 'string (low|medium|high|very-high)',
                style: 'string - Caption style used',
                emojiSuggestions: 'string[] - Optional emoji suggestions',
                postingTimeSuggestion: 'string - Optional optimal posting time',
              },
              formattedCaption: 'string - Ready-to-post formatted caption',
              variations: 'InstagramCaption[] - Optional caption variations',
              metadata: {
                characterCount: 'number',
                hashtagCount: 'number',
                style: 'string',
                usedTranscription: 'boolean',
                usedBuzzAnalysis: 'boolean',
                validationResult: {
                  valid: 'boolean',
                  errors: 'string[]',
                  warnings: 'string[]',
                },
              },
            },
          },
          example: {
            request: {
              transcription: {
                text: 'Hey everyone! Today I want to share 3 productivity hacks that changed my life...',
                language: 'en',
                duration: 45,
              },
              buzzAnalysis: {
                buzzScore: 85,
                sentiment: 'positive',
                viralPotential: 'high',
                keyThemes: ['productivity', 'life-hacks', 'work-life-balance'],
                keyHooks: [
                  { text: '3 productivity hacks that changed my life', hookType: 'curiosity', strength: 9 },
                ],
                trendingTopics: [
                  { topic: 'productivity', relevance: 95, trendStrength: 'trending' },
                ],
              },
              style: 'educational',
              hashtagCount: 25,
              includeEmojis: true,
            },
            response: {
              caption: {
                caption: 'Ready to transform your productivity? Here are 3 game-changing hacks...',
                hook: 'Ready to transform your productivity?',
                hashtags: ['#productivity', '#lifehacks', '#worklifebalance', '...25 total'],
                callToAction: 'Save this for later and try hack #2 today!',
                characterCount: 187,
                hashtagCount: 25,
                estimatedEngagement: 'high',
                style: 'educational',
              },
              formattedCaption: 'Ready to transform your productivity?...\n\n#productivity #lifehacks...',
            },
          },
        },
        legacy: {
          description: 'Legacy format for backward compatibility',
          request: {
            topic: 'string (1-500 chars) - Optional (if url or content provided)',
            url: 'string - Optional URL to extract topic from',
            content: 'string - Optional content to use as topic',
            imageType: 'string (portrait|landscape|carousel|reel) - Optional',
            tone: 'string (professional|casual|funny|inspirational) - Optional',
            includeHashtags: 'boolean - Optional (default: true)',
            maxLength: 'number - Optional max character length',
          },
          response: {
            legacyCaption: 'string - Generated caption',
            hashtags: 'string[] - Hashtags',
            callToAction: 'string - CTA',
            estimatedEngagement: 'string',
          },
        },
      },
      notes: [
        'F3-4 Implementation: Instagram caption generation from transcription + buzz analysis',
        'Supports 6 caption styles: storytelling, educational, promotional, conversational, inspirational, humorous',
        'Character limit: 2,200 characters (Instagram maximum)',
        'Hashtag strategy: 20-30 hashtags (mix of trending, niche, and branded)',
        'Includes attention-grabbing hooks and strong CTAs',
        'Emoji placement for enhanced engagement',
        'Can generate up to 3 style variations in one request',
        'Validates captions against Instagram platform requirements',
        'Backward compatible with legacy topic-based format',
      ],
      tips: [
        'Opening hook is critical - first line determines if users read more',
        'Use 20-30 hashtags for maximum reach (Instagram allows 30)',
        'Mix high-volume (100K+), medium (10K-100K), and niche (<10K) hashtags',
        'Captions with emojis get 25% more engagement',
        'Best posting times: Weekdays 11am-1pm or 7pm-9pm',
        'Use line breaks for readability (every 2-3 sentences)',
        'Include clear call-to-action for better engagement',
        'Leverage trending topics from buzz analysis',
        'Maintain authentic brand voice throughout',
      ],
    },
    { status: 200 }
  );
}
