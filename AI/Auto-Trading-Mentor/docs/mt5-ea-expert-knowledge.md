# MT5 / EA 專家級知識庫

> 目的：把成為 **MT5 Expert Advisor（EA）專家** 所需的核心知識完整保存下來，作為本專案長期參考。
> 範圍：MQL5 程式架構、EA 生命週期、下單與部位管理、Strategy Tester 回測／優化／前進測試、品質建模、過擬合防治、實盤部署與風控。
> 最後更新：2026-06-24

---

## 0. 名詞快速對照

| 名詞 | 說明 |
| --- | --- |
| MT5 | MetaTrader 5，由 MetaQuotes 開發的交易終端機 |
| EA (Expert Advisor) | 用 MQL5 寫成、可在 MT5 內**自動執行**的交易程式（機器人） |
| MQL5 | MT5 的程式語言（C++ 風格），用 MetaEditor 編譯成 `.ex5` |
| Indicator（指標） | 只做計算與繪圖，不下單 |
| Script（腳本） | 執行一次就結束，無事件迴圈 |
| Strategy Tester（策略測試器） | MT5 內建的回測 / 優化 / 前進測試引擎 |
| Tick | 一筆報價更新（bid/ask 變動） |
| Magic Number | EA 用來辨識「自己的單」的整數標記 |

EA 與 Indicator / Script 最大的差別：**EA 有完整的事件迴圈（OnTick 等），且具備交易權限**，可以實際送出買賣單。

---

## 1. MQL5 EA 程式架構

### 1.1 一支 EA 的骨架

```mql5
// 輸入參數（會出現在 EA 設定視窗，也是優化的對象）
input double   InpLots        = 0.10;     // 手數
input int      InpStopLoss    = 300;      // 停損（點）
input int      InpTakeProfit  = 600;      // 停利（點）
input int      InpMagic       = 20260624; // Magic Number

#include <Trade/Trade.mqh>   // 標準函式庫的交易類別
CTrade trade;                // 下單物件

int OnInit()
{
   trade.SetExpertMagicNumber(InpMagic);   // 綁定 Magic
   trade.SetDeviationInPoints(10);          // 容許滑點
   // EventSetTimer(60);                     // 需要計時器才開
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   // EventKillTimer();                      // 有開計時器才需關
}

void OnTick()
{
   // 每來一個新 tick 就執行：策略判斷 + 下單管理都放這
}
```

### 1.2 EA 生命週期（事件流）

```
載入 EA → OnInit() → [Tick 進來 → OnTick()]（重複） → 卸載 → OnDeinit()
```

關鍵事件處理函式（event handlers）：

- **OnInit()**：載入、重新編譯、改參數、換週期/商品時都會觸發。負責初始化：設定 Magic、容許滑點、建立指標 handle、開計時器、檢查環境。回傳 `INIT_SUCCEEDED` / `INIT_FAILED` / `INIT_PARAMETERS_INCORRECT`。
- **OnDeinit(const int reason)**：卸載前觸發，`reason` 帶卸載原因碼。負責收尾：釋放指標 handle、關計時器、刪圖形物件。
- **OnTick()**：**最核心**。每收到一個新 tick 就被呼叫一次。策略邏輯與部位管理通常都在這裡。注意：tick 不等距、不保證每秒一次，也不適合用來做「固定週期」的事。
- **OnTimer()**：用 `EventSetTimer(秒)` 開啟後，週期性觸發。適合做「每 N 秒檢查一次」這種與 tick 無關的節奏（與本專案的 heartbeat 概念相似，見對照文件）。用 `EventKillTimer()` 關閉。
- **OnTrade() / OnTradeTransaction()**：交易伺服器完成交易操作後觸發，用來處理訂單／部位／成交清單的變化。`OnTradeTransaction` 更細，可拿到每一筆 transaction（最可靠的成交確認來源）。
- **OnChartEvent()**：圖表互動事件（點擊、按鍵、物件拖曳），常用於做按鈕式手動確認 UI。
- **OnBookEvent()**：市場深度（DOM）變化。

重要特性：**MQL5 程式是單執行緒**，所有事件依到達順序「一個處理完才處理下一個」。因此 OnTick 內不要寫會長時間阻塞的程式。

### 1.3 用「新 K 棒」而非「每個 tick」做判斷

多數策略不需要每個 tick 都重算。常見做法是只在「新 K 棒形成」時判斷一次，效能更好、回測也更貼近實務：

```mql5
bool IsNewBar()
{
   static datetime last = 0;
   datetime t = iTime(_Symbol, _Period, 0);
   if(t != last) { last = t; return true; }
   return false;
}
```

---

## 2. 下單、訂單與部位管理

### 2.1 MT5 的部位模型（與 MT4 重大差異）

- MT5 **預設是 netting（淨額）模式**：同一商品只會有「一個」淨部位（多空相加）。也有 **hedging（對沖）模式**，可同時持有多筆多單與空單（外匯零售常用）。
- 概念上要分清楚三個層次：
  - **Order（訂單）**：尚未成交的請求 / 掛單。
  - **Deal（成交）**：訂單被撮合後的真實成交紀錄。
  - **Position（部位）**：由成交累積出的當前持倉。
- 歷史查詢：`HistorySelect()` → `HistoryDealsTotal()` / `HistoryOrdersTotal()`；當前：`PositionsTotal()` / `PositionGetXXX()`、`OrdersTotal()`（掛單）。

### 2.2 CTrade 標準類別（最常用的下單方式）

```mql5
#include <Trade/Trade.mqh>
CTrade trade;

// 市價買進，附 SL / TP（價格，不是點數）
double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
double sl  = ask - InpStopLoss   * _Point;
double tp  = ask + InpTakeProfit * _Point;
trade.Buy(InpLots, _Symbol, ask, sl, tp, "my-ea");

// 平倉 / 改單
trade.PositionClose(_Symbol);
trade.PositionModify(_Symbol, newSL, newTP);

// 掛單
trade.BuyLimit(...); trade.SellStop(...);
```

常用方法：`Buy / Sell`、`PositionOpen`、`PositionClose / PositionClosePartial`、`PositionModify`、`OrderOpen`（掛單）、`BuyLimit / SellLimit / BuyStop / SellStop`。

### 2.3 下單最佳實踐（專家級必記）

1. **永遠檢查回傳結果**：`PositionOpen` 等回傳成功 ≠ 真的成交。要查 `trade.ResultRetcode()`、`trade.ResultDeal()`、`trade.ResultRetcodeDescription()`。
2. **價格方向正確**：買進時 TP 高於、SL 低於開倉價；賣出相反。SL/TP 不得違反 broker 的最小停損距離（`SYMBOL_TRADE_STOPS_LEVEL`）。
3. **先確認商品可交易**：`SymbolInfoInteger(_Symbol, SYMBOL_TRADE_MODE)` 要是 `SYMBOL_TRADE_MODE_FULL`，避免對停牌/不可交易商品下單。
4. **手數正規化**：依 `SYMBOL_VOLUME_MIN / MAX / STEP` 校正，否則會被拒單。
5. **價格與停損正規化**：用 `NormalizeDouble(price, _Digits)`，留意 `_Point` 與「pip」在 5 位報價時差 10 倍。
6. **控制下單頻率與延遲**：每次呼叫都有 20–200ms 網路延遲，OnTick 內不要狂送單，用時間間隔節流。
7. **針對暫時性錯誤做重試**：如 `TRADE_RETCODE_REQUOTE`、`TRADE_RETCODE_PRICE_OFF` 可重試；但要設上限避免無限迴圈。
8. **用 Magic Number 隔離部位**：多支 EA 共用帳戶時，務必只管理自己 Magic 的單。
9. **filling mode 要對**：依商品支援設定 `ORDER_FILLING_FOK / IOC / RETURN`，期貨/股票常需特定模式。

### 2.4 部位風險管理元件

- **依風險計算手數**：用「單筆可承受金額 ÷（停損點 × 每點價值）」回推手數，每點價值由 `SYMBOL_TRADE_TICK_VALUE` 與 tick size 推得。
- **移動停損 / 保本（trailing / break-even）**：在 OnTick 或新 K 棒時更新 SL。
- **部分平倉**：`PositionClosePartial` 達到第一目標先減倉、剩餘移到保本（這正是 Example 中「盈利部分平倉」的概念）。
- **每日虧損上限 / 回撤鎖**：當日已實現虧損達上限就停止開新倉（funded／prop 帳戶尤其重要）。

---

## 3. Strategy Tester：回測、優化、前進測試

MT5 內建 Strategy Tester 是 EA 開發的核心工具，提供回測（backtest）、優化（optimization）、前進測試（forward test）。

### 3.1 四種建模模式（modeling mode，速度 vs 準確度）

| 模式 | 準確度 | 速度 | 說明 |
| --- | --- | --- | --- |
| **Every tick based on real ticks** | 最高 | 最慢 | 用 broker 實際累積的真實 tick，不做模擬。最貼近實盤，但約比合成慢 10 倍 |
| **Every tick** | 高 | 慢 | 用 M1 OHLC **插值合成**每個 tick（非真實 tick） |
| **1 minute OHLC** | 中 | 快 | 每根 M1 只模擬 開/高/低/收 四個價，快速估算 |
| **Open prices only** | 低 | 最快 | 只用每根 K 棒的開盤價；只適合「只在開盤判斷」的策略 |

實務建議：開發初期用 `1 minute OHLC` 快速篩選；對 tick 敏感（剝頭皮、掛單觸發）的策略，最終一定要用 `Every tick based on real ticks` 驗證。

### 3.2 影響回測真實度的關鍵設定

- **歷史資料品質**：垃圾進、垃圾出。資料缺口、品質差會嚴重誤導結果。用 real ticks 並確認資料下載完整。
- **點差（spread）**：用「current」可能失真，建議測固定/實際點差，並考慮放大壓力測試。
- **滑點與手續費**：內建回測對滑點模擬有限；佣金要在 broker 設定或自行估算。期貨/ECN 帳戶尤其要含佣金。
- **建模品質百分比**（MT4 概念，MT5 改看 ticks 來源）：real ticks ≈ 真實；合成 tick 要保守看待。
- **報價時區 / 夏令時間**：跨市場（如美股期貨）要注意交易時段與 DST。

### 3.3 優化（Optimization）

- 在輸入參數設 **Start / Step / Stop**，測試器跑多組組合（passes）。
- 演算法：
  - **Slow complete algorithm**：窮舉所有組合，最完整但慢。
  - **Fast genetic based algorithm（遺傳演算法）**：跳過大量組合、快速逼近較佳解，適合參數多時。
- **優化目標（criterion）**：Balance、Profit Factor、Expected Payoff、Sharpe、自訂（`OnTester()` 回傳自訂分數）等。
- **Forward 區段**：可在優化時設定 forward 比例（1/2、1/3、1/4），前段優化、後段自動驗證。

### 3.4 重要績效指標

| 指標 | 意義 | 看法 |
| --- | --- | --- |
| Net Profit | 淨利 | 基本，但別只看這個 |
| Profit Factor | 毛利 ÷ 毛損 | > 1.3 較可接受，過高（>3）小心過擬合 |
| Expected Payoff | 每筆期望值 | 要 > 0 且涵蓋成本 |
| Max Drawdown | 最大回撤 | 決定可承受性與資金需求 |
| Recovery Factor | 淨利 ÷ 最大回撤 | 越高越好 |
| Sharpe Ratio | 風險調整後報酬 | 穩定度參考 |
| Trades 數 | 樣本數 | 太少（<100）統計不可信 |

---

## 4. 過擬合（Overfitting）與穩健性

過擬合是 EA 開發**最大的陷阱**：在歷史資料上完美，實盤就崩。

### 4.1 核心防治原則

1. **樣本內 / 樣本外切分**：約 70% 資料做優化（in-sample）、30% 做驗證（out-of-sample）。常見標準：**樣本外績效應 > 樣本內的 80%**。
2. **前進分析（Walk-Forward Analysis）**：把歷史切成多段，逐段「優化→往前測試」，檢驗策略是否能適應不同市況。例：4 個月回測 + 最後 1 個月做 forward。
3. **少參數**：參數越多越容易硬擬合。超過 3 個參數時建議遞迴/分階段優化。
4. **看優化曲面**：理想是「參數小幅變動，績效平滑變化」。若優化圖崎嶇（小改參數績效暴跳），代表脆弱/過擬合。
5. **對異常好的結果保持懷疑**：超高報酬＋極小回撤，往往是 look-ahead bias、資料品質差或過度優化。
6. **多商品 / 多時段驗證**：策略若只在單一商品單一期間有效，泛化能力差。

### 4.2 常見偏誤（bias）

- **Look-ahead bias（未來函數）**：用到當下還不該知道的資料（如用未收盤 K 棒、`iClose(0)` 當已定值）。
- **Survivorship bias**：只測現存商品。
- **Optimization / data-snooping bias**：不斷調參到「剛好」貼合歷史。
- **Spread/slippage 低估**：回測沒含實際成本。

### 4.3 驗證工作流（黃金順序）

```
回測 sanity check（合理性） → 前進/樣本外測試 → Demo 實盤 → 小額實盤 → 放大
```

口訣：**回測是過濾器，不是證明**。真正的殺手（點差、滑點、執行、心理）只會在前進與實盤現形。

---

## 5. 實盤部署與營運

- **AutoTrading 必須開啟**（工具列「Algo Trading」按鈕）；EA 圖示要顯示笑臉而非禁止符號。
- **WebRequest / DLL** 需在設定中允許特定網址 / 勾選 DLL（自負風險）。
- **VPS / 24h 運行**：實盤 EA 建議掛在 VPS（MetaQuotes 也有 Virtual Hosting），避免本機斷線。
- **重啟存活**：終端機重啟、斷線重連後，EA 要能讀回既有部位（用 Magic 過濾）繼續管理，不能重複開倉。
- **錯誤處理與日誌**：用 `Print` / `Comment` 記錄關鍵決策與錯誤碼，方便事後檢討。
- **多 EA 共存**：每支獨立 Magic、注意保證金與相關性風險。
- **新聞 / 低流動性時段**：可加時間過濾與點差過濾，避開高滑點時段。

---

## 6. 從零到上線：EA 開發路線圖

1. 把策略寫成**明確、可程式化的規則**（進場、出場、停損停利、加減碼、過濾條件）。
2. 用 MetaEditor 寫成 MQL5，先求**正確**（先單一商品、單一時框）。
3. 用 `1 minute OHLC` 快速回測，抓邏輯錯誤。
4. 用 `Every tick based on real ticks` 精測，含實際點差/佣金。
5. 優化（遺傳演算法）+ 設 forward 區段，做**樣本內/外**與**前進分析**。
6. 多商品/多期間穩健性檢查，砍掉脆弱參數。
7. **Demo 帳戶**前進測試數週，比對回測與實盤落差。
8. 小額實盤 → 確認執行/滑點/心理 → 逐步放大。
9. 持續監控、記錄、定期重新驗證（市況會變）。

---

## 7. 常見錯誤清單（踩雷預防）

- 用 `_Point` 當 pip（5 位報價差 10 倍），SL/TP 算錯。
- 沒檢查 `ResultRetcode`，以為下單成功其實被拒。
- OnTick 每 tick 都重算/下單，造成過度交易與效能問題。
- 沒做手數/價格正規化，被 broker 拒單。
- 用未收盤 K 棒做訊號（look-ahead bias）。
- 只在「current spread」回測，低估成本。
- 過度優化參數，曲線完美但實盤失效。
- 終端機重啟後 EA 重複開倉（沒讀回既有部位）。
- 不同 EA 互相干擾（沒用 Magic 隔離）。
- 對沖/淨額模式搞混，平倉邏輯錯誤。

---

## 8. 參考來源

- [OnTick 事件 — MQL5 文件](https://www.mql5.com/en/docs/event_handlers/ontick)
- [事件處理函式 — MQL5 Reference](https://www.mql5.com/en/docs/basis/function/events)
- [OnTimer — MQL5 文件](https://www.mql5.com/en/docs/event_handlers/ontimer)
- [OnTrade — MQL5 文件](https://www.mql5.com/en/docs/event_handlers/ontrade)
- [EA 基本結構：OnInit/OnTick/OnDeinit（教學）](https://finance.trgy.co.jp/en/mql5-en/reference-en/mql5-ea-basic-structure/)
- [CTrade.PositionOpen — MQL5 Reference](https://www.mql5.com/en/docs/standardlibrary/tradeclasses/ctrade/ctradepositionopen)
- [CTrade 類別 — MQL5 Reference](https://www.mql5.com/en/docs/standardlibrary/tradeclasses/ctrade)
- [MQL5 交易操作教學](https://www.mql5.com/en/articles/481)
- [Real and Generated Ticks — MT5 Help](https://www.metatrader5.com/en/terminal/help/algotrading/tick_generation)
- [Strategy Testing — MT5 Help](https://www.metatrader5.com/en/terminal/help/algotrading/testing)
- [Strategy Optimization — MT5 Help](https://www.metatrader5.com/en/terminal/help/algotrading/strategy_optimization)
- [用真實 tick 測試策略 — MQL5 Articles](https://www.mql5.com/en/articles/2612)
- [避免過擬合 / 優化穩健性 — MQL5 論壇](https://www.mql5.com/en/forum/459197)
- [Backtest vs Forward Test 驗證工作流](https://www.mql5.com/en/blogs/post/767107)

> 免責：本文件為技術與教育用途整理，非投資建議。自動交易具高風險，任何實盤決策與後果由使用者自負。
