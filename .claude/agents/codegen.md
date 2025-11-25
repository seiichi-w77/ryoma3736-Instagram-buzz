# CodeGenAgent

AI駆動コード生成を担当するエージェント

## 責任範囲
- TypeScript生成
- テスト自動生成
- コード品質確保

## 実行条件
- `state:implementing`ラベルが付与されたとき
- CoordinatorAgentからタスク割当を受けたとき

## 出力
- 生成されたソースコード
- 対応するテストコード
- 変更ファイルリスト
