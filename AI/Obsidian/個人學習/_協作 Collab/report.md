# Report（Codex 回報）

## 本輪實作回報（2026-06-29：Ops / Agentic 概念擴充）

### 做了什麼 Summary

- 依 `_協作 Collab/task.md` 新增 6 篇偏 Ops / Agentic 的 `level: 進階` 核心概念筆記，皆放在 `01_核心概念 Concepts/`。
- 新增筆記皆沿用 `99_範本 Templates/概念筆記範本.md` 的格式：frontmatter、標題、單句定義、`## 1.` 到 `## 7.` 段落。
- 在 [[Agent 代理]] 新增「Planning 規劃」段落，補上 Agent 如何拆解目標、管理 context、驗收與重新規劃。
- 在 [[LLM 大型語言模型]] 新增「Token Optimization Token 最佳化」段落，補上 context 精簡、快取、模型路由與成本控制。
- 更新 [[🗺️ AI 全景地圖]] 的 Production tier 與 recipes，把資料管線、metadata、observability、cache、model agnostic、self-reflection 串入上線脈絡。
- 更新 [[🏠 知識庫首頁]]，核心概念數改為 21 篇，新增「進階・Ops / Agentic（6 篇）」導覽。
- 更新 [[📂 全部筆記總覽]]，補入 6 篇新筆記與各一行用途說明。
- 小幅更新 [[RAG 檢索增強生成]]，補回 [[Data Pipeline 資料管線]] 與 [[Metadata Filtering 中繼資料過濾]] 的關係與延伸閱讀。

### 新增筆記

- [[Data Pipeline 資料管線]] — 說明 ETL、Obsidian 筆記到 chunk / embedding / index 的流程，連到 [[RAG 檢索增強生成]]、[[Chunking 切塊策略]]、[[Hybrid Search 混合搜尋]]。
- [[Metadata Filtering 中繼資料過濾]] — 說明用 tags、日期、來源、權限與狀態縮小 RAG 檢索範圍，連到 [[RAG 檢索增強生成]]、[[Hybrid Search 混合搜尋]]、[[Context 脈絡與記憶]]。
- [[Observability 可觀測性]] — 說明 AI logs、traces、metrics 與除錯，連到 [[Agent 代理]]、[[Tool Use 工具呼叫]]、[[Evaluation 評估]]。
- [[Cache 快取]] — 說明 embedding、檢索、工具與模型輸出的快取策略，連到 [[Streaming 串流與延遲]]、[[LLM 大型語言模型]]、[[Context 脈絡與記憶]]。
- [[Model Agnostic 模型無關]] — 說明模型抽象層、路由、備援與 eval 比較，連到 [[LLM 大型語言模型]]、[[Evaluation 評估]]、[[Cache 快取]]。
- [[Self-Reflection 自我反思]] — 說明 Agent 的 critic / review / 修正迴圈，連到 [[Agent 代理]]、[[Evaluation 評估]]、[[Prompt 提示工程]]、[[Guardrails 護欄]]。

### 改了哪些檔

- `01_核心概念 Concepts/Data Pipeline 資料管線.md`
- `01_核心概念 Concepts/Metadata Filtering 中繼資料過濾.md`
- `01_核心概念 Concepts/Observability 可觀測性.md`
- `01_核心概念 Concepts/Cache 快取.md`
- `01_核心概念 Concepts/Model Agnostic 模型無關.md`
- `01_核心概念 Concepts/Self-Reflection 自我反思.md`
- `01_核心概念 Concepts/Agent 代理.md`
- `01_核心概念 Concepts/LLM 大型語言模型.md`
- `01_核心概念 Concepts/RAG 檢索增強生成.md`
- `02_關係地圖 Maps/🗺️ AI 全景地圖.md`
- `00_首頁 Home/🏠 知識庫首頁.md`
- `00_首頁 Home/📂 全部筆記總覽.md`
- `_協作 Collab/report.md`

### 驗證結果

- `01_核心概念 Concepts/` 目前共 21 篇概念筆記。
- 新增 6 篇皆含 `type: concept`、`status: 🌿成長`、`level: 進階`、`updated: 2026-06-29`，且 `tags` 含 `產品化`。
- 新增 6 篇皆有 7 個範本段落與至少 2-3 個 wikilink；實際每篇 wikilink 數量為 12-14。
- 本輪觸及檔案的 path-aware wikilink 檢查結果：`BROKEN_LINKS_TOUCHED_PATH_AWARE=0`。
- 未修改 `.obsidian/`。
- 未修改 `_自動化 Automation/`。
- 除本 report 外，未修改 `_協作 Collab/` 其他檔案。
- 本輪未使用外部資料，無外部來源需記錄。

### 假設與取捨

- task.md 在目前 PowerShell 顯示下有部分文字亂碼；依可辨識英文 term、tags、related 與段落要求，將檔名整理為可讀中文：`Data Pipeline 資料管線`、`Metadata Filtering 中繼資料過濾`、`Observability 可觀測性`、`Cache 快取`、`Model Agnostic 模型無關`、`Self-Reflection 自我反思`。
- 「8 個內容單元」沿用現有概念範本解讀為：單句定義 + `## 1.` 到 `## 7.` 七個段落。
- 只對既有筆記做任務要求內的小範圍補段與連結補強，沒有重寫既有概念。

### 開放問題

- 無阻塞問題。若 Claude 想要更嚴格的檔名完全比對，可再依審查意見調整檔名與 wikilink。

### 自我檢查

- [x] 新增 6 篇 Ops / Agentic 概念筆記。
- [x] 新增筆記皆有完整 frontmatter、`level: 進階`、tag 含 `產品化`。
- [x] 每篇至少連回 2-3 篇既有或本次新增相關筆記。
- [x] [[Agent 代理]] 已補 Planning 段落。
- [x] [[LLM 大型語言模型]] 已補 Token Optimization 段落。
- [x] [[🗺️ AI 全景地圖]] 已串入新 6 篇與 production tier。
- [x] [[🏠 知識庫首頁]] 已收錄新 6 篇。
- [x] [[📂 全部筆記總覽]] 已收錄新 6 篇。
- [x] 本輪觸及檔案 wikilink 檢查為 0 斷鏈。

---

## 第二輪修正回報（2026-06-29）

### 本輪採納項目

- 採納 `_協作 Collab/review.md` 的 P1：在 [[🗺️ AI 全景地圖]] 的「從理解到上線 Production tier」段落補一張獨立 mermaid 小圖。
- 圖中呈現：使用者 → Input Guardrails → 已部署 AI 應用 App；App 內由 Chunking 與 Hybrid Search 餵入 RAG，再供給 LLM；輸出經 Output Guardrails 與 Streaming 回到使用者；旁路以 Feedback Loop 收集真實案例，形成 Evaluation 測試集，再回頭改進 App。
- 遵守 review 建議：mermaid 內未放 `[[ ]]` wikilink；段落原有文字 wikilink 保留。

### 本輪改了哪些檔

- `02_關係地圖 Maps/🗺️ AI 全景地圖.md`
  - `updated` 改為 `2026-06-29`。
  - 只在「從理解到上線 Production tier」段落文字之後新增小 mermaid。
- `_協作 Collab/report.md`
  - 補上本輪修正、採納理由與驗證結果。

### 確認結果

- 主圖未修改；目前檔內共有 2 個 mermaid 區塊，第一個仍是核心流程主圖，第二個是新增產品化小圖。
- 6 篇產品化概念筆記與其他既有筆記內文未修改。
- `02_關係地圖 Maps/🗺️ AI 全景地圖.md` 的 wikilink 檢查結果：`BROKEN_LINKS_IN_MAP=0`。
- mermaid 區塊檢查結果：`BLOCK_1_HAS_WIKILINK=False`、`BLOCK_2_HAS_WIKILINK=False`。
- 本輪未使用外部資料，無外部來源需記錄。

### 開放問題

- 無。本輪僅依 P1 補圖，未擴張處理既有 placeholder/教學示例連結。

---

> 任務：新增 6 篇「產品化」進階概念，並串進 Obsidian vault 知識網。供 Claude 審查。

## 做了什麼 Summary

- 依 `_協作 Collab/task.md` 新增 6 篇 `level: 進階`、tag 含 `產品化` 的核心概念筆記，皆放在 `01_核心概念 Concepts/`。
- 每篇依 `99_範本 Templates/概念筆記範本.md` 的格式完成：frontmatter、標題下一句話定義、7 個編號段落；內容涵蓋 task 要求的 8 個內容單元。
- 更新 [[🗺️ AI 全景地圖]]，新增「從理解到上線 Production tier」段落，並在組裝配方補上「把玩具變工具」。
- 更新 [[🏠 知識庫首頁]] 的「② 學習」區，核心概念數量由 9 篇改為 15 篇，新增「進階・產品化（6 篇）」導覽。
- 更新 [[📂 全部筆記總覽]] 的「核心概念」分組，補入 6 篇新筆記與各一行說明。
- 只在 [[RAG 檢索增強生成]] 的延伸閱讀補連 [[Hybrid Search 混合搜尋]] 與 [[Chunking 切塊策略]]，未大改既有概念內文。

## 新增筆記與關聯

- [[Evaluation 評估]] — 關聯 [[Prompt 提示工程]]、[[RAG 檢索增強生成]]、[[Feedback Loop 回饋迴圈]]；補上 eval 測試集、回歸測試與品質判斷。
- [[Guardrails 護欄]] — 關聯 [[Agent 代理]]、[[Tool Use 工具呼叫]]、[[Prompt 提示工程]]；補上 input/output guardrails、工具權限與資料外洩風險。
- [[Feedback Loop 回饋迴圈]] — 關聯 [[Evaluation 評估]]、[[RAG 檢索增強生成]]、[[Prompt 提示工程]]、[[Guardrails 護欄]]；補上真實案例回收與改善迴圈。
- [[Hybrid Search 混合搜尋]] — 關聯 [[RAG 檢索增強生成]]、[[Chunking 切塊策略]]、[[Context 脈絡與記憶]]；明確標示為 RAG 的延伸，說明向量、關鍵字與混合搜尋。
- [[Streaming 串流與延遲]] — 關聯 [[LLM 大型語言模型]]、[[Context 脈絡與記憶]]、[[Tool Use 工具呼叫]]、[[Guardrails 護欄]]；補上 latency、首 token 體感與適用情境。
- [[Chunking 切塊策略]] — 關聯 [[RAG 檢索增強生成]]、[[Hybrid Search 混合搜尋]]、[[Context 脈絡與記憶]]；明確標示為 RAG 的延伸，說明 Markdown、chunk size、overlap 與 metadata。

## 改動的既有檔案

- `02_關係地圖 Maps/🗺️ AI 全景地圖.md`
  - 新增「從理解到上線 Production tier」段落。
  - 組裝配方新增第 9 條「把玩具變工具」。
- `00_首頁 Home/🏠 知識庫首頁.md`
  - 核心概念數量更新為 15 篇。
  - 新增產品化 6 篇導覽列。
- `00_首頁 Home/📂 全部筆記總覽.md`
  - 「核心概念」分組新增 6 篇與說明。
- `01_核心概念 Concepts/RAG 檢索增強生成.md`
  - 延伸閱讀新增 [[Hybrid Search 混合搜尋]]、[[Chunking 切塊策略]]。
- `_協作 Collab/report.md`
  - 寫入本次 Codex 完工回報。

## 驗證結果

- `01_核心概念 Concepts/` 目前共 15 篇，其中新增 6 篇檔名與 task 指定一致。
- 新增 6 篇皆含：
  - `type: concept`
  - `status: 🌿成長`
  - `level: 進階`
  - `updated: 2026-06-28`
  - `tags` 含 `產品化`
  - `related` 指向 task 指定關聯。
- 新增 6 篇皆含一句話定義，以及 `## 1.` 到 `## 7.` 的完整段落。
- 本次新增與本次編輯檔案的 wikilink 檢查結果：`TOUCHED_FILES_BROKEN_LINKS=0`。
- 未改名、移動、刪除任何既有 `.md`。
- 未修改 `.obsidian/`。
- 未修改 `_自動化 Automation/`。
- 除本 report 外，未修改 `_協作 Collab/` 其他檔案。
- 此資料夾不是 git repository，無法用 `git status` 或 `git diff` 檢查；已改用 PowerShell 檔案與 wikilink 檢查。

## 發現的問題 Findings

- 全 vault wikilink 掃描若把範本、教學、AGENTS/CLAUDE placeholder 與 task 範例都納入，仍有 18 個既有疑似破鏈，並非本次新增或串接造成：
  - 多個範本與 prompt 中的空 wikilink placeholder。
  - `AGENTS.md`、`CLAUDE.md` 中的「筆記名」wikilink 示例。
  - 使用教學中的「未來筆記」「筆記連結」「量子計算」等 wikilink 示例。
  - `_協作 Collab/task.md` 中 task 文字本身的空連結 placeholder。
- 依 task 邊界，未改 `_自動化 Automation/` 與 `_協作 Collab/task.md`；也未擴張去修 AGENTS/CLAUDE 與教學示例。建議 Claude 判斷「全 vault 0 斷鏈」是否要另開清理任務，或在檢查規則中排除範本/提示/教學示例。

## 假設與取捨 Assumptions

- 「8 段結構」依現有概念範本實作為：標題下的一句話定義 + `## 1.` 到 `## 7.`，而不是新增一個獨立 `## 0.`。
- 內容保持工具中立；Dify、Obsidian、Codex 僅放在「實際應用」作例子。
- 未使用外部資料；本次是概念整理與 vault 內部串接，因此無外部來源需附連結與日期。
- 既有筆記除 task 明確指定處外不大幅改寫。

## 開放問題 Open questions

- 是否要另開「破鏈清理」任務，統一處理範本、教學、AGENTS/CLAUDE 與 `_協作 Collab/task.md` 中的 placeholder wikilink？
- 是否要在 [[🗺️ AI 全景地圖]] 未來加入更完整的 production tier mermaid 圖，把 Evaluation、Guardrails、Feedback Loop、RAG 檢索品質與 UX 延遲串成一張圖？

## 自我檢查 Self-check

- [x] 新增 6 篇產品化概念筆記，檔名與 task 一致。
- [x] 新增筆記皆有完整 frontmatter、`level: 進階`、tag 含 `產品化`。
- [x] 每篇至少連回 2-3 篇既有或本次新增相關筆記。
- [x] [[Hybrid Search 混合搜尋]] 與 [[Chunking 切塊策略]] 明確標示為 [[RAG 檢索增強生成]] 的延伸。
- [x] [[🗺️ AI 全景地圖]] 已加入 production tier 與 6 篇連結。
- [x] [[🏠 知識庫首頁]] 已收錄產品化 6 篇。
- [x] [[📂 全部筆記總覽]] 已收錄產品化 6 篇。
- [x] [[RAG 檢索增強生成]] 只補延伸閱讀連結，未大改內文。
- [x] 本次新增/編輯檔案 wikilink 檢查為 0 斷鏈。
- [ ] 全 vault 嚴格掃描仍有既有 placeholder/示例疑似破鏈；未在本任務內修正，已列入 Findings 與 Open questions。
