# Trading Run Logs

This directory is reserved for future Demo, Replay, or Paper Trading run logs.

Actual run logs and screenshots are ignored by git because they may contain sensitive trading screen context such as account mode, PnL, positions, timestamps, or broker UI details.

## Safe to Commit

- This README.
- Public schema files.
- Redacted examples with fake data only.

## Do Not Commit

- Real screenshots.
- Broker account identifiers.
- API keys, tokens, session values, or passwords.
- Personal customer data.
- Raw trading platform exports.
- Logs that show private positions or PnL.

## Recommended Fields

Use `docs/api/demo-trading-run.schema.json` as the internal contract for one heartbeat run.

Track:

- environment status
- authorization mode
- safety result
- market scan result
- risk result
- TP/SL result
- position result
- execution decision
- action taken
- fill status
- blocked reason
- manual intervention flag
- next run instruction

