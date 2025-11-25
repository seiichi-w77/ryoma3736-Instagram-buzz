/**
 * Transcript Formatter Module
 *
 * Handles formatting of transcribed text into various output formats
 * including markdown, SRT subtitles, and structured scripts.
 *
 * @module lib/transcribe/formatter
 */

import { TranscriptionResult } from './whisper';

/**
 * Subtitle entry with timing
 */
export interface SubtitleEntry {
  index: number;
  start: string;
  end: string;
  text: string;
}

/**
 * Script entry with speaker and timing
 */
export interface ScriptEntry {
  timestamp: string;
  duration: number;
  text: string;
}

/**
 * Formatted transcript output
 */
export interface FormattedTranscript {
  raw: string;
  markdown: string;
  srt: string;
  script: ScriptEntry[];
  duration?: number;
  language?: string;
  summary?: string;
}

/**
 * Transcript formatter for various output formats
 */
export class TranscriptFormatter {
  /**
   * Format seconds to HH:MM:SS format
   *
   * @param seconds - Duration in seconds
   * @returns Formatted time string
   */
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(hours.toString().padStart(2, '0'));
    }
    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(secs.toString().padStart(2, '0'));

    return parts.join(':');
  }

  /**
   * Format time for SRT format (HH:MM:SS,mmm)
   *
   * @param seconds - Duration in seconds
   * @returns Formatted SRT time string
   */
  static formatSrtTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return (
      `${hours.toString().padStart(2, '0')}:` +
      `${minutes.toString().padStart(2, '0')}:` +
      `${secs.toString().padStart(2, '0')},` +
      `${ms.toString().padStart(3, '0')}`
    );
  }

  /**
   * Create simple text format (raw transcription)
   *
   * @param transcription - Transcription result
   * @returns Formatted text
   */
  static formatAsText(transcription: TranscriptionResult): string {
    return transcription.text.trim();
  }

  /**
   * Create markdown format with optional timestamps
   *
   * @param transcription - Transcription result
   * @param includeTimestamps - Whether to include segment timestamps
   * @returns Markdown formatted text
   */
  static formatAsMarkdown(
    transcription: TranscriptionResult,
    includeTimestamps: boolean = false
  ): string {
    const lines: string[] = [];

    if (transcription.language) {
      lines.push(`**Language**: ${transcription.language}\n`);
    }

    if (transcription.duration) {
      lines.push(
        `**Duration**: ${this.formatTime(transcription.duration)}\n`
      );
    }

    if (includeTimestamps && transcription.segments && transcription.segments.length > 0) {
      lines.push('## Transcript\n');
      transcription.segments.forEach((segment) => {
        const time = this.formatTime(segment.start);
        lines.push(`**${time}** ${segment.text}`);
      });
    } else {
      lines.push('## Transcript\n');
      lines.push(transcription.text);
    }

    return lines.join('\n');
  }

  /**
   * Create SRT subtitle format
   *
   * @param transcription - Transcription result
   * @param wordsPerLine - Number of words per subtitle line (default: 10)
   * @returns SRT format string
   */
  static formatAsSrt(
    transcription: TranscriptionResult,
    wordsPerLine: number = 10
  ): string {
    if (!transcription.segments || transcription.segments.length === 0) {
      // Fallback: create subtitles from raw text
      return this.createSubtitlesFromText(transcription.text);
    }

    const subtitles: SubtitleEntry[] = [];
    let index = 1;

    transcription.segments.forEach((segment) => {
      const words = segment.text.trim().split(/\s+/);

      for (let i = 0; i < words.length; i += wordsPerLine) {
        const chunk = words.slice(i, i + wordsPerLine).join(' ');
        const startTime =
          segment.start + (i / words.length) * (segment.end - segment.start);
        const endTime =
          segment.start +
          (Math.min(i + wordsPerLine, words.length) / words.length) *
            (segment.end - segment.start);

        subtitles.push({
          index: index++,
          start: this.formatSrtTime(startTime),
          end: this.formatSrtTime(endTime),
          text: chunk,
        });
      }
    });

    return subtitles
      .map((sub) => `${sub.index}\n${sub.start} --> ${sub.end}\n${sub.text}\n`)
      .join('\n');
  }

  /**
   * Create script format with timestamps
   *
   * @param transcription - Transcription result
   * @returns Array of script entries
   */
  static formatAsScript(transcription: TranscriptionResult): ScriptEntry[] {
    if (!transcription.segments || transcription.segments.length === 0) {
      return [
        {
          timestamp: '00:00:00',
          duration: transcription.duration || 0,
          text: transcription.text,
        },
      ];
    }

    return transcription.segments.map((segment) => ({
      timestamp: this.formatTime(segment.start),
      duration: segment.end - segment.start,
      text: segment.text.trim(),
    }));
  }

  /**
   * Create subtitles from raw text without timing information
   *
   * @param text - Raw text content
   * @param charsPerLine - Characters per subtitle line (default: 40)
   * @returns SRT format string
   */
  static createSubtitlesFromText(
    text: string
  ): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const subtitles: SubtitleEntry[] = [];

    sentences.forEach((sentence, index) => {
      const words = sentence.trim().split(/\s+/);
      const totalTime = 10; // Default 10 seconds per sentence
      const timePerWord = totalTime / words.length;

      let currentTime = index * totalTime;

      for (let i = 0; i < words.length; i += 10) {
        const chunk = words.slice(i, i + 10).join(' ');
        subtitles.push({
          index: subtitles.length + 1,
          start: this.formatSrtTime(currentTime),
          end: this.formatSrtTime(currentTime + Math.min(10, words.length - i) * timePerWord),
          text: chunk.trim(),
        });

        currentTime += Math.min(10, words.length - i) * timePerWord;
      }
    });

    return subtitles
      .map((sub) => `${sub.index}\n${sub.start} --> ${sub.end}\n${sub.text}\n`)
      .join('\n');
  }

  /**
   * Generate summary of transcript using prompt
   *
   * @param text - Transcript text
   * @param maxLength - Maximum summary length in characters
   * @returns Summary text
   */
  static generateSummary(text: string, maxLength: number = 300): string {
    // Simple extractive summary: take first N sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let summary = '';

    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) {
        break;
      }
      summary += sentence;
    }

    return summary.trim() || text.substring(0, maxLength);
  }

  /**
   * Format complete transcript with all formats
   *
   * @param transcription - Transcription result
   * @param options - Formatting options
   * @returns Formatted transcript object
   */
  static formatComplete(
    transcription: TranscriptionResult,
    options: {
      includeMarkdownTimestamps?: boolean;
      includeScript?: boolean;
      generateSummary?: boolean;
      summaryMaxLength?: number;
    } = {}
  ): FormattedTranscript {
    const {
      includeMarkdownTimestamps = true,
      includeScript = true,
      generateSummary: shouldGenerateSummary = true,
      summaryMaxLength = 300,
    } = options;

    return {
      raw: this.formatAsText(transcription),
      markdown: this.formatAsMarkdown(transcription, includeMarkdownTimestamps),
      srt: this.formatAsSrt(transcription),
      script: includeScript ? this.formatAsScript(transcription) : [],
      duration: transcription.duration,
      language: transcription.language,
      summary: shouldGenerateSummary
        ? this.generateSummary(transcription.text, summaryMaxLength)
        : undefined,
    };
  }
}

/**
 * Helper function to format transcription result
 *
 * @param transcription - Transcription result
 * @param format - Output format type
 * @returns Formatted output
 */
export function formatTranscription(
  transcription: TranscriptionResult,
  format: 'text' | 'markdown' | 'srt' | 'script' | 'complete' = 'text'
): string | ScriptEntry[] | FormattedTranscript {
  switch (format) {
    case 'markdown':
      return TranscriptFormatter.formatAsMarkdown(transcription, true);
    case 'srt':
      return TranscriptFormatter.formatAsSrt(transcription);
    case 'script':
      return TranscriptFormatter.formatAsScript(transcription);
    case 'complete':
      return TranscriptFormatter.formatComplete(transcription);
    case 'text':
    default:
      return TranscriptFormatter.formatAsText(transcription);
  }
}
