# 專案工作流範本 / Project Workflow Template

把這個資料夾的內容**複製到任何新的 code 專案根目錄**，就能在該專案套用「Claude 規劃＋審查 / Codex 實作＋驗證」的工作流。

## 內容
- `AGENTS.md` — 放專案根目錄，Codex 開檔時自動讀的規範。
- `CLAUDE.md` — 放專案根目錄，Claude 自動讀的規範。
- `docs/spec.md` — 規格契約（Claude 寫）。
- `docs/report.md` — 實作回報（Codex 寫）。
- `docs/review.md` — 審查（Claude 寫）。
- `orchestrate.ps1` — 一鍵用 codex exec 依 spec 實作。

## 套用步驟（以你貼的 Token 計算器為例）
1. **建專案資料夾**，把本範本內容複製進去，`git init`（方便回滾）。
2. **Claude 規劃**：在專案開 Claude Code，貼 `prompts` 的 plan 提示 → 它把規格寫進 `docs/spec.md`。
3. **Codex 實作**：跑 `.\orchestrate.ps1` → Codex 依 `docs/spec.md` 做 MVP、啟動 dev server、寫 `docs/report.md`。
   - 或在 Claude Code 直接說「用 codex 依 docs/spec.md 實作」，由我代為呼叫。
4. **Claude 審查**：說「審查這次 codex 的改動，寫進 docs/review.md」。
5. **Codex 整合**：跑 `.\orchestrate.ps1 -Integrate` → 依 `docs/review.md` 修正。
6. 你驗收 → 把「決策紀錄」摘要存回 vault 的 `03_應用與工作流`。

## 四步提示（複製即用）

**① Claude 規劃 → spec**
```
你是規劃者。我想做：<需求>。不要寫程式，先把實作規格寫進 docs/spec.md，包含：
目標 / MVP 功能 / 頁面區塊 / 資料結構 / 計算或核心邏輯 / 使用者流程 / 驗收標準 / 後續可擴充。
技術棧：沿用現有專案；若無，用 Vite + React + TypeScript。
```
**② Codex 實作（orchestrate.ps1 已內含，或手動貼給 Codex）**
```
請讀 docs/spec.md，先做 MVP。資料(如價格)集中管理方便更新；UI 要能操作不要只做靜態頁；
完成後啟動本地 dev server 並回報網址；自行檢查核心邏輯與基本互動；把結果寫進 docs/report.md。
```
**③ Claude 審查 → review**
```
扮演產品審查者，讀 docs/report.md 與主要檔案。不要重寫程式，從 UX / 功能完整性 / 核心邏輯 /
文案清楚度 / 缺哪些 MVP 必要功能，列出具體修改建議，寫進 docs/review.md。
```
**④ Codex 整合**
```
讀 docs/review.md，判斷採納哪些並直接修改，重新測試，於 docs/report.md 列採納與未採納項目。
```
