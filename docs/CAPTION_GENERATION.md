# Instagram Caption Generation - Issue #25 Implementation

## Overview

The Caption Generation feature (SUB-5) generates engaging Instagram captions optimized for Reels using AI-powered analysis of video transcriptions and buzz metrics.

## Features

- **AI-Powered Generation**: Uses Google Gemini API (gemini-1.5-flash) for intelligent caption creation
- **Multiple Styles**: 6 caption styles (storytelling, educational, promotional, conversational, inspirational, humorous)
- **Smart Hashtag Strategy**: Generates 10-30 relevant hashtags with optimal distribution
- **2200 Character Limit**: Complies with Instagram's maximum caption length
- **Buzz Analysis Integration**: Leverages engagement metrics and viral potential
- **Validation**: Automatic validation against Instagram platform requirements

## API Endpoint

### POST /api/generate/caption

Generate Instagram captions from transcription and buzz analysis data.

#### Request Format

```json
{
  "transcription": {
    "text": "Your reel transcription text",
    "language": "en",
    "duration": 45,
    "confidence": 0.95
  },
  "buzzAnalysis": {
    "buzzScore": 85,
    "sentiment": "positive",
    "viralPotential": "high",
    "keyThemes": ["AI", "productivity"],
    "keyHooks": [
      {
        "text": "3 amazing productivity hacks",
        "hookType": "curiosity",
        "strength": 9
      }
    ],
    "trendingTopics": [
      {
        "topic": "AI productivity",
        "relevance": 95,
        "trendStrength": "trending"
      }
    ]
  },
  "style": "educational",
  "hashtagCount": 25,
  "includeEmojis": true,
  "includeHashtags": true,
  "includeCallToAction": true,
  "maxLength": 2200
}
```

#### Response Format

```json
{
  "status": "success",
  "data": {
    "caption": {
      "caption": "🔥 Your engaging caption text...\n\nSave this for later!",
      "hook": "🔥 Your engaging caption text...",
      "hashtags": ["#productivity", "#AI", "#lifehacks", "..."],
      "callToAction": "Save this for later!",
      "characterCount": 156,
      "hashtagCount": 25,
      "estimatedEngagement": "high",
      "style": "educational",
      "emojiSuggestions": ["🔥", "✨", "💡"]
    },
    "formattedCaption": "Complete caption with hashtags...",
    "metadata": {
      "characterCount": 156,
      "hashtagCount": 25,
      "style": "educational",
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
}
```

## Caption Styles

### 1. Storytelling
- **Focus**: Narrative-driven with emotional arc
- **Best For**: Personal experiences, brand stories
- **Characteristics**: Personal anecdotes, relatable journey, emotional connection

### 2. Educational
- **Focus**: Informative and value-packed
- **Best For**: Tutorials, tips, how-to content
- **Characteristics**: Teaches something specific, actionable takeaways

### 3. Promotional
- **Focus**: Sales-focused with urgency
- **Best For**: Product launches, special offers
- **Characteristics**: Benefits-driven, conversion-oriented, includes urgency

### 4. Conversational
- **Focus**: Casual and friendly
- **Best For**: Behind-the-scenes, daily updates
- **Characteristics**: Like talking to a friend, relatable and authentic

### 5. Inspirational
- **Focus**: Motivational and uplifting
- **Best For**: Success stories, motivational content
- **Characteristics**: Aspirational content, empowering message

### 6. Humorous
- **Focus**: Funny and entertaining
- **Best For**: Comedy skits, memes, lighthearted content
- **Characteristics**: Witty wordplay, lighthearted, engaging

## Hashtag Strategy

The system generates hashtags with optimal distribution:

- **5-7 High-Volume Tags** (100K+ posts): Maximum reach, high competition
- **10-15 Medium-Volume Tags** (10K-100K posts): Targeted reach, moderate competition
- **5-7 Low-Volume Tags** (<10K posts): Niche reach, low competition

### Hashtag Best Practices

1. Mix trending, niche, and branded hashtags
2. Use 20-30 hashtags for maximum reach (Instagram allows 30)
3. Place hashtags at the end, separated by line breaks
4. Avoid banned or spam hashtags
5. Update hashtag strategy based on performance

## Character Limit

Instagram captions have a **2,200 character limit**. The system:

- Automatically truncates captions exceeding the limit
- Adds "..." at the end if truncated
- Validates character count before returning
- Includes character count in metadata

## Code Examples

### Basic Usage (TypeScript)

```typescript
import { generateInstagramCaption } from '@/lib/ai/caption-generator';

const transcription = {
  text: 'Your reel transcription...',
  language: 'en',
  duration: 45,
};

const buzzAnalysis = {
  buzzScore: 85,
  sentiment: 'positive',
  keyThemes: ['productivity', 'AI'],
};

const caption = await generateInstagramCaption(
  transcription,
  buzzAnalysis,
  {
    style: 'educational',
    hashtagCount: 25,
    includeEmojis: true,
  }
);

console.log(caption.caption);
console.log(caption.hashtags.join(' '));
```

### API Request (JavaScript/Fetch)

```javascript
const response = await fetch('/api/generate/caption', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    transcription: {
      text: 'Your reel transcription...',
    },
    buzzAnalysis: {
      buzzScore: 85,
      sentiment: 'positive',
    },
    style: 'conversational',
    hashtagCount: 25,
    includeHashtags: true,
  }),
});

const data = await response.json();
console.log(data.data.caption.caption);
```

### API Request (cURL)

```bash
curl -X POST http://localhost:3000/api/generate/caption \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": {
      "text": "Your reel transcription..."
    },
    "buzzAnalysis": {
      "buzzScore": 85,
      "sentiment": "positive"
    },
    "style": "educational",
    "hashtagCount": 25
  }'
```

## Environment Setup

### Required Environment Variables

```bash
# Google Gemini API Key (required)
GOOGLE_AI_API_KEY=your_google_ai_api_key
# Alternative: GEMINI_API_KEY=your_gemini_api_key
```

### Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add to your `.env` file

## Testing

### Run Tests

```bash
# Run all caption generation tests
npm test -- tests/api/caption-issue25.test.ts

# Run with coverage
npm test -- --coverage tests/api/caption-issue25.test.ts
```

### Run Examples

```bash
# Run the example script
npx tsx examples/caption-generation-example.ts
```

## Validation

The system validates captions against Instagram requirements:

### Validation Checks

- ✅ Caption text is not empty
- ✅ Character count ≤ 2,200
- ✅ Character count matches actual length
- ✅ Hashtags start with `#`
- ✅ Hashtags don't contain spaces
- ✅ Hashtag count ≤ 30
- ⚠️ Warning if hashtag count < 10

### Validation Response

```json
{
  "valid": true,
  "errors": [],
  "warnings": ["Consider using more hashtags for better reach (current: 5)"]
}
```

## Performance Considerations

### Response Times

- **Average**: 3-5 seconds
- **With variations**: 10-15 seconds
- **Factors**: Model availability, prompt complexity, token count

### Rate Limits

- **Gemini Free Tier**: 60 requests per minute
- **Gemini Paid Tier**: Higher limits based on plan
- **Automatic Fallback**: Falls back to gemini-2.5-flash if rate limited

## Best Practices

### Caption Writing Tips

1. **Start Strong**: First line (hook) is critical - make it attention-grabbing
2. **Add Value**: Clearly state what viewers gain from watching
3. **Tell a Story**: Use transcription content to create a narrative
4. **Emotional Connection**: Leverage sentiment and hooks from buzz analysis
5. **Include Trending Topics**: Naturally incorporate trending topics
6. **Strong CTA**: Encourage engagement (like, comment, share, save)
7. **Use Line Breaks**: Improve readability every 2-3 sentences
8. **Emojis**: 3-5 strategic emojis increase engagement by ~25%

### Optimal Posting Times

- **Professionals/Business**: Weekdays 12pm-1pm or 6pm-8pm
- **Students/Young Adults**: Weekdays 3pm-5pm or 8pm-10pm
- **Parents/Family**: Weekdays 10am-12pm or 8pm-9pm
- **General**: Weekdays 11am-1pm or 7pm-9pm

## Troubleshooting

### Common Issues

#### Error: "GOOGLE_AI_API_KEY environment variable is not set"
**Solution**: Add API key to `.env` file

#### Error: "Failed to generate Instagram caption: rate limit exceeded"
**Solution**: Wait a few seconds and retry. System automatically falls back to gemini-2.5-flash.

#### Warning: "Caption exceeds 2,200 characters"
**Solution**: Reduce `maxLength` parameter or let system auto-truncate

#### Low Engagement Estimate
**Solution**:
- Use higher buzz score content
- Try different caption style
- Increase hashtag count
- Add more emojis

## API Compatibility

### Legacy Format (Backward Compatible)

The API also supports the legacy format for backward compatibility:

```json
{
  "topic": "Your topic",
  "imageType": "reel",
  "tone": "casual",
  "includeHashtags": true
}
```

This will use the simpler `generateCaptionWithGemini` function instead of the full transcription + buzz analysis workflow.

## Related Documentation

- [Buzz Analysis](./BUZZ_ANALYSIS.md)
- [Transcription](./TRANSCRIPTION.md)
- [API Reference](./API_REFERENCE.md)
- [Gemini Integration](./GEMINI_INTEGRATION.md)

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/ryoma3736/Instagram-buzz/issues)
- Documentation: [Full docs](../README.md)

---

**Implementation Status**: ✅ Complete (Issue #25 - SUB-5)

**Last Updated**: 2025-11-25

**Model Used**: Gemini 1.5 Flash (with fallback to Gemini 2.5 Flash)
