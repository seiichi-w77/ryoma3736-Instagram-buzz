/**
 * Prompt templates for Instagram content generation and analysis
 * Provides reusable, well-crafted prompts for Claude API
 */

/**
 * Buzz analysis prompt template
 */
export const BUZZ_ANALYSIS_PROMPT = `You are an Instagram expert analyzing content for viral potential.

Analyze the following content and metrics:
Content: {content}
Likes: {likes}
Comments: {comments}
Shares: {shares}
Views: {views}
Hashtags: {hashtags}

Provide analysis in this exact JSON format:
{{
  "buzzScore": <0-100>,
  "sentiment": "<positive|negative|neutral>",
  "virality": "<low|medium|high>",
  "targetAudience": "<description>",
  "keyThemes": [<themes>],
  "successFactors": [<factors>],
  "improvements": [<suggestions>],
  "estimatedReach": "<number>",
  "recommendedPostingTime": "<time>"
}}`;

/**
 * Threads generation prompt template
 */
export const THREADS_GENERATION_PROMPT = `You are an expert content creator specializing in Threads (Meta's Twitter alternative).

Create an engaging Threads post about: {topic}

Specifications:
- Tone: {tone}
- Style: {style}
- Each post max 280 characters
- Create 5-8 connected posts
- Make it engaging and shareable
- Include appropriate threading

Return in this exact JSON format:
{{
  "thread": [
    "post_1_text",
    "post_2_text",
    "..."
  ],
  "hashtags": ["#tag1", "#tag2"],
  "callToAction": "specific_action",
  "threadTip": "tip_for_engagement"
}}`;

/**
 * Reel script generation prompt template
 */
export const REEL_SCRIPT_PROMPT = `You are a professional video content creator and scriptwriter.

Create a ${"{duration}"}–second Reel script about: {topic}

Style: {style}
Target Platform: Instagram Reels
Pacing: {duration}s (roughly 1-2 sentences per 5 seconds)

Script Requirements:
- Include visual descriptions
- Add voiceover timing
- Suggest transitions
- Include on-screen text suggestions
- Music mood recommendation

Return in this exact JSON format:
{{
  "title": "reel_title",
  "script": "full_narrative_script",
  "scenes": [
    {{
      "time": "0-5s",
      "visual": "description",
      "voiceover": "what_to_say",
      "onScreenText": "optional_text",
      "transition": "type_of_transition"
    }},
    ...
  ],
  "musicMood": "upbeat|calm|energetic|inspiring",
  "musicSuggestions": ["song1", "song2"],
  "hashtags": ["#tag1", "#tag2"],
  "tips": ["engagement_tip1", "engagement_tip2"]
}}`;

/**
 * Caption generation prompt template
 */
export const CAPTION_GENERATION_PROMPT = `You are an Instagram caption expert.

Generate a caption for this Instagram post:
Topic: {topic}
Post Type: {postType}
Tone: {tone}
Image Mood: {imageMood}

Specifications:
- Engaging and authentic
- 100-250 characters (optimal for engagement)
- Include call-to-action
- Research-backed engagement techniques
- Hook in first sentence

Return in this exact JSON format:
{{
  "caption": "main_caption_text",
  "hookLine": "first_line_grabber",
  "callToAction": "specific_action_to_take",
  "hashtags": {{"primary": ["#tag1", "#tag2"], "secondary": ["#tag3", "#tag4"]}},
  "estimatedEngagementRate": "<percentage>",
  "engagementTips": ["tip1", "tip2"],
  "postPairingSuggestions": [
    {{
      "type": "carousel_image",
      "description": "next_slide_idea"
    }}
  ]
}}`;

/**
 * Hashtag research and optimization prompt
 */
export const HASHTAG_RESEARCH_PROMPT = `You are a hashtag strategy expert for Instagram.

Analyze hashtags for: {topic}
Target Audience: {targetAudience}
Current Size: {accountSize}
Engagement Level: {engagementLevel}

Return in this exact JSON format:
{{
  "trending": ["#trend1", "#trend2"],
  "niche": ["#niche1", "#niche2"],
  "branded": ["#brand1"],
  "strategy": {{
    "recommended": 20,
    "breakdown": {{
      "trending": 5,
      "niche": 10,
      "branded": 5
    }}
  }},
  "timing": "best_posting_time",
  "notes": "strategy_notes"
}}`;

/**
 * Engagement analysis and improvement prompt
 */
export const ENGAGEMENT_ANALYSIS_PROMPT = `You are an Instagram engagement strategist.

Analyze this post's engagement:
Post Type: {postType}
Engagement: {engagement}
Reach: {reach}
Comments: {comments}
Saves: {saves}
Shares: {shares}

Return in this exact JSON format:
{{
  "engagementRate": "<percentage>",
  "performance": "<below|average|above>_expectations",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": {{
    "caption": "suggestion",
    "timing": "suggestion",
    "contentStyle": "suggestion"
  }},
  "predictedPerformance": {{
    "bestTimeToPost": "time",
    "estimatedReach": "number",
    "expectedEngagementRate": "percentage"
  }}
}}`;

/**
 * Audience analysis and insights prompt
 */
export const AUDIENCE_ANALYSIS_PROMPT = `You are an Instagram audience analysis expert.

Analyze audience for account: {accountInfo}
Demographics: {demographics}
Interests: {interests}
Engagement Patterns: {engagementPatterns}

Return in this exact JSON format:
{{
  "primaryAudience": "description",
  "demographics": {{
    "ageRange": "range",
    "location": "location",
    "interests": ["interest1", "interest2"]
  }},
  "contentPreferences": [
    {{
      "type": "type",
      "preference": "high|medium|low",
      "reasoning": "why"
    }}
  ],
  "growthOpportunities": [
    {{
      "segment": "audience_segment",
      "strategy": "how_to_reach"
    }}
  ],
  "contentCalendar": {{
    "bestDays": ["monday", "wednesday"],
    "bestTimes": ["8am", "7pm"],
    "contentMix": "suggested_content_distribution"
  }}
}}`;

/**
 * Format a buzz analysis prompt with variables
 */
export function formatBuzzAnalysisPrompt(params: {
  content: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  hashtags?: string[];
}): string {
  let prompt = BUZZ_ANALYSIS_PROMPT;
  prompt = prompt.replace('{content}', params.content);
  prompt = prompt.replace('{likes}', params.likes?.toString() || '0');
  prompt = prompt.replace('{comments}', params.comments?.toString() || '0');
  prompt = prompt.replace('{shares}', params.shares?.toString() || '0');
  prompt = prompt.replace('{views}', params.views?.toString() || '0');
  prompt = prompt.replace(
    '{hashtags}',
    params.hashtags?.join(', ') || 'None'
  );
  return prompt;
}

/**
 * Format a threads generation prompt with variables
 */
export function formatThreadsGenerationPrompt(params: {
  topic: string;
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
  style?: 'technical' | 'storytelling' | 'quick-tips';
}): string {
  let prompt = THREADS_GENERATION_PROMPT;
  prompt = prompt.replace('{topic}', params.topic);
  prompt = prompt.replace('{tone}', params.tone || 'casual');
  prompt = prompt.replace('{style}', params.style || 'storytelling');
  return prompt;
}

/**
 * Format a reel script generation prompt with variables
 */
export function formatReelScriptPrompt(params: {
  topic: string;
  duration?: number;
  style?: 'educational' | 'entertaining' | 'tutorial' | 'motivational';
}): string {
  let prompt = REEL_SCRIPT_PROMPT;
  prompt = prompt.replace('{topic}', params.topic);
  prompt = prompt.replace(/{duration}/g, params.duration?.toString() || '30');
  prompt = prompt.replace('{style}', params.style || 'entertaining');
  return prompt;
}

/**
 * Format a caption generation prompt with variables
 */
export function formatCaptionGenerationPrompt(params: {
  topic: string;
  postType?: 'carousel' | 'reel' | 'story' | 'feed' | 'igtv';
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
  imageMood?: string;
}): string {
  let prompt = CAPTION_GENERATION_PROMPT;
  prompt = prompt.replace('{topic}', params.topic);
  prompt = prompt.replace('{postType}', params.postType || 'feed');
  prompt = prompt.replace('{tone}', params.tone || 'casual');
  prompt = prompt.replace('{imageMood}', params.imageMood || 'engaging');
  return prompt;
}

/**
 * Format a hashtag research prompt with variables
 */
export function formatHashtagResearchPrompt(params: {
  topic: string;
  targetAudience?: string;
  accountSize?: string;
  engagementLevel?: string;
}): string {
  let prompt = HASHTAG_RESEARCH_PROMPT;
  prompt = prompt.replace('{topic}', params.topic);
  prompt = prompt.replace('{targetAudience}', params.targetAudience || 'general');
  prompt = prompt.replace('{accountSize}', params.accountSize || 'medium');
  prompt = prompt.replace('{engagementLevel}', params.engagementLevel || 'average');
  return prompt;
}
