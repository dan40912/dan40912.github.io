# Multi-Agent Prompts and Implementation Targets

Date: 2026-06-10

Goal: refine the five multi-agent prompts into direct, reusable prompts and identify concrete implementation work for this project.

## Prompt 1: Product Review Board

```text
Act as AI-Trading's product review board.

Context:
Customers should only need a Codex account, Codex in-app browser, and their own web trading platform login. They should not install packages, clone repos, or run local scripts.

Review this project through five roles:
- Product Director
- Safety Officer
- Agent Workflow Architect
- UX Designer
- Trading Operations Lead

Output:
1. Top 5 strengths.
2. Top 5 product or safety gaps.
3. What to learn from HKUDS/AI-Trader.
4. What not to copy from HKUDS/AI-Trader.
5. Seven concrete improvements with business value, safety value, and acceptance criteria.

Constraint:
Every recommendation must preserve zero-install customer usage.
```

### Implementable Work

- Add a recurring product review checklist in `docs/`.
- Add README section explaining what is customer-facing vs builder-facing.
- Add acceptance criteria to every major roadmap item.

## Prompt 2: Agent Workflow Architect

```text
Design one MNQ/MNQM6 Demo, Replay, or Paper Trading heartbeat workflow.

Use these agents:
- Safety Agent
- Authorization Agent
- Market Scan Agent
- Risk Manager Agent
- TP/SL Agent
- Position Manager Agent
- Execution Agent
- Heartbeat Reporter Agent

For each agent, define:
1. Responsibility.
2. Allowed actions.
3. Prohibited actions.
4. Required inputs.
5. Required outputs.
6. Fail-closed conditions.

Then produce the full handoff order and one final heartbeat XML example.

Rules:
Market Scan cannot authorize orders.
Execution cannot override Risk Manager.
Any Real, Live, or unclear account mode blocks automatic clicking.
```

### Implementable Work

- Expand `skills/mnq-demo-trading-orchestrator/SKILL.md` with per-agent handoff tables.
- Add a sample heartbeat XML output to the orchestrator skill.
- Add a checklist that confirms no skill bypasses safety or risk.

## Prompt 3: Zero-Install Customer Journey

```text
Design the zero-install customer journey for AI-Trading.

Constraints:
- Customer only uses Codex, Codex in-app browser, and a hosted Starter or prompt.
- Customer does not install packages, clone repo, or run scripts.
- Customer must still log into their own trading/charting platform.
- Codex account must never be presented as broker access.

Output:
1. First-time user flow.
2. Daily user flow.
3. Demo/Replay/Paper Trading start flow.
4. Live-ready flow with mandatory human confirmation.
5. Starter UI changes.
6. Customer-facing safety copy.
7. Failure states and recovery messages.
```

### Implementable Work

- Update Starter UI copy to say "No install required for customers."
- Add a mode-specific prompt section for Demo, Replay, Paper, and Live-ready.
- Add failure messages for unclear account mode, hidden PnL, hidden qty, and unconfirmed fill.

## Prompt 4: Run Log Learning Loop

```text
Design a privacy-safe learning loop for AI-Trading heartbeat runs.

Goal:
Every run should be reviewable without storing secrets or broker credentials.

Output:
1. Run log fields.
2. Fields that must never be stored.
3. One JSON example.
4. Weekly review report format.
5. Metrics for decision quality.
6. How logs improve prompts and skills.
7. Data safety rules.

Track:
setup_score, confidence, risk decision, action, fill status, blocked reason, manual intervention, and next instruction.
```

### Implementable Work

- Add `runs/README.md` explaining safe local or hosted logging.
- Add `runs/schema.json` or reuse `docs/api/demo-trading-run.schema.json`.
- Add `.gitignore` rules for actual run logs and screenshots.
- Add a weekly review template.

## Prompt 5: Strategy and Roadmap Review

```text
Create a 30/60/90 day roadmap for AI-Trading.

Product direction:
Codex-only, zero-install, browser-based trading workflow. Learn from HKUDS/AI-Trader, but do not copy its full platform or marketplace scope.

Roles:
- Platform Strategist
- Zero-Install Advocate
- Trading Safety Officer
- Business Model Analyst
- Technical PM

Output:
1. Positioning difference vs HKUDS/AI-Trader.
2. Five things to learn.
3. Five things to avoid.
4. Core moat.
5. MVP scope.
6. Non-MVP scope.
7. 30/60/90 day roadmap.
8. Acceptance criteria for each phase.
9. Biggest risks and mitigations.
```

### Implementable Work

- Add `docs/roadmap.md`.
- Mark MVP vs later work.
- Keep copy trading, marketplace, public signal feed, and real broker API integrations out of MVP.

## Consolidated Implementation Backlog

### High Priority

1. Expand the orchestrator skill into a complete agent handoff contract.
2. Update Starter generated prompt so it uses the orchestrator by default.
3. Add customer-facing zero-install copy to Starter UI.
4. Add fail-state text for unsafe or unclear trading screens.
5. Add run log documentation and ignore actual run artifacts.

### Medium Priority

1. Add weekly review template for run quality.
2. Add consistency checks for skill front matter, safety language, and output fields.
3. Add `docs/roadmap.md` with 30/60/90 day phases.
4. Add prompt examples for Demo, Replay, Paper, and Live-ready manual-confirm modes.

### Low Priority

1. Hosted run history.
2. Hosted skill registry.
3. Broker API adapters.
4. Copy trading or public signal feed.
5. Rewards, marketplace, or community features.

## Recommended Next Build

Start with the workflow layer:

1. Update `skills/mnq-demo-trading-orchestrator/SKILL.md`.
2. Update `assets/js/index.js` generated prompt.
3. Add `runs/README.md`.
4. Add `.gitignore` entries for run logs and screenshots.

This improves product safety and customer usability without adding installation burden.

