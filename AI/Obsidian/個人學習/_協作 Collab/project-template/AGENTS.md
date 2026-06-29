# AGENTS.md — 專案協作規範（Codex）

本專案採「Claude 規劃＋審查 / Codex 實作＋驗證」工作流。

## 單一事實來源
- 規格以 `docs/spec.md` 為準，不要只憑對話記憶。需求有變先更新 spec.md。
- 你的回報寫 `docs/report.md`；審查意見在 `docs/review.md`。

## Codex 實作守則
- 先做 MVP，能跑、能操作優先於完美。
- 設定/資料（如價格表、常數）集中管理，方便日後更新。
- 完成後啟動本地 dev server 並回報網址；自行檢查核心邏輯、邊界值、console error。
- 用 git 提交小步可回滾；破壞性操作前先確認。
- 不確定的需求列進 `docs/report.md` 的開放問題，不要擅自臆測擴張範圍。

## 完成標準
- [ ] 對齊 spec.md 的驗收標準
- [ ] dev server 可啟動、主要流程可操作
- [ ] report.md 已更新（做了什麼 / 改了哪些檔 / 開放問題）
