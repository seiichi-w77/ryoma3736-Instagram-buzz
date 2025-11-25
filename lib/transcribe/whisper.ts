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

const execPromise = promisify(exec);

/**
 * Whisper API configuration
 */
export interface WhisperConfig {
  apiKey: string;
  model?: 'tiny' | 'base' | 'small' | 'medium' | 'large';
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
  private apiKey: string;
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

    this.apiKey = config.apiKey;
    this.model = config.model || 'base';
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
      // Extract audio using ffmpeg
      // ffmpeg -i input.mp4 -q:a 0 -map a output.mp3
      await execPromise(
        `ffmpeg -i "${videoPath}" -q:a 0 -map a "${outputPath}" -y`
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
      const audioBuffer = fs.readFileSync(audioPath);
      const formData = new FormData();

      // Append file to form data
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      formData.append('file', blob, path.basename(audioPath));
      formData.append('model', String(this.model || 'base'));
      formData.append('temperature', String(this.temperature ?? 0));
      formData.append(
        'response_format',
        verbose ? 'verbose_json' : (this.responseFormat || 'json')
      );

      if (this.language) {
        formData.append('language', this.language);
      }

      // Call Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Whisper API error: ${error.error?.message || response.statusText}`
        );
      }

      const result = await response.json();

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
  const model = (process.env.WHISPER_MODEL || 'base') as WhisperConfig['model'];
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
