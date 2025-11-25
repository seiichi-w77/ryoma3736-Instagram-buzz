# Instagram Buzz - Transcription API Documentation

## Overview

The Transcription API provides automatic speech-to-text conversion for Instagram Reels and other video/audio content using OpenAI's Whisper model.

## Features

- **Audio & Video Support**: Process MP3, WAV, MP4, MOV, AVI, MKV files
- **Multiple Output Formats**: Text, Markdown, SRT subtitles, or structured script
- **Language Detection**: Automatic language identification
- **Segment Information**: Optional detailed transcription segments with timestamps
- **Large File Support**: Up to 500MB (with ffmpeg extraction for video)

## Endpoint

```
POST /api/reels/transcribe
```

## Authentication

Requires `OPENAI_API_KEY` environment variable to be set.

## Request Parameters

### File Upload

```bash
curl -X POST http://localhost:3000/api/reels/transcribe \
  -F "file=@video.mp4" \
  -F "format=markdown" \
  -F "language=en"
```

### Form Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `file` | File | Yes | - | Audio or video file to transcribe |
| `format` | string | No | `text` | Output format: `text`, `markdown`, `srt`, `script`, `complete` |
| `verbose` | boolean | No | `false` | Include detailed segments with timestamps |
| `language` | string | No | - | Language code (e.g., `en`, `ja`, `es`, `fr`, `de`) |

### Supported File Types

**Audio Files:**
- audio/mpeg (MP3)
- audio/wav (WAV)
- audio/mp4 (AAC)
- audio/m4a (AAC)
- audio/aac (AAC)
- audio/ogg (OGG Vorbis)
- audio/webm (WebM)

**Video Files:**
- video/mp4 (MPEG-4)
- video/quicktime (MOV)
- video/x-msvideo (AVI)
- video/x-matroska (MKV)

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "text": "Hello world. This is a test transcription.",
    "language": "en",
    "duration": 5.5,
    "format": "text",
    "formatted": "Hello world. This is a test transcription.",
    "segments": [
      {
        "id": 0,
        "seek": 0,
        "start": 0,
        "end": 1.5,
        "text": "Hello world.",
        "tokens": [...],
        "temperature": 0,
        "avgLogprob": -0.45,
        "compressionRatio": 1.2,
        "noSpeechProb": 0.001
      }
    ]
  },
  "metadata": {
    "fileSize": 1024000,
    "processingTime": "2025-11-25T10:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "File too large. Maximum size is 500MB"
}
```

## Output Formats

### 1. Text Format (default)

Simple raw transcription text:

```
Hello world. This is a test transcription. It contains multiple sentences.
```

### 2. Markdown Format

Formatted with metadata and optional timestamps:

```markdown
**Language**: en

**Duration**: 00:05

## Transcript

**00:00** Hello world.
**00:01** This is a test transcription.
**00:03** It contains multiple sentences.
```

### 3. SRT Format

Subtitle file format for video players:

```
1
00:00:00,000 --> 00:00:01,500
Hello world.

2
00:00:01,500 --> 00:00:03,500
This is a test transcription.

3
00:00:03,500 --> 00:00:05,500
It contains multiple sentences.
```

### 4. Script Format

Array of script entries with timing:

```json
[
  {
    "timestamp": "00:00:00",
    "duration": 1.5,
    "text": "Hello world."
  },
  {
    "timestamp": "00:00:01",
    "duration": 2.0,
    "text": "This is a test transcription."
  },
  {
    "timestamp": "00:00:03",
    "duration": 2.0,
    "text": "It contains multiple sentences."
  }
]
```

### 5. Complete Format

Comprehensive output with all formats and summary:

```json
{
  "raw": "Hello world. This is a test transcription.",
  "markdown": "**Language**: en\n\n## Transcript\n...",
  "srt": "1\n00:00:00,000 --> ...",
  "script": [...],
  "duration": 5.5,
  "language": "en",
  "summary": "Hello world. This is a test transcription."
}
```

## Examples

### Basic Text Transcription

```bash
curl -X POST http://localhost:3000/api/reels/transcribe \
  -F "file=@audio.mp3"
```

### Video to SRT Subtitles

```bash
curl -X POST http://localhost:3000/api/reels/transcribe \
  -F "file=@video.mp4" \
  -F "format=srt" \
  -F "verbose=true"
```

### Japanese Video Transcription

```bash
curl -X POST http://localhost:3000/api/reels/transcribe \
  -F "file=@japanese_video.mp4" \
  -F "format=markdown" \
  -F "language=ja"
```

### JavaScript Example

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('format', 'markdown');
formData.append('verbose', 'true');

const response = await fetch('/api/reels/transcribe', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.data.formatted);
```

### Python Example

```python
import requests

with open('video.mp4', 'rb') as f:
    files = {'file': f}
    data = {
        'format': 'srt',
        'language': 'en'
    }

    response = requests.post(
        'http://localhost:3000/api/reels/transcribe',
        files=files,
        data=data
    )

    result = response.json()
    print(result['data']['formatted'])
```

## Error Handling

### Status Codes

| Code | Reason |
|------|--------|
| 200 | Success |
| 400 | Invalid request (missing file, unsupported type) |
| 413 | File too large (>500MB) |
| 415 | Unsupported file type |
| 500 | Server error (API key missing, transcription failed) |

### Common Errors

**Missing File:**
```json
{
  "error": "File is required"
}
```

**Unsupported File Type:**
```json
{
  "error": "Unsupported file type: application/pdf. Supported types: audio/mpeg, audio/wav, ..."
}
```

**File Too Large:**
```json
{
  "error": "File too large. Maximum size is 500MB"
}
```

**Missing API Key:**
```json
{
  "error": "OpenAI API key is not configured"
}
```

**Transcription Failed:**
```json
{
  "error": "Transcription failed: Whisper API error: Rate limit exceeded"
}
```

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
WHISPER_MODEL=base         # Options: tiny, base, small, medium, large
WHISPER_LANGUAGE=en        # ISO-639-1 language code
WHISPER_TEMPERATURE=0      # 0-1, higher = more variability
```

### File Size Limits

- **Total File Size**: 500MB (configurable via middleware)
- **Direct API Limit**: 25MB (files larger than this require audio extraction)
- **Recommended Size**: <100MB for optimal performance

## Performance Notes

### Processing Time

- Small files (<10MB): 5-15 seconds
- Medium files (10-100MB): 30-60 seconds
- Large files (100-500MB): 2-10 minutes

### Whisper Model Selection

| Model | Speed | Accuracy | Size |
|-------|-------|----------|------|
| `tiny` | Fastest | Lower | 39MB |
| `base` | Fast | Good | 140MB |
| `small` | Moderate | Better | 466MB |
| `medium` | Slow | Excellent | 1.5GB |
| `large` | Slowest | Best | 2.9GB |

## Dependencies

- **openai**: OpenAI API client
- **ffmpeg**: Video audio extraction (system-level dependency)

### Install ffmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu:**
```bash
apt-get install ffmpeg
```

**Windows:**
```bash
choco install ffmpeg
```

## Testing

Run the test suite:

```bash
npm test tests/transcribe/
npm test tests/api/transcribe.test.ts
```

## Module Structure

```
lib/transcribe/
├── whisper.ts          # Whisper API client
├── formatter.ts        # Transcript formatting

app/api/reels/
└── transcribe/
    └── route.ts        # API endpoint

tests/
├── transcribe/
│   ├── whisper.test.ts
│   └── formatter.test.ts
└── api/
    └── transcribe.test.ts
```

## API Limits

- **Concurrent Requests**: 3 concurrent requests (OpenAI rate limit)
- **Monthly Quota**: Depends on OpenAI account tier
- **File Size**: 500MB maximum
- **Timeout**: 60 seconds (configurable)

## Security

- Files are processed in memory
- Temporary audio files are automatically cleaned up
- No files are stored permanently
- API key is required (via environment variables)
- CORS headers are properly configured

## Troubleshooting

### Issue: "ffmpeg not found"

**Solution**: Install ffmpeg on your system:
```bash
brew install ffmpeg  # macOS
apt-get install ffmpeg  # Ubuntu
```

### Issue: "OpenAI API key is not configured"

**Solution**: Set the environment variable:
```bash
export OPENAI_API_KEY=sk-...
```

### Issue: "Rate limit exceeded"

**Solution**: Wait a few moments before retrying. Consider upgrading your OpenAI account.

### Issue: Large file processing is slow

**Solution**: Use a smaller model (e.g., `tiny` or `base`) or split the file into smaller chunks.

## Related Documentation

- [Whisper API Reference](lib/transcribe/whisper.ts)
- [Transcript Formatter Reference](lib/transcribe/formatter.ts)
- [API Route Implementation](app/api/reels/transcribe/route.ts)
- [Test Suite](tests/transcribe/)

## License

MIT - See LICENSE file for details
