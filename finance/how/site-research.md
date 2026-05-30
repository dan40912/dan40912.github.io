# 好好證券基金平台 UX Demo 改版專案｜Site Research

研究日期：2026-05-29  
研究範圍：本地專案資料夾、FundSwap 公開頁面、「找基金」「基金照妖鏡」「基金搜尋」「基金怎麼選」相關內容  
目前狀態：只完成分析與檔案結構理解，尚未修改程式。

---

## 0. Executive Summary

本專案目前有兩條 prototype 線：

1. `output/index.html`：FundSwap「找基金 / 基金照妖鏡」UX demo，沿用 FundSwap header、主題色、基金卡與互動式人格入口。
2. `output/arena.html`：Arena 概念 demo，已改回 FundSwap 原白底、灰階、橘色主題，但內容方向偏「基金內容平台 / 投資世界觀」。

這一輪不應先改程式。下一步若要製作 Demo，應先確認要延續哪條線：

- 如果題目是「好好證券現有找基金與基金照妖鏡改版」，應以 `output/index.html + output/style.css + output/app.js` 為主。
- 如果題目是「Arena 基金內容平台概念」，才以 `output/arena.html + output/arena.css + output/arena.js` 為主。

目前最重要的產品判斷：

> FundSwap 的基金頁不是缺資料，而是缺少把資料轉成投資決策的路徑。

---

## 1. 本地專案資料夾掃描

### 1.1 根目錄

目前根目錄只有 `output/` 與本研究檔：

```text
.
├── output/
└── site-research.md
```

### 1.2 主要 HTML / CSS / JS

```text
output/
├── index.html
├── style.css
├── app.js
├── arena.html
├── arena.css
├── arena.js
└── components/
    ├── FundCard.js
    ├── RiskLevel.js
    ├── ReturnChart.js
    ├── FAQ.js
    └── CTA.js
```

### 1.3 現有文件

```text
output/
├── README.md
├── CRO_REPORT.md
├── FundSwap_interview_deliverable.md
├── FundSwap_interview_PPT_outline.md
├── FundSwap_portfolio_final.md
└── Arena_IMPLEMENTATION.md
```

### 1.4 Demo 線路判斷

#### FundSwap demo

主入口：

- `output/index.html`
- `output/style.css`
- `output/app.js`
- `output/components/*`

用途：

- 基金照妖鏡 / 找基金改版 demo
- 保留 FundSwap 原 header、footer、主色、白底卡片
- 有投資人格、策略說明、散點圖、基金卡展開、FAQ、CTA

#### Arena demo

主入口：

- `output/arena.html`
- `output/arena.css`
- `output/arena.js`

用途：

- 基金內容平台概念 demo
- 已修正為 FundSwap 白底灰階橘色主題
- 模組包含投資世界觀、基金團隊影片、Journal、風險透明、觀察書架

---

## 2. 目前可保留的本地實作

### 2.1 `output/index.html`

可保留：

- FundSwap header 導覽已重新抓取現站 navbar 邏輯，包含 dropdown。
- 找基金 / 基金照妖鏡主題已清楚。
- 投資人格入口已存在。
- 全寬策略說明區已存在。
- 基金散點圖、推薦清單、基金列表、展開 panel 已存在。
- Footer 保留 FundSwap 金融信任感。

需注意：

- 目前文案偏 demo，若要交面試作品集，要把「搞笑註解」收斂成「輕鬆但專業」。
- 基金資料為靜態 mock，若要更接近現站，需要標註 demo data。
- 現有人格分類已從五類入口收斂成保守 / 積極 / 長期，但部分 README 舊敘述仍提五大入口，文件需同步。

### 2.2 `output/style.css`

可保留：

- FundSwap 主色：`#ff9664`、`#ff7e40`、`#fff3ee`
- 灰階：`#262626`、`#333`、`#666`、`#999`、`#ebebeb`、`#f5f5f5`
- 白底卡片、細灰線、4-8px radius
- Header responsive 邏輯
- Dropdown 樣式

需注意：

- 不應再導入大面積黑底或陌生品牌色。
- 若新增元件，應延續白底、灰線、橘色 CTA、青綠 tag。

### 2.3 `output/app.js`

可保留：

- 靜態基金資料
- 投資人格狀態
- 分類切換
- quiz
- 基金排序
- 基金卡展開
- side panel
- header dropdown interaction

需注意：

- 靜態資料與現站真實 API 無連動。
- `cp` 是 demo 欄位，需在畫面上清楚解釋為「報酬 / 波動」概念，不宜讓使用者以為是官方投資建議。

### 2.4 `output/components/*`

可保留：

- `FundCard.js`：基金展開卡主要產生器。
- `RiskLevel.js`：風險視覺化。
- `ReturnChart.js`：收益圖表。
- `FAQ.js`：基金 FAQ。
- `CTA.js`：CTA 元件。

後續若做 demo，應優先修改元件而不是在 `app.js` 拼大段 HTML。

---

## 3. FundSwap 公開頁面整理

以下內容來自 FundSwap 公開網站與先前抓取的 navbar 元件。因 FundSwap 交易頁為 SPA，部分內容需由前端載入；公開教學文章與 FAQ 可直接整理。

### 3.1 找基金 / 基金照妖鏡頁

研究 URL：

- https://www.fundswap.com.tw/trade/funds/?fundsIndex=2&filterType=rateOfReturn&tradable=true&s=-rateOfReturn3Months&page=1

觀察：

- 頁面是 FundSwap 交易平台內的基金搜尋 / 基金照妖鏡入口。
- Query string 顯示目前狀態：
  - `fundsIndex=2`：基金照妖鏡 tab / mode
  - `filterType=rateOfReturn`：依報酬率篩選
  - `tradable=true`：開放交易
  - `s=-rateOfReturn3Months`：近 3 月報酬率排序
  - `page=1`
- 使用者進入此頁時，預設已被導向「報酬率 + 可交易 + 三個月報酬排序」的視角。

UX implication：

- 現站實際入口偏「資料篩選與排序」。
- 對進階使用者有用，但新手可能不知道為什麼先看近 3 月報酬。
- Demo 應補上「為什麼看這個指標」與「不同人格該看哪些指標」。

### 3.2 基金怎麼選教學文章

研究 URL：

- https://www.fundswap.com.tw/posts-index/fund-knowledge/teaching20250211/

公開頁重點整理：

- 文章主題是「基金怎麼選」。
- 官方教學將基金篩選分成幾個步驟：
  - Step 1：用「找基金」做基金篩選。
  - Step 2：使用「基金照妖鏡」用視覺化方式找 CP 值高的基金。
  - Step 3：透過「自訂表格」比較基金。
- 文章說明基金照妖鏡會用近一年報酬率與波動度做四象限視覺化。
- 官方對 CP 值的說明為「報酬率 / 波動度」。
- 文章也提到 Morningstar 資訊與基金比較表相關概念。

UX implication：

- 官方已經把基金照妖鏡定位為「用報酬與波動快速找值得研究的基金」。
- Demo 不應推翻散點圖，而應在散點圖前增加「使用者視角」。
- CP 值不能只顯示數字，應補一層解釋：「同樣波動下，過去報酬較高」。

### 3.3 開戶 / FAQ / 自主理財定位

研究 URL：

- https://www.fundswap.com.tw/faqs/%e9%9c%80%e5%8d%94%e5%8a%a9%ef%bc%8c%e5%a6%82%e4%bd%95%e6%89%be%e5%88%b0%e5%a5%bd%e5%a5%bd%e5%ae%a2%e6%9c%8d%ef%bc%9f/
- https://www.fundswap.com.tw/faqs/
- https://www.fundswap.com.tw/faqs/%e2%80%bb%e9%96%8b%e6%88%b6%e6%95%99%e5%ad%b8-%e7%b6%b2%e8%b7%af%e9%8a%80%e8%a1%8c%e6%99%b6%e7%89%87%e9%87%91%e8%9e%8d%e5%8d%a1/

公開資訊重點：

- FundSwap 有完整 FAQ 與開戶教學內容。
- 官方 FAQ 導向客服、開戶、申購、贖回、扣款、基金交換、外幣功能等。
- 先前合規研究中整理到，FundSwap 明確具有自主理財平台語境，不應在 demo 中設計成個別投資建議或喊單平台。

UX implication：

- Demo CTA 應優先用「比較」「看懂」「加入觀察」「查看風險」。
- 不應使用「推薦你買」「立即買進」「跟著經理人買」。

### 3.4 現站 navbar 結構

來源：

- `https://www.fundswap.com.tw/fs-static/lib/TheNavbar/TheNavbar.umd.js`

已整理的主要導覽：

#### 找基金

- 基金搜尋：`/trade/funds/`
- 快速交換基金：`/trade/funds/?fundsIndex=1&exchangeInTradable=true`
- 配息基金
- TISA 基金(退休)
- 基金照妖鏡：`/trade/funds/?fundsIndex=2&filterType=rateOfReturn&tradable=true&s=-rateOfReturn3Months&page=1`
- ETF 專區
- 買好股
- 選好債
- 基金品牌
- 國人持有
- 獲獎基金
- 全球布局
- 產業動態

#### 優惠

- 最新活動
- TISA 專案(退休)
- 電支雞享 10% 回饋
- 一「定」免費

#### 教學 / FAQ

- 懶人包
- 5 分鐘線上開戶
- 綁定台幣扣款
- 手機桌面 APP 圖示
- 電支雞懶人包
- 常見問題
- 單筆申購、贖回
- 定期定額投資
- 基金交換特色
- 牌告收費標準

#### 投資分析

- 知識庫
- 服務介紹
- 投信觀點
- 基金知識
- 退休理財

#### 客服

- 認識好好
- 公告訊息
- 聯絡客服

UX implication：

- Demo header 應沿用現站導覽，不應自行發明完全不同 IA。
- 對於 Demo 作品集，可保留現站 navbar，將創新集中在頁面內容區。

---

## 4. Multi-Agent 分析

### 4.1 UX Research Agent

基金投資者在找基金時的核心需求，不是單純「最高報酬」，而是「適不適合我」。

主要需求：

1. 風險：能否承受波動、最大回撤、基金類型風險、匯率與區域風險。
2. 收益：短期動能、長期報酬、同類排名，但需避免單看近期績效。
3. 費用：申購手續費、經理費、保管費、交易成本。
4. 配息：配息頻率、配息來源、配息是否來自本金。
5. 投資區域：台股、全球、亞洲、中國、美國等。
6. 基金類型：股票型、債券型、平衡型、科技、配息、TISA。
7. 交易便利：是否開放交易、是否可快速交換、是否支援定期定額。

使用者心理：

- 新手怕選錯，需要低壓入口。
- 半熟手想比較，但不一定知道指標優先順序。
- 進階使用者需要完整欄位、篩選與可比較資料。

Demo implication：

- 首屏不要只展示大量基金。
- 先讓使用者選「保守 / 積極 / 長期」視角。
- 每一檔基金展開後要回答：
  - 為什麼入選？
  - 可能賺什麼？
  - 最大風險在哪？
  - 適合誰？
  - 下一步該看什麼？

### 4.2 UI Audit Agent

#### 找基金頁優點

- 資訊完整。
- 交易平台感明確。
- 篩選與排序對進階使用者有用。
- Header / Footer 有品牌一致性。
- 基金照妖鏡是差異化功能。

#### 找基金頁問題

- 資訊密度高，像資料庫。
- 使用者第一眼不知道該看什麼。
- 報酬、配息、標籤、交易狀態層級接近，沒有先後順序。
- CTA 容易過早出現，尚未建立理解就要求交易。
- Mobile 對新手壓力更高。

#### 基金照妖鏡優點

- 用視覺化方式呈現報酬與波動，方向正確。
- CP 值是有記憶點的概念。
- 散點圖比純表格更容易展示相對位置。

#### 基金照妖鏡問題

- CP 值概念需要翻譯。
- 使用者看到點之後，不知道哪個點適合自己。
- 散點圖缺少人格視角：保守型、積極型、長期型不應看同一套重點。
- 圖表與 CTA 之間缺少「決策卡」承接。

### 4.3 Finance Product Agent

#### 欄位語意

合理欄位：

- 報酬率：需要區分 3M / 6M / 1Y / 2Y / 成立以來。
- 波動度：應解釋為「持有期間可能看到的起伏」。
- MDD：可解釋為「過去最慘曾跌多少」。
- CP 值：可解釋為「報酬率 / 波動度」，但不能等同於適合申購。
- 風險等級：應用 1-5 視覺化，但不可暗示低風險等於不會虧。
- TISA：可作為長期與退休配置篩選，但需避免「退休必買」。
- 配息：不可只看配息率，需補配息來源與淨值變化。

#### 需避免

- 將 CP 值解讀成投資建議。
- 用短期報酬做唯一排序。
- 用「最適合你」描述基金。
- 用「低風險高報酬」文案。
- 把人格分類直接變成個別化基金推薦。

#### 建議金融語意

- `符合條件` 取代 `推薦`
- `候選基金` 取代 `最適合`
- `值得進一步研究` 取代 `可以買`
- `波動較低` 取代 `安全`
- `過去資料` 取代 `未來機會保證`

### 4.4 Frontend Agent

目前專案是純靜態 demo，沒有 build tool、沒有 package manager。

#### FundSwap demo 技術結構

- `index.html`：主頁 HTML。
- `style.css`：全站樣式，含 header、dropdown、hero、卡片、散點圖、基金列表、footer。
- `app.js`：ES module，import `components/FundCard.js`。
- `components/*`：基金卡、風險、圖表、FAQ、CTA。

適合延續：

- 不需新增框架。
- 不需安裝套件。
- 若製作下一版 demo，直接改靜態檔即可。

#### Arena demo 技術結構

- `arena.html`
- `arena.css`
- `arena.js`

適合延續：

- 若任務方向轉向 Arena，可以繼續用這三個檔。
- 但必須遵守 FundSwap 原 CSS 與主題顏色。

#### 不應先做

- 不應重構整個專案。
- 不應導入 React / Vue。
- 不應改 `index.html` 前先確認 Demo 目標。

### 4.5 Demo Agent

若後續要產出可展示 Demo，建議路線：

#### Demo 路線 A：FundSwap「基金照妖鏡」改版

入口：`output/index.html`

保留：

- 現站 header / footer
- FundSwap 主色與卡片語言
- 找基金排序與篩選
- 基金照妖鏡散點圖

新增 / 強化：

- 投資人格作為第一層
- 指標解釋作為第二層
- 散點圖按人格高亮
- 基金決策卡
- 更安全的 CTA 分層

#### Demo 路線 B：Arena 概念頁

入口：`output/arena.html`

保留：

- FundSwap 白底、橘色、灰階
- 投資世界觀
- Journal
- 風險透明
- 觀察書架

需注意：

- Arena 是概念平台，不是現有 FundSwap 頁面。
- 若交付題目是 FundSwap 改版，Arena 只能作為創新延伸，不應成為主 Demo。

---

## 5. 下一步建議

### 5.1 先問清楚 Demo 目標

後續改程式前應確認：

1. 要改的是現有 FundSwap「基金照妖鏡」頁？
2. 還是要做 Arena 新平台概念？
3. 是否要維持 FundSwap header / footer？
4. 是否允許使用 Arena brand name？

若沒有額外指示，應預設：

> 以 `output/index.html` 作為主 demo，Arena 只作為概念備案。

### 5.2 Demo Acceptance Criteria

下一版 Demo 應符合：

- 保留 FundSwap 主題色與 header 體驗。
- 不使用黑底大改版。
- 3 秒內讓使用者知道可以先選保守 / 積極 / 長期。
- 切換人格後，說明指標依據。
- 散點圖與基金卡能對應人格。
- 基金卡展開後能回答收益、風險、適合 / 不適合、下一步。
- CTA 不使用高風險招攬語。
- Mobile 不水平溢出。

### 5.3 暫不修改程式

本輪只完成：

- 專案資料夾掃描
- 主要 HTML / CSS / JS 檔案定位
- FundSwap 公開頁整理
- 多 Agent 初步診斷
- `site-research.md` 輸出

