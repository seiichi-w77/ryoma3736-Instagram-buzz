/**
 * Google Gemini API integration module
 * Handles communication with Google's Gemini API for content analysis and generation
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
// Gemini 3 Pro Preview (Nov 2025) - requires paid plan
// Fallback to Gemini 2.5 Flash for free tier
const GEMINI_MODEL_PRIMARY = 'gemini-3-pro-preview';
const GEMINI_MODEL_FALLBACK = 'gemini-2.5-flash';

interface GeminiRequestOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Makes a request to Gemini API
 * @param prompt The prompt to send to Gemini
 * @param options Configuration options for the request
 * @returns The response text from Gemini
 */
export async function callGemini(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable is not set');
  }

  // Try primary model first (Gemini 3 Pro), fallback to Gemini 2.5 Flash
  const models = options.model
    ? [options.model]
    : [GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK];

  let lastError: Error | null = null;

  for (const model of models) {
    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens || 4096,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If rate limited or quota exceeded, try fallback model
        if (response.status === 429 && models.length > 1) {
          console.log(`Model ${model} rate limited, trying fallback...`);
          lastError = new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
          continue;
        }
        throw new Error(
          `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response candidates from Gemini');
      }

      const textContent = data.candidates[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error('No text content in Gemini response');
      }

      console.log(`Successfully used model: ${model}`);
      return textContent;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // If it's a rate limit error and we have more models to try, continue
      if (models.indexOf(model) < models.length - 1) {
        continue;
      }
    }
  }

  throw new Error(`Failed to call Gemini API: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Analyzes buzz metrics for content using Gemini
 * @param content The content to analyze
 * @param metrics Engagement metrics to analyze
 * @returns Analysis results
 */
export async function analyzeBuzzWithGemini(
  content: string,
  metrics: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  } = {}
): Promise<{
  buzzScore: number;
  sentiment: string;
  keyThemes: string[];
  recommendations: string[];
  analysis: string;
}> {
  const metricsString = Object.entries(metrics)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const prompt = `Analyze the following Instagram content for buzz potential and engagement patterns.

Content: "${content}"
Current Metrics: ${metricsString || 'None provided'}

Provide a detailed analysis in JSON format with the following structure:
{
  "buzzScore": <number 0-100>,
  "sentiment": "<positive|negative|neutral>",
  "keyThemes": [<list of identified themes>],
  "recommendations": [<list of actionable recommendations>],
  "analysis": "<detailed analysis text>"
}

Return ONLY the JSON object, no additional text.`;

  const response = await callGemini(prompt, { temperature: 0.3 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(`Failed to parse buzz analysis response: ${error}`);
  }
}

/**
 * Generates Threads post content using Gemini
 * @param topic The topic to write about
 * @param tone The tone for the content
 * @param style The style preference
 * @returns Generated Threads content
 */
export async function generateThreadsWithGemini(
  topic: string,
  tone: 'professional' | 'casual' | 'funny' | 'inspirational' = 'casual',
  style: 'technical' | 'storytelling' | 'quick-tips' = 'storytelling'
): Promise<{
  thread: string[];
  hashtags: string[];
  callToAction: string;
}> {
  const prompt = `Create an engaging Threads post thread about: "${topic}"
Tone: ${tone}
Style: ${style}

Requirements:
- Create a 5-8 part thread
- Each part should be 280 characters or less
- Make it engaging and shareable
- Include appropriate thread structure
- Return ONLY in JSON format:
{
  "thread": ["part1", "part2", ...],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "callToAction": "engaging call to action"
}`;

  const response = await callGemini(prompt, { temperature: 0.8 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(`Failed to parse thread generation response: ${error}`);
  }
}

/**
 * Generates Reel script content using Gemini
 * @param topic The topic for the reel
 * @param duration Duration in seconds
 * @param style The style of content
 * @returns Generated Reel script
 */
export async function generateReelScriptWithGemini(
  topic: string,
  duration: number = 30,
  style: 'educational' | 'entertaining' | 'tutorial' | 'motivational' = 'entertaining'
): Promise<{
  script: string;
  pacing: Array<{
    timeRange: string;
    description: string;
    voiceover?: string;
  }>;
  musicSuggestion: string;
  transitionTips: string[];
}> {
  const prompt = `Create a ${duration}-second Reel script about: "${topic}"
Style: ${style}

Requirements:
- Script should be paced for ${duration} seconds (roughly 15-20 words per 5 seconds)
- Include detailed visual descriptions
- Add voiceover suggestions where appropriate
- Return ONLY in JSON format:
{
  "script": "full script text",
  "pacing": [
    {"timeRange": "0-5s", "description": "visual description", "voiceover": "optional voiceover"},
    ...
  ],
  "musicSuggestion": "type of music that would fit",
  "transitionTips": ["transition idea 1", "transition idea 2", ...]
}`;

  const response = await callGemini(prompt, { temperature: 0.7 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(`Failed to parse reel script response: ${error}`);
  }
}

/**
 * Generates Instagram caption using Gemini
 * @param topic The topic for the caption
 * @param imageType Type of image content
 * @param tone Tone of the caption
 * @param includeHashtags Whether to include hashtags
 * @returns Generated caption
 */
export async function generateCaptionWithGemini(
  topic: string,
  imageType: 'portrait' | 'landscape' | 'carousel' | 'reel' = 'portrait',
  tone: 'professional' | 'casual' | 'funny' | 'inspirational' = 'casual',
  includeHashtags: boolean = true
): Promise<{
  caption: string;
  hashtags: string[];
  callToAction: string;
  estimatedEngagement: string;
}> {
  const prompt = `Generate an Instagram caption for the following content:
Topic: "${topic}"
Image Type: ${imageType}
Tone: ${tone}

Requirements:
- Write an engaging caption (100-250 characters)
${includeHashtags ? '- Include 5-10 relevant hashtags' : '- No hashtags needed'}
- Add a call-to-action
- Optimize for engagement
- Return ONLY in JSON format:
{
  "caption": "the main caption text",
  "hashtags": ${includeHashtags ? '["#hashtag1", "#hashtag2", ...]' : '[]'},
  "callToAction": "engaging CTA",
  "estimatedEngagement": "<low|medium|high>"
}`;

  const response = await callGemini(prompt, { temperature: 0.8 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(`Failed to parse caption generation response: ${error}`);
  }
}
