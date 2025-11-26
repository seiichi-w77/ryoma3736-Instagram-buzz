# Instagram Buzz - AI Content Generation API

バズ分析・コンテンツ生成APIの完全なドキュメント

## 概要

Instagram Buzzは、Gemini AI APIを活用して、Instagram向けのコンテンツを分析・生成するサーバーレスAPI群です。

## 実装済みAPI

### 1. バズ分析API
**エンドポイント**: `POST /api/analyze/buzz`

コンテンツのバズ、バイラル性、センチメント分析を行います。

**リクエスト例**:
```json
{
  "content": "Amazing new product launch! Check it out",
  "likes": 150,
  "comments": 25,
  "shares": 10,
  "views": 2500,
  "hashtags": ["#launch", "#product", "#trending"],
  "contentType": "photo"
}
```

**レスポンス例**:
```json
{
  "status": "success",
  "data": {
    "buzzScore": 78,
    "sentiment": "positive",
    "keyThemes": ["product", "excitement", "innovation"],
    "recommendations": [
      "Add more call-to-action to boost engagement",
      "Use trending hashtags to expand reach"
    ],
    "analysis": "Your content shows strong engagement potential with positive sentiment..."
  },
  "timestamp": "2024-11-25T10:30:00.000Z"
}
```

**ファイル**: `/app/api/analyze/buzz/route.ts`

---

### 2. Threads投稿生成API
**エンドポイント**: `POST /api/generate/threads`

エンゲージングなThreads投稿スレッドを生成します。

**リクエスト例**:
```json
{
  "topic": "Sustainable living tips for beginners",
  "tone": "inspirational",
  "style": "storytelling",
  "includeHashtags": true
}
```

**レスポンス例**:
```json
{
  "status": "success",
  "data": {
    "thread": [
      "Starting a sustainability journey is easier than you think...",
      "First tip: Reduce single-use plastics...",
      "Small changes lead to big impact...",
      "Your future self will thank you!"
    ],
    "hashtags": ["#sustainability", "#ecolifestyle", "#green"],
    "callToAction": "Share your sustainability tips!",
    "characterCount": 1240,
    "totalParts": 4,
    "estimatedReadTime": "2 minutes"
  },
  "timestamp": "2024-11-25T10:30:00.000Z"
}
```

**ファイル**: `/app/api/generate/threads/route.ts`

---

### 3. リール台本生成API
**エンドポイント**: `POST /api/generate/script`

30秒～5分のInstagram Reel向け台本を生成します。

**リクエスト例**:
```json
{
  "topic": "How to make perfect iced coffee",
  "duration": 30,
  "style": "tutorial",
  "platform": "instagram"
}
```

**レスポンス例**:
```json
{
  "status": "success",
  "data": {
    "script": "Full narrative script here...",
    "pacing": [
      {
        "timeRange": "0-5s",
        "description": "Close-up of coffee beans",
        "voiceover": "Let me show you the perfect iced coffee recipe"
      },
      {
        "timeRange": "5-10s",
        "description": "Grinding coffee",
        "voiceover": "Start with freshly ground coffee beans"
      }
    ],
    "musicSuggestion": "upbeat",
    "transitionTips": ["Use fade transition", "Add music beat sync"],
    "metadata": {
      "duration": 30,
      "style": "tutorial",
      "platform": "instagram",
      "estimatedWordCount": 145,
      "estimatedSpeakingPace": "290 words per minute"
    }
  },
  "timestamp": "2024-11-25T10:30:00.000Z"
}
```

**ファイル**: `/app/api/generate/script/route.ts`

---

### 4. キャプション生成API
**エンドポイント**: `POST /api/generate/caption`

Instagram投稿用のエンゲージングなキャプションを生成します。

**リクエスト例**:
```json
{
  "topic": "New sustainable coffee collection launch",
  "imageType": "carousel",
  "tone": "inspirational",
  "includeHashtags": true,
  "targetAudience": "eco-conscious millennials"
}
```

**レスポンス例**:
```json
{
  "status": "success",
  "data": {
    "caption": "Excited to introduce our new sustainable coffee blend...",
    "hashtags": ["#sustainability", "#ecocoffee", "#green"],
    "callToAction": "Shop the collection now!",
    "estimatedEngagement": "high",
    "metadata": {
      "characterCount": 210,
      "wordCount": 32,
      "hashtagCount": 3,
      "imageType": "carousel",
      "tone": "inspirational"
    }
  },
  "timestamp": "2024-11-25T10:30:00.000Z"
}
```

**ファイル**: `/app/api/generate/caption/route.ts`

---

## モジュール構成

### Gemini AIモジュール
**ファイル**: `/lib/ai/gemini.ts`

Google Gemini APIとの通信を担当します。

**主要関数**:
- `callGemini(prompt, options)` - 汎用Gemini APIコール
- `analyzeBuzzWithGemini(content, metrics)` - バズ分析
- `generateThreadsWithGemini(topic, tone, style)` - Threads生成
- `generateReelScriptWithGemini(topic, duration, style)` - リール台本生成
- `generateCaptionWithGemini(topic, imageType, tone, includeHashtags)` - キャプション生成

### プロンプトテンプレート
**ファイル**: `/lib/ai/prompts.ts`

Gemini APIへの最適化されたプロンプトテンプレートを提供します。

**テンプレート**:
- `BUZZ_ANALYSIS_PROMPT` - バズ分析用プロンプト
- `THREADS_GENERATION_PROMPT` - Threads生成プロンプト
- `REEL_SCRIPT_PROMPT` - リール台本生成プロンプト
- `CAPTION_GENERATION_PROMPT` - キャプション生成プロンプト
- `HASHTAG_RESEARCH_PROMPT` - ハッシュタグ研究
- `ENGAGEMENT_ANALYSIS_PROMPT` - エンゲージメント分析
- `AUDIENCE_ANALYSIS_PROMPT` - オーディエンス分析

---

## 環境設定

`.env` ファイルに以下を設定します:

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
# または
GEMINI_API_KEY=your_gemini_api_key_here
```

APIキーは [Google AI Studio](https://makersuite.google.com/app/apikey) から取得できます。

---

## テスト

### ユニットテスト実行
```bash
npm test
```

### 特定のテストファイル実行
```bash
npm test lib/__tests__/gemini.test.ts
```

### テストファイル一覧
- `/lib/__tests__/gemini.test.ts` - Gemini API モジュールテスト
- `/app/api/__tests__/routes.test.ts` - APIルートテスト

---

## ビルド & デプロイ

### ローカルビルド
```bash
npm run build
```

### 開発サーバー起動
```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

### 本番デプロイ
```bash
npm start
```

---

## API使用例

### Node.js/TypeScript
```typescript
const response = await fetch('/api/generate/caption', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'New product launch',
    tone: 'professional',
    imageType: 'carousel',
    includeHashtags: true
  })
});

const data = await response.json();
console.log(data.data.caption);
```

### cURL
```bash
curl -X POST http://localhost:3000/api/generate/caption \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Summer collection",
    "tone": "casual",
    "imageType": "portrait"
  }'
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3000/api/analyze/buzz',
    json={
        'content': 'Amazing product!',
        'likes': 150,
        'comments': 25
    }
)

analysis = response.json()
print(f"Buzz Score: {analysis['data']['buzzScore']}")
```

---

## エラーハンドリング

すべてのAPIは標準的なHTTPステータスコードを返します:

- **200**: 成功
- **400**: 不正なリクエスト
- **500**: サーバーエラー

エラーレスポンス例:
```json
{
  "status": "error",
  "error": "GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable is not set",
  "timestamp": "2024-11-25T10:30:00.000Z"
}
```

---

## パフォーマンス仕様

| エンドポイント | 平均応答時間 | 最大応答時間 |
|---|---|---|
| /api/analyze/buzz | 2-3秒 | 10秒 |
| /api/generate/threads | 3-5秒 | 15秒 |
| /api/generate/script | 4-6秒 | 20秒 |
| /api/generate/caption | 2-3秒 | 10秒 |

---

## 制限事項

- **リクエストサイズ**: 最大10MB
- **トピック長**: 最大500文字
- **同時リクエスト**: APIキーの制限に準拠
- **レート制限**: Gemini APIの料金プランに依存

---

## トラブルシューティング

### API Key エラー
```
Error: GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable is not set
```
→ `.env` ファイルに正しいAPI キーを設定してください。

### Gemini API エラー
```
Error: Gemini API error: 401
```
→ API キーの有効性と有効期限を確認してください。

### タイムアウトエラー
```
Error: Request timeout
```
→ ネットワーク接続を確認し、リクエストをリトライしてください。

---

## まとめ

Instagram Buzzは、Gemini AIの強力なNLPテクノロジーを活用して、Instagram向けのコンテンツ生成を自動化します。4つの主要APIにより、バズ分析、Threads生成、リール台本生成、キャプション生成が可能です。

詳細は各APIドキュメントを参照してください。
