---
name: mnq-demo-trading-orchestrator
description: Orchestrate one safe AI-Trading heartbeat round. Use when Codex must run master policy, platform safety, authorization, market scan, risk, TP/SL, position management, execution, and final Trading Action Card reporting without skipping guardrails.
---

# AI-Trading Orchestrator

## Purpose

Use this skill as the top-level workflow controller for one heartbeat round. It does not replace specialized skills. It decides order, conflict priority, and fail-closed handoff.

## Required Skill Order

Run every heartbeat round in this order:

1. `master-trading-policy`
2. `platform-safety`
3. `authorization-modes`
4. `market-scan`
5. `risk-control`
6. `take-profit-stop-loss`
7. `position-management`
8. `order-execution`
9. `heartbeat-reporting`

Do not skip earlier skills because a later setup looks attractive. A valid market setup is not execution permission.

## Execution Schedule

Use the Starter UI schedule for heartbeat timing:

- Default interval: 60 seconds.
- User may set any positive integer interval in seconds.
- User may choose not to limit execution by schedule; in that case, keep running on the interval until the user stops the workflow.
- User may enable a schedule window with selected weekdays and optional daily start/end times.
- Start and end times use the local computer timezone, not automatic exchange-time conversion.
- The user must manually convert the target exchange session. For US equities/futures, consider US trading hours and daylight saving time.

If outside the allowed daily time window:

- Non-selected day: output `Action: WAIT`, `Reason: 非自動執行日`.
- Before start time: output `Action: WAIT`, `Reason: 尚未到自動執行時間`.
- After end time with no position: output `Action: WAIT`, `Reason: 已超過自動執行時間`.
- After end time with an open position: manage only existing position risk; do not open or add.

Do not ask the user to install schedulers, packages, broker SDKs, or API integrations.

## Agent Handoff Contract

| Agent | Responsibility | Allowed Actions | Prohibited Actions | Required Outputs |
| --- | --- | --- | --- | --- |
| Master Policy Agent | Resolve priority between safety, authorization, user Starter settings, risk, scan, execution, and output. | Apply latest Starter settings when safe. | Never let user settings override safety or risk. | `priority_result`, `starter_settings_applied`, `blocked_by_policy` |
| Safety Agent | Verify platform, account mode, product, position, qty, controls, Live authorization, and action-direction safety. | Mark execution allowed or blocked. | Never interpret trade setup. | `execution_allowed`, `safety_reason` |
| Authorization Agent | Match selected mode to current visible environment. | Allow Demo / Paper / Replay Auto or explicit Live Auto only when valid. | Never convert Live View or unconfirmed Live Approve into auto execution. | `authorization_mode`, `clicks_allowed`, `manual_confirmation_required` |
| Market Scan Agent | Read trend, key levels, indicators, volume, candles, and tradable zones. | Produce setup bias and next trigger. | Never authorize execution or click. | `direction`, `setup_score`, `confidence`, `reason`, `next_trigger` |
| Risk Manager Agent | Apply SL, TP, RR, daily loss, drawdown, max contracts, volatility, averaging, and invalidation rules. | Veto entries. Require WAIT, reduce, close, or manual handling. | Never loosen limits because setup quality is high. | `execution_allowed`, `new_entries_allowed`, `reduce_or_close_required`, `risk_reason` |
| TP/SL Agent | Convert valid setup into entry, SL, TP, RR, and invalidation. | Reject incomplete setups. | Never use a structure-invalid stop or target. | `entry`, `SL`, `TP`, `RR`, `invalidation` |
| Position Manager Agent | Decide hold, reduce, close, or manual intervention for existing positions. | Prioritize existing risk over new entries. | Never add when position state is unclear. | `position_status`, `position_size`, `management_action` |
| Execution Agent | Execute only one permitted action after all prior checks pass. | Buy, Sell, Reduce, Close, or Wait by mode and risk. | Never override safety, authorization, or risk. | `action`, `clicked`, `qty`, `fill_confirmed`, `execution_reason` |
| Heartbeat Reporter Agent | Produce final Chinese Trading Action Card. | Output 多單, 空單, 平倉, 減倉, WAIT, or MANUAL. | Never output JSON/XML or full Agent discussion unless Review mode. | `Action`, `Reason`, optional trade fields |

## Mode Policy

- `Demo Auto`: may auto execute only in confirmed Demo when all checks pass.
- `Paper Auto`: may auto execute only in confirmed Paper Trading when all checks pass.
- `Replay Auto`: may auto execute only in confirmed Replay / simulated trading when all checks pass.
- `Live View`: analysis only; no order clicks.
- `Live Approve`: recommendations only until the user confirms the exact action.
- `Live Auto`: auto execution only after explicit user selection and risk confirmation.

## Entry Gate Policy

Use dynamic entry gates from Starter settings:

- Aggressive only when `style = 進攻` and preset is `Scalper`: `setup_score >= 65`, `confidence >= 62`
- Balanced / Hybrid: `setup_score >= 70`, `confidence >= 66`
- Conservative / 保守 uses at least Balanced: `setup_score >= 70`, `confidence >= 66`

`Conservative Swing with Fast Entry` is not `Aggressive Scalper`.

All entry gates still require user minimum RR, user maximum single loss, user maximum quantity, `position = 0`, and no dangerous or conflicting working orders.

## Auto Mode Relaxations

In Demo Auto, Paper Auto, and Replay Auto, optional missing indicators only reduce confidence. They do not cause MANUAL by themselves.

Replay Auto may continue with a new candidate when daily PnL is hidden if `position = 0`, core safety is visible, and no dangerous working order exists. Use daily PnL = 0 only as a replay testing estimate.

Compact / Auto mode requires Risk Manager plus one non-aligned risk check. Review mode is the only mode that requires three opposing views.

## Candidate Setup Visibility

Every heartbeat should create an internal candidate setup when possible.

Compact mode must not output the full setup. If WAIT is returned, output only the shortest main blocking reason.

Review mode may expand candidate setup and Agent analysis.

## Fail-Closed Rules

Immediately block execution and continue to `heartbeat-reporting` when:

- Account mode is unclear or unauthorized.
- Product is unclear or wrong.
- Current position, qty, PnL, current price, or required controls are hidden.
- Previous click fill status is unknown.
- Working orders are unclear.
- Daily PnL has hit profit lockout or loss stop.
- Entry, SL, TP, RR, or invalidation is missing.
- More than one click would be needed in the same heartbeat round.
- Selected mode does not permit the required action.

Working orders are not a hard block when they are clearly inactive, cancelled, unrelated to the product, or shown as absent. They are a hard block or MANUAL only when dangerous, conflicting, unclear, wrong product, unclear quantity, duplicate-entry risk, or previous fill status is unclear.

When blocked, final Action must be `WAIT`, `平倉`, `減倉`, or `MANUAL`, depending on visible position risk.

## Decision Policy

Use the strictest result when skills disagree:

- Safety block means execution is blocked.
- Authorization block means execution is blocked.
- Risk block means no new entry.
- Missing TP/SL/RR means WAIT or MANUAL.
- Unclear position means no add.
- Unknown fill status means stop all further clicks and require MANUAL.

## Final Output

The final response must be produced through `heartbeat-reporting` as a Chinese Trading Action Card.

No trade:

```text
Action: WAIT
Reason: 候選不合格：confidence 61 < 62
```

Manual:

```text
Action: MANUAL
Reason: 無法確認交易模式
Next: 請確認 Demo / Paper / Replay / Live 授權狀態
```

Long:

```text
Action: 多單
Volume: 1 lot
Entry: Market
TP: 4650.5
SL: 4590
Confidence: 75%
Reason: MACD 即將黃金交叉，RSI < 20，價格即將往上穿越均線。
```

Short:

```text
Action: 空單
Volume: 1 lot
Entry: Market
TP: 4520
SL: 4595
Confidence: 72%
Reason: 價格跌破支撐，MACD 空方動能擴大，RSI 反彈失敗。
```

Close:

```text
Action: 平倉
Volume: All
Reason: 價格跌破主要支撐，原多方 thesis 失效。
```

Reduce:

```text
Action: 減倉
Volume: 1 lot
Reason: 波動擴大，風險升高，先降低部位。
```
