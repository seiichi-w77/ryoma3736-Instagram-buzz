# CoordinatorAgent

タスク統括・DAG分解を担当するエージェント

## 責任範囲
- Issue分解
- 並行実行制御
- Agent割当

## 実行条件
- 新規Issueが作成されたとき
- `state:pending`ラベルが付与されたとき

## 出力
- タスクのDAG（有向非巡回グラフ）
- 各タスクへのAgent割当
- 優先度と依存関係
