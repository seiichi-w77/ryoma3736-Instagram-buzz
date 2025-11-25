'use client';

import { useState, useCallback } from 'react';
import {
  Instagram,
  Home,
  Download,
  FileText,
  TrendingUp,
  MessageSquare,
  Film,
  FileEdit,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';

// API Response Types
interface ReelInfo {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  author?: string;
}

interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
}

interface BuzzAnalysis {
  score: number;
  factors: string[];
  recommendations: string[];
  viralPotential?: string;
}

interface ThreadsPost {
  content: string;
  hashtags?: string[];
  suggestedTime?: string;
}

interface ScriptGeneration {
  script: string;
  scenes?: string[];
  duration?: number;
  tone?: string;
}

interface CaptionGeneration {
  caption: string;
  hashtags?: string[];
  callToAction?: string;
}

type TabType =
  | 'reelInfo'
  | 'transcription'
  | 'buzzAnalysis'
  | 'threads'
  | 'script'
  | 'caption';

export default function DashboardPage() {
  // State
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('reelInfo');
  const [copied, setCopied] = useState(false);

  // Results
  const [reelInfo, setReelInfo] = useState<ReelInfo | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(
    null
  );
  const [buzzAnalysis, setBuzzAnalysis] = useState<BuzzAnalysis | null>(null);
  const [threadsPost, setThreadsPost] = useState<ThreadsPost | null>(null);
  const [script, setScript] = useState<ScriptGeneration | null>(null);
  const [caption, setCaption] = useState<CaptionGeneration | null>(null);

  // Download Reel Info Handler
  const handleDownloadReel = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter an Instagram URL');
      return;
    }

    setLoading((prev) => ({ ...prev, download: true }));
    setError(null);

    try {
      const response = await fetch('/api/reels/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Extract reel info from download response
        const info: ReelInfo = {
          url: result.data.mediaUrl || url,
          title: result.data.fileName,
          description: `Media Type: ${result.data.mediaType}`,
          thumbnail: result.data.mediaUrl,
          // Note: Additional metadata would come from Instagram API
        };
        setReelInfo(info);
        setActiveTab('reelInfo');
      } else {
        throw new Error('Failed to download reel information');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error downloading reel:', err);
    } finally {
      setLoading((prev) => ({ ...prev, download: false }));
    }
  }, [url]);

  // Transcribe Handler - uses URL-based transcription API
  const handleTranscribe = useCallback(async () => {
    if (!reelInfo?.url) {
      setError('Please download the reel first to get the video URL');
      return;
    }

    setLoading((prev) => ({ ...prev, transcribe: true }));
    setError(null);

    try {
      // Use URL-based transcription API
      const response = await fetch('/api/reels/transcribe-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: reelInfo.url,
          language: 'auto',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const transcriptionResult: TranscriptionResult = {
          text: result.data.text || result.data.transcription || '',
          language: result.data.language || 'en',
          confidence: result.data.confidence || 0.9,
        };
        setTranscription(transcriptionResult);
        setActiveTab('transcription');
      } else {
        throw new Error(result.error || 'Failed to transcribe video');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error transcribing:', err);
    } finally {
      setLoading((prev) => ({ ...prev, transcribe: false }));
    }
  }, [reelInfo]);

  // Buzz Analysis Handler - requires content
  const handleBuzzAnalysis = useCallback(async () => {
    // Check if we have content to analyze
    const content = transcription?.text || reelInfo?.description || '';

    if (!content.trim()) {
      setError('Please transcribe the reel first or ensure reel info contains description');
      return;
    }

    setLoading((prev) => ({ ...prev, buzz: true }));
    setError(null);

    try {
      const response = await fetch('/api/analyze/buzz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType: 'reel',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        const analysis: BuzzAnalysis = {
          score: result.data.buzzScore || 0,
          factors: result.data.keyThemes || [],
          recommendations: result.data.recommendations || [],
          viralPotential: result.data.sentiment || 'Unknown',
        };
        setBuzzAnalysis(analysis);
        setActiveTab('buzzAnalysis');
      } else {
        throw new Error(result.error || 'Failed to analyze buzz');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error analyzing buzz:', err);
    } finally {
      setLoading((prev) => ({ ...prev, buzz: false }));
    }
  }, [transcription, reelInfo]);

  // Generic content-based API handler for generate endpoints
  const handleContentApiCall = useCallback(
    async (
      endpoint: string,
      actionKey: string,
      setter: (data: unknown) => void,
      tabType: TabType
    ) => {
      // Check if we have content
      const content = transcription?.text || reelInfo?.description || '';

      if (!content.trim()) {
        setError('Please transcribe the reel first or ensure reel info contains content');
        return;
      }

      setLoading((prev) => ({ ...prev, [actionKey]: true }));
      setError(null);

      try {
        // Build request body based on endpoint type
        let requestBody: Record<string, unknown> = {};

        if (endpoint.includes('/threads')) {
          requestBody = {
            topic: content.substring(0, 200),
            tone: 'casual',
            style: 'storytelling',
          };
        } else if (endpoint.includes('/script')) {
          requestBody = {
            topic: content.substring(0, 200),
            duration: 30,
            style: 'entertaining',
          };
        } else if (endpoint.includes('/caption')) {
          requestBody = {
            topic: content.substring(0, 200),
            tone: 'casual',
            imageType: 'reel',
            includeHashtags: true,
          };
        } else {
          requestBody = { content };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform response data based on endpoint type
        if (endpoint.includes('/threads') && data.status === 'success' && data.data) {
          setter({
            content: data.data.thread?.join('\n\n') || '',
            hashtags: data.data.hashtags || [],
            suggestedTime: 'Best posting times: 6am, 12pm, 8pm',
          });
        } else if (endpoint.includes('/script') && data.status === 'success' && data.data) {
          setter({
            script: data.data.script || '',
            scenes: data.data.pacing?.map((p: { description: string }) => p.description) || [],
            duration: data.data.metadata?.duration || 30,
            tone: data.data.metadata?.style || 'entertaining',
          });
        } else if (endpoint.includes('/caption') && data.status === 'success' && data.data) {
          setter({
            caption: data.data.caption || '',
            hashtags: data.data.hashtags || [],
            callToAction: data.data.callToAction || '',
          });
        } else {
          setter(data);
        }
        setActiveTab(tabType);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error(`Error calling ${endpoint}:`, err);
      } finally {
        setLoading((prev) => ({ ...prev, [actionKey]: false }));
      }
    },
    [transcription, reelInfo]
  );

  // Generate handlers using content
  const handleGenerateThreads = useCallback(() => {
    handleContentApiCall('/api/generate/threads', 'threads', (data) => setThreadsPost(data as ThreadsPost), 'threads');
  }, [handleContentApiCall]);

  const handleGenerateScript = useCallback(() => {
    handleContentApiCall('/api/generate/script', 'script', (data) => setScript(data as ScriptGeneration), 'script');
  }, [handleContentApiCall]);

  const handleGenerateCaption = useCallback(() => {
    handleContentApiCall('/api/generate/caption', 'caption', (data) => setCaption(data as CaptionGeneration), 'caption');
  }, [handleContentApiCall]);

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Tab content getter
  const getActiveTabContent = () => {
    switch (activeTab) {
      case 'reelInfo':
        return reelInfo ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reel Information</h3>
            {reelInfo.thumbnail && (
              <Image
                src={reelInfo.thumbnail}
                alt="Thumbnail"
                width={640}
                height={360}
                className="w-full rounded-lg"
                unoptimized
              />
            )}
            <div className="space-y-2">
              {reelInfo.title && (
                <div>
                  <span className="font-medium text-gray-700">Title: </span>
                  <span className="text-gray-900">{reelInfo.title}</span>
                </div>
              )}
              {reelInfo.author && (
                <div>
                  <span className="font-medium text-gray-700">Author: </span>
                  <span className="text-gray-900">{reelInfo.author}</span>
                </div>
              )}
              {reelInfo.duration && (
                <div>
                  <span className="font-medium text-gray-700">Duration: </span>
                  <span className="text-gray-900">{reelInfo.duration}s</span>
                </div>
              )}
              {reelInfo.description && (
                <div>
                  <span className="font-medium text-gray-700">Description: </span>
                  <p className="mt-1 text-gray-900">{reelInfo.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No reel information available. Click &quot;Download Reel Info&quot; to fetch data.</p>
        );

      case 'transcription':
        return transcription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Transcription</h3>
              <button
                onClick={() => handleCopy(transcription.text)}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {transcription.language && (
              <div className="text-sm text-gray-600">
                Language: {transcription.language}
                {transcription.confidence && ` (${(transcription.confidence * 100).toFixed(1)}% confidence)`}
              </div>
            )}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-gray-900">{transcription.text}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No transcription available. Click &quot;Transcribe&quot; to generate.</p>
        );

      case 'buzzAnalysis':
        return buzzAnalysis ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Buzz Analysis</h3>
            <div className="rounded-lg bg-gradient-to-r from-instagram-primary to-instagram-secondary p-6 text-white">
              <div className="text-sm font-medium">Buzz Score</div>
              <div className="mt-2 text-4xl font-bold">{buzzAnalysis.score}/100</div>
              {buzzAnalysis.viralPotential && (
                <div className="mt-2 text-sm">{buzzAnalysis.viralPotential}</div>
              )}
            </div>
            {buzzAnalysis.factors && buzzAnalysis.factors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Factors</h4>
                <ul className="space-y-1">
                  {buzzAnalysis.factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-instagram-primary">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {buzzAnalysis.recommendations && buzzAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {buzzAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-instagram-secondary">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No buzz analysis available. Click &quot;Buzz Analysis&quot; to generate.</p>
        );

      case 'threads':
        return threadsPost ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Threads Post</h3>
              <button
                onClick={() => handleCopy(threadsPost.content)}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-gray-900">{threadsPost.content}</p>
            </div>
            {threadsPost.hashtags && threadsPost.hashtags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {threadsPost.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-instagram-blue/10 px-3 py-1 text-sm text-instagram-blue"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {threadsPost.suggestedTime && (
              <div className="text-sm text-gray-600">
                Best time to post: {threadsPost.suggestedTime}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No Threads post available. Click &quot;Generate Threads Post&quot; to create.</p>
        );

      case 'script':
        return script ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Video Script</h3>
              <button
                onClick={() => handleCopy(script.script)}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {(script.tone || script.duration) && (
              <div className="flex gap-4 text-sm text-gray-600">
                {script.tone && <span>Tone: {script.tone}</span>}
                {script.duration && <span>Duration: {script.duration}s</span>}
              </div>
            )}
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-gray-900">{script.script}</p>
            </div>
            {script.scenes && script.scenes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Scenes</h4>
                <ol className="space-y-2">
                  {script.scenes.map((scene, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      <span className="font-medium">{idx + 1}.</span> {scene}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No script available. Click &quot;Generate Script&quot; to create.</p>
        );

      case 'caption':
        return caption ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Caption</h3>
              <button
                onClick={() => handleCopy(caption.caption)}
                className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-gray-900">{caption.caption}</p>
            </div>
            {caption.hashtags && caption.hashtags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {caption.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-instagram-primary/10 px-3 py-1 text-sm text-instagram-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {caption.callToAction && (
              <div className="rounded-lg border border-instagram-secondary/20 bg-instagram-secondary/5 p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Call to Action</h4>
                <p className="text-sm text-gray-900">{caption.callToAction}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No caption available. Click &quot;Generate Caption&quot; to create.</p>
        );

      default:
        return null;
    }
  };

  // Tab definitions
  const tabs = [
    { id: 'reelInfo' as TabType, label: 'Reel Info', icon: Download },
    { id: 'transcription' as TabType, label: 'Transcription', icon: FileText },
    { id: 'buzzAnalysis' as TabType, label: 'Buzz Analysis', icon: TrendingUp },
    { id: 'threads' as TabType, label: 'Threads', icon: MessageSquare },
    { id: 'script' as TabType, label: 'Script', icon: Film },
    { id: 'caption' as TabType, label: 'Caption', icon: FileEdit },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="h-8 w-8 text-instagram-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-instagram-primary via-instagram-secondary to-instagram-blue bg-clip-text text-transparent">
                Instagram Buzz Dashboard
              </span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Panel - Input & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* URL Input */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Instagram URL
                </h2>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-instagram-primary focus:ring-instagram-primary"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadReel}
                    disabled={loading.download}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-all',
                      loading.download
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-instagram-primary to-instagram-secondary hover:shadow-lg'
                    )}
                  >
                    {loading.download ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download Reel Info
                  </button>

                  <button
                    onClick={handleTranscribe}
                    disabled={loading.transcribe}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                      loading.transcribe
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-instagram-primary hover:text-instagram-primary'
                    )}
                  >
                    {loading.transcribe ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Transcribe
                  </button>

                  <button
                    onClick={handleBuzzAnalysis}
                    disabled={loading.buzz}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                      loading.buzz
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-instagram-secondary hover:text-instagram-secondary'
                    )}
                  >
                    {loading.buzz ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    Buzz Analysis
                  </button>

                  <button
                    onClick={handleGenerateThreads}
                    disabled={loading.threads}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                      loading.threads
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-instagram-blue hover:text-instagram-blue'
                    )}
                  >
                    {loading.threads ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    Generate Threads Post
                  </button>

                  <button
                    onClick={handleGenerateScript}
                    disabled={loading.script}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                      loading.script
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-instagram-purple hover:text-instagram-purple'
                    )}
                  >
                    {loading.script ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Film className="h-4 w-4" />
                    )}
                    Generate Script
                  </button>

                  <button
                    onClick={handleGenerateCaption}
                    disabled={loading.caption}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                      loading.caption
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-instagram-tertiary hover:text-instagram-tertiary'
                    )}
                  >
                    {loading.caption ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileEdit className="h-4 w-4" />
                    )}
                    Generate Caption
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white shadow-card">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto scrollbar-thin" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          'flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition-colors',
                          activeTab === tab.id
                            ? 'border-instagram-primary text-instagram-primary'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 min-h-[400px]">{getActiveTabContent()}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-instagram-primary" />
              <span className="text-sm font-medium text-gray-900">
                Instagram Buzz
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {Object.values(loading).some((l) => l) ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Ready'
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
