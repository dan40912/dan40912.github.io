---
name: platform-safety
description: Verify trading platform safety before AI-assisted analysis or execution. Use when Codex must confirm platform, account mode, product, position, qty, controls, Live authorization, and action-direction safety.
---

# Platform Safety

## Purpose

Use this skill at the start of every heartbeat round. It only checks safety. It must not contain strategy rules.

## Required Checks

- Trading platform is visible.
- Account mode is confirmed.
- Product is confirmed.
- Current position is confirmed.
- Qty is confirmed.
- Daily PnL and open position PnL are separately assessed.
- Buy / Sell / Close buttons are visible when needed.
- Current operation is not unauthorized Live execution.
- There is no simultaneous long and short position in the same product.
- Product is not the wrong product.
- Order direction matches the final Action.
- Fill status from any previous click is known.

## Fail Closed

If any safety condition is unclear, block execution and use the MANUAL final card:

```text
Action: MANUAL
Reason: 無法確認安全條件
Next: 請確認交易畫面、帳戶模式、商品、口數與目前倉位
```

## PnL Visibility

Hard block or require MANUAL when:

- Real / Live mode has hidden daily PnL and an order is being considered.
- An open position exists and open position PnL is hidden while managing that position.
- Position / Orders / Working Orders are unclear for an existing position.
- Close, Reduce, Cancel, or Replace is needed but position or order state is unclear.

Do not hard block when all are true:

- Mode is Demo Auto, Paper Auto, or Replay Auto.
- `position = 0`.
- daily PnL is hidden.
- Account mode, product, qty, position, controls, authorization, and fill status are clear.
- Working orders are absent, inactive, cancelled, unrelated, or clearly not dangerous.

In that case, mark daily PnL as not visible and let market/risk logic reduce confidence.

## Output

Return internal fields:

- platform_visible
- account_mode
- product_confirmed
- position_confirmed
- qty_confirmed
- daily_pnl_status
- open_position_pnl_status
- controls_visible
- live_authorization_status
- wrong_product_detected
- conflicting_position_detected
- action_direction_safe
- execution_allowed
- safety_reason
