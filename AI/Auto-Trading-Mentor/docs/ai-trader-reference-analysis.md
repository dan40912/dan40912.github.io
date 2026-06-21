# HKUDS AI-Trader Reference Analysis

Date: 2026-06-10

Reference repository: https://github.com/HKUDS/AI-Trader

Local ignored copy:

```text
external/HKUDS-AI-Trader
```

This repository is kept as a local reference only. The `external/` directory is ignored by git and should not become part of this project.

## What AI-Trader Is

HKUDS AI-Trader is not just a strategy prompt project. It is an agent-native trading platform with:

- Agent-facing skill files under `skills/`.
- FastAPI backend under `service/server/`.
- React frontend under `service/frontend/`.
- Public API specs under `docs/api/`.
- Research export and analysis pipeline under `research/`.
- Tests for backend behavior under `service/server/tests/`.

Observed size signals from the cloned copy:

- 107 FastAPI route declarations.
- 21 backend test files.
- 25 research schema files.

## Strong Ideas Worth Learning

### 1. Skill Files as Product API Contracts

AI-Trader uses skill files as the agent entry point, not just documentation. The main skill routes agents to specialized skills such as `copytrade`, `tradesync`, `heartbeat`, `polymarket`, and `market-intel`.

What to learn:

- Keep the top-level skill as a bootstrap/router.
- Move specialized behaviors into child skills.
- Make each skill define required inputs, allowed actions, API/prompt contract, and failure handling.

How this applies here:

- Your project already has strong focused skills: `platform-safety`, `authorization-modes`, `market-scan`, `risk-control`, `order-execution`, `position-management`, `take-profit-stop-loss`, and `heartbeat-reporting`.
- The next improvement is a top-level orchestration skill that tells Codex which skill to invoke first, second, and last for an MNQ demo/replay trading round.

### 2. Heartbeat as Normal Operation

AI-Trader treats heartbeat polling as part of normal agent behavior. It is not an optional notification feature. Messages, tasks, replies, follower events, and experiment prompts all flow through heartbeat.

What to learn:

- Every automation cycle should produce a structured status result.
- Missed or unclear state should be explicit.
- The system should remember whether the previous action was pending, filled, blocked, or required manual intervention.

How this applies here:

- Your `heartbeat-reporting` skill can become the central state handoff format between Codex runs.
- Add fields such as `previous_action_status`, `fill_confirmation`, `blocked_reason`, `next_allowed_action`, and `manual_intervention_required`.

### 3. Clear Separation Between Signal, Risk, Execution, and Position State

AI-Trader separates publishing signals, updating positions, fetching prices, rewards, and user/agent identity. It does not hide all behavior inside one prompt.

What to learn:

- Separate decision stages so a market signal never automatically equals execution permission.
- Keep position updates and risk validation as separate concepts.
- Make each stage produce machine-readable output.

How this applies here:

- Preserve your current hard boundary: `market-scan` does not authorize orders.
- Strengthen the chain so every run must pass:
  `platform-safety -> authorization-modes -> market-scan -> risk-control -> take-profit-stop-loss -> order-execution -> heartbeat-reporting`.

### 4. Server-Side Price and Market Validation

AI-Trader validates price, market, quantity, market hours, position state, and trade value before accepting realtime signals. It also uses provider fallback and cooldown behavior for market data.

What to learn:

- Do not trust a single visual observation as enough for execution.
- Define hard validation rules for symbol, market, quantity, PnL, and position size.
- Treat data-provider failures as a reason to wait or reduce capability.

How this applies here:

- For your visual automation, add a `validation-confidence` layer:
  - visible platform account mode
  - visible symbol
  - visible quantity
  - visible position
  - visible PnL
  - visible Close/Exit controls
  - visible last price or chart price

### 5. Research and Replay Data Pipeline

AI-Trader has a research pipeline that exports datasets, schemas, metrics, and figures. This is useful because trading-agent improvement needs evidence, not only prompt edits.

What to learn:

- Save each automation cycle as structured data.
- Track setup score, confidence, risk decision, action, fill result, PnL movement, and screenshots.
- Analyze after the fact which conditions led to good or bad outcomes.

How this applies here:

- Add a local `logs/` or `runs/` format later, with examples ignored by default.
- Start with a simple JSONL schema before building any backend.

## Recommended Improvements for This Project

The product goal is Codex-only usage: customers should not install packages, clone repositories, or run local services. The recommendations below should be interpreted as builder-side improvements that make the customer experience simpler, not as customer setup steps.

### Phase 1: Strengthen the Existing Skill System

Create a top-level skill, for example:

```text
skills/mnq-demo-trading-orchestrator/SKILL.md
```

Its job should be to enforce the full workflow order and define a single output schema for every heartbeat run.

Suggested output fields:

- `environment_status`
- `authorization_mode`
- `market_scan`
- `risk_control`
- `tp_sl_plan`
- `position_management`
- `execution_decision`
- `action_taken`
- `fill_status`
- `manual_intervention_required`
- `next_run_instruction`

### Phase 2: Add Machine-Readable Run Logs

Add a safe local logging convention:

```text
runs/
  .gitkeep
  README.md
  schema.json
```

Recommended default:

- Commit schema and README.
- Ignore actual run logs and screenshots.
- Never store account IDs, tokens, broker secrets, or personal data.

### Phase 3: Add an API Contract Without Building a Full Platform

Borrow AI-Trader's API-contract discipline without copying its platform.

Add:

```text
docs/api/demo-trading-run.schema.json
```

This can define what one Codex trading heartbeat must output. It does not need a server at first.

### Phase 4: Improve the Starter UI Around Evidence

Your current starter creates prompts. The next useful improvement is to generate:

- selected safety mode
- selected risk limits
- selected skill chain
- generated output schema
- logging preference
- manual confirmation rules

This keeps the UI aligned with real operational safety.

### Phase 5: Add Tests for Prompt/Skill Consistency

AI-Trader has backend tests. Your equivalent should be lightweight consistency checks:

- every skill has front matter
- every skill has purpose, rules, and output
- forbidden Live/Real wording is consistent
- order execution depends on safety, authorization, risk, and TP/SL
- README and starter output use the same risk limits

## What Not To Copy

Do not directly copy AI-Trader's full platform scope unless the project goal changes.

Avoid for now:

- public user accounts
- copy trading marketplace
- real API token system
- rewards/points economy
- production database layer
- public signal feed
- live trading broker integration

Those are valuable in AI-Trader because it is a platform. Your current project is safer and more focused as a Codex prompt/skill starter for Demo, Replay, and Paper Trading.

## Practical Next Step

The best next implementation is:

1. Add `skills/mnq-demo-trading-orchestrator/SKILL.md`.
2. Add `docs/api/demo-trading-run.schema.json`.
3. Update the starter so generated prompts require the orchestrator output schema.
4. Add a small consistency-check script or test that protects safety rules from drifting.
