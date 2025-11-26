/**
 * Whisper API Integration Tests
 *
 * Tests for audio/video transcription functionality using OpenAI Whisper API.
 * Note: These are unit tests with mocked dependencies.
 *
 * @module tests/lib/transcribe/whisper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhisperClient, transcribeFile, createWhisperClient, type TranscriptionResult } from '../../../lib/transcribe/whisper';

// Mock OpenAI SDK at the top level
const mockTranscriptionResponse = {
  text: 'This is a test transcription from Instagram Reel.',
  language: 'en',
  duration: 32.5,
  segments: [
    {
      id: 0,
      seek: 0,
      start: 0.0,
      end: 5.0,
      text: 'This is a test',
      tokens: [1, 2, 3],
      temperature: 0.0,
      avgLogprob: -0.3,
      compressionRatio: 1.5,
      noSpeechProb: 0.01,
    },
    {
      id: 1,
      seek: 500,
      start: 5.0,
      end: 10.0,
      text: ' transcription from Instagram Reel.',
      tokens: [4, 5, 6],
      temperature: 0.0,
      avgLogprob: -0.25,
      compressionRatio: 1.6,
      noSpeechProb: 0.02,
    },
  ],
};

const mockCreateTranscription = vi.fn().mockResolvedValue(mockTranscriptionResponse);

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: mockCreateTranscription,
      },
    },
  })),
}));

// Mock child_process
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  return {
    ...actual,
    exec: vi.fn((cmd: string, callback: Function) => {
      callback(null, { stdout: 'ffmpeg conversion successful', stderr: '' });
    }),
  };
});

// Mock fs module
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi.fn().mockReturnValue(Buffer.from('fake audio data')),
      createReadStream: vi.fn().mockReturnValue({
        pipe: vi.fn(),
        on: vi.fn(),
      }),
      writeFileSync: vi.fn(),
      unlinkSync: vi.fn(),
      mkdirSync: vi.fn(),
      statSync: vi.fn().mockReturnValue({ size: 1024 * 1024 }),
    },
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockReturnValue(Buffer.from('fake audio data')),
    createReadStream: vi.fn().mockReturnValue({
      pipe: vi.fn(),
      on: vi.fn(),
    }),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    mkdirSync: vi.fn(),
    statSync: vi.fn().mockReturnValue({ size: 1024 * 1024 }),
  };
});

describe('WhisperClient', () => {
  const mockApiKey = 'sk-test-api-key-12345';

  describe('Constructor', () => {
    it('should initialize with valid configuration', () => {
      const client = new WhisperClient({
        apiKey: mockApiKey,
        model: 'whisper-1',
        language: 'en',
        temperature: 0,
        responseFormat: 'json',
      });

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(WhisperClient);
    });

    it('should throw error when API key is missing', () => {
      expect(() => {
        new WhisperClient({
          apiKey: '',
          model: 'whisper-1',
        });
      }).toThrow('OPENAI_API_KEY is required for Whisper API');
    });

    it('should use default model when not specified', () => {
      const client = new WhisperClient({
        apiKey: mockApiKey,
      });
      expect(client).toBeDefined();
    });
  });

  describe('transcribeAudio', () => {
    let client: WhisperClient;

    beforeEach(() => {
      client = new WhisperClient({
        apiKey: mockApiKey,
        model: 'whisper-1',
        language: 'en',
      });
      vi.clearAllMocks();
    });

    it('should transcribe audio file successfully', async () => {
      const result = await client.transcribeAudio('/test/audio.mp3', false);

      expect(result).toBeDefined();
      expect(result.text).toBe('This is a test transcription from Instagram Reel.');
      expect(result.language).toBe('en');
      expect(result.duration).toBe(32.5);
      expect(mockCreateTranscription).toHaveBeenCalled();
    });

    it('should include segments when verbose is true', async () => {
      const result = await client.transcribeAudio('/test/audio.mp3', true);

      expect(result.segments).toBeDefined();
      expect(result.segments).toHaveLength(2);
      expect(result.segments?.[0].text).toBe('This is a test');
      expect(result.segments?.[1].text).toBe(' transcription from Instagram Reel.');
    });
  });

  describe('transcribeVideo', () => {
    let client: WhisperClient;

    beforeEach(() => {
      client = new WhisperClient({
        apiKey: mockApiKey,
        model: 'whisper-1',
      });
      vi.clearAllMocks();
    });

    it('should transcribe video file successfully', async () => {
      const result = await client.transcribeVideo('/test/video.mp4', false);

      expect(result).toBeDefined();
      expect(result.text).toBe('This is a test transcription from Instagram Reel.');
      expect(result.duration).toBe(32.5);
    });

    it('should handle verbose mode for video files', async () => {
      const result = await client.transcribeVideo('/test/video.mp4', true);

      expect(result.segments).toBeDefined();
      expect(result.segments).toHaveLength(2);
    });
  });
});

describe('transcribeFile (convenience function)', () => {
  const mockApiKey = 'sk-test-api-key-12345';

  beforeEach(() => {
    process.env.OPENAI_API_KEY = mockApiKey;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('should transcribe video file using file path', async () => {
    const result = await transcribeFile('/test/video.mp4');

    expect(result).toBeDefined();
    expect(result.text).toBe('This is a test transcription from Instagram Reel.');
    expect(result.language).toBe('en');
    expect(result.duration).toBe(32.5);
  });

  it('should transcribe audio file using file path', async () => {
    const result = await transcribeFile('/test/audio.mp3');

    expect(result).toBeDefined();
    expect(result.text).toBe('This is a test transcription from Instagram Reel.');
  });

  it('should support language option', async () => {
    const result = await transcribeFile('/test/video.mp4', { language: 'ja' });

    expect(result).toBeDefined();
    expect(result.text).toBeTruthy();
  });

  it('should support verbose option', async () => {
    const result = await transcribeFile('/test/video.mp4', { verbose: true });

    expect(result).toBeDefined();
    expect(result.segments).toBeDefined();
    expect(result.segments).toHaveLength(2);
  });

  it('should accept API key via options', async () => {
    delete process.env.OPENAI_API_KEY;

    const result = await transcribeFile('/test/video.mp4', {
      apiKey: 'custom-api-key',
    });

    expect(result).toBeDefined();
    expect(result.text).toBeTruthy();
  });

  it('should throw error when API key is not provided', async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(
      transcribeFile('/test/video.mp4')
    ).rejects.toThrow('OPENAI_API_KEY is required');
  });

  it('should handle various video formats', async () => {
    const videoFormats = [
      '/test/video.mp4',
      '/test/video.mov',
      '/test/video.avi',
      '/test/video.mkv',
      '/test/video.webm',
    ];

    for (const format of videoFormats) {
      const result = await transcribeFile(format);
      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    }
  });

  it('should handle various audio formats', async () => {
    const audioFormats = [
      '/test/audio.mp3',
      '/test/audio.wav',
      '/test/audio.m4a',
      '/test/audio.aac',
      '/test/audio.ogg',
      '/test/audio.flac',
    ];

    for (const format of audioFormats) {
      const result = await transcribeFile(format);
      expect(result).toBeDefined();
      expect(result.text).toBeTruthy();
    }
  });
});

describe('createWhisperClient (factory function)', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.WHISPER_MODEL = 'whisper-1';
    process.env.WHISPER_LANGUAGE = 'en';
    process.env.WHISPER_TEMPERATURE = '0.5';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.WHISPER_MODEL;
    delete process.env.WHISPER_LANGUAGE;
    delete process.env.WHISPER_TEMPERATURE;
  });

  it('should create client from environment variables', () => {
    const client = createWhisperClient();

    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(WhisperClient);
  });

  it('should use default model when not specified', () => {
    delete process.env.WHISPER_MODEL;

    const client = createWhisperClient();

    expect(client).toBeDefined();
  });

  it('should use default temperature when not specified', () => {
    delete process.env.WHISPER_TEMPERATURE;

    const client = createWhisperClient();

    expect(client).toBeDefined();
  });
});

describe('Integration scenarios', () => {
  const mockApiKey = 'sk-test-api-key-12345';

  beforeEach(() => {
    process.env.OPENAI_API_KEY = mockApiKey;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('should handle complete workflow: video download -> transcription', async () => {
    // Simulate downloaded video file
    const videoPath = '/downloads/reel-12345.mp4';

    const result = await transcribeFile(videoPath, {
      language: 'ja',
      verbose: true,
    });

    expect(result).toBeDefined();
    expect(result.text).toBeTruthy();
    expect(result.segments).toBeDefined();
  });

  it('should match expected output format from requirements', async () => {
    const result = await transcribeFile('/test/video.mp4', { language: 'ja' });

    // Verify output matches specification from Issue #21
    expect(result).toMatchObject({
      text: expect.any(String),
      language: expect.any(String),
      duration: expect.any(Number),
    });

    // Ensure required fields are present
    expect(result.text).toBeTruthy();
    expect(result.language).toBe('en');
    expect(typeof result.duration).toBe('number');
  });

  it('should handle Japanese language transcription', async () => {
    const result = await transcribeFile('/test/japanese-video.mp4', {
      language: 'ja',
      verbose: false,
    });

    expect(result).toBeDefined();
    expect(result.text).toBeTruthy();
  });

  it('should extract audio from video before transcription', async () => {
    const { exec } = await import('child_process');

    const result = await transcribeFile('/test/video.mp4');

    expect(result).toBeDefined();
    expect(exec).toHaveBeenCalled();
  });
});

describe('API Response Format', () => {
  it('should return response matching SUB-1 specification', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const result: TranscriptionResult = await transcribeFile('/test/video.mp4', {
      language: 'ja',
    });

    // Validate against SUB-1 output specification
    expect(result).toEqual(
      expect.objectContaining({
        text: expect.any(String),
        language: expect.any(String),
        duration: expect.any(Number),
      })
    );

    // Ensure text is not empty
    expect(result.text.length).toBeGreaterThan(0);

    delete process.env.OPENAI_API_KEY;
  });
});
