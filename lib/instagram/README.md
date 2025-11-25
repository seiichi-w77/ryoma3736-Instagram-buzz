# Instagram Media Downloader Module

A TypeScript module for validating and downloading Instagram media (reels, posts, clips, IGTV).

## Features

- URL validation for Instagram media
- Support for multiple Instagram URL formats (instagram.com, instagr.am, ig.me)
- Support for multiple media types (reels, posts, clips, IGTV)
- Media information extraction without downloading
- Comprehensive error handling
- Full TypeScript type support
- 66 unit tests with 100% passing rate

## Installation

```bash
npm install
```

## Modules

### validator.ts

Validates Instagram URLs and extracts media information.

```typescript
import { validateInstagramUrl, formatInstagramUrl } from '@/lib/instagram/validator';

// Validate a URL
const result = validateInstagramUrl('https://www.instagram.com/reel/abc123/');

if (result.isValid) {
  console.log(`Media Type: ${result.type}`);
  console.log(`Media ID: ${result.mediaId}`);
} else {
  console.error(`Error: ${result.error}`);
}

// Format a URL
const url = formatInstagramUrl('abc123', 'reel');
// Output: https://www.instagram.com/reel/abc123/
```

### downloader.ts

Handles downloading Instagram media with validation.

```typescript
import { createDownloader } from '@/lib/instagram/downloader';

const downloader = createDownloader({
  timeout: 30000,
  maxRetries: 3,
});

// Validate URL
const validation = await downloader.validate({
  url: 'https://www.instagram.com/reel/abc123/',
});

if (validation.success) {
  // Download media
  const result = await downloader.download({
    url: 'https://www.instagram.com/reel/abc123/',
    quality: 'high',
    format: 'mp4',
  });

  if (result.success) {
    console.log(`Downloaded: ${result.fileName}`);
    console.log(`URL: ${result.mediaUrl}`);
    console.log(`Size: ${result.size} bytes`);
  }
}

// Get media info without downloading
const info = await downloader.getMediaInfo('https://www.instagram.com/reel/abc123/');
console.log(`Media Type: ${info.mediaType}`);
```

## API Endpoints

### POST /api/reels/download

Downloads Instagram media.

**Request:**
```json
{
  "url": "https://www.instagram.com/reel/abc123/",
  "quality": "high",
  "format": "mp4"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "mediaUrl": "https://media.cdn.example.com/instagram/abc123/video.mp4",
    "fileName": "instagram_reel_abc123_1764066059693.mp4",
    "mediaType": "video/mp4",
    "size": 5242880
  },
  "timestamp": "2025-11-25T19:20:59.693Z",
  "requestId": "req_1764066059693_abc123def"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid Instagram URL",
  "timestamp": "2025-11-25T19:20:59.693Z",
  "requestId": "req_1764066059693_abc123def"
}
```

## Supported URL Formats

- `https://www.instagram.com/reel/MEDIA_ID/`
- `https://www.instagram.com/p/MEDIA_ID/`
- `https://www.instagram.com/tv/MEDIA_ID/`
- `https://www.instagram.com/clip/MEDIA_ID/`
- `https://instagr.am/reel/MEDIA_ID/`
- `https://ig.me/reel/MEDIA_ID/`

With optional query parameters and fragments:
- `https://www.instagram.com/reel/MEDIA_ID/?utm_source=ig_web_button_share_sheet`
- `https://www.instagram.com/reel/MEDIA_ID/#comments`

## Media Types

- `reel` - Instagram Reels
- `post` - Instagram Posts (images/carousels)
- `clip` - Instagram Clips
- `igtv` - Instagram IGTV videos

## Quality Levels

- `high` - Best quality available
- `medium` - Medium quality
- `low` - Lowest bandwidth usage

## Format Options

- `mp4` - MPEG-4 video format (default)
- `webm` - WebM video format

## Error Handling

The module provides detailed error messages for validation and download failures:

- **Invalid URL format**: "Invalid URL format"
- **Non-Instagram domain**: "URL must be from Instagram domain (instagram.com, instagr.am, ig.me)"
- **Missing media ID**: "Could not extract valid media ID from URL"
- **Network errors**: "Download failed: [error message]"

## Configuration

The `InstagramDownloader` accepts configuration options:

```typescript
interface DownloaderConfig {
  timeout?: number;        // Request timeout in milliseconds (default: 30000)
  maxRetries?: number;     // Maximum retry attempts (default: 3)
  userAgent?: string;      // Custom user agent
  proxyUrl?: string;       // Proxy URL for requests
}
```

## Testing

Run unit tests:

```bash
npm test -- tests/lib/instagram
```

Test coverage includes:

- URL validation for all supported formats
- Media ID extraction with special characters
- Error handling for invalid inputs
- Round-trip validation
- Concurrent operations
- Factory function creation
- Download method behavior
- Media type detection

## Security Considerations

- URLs are validated before processing
- Media IDs are restricted to alphanumeric characters, underscores, and hyphens
- Query parameters and fragments are stripped during validation
- API requests include proper error handling and timeouts

## Future Enhancements

- Integration with Instagram API (requires authentication)
- Support for private media
- Batch downloading
- Progress tracking
- Stream-based downloads for large files
- Thumbnail extraction
- Metadata extraction (caption, likes, comments)

## License

MIT
