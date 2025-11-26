/**
 * Instagram Caption Generator
 * AI-powered Instagram caption generation from Instagram Reels analysis
 * Uses transcription and buzz analysis to create engaging captions
 *
 * @module lib/ai/caption-generator
 */

import { callGemini } from './gemini';

/**
 * Buzz analysis data structure
 */
export interface BuzzAnalysis {
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
}

/**
 * Transcription data structure
 */
export interface Transcription {
  text: string;
  language?: string;
  duration?: number;
  confidence?: number;
}

/**
 * Caption style options
 */
export type CaptionStyle =
  | 'storytelling'     // Narrative-driven, emotional connection
  | 'educational'      // Informative, value-driven
  | 'promotional'      // Sales-focused, conversion-driven
  | 'conversational'   // Casual, friendly, relatable
  | 'inspirational'    // Motivational, aspirational
  | 'humorous';        // Funny, entertaining

/**
 * Generated Instagram caption structure
 */
export interface InstagramCaption {
  /** Main caption text (max 2,200 characters for Instagram) */
  caption: string;

  /** Opening hook (attention-grabbing first line) */
  hook: string;

  /** Relevant hashtags (20-30 recommended) */
  hashtags: string[];

  /** Call-to-action */
  callToAction: string;

  /** Character count */
  characterCount: number;

  /** Hashtag count */
  hashtagCount: number;

  /** Estimated engagement potential */
  estimatedEngagement: 'low' | 'medium' | 'high' | 'very-high';

  /** Caption style used */
  style: CaptionStyle;

  /** Emoji suggestions for caption enhancement */
  emojiSuggestions?: string[];

  /** Optimal posting time suggestion */
  postingTimeSuggestion?: string;
}

/**
 * Caption generation options
 */
export interface CaptionGenerationOptions {
  /** Caption style (default: 'conversational') */
  style?: CaptionStyle;

  /** Maximum caption length (default: 2200, Instagram max) */
  maxLength?: number;

  /** Number of hashtags to generate (default: 25, range: 10-30) */
  hashtagCount?: number;

  /** Include emojis in caption (default: true) */
  includeEmojis?: boolean;

  /** Include call-to-action (default: true) */
  includeCallToAction?: boolean;

  /** Target audience description */
  targetAudience?: string;

  /** Brand voice/tone */
  brandVoice?: string;

  /** Include posting time suggestion (default: false) */
  includePostingTime?: boolean;
}

/**
 * Generate Instagram caption from transcription and buzz analysis
 *
 * @param transcription - Video transcription data
 * @param buzzAnalysis - Buzz analysis results
 * @param options - Caption generation options
 * @returns Generated Instagram caption with hashtags
 *
 * @example
 * ```typescript
 * const caption = await generateInstagramCaption(
 *   { text: "Check out this amazing tip for productivity..." },
 *   { buzzScore: 85, sentiment: 'positive', keyThemes: ['productivity'] },
 *   { style: 'educational', hashtagCount: 25 }
 * );
 * console.log(caption.caption);
 * ```
 */
export async function generateInstagramCaption(
  transcription: Transcription,
  buzzAnalysis: BuzzAnalysis,
  options: CaptionGenerationOptions = {}
): Promise<InstagramCaption> {
  // Validate inputs
  if (!transcription?.text || transcription.text.trim().length === 0) {
    throw new Error('Transcription text cannot be empty');
  }

  if (!buzzAnalysis || typeof buzzAnalysis.buzzScore !== 'number') {
    throw new Error('Valid buzz analysis is required');
  }

  // Default options
  const {
    style = 'conversational',
    maxLength = 2200,
    hashtagCount = 25,
    includeEmojis = true,
    includeCallToAction = true,
    targetAudience = 'general Instagram users',
    brandVoice = 'authentic and engaging',
    includePostingTime = false,
  } = options;

  // Validate constraints
  if (maxLength > 2200) {
    throw new Error('Instagram caption max length is 2,200 characters');
  }

  if (hashtagCount < 10 || hashtagCount > 30) {
    throw new Error('Hashtag count must be between 10 and 30');
  }

  // Build context from buzz analysis
  const buzzContext = buildBuzzContext(buzzAnalysis);

  // Build the prompt
  const prompt = buildCaptionPrompt(
    transcription,
    buzzContext,
    style,
    maxLength,
    hashtagCount,
    includeEmojis,
    includeCallToAction,
    targetAudience,
    brandVoice,
    includePostingTime
  );

  try {
    // Call Gemini API
    const response = await callGemini(prompt, {
      temperature: 0.8,
      maxTokens: 4096,
    });

    // Parse and validate response
    const caption = parseCaptionResponse(response, style);

    // Ensure character limit compliance
    if (caption.caption.length > maxLength) {
      caption.caption = caption.caption.substring(0, maxLength - 3) + '...';
      caption.characterCount = caption.caption.length;
    }

    return caption;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate Instagram caption: ${errorMessage}`);
  }
}

/**
 * Build buzz analysis context for prompt
 */
function buildBuzzContext(buzzAnalysis: BuzzAnalysis): string {
  const parts: string[] = [
    `Buzz Score: ${buzzAnalysis.buzzScore}/100`,
    `Sentiment: ${buzzAnalysis.sentiment}`,
  ];

  if (buzzAnalysis.viralPotential) {
    parts.push(`Viral Potential: ${buzzAnalysis.viralPotential}`);
  }

  if (buzzAnalysis.keyThemes && buzzAnalysis.keyThemes.length > 0) {
    parts.push(`Key Themes: ${buzzAnalysis.keyThemes.join(', ')}`);
  }

  if (buzzAnalysis.keyHooks && buzzAnalysis.keyHooks.length > 0) {
    const topHooks = buzzAnalysis.keyHooks
      .slice(0, 3)
      .map(h => `"${h.text}" (${h.hookType})`)
      .join('; ');
    parts.push(`Top Hooks: ${topHooks}`);
  }

  if (buzzAnalysis.trendingTopics && buzzAnalysis.trendingTopics.length > 0) {
    const topics = buzzAnalysis.trendingTopics
      .slice(0, 3)
      .map(t => t.topic)
      .join(', ');
    parts.push(`Trending Topics: ${topics}`);
  }

  if (buzzAnalysis.targetAudience) {
    parts.push(
      `Target Demographic: ${buzzAnalysis.targetAudience.primaryDemographic} (${buzzAnalysis.targetAudience.ageRange})`
    );
  }

  if (buzzAnalysis.recommendations && buzzAnalysis.recommendations.length > 0) {
    parts.push(`Top Recommendations: ${buzzAnalysis.recommendations.slice(0, 2).join('; ')}`);
  }

  return parts.join('\n');
}

/**
 * Build comprehensive caption generation prompt
 */
function buildCaptionPrompt(
  transcription: Transcription,
  buzzContext: string,
  style: CaptionStyle,
  maxLength: number,
  hashtagCount: number,
  includeEmojis: boolean,
  includeCallToAction: boolean,
  targetAudience: string,
  brandVoice: string,
  includePostingTime: boolean
): string {
  const styleGuidelines = getCaptionStyleGuidelines(style);

  return `You are an expert Instagram content strategist specializing in viral Instagram Reels captions.

Create an engaging Instagram caption based on this Reel analysis:

**Original Video Transcription:**
"${transcription.text}"

**Buzz Analysis:**
${buzzContext}

**Caption Requirements:**
- Style: ${style} (${styleGuidelines})
- Maximum length: ${maxLength} characters (Instagram limit: 2,200)
- Target audience: ${targetAudience}
- Brand voice: ${brandVoice}
- Hashtags: ${hashtagCount} relevant hashtags (mix of trending, niche, and branded)
${includeEmojis ? '- Include strategic emoji placement (3-5 emojis max)' : '- No emojis'}
${includeCallToAction ? '- Include a strong call-to-action' : '- No call-to-action needed'}

**Caption Best Practices:**
1. Opening Hook: Start with an attention-grabbing first line (question, bold statement, or intrigue)
2. Value Proposition: Clearly state what viewers gain from watching
3. Storytelling: Use the transcription content to tell a compelling story
4. Emotional Connection: Leverage the sentiment and hooks from buzz analysis
5. Trending Topics: Incorporate trending topics naturally
6. Call-to-Action: Encourage engagement (like, comment, share, save)
7. Hashtag Strategy:
   - 5-7 high-volume trending hashtags (100K+ posts)
   - 10-15 medium-volume niche hashtags (10K-100K posts)
   - 5-7 low-volume specific hashtags (<10K posts)
   - Mix of topic, demographic, and trending hashtags
8. Character Limit: Stay under ${maxLength} characters
9. Readability: Use line breaks for better flow (but not in JSON)

**Return ONLY valid JSON in this exact format:**
{
  "caption": "The complete Instagram caption text with line breaks represented as \\\\n",
  "hook": "The attention-grabbing opening line only",
  "hashtags": ["#hashtag1", "#hashtag2", ...${hashtagCount} hashtags total],
  "callToAction": "The call-to-action phrase",
  "estimatedEngagement": "low|medium|high|very-high",
  ${includeEmojis ? '"emojiSuggestions": ["😍", "✨", "🔥"],\n  ' : ''}${includePostingTime ? '"postingTimeSuggestion": "Best time to post based on content and audience",\n  ' : ''}"characterCount": <number>
}

**Important:**
- The caption should be engaging from the FIRST word
- Use the key hooks identified in buzz analysis
- Make it authentic and genuine to ${brandVoice}
- Leverage trending topics to increase discoverability
- Caption must work standalone without watching the video
- Total caption length must be under ${maxLength} characters
- Use \\\\n for line breaks in the caption text
- DO NOT include hashtags in the caption text - return them separately in the hashtags array`;
}

/**
 * Get style-specific guidelines
 */
function getCaptionStyleGuidelines(style: CaptionStyle): string {
  const guidelines: Record<CaptionStyle, string> = {
    storytelling: 'narrative-driven with emotional arc, personal anecdotes, and relatable journey',
    educational: 'informative and value-packed, teaches something specific, actionable takeaways',
    promotional: 'sales-focused with urgency, benefits-driven, conversion-oriented',
    conversational: 'casual and friendly, like talking to a friend, relatable and authentic',
    inspirational: 'motivational and uplifting, aspirational content, empowering message',
    humorous: 'funny and entertaining, witty wordplay, lighthearted and engaging',
  };

  return guidelines[style] || guidelines.conversational;
}

/**
 * Parse AI response into structured caption data
 */
function parseCaptionResponse(response: string, style: CaptionStyle): InstagramCaption {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.caption || typeof parsed.caption !== 'string') {
      throw new Error('Missing or invalid caption field');
    }

    if (!parsed.hook || typeof parsed.hook !== 'string') {
      throw new Error('Missing or invalid hook field');
    }

    if (!Array.isArray(parsed.hashtags)) {
      throw new Error('Missing or invalid hashtags field');
    }

    // Build Instagram caption object
    const caption: InstagramCaption = {
      caption: parsed.caption,
      hook: parsed.hook,
      hashtags: parsed.hashtags.map((tag: string) =>
        tag.startsWith('#') ? tag : `#${tag}`
      ),
      callToAction: parsed.callToAction || '',
      characterCount: parsed.caption.length,
      hashtagCount: parsed.hashtags.length,
      estimatedEngagement: ['low', 'medium', 'high', 'very-high'].includes(
        parsed.estimatedEngagement
      )
        ? parsed.estimatedEngagement
        : 'medium',
      style,
      emojiSuggestions: Array.isArray(parsed.emojiSuggestions)
        ? parsed.emojiSuggestions
        : undefined,
      postingTimeSuggestion: parsed.postingTimeSuggestion || undefined,
    };

    return caption;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse caption response: ${errorMessage}`);
  }
}

/**
 * Generate multiple caption variations
 *
 * @param transcription - Video transcription data
 * @param buzzAnalysis - Buzz analysis results
 * @param count - Number of variations (1-3)
 * @param options - Caption generation options
 * @returns Array of generated captions with different styles
 */
export async function generateCaptionVariations(
  transcription: Transcription,
  buzzAnalysis: BuzzAnalysis,
  count: number = 3,
  options: CaptionGenerationOptions = {}
): Promise<InstagramCaption[]> {
  if (count < 1 || count > 3) {
    throw new Error('Variation count must be between 1 and 3');
  }

  const styles: CaptionStyle[] = ['conversational', 'storytelling', 'educational'];
  const variations: InstagramCaption[] = [];

  for (let i = 0; i < count; i++) {
    const style = styles[i] || 'conversational';
    const caption = await generateInstagramCaption(transcription, buzzAnalysis, {
      ...options,
      style,
    });
    variations.push(caption);
  }

  return variations;
}

/**
 * Format Instagram caption for posting
 * Combines caption text with hashtags and call-to-action
 *
 * @param caption - Instagram caption object
 * @param hashtagsOnNewLine - Place hashtags on separate line (default: true)
 * @returns Formatted caption ready for posting
 */
export function formatInstagramCaption(
  caption: InstagramCaption,
  hashtagsOnNewLine: boolean = true
): string {
  let formatted = caption.caption;

  // Add hashtags
  if (caption.hashtags && caption.hashtags.length > 0) {
    const separator = hashtagsOnNewLine ? '\n\n' : ' ';
    formatted += separator + caption.hashtags.join(' ');
  }

  return formatted;
}

/**
 * Validate Instagram caption meets platform requirements
 *
 * @param caption - Caption to validate
 * @returns Validation result with errors if any
 */
export function validateInstagramCaption(caption: InstagramCaption): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check caption text
  if (!caption.caption || caption.caption.length === 0) {
    errors.push('Caption text is required');
  } else if (caption.caption.length > 2200) {
    errors.push(`Caption exceeds 2,200 characters (${caption.caption.length})`);
  }

  // Check character count matches
  if (caption.characterCount !== caption.caption.length) {
    errors.push('Character count mismatch');
  }

  // Check hashtags
  if (caption.hashtags && caption.hashtags.length > 0) {
    caption.hashtags.forEach((tag, index) => {
      if (!tag.startsWith('#')) {
        errors.push(`Hashtag ${index + 1} missing '#' prefix`);
      }
      if (tag.length > 100) {
        errors.push(`Hashtag ${index + 1} exceeds 100 characters`);
      }
      if (tag.includes(' ')) {
        errors.push(`Hashtag ${index + 1} contains spaces`);
      }
    });

    // Instagram allows up to 30 hashtags
    if (caption.hashtags.length > 30) {
      errors.push(`Too many hashtags (${caption.hashtags.length}, max 30)`);
    }

    // Warning for too few hashtags
    if (caption.hashtags.length < 10) {
      warnings.push(`Consider using more hashtags for better reach (current: ${caption.hashtags.length})`);
    }
  } else {
    warnings.push('No hashtags provided - this may limit discoverability');
  }

  // Check hook
  if (!caption.hook || caption.hook.length === 0) {
    warnings.push('No opening hook provided');
  }

  // Check call-to-action
  if (!caption.callToAction || caption.callToAction.length === 0) {
    warnings.push('No call-to-action provided');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract hashtags from caption text
 * Utility function to find hashtags in existing caption text
 *
 * @param text - Caption text to analyze
 * @returns Array of hashtags found in text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex);
  return matches || [];
}

/**
 * Calculate optimal posting time based on content and audience
 *
 * @param buzzAnalysis - Buzz analysis with audience data
 * @returns Optimal posting time suggestion
 */
export function calculateOptimalPostingTime(buzzAnalysis: BuzzAnalysis): string {
  const demographic = buzzAnalysis.targetAudience?.primaryDemographic?.toLowerCase() || '';

  // General best times for Instagram Reels
  if (demographic.includes('professional') || demographic.includes('business')) {
    return 'Weekdays 12pm-1pm or 6pm-8pm (when professionals check social media)';
  }

  if (demographic.includes('student') || demographic.includes('young')) {
    return 'Weekdays 3pm-5pm or 8pm-10pm (after school/evening leisure time)';
  }

  if (demographic.includes('parent') || demographic.includes('family')) {
    return 'Weekdays 10am-12pm or 8pm-9pm (morning routine or after kids\' bedtime)';
  }

  // Default recommendation
  return 'Weekdays 11am-1pm or 7pm-9pm (peak Instagram engagement times)';
}
