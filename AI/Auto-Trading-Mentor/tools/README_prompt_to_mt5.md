# Prompt → MT5 EA 翻譯器

把本專案風格的「AI Trading Workflow」prompt 自動轉成可編譯、可在 MT5
Strategy Tester / Demo 執行的 MQL5 Expert Advisor（`.mq5`）。

---

## 先回答你的兩個問題

**「這個 prompt 丟到 MT5 有可能賺錢並跑得動嗎？」**

- **直接丟＝跑不動**：MT5 只執行編譯後的 MQL5 程式，不讀自然語言 prompt，也沒有「看 TradingView 截圖」的能力。那是 LLM 的工作，不是 MT5 的。
- **賺不賺錢？這份 prompt 本來就不是為賺錢設計的**。它整份是**風控／安全審查器**：輸出只有 WAIT / MANUAL / OBSERVE / APPROVE_REQUIRED，沒有自動進場，策略只寫「順勢延續」四個字，沒有任何精確的進場訊號。**它沒有盈利優勢(edge)，是守門員不是策略。** 風控規則能保護你不爆倉，但不會替你產生獲利。
- **能做的事**：用這支翻譯器把 prompt 的**風控規則**忠實轉成 MQL5，再補上一個**可替換的進場模組**，就能得到一支真的能在 MT5 跑的 EA。能不能賺錢，取決於你放進去的進場策略，以及 Strategy Tester 的驗證結果（見 `../docs/mt5-ea-expert-knowledge.md` 第 3、4 節）。

---

## 用法

```bash
python prompt_to_mt5.py <prompt.md> [-o 輸出.mq5]

# 範例（已附）
python prompt_to_mt5.py example_prompt.md -o generated/XAUUSD_trend_continuation_EA.mq5
```

把產生的 `.mq5` 放到 MT5 的 `MQL5/Experts/` 資料夾，用 MetaEditor 按 F7 編譯，
再到 Strategy Tester 回測。

## prompt 欄位 → EA 的對應

| prompt 欄位 | 轉成 EA 的什麼 |
| --- | --- |
| Market | `InpSymbol`，並在 Safety Gate 檢查當前商品是否相符，不符就不交易 |
| Currency | `InpCurrency`，檢查帳戶幣別 |
| Mode（回放/Demo/Paper…） | `InpAutoAllowedByMode`；Live/Real 會被擋成不自動下單 |
| Strategy framework（順勢延續…） | 選用對應的 `Signal_*()` 進場模組（占位，可替換） |
| Max trade loss | `InpMaxTradeLoss`，依停損距離反推手數，使單筆風險不超過此值 |
| Daily loss limit | `InpDailyLossLimit`，當日已實現+浮動虧損達標即停止開新倉 |
| Minimum RR | `InpMinRR`，TP/SL 比值低於此值不進場 |
| Max contracts | `InpMaxContracts`，手數上限 |
| Expected profit target | `InpProfitTarget`，當日盈利達標後保護優先、不開新倉 |
| Add rule（需人工確認） | EA 永不加碼/攤平；有部位時只做保本/移動停損 |

## 忠實轉譯的安全規則（fail-closed）

EA 的 `SafetyGate()` 把 prompt 的安全邊界轉成「條件不滿足就不動作」（等同 prompt 的 MANUAL）：

- 當前商品 ≠ 設定商品 → 不交易
- 終端機/帳戶/EA 無交易權限 → 不交易
- 商品不可交易（`SYMBOL_TRADE_MODE_DISABLED`）→ 不交易
- 帳戶幣別 ≠ 設定幣別 → 不交易
- **REAL 帳戶且非測試器且未開 `InpAllowLiveAuto` → 不自動下單**（對應「MVP 不支援 Live Auto」）
- prompt 模式未授權自動下單 → 只在 Strategy Tester 內運作

下單時還會：強制掛停損、檢查 broker 最小停損距離、檢查 `ResultRetcode` 確認成交。

## 重要限制

1. **進場 `Signal_*()` 是占位策略**，僅為了讓 EA 能運作。務必自行用 Strategy Tester
   （real ticks、含點差/佣金）驗證、做樣本內外與 walk-forward，再決定是否替換成你的真實策略。
2. 翻譯器**不會復刻 LLM 看圖判讀**。需要「看 TradingView 多指標綜合判斷」時，仍用原本的 prompt 工作流。
3. 風控≠盈利。本工具保護你的風險上限，不保證獲利。
4. XAUUSD 等商品在不同 broker 的 tick value / 合約規格不同，手數計算以 `SymbolInfoDouble`
   即時取得為準；上線前請在目標 broker 的 Demo 確認。

> 免責：教育與工具用途，非投資建議。自動交易高風險，實盤後果自負。
