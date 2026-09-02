# Dify Advanced Chat Workflow Design

本文件定義金融 AI Service Hub 的 Dify advanced-chat workflow。設計原則是先正規化上下文，再分類 intent 與風險，最後依 user_type 產生不同輸出。對內流程必須經 Permission Gate 與 Audit Log；對外流程不得揭露內部控管。

## Workflow 總覽

```text
START
  -> Context Normalizer
  -> Intent Classifier
  -> Risk Gate
  -> Permission Gate (internal only)
  -> Knowledge Retrieval
  -> Scenario Router
  -> Internal Answer Composer / External Answer Composer
  -> Handoff / Case Summary Composer
  -> Audit Log Composer (internal only)
  -> Knowledge Candidate Evaluator
  -> Final Answer
```

## 節點規格

### 1. START

- 節點類型：Start
- Input variables：完整欄位見 `./start_inputs_schema.md`
- Output variables：所有 inputs、`query`
- System prompt：無
- Routing condition：永遠進入 Context Normalizer
- Fallback condition：缺少核心欄位時仍進入 Context Normalizer，由下游補預設值與標記缺漏

### 2. Context Normalizer

- 節點類型：LLM
- Input variables：START 全部 inputs、`query`
- Output variables：
  - `normalized_user_type`
  - `normalized_business_line`
  - `normalized_route_stage`
  - `mock_context_available`
  - `known_facts`
  - `missing_fields`
  - `normalization_warnings`
- System prompt：

```text
你是金融 Chatbot 的 Context Normalizer。請只根據 START inputs 與使用者問題整理上下文，不回答問題。

任務：
1. 確認 user_type 是否為 internal_employee 或 external_customer。
2. 確認 business_line 是否在允許清單。
3. 確認 route_stage 是否符合 user_type。
4. 若 mock_data_available=true，整理 mock data 中實際存在的 known_facts。
5. 若資料不足，列出 missing_fields，只能要求非敏感資訊。
6. 不得把 mock data 說成正式核心系統查詢。

輸出 JSON：normalized_user_type, normalized_business_line, normalized_route_stage, mock_context_available, known_facts, missing_fields, normalization_warnings。
```

- Routing condition：進入 Intent Classifier
- Fallback condition：若 user_type 無法辨識，標記 `missing_fields=["user_type"]`，預設走 `external_customer` 安全輸出

### 3. Intent Classifier

- 節點類型：Question Classifier 或 LLM
- Input variables：`query`、Context Normalizer output、`business_line`
- Output variables：
  - `intent`
  - `intent_confidence`
  - `intent_reason`
  - `retrieval_required`
  - `handoff_possible`
- System prompt：

```text
你是金融 intent classifier。請從固定 taxonomy 選一個最適合的 intent：
general_faq, account_login, identity_verification, product_info, policy_benefit, claims, loan_status, credit_card_billing, fraud_or_scam, unknown_fund, investment_advice_boundary, system_issue, document_upload, complaint, human_handoff, compliance_review, permission_audit, knowledge_candidate, out_of_scope, insufficient_info。

分類時優先規則：
1. 使用者要求真人 -> human_handoff。
2. 詐騙、盜刷、正在轉帳、不明資金、自傷風險 -> 對應高風險 intent。
3. 要求明牌、漲跌、保證收益 -> investment_advice_boundary。
4. 對內越權、大量資料、繞過審批 -> permission_audit 或 compliance_review。
5. 資訊不足 -> insufficient_info。

輸出 JSON：intent, intent_confidence, intent_reason, retrieval_required, handoff_possible。
```

- Routing condition：進入 Risk Gate
- Fallback condition：低信心時 intent=`insufficient_info`

### 4. Risk Gate

- 節點類型：LLM 或 Rule-based Code Node
- Input variables：`intent`、`query`、`risk_level`、`handoff_required`、`auth_status`、`service_relationship`
- Output variables：
  - `final_risk_level`
  - `handoff_required`
  - `approval_required`
  - `blocked_content`
  - `safe_response_boundary`
  - `risk_reason`
- System prompt：

```text
你是金融安全與合規 Risk Gate。請保守判斷風險，不得因前端傳 normal 而忽略高風險文字。

必須升級 high/danger/critical 的情境：
- OTP、CVV、密碼、完整卡號、完整帳號、完整身分證字號。
- 投資明牌、個別投資建議、漲跌預測、保證收益。
- 保證理賠、保證核貸、保證核保、正式金額。
- 詐騙、盜刷、正在轉帳、不明資金、自傷風險。
- 對內越權、非服務關係、大量資料、AML、繞過主管或法遵。

輸出 JSON：final_risk_level, handoff_required, approval_required, blocked_content, safe_response_boundary, risk_reason。
```

- Routing condition：
  - `final_risk_level in ["danger","critical"]` 或 `handoff_required=true`：後續必須經 Handoff / Case Summary
  - 其他進入 Permission Gate 或 Knowledge Retrieval
- Fallback condition：無法判斷時設 `final_risk_level=medium`，並要求補充非敏感資訊

### 5. Permission Gate（對內）

- 節點類型：LLM 或 Rule-based Code Node
- Input variables：`user_type`、`user_role`、`department`、`permission_level`、`service_relationship`、`approval_required`、Risk Gate output
- Output variables：
  - `permission_status`
  - `allowed_data_scope`
  - `masked_fields`
  - `denied_fields`
  - `required_approval_owner`
  - `permission_reason`
- System prompt：

```text
你是對內 Permission Gate。只處理 internal_employee。

請檢查：
1. 查詢人角色與部門是否合理。
2. 是否有服務關係。
3. 是否涉及正式金額、敏感欄位、大量資料、AML、第三方個資。
4. 是否要求繞過主管、法遵、資安或資料 Owner。

若權限不足，不得提供資料明細，只能輸出審批需求與可提供的安全摘要。

輸出 JSON：permission_status, allowed_data_scope, masked_fields, denied_fields, required_approval_owner, permission_reason。
```

- Routing condition：
  - `user_type=internal_employee`：執行本節點
  - `user_type=external_customer`：跳過本節點
- Fallback condition：缺少角色、部門或服務關係時 `permission_status=needs_more_info`

### 6. Knowledge Retrieval

- 節點類型：Knowledge Retrieval
- Input variables：`business_line`、`intent`、`user_type`、`faq_source`
- Output variables：
  - `retrieved_context`
  - `retrieved_sources`
  - `retrieval_status`
- System prompt：無，依 dataset metadata 檢索
- Routing condition：
  - `retrieval_required=true`：檢索
  - `retrieval_required=false`：可跳過，但保留空 context
- Fallback condition：無檢索結果時 `retrieval_status=no_reliable_context`，Final Answer 必須說明知識庫依據不足

### 7. Scenario Router

- 節點類型：If/Else 或 LLM router
- Input variables：`user_type`、`route_stage`、`final_risk_level`、`handoff_required`、`permission_status`
- Output variables：
  - `target_composer`
  - `case_summary_required`
  - `audit_log_required`
  - `knowledge_candidate_check_required`
- System prompt：

```text
請依 user_type、route_stage、risk 與 permission 決定下一個 composer：
- internal_employee -> Internal Answer Composer。
- external_customer -> External Answer Composer。
- handoff_required=true -> 同時產生 Handoff / Case Summary。
- internal_employee 且 audit_required=true -> 產生 Audit Log。
- KB 不足、使用者提出新問題或流程缺口 -> Knowledge Candidate Evaluator。
```

- Routing condition：依輸出導向 composer
- Fallback condition：無法判斷時走 External Answer Composer 並限制回答

### 8. Internal Answer Composer

- 節點類型：LLM
- Input variables：所有上游 output、`retrieved_context`、mock data
- Output variables：
  - `internal_answer`
  - `customer_sayable_version`
  - `internal_blockers`
- System prompt：使用 `./system_prompts.md` 的「對內 System Prompt」
- Routing condition：`user_type=internal_employee`
- Fallback condition：缺少權限資訊時只輸出待補欄位與審批建議

### 9. External Answer Composer

- 節點類型：LLM
- Input variables：所有上游 output、`retrieved_context`、mock data
- Output variables：
  - `external_answer`
  - `customer_next_steps`
  - `safe_missing_info_questions`
- System prompt：使用 `./system_prompts.md` 的「對外 System Prompt」
- Routing condition：`user_type=external_customer`
- Fallback condition：資訊不足時只追問非敏感必要資訊

### 10. Handoff / Case Summary Composer

- 節點類型：LLM
- Input variables：`query`、`intent`、Risk Gate output、composer output、mock data
- Output variables：
  - `handoff_message`
  - `case_summary`
  - `customer_visible_handoff_reason`
- System prompt：

```text
你是真人客服交接摘要產生器。

請整理：
1. 使用者問題摘要。
2. 已知事實，僅引用 mock data 實際欄位。
3. 風險原因。
4. 不可索取或不可承諾內容。
5. 建議真人客服下一步。
6. 客戶可見的轉接理由。

不得揭露內部權限、模型判斷細節或 audit log。
```

- Routing condition：`handoff_required=true` 或 `final_risk_level in ["high","danger","critical"]`
- Fallback condition：若摘要資訊不足，仍建立 case summary 並列 `missing_non_sensitive_info`

### 11. Audit Log Composer（對內）

- 節點類型：LLM 或 Template
- Input variables：Internal Answer、Permission Gate output、Risk Gate output、START inputs
- Output variables：
  - `mock_audit_log`
- System prompt：

```text
你是 mock Audit Log Composer。只為 internal_employee 產生 demo audit log。

Audit Log 不得包含真實個資、正式金額、完整帳號、完整卡號、身分證字號或密碼類資訊。

輸出 JSON：audit_type, user_type, user_role, department, business_line, service_id, intent, risk_level, permission_status, approval_required, handoff_required, data_scope, masked_fields, timestamp_policy。
```

- Routing condition：`user_type=internal_employee` 且 `audit_required=true`
- Fallback condition：缺少欄位時填 `unknown_demo_value` 並標記 `log_quality=incomplete`

### 12. Knowledge Candidate Evaluator

- 節點類型：LLM
- Input variables：`query`、retrieval output、composer output、Risk Gate output
- Output variables：
  - `candidate_status`
  - `candidate_reason`
  - `draft_answer`
  - `recommended_reviewer`
- System prompt：

```text
你是 Knowledge Candidate Evaluator。

可收錄：
- FAQ 缺口。
- 可泛化 SOP。
- 安全提醒。
- 補件流程。
- 已去識別化的標準回覆。

不可收錄：
- 個資。
- 正式金額。
- 案件特定結論。
- 未審核投資建議。
- 內部風控細節。

輸出 JSON：candidate_status, candidate_reason, draft_answer, recommended_reviewer。
```

- Routing condition：KB 無依據、使用者提出新問題、內部標記 `knowledge_candidate`
- Fallback condition：高風險或個資過多時 `candidate_status=rejected`

### 13. Final Answer

- 節點類型：Answer
- Input variables：composer outputs、case summary、audit log、knowledge candidate
- Output variables：最終回覆
- System prompt：

```text
請依 user_type 輸出最終答案。

internal_employee：
- 必須包含 Internal Use Only。
- 可包含 mock Audit Log。
- 可包含客戶可說版本。
- 不得提供未授權資料。

external_customer：
- 不得揭露內部流程、權限、audit log 或模型判斷。
- 不得要求 OTP、CVV、密碼、完整卡號、完整帳號、完整身分證字號。
- 高風險優先轉真人或安全處理。

所有情境：
- mock data 只能說明為 demo。
- 不得保證收益、理賠、核貸、核保或投資結果。
- 知識庫無依據時不得編造。
```

- Routing condition：最後輸出
- Fallback condition：若所有 composer 失敗，輸出安全 fallback：「目前資訊不足，請補充非敏感資訊；若涉及帳戶安全或資金風險，請立即轉真人客服。」

## Workflow 驗收標準

- START variables 與 `./start_inputs_schema.md` 一致。
- 每個高風險 intent 都能被 Risk Gate 上修。
- External Answer 不顯示 Permission Gate、Audit Log、內部審批。
- Internal Answer 必須能產生客戶可說版本與 mock Audit Log。
- Knowledge Retrieval 無結果時不得編造。
- Handoff required 時一定產生 case summary。

