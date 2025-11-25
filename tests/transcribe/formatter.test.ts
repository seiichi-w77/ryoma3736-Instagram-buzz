/**
 * Tests for Transcript Formatter Module
 *
 * @module tests/transcribe/formatter.test
 */

import { describe, it, expect } from 'vitest';
import {
  TranscriptFormatter,
  formatTranscription,
  type FormattedTranscript,
} from '@/lib/transcribe/formatter';
import type { TranscriptionResult } from '@/lib/transcribe/whisper';

describe('TranscriptFormatter', () => {
  /**
   * Sample transcription for testing
   */
  const sampleTranscription: TranscriptionResult = {
    text: 'Hello world. This is a test transcription. It contains multiple sentences.',
    language: 'en',
    duration: 5.5,
    segments: [
      {
        id: 0,
        seek: 0,
        start: 0,
        end: 1.5,
        text: 'Hello world.',
        tokens: [50364, 1107, 13],
        temperature: 0,
        avgLogprob: -0.45,
        compressionRatio: 1.2,
        noSpeechProb: 0.001,
      },
      {
        id: 1,
        seek: 0,
        start: 1.5,
        end: 3.5,
        text: 'This is a test transcription.',
        tokens: [1254, 307, 257, 1500, 15687, 13],
        temperature: 0,
        avgLogprob: -0.42,
        compressionRatio: 1.3,
        noSpeechProb: 0.002,
      },
      {
        id: 2,
        seek: 0,
        start: 3.5,
        end: 5.5,
        text: 'It contains multiple sentences.',
        tokens: [407, 8306, 3866, 16250, 13],
        temperature: 0,
        avgLogprob: -0.48,
        compressionRatio: 1.1,
        noSpeechProb: 0.001,
      },
    ],
  };

  describe('formatTime', () => {
    it('should format seconds to HH:MM:SS', () => {
      expect(TranscriptFormatter.formatTime(0)).toBe('00:00');
      expect(TranscriptFormatter.formatTime(65)).toBe('01:05');
      expect(TranscriptFormatter.formatTime(3665)).toBe('01:01:05');
    });

    it('should handle floating point seconds', () => {
      expect(TranscriptFormatter.formatTime(1.5)).toBe('00:01');
      expect(TranscriptFormatter.formatTime(65.9)).toBe('01:05');
    });
  });

  describe('formatSrtTime', () => {
    it('should format seconds to SRT time format (HH:MM:SS,mmm)', () => {
      expect(TranscriptFormatter.formatSrtTime(0)).toBe('00:00:00,000');
      expect(TranscriptFormatter.formatSrtTime(1.5)).toBe('00:00:01,500');
      expect(TranscriptFormatter.formatSrtTime(65.25)).toBe('00:01:05,250');
    });
  });

  describe('formatAsText', () => {
    it('should return raw text', () => {
      const result = TranscriptFormatter.formatAsText(sampleTranscription);
      expect(result).toBe(sampleTranscription.text);
    });

    it('should trim whitespace', () => {
      const result = TranscriptFormatter.formatAsText({
        text: '  test  ',
      });
      expect(result).toBe('test');
    });
  });

  describe('formatAsMarkdown', () => {
    it('should include language and duration information', () => {
      const result = TranscriptFormatter.formatAsMarkdown(sampleTranscription, false);
      expect(result).toContain('**Language**: en');
      expect(result).toContain('**Duration**');
    });

    it('should include segment timestamps when requested', () => {
      const result = TranscriptFormatter.formatAsMarkdown(sampleTranscription, true);
      expect(result).toContain('**00:00**');
      expect(result).toContain('Hello world.');
    });

    it('should handle transcription without segments', () => {
      const result = TranscriptFormatter.formatAsMarkdown({
        text: 'Simple transcription',
      });
      expect(result).toContain('Simple transcription');
      expect(result).toContain('## Transcript');
    });
  });

  describe('formatAsSrt', () => {
    it('should generate valid SRT format', () => {
      const result = TranscriptFormatter.formatAsSrt(sampleTranscription);
      expect(result).toContain('1\n');
      expect(result).toContain('00:00:00,000 --> ');
      expect(result).toContain('Hello');
    });

    it('should handle custom words per line', () => {
      const result = TranscriptFormatter.formatAsSrt(sampleTranscription, 5);
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should create subtitles from text when segments are unavailable', () => {
      const result = TranscriptFormatter.formatAsSrt({
        text: 'Test text for subtitle generation.',
      });
      expect(result).toContain('1\n');
      expect(result).toContain('-->');
      expect(result).toContain('Test');
    });
  });

  describe('formatAsScript', () => {
    it('should generate script entries with timestamps', () => {
      const result = TranscriptFormatter.formatAsScript(sampleTranscription);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          duration: expect.any(Number),
          text: 'Hello world.',
        })
      );
    });

    it('should handle transcription without segments', () => {
      const result = TranscriptFormatter.formatAsScript({
        text: 'Simple transcription',
        duration: 10,
      });
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Simple transcription');
      expect(result[0].duration).toBe(10);
    });

    it('should strip whitespace from segment text', () => {
      const result = TranscriptFormatter.formatAsScript(sampleTranscription);
      result.forEach((entry) => {
        expect(entry.text).toBe(entry.text.trim());
      });
    });
  });

  describe('generateSummary', () => {
    it('should generate summary from text', () => {
      const summary = TranscriptFormatter.generateSummary(
        'First sentence. Second sentence. Third sentence. Fourth sentence.',
        100
      );
      expect(summary.length).toBeLessThanOrEqual(100);
      expect(summary).toContain('First');
    });

    it('should respect maximum length', () => {
      const maxLength = 50;
      const summary = TranscriptFormatter.generateSummary(
        sampleTranscription.text,
        maxLength
      );
      expect(summary.length).toBeLessThanOrEqual(maxLength);
    });

    it('should handle single sentence text', () => {
      const summary = TranscriptFormatter.generateSummary('Single sentence.');
      expect(summary).toBe('Single sentence.');
    });
  });

  describe('formatComplete', () => {
    it('should generate all format types', () => {
      const result = TranscriptFormatter.formatComplete(sampleTranscription);
      expect(result).toHaveProperty('raw');
      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('srt');
      expect(result).toHaveProperty('script');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('summary');
    });

    it('should include metadata', () => {
      const result = TranscriptFormatter.formatComplete(sampleTranscription);
      expect(result.duration).toBe(5.5);
      expect(result.language).toBe('en');
    });

    it('should respect formatting options', () => {
      const result = TranscriptFormatter.formatComplete(sampleTranscription, {
        includeScript: false,
        generateSummary: false,
      });
      expect(result.script).toHaveLength(0);
      expect(result.summary).toBeUndefined();
    });
  });

  describe('createSubtitlesFromText', () => {
    it('should create subtitles from plain text', () => {
      const result = TranscriptFormatter.createSubtitlesFromText(
        'Hello world. This is a test.'
      );
      expect(result).toContain('1\n');
      expect(result).toContain('-->');
    });

    it('should handle text without punctuation', () => {
      const result = TranscriptFormatter.createSubtitlesFromText(
        'Hello world this is a test'
      );
      expect(result).toContain('-->');
    });
  });

  describe('formatTranscription helper', () => {
    it('should format as text', () => {
      const result = formatTranscription(sampleTranscription, 'text');
      expect(typeof result).toBe('string');
      expect(result).toContain('Hello world');
    });

    it('should format as markdown', () => {
      const result = formatTranscription(sampleTranscription, 'markdown');
      expect(typeof result).toBe('string');
      expect(result).toContain('## Transcript');
    });

    it('should format as srt', () => {
      const result = formatTranscription(sampleTranscription, 'srt');
      expect(typeof result).toBe('string');
      expect(result).toContain('-->');
    });

    it('should format as script', () => {
      const result = formatTranscription(sampleTranscription, 'script');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should format complete', () => {
      const result = formatTranscription(sampleTranscription, 'complete');
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('raw');
    });

    it('should default to text format', () => {
      const result = formatTranscription(sampleTranscription);
      expect(typeof result).toBe('string');
    });
  });
});
