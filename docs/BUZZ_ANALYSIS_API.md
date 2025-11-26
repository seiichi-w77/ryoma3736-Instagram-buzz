# Buzz Analysis API Documentation

## Overview

The Buzz Analysis feature (F3-1) provides AI-powered analysis of Instagram Reel transcriptions to identify viral potential, key hooks, and trending topics.

## Implementation

### Files Created/Modified

1. **`/lib/ai/buzz-analyzer.ts`** (NEW - 416 lines)
   - Core buzz analysis module
   - AI-powered analysis using Gemini API
   - Multiple analysis functions for different use cases

2. **`/app/api/analyze/buzz/route.ts`** (UPDATED - 288 lines)
   - Enhanced API endpoint with multiple analysis modes
   - Support for transcription-based analysis
   - Backward compatible with existing functionality

## API Endpoint

### POST /api/analyze/buzz

Analyzes Instagram Reel transcription for buzz potential and viral factors.

#### Request Body

```json
{
  "transcription": "Your video transcription text here...",
  "contentType": "reel",
  "analysisMode": "full",
  "views": 50000,
  "likes": 5000,
  "comments": 150,
  "shares": 80,
  "accountInfo": {
    "followerCount": 10000,
    "avgEngagementRate": 5.2,
    "niche": "lifestyle"
  }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transcription` | string | Yes* | Video transcription text (1-10000 chars) |
| `content` | string | Yes* | Alternative to transcription |
| `analysisMode` | string | No | Analysis mode: `full`, `quick`, `hooks-only`, `trends-only` |
| `contentType` | string | No | Content type: `reel`, `post`, `story`, `carousel` |
| `views` | number | No | Current view count |
| `likes` | number | No | Current like count |
| `comments` | number | No | Current comment count |
| `shares` | number | No | Current share count |
| `accountInfo` | object | No | Account context for better analysis |

*Either `transcription` or `content` must be provided.

#### Response Formats

##### Full Analysis Mode (default)

```json
{
  "status": "success",
  "analysisMode": "full",
  "data": {
    "buzzScore": 78,
    "sentiment": "positive",
    "viralPotential": "high",
    "keyHooks": [
      {
        "text": "You won't believe what happens next",
        "timestamp": "0:03",
        "hookType": "curiosity",
        "strength": 9
      }
    ],
    "trendingTopics": [
      {
        "topic": "life hacks",
        "relevance": 85,
        "trendStrength": "trending"
      }
    ],
    "contentStructure": {
      "openingStrength": 8,
      "retentionFactors": ["strong hook", "fast pacing", "visual appeal"],
      "callToActionPresent": true,
      "pacing": "good"
    },
    "targetAudience": {
      "primaryDemographic": "Young adults interested in productivity",
      "ageRange": "18-35",
      "interests": ["productivity", "life hacks", "self-improvement"]
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "content",
        "suggestion": "Add more emotional storytelling in the first 3 seconds",
        "expectedImpact": "Could increase retention by 15-20%"
      }
    ],
    "predictedMetrics": {
      "estimatedViews": "50K-100K",
      "estimatedEngagementRate": "6-8%",
      "viralityProbability": 78
    }
  },
  "timestamp": "2025-11-26T00:15:00.000Z"
}
```

##### Quick Analysis Mode

```json
{
  "status": "success",
  "analysisMode": "quick",
  "data": {
    "buzzScore": 78
  },
  "timestamp": "2025-11-26T00:15:00.000Z"
}
```

##### Hooks-Only Mode

```json
{
  "status": "success",
  "analysisMode": "hooks-only",
  "data": {
    "keyHooks": [
      {
        "text": "Check this out!",
        "hookType": "curiosity",
        "strength": 7
      }
    ]
  },
  "timestamp": "2025-11-26T00:15:00.000Z"
}
```

##### Trends-Only Mode

```json
{
  "status": "success",
  "analysisMode": "trends-only",
  "data": {
    "trendingTopics": [
      {
        "topic": "AI automation",
        "relevance": 92,
        "trendStrength": "viral"
      }
    ]
  },
  "timestamp": "2025-11-26T00:15:00.000Z"
}
```

## Usage Examples

### Example 1: Full Analysis with Transcription

```bash
curl -X POST http://localhost:3000/api/analyze/buzz \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "Watch how I transformed my morning routine in just 30 days! The results will shock you. Here'\''s what I did every single day...",
    "contentType": "reel",
    "views": 50000,
    "likes": 5000,
    "analysisMode": "full"
  }'
```

### Example 2: Quick Buzz Score

```bash
curl -X POST http://localhost:3000/api/analyze/buzz \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "Amazing productivity hack everyone needs to know!",
    "analysisMode": "quick"
  }'
```

### Example 3: Extract Key Hooks

```bash
curl -X POST http://localhost:3000/api/analyze/buzz \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "The secret to viral content is actually simpler than you think. Let me break it down...",
    "analysisMode": "hooks-only"
  }'
```

### Example 4: TypeScript/JavaScript Usage

```typescript
import { analyzeBuzzPotential, quickBuzzScore } from '@/lib/ai/buzz-analyzer';

// Full analysis
const analysis = await analyzeBuzzPotential(
  "Your transcription text here...",
  {
    contentType: 'reel',
    currentMetrics: {
      views: 50000,
      likes: 5000,
      comments: 150
    },
    accountInfo: {
      followerCount: 10000,
      niche: 'lifestyle'
    },
    includeCompetitorAnalysis: true
  }
);

console.log(`Buzz Score: ${analysis.buzzScore}/100`);
console.log(`Viral Potential: ${analysis.viralPotential}`);
console.log(`Key Hooks: ${analysis.keyHooks.length}`);

// Quick score only
const score = await quickBuzzScore("Your transcription here...");
console.log(`Quick Buzz Score: ${score}/100`);
```

## Buzz Score Interpretation

| Score Range | Viral Potential | Description |
|-------------|----------------|-------------|
| 0-25 | Low | Generic content, no clear hooks |
| 26-50 | Moderate | Some engaging elements present |
| 51-75 | High | Strong hooks, clear value proposition |
| 76-100 | Very High | Viral elements, trending topics, strong engagement factors |

## Hook Types

The analyzer identifies different types of psychological triggers:

- **Emotional**: Content that triggers emotional responses
- **Curiosity**: Content that creates curiosity gaps
- **Shocking**: Unexpected or surprising information
- **Relatable**: Content that resonates with common experiences
- **Educational**: Valuable information or insights
- **Humorous**: Comedy or entertainment value

## Trend Strength Categories

- **Emerging**: New trends just starting to gain traction
- **Trending**: Currently popular and gaining momentum
- **Viral**: At peak popularity with massive engagement
- **Declining**: Past peak but still relevant

## Error Handling

### Error Response Format

```json
{
  "status": "error",
  "error": "Error message here",
  "timestamp": "2025-11-26T00:15:00.000Z"
}
```

### Common Errors

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Invalid request body | Missing or invalid transcription/content |
| 400 | Text too long | Content exceeds 10,000 characters |
| 500 | AI analysis failed | Gemini API error or parsing failure |

## Configuration

### Environment Variables

Ensure the following environment variable is set:

```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

Or alternatively:

```bash
GEMINI_API_KEY=your_api_key_here
```

### Model Configuration

The analyzer uses:
- **Primary Model**: Gemini 3 Pro Preview (paid tier)
- **Fallback Model**: Gemini 2.5 Flash (free tier)

Automatic fallback occurs if rate limits are hit.

## Integration with Transcription API

Typical workflow:

1. User uploads Instagram Reel URL
2. Video is downloaded via `/api/reels/download`
3. Audio is transcribed via `/api/reels/transcribe`
4. Transcription is sent to `/api/analyze/buzz` for analysis
5. Results are displayed with actionable recommendations

```typescript
// Complete workflow example
const reelUrl = "https://instagram.com/reel/...";

// Step 1: Download video
const downloadRes = await fetch('/api/reels/download', {
  method: 'POST',
  body: JSON.stringify({ url: reelUrl })
});

// Step 2: Transcribe audio
const transcribeRes = await fetch('/api/reels/transcribe', {
  method: 'POST',
  body: JSON.stringify({ videoId: downloadRes.data.id })
});

// Step 3: Analyze buzz potential
const buzzRes = await fetch('/api/analyze/buzz', {
  method: 'POST',
  body: JSON.stringify({
    transcription: transcribeRes.data.transcription,
    contentType: 'reel',
    analysisMode: 'full'
  })
});

console.log('Buzz Analysis:', buzzRes.data);
```

## Performance

- **Full Analysis**: ~5-15 seconds
- **Quick Analysis**: ~2-5 seconds
- **Hooks/Trends Only**: ~3-8 seconds

Performance depends on:
- Text length
- API response time
- Model availability

## Best Practices

1. **Use transcription over generic content** for Reels analysis
2. **Include metrics** (views, likes) when available for better analysis
3. **Provide account context** for personalized recommendations
4. **Use quick mode** for batch processing or previews
5. **Cache results** to avoid redundant API calls

## Version

- **API Version**: 2.0
- **Implementation Date**: 2025-11-26
- **Status**: Production Ready

---

*Part of the Instagram-buzz AI-powered content analysis system*
