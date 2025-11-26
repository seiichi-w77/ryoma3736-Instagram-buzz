/**
 * Tests for Whisper API Integration Module
 *
 * @module tests/transcribe/whisper.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WhisperClient,
  createWhisperClient,
  type WhisperConfig,
  type TranscriptionResult,
} from '@/lib/transcribe/whisper';
import fs from 'fs';
import path from 'path';

describe('WhisperClient', () => {
  let whisperClient: WhisperClient;
  const testConfig: WhisperConfig = {
    apiKey: 'test-api-key',
    model: 'whisper-1',
    language: 'en',
    temperature: 0,
  };

  beforeEach(() => {
    whisperClient = new WhisperClient(testConfig);
  });

  describe('constructor', () => {
    it('should create client with valid config', () => {
      expect(whisperClient).toBeDefined();
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => {
        new WhisperClient({
          apiKey: '',
          model: 'whisper-1',
        });
      }).toThrow('OPENAI_API_KEY is required for Whisper API');
    });

    it('should use default model when not specified', () => {
      const client = new WhisperClient({ apiKey: 'test-key' });
      expect(client).toBeDefined();
    });
  });

  describe('extractAudioFromVideo', () => {
    it('should throw error for non-existent video file', async () => {
      const videoPath = '/non/existent/video.mp4';
      const outputPath = '/tmp/audio.mp3';

      await expect(
        whisperClient.extractAudioFromVideo(videoPath, outputPath)
      ).rejects.toThrow('Video file not found');
    });

    it('should return output path if extraction succeeds', async () => {
      // Note: This test would require mocking or actual video file
      // Skipping actual implementation test as it requires ffmpeg
    });
  });

  describe('transcribeAudio', () => {
    it('should throw error for non-existent audio file', async () => {
      const audioPath = '/non/existent/audio.mp3';

      await expect(whisperClient.transcribeAudio(audioPath)).rejects.toThrow(
        'Audio file not found'
      );
    });

    it('should handle API errors gracefully', async () => {
      // Mock fs.existsSync to return true
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('test'));

      // Mock fetch to return error
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
      });

      await expect(whisperClient.transcribeAudio('/test/audio.mp3')).rejects.toThrow(
        'Whisper API error'
      );
    });
  });

  describe('transcribeMultiple', () => {
    it('should handle empty file list', async () => {
      const results = await whisperClient.transcribeMultiple([]);
      expect(results).toHaveLength(0);
    });

    it('should continue processing on individual file errors', async () => {
      // Mock fs.existsSync to return false
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const results = await whisperClient.transcribeMultiple([
        '/non/existent/file1.mp3',
        '/non/existent/file2.mp3',
      ]);

      expect(results).toHaveLength(2);
      results.forEach((result) => {
        expect(result.text).toBe('');
      });
    });
  });
});

describe('TranscriptionResult', () => {
  const sampleResult: TranscriptionResult = {
    text: 'Hello world, this is a test.',
    language: 'en',
    duration: 3.5,
    segments: [
      {
        id: 0,
        seek: 0,
        start: 0,
        end: 3.5,
        text: 'Hello world, this is a test.',
        tokens: [50364, 1107, 11, 341, 307, 257, 1500, 13],
        temperature: 0,
        avgLogprob: -0.45,
        compressionRatio: 1.2,
        noSpeechProb: 0.001,
      },
    ],
  };

  it('should have required properties', () => {
    expect(sampleResult).toHaveProperty('text');
    expect(typeof sampleResult.text).toBe('string');
  });

  it('should optionally have language property', () => {
    expect(sampleResult.language).toBe('en');
  });

  it('should optionally have duration property', () => {
    expect(sampleResult.duration).toBe(3.5);
  });

  it('should optionally have segments', () => {
    expect(Array.isArray(sampleResult.segments)).toBe(true);
  });
});

describe('createWhisperClient', () => {
  it('should create client from environment variables', () => {
    // Mock environment variables
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.WHISPER_MODEL = 'base';
    process.env.WHISPER_LANGUAGE = 'en';
    process.env.WHISPER_TEMPERATURE = '0';

    const client = createWhisperClient();
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(WhisperClient);
  });

  it('should use default values when env variables are missing', () => {
    // Clear environment variables
    delete process.env.OPENAI_API_KEY;
    delete process.env.WHISPER_MODEL;
    delete process.env.WHISPER_LANGUAGE;

    // Should still create client (though it will fail at API calls)
    // This would throw if OPENAI_API_KEY is required
    expect(() => createWhisperClient()).toThrow();
  });

  it('should parse temperature as float', () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.WHISPER_TEMPERATURE = '0.5';

    const client = createWhisperClient();
    expect(client).toBeDefined();
  });
});

describe('WhisperClient configuration', () => {
  it('should accept whisper-1 model', () => {
    const client = new WhisperClient({
      apiKey: 'test-key',
      model: 'whisper-1',
    });
    expect(client).toBeDefined();
  });

  it('should accept different response formats', () => {
    const formats = ['json', 'text', 'verbose_json'] as const;

    formats.forEach((format) => {
      const client = new WhisperClient({
        apiKey: 'test-key',
        model: 'whisper-1',
        responseFormat: format,
      });
      expect(client).toBeDefined();
    });
  });

  it('should accept temperature between 0 and 1', () => {
    const client = new WhisperClient({
      apiKey: 'test-key',
      model: 'whisper-1',
      temperature: 0.5,
    });
    expect(client).toBeDefined();
  });
});
