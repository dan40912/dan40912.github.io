# Auto-Trading-Prompt-Generator

Auto-Trading-Prompt-Generator is an **AI Trading Workflow Builder for Codex**.

It turns a trader's market, risk limits, strategy frame, review roles, and output requirements into a Codex-ready workflow prompt.

It is not a broker, not a trading signal service, not investment advice, and not a promise of profit.

## Current Positioning

The product is focused on:

- Replay review
- Demo account testing
- Paper trading workflows
- Live view-only analysis
- Live manual-approval workflows

The MVP does **not** support Live Auto.

Any real-money or Live trading action must require human confirmation.

## What It Generates

The starter UI generates:

- Trading workflow prompt
- Risk rules
- Review role structure
- Trading Card
- Fail-closed rules
- Optional run log fields
- Optional funded trader constraints

## Safety Boundary

The workflow must fail closed when any of the following are unclear:

- Account mode
- Market symbol
- Position status
- Quantity
- PnL
- Working orders
- Stop order
- Fill status
- Live authorization

If any required safety state is unclear, the output should be `MANUAL`, not a trade instruction.

## Customer Usage

Customers should not need to clone this repository, install packages, or run local scripts.

The intended customer flow is:

1. Open the hosted starter page.
2. Choose Replay, Demo, Paper, Live View, or Live Manual Approve.
3. Set risk limits.
4. Choose a strategy frame and review roles.
5. Generate the workflow prompt.
6. Paste the prompt into Codex / ChatGPT / Claude.
7. Open TradingView and the trading platform screen.
8. Validate the workflow in Replay, Demo, or Paper before considering any Live manual workflow.

## Developer Usage

For local development, this repo is a static site.

```powershell
python -m http.server 8092
```

Then open:

```text
http://localhost:8092/
```

## Repository Structure

```text
Auto-Trading-Prompt-Generator/
  index.html
  assets/
    css/index.css
    js/index.js
  docs/
  skills/
  runs/
  artifacts/
  Example/
```

## Core Product Rule

Do not sell this as an autonomous trading bot.

The safer product promise is:

> Make AI follow your trading rules, risk limits, and review process before it produces a decision.

## Roadmap Direction

Near-term priorities:

1. Keep the MVP scoped to Replay, Demo, Paper, Live View, and Live Manual Approve.
2. Improve funded trader rule templates.
3. Add replay/paper outcome tracking.
4. Build a weekly review loop from run logs.
5. Collect real failure cases and improve fail-closed rules.

Out of scope for MVP:

- Live Auto
- Broker API adapters
- Copy trading
- Public signal feeds
- Marketplace features
- Customer-side SDK installation

## Disclaimer

This project is educational workflow tooling. It does not provide financial advice, investment advice, brokerage services, portfolio management, or guaranteed trading results. Users are responsible for their own trading decisions, platform access, broker permissions, and risk.
