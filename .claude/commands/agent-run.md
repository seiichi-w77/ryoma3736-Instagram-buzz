# Agent実行

Miyabi Agentを実行してIssueを自動処理します。

## 使用方法

```bash
# 単一Issue処理
npx miyabi agent run coordinator --issue <番号>
npx miyabi agent run codegen --issue <番号>
npx miyabi agent run review --pr <番号>
npx miyabi agent run pr --issue <番号>

# 全自動モード
npx miyabi auto --max-issues 10
```

## Issue番号を指定して実行

$ARGUMENTS
