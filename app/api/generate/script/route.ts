/**
 * Reel Script Generation API
 * Generates professional Reel scripts with pacing and timing information
 * POST /api/generate/script
 *
 * F3-3: リール台本生成機能 (P0)
 * - Accepts transcription + buzz analysis (primary format)
 * - Generates structured Reel scripts with timing and B-roll suggestions
 * - Supports multiple script lengths (15s, 30s, 60s, 90s)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReelScriptWithGemini } from '@/lib/ai/gemini';
import {
  generateReelScript,
  generateScriptVariations,
  formatScript,
  validateScript,
  type Transcription,
  type BuzzAnalysis,
  type ReelScript,
} from '@/lib/ai/script-generator';

/**
 * Request body interface
 */
interface ReelScriptGenerationRequest {
  // New F3-3 format (primary)
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
    keyHooks?: Array<{
      text: string;
      hookType: string;
      strength: number;
    }>;
    keyThemes?: string[];
    recommendations?: string[];
    analysis?: string;
    trendingTopics?: Array<{
      topic: string;
      relevance: number;
    }>;
  };

  // Legacy format (backward compatibility)
  topic?: string;
  url?: string;
  content?: string;

  // Options
  duration?: 15 | 30 | 60 | 90;
  style?: 'educational' | 'entertaining' | 'tutorial' | 'motivational' | 'storytelling';
  tone?: 'professional' | 'casual' | 'energetic' | 'calm' | 'humorous';
  targetAudience?: string;
  includeSubtitles?: boolean;
  complexity?: 'simple' | 'moderate' | 'advanced';
  generateVariations?: boolean;
  variationCount?: number;
  platform?: 'instagram' | 'tiktok' | 'youtube';
}

/**
 * Response interface
 */
interface ReelScriptGenerationResponse {
  status: 'success' | 'error';
  data?: {
    // New F3-3 format
    script?: ReelScript;
    formattedScript?: string;
    variations?: ReelScript[];

    // Legacy format (for backward compatibility)
    legacyScript?: string;
    pacing?: Array<{
      timeRange: string;
      description: string;
      voiceover?: string;
    }>;
    musicSuggestion?: string;
    transitionTips?: string[];

    // Metadata
    metadata?: {
      duration: number;
      style: string;
      platform?: string;
      estimatedWordCount: number;
      estimatedSpeakingPace: string;
      usedTranscription: boolean;
      usedBuzzAnalysis: boolean;
      validationResult?: {
        valid: boolean;
        errors: string[];
        warnings: string[];
      };
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

  // Check for new F3-3 format: transcription + buzzAnalysis
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

  // Check duration is valid
  const duration = req.duration as number | undefined;
  const hasValidDuration =
    !duration ||
    (typeof duration === 'number' && [15, 30, 60, 90].includes(duration));

  return (hasNewFormat || hasLegacyFormat) && hasValidDuration;
}

/**
 * Extracts topic from request body (url, content, or topic)
 */
function extractTopic(body: ReelScriptGenerationRequest): string {
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
            'Invalid request body. Required: (transcription + buzzAnalysis) OR (topic/url/content). Duration must be 15, 30, 60, or 90 seconds.',
          timestamp: new Date().toISOString(),
        } as ReelScriptGenerationResponse,
        { status: 400 }
      );
    }

    const requestBody = body as ReelScriptGenerationRequest;

    // Determine if using new F3-3 format (transcription + buzzAnalysis)
    const useNewFormat =
      requestBody.transcription && requestBody.buzzAnalysis;

    let usedTranscription = false;
    let usedBuzzAnalysis = false;

    if (useNewFormat && requestBody.transcription && requestBody.buzzAnalysis) {
      // NEW F3-3 FORMAT: Use transcription + buzz analysis
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
        viralPotential: requestBody.buzzAnalysis.viralPotential,
        keyHooks: requestBody.buzzAnalysis.keyHooks,
        keyThemes: requestBody.buzzAnalysis.keyThemes,
        recommendations: requestBody.buzzAnalysis.recommendations,
        analysis: requestBody.buzzAnalysis.analysis,
        trendingTopics: requestBody.buzzAnalysis.trendingTopics,
      };

      const options = {
        duration: requestBody.duration || 30,
        style: requestBody.style || 'entertaining',
        tone: requestBody.tone || 'casual',
        targetAudience: requestBody.targetAudience,
        includeSubtitles: requestBody.includeSubtitles !== false,
        complexity: requestBody.complexity || 'moderate',
      };

      // Generate variations if requested
      if (requestBody.generateVariations) {
        const count = Math.min(
          Math.max(requestBody.variationCount || 3, 1),
          3
        );
        const variations = await generateScriptVariations(
          transcription,
          buzzAnalysis,
          count,
          options
        );

        const primaryScript = variations[0];
        const validation = validateScript(primaryScript);
        const formatted = formatScript(primaryScript);

        return NextResponse.json(
          {
            status: 'success',
            data: {
              script: primaryScript,
              formattedScript: formatted,
              variations,
              metadata: {
                duration: primaryScript.duration,
                style: options.style,
                platform: requestBody.platform,
                estimatedWordCount: primaryScript.metadata.totalWordCount,
                estimatedSpeakingPace: primaryScript.metadata.estimatedPace,
                usedTranscription,
                usedBuzzAnalysis,
                validationResult: validation,
              },
            },
            timestamp: new Date().toISOString(),
          } as ReelScriptGenerationResponse,
          { status: 200 }
        );
      } else {
        // Generate single script
        const script = await generateReelScript(
          transcription,
          buzzAnalysis,
          options
        );

        const validation = validateScript(script);
        const formatted = formatScript(script);

        return NextResponse.json(
          {
            status: 'success',
            data: {
              script,
              formattedScript: formatted,
              metadata: {
                duration: script.duration,
                style: options.style,
                platform: requestBody.platform,
                estimatedWordCount: script.metadata.totalWordCount,
                estimatedSpeakingPace: script.metadata.estimatedPace,
                usedTranscription,
                usedBuzzAnalysis,
                validationResult: validation,
              },
            },
            timestamp: new Date().toISOString(),
          } as ReelScriptGenerationResponse,
          { status: 200 }
        );
      }
    } else {
      // LEGACY FORMAT: Use topic/url/content (backward compatibility)
      const topic = extractTopic(requestBody);
      const duration = requestBody.duration || 30;
      const style = requestBody.style || 'entertaining';
      const platform = requestBody.platform || 'instagram';

      // Map 'storytelling' to 'entertaining' for legacy function
      const legacyStyle: 'educational' | 'entertaining' | 'tutorial' | 'motivational' =
        style === 'storytelling' ? 'entertaining' : style as 'educational' | 'entertaining' | 'tutorial' | 'motivational';

      const generationResult = await generateReelScriptWithGemini(
        topic,
        duration,
        legacyStyle
      );

      const wordCount = countWords(generationResult.script);
      const speakingPace =
        duration > 0 ? Math.round(wordCount / (duration / 60)) : 0;

      return NextResponse.json(
        {
          status: 'success',
          data: {
            legacyScript: generationResult.script,
            pacing: generationResult.pacing,
            musicSuggestion: generationResult.musicSuggestion,
            transitionTips: generationResult.transitionTips,
            metadata: {
              duration,
              style,
              platform,
              estimatedWordCount: wordCount,
              estimatedSpeakingPace: `${speakingPace} words per minute`,
              usedTranscription,
              usedBuzzAnalysis,
            },
          },
          timestamp: new Date().toISOString(),
        } as ReelScriptGenerationResponse,
        { status: 200 }
      );
    }
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
        'Generate professional Reel scripts with detailed pacing and timing (F3-3 Implementation)',
      version: '2.0',
      formats: {
        new: {
          description:
            'Primary format using transcription and buzz analysis (F3-3 requirements)',
          required: ['transcription', 'buzzAnalysis'],
          request: {
            transcription: {
              text: 'string - Transcription text from original video',
              language: 'string - Optional language code',
              duration: 'number - Optional video duration in seconds',
              confidence: 'number - Optional transcription confidence (0-1)',
            },
            buzzAnalysis: {
              buzzScore: 'number (0-100) - Buzz potential score',
              sentiment: 'string - Sentiment analysis result',
              viralPotential: 'string - Optional viral potential rating',
              keyHooks: 'array - Optional identified hooks',
              keyThemes: 'string[] - Optional key themes',
              recommendations: 'string[] - Optional recommendations',
              analysis: 'string - Optional detailed analysis',
              trendingTopics: 'array - Optional trending topics',
            },
            duration: 'number (15|30|60|90) - Optional script length in seconds (default: 30)',
            style: 'string (educational|entertaining|motivational|tutorial|storytelling) - Optional',
            tone: 'string (professional|casual|energetic|calm|humorous) - Optional',
            targetAudience: 'string - Optional target audience description',
            includeSubtitles: 'boolean - Optional include on-screen text (default: true)',
            complexity: 'string (simple|moderate|advanced) - Optional',
            generateVariations: 'boolean - Optional generate multiple versions',
            variationCount: 'number (1-3) - Optional number of variations',
          },
          response: {
            status: 'success | error',
            data: {
              script: {
                title: 'string - Reel title',
                duration: 'number - Duration in seconds',
                hook: {
                  text: 'string - Opening hook (first 3s)',
                  duration: 'number - Hook duration',
                  visualSuggestion: 'string - Visual description',
                  onScreenText: 'string - Optional text overlay',
                },
                sections: [
                  {
                    timestamp: 'string - Time range (e.g., "0:03-0:08")',
                    duration: 'number - Section duration',
                    type: 'string - Section type',
                    voiceover: 'string - What to say',
                    visualDescription: 'string - What to show',
                    brollSuggestion: 'string - Optional B-roll idea',
                    emphasis: 'array - Pacing emphasis markers',
                    onScreenText: 'string - Optional text overlay',
                  },
                ],
                callToAction: {
                  text: 'string - Final CTA',
                  duration: 'number - CTA duration',
                  visualSuggestion: 'string - Ending visual',
                },
                metadata: {
                  totalWordCount: 'number',
                  estimatedPace: 'string',
                  difficulty: 'string (easy|medium|hard)',
                  equipmentNeeded: 'string[]',
                  targetAudience: 'string',
                },
                musicSuggestion: {
                  mood: 'string',
                  tempo: 'string (slow|medium|fast)',
                  genres: 'string[]',
                },
                brollList: 'string[] - B-roll shots needed',
                hashtags: 'string[] - Relevant hashtags',
                caption: 'string - Instagram caption',
                pacingNotes: 'string[] - Pacing tips',
              },
              formattedScript: 'string - Formatted markdown script',
              variations: 'ReelScript[] - Optional variations if requested',
              metadata: {
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
                text: 'Check this out! You won\'t believe this simple trick...',
                duration: 45,
              },
              buzzAnalysis: {
                buzzScore: 85,
                sentiment: 'positive',
                keyHooks: [
                  {
                    text: 'You won\'t believe',
                    hookType: 'curiosity',
                    strength: 9,
                  },
                ],
                keyThemes: ['productivity', 'life-hacks'],
              },
              duration: 30,
              style: 'entertaining',
            },
            response: {
              script: {
                title: '30-Second Life Hack That Changed Everything',
                duration: 30,
                hook: {
                  text: 'Stop! Don\'t scroll past this.',
                  duration: 3,
                  visualSuggestion: 'Hand gesture stopping camera',
                },
              },
            },
          },
        },
        legacy: {
          description: 'Legacy format for backward compatibility',
          request: {
            topic: 'string (1-500 chars) - Optional (if url or content provided)',
            url: 'string - Optional URL to extract topic from',
            content: 'string - Optional content to use as topic',
            duration: 'number (1-300 seconds) - Optional (default: 30)',
            style: 'string (educational|entertaining|tutorial|motivational) - Optional',
          },
          response: {
            legacyScript: 'string - Full script text',
            pacing: 'object[] - Scene breakdown',
            musicSuggestion: 'string - Music mood',
            transitionTips: 'string[] - Transition tips',
          },
        },
      },
      notes: [
        'F3-3 Implementation: Accepts transcription + buzz analysis as primary input',
        'Generates structured Reel scripts with precise timing (15s, 30s, 60s, 90s)',
        'Includes hook (first 3 seconds), main content sections, and CTA (last 5 seconds)',
        'Provides B-roll suggestions, visual descriptions, and pacing notes',
        'Supports emphasis markers (pause, speed-up, emphasize, whisper)',
        'Includes on-screen text suggestions for subtitles',
        'Music and equipment suggestions included',
        'Can generate up to 3 variations in one request',
        'Backward compatible with legacy topic-based format',
      ],
    },
    { status: 200 }
  );
}
