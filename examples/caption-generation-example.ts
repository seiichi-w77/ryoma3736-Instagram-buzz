/**
 * Caption Generation Example - Issue #25 Implementation
 *
 * This example demonstrates how to use the caption generation API
 * with transcription and buzz analysis data.
 */

import { generateInstagramCaption, type BuzzAnalysis, type Transcription } from '../lib/ai/caption-generator';

async function main() {
  console.log('🎬 Instagram Caption Generation Example\n');

  // Example 1: Basic caption generation
  console.log('Example 1: Basic AI productivity reel caption');
  console.log('─'.repeat(60));

  const transcription1: Transcription = {
    text: 'Hey everyone! Today I want to share 3 amazing AI productivity hacks that literally changed my life. First, use ChatGPT to automate your email responses. Second, use Notion AI for meeting notes. And third, use AI image generators to create stunning social media content in seconds!',
    language: 'en',
    duration: 45,
  };

  const buzzAnalysis1: BuzzAnalysis = {
    buzzScore: 85,
    sentiment: 'positive',
    viralPotential: 'high',
    keyThemes: ['AI', 'productivity', 'automation'],
    keyHooks: [
      {
        text: '3 amazing AI productivity hacks that literally changed my life',
        hookType: 'curiosity',
        strength: 9,
      },
    ],
    trendingTopics: [
      { topic: 'AI productivity', relevance: 95, trendStrength: 'trending' },
      { topic: 'ChatGPT', relevance: 90, trendStrength: 'hot' },
    ],
    recommendations: ['Emphasize the transformation', 'Use social proof'],
  };

  try {
    const caption1 = await generateInstagramCaption(transcription1, buzzAnalysis1, {
      style: 'educational',
      hashtagCount: 25,
      includeEmojis: true,
      includeCallToAction: true,
    });

    console.log('\n✅ Generated Caption:');
    console.log(caption1.caption);
    console.log('\n📊 Metadata:');
    console.log(`  Style: ${caption1.style}`);
    console.log(`  Character Count: ${caption1.characterCount}`);
    console.log(`  Hashtag Count: ${caption1.hashtagCount}`);
    console.log(`  Estimated Engagement: ${caption1.estimatedEngagement}`);
    console.log('\n🏷️  Hashtags:');
    console.log(caption1.hashtags.slice(0, 10).join(' '), '...');
    console.log('\n📣 Call to Action:');
    console.log(caption1.callToAction);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }

  console.log('\n' + '─'.repeat(60) + '\n');

  // Example 2: Storytelling style caption
  console.log('Example 2: Storytelling style caption');
  console.log('─'.repeat(60));

  const transcription2: Transcription = {
    text: 'I remember when I started my business 5 years ago. I had no idea what I was doing. But I learned one important lesson: consistency beats perfection every single time.',
    language: 'en',
    duration: 30,
  };

  const buzzAnalysis2: BuzzAnalysis = {
    buzzScore: 92,
    sentiment: 'inspirational',
    viralPotential: 'very-high',
    keyThemes: ['entrepreneurship', 'motivation', 'personal-growth'],
    keyHooks: [
      {
        text: 'consistency beats perfection',
        hookType: 'wisdom',
        strength: 10,
      },
    ],
  };

  try {
    const caption2 = await generateInstagramCaption(transcription2, buzzAnalysis2, {
      style: 'storytelling',
      hashtagCount: 20,
      includeEmojis: true,
      targetAudience: 'aspiring entrepreneurs',
      brandVoice: 'authentic and vulnerable',
    });

    console.log('\n✅ Generated Caption:');
    console.log(caption2.caption);
    console.log('\n📊 Metadata:');
    console.log(`  Style: ${caption2.style}`);
    console.log(`  Character Count: ${caption2.characterCount}`);
    console.log(`  Estimated Engagement: ${caption2.estimatedEngagement}`);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }

  console.log('\n' + '─'.repeat(60) + '\n');

  // Example 3: API Request format
  console.log('Example 3: API Request Format (POST /api/generate/caption)');
  console.log('─'.repeat(60));

  const apiRequest = {
    transcription: {
      text: 'Your reel transcription text here',
      language: 'en',
      duration: 45,
    },
    buzzAnalysis: {
      buzzScore: 85,
      sentiment: 'positive',
      viralPotential: 'high',
      keyThemes: ['topic1', 'topic2'],
    },
    style: 'conversational',
    hashtagCount: 25,
    includeEmojis: true,
    includeHashtags: true,
    maxLength: 2200,
  };

  console.log('\n📤 Request Body:');
  console.log(JSON.stringify(apiRequest, null, 2));

  console.log('\n📥 Expected Response:');
  console.log(`{
  "status": "success",
  "data": {
    "caption": {
      "caption": "🔥 Your engaging caption text here...\\n\\nSave this for later!",
      "hook": "🔥 Your engaging caption text here...",
      "hashtags": ["#topic1", "#topic2", "..."],
      "callToAction": "Save this for later!",
      "characterCount": 123,
      "hashtagCount": 25,
      "estimatedEngagement": "high",
      "style": "conversational"
    },
    "formattedCaption": "Full caption with hashtags...",
    "metadata": {
      "characterCount": 123,
      "hashtagCount": 25,
      "style": "conversational",
      "usedTranscription": true,
      "usedBuzzAnalysis": true,
      "validationResult": {
        "valid": true,
        "errors": [],
        "warnings": []
      }
    }
  },
  "timestamp": "2025-11-25T00:00:00.000Z"
}`);

  console.log('\n' + '─'.repeat(60) + '\n');
  console.log('✨ Caption generation examples complete!');
  console.log('\n📝 Notes:');
  console.log('  - Maximum caption length: 2,200 characters (Instagram limit)');
  console.log('  - Recommended hashtags: 20-30 for maximum reach');
  console.log('  - Supported styles: storytelling, educational, promotional,');
  console.log('    conversational, inspirational, humorous');
  console.log('  - The API uses Gemini AI (gemini-1.5-flash model)');
  console.log('  - Requires GOOGLE_AI_API_KEY or GEMINI_API_KEY in environment');
}

// Run the examples
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
