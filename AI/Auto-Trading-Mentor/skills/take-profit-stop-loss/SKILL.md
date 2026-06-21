---
name: take-profit-stop-loss
description: Define MNQ/MNQM6 manual stop loss, take profit, risk/reward, trailing stop, partial profit, and invalidation levels. Use when Codex must convert a visible setup into entry, manual_stop, manual_take_profit, RR, breakeven logic, reduce zones, and structural failure rules before any order is allowed.
---

# Take Profit Stop Loss

## Purpose

Use this skill to define the risk box before any entry, add, reduce, or close decision. No order should be allowed without stop, target, RR, and invalidation.

## Required Outputs

- entry
- manual_stop
- manual_take_profit
- RR
- invalidation
- reduce_zone
- breakeven_rule

## Stop Loss

For Buy setups, place stop using structure:

- Below pullback support.
- Below breakout base.
- Below VWAP when VWAP reclaim is the thesis.
- Below invalidation candle low.

For Sell setups, place stop using structure:

- Above rejection resistance.
- Above breakdown base.
- Above VWAP when VWAP rejection is the thesis.
- Above invalidation candle high.

Do not use fixed points alone if they conflict with structure.

## Take Profit

Use visible liquidity and structure:

- Previous high or low.
- Day high or day low.
- Support or resistance.
- Next clean liquidity zone.
- A level that supports `RR >= 1.2`.

If the target is too close for `RR >= 1.2`, mark the setup as wait.

## RR

Calculate conceptually:

```text
RR = expected_reward / expected_risk
```

Minimum requirement for new entries:

```text
RR >= 1.2
```

## Breakeven and Trailing

Consider moving risk when:

- Price reaches 1R.
- Breakout holds and forms a new support/resistance.
- PnL is profitable but momentum starts fading.
- Volume weakens after extension.

## Partial Profit

For a 2+2+2 campaign:

- First target: consider Reduce at 1R or first key level.
- Second phase: Hold or Add only if thesis remains valid.
- Final phase: protect profit near day high/low or reversal signals.

## Invalidation

Invalidation must be explicit. Examples:

- Buy fails if price loses VWAP and cannot reclaim.
- Sell fails if price reclaims VWAP and holds.
- Breakout becomes a failed breakout.
- MACD momentum flips against the trade with volume support.
- RSI shows strong failure or divergence.
- Key support/resistance breaks against the thesis.

