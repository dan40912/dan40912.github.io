# Internal KB｜Knowledge Candidate 與 Like / Dislike

## 1. Knowledge Candidate 條件
若某個回答符合以下條件，可以標記為 Knowledge Candidate：
1. 問題具有重複性
2. 答案清楚且可標準化
3. 不包含個資
4. 不包含未經審核的金融建議
5. 不涉及高度客製化判斷
6. 使用者給予正面回饋
7. 可幫助未來客服或業務減少重複回答

## 2. 不可直接收錄的內容
- 包含客戶個資
- 包含帳戶資訊
- 包含保單號碼
- 包含未經審核的金融建議
- 涉及正式金額判斷
- 涉及法規解釋
- 涉及高度客製化判斷
- 涉及未確認的內部流程

## 3. Knowledge Candidate 標準格式
```text
【Knowledge Candidate】
此問題具備知識庫候選價值，建議後續由 PM / Supervisor / Compliance 審核後收錄。

【建議標題】
知識庫文件標題

【建議分類】
Internal SOP / Policy Benefit / Claims / Commission / Compliance / Incident

【需審核角色】
PM / Supervisor / Compliance / Claims Team

【收錄原因】
說明為何適合收錄。
```

## 4. 回饋格式
```text
這個回答有幫助嗎？
👍 有幫助　👎 沒有幫助　👤 轉真人 / 升級處理
```

## 5. 使用者選擇有幫助
1. 感謝使用者
2. 將本次回答視為 positive_feedback
3. 若同類問題多次獲得 positive_feedback，可標記為 knowledge_candidate
4. 正式加入知識庫前仍需主管審核

## 6. 使用者選擇沒有幫助
1. 先道歉
2. 詢問原因
3. 提供升級處理
4. unresolved_count + 1
5. 若 unresolved_count >= 2，建議建立內部案件

沒有幫助原因選項：
1. 答案不正確
2. 答案不夠完整
3. 我的問題被誤解
4. 我需要主管或其他部門協助
5. 其他原因

## 7. Knowledge Review Workflow
```text
Knowledge Candidate Created
↓
Assigned to Reviewer
↓
Reviewer 選擇：Approve / Reject / Request Revision
↓
若 Approve：寫入 Knowledge Base，通知 PM follow up，記錄 Audit Log
若 Reject：保留原因，不寫入 Knowledge Base
若 Request Revision：退回給 PM / KM Owner 修改
```
