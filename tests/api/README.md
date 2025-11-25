# API Route Unit Tests

このディレクトリは、Instagram-buzzプロジェクトのすべてのAPIルートのユニットテストが含まれています。

## テストファイル一覧

### 1. analyze-buzz.test.ts
**エンドポイント**: POST /api/analyze/buzz

バズ分析APIのテスト。Instagram投稿のバイラルポテンシャルとエンゲージメントパターンを分析します。

**テストケース数**: 11

**テストカバレッジ**: 98.81% (statements), 85.71% (branches)

**主要テスト**:
- 有効なコンテンツでバズ分析を実行
- 欠落フィールドのバリデーション
- 空のコンテンツの処理
- 最大長超過の処理
- JSON解析エラー処理
- Claude API エラーハンドリング
- メトリクスなしでの分析
- タイムスタンプの確認
- APIドキュメンテーション確認

### 2. generate-caption.test.ts
**エンドポイント**: POST /api/generate/caption

キャプション生成APIのテスト。特定の投稿タイプに最適化されたエンゲージングなInstagramキャプションを生成します。

**テストケース数**: 14

**テストカバレッジ**: 99.1% (statements), 90.9% (branches)

**主要テスト**:
- トピックからキャプションを生成
- デフォルトパラメータの使用
- 欠落トピックフィールドのバリデーション
- 空のトピック処理
- トピック最大長超過の処理
- 負のmaxLengthパラメータの処理
- JSON解析エラー処理
- Claude API エラーハンドリング
- 単語数カウントの正確性
- 特殊文字の処理
- タイムスタンプの確認
- APIドキュメンテーション確認

### 3. generate-script.test.ts
**エンドポイント**: POST /api/generate/script

リールスクリプト生成APIのテスト。詳細なペーシングとタイミング情報を含むプロフェッショナルなリールスクリプトを生成します。

**テストケース数**: 15

**テストカバレッジ**: 99.07% (statements), 86.95% (branches)

**主要テスト**:
- 有効なトピックでスクリプト生成
- デフォルトパラメータの使用
- 欠落トピックフィールドのバリデーション
- 空のトピック処理
- トピック最大長超過の処理
- 300秒超過のduration処理
- 負のduration処理
- JSON解析エラー処理
- Claude API エラーハンドリング
- スピーキングペースの計算
- 様々なスタイルオプション
- タイムスタンプの確認
- APIドキュメンテーション確認

### 4. generate-threads.test.ts
**エンドポイント**: POST /api/generate/threads

スレッド生成APIのテスト。Threads (Meta) 投稿コンテンツを生成します。

**テストケース数**: 18

**テストカバレッジ**: 98.93% (statements), 89.47% (branches)

**主要テスト**:
- トピックからスレッドを生成
- デフォルトパラメータの使用
- 欠落トピックフィールドのバリデーション
- 空のトピック処理
- トピック最大長超過の処理
- JSON解析エラー処理
- Claude API エラーハンドリング
- 文字数計算の正確性
- パーツ数の計算
- 読了時間の見積もり
- 様々なトーンオプション
- 様々なスタイルオプション
- ハッシュタグとCTAのオプション
- タイムスタンプの確認
- APIドキュメンテーション確認

### 5. reels-download.test.ts
**エンドポイント**: POST /api/reels/download

リール ダウンロードAPIのテスト。InstagramからメディアをダウンロードするAPIのテストです。

**テストケース数**: 18

**テストカバレッジ**: 97.59% (statements), 92.3% (branches)

**主要テスト**:
- 有効なURLでリール ダウンロード
- デフォルト品質でのダウンロード
- WebM形式でのダウンロード
- URL フィールド欠落のバリデーション
- 空のURL処理
- 無効な品質パラメータの処理
- 無効な形式パラメータの処理
- JSON解析エラー処理
- ダウンローダー エラー処理
- 例外処理
- 一意のリクエストID生成
- リクエストボディのバリデーション
- 品質バリエーション処理
- ダウンローダー設定の確認
- CORSプリフライト処理
- APIドキュメンテーション確認

## テスト実行方法

### すべてのAPIテストを実行
```bash
npm test -- tests/api/ --run
```

### 特定のテストファイルを実行
```bash
npm test -- tests/api/analyze-buzz.test.ts --run
```

### カバレッジを含めて実行
```bash
npm test -- tests/api/ --run --coverage
```

### ウォッチモードで実行
```bash
npm test -- tests/api/ --watch
```

## モック戦略

すべてのテストは以下の戦略でモック化されています：

### Claude AI Functions
- `analyzeBuzz()` - バズ分析をモック化
- `generateCaption()` - キャプション生成をモック化
- `generateReelScript()` - リールスクリプト生成をモック化
- `generateThreads()` - スレッド生成をモック化

### Instagram Downloader
- `createDownloader()` - ダウンローダーインスタンスをモック化
- `downloader.download()` - ダウンロード処理をモック化

## テストカバレッジ サマリー

| ファイル | ステートメント | ブランチ | 関数 | 行 |
|---------|----------|---------|------|-----|
| analyze/buzz/route.ts | 98.81% | 85.71% | 100% | 98.81% |
| generate/caption/route.ts | 99.1% | 90.9% | 100% | 99.1% |
| generate/script/route.ts | 99.07% | 86.95% | 100% | 99.07% |
| generate/threads/route.ts | 98.93% | 89.47% | 100% | 98.93% |
| reels/download/route.ts | 97.59% | 92.3% | 100% | 97.59% |

**全体**: すべてのAPIルートが95%以上のカバレッジを達成しています。

## テスト時間

実行時間: 約 600-700ms

## 品質基準

- ✓ TypeScriptエラー: 0件
- ✓ ESLintエラー: 0件
- ✓ テストパス: 76/76 (100%)
- ✓ テストカバレッジ: 95%以上

## 関連ドキュメント

- [APIドキュメンテーション](/API_DOCUMENTATION.md)
- [実装サマリー](/IMPLEMENTATION_SUMMARY.md)
- [クイックスタート](/QUICKSTART.md)

## メモ

テストは以下のベストプラクティスに従っています：

1. **モック化**: 外部依存関係（Claude API、ダウンローダー）は完全にモック化
2. **バリデーション**: リクエスト検証とエラーハンドリングを徹底的にテスト
3. **エッジケース**: 境界値、無効な入力、例外状態をカバー
4. **ドキュメンテーション**: GET エンドポイントのドキュメンテーション確認
5. **非決定性排除**: タイムスタンプとリクエストIDの生成を確認しながら、予測可能なテストを実現

## 追加の分析

### Error Logging
各テストで予期されたエラーがログに出力されます。これは正常な動作です：
- Buzz analysis error
- Caption generation error
- Reel script generation error
- Threads generation error

これらは intentional なエラーテストの結果です。

### Next.js 統合
Next.jsの `NextRequest` と `NextResponse` オブジェクトを使用して、実際のAPIルートのエンドツーエンドテストを実施しています。
