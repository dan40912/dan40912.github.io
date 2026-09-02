# Sources

資料使用原則：以下公開資料判讀截至 2026-07-03。未公開的內部系統、權限、回滾、模型版本與事故處理流程，一律在提案中標示為推論或待驗證，不作事實宣稱。

## Cathay / 阿發 / GAIA

- Cathay Holdings, `AI代理時代已至！國泰金控以GAIA 2.0框架加速AI應用百花齊放`
  https://www.cathayholdings.com/holdings/brand/fintech/ctc/trends/copy-of-1205cid-1
  用途：GAIA 2.0、200 種資料類別知識庫、50 多種模型 Model Hub、70 道安全護欄、Multi-Agent 方向。

- 國泰世華 CUBE, `升級版國泰世華智能助理阿發`
  https://www.cathay-cube.com.tw/cathaybk/personal/digital-service/intro/chatbot
  用途：升級版阿發採用生成式 AI、以國泰世華官網資訊為資料庫、可對回覆讚/倒讚並聯繫真人客服。

- iThome, `國泰金控智能客服再進化，新增三維意圖架構讓「阿發」更聰明`
  https://www.ithome.com.tw/news/139777
  用途：銀行端 5 成以上客服需求透過 Chatbot、銀行加人壽每月 80-90 萬人次、三維意圖架構。

- Cathay Holdings, `國泰智能客服「阿發」海內外獲雙獎肯定`
  https://www.cathayholdings.com/holdings/information-centre/intro/latest-news/detail?news=9Q3PAgPOxUWpwNhmNk3mrg
  用途：阿發早期通路、使用次數、滿意度與人機協同描述。

## Competitors

- DBS, `digibot - Singapore`
  https://www.dbs.com.sg/personal/deposits/bank-with-ease/digibot
  用途：DBS digibot 可處理 pending transactions、cheque status、reward points、loan application 等交易/查詢需求。

- DBS Newsroom, `DBS rolls out Gen AI-powered chatbot to all corporate clients`
  https://www.dbs.com/newsroom/DBS_rolls_out_Gen_AI_powered_chatbot_to_all_corporate_clients
  用途：DBS Joy 作為企業客戶 24/7 GenAI virtual agent。

- DBS Newsroom, `DBS empowers its Customer Service Officers with Gen AI-powered virtual assistant`
  https://www.dbs.com/newsroom/DBS_empowers_its_Customer_Service_Officers_with_Gen_AI_powered_virtual_assistant_to_reduce_toil_and_enhance_customer_experience
  用途：CSO Assistant 目標降低 call handling time 20%，作為客服內部助理標竿。

- HSBC, `HSBC and AI`
  https://www.hsbc.com/who-we-are/hsbc-and-digital/hsbc-and-ai
  用途：HSBC 對 ethical / responsible AI、風險管理與客戶服務的公開定位。

- 中國信託, `AI智能客服小C`
  https://webchat.ctbcbank.com/webchat/index
  用途：本地銀行智能客服服務範圍與成熟度參考。

- 玉山銀行, `客服小玉`
  https://robot.esunbank.com.tw/
  用途：本地智能客服對照。

- Yahoo 股市, `金融AI智能客服解答率逾九成`
  https://tw.stock.yahoo.com/news/%E9%87%91%E8%9E%8Dai%E6%99%BA%E8%83%BD%E5%AE%A2%E6%9C%8D-%E8%A7%A3%E7%AD%94%E7%8E%87%E9%80%BE%E4%B9%9D%E6%88%90-201000574.html
  用途：本地銀行智能客服服務量、解答率、滿意度等市場同質化背景。

## 由原專案 demo 推論的內容（非公開資料）

以下判斷來自閱讀本 repo 的 `external/`、`internal/`、`mock-data-overview.html`、`faqs/`、`dify-dsl/` 原始碼。它們代表提案者（本專案作者）的設計意圖，**不代表國泰內部系統的實際狀態**：

- 風險三級分級（一般 / 注意 / 高風險）與各情境的禁止提問清單。
- 各業別「同仁可說 / 先確認 / 不可說」與「客戶回覆 / 轉真人條件」的邊界契約。
- 三路線漸進升級設計（自助排除 → 複雜狀況 → 高風險轉接）與 Dify route_stage 對應。
- Dify payload 欄位設計（business_line、service_id、risk_level、mock_data_summary 等）。
- 「回答層無 citation、無審計事件流、無修正回流路徑」是對 demo 現狀的觀察，據此推論為提案切入點；國泰內部是否已有同類機制屬待驗證。
