/**
 * Example: How to use the Threads Post Generation API (F3-2)
 *
 * This example demonstrates how to generate Threads posts from
 * Instagram Reel transcription and buzz analysis.
 */

/**
 * Example 1: Generate Threads post from transcription and buzz analysis
 */
async function generateThreadsPostExample() {
  const response = await fetch('http://localhost:3000/api/generate/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcription: {
        text: 'Hey everyone! Today I want to share 3 game-changing productivity tips that helped me 10x my output. First, time blocking - I dedicate specific hours to specific tasks. Second, the 2-minute rule - if something takes less than 2 minutes, do it immediately. Third, batch similar tasks together to maintain focus. Try these out and let me know how it works for you!',
        language: 'en',
        duration: 45,
        confidence: 0.95,
      },
      buzzAnalysis: {
        buzzScore: 87,
        sentiment: 'positive',
        keyThemes: ['productivity', 'time management', 'efficiency', 'work tips'],
        recommendations: [
          'Add specific examples',
          'Include statistics or results',
          'Create urgency with limited-time offer',
        ],
        analysis:
          'High engagement potential. Productivity content performs well. The 3-tip format is proven to drive shares. Consider adding a personal success story.',
      },
      tone: 'inspirational',
      includeHashtags: true,
      includeCallToAction: true,
      maxLength: 500,
      targetAudience: 'young professionals and entrepreneurs',
    }),
  });

  const data = await response.json();
  console.log('Generated Threads Post:', data);
  return data;
}

/**
 * Example 2: Generate multiple variations
 */
async function generateThreadsVariationsExample() {
  const response = await fetch('http://localhost:3000/api/generate/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcription: {
        text: 'Sustainable fashion doesn\'t have to be expensive! Here are my top 5 budget-friendly tips: 1) Shop second-hand, 2) Quality over quantity, 3) DIY repairs, 4) Clothing swaps with friends, 5) Rent for special occasions. Small changes make a big impact!',
        language: 'en',
        duration: 30,
      },
      buzzAnalysis: {
        buzzScore: 92,
        sentiment: 'positive',
        keyThemes: ['sustainability', 'fashion', 'budget-friendly', 'eco-conscious'],
        recommendations: [
          'Include specific brand recommendations',
          'Add before/after examples',
          'Create community engagement',
        ],
        analysis:
          'Extremely high engagement potential. Sustainability + budget content is trending. List format drives saves and shares.',
      },
      tone: 'casual',
      generateVariations: true,
      variationCount: 3,
      includeHashtags: true,
    }),
  });

  const data = await response.json();
  console.log('Generated Variations:', data);
  return data;
}

/**
 * Example 3: Legacy format (backward compatibility)
 */
async function generateThreadsLegacyExample() {
  const response = await fetch('http://localhost:3000/api/generate/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'The future of AI in creative industries',
      tone: 'professional',
      style: 'technical',
      includeHashtags: true,
    }),
  });

  const data = await response.json();
  console.log('Legacy Format Response:', data);
  return data;
}

/**
 * Example 4: Using with actual workflow
 */
async function fullWorkflowExample(reelUrl: string) {
  // Step 1: Download and transcribe the reel
  const transcribeResponse = await fetch(
    'http://localhost:3000/api/reels/transcribe-url',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: reelUrl }),
    }
  );
  const transcriptionData = await transcribeResponse.json();

  // Step 2: Analyze for buzz potential
  const buzzResponse = await fetch('http://localhost:3000/api/analyze/buzz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: transcriptionData.data.transcription.text,
      views: 50000,
      likes: 3500,
      comments: 200,
      contentType: 'reel',
    }),
  });
  const buzzData = await buzzResponse.json();

  // Step 3: Generate Threads post
  const threadsResponse = await fetch(
    'http://localhost:3000/api/generate/threads',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcription: transcriptionData.data.transcription,
        buzzAnalysis: buzzData.data,
        tone: 'inspirational',
        includeHashtags: true,
      }),
    }
  );
  const threadsData = await threadsResponse.json();

  console.log('Complete Workflow Result:');
  console.log('1. Transcription:', transcriptionData);
  console.log('2. Buzz Analysis:', buzzData);
  console.log('3. Threads Post:', threadsData);
  console.log('\nReady to post:');
  console.log(threadsData.data.formattedPost);

  return threadsData;
}

/**
 * Example 5: Validate generated post
 */
async function validateThreadsPostExample() {
  const response = await fetch('http://localhost:3000/api/generate/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcription: {
        text: 'Quick cooking hack: Add a pinch of salt to your coffee grounds before brewing. It reduces bitterness and enhances flavor. Game changer!',
        language: 'en',
      },
      buzzAnalysis: {
        buzzScore: 75,
        sentiment: 'positive',
        keyThemes: ['cooking', 'life hacks', 'coffee'],
        recommendations: ['Add personal experience'],
        analysis: 'Good engagement potential for lifestyle content',
      },
    }),
  });

  const data = await response.json();

  // Check validation results
  if (data.data.metadata.validationResult.valid) {
    console.log('✅ Post is valid and ready to publish!');
    console.log('Character count:', data.data.metadata.characterCount);
    console.log('Hashtags:', data.data.post.hashtags.length);
  } else {
    console.log('❌ Post has validation errors:');
    console.log(data.data.metadata.validationResult.errors);
  }

  return data;
}

// Export examples for use
export {
  generateThreadsPostExample,
  generateThreadsVariationsExample,
  generateThreadsLegacyExample,
  fullWorkflowExample,
  validateThreadsPostExample,
};

/**
 * Usage in your application:
 *
 * import { fullWorkflowExample } from '@/examples/threads-generation-example';
 *
 * // Generate Threads post from Instagram Reel URL
 * const result = await fullWorkflowExample('https://www.instagram.com/reel/...');
 * console.log(result.data.formattedPost);
 */
