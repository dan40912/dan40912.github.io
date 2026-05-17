# 國泰金融 Demo FAQ 知識庫

最後檢查日：2026-05-17

這個資料夾提供 `internal/index.html` 產業別入口使用。每份 Markdown 對應一個 `business_line`，內容以內部客服、RM、專員可直接使用為主，不是官網全文備份。

## 對齊文件

`chatbot_alignment_flow.md` 是 Chatbot prompt / workflow 對齊用主文件，包含完整 flow、8 個產業各 3 組真實問答、不可回答邊界與 QA 驗收規則。

## 檔案對照

| business_line | 檔案 | 適用 |
| --- | --- | --- |
| banking | `banking.md` | 帳戶、登入、轉帳、存款、不明資金 |
| life_insurance | `life_insurance.md` | 保單、理賠、保單借款、保單價值 |
| securities | `securities.md` | 開戶、下單、交割、複委託、融資融券 |
| asset_management | `asset_management.md` | 基金、淨值、申購贖回、風險等級 |
| credit_card | `credit_card.md` | 帳單、繳款、爭議款、疑似盜刷 |
| loan | `loan.md` | 房貸、信貸、車貸、利率、補件進度 |
| wealth_management | `wealth_management.md` | 產品資訊、投資屬性、預約專員 |
| general_finance | `general_finance.md` | 業別不明或跨業別問題 |

## 頁面使用對照

`internal/index.html` 直接依 `business_line` 對應 8 份 FAQ。

`external/index.html` 以客服情境對應 FAQ：

| external service | FAQ |
| --- | --- |
| 帳戶登入協助 | `banking.md` |
| 複委託交割時間 | `securities.md` |
| 理賠文件確認 | `life_insurance.md` |
| 疑似盜刷處理 | `credit_card.md` |
| 房貸補件進度 | `loan.md` |
| 疑似詐騙轉帳 | `general_finance.md` |

## 建議 RAG 切分方式

- 以二級標題 `##` 作為主要切片。
- 保留 YAML frontmatter，讓檢索可以用 `business_line` 過濾。
- 優先檢索同 business_line 文件；若無法判斷，先檢索 `general_finance.md`。
- 回答時優先引用「可直接回答」「建議話術」「不可回答」「需要轉接」四個區塊。

## 回答品質規則

- 先分類，再回答。
- 涉及交易、個資、卡片、保單、貸款審核、投資建議時，先確認身份與風險邊界。
- 不要承諾理賠、核貸、報酬、個股漲跌或交易結果。
- 客戶要的是「可以直接說出口的版本」，回答應短、明確、像真人客服。
