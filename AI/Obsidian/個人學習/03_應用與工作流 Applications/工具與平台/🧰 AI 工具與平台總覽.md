---
type: map
title: AI 工具與平台總覽 / Tools & Platforms MOC
tags: [ai, 工具, 平台, map]
status: 🌿成長
level: 進階
updated: 2026-06-29
related: ["[[🗺️ AI 全景地圖]]", "[[工作流範式]]", "[[Agent 代理]]"]
---

# 🧰 AI 工具與平台總覽

> 這裡收錄「真的拿來做事」的平台與工具。對照 [[🗺️ AI 全景地圖]]：概念是零件，這些是把零件組起來的工廠與機台。
> 資料以 2026-06 官方來源為準；版本與功能更新快，使用前請再查官方文件。

## 怎麼分類
| 類型 | 它解決什麼 | 代表工具 |
|---|---|---|
| **LLM 應用平台** | 用拖拉/低程式碼打造 AI 產品（RAG＋Agent＋API）| [[Dify 完整介紹]] |
| **工作流自動化** | 把多個系統串成自動化流程（含 AI 節點）| [[n8n 工作流自動化]] |
| **基礎建設自動化** | 自動部署/設定/維運伺服器與雲（非 AI 但搭 AIOps）| [[Ansible 自動化維運]] |
| **開源 Agent 框架** | 會自我學習/可自架的自主代理 | [[Hermes Agent（Nous Research）]] |
| **個人 AI 助理** | 跑在自己裝置、接你常用通訊軟體 | [[OpenClaw 個人 AI 助理]] |

## 其他值得認識（未獨立成篇）
- **Flowise / Langflow**：視覺化建 LLM／Agent flow。
- **LangGraph / CrewAI**：用程式碼編排多 Agent。
- **Manus**：任務執行型 Agent（自動拆解並完成工作）。
- **Claude Desktop / Claude Code**：桌面與 CLI 端整合 [[MCP (Model Context Protocol)]] 的應用。

## 選型心法
- 先問「我要做產品，還是串流程？」→ 產品選 [[Dify 完整介紹]]；串流程選 [[n8n 工作流自動化]]。
- 重隱私/本機 → [[OpenClaw 個人 AI 助理]] 或自架 Dify。
- 要可換模型 → 看是否 [[Model Agnostic 模型無關]]（上述多數都是）。
- 上線後別忘了 [[Evaluation 評估]]、[[Guardrails 護欄]]、[[Observability 可觀測性]]。
