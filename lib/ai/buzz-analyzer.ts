/**
 * Buzz Analyzer Module
 * AI-powered buzz analysis for Instagram Reels using transcription text
 * Analyzes viral potential, identifies key hooks, and trending topics
 *
 * @module lib/ai/buzz-analyzer
 */

import { callGemini } from './gemini';

/**
 * Buzz analysis result interface
 */
export interface BuzzAnalysis {
  buzzScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  viralPotential: 'low' | 'medium' | 'high' | 'very-high';
  keyHooks: Array<{
    text: string;
    timestamp?: string;
    hookType: 'emotional' | 'curiosity' | 'shocking' | 'relatable' | 'educational' | 'humorous';
    strength: number;
  }>;
  trendingTopics: Array<{
    topic: string;
    relevance: number;
    trendStrength: 'emerging' | 'trending' | 'viral' | 'declining';
  }>;
  contentStructure: {
    openingStrength: number;
    retentionFactors: string[];
    callToActionPresent: boolean;
    pacing: 'too-slow' | 'good' | 'too-fast';
  };
  targetAudience: {
    primaryDemographic: string;
    ageRange: string;
    interests: string[];
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'content' | 'timing' | 'hashtags' | 'engagement' | 'editing';
    suggestion: string;
    expectedImpact: string;
  }>;
  competitorAnalysis?: {
    similarContentPerformance: string;
    differentiationFactors: string[];
  };
  predictedMetrics: {
    estimatedViews: string;
    estimatedEngagementRate: string;
    viralityProbability: number;
  };
}

/**
 * Options for buzz analysis
 */
export interface BuzzAnalysisOptions {
  includeMetrics?: boolean;
  includeCompetitorAnalysis?: boolean;
  contentType?: 'reel' | 'post' | 'story' | 'carousel';
  currentMetrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
  accountInfo?: {
    followerCount?: number;
    avgEngagementRate?: number;
    niche?: string;
  };
}

/**
 * Analyzes transcription text for buzz potential
 * Uses AI to identify viral elements, hooks, and trending topics
 *
 * @param transcription - The transcription text from Instagram Reel
 * @param options - Analysis options including metrics and account info
 * @returns Comprehensive buzz analysis with score and recommendations
 *
 * @example
 * ```typescript
 * const analysis = await analyzeBuzzPotential(
 *   "Check out this amazing hack! You won't believe what happens next...",
 *   { contentType: 'reel' }
 * );
 * console.log(`Buzz Score: ${analysis.buzzScore}/100`);
 * ```
 */
export async function analyzeBuzzPotential(
  transcription: string,
  options: BuzzAnalysisOptions = {}
): Promise<BuzzAnalysis> {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transcription text cannot be empty');
  }

  if (transcription.length > 10000) {
    throw new Error('Transcription text too long (max 10000 characters)');
  }

  const prompt = buildAnalysisPrompt(transcription, options);

  try {
    const response = await callGemini(prompt, {
      temperature: 0.3,
      maxTokens: 4096,
    });

    const analysis = parseAnalysisResponse(response);
    return analysis;
  } catch (error) {
    throw new Error(`Buzz analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Builds the analysis prompt with all necessary context
 */
function buildAnalysisPrompt(
  transcription: string,
  options: BuzzAnalysisOptions
): string {
  const metricsContext = options.currentMetrics
    ? `
Current Performance Metrics:
- Views: ${options.currentMetrics.views || 'N/A'}
- Likes: ${options.currentMetrics.likes || 'N/A'}
- Comments: ${options.currentMetrics.comments || 'N/A'}
- Shares: ${options.currentMetrics.shares || 'N/A'}
`
    : '';

  const accountContext = options.accountInfo
    ? `
Account Context:
- Followers: ${options.accountInfo.followerCount || 'N/A'}
- Average Engagement Rate: ${options.accountInfo.avgEngagementRate || 'N/A'}%
- Niche: ${options.accountInfo.niche || 'General'}
`
    : '';

  return `You are an expert Instagram Reels analyst specializing in viral content analysis for Japanese-speaking audiences.

Analyze the following Instagram Reel transcription for buzz potential and viral factors.
The content may be in Japanese or English. Provide analysis in the same language as the input content.

Content Type: ${options.contentType || 'reel'}
${metricsContext}${accountContext}

TRANSCRIPTION:
"${transcription}"

Provide a comprehensive analysis in the following JSON format. Return ONLY valid JSON, no additional text:

{
  "buzzScore": <number 0-100>,
  "sentiment": "<positive|negative|neutral>",
  "viralPotential": "<low|medium|high|very-high>",
  "keyHooks": [
    {
      "text": "<specific quote from transcription>",
      "timestamp": "<optional timestamp like '0:05'>",
      "hookType": "<emotional|curiosity|shocking|relatable|educational|humorous>",
      "strength": <number 0-10>
    }
  ],
  "trendingTopics": [
    {
      "topic": "<topic name>",
      "relevance": <number 0-100>,
      "trendStrength": "<emerging|trending|viral|declining>"
    }
  ],
  "contentStructure": {
    "openingStrength": <number 0-10>,
    "retentionFactors": ["<factor1>", "<factor2>"],
    "callToActionPresent": <boolean>,
    "pacing": "<too-slow|good|too-fast>"
  },
  "targetAudience": {
    "primaryDemographic": "<description>",
    "ageRange": "<age range>",
    "interests": ["<interest1>", "<interest2>"]
  },
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "category": "<content|timing|hashtags|engagement|editing>",
      "suggestion": "<specific actionable suggestion>",
      "expectedImpact": "<description of expected improvement>"
    }
  ],
  ${options.includeCompetitorAnalysis ? `"competitorAnalysis": {
    "similarContentPerformance": "<analysis>",
    "differentiationFactors": ["<factor1>", "<factor2>"]
  },` : ''}
  "predictedMetrics": {
    "estimatedViews": "<range like '10K-50K'>",
    "estimatedEngagementRate": "<percentage like '5-8%'>",
    "viralityProbability": <number 0-100>
  }
}

ANALYSIS GUIDELINES:
1. Buzz Score Calculation:
   - 0-25: Low potential (generic, no clear hook)
   - 26-50: Moderate potential (some engaging elements)
   - 51-75: High potential (strong hooks, clear value)
   - 76-100: Very high potential (viral elements, trending topics)

2. Key Hooks:
   - Identify the most compelling phrases that grab attention
   - Rate each hook's strength (1-10)
   - Categorize the type of psychological trigger

3. Trending Topics:
   - Identify current trending themes or topics
   - Rate relevance to the content
   - Assess trend strength (emerging to declining)

4. Content Structure:
   - Opening strength: How strong is the first 3 seconds?
   - Retention factors: What keeps viewers watching?
   - CTA: Is there a clear call to action?
   - Pacing: Is the delivery speed optimal?

5. Recommendations:
   - Prioritize by expected impact (high/medium/low)
   - Provide specific, actionable suggestions
   - Focus on improvements that boost virality

Return ONLY the JSON object. No markdown formatting, no additional explanations.`;
}

/**
 * Parses the AI response into structured analysis data
 */
function parseAnalysisResponse(response: string): BuzzAnalysis {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (typeof parsed.buzzScore !== 'number') {
      throw new Error('Missing or invalid buzzScore');
    }

    // Ensure buzzScore is within range
    parsed.buzzScore = Math.max(0, Math.min(100, parsed.buzzScore));

    // Set defaults for optional fields
    const analysis: BuzzAnalysis = {
      buzzScore: parsed.buzzScore,
      sentiment: parsed.sentiment || 'neutral',
      viralPotential: parsed.viralPotential || 'medium',
      keyHooks: Array.isArray(parsed.keyHooks) ? parsed.keyHooks : [],
      trendingTopics: Array.isArray(parsed.trendingTopics) ? parsed.trendingTopics : [],
      contentStructure: parsed.contentStructure || {
        openingStrength: 5,
        retentionFactors: [],
        callToActionPresent: false,
        pacing: 'good',
      },
      targetAudience: parsed.targetAudience || {
        primaryDemographic: 'General audience',
        ageRange: '18-35',
        interests: [],
      },
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      predictedMetrics: parsed.predictedMetrics || {
        estimatedViews: 'N/A',
        estimatedEngagementRate: 'N/A',
        viralityProbability: 50,
      },
    };

    if (parsed.competitorAnalysis) {
      analysis.competitorAnalysis = parsed.competitorAnalysis;
    }

    return analysis;
  } catch (error) {
    throw new Error(`Failed to parse buzz analysis response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Quick buzz score calculation (lighter version without full analysis)
 * Useful for batch processing or preview
 *
 * @param transcription - The transcription text
 * @returns Quick buzz score (0-100)
 */
export async function quickBuzzScore(transcription: string): Promise<number> {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transcription text cannot be empty');
  }

  const prompt = `Analyze this Instagram Reel transcription and provide ONLY a buzz score (0-100).
Return ONLY a number, nothing else.

Transcription: "${transcription}"

Buzz score (0-100):`;

  try {
    const response = await callGemini(prompt, {
      temperature: 0.2,
      maxTokens: 10,
    });

    const score = parseInt(response.trim(), 10);
    if (isNaN(score)) {
      throw new Error('Invalid score returned');
    }

    return Math.max(0, Math.min(100, score));
  } catch (error) {
    throw new Error(`Quick buzz score failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts key hooks from transcription
 * Identifies the most compelling phrases for virality
 *
 * @param transcription - The transcription text
 * @param maxHooks - Maximum number of hooks to return (default: 5)
 * @returns Array of key hooks with strength ratings
 */
export async function extractKeyHooks(
  transcription: string,
  maxHooks: number = 5
): Promise<Array<{ text: string; hookType: string; strength: number }>> {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transcription text cannot be empty');
  }

  const prompt = `Extract the top ${maxHooks} most compelling hooks from this Instagram Reel transcription.
A hook is a phrase that grabs attention and encourages viewing.

Transcription: "${transcription}"

Return ONLY a JSON array in this format:
[
  {"text": "quote", "hookType": "emotional|curiosity|shocking|relatable|educational|humorous", "strength": <1-10>}
]`;

  try {
    const response = await callGemini(prompt, {
      temperature: 0.4,
      maxTokens: 1024,
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const hooks = JSON.parse(jsonMatch[0]);
    return Array.isArray(hooks) ? hooks.slice(0, maxHooks) : [];
  } catch (error) {
    throw new Error(`Hook extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Identifies trending topics in transcription
 * Analyzes what topics are currently viral or emerging
 *
 * @param transcription - The transcription text
 * @returns Array of trending topics with relevance scores
 */
export async function identifyTrendingTopics(
  transcription: string
): Promise<Array<{ topic: string; relevance: number; trendStrength: string }>> {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transcription text cannot be empty');
  }

  const prompt = `Identify trending topics in this Instagram Reel transcription.
Focus on topics that are currently viral or emerging on social media.

Transcription: "${transcription}"

Return ONLY a JSON array in this format:
[
  {"topic": "topic name", "relevance": <0-100>, "trendStrength": "emerging|trending|viral|declining"}
]`;

  try {
    const response = await callGemini(prompt, {
      temperature: 0.3,
      maxTokens: 1024,
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const topics = JSON.parse(jsonMatch[0]);
    return Array.isArray(topics) ? topics : [];
  } catch (error) {
    throw new Error(`Trending topic identification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Simplified buzz analysis result interface (Issue #22 format)
 */
export interface SimplifiedBuzzAnalysis {
  buzzScore: number;
  factors: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  keyThemes: string[];
  recommendations: string[];
}

/**
 * Converts full BuzzAnalysis to simplified format (Issue #22 requirements)
 * This format matches the specification from SUB-2 requirements
 *
 * @param analysis - Full buzz analysis result
 * @returns Simplified analysis format
 */
export function toSimplifiedFormat(analysis: BuzzAnalysis): SimplifiedBuzzAnalysis {
  // Extract factors from key hooks
  const factors = analysis.keyHooks
    .slice(0, 5) // Top 5 hooks
    .map(hook => {
      const typeMap: Record<string, string> = {
        emotional: '感情的なフック',
        curiosity: '好奇心を刺激',
        shocking: '驚きの要素',
        relatable: '共感できる内容',
        educational: '教育的価値',
        humorous: 'ユーモア',
      };
      return typeMap[hook.hookType] || hook.hookType;
    });

  // Extract key themes from trending topics
  const keyThemes = analysis.trendingTopics
    .slice(0, 3) // Top 3 topics
    .map(topic => topic.topic);

  // Extract simplified recommendations
  const recommendations = analysis.recommendations
    .filter(rec => rec.priority === 'high' || rec.priority === 'medium')
    .slice(0, 5) // Top 5 recommendations
    .map(rec => rec.suggestion);

  return {
    buzzScore: analysis.buzzScore,
    factors,
    sentiment: analysis.sentiment,
    keyThemes,
    recommendations,
  };
}

/**
 * Analyzes transcription and returns simplified format (Issue #22)
 * This is a convenience function that combines full analysis with simplified output
 *
 * @param transcription - The transcription text
 * @param contentType - Type of content (default: 'reel')
 * @returns Simplified buzz analysis
 */
export async function analyzeTranscriptSimplified(
  transcription: string,
  contentType: 'reel' | 'post' | 'story' = 'reel'
): Promise<SimplifiedBuzzAnalysis> {
  const fullAnalysis = await analyzeBuzzPotential(transcription, {
    contentType,
    includeMetrics: false,
    includeCompetitorAnalysis: false,
  });

  return toSimplifiedFormat(fullAnalysis);
}
