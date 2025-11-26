# SUB-2: バズ分析機能実装

Issue #22 - 文字起こしテキストからバズ要因を分析する機能

## 概要

Instagram Reelsの文字起こしテキストを分析し、コンテンツがバズる理由を抽出します。Gemini AIを使用して、日本語対応の詳細な分析を提供します。

## API エンドポイント

### POST /api/analyze/buzz

文字起こしテキストまたはコンテンツテキストを分析し、バズ要因を返します。

#### リクエスト

```json
{
  "transcription": "文字起こしテキスト (1-10000文字)",
  "contentType": "reel|post|story",
  "analysisMode": "full|quick|hooks-only|trends-only|simplified"
}
```

#### レスポンス (simplified mode - Issue #22仕様)

```json
{
  "status": "success",
  "data": {
    "buzzScore": 85,
    "factors": ["感情的なフック", "具体的な数字", "ストーリーテリング"],
    "sentiment": "positive",
    "keyThemes": ["AI活用", "時短術"],
    "recommendations": ["冒頭にもっと強いフックを", "CTAを明確に"]
  },
  "timestamp": "2025-11-26T00:00:00.000Z"
}
```

#### レスポンス (full mode - 詳細分析)

```json
{
  "status": "success",
  "data": {
    "buzzScore": 85,
    "sentiment": "positive",
    "viralPotential": "high",
    "keyHooks": [
      {
        "text": "引用テキスト",
        "hookType": "emotional|curiosity|shocking|relatable|educational|humorous",
        "strength": 9
      }
    ],
    "trendingTopics": [
      {
        "topic": "トピック名",
        "relevance": 90,
        "trendStrength": "emerging|trending|viral|declining"
      }
    ],
    "contentStructure": {
      "openingStrength": 9,
      "retentionFactors": ["要因1", "要因2"],
      "callToActionPresent": false,
      "pacing": "too-slow|good|too-fast"
    },
    "targetAudience": {
      "primaryDemographic": "ターゲット層",
      "ageRange": "25-40",
      "interests": ["興味1", "興味2"]
    },
    "recommendations": [
      {
        "priority": "high|medium|low",
        "category": "content|timing|hashtags|engagement|editing",
        "suggestion": "具体的な提案",
        "expectedImpact": "期待される効果"
      }
    ],
    "predictedMetrics": {
      "estimatedViews": "50K-100K",
      "estimatedEngagementRate": "8-12%",
      "viralityProbability": 85
    }
  }
}
```

## 分析モード

### 1. full (デフォルト)
包括的な分析を提供。すべての要素を含みます。

### 2. simplified (Issue #22仕様)
シンプルな形式で主要な結果のみを返します。
- `buzzScore`: バズスコア (0-100)
- `factors`: バズ要因の配列
- `sentiment`: センチメント分析
- `keyThemes`: 主要テーマ
- `recommendations`: 改善推奨事項

### 3. quick
バズスコアのみを素早く計算します。

### 4. hooks-only
キーフックのみを抽出します。

### 5. trends-only
トレンドトピックのみを識別します。

## 使用技術

- **AI Model**: Google Gemini (gemini-2.5-flash または gemini-3-pro-preview)
- **言語**: TypeScript
- **フレームワーク**: Next.js 14 App Router
- **テスト**: Vitest

## 実装ファイル

### コアロジック
- `/lib/ai/buzz-analyzer.ts` - バズ分析のメインロジック
  - `analyzeBuzzPotential()` - フル分析
  - `analyzeTranscriptSimplified()` - 簡易版分析
  - `toSimplifiedFormat()` - フル→簡易変換
  - `quickBuzzScore()` - クイックスコア
  - `extractKeyHooks()` - フック抽出
  - `identifyTrendingTopics()` - トピック識別

### API ルート
- `/app/api/analyze/buzz/route.ts` - APIエンドポイント
  - POST: 分析実行
  - GET: APIドキュメント

### Gemini統合
- `/lib/ai/gemini.ts` - Gemini API呼び出しラッパー
  - `callGemini()` - 基本API呼び出し
  - フォールバック機能 (Pro → Flash)
  - レート制限ハンドリング

## テスト

### ユニットテスト
- `/tests/lib/ai/buzz-analyzer-simplified.test.ts` - 簡易版変換テスト
- `/tests/api/analyze-buzz.test.ts` - API統合テスト

### テスト実行

```bash
# すべてのバズ分析テスト
npm test -- tests/api/analyze-buzz.test.ts

# 簡易版テスト
npm test -- tests/lib/ai/buzz-analyzer-simplified.test.ts

# すべてのテスト
npm test
```

## 環境変数

```bash
# Gemini API (必須)
GOOGLE_AI_API_KEY=your_gemini_api_key
# または
GEMINI_API_KEY=your_gemini_api_key
```

## 使用例

### cURL

```bash
# 簡易版分析 (Issue #22仕様)
curl -X POST http://localhost:3000/api/analyze/buzz \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "AIを活用した時短術を紹介します。驚きの結果が...",
    "contentType": "reel",
    "analysisMode": "simplified"
  }'

# フル分析
curl -X POST http://localhost:3000/api/analyze/buzz \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "今日は新しいガジェットを紹介します...",
    "contentType": "reel",
    "analysisMode": "full"
  }'
```

### JavaScript/TypeScript

```typescript
// 簡易版分析
const response = await fetch('/api/analyze/buzz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcription: '文字起こしテキスト',
    contentType: 'reel',
    analysisMode: 'simplified',
  }),
});

const result = await response.json();
console.log('Buzz Score:', result.data.buzzScore);
console.log('Factors:', result.data.factors);
```

## バズスコア計算基準

### 0-25点: 低いポテンシャル
- 一般的な内容
- 明確なフックがない
- トレンドとの関連性が低い

### 26-50点: 中程度のポテンシャル
- いくつかの魅力的な要素がある
- 基本的な構成は整っている

### 51-75点: 高いポテンシャル
- 強力なフック
- 明確な価値提供
- トレンドに関連

### 76-100点: 非常に高いポテンシャル
- バイラル要素あり
- トレンドトピック
- 感情的なインパクト

## 日本語対応

プロンプトは日本語コンテンツに最適化されています：
- 日本語の文字起こしテキストをそのまま分析可能
- レスポンスは入力言語に合わせて返される
- 日本のSNSトレンドを考慮

## 制限事項

- 最大文字数: 10,000文字
- API レート制限: Gemini API の制限に準拠
- 日本語と英語以外の言語は精度が低下する可能性

## 今後の拡張予定

- [ ] 画像分析の統合
- [ ] 過去のバズパターンからの学習
- [ ] ハッシュタグ推奨機能の強化
- [ ] リアルタイムトレンド分析

---

**実装完了日**: 2025-11-26
**対応Issue**: #22 (SUB-2)
**テストカバレッジ**: 100% (APIルート + コア機能)
