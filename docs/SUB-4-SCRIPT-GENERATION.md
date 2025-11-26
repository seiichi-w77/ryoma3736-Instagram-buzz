# SUB-4: Reel Script Generation Feature

## Overview

This document describes the Reel Script Generation feature (SUB-4) implemented for Issue #24. The feature generates professional Instagram Reel scripts with detailed timing, pacing information, and production suggestions.

## Implementation Status

✅ **Fully Implemented**

- API endpoint: `/api/generate/script`
- Core module: `lib/ai/script-generator.ts`
- Gemini integration: `lib/ai/gemini.ts`
- Comprehensive tests: `tests/api/generate-script.test.ts`

## Features

### Core Capabilities

1. **Dual Input Formats**
   - **New Format** (Primary): Transcription + Buzz Analysis
   - **Legacy Format** (Backward Compatible): Topic-based generation

2. **Structured Script Output**
   - Hook (first 3 seconds) - attention-grabbing opening
   - Main sections with timing and pacing
   - Call-to-Action (last 5 seconds) - clear engagement prompt

3. **Production Support**
   - Visual descriptions for each section
   - B-roll suggestions
   - Music mood and tempo recommendations
   - Equipment requirements
   - On-screen text suggestions

4. **Advanced Features**
   - Multiple script variations (up to 3)
   - Script validation with errors and warnings
   - Formatted markdown output
   - Customizable duration (15s, 30s, 60s, 90s)
   - Multiple styles (educational, entertaining, motivational, tutorial, storytelling)

## API Documentation

### Endpoint

```
POST /api/generate/script
```

### Input Format (New - F3-3 Standard)

```json
{
  "transcription": {
    "text": "Original video transcription text",
    "duration": 45,
    "language": "en",
    "confidence": 0.95
  },
  "buzzAnalysis": {
    "buzzScore": 92,
    "sentiment": "positive",
    "viralPotential": "high",
    "keyHooks": [
      {
        "text": "incredible productivity hack",
        "hookType": "curiosity",
        "strength": 10
      }
    ],
    "keyThemes": ["productivity", "time-management"],
    "trendingTopics": [
      { "topic": "productivity", "relevance": 95 }
    ]
  },
  "duration": 30,
  "style": "entertaining",
  "tone": "energetic",
  "includeSubtitles": true,
  "complexity": "moderate"
}
```

### Input Format (Legacy - Backward Compatible)

```json
{
  "topic": "How to improve productivity in 5 minutes",
  "duration": 30,
  "style": "educational"
}
```

### Output Format

```json
{
  "status": "success",
  "data": {
    "script": {
      "title": "30-Second Productivity Revolution",
      "duration": 30,
      "hook": {
        "text": "Stop scrolling! This will change your day.",
        "duration": 3,
        "visualSuggestion": "Hand gesture stopping camera, dramatic pause",
        "onScreenText": "WAIT!"
      },
      "sections": [
        {
          "timestamp": "0:03-0:08",
          "duration": 5,
          "type": "main",
          "voiceover": "Here's the productivity hack nobody talks about",
          "visualDescription": "Quick cuts showing common productivity struggles",
          "brollSuggestion": "Time-lapse of cluttered desk transforming",
          "emphasis": [
            {
              "text": "nobody talks about",
              "type": "emphasize"
            }
          ],
          "onScreenText": "THE SECRET"
        }
      ],
      "callToAction": {
        "text": "Try this today and tag me in your results!",
        "duration": 5,
        "visualSuggestion": "Enthusiastic thumbs up, save gesture"
      },
      "metadata": {
        "totalWordCount": 75,
        "estimatedPace": "150 words per minute",
        "difficulty": "easy",
        "equipmentNeeded": ["smartphone camera", "ring light"],
        "targetAudience": "Working professionals 25-35"
      },
      "musicSuggestion": {
        "mood": "upbeat",
        "tempo": "fast",
        "genres": ["pop", "electronic"]
      },
      "brollList": [
        "Time-lapse of desk organization",
        "Close-up of productivity tools",
        "Happy reactions"
      ],
      "hashtags": [
        "#productivity",
        "#lifehack",
        "#worksmarter"
      ],
      "caption": "This ONE productivity hack saved me 2 hours every day! 🚀 Try it and let me know! 👇",
      "pacingNotes": [
        "Keep energy high throughout",
        "Pause dramatically after hook",
        "Speed up slightly during main tips",
        "Slow down and emphasize the CTA"
      ]
    },
    "formattedScript": "# 30-Second Productivity Revolution\n\n**Duration:** 30s...",
    "metadata": {
      "duration": 30,
      "style": "entertaining",
      "estimatedWordCount": 75,
      "estimatedSpeakingPace": "150 words per minute",
      "usedTranscription": true,
      "usedBuzzAnalysis": true,
      "validationResult": {
        "valid": true,
        "errors": [],
        "warnings": []
      }
    }
  },
  "timestamp": "2025-11-26T00:00:00.000Z"
}
```

## Usage Examples

### Example 1: Basic Script Generation (New Format)

```bash
curl -X POST http://localhost:3000/api/generate/script \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": {
      "text": "In this video, I will show you how to make amazing coffee at home"
    },
    "buzzAnalysis": {
      "buzzScore": 85,
      "sentiment": "positive",
      "keyHooks": [
        {
          "text": "amazing coffee at home",
          "hookType": "promise",
          "strength": 8
        }
      ]
    },
    "duration": 30,
    "style": "tutorial"
  }'
```

### Example 2: Generate Multiple Variations

```bash
curl -X POST http://localhost:3000/api/generate/script \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": {
      "text": "Quick morning routine that changed my life"
    },
    "buzzAnalysis": {
      "buzzScore": 90,
      "sentiment": "positive"
    },
    "generateVariations": true,
    "variationCount": 3
  }'
```

### Example 3: Legacy Format (Backward Compatibility)

```bash
curl -X POST http://localhost:3000/api/generate/script \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "5 tips for better sleep",
    "duration": 60,
    "style": "educational"
  }'
```

### Example 4: Get API Documentation

```bash
curl http://localhost:3000/api/generate/script
```

## Integration with Other Features

### Input Sources

1. **SUB-1**: Transcription from `POST /api/transcribe`
   ```typescript
   // Step 1: Get transcription
   const transcriptionResponse = await fetch('/api/transcribe', {
     method: 'POST',
     body: JSON.stringify({ url: reelUrl })
   });
   const { transcription } = await transcriptionResponse.json();

   // Step 2: Generate script
   const scriptResponse = await fetch('/api/generate/script', {
     method: 'POST',
     body: JSON.stringify({
       transcription,
       buzzAnalysis: { buzzScore: 80, sentiment: 'positive' },
       duration: 30
     })
   });
   ```

2. **SUB-2**: Buzz Analysis from buzz analyzer
   ```typescript
   // Combine with buzz analysis
   const script = await fetch('/api/generate/script', {
     method: 'POST',
     body: JSON.stringify({
       transcription: transcriptionData,
       buzzAnalysis: buzzData, // From SUB-2
       duration: 30,
       style: 'entertaining'
     })
   });
   ```

### Output Usage

The generated script can be used for:
- Content planning
- Video production guidance
- Social media strategy
- A/B testing different approaches
- Training content creators

## Configuration Options

### Duration Options
- `15` - Short, impactful message
- `30` - Standard Instagram Reel (default)
- `60` - Extended content
- `90` - In-depth tutorial

### Style Options
- `educational` - Informative, teaching-focused
- `entertaining` - Fun, engaging, shareable
- `motivational` - Inspiring, uplifting
- `tutorial` - Step-by-step instructions
- `storytelling` - Narrative-driven

### Tone Options
- `professional` - Formal, authoritative
- `casual` - Friendly, conversational (default)
- `energetic` - High-energy, exciting
- `calm` - Relaxed, soothing
- `humorous` - Funny, light-hearted

### Complexity Options
- `simple` - Easy to produce, minimal editing
- `moderate` - Balanced production (default)
- `advanced` - Complex, professional-level

## Technical Implementation

### Key Files

1. **`lib/ai/script-generator.ts`**
   - Core script generation logic
   - Prompt engineering for Gemini AI
   - Output parsing and validation
   - Format conversion utilities

2. **`app/api/generate/script/route.ts`**
   - Next.js API route handler
   - Request validation
   - Dual format support (new + legacy)
   - Response formatting

3. **`lib/ai/gemini.ts`**
   - Google Gemini API integration
   - Model fallback (gemini-3-pro → gemini-2.5-flash)
   - Rate limit handling
   - Error management

### Key Functions

```typescript
// Generate single script
import { generateReelScript } from '@/lib/ai/script-generator';

const script = await generateReelScript(
  transcription,
  buzzAnalysis,
  { duration: 30, style: 'entertaining' }
);

// Generate multiple variations
import { generateScriptVariations } from '@/lib/ai/script-generator';

const variations = await generateScriptVariations(
  transcription,
  buzzAnalysis,
  3, // count
  { duration: 30 }
);

// Format for display
import { formatScript } from '@/lib/ai/script-generator';

const markdown = formatScript(script);
console.log(markdown);

// Validate script
import { validateScript } from '@/lib/ai/script-generator';

const validation = validateScript(script);
if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
console.warn('Warnings:', validation.warnings);
```

## Testing

### Test Coverage

The feature has comprehensive test coverage in `tests/api/generate-script.test.ts`:

- ✅ Input validation (empty body, invalid JSON, missing fields)
- ✅ Legacy format support (topic-based)
- ✅ New format support (transcription + buzzAnalysis)
- ✅ Hook structure validation (3-second rule)
- ✅ Section pacing verification
- ✅ Multiple variations generation
- ✅ Validation results inclusion
- ✅ Duration options (15s, 30s, 60s, 90s)
- ✅ Style options (educational, entertaining, motivational)
- ✅ Error handling (API errors, rate limits)
- ✅ GET endpoint documentation

### Running Tests

```bash
# Run all script generation tests
npm test -- tests/api/generate-script.test.ts

# Run specific test
npm test -- tests/api/generate-script.test.ts -t "should generate script from transcription"

# Run with coverage
npm test -- tests/api/generate-script.test.ts --coverage
```

### Test Results

```
✓ tests/api/generate-script.test.ts  (20 tests) 15ms
  Test Files  1 passed (1)
  Tests  20 passed (20)
```

## Environment Setup

### Required Environment Variables

```bash
# Gemini API Key (required)
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# OR (alternative name)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Add to `.env` file

## Performance

### Response Times
- Simple script (30s): ~3-5 seconds
- Complex script (60s+): ~5-8 seconds
- Multiple variations (3x): ~10-15 seconds

### API Usage
- Model: gemini-3-pro-preview (fallback: gemini-2.5-flash)
- Token usage: ~1,000-3,000 tokens per request
- Rate limits: Follows Google Gemini API limits

## Error Handling

### Common Errors

1. **Missing API Key**
   ```json
   {
     "status": "error",
     "error": "GOOGLE_AI_API_KEY environment variable is not set"
   }
   ```

2. **Invalid Input**
   ```json
   {
     "status": "error",
     "error": "Invalid request body. Required: (transcription + buzzAnalysis) OR (topic/url/content)"
   }
   ```

3. **Validation Failure**
   ```json
   {
     "status": "success",
     "data": {
       "metadata": {
         "validationResult": {
           "valid": false,
           "errors": ["Total section time doesn't match script duration"],
           "warnings": ["Word count significantly differs from expected"]
         }
       }
     }
   }
   ```

## Future Enhancements

### Planned Features
- [ ] Platform-specific optimization (TikTok, YouTube Shorts)
- [ ] Voice and persona customization
- [ ] Integration with video editing tools
- [ ] Script history and versioning
- [ ] Collaborative editing support
- [ ] AI-powered script improvement suggestions
- [ ] Multi-language support

### Integration Opportunities
- Content calendar integration
- Analytics tracking (which scripts perform best)
- A/B testing framework
- Automated video generation pipeline

## Support & Troubleshooting

### Common Issues

**Issue**: Scripts are too generic
- **Solution**: Provide more detailed buzz analysis with specific hooks and themes

**Issue**: Timing doesn't match duration
- **Solution**: Script validation will catch this. Re-generate or manually adjust sections

**Issue**: Style doesn't match expectations
- **Solution**: Be explicit with `style`, `tone`, and `complexity` parameters

### Getting Help

1. Check API documentation: `GET /api/generate/script`
2. Review test examples: `tests/api/generate-script.test.ts`
3. Examine implementation: `lib/ai/script-generator.ts`
4. Report issues: Create GitHub issue with reproduction steps

## Changelog

### v2.0 (Current - SUB-4 Implementation)
- ✅ New transcription + buzzAnalysis format
- ✅ Structured script output (hook, sections, CTA)
- ✅ Pacing information with timestamps
- ✅ Multiple variation generation
- ✅ Script validation
- ✅ Backward compatibility with legacy format
- ✅ Comprehensive test coverage

### v1.0 (Legacy)
- Basic topic-based script generation
- Simple pacing information
- Music suggestions

## License

Part of the Instagram-buzz project. See main LICENSE file.

---

**Last Updated**: 2025-11-26
**Implementation**: SUB-4 (Issue #24)
**Status**: ✅ Fully Implemented & Tested
