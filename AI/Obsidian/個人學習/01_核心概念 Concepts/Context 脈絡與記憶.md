---
type: concept
title: Context 脈絡與記憶 / Context & Memory
tags: [ai, context]
status: 🌳常青
level: 基礎
updated: 2026-06-28
related: ["[[LLM 大型語言模型]]", "[[Prompt 提示工程]]", "[[RAG 檢索增強生成]]"]
---

# Context 脈絡與記憶 / Context & Memory

> **一句話定義：** Context（上下文）是 LLM「當下看得到的所有文字」；它的容量有限（context window），而且預設不會跨對話記憶——這解釋了 AI 很多「健忘」與「失焦」的行為。

## 1. 是什麼 What it is
- **Context window 上下文視窗**：模型一次能讀進的 token 上限（含你的 prompt、附帶資料、它自己的回覆）。超出就得取捨。
- **記憶 Memory**：要讓 AI「記得」，得主動把資訊放進 context，或用外部記憶機制（檔案、資料庫、memory 系統）在需要時撈回來。

## 2. 為什麼重要 Why it matters
理解 context 能解釋三件事：為什麼 AI 會忘記前面說的、為什麼貼太多資料反而變笨（失焦）、為什麼長對話到後面品質下降。也是設計 [[Agent 代理]] 的核心約束。

## 3. 怎麼運作 How it works
- 每次呼叫，系統把「該讓模型看到的東西」組成一份 context 餵進去。
- context 滿了就需要**壓縮／摘要**舊內容，或用 [[RAG 檢索增強生成]] 只撈相關片段。
- **記憶**＝把重要事實存到 context 之外（如檔案），下次再讀回來放進 context。

## 4. 與其他概念的關係 Relations
- [[LLM 大型語言模型]]：context 是它的工作記憶。
- [[Prompt 提示工程]]：prompt 是 context 的一部分，要精簡。
- [[RAG 檢索增強生成]]：管理 context 的關鍵手段——只放相關的。

## 5. 實際應用 / 我可以怎麼用 Applications
- 重要任務：把背景一次講清楚，別指望它記得三天前的對話。
- 善用「記憶／自訂指令」功能，讓 AI 跨對話記住你的偏好。
- 資料太多時，先請它摘要再深入，而不是一次倒進去。

## 6. 常見誤解 Misconceptions
- ❌「context 越大越好」→ 越大越貴、越容易失焦；相關度比數量重要。
- ❌「它會自己記得我」→ 除非有記憶機制，否則每次都是新的開始。

## 7. 延伸閱讀 References
- [[RAG 檢索增強生成]]、[[Agent 代理]]
