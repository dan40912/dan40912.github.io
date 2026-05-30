# Arena Prototype Implementation Notes

## 交付檔案

- `arena.html`：Arena 靜態頁面
- `arena.css`：深色 documentary visual system
- `arena.js`：投資人格、基金決策卡、觀察書架、影片章節互動

## 已整合的 Prompt 方向

### Compliance Risk

- 全站 CTA 避免「立即買進」「跟著買」「推薦申購」。
- 投資人格定位為內容視角，不是投資適合度判斷。
- 基金卡與 drawer 內容明確標註不構成投資建議。
- Footer 放置教育與資訊用途 disclaimer。

### Documentary Creative

- Hero 使用 documentary still 風格。
- 影片 Banner 使用 Inside the Fund 章節結構。
- 內容強調團隊討論、風險控管、持股邏輯、錯誤反思。
- 基金經理人與團隊不被塑造成喊單明星。

### Growth / Community

- 設計「觀察書架」，不是投資組合。
- 使用者可追蹤世界觀、團隊、Journal。
- Feed 用 Market Note、Risk Poll、Journal Drop，避免喊單。
- Growth loop 圍繞追蹤內容、追蹤世界觀、回訪 Journal。

### UI / Visual Design

- 深色模式為主，使用 graphite / panel / amber accent。
- 卡片層次包含 worldview card、fund episode card、journal、risk card。
- 風險透明區前置呈現，不藏在頁尾。
- 動態採用慢速 hover、drawer、persona 切換，不使用賭博感動畫。

## 產品原則

Arena 不是讓基金看起來更會賺，而是讓基金看起來更值得被理解。

核心行為不是「交易」，而是：

1. 選擇投資視角
2. 追蹤基金團隊與世界觀
3. 閱讀 Journal
4. 理解持股邏輯
5. 看清風險來源
6. 加入觀察或比較

