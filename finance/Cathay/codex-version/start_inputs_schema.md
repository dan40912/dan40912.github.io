# START Inputs Schema

本文件定義 Dify START node 應接收的 inputs。所有欄位以字串或 JSON 字串傳入，避免前端、Dify URL query、DSL 匯入時型別不一致。布林值建議傳 `"true"` / `"false"`。

## 欄位總表

| 欄位 | 用途 | 範例值 | 必填 | 對內/對外差異 |
|---|---|---|---|---|
| `user_type` | 分流 internal / external | `internal_employee`, `external_customer` | 是 | 對內固定 `internal_employee`；對外固定 `external_customer` |
| `user_role` | 員工或客戶角色 | `customer_service`, `relationship_manager`, `customer` | 對內是，對外否 | 對外不顯示內部角色 |
| `department` | 員工部門 | `call_center`, `wealth_management`, `compliance` | 對內是，對外否 | 對外不傳內部部門，可留空 |
| `channel` | 來源通路 | `internal_workspace`, `customer_chatbot`, `call_center` | 是 | 由前端自動帶入 |
| `business_line` | 金融業別 | `banking`, `life_insurance`, `securities` | 是 | 對內由產業卡片選；對外由服務卡片或分類推論 |
| `service_id` | 服務或情境代碼 | `credit_card_dispute`, `loan_follow_up` | 是 | 對內可代表內部工作流；對外代表客戶服務 |
| `route_stage` | 回答路線 | `status_lookup`, `next_best_action`, `risk_boundary`, `self_service`, `follow_up`, `handoff_risk` | 是 | 對內只用前三者；對外只用後三者 |
| `scenario_type` | 細分情境 | `fraud_warning`, `policy_benefit_review`, `document_upload` | 建議 | 用於 intent 前的前端提示 |
| `risk_level` | 初始風險等級 | `normal`, `medium`, `high`, `danger`, `critical` | 是 | 可被 Risk Gate 上修，不得被下修到不安全 |
| `permission_level` | 權限層級 | `public`, `basic`, `case_owner`, `manager`, `compliance` | 是 | 對外固定 `public` 或 `verified_customer` |
| `auth_status` | 驗證狀態 | `not_required`, `verification_required`, `verified`, `failed` | 是 | 對外正式資料必須 `verified` 才能查；demo 仍不得宣稱正式查詢 |
| `service_relationship` | 服務關係 | `case_owner`, `assigned_rm`, `verification_required`, `none` | 是 | 對內用於權限；對外多為 `verification_required` |
| `approval_required` | 是否需主管/法遵/風控審批 | `true`, `false` | 是 | 對內可能因風險上修；對外不揭露審批細節 |
| `audit_required` | 是否需 audit log | `true`, `false` | 是 | 對內固定 `true`；對外不顯示 audit log |
| `handoff_required` | 是否需轉真人 | `true`, `false` | 是 | 高風險或使用者要求真人時必須 `true` |
| `faq_source` | FAQ/KB 來源 | `/faqs/credit_card.md` | 建議 | 可為檔案路徑或 Dify dataset metadata |
| `faq_title` | FAQ 標題 | `信用卡 FAQ` | 建議 | 用於回答引用 |
| `greeting_source` | 開場白來源 | `dify-dsl/greeting_external.md` | 建議 | 由前端自動帶入 |
| `initial_greeting` | 初始開場白 | `您好，我可以協助...` | 建議 | 不應由使用者輸入 |
| `answer_contract` | 回答契約 | `internal_governed_reply`, `customer_facing_short_reply` | 是 | 決定固定段落與禁用內容 |
| `expected_sections` | 預期段落 | `問題理解|下一步|是否轉真人` | 是 | 對內/對外固定格式不同 |
| `mock_data_available` | 是否有 mock data | `true`, `false` | 是 | 有 mock profile 時自動 `true` |
| `mock_data_source` | mock data 來源 | `frontend_demo`, `none` | 是 | 不可填正式核心系統 |
| `mock_data_summary` | mock data 摘要 | `known_status=疑似盜刷；safe_next_steps=掛失` | 建議 | 給模型優先讀取的短摘要 |
| `mock_data_contract` | mock data 使用限制 | `只能作為 demo，不可宣稱正式查詢` | 是 | 對內/對外文字不同但原則相同 |
| `mock_customer_profile` | mock 客戶 profile JSON | `{ "customer_id": "CUST-001" }` | 否 | 必須遮罩或使用假資料 |
| `mock_customer_context` | mock 情境 JSON | `{ "current_status": ["補件中"] }` | 否 | 只可引用實際存在欄位 |
| `data_policy` | 一般資料政策 | `mock_only_no_core_system_lookup` | 是 | 對內強調最小化；對外強調安全與驗證 |
| `sensitive_data_policy` | 敏感資料政策 | `never_request_password_otp_cvv_full_card` | 是 | 對內/對外皆必須一致遵守 |

## Business Line 枚舉

```text
banking
life_insurance
securities
asset_management
credit_card
loan
wealth_management
general_finance
fraud_or_scam
system_issue
```

## Route Stage 枚舉

對內：

```text
status_lookup
next_best_action
risk_boundary
```

對外：

```text
self_service
follow_up
handoff_risk
```

## Risk Level 枚舉

```text
normal
medium
high
danger
critical
```

## 前端自動帶入欄位

以下欄位不應讓使用者手動設定：

- `user_type`
- `channel`
- `approval_required`
- `audit_required`
- `handoff_required`
- `greeting_source`
- `initial_greeting`
- `answer_contract`
- `expected_sections`
- `mock_data_available`
- `mock_data_source`
- `mock_data_contract`
- `data_policy`
- `sensitive_data_policy`

## 對內範例 Payload

```json
{
  "inputs": {
    "user_type": "internal_employee",
    "user_role": "customer_service",
    "department": "call_center",
    "channel": "internal_workspace",
    "business_line": "credit_card",
    "service_id": "credit_card_dispute_internal",
    "route_stage": "risk_boundary",
    "scenario_type": "suspected_fraud",
    "risk_level": "high",
    "permission_level": "case_owner",
    "auth_status": "verified_internal_user",
    "service_relationship": "case_owner",
    "approval_required": "true",
    "audit_required": "true",
    "handoff_required": "true",
    "faq_source": "/faqs/credit_card.md",
    "faq_title": "信用卡 FAQ",
    "greeting_source": "dify-dsl/greeting_internal.md",
    "initial_greeting": "內部 AI Assistant，請先確認角色、目的與服務關係。",
    "answer_contract": "internal_governed_reply",
    "expected_sections": "Internal Use Only|問題理解|權限與風險判斷|mock 現況|SOP / FAQ 依據|下一步建議|不可回答 / 不可承諾內容|是否需主管 / 法遵 / 真人介入|客戶可說版本|mock Case / Approval / Audit Log|Knowledge Candidate 判斷",
    "mock_data_available": "true",
    "mock_data_source": "frontend_demo",
    "mock_data_summary": "known_status=疑似非本人交易；safe_next_steps=停卡、爭議款、轉真人；never_ask=CVV/OTP",
    "mock_data_contract": "只能作為 demo mock data，不可宣稱正式核心系統查詢。",
    "mock_customer_profile": "{\"customer_id\":\"CUST-CARD-001\",\"display_name\":\"王小姐\"}",
    "mock_customer_context": "{\"current_status\":[\"疑似非本人交易\"],\"never_ask\":[\"CVV\",\"OTP\"]}",
    "data_policy": "mock_only_no_core_system_lookup",
    "sensitive_data_policy": "never_request_password_otp_cvv_full_card_full_account_full_id"
  },
  "query": "客戶表示有非本人交易，請整理第一線可說版本與不可索取資料。"
}
```

## 對外範例 Payload

```json
{
  "inputs": {
    "user_type": "external_customer",
    "user_role": "customer",
    "department": "",
    "channel": "customer_chatbot",
    "business_line": "loan",
    "service_id": "loan_document_follow_up",
    "route_stage": "follow_up",
    "scenario_type": "document_upload",
    "risk_level": "medium",
    "permission_level": "public",
    "auth_status": "verification_required",
    "service_relationship": "verification_required",
    "approval_required": "false",
    "audit_required": "true",
    "handoff_required": "false",
    "faq_source": "/faqs/loan.md",
    "faq_title": "貸款 FAQ",
    "greeting_source": "dify-dsl/greeting_external.md",
    "initial_greeting": "您好，我可以協助您了解貸款補件與下一步。",
    "answer_contract": "customer_facing_short_reply",
    "expected_sections": "我理解您的問題|建議處理方式|需要補充的資訊|下一步|是否建議轉真人|回饋",
    "mock_data_available": "true",
    "mock_data_source": "frontend_demo",
    "mock_data_summary": "known_status=已補收入證明；missing_fields=房屋權狀影本；boundary=不可保證核貸",
    "mock_data_contract": "對外只能提供安全下一步，不可宣稱正式查詢或保證結果。",
    "mock_customer_profile": "{\"customer_id\":\"CUST-LOAN-001\"}",
    "mock_customer_context": "{\"current_status\":[\"已補收入證明\",\"仍待房屋權狀影本\"]}",
    "data_policy": "customer_safe_reply_no_internal_process",
    "sensitive_data_policy": "never_request_password_otp_cvv_full_card_full_account_full_id"
  },
  "query": "我貸款補件還缺什麼？"
}
```

## 驗收標準

- START node 中上述欄位皆存在。
- 前端 payload 與 Dify variables 命名完全一致。
- 對外 payload 不含內部角色、審批細節或 audit log 顯示內容。
- `risk_level` 可由 Risk Gate 上修，不得因前端傳低風險而忽略高風險文字。
- `mock_data_source` 不得出現正式核心系統名稱。

