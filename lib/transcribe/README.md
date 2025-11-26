# Whisper API Transcription Module

Audio and video transcription functionality using OpenAI's Whisper API.

## Features

- Video-to-text transcription with audio extraction
- Direct audio file transcription  
- Multiple output formats (text, markdown, SRT, script)
- Language detection and specification
- Segment-based timestamps
- Batch processing support

## Requirements

### FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

### Environment Variables

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

## Usage

### Quick Start

```typescript
import { transcribeFile } from '@/lib/transcribe/whisper';

// Basic transcription
const result = await transcribeFile('/path/to/video.mp4');
console.log(result.text);

// With language specification
const result = await transcribeFile('/path/to/video.mp4', {
  language: 'ja',
  verbose: true,
});
```

### API Endpoint

```typescript
// POST /api/reels/transcribe
const response = await fetch('/api/reels/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: '/downloads/reel-12345.mp4',
    language: 'ja',
  }),
});

const data = await response.json();
console.log(data.data.text);
```

## Supported Formats

**Video**: MP4, MOV, AVI, MKV, WebM  
**Audio**: MP3, WAV, M4A, AAC, OGG, FLAC

## Documentation

See [full documentation](./README.md) for advanced usage, API reference, and examples.

## License

MIT
