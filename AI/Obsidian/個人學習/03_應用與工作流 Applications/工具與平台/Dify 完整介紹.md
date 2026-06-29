---
type: application
title: Dify 完整介紹 / Dify Deep Dive
tags: [ai, dify, 平台, 工具, 產品化]
status: 🌿成長
level: 進階
updated: 2026-06-29
source: ["https://dify.ai/", "https://github.com/langgenius/dify", "https://dify.ai/blog/v1-6-0-built-in-two-way-mcp-support", "https://docs.dify.ai/"]
related: ["[[🧰 AI 工具與平台總覽]]", "[[RAG 檢索增強生成]]", "[[Agent 代理]]", "[[MCP (Model Context Protocol)]]", "[[Observability 可觀測性]]"]
---

# Dify 完整介紹 / Dify Deep Dive

> **一句話：** Dify 是開源的「**Agentic 工作流／LLM 應用開發平台**」——用拖拉就能把 RAG、Agent、模型管理、工具串接、監控組成一個可上線的 AI 產品；可雲端用，也可自架（全功能免費）。GitHub 星數已破 10 萬。

> 資料以 2026-06 官方來源為準；Dify 更新很快，版本/功能請再對 [官方文件](https://docs.dify.ai/)。

## 1. 它在生態裡的位置
對照 [[🧰 AI 工具與平台總覽]]：Dify 是「**工廠**」。你用它把 [[LLM 大型語言模型]]、[[RAG 檢索增強生成]]、[[Tool Use 工具呼叫]]、[[MCP (Model Context Protocol)]] 這些零件，封裝成自己的產品（例如 PRAY COIN 導航員）。

## 2. 核心功能 Full Feature Set

### A. 應用建構
- **視覺化工作流 Workflow**：拖拉節點建多步驟流程（分支、條件、迴圈）。
- **Chatflow / Agent**：建會自己規劃→呼叫工具→回應的自主 [[Agent 代理]]。
- **Prompt IDE**：撰寫、版本化、測試 prompt。

### B. 知識與檢索（RAG）
- **RAG Pipeline**：從文件攝取到檢索一條龍，內建 PDF、PPT 等常見格式抽取。
- **知識庫 Knowledge Base**：上傳文件或接 **Data Sources**（如 Google Drive、Notion）。
- 對應本庫概念：可在此調 [[Chunking 切塊策略]]、[[Metadata Filtering 中繼資料過濾]]、[[Hybrid Search 混合搜尋]]。

### C. 模型管理 Model Management
- 接數百種商用與開源 LLM、數十家推論供應商，支援自架（如 Ollama、vLLM）與任何 **OpenAI API 相容**端點。
- 實踐了 [[Model Agnostic 模型無關]]：可隨時換模型、依任務路由。

### D. 工具與插件 Tools & Plugins
- 自 **v1.0.0（2025-02）** 起，所有模型與工具都改成 **plugin**，集中在官方 plugins repo 維護。
- **Marketplace**：官方與夥伴整合；也可從 GitHub URL 安裝或上傳自製 `.zip`。

### E. MCP 雙向支援（v1.6.0 起）
- **當 client**：直接呼叫任何 [[MCP (Model Context Protocol)]] server（如 Linear、Notion，或 Zapier、Composio 這類整合平台）當工具。
- **當 server**：把你的 Dify agent／workflow **曝露成 MCP server**，給 Claude 等其他 client 使用。

### F. 維運與整合
- **LLMOps / 可觀測性**：記錄並分析應用日誌與效能、標註（annotation），持續優化——對應 [[Observability 可觀測性]]、[[Evaluation 評估]]、[[Feedback Loop 回饋迴圈]]；亦可接 Langfuse 做 tracing。
- **Triggers**：外部事件自動啟動 workflow。
- **Custom Endpoints / OpenAPI**：接自己的 API（如內容審核＝[[Guardrails 護欄]]、外部資料工具）。
- **Backend-as-a-Service**：每個 app 自帶 API，可嵌入網站或被程式呼叫。
- **多租戶 workspace**、**自架**（Docker，OSS 授權下全功能、無功能閹割）。

## 3. 怎麼應用 Use Cases
- **知識問答**：把 Obsidian／產品文件做成知識庫，建「PRAY COIN 導航員」。
- **客服 Agent**：接 FAQ 知識庫 + 工具（查單、查價），設 [[Guardrails 護欄]]（不能承諾退款、轉人工）。
- **內部工具**：把重複流程（彙整報告、分類郵件）做成 workflow。

## 4. 怎麼串接 Integration（實作重點）
1. **接模型**：設定頁填 API key，或指向自架／OpenAI 相容端點。
2. **接資料**：知識庫上傳文件，或連 Google Drive／Notion 等 Data Source。
3. **接工具**：Marketplace 裝 plugin／加 **MCP server**／接 OpenAPI／自訂 endpoint。
4. **對外發佈**：把 app 發成 API、嵌入網站、或變成 **MCP server** 供 [[OpenClaw 個人 AI 助理]]、Claude Desktop 等取用。
5. **自架**：用 Docker Compose 部署，資料與模型自己掌握（隱私／合規）。

## 5. 上手路徑 Action Plan（由淺入深）
- **Level 1**：用知識庫 + RAG 做「問我的文件」問答。
- **Level 2**：加工具／MCP，讓它不只會讀、還能查價、寫筆記、呼叫 API。
- **Level 3**：轉成 Agent 任務模式（自動拆解多步驟），並補 [[Evaluation 評估]] / [[Observability 可觀測性]] / [[Guardrails 護欄]] 讓它可上線、可維運。

## 6. 來源 References（2026-06 查證）
- 官網：https://dify.ai/
- GitHub：https://github.com/langgenius/dify
- MCP 雙向支援公告（v1.6.0）：https://dify.ai/blog/v1-6-0-built-in-two-way-mcp-support
- 官方文件：https://docs.dify.ai/
