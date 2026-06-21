---
name: risk-control
description: Apply AI-Trading risk limits and guardrails before any order decision. Use when Codex must evaluate stops, targets, RR, position size, daily loss, drawdown, volatility, averaging down, and invalidation.
---

# Risk Control

## Purpose

Use this skill before any order execution or position management decision. It only checks risk. It must not decide output format.

## User Settings

Use the latest Starter UI settings when provided:

- Daily profit target: `+3000 USD`
- Per-trade maximum loss: `-1500 USD`
- Daily maximum loss: `-2000 USD`
- Main campaign maximum: `8 contracts`
- Minimum RR: use Starter UI setting
- Add-on rule: use Starter UI setting

User settings cannot override safety or risk rules.

## Required Checks

- Every trade has an SL.
- Every trade has a TP.
- RR meets the minimum requirement.
- Single-order size does not exceed the limit.
- Total position size does not exceed the limit.
- Daily maximum loss is not violated.
- Maximum drawdown is not violated.
- The setup is not chasing during high volatility.
- Long setup is invalid if support has already broken.
- Short setup is invalid if resistance has already broken upward.
- No unconditional averaging down.
- No adding after total invalidation is broken.

## Dynamic Entry Gate

Do not use a fixed `setup_score >= 72` or `confidence >= 68`.

Use the Starter UI style and preset:

- Aggressive only when `style = 進攻` and preset is `Scalper`:
  - `setup_score >= 65`
  - `confidence >= 62`
- Balanced / Hybrid:
  - `setup_score >= 70`
  - `confidence >= 66`
- Conservative / 保守 uses at least Balanced:
  - `setup_score >= 70`
  - `confidence >= 66`

`Conservative Swing with Fast Entry` is not `Aggressive Scalper`.

All gates still require:

- `RR >= user_min_rr`
- `stop <= user_max_single_loss`
- `qty <= user_max_qty`
- `position = 0`
- no dangerous or conflicting working orders

If the candidate fails, return the shortest blocking reason, such as `候選不合格：confidence 61 < 62`.

## PnL Visibility

Hard block or require `MANUAL` when:

- Real / Live mode has hidden daily PnL and an order is being considered.
- An open position exists and open position PnL is hidden while managing the position.
- An open position exists and Position / Orders / Working Orders are unclear.
- Close, Reduce, Cancel, or Replace is needed but position or order state is unclear.

Soft downgrade only when:

- Mode is Demo Auto, Paper Auto, or Replay Auto.
- `position = 0`.
- daily PnL is hidden.
- Core safety conditions are visible.
- There are no dangerous or conflicting working orders.

When soft downgrading, lower confidence by 3 to 8 points and mark daily PnL as not visible. Demo Auto, Paper Auto, and Replay Auto may proceed when `position = 0` and core safety is complete. Replay Auto may temporarily estimate daily PnL as 0 for testing when no other hard block exists.

## Add Risk

Planned adds are allowed only when all conditions pass:

- User setting allows adding. If user setting is `不允許加碼`, all Add-on / Scale-in / DCA / Averaging down is forbidden.
- Original thesis has not failed.
- Price reaches the user-defined or candidate add zone.
- Total contracts after add remain within user max qty.
- Total risk after add remains within user max single loss.
- RR after add remains at or above user minimum RR.
- Position is clear.
- Working orders are clear.
- Environment is not unauthorized Real / Live.
- Confidence meets the add threshold:
  - Aggressive add: `confidence >= 65`
  - Balanced add: `confidence >= 68`
  - Conservative add: `confidence >= 72`

Block adds when:

- Thesis has failed.
- Total invalidation is broken.
- Total contracts exceed max qty.
- Total risk exceeds max single loss.
- The add is only because the trade is losing and price has not reached add zone.
- Working orders or position are unclear.
- Live Auto is not explicitly authorized.

If an add fails, return a short reason such as `加碼不合格：未到 add zone` or `加碼不合格：加碼後風險超標`.

## Decision Rules

If risk fails:

- Do not continue adding.
- Use `WAIT`, `減倉`, or `平倉` depending on current position risk.
- If safety data is unclear, prefer `MANUAL`.

Set `new_entries_allowed=false` when:

- Daily PnL is at or above daily profit target.
- Daily PnL is at or below daily maximum loss.
- Existing position is open and the action is a new entry.
- Risk after add would exceed the loss limit.
- RR, SL, TP, or invalidation is missing.

## Output

Return internal fields:

- execution_allowed
- new_entries_allowed
- reduce_or_close_required
- risk_reason
- daily_pnl_status
- position_risk_status
- required_manual_intervention
