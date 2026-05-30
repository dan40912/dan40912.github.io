# 好好證券 FundSwap UX Demo 作品集

## 1. 專案目的

這份 Demo 是針對好好證券 FundSwap「找基金」與「基金照妖鏡」的面試作品集。

核心觀點：

> FundSwap 的問題不是基金資料不夠，而是使用者缺少把資料轉成投資決策的路徑。

因此本專案沒有重新設計品牌，也沒有更換主色或 Logo。Demo 保留 FundSwap 原本的白底、灰階資訊層、橘色 CTA 與金融平台感，重點放在：

- 讓新手知道自己該先看什麼。
- 把報酬、波動、CP 值、風險等級翻成可理解的決策語言。
- 讓使用者能從搜尋、篩選、比較、理解風險走到下一步。
- 避免把基金內容寫成投資推薦，改用「篩選輔助」「適合觀察」「情境比較」。

免責聲明：本 Demo 僅為基金篩選體驗設計展示，非投資建議。所有基金資料皆為 mock data，不構成基金推薦或任何申購、贖回、轉換之招攬。

## 2. 如何開啟 Demo

可以直接用瀏覽器開啟：

```text
demo/index.html
```

若要用本機伺服器開啟，請在專案根目錄執行：

```bash
python3 -m http.server 8000
```

然後打開：

```text
http://127.0.0.1:8000/demo/index.html
```

本專案不依賴外部前端框架；互動以純 HTML / CSS / JavaScript 實作。

## 3. Demo 頁面清單

| 頁面 | 檔案 | 用途 |
| --- | --- | --- |
| 作品集首頁 | `demo/index.html` | 串起任務背景、核心觀點、展示順序與所有 Demo 入口 |
| 精美簡報 | `demo/FundSwap_UX_Portfolio_Presentation.pptx` | 10 頁面試展示簡報，對應 Demo 網站與設計邏輯 |
| 頁面優劣分析 | `demo/01-audit-report.html` | 分析「找基金」與「基金照妖鏡」的優點、缺點與改善機會 |
| 新版基金照妖鏡 | `demo/03-new-fund-mirror.html` | 先選投資需求，再看報酬率 × 波動度四象限 |
| 新版找基金列表頁 | `demo/04-new-find-funds.html` | 搜尋、快速標籤、進階篩選、排序、卡片 / 列表切換與最多 3 檔比較 |
| 基金適配問答精靈 | `demo/05-fund-fit-wizard.html` | 5 步驟問答，把新手需求轉成基金篩選條件 |
| Fund Arena 基金比較場 | `demo/06-fund-arena.html` | 2-3 檔基金比較，含雷達圖、分數條、差異標籤與情境適配 |
| 作業要求對照檢查 | `demo/07-requirement-mapping.html` | 逐條確認三大任務、專業性、獨立性與完整性 |
| 文字版檢查表 | `demo/requirement-checklist.md` | 作業要求對照與審查結論 |

## 4. 我的設計重點

### 4.1 從資料列表改成決策流程

原本「找基金」的強項是資料完整，但新手看到大量基金名稱、報酬率、配息與排序時，很容易陷入比較焦慮。新版列表頁把搜尋、快速 chips、進階篩選、排序與比較放在同一個工作台，並替每檔基金補上：

- 為什麼適合你
- 主要風險
- 加入比較

### 4.2 保留基金照妖鏡，但調整第一步

我會保留散點圖，因為報酬率 × 波動度的視覺化方向是對的；但不會讓散點圖成為新手的第一步。

新版流程：

1. 先選投資需求：新手入門、穩健退休、積極成長、現金流配息。
2. 系統切換判斷依據：例如低波動、CP 值、配息節奏、風險等級。
3. 再進入四象限圖，讓使用者知道「以我的需求，哪些點值得看」。
4. 用基金詳情卡與比較表承接下一步。

### 4.3 用問答降低新手焦慮

基金適配問答精靈用 5 個問題處理新手常見困惑：

- 投資目標
- 可接受波動
- 投資期間
- 偏好基金類型
- 是否重視配息

結果頁顯示使用者風格、適合觀察的基金類型、3-5 檔 mock 候選基金、適配原因與風險提醒。語氣保持教育與篩選輔助，不做投資推薦。

### 4.4 讓資深用戶有深度比較工具

Fund Arena 不是要宣稱哪檔基金最好，而是讓使用者比較「適合情境」：

- 誰比較適合穩健型
- 誰比較適合成長型
- 誰比較適合配息型

比較維度包含報酬、波動、CP 值、費用、配息、風險等級與投資區域，並用雷達圖、分數條、差異標籤與完整表格呈現。

## 5. 如何對應好好證券題目要求

### 任務 1：「找基金」與「基金照妖鏡」頁面優劣分析

對應頁面：

- `demo/01-audit-report.html`
- `demo/04-new-find-funds.html`
- `demo/03-new-fund-mirror.html`

已涵蓋：

- UI 設計邏輯
- 資訊呈現效率
- 使用者操作路徑
- 視覺化表達
- 金融決策輔助性

### 任務 2：「基金照妖鏡」0 到 1 複盤與優化

對應頁面：

- `demo/03-new-fund-mirror.html`
- `demo/07-requirement-mapping.html`

核心判斷：

- 會保留散點圖。
- 不讓散點圖當第一步。
- 第一層先問使用者是哪種投資需求。
- 第二層再切換判斷依據。
- 第三層才進入基金比較與 CTA。

### 任務 3：基金篩選功能創新方案

對應頁面：

- `demo/05-fund-fit-wizard.html`
- `demo/06-fund-arena.html`

創新功能：

- 基金適配問答精靈：服務新手與半熟手，降低選擇焦慮。
- Fund Arena 基金比較場：服務資深投資者，提供深度比較與情境判斷。

### 專業性、獨立性、完整性

對應頁面：

- `demo/07-requirement-mapping.html`
- `demo/requirement-checklist.md`

檢查結果：

- 專業性：已連結基金投資者的風險、收益、配息、費用、波動與決策需求。
- 獨立性：保留品牌，但重新設計決策流程，不是照抄現有網站。
- 完整性：包含首頁、分析報告、核心改版 Demo、創新功能 Demo 與逐條要求檢查。

## 建議展示順序

5-8 分鐘內可依以下順序展示：

1. `demo/index.html`：用 30 秒說明核心觀點。
2. `demo/01-audit-report.html`：用 1 分鐘說明現況問題。
3. `demo/03-new-fund-mirror.html`：用 2 分鐘展示核心改版。
4. `demo/04-new-find-funds.html`：用 1-1.5 分鐘展示找基金列表效率。
5. `demo/05-fund-fit-wizard.html`：用 1 分鐘展示新手入口。
6. `demo/06-fund-arena.html`：用 1 分鐘展示資深比較工具。
7. `demo/07-requirement-mapping.html`：最後 30 秒證明題目要求已逐條回應。

## PPT 與網站對照

| PPT 頁碼 | 核心內容 | 對應網站 |
| --- | --- | --- |
| 01 | 封面與核心觀點 | `demo/index.html` |
| 02 | Outline 與展示節奏 | `demo/index.html` |
| 03 | 題目任務拆解 | `demo/07-requirement-mapping.html` |
| 04 | 現況診斷 | `demo/01-audit-report.html` |
| 05 | 多 Agent 設計邏輯 | `demo/index.html`、`demo/07-requirement-mapping.html` |
| 06 | 新版基金照妖鏡 Flow | `demo/03-new-fund-mirror.html` |
| 07 | 新版找基金列表頁 | `demo/04-new-find-funds.html` |
| 08 | 問答精靈與 Fund Arena | `demo/05-fund-fit-wizard.html`、`demo/06-fund-arena.html` |
| 09 | 合規語氣與商業價值 | 全站 footer 與各互動頁文案 |
| 10 | 最終交付與 Demo 路徑 | `demo/index.html` |
