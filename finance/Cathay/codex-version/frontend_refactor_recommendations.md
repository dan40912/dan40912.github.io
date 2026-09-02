# Frontend Refactor Recommendations

本文件說明目前專案在不改變整體 demo 架構下，如何把前端、FAQ、Dify DSL 與 QA 文件對齊本次 Chatbot 系統方案。

## 1. `index.html`

### 應保留

- 對內 / 對外兩個入口。
- mock data overview 區塊。
- 不串真實核心系統的 demo 說明。

### 應刪除或避免

- 首頁不應提供 risk_level、permission_level、approval_required 等可手動切換欄位。
- 不應在首頁顯示 Dify 內部節點或審批細節。

### 應新增

- 分流說明：
  - 對內：Internal Use Only、SOP/FAQ、mock 現況、權限、audit log。
  - 對外：客戶自助、補充資訊、轉真人、安全提醒。
- 連結到 `codex-version/chatbot_system_design.md` 作為規格入口。

## 2. `internal/index.html`

### 應保留

- 產業卡片。
- 三路線 preset：查現況、下一步建議、高風險邊界。
- FAQ 連結。
- mock customer profile。
- Dify payload 複製與 Chatbot 啟動。
- 使用者設定與登出 demo 行為。

### 應刪除或隱藏

- 不讓使用者任意修改：
  - `user_type`
  - `channel`
  - `audit_required`
  - `mock_data_source`
  - `data_policy`
  - `sensitive_data_policy`
- 不顯示任何看似正式核心系統查詢的文案。

### 應抽成 JSON

建議新增 `data/internal_scenarios.json`：

```json
{
  "business_line": "life_insurance",
  "title": "人壽",
  "role": "insurance_agent",
  "department": "life_insurance_service",
  "faq_source": "/faqs/life_insurance.md",
  "route_stages": ["status_lookup", "next_best_action", "risk_boundary"],
  "mock_customer": {},
  "presets": []
}
```

### 應新增 payload 欄位

- `answer_contract=internal_governed_reply`
- `expected_sections`：11 個對內固定段落。
- `mock_data_contract`：對內版 mock data 使用限制。
- `service_relationship`：從 mock customer 或角色設定帶入。

### QA 測試

- 每張產業卡片切換後，payload 的 `business_line`、`faq_source`、`mock_data_summary` 必須同步更新。
- 三個 preset 對應三個 `route_stage`。
- 高風險 preset 必須帶 `handoff_required=true` 或 `approval_required=true`。

## 3. `external/index.html`

### 應保留

- 客戶服務卡片。
- 三個 preset 問題。
- 轉真人處理。
- 補充說明。
- 查看進度。
- mock profile panel。
- Dify URL / payload 複製。

### 應刪除或隱藏

- 不顯示：
  - `user_role`
  - `department`
  - `permission_level`
  - `approval_required`
  - `audit_required`
  - `Permission Gate`
  - `Audit Log`
- 不使用「主管審批」、「法遵審查中」等內部字眼對客戶顯示。

### 應抽成 JSON

建議新增 `data/external_scenarios.json`：

```json
{
  "business_line": "credit_card",
  "service_id": "credit_card_dispute",
  "title": "信用卡爭議款",
  "route_stages": ["self_service", "follow_up", "handoff_risk"],
  "risk_level": "high",
  "customer_visible_warning": "請不要提供 CVV、OTP 或完整卡號。",
  "mock_customer": {},
  "presets": []
}
```

### 應新增 payload 欄位

- `answer_contract=customer_facing_short_reply`
- `expected_sections`：6 個對外固定段落。
- `data_policy=customer_safe_reply_no_internal_process`
- `sensitive_data_policy=never_request_password_otp_cvv_full_card_full_account_full_id`

### QA 測試

- 高風險服務卡片或第三個 preset 必須帶 `route_stage=handoff_risk`。
- 轉真人重複點擊不得產生重複案件。
- 補充說明不得提示客戶輸入敏感資料。

## 4. `internal/call-center/index.html`

### 應保留

- 案件列表。
- 高風險卡控。
- 主管批准 / 退回補充。
- 回覆客戶。
- Knowledge Candidate review。
- Audit log。

### 應調整

- risk label 統一為 `normal`, `medium`, `high`, `danger`, `critical`，避免混用 `warn`。
- 高風險案件未核准前，回覆客戶按鈕必須 disabled。
- Knowledge Candidate 發布必須先通過審批與 reviewer。
- Audit log 欄位需對齊 `./dify_workflow_design.md` 的 Audit Log Composer。

### 應新增

- Case Summary panel：
  - 使用者問題摘要。
  - 已知 mock facts。
  - missing fields。
  - risk reason。
  - suggested next step。
  - customer visible reply。

## 5. `faqs/*.md`

### 應保留

- 每個 business_line 一份 FAQ。
- YAML frontmatter 的 `business_line`。
- 目前 demo mock data 說明。

### 應新增 metadata

每份 FAQ 建議統一 frontmatter：

```yaml
business_line: credit_card
audience:
  - internal_employee
  - external_customer
supported_intents:
  - credit_card_billing
  - fraud_or_scam
  - identity_verification
risk_notes:
  - never_request_cvv_otp_full_card
handoff_triggers:
  - suspected_fraud
  - unauthorized_transaction
```

### 應調整內容

- FAQ 答案分成「內部處理」與「對外可說版本」。
- 高風險問題必須標示 handoff trigger。
- 投資、理賠、核貸、核保、收益相關 FAQ 必須有不可承諾提醒。

## 6. `external/*.md`

### 應保留

- 對外客服流程。
- fallback、insufficient info、case summary、knowledge candidate 文件。

### 應調整

- 移除對外文件中的內部 audit log 直接表述，改成「客服將協助建立紀錄」。
- 對外文件不得揭露權限審批、內部 reviewer、模型節點。
- 高風險流程要先安全處理，再轉真人。

### 應新增

- `external/customer_sensitive_data_policy.md`
- `external/customer_handoff_rules.md`
- `external/customer_safe_reply_templates.md`

## 7. `dify-dsl/*.yml`

### 應保留

- advanced-chat mode。
- opening statement。
- retriever_resource。
- START variables。
- 既有 mock data flow 說明。

### 應調整

- START variables 與 `./start_inputs_schema.md` 完全一致。
- Internal / External workflow 都要具備：
  - Context Normalizer
  - Intent Classifier
  - Risk Gate
  - Knowledge Retrieval
  - Scenario Router
  - Answer Composer
  - Handoff / Case Summary
  - Final Answer
- Internal workflow 額外具備：
  - Permission Gate
  - Audit Log Composer
  - Knowledge Candidate Evaluator
- External workflow 不輸出 Audit Log，不揭露 Permission Gate。

### 應新增 DSL 註解

每個節點 desc 應標示：

- 節點責任。
- input variables。
- output variables。
- routing condition。
- fallback condition。

## 8. 應新增資料檔

建議未來新增：

```text
data/
  internal_scenarios.json
  external_scenarios.json
  business_lines.json
  intent_taxonomy.json
  risk_gate_rules.json
  mock_data_contract.json
qa/
  mock_scenario_matrix.md
  risk_gate_acceptance.md
  payload_contract_acceptance.md
```

本次交付先放在 `codex-version/`，不直接修改既有 demo。

## 9. Mock Scenario Matrix

前端 scenario matrix 最少應包含：

- `scenario_id`
- `user_type`
- `business_line`
- `service_id`
- `route_stage`
- `scenario_type`
- `risk_level`
- `handoff_required`
- `approval_required`
- `mock_customer_profile`
- `mock_customer_context`
- `preset_query`
- `expected_sections`
- `pass_criteria`

## 10. 前端 Payload Contract

前端送入 Dify 的 payload 必須符合：

```json
{
  "inputs": {
    "user_type": "external_customer",
    "channel": "customer_chatbot",
    "business_line": "credit_card",
    "service_id": "credit_card_dispute",
    "route_stage": "handoff_risk",
    "scenario_type": "suspected_fraud",
    "risk_level": "danger",
    "permission_level": "public",
    "auth_status": "verification_required",
    "service_relationship": "verification_required",
    "approval_required": "false",
    "audit_required": "true",
    "handoff_required": "true",
    "answer_contract": "customer_facing_short_reply",
    "expected_sections": "我理解您的問題|建議處理方式|需要補充的資訊|下一步|是否建議轉真人|回饋",
    "mock_data_available": "true",
    "mock_data_source": "frontend_demo",
    "mock_data_summary": "known_status=疑似盜刷",
    "mock_data_contract": "對外只能提供安全下一步，不可宣稱正式查詢。",
    "data_policy": "customer_safe_reply_no_internal_process",
    "sensitive_data_policy": "never_request_password_otp_cvv_full_card_full_account_full_id"
  },
  "query": "我信用卡好像被盜刷。",
  "response_mode": "streaming",
  "user": "demo-customer-001"
}
```

## 11. 前端驗收標準

- Internal 與 External payload schema 一致，但顯示欄位不同。
- External UI 不顯示 internal-only 欄位。
- 所有高風險 preset 都能帶出 `handoff_required=true`。
- 所有 mock data 顯示都標示 demo。
- 複製 payload 可直接交給 Dify 測試。
- 所有按鈕都有可見狀態變化，不存在假按鈕。

