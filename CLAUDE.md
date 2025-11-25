# Instagram-buzz - AI Agent Context

## Fundamental Agent Equation

```
Agent(Intent, World) = lim_{n→∞} (θₙ_{Learn} ⊗ θₙ_{Integrate} ⊗ θₙ_{Execute} ⊗ θₙ_{Allocate} ⊗ θₙ_{Generate} ⊗ θₙ_{Understand})^n(Intent, World)
```

---

## Project Overview

Instagram-buzz is an autonomous development project powered by the Miyabi framework.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Testing**: Vitest
- **Linting**: ESLint
- **Framework**: Miyabi AI Agent Framework

## Project Structure

```
Instagram-buzz/
├── src/                    # Source code
│   └── index.ts           # Entry point
├── tests/                  # Test files
│   └── example.test.ts    # Example tests
├── .claude/               # AI agent configuration
│   ├── agents/            # Agent definitions
│   │   ├── coordinator.md
│   │   ├── codegen.md
│   │   ├── review.md
│   │   ├── issue.md
│   │   ├── pr.md
│   │   └── deploy.md
│   ├── commands/          # Custom slash commands
│   └── settings.json      # Agent settings
├── .github/
│   └── workflows/         # CI/CD automation
├── package.json
└── tsconfig.json
```

## AI Agents

This project uses 7 autonomous AI agents:

| Agent | Role | Trigger |
|-------|------|---------|
| CoordinatorAgent | Task planning & DAG decomposition | New Issue created |
| IssueAgent | Analysis & labeling | Issue updated |
| CodeGenAgent | AI-powered code generation | state:implementing |
| ReviewAgent | Quality validation (80+ score) | PR created |
| PRAgent | Automatic PR creation | Code generation complete |
| DeployAgent | CI/CD automation | PR merged |
| TestAgent | Test execution | Code changes |

## Label System

Issues transition through states automatically:

- `state:pending` - Waiting for assignment
- `state:analyzing` - Being analyzed
- `state:implementing` - Code being written
- `state:reviewing` - Under review
- `state:done` - Completed

## Commands

```bash
# Check status
npx miyabi status

# Run agent
npx miyabi agent run <agent-name> --issue <number>

# Full auto mode
npx miyabi auto
```

## Quality Gate

All code must meet:
- TypeScript errors: 0
- ESLint errors: 0
- Test coverage: 80%+
- Quality score: 80+

## Environment Variables

Required in `.env`:
- `GITHUB_TOKEN` - GitHub personal access token
- `ANTHROPIC_API_KEY` - Claude API key
- `REPOSITORY` - Format: owner/repo
