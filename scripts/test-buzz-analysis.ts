#!/usr/bin/env tsx
/**
 * Buzz Analysis Test Script
 * Tests the buzz analysis functionality with sample transcriptions
 *
 * Usage:
 *   npx tsx scripts/test-buzz-analysis.ts
 */

import { analyzeBuzzPotential, analyzeTranscriptSimplified, quickBuzzScore } from '../lib/ai/buzz-analyzer';

// Sample Japanese transcription
const sampleTranscriptionJA = `
今日は誰でもできる超簡単なAI活用術を紹介します！
これを知らないと本当に損しますよ。
たった3分で作業時間が半分になる方法、知りたくないですか？
実は、このツールを使うだけで驚くほど効率が上がるんです。
具体的な数字で言うと、1時間かかっていた作業が30分に。
みなさんもぜひ試してみてください！
コメント欄で結果を教えてくださいね。
`;

const sampleTranscriptionEN = `
Check this out! You won't believe what happens next...
This amazing productivity hack will change your life.
In just 3 minutes, you'll learn the secret that took me years to discover.
Are you ready? Let's dive in!
`;

async function testBuzzAnalysis() {
  console.log('🚀 Testing Buzz Analysis Functionality\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Quick Buzz Score
    console.log('\n📊 Test 1: Quick Buzz Score (Japanese)');
    console.log('-'.repeat(60));
    const quickScore = await quickBuzzScore(sampleTranscriptionJA);
    console.log(`✅ Quick Buzz Score: ${quickScore}/100`);

    // Test 2: Simplified Analysis (Issue #22 Format)
    console.log('\n🎯 Test 2: Simplified Analysis (Issue #22 Format)');
    console.log('-'.repeat(60));
    const simplified = await analyzeTranscriptSimplified(sampleTranscriptionJA, 'reel');
    console.log('✅ Simplified Analysis Result:');
    console.log(JSON.stringify(simplified, null, 2));

    // Test 3: Full Analysis
    console.log('\n🔍 Test 3: Full Comprehensive Analysis');
    console.log('-'.repeat(60));
    const fullAnalysis = await analyzeBuzzPotential(sampleTranscriptionJA, {
      contentType: 'reel',
      includeCompetitorAnalysis: true,
    });
    console.log('✅ Full Analysis Result:');
    console.log(`   Buzz Score: ${fullAnalysis.buzzScore}/100`);
    console.log(`   Sentiment: ${fullAnalysis.sentiment}`);
    console.log(`   Viral Potential: ${fullAnalysis.viralPotential}`);
    console.log(`   Key Hooks: ${fullAnalysis.keyHooks.length} found`);
    fullAnalysis.keyHooks.forEach((hook, i) => {
      console.log(`     ${i + 1}. [${hook.hookType}] ${hook.text.substring(0, 50)}... (strength: ${hook.strength}/10)`);
    });
    console.log(`   Trending Topics: ${fullAnalysis.trendingTopics.length} found`);
    fullAnalysis.trendingTopics.forEach((topic, i) => {
      console.log(`     ${i + 1}. ${topic.topic} (${topic.trendStrength}, relevance: ${topic.relevance}%)`);
    });
    console.log(`   Recommendations: ${fullAnalysis.recommendations.length} provided`);
    fullAnalysis.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`     ${i + 1}. [${rec.priority}] ${rec.suggestion}`);
    });

    // Test 4: English Content
    console.log('\n🌎 Test 4: English Content Analysis');
    console.log('-'.repeat(60));
    const englishScore = await quickBuzzScore(sampleTranscriptionEN);
    console.log(`✅ English Content Buzz Score: ${englishScore}/100`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testBuzzAnalysis().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
