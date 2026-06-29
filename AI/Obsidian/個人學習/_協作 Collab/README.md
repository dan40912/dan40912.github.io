---
type: application
title: Codex × Claude 協作交接區 / Collab Handoff
tags: [說明, codex, claude, workflow]
status: 🌿成長
updated: 2026-06-28
---

# 🤝 _協作 Collab — Codex × Claude 交接區

> 兩個 AI 不共享記憶，每次對話都是冷啟動。所以它們「自動配合」靠的不是心電感應，而是**這個資料夾裡的共用檔案契約**。詳細概念見 [[Codex × Claude 串接與自動協作]]。

## 角色分工（誰做什麼）
- **Claude**：規劃者 Planner + 審查者 Critic。產出規格、找盲點、反方審查、跨文件整合。
- **Codex**：實作者 Builder + 整理者 Archivist。讀寫檔案、落地實作、跑驗證、寫回 vault。
- **你（人）**：定義目標、最後拍板。

## 交接檔案契約（固定三件）
| 檔案 | 誰寫 | 內容 |
|---|---|---|
| `task.md` | 你 / Claude | 這次要做什麼（目標、範圍、驗收標準）|
| `report.md` | Codex | 它做了什麼、改了哪些檔、開放問題 |
| `review.md` | Claude | 審查意見、採納/未採納、下一步 |

> 規則：每一輪都**讀上一棒寫的檔，再寫自己那棒**。這樣即使換了 session 也接得上。

## 步驟提示範本（`prompts/`）
1. `01-plan.md` — Claude：把需求變成規格 → 寫進 `task.md`
2. `02-build.md` — Codex：依 `task.md` 實作 → 寫 `report.md`
3. `03-review.md` — Claude：審查 `report.md` → 寫 `review.md`
4. `04-integrate.md` — Codex：依 `review.md` 修正 → 更新 `report.md`

## 三種啟動方式
- **全自動（Level 3，✅ 已實測通過）**：在 Claude Code 說「用 codex 擴充 vault：<主題>」。我會把任務寫進 `task.md`，再跑 `orchestrate-vault.ps1 -Bypass` 驅動 Codex 做事、寫回 `report.md`，然後由我審查寫 `review.md`。
- **半自動**：你自己跑（互動主控台可直接帶中文任務）：
  ```powershell
  cd "D:\obsidian\個人學習\個人學習"
  powershell -NoProfile -ExecutionPolicy Bypass -File "_協作 Collab\orchestrate-vault.ps1" -Task "把 Agent 代理 補上 2026 multi-agent 段落"
  ```
- **手動**：照 `prompts/` 的四步，在 Claude / Codex 之間貼來貼去。

## 重要設定（環境已驗證 ✅）
- Codex CLI：`C:\Users\dan40\AppData\Local\OpenAI\Codex\bin\codex.exe`（v0.130，未加進 PATH）。**勿用** PATH 上的 WindowsApps `codex.exe`（會「存取被拒」）。
- `codex exec` 必帶：`--skip-git-repo-check`（vault 非 git）、`-c service_tier="fast"`（config 限定 fast/flex）。寫檔 `--sandbox workspace-write`、唯讀 `read-only`。
- **`-Bypass`（= `--dangerously-bypass-approvals-and-sandbox`）**：因為你的 `config.toml` 是 `[windows] sandbox="elevated"`，從非互動 shell（Claude）驅動時若不繞過會卡 UAC。Claude 驅動一律加 `-Bypass`；你互動跑可不加（保留沙箱）。
- **編碼鐵則**：所有 `.ps1` 一律 **ASCII-only**（PS 5.1 會把無 BOM 的中文 .ps1 當 Big5 解析而壞檔）；中文一律放 `.md`，用 `Get-Content -Encoding UTF8` 讀，prompt 經 **UTF-8 stdin** 餵給 codex（避免命令列參數亂碼）。

## 已驗證紀錄
- 2026-06-28：Claude 從非互動 shell 跑 `orchestrate-vault.ps1 -Bypass`，Codex 成功在 vault 建檔並寫回 `report.md`，全自動閉環通過。
