---
name: order-execution
description: Execute only permitted AI-Trading order actions after safety, authorization, risk, market scan, and Action Card requirements pass.
---

# Order Execution

## Purpose

Use this skill only for execution. It must not do strategy analysis.

## Required Preconditions

Execute only when all conditions pass:

- `platform-safety` passes.
- `authorization-modes` allows execution.
- `risk-control` passes.
- `market-scan` has a valid signal.
- Action Card has been produced.
- Buy / Sell / Close button is clearly visible.
- Qty is correct.
- Product is correct.
- Account is correct.
- Working orders are not dangerous or conflicting.
- One action maximum per heartbeat round.

If any condition is unclear, output MANUAL through `heartbeat-reporting`.

## Action Mapping

- `多單` maps to Buy.
- `空單` maps to Sell.
- `平倉` maps to Close / Exit.
- `減倉` maps to Reduce.
- `WAIT` maps to no click.
- `MANUAL` maps to no click.

## Non-Negotiable Rules

- Never click when account mode is unclear.
- Never click when mode is `Live View`.
- Never click in `Live Approve` before user confirmation.
- Never click in `Live Auto` unless explicit Live Auto authorization exists.
- Never click if product, qty, position, PnL, or controls are unclear.
- Never click more than once per heartbeat round.
- Never repeat a click when fill status is unclear.
- Never open a new position while an existing position is unclear.
- Add orders must respect the 8-contract campaign maximum or the latest stricter Starter setting.

## Working Orders

New Entry Mode requires no dangerous or conflicting working orders. It does not require absolutely zero orders.

Do not block when:

- Working orders are clearly inactive.
- Working orders are clearly cancelled.
- Working orders are unrelated to the current product.
- Working orders clearly cannot affect the new trade.
- Orders panel shows no active working order.
- Orders panel is not visible, but the trading panel clearly shows `position = 0` and `active orders = 0` or `no working orders`.

Block or require MANUAL when:

- Orders / Position / Working Orders are all unavailable and the platform may still have active orders.
- Working orders conflict with the new direction.
- Working order quantity is unclear.
- Working order product is unclear.
- Working orders may cause duplicate entry.
- Fill status after a previous click is unclear.

If working orders are unclear, final output should be:

```text
Action: MANUAL
Reason: 掛單狀態不明
Next: 請確認 Working Orders 是否仍有效
```

## Output

Return internal fields:

- action
- clicked
- qty
- fill_confirmed
- execution_reason
- required_manual_intervention
