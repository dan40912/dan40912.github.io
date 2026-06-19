/**
 * Resume-Mentor Wizard 設定檔
 * 所有問題、選項、Agent 規則、prompt 模板都集中在這裡。
 * 選項對應 docs/ 與 skills/ 既有定義（resume-challenger / interview-simulator / skill library）。
 * 每個會進 prompt 的項目都有 promptZh / promptEn 雙語鏡像。
 */
window.RM_CONFIG = {
  /* ---------- UI 文案（繁中） ---------- */
  ui: {
    brand: "Resume-Mentor",
    title: "職涯顧問中心",
    subtitle: "選目標、挑顧問、看每位顧問的真實規則，產出一段可直接複製的工作流提示詞。",
    next: "下一步",
    prev: "上一步",
    restart: "重新開始",
    generate: "完成，產生提示詞 →",
    copy: "📋 一鍵複製提示詞",
    copied: "✅ 複製好了！",
    resultTitle: "✅ 已完成分析",
    resultHint: "你的提示詞已準備好。先看拆解好的區塊，再複製貼給 Claude、ChatGPT 或任何你習慣的 AI；想更精準，回上一步調整再產生一次。",
    reinterview: "🔄 重新訪談",
    viewSample: "📄 查看成果範例",
    backEdit: "← 回上一步調整",
    // 重新開始確認
    restartTitle: "確定重新開始？",
    restartBody: "目前回答內容將被清除，無法復原。",
    restartCancel: "取消",
    restartConfirm: "重新開始",
    // 進度 / 剩餘時間
    startHint: "第 1 步 · 先選路線",
    etaMin: "約剩 {m} 分鐘",
    etaUnder1: "不到 1 分鐘",
    etaLeft: "剩下 {n} 題",
    // 範例 modal
    sampleTitle: "成果範例（AI 實際會產出的樣子）",
    sampleClose: "關閉",
    langLabel: "提示詞語言",
    langZh: "繁體中文",
    langEn: "English",
    required: "請至少選擇一項",
    otherPlaceholder: "請輸入…",
    step: "步驟",
    of: "/",
  },

  /* ---------- 每一步的小提示（友善 hint） ---------- */
  hints: {
    goal: "不用想太多，先選你今天最想搞定的那條路線。之後隨時可以回來換，不會弄丟你填過的東西。",
    sourcePack: "把你手上真的有的材料勾出來就好，後面提示詞會自動對齊，不需要一次整理完。",
    goalOutcome: "先選你這次最想拿到的結果，這會影響提示詞的輸出格式與顧問分工。",
    agents: "上面是審查角色、下面是各領域專家。不知道選誰？按一下「✨ 加入推薦角色」就好，我們會依你的路線與目標幫你配一組。",
    wireframe: "把每一種點開看看，挑一個最接近你心裡那個樣子的就好，沒有標準答案。",
    // CV
    status: "誠實選就好，這只是幫我們抓對方向，不是在評分你。",
    problems: "想到幾個就選幾個——你勾的這些，正是我們等下會幫你重點處理的地方。",
    formats: "不確定的話，先選「ATS 友善版」最保險，大多數線上投遞都吃這套。",
    hasJD: "手邊有職缺說明（JD）的話，結果會精準很多；沒有也完全沒問題，一樣能用。",
    tone: "想被溫柔鼓勵，還是被狠狠點醒？沒有對錯，看你今天想怎麼被對待。",
    // Interview
    rounds: "不確定會考哪一關？把有可能的都勾起來，多準備不吃虧。",
    company: "不同公司的考官風格差很多，挑一個最接近你目標的就好。",
    weakSpots: "挑你最沒把握、最容易卡住的——我們會多花一點力氣陪你練。",
    mode: "想自己先開口試講，還是先看看好的範例長怎樣？都可以。",
    lang: "用你面試當下真的會講的語言來練，效果最好。",
    // 共用
    wants: "想要什麼就勾什麼，可以全都要，我們一次幫你準備齊。",
    industry: "選最貼近你現在、或你想去的那個產業。",
    jobFamily: "填你想投的方向就好，不一定要是你現在的職稱。",
    seniority: "以你「想應徵」的職級為準，不是現在的職位。",
    tone: "想被溫和鼓勵，還是被狠狠點醒？沒有對錯，看你今天想怎麼被對待。",
    // LinkedIn
    profileState: "LinkedIn 不只是履歷搬過去。先選你目前的狀態，後面我們會決定要先修 headline、about，還是 experience。",
    linkedinFocus: "先選你想讓誰看到你，再決定要強化哪一塊內容。",
    linkedinAudience: "不同受眾會影響 headline、about 和 featured section 的寫法。",
    // 推薦信
    relationship: "推薦文最怕空泛，先選你和推薦人的關係，後面才能判斷語氣和可信度。",
    recommendationUseCase: "先選這份推薦要拿去做什麼，格式和說法會不一樣。",
    recommendationEvidence: "挑幾個推薦人真的看過、真的能說的證據點，可信度會高很多。",
    // 適性測驗
    assessmentType: "這不是心理測驗，而是把能力、證據和角色適配拆開來看。",
    assessmentFocus: "先選最想補的缺口，我們會把問題和練習設計得更準。",
  },

  /* ---------- Step 0：你想預備什麼 ---------- */
  goals: [
    { id: "cv", label: "履歷 / CV", desc: "診斷、挖掘成就、改寫成有證據的履歷亮點。" },
    { id: "linkedin", label: "LinkedIn 頁面", desc: "優化標題、簡介、經歷與搜尋可見度。" },
    { id: "recommendation", label: "推薦文 / 推薦信", desc: "幫人寫、或請人幫你寫，產出有具體事例的可信推薦。" },
    { id: "assessment", label: "適性測驗", desc: "盤點能力、證據與角色適配，找出最適合的職涯方向。" },
    { id: "interview", label: "面試", desc: "模擬考官、出題評分、把經歷練成可面試的故事。" },
    { id: "website", label: "個人網站 / 作品集", desc: "選一種排版風格，產出個人網站的結構與文案。" },
    { id: "encourage", label: "打氣 / 陪你撐一下", desc: "卡關、被拒絕、懷疑自己的時候，找一群挺你的人，提醒你其實做得不錯。" },
    { id: "jobs", label: "職缺選擇", desc: "敬請期待。", disabled: true, comingSoon: true },
  ],

  /* ---------- 共用問題 ---------- */
  shared: {
    sourcePack: {
      id: "sourcePack",
      title: "你現在手上有哪些材料？",
      type: "multi",
      options: [
        { id: "resume", label: "履歷 / CV", promptZh: "履歷 / CV", promptEn: "Resume / CV" },
        { id: "linkedin", label: "LinkedIn 內容", promptZh: "LinkedIn 內容", promptEn: "LinkedIn content" },
        { id: "jd", label: "職缺說明（JD）", promptZh: "職缺說明 (JD)", promptEn: "Job description (JD)" },
        { id: "notes", label: "工作筆記 / 成就素材", promptZh: "工作筆記／成就素材", promptEn: "Work notes / achievement materials" },
        { id: "refs", label: "推薦人 / 介紹人素材", promptZh: "推薦人／介紹人素材", promptEn: "Referrer / recommender notes" },
        { id: "review", label: "績效回饋 / 主管評語", promptZh: "績效回饋／主管評語", promptEn: "Performance feedback / manager notes" },
      ],
    },
    goalOutcome: {
      id: "goalOutcome",
      title: "這次最重要的輸出是什麼？（可多選）",
      type: "multi",
      options: [
        { id: "diagnosis", label: "先診斷，不急著改寫", promptZh: "先診斷，不急著改寫", promptEn: "Diagnose first, no rewrite yet" },
        { id: "rewrite", label: "直接產出可用稿", promptZh: "直接產出可用稿", promptEn: "Generate usable draft" },
        { id: "search", label: "提高可搜尋與可被找到", promptZh: "提高可搜尋與可被找到", promptEn: "Improve discoverability" },
        { id: "proof", label: "補強證據與可信度", promptZh: "補強證據與可信度", promptEn: "Strengthen evidence and credibility" },
        { id: "practice", label: "整理成練習或演練題", promptZh: "整理成練習或演練題", promptEn: "Turn into practice / drill questions" },
        { id: "roadmap", label: "做成下一步行動計畫", promptZh: "做成下一步行動計畫", promptEn: "Turn into an action roadmap" },
      ],
    },
    industries: {
      id: "industry",
      title: "你的產業背景是？",
      type: "single",
      allowOther: true,
      options: [
        { id: "finance", label: "金融 / 銀行", promptZh: "金融／銀行", promptEn: "Finance / Banking" },
        { id: "crypto", label: "加密 / Web3", promptZh: "加密貨幣／Web3", promptEn: "Crypto / Web3" },
        { id: "tech", label: "科技 / 軟體", promptZh: "科技／軟體", promptEn: "Technology / Software" },
        { id: "retail", label: "電商 / 零售", promptZh: "電商／零售", promptEn: "E-commerce / Retail" },
        { id: "service", label: "服務 / 餐旅", promptZh: "服務／餐旅", promptEn: "Service / Hospitality" },
        { id: "manufacturing", label: "製造 / 硬體", promptZh: "製造／硬體", promptEn: "Manufacturing / Hardware" },
        { id: "healthcare", label: "醫療 / 生技", promptZh: "醫療／生技", promptEn: "Healthcare / Biotech" },
        { id: "consulting", label: "顧問 / 專業服務", promptZh: "顧問／專業服務", promptEn: "Consulting / Professional Services" },
        { id: "marketing", label: "行銷 / 媒體", promptZh: "行銷／媒體", promptEn: "Marketing / Media" },
        { id: "education", label: "教育", promptZh: "教育", promptEn: "Education" },
        { id: "gov", label: "政府 / NGO", promptZh: "政府／NGO", promptEn: "Government / NGO" },
        { id: "compliance", label: "合規 / 風控 / AML / KYC", promptZh: "合規／風控／AML／KYC", promptEn: "Compliance / Risk / AML / KYC" },
      ],
    },
    jobFamilies: {
      id: "jobFamily",
      title: "你想投的職能類型是？",
      type: "single",
      allowOther: true,
      options: [
        { id: "pm", label: "產品 (PM)", promptZh: "產品經理 (PM)", promptEn: "Product Manager (PM)" },
        { id: "swe", label: "軟體工程", promptZh: "軟體工程", promptEn: "Software Engineering" },
        { id: "design", label: "設計 (UX/UI)", promptZh: "設計 (UX/UI)", promptEn: "Design (UX/UI)" },
        { id: "data", label: "資料 / 分析", promptZh: "資料／分析", promptEn: "Data / Analytics" },
        { id: "growth", label: "行銷 / 成長", promptZh: "行銷／成長", promptEn: "Marketing / Growth" },
        { id: "sales", label: "業務 / BD", promptZh: "業務／BD", promptEn: "Sales / BD" },
        { id: "ops", label: "營運 / 專案管理", promptZh: "營運／專案管理", promptEn: "Operations / Project Management" },
        { id: "compliance", label: "合規 / 風控 / AML / KYC", promptZh: "合規／風控／AML／KYC", promptEn: "Compliance / Risk / AML / KYC" },
        { id: "finance", label: "財務 / 會計", promptZh: "財務／會計", promptEn: "Finance / Accounting" },
        { id: "hr", label: "人資", promptZh: "人資", promptEn: "Human Resources" },
        { id: "exec", label: "高階主管", promptZh: "高階主管 (Director/VP/C-level)", promptEn: "Executive (Director/VP/C-level)" },
        { id: "founder", label: "創業 / Founder", promptZh: "創業／Founder", promptEn: "Founder / Entrepreneur" },
      ],
    },
    seniorities: {
      id: "seniority",
      title: "你的年資 / 目標職級是？",
      type: "single",
      options: [
        { id: "grad", label: "學生 / 新鮮人 (0–1 年)", promptZh: "學生／新鮮人 (0–1 年)", promptEn: "Student / New Grad (0–1 yrs)" },
        { id: "junior", label: "初階 (1–3 年)", promptZh: "初階 (1–3 年)", promptEn: "Junior (1–3 yrs)" },
        { id: "mid", label: "中階 (3–7 年)", promptZh: "中階 (3–7 年)", promptEn: "Mid-level (3–7 yrs)" },
        { id: "senior", label: "資深 (7–12 年)", promptZh: "資深 (7–12 年)", promptEn: "Senior (7–12 yrs)" },
        { id: "manager", label: "主管 / 經理", promptZh: "主管／經理", promptEn: "Manager" },
        { id: "director", label: "總監以上", promptZh: "總監以上 (Director/VP/C-level)", promptEn: "Director+ (Director/VP/C-level)" },
      ],
    },
    tone: {
      id: "tone",
      title: "希望 AI 用什麼強度挑戰你？",
      type: "single",
      options: [
        { id: "gentle", label: "溫和引導（鼓勵為主）", promptZh: "語氣溫和、以鼓勵與引導為主", promptEn: "Gentle, encouraging and guiding tone" },
        { id: "standard", label: "標準顧問（中立專業）", promptZh: "中立專業的顧問語氣", promptEn: "Neutral, professional consultant tone" },
        { id: "harsh", label: "毒舌面試官（嚴格找弱點）", promptZh: "嚴格直接，主動找出弱點與風險（毒舌面試官）", promptEn: "Strict and blunt, actively hunting weaknesses (devil's advocate)", forceAgent: "devil" },
      ],
    },
  },

  /* ---------- CV 路徑問題 ---------- */
  cv: {
    questions: [
      {
        id: "status",
        title: "你目前履歷的狀態？",
        type: "single",
        options: [
          { id: "polish", label: "已有完整履歷，想優化", promptZh: "已有完整履歷，想優化", promptEn: "Has a complete resume, wants to optimize" },
          { id: "stale", label: "有舊履歷、很久沒更新", promptZh: "有舊履歷但久未更新", promptEn: "Has an outdated resume" },
          { id: "fragments", label: "只有零散工作經歷，還沒整理", promptZh: "只有零散工作經歷，尚未整理成履歷", promptEn: "Only scattered work notes, not yet a resume" },
          { id: "scratch", label: "完全從零開始（剛畢業 / 轉職）", promptZh: "從零開始（新鮮人或轉職）", promptEn: "Starting from scratch (new grad or career switch)" },
        ],
      },
      {
        id: "problems",
        title: "你最想解決的履歷問題？（可多選）",
        type: "multi",
        options: [
          { id: "value", label: "經歷像職責清單，寫不出成果", promptZh: "經歷像職責清單，缺少商業價值", promptEn: "Bullets read like job duties, missing business value" },
          { id: "trim", label: "不知道哪些該寫、哪些該刪", promptZh: "不確定內容取捨（該保留／刪除什麼）", promptEn: "Unsure what to keep vs. cut" },
          { id: "metrics", label: "沒有量化數據 / 證據", promptZh: "缺少量化數據與證據", promptEn: "Missing metrics and evidence" },
          { id: "jd", label: "不確定有沒有對齊目標職缺 JD", promptZh: "不確定是否對齊目標職缺 (JD mismatch)", promptEn: "Unsure if aligned with the target job description" },
          { id: "ats", label: "擔心 ATS 篩選看不到我", promptZh: "擔心 ATS 解析與關鍵字", promptEn: "Worried about ATS parsing and keywords" },
          { id: "redflag", label: "有空窗 / 轉職 / 跳槽等紅旗要處理", promptZh: "有空窗、轉職或跳槽等紅旗需處理", promptEn: "Has red flags (gaps, switches, job hopping) to address" },
          { id: "english", label: "英文履歷語感 / 用詞不到位", promptZh: "英文履歷語感與用詞需加強", promptEn: "English wording / tone needs polishing" },
        ],
      },
      {
        id: "formats",
        title: "你想要的履歷版本？（可多選）",
        type: "multi",
        options: [
          { id: "ats", label: "ATS 友善版", promptZh: "ATS 友善版", promptEn: "ATS-friendly resume" },
          { id: "onepage", label: "一頁式精簡版", promptZh: "一頁式精簡版", promptEn: "One-page resume" },
          { id: "exec", label: "兩頁 / 資深主管版", promptZh: "兩頁／資深主管 (Executive) 版", promptEn: "Two-page / executive resume" },
          { id: "fresh", label: "新鮮人 / 少經驗版", promptZh: "新鮮人／少經驗版", promptEn: "New-grad / limited-experience resume" },
          { id: "transition", label: "轉職重新定位版", promptZh: "轉職重新定位版", promptEn: "Career-transition repositioning resume" },
          { id: "startup", label: "新創 Startup 版", promptZh: "新創 (Startup) 版", promptEn: "Startup resume" },
          { id: "zh", label: "中文履歷", promptZh: "中文履歷", promptEn: "Chinese resume" },
          { id: "en", label: "英文履歷", promptZh: "英文履歷", promptEn: "English resume" },
        ],
      },
      {
        id: "hasJD",
        title: "你有目標職缺 JD 可以貼上嗎？",
        type: "single",
        options: [
          { id: "yes", label: "有，我會貼完整 JD（最精準）", promptZh: "會提供完整目標 JD", promptEn: "Will provide the full target job description" },
          { id: "rough", label: "有大概方向但沒有具體 JD", promptZh: "只有大致方向、無具體 JD", promptEn: "Has a rough direction but no specific JD" },
          { id: "no", label: "還不確定要投哪個職位", promptZh: "尚未確定目標職位", promptEn: "Target role not yet decided" },
        ],
      },
      {
        id: "wants",
        title: "目前最想要的產出？（可多選）",
        type: "multi",
        options: [
          { id: "diagnosis", label: "履歷診斷報告（先別改寫，先找問題）", promptZh: "履歷診斷報告（先診斷、暫不改寫）", promptEn: "A resume diagnosis report (diagnose first, no rewrite yet)" },
          { id: "rewrite", label: "改寫後的 bullet（含 before/after）", promptZh: "改寫後的 bullet，含 before/after 對照", promptEn: "Rewritten bullets with before/after" },
          { id: "evidence", label: "缺失證據清單 + 該補的追問", promptZh: "缺失證據清單與需補充的追問", promptEn: "A list of missing evidence and follow-up questions" },
          { id: "talking", label: "對應面試的 talking points", promptZh: "可延伸到面試的 talking points", promptEn: "Interview talking points derived from the resume" },
        ],
      },
    ],
  },

  /* ---------- Interview 路徑問題 ---------- */
  interview: {
    questions: [
      {
        id: "rounds",
        title: "要準備哪種面試關卡？（可多選）",
        type: "multi",
        options: [
          { id: "recruiter", label: "Recruiter 電話初篩", promptZh: "Recruiter 電話初篩", promptEn: "Recruiter phone screen" },
          { id: "hm", label: "用人主管面試", promptZh: "用人主管 (Hiring Manager) 面試", promptEn: "Hiring manager interview" },
          { id: "behavioral", label: "行為面試（STAR）", promptZh: "行為面試 (STAR)", promptEn: "Behavioral interview (STAR)" },
          { id: "leadership", label: "領導力面試", promptZh: "領導力面試", promptEn: "Leadership interview" },
          { id: "product", label: "產品思維面試", promptZh: "產品思維 (Product Sense) 面試", promptEn: "Product sense interview" },
          { id: "system", label: "技術 / 系統設計面試", promptZh: "技術／系統設計面試", promptEn: "Technical / system design interview" },
          { id: "exec", label: "高層 / 終面", promptZh: "高層／終面 (Final Round)", promptEn: "Executive / final round" },
          { id: "bar", label: "壓力面試（Bar Raiser 嚴格追問）", promptZh: "壓力面試 (Bar Raiser 嚴格追問)", promptEn: "Bar raiser / high-pressure interview" },
        ],
      },
      {
        id: "company",
        title: "目標公司類型 / 風格？",
        type: "single",
        options: [
          { id: "google", label: "大型科技（Google 風）", promptZh: "大型科技公司（Google 風：結構化思考、tradeoff、scale）", promptEn: "Big tech (Google-style: structured thinking, tradeoffs, scale)" },
          { id: "amazon", label: "美式電商 / 雲端（Amazon 風）", promptZh: "美式電商／雲端（Amazon Bar Raiser：ownership、customer obsession）", promptEn: "US e-commerce/cloud (Amazon Bar Raiser: ownership, customer obsession)" },
          { id: "binance", label: "金融 / 加密 / Fintech（Binance 風）", promptZh: "金融／加密／Fintech（Binance 風：速度、風險、合規、模糊中 ownership）", promptEn: "Finance/crypto/fintech (Binance-style: speed, risk, compliance, ownership under ambiguity)" },
          { id: "startup", label: "新創（Startup Founder 風）", promptZh: "新創（Startup Founder：資源有限下的執行、zero-to-one）", promptEn: "Startup (founder-style: execution with few resources, zero-to-one)" },
          { id: "exec", label: "高階獵頭 / Executive", promptZh: "高階獵頭／Executive（市場定位、商業影響、薪酬說服力）", promptEn: "Executive search (positioning, business impact, comp justification)" },
          { id: "general", label: "一般企業（標準專業面試）", promptZh: "一般企業（標準專業面試）", promptEn: "General company (standard professional interview)" },
        ],
      },
      {
        id: "weakSpots",
        title: "你最想練 / 最弱的環節？（可多選）",
        type: "multi",
        options: [
          { id: "intro", label: "自我介紹（30 秒 / 1 分 / 3 分）", promptZh: "自我介紹（30 秒／1 分／3 分版本）", promptEn: "Self-introduction (30s / 1min / 3min)" },
          { id: "star", label: "把經歷講成 STAR 故事", promptZh: "把經歷整理成 STAR 故事", promptEn: "Framing experience into STAR stories" },
          { id: "failure", label: "談失敗 / 弱點不扣分", promptZh: "談失敗／弱點而不扣分", promptEn: "Answering failure/weakness without losing credibility" },
          { id: "conflict", label: "領導與衝突處理故事", promptZh: "領導與衝突處理故事", promptEn: "Leadership and conflict-resolution stories" },
          { id: "product", label: "產品 / 商業判斷題", promptZh: "產品／商業判斷題", promptEn: "Product / business judgment questions" },
          { id: "why", label: "為什麼想離職 / 轉職", promptZh: "為什麼離職／轉職", promptEn: "Why leaving / switching" },
          { id: "salary", label: "薪資談判", promptZh: "薪資談判", promptEn: "Salary negotiation" },
          { id: "followup", label: "被追問時答不下去（follow-up 抗壓）", promptZh: "被追問時的抗壓 (follow-up resilience)", promptEn: "Resilience under follow-up questions" },
        ],
      },
      {
        id: "wants",
        title: "你希望 AI 給你什麼？（可多選）",
        type: "multi",
        options: [
          { id: "ask", label: "出題並說明考官在測什麼", promptZh: "出題並說明考官在測什麼", promptEn: "Ask questions and explain what the interviewer is testing" },
          { id: "score", label: "幫我評分（1–5）並指出弱點", promptZh: "對我的答案評分 (1–5) 並指出弱點", promptEn: "Score my answers (1–5) and identify weaknesses" },
          { id: "model", label: "直接給更強的範例答案", promptZh: "提供更強的範例答案", promptEn: "Provide stronger model answers" },
          { id: "mock", label: "模擬完整多輪面試流程", promptZh: "模擬完整多輪面試 (Round 1–5)", promptEn: "Run a full multi-round mock interview (Round 1–5)" },
          { id: "followups", label: "列出可能的追問題", promptZh: "列出可能的追問題 (follow-up)", promptEn: "List likely follow-up questions" },
          { id: "bank", label: "整理成可背誦的故事庫", promptZh: "整理成可背誦的故事庫", promptEn: "Compile a memorizable story bank" },
        ],
      },
      {
        id: "mode",
        title: "練習模式？",
        type: "single",
        options: [
          { id: "interactive", label: "我先答、AI 再點評（互動式）", promptZh: "互動式：我先回答，AI 再點評與評分", promptEn: "Interactive: I answer first, then AI critiques and scores" },
          { id: "demo", label: "AI 直接示範強答案（參考學）", promptZh: "AI 直接示範強答案供我學習", promptEn: "AI demonstrates strong answers for me to learn from" },
          { id: "bank", label: "出整套題庫讓我自己練", promptZh: "產出整套題庫讓我自行練習", promptEn: "Generate a full question bank for self-practice" },
        ],
      },
      {
        id: "lang",
        title: "面試語言？",
        type: "single",
        options: [
          { id: "zh", label: "中文面試", promptZh: "中文面試", promptEn: "Interview in Chinese" },
          { id: "en", label: "英文面試", promptZh: "英文面試", promptEn: "Interview in English" },
          { id: "mix", label: "中英混合", promptZh: "中英混合面試", promptEn: "Mixed Chinese/English interview" },
        ],
      },
    ],
  },

  /* ---------- Website 路徑（8 種版型，內建手繪 SVG 縮圖） ---------- */
  website: {
    wireframeQuestion: {
      id: "wireframe",
      title: "你想要哪一種版型？",
      type: "single",
    },
    wireframes: [
      {
        id: "classic", label: "經典單欄", desc: "大頭照在上、內容由上往下排，最好讀、最不會出錯。",
        promptZh: "經典單欄版面：頂部大頭照與標題，內容由上往下單欄排列",
        promptEn: "Classic single-column layout: photo and title on top, content flowing top-to-bottom",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="經典單欄"><rect x="6" y="6" width="188" height="138" rx="9" fill="#fff" stroke="#cdd6e1" stroke-width="1.5"/><circle cx="33" cy="33" r="13" fill="#c4cdd8"/><rect x="54" y="26" width="78" height="6" rx="3" fill="#d8dee8"/><rect x="54" y="38" width="50" height="5" rx="2.5" fill="#e9eef4"/><rect x="20" y="62" width="160" height="4.5" rx="2" fill="#d8dee8"/><rect x="20" y="74" width="146" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="86" width="154" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="104" width="120" height="4.5" rx="2" fill="#d8dee8"/><rect x="20" y="116" width="150" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="128" width="100" height="4.5" rx="2" fill="#e9eef4"/></svg>`,
      },
      {
        id: "sidebar", label: "雙欄側欄", desc: "左邊主內容、右邊側欄放技能或聯絡資訊，資訊量大也清爽。",
        promptZh: "雙欄側欄版面：主內容在左，右側側欄放技能、聯絡方式等",
        promptEn: "Two-column layout with a sidebar: main content on the left, skills/contact in a right sidebar",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="雙欄側欄"><rect x="6" y="6" width="188" height="138" rx="9" fill="#fff" stroke="#cdd6e1" stroke-width="1.5"/><circle cx="32" cy="30" r="11" fill="#5b8def"/><circle cx="32" cy="27" r="3.6" fill="#fff"/><rect x="50" y="23" width="74" height="6" rx="3" fill="#d8dee8"/><rect x="50" y="34" width="48" height="5" rx="2.5" fill="#e9eef4"/><rect x="20" y="50" width="160" height="5" rx="2.5" fill="#bcd3fb"/><rect x="20" y="66" width="96" height="4.5" rx="2" fill="#d8dee8"/><rect x="20" y="78" width="88" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="90" width="92" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="106" width="80" height="4.5" rx="2" fill="#bcd3fb"/><rect x="20" y="118" width="92" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="130" width="70" height="4.5" rx="2" fill="#e9eef4"/><rect x="128" y="62" width="52" height="76" rx="5" fill="#eef2f7"/><rect x="136" y="72" width="36" height="4" rx="2" fill="#cdd6e1"/><rect x="136" y="82" width="28" height="4" rx="2" fill="#dbe2ea"/><rect x="136" y="96" width="36" height="4" rx="2" fill="#cdd6e1"/><rect x="136" y="106" width="30" height="4" rx="2" fill="#dbe2ea"/><rect x="136" y="120" width="34" height="4" rx="2" fill="#dbe2ea"/></svg>`,
      },
      {
        id: "left-image", label: "左圖右文", desc: "左邊一張大圖、右邊文字說明，第一眼就有記憶點。",
        promptZh: "左圖右文版面：左側大圖，右側文字說明",
        promptEn: "Image-left / text-right layout: a large image on the left, text on the right",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="左圖右文"><rect x="6" y="6" width="188" height="138" rx="9" fill="#fff" stroke="#cdd6e1" stroke-width="1.5"/><rect x="16" y="16" width="62" height="118" rx="6" fill="#dbe2ea"/><circle cx="34" cy="46" r="6" fill="#c4cdd8"/><path d="M22 86 L40 64 L58 86 Z" fill="#c4cdd8"/><rect x="90" y="24" width="84" height="6" rx="3" fill="#d8dee8"/><rect x="90" y="36" width="56" height="5" rx="2.5" fill="#e9eef4"/><rect x="90" y="58" width="90" height="4.5" rx="2" fill="#e9eef4"/><rect x="90" y="70" width="84" height="4.5" rx="2" fill="#e9eef4"/><rect x="90" y="82" width="88" height="4.5" rx="2" fill="#e9eef4"/><rect x="90" y="100" width="70" height="4.5" rx="2" fill="#bcd3fb"/><rect x="90" y="112" width="86" height="4.5" rx="2" fill="#e9eef4"/><rect x="90" y="124" width="60" height="4.5" rx="2" fill="#e9eef4"/></svg>`,
      },
      {
        id: "designer", label: "設計師風格", desc: "圖片多、視覺強，適合設計、攝影、創意類作品集。",
        promptZh: "設計師風格版面：圖片多、視覺強，以作品圖塊為主",
        promptEn: "Visual designer layout: image-heavy, work tiles front and center",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="設計師風格"><rect x="6" y="6" width="188" height="138" rx="9" fill="#fff" stroke="#cdd6e1" stroke-width="1.5"/><rect x="16" y="16" width="168" height="34" rx="6" fill="#eef2f7"/><circle cx="36" cy="33" r="10" fill="#5b8def"/><rect x="54" y="27" width="70" height="6" rx="3" fill="#cdd6e1"/><rect x="54" y="38" width="44" height="4" rx="2" fill="#dbe2ea"/><rect x="16" y="60" width="38" height="44" rx="5" fill="#dbe2ea"/><rect x="58" y="60" width="38" height="44" rx="5" fill="#d8dee8"/><rect x="100" y="60" width="38" height="44" rx="5" fill="#dbe2ea"/><rect x="142" y="60" width="38" height="44" rx="5" fill="#d8dee8"/><circle cx="35" cy="82" r="6" fill="#bcd3fb"/><circle cx="161" cy="82" r="6" fill="#bcd3fb"/><rect x="16" y="116" width="120" height="4.5" rx="2" fill="#e9eef4"/><rect x="16" y="128" width="150" height="4.5" rx="2" fill="#e9eef4"/></svg>`,
      },
      {
        id: "timeline", label: "時間軸式", desc: "用一條時間線串起你的經歷，成長軌跡一目了然。",
        promptZh: "時間軸版面：以縱向時間線串連經歷，依時間呈現成長",
        promptEn: "Timeline layout: a vertical timeline connecting experiences chronologically",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="時間軸式"><rect x="6" y="6" width="188" height="138" rx="9" fill="#fff" stroke="#cdd6e1" stroke-width="1.5"/><line x1="40" y1="28" x2="40" y2="130" stroke="#cdd6e1" stroke-width="2"/><circle cx="40" cy="42" r="6" fill="#5b8def"/><circle cx="40" cy="80" r="6" fill="#bcd3fb"/><circle cx="40" cy="118" r="6" fill="#bcd3fb"/><rect x="56" y="36" width="100" height="5" rx="2.5" fill="#d8dee8"/><rect x="56" y="46" width="120" height="4.5" rx="2" fill="#e9eef4"/><rect x="56" y="74" width="92" height="5" rx="2.5" fill="#d8dee8"/><rect x="56" y="84" width="116" height="4.5" rx="2" fill="#e9eef4"/><rect x="56" y="112" width="96" height="5" rx="2.5" fill="#d8dee8"/><rect x="56" y="122" width="110" height="4.5" rx="2" fill="#e9eef4"/></svg>`,
      },
      {
        id: "cards", label: "卡片式作品集", desc: "一個個卡片陳列作品，點進去看細節，適合多專案。",
        promptZh: "卡片式作品集版面：作品以卡片網格呈現，每張可點入看細節",
        promptEn: "Card-grid portfolio layout: works shown as clickable cards in a grid",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="卡片式作品集"><rect x="6" y="6" width="188" height="138" rx="9" fill="#fff" stroke="#cdd6e1" stroke-width="1.5"/><rect x="20" y="20" width="90" height="6" rx="3" fill="#d8dee8"/><rect x="20" y="31" width="60" height="4" rx="2" fill="#e9eef4"/><rect x="20" y="46" width="78" height="44" rx="6" fill="#fff" stroke="#dbe2ea"/><rect x="28" y="54" width="62" height="18" rx="3" fill="#eef2f7"/><rect x="28" y="78" width="44" height="4" rx="2" fill="#dbe2ea"/><rect x="102" y="46" width="78" height="44" rx="6" fill="#fff" stroke="#dbe2ea"/><rect x="110" y="54" width="62" height="18" rx="3" fill="#eef2f7"/><rect x="110" y="78" width="44" height="4" rx="2" fill="#bcd3fb"/><rect x="20" y="96" width="78" height="44" rx="6" fill="#fff" stroke="#dbe2ea"/><rect x="28" y="104" width="62" height="18" rx="3" fill="#eef2f7"/><rect x="28" y="128" width="44" height="4" rx="2" fill="#dbe2ea"/><rect x="102" y="96" width="78" height="44" rx="6" fill="#fff" stroke="#dbe2ea"/><rect x="110" y="104" width="62" height="18" rx="3" fill="#eef2f7"/><rect x="110" y="128" width="44" height="4" rx="2" fill="#dbe2ea"/></svg>`,
      },
      {
        id: "dark", label: "深色主題", desc: "深色背景、高對比，沉穩有質感，工程師與創意人都愛。",
        promptZh: "深色主題版面：深色背景、高對比，沉穩有質感",
        promptEn: "Dark-theme layout: dark background, high contrast, sleek feel",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="深色主題"><rect x="6" y="6" width="188" height="138" rx="9" fill="#1f2733" stroke="#1f2733" stroke-width="1.5"/><circle cx="33" cy="33" r="13" fill="#3a4655"/><rect x="54" y="26" width="78" height="6" rx="3" fill="#e3e9f0"/><rect x="54" y="38" width="50" height="5" rx="2.5" fill="#5b6675"/><rect x="20" y="60" width="160" height="5" rx="2.5" fill="#4f8df7"/><rect x="20" y="74" width="150" height="4.5" rx="2" fill="#3a4655"/><rect x="20" y="86" width="158" height="4.5" rx="2" fill="#2f3a48"/><rect x="20" y="104" width="110" height="4.5" rx="2" fill="#3a4655"/><rect x="20" y="116" width="150" height="4.5" rx="2" fill="#2f3a48"/><rect x="20" y="128" width="96" height="4.5" rx="2" fill="#2f3a48"/></svg>`,
      },
      {
        id: "onepage", label: "單頁滾動", desc: "一頁到底、分段落往下捲，像個迷你個人網站。",
        promptZh: "單頁滾動版面：單頁長捲動、分段落呈現，像迷你個人網站",
        promptEn: "Single-page scrolling layout: one long page divided into scrolling sections",
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="單頁滾動"><rect x="6" y="6" width="188" height="138" rx="9" fill="#fff" stroke="#cdd6e1" stroke-width="1.5"/><path d="M6 15 a9 9 0 0 1 9 -9 h170 a9 9 0 0 1 9 9 v35 h-188 z" fill="#eef2f7"/><rect x="60" y="20" width="80" height="6" rx="3" fill="#cdd6e1"/><rect x="74" y="31" width="52" height="4" rx="2" fill="#dbe2ea"/><rect x="20" y="60" width="150" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="70" width="120" height="4.5" rx="2" fill="#e9eef4"/><rect x="20" y="88" width="46" height="26" rx="4" fill="#dbe2ea"/><rect x="77" y="88" width="46" height="26" rx="4" fill="#d8dee8"/><rect x="134" y="88" width="46" height="26" rx="4" fill="#dbe2ea"/><rect x="185" y="58" width="3" height="40" rx="1.5" fill="#cdd6e1"/><path d="M94 126 l6 6 l6 -6" stroke="#9aa6b4" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      },
    ],
  },

  /* ---------- LinkedIn 路徑問題 ---------- */
  linkedin: {
    questions: [
      {
        id: "profileState",
        title: "你目前的 LinkedIn 狀態？",
        type: "single",
        options: [
          { id: "empty", label: "幾乎空白 / 還沒整理", promptZh: "幾乎空白／還沒整理", promptEn: "Mostly empty / not yet organized" },
          { id: "resumeCopy", label: "直接把履歷貼上去", promptZh: "直接把履歷照貼上去", promptEn: "Copied resume with little adaptation" },
          { id: "outdated", label: "有內容，但很久沒更新", promptZh: "有內容，但很久沒更新", promptEn: "Has content but outdated" },
          { id: "strong", label: "基本完整，想再提升", promptZh: "基本完整，想再提升", promptEn: "Mostly complete, wants a stronger version" },
        ],
      },
      {
        id: "focus",
        title: "你最想先強化哪一塊？（可多選）",
        type: "multi",
        options: [
          { id: "headline", label: "Headline / 標題", promptZh: "Headline / 標題", promptEn: "Headline / title" },
          { id: "about", label: "About / 自我簡介", promptZh: "About / 自我簡介", promptEn: "About / summary" },
          { id: "experience", label: "Experience / 經歷", promptZh: "Experience / 經歷", promptEn: "Experience section" },
          { id: "skills", label: "Skills / 技能", promptZh: "Skills / 技能", promptEn: "Skills section" },
          { id: "featured", label: "Featured / 精選", promptZh: "Featured / 精選", promptEn: "Featured section" },
          { id: "search", label: "被搜尋到", promptZh: "被搜尋到", promptEn: "Search visibility" },
        ],
      },
      {
        id: "audience",
        title: "你想先吸引哪種人？",
        type: "single",
        options: [
          { id: "recruiter", label: "招募者 / Recruiter", promptZh: "招募者 / Recruiter", promptEn: "Recruiters" },
          { id: "hm", label: "用人主管", promptZh: "用人主管", promptEn: "Hiring managers" },
          { id: "founder", label: "創辦人 / 新創", promptZh: "創辦人／新創", promptEn: "Founders / startups" },
          { id: "client", label: "客戶 / 商務合作方", promptZh: "客戶／商務合作方", promptEn: "Clients / business partners" },
          { id: "peer", label: "同業 / 社群", promptZh: "同業／社群", promptEn: "Peers / community" },
        ],
      },
      {
        id: "wants",
        title: "你希望 AI 幫你做什麼？（可多選）",
        type: "multi",
        options: [
          { id: "audit", label: "先做現況診斷", promptZh: "先做現況診斷", promptEn: "Audit current profile first" },
          { id: "rewrite", label: "改寫 Headline / About / Experience", promptZh: "改寫 Headline / About / Experience", promptEn: "Rewrite headline / about / experience" },
          { id: "search", label: "補強搜尋關鍵字", promptZh: "補強搜尋關鍵字", promptEn: "Improve search keywords" },
          { id: "cta", label: "加強行動呼籲 / 聯絡方式", promptZh: "加強行動呼籲／聯絡方式", promptEn: "Improve CTA / contact path" },
          { id: "fullpack", label: "產出完整優化包", promptZh: "產出完整優化包", promptEn: "Generate a full optimization pack" },
        ],
      },
    ],
  },

  /* ---------- Recommendation 路徑問題 ---------- */
  recommendation: {
    questions: [
      {
        id: "relationship",
        title: "你和推薦人的關係是？",
        type: "single",
        options: [
          { id: "manager", label: "直屬主管 / 前主管", promptZh: "直屬主管／前主管", promptEn: "Direct manager / former manager" },
          { id: "peer", label: "同事 / 跨部門合作夥伴", promptZh: "同事／跨部門合作夥伴", promptEn: "Peer / cross-functional partner" },
          { id: "client", label: "客戶 / 外部合作方", promptZh: "客戶／外部合作方", promptEn: "Client / external partner" },
          { id: "mentor", label: "導師 / 教授 / 顧問", promptZh: "導師／教授／顧問", promptEn: "Mentor / professor / advisor" },
        ],
      },
      {
        id: "useCase",
        title: "這份內容要拿來做什麼？",
        type: "single",
        options: [
          { id: "letter", label: "推薦信 / 推薦文", promptZh: "推薦信／推薦文", promptEn: "Recommendation letter / reference note" },
          { id: "referral", label: "內推 / 介紹信", promptZh: "內推／介紹信", promptEn: "Referral / introduction note" },
          { id: "reference", label: "Reference call 腳本", promptZh: "Reference call 腳本", promptEn: "Reference call script" },
          { id: "email", label: "Email / LinkedIn 訊息", promptZh: "Email / LinkedIn 訊息", promptEn: "Email / LinkedIn message" },
        ],
      },
      {
        id: "evidence",
        title: "推薦內容最該提哪些證據？（可多選）",
        type: "multi",
        options: [
          { id: "impact", label: "具體成果 / 成效", promptZh: "具體成果／成效", promptEn: "Concrete impact / outcomes" },
          { id: "ownership", label: "Ownership / 主導程度", promptZh: "Ownership / 主導程度", promptEn: "Ownership / scope" },
          { id: "collab", label: "合作 / 溝通表現", promptZh: "合作／溝通表現", promptEn: "Collaboration / communication" },
          { id: "growth", label: "成長 / 學習速度", promptZh: "成長／學習速度", promptEn: "Growth / learning speed" },
          { id: "values", label: "態度 / 價值觀", promptZh: "態度／價值觀", promptEn: "Attitude / values" },
        ],
      },
      {
        id: "wants",
        title: "你希望 AI 幫你做什麼？（可多選）",
        type: "multi",
        options: [
          { id: "draft", label: "直接寫出草稿", promptZh: "直接寫出草稿", promptEn: "Draft the full text" },
          { id: "outline", label: "先給大綱與說法", promptZh: "先給大綱與說法", promptEn: "Give outline and talking points" },
          { id: "tone", label: "調整語氣與可信度", promptZh: "調整語氣與可信度", promptEn: "Tune tone and credibility" },
          { id: "risk", label: "找出不能講的地方", promptZh: "找出不能講的地方", promptEn: "Flag risky / unsupported claims" },
        ],
      },
    ],
  },

  /* ---------- Assessment 路徑問題 ---------- */
  assessment: {
    questions: [
      {
        id: "assessmentType",
        title: "你想做哪一種適性 / 能力檢視？",
        type: "single",
        options: [
          { id: "rolefit", label: "角色適配檢視", promptZh: "角色適配檢視", promptEn: "Role fit assessment" },
          { id: "skillgap", label: "能力缺口檢視", promptZh: "能力缺口檢視", promptEn: "Skill gap assessment" },
          { id: "aptitude", label: "適性測驗 / 答題練習", promptZh: "適性測驗／答題練習", promptEn: "Aptitude test / answer practice" },
          { id: "roadmap", label: "下一步成長路線", promptZh: "下一步成長路線", promptEn: "Growth roadmap" },
        ],
      },
      {
        id: "focus",
        title: "你最想檢查哪些面向？（可多選）",
        type: "multi",
        options: [
          { id: "logic", label: "邏輯與結構化表達", promptZh: "邏輯與結構化表達", promptEn: "Logic and structured expression" },
          { id: "evidence", label: "證據與可信度", promptZh: "證據與可信度", promptEn: "Evidence and credibility" },
          { id: "communication", label: "溝通與說服", promptZh: "溝通與說服", promptEn: "Communication and persuasion" },
          { id: "ownership", label: "Ownership / 主導感", promptZh: "Ownership / 主導感", promptEn: "Ownership / initiative" },
          { id: "fit", label: "角色匹配度", promptZh: "角色匹配度", promptEn: "Role fit" },
          { id: "bias", label: "題目偏誤 / 公平性", promptZh: "題目偏誤／公平性", promptEn: "Question bias / fairness" },
        ],
      },
      {
        id: "format",
        title: "你希望輸出成什麼？",
        type: "single",
        options: [
          { id: "scorecard", label: "評分卡 / 打分", promptZh: "評分卡／打分", promptEn: "Scorecard" },
          { id: "drill", label: "練習題 / Drill", promptZh: "練習題／Drill", promptEn: "Practice drills" },
          { id: "plan", label: "行動計畫", promptZh: "行動計畫", promptEn: "Action plan" },
          { id: "full", label: "完整分析包", promptZh: "完整分析包", promptEn: "Full analysis pack" },
        ],
      },
      {
        id: "wants",
        title: "你希望 AI 幫你做什麼？（可多選）",
        type: "multi",
        options: [
          { id: "audit", label: "先做診斷", promptZh: "先做診斷", promptEn: "Diagnose first" },
          { id: "quiz", label: "出題測驗", promptZh: "出題測驗", promptEn: "Generate quiz questions" },
          { id: "feedback", label: "逐題回饋", promptZh: "逐題回饋", promptEn: "Provide per-answer feedback" },
          { id: "roadmap", label: "做成補強路線", promptZh: "做成補強路線", promptEn: "Turn into improvement roadmap" },
        ],
      },
    ],
  },

  /* ---------- 打氣路徑問題 ---------- */
  encourage: {
    questions: [
      {
        id: "mood",
        title: "你現在最累的是什麼？（可多選）",
        type: "multi",
        options: [
          { id: "noreply", label: "投了很多，都沒回音", promptZh: "投了很多履歷卻沒有回音", promptEn: "Sent many applications but hear nothing back" },
          { id: "rejected", label: "一直被拒絕，開始懷疑自己", promptZh: "一再被拒絕，開始懷疑自己", promptEn: "Repeated rejections, starting to doubt myself" },
          { id: "impostor", label: "覺得自己不夠好（冒牌者感）", promptZh: "覺得自己不夠好、有冒牌者感", promptEn: "Feeling not good enough (impostor syndrome)" },
          { id: "interview", label: "面試完很挫折", promptZh: "面試之後感到很挫折", promptEn: "Feeling defeated after interviews" },
          { id: "lost", label: "轉職 / 方向很迷惘", promptZh: "對轉職或職涯方向感到迷惘", promptEn: "Lost about career direction or switching" },
          { id: "tired", label: "就是好累，想被接住一下", promptZh: "就是很累，需要被支持一下", promptEn: "Just exhausted and need to be held for a moment" },
        ],
      },
      {
        id: "support",
        title: "你想要哪一種陪伴？",
        type: "single",
        options: [
          { id: "hug", label: "先抱抱我，溫柔一點", promptZh: "先給我溫柔的安慰與陪伴", promptEn: "Comfort and gentle company first" },
          { id: "value", label: "提醒我，其實做得不錯", promptZh: "提醒我其實做得不錯、看見我的價值", promptEn: "Remind me I've done well and help me see my worth" },
          { id: "push", label: "拉我一把，給我下一步", promptZh: "溫和地拉我一把，給我下一步方向", promptEn: "Gently pull me up and give me a next step" },
          { id: "vent", label: "陪我發洩完，再一起站起來", promptZh: "先陪我發洩，再一起重新站起來", promptEn: "Let me vent first, then get back up together" },
        ],
      },
    ],
  },

  /* ---------- Agent 定義（依分支） ---------- */
  agents: {
    encourage: [
      { id: "buddy", name: "陪你走過的老同事（Been-there Colleague）", focusZh: "你不是一個人撐過來的", focusEn: "you didn't get here alone",
        ruleZh: "以一起共事過的同事視角，具體提醒使用者真實做過、卻被自己低估的貢獻，肯定他撐得住。", ruleEn: "As a former colleague, concretely remind the user of real contributions they underrate, and affirm their resilience.",
        pose: "presenting", persona: "在公司陪你熬過爛專案的那個人。他記得你做過什麼，會直接說：你比自己以為的更扛得住。" },
      { id: "warm", name: "最溫柔的朋友（Warm Friend）", focusZh: "先接住情緒，不急著解決", focusEn: "feelings first, fixes later",
        ruleZh: "先同理與安撫，肯定使用者現在的疲憊是合理的，不急著給建議或叫他振作。", ruleEn: "Empathize and soothe first; validate that the exhaustion is legitimate; do not rush to advise or say 'cheer up'.",
        pose: "arms-open", persona: "先給你一個擁抱、不急著解決問題的人。她會先讓你知道：現在的累是真的，不是你不好。" },
      { id: "cheer", name: "你的啦啦隊長（Cheerleader）", focusZh: "把你的小進展放大", focusEn: "amplify your small wins",
        ruleZh: "用正向、有能量但不油膩的語氣，把使用者最近的小進展具體放大，幫他打氣。", ruleEn: "Use a positive, energetic but never cheesy tone to amplify the user's recent small wins and cheer them on.",
        pose: "confident-up", persona: "永遠相信你的那個人。他會把你最近做到的小事翻出來，大聲講給你聽。" },
      { id: "mirror", name: "看見你價值的人（Worth-Mirror）", focusZh: "破除冒牌者感", focusEn: "break impostor syndrome",
        ruleZh: "用使用者自己的事例，具體列出他的優點與價值，破除冒牌者感；不得編造未提供的成就。", ruleEn: "Using the user's own examples, concretely list their strengths and worth to break impostor syndrome; never invent achievements.",
        pose: "talking", persona: "幫你把『其實很厲害』講清楚的人。你看不到的優點，他一條一條指給你看。" },
      { id: "veteran", name: "過來人（Survivor）", focusZh: "這一切會過去", focusEn: "this will pass",
        ruleZh: "以過來人視角分享『會過去』的真實感，給一點點可行的下一步，但以陪伴為主。", ruleEn: "From a survivor's view, share an honest 'this will pass', offer a small doable next step, but prioritize companionship.",
        pose: "leaning-crossed", persona: "也曾被拒到懷疑人生、後來重新站起來的人。他不講大道理，只說：我懂，而且會過去。" },
    ],
    cv: [
      { id: "recruiter", name: "Recruiter（招募專員）", focusZh: "10 秒可讀性、職級訊號、第一印象", focusEn: "10-second clarity, seniority signal, first impression",
        ruleZh: "在 10 秒內判斷這份履歷適合什麼角色與職級；檢查最強成就是否露出、是否太籠統、職涯故事是否連貫。", ruleEn: "Judge within 10 seconds what role/seniority this fits; check whether the strongest achievements are visible, whether it is too generic, and whether the career story is coherent.",
        pose: "talking", persona: "說話很快、看過上千份履歷的篩選者。她不會給你第二次機會證明自己，10 秒內沒抓到重點就往下一份。" },
      { id: "hm", name: "Hiring Manager（用人主管）", focusZh: "真實能力、ownership、scope、面試風險", focusEn: "real ability, ownership, scope, interview risk",
        ruleZh: "質疑這些工作是否真由候選人主導、成果是否可信、JD 要求的技能是否被證明，並指出面試會追問的風險。", ruleEn: "Question whether the candidate truly owned the work, whether claimed impact is credible, whether JD-required skills are proven, and flag what would be probed in interview.",
        pose: "arms-crossed", persona: "雙手抱胸、不輕易點頭的用人主管。他只在意一件事：這個人進來後，能不能真的扛起事情。" },
      { id: "ats", name: "ATS System（履歷篩選系統）", focusZh: "關鍵字、區塊結構、JD 對齊", focusEn: "keywords, section structure, JD alignment",
        ruleZh: "檢查必要關鍵字是否遺漏、區塊標籤是否可被解析、技能是否自然帶入、格式是否可能導致解析失敗；不保證通過 ATS。", ruleEn: "Check for missing required keywords, ATS-readable section labels, naturally embedded skills, and parsing risks; never guarantee ATS pass.",
        pose: "hands-behind", persona: "沒有情緒、只認規則的系統角色。雙手背在身後逐行掃描，格式錯了就是錯了，沒有人情可講。" },
      { id: "ceo", name: "CEO（商業價值）", focusZh: "商業影響", focusEn: "business impact",
        ruleZh: "追問這個人替公司創造了什麼可量化的商業價值（營收、成本、風險、效率、客戶影響）。", ruleEn: "Ask what quantifiable business value this person created (revenue, cost, risk, efficiency, customer impact).",
        pose: "confident-up", persona: "站姿挺拔、一手指向天花板的決策者。他不問你做了什麼，只問你的工作換來了多少錢。" },
      { id: "devil", name: "Devil Advocate（毒舌面試官）", focusZh: "弱 claim、無證據、誇大、紅旗", focusEn: "weak claims, no evidence, exaggeration, red flags",
        ruleZh: "找出聽起來灌水、缺證據、可能在面試壓力下翻車的內容，並指出該移除或弱化什麼；不軟化批評。", ruleEn: "Find inflated, unsupported claims that could fail under interview pressure; say what should be removed or downgraded; do not soften criticism.",
        pose: "pointing", persona: "毫不留情的挑刺者，手指直接點向你最心虛的那一句話。他存在的目的就是讓你在真正面試前先垮一次。" },
      { id: "coach", name: "Career Coach（職涯教練）", focusZh: "職涯故事整合", focusEn: "career story integration",
        ruleZh: "把履歷素材整合成可投遞、可面試、可延伸到 LinkedIn 的職涯故事與定位。", ruleEn: "Integrate resume material into a deployable, interview-ready career story and positioning that extends to LinkedIn.",
        pose: "presenting", persona: "雙手向你攤開、語氣溫和的整合者。他幫你把散落的經歷拼成一條別人聽得懂的職涯路線。" },
      { id: "headhunter", name: "Executive Headhunter（高階獵頭）", focusZh: "高薪定位、市場差異化", focusEn: "premium positioning, market differentiation",
        ruleZh: "從市場角度指出候選人的差異化與為何值得這個薪資；強化資深與主管級的定位語言。", ruleEn: "From a market view, articulate the candidate's differentiation and why they are worth the compensation; sharpen senior/executive positioning.",
        pose: "hands-on-hips", persona: "插腰站著、打量你市場身價的獵頭。她只關心一件事：把你放到市場上，值多少錢。" },
    ],
    interview: [
      { id: "google", name: "Google Interviewer", focusZh: "結構化思考、問題解決、clarity、evidence", focusEn: "structured thinking, problem solving, clarity, evidence",
        ruleZh: "要求 tradeoff、追問如何得知結果、追問規模與限制；重視結構化與協作。", ruleEn: "Ask for tradeoffs, how the candidate knows the outcome, scale and constraints; value structure and collaboration.",
        pose: "thinking", persona: "一手托著下巴、安靜聽你講完整套邏輯的考官。他在等一個破洞，只要結構不嚴謹，他就會找到。" },
      { id: "amazon", name: "Amazon Bar Raiser", focusZh: "ownership、customer obsession、dive deep、deliver results", focusEn: "ownership, customer obsession, dive deep, deliver results",
        ruleZh: "追問細節、挑戰模糊的 ownership、要求候選人說清楚個人到底做了什麼。", ruleEn: "Push for details, challenge vague ownership, demand exactly what the candidate personally did.",
        pose: "pointing", persona: "緊盯細節、手指直接戳向模糊地帶的關主。「我們」是誰？他要的是「我」做了什麼。" },
      { id: "binance", name: "Binance Hiring Manager", focusZh: "速度、風險判斷、合規意識、模糊中 ownership", focusEn: "speed, risk judgment, compliance awareness, ownership under ambiguity",
        ruleZh: "追問如何處理快速變動環境、風險、控制與利害關係人壓力；重視 crypto／fintech／全球市場意識。", ruleEn: "Ask how the candidate handles fast-changing environments, risk, controls and stakeholder pressure; value crypto/fintech/global awareness.",
        pose: "hands-on-hips", persona: "插著腰、節奏比別人快半拍的主管。他活在一個規則一天會變三次的市場，要的是能在混亂中還站得穩的人。" },
      { id: "startup", name: "Startup Founder", focusZh: "執行速度、資源運用、zero-to-one、實務決策", focusEn: "execution speed, resourcefulness, zero-to-one, practical decisions",
        ruleZh: "追問在沒有資源時做了什麼、能否在沒有流程下運作。", ruleEn: "Ask what the candidate did without resources and whether they can operate without process.",
        pose: "arms-open", persona: "雙臂張開、什麼都自己捲起袖子做的創辦人。他不在乎你頭銜多大，只在乎沒人沒錢時你還能不能生出結果。" },
      { id: "exec", name: "Executive Recruiter", focusZh: "市場定位、seniority fit、商業影響、executive communication", focusEn: "positioning, seniority fit, business impact, executive communication",
        ruleZh: "追問為何值得這個薪酬、有何差異化；以高階溝通標準檢視。", ruleEn: "Ask why the candidate is worth the compensation and what makes them differentiated; judge by executive communication standards.",
        pose: "leaning-crossed", persona: "微微側身、雙手交叉打量你的高階獵頭。他見過太多漂亮履歷，只想知道你跟其他候選人到底差在哪。" },
      { id: "coach", name: "Interview Coach", focusZh: "把成就轉成面試故事", focusEn: "turning achievements into interview stories",
        ruleZh: "把候選人的真實成就整理成結構清楚、可在 2 分鐘內講完、抗追問的面試答案。", ruleEn: "Turn the candidate's real achievements into structured answers deliverable in under 2 minutes and resilient to follow-ups.",
        pose: "talking", persona: "耐心陪你練到順口的教練。他會一直追問「然後呢」，直到你的故事在壓力下也站得住。" },
      { id: "devil", name: "Devil Advocate", focusZh: "挑錯、找漏洞、避免灌水", focusEn: "spot weak claims, find leaks, avoid hype",
        ruleZh: "直接挑出最容易在追問時垮掉的說法，逼使用者用真實案例補強。", ruleEn: "Call out the claims most likely to collapse under follow-up and force the user to back them with real examples.",
        pose: "arms-crossed", persona: "雙手抱胸、不打算給你好臉色的最後一道關卡。他存在的意義就是先讓你難堪一次，總比正式面試時難堪好。" },
    ],
    linkedin: [
      { id: "li-strategist", name: "LinkedIn Strategist", focusZh: "headline、about、experience 的主軸與定位", focusEn: "headline, about, and experience positioning",
        ruleZh: "先釐清這個 LinkedIn 檔案要把誰吸引過來，再決定 headline、about、experience 的敘事順序與主張。", ruleEn: "Clarify who the profile should attract first, then decide the narrative order and claims for headline, about, and experience.",
        pose: "presenting", persona: "雙手向前攤開、先問「你想吸引誰」的策略顧問。沒想清楚對象之前，他不准你動手寫一個字。" },
      { id: "li-search", name: "Recruiter Search Lens", focusZh: "搜尋可見度、關鍵字、可被找到", focusEn: "search visibility, keywords, findability",
        ruleZh: "檢查是否會被搜尋到：title、headline、skills、about 和經歷的關鍵字是否自然且可被搜尋。", ruleEn: "Check whether the profile can be found: title, headline, skills, about, and experience keywords must be natural and searchable.",
        pose: "hands-behind", persona: "雙手背在身後、用搜尋引擎的眼光打量你的檢查者。寫得再好，搜不到就等於不存在。" },
      { id: "li-story", name: "Experience Story Editor", focusZh: "經歷敘事、證據順序、可讀性", focusEn: "experience narrative, evidence order, readability",
        ruleZh: "把經歷改成適合 LinkedIn 的敘事方式：更像故事與影響，不是履歷逐條重複。", ruleEn: "Rewrite experience into LinkedIn-style narrative: more story and impact, not a line-by-line resume copy.",
        pose: "talking", persona: "說故事的編輯，受不了流水帳式的條列。她要的是「然後發生了什麼」，不是職責清單。" },
      { id: "li-tone", name: "Tone Editor", focusZh: "語氣、個人品牌、可信度", focusEn: "tone, personal brand, credibility",
        ruleZh: "讓文字聽起來有個性但不浮誇，維持專業、可搜尋、可信的個人品牌語氣。", ruleEn: "Keep the writing distinctive but not inflated, with a professional, searchable, and credible personal brand voice.",
        pose: "thinking", persona: "一手扶著下巴反覆推敲用詞的語氣編輯。太誇張她會劃掉，太平淡她也會劃掉。" },
      { id: "devil", name: "Devil Advocate", focusZh: "挑錯、找漏洞、避免灌水", focusEn: "spot weak claims, find leaks, avoid hype",
        ruleZh: "把過度包裝、空泛定位與搜尋可見度上的漏洞直接指出來，不留模糊空間。", ruleEn: "Call out over-packaging, vague positioning, and discoverability leaks without leaving ambiguity.",
        pose: "pointing", persona: "一眼看穿包裝話術的挑刺者。「賦能」「驅動」這種空話，他會直接用手指劃掉。" },
    ],
    recommendation: [
      { id: "referee", name: "Referee Voice", focusZh: "推薦人視角、口氣、權威感", focusEn: "recommender voice, tone, authority",
        ruleZh: "確保內容是推薦人真能說出口的話，並且語氣與關係強度一致。", ruleEn: "Ensure the content sounds like something the recommender could genuinely say, with tone aligned to the relationship strength.",
        pose: "talking", persona: "代替推薦人發聲的角色。她只說推薦人真的會說的話，語氣對不上關係深淺，她會先打回去。" },
      { id: "credibility", name: "Credibility Checker", focusZh: "可證實性、具體事實、避免灌水", focusEn: "verifiability, concrete facts, anti-hype",
        ruleZh: "檢查每個稱讚是否有具體事例或見證來源，避免把沒看過的事寫成肯定句。", ruleEn: "Check every praise statement for a concrete example or firsthand basis; do not turn hearsay into a certainty.",
        pose: "hands-behind", persona: "雙手背在身後逐句核對的查證者。每一句讚美都要有一個具體事件撐著，否則直接刪。" },
      { id: "tone", name: "Tone Normalizer", focusZh: "正式度、親切度、信件節奏", focusEn: "formality, warmth, letter rhythm",
        ruleZh: "把內容調整成適合收件情境的語氣，必要時提供正式版與較口語版。", ruleEn: "Tune the content to the recipient context, and provide both a formal and a more conversational version when useful.",
        pose: "presenting", persona: "雙手攤開、在正式與親切之間找平衡的調音師。她在意的是這封信讀起來像不像真人寫的。" },
      { id: "guardrail", name: "No-Fabrication Guardrail", focusZh: "不編造、不誇張", focusEn: "no fabrication, no exaggeration",
        ruleZh: "任何沒證據的說法都要降級成待補資訊，不可因為信件需要就補編內容。", ruleEn: "Downgrade unsupported claims to missing-input status; never invent details just to make the letter stronger.",
        pose: "arms-crossed", persona: "雙手抱胸、底線最硬的把關者。寧可這封信弱一點，也不准多寫一句編造的話。" },
      { id: "devil", name: "Devil Advocate", focusZh: "挑錯、找漏洞、避免灌水", focusEn: "spot weak claims, find leaks, avoid hype",
        ruleZh: "把不可信、過度誇張或角色不符的內容直接刪除或降級，不要因為要寫成一封信就放水。", ruleEn: "Remove or downgrade anything untrustworthy, exaggerated, or mismatched to the relationship; do not soften because it is a letter.",
        pose: "pointing", persona: "不留情面的最後一關。誇張的形容詞、不符身分的口氣，他會逐個指出來。" },
    ],
    assessment: [
      { id: "assessment-designer", name: "Assessment Designer", focusZh: "題目結構、評分維度、流程設計", focusEn: "question structure, scoring dimensions, workflow design",
        ruleZh: "把評估設計成和目標角色真的相關，而不是抽象人格測驗。", ruleEn: "Design the assessment around the actual target role, not around abstract personality tests.",
        pose: "presenting", persona: "雙手攤開設計流程的建築師。她拒絕做那種「你是哪種水果」的測驗，每一題都要連回真實職位。" },
      { id: "bias-checker", name: "Bias Checker", focusZh: "公平性、題目偏誤、可接受性", focusEn: "fairness, bias, acceptability",
        ruleZh: "檢查題目是否引入與工作無關的偏誤或不公平假設，必要時重寫。", ruleEn: "Check whether questions introduce job-irrelevant bias or unfair assumptions and rewrite them when needed.",
        pose: "hands-behind", persona: "雙手背在身後逐題審查的監督者。任何跟工作無關的假設，他都會打上問號重寫。" },
      { id: "rolefit", name: "Role-fit Analyst", focusZh: "能力缺口、角色匹配、信心", focusEn: "capability gaps, role fit, confidence",
        ruleZh: "把測驗結果連回目標角色，拆出強項、弱項與下一步優先補強方向。", ruleEn: "Tie the assessment back to the target role and break out strengths, gaps, and priority next steps.",
        pose: "thinking", persona: "一手托腮、把分數翻譯成行動的分析師。她在意的不是你考得好不好，是你接下來該補什麼。" },
      { id: "framer", name: "Answer Framer", focusZh: "把答案整理成可練習的輸出", focusEn: "turn answers into practice-ready output",
        ruleZh: "把測驗題與回饋整理成可以反覆練習的問題、範例與行動建議。", ruleEn: "Turn the test into repeatable practice questions, examples, and action suggestions.",
        pose: "talking", persona: "把結果整理成練習題的教練。他不只告訴你問題在哪，還陪你練到下次不再卡住。" },
      { id: "devil", name: "Devil Advocate", focusZh: "挑錯、找漏洞、避免誤導", focusEn: "spot weaknesses, find loopholes, avoid misleading output",
        ruleZh: "把無關、過於主觀或可能誤導的測驗設計直接指出，避免把測驗做成不實用的心理占卜。", ruleEn: "Call out irrelevant, overly subjective, or misleading assessment design so the test does not turn into pseudo-psychology.",
        pose: "pointing", persona: "不買單空泛測驗的懷疑者。太主觀、太抽象的題目，他會直接指出來說「這跟工作沒關係」。" },
    ],
    // 領域專家顧問（CV 與面試共用，使用者自由加選）。match 用於「推薦」標記，比對所選產業／職能。
    specialists: [
      { id: "sp-finance", name: "金融領域專家", focusZh: "金融業視角：法遵、風險、數字敏感度", focusEn: "finance lens: compliance, risk, numeracy",
        match: ["finance", "crypto"],
        ruleZh: "以金融／銀行業的標準檢視：是否展現風險意識、法遵理解、產品線知識與對數字的敏感度。", ruleEn: "Review by finance/banking standards: risk awareness, regulatory understanding, product knowledge, and numeracy.",
        pose: "arms-crossed", persona: "雙手抱胸、對數字異常敏感的銀行老手。模糊的風險描述他一眼就能看穿。" },
      { id: "sp-hr", name: "HR / 招募專家", focusZh: "人資視角：文化適配、軟實力、留任訊號", focusEn: "HR lens: culture fit, soft skills, retention signal",
        match: ["hr"],
        ruleZh: "以人資與招募角度檢視：文化適配、溝通與協作軟實力、穩定度與留任訊號，以及是否好被招募流程理解。", ruleEn: "Review from an HR/recruiting view: culture fit, communication/collaboration soft skills, stability/retention signals, and how easily the profile passes screening.",
        pose: "talking", persona: "溫和但精準提問的人資夥伴。她在意的不只是能力，還有這個人會不會留下來。" },
      { id: "sp-amlkyc", name: "AML / KYC 專家", focusZh: "反洗錢與客戶審查視角", focusEn: "AML/KYC lens",
        match: ["compliance", "crypto", "finance"],
        ruleZh: "檢視 AML／KYC 經驗：案件量、風險指標、SAR 申報、調查與升級流程、流程改善；提醒不得揭露機密個案。", ruleEn: "Review AML/KYC experience: case volume, risk indicators, SAR filing, investigation/escalation, process improvement; never disclose confidential cases.",
        pose: "hands-behind", persona: "雙手背在身後、滴水不漏的審查員。案件量、SAR 申報數字，他要的是精確，不是印象。" },
      { id: "sp-compliance", name: "法遵 / 風控專家", focusZh: "法規遵循、控制、稽核視角", focusEn: "compliance/risk/audit lens",
        match: ["compliance"],
        ruleZh: "檢視法遵與風控能力：法規理解、控制設計與落地、稽核與整改、可量化的風險降低。", ruleEn: "Review compliance/risk capability: regulatory grasp, control design and execution, audit/remediation, quantifiable risk reduction.",
        pose: "confident-up", persona: "一手指向規範條文、立場最硬的把關者。風險降低多少，要拿數字說話。" },
      { id: "sp-pm", name: "產品專家", focusZh: "產品判斷：metrics、優先排序、tradeoff", focusEn: "product judgment: metrics, prioritization, tradeoffs",
        match: ["pm"],
        ruleZh: "檢視產品判斷：指標、優先排序、取捨、上線影響與使用者洞察，不能只描述協調工作。", ruleEn: "Review product judgment: metrics, prioritization, tradeoffs, launch impact, user insight; not just coordination.",
        pose: "thinking", persona: "一手扶額、反覆推敲取捨的產品人。他只想知道你做的決定，不是你協調了多少場會議。" },
      { id: "sp-eng", name: "工程專家", focusZh: "技術深度：scale、可靠度、架構、ownership", focusEn: "engineering depth: scale, reliability, architecture, ownership",
        match: ["swe", "data"],
        ruleZh: "檢視技術深度與可量化影響：規模、延遲、可靠度、架構取捨與 ownership。", ruleEn: "Review technical depth and measurable impact: scale, latency, reliability, architectural tradeoffs, ownership.",
        pose: "arms-crossed", persona: "雙手抱胸、只信規模與延遲數字的工程師。聽起來厲害沒用，他要看架構取捨的真實依據。" },
      { id: "sp-design", name: "設計專家", focusZh: "問題框架、流程、研究、作品連結", focusEn: "problem framing, process, research, portfolio link",
        match: ["design"],
        ruleZh: "檢視設計能力：問題框架、設計流程、研究、跨職能協作與作品集連結，不只列工具。", ruleEn: "Review design capability: problem framing, process, research, cross-functional collaboration, and portfolio link; not just tools.",
        pose: "presenting", persona: "雙手攤開、習慣用流程說故事的設計師。她在意你怎麼定義問題，不是你會用哪些工具。" },
      { id: "sp-data", name: "資料 / 分析專家", focusZh: "指標定義、分析方法、商業決策連結", focusEn: "metric definition, analysis, business linkage",
        match: ["data"],
        ruleZh: "檢視資料分析能力：指標定義、分析方法的嚴謹度，以及分析如何連結到商業決策與成果。", ruleEn: "Review data capability: metric definition, analytical rigor, and how analysis drove business decisions and outcomes.",
        pose: "pointing", persona: "一指點向指標定義的分析師。「成長」是什麼意思？他要你先把定義講清楚。" },
      { id: "sp-growth", name: "成長 / 行銷專家", focusZh: "漏斗、實驗、渠道、可歸因成果", focusEn: "funnel, experiments, channels, attributable results",
        match: ["growth", "marketing", "retail"],
        ruleZh: "檢視成長與行銷成果：漏斗指標、實驗設計、渠道經營與可歸因的成果，避免空泛的「提升曝光」。", ruleEn: "Review growth/marketing results: funnel metrics, experiment design, channel work, attributable outcomes; avoid vague \"increased awareness\".",
        pose: "arms-open", persona: "雙臂張開、習慣用漏斗思考的成長玩家。「提升曝光」這種話他聽過太多次，要的是可歸因的數字。" },
      { id: "sp-sales", name: "業務 / BD 專家", focusZh: "業績、管線、客戶關係、談判", focusEn: "quota, pipeline, relationships, negotiation",
        match: ["sales"],
        ruleZh: "檢視業務成果：達標率、管線規模、客戶關係經營與談判，要求具體數字與貢獻。", ruleEn: "Review sales results: quota attainment, pipeline size, relationship building, negotiation; require concrete numbers and contribution.",
        pose: "hands-on-hips", persona: "插腰站著、只看達成率的業務老將。故事說得再好，沒有數字他不買單。" },
      { id: "sp-startup", name: "新創 / 創業專家", focusZh: "資源有限下執行、zero-to-one、可轉移性", focusEn: "execution with few resources, zero-to-one, transferability",
        match: ["founder", "tech"],
        ruleZh: "檢視新創經驗：在資源有限下的執行、zero-to-one 能力、traction，以及如何轉移到目標職位。", ruleEn: "Review startup experience: execution with limited resources, zero-to-one ability, traction, and transferability to the target role.",
        pose: "confident-up", persona: "一手舉高、習慣什麼都自己做的創業者。他在意的是你在沒人沒錢時做出了什麼，而不是頭銜。" },
      { id: "sp-ops", name: "營運 / 專案管理專家", focusZh: "跨部門協調、流程改善、量化隱性價值", focusEn: "cross-functional coordination, process improvement, quantifying hidden value",
        match: ["ops"],
        ruleZh: "檢視營運與專案管理：跨部門協調、流程改善、交付成果，並把看不見的價值量化呈現。", ruleEn: "Review ops/PM: cross-functional coordination, process improvement, delivery, and quantifying otherwise-invisible value.",
        pose: "leaning-crossed", persona: "側身、雙手交叉，習慣把幕後工作攤開來看的營運專家。她要把你「順手做掉的事」翻譯成看得見的價值。" },
    ],
  },

  /* ---------- No-Fabrication Guardrail（永遠內建） ---------- */
  guardrail: {
    zh: "【不得編造】不得發明任何成就、數據、職稱或 credential。缺乏證據的內容要明確標記為「需使用者補充」，並以追問取得，不可臆造或誇大。",
    en: "[No fabrication] Do not invent any achievement, metric, title, or credential. Mark anything lacking evidence as \"needs user input\" and obtain it via follow-up questions; never fabricate or exaggerate.",
  },

  /* ---------- 輸出格式（內嵌進 prompt，摘自 docs） ---------- */
  outputFormats: {
    cv: {
      zh: `請依以下格式輸出履歷挑戰報告：
1. 10 秒招募者判讀：結論 / 原因 / 風險
2. JD 匹配判讀：結論 / 已符合的必要技能 / 缺少的必要技能 / 缺少的加分技能
3. 挑戰發現（逐條）：發現 / 類別 / 嚴重度(P0–P3) / 履歷依據 / 為何失敗 / 需向使用者追問 / 修正方向
4. 缺失證據清單
5. 缺失數據清單
6. 缺失商業價值清單
7. 缺失領導訊號清單
8. JD 不匹配清單
9. 優先修正順序：P0 / P1 / P2 / P3
10. 改寫前必須先問使用者的問題`,
      en: `Output a resume challenge report in this format:
1. 10-Second Recruiter Verdict: verdict / reason / risk
2. JD Match Verdict: verdict / required skills matched / required skills missing / preferred skills missing
3. Challenge Findings (each): finding / category / severity (P0–P3) / resume evidence / why it fails / what to ask the user / fix direction
4. Missing Evidence List
5. Missing Metrics List
6. Missing Business Value List
7. Missing Leadership Signal List
8. JD Mismatch List
9. Priority Revision Order: P0 / P1 / P2 / P3
10. Questions to ask the user before any rewrite`,
    },
    cvRewrite: {
      zh: `若要改寫 bullet，每條請輸出：Before（原句）/ After（改寫）/ 使用的證據 / 為何更強；不得編造數據，缺證據處標記為「需補充」。`,
      en: `When rewriting bullets, for each output: Before / After / evidence used / why it is stronger; never fabricate metrics, mark missing evidence as "needs input".`,
    },
    interviewPerQuestion: {
      zh: `每一題請依以下格式輸出：
題目 / 出題考官 / 類別 / 這題在測什麼
（若為互動式，先等我回答，再給）評分(1–5) / 評分理由 / 弱點(1–3) / 改進建議(1–3) / 更強的範例答案 / 可能的追問題(1–3)`,
      en: `For each question output:
Question / Interviewer / Category / What this tests
(If interactive, wait for my answer first) Score (1–5) / reason / weaknesses (1–3) / improvement suggestions (1–3) / stronger model answer / likely follow-up questions (1–3)`,
    },
    interviewMock: {
      zh: `若做完整模擬面試，請依序進行：Round 1 Recruiter 初篩 → Round 2 用人主管 → Round 3 行為／Bar Raiser → Round 4 角色專業題 → Round 5 高層／終面。結束後輸出：總評分 / 最強答案 / 最弱答案 / 五大風險 / 五大改進 / 需強化的故事 / 缺少的證據 / 下一步練習計畫。`,
      en: `For a full mock interview, run: Round 1 Recruiter screen → Round 2 Hiring Manager → Round 3 Behavioral/Bar Raiser → Round 4 Role-specific case → Round 5 Executive/Final. Then output: overall score / strongest answer / weakest answer / top 5 risks / top 5 improvements / stories to strengthen / missing evidence / next practice plan.`,
    },
    website: {
      zh: `請依選定的排版風格與我的背景，輸出個人網站／作品集的：1) 頁面結構（區塊順序）2) 每個區塊的標題與文案草稿 3) 導覽列與 CTA 建議 4) 視覺風格建議（色彩、字體、間距）。文案需真實、可量化，不得編造成就。`,
      en: `Based on the chosen layout style and my background, output for a personal website/portfolio: 1) page structure (section order) 2) headline and copy draft for each section 3) nav and CTA suggestions 4) visual style suggestions (color, type, spacing). Keep copy truthful and quantifiable; do not fabricate achievements.`,
    },
    linkedin: {
      zh: `請依以下格式輸出 LinkedIn 優化包：
1. Profile Verdict：目前狀態 / 最大問題 / 優先順序
2. Headline Options：至少 3 版
3. About Draft：1 版主稿 + 1 版更精簡版
4. Experience Rewrite：針對最重要的 2-3 段經歷改寫
5. Skills / Featured 建議
6. 搜尋可見度優化建議
7. 不能寫或不該誇大的內容
8. 下一步行動清單`,
      en: `Output a LinkedIn optimization pack in this format:
1. Profile Verdict: current state / biggest issue / priority order
2. Headline Options: at least 3 versions
3. About Draft: 1 main draft + 1 shorter version
4. Experience Rewrite: rewrite the 2-3 most important experiences
5. Skills / Featured suggestions
6. Search visibility improvements
7. Content that should not be written or exaggerated
8. Next-step action list`,
    },
    recommendation: {
      zh: `請依以下格式輸出推薦文 / 推薦信草稿：
1. 使用情境與推薦人的角色
2. 核心結論：這個人為什麼值得被推薦
3. 3-5 個具體證據點
4. 正式版草稿
5. 較口語的 Email / 訊息版
6. 需要向使用者補問的問題
7. 不能寫或不能誇大的地方`,
      en: `Output a recommendation / referral draft in this format:
1. Use case and recommender role
2. Core conclusion: why this person deserves the recommendation
3. 3-5 concrete evidence points
4. Formal draft
5. More casual email / message version
6. Questions to ask the user before finalizing
7. What should not be written or exaggerated`,
    },
    assessment: {
      zh: `請依以下格式輸出適性測驗 / 能力檢視包：
1. Role-fit Verdict：適配結論與信心程度
2. Strengths / Gaps：最強項與最需要補的缺口
3. Assessment Design：題目設計與評分標準
4. Sample Questions：3-7 題
5. Bias / Fairness Check
6. Improvement Plan：補強路線與練習建議
7. 需要使用者補充的資訊`,
      en: `Output an aptitude / capability assessment pack in this format:
1. Role-fit Verdict: fit conclusion and confidence level
2. Strengths / Gaps: strongest areas and biggest gaps
3. Assessment Design: question design and scoring criteria
4. Sample Questions: 3-7 questions
5. Bias / Fairness Check
6. Improvement Plan: strengthening path and practice suggestions
7. Information still needed from the user`,
    },
  },

  /* ---------- /skills 來源與選用規則 ---------- */
  skillSources: {
    resumeLibrary: "skills/resume-mentor-skill-library.md",
    businessAgents: "skills/business-agent-skills.md",
  },

  skillSelection: {
    cv: {
      core: [
        "Resume Discovery Skill",
        "Achievement Mining Skill",
        "Evidence Request Skill",
        "Resume Rewrite Skill",
        "JD Match Skill",
        "ATS Parse Skill",
        "Recruiter 10-Second Review Skill",
        "Career Gap Analysis Skill",
        "Resume Summary Skill",
        "Bullet Compression Skill",
        "Metrics Reconstruction Skill",
        "Red Flag Detection Skill",
        "No-Fabrication Guardrail Skill",
      ],
      byJobFamily: {
        pm: ["Product Manager Resume Skill", "Career Positioning Skill"],
        swe: ["Engineering Resume Skill", "System Design Story Skill", "GitHub Profile Review Skill"],
        design: ["Designer Resume Skill", "Portfolio Review Skill", "Personal Brand Skill"],
        data: ["Metrics Reconstruction Skill", "Career Positioning Skill"],
        growth: ["Personal Brand Skill", "Job Search Strategy Skill"],
        sales: ["Headhunter Pitch Skill", "Career Positioning Skill"],
        ops: ["Promotion Case Skill", "Career Gap Analysis Skill"],
        compliance: ["Compliance Resume Skill", "AML Resume Skill", "KYC Resume Skill"],
        finance: ["Executive Resume Skill", "Career Positioning Skill"],
        hr: ["Personal Brand Skill", "Job Search Strategy Skill"],
        exec: ["Executive Resume Skill", "Board Bio Skill"],
        founder: ["Startup Founder Resume Skill", "Career Transition Skill"],
      },
      byIndustry: {
        finance: ["Compliance Resume Skill", "Executive Resume Skill"],
        crypto: ["Compliance Resume Skill", "AML Resume Skill"],
        tech: ["Engineering Resume Skill", "Product Manager Resume Skill"],
        compliance: ["Compliance Resume Skill", "AML Resume Skill", "KYC Resume Skill"],
        marketing: ["Personal Brand Skill", "Cover Letter Skill"],
      },
      byTone: {
        harsh: ["No-Fabrication Guardrail Skill", "Red Flag Detection Skill", "Evidence Request Skill"],
      },
    },
    interview: {
      core: [
        "Self Introduction Skill",
        "STAR Answer Skill",
        "Failure Story Skill",
        "Behavioral Interview Drill Skill",
        "Mock Interview Reviewer Skill",
        "Recruiter Question Skill",
        "No-Fabrication Guardrail Skill",
      ],
      byCompany: {
        google: ["Case Interview Prep Skill", "Career Positioning Skill"],
        amazon: ["STAR Answer Skill", "Behavioral Interview Drill Skill"],
        binance: ["Career Gap Analysis Skill", "No-Fabrication Guardrail Skill"],
        startup: ["Startup Founder Resume Skill", "Career Transition Skill"],
        exec: ["Headhunter Pitch Skill", "Executive Resume Skill", "Board Bio Skill"],
      },
    },
    linkedin: {
      core: [
        "LinkedIn Headline Skill",
        "LinkedIn About Skill",
        "LinkedIn Experience Skill",
        "LinkedIn Skills Skill",
        "LinkedIn Featured Skill",
        "LinkedIn Recruiter Search Skill",
        "Personal Brand Skill",
        "No-Fabrication Guardrail Skill",
      ],
      byFocus: {
        headline: ["LinkedIn Headline Skill"],
        about: ["LinkedIn About Skill"],
        experience: ["LinkedIn Experience Skill"],
        skills: ["LinkedIn Skills Skill"],
        featured: ["LinkedIn Featured Skill", "Portfolio Review Skill"],
        search: ["LinkedIn Recruiter Search Skill", "Keyword Gap Skill"],
      },
      byAudience: {
        recruiter: ["LinkedIn Recruiter Search Skill"],
        hm: ["Career Positioning Skill"],
        founder: ["Personal Brand Skill"],
        client: ["LinkedIn Featured Skill"],
        peer: ["LinkedIn Content Positioning Skill"],
      },
    },
    recommendation: {
      core: [
        "Referral Request Skill",
        "Recommendation Letter Skill",
        "Cold Outreach Message Skill",
        "Career Positioning Skill",
        "No-Fabrication Guardrail Skill",
      ],
      byUseCase: {
        letter: ["Recommendation Letter Skill"],
        referral: ["Referral Request Skill", "Headhunter Pitch Skill"],
        reference: ["Referral Request Skill", "Mock Interview Reviewer Skill"],
        email: ["Cold Outreach Message Skill", "Referral Request Skill"],
      },
      byRelationship: {
        manager: ["Career Positioning Skill"],
        peer: ["Personal Brand Skill"],
        client: ["Headhunter Pitch Skill"],
        mentor: ["Career Positioning Skill"],
      },
    },
    assessment: {
      core: [
        "Assessment Design Skill",
        "Bias Check Skill",
        "Role Targeting Skill",
        "Career Gap Analysis Skill",
        "STAR Answer Skill",
        "No-Fabrication Guardrail Skill",
      ],
      byType: {
        rolefit: ["Role Targeting Skill", "Career Gap Analysis Skill"],
        skillgap: ["Career Gap Analysis Skill"],
        aptitude: ["Assessment Design Skill", "STAR Answer Skill"],
        roadmap: ["Job Search Strategy Skill", "Career Gap Analysis Skill"],
      },
      byFormat: {
        scorecard: ["Assessment Design Skill"],
        drill: ["STAR Answer Skill", "Behavioral Interview Drill Skill"],
        plan: ["Career Gap Analysis Skill", "Job Search Strategy Skill"],
        full: ["Assessment Design Skill", "Bias Check Skill", "Career Gap Analysis Skill"],
      },
    },
    website: {
      core: [
        "Personal Brand Skill",
        "Portfolio Review Skill",
        "LinkedIn Headline Skill",
        "LinkedIn About Skill",
        "Career Positioning Skill",
      ],
      byWireframe: {
        classic: ["Resume Summary Skill"],
        sidebar: ["Skills Section Optimization Skill"],
        "left-image": ["Personal Brand Skill"],
        designer: ["Portfolio Review Skill", "Personal Brand Skill"],
        timeline: ["Career Positioning Skill"],
        cards: ["Portfolio Review Skill"],
        dark: ["Personal Brand Skill"],
        onepage: ["Resume Summary Skill", "Bullet Compression Skill"],
      },
    },
    agents: {
      recruiter: [
        "Recruiter 10-Second Review Skill",
        "Resume Summary Skill",
        "Red Flag Detection Skill",
        "ATS Parse Skill",
      ],
      hm: [
        "Achievement Mining Skill",
        "JD Match Skill",
        "Career Gap Analysis Skill",
        "Evidence Request Skill",
      ],
      ats: [
        "ATS Parse Skill",
        "JD Match Skill",
        "Keyword Gap Skill",
        "Resume Section Ordering Skill",
      ],
      ceo: [
        "Executive Resume Skill",
        "Board Bio Skill",
        "Career Positioning Skill",
        "CEO Skill",
      ],
      devil: [
        "No-Fabrication Guardrail Skill",
        "Evidence Request Skill",
        "Red Flag Detection Skill",
      ],
      coach: [
        "Self Introduction Skill",
        "STAR Answer Skill",
        "Behavioral Interview Drill Skill",
        "Mock Interview Reviewer Skill",
      ],
      headhunter: [
        "Headhunter Pitch Skill",
        "Executive Resume Skill",
        "Offer Comparison Skill",
      ],
      google: [
        "Case Interview Prep Skill",
        "Career Positioning Skill",
      ],
      amazon: [
        "STAR Answer Skill",
        "Behavioral Interview Drill Skill",
        "Failure Story Skill",
      ],
      binance: [
        "Career Gap Analysis Skill",
        "No-Fabrication Guardrail Skill",
      ],
      startup: [
        "Startup Founder Resume Skill",
        "Career Transition Skill",
        "Job Search Strategy Skill",
      ],
      "sp-finance": [
        "Executive Resume Skill",
        "Career Positioning Skill",
      ],
      "sp-hr": [
        "Personal Brand Skill",
        "Job Search Strategy Skill",
      ],
      "sp-amlkyc": [
        "AML Resume Skill",
        "KYC Resume Skill",
        "Compliance Resume Skill",
      ],
      "sp-compliance": [
        "Compliance Resume Skill",
        "Career Gap Analysis Skill",
      ],
      "sp-pm": [
        "Product Manager Resume Skill",
        "Metrics Reconstruction Skill",
        "Career Positioning Skill",
      ],
      "sp-eng": [
        "Engineering Resume Skill",
        "System Design Story Skill",
      ],
      "sp-design": [
        "Designer Resume Skill",
        "Portfolio Review Skill",
      ],
      "sp-data": [
        "Metrics Reconstruction Skill",
        "Career Gap Analysis Skill",
      ],
      "sp-growth": [
        "Personal Brand Skill",
        "Job Search Strategy Skill",
      ],
      "sp-sales": [
        "Headhunter Pitch Skill",
        "Career Positioning Skill",
      ],
      "sp-startup": [
        "Startup Founder Resume Skill",
        "Career Transition Skill",
      ],
      "sp-ops": [
        "Career Gap Analysis Skill",
        "Promotion Case Skill",
      ],
    },
  },

  /* ---------- 內建 skill fallback：避免 /skills markdown 無法載入時出現空 skill ---------- */
  skillFallbacks: {
    "Resume Discovery Skill": `**Goal:** Discover the real value behind the user's career history.
**Input:** Target role, existing resume, work experience, projects.
**Output:** Career Profile with usable achievement material.
**Challenge Rules:** Do not accept vague claims; ask for outcome, impact, evidence, scope, and contribution.
**Review Rules:** Check specificity, quantification, role relevance, and verifiability.
**Success Criteria:** At least 5 usable achievement materials are identified.`,
    "Achievement Mining Skill": `**Goal:** Convert job responsibilities into achievements.
**Input:** Raw work descriptions, projects, business context.
**Output:** Achievement Database.
**Challenge Rules:** Ask why each task mattered and what changed because of the user's work.
**Review Rules:** Each item needs action, scope, evidence, and result.
**Success Criteria:** Duties become STAR or XYZ-format achievements.`,
    "Resume Rewrite Skill": `**Goal:** Rewrite resume bullets into sharper, evidence-backed statements.
**Input:** Original bullet, target role, JD, user evidence.
**Output:** Rewritten resume bullets with before/after comparison.
**Challenge Rules:** Do not fabricate metrics, credentials, scope, or responsibilities.
**Review Rules:** Check clarity, specificity, truthfulness, and role relevance.
**Success Criteria:** Each bullet is shorter, stronger, and verifiable.`,
    "ATS Parse Skill": `**Goal:** Check whether the resume is ATS-readable.
**Input:** Resume file or parsed resume text.
**Output:** ATS parse risk report.
**Challenge Rules:** Do not guarantee ATS pass.
**Review Rules:** Identify format, section, keyword, and parsing risks.
**Success Criteria:** Reduces parsing failure risk without keyword stuffing.`,
    "JD Match Skill": `**Goal:** Analyze fit between resume and target job description.
**Input:** Resume, JD, target role, seniority.
**Output:** JD match report.
**Challenge Rules:** Separate required qualifications, preferred qualifications, and missing evidence.
**Review Rules:** Check whether every claimed match is supported by real experience.
**Success Criteria:** User knows what to emphasize, add, or remove.`,
    "Keyword Gap Skill": `**Goal:** Identify missing role-relevant keywords.
**Input:** Resume, JD, industry, target role.
**Output:** Keyword gap list with safe integration suggestions.
**Challenge Rules:** Only add true skills or experience.
**Review Rules:** Keywords must fit naturally into real evidence.
**Success Criteria:** Improves relevance without damaging credibility.`,
    "Recruiter 10-Second Review Skill": `**Goal:** Simulate recruiter first-impression scan.
**Input:** Resume and target role.
**Output:** First-impression verdict.
**Challenge Rules:** If target role and value are unclear in 10 seconds, mark fail.
**Review Rules:** Check positioning, seniority signal, evidence, and readability.
**Success Criteria:** Recruiter can quickly understand fit.`,
    "Red Flag Detection Skill": `**Goal:** Detect resume and career-story red flags.
**Input:** Resume, career timeline, target role.
**Output:** Red flag report with mitigation guidance.
**Challenge Rules:** Flag gaps, title confusion, unsupported metrics, job hopping, and vague transitions.
**Review Rules:** Each risk needs a practical fix or explanation strategy.
**Success Criteria:** Reduces recruiter uncertainty before submission.`,
    "Recruiter Question Skill": `**Goal:** Generate realistic recruiter follow-up questions.
**Input:** Resume, target role, unclear claims.
**Output:** Recruiter question list.
**Challenge Rules:** Focus on unclear, risky, or high-value claims.
**Review Rules:** Questions should reflect realistic screening behavior.
**Success Criteria:** User can prepare before recruiter calls.`,
    "Evidence Request Skill": `**Goal:** Ask targeted questions when a claim lacks proof.
**Input:** Resume claims, achievements, JD requirements.
**Output:** Missing evidence questions.
**Challenge Rules:** Do not rewrite unsupported claims; request proof first.
**Review Rules:** Questions should ask for metric, scope, contribution, baseline, and result.
**Success Criteria:** Weak claims become either evidenced or removed.`,
    "Career Gap Analysis Skill": `**Goal:** Identify gaps between current profile and target role.
**Input:** Resume, JD, target role, career goal.
**Output:** Gap report.
**Challenge Rules:** Separate skill gaps, experience gaps, evidence gaps, and positioning gaps.
**Review Rules:** Each gap must be addressable with concrete actions.
**Success Criteria:** User knows the next concrete improvement steps.`,
    "Resume Summary Skill": `**Goal:** Create a concise role-specific resume summary.
**Input:** Career Profile, target role, strongest evidence.
**Output:** Resume summary options.
**Challenge Rules:** Avoid generic adjectives and empty positioning.
**Review Rules:** Summary must communicate fit in 5 seconds.
**Success Criteria:** Reader understands the candidate's value quickly.`,
    "Bullet Compression Skill": `**Goal:** Shorten verbose bullets without losing proof.
**Input:** Long resume bullets and supporting evidence.
**Output:** Compressed bullets.
**Challenge Rules:** Do not remove metrics, scope, or ownership.
**Review Rules:** Check readability and evidence retention.
**Success Criteria:** Bullets are concise, specific, and strong.`,
    "Metrics Reconstruction Skill": `**Goal:** Help users reconstruct honest metrics from available facts.
**Input:** Raw outcomes, baselines, time ranges, volumes, qualitative proof.
**Output:** Metric candidates and follow-up questions.
**Challenge Rules:** Do not invent numbers.
**Review Rules:** Label estimates, assumptions, and missing data clearly.
**Success Criteria:** User can add credible measurable impact.`,
    "Resume Section Ordering Skill": `**Goal:** Decide which resume sections should appear first.
**Input:** Resume content, seniority, target role, strongest proof.
**Output:** Recommended section order.
**Challenge Rules:** Do not hide the strongest evidence below low-value content.
**Review Rules:** Check scanability, seniority signal, and role fit.
**Success Criteria:** The most relevant proof appears early.`,
    "Skills Section Optimization Skill": `**Goal:** Improve skill section relevance without keyword stuffing.
**Input:** Current skills, JD, actual experience.
**Output:** Optimized skill list and integration notes.
**Challenge Rules:** Remove unproven or irrelevant skills.
**Review Rules:** Skills must be true, searchable, and supported elsewhere.
**Success Criteria:** Skills match target search terms truthfully.`,
    "Self Introduction Skill": `**Goal:** Generate 30-second, 1-minute, and 3-minute self-introduction scripts.
**Input:** Career Profile, target role, target company.
**Output:** Intro scripts.
**Challenge Rules:** Do not produce a chronological life story.
**Review Rules:** Check positioning, proof, transition, and memorability.
**Success Criteria:** Listener remembers the user's professional value.`,
    "STAR Answer Skill": `**Goal:** Generate behavioral interview answers.
**Input:** Achievement Database and target behavioral question.
**Output:** STAR answers.
**Challenge Rules:** Each answer must include conflict, ownership, action, and outcome.
**Review Rules:** Check specificity, credibility, and follow-up resilience.
**Success Criteria:** Each answer can be delivered in under 2 minutes.`,
    "Failure Story Skill": `**Goal:** Prepare credible answers about failure.
**Input:** Failure case, context, consequence, lesson learned.
**Output:** Failure story.
**Challenge Rules:** Do not turn fake weaknesses into praise.
**Review Rules:** Check accountability, learning, behavior change, and maturity.
**Success Criteria:** Shows judgment and growth without damaging credibility.`,
    "Behavioral Interview Drill Skill": `**Goal:** Drill behavioral questions with realistic follow-up pressure.
**Input:** Interview stories, target role, weak areas.
**Output:** Practice questions, scoring rubric, follow-up prompts.
**Challenge Rules:** Push beyond polished first answers.
**Review Rules:** Check clarity, evidence, ownership, and resilience under follow-up.
**Success Criteria:** User can answer with credible, specific stories.`,
    "Mock Interview Reviewer Skill": `**Goal:** Review interview responses for clarity, credibility, and risk.
**Input:** User answer, target question, target role.
**Output:** Score, weaknesses, improved answer, follow-up questions.
**Challenge Rules:** Do not overpraise vague answers.
**Review Rules:** Identify missing context, action, result, and evidence.
**Success Criteria:** User receives actionable interview improvement.`,
    "Case Interview Prep Skill": `**Goal:** Prepare structured answers for case-style interviews.
**Input:** Case prompt, target role, domain context.
**Output:** Framework, sample answer, rubric, likely follow-ups.
**Challenge Rules:** Require assumptions, tradeoffs, and measurable success criteria.
**Review Rules:** Check structure, business logic, and decision clarity.
**Success Criteria:** User can reason through ambiguous business questions.`,
    "Career Positioning Skill": `**Goal:** Define the user's strongest market positioning for a target role.
**Input:** Career Profile, target role, strongest proof, constraints.
**Output:** Positioning statement and supporting proof points.
**Challenge Rules:** Avoid broad, generic identity claims.
**Review Rules:** Check differentiation, evidence, and recruiter clarity.
**Success Criteria:** User can explain why they fit the target role.`,
    "Career Transition Skill": `**Goal:** Reframe past experience for a new industry or role.
**Input:** Current experience, target role, transferable skills.
**Output:** Transition narrative and resume positioning.
**Challenge Rules:** Do not hide gaps; explain transferability with proof.
**Review Rules:** Check relevance, credibility, and missing bridge evidence.
**Success Criteria:** Past experience supports the new direction.`,
    "Job Search Strategy Skill": `**Goal:** Plan target roles, outreach, applications, and feedback loops.
**Input:** Career goal, target market, available time, constraints.
**Output:** Job search plan.
**Challenge Rules:** Avoid generic channel lists.
**Review Rules:** Check target precision, weekly actions, and feedback capture.
**Success Criteria:** User has a repeatable search workflow.`,
    "Cover Letter Skill": `**Goal:** Generate role-specific cover letters without repeating the resume.
**Input:** Resume, JD, company context, strongest motivation.
**Output:** Cover letter draft.
**Challenge Rules:** Do not use generic enthusiasm or unsupported claims.
**Review Rules:** Check relevance, specificity, and proof.
**Success Criteria:** Letter explains why this role and why this candidate.`,
    "Headhunter Pitch Skill": `**Goal:** Create a short pitch for recruiters or executive search.
**Input:** Career Profile, target role, strongest business impact.
**Output:** Recruiter pitch.
**Challenge Rules:** Avoid long biography and vague seniority claims.
**Review Rules:** Check market positioning, compensation logic, and clarity.
**Success Criteria:** Recruiter can quickly understand why to engage.`,
    "Offer Comparison Skill": `**Goal:** Compare offers across compensation, scope, growth, risk, and fit.
**Input:** Offers, career goals, constraints, preferences.
**Output:** Offer decision matrix.
**Challenge Rules:** Include risk and long-term fit, not just salary.
**Review Rules:** Check tradeoffs, assumptions, and decision criteria.
**Success Criteria:** User can choose rationally.`,
    "Personal Brand Skill": `**Goal:** Build consistent positioning across resume, LinkedIn, portfolio, and outreach.
**Input:** Career Profile, target audience, proof points.
**Output:** Personal brand narrative and channel-specific messaging.
**Challenge Rules:** Avoid buzzwords and inflated claims.
**Review Rules:** Check consistency, evidence, and memorability.
**Success Criteria:** User presents one clear professional story.`,
    "Portfolio Review Skill": `**Goal:** Review portfolio structure, proof, case depth, and hiring relevance.
**Input:** Portfolio outline, project links, target role.
**Output:** Portfolio review and improvement list.
**Challenge Rules:** Do not accept visuals without decision evidence.
**Review Rules:** Check problem, process, tradeoff, impact, and role fit.
**Success Criteria:** Hiring manager wants to review the portfolio.`,
    "GitHub Profile Review Skill": `**Goal:** Review GitHub profile, pinned repos, README, and technical credibility.
**Input:** GitHub profile, repos, target engineering role.
**Output:** GitHub profile improvement plan.
**Challenge Rules:** Do not treat activity as proof without project quality.
**Review Rules:** Check README clarity, architecture, tests, and pinned repo relevance.
**Success Criteria:** Profile supports technical credibility.`,
    "Executive Resume Skill": `**Goal:** Build an executive-level resume.
**Input:** Leadership scope, revenue impact, organization size, strategic outcomes.
**Output:** Executive resume direction and bullets.
**Challenge Rules:** Do not over-focus on execution details.
**Review Rules:** Check leadership leverage, strategy, P&L, transformation, and board-level credibility.
**Success Criteria:** Suitable for director, VP, C-level, or board-facing roles.`,
    "Board Bio Skill": `**Goal:** Generate board or advisory bio.
**Input:** Executive experience, industry expertise, achievements.
**Output:** Executive bio.
**Challenge Rules:** Do not make it sound like a normal resume.
**Review Rules:** Check authority, relevance, and credibility.
**Success Criteria:** Can be used on websites, proposals, board packets, or advisory profiles.`,
    "Promotion Case Skill": `**Goal:** Build a promotion argument.
**Input:** Work outcomes, impact evidence, level expectations.
**Output:** Promotion case.
**Challenge Rules:** Do not rely on effort alone; require business impact.
**Review Rules:** Check level alignment, measurable outcomes, and manager relevance.
**Success Criteria:** Can be used in performance or promotion discussion.`,
    "Product Manager Resume Skill": `**Goal:** Optimize PM resume content.
**Input:** Products, metrics, users, roadmap, launches, experiments.
**Output:** PM resume bullets.
**Challenge Rules:** Do not only describe coordination; require decisions and outcomes.
**Review Rules:** Check metrics, prioritization, tradeoffs, launch impact, and customer insight.
**Success Criteria:** Shows product judgment and business impact.`,
    "Engineering Resume Skill": `**Goal:** Optimize engineering resume content.
**Input:** Tech stack, projects, systems, scale, incidents, ownership.
**Output:** Engineering resume bullets.
**Challenge Rules:** Require technical depth and measurable impact.
**Review Rules:** Check scale, latency, reliability, architecture, tradeoffs, and ownership.
**Success Criteria:** Hiring manager can evaluate technical capability.`,
    "System Design Story Skill": `**Goal:** Turn technical projects into interview stories.
**Input:** Technical project, architecture, constraints, tradeoffs.
**Output:** System design interview story.
**Challenge Rules:** Must include tradeoffs and constraints.
**Review Rules:** Check architecture, bottlenecks, decision quality, and results.
**Success Criteria:** Supports senior engineering interviews.`,
    "Designer Resume Skill": `**Goal:** Optimize designer resume content.
**Input:** Portfolio, UX cases, design systems, research, product outcomes.
**Output:** Designer resume direction and bullets.
**Challenge Rules:** Do not only list tools.
**Review Rules:** Check problem framing, process, collaboration, evidence, and portfolio connection.
**Success Criteria:** Hiring manager wants to review the portfolio.`,
    "Compliance Resume Skill": `**Goal:** Optimize resumes for compliance, risk, or audit roles.
**Input:** Compliance experience, regulations, controls, reviews, audit cases.
**Output:** Compliance resume bullets.
**Challenge Rules:** Do not disclose sensitive case information.
**Review Rules:** Check risk-management capability, regulatory language, and control ownership.
**Success Criteria:** Fits compliance, risk, and audit recruiting expectations.`,
    "AML Resume Skill": `**Goal:** Optimize resumes for AML roles.
**Input:** AML, SAR, transaction monitoring, investigations, risk typologies.
**Output:** AML resume bullets.
**Challenge Rules:** Do not exaggerate regulatory authority or disclose confidential cases.
**Review Rules:** Check case volume, risk indicators, escalation, and process improvement.
**Success Criteria:** Matches financial-crime compliance recruiting language.`,
    "KYC Resume Skill": `**Goal:** Optimize resumes for KYC and onboarding roles.
**Input:** KYC process, CDD, EDD, onboarding, periodic review, client risk.
**Output:** KYC resume bullets.
**Challenge Rules:** Do not expose client data.
**Review Rules:** Check process ownership, risk judgment, volume, quality, and controls.
**Success Criteria:** Clearly demonstrates KYC review capability.`,
    "Startup Founder Resume Skill": `**Goal:** Convert founder experience into job-market value.
**Input:** Startup experience, product, revenue, users, fundraising, failure reasons.
**Output:** Founder resume story.
**Challenge Rules:** Do not hide behind vague founder titles.
**Review Rules:** Check ownership, execution, learning, traction, and transferability.
**Success Criteria:** Experience can transfer into PM, Growth, BizOps, leadership, or strategy roles.`,
    "LinkedIn Headline Skill": `**Goal:** Generate searchable LinkedIn headlines.
**Input:** Target role, core skills, strongest achievements.
**Output:** 3-5 headline options.
**Challenge Rules:** Avoid vague titles and buzzword strings.
**Review Rules:** Check positioning clarity and recruiter search relevance.
**Success Criteria:** Professional value is understandable in 5 seconds.`,
    "LinkedIn About Skill": `**Goal:** Rewrite the LinkedIn About section.
**Input:** Career Profile and target audience.
**Output:** LinkedIn About section.
**Challenge Rules:** Do not write a generic autobiography.
**Review Rules:** Check positioning, evidence, voice, and CTA.
**Success Criteria:** Recruiter wants to continue reading the profile.`,
    "LinkedIn Experience Skill": `**Goal:** Rewrite LinkedIn experience sections.
**Input:** Work history and achievement database.
**Output:** LinkedIn Experience section.
**Challenge Rules:** Do not simply copy the resume.
**Review Rules:** Check readability, searchability, and story flow.
**Success Criteria:** Experience reads naturally and supports target positioning.`,
    "LinkedIn Skills Skill": `**Goal:** Optimize the LinkedIn skills section.
**Input:** Current skills, target role, target industry.
**Output:** LinkedIn skills list and ordering guidance.
**Challenge Rules:** Do not add unproven skills.
**Review Rules:** Check keyword fit, truthfulness, and support from evidence.
**Success Criteria:** Skills match target search terms without keyword stuffing.`,
    "LinkedIn Featured Skill": `**Goal:** Choose the most credible Featured items for LinkedIn.
**Input:** Projects, posts, articles, portfolio links, target role.
**Output:** Featured section recommendations.
**Challenge Rules:** Do not feature weak or irrelevant material.
**Review Rules:** Check relevance, proof, and narrative fit.
**Success Criteria:** Featured section reinforces the target positioning.`,
    "LinkedIn Recruiter Search Skill": `**Goal:** Improve LinkedIn discoverability for recruiters.
**Input:** Profile text, headline, skills, target roles, industry language.
**Output:** Search optimization recommendations.
**Challenge Rules:** Do not keyword-stuff or misrepresent experience.
**Review Rules:** Check natural keyword placement and profile completeness.
**Success Criteria:** Recruiters can find the profile more easily.`,
    "LinkedIn Content Positioning Skill": `**Goal:** Define credible content themes for LinkedIn.
**Input:** Career goals, expertise, proof points, audience.
**Output:** 3-5 content pillars and posting angles.
**Challenge Rules:** Avoid generic thought leadership.
**Review Rules:** Check audience fit, proof, and repeatability.
**Success Criteria:** User has clear, credible topics to post about.`,
    "Referral Request Skill": `**Goal:** Write referral requests that are specific, polite, and easy to act on.
**Input:** Target role, referrer relationship, resume summary, reason for fit.
**Output:** Referral request message.
**Challenge Rules:** Do not pressure the referrer or assume they owe help.
**Review Rules:** Check clarity, context, proof, and ease of forwarding.
**Success Criteria:** Referrer can decide and act without extra work.`,
    "Recommendation Letter Skill": `**Goal:** Draft a recommendation letter or reference note grounded in real observation.
**Input:** Recommender relationship, observed strengths, target purpose, concrete examples.
**Output:** Recommendation letter draft.
**Challenge Rules:** Do not invent personal observations or exaggerate familiarity.
**Review Rules:** Check credibility, specificity, tone, and recipient fit.
**Success Criteria:** The letter sounds authentic and useful.`,
    "Assessment Design Skill": `**Goal:** Design a role-relevant assessment or aptitude check.
**Input:** Target role, desired competencies, evidence, constraints.
**Output:** Assessment structure, questions, and scoring rubric.
**Challenge Rules:** Do not create vague personality tests.
**Review Rules:** Check role relevance, clarity, and measurability.
**Success Criteria:** Assessment can distinguish real capability fairly.`,
    "Bias Check Skill": `**Goal:** Detect unfair or irrelevant bias in an assessment.
**Input:** Assessment draft, target role, context.
**Output:** Bias and fairness review.
**Challenge Rules:** Flag proxies that do not relate to job performance.
**Review Rules:** Check fairness, relevance, and clarity.
**Success Criteria:** Assessment becomes more equitable and job-related.`,
    "Role Targeting Skill": `**Goal:** Pick realistic target roles and narrow the search.
**Input:** Current experience, market context, career goals.
**Output:** Role shortlist and priority order.
**Challenge Rules:** Challenge unrealistic or too-broad targets.
**Review Rules:** Check fit, stretch, and marketability.
**Success Criteria:** User has a focused target-role plan.`,
    "CEO Skill": `**Goal:** Evaluate business value, strategic risk, and whether the work is worth building.
**Input:** Target customer, paying customer, pricing, acquisition, competitors, moat hypothesis.
**Output:** Revenue model, growth plan, strategic risk, and moat assessment.
**Challenge Rules:** Answer who pays, why they pay now, and why competitors cannot easily copy it.
**Review Rules:** Score revenue clarity, willingness to pay, cost feasibility, scalability, moat, and focus.
**Success Criteria:** Business assumptions are explicit and testable.`,
    "No-Fabrication Guardrail Skill": `**Goal:** Prevent invented achievements, metrics, credentials, roles, or outcomes.
**Input:** Any resume, interview, LinkedIn, portfolio, or career asset request.
**Output:** Truthfulness constraints and missing-evidence labels.
**Challenge Rules:** Mark unsupported content as needing user input instead of filling gaps.
**Review Rules:** Check every strong claim for evidence, source, scope, and plausibility.
**Success Criteria:** Output remains truthful, verifiable, and safe to use.`,
  },

  /* ---------- 成果範例（完成頁「查看成果範例」用，示意 AI 會產出的樣子） ---------- */
  samples: {
    cv: {
      zh: `【履歷挑戰報告（節錄範例）】

1. 10 秒招募者判讀
結論：方向不清楚。看了 10 秒仍不確定你是 PM 還是專案經理。
風險：招募者可能直接略過。

3. 挑戰發現
· 發現：「負責跨部門溝通」
  類別：缺少商業價值　嚴重度：P1
  為何失敗：只描述職責，沒有結果與你的個人貢獻。
  需追問：協調了幾個團隊？交付了什麼？省了多少時間？
  修正方向：改寫成「主導 3 個跨部門專案，將交付週期縮短 28%」。

9. 優先修正順序
P0：補上量化成果　P1：對齊 JD 關鍵字　P2：精簡冗長 bullet`,
      en: `[Resume Challenge Report — sample excerpt]

1. 10-Second Recruiter Verdict
Verdict: Unclear positioning — after 10s it's still unclear if you're a PM or a project manager.
Risk: Recruiter may skip.

3. Challenge Findings
· Finding: "Responsible for cross-functional communication"
  Category: Missing business value | Severity: P1
  Why it fails: Describes a duty, no result or personal contribution.
  Ask: How many teams? What was delivered? How much time saved?
  Fix: Rewrite as "Led 3 cross-functional projects, cutting delivery cycle by 28%."

9. Priority: P0 add metrics · P1 align JD keywords · P2 trim long bullets`,
    },
    interview: {
      zh: `【面試模擬（節錄範例）】

題目：請講一個你創造可量化影響的專案。
考官：Amazon Bar Raiser　類別：行為面試（STAR）
這題在測：ownership 與成果是否可信。

（你回答後）
評分：3 / 5
弱點：情境清楚，但沒講清楚「你個人」做了什麼、缺少數字。
更強的版本：「我發現 X 問題（S/T），我主導 Y（A），3 個月內讓轉換率從 1.8% 提升到 4.6%（R）。」
可能追問：你怎麼確定是你的改動帶來成長？`,
      en: `[Mock interview — sample excerpt]

Question: Tell me about a project where you created measurable impact.
Interviewer: Amazon Bar Raiser | Category: Behavioral (STAR)
What this tests: ownership and whether the impact is credible.

(After your answer)
Score: 3 / 5
Weakness: Situation is clear, but your personal action and the numbers are missing.
Stronger version: "I found problem X (S/T), I led Y (A), lifting conversion from 1.8% to 4.6% in 3 months (R)."
Likely follow-up: How do you know your change drove the growth?`,
    },
    linkedin: {
      zh: `【LinkedIn 優化包（節錄範例）】

1. Profile Verdict
目前問題：Headline 太像履歷職稱，沒有搜尋關鍵字與差異化。
優先順序：先修 Headline，再補 About，最後重寫 Experience。

2. Headline Options
- Product Manager | Growth | B2B SaaS | 產品策略與成長實驗
- PM focused on user insight, metrics, and launches`,
      en: `[LinkedIn optimization pack — sample excerpt]

1. Profile Verdict
Current issue: the headline reads like a plain job title and lacks keywords / differentiation.
Priority: fix the headline first, then About, then Experience.

2. Headline Options
- Product Manager | Growth | B2B SaaS | Product strategy and experiments
- PM focused on user insight, metrics, and launches`,
    },
    recommendation: {
      zh: `【推薦文 / 推薦信（節錄範例）】

1. 核心結論
我在過去兩年和你密切合作，最能代表你的特質是可靠、主動與高標準交付。

2. 具體證據
- 主導跨部門專案，提前兩週完成
- 在壓力情境下仍能保持溝通品質

3. 草稿方向
我很樂意推薦 XXX，因為他/她不只完成任務，也能主動提出更好的做法。`,
      en: `[Recommendation draft — sample excerpt]

1. Core conclusion
I worked closely with you for two years, and the traits that best define you are reliability, initiative, and high standards.

2. Evidence
- Led a cross-functional project two weeks ahead of schedule
- Maintained communication quality under pressure

3. Draft direction
I am glad to recommend XXX because they do not just finish tasks; they proactively improve the way the work is done.`,
    },
    assessment: {
      zh: `【適性測驗（節錄範例）】

1. Role-fit Verdict
目前較適合：PM / BizOps / Growth
原因：你對結構化問題與跨部門協調有明顯優勢。

2. Improvement Plan
- 補強量化證據
- 練習 2 分鐘 STAR 答題
- 針對目標角色補一個實戰案例`,
      en: `[Assessment pack — sample excerpt]

1. Role-fit Verdict
Most suitable for: PM / BizOps / Growth
Reason: strong structured thinking and cross-functional coordination.

2. Improvement Plan
- Strengthen quantified evidence
- Practice 2-minute STAR answers
- Add one role-specific case study`,
    },
    website: {
      zh: `【個人網站規劃（節錄範例）】

頁面結構：Hero → 精選作品 → 經歷 → 技能 → 聯絡
Hero 文案：「產品設計師，把複雜流程變簡單。」
作品區：每個專案用「問題 → 我的決策 → 成果」三段呈現。
視覺建議：白底、單一主色、大量留白；標題用粗體無襯線字。`,
      en: `[Personal website plan — sample excerpt]

Structure: Hero → Selected work → Experience → Skills → Contact
Hero copy: "Product designer who makes complex flows simple."
Work: present each project as "Problem → My decision → Result".
Visual: white background, one accent color, lots of whitespace; bold sans-serif headings.`,
    },
  },
};
