---
type: concept
title: LLM 大型語言模型 / Large Language Model
tags: [ai, llm]
status: 🌳常青
level: 基礎
updated: 2026-06-28
related: ["[[AI 基礎概念]]", "[[Prompt 提示工程]]", "[[Context 脈絡與記憶]]", "[[Cache 快取]]", "[[Model Agnostic 模型無關]]"]
---

# LLM 大型語言模型 / Large Language Model

> **一句話定義：** LLM 是讀過海量文字、學會「預測下一個字」的模型；因為這個能力夠強，它能對話、寫作、推理、寫程式。它是 Agent / MCP / Skill 的「大腦」。

## 1. 是什麼 What it is
一個超大型神經網路（如 Claude、GPT、Gemini），輸入一段文字（prompt），輸出接續的文字。表面是「文字接龍」，但在足夠規模下，湧現出理解、推理、翻譯、coding 等能力。

## 2. 為什麼重要 Why it matters
它是整個生態的引擎。你後面學的 [[Agent 代理]]、[[MCP (Model Context Protocol)]]、[[Skill 技能]]，本質都是「**在 LLM 外面加裝備**」，讓這顆大腦能記得更多、用工具、自動行動。

## 3. 怎麼運作 How it works
1. **Tokenization**：把文字切成 token（字詞片段）。
2. **預測**：根據前文，算出下一個 token 的機率分布。
3. **取樣**：選出下一個 token，重複直到結束。
- **參數 parameters**：模型「學到的知識」存在參數裡。
- **Context window 上下文視窗**：一次能「看」多少 token，決定它能處理多長的輸入＋記憶，見 [[Context 脈絡與記憶]]。

## 4. 與其他概念的關係 Relations
- [[Prompt 提示工程]]：怎麼下指令讓它表現好。
- [[Tool Use 工具呼叫]]：讓 LLM 會「動手」呼叫外部功能。
- [[RAG 檢索增強生成]]：餵它最新/私有資料以減少幻覺。

## 5. 實際應用 / 我可以怎麼用 Applications
- 選模型：要強推理選最強模型（如 Claude Opus），要快要便宜選輕量模型。
- 知道它「按 token 計費」，所以精簡 prompt、善用快取能省錢。

### Token Optimization Token 最佳化
Token Optimization 是在不犧牲任務品質的前提下，減少模型必須讀入與輸出的 token。做法包含：只放必要 context、把長文件先摘要、用 [[RAG 檢索增強生成]] 撈相關片段、把重複系統提示封裝成穩定模板、避免讓模型輸出不必要的格式或長篇解釋。

產品化時，token 最佳化也會連到模型選型與成本控制：固定且可重用的資料可用 [[Cache 快取]]，簡單任務可路由到較小模型，重要任務再交給高階模型。這也是 [[Model Agnostic 模型無關]] 的實際價值：讓品質、速度與成本可以依任務切換，而不是所有請求都用同一種配置。

## 6. 常見誤解 Misconceptions
- ❌「它記得我上次說的話」→ 預設不會，除非放進 context 或有記憶機制，見 [[Context 脈絡與記憶]]。
- ❌「它能查最新消息」→ 有知識截止日；要最新資訊得靠 [[Tool Use 工具呼叫]] / [[RAG 檢索增強生成]]。

## 7. 延伸閱讀 References
- [[AI 基礎概念]]
