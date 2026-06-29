---
type: concept
title: Prompt 提示工程 / Prompt Engineering
tags: [ai, prompt]
status: 🌳常青
level: 基礎
updated: 2026-06-28
related: ["[[LLM 大型語言模型]]", "[[Context 脈絡與記憶]]"]
---

# Prompt 提示工程 / Prompt Engineering

> **一句話定義：** Prompt 是你給 LLM 的指令；提示工程就是「把話說好」，讓模型穩定產出你要的結果。這是你操控 AI 最直接的方向盤。

## 1. 是什麼 What it is
Prompt = 你輸入給模型的所有文字（角色設定、任務、範例、限制、輸出格式）。同一個模型，prompt 寫得好不好，結果天差地別。

## 2. 為什麼重要 Why it matters
對「想會應用」的你，這是 CP 值最高的技能：不用寫程式，光靠把需求講清楚，就能讓 AI 產出可用結果。也是寫 [[Agent 代理]] 與 [[Skill 技能]] 的底層功夫。

## 3. 怎麼運作 How it works
好的 prompt 通常包含：
- **角色 Role**：「你是資深文案…」
- **任務 Task**：要做什麼、目標是什麼。
- **脈絡 Context**：背景資料、限制條件。
- **範例 Examples**（few-shot）：給 1~3 個示範。
- **輸出格式 Format**：要清單？JSON？字數？

常用技巧：
- **Chain-of-Thought**：請它「一步步思考」再回答 → 推理更準。
- **明確 > 含糊**：與其「寫好一點」，不如「用 5 條 bullet、每條 20 字內」。

## 4. 與其他概念的關係 Relations
- [[LLM 大型語言模型]]：prompt 是它的輸入。
- [[Context 脈絡與記憶]]：prompt 佔用 context 視窗。
- [[Skill 技能]]：Skill 本質是「打包好、可重用的高品質 prompt＋資源」。

## 5. 實際應用 / 我可以怎麼用 Applications
- 把常用需求存成「prompt 模板」重複用（本庫的 `_自動化/` 就是範例）。
- 不滿意時別重寫，改用「再加一個限制」迭代修正。

## 6. 常見誤解 Misconceptions
- ❌「越長越好」→ 重點是清楚、結構化，不是字多。
- ❌「一次就要完美」→ prompt 是迭代出來的。

## 7. 延伸閱讀 References
- 本庫 `_自動化 Automation/daily-prompt.md` 是實戰範例。
