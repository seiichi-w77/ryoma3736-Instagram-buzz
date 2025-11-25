/**
 * Claude API integration module
 * Handles communication with Anthropic's Claude API for content analysis and generation
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-opus-4-1-20250805';
const MAX_TOKENS = 4096;

interface ClaudeRequestOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Makes a request to Claude API
 * @param prompt The prompt to send to Claude
 * @param options Configuration options for the request
 * @returns The response text from Claude
 */
export async function callClaude(
  prompt: string,
  options: ClaudeRequestOptions = {}
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const requestBody = {
    model: options.model || CLAUDE_MODEL,
    max_tokens: options.maxTokens || MAX_TOKENS,
    temperature: options.temperature ?? 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Claude API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data: ClaudeResponse = await response.json();
    const textContent = data.content.find((c) => c.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textContent.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to call Claude API: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Analyzes buzz metrics for content
 * @param content The content to analyze
 * @param metrics Engagement metrics to analyze
 * @returns Analysis results
 */
export async function analyzeBuzz(
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
    .filter(([_, v]) => v !== undefined)
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
}`;

  const response = await callClaude(prompt, { temperature: 0.3 });

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
 * Generates Threads post content
 * @param topic The topic to write about
 * @param tone The tone for the content
 * @param style The style preference
 * @returns Generated Threads content
 */
export async function generateThreads(
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
- Return in JSON format:
{
  "thread": ["part1", "part2", ...],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "callToAction": "engaging call to action"
}`;

  const response = await callClaude(prompt, { temperature: 0.8 });

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
 * Generates Reel script content
 * @param topic The topic for the reel
 * @param duration Duration in seconds
 * @param style The style of content
 * @returns Generated Reel script
 */
export async function generateReelScript(
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
- Format as JSON:
{
  "script": "full script text",
  "pacing": [
    {"timeRange": "0-5s", "description": "visual description", "voiceover": "optional voiceover"},
    ...
  ],
  "musicSuggestion": "type of music that would fit",
  "transitionTips": ["transition idea 1", "transition idea 2", ...]
}`;

  const response = await callClaude(prompt, { temperature: 0.7 });

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
 * Generates Instagram caption
 * @param topic The topic for the caption
 * @param imageType Type of image content
 * @param tone Tone of the caption
 * @param includeHashtags Whether to include hashtags
 * @returns Generated caption
 */
export async function generateCaption(
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
- Return as JSON:
{
  "caption": "the main caption text",
  "hashtags": ${includeHashtags ? '["#hashtag1", "#hashtag2", ...]' : '[]'},
  "callToAction": "engaging CTA",
  "estimatedEngagement": "<low|medium|high>"
}`;

  const response = await callClaude(prompt, { temperature: 0.8 });

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
