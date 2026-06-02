const personas = [
  {
    id: "landlord",
    icon: "租",
    name: "收租公",
    pursuit: "穩定現金流",
    subtitle: "你追求的是穩定現金流，而不是追逐短期暴漲。",
    tone: "希望每個月有一點被動收入，看帳戶時不要像坐雲霄飛車。",
    focuses: [
      ["適合關注", "月配息基金", "先看配息節奏是否符合現金流需求。"],
      ["也可觀察", "高股息基金", "用股票收益創造現金流，但仍有淨值波動。"],
      ["需要理解", "收益型基金", "配息來源、費用與本金變動都要一起看。"],
    ],
    logic: "收租公在意的不是一時暴衝，而是收入節奏是否穩定、配息是否可理解，以及市場下跌時能不能繼續持有。",
    metrics: [
      ["配息頻率", "月配或季配優先，但配息不等於保證收益。"],
      ["淨值波動", "收息同時仍可能面對淨值下跌。"],
      ["最大回撤", "看歷史下跌幅度，確認自己是否能承受。"],
    ],
    funds: ["incomeA", "incomeB", "balancedA"],
    team: "收益投資團隊",
    sim: { rate: 0.045, range: "約 8% - 14%", drawdown: "-12.6%", risk: "RR3" },
  },
  {
    id: "keeper",
    icon: "櫃",
    name: "掌櫃",
    pursuit: "穩健保值",
    subtitle: "你要的不是每天刺激，而是資產不要大起大落。",
    tone: "你寧願慢一點，也不想遇到大跌時完全睡不著。",
    focuses: [
      ["適合關注", "平衡型基金", "股票與債券搭配，降低單一市場波動。"],
      ["也可觀察", "投資級債基金", "偏重信用品質與穩定收益。"],
      ["需要理解", "低波動策略", "低波動不是不會跌，而是跌幅通常較受控。"],
    ],
    logic: "掌櫃最怕的是本金大幅波動，所以判斷時先看風險等級、波動度與最大回撤，而不是先追最高報酬。",
    metrics: [
      ["風險等級", "優先看 RR2-RR3 的候選基金。"],
      ["波動度", "控制起伏，降低中途放棄機率。"],
      ["修復時間", "看歷史下跌後多久回到原本水準。"],
    ],
    funds: ["balancedA", "bondA", "globalA"],
    team: "多資產配置團隊",
    sim: { rate: 0.026, range: "約 5% - 9%", drawdown: "-8.4%", risk: "RR2" },
  },
  {
    id: "taoist",
    icon: "道",
    name: "道士",
    pursuit: "高風險高報酬",
    subtitle: "你想抓成長機會，但要知道每一次衝刺都可能伴隨大幅震盪。",
    tone: "你不是怕跌，而是怕錯過成長。但波動來的時候要確定自己不會半路下車。",
    focuses: [
      ["適合關注", "科技主題基金", "成長動能明確，但波動通常也更高。"],
      ["也可觀察", "新興市場基金", "市場機會大，匯率與區域風險也更明顯。"],
      ["需要理解", "同類排名", "看是否真的優於同類，而不是只跟低風險基金比。"],
    ],
    logic: "道士可以接受短期虧損，所以會先看 3M、6M、1Y 動能與同類排名，但仍要把最大回撤放在旁邊警示。",
    metrics: [
      ["成長動能", "觀察 3M / 6M / 1Y 是否持續。"],
      ["同類排名", "避免只被絕對報酬率吸引。"],
      ["MDD 警示", "高成長基金必須知道歷史最大跌幅。"],
    ],
    funds: ["techA", "growthA", "emergingA"],
    team: "主題成長團隊",
    sim: { rate: 0.015, range: "約 18% - 28%", drawdown: "-31.8%", risk: "RR5" },
  },
  {
    id: "farmer",
    icon: "農",
    name: "農夫",
    pursuit: "長期累積",
    subtitle: "你相信時間與紀律，不追求一次暴富，而是讓資產慢慢長大。",
    tone: "每月固定投入，比每天猜高低點更適合你的節奏。",
    focuses: [
      ["適合關注", "TISA 候選基金", "適合長期持有與定期投入情境。"],
      ["也可觀察", "全球股票基金", "用全球分散降低單一市場依賴。"],
      ["需要理解", "長期績效", "看 1Y、3Y 與波動穩定度，不只看短期熱門。"],
    ],
    logic: "農夫的核心是持續投入，所以判斷時優先看長期穩定度、費用、定期定額適合度與投資區域分散。",
    metrics: [
      ["長期績效", "看 1Y / 3Y 的累積表現。"],
      ["定期投入", "確認是否適合分批進場。"],
      ["費用意識", "長期投資時費用會影響累積成果。"],
    ],
    funds: ["globalA", "balancedA", "tisaA"],
    team: "長期配置團隊",
    sim: { rate: 0.018, range: "約 10% - 16%", drawdown: "-18.2%", risk: "RR3" },
  },
  {
    id: "traveler",
    icon: "旅",
    name: "商旅客",
    pursuit: "全球機會",
    subtitle: "你不想只押單一市場，而是想跟著全球資金與產業趨勢移動。",
    tone: "你看的是世界地圖，不是只看台股或單一產業。",
    focuses: [
      ["適合關注", "全球多資產基金", "用多市場、多資產分散配置。"],
      ["也可觀察", "區域型基金", "依市場趨勢捕捉特定區域機會。"],
      ["需要理解", "匯率風險", "海外基金除了市場波動，也會受匯率影響。"],
    ],
    logic: "商旅客重視全球機會，所以會看區域分散、幣別、產業配置與市場趨勢，而不是單看某一檔基金短期績效。",
    metrics: [
      ["區域配置", "避免過度集中單一市場。"],
      ["幣別風險", "海外投資需理解匯率影響。"],
      ["主題分散", "科技、債券、股息與區域配置要能搭配。"],
    ],
    funds: ["globalA", "emergingA", "incomeB"],
    team: "全球市場團隊",
    sim: { rate: 0.024, range: "約 12% - 20%", drawdown: "-22.4%", risk: "RR4" },
  },
  {
    id: "collector",
    icon: "藏",
    name: "收藏家",
    pursuit: "只買最好的",
    subtitle: "你重視基金公司、經理人、評級與長期證明，不想只買熱門名字。",
    tone: "你不是只看漲幅，而是想知道這檔基金為什麼值得被放進核心清單。",
    focuses: [
      ["適合關注", "高評級基金", "看長期表現與風險控制是否一致。"],
      ["也可觀察", "明星經理人基金", "了解投資哲學與團隊穩定度。"],
      ["需要理解", "績效歸因", "確認報酬來自能力、風格，還是單次市場行情。"],
    ],
    logic: "收藏家在意品質與可驗證性，所以除了績效，也看基金公司、管理團隊、投資哲學與同類競爭力。",
    metrics: [
      ["長期排名", "看 1Y / 3Y / 5Y 是否穩定。"],
      ["經理人年資", "理解策略是否有穩定操盤者。"],
      ["管理規模", "觀察基金是否具備一定市場信任度。"],
    ],
    funds: ["techA", "globalA", "tisaA"],
    team: "精選研究團隊",
    sim: { rate: 0.02, range: "約 11% - 18%", drawdown: "-19.7%", risk: "RR4" },
  },
];

const funds = {
  incomeA: {
    name: "好好全球收益精選基金",
    company: "FundSwap Asset Management",
    risk: "RR3",
    age: "成立 8 年",
    dividend: "月配",
    team: "收益投資團隊",
    tag: "現金流",
    reason: "過去長期以穩定收益與配息節奏為主要目標，適合希望建立現金流的投資人先觀察。",
  },
  incomeB: {
    name: "全球高股息配置基金",
    company: "FundSwap Global Partners",
    risk: "RR4",
    age: "成立 6 年",
    dividend: "季配",
    team: "全球市場團隊",
    tag: "高股息",
    reason: "以股息與全球股票配置作為主要收益來源，但仍需留意股票市場修正與匯率波動。",
  },
  balancedA: {
    name: "穩健多資產平衡基金",
    company: "FundSwap Asset Management",
    risk: "RR3",
    age: "成立 11 年",
    dividend: "季配",
    team: "多資產配置團隊",
    tag: "穩健",
    reason: "用股票、債券與現金部位分散波動，較適合不想承受單一市場大幅震盪的投資者。",
  },
  bondA: {
    name: "美元投資級債券基金",
    company: "FundSwap Fixed Income",
    risk: "RR2",
    age: "成立 9 年",
    dividend: "月配",
    team: "信用研究團隊",
    tag: "債券",
    reason: "主要投資投資級債券，適合重視信用品質與波動控制的投資者觀察。",
  },
  techA: {
    name: "全球科技成長基金",
    company: "FundSwap Innovation",
    risk: "RR5",
    age: "成立 7 年",
    dividend: "不配息",
    team: "主題成長團隊",
    tag: "科技",
    reason: "聚焦科技與創新題材，成長想像大，但短期淨值波動也可能明顯。",
  },
  growthA: {
    name: "亞洲創新成長基金",
    company: "FundSwap Asia",
    risk: "RR5",
    age: "成立 5 年",
    dividend: "不配息",
    team: "區域研究團隊",
    tag: "成長",
    reason: "適合願意承擔高波動、追求亞洲成長題材的投資人，但需留意區域集中風險。",
  },
  emergingA: {
    name: "新興市場機會基金",
    company: "FundSwap Global Partners",
    risk: "RR5",
    age: "成立 10 年",
    dividend: "不配息",
    team: "全球市場團隊",
    tag: "新興市場",
    reason: "提供新興市場成長機會，但政治、匯率與流動性風險都比成熟市場更高。",
  },
  globalA: {
    name: "全球核心配置基金",
    company: "FundSwap Asset Management",
    risk: "RR3",
    age: "成立 12 年",
    dividend: "不配息",
    team: "長期配置團隊",
    tag: "全球配置",
    reason: "以全球分散配置降低單一市場依賴，較適合作為長期累積或核心配置候選。",
  },
  tisaA: {
    name: "好好 TISA 長期累積基金",
    company: "FundSwap Asset Management",
    risk: "RR3",
    age: "成立 4 年",
    dividend: "不配息",
    team: "長期配置團隊",
    tag: "TISA",
    reason: "以長期持有與定期投入情境設計，適合想建立紀律投資流程的使用者先了解。",
  },
};

const teamProfiles = {
  收益投資團隊: {
    company: "FundSwap Asset Management",
    scale: "管理規模：NT$ 860 億",
    background: "成員來自固定收益、股息策略與總經研究。",
    philosophy: "用可理解的收益來源與風險控管，協助投資人建立長期現金流。",
  },
  多資產配置團隊: {
    company: "FundSwap Asset Management",
    scale: "管理規模：NT$ 1,120 億",
    background: "成員涵蓋股票、債券與資產配置研究。",
    philosophy: "先控制下跌，再追求合理報酬，讓投資人比較容易長期持有。",
  },
  主題成長團隊: {
    company: "FundSwap Innovation",
    scale: "管理規模：NT$ 540 億",
    background: "專注科技、AI、半導體與創新產業研究。",
    philosophy: "尋找長期成長趨勢，但用風險警示讓投資人知道代價。",
  },
  長期配置團隊: {
    company: "FundSwap Asset Management",
    scale: "管理規模：NT$ 970 億",
    background: "負責全球配置、TISA 候選與定期投入策略。",
    philosophy: "不追逐短期熱點，而是讓使用者用紀律與時間累積資產。",
  },
  全球市場團隊: {
    company: "FundSwap Global Partners",
    scale: "管理規模：NT$ 780 億",
    background: "追蹤美國、歐洲、亞洲與新興市場配置機會。",
    philosophy: "用全球視角分散單一市場風險，並清楚揭露匯率與區域風險。",
  },
  精選研究團隊: {
    company: "FundSwap Research",
    scale: "管理規模：NT$ 690 億",
    background: "專注基金評級、經理人研究與績效歸因。",
    philosophy: "把基金從熱門排行榜拉回可驗證的長期品質。",
  },
};

const questions = [
  ["我適合什麼基金？", "先不要從基金名稱開始，先看你最在意的是現金流、穩健保值、成長、長期累積、全球機會，還是基金品質。這個 Demo 會依人格切換適合觀察的基金類型。"],
  ["高股息適合我嗎？", "如果你需要現金流，可以把高股息列入觀察；但高股息仍有淨值波動，也可能受市場、匯率與配息政策影響。"],
  ["配息是不是左手換右手？", "配息可能來自收益，也可能影響淨值。重點不是只看配息率，而是一起看總報酬、淨值波動、配息來源與費用。"],
  ["為什麼推薦這檔基金？", "這裡不用『推薦買』，而是說明它為什麼符合目前人格的觀察條件，例如配息節奏、波動控制、長期配置或成長動能。"],
];

let activePersonaId = "landlord";
let amount = 300000;

const personaGrid = document.querySelector("#personaGrid");
const resultAvatar = document.querySelector("#resultAvatar");
const resultTitle = document.querySelector("#resultTitle");
const resultSubtitle = document.querySelector("#resultSubtitle");
const focusGrid = document.querySelector("#focusGrid");
const logicTitle = document.querySelector("#logicTitle");
const logicCopy = document.querySelector("#logicCopy");
const metricStack = document.querySelector("#metricStack");
const fundGrid = document.querySelector("#fundGrid");
const teamCard = document.querySelector("#teamCard");
const simPersonaName = document.querySelector("#simPersonaName");
const monthlyIncome = document.querySelector("#monthlyIncome");
const yearIncome = document.querySelector("#yearIncome");
const volRange = document.querySelector("#volRange");
const maxDrawdown = document.querySelector("#maxDrawdown");
const riskLevel = document.querySelector("#riskLevel");
const amountRow = document.querySelector("#amountRow");
const customAmount = document.querySelector("#customAmount");
const helperToggle = document.querySelector("#helperToggle");
const helperPanel = document.querySelector("#helperPanel");
const helperClose = document.querySelector("#helperClose");
const helperBody = document.querySelector("#helperBody");
const helperQuestions = document.querySelector("#helperQuestions");

function getPersona() {
  return personas.find((persona) => persona.id === activePersonaId) || personas[0];
}

function formatCurrency(value) {
  return `NT$ ${Math.round(value).toLocaleString("zh-TW")}`;
}

function renderPersonas() {
  personaGrid.innerHTML = personas
    .map(
      (persona) => `
        <button class="persona-card ${persona.id === activePersonaId ? "active" : ""}" type="button" data-persona="${persona.id}">
          <span class="persona-icon">${persona.icon}</span>
          <strong>${persona.name}</strong>
          <p>${persona.pursuit}</p>
          <small>${persona.tone}</small>
        </button>
      `
    )
    .join("");
}

function renderResult() {
  const persona = getPersona();
  resultAvatar.textContent = persona.icon;
  resultTitle.textContent = `你的投資本性：${persona.name}`;
  resultSubtitle.textContent = persona.subtitle;
  logicTitle.textContent = `${persona.name}看的是什麼？`;
  logicCopy.textContent = persona.logic;
  simPersonaName.textContent = persona.name;

  focusGrid.innerHTML = persona.focuses
    .map(
      ([label, title, copy]) => `
        <article class="focus-item">
          <span>${label}</span>
          <strong>${title}</strong>
          <p>${copy}</p>
        </article>
      `
    )
    .join("");

  metricStack.innerHTML = persona.metrics
    .map(
      ([title, copy]) => `
        <article class="metric-item">
          <span>判斷指標</span>
          <strong>${title}</strong>
          <p>${copy}</p>
        </article>
      `
    )
    .join("");
}

function renderFunds() {
  const persona = getPersona();
  fundGrid.innerHTML = persona.funds
    .map((id) => {
      const fund = funds[id];
      return `
        <article class="fund-card">
          <header>
            <span class="fund-tag">${fund.tag}</span>
            <h3>${fund.name}</h3>
            <div class="fund-company">${fund.company}</div>
          </header>
          <div class="fund-meta">
            <div><span>風險等級</span><strong>${fund.risk}</strong></div>
            <div><span>成立年數</span><strong>${fund.age}</strong></div>
            <div><span>配息頻率</span><strong>${fund.dividend}</strong></div>
            <div><span>管理團隊</span><strong>${fund.team}</strong></div>
          </div>
          <p class="fund-reason"><strong>為什麼適合你：</strong>${fund.reason}</p>
          <div class="fund-actions">
            <button type="button" class="btn primary">加入比較</button>
            <button type="button" class="btn ghost">看詳情</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTeam() {
  const persona = getPersona();
  const team = teamProfiles[persona.team] || teamProfiles["收益投資團隊"];
  teamCard.innerHTML = `
    <h3>${persona.team}</h3>
    <p>${team.company}</p>
    <div class="team-meta">
      <span>${team.scale}</span>
      <span>${team.background}</span>
    </div>
    <p><strong>投資哲學：</strong>${team.philosophy}</p>
    <div class="team-video">
      <span>影片 / 訪談 / 經理人專訪區塊預留<br />正式版可放入基金經理人觀點與錯誤反思。</span>
    </div>
  `;
}

function renderSimulator() {
  const persona = getPersona();
  const yearly = amount * persona.sim.rate;
  monthlyIncome.textContent = formatCurrency(yearly / 12);
  yearIncome.textContent = formatCurrency(yearly);
  volRange.textContent = persona.sim.range;
  maxDrawdown.textContent = persona.sim.drawdown;
  riskLevel.textContent = persona.sim.risk;
}

function renderHelperQuestions() {
  helperQuestions.innerHTML = questions
    .map(([question]) => `<button type="button" data-question="${question}">${question}</button>`)
    .join("");
}

function setPersona(id) {
  activePersonaId = id;
  renderPersonas();
  renderResult();
  renderFunds();
  renderTeam();
  renderSimulator();
}

personaGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-persona]");
  if (!button) return;
  setPersona(button.dataset.persona);
});

amountRow.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-amount]");
  if (!button) return;
  amount = Number(button.dataset.amount);
  customAmount.value = "";
  amountRow.querySelectorAll("button[data-amount]").forEach((item) => item.classList.toggle("active", item === button));
  renderSimulator();
});

customAmount.addEventListener("input", () => {
  const nextAmount = Number(customAmount.value);
  if (!Number.isFinite(nextAmount) || nextAmount <= 0) return;
  amount = nextAmount;
  amountRow.querySelectorAll("button[data-amount]").forEach((button) => button.classList.remove("active"));
  renderSimulator();
});

helperToggle.addEventListener("click", () => {
  const isOpen = helperPanel.classList.toggle("open");
  helperToggle.setAttribute("aria-expanded", String(isOpen));
});

helperClose.addEventListener("click", () => {
  helperPanel.classList.remove("open");
  helperToggle.setAttribute("aria-expanded", "false");
});

helperQuestions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-question]");
  if (!button) return;
  const found = questions.find(([question]) => question === button.dataset.question);
  if (!found) return;
  helperBody.innerHTML = `<p><strong>${found[0]}</strong></p><p>${found[1]}</p>`;
});

renderPersonas();
renderResult();
renderFunds();
renderTeam();
renderSimulator();
renderHelperQuestions();
