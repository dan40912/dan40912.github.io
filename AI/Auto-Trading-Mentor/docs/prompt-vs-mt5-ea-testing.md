# 用本專案 PROMPT 測試 vs MT5 原生 EA 回測：分析與實際試跑

> 目的：說明「本專案產生的 AI 看盤 prompt（多代理 heartbeat）」與「MT5 原生 EA（MQL5 + Strategy Tester）」在**測試方式**上的本質差異，並用本專案 prompt 實際跑一輪 heartbeat 看會產生什麼。
> 搭配閱讀：`mt5-ea-expert-knowledge.md`
> 最後更新：2026-06-24

---

## 1. 兩者是「完全不同的東西」

很多人會誤以為本專案是「一種 EA」。其實兩者所在的層級不同：

| 面向 | **MT5 原生 EA** | **本專案 PROMPT（AI 看盤 heartbeat）** |
| --- | --- | --- |
| 本質 | 編譯後的 MQL5 程式（`.ex5`）在終端機內執行 | 一段給 LLM（Codex/ChatGPT/Claude）的提示詞 + 多代理 skills |
| 決策者 | 程式碼的確定性邏輯 | 大型語言模型「看畫面」後的判斷 |
| 取得行情 | 直接讀 broker 行情 / tick 串流 | **看螢幕截圖**（TradingView + 交易平台畫面） |
| 下單方式 | 透過交易 API（CTrade）送單到伺服器 | 由 AI「點擊」交易平台按鈕，且本專案限制每 heartbeat 只能一個動作 |
| 執行節奏 | 事件驅動（OnTick / OnTimer） | 固定 heartbeat 間隔（預設 60 秒，類似 OnTimer） |
| 回測引擎 | MT5 Strategy Tester（tick 級、可優化） | **沒有內建回測引擎**，靠 Replay/Demo/Paper 逐回合前進測試 |
| 可重現性 | 高（同資料同參數 → 同結果） | 低（LLM 有隨機性、畫面狀態會變） |
| 速度 | 一年資料數秒~數分鐘 | 每回合即時，要真的等時間過 |
| 安全模型 | 程式自負，預設可直接實盤自動 | **fail-closed**：狀態不明就輸出 MANUAL；MVP 不支援 Live Auto |

一句話總結：**MT5 EA 是「程式自動交易 + 可加速回測」；本專案是「讓 AI 依你的規則看盤、逐回合給決策卡，並強制人工/風控守門」。**

---

## 2. 「測試」這個詞在兩邊意思不同

### MT5 EA 的測試 = Strategy Tester 回測/優化
- 可把數月~數年歷史在幾秒內跑完（time-compression）。
- 可優化參數、跑 walk-forward、樣本內/外驗證（見知識庫第 3、4 節）。
- 強項：統計樣本大、可重現、能量化過擬合風險。
- 弱項：模擬與實盤有落差（滑點、點差、心理），且只能測「寫得出程式」的規則。

### 本專案 PROMPT 的測試 = 逐回合「前進式」模擬
- 沒有時間壓縮的回測引擎。它靠：
  - **Replay 模式**（如 Example 的 Tradovate Market Replay）重播歷史，AI 逐 heartbeat 看畫面決策；
  - **Demo / Paper 帳戶** 即時前進測試。
- 強項：能測「人類式、看圖＋多指標綜合判斷」的策略，且每一步都過多層守門（安全→授權→風控→策略），天然偏保守。
- 弱項：慢（要真的等時間）、樣本少、不可重現、無法大規模優化參數；本質上比較像「結構化的前進測試 / 紙上交易」，不是統計回測。

> 對照知識庫第 4.3 節的黃金工作流：MT5 是「回測→前進→實盤」；本專案直接切入「前進測試」那一段，並用 Replay 來補「回看歷史」的能力。

---

## 3. 各自適合什麼

- **想做純自動、可量化、可大規模優化** → 用 MT5 原生 EA（MQL5 + Strategy Tester）。
- **策略難以寫死、需要「看圖＋多指標＋上下文」的判斷，且想要強制風控與人工確認** → 用本專案 prompt。
- **最佳組合**：用 MT5 EA / Strategy Tester 做量化驗證與參數穩健性；用本專案 prompt 做「上線前的結構化前進測試與紀律守門」，兩者互補。

---

## 4. 實際試跑一輪 heartbeat（範例）

以下把本專案的多代理流程（master-policy → platform-safety → authorization → market-scan → risk-control → tp/sl → position-management → order-execution → heartbeat-reporting）套到一個 **MT5/Replay 範例場景**，示範會輸出什麼。

### 4.1 設定（模擬 Starter UI 設定）

```
Market:        MNQ（或 MT5 上的等效指數期貨）
Mode:          Replay Auto
Style:         Balanced（setup_score>=70, confidence>=66）
Lots/Qty:      1
Stop Loss:     依結構
Min RR:        1.5
Max contracts: 8
Heartbeat:     60s
Output:        Compact（只出 Action Card）
```

### 4.2 螢幕可見狀態（模擬 Replay 畫面）

```
帳戶模式：Replay（模擬）           商品：MNQ
目前部位：0                        當日 PnL：隱藏（Replay）
價格：18,250                       Buy/Sell/Close 按鈕：可見
Working orders：無
指標：MACD 即將黃金交叉、RSI 28 由下往上、價格剛站回 VWAP 上方、量能放大
```

### 4.3 多代理逐層判讀

| 層級 | 判斷 | 結果 |
| --- | --- | --- |
| Master Policy | 套用 Starter 設定，安全/風控優先 | 通過 |
| Platform Safety | 平台可見、模式=Replay、商品/部位/口數清楚、按鈕可見；當日 PnL 隱藏但 position=0 且為 Replay Auto → 允許（降信心，不 MANUAL） | execution_allowed = true |
| Authorization | 模式 Replay Auto，可在確認的 Replay 環境自動執行 | clicks_allowed = true |
| Market Scan | 方向 Buy；MACD/RSI/VWAP/量能共振；setup_score 74、confidence 70 | direction = Buy |
| Risk Control | RR 計算：進 18,250、SL 18,210（40 點）、TP 18,330（80 點）→ RR 2.0 ≥ 1.5；口數 1 ≤ 8；無衝突掛單 | new_entries_allowed = true |
| TP/SL | entry=Market、SL=18,210、TP=18,330、RR=2.0、invalidation=跌破 VWAP/18,210 | 完整 |
| Position Mgmt | 目前無倉，無需管理既有部位 | position=0 |
| Order Execution | 前置全過、僅一個動作、按鈕可見 → 允許 Buy 1 口 | clicked=Buy |
| Heartbeat Reporter | 產出中文 Action Card | 見下 |

### 4.4 產出的 Trading Action Card

```text
Action: 多單
Volume: 1 lot
Entry: Market
TP: 18330
SL: 18210
Confidence: 70%
Reason: MACD 即將黃金交叉，RSI 由超賣翻揚，價格站回 VWAP 上方且量能放大，RR 2.0。
```

### 4.5 對照：fail-closed 會怎樣

若同一畫面把「當日 PnL 隱藏」改成「目前部位不明 / Close 按鈕看不到 / 上一筆點擊成交狀態未知」，依 `platform-safety` 與 orchestrator 的 fail-closed 規則，輸出會變成：

```text
Action: MANUAL
Reason: 無法確認安全條件
Next: 請確認交易畫面、帳戶模式、商品、口數與目前倉位
```

這正是本專案與一般 EA 最大的哲學差異：**寧可不動作，也不在狀態不明時亂下單。**

### 4.6 多回合（前進測試）會長怎樣

連續幾個 heartbeat 的可能序列（示意）：

```
t+0   多單 1 口 @18250（SL 18210 / TP 18330）
t+60  WAIT  Reason: 持倉中，未達加碼/出場條件
t+120 減倉 1 lot（觸及第一目標，部分平倉保護利潤）← 對應 Example「盈利部分平倉」
t+180 平倉  Reason: 跌破 VWAP，原多方 thesis 失效        ← 對應 Example「風控平倉」
```

這就是用本專案 prompt 在 Replay/Demo 下「測試」的真實樣貌：**逐回合前進、每步守門、輸出決策卡並記錄**，再回頭比對勝率/RR/回撤——但它不會像 MT5 Strategy Tester 那樣在幾秒內把一年跑完。

---

## 5. 結論與建議

1. 本專案 prompt **不是 EA、也不是回測引擎**；它是「AI 看盤 + 多代理風控 + 逐回合決策卡」的前進測試框架。
2. 想要統計級回測/優化，請用 MT5 原生 EA + Strategy Tester（用 real ticks、含成本、做樣本外與 walk-forward）。
3. 想要把難以程式化的「看圖綜合判斷」紀律化、並強制風控與人工確認，用本專案 prompt。
4. 建議的完整流程：**MT5 Strategy Tester 量化驗證 → 本專案 prompt 在 Replay/Demo 做結構化前進測試 → 小額實盤手動確認 → 放大**。
5. 提醒：本專案 prompt 測試的可重現性低（LLM 隨機性 + 畫面狀態），結果應視為「紀律與流程驗證」，不可當成統計顯著的績效證明。

> 免責：教育與工作流工具用途，非投資建議。實盤風險自負。
