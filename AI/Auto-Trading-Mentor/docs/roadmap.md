# AI-Trading Roadmap

Date: 2026-06-10

Product direction: Codex-only, zero-install, browser-based AI-assisted trading workflow.

Customers should not install packages, clone this repo, or run local scripts. The builder may maintain this repo, but the customer experience should stay inside Codex and the trading platform web UI.

## MVP Scope

- Hosted or copyable Starter prompt.
- Orchestrator workflow as the default trading loop.
- Demo, Replay, and Paper Trading as the default execution environments.
- Live-ready mode with mandatory human confirmation.
- Fail-closed rules for unclear account mode, hidden qty, hidden PnL, hidden Close/Exit, unclear fills, and Real/Live detection.
- Privacy-safe run log schema and documentation.

## Non-MVP Scope

- Copy trading marketplace.
- Public signal feed.
- Rewards or points economy.
- Customer-side broker SDK installation.
- Real broker API adapters.
- Hosted customer account system.

## 30 Days

Goal: make the generated prompt safer and more operational.

Deliverables:

- Expand `mnq-demo-trading-orchestrator` into the default handoff contract.
- Update Starter output so generated prompts include Codex-only rules, orchestrator workflow, and failure messages.
- Add run log documentation and ignore sensitive artifacts.
- Add customer-facing zero-install wording to the Starter page.

Acceptance criteria:

- Generated prompt mentions `mnq-demo-trading-orchestrator`.
- Generated prompt says customers do not install packages or clone repos.
- Generated prompt clearly states Codex account is not broker access.
- Generated prompt includes stable failure messages.
- Actual run logs and screenshots are ignored by git.

## 60 Days

Goal: make the product easier to use repeatedly.

Deliverables:

- Add mode-specific prompt examples for Read-Only, Demo, Replay, Paper, and Live-ready.
- Add a weekly review template for trading run quality.
- Add consistency checks for skill front matter, safety language, and required output fields.
- Update Starter UI to show explicit unsafe-screen recovery guidance.

Acceptance criteria:

- A user can generate a prompt for each mode without editing it manually.
- Every skill has front matter, purpose, fail-closed logic, and output fields.
- Safety wording is consistent across README, Starter, and skills.
- Weekly review can summarize wait quality, blocked reasons, execution quality, and manual intervention.

## 90 Days

Goal: prepare for hosted product use without customer installs.

Deliverables:

- Host Starter as a static public page.
- Provide one public top-level prompt or hosted skill entry.
- Add optional redacted run summaries.
- Design hosted state or run history without storing broker credentials or private screenshots by default.

Acceptance criteria:

- Customer can start from a public URL and Codex only.
- No customer-facing workflow asks for `git clone`, `pip install`, `npm install`, local scripts, or SDK installation.
- Any persisted run history is redacted and excludes account identifiers, tokens, passwords, raw screenshots, and private PnL unless explicitly allowed.
- Live-ready workflows always require human confirmation.

## Main Risks

- Customer mistakes Codex access for broker authorization.
- AI clicks in Real or Live mode due to unclear screen state.
- Missing PnL or qty leads to unsafe execution.
- Run logs accidentally capture sensitive broker UI.
- Product scope drifts into a full trading platform before the zero-install workflow is strong.

## Risk Controls

- Repeat Codex-account-is-not-broker-access wording in Starter and generated prompt.
- Fail closed on Real, Live, unclear account mode, hidden qty, hidden PnL, hidden Close/Exit, unclear fills, and unclear working orders.
- Keep actual run logs and screenshots ignored by default.
- Keep copy trading, marketplace, public signal feed, and broker API adapters out of MVP.

