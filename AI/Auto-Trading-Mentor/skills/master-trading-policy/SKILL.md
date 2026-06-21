---
name: master-trading-policy
description: Define priority order across AI-Trading skills and user Starter settings. Use when Codex must resolve conflicts between platform safety, authorization modes, user-selected settings, risk control, market scan, order execution, and heartbeat output.
---

# Master Trading Policy

## Purpose

Use this skill to resolve priority conflicts. User Starter UI settings should be respected, but they cannot override safety or risk rules.

## Decision Layers

Use these layers in order.

### A. Permanent Safety Layer

- Unauthorized Live / Real execution is forbidden.
- If account mode, product, qty, position, orders, Buy / Sell / Close / Exit, or fill status is unclear, use MANUAL.
- One heartbeat may take at most one action.
- Risk Manager has veto power.
- This layer is above user preferences, setup score, confidence, agent votes, and output format.

### B. User Settings Layer

The latest Starter UI settings are the active settings for the current run.

- Market, mode, quantity, stop loss, take profit, max contracts, add-on rule, agent count, heartbeat verbosity, execution schedule, and output format come from Starter UI.
- User risk values override all older example defaults inside Skill text.
- User settings must not override platform safety or authorization rules.

### C. Strategy Layer

- setup_score, confidence, MACD, RSI, VWAP, Volume, Support / Resistance, and Agent analysis belong here.
- Strategy cannot override safety or user risk settings.
- Compact mode should not expose full strategy reasoning; it should only output the Action Card and shortest main reason.

## Execution Schedule

Use the latest Starter UI execution schedule when provided:

- `intervalSeconds`: how often Codex should run one heartbeat, in seconds. Default is 60.
- `useWindow`: whether to limit automation to selected days and a daily time window. Default is false.
- `days`: optional selected weekdays when `useWindow=true`.
- `startTime`: optional daily start time.
- `endTime`: optional daily end time.
- Start and end times use the local computer timezone. They are not automatically converted to the exchange timezone.
- The user must convert exchange hours manually. For US markets, consider US market hours and daylight saving time.

If `useWindow=false`, run on the configured interval until the user stops the workflow.

If `useWindow=true`, run only on selected weekdays and inside the daily time window.

If current day is not selected, do not evaluate a new entry; output WAIT with the shortest reason.

If current time is before `startTime`, do not evaluate a new entry; output WAIT with the shortest reason.

If current time is after `endTime`, do not open or add positions. Existing positions may still be managed according to risk rules.

This schedule is a Codex heartbeat setting. It must not require broker APIs, API keys, cron setup, local scripts, or credential storage.

## Skill Responsibilities

- `platform-safety`: verifies safety only.
- `authorization-modes`: verifies the selected mode permits the action.
- `risk-control`: applies latest Starter UI risk values and dynamic entry gates.
- `market-scan`: provides setup evidence only.
- `order-execution`: executes only after safety, authorization, risk, and strategy pass.
- `heartbeat-reporting`: formats the final Trading Action Card only.
