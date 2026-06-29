---
type: application
title: n8n 工作流自動化 / n8n Workflow Automation
tags: [ai, n8n, 工具, 自動化, workflow]
status: 🌿成長
level: 進階
updated: 2026-06-29
source: ["https://n8n.io/", "https://hatchworks.com/blog/ai-agents/n8n-guide/"]
related: ["[[🧰 AI 工具與平台總覽]]", "[[Agent 代理]]", "[[Tool Use 工具呼叫]]", "[[Dify 完整介紹]]"]
---

# n8n 工作流自動化 / n8n Workflow Automation

> **一句話：** n8n 是開源的「**工作流自動化**」平台——用拖拉把不同系統（Slack、資料庫、OpenAI、S3…）串成自動化流程，並內建 AI 節點與 AI Agent builder。

> 資料以 2026-06 來源為準，使用前請再查官方文件。

## 1. 核心功能 Features
- **視覺化建構**：400+ 開源節點（Slack、PostgreSQL、OpenAI、S3…）＋可自建節點；2026 版含 70+ AI 節點，支援分支、條件路由、多步推理。
- **AI Agent 節點**：接一個 chat model、可選 vector store、一組 tools（本身是子 workflow 或 HTTP 請求），內部跑 ReAct／function-calling 迴圈直到完成——就是 [[Agent 代理]] 的具體化。
- **記憶 Memory**：Window Buffer（最近 N 則）、Summary（滾動摘要）、外部記憶（Redis／Postgres）；對應 [[Context 脈絡與記憶]]。
- **模型路由**：簡單高頻任務走輕量模型，複雜推理走強模型——對應 [[Model Agnostic 模型無關]] 與成本控制。
- **控制與安全**：逐節點日誌、人工核可 gate（高風險暫停）、context 範圍限制、重試／fallback——對應 [[Guardrails 護欄]]、[[Observability 可觀測性]]。
- **評估**：可對 AI workflow 跑回歸測試、偵測 prompt drift、比較模型——對應 [[Evaluation 評估]]。
- 支援自架或雲端；模型供應商涵蓋 OpenAI、Anthropic、Mistral、Google Vertex、Ollama 與任何 OpenAI 相容端點。

## 2. 怎麼應用 Use Cases
- 把「抓資料→AI 處理→寫回系統→通知」整條自動化（例：每天抓幣價→AI 摘要→發 Telegram）。
- 跨系統的 AI Agent：在你的工具之間 reason、branch、act。

## 3. 與 Dify 的差異（怎麼選）
- **n8n**＝跨系統「**流程自動化**」，整合面最廣（400+）。
- **[[Dify 完整介紹]]**＝做「**AI 產品／RAG 應用**」，知識庫與發佈 API 更專。
- 兩者可互補：n8n 觸發與串系統，Dify 當其中的 AI 大腦。

## 4. 來源 References
- 官網：https://n8n.io/
- 指南（2026）：https://hatchworks.com/blog/ai-agents/n8n-guide/
