---
name: heartbeat-reporting
description: Produce final Chinese Trading Action Card output for AI-Trading heartbeat rounds. Use only at the end of a workflow to format the final decision as 多單, 空單, 平倉, 減倉, WAIT, or MANUAL without doing strategy analysis.
---

# Heartbeat Reporting

## Purpose

Use this skill only for the final user-facing output format. It must not decide strategy, override risk, authorize execution, or repeat agent discussion.

Default language: Chinese.

## Allowed Actions

Only output one of these actions:

- `多單`
- `空單`
- `平倉`
- `減倉`
- `WAIT`
- `MANUAL`

## Compact Output Rules

- Default to a short Chinese Trading Action Card.
- Do not output full Agent discussion.
- Do not output long market analysis.
- Do not repeat strategy rules.
- Do not repeat risk-control rules.
- Do not repeat Skill contents.
- Only output full trade fields when Action is `多單`, `空單`, `平倉`, or `減倉`.
- If there is no valid trade opportunity, output only `WAIT`.
- If there is a candidate setup but it fails a gate, `WAIT` must include the shortest blocking reason.
- If account environment, symbol, quantity, current position, PnL, Buy / Sell / Close buttons, or authorization cannot be confirmed, output only `MANUAL`.
- Ordinary `WAIT` output should be under 50 tokens.
- `MANUAL` output should be under 80 tokens.
- Order Action Cards should be under 150 tokens.
- Full Agent analysis is allowed only when the user selected Review mode or explicitly asks to expand the reason.

## Action Card Formats

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

Wait:

```text
Action: WAIT
Reason: 無有效進場訊號
```

Wait with candidate:

```text
Action: WAIT
Reason: 候選不合格：confidence 61 < 62
```

Other valid short WAIT reasons include:

- `候選不合格：setup_score 63 < 65`
- `候選不合格：RR 1.2 < 1.5`
- `候選不合格：stop 1,700 > 1,500`
- `等待回踩確認`
- `價格離進場區太遠`
- `方向分歧過大`
- `風控阻擋`
- `加碼不合格：未到 add zone`
- `加碼不合格：加碼後風險超標`

Manual:

```text
Action: MANUAL
Reason: 無法確認交易模式
Next: 請確認 Demo / Paper / Replay / Live 授權狀態
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

## Required Fields

For `多單` or `空單`, include:

- `Action`
- `Volume`
- `Entry`
- `TP`
- `SL`
- `Confidence`
- `Reason`

For `平倉` or `減倉`, include:

- `Action`
- `Volume`
- `Reason`

For `WAIT`, include only:

- `Action`
- `Reason`

For `MANUAL`, include:

- `Action`
- `Reason`
- `Next`

## Prohibited Output

- Do not output JSON.
- Do not wrap the final card in XML.
- Do not claim execution if fill was not confirmed.
- Do not hide missing safety status; use `MANUAL` instead.
