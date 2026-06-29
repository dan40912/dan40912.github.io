# Task（新增 6 篇維運/Agentic 概念 + 2 處併入）

> 規劃者：Claude。執行者：Codex。嚴謹依此 spec 執行，完成後寫 `_協作 Collab/report.md` 交 Claude 審查。

## 目標 Goal
補上「維運（Ops）與進階 Agentic」這一層，讓知識庫覆蓋到「系統長期跑得動、可除錯、可控成本」。新增 6 篇 `level: 進階` 概念並串進知識網；另把 Planning、Token Optimization 併入既有筆記（不另開）。

## A. 新增 6 篇（放 `01_核心概念 Concepts/`，沿用 `99_範本 Templates/概念筆記範本.md` 8 段結構）
中英雙語、說明用中文、術語英文；工具中立（Dify/Obsidian 只當 §5 例子）；每篇 frontmatter：`type: concept`、`title`（中英）、`tags`（見下）、`status: 🌿成長`、`level: 進階`、`updated: 2026-06-29`、`related`（檔名精準）。每篇至少連 2-3 篇、不可孤島。

1. `Data Pipeline 資料流水線.md` — tags `[ai, data-pipeline, 產品化, 維運]`。重點：ETL（Extract-Transform-Load）；Obsidian 筆記 → 切塊 → embedding → 向量庫 → 應用；**自動同步**（改筆記後向量庫要更新）。關聯：[[RAG 檢索增強生成]]、[[Chunking 切塊策略]]、[[Hybrid Search 混合搜尋]]、[[案例-自動策展知識庫]]。
2. `Metadata Filtering 元數據過濾.md` — tags `[ai, rag, metadata, 產品化]`。**標示為 [[RAG 檢索增強生成]] 的延伸**。重點：用 tags/屬性/來源先縮小檢索範圍再搜尋，大幅降幻覺（例：只搜 `#manual` 的筆記，不搜日記）。關聯：[[RAG 檢索增強生成]]、[[Hybrid Search 混合搜尋]]、[[Chunking 切塊策略]]、[[Context 脈絡與記憶]]。
3. `Observability 可觀測性.md` — tags `[ai, observability, 產品化, 維運]`。重點：不只看 logs，而是追蹤 AI 的「調用鏈 trace」；出錯時分辨是 RAG 沒撈到 / LLM 沒呼叫工具 / 工具回傳格式錯。關聯：[[Agent 代理]]、[[Tool Use 工具呼叫]]、[[Evaluation 評估]]、[[Feedback Loop 回饋迴圈]]。
4. `Cache 快取.md` — tags `[ai, cache, 產品化, 維運]`。重點：相同/相似查詢直接回舊結果，省 token、降延遲；快取失效與正確性取捨。關聯：[[Streaming 串流與延遲]]、[[LLM 大型語言模型]]、[[Context 脈絡與記憶]]。
5. `Model Agnostic 模型無關性.md` — tags `[ai, model-agnostic, 產品化, 維運]`。重點：系統不綁死單一模型，可隨時切換（旗艦/輕量/開源）；用平台（如 Dify）抽象掉後端。關聯：[[LLM 大型語言模型]]、[[Evaluation 評估]]。
6. `Self-Reflection 自我反思.md` — tags `[ai, agent, self-reflection, 產品化]`。重點：讓 LLM 輸出前先檢查自己「有沒有根據、是否離題」，降錯率；與 review/critic 的關係。關聯：[[Agent 代理]]、[[Evaluation 評估]]、[[Prompt 提示工程]]、[[Guardrails 護欄]]。

## B. 兩處併入既有筆記（小幅新增段落，不大改原文）
7. 在 [[Agent 代理]] 新增一個小段落「Planning 任務規劃」：Agent 執行多步驟複雜任務前先擬計畫，否則中途迷失；連到 [[Self-Reflection 自我反思]]。放在「怎麼運作」之後合適處，約 3-5 行。
8. 在 [[LLM 大型語言模型]] 新增一個小段落「Token Optimization 成本優化」：簡單任務用輕量/便宜模型、複雜任務才用旗艦模型；連到 [[Cache 快取]]、[[Model Agnostic 模型無關性]]。約 3-5 行。

## C. 串接
9. [[🗺️ AI 全景地圖]]「從理解到上線 Production tier」段落：補一兩句帶到 Ops 概念，並在文字中用 `[[ ]]` 連到這 6 篇（主圖與既有小圖不必改；如易於加入可在小圖補 Observability/Cache/Pipeline 節點，但別讓圖過擠——不確定就不改圖）。
10. `00_首頁 Home/🏠 知識庫首頁.md`「② 學習」：把這 6 篇加入產品化清單（可分「產品化」與「維運/Agentic」兩小群）。
11. `00_首頁 Home/📂 全部筆記總覽.md`「核心概念」分組：補進這 6 篇（各一行說明）。

## 不要做
- 不要重建已存在的 [[Chunking 切塊策略]]、[[Evaluation 評估]]、[[多 AI 協作與多 Agent 工作流]]。
- 不要改名/移動/刪除任何既有 `.md`；不要碰 `.obsidian/`、`_協作`/`_自動化` 功能檔。
- 除 B、C 指定的小幅新增外，不要大改既有筆記內文。
- 不要修教學 placeholder 連結（[[量子計算]]、[[未來筆記]]、範本空連結等，刻意保留）。

## 驗收標準 Acceptance
- [ ] 新增 6 篇，檔名與上面一致，8 段 + frontmatter（`level: 進階`、tags 如上）齊全。
- [ ] [[Agent 代理]] 有 Planning 段、[[LLM 大型語言模型]] 有 Token Optimization 段（皆小幅、連結正確）。
- [ ] 地圖/首頁/總覽都已收錄 6 篇；每篇至少連 2-3 篇、無孤島；工具中立。
- [ ] 既有筆記未改名/搬移；除指定處外內文未大改；全 vault 0 新斷鏈（教學 placeholder 不算）。
- [ ] `_協作 Collab/report.md` 更新：新增/修改清單、各篇關聯、發現問題、開放問題、自我檢查。

## 限制與注意
- 遵守根目錄 `AGENTS.md`。引用外部事實附來源與日期；沒把握標明，不杜撰。
- 不確定或有風險處記到 report.md 交 Claude，不要擅自擴張。
