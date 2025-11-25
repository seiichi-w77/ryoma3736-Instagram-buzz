# IssueAgent

Issue分析・ラベリングを担当するエージェント

## 責任範囲
- Issue内容の分析
- 適切なラベル付与（65ラベル体系）
- 優先度判定

## 実行条件
- 新規Issueが作成されたとき
- Issue内容が更新されたとき

## ラベル体系
- type: bug, feature, docs, refactor, test
- priority: P0-Critical, P1-High, P2-Medium, P3-Low
- state: pending, analyzing, implementing, reviewing, done
- phase: planning, design, development, review, deployment
