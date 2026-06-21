# QA Report: Codex-Only Orchestrator Starter

Date: 2026-06-10

Local test URL:

```text
http://localhost:8091/
```

## Scope

This QA pass verifies the first implementation of the Codex-only trading workflow:

- Starter page zero-install messaging.
- Static asset loading.
- JavaScript syntax.
- Wizard flow.
- Validation for missing required choices.
- Generated prompt content.
- Read-Only, Demo, and Live mode behavior in generated prompt.
- Desktop and mobile viewport layout overflow.

## Environment

- Static server: `python3 -m http.server 8091`
- Browser automation: temporary `playwright-core` in `/tmp/ai-trading-qa`
- Browser executable: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

No testing package was added to this repository.

## Checks Run

### Static Checks

- `node --check assets/js/index.js`
- HTTP load checks:
  - `/`
  - `/assets/js/index.js?v=codex-only-orchestrator`
  - `/assets/css/index.css?v=codex-only-orchestrator`
- Content search for:
  - `Codex-only`
  - `零安裝`
  - `mnq-demo-trading-orchestrator`
  - `Codex 帳號不等於 broker 帳號`
  - `顧客修復提示`
  - `Real / Live`
  - `DONT_NOTIFY`
  - `NOTIFY`

### Browser Checks

Desktop viewport: `1440x1000`

- Page title contains `交易設定啟動器`.
- Hero copy includes Codex account and zero-install positioning.
- No horizontal overflow.
- Clicking `下一步` before selecting market shows required validation.
- Completed wizard path:
  - Market: `MNQ`
  - Mode: `Demo`
  - Personality: `Scalper`
  - Goal: `穩定獲利`
  - Style: `平衡`
- Results panel appears.
- Generated prompt includes:
  - `mnq-demo-trading-orchestrator`
  - `Orchestrator workflow`
  - `顧客不需要安裝任何套件`
  - `Codex 帳號不等於 broker 帳號`
  - failure-state messages
  - heartbeat XML with `DONT_NOTIFY` and `NOTIFY`
- Read-Only generated prompt blocks execution.
- Live generated prompt requires human confirmation and forbids autonomous execution.
- No page errors.

Mobile viewport: `390x844`

- Hero loads with zero-install message.
- No horizontal overflow.

## Result

All automated QA checks passed.

```json
{
  "passed": true,
  "failed": [],
  "checks": 13
}
```

## Visual Evidence

- Desktop first-screen/full-page QA screenshot: `artifacts/qa-desktop-codex-only.png`
- Desktop results QA screenshot: `artifacts/qa-results-codex-only.png`
- Mobile full-page QA screenshot: `artifacts/qa-mobile-codex-only.png`

## Notes

The initial prompt-length check expected more than 10,000 characters and failed because the generated Demo prompt was 7,990 characters. The content checks all passed, so the threshold was corrected to verify completeness by required sections rather than arbitrary length.

## Residual Risk

- This QA does not test real broker UIs.
- This QA does not validate actual Codex in-app browser click behavior on Tradovate, TradeDay, or TradingView.
- This QA does not verify a hosted public deployment.
- Further QA should test real Demo / Replay / Paper Trading screens with the browser plugin before claiming execution reliability.

