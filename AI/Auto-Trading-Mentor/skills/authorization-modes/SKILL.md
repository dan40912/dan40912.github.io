---
name: authorization-modes
description: Define and enforce AI-Trading authorization modes: Demo Auto, Paper Auto, Replay Auto, Live View, Live Approve, and Live Auto.
---

# Authorization Modes

## Purpose

Use this skill before any action that might click a trading control. Authorization mode does not replace platform safety or risk control.

## Modes

| Mode | Meaning | Click Permission |
| --- | --- | --- |
| `Demo Auto` | Demo environment automation | Buy / Sell / Close / Reduce only when all checks pass |
| `Paper Auto` | Paper Trading automation | Buy / Sell / Close / Reduce only when all checks pass |
| `Replay Auto` | Replay / simulated trading automation | Buy / Sell / Close / Reduce only when all checks pass |
| `Live View` | Live chart/account view only | No clicks |
| `Live Approve` | Live recommendation with manual approval | No clicks until user confirms the exact action |
| `Live Auto` | Live auto execution after explicit user authorization | Clicks allowed only when explicit Live Auto authorization and all checks pass |

## Enforcement

Set `execution_allowed=false` when:

- Mode is `Live View`.
- Mode is `Live Approve` and user confirmation has not been received.
- Mode is unclear.
- Platform safety fails.
- Risk control fails.
- Account mode, product, qty, current position, PnL, or controls cannot be confirmed.

Set `execution_allowed=true` only when:

- Mode is `Demo Auto`, `Paper Auto`, `Replay Auto`, or explicitly authorized `Live Auto`.
- Platform safety passes.
- Risk control passes.
- Market scan has a valid setup.
- Order execution requirements pass.

## Fail Closed Output

If current mode cannot be confirmed, final output should be:

```text
Action: MANUAL
Reason: 無法確認交易模式
Next: 請確認 Demo / Paper / Replay / Live 授權狀態
```

## Output

Return internal fields:

- authorization_mode
- clicks_allowed
- allowed_actions
- blocked_actions
- manual_confirmation_required
- authorization_reason
