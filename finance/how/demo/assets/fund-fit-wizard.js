const questions = [
  {
    id: "goal",
    title: "你的投資目標是什麼？",
    hint: "先不用想基金名稱，選最接近你現在需求的方向。",
    options: [
      ["retirement", "退休", "希望慢慢累積，不想每天被市場波動影響心情。"],
      ["growth", "資產成長", "可以接受起伏，希望長期資產有成長空間。"],
      ["income", "現金流", "比起帳面漲跌，更在意是否有固定配息節奏。"],
      ["allocation", "短中期配置", "想先放一段時間，重點是彈性與風險不要失控。"],
    ],
  },
  {
    id: "volatility",
    title: "你可以接受多大的波動？",
    hint: "想像基金下跌時，你會不會忍不住每天打開看。",
    options: [
      ["low", "低", "跌一點就會緊張，希望先以穩定為主。"],
      ["mid", "中", "能接受正常起伏，但不想坐太刺激的雲霄飛車。"],
      ["high", "高", "知道波動是代價，願意用起伏換成長機會。"],
    ],
  },
  {
    id: "horizon",
    title: "你的投資期間大約多久？",
    hint: "時間越短，越需要先看波動與流動性；時間越長，才比較能承受市場循環。",
    options: [
      ["under1", "1年內", "可能會用到這筆錢，不適合承受太大波動。"],
      ["oneToThree", "1-3年", "有一些時間，但仍需要避免過度集中。"],
      ["over3", "3年以上", "可以用較長時間等待市場修復。"],
    ],
  },
  {
    id: "preference",
    title: "你偏好的基金類型？",
    hint: "不知道也沒關係，選「不確定」會優先顯示比較容易理解的類型。",
    options: [
      ["stock", "股票", "想參與企業成長，能接受淨值上下波動。"],
      ["bond", "債券", "希望波動相對低一些，先看利率與信用風險。"],
      ["balanced", "平衡", "希望股債都涵蓋，不想自己配置比例。"],
      ["unknown", "不確定", "先讓系統用你的目標與波動承受度縮小範圍。"],
    ],
  },
  {
    id: "dividend",
    title: "你重視配息嗎？",
    hint: "配息不是額外保證收益，也可能來自本金或影響淨值表現。",
    options: [
      ["yes", "是", "希望有月配或季配的現金流感受。"],
      ["no", "否", "更在意總報酬，不一定需要配息。"],
      ["unsure", "沒有想法", "先理解配息與總報酬的差別再決定。"],
    ],
  },
];

const funds = [
  {
    id: "f1",
    name: "退休穩健配置基金",
    type: "全球平衡型",
    tags: ["退休", "低波動", "TISA", "季配"],
    risk: 2,
    return1y: 9.8,
    volatility: 7.2,
    dividend: "季配",
    score: { retirement: 5, growth: 2, income: 3, allocation: 4, low: 4, mid: 3, high: 1, under1: 2, oneToThree: 4, over3: 5, balanced: 5, unknown: 4, yes: 3, no: 2, unsure: 4 },
    fit: "股債配置較均衡，適合把穩定持有放在第一順位的人先觀察。",
    riskNote: "報酬不會最亮眼，若期待短期快速成長，可能會覺得節奏偏慢。",
  },
  {
    id: "f2",
    name: "全球優質收益基金",
    type: "全球平衡型",
    tags: ["配息", "低波動", "月配"],
    risk: 2,
    return1y: 11.2,
    volatility: 9.8,
    dividend: "月配",
    score: { retirement: 4, growth: 2, income: 5, allocation: 3, low: 4, mid: 3, high: 1, under1: 2, oneToThree: 4, over3: 4, balanced: 4, unknown: 4, yes: 5, no: 1, unsure: 3 },
    fit: "配息節奏明確，適合想先理解現金流型基金如何運作的人。",
    riskNote: "配息不等於保證收益，市場下跌時淨值仍可能回落。",
  },
  {
    id: "f3",
    name: "美元投資級債基金",
    type: "投資級債券型",
    tags: ["債券", "低波動", "月配"],
    risk: 2,
    return1y: 7.4,
    volatility: 6.8,
    dividend: "月配",
    score: { retirement: 4, growth: 1, income: 4, allocation: 4, low: 5, mid: 3, high: 1, under1: 4, oneToThree: 4, over3: 3, bond: 5, unknown: 3, yes: 4, no: 2, unsure: 3 },
    fit: "波動相對低，適合作為先理解債券基金與利率風險的觀察標的。",
    riskNote: "債券價格會受利率變動影響，美元級別也有匯率風險。",
  },
  {
    id: "f4",
    name: "好好全球多元收益基金",
    type: "多重資產型",
    tags: ["配息", "退休", "季配"],
    risk: 3,
    return1y: 10.6,
    volatility: 8.4,
    dividend: "季配",
    score: { retirement: 4, growth: 2, income: 4, allocation: 5, low: 3, mid: 4, high: 1, under1: 3, oneToThree: 5, over3: 4, balanced: 4, unknown: 5, yes: 4, no: 2, unsure: 4 },
    fit: "股債與收益來源較分散，適合不想一開始就自己配置比例的人。",
    riskNote: "多元配置能分散風險，但市場系統性下跌時仍會有損失。",
  },
  {
    id: "f5",
    name: "野村鴻運基金",
    type: "台股股票型",
    tags: ["TISA", "台股", "成長"],
    risk: 3,
    return1y: 16.8,
    volatility: 12.4,
    dividend: "不配息",
    score: { retirement: 3, growth: 4, income: 1, allocation: 3, low: 2, mid: 4, high: 3, under1: 1, oneToThree: 3, over3: 4, stock: 4, unknown: 3, yes: 1, no: 4, unsure: 3 },
    fit: "適合想用台股核心部位參與成長、又不想只看單一熱門題材的人。",
    riskNote: "台股集中度較高，電子股修正時淨值可能跟著波動。",
  },
  {
    id: "f6",
    name: "富達全球科技基金",
    type: "全球科技型",
    tags: ["科技", "AI", "成長"],
    risk: 4,
    return1y: 24.1,
    volatility: 17.6,
    dividend: "不配息",
    score: { retirement: 1, growth: 5, income: 1, allocation: 2, low: 1, mid: 3, high: 5, under1: 1, oneToThree: 2, over3: 5, stock: 5, unknown: 2, yes: 1, no: 5, unsure: 2 },
    fit: "適合想參與全球科技成長，且能接受較大淨值起伏的人。",
    riskNote: "科技股評價變動快，利率與大型股財報都可能放大波動。",
  },
  {
    id: "f7",
    name: "全球 AI 基礎建設基金",
    type: "主題股票型",
    tags: ["AI", "科技", "成長"],
    risk: 4,
    return1y: 22.7,
    volatility: 18.9,
    dividend: "不配息",
    score: { retirement: 1, growth: 5, income: 1, allocation: 2, low: 1, mid: 3, high: 5, under1: 1, oneToThree: 2, over3: 5, stock: 5, unknown: 2, yes: 1, no: 5, unsure: 2 },
    fit: "適合想觀察 AI 供應鏈，但希望比單押個股更分散的人。",
    riskNote: "主題型基金容易受市場情緒影響，題材降溫時可能快速修正。",
  },
  {
    id: "f8",
    name: "聯博全球高收益債基金",
    type: "高收益債券型",
    tags: ["配息", "債券", "月配"],
    risk: 4,
    return1y: 13.6,
    volatility: 16.2,
    dividend: "月配",
    score: { retirement: 2, growth: 2, income: 4, allocation: 2, low: 1, mid: 3, high: 3, under1: 1, oneToThree: 2, over3: 3, bond: 4, unknown: 2, yes: 5, no: 1, unsure: 2 },
    fit: "適合已理解信用風險，想觀察收益型債券基金的人。",
    riskNote: "高收益債受景氣與信用利差影響，不能只看配息率。",
  },
];

let currentStep = 0;
const answers = {};

const stepper = document.querySelector("#stepper");
const stepLabel = document.querySelector("#stepLabel");
const questionTitle = document.querySelector("#questionTitle");
const questionHint = document.querySelector("#questionHint");
const optionGrid = document.querySelector("#optionGrid");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const restartButton = document.querySelector("#restartButton");
const resultSection = document.querySelector("#result");
const resultSummary = document.querySelector("#resultSummary");
const styleName = document.querySelector("#styleName");
const styleCopy = document.querySelector("#styleCopy");
const fundTypes = document.querySelector("#fundTypes");
const riskFocus = document.querySelector("#riskFocus");
const criteriaStrip = document.querySelector("#criteriaStrip");
const fundGrid = document.querySelector("#fundGrid");
const fundCount = document.querySelector("#fundCount");
const editAnswers = document.querySelector("#editAnswers");

function getAnswerLabel(questionId) {
  const question = questions.find((item) => item.id === questionId);
  const option = question?.options.find(([value]) => value === answers[questionId]);
  return option?.[1] || "";
}

function renderStepper() {
  stepper.innerHTML = questions
    .map((question, index) => {
      const stateClass = index === currentStep ? "active" : index < currentStep || answers[question.id] ? "done" : "";
      return `<li class="${stateClass}"><i>${index + 1}</i><span>${question.title.replace("？", "")}</span></li>`;
    })
    .join("");
}

function renderQuestion() {
  const question = questions[currentStep];
  const selected = answers[question.id];
  stepLabel.textContent = `STEP ${currentStep + 1} / ${questions.length}`;
  questionTitle.textContent = question.title;
  questionHint.textContent = question.hint;
  optionGrid.innerHTML = question.options
    .map(
      ([value, label, copy]) => `
        <button class="option-card ${selected === value ? "active" : ""}" type="button" data-option="${value}">
          <strong>${label}</strong>
          <span>${copy}</span>
        </button>
      `
    )
    .join("");
  prevButton.disabled = currentStep === 0;
  nextButton.disabled = !selected;
  nextButton.textContent = currentStep === questions.length - 1 ? "查看結果" : "下一步";
  renderStepper();
}

function inferProfile() {
  const { goal, volatility, horizon, preference, dividend } = answers;
  let name = "穩健探索型";
  let copy = "你需要的不是馬上選一檔基金，而是先把風險範圍收斂，再比較幾種基金類型。";
  let types = ["全球平衡型", "多重資產型"];
  let risk = "先看波動度、風險等級與持有期間是否匹配";

  if (goal === "income" || dividend === "yes") {
    name = "現金流觀察型";
    copy = "你在意配息節奏，但仍需要同時看淨值波動與配息來源。";
    types = ["全球平衡型", "投資級債券型", "多重資產型"];
    risk = "配息不是保證收益，也不代表總報酬一定較高";
  }

  if (goal === "growth" || volatility === "high") {
    name = "成長承受型";
    copy = "你願意用較高波動換取成長空間，適合先看股票型與主題型基金，但要控制配置比例。";
    types = ["台股股票型", "全球科技型", "主題股票型"];
    risk = "短期回檔可能很明顯，不適合用一年內會用到的資金";
  }

  if (goal === "retirement" || volatility === "low" || horizon === "under1") {
    name = "穩定優先型";
    copy = "你更需要降低選擇焦慮，先從低波動、平衡或債券型基金理解風險與報酬。";
    types = ["全球平衡型", "投資級債券型", "多重資產型"];
    risk = "報酬速度可能較慢，但更適合作為理解基金的第一步";
  }

  if (preference === "stock" && volatility !== "low" && horizon === "over3") {
    types = ["台股股票型", "全球科技型", "主題股票型"];
  }

  if (preference === "bond") {
    types = ["投資級債券型", "高收益債券型"];
    risk = "債券仍會受到利率、信用與匯率變動影響";
  }

  if (preference === "balanced" || preference === "unknown") {
    types = [...new Set(["全球平衡型", "多重資產型", ...types])].slice(0, 3);
  }

  return { name, copy, types, risk };
}

function scoreFund(fund) {
  return Object.values(answers).reduce((total, value) => total + (fund.score[value] || 0), 0);
}

function getResultFunds(profile) {
  return funds
    .map((fund) => ({ ...fund, matchScore: scoreFund(fund) + (profile.types.includes(fund.type) ? 3 : 0) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function renderResults() {
  const profile = inferProfile();
  const selectedFunds = getResultFunds(profile);
  styleName.textContent = profile.name;
  styleCopy.textContent = profile.copy;
  fundTypes.textContent = profile.types.join("、");
  riskFocus.textContent = profile.risk;
  resultSummary.textContent = "以下結果依你的回答產生觀察方向，目標是縮小研究範圍，不是告訴你該買哪一檔。";
  fundCount.textContent = `${selectedFunds.length} 檔`;
  criteriaStrip.innerHTML = questions
    .map((question) => `<span class="pill">${question.title.replace("？", "")}：${getAnswerLabel(question.id)}</span>`)
    .join("");
  fundGrid.innerHTML = selectedFunds
    .map(
      (fund) => `
        <article class="fund-card">
          <div>
            <h3>${fund.name}</h3>
            <div class="fund-meta">
              <span class="tag primary">${fund.type}</span>
              ${fund.tags.slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
          <div class="fund-stats">
            <div class="stat"><span>1年報酬</span><strong>${formatPercent(fund.return1y)}</strong></div>
            <div class="stat"><span>波動度</span><strong>${formatPercent(fund.volatility)}</strong></div>
            <div class="stat"><span>風險 / 配息</span><strong>RR${fund.risk} ${fund.dividend}</strong></div>
          </div>
          <div class="reason-box fit">
            <span>適配原因</span>
            <p>${fund.fit}</p>
          </div>
          <div class="reason-box risk">
            <span>需要注意的風險</span>
            <p>${fund.riskNote}</p>
          </div>
        </article>
      `
    )
    .join("");
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

optionGrid.addEventListener("click", (event) => {
  const option = event.target.closest("[data-option]");
  if (!option) return;
  answers[questions[currentStep].id] = option.dataset.option;
  renderQuestion();
});

prevButton.addEventListener("click", () => {
  if (currentStep === 0) return;
  currentStep -= 1;
  renderQuestion();
});

nextButton.addEventListener("click", () => {
  if (!answers[questions[currentStep].id]) return;
  if (currentStep < questions.length - 1) {
    currentStep += 1;
    renderQuestion();
    return;
  }
  renderResults();
});

restartButton.addEventListener("click", () => {
  Object.keys(answers).forEach((key) => delete answers[key]);
  currentStep = 0;
  resultSection.hidden = true;
  renderQuestion();
});

editAnswers.addEventListener("click", () => {
  resultSection.hidden = true;
  document.querySelector("#wizard").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderQuestion();
