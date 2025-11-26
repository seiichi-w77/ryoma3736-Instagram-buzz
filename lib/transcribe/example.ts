/**
 * Example usage of Whisper transcription module
 *
 * This file demonstrates how to use the transcription features
 * for Instagram Reels and other video content.
 */

import { WhisperClient } from './whisper';
import { TranscriptFormatter, formatTranscription as _formatTranscription } from './formatter';

/**
 * Example 1: Basic transcription from file path
 */
export async function basicTranscription(filePath: string) {
  // Initialize Whisper client
  const client = new WhisperClient({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'whisper-1',
    language: 'ja', // Japanese
    temperature: 0,
  });

  // Transcribe video
  const result = await client.transcribeVideo(filePath);

  console.log('Transcription:', result.text);
  console.log('Language:', result.language);
  console.log('Duration:', result.duration, 'seconds');

  return result;
}

/**
 * Example 2: Transcription with segments and formatting
 */
export async function detailedTranscription(filePath: string) {
  const client = new WhisperClient({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'whisper-1',
  });

  // Get transcription with segments
  const result = await client.transcribeVideo(filePath, true);

  // Format as SRT subtitles
  const srt = TranscriptFormatter.formatAsSrt(result);
  console.log('SRT Subtitles:', srt);

  // Format as markdown with timestamps
  const markdown = TranscriptFormatter.formatAsMarkdown(result, true);
  console.log('Markdown:', markdown);

  // Get complete formatted output
  const complete = TranscriptFormatter.formatComplete(result, {
    includeMarkdownTimestamps: true,
    includeScript: true,
    generateSummary: true,
  });

  return complete;
}

/**
 * Example 3: Complete workflow - Download and Transcribe
 */
export async function downloadAndTranscribe(instagramUrl: string) {
  // Step 1: Download video using API
  const downloadResponse = await fetch('/api/reels/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: instagramUrl,
      quality: 'high',
    }),
  });

  const downloadData = await downloadResponse.json();

  if (!downloadData.success) {
    throw new Error(`Download failed: ${downloadData.error}`);
  }

  const { filePath } = downloadData.data;

  // Step 2: Transcribe downloaded file using API
  const transcribeResponse = await fetch('/api/reels/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath,
      format: 'complete',
      language: 'ja',
      verbose: true,
    }),
  });

  const transcriptionData = await transcribeResponse.json();

  if (!transcriptionData.success) {
    throw new Error(`Transcription failed: ${transcriptionData.error}`);
  }

  return {
    download: downloadData.data,
    transcription: transcriptionData.data,
  };
}

/**
 * Example 4: Batch transcription of multiple files
 */
export async function batchTranscription(filePaths: string[]) {
  const client = new WhisperClient({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'whisper-1',
  });

  // Process all files
  const results = await client.transcribeMultiple(filePaths, false);

  // Format each result
  const formatted = results.map((result, index) => ({
    file: filePaths[index],
    text: result.text,
    language: result.language,
    duration: result.duration,
    summary: TranscriptFormatter.generateSummary(result.text),
  }));

  return formatted;
}

/**
 * Example 5: API route usage with fetch
 */
export async function apiRouteExample() {
  // Example 1: File upload
  const formData = new FormData();
  formData.append('file', new File(['...'], 'video.mp4'));
  formData.append('format', 'text');
  formData.append('language', 'ja');

  const uploadResponse = await fetch('/api/reels/transcribe', {
    method: 'POST',
    body: formData,
  });

  const uploadResult = await uploadResponse.json();
  console.log('Upload result:', uploadResult.data.text);

  // Example 2: File path
  const pathResponse = await fetch('/api/reels/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath: '/absolute/path/to/video.mp4',
      format: 'markdown',
      language: 'en',
    }),
  });

  const pathResult = await pathResponse.json();
  console.log('Path result:', pathResult.data.formatted);
}

/**
 * Example 6: Error handling
 */
export async function errorHandlingExample(filePath: string) {
  const client = new WhisperClient({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  try {
    const result = await client.transcribeVideo(filePath);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('File not found')) {
        console.error('File does not exist:', filePath);
      } else if (error.message.includes('Whisper API error')) {
        console.error('API error:', error.message);
      } else if (error.message.includes('Failed to extract audio')) {
        console.error('FFmpeg error - is FFmpeg installed?');
      } else {
        console.error('Unknown error:', error.message);
      }
    }
    throw error;
  }
}

/**
 * Example 7: Custom formatting
 */
export async function customFormattingExample(filePath: string) {
  const client = new WhisperClient({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const result = await client.transcribeVideo(filePath, true);

  // Custom script format
  if (result.segments) {
    const customScript = result.segments.map((segment, index) => ({
      line: index + 1,
      time: TranscriptFormatter.formatTime(segment.start),
      duration: `${(segment.end - segment.start).toFixed(1)}s`,
      text: segment.text.trim(),
      confidence: (1 - segment.noSpeechProb).toFixed(2),
    }));

    console.table(customScript);
  }

  return result;
}

// Example usage in a Next.js server component or API route:
/*
import { basicTranscription } from '@/lib/transcribe/example';

export async function POST(request: Request) {
  const { filePath } = await request.json();
  const result = await basicTranscription(filePath);
  return Response.json({ success: true, data: result });
}
*/
