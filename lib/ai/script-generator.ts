/**
 * Reel Script Generator Module
 * AI-powered Reel script generation from transcription and buzz analysis
 * Generates structured scripts with timing, hooks, and B-roll suggestions
 *
 * F3-3: リール台本生成 (P0)
 * @module lib/ai/script-generator
 */

import { callGemini } from './gemini';

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
 * Buzz analysis data structure
 */
export interface BuzzAnalysis {
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
}

/**
 * Script section with timing information
 */
export interface ScriptSection {
  timestamp: string;
  duration: number;
  type: 'hook' | 'main' | 'transition' | 'cta';
  voiceover: string;
  visualDescription: string;
  brollSuggestion?: string;
  emphasis?: Array<{
    text: string;
    type: 'pause' | 'speed-up' | 'emphasize' | 'whisper';
  }>;
  onScreenText?: string;
}

/**
 * Generated Reel script structure
 */
export interface ReelScript {
  title: string;
  duration: number;
  hook: {
    text: string;
    duration: number;
    visualSuggestion: string;
    onScreenText?: string;
  };
  sections: ScriptSection[];
  callToAction: {
    text: string;
    duration: number;
    visualSuggestion: string;
  };
  metadata: {
    totalWordCount: number;
    estimatedPace: string;
    difficulty: 'easy' | 'medium' | 'hard';
    equipmentNeeded: string[];
    targetAudience: string;
  };
  musicSuggestion: {
    mood: string;
    tempo: 'slow' | 'medium' | 'fast';
    genres: string[];
  };
  brollList: string[];
  hashtags: string[];
  caption: string;
  pacingNotes: string[];
}

/**
 * Script generation options
 */
export interface ScriptGenerationOptions {
  duration?: 15 | 30 | 60 | 90;
  style?: 'educational' | 'entertaining' | 'motivational' | 'tutorial' | 'storytelling';
  tone?: 'professional' | 'casual' | 'energetic' | 'calm' | 'humorous';
  targetAudience?: string;
  includeSubtitles?: boolean;
  complexity?: 'simple' | 'moderate' | 'advanced';
}

/**
 * Generate Reel script from transcription and buzz analysis
 *
 * @param transcription - Original video transcription
 * @param buzzAnalysis - Buzz analysis results
 * @param options - Generation options
 * @returns Generated Reel script with detailed structure
 *
 * @example
 * ```typescript
 * const script = await generateReelScript(
 *   { text: "Original transcription...", duration: 45 },
 *   { buzzScore: 85, sentiment: 'positive', keyHooks: [...] },
 *   { duration: 30, style: 'educational' }
 * );
 * console.log(script.hook.text);
 * ```
 */
export async function generateReelScript(
  transcription: Transcription,
  buzzAnalysis: BuzzAnalysis,
  options: ScriptGenerationOptions = {}
): Promise<ReelScript> {
  // Validate inputs
  if (!transcription || !transcription.text || transcription.text.trim().length === 0) {
    throw new Error('Transcription text is required');
  }

  if (!buzzAnalysis || typeof buzzAnalysis.buzzScore !== 'number') {
    throw new Error('Valid buzz analysis is required');
  }

  // Set defaults
  const {
    duration = 30,
    style = 'entertaining',
    tone = 'casual',
    targetAudience = 'general Instagram users',
    includeSubtitles = true,
    complexity = 'moderate',
  } = options;

  // Build the generation prompt
  const prompt = buildScriptPrompt(
    transcription,
    buzzAnalysis,
    duration,
    style,
    tone,
    targetAudience,
    includeSubtitles,
    complexity
  );

  try {
    const response = await callGemini(prompt, {
      temperature: 0.7,
      maxTokens: 8192,
    });

    const script = parseScriptResponse(response, duration);
    return script;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate Reel script: ${errorMessage}`);
  }
}

/**
 * Generate multiple script variations
 *
 * @param transcription - Original video transcription
 * @param buzzAnalysis - Buzz analysis results
 * @param count - Number of variations (1-3)
 * @param options - Generation options
 * @returns Array of script variations
 */
export async function generateScriptVariations(
  transcription: Transcription,
  buzzAnalysis: BuzzAnalysis,
  count: number = 3,
  options: ScriptGenerationOptions = {}
): Promise<ReelScript[]> {
  if (count < 1 || count > 3) {
    throw new Error('Count must be between 1 and 3');
  }

  const styles: Array<'educational' | 'entertaining' | 'motivational'> = [
    'entertaining',
    'educational',
    'motivational',
  ];

  const variations: ReelScript[] = [];

  for (let i = 0; i < count; i++) {
    const style = styles[i] || 'entertaining';
    const script = await generateReelScript(transcription, buzzAnalysis, {
      ...options,
      style,
    });
    variations.push(script);
  }

  return variations;
}

/**
 * Build the script generation prompt
 */
function buildScriptPrompt(
  transcription: Transcription,
  buzzAnalysis: BuzzAnalysis,
  duration: number,
  style: string,
  tone: string,
  targetAudience: string,
  includeSubtitles: boolean,
  complexity: string
): string {
  // Extract key hooks from buzz analysis
  const keyHooks = buzzAnalysis.keyHooks
    ? buzzAnalysis.keyHooks
        .slice(0, 3)
        .map((h) => `- ${h.text} (${h.hookType}, strength: ${h.strength}/10)`)
        .join('\n')
    : 'None identified';

  // Extract trending topics
  const trendingTopics = buzzAnalysis.trendingTopics
    ? buzzAnalysis.trendingTopics
        .slice(0, 3)
        .map((t) => `- ${t.topic} (relevance: ${t.relevance}%)`)
        .join('\n')
    : 'None identified';

  // Build context
  const buzzContext = `
Buzz Score: ${buzzAnalysis.buzzScore}/100
Viral Potential: ${buzzAnalysis.viralPotential || 'medium'}
Sentiment: ${buzzAnalysis.sentiment}
Key Themes: ${buzzAnalysis.keyThemes?.join(', ') || 'N/A'}
Analysis: ${buzzAnalysis.analysis || 'No detailed analysis available'}
`.trim();

  return `You are an expert Instagram Reels script writer specializing in viral content creation.

Create a new Reel script based on the following analysis of a successful Reel:

**ORIGINAL TRANSCRIPTION:**
"${transcription.text}"
${transcription.duration ? `Original Duration: ${transcription.duration}s` : ''}

**BUZZ ANALYSIS:**
${buzzContext}

**KEY HOOKS IDENTIFIED:**
${keyHooks}

**TRENDING TOPICS:**
${trendingTopics}

**TARGET SCRIPT SPECIFICATIONS:**
- Duration: ${duration} seconds
- Style: ${style}
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Complexity: ${complexity}
- Include on-screen text: ${includeSubtitles ? 'Yes' : 'No'}

**REQUIREMENTS:**
1. Create a NEW script inspired by the original, not a copy
2. Hook (first 3 seconds): Must grab attention immediately
3. Main content: ${Math.floor((duration - 8) / 5)} sections of ~5 seconds each
4. Call-to-action (last 5 seconds): Clear and compelling CTA
5. Include visual descriptions and B-roll suggestions
6. Add pacing notes and emphasis markers
7. Suggest on-screen text for key moments
8. Provide music mood and tempo suggestions
9. Optimize for retention and engagement

**PACING GUIDELINES:**
- Speaking pace: ~150 words per minute for ${tone} tone
- Total words for ${duration}s: ~${Math.floor(duration * 2.5)} words
- First 3 seconds: Maximum impact, minimum words
- Middle sections: Maintain rhythm, vary energy
- Last 5 seconds: Punchy CTA, leave them wanting more

**Return ONLY valid JSON in this exact format:**
{
  "title": "Catchy title for the Reel",
  "duration": ${duration},
  "hook": {
    "text": "Opening hook voiceover (max 10 words)",
    "duration": 3,
    "visualSuggestion": "Detailed visual description for first 3 seconds",
    "onScreenText": "Optional punchy text overlay"
  },
  "sections": [
    {
      "timestamp": "0:03-0:08",
      "duration": 5,
      "type": "main|transition",
      "voiceover": "What to say in this section",
      "visualDescription": "What the viewer sees",
      "brollSuggestion": "Optional B-roll footage idea",
      "emphasis": [
        {"text": "word or phrase", "type": "pause|speed-up|emphasize|whisper"}
      ],
      "onScreenText": "Optional text overlay"
    }
  ],
  "callToAction": {
    "text": "Final CTA voiceover",
    "duration": 5,
    "visualSuggestion": "How to end the video visually"
  },
  "metadata": {
    "totalWordCount": <number>,
    "estimatedPace": "X words per minute",
    "difficulty": "easy|medium|hard",
    "equipmentNeeded": ["camera", "tripod", "ring light", etc.],
    "targetAudience": "description"
  },
  "musicSuggestion": {
    "mood": "upbeat|calm|dramatic|energetic",
    "tempo": "slow|medium|fast",
    "genres": ["pop", "electronic", "acoustic", etc.]
  },
  "brollList": [
    "B-roll shot 1",
    "B-roll shot 2",
    "B-roll shot 3"
  ],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "caption": "Engaging Instagram caption for the Reel",
  "pacingNotes": [
    "Pacing tip 1",
    "Pacing tip 2",
    "Pacing tip 3"
  ]
}

**CRITICAL INSTRUCTIONS:**
- Use the buzz analysis insights to maximize viral potential
- Incorporate the strongest hooks from the analysis
- Leverage trending topics where relevant
- Create a UNIQUE script, don't just reformat the original
- Ensure timing adds up to exactly ${duration} seconds
- Make every second count for retention
- Return ONLY the JSON object, no markdown, no additional text`;
}

/**
 * Parse the AI response into structured script data
 */
function parseScriptResponse(response: string, duration: number): ReelScript {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('Missing or invalid title');
    }

    if (!parsed.hook || !parsed.hook.text) {
      throw new Error('Missing or invalid hook');
    }

    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      throw new Error('Missing or invalid sections');
    }

    if (!parsed.callToAction || !parsed.callToAction.text) {
      throw new Error('Missing or invalid callToAction');
    }

    // Build structured script with defaults
    const script: ReelScript = {
      title: parsed.title,
      duration: parsed.duration || duration,
      hook: {
        text: parsed.hook.text,
        duration: parsed.hook.duration || 3,
        visualSuggestion: parsed.hook.visualSuggestion || 'Eye-catching opening visual',
        onScreenText: parsed.hook.onScreenText,
      },
      sections: parsed.sections.map((section: unknown) => {
        const s = section as Record<string, unknown>;
        return {
          timestamp: s.timestamp || '0:00-0:05',
          duration: s.duration || 5,
          type: s.type || 'main',
          voiceover: s.voiceover || '',
          visualDescription: s.visualDescription || 'Visual content',
          brollSuggestion: s.brollSuggestion,
          emphasis: Array.isArray(s.emphasis) ? s.emphasis : [],
          onScreenText: s.onScreenText,
        };
      }),
      callToAction: {
        text: parsed.callToAction.text,
        duration: parsed.callToAction.duration || 5,
        visualSuggestion: parsed.callToAction.visualSuggestion || 'Strong closing visual',
      },
      metadata: {
        totalWordCount: parsed.metadata?.totalWordCount || 0,
        estimatedPace: parsed.metadata?.estimatedPace || '150 words per minute',
        difficulty: ['easy', 'medium', 'hard'].includes(parsed.metadata?.difficulty)
          ? parsed.metadata.difficulty
          : 'medium',
        equipmentNeeded: Array.isArray(parsed.metadata?.equipmentNeeded)
          ? parsed.metadata.equipmentNeeded
          : ['smartphone camera'],
        targetAudience: parsed.metadata?.targetAudience || 'General audience',
      },
      musicSuggestion: {
        mood: parsed.musicSuggestion?.mood || 'upbeat',
        tempo: ['slow', 'medium', 'fast'].includes(parsed.musicSuggestion?.tempo)
          ? parsed.musicSuggestion.tempo
          : 'medium',
        genres: Array.isArray(parsed.musicSuggestion?.genres)
          ? parsed.musicSuggestion.genres
          : ['pop'],
      },
      brollList: Array.isArray(parsed.brollList) ? parsed.brollList : [],
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      caption: parsed.caption || '',
      pacingNotes: Array.isArray(parsed.pacingNotes) ? parsed.pacingNotes : [],
    };

    return script;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse script response: ${errorMessage}`);
  }
}

/**
 * Format script for display/export
 *
 * @param script - Generated script
 * @returns Formatted string representation
 */
export function formatScript(script: ReelScript): string {
  let formatted = `# ${script.title}\n\n`;
  formatted += `**Duration:** ${script.duration}s\n`;
  formatted += `**Style:** ${script.metadata.difficulty} | **Pace:** ${script.metadata.estimatedPace}\n\n`;

  formatted += `## Hook (0:00-0:03)\n`;
  formatted += `**Voiceover:** ${script.hook.text}\n`;
  formatted += `**Visual:** ${script.hook.visualSuggestion}\n`;
  if (script.hook.onScreenText) {
    formatted += `**On-Screen Text:** ${script.hook.onScreenText}\n`;
  }
  formatted += `\n`;

  formatted += `## Main Content\n\n`;
  script.sections.forEach((section, index) => {
    formatted += `### Section ${index + 1} (${section.timestamp})\n`;
    formatted += `**Voiceover:** ${section.voiceover}\n`;
    formatted += `**Visual:** ${section.visualDescription}\n`;
    if (section.brollSuggestion) {
      formatted += `**B-Roll:** ${section.brollSuggestion}\n`;
    }
    if (section.onScreenText) {
      formatted += `**On-Screen Text:** ${section.onScreenText}\n`;
    }
    if (section.emphasis && section.emphasis.length > 0) {
      formatted += `**Emphasis:** ${section.emphasis.map((e: { text: string; type: string }) => `${e.text} (${e.type})`).join(', ')}\n`;
    }
    formatted += `\n`;
  });

  formatted += `## Call to Action (Last ${script.callToAction.duration}s)\n`;
  formatted += `**Voiceover:** ${script.callToAction.text}\n`;
  formatted += `**Visual:** ${script.callToAction.visualSuggestion}\n\n`;

  formatted += `## Music Suggestion\n`;
  formatted += `**Mood:** ${script.musicSuggestion.mood}\n`;
  formatted += `**Tempo:** ${script.musicSuggestion.tempo}\n`;
  formatted += `**Genres:** ${script.musicSuggestion.genres.join(', ')}\n\n`;

  if (script.brollList.length > 0) {
    formatted += `## B-Roll Shots Needed\n`;
    script.brollList.forEach((broll, index) => {
      formatted += `${index + 1}. ${broll}\n`;
    });
    formatted += `\n`;
  }

  if (script.pacingNotes.length > 0) {
    formatted += `## Pacing Notes\n`;
    script.pacingNotes.forEach((note, index) => {
      formatted += `${index + 1}. ${note}\n`;
    });
    formatted += `\n`;
  }

  formatted += `## Caption\n${script.caption}\n\n`;
  formatted += `## Hashtags\n${script.hashtags.join(' ')}\n\n`;

  formatted += `## Equipment Needed\n`;
  script.metadata.equipmentNeeded.forEach((item, index) => {
    formatted += `${index + 1}. ${item}\n`;
  });

  return formatted;
}

/**
 * Validate script structure and timing
 *
 * @param script - Script to validate
 * @returns Validation result with errors if any
 */
export function validateScript(script: ReelScript): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!script.title || script.title.length === 0) {
    errors.push('Script title is required');
  }

  if (!script.hook || !script.hook.text) {
    errors.push('Hook is required');
  }

  if (!script.sections || script.sections.length === 0) {
    errors.push('At least one content section is required');
  }

  if (!script.callToAction || !script.callToAction.text) {
    errors.push('Call to action is required');
  }

  // Check timing
  const totalTime =
    script.hook.duration +
    script.sections.reduce((sum, s) => sum + s.duration, 0) +
    script.callToAction.duration;

  if (Math.abs(totalTime - script.duration) > 2) {
    errors.push(
      `Total section time (${totalTime}s) doesn't match script duration (${script.duration}s)`
    );
  }

  // Check word count
  if (script.metadata.totalWordCount === 0) {
    warnings.push('Word count is 0, script may be incomplete');
  }

  // Check pacing
  const targetWordsPerSecond = 2.5;
  const expectedWords = Math.floor(script.duration * targetWordsPerSecond);
  const wordCountDiff = Math.abs(script.metadata.totalWordCount - expectedWords);

  if (wordCountDiff > expectedWords * 0.3) {
    warnings.push(
      `Word count (${script.metadata.totalWordCount}) significantly differs from expected (${expectedWords}) for ${script.duration}s`
    );
  }

  // Check hashtags
  if (script.hashtags.length > 30) {
    warnings.push(`Too many hashtags (${script.hashtags.length}), Instagram recommends 3-5`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
