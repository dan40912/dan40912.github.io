# CLAUDE.md — AI 學習知識庫

這是一個 AI 學習型 Obsidian vault，也是**我（Claude）回答時應優先參考的知識來源**。
把它當作使用者的長期記憶；我是讀取它、據以推理的引擎（即 RAG 的概念）。

Codex 的專案級規範見 `AGENTS.md`。Claude 回答時也應遵守同一個核心原則：先讀 vault、再回答、發現缺口就建議補筆記。

## 這個 vault 的結構
- `00_首頁 Home/` — 首頁 + Bases 儀表板
- `01_核心概念 Concepts/` — 9 篇中英雙語 evergreen 概念（AI、LLM、Prompt、Tool Use、Agent、MCP、Skill、RAG、Context）
- `02_關係地圖 Maps/` — `🗺️ AI 全景地圖`（概念怎麼串接 + 組裝配方）
- `03_應用與工作流 Applications/` — 工作流範式、應用案例
- `03_應用與工作流 Applications/專案規劃-Codex 個人學習知識庫.md` — 本 vault 的改進路線與品質指標
- `03_應用與工作流 Applications/多 AI 協作與多 Agent 工作流.md` — Codex、Claude、多 Agent 分工與審查流程
- `04_每日快訊 Daily/` — 自動抓取的每日 AI 新聞（`YYYY-MM-DD.md`）
- `05_每週精選 Weekly/` — 每週深度 digest
- `06_收件匣 Inbox/` — 臨時擷取
- `99_範本 Templates/` — 筆記範本
- `_自動化 Automation/` — 策展 prompt + 排程腳本（見其 README）

## 回答時的行為準則（重要）
1. **先查 vault 再回答**：使用者問 AI / Agent / MCP / Skill / RAG / Prompt / LLM 等主題時，先用 Grep/Glob/Read 看 `01_核心概念` 對應筆記，以及最近的 `04_每日快訊`、`05_每週精選`；以 vault 內容為準。
2. **引用來源**：回答中用 `[[筆記名]]` 連回相關概念，讓使用者能跳轉。
3. **填補缺口**：若 vault 沒有或內容過時，主動提議新增/更新筆記（概念用 `_自動化 Automation/concept-builder-prompt.md` 的結構），但更新前先確認。
4. **語言**：說明用中文、專有名詞用英文（中英雙語），維持與既有筆記一致。

## 慣例 Conventions
- 概念筆記**檔名＝概念名稱**，wikilink 才連得到（例：`Agent 代理.md` ↔ `[[Agent 代理]]`）。
- frontmatter 用 `type`(concept/news/weekly/application/map)、`tags`、`status`、`level`、`updated`。
- 新筆記沿用 `99_範本 Templates/` 的對應範本。

## 注意
- 巢狀路徑：真正的 vault 根目錄是 `D:\obsidian\個人學習\個人學習\`（內層）。
- 自動策展靠本機 headless Claude（`_自動化 Automation/`），非雲端；電腦需開機。

## 與 Codex 協作（Handoff Protocol）
我（Claude）在此扮演**規劃者 + 審查者**；Codex 扮演**實作者 + 整理者**。完整說明見 [[Codex × Claude 串接與自動協作]] 與 `_協作 Collab/README.md`。

- **交接靠檔案，不靠記憶**：`_協作 Collab/task.md`(任務) → `report.md`(Codex 回報) → `review.md`(我審查)。每一輪先讀上一棒的檔，再寫自己那棒。
- **我可以驅動 Codex**：使用者說「用 codex 擴充 vault：<主題>」或「審查這次 codex 的改動」時：
  - 擴充：用 Bash 跑 `powershell -File "_協作 Collab\orchestrate-vault.ps1" -Bypass "<任務>"`（**我從非互動 shell 驅動一定要加 `-Bypass`**，否則 elevated sandbox 會卡 UAC。它會呼叫 `codex exec` 寫入 vault 並更新 `report.md`）。
  - 審查：讀 `report.md` 與實際改動，把審查寫進 `review.md`，不重寫、指出「為什麼是問題」。
- **Codex CLI 環境（已驗證）**：執行檔在 `C:\Users\dan40\AppData\Local\OpenAI\Codex\bin\codex.exe`（不在 PATH，勿用 WindowsApps 版）。`codex exec` 必加 `--skip-git-repo-check`（vault 非 git）與 `-c service_tier="fast"`。寫檔用 `--sandbox workspace-write`，唯讀分析用 `read-only`。
- **安全**：寫入型任務完成後一定由我或使用者檢查；重要決策由使用者拍板。
