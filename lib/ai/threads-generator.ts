/**
 * Threads Post Generator
 * AI-powered Threads post generation from Instagram Reels analysis
 * Uses transcription and buzz analysis to create engaging Threads content
 */

import { callGemini } from './gemini';

/**
 * Buzz analysis data structure
 */
export interface BuzzAnalysis {
  buzzScore: number;
  sentiment: string;
  keyThemes: string[];
  recommendations: string[];
  analysis: string;
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
 * Generated Threads post structure
 */
export interface ThreadsPost {
  text: string;
  hashtags: string[];
  characterCount: number;
  estimatedEngagement: 'low' | 'medium' | 'high';
  tone: string;
  callToAction?: string;
}

/**
 * Threads generation options
 */
export interface ThreadsGenerationOptions {
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational' | 'educational';
  maxLength?: number;
  includeHashtags?: boolean;
  includeCallToAction?: boolean;
  targetAudience?: string;
}

/**
 * Generate Threads post from Instagram Reel transcription and buzz analysis
 *
 * @param transcription - Video transcription data
 * @param buzzAnalysis - Buzz analysis results
 * @param options - Generation options
 * @returns Generated Threads post
 */
export async function generateThreadsPost(
  transcription: Transcription,
  buzzAnalysis: BuzzAnalysis,
  options: ThreadsGenerationOptions = {}
): Promise<ThreadsPost> {
  const {
    tone = 'casual',
    maxLength = 500,
    includeHashtags = true,
    includeCallToAction = true,
    targetAudience = 'general Instagram users',
  } = options;

  // Build context from buzz analysis
  const buzzContext = `
Buzz Score: ${buzzAnalysis.buzzScore}/100
Sentiment: ${buzzAnalysis.sentiment}
Key Themes: ${buzzAnalysis.keyThemes.join(', ')}
Analysis: ${buzzAnalysis.analysis}
Top Recommendations: ${buzzAnalysis.recommendations.slice(0, 3).join('; ')}
`.trim();

  // Build the prompt
  const prompt = `You are an expert social media content creator specializing in Threads (Meta's text-based platform).

Create an engaging Threads post based on this Instagram Reel analysis:

**Original Video Transcription:**
"${transcription.text}"

**Buzz Analysis:**
${buzzContext}

**Requirements:**
- Tone: ${tone}
- Maximum length: ${maxLength} characters
- Target audience: ${targetAudience}
- Make it engaging and shareable
- Capture the essence of the original content
- Leverage the buzz factors identified in the analysis
${includeHashtags ? '- Include 3-5 relevant hashtags' : '- No hashtags'}
${includeCallToAction ? '- Include a call-to-action' : '- No call-to-action needed'}

**Return ONLY valid JSON in this exact format:**
{
  "text": "The main Threads post text (${maxLength} chars max)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "estimatedEngagement": "low|medium|high",
  "callToAction": "Optional engaging call-to-action"
}

**Important:**
- Keep the post conversational and authentic
- Use the key themes from the buzz analysis
- Make sure the text is exactly what would appear in a Threads post
- The text should standalone without needing the video
- Total text length must be under ${maxLength} characters`;

  try {
    // Call Gemini API
    const response = await callGemini(prompt, {
      temperature: 0.8,
      maxTokens: 2048,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!parsed.text || typeof parsed.text !== 'string') {
      throw new Error('Invalid response: missing or invalid text field');
    }

    // Ensure character limit
    let finalText = parsed.text;
    if (finalText.length > maxLength) {
      finalText = finalText.substring(0, maxLength - 3) + '...';
    }

    // Build final Threads post
    const threadsPost: ThreadsPost = {
      text: finalText,
      hashtags: includeHashtags && Array.isArray(parsed.hashtags)
        ? parsed.hashtags.slice(0, 5)
        : [],
      characterCount: finalText.length,
      estimatedEngagement: ['low', 'medium', 'high'].includes(parsed.estimatedEngagement)
        ? parsed.estimatedEngagement
        : 'medium',
      tone,
      callToAction: includeCallToAction && parsed.callToAction
        ? parsed.callToAction
        : undefined,
    };

    return threadsPost;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate Threads post: ${errorMessage}`);
  }
}

/**
 * Generate multiple Threads post variations
 *
 * @param transcription - Video transcription data
 * @param buzzAnalysis - Buzz analysis results
 * @param count - Number of variations to generate (1-3)
 * @param options - Generation options
 * @returns Array of generated Threads posts
 */
export async function generateThreadsVariations(
  transcription: Transcription,
  buzzAnalysis: BuzzAnalysis,
  count: number = 3,
  options: ThreadsGenerationOptions = {}
): Promise<ThreadsPost[]> {
  if (count < 1 || count > 3) {
    throw new Error('Count must be between 1 and 3');
  }

  const tones: Array<'professional' | 'casual' | 'funny' | 'inspirational' | 'educational'> =
    ['casual', 'professional', 'inspirational'];

  const variations: ThreadsPost[] = [];

  for (let i = 0; i < count; i++) {
    const tone = tones[i] || 'casual';
    const post = await generateThreadsPost(transcription, buzzAnalysis, {
      ...options,
      tone,
    });
    variations.push(post);
  }

  return variations;
}

/**
 * Format Threads post for display
 *
 * @param post - Threads post data
 * @returns Formatted string ready for posting
 */
export function formatThreadsPost(post: ThreadsPost): string {
  let formatted = post.text;

  // Add hashtags if present
  if (post.hashtags && post.hashtags.length > 0) {
    formatted += '\n\n' + post.hashtags.join(' ');
  }

  // Add call to action if present
  if (post.callToAction) {
    formatted += '\n\n' + post.callToAction;
  }

  return formatted;
}

/**
 * Validate Threads post meets platform requirements
 *
 * @param post - Threads post to validate
 * @returns Validation result with errors if any
 */
export function validateThreadsPost(post: ThreadsPost): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check text length (Threads max is 500 characters)
  if (!post.text || post.text.length === 0) {
    errors.push('Post text is required');
  } else if (post.text.length > 500) {
    errors.push(`Post text exceeds 500 characters (${post.text.length})`);
  }

  // Check character count matches
  if (post.characterCount !== post.text.length) {
    errors.push('Character count mismatch');
  }

  // Check hashtag format
  if (post.hashtags && post.hashtags.length > 0) {
    post.hashtags.forEach((tag, index) => {
      if (!tag.startsWith('#')) {
        errors.push(`Hashtag ${index + 1} missing '#' prefix`);
      }
      if (tag.length > 50) {
        errors.push(`Hashtag ${index + 1} exceeds 50 characters`);
      }
    });

    if (post.hashtags.length > 10) {
      errors.push(`Too many hashtags (${post.hashtags.length}, max 10)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
