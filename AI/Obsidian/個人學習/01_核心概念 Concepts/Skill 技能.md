---
type: concept
title: Skill 技能 / Agent Skill
tags: [ai, skill]
status: 🌳常青
level: 基礎
updated: 2026-06-28
related: ["[[Agent 代理]]", "[[Prompt 提示工程]]", "[[MCP (Model Context Protocol)]]"]
---

# Skill 技能 / Agent Skill

> **一句話定義：** Skill 是把「做某件事的專業知識＋步驟＋工具＋資源」打包成一個可重用模組，讓 Agent 在需要時自動載入、即插即用——像給 AI 裝一個專長外掛。

## 1. 是什麼 What it is
一個 Skill 通常是一個資料夾，內含：
- **說明（什麼時候該用我）**：讓 Agent 自動判斷要不要啟用。
- **指令／步驟**：怎麼把這件事做好（本質是高品質、結構化的 [[Prompt 提示工程]]）。
- **附帶資源**：範本、腳本、參考檔。

例：一個「做 PPT 的 Skill」會包含投影片排版規則＋產生檔案的腳本。Agent 看到你要做簡報，就自動載入它。

## 2. 為什麼重要 Why it matters
Skill 讓能力可以**累積與分享**。你把一套做得好的工作流封裝成 Skill，之後同類任務 AI 都照最佳做法執行，品質穩定、不用每次重講。對「想會應用」的你，這是把個人 know-how 變成可重複資產的方法。

## 3. 怎麼運作 How it works
1. Agent 讀取每個 Skill 的「描述」。
2. 遇到符合的任務時，**漸進式載入 progressive disclosure**：先讀描述，需要才讀完整指令與資源（省 context）。
3. 照 Skill 的步驟與工具完成任務。

## 4. 與其他概念的關係 Relations
- [[Agent 代理]]：Skill 是 Agent 的「可換裝專長」。
- [[Prompt 提示工程]]：Skill 內核是打包好的 prompt 與流程。
- [[MCP (Model Context Protocol)]]：**Skill＝會什麼（能力打包）；MCP＝怎麼接外部（連線標準）**。兩者互補：Skill 可以呼叫透過 MCP 接進來的工具。

## 5. 實際應用 / 我可以怎麼用 Applications
- 把本庫的每日／每週策展流程，未來可封裝成一個「知識策展 Skill」。
- 常見內建 Skill：處理 Word/Excel/PPT/PDF、排程任務等。

## 6. 常見誤解 Misconceptions
- ❌「Skill＝MCP」→ 最常見誤解，見上方關係欄。
- ❌「Skill 是一段 prompt」→ 它是「描述＋指令＋資源」的完整包，且能被自動觸發。

## 7. 延伸閱讀 References
- [[Agent 代理]]、[[🗺️ AI 全景地圖]]
