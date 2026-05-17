# PM Review and QA Acceptance

## PM Findings

### Fixed

1. Internal header had two visible buttons with no demo behavior.
   - Fix: `使用者設定` now opens a compact user permission summary.
   - Fix: `登出` now simulates demo logout, closes the chatbot panel, and updates the user chip.

2. External handoff could create repeated transfer messages for the same case.
   - Fix: after a case is created, clicking transfer again shows the existing case is already processing instead of adding duplicate chat lines.

3. Internal Call Center allowed governance steps out of order.
   - Fix: supervisor approval requires a pending approval request.
   - Fix: rejection only works when there is a pending approval request.
   - Fix: high-risk replies stay blocked until approved.
   - Fix: cases cannot be closed before a customer reply is recorded.
   - Fix: knowledge base publishing requires both supervisor approval and prior knowledge review.

## QA Scope

### Entry

- Open `index.html`.
- Click `對外客戶服務`; it must open `external/index.html`.
- Click `對內工作台`; it must open `internal/index.html`.
- No horizontal overflow on desktop or mobile width.

### Internal Industry Page

- Click each industry card.
- Expected:
  - Selected card is visually clear.
  - Right panel title, description, preset questions, risk note, and payload update.
  - `查看 FAQ` opens the matching markdown file in a new tab.
  - `複製 inputs` copies the current payload.
  - `開啟 Chatbot` reveals the iframe panel.
  - `使用者設定` opens the user popover.
  - `登出` changes the chip to `Demo 已登出` and hides the chatbot panel.

### External Customer Page

- Click each service card.
- Expected:
  - Selected card is visually clear.
  - Three preset questions match the selected service.
  - Copy button copies only the selected question.
  - `轉真人處理` creates one case number and appends one transfer message.
  - Clicking `轉真人處理` again does not duplicate the transfer message.
  - `補充說明` requires non-empty text and does not ask for sensitive data.
  - `查看進度` changes status without exposing internal approvals or roles.

### Internal Call Center

- Select a high-risk case.
- Expected:
  - `回覆客戶` is disabled until approval is granted.
  - `主管批准` is disabled until `送出批准` is clicked.
  - `退回補充` is disabled unless approval is pending.
  - `結案` is disabled until customer reply is sent.
  - `發布到知識庫` is disabled until approval is granted and the candidate has been sent for review.
  - Every successful action adds an audit log.

### Accessibility and UX

- Keyboard tab focus must be visible on cards, buttons, links, and text areas.
- Hover states must be visible but not shift layout.
- Toast messages must appear for all important actions.
- Reduced motion preference should minimize animation.

## Demo Acceptance Criteria

- The flow can be shown in under 5 minutes:
  1. Entry page.
  2. External customer asks a sharp issue.
  3. Customer transfers to human.
  4. Internal user opens Call Center.
  5. Agent takes the case.
  6. High-risk response goes through approval.
  7. Agent replies, creates a knowledge candidate, and closes the case.

- No page contains an obvious fake button.
- No customer-facing page exposes internal roles, approval rules, or audit logs.
- All core actions create visible state changes.
