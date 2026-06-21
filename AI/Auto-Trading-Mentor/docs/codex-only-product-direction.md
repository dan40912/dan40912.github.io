# Codex-Only Trading Product Direction

Date: 2026-06-10

## Product Goal

Customers should only need a Codex account to use AI-assisted trading workflows. They should not need to install Python packages, npm packages, broker SDKs, browser extensions, local CLIs, or this repository.

The user-facing product should feel like:

1. Open Codex.
2. Open the trading platform in Codex in-app browser.
3. Load or paste one guided trading prompt.
4. Confirm Demo, Replay, or Paper Trading mode.
5. Let Codex analyze, manage risk, and act only inside the allowed mode.

## Non-Negotiable Constraint

Zero install does not mean zero authorization.

Customers may avoid installing software, but they still need:

- A Codex account.
- Access to a supported trading/charting web platform.
- Their own broker or paper trading login when execution is involved.
- Explicit confirmation before any Live-ready or real-money action.

The product must never imply that a Codex account alone grants brokerage access or real-money trading permission.

## Recommended Architecture

### Customer Layer

No local repository. No package installation.

Customer interacts through:

- Codex chat.
- Codex in-app browser.
- A hosted starter page or public prompt page.
- Hosted skill files or copy-paste skill prompt blocks.

### Product Layer

This repository remains the source of truth for:

- Starter UI content.
- Trading workflow prompts.
- Skills.
- Safety rules.
- Output schemas.
- Reference docs.

The repo is for the builder, not the customer.

### Execution Layer

Prefer browser-based workflows first:

- TradingView for chart context.
- Tradovate, TradeDay, or paper trading broker panel for order controls.
- Codex browser observation and controlled clicking only when safety checks pass.

Avoid requiring customer-side SDKs or local scripts. Broker API integrations can be added later as hosted backend features, but they should not become a customer installation requirement.

## What to Learn from HKUDS AI-Trader

AI-Trader's strongest lesson is not "make users install a platform." It is:

- Agent instructions should be hosted and routable.
- Skills should behave like API contracts.
- Heartbeat is the normal loop.
- Trading actions need structured state, not free-form chat only.
- Logs and schemas create an improvement loop.

For this project, adapt those ideas into Codex-native workflows:

- A hosted starter page generates the prompt.
- The prompt invokes the orchestrator skill.
- The orchestrator requires safety, authorization, scan, risk, TP/SL, position, execution, and heartbeat reporting.
- The final user-facing report remains simple.

## Product Phases

### Phase 1: Zero-Install Prompt Starter

Goal: A customer can use the product by opening a web page and pasting a prompt into Codex.

Required:

- Host `index.html` as a public static page.
- Generated prompt includes the orchestrator workflow.
- Generated prompt tells users to open their chart/broker page in Codex browser.
- Generated prompt defaults to Demo, Replay, or Paper Trading.

### Phase 2: Codex-Native Skill Bundle

Goal: Customer no longer needs to copy many rules manually.

Required:

- Provide one top-level hosted skill/prompt entry.
- Keep child skills modular for maintenance.
- Make the top-level entry explain when Codex should use each child skill.

### Phase 3: Structured Heartbeat Loop

Goal: Every Codex trading round produces consistent output.

Required:

- Use the orchestrator skill.
- Keep final heartbeat XML for current automation compatibility.
- Use `docs/api/demo-trading-run.schema.json` as the internal run contract.

### Phase 4: Hosted State and Logs

Goal: Users can improve without local files.

Required:

- Optional hosted run history.
- Redacted screenshots or summary-only logs.
- No account IDs, API keys, broker secrets, or private credentials in logs.

### Phase 5: Broker Integrations Without Customer Installs

Goal: Real integrations remain hosted or browser-based.

Required:

- OAuth or broker-supported web authorization where possible.
- Server-side API adapters if needed.
- Explicit real-money confirmation gates.
- Account-mode verification before any action.

## UX Principle

The customer should never see setup work as engineering work.

Use terms like:

- "Open Codex"
- "Open your paper trading screen"
- "Choose Demo mode"
- "Start scan"
- "Pause automation"
- "Require manual confirmation"

Avoid customer-facing instructions like:

- `git clone`
- `pip install`
- `npm install`
- `python -m http.server`
- "edit this config file"

Those can remain in developer documentation only.

## Immediate Repo Changes Implied

1. README should separate customer usage from developer usage.
2. Starter output should say "no install required for customers."
3. Orchestrator should be treated as the customer-facing workflow entry.
4. Any future backend or API design must be optional for customers unless hosted.

