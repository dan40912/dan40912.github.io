---
name: market-scan
description: Scan visible market structure and indicators for AI-Trading workflows. Use when Codex needs trend, support, resistance, MACD, RSI, VWAP, Volume, candle pattern, and trade-area bias without executing orders.
---

# Market Scan

## Purpose

Use this skill to scan the visible chart context. It can produce bias and candidate setups, but it must not authorize or execute orders.

## Required Scan

- Main trend
- Short-term trend
- Support
- Resistance
- MACD
- RSI
- VWAP
- Volume
- K-line pattern
- Whether price is near a tradable area
- Whether a retest is required
- Whether price has broken above or below a key level

If an indicator or level is not visible, mark it as `not_visible`. Do not invent values.

## Indicator Visibility

Separate selected indicators into:

- `selected_optional_indicators`
- `selected_required_indicators`

In Demo Auto, Paper Auto, and Replay Auto:

- MACD not visible only lowers confidence.
- RSI not visible only lowers confidence.
- Volume not visible only lowers confidence.
- VWAP / MA not visible only lowers confidence.
- News / Macro not visible should be marked `unknown` or `not_visible`.
- Do not invent hidden data.
- Do not output MANUAL only because optional indicators are not visible.
- Only a missing `selected_required_indicator` may trigger MANUAL.

## Setup Assessment

Return:

- direction: Buy / Sell / Wait
- setup_score
- confidence
- blocking_reason
- reason
- next_trigger

Market scan can recommend bias, but final execution still requires platform safety, authorization, risk control, TP/SL, position management, and order execution checks.

## Prohibited Actions

- Do not click.
- Do not authorize execution.
- Do not override risk control.
- Do not treat any single indicator as enough to enter.
