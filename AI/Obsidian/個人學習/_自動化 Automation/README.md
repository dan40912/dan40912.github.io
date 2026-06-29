---
type: application
title: 自動化說明 / Automation README
tags: [說明, 應用]
status: 🌳常青
updated: 2026-06-28
---

# ⚙️ 自動策展系統說明

這個資料夾讓你的知識庫「自己長大」：定時抓 AI 新聞 → 整理 → 寫成雙語筆記 → 自動連回核心概念。
原理拆解見 [[案例-自動策展知識庫]]。

## 檔案說明
| 檔案 | 用途 |
|---|---|
| `daily-prompt.md` | 每日快訊的指令（prompt）|
| `weekly-prompt.md` | 每週精選 digest 的指令 |
| `concept-builder-prompt.md` | 想補一篇新概念筆記時用 |
| `run-daily.ps1` / `run-weekly.ps1` | 給排程器呼叫的執行腳本 |
| `logs/` | 每次自動執行的紀錄 |

---

## ✅ 前置：確認 Claude Code 可用
開 PowerShell 執行：
```powershell
claude --version
```
有版本號代表 OK。若顯示找不到，需先確認 Claude Code 已安裝且在 PATH。

---

## 方式 B（先測這個）— 手動觸發
最簡單、最可控。在 vault 資料夾開 Claude Code：
```powershell
cd "D:\obsidian\個人學習\個人學習"
claude
```
然後直接說：**「跑每日快訊」** 或 **「依 _自動化 Automation/daily-prompt.md 執行」**。
週報就說「跑每週精選」。想補概念就用 `concept-builder-prompt.md`。

或不開互動模式，一行跑完：
```powershell
cd "D:\obsidian\個人學習\個人學習"
claude -p (Get-Content "_自動化 Automation\daily-prompt.md" -Raw -Encoding utf8) --allowedTools "WebSearch" "WebFetch" "Read" "Write" "Edit" "Glob" "Grep" --permission-mode acceptEdits
```

---

## 方式 A — Windows 工作排程器（全自動）
測試手動沒問題後，再設排程。**用系統管理員開 PowerShell**，執行：

```powershell
# 每日 08:00 抓快訊
schtasks /Create /TN "Obsidian AI 每日快訊" /SC DAILY /ST 08:00 /F `
  /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"D:\obsidian\個人學習\個人學習\_自動化 Automation\run-daily.ps1\""

# 每週一 08:30 出週報
schtasks /Create /TN "Obsidian AI 每週精選" /SC WEEKLY /D MON /ST 08:30 /F `
  /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"D:\obsidian\個人學習\個人學習\_自動化 Automation\run-weekly.ps1\""
```

### 立即測試一次（不用等到 08:00）
```powershell
schtasks /Run /TN "Obsidian AI 每日快訊"
```
跑完看 `04_每日快訊 Daily/` 是否出現當天檔案；細節看 `logs/`。

### 管理排程
```powershell
schtasks /Query /TN "Obsidian AI 每日快訊"      # 查狀態
schtasks /Delete /TN "Obsidian AI 每日快訊" /F   # 移除
```

> 注意：電腦關機/睡眠時排程不會跑（這是本機方案，非雲端）。可在工作排程器 GUI 勾選「喚醒電腦執行」或「錯過後盡快補跑」。

---

## 客製化
- 想改抓取主題／頻率：直接編輯 `daily-prompt.md` / `weekly-prompt.md`。
- 想改時間：重跑上面的 `schtasks /Create`（`/F` 會覆蓋）。
