# Quick Start: Caption Generation API

## 5-Minute Setup

### 1. Get API Key (1 minute)

Visit [Google AI Studio](https://aistudio.google.com/apikey) and create a free API key.

### 2. Configure Environment (1 minute)

Add to your `.env` file:

```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

### 3. Start Server (1 minute)

```bash
npm install
npm run dev
```

Server starts at: `http://localhost:3000`

### 4. Test API (2 minutes)

#### Quick Test with cURL

```bash
curl -X POST http://localhost:3000/api/generate/caption \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": {
      "text": "Check out this amazing productivity hack!"
    },
    "buzzAnalysis": {
      "buzzScore": 85,
      "sentiment": "positive"
    }
  }'
```

#### Expected Response

```json
{
  "status": "success",
  "data": {
    "caption": {
      "caption": "🔥 Amazing productivity hack...",
      "hashtags": ["#productivity", "#hacks", "..."],
      "callToAction": "Save this for later!"
    }
  }
}
```

---

## Common Use Cases

### 1. Basic Caption Generation

```javascript
const response = await fetch('/api/generate/caption', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcription: {
      text: 'Your video transcription here'
    },
    buzzAnalysis: {
      buzzScore: 85,
      sentiment: 'positive'
    }
  })
});

const { data } = await response.json();
console.log(data.caption.caption);
```

### 2. Educational Content Caption

```javascript
const response = await fetch('/api/generate/caption', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcription: {
      text: 'Today I teach you how to use AI tools'
    },
    buzzAnalysis: {
      buzzScore: 90,
      sentiment: 'positive',
      keyThemes: ['AI', 'education', 'tutorial']
    },
    style: 'educational',
    hashtagCount: 25
  })
});
```

### 3. Motivational/Inspirational Caption

```javascript
const response = await fetch('/api/generate/caption', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcription: {
      text: 'Never give up on your dreams'
    },
    buzzAnalysis: {
      buzzScore: 95,
      sentiment: 'inspirational',
      keyThemes: ['motivation', 'success', 'mindset']
    },
    style: 'inspirational',
    includeEmojis: true
  })
});
```

### 4. Generate Multiple Style Variations

```javascript
const response = await fetch('/api/generate/caption', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcription: {
      text: 'Your transcription'
    },
    buzzAnalysis: {
      buzzScore: 85,
      sentiment: 'positive'
    },
    generateVariations: true,
    variationCount: 3
  })
});

const { data } = await response.json();
console.log('Primary:', data.caption);
console.log('Variations:', data.variations);
```

---

## Parameters Reference

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `transcription.text` | string | Video transcription text |
| `buzzAnalysis.buzzScore` | number | Buzz score 0-100 |
| `buzzAnalysis.sentiment` | string | Sentiment analysis |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `style` | string | 'conversational' | Caption style |
| `hashtagCount` | number | 25 | Number of hashtags (10-30) |
| `includeEmojis` | boolean | true | Include emojis |
| `includeHashtags` | boolean | true | Generate hashtags |
| `maxLength` | number | 2200 | Max caption length |
| `targetAudience` | string | 'general' | Target audience |
| `brandVoice` | string | 'authentic' | Brand voice/tone |

### Caption Styles

- `storytelling` - Narrative-driven
- `educational` - Informative, tutorial
- `promotional` - Sales-focused
- `conversational` - Casual, friendly
- `inspirational` - Motivational
- `humorous` - Funny, entertaining

---

## Response Structure

```json
{
  "status": "success",
  "data": {
    "caption": {
      "caption": "Main caption text with emojis...",
      "hook": "Attention-grabbing opening line",
      "hashtags": ["#tag1", "#tag2", "..."],
      "callToAction": "Engagement CTA",
      "characterCount": 156,
      "hashtagCount": 25,
      "estimatedEngagement": "high",
      "style": "educational"
    },
    "formattedCaption": "Ready-to-post formatted text",
    "metadata": {
      "validationResult": {
        "valid": true,
        "errors": [],
        "warnings": []
      }
    }
  },
  "timestamp": "2025-11-25T00:00:00.000Z"
}
```

---

## Error Handling

### Common Errors

#### 1. Missing API Key

```json
{
  "status": "error",
  "error": "GOOGLE_AI_API_KEY environment variable is not set"
}
```

**Solution**: Add API key to `.env` file

#### 2. Invalid Request

```json
{
  "status": "error",
  "error": "Invalid request body. Required: (transcription + buzzAnalysis)"
}
```

**Solution**: Include both `transcription` and `buzzAnalysis` in request

#### 3. Rate Limit

```json
{
  "status": "error",
  "error": "Failed to call Gemini API: rate limit exceeded"
}
```

**Solution**: Wait a few seconds and retry. System auto-retries with fallback model.

---

## TypeScript Example

```typescript
import type { CaptionGenerationRequest, CaptionGenerationResponse } from '@/types';

async function generateCaption(
  transcription: string,
  buzzScore: number
): Promise<string> {
  const response = await fetch('/api/generate/caption', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcription: { text: transcription },
      buzzAnalysis: { buzzScore, sentiment: 'positive' }
    } satisfies CaptionGenerationRequest)
  });

  if (!response.ok) {
    throw new Error('Caption generation failed');
  }

  const data: CaptionGenerationResponse = await response.json();
  return data.data.caption.caption;
}
```

---

## Testing

### Run Tests

```bash
npm test -- tests/api/caption-issue25.test.ts
```

### Run Example Script

```bash
npx tsx examples/caption-generation-example.ts
```

---

## Tips & Best Practices

### Caption Writing Tips

1. **Hook First**: First line must grab attention
2. **Value Clear**: State what viewers gain
3. **Emojis Strategic**: 3-5 emojis for engagement
4. **Line Breaks**: Every 2-3 sentences
5. **CTA Strong**: Clear action for engagement

### Hashtag Strategy

1. **Mix Volume**: High, medium, low volume tags
2. **Count Optimal**: 20-30 hashtags
3. **Placement**: End of caption with line break
4. **Trending**: Include 5-7 trending topics
5. **Niche**: Include 5-7 niche-specific tags

### Engagement Optimization

1. **Post Timing**: Weekdays 11am-1pm or 7pm-9pm
2. **Caption Length**: 150-250 characters ideal
3. **Question Hook**: Ask questions in opening
4. **Save Prompt**: Encourage saves for algorithm
5. **Share Worthy**: Make it shareable

---

## Full Workflow Example

Complete workflow from video to caption:

```javascript
// 1. Transcribe video
const transcription = await fetch('/api/reels/transcribe', {
  method: 'POST',
  body: formData // with video file
});

// 2. Analyze buzz
const buzz = await fetch('/api/analyze/buzz', {
  method: 'POST',
  body: JSON.stringify({ transcription: transcription.text })
});

// 3. Generate caption
const caption = await fetch('/api/generate/caption', {
  method: 'POST',
  body: JSON.stringify({
    transcription: transcription,
    buzzAnalysis: buzz.data,
    style: 'educational',
    hashtagCount: 25
  })
});

// 4. Post to Instagram (your implementation)
await postToInstagram(caption.data.formattedCaption);
```

---

## Need Help?

- **Documentation**: [Full API Docs](./CAPTION_GENERATION.md)
- **Examples**: `examples/caption-generation-example.ts`
- **Issues**: [GitHub Issues](https://github.com/ryoma3736/Instagram-buzz/issues)

---

**Quick Start Complete!** 🎉

You're now ready to generate engaging Instagram captions with AI.

For advanced features and customization, see the [complete documentation](./CAPTION_GENERATION.md).
