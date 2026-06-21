# Trade Journal Automation

這個機制把每輪 AI Trading Team Coordinator 的結論記錄到當日檔案，並自動重建當日交易報告。

## Output

預設輸出位置：

- `logs/journal/YYYY-MM-DD-mnq-demo-trading-journal.csv`
- `logs/journal/YYYY-MM-DD-mnq-demo-trading-journal.xlsx`
- `logs/reports/YYYY-MM-DD-mnq-demo-trading-report.md`

`logs/journal/` 與 `logs/reports/` 會被 `.gitignore` 忽略，避免交易與帳戶資料被提交。

## Basic Usage

產生範例 JSON：

```bash
python3 scripts/trade_journal.py sample
```

把一輪交易判斷追加到當日 CSV/XLSX，並重建報告：

```bash
python3 scripts/trade_journal.py log --input latest-run.json
```

從 stdin 寫入：

```bash
python3 scripts/trade_journal.py log --input - <<'JSON'
{
  "timestamp": "2026-06-10T17:30:00+08:00",
  "account_mode": "Demo",
  "symbol": "MNQM6",
  "position": 0,
  "qty": 3,
  "current_price": 21950.25,
  "working_orders": 0,
  "execution_decision": "等待",
  "action_taken": "none",
  "fill_status": "not_submitted",
  "candidate_setup": {
    "direction": "long",
    "entry": 21952,
    "stop": 21927,
    "take_profit": 21990,
    "invalidation": "跌破 21927 並失守 VWAP",
    "rr": 1.52,
    "setup_score": 69,
    "confidence": 64
  },
  "risk": {
    "status": "soft_block",
    "hard_blocks": [],
    "soft_warnings": ["5m structure unavailable", "MACD unavailable"]
  },
  "final_recommendation": "等待",
  "next_step": "等待突破後回測，重新評分。"
}
JSON
```

重建指定日期報告：

```bash
python3 scripts/trade_journal.py report --date 2026-06-10
```

## Prompt Integration

在每輪 heartbeat prompt 末尾加入這段規則，讓 Codex 在輸出 XML 前先寫入本地紀錄：

```text
每輪判斷完成後，先建立一份 trade_journal_record JSON，欄位至少包含：
timestamp、account_mode、symbol、position、qty、current_price、working_orders、
execution_decision、action_taken、fill_status、candidate_setup(direction, entry, stop,
take_profit, invalidation, rr, setup_score, confidence)、risk(status, hard_blocks,
soft_warnings)、agents、final_recommendation、next_step、source_message。

在輸出 heartbeat XML 前，使用：
python3 scripts/trade_journal.py log --input -
將該 JSON 寫入當日 CSV/XLSX，並重建當日報告。

若記錄器執行失敗，不得因此下單；message 內標註「交易紀錄寫入失敗，需要人工檢查」。
```

## Recommended Review Loop

每天收盤後看 `logs/reports/YYYY-MM-DD-mnq-demo-trading-report.md`：

- 高分但沒有下單的 setup：檢查是否過度保守。
- 低分卻賺錢的 setup：檢查是否缺少某個趨勢或量能條件。
- 被硬阻擋的 setup：確認阻擋是否正確。
- stop 被打掉的交易：回看 stop 是否放在噪音區，而不是結構失效點。
- confidence 高但 RR 低的交易：下一版 prompt 要強化「不追價」與「停損必須貼近結構」。
