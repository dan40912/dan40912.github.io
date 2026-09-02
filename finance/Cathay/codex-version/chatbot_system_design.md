# 金融 AI Service Hub Chatbot 系統方案

本文件定義一套可用於金融集團多業別、多角色的 Chatbot 系統方案。設計目標是讓對內員工助手與對外客戶服務機器人共用一致的分類、風險、知識庫與 mock data 契約，但在輸出內容、權限揭露、轉真人與稽核紀錄上明確分流。

相關文件：

- START inputs schema：`./start_inputs_schema.md`
- Dify workflow 節點：`./dify_workflow_design.md`
- System Prompt：`./system_prompts.md`
- QA 測試矩陣：`./qa_mock_scenario_matrix.md`
- 前端重構建議：`./frontend_refactor_recommendations.md`

## 一、系統架構設計

### 1. 前端分流

`index.html` 只負責入口分流，不讓使用者在首頁調整高風險參數。

| 入口 | 對象 | 目的 | 前端帶入 |
|---|---|---|---|
| `/internal/index.html` | 內部員工 | 查 SOP/FAQ、整理客戶現況、下一步、客戶可說版本、審批與 audit log | `user_type=internal_employee`、`channel=internal_workspace`、`audit_required=true` |
| `/external/index.html` | 外部客戶 | 自助服務、補充資訊、轉真人、案件摘要 | `user_type=external_customer`、`channel=customer_chatbot`、`permission_level=public` |
| `/internal/call-center/index.html` | 客服或主管 | 接手高風險案件、審批、回覆、結案、Knowledge Candidate | 由案件狀態帶入，不由客戶端設定 |

### 2. Internal 頁面保留欄位

Internal 頁面應保留使用者可理解、可操作且不會造成權限誤導的欄位：

- `business_line`：金融業別。
- `route_stage`：`status_lookup`、`next_best_action`、`risk_boundary`。
- `scenario_type`：展示情境，例如 `policy_benefit_review`、`fraud_warning`。
- `user_role`、`department`：員工角色與部門。
- `service_relationship`：是否為負責客戶、案件承辦或支援角色。
- `permission_level`：展示用權限層級。
- `approval_required`：可顯示結果，但不應讓一般使用者任意切換。
- `mock_customer_profile`、`mock_customer_context`：展示 mock 摘要與 payload。
- `faq_source`、`faq_title`：對應知識庫來源。

### 3. External 頁面保留欄位

External 頁面應只保留客戶能理解的欄位：

- `business_line` 或服務類型卡片。
- 客戶問題輸入。
- 預設測試問題。
- 是否轉真人、案件摘要狀態。
- mock data 摘要，但必須標示為 demo 情境，不可說成正式查詢結果。

External 頁面不得顯示：

- 內部角色、部門、權限層級。
- Permission Gate、Audit Log、主管審批細節。
- 模型風險分數、內部分流規則。
- 內部知識庫檔名以外的流程細節。

### 4. 自動帶入欄位

以下欄位應由前端或系統自動帶入，不讓使用者手動設定：

- `user_type`
- `channel`
- `audit_required`
- `data_policy`
- `sensitive_data_policy`
- `greeting_source`
- `initial_greeting`
- `answer_contract`
- `expected_sections`
- `mock_data_available`
- `mock_data_source`
- `mock_data_contract`

Internal 可由 UI 選擇但需保守限制：

- `business_line`
- `route_stage`
- `scenario_type`
- `user_role`
- `department`
- `service_relationship`

External 可由 UI 選擇或推論：

- `business_line`
- `service_id`
- `scenario_type`

### 5. Dify START node inputs

START node 必須接收完整 payload，讓 workflow 不靠自然語言猜測核心參數。完整欄位請見 `./start_inputs_schema.md`。

最小必填集合：

- `user_type`
- `channel`
- `business_line`
- `service_id`
- `route_stage`
- `risk_level`
- `answer_contract`
- `expected_sections`
- `data_policy`
- `sensitive_data_policy`

### 6. Dify workflow 節點

Workflow 固定採用以下節點順序：

1. START
2. Context Normalizer
3. Intent Classifier
4. Risk Gate
5. Permission Gate（對內）
6. Knowledge Retrieval
7. Scenario Router
8. Internal Answer Composer
9. External Answer Composer
10. Handoff / Case Summary Composer
11. Audit Log Composer（對內）
12. Knowledge Candidate Evaluator
13. Final Answer

節點細節請見 `./dify_workflow_design.md`。

### 7. 節點責任摘要

| 節點 | 責任 |
|---|---|
| START | 接收前端 payload 與使用者問題 |
| Context Normalizer | 正規化 user_type、business_line、route_stage、mock data 與缺漏欄位 |
| Intent Classifier | 判斷 intent taxonomy |
| Risk Gate | 判斷 risk_level、handoff_required、禁止回答內容 |
| Permission Gate | 對內檢查角色、服務關係、權限與審批需求 |
| Knowledge Retrieval | 依業別、intent、user_type 檢索 FAQ/KB |
| Scenario Router | 決定走 internal、external 或 handoff |
| Answer Composer | 產出固定段落格式 |
| Case Summary | 為真人客服整理交接摘要 |
| Audit Log | 產生 mock audit log，不含真實個資 |
| Knowledge Candidate | 判斷是否可收錄知識候選 |
| Final Answer | 套用資料最小化與輸出檢查 |

### 8. 知識庫切分

知識庫應依「使用對象 × 業別 × 風險」切分：

- `/faqs/*.md`：業別 FAQ 與低風險 SOP，供 internal 與 external 共同檢索，但輸出要依 user_type 改寫。
- `/internal/*.md`：內部權限、SOP、稽核、法遵、客戶可說版本。
- `/external/*.md`：對外客服流程、自助步驟、轉真人規則、補充資訊話術。
- `dify-dsl/*.yml`：workflow、START variables、節點 prompt。

檢索順序：

1. 同 `business_line` 的 FAQ。
2. 同 `intent` 的流程 KB。
3. user_type 專用 KB。
4. `general_finance` fallback。

若知識庫無依據，必須回答資訊不足，不得編造。

### 9. Mock data 使用規則

Mock data 只用於 demo 情境：

- 可整理已知 mock 現況。
- 可指出 mock data 未提供的欄位。
- 不可宣稱已查正式核心系統。
- 不可推導正式金額、正式帳務、正式保單價值、正式理賠或正式核貸結果。
- 不可補出 mock data 沒有的客戶個資。

Mock data contract 固定包含：

```json
{
  "source": "frontend_demo",
  "allowed_use": ["scenario_summary", "known_facts", "missing_fields", "safe_next_steps"],
  "forbidden_use": ["official_result", "core_system_lookup", "guaranteed_amount", "third_party_personal_data"],
  "must_disclose": "這是 demo mock data，不是正式系統查詢結果。"
}
```

### 10. Audit Log / Case Summary / Knowledge Candidate

Internal 必須產生 mock Audit Log：

```json
{
  "audit_type": "mock_demo",
  "user_type": "internal_employee",
  "user_role": "customer_service",
  "department": "call_center",
  "business_line": "credit_card",
  "intent": "fraud_or_scam",
  "risk_level": "high",
  "permission_status": "allowed_with_masking",
  "handoff_required": true,
  "timestamp_policy": "generated_at_runtime",
  "personal_data_policy": "masked_or_mock_only"
}
```

Case Summary 給真人客服，不給客戶看內部欄位：

- 客戶問題摘要。
- 已確認資訊。
- 不可要求的敏感資料。
- 建議下一步。
- 轉接原因。
- 風險等級。

Knowledge Candidate 只收錄可泛化知識：

- 可收錄：FAQ 缺口、標準回覆、流程提醒、補件清單。
- 不可收錄：個資、正式金額、未審核投資建議、內部風控細節、案件特定結論。

## 二、Intent classification

| intent | 定義 | 觸發關鍵字 | 對內處理 | 對外處理 | 檢索 KB | 可能轉真人 |
|---|---|---|---|---|---|---|
| `general_faq` | 一般金融或服務 FAQ | 怎麼辦、流程、說明 | 查 FAQ/SOP，整理依據 | 提供簡短步驟 | 是 | 低 |
| `account_login` | 登入、帳號、App 問題 | 登不進去、忘記密碼 | 查登入 SOP，不看密碼 | 引導安全重設 | 是 | 中 |
| `identity_verification` | 身分驗證與驗證失敗 | 驗證、身分、本人 | 檢查權限與驗證狀態 | 說明安全驗證，不索取敏感資料 | 是 | 高 |
| `product_info` | 商品資訊 | 商品、方案、費用 | 提供核准版商品資訊 | 提供一般資訊，不推薦 | 是 | 中 |
| `policy_benefit` | 保單權益與保單狀態 | 保單、保障、價值 | 只依 mock/KB 整理，不宣稱正式值 | 提醒需完成驗證，以正式資料為準 | 是 | 高 |
| `claims` | 理賠流程 | 理賠、申請、文件 | 整理文件與流程，不保證理賠 | 提供補件與申請方向 | 是 | 高 |
| `loan_status` | 貸款進度 | 核貸、額度、利率 | 整理 mock 進度，不保證結果 | 說明補件與審核，以正式通知為準 | 是 | 高 |
| `credit_card_billing` | 信用卡帳務與爭議款 | 帳單、盜刷、扣款 | 整理爭議款 SOP 與停損 | 引導掛失、爭議款、客服 | 是 | 高 |
| `fraud_or_scam` | 詐騙、盜刷、可疑指示 | 詐騙、盜刷、正在轉帳 | 優先停損與轉真人 | 優先安全提醒與轉真人 | 是 | 必須 |
| `unknown_fund` | 不明資金 | 不明入帳、陌生款項 | AML/法遵提示，轉真人 | 不動用資金，聯繫客服 | 是 | 必須 |
| `investment_advice_boundary` | 投資建議邊界 | 明牌、會漲嗎、保證收益 | 拒絕個別建議，轉合規資訊 | 拒絕預測與推薦 | 是 | 中 |
| `system_issue` | 系統異常 | 當機、錯誤、無法上傳 | 收集非敏感錯誤資訊，轉 IT | 提供基本排除與客服 | 是 | 中 |
| `document_upload` | 文件上傳或補件 | 補件、上傳、文件 | 整理補件清單 | 說明可補資料，不收敏感內容 | 是 | 中 |
| `complaint` | 客訴 | 投訴、很生氣、沒處理 | 建立案件摘要與升級 | 安撫、整理訴求、轉真人 | 是 | 高 |
| `human_handoff` | 要求真人 | 真人、客服、專員 | 建立交接摘要 | 轉真人並摘要 | 否 | 必須 |
| `compliance_review` | 法遵審核 | 法遵、違規、審核 | 法遵介入，不提供結論 | 說明需專人確認 | 是 | 必須 |
| `permission_audit` | 權限與稽核 | 查別人、大量資料、主管 | 檢查權限，產生 audit log | 不揭露內部稽核 | 是 | 必須 |
| `knowledge_candidate` | 知識候選 | 新問題、FAQ 沒有 | 建立候選與 reviewer | 收集回饋，不承諾收錄 | 否 | 低 |
| `out_of_scope` | 非服務範圍 | 非金融、無關請求 | 說明不處理 | 禮貌拒絕 | 否 | 低 |
| `insufficient_info` | 資訊不足 | 不清楚、只有一句 | 追問必要非敏感資訊 | 追問安全必要資訊 | 否 | 中 |

## 三、Risk gate 規則

| risk_level | 判斷 | 回答策略 |
|---|---|---|
| `normal` | 一般 FAQ、低敏感流程 | 可直接回答，引用 KB |
| `medium` | 需要限制提醒或驗證 | 回答流程，提醒限制，不給正式結論 |
| `high` | 涉及金額、帳務、理賠、核貸、驗證失敗、客訴 | 限制回答，建議真人或審批 |
| `danger` | 詐騙、盜刷、正在轉帳、不明資金、自傷風險 | 優先安全處理，立即轉真人 |
| `critical` | 現場人身風險、資金正在流出、重大資安 | 停止一般回答，提供緊急處理與真人 |

必須升級為 `high` 以上：

- 要求 OTP、CVV、密碼、完整卡號、完整帳號、完整身分證字號。
- 要求投資明牌、個別投資建議、漲跌預測。
- 要求保證收益、保證理賠、保證核貸、保證核保。
- 涉及正式金額、正式帳務、正式保單價值、正式案件結果。
- 身分驗證失敗或帳戶安全。
- 客訴、情緒高張或連續未解決。
- 對內越權查詢、非服務關係、大量資料、敏感欄位、AML、繞過審批或法遵。

必須轉真人：

- 使用者明確要求真人。
- 疑似詐騙、盜刷、不明資金、正在轉帳、自傷風險。
- 正式金額、正式理賠、正式核貸、正式保單價值。
- 身分驗證失敗或帳戶安全。
- 對內權限不足或涉及法遵、AML、主管審批。

## 四、最終交付清單

| 交付物 | 驗收方式 |
|---|---|
| System Prompt | 能直接貼入 Dify LLM 節點，固定格式完整 |
| Dify workflow design | 每個節點有 input/output、prompt、routing、fallback |
| START input schema | 每欄有用途、範例、必填、對內/對外差異 |
| 前端 payload contract | 前端能依 user_type 產生一致 inputs |
| KB 切分策略 | 能依 business_line、intent、user_type 檢索 |
| mock data contract | 明確限制只能 demo，不可宣稱正式結果 |
| fallback rules | 資訊不足、KB 無依據、高風險時可處理 |
| handoff rules | 轉真人條件明確且可驗收 |
| audit log format | 對內可產生 mock audit log，不含真實個資 |
| QA acceptance criteria | 測試矩陣覆蓋 user_type、business_line、risk |

