/**
 * Whisper API Integration Module
 *
 * Handles audio file transcription using OpenAI's Whisper API.
 * Supports audio extraction from video files and direct audio transcription.
 *
 * @module lib/transcribe/whisper
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import OpenAI from 'openai';

const execPromise = promisify(exec);

/**
 * Whisper API configuration
 */
export interface WhisperConfig {
  apiKey: string;
  model?: 'whisper-1';
  language?: string;
  temperature?: number;
  responseFormat?: 'json' | 'text' | 'verbose_json';
}

/**
 * Transcription result from Whisper API
 */
export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
}

/**
 * Transcription segment with timing information
 */
export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avgLogprob: number;
  compressionRatio: number;
  noSpeechProb: number;
}

/**
 * Whisper API client for audio transcription
 */
export class WhisperClient {
  private openai: OpenAI;
  private model: WhisperConfig['model'];
  private language?: string;
  private temperature: number;
  private responseFormat: WhisperConfig['responseFormat'];

  /**
   * Initialize Whisper client
   *
   * @param config - Configuration for Whisper API
   */
  constructor(config: WhisperConfig) {
    if (!config.apiKey) {
      throw new Error('OPENAI_API_KEY is required for Whisper API');
    }

    this.openai = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || 'whisper-1';
    this.language = config.language;
    this.temperature = config.temperature ?? 0;
    this.responseFormat = config.responseFormat || 'json';
  }

  /**
   * Extract audio from video file using ffmpeg
   *
   * @param videoPath - Path to video file
   * @param outputPath - Path for extracted audio file
   * @returns Promise with audio file path
   */
  async extractAudioFromVideo(
    videoPath: string,
    outputPath: string
  ): Promise<string> {
    // Verify video file exists
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    try {
      // Extract audio using ffmpeg with optimized settings for Whisper
      // -vn: no video, -acodec libmp3lame: mp3 codec, -ar 16000: 16kHz sample rate
      await execPromise(
        `ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 "${outputPath}" -y`
      );

      if (!fs.existsSync(outputPath)) {
        throw new Error('Failed to extract audio from video');
      }

      return outputPath;
    } catch (error) {
      throw new Error(`Failed to extract audio: ${(error as Error).message}`);
    }
  }

  /**
   * Transcribe audio file using Whisper API
   *
   * @param audioPath - Path to audio file
   * @param verbose - Include detailed segments in response
   * @returns Promise with transcription result
   */
  async transcribeAudio(
    audioPath: string,
    verbose: boolean = false
  ): Promise<TranscriptionResult> {
    // Verify audio file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    try {
      // Create a readable stream from the file
      const audioStream = fs.createReadStream(audioPath);

      // Call Whisper API using OpenAI SDK
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioStream,
        model: this.model || 'whisper-1',
        language: this.language,
        temperature: this.temperature,
        response_format: verbose ? 'verbose_json' : (this.responseFormat || 'json'),
      });

      // Type assertion for verbose_json response
      const result = transcription as unknown as {
        text: string;
        language?: string;
        duration?: number;
        segments?: TranscriptionSegment[];
      };

      return {
        text: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments,
      };
    } catch (error) {
      throw new Error(
        `Failed to transcribe audio: ${(error as Error).message}`
      );
    }
  }

  /**
   * Transcribe video file directly
   * Extracts audio and then transcribes it
   *
   * @param videoPath - Path to video file
   * @param verbose - Include detailed segments in response
   * @returns Promise with transcription result
   */
  async transcribeVideo(
    videoPath: string,
    verbose: boolean = false
  ): Promise<TranscriptionResult> {
    // Create temporary audio file path
    const tempDir = path.join(process.cwd(), '.tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const audioPath = path.join(tempDir, `audio-${Date.now()}.mp3`);

    try {
      // Extract audio from video
      await this.extractAudioFromVideo(videoPath, audioPath);

      // Transcribe extracted audio
      const result = await this.transcribeAudio(audioPath, verbose);

      return result;
    } finally {
      // Clean up temporary audio file
      if (fs.existsSync(audioPath)) {
        try {
          fs.unlinkSync(audioPath);
        } catch (error) {
          console.error('Failed to clean up temp file:', error);
        }
      }
    }
  }

  /**
   * Process multiple audio files
   *
   * @param filePaths - Array of audio/video file paths
   * @param verbose - Include detailed segments in response
   * @returns Promise with array of transcription results
   */
  async transcribeMultiple(
    filePaths: string[],
    verbose: boolean = false
  ): Promise<TranscriptionResult[]> {
    const results: TranscriptionResult[] = [];

    for (const filePath of filePaths) {
      try {
        const ext = path.extname(filePath).toLowerCase();
        let result: TranscriptionResult;

        if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
          result = await this.transcribeVideo(filePath, verbose);
        } else {
          result = await this.transcribeAudio(filePath, verbose);
        }

        results.push(result);
      } catch (error) {
        console.error(`Error transcribing ${filePath}:`, error);
        results.push({
          text: '',
          language: undefined,
        });
      }
    }

    return results;
  }
}

/**
 * Create Whisper client with environment configuration
 *
 * @returns WhisperClient instance
 */
export function createWhisperClient(): WhisperClient {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = (process.env.WHISPER_MODEL || 'whisper-1') as WhisperConfig['model'];
  const language = process.env.WHISPER_LANGUAGE;
  const temperature = process.env.WHISPER_TEMPERATURE
    ? parseFloat(process.env.WHISPER_TEMPERATURE)
    : 0;

  return new WhisperClient({
    apiKey: apiKey || '',
    model,
    language,
    temperature,
  });
}

/**
 * Convenience function to transcribe a file (audio or video) from file path
 *
 * This function automatically detects the file type and handles:
 * - Direct audio transcription for audio files
 * - Audio extraction + transcription for video files
 * - Temporary file cleanup
 *
 * @param filePath - Path to the audio or video file
 * @param options - Optional transcription settings
 * @returns Promise with transcription result
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await transcribeFile('/path/to/video.mp4');
 * console.log(result.text);
 *
 * // With language specification
 * const result = await transcribeFile('/path/to/video.mp4', { language: 'ja' });
 *
 * // With verbose output (includes segments)
 * const result = await transcribeFile('/path/to/video.mp4', { verbose: true });
 * console.log(result.segments);
 * ```
 */
export async function transcribeFile(
  filePath: string,
  options?: {
    language?: string;
    verbose?: boolean;
    apiKey?: string;
  }
): Promise<TranscriptionResult> {
  // Initialize client with provided API key or environment variable
  const apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required. Provide it via options or environment variable.');
  }

  const client = new WhisperClient({
    apiKey,
    model: 'whisper-1',
    language: options?.language,
    temperature: 0,
    responseFormat: 'verbose_json',
  });

  // Determine file type by extension
  const ext = path.extname(filePath).toLowerCase();
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];

  // Verify file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    // Process based on file type
    if (videoExtensions.includes(ext)) {
      // Video file: extract audio then transcribe
      return await client.transcribeVideo(filePath, options?.verbose ?? false);
    } else if (audioExtensions.includes(ext)) {
      // Audio file: transcribe directly
      return await client.transcribeAudio(filePath, options?.verbose ?? false);
    } else {
      // Unknown extension: try as video (might work with ffmpeg)
      console.warn(`Unknown file extension ${ext}, attempting video transcription`);
      return await client.transcribeVideo(filePath, options?.verbose ?? false);
    }
  } catch (error) {
    throw new Error(
      `Failed to transcribe file ${filePath}: ${(error as Error).message}`
    );
  }
}
