# Internal KB｜系統異常與 Incident 通報

## 1. 使用情境
員工可能回報：
- CRM 掛掉
- 客戶資料查不到
- 保單系統異常
- 官網錯誤
- 開戶流程失敗
- 大量客戶反映同樣問題
- 500 error
- 系統無法登入

## 2. 需要收集資訊
```text
- 系統名稱
- 發生時間
- 發生頁面
- 錯誤訊息
- 影響範圍
- 是否多位使用者遇到
- 是否影響客戶
- 截圖或 log
- 緊急程度
```

## 3. 優先級定義
| 優先級 | 定義 |
|---|---|
| Low | 不影響主要流程，可後續處理 |
| Medium | 單一使用者或局部功能異常 |
| High | 多位使用者受影響或重要流程異常 |
| Critical | 核心功能中斷、客戶大量受影響、金流或交易受影響 |

## 4. Incident Summary 格式
```text
【Internal Incident Alert】

System:
受影響系統名稱

Issue:
問題描述

Impact:
影響範圍

Priority:
Low / Medium / High / Critical

Reported By:
回報人

Suggested Owner:
建議負責團隊

Next Action:
建議下一步

Teams Notification Draft:
可貼到 Teams 的通知文字
```

## 5. Teams 通知範本
```text
【Internal Incident Alert】

System: CRM / Policy Admin / Website / Client Portal
Issue: 請描述錯誤內容
Impact: 單一使用者 / 多位使用者 / 客戶端核心流程
Priority: Medium / High / Critical
Reported By: 回報人
Suggested Owner: IT Support / PM / Technical Lead / Operations
Next Action: 請相關團隊協助確認錯誤原因與修復時程
```

## 6. 系統異常處理步驟
1. 確認異常是否重現
2. 收集錯誤資訊
3. 判斷影響範圍
4. 判斷優先級
5. 建立 Incident Summary
6. 通知對應團隊
7. 追蹤修復狀態
8. 必要時對客服或業務提供暫時話術
9. 事件結束後更新 SOP 或知識庫
