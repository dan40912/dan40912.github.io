import { renderFundCard } from "./components/FundCard.js";

const funds = [
  {
    name: "野村台灣運籌基金",
    code: "AL01",
    cp: 9.42,
    month3: 63.36,
    month6: 130.22,
    year1: 317.46,
    year2: 291.31,
    since: "3,996.07%",
    tags: ["主基金", "國人持有", "TISA適格"],
    categories: ["stable-growth", "newbie-low-risk", "ai-allocation"],
    risk: 3,
    riskNote: "這類基金主要跟著台股景氣走。行情好時可能跑得快，市場回檔時也會一起震盪。",
    bestFor: "適合想參與台股成長，但不想每天追進追出的人。",
    story: "如果你每月固定投入，重點不是猜最低點，而是讓投資變成一個可持續的習慣。",
    lifeStory: "一位上班族把它放在長期投資帳戶，每季檢查一次，不再每天被淨值牽動心情。",
    tradable: true,
    swap: false,
  },
  {
    name: "野村鴻運基金",
    code: "AL02",
    cp: 9.29,
    month3: 60.68,
    month6: 126.63,
    year1: 312.3,
    year2: 284.44,
    since: "4,084.39%",
    tags: ["主基金", "國人持有", "TISA適格"],
    categories: ["stable-growth", "high-dividend", "newbie-low-risk"],
    risk: 3,
    riskNote: "它不是保本工具。短期可能上下起伏，但比較適合用較長時間觀察。",
    bestFor: "適合想參與台股行情，又希望節奏不要太刺激的人。",
    story: "把它當成長期投資的一部分時，先確認每月投入金額是否舒服，比猜進場時機更重要。",
    lifeStory: "一位投資人先用小額定期定額開始，三個月後才慢慢提高金額，第一次下單不再那麼緊張。",
    tradable: true,
    swap: false,
  },
  {
    name: "統一大龍印基金",
    code: "DR14",
    cp: 9.27,
    month3: 68.8,
    month6: 127.35,
    year1: 261.87,
    year2: 211.57,
    since: "823.50%",
    tags: ["主基金", "AI 熱"],
    categories: ["max-return", "ai-allocation"],
    risk: 5,
    riskNote: "題材集中時，漲起來可能很有感；但市場轉弱時，跌幅也可能來得更快。",
    bestFor: "適合知道自己能承受大波動，仍想追求成長機會的人。",
    story: "你可能在上漲時感到很有參與感，但真正考驗是回落時還能不能照計畫持有。",
    lifeStory: "一位積極型投資人只把它放在衛星部位，不讓單一題材決定整體資產心情。",
    tradable: true,
    swap: true,
  },
  {
    name: "統一新亞洲科技能源基金",
    code: "DR16",
    cp: 9.16,
    month3: 58.81,
    month6: 123.87,
    year1: 276.87,
    year2: 231.68,
    since: "1,429.70%",
    tags: ["主基金"],
    categories: ["max-return", "ai-allocation"],
    risk: 5,
    riskNote: "科技和區域市場都會波動，適合用小比例開始，不適合一次押太重。",
    bestFor: "適合想參與亞洲科技成長，也能接受帳面上下波動的人。",
    story: "它比較像投資組合裡的成長加速器，不適合拿來承擔全部資產目標。",
    lifeStory: "投資人用 20% 衛星配置參與題材，其餘保留在較穩健基金，避免情緒被單一市場拉著走。",
    tradable: true,
    swap: true,
  },
  {
    name: "安聯台灣科技基金",
    code: "TF11",
    cp: 8.96,
    month3: 66.79,
    month6: 136.31,
    year1: 305.61,
    year2: 294.08,
    since: "9,086.83%",
    tags: ["主基金", "國人持有", "持股台積電"],
    categories: ["max-return", "ai-allocation"],
    risk: 5,
    riskNote: "科技股比重高，可能帶來成長機會，也可能放大下跌時的感受。",
    bestFor: "適合看好科技產業、能承受高波動的人。",
    story: "如果你相信科技長期趨勢，可以把它放進成長型投資，但不要讓單一題材佔滿全部資金。",
    lifeStory: "投資人把它當成科技主題部位，設定單一基金不超過總投資三成。",
    tradable: true,
    swap: true,
  },
  {
    name: "街口台灣基金",
    code: "PB01",
    cp: 8.89,
    month3: 54.86,
    month6: 125.14,
    year1: 310.68,
    year2: 274.8,
    since: "1,801.10%",
    tags: ["主基金"],
    categories: ["stable-growth", "high-dividend"],
    risk: 3,
    riskNote: "它適合拉長時間看，但仍會受到股市漲跌影響。",
    bestFor: "適合希望跟著台股基本面慢慢累積的人。",
    story: "你可能不追逐每天漲跌，而是用它做長期核心候選。",
    lifeStory: "一位家庭理財者把它放進年度投資計畫，每半年檢視是否仍符合目標。",
    tradable: true,
    swap: false,
  },
  {
    name: "玉山科技島基金",
    code: "DG08",
    cp: 8.83,
    month3: 59.29,
    month6: 128.4,
    year1: 285.32,
    year2: 235.8,
    since: "1,777.54%",
    tags: ["主基金"],
    categories: ["stable-growth", "ai-allocation"],
    risk: 4,
    riskNote: "科技題材有成長性，但波動通常比一般穩健型基金更明顯。",
    bestFor: "適合想用中等以上風險參與科技供應鏈的人。",
    story: "它能讓你參與科技題材，但需要先決定可承受的配置比例。",
    lifeStory: "投資人先用低比例試水溫，確認自己不會因波動停扣後才增加金額。",
    tradable: true,
    swap: false,
  },
  {
    name: "野村成長基金",
    code: "AL17",
    cp: 8.81,
    month3: 60.99,
    month6: 123.23,
    year1: 295.01,
    year2: 262.54,
    since: "6,672.21%",
    tags: ["主基金", "TISA適格"],
    categories: ["stable-growth", "newbie-low-risk", "high-dividend"],
    risk: 2,
    riskNote: "仍會有市場波動，但比較適合作為新手先研究的名單。",
    bestFor: "適合想先建立投資習慣的人。",
    story: "第一次買基金時，你需要的不是最多數字，而是能持續執行的節奏。",
    lifeStory: "新手投資人先設定每月固定扣款，三個月後再回來看是否提高投入。",
    tradable: true,
    swap: false,
  },
  {
    name: "合庫台灣高科技基金",
    code: "TCA1",
    cp: 8.77,
    month3: 60.31,
    month6: 105.43,
    year1: 281.54,
    year2: 255.4,
    since: "610.80%",
    tags: ["主基金"],
    categories: ["max-return", "ai-allocation"],
    risk: 5,
    riskNote: "高科技題材可能讓報酬更有感，也可能讓下跌更有感。",
    bestFor: "適合追求成長但願意嚴格控管比例的人。",
    story: "它可以是讓組合更有攻擊性的部分，但不是全部答案。",
    lifeStory: "積極型投資人把它和穩健型基金搭配，避免只靠單一題材承擔未來。",
    tradable: true,
    swap: true,
  },
  {
    name: "台新中國通基金",
    code: "DQ05",
    cp: 8.61,
    month3: 67.12,
    month6: 138.33,
    year1: 294.73,
    year2: 256.32,
    since: "4,285.50%",
    tags: ["主基金", "獲獎基金"],
    categories: ["max-return"],
    risk: 5,
    riskNote: "區域市場變化會影響表現，短期波動可能比較明顯。",
    bestFor: "適合熟悉波動、想找高成長機會的人。",
    story: "投資前要先問自己：如果短期回落，我是否仍願意照原計畫持有？",
    lifeStory: "一位進階投資人只在整體資產中配置小比例，並設定明確檢視點。",
    tradable: true,
    swap: true,
  },
];

const navItems = document.querySelectorAll(".nav-item");

function closeDropdowns(exceptItem) {
  navItems.forEach((item) => {
    if (item !== exceptItem) item.classList.remove("is-open");
  });
}

navItems.forEach((item) => {
  const trigger = item.querySelector(".nav-trigger");
  const menu = item.querySelector(".dropdown-menu");
  if (!trigger || !menu) return;

  item.addEventListener("pointerenter", () => {
    closeDropdowns(item);
    item.classList.add("is-open");
  });

  item.addEventListener("pointerleave", () => {
    item.classList.remove("is-open");
  });

  item.addEventListener("focusin", () => {
    closeDropdowns(item);
    item.classList.add("is-open");
  });

  item.addEventListener("focusout", (event) => {
    if (!item.contains(event.relatedTarget)) item.classList.remove("is-open");
  });

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const shouldOpen = !item.classList.contains("is-open");
    closeDropdowns();
    if (shouldOpen) item.classList.add("is-open");
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-item")) closeDropdowns();
});

const entryCategories = [
  {
    id: "newbie-low-risk",
    title: "保守型",
    headline: "我想先活下來，再談漂亮報酬",
    description: "優先看 MDD、波動和下跌時的修復速度，不被短期績效騙上車。",
    audience: "怕大跌、怕追高、希望投資不要變成每日心跳測試",
    risk: 2,
    feeling: "比較像慢慢開車，先確認煞車有用，再決定要不要上高速公路。",
    cta: "用保守邏輯看基金",
    joke: "註解：不是膽小，是你知道本金不是遊戲幣。",
    basis: [
      ["MDD 最大回撤", "先看過去最慘跌多少。因為賺 10% 很快樂，但跌 30% 時很多人會開始懷疑人生。"],
      ["波動度", "波動越大，情緒成本越高。保守型不是不能賺，是不想每天被淨值搖醒。"],
      ["修復時間", "跌下去多久爬回來。跑得快不稀奇，摔倒後站得起來才重要。"],
    ],
  },
  {
    id: "max-return",
    title: "積極型",
    headline: "我能接受震盪，重點是有沒有衝刺力",
    description: "優先看近期動能、同類排名和報酬彈性，但會把回撤放在旁邊提醒你別太嗨。",
    audience: "能承受帳面上下跳、願意用風險換取更高成長機會",
    risk: 5,
    feeling: "像坐雲霄飛車，尖叫可以，但請不要中途跳車。",
    cta: "用積極邏輯看基金",
    joke: "註解：你不是不怕跌，你只是比較能把跌幅當劇情反轉。",
    basis: [
      ["3 個月 / 6 個月績效", "先看動能是否真的存在，不是只靠一日煙火照亮整個績效表。"],
      ["同類排名", "如果大家都漲，它只是跟著走；如果它跑在前面，才值得多看一眼。"],
      ["MDD 警示線", "積極不等於閉眼衝。最大回撤太深，就算報酬很香，也要先問自己扛不扛得住。"],
    ],
  },
  {
    id: "stable-growth",
    title: "長期型",
    headline: "我不想每天猜高低點，想把時間放進投資裡",
    description: "優先看長期報酬、穩定度、成立以來表現和是否適合定期投入。",
    audience: "重視長期累積、想固定投入、希望基金邏輯能放得久",
    risk: 3,
    feeling: "比較像種樹，不是每天把土挖開看它長高多少。",
    cta: "用長期邏輯看基金",
    joke: "註解：你不是佛系，你只是知道每天看淨值不會讓它長比較快。",
    basis: [
      ["1 年 / 2 年績效", "長期型先看它是不是只會短跑，還是真的有耐力。"],
      ["波動與報酬平衡", "不是追最高，而是找比較不容易讓你半路放棄的節奏。"],
      ["TISA / 定期投入適合度", "如果要長期放，交易便利、扣款節奏和標的穩定度都會影響你能不能持續。"],
    ],
  },
];

const quizQuestions = [
  {
    question: "這筆錢，你最希望它幫你做什麼？",
    answers: [
      ["先不要讓我太緊張", "newbie-low-risk"],
      ["長期慢慢變大", "stable-growth"],
      ["抓住更高成長機會", "max-return"],
    ],
  },
  {
    question: "如果短期下跌，你比較可能怎麼反應？",
    answers: [
      ["會很緊張，想先保守", "newbie-low-risk"],
      ["可以接受一點波動", "stable-growth"],
      ["可以接受比較大的起伏", "max-return"],
    ],
  },
  {
    question: "你希望 FundSwap 先幫你做哪件事？",
    answers: [
      ["先看它最慘跌過多少", "newbie-low-risk"],
      ["先看它長期穩不穩", "stable-growth"],
      ["先看它有沒有衝刺力", "max-return"],
    ],
  },
];

const state = {
  sort: "cp",
  filters: {
    tradable: true,
    swap: false,
    tisa: false,
  },
  profile: "stable-growth",
  quizAnswers: [],
  activeFundCode: "AL01",
};

const entryGrid = document.querySelector("#entryGrid");
const quizList = document.querySelector("#quizList");
const fundList = document.querySelector("#fundList");
const recommendList = document.querySelector("#recommendList");
const resultCount = document.querySelector("#resultCount");
const recommendTitle = document.querySelector("#recommendTitle");
const fundListTitle = document.querySelector("#fundListTitle");
const strategyTitle = document.querySelector("#strategyTitle");
const strategyIntro = document.querySelector("#strategyIntro");
const strategyMenu = document.querySelector("#strategyMenu");
const personaTitle = document.querySelector("#personaTitle");
const personaCopy = document.querySelector("#personaCopy");
const personaCta = document.querySelector("#personaCta");
const sidePanel = document.querySelector("#sidePanel");
const panelTitle = document.querySelector("#panelTitle");
const panelCopy = document.querySelector("#panelCopy");

function formatPercent(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function miniChart() {
  return `
    <svg class="mini-chart" viewBox="0 0 86 22" aria-hidden="true">
      <path d="M1 16 C 11 17, 14 14, 22 14 S 35 11, 43 9 S 55 3, 64 6 S 76 11, 85 7" />
    </svg>
  `;
}

function scoreCopy(fund) {
  const category = getActiveCategory();
  if (category.id === "newbie-low-risk") return "保守型先看它跌起來會不會太痛，再看報酬是不是值得研究。";
  if (category.id === "max-return") return "積極型可以先看動能，但 MDD 要放旁邊，免得績效很香、跌幅很嗆。";
  if (category.id === "stable-growth") return "長期型重點是能不能持續持有，不是今天誰看起來最會衝。";
  if (fund.cp >= 9.2) return "過去表現亮眼，下一步要看你能不能接受它的波動。";
  if (fund.month3 >= 65) return "近期動能強，但不要只看上漲，也要看回落時能不能承受。";
  if (fund.tags.includes("TISA適格")) return "適合放進長期候選，先用固定投入建立節奏。";
  return "值得加入比較，但先看懂它賺什麼、風險在哪。";
}

function getActiveCategory() {
  return entryCategories.find((category) => category.id === state.profile) || entryCategories[1];
}

function renderEntryCards() {
  entryGrid.innerHTML = entryCategories
    .map(
      (category) => `
        <button class="entry-card ${state.profile === category.id ? "active" : ""}" data-profile="${category.id}">
          <span class="entry-kicker">${category.title}</span>
          <strong>${category.headline}</strong>
          <em>${category.description}</em>
          <span class="entry-meta">適合：${category.audience}</span>
          <span class="risk-row" aria-label="風險等級 ${category.risk}">
            ${Array.from({ length: 5 }, (_, index) => `<i class="${index < category.risk ? "on" : ""}"></i>`).join("")}
            <b>波動 ${category.risk}/5</b>
          </span>
          <small>${category.feeling}</small>
          <span class="entry-cta">${category.cta}</span>
        </button>
      `
    )
    .join("");
}

function renderMirrorStrategy() {
  const category = getActiveCategory();
  strategyTitle.textContent = `${category.title}會先看：${category.basis.map(([label]) => label).join("、")}`;
  strategyIntro.textContent = `${category.joke} ${category.description}`;
  strategyMenu.innerHTML = category.basis
    .map(
      ([label, copy], index) => `
        <article class="strategy-item">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${label}</h3>
          <p>${copy}</p>
        </article>
      `
    )
    .join("");
}

function renderQuiz() {
  quizList.innerHTML = quizQuestions
    .map(
      (item, questionIndex) => `
        <fieldset class="quiz-item">
          <legend>${questionIndex + 1}. ${item.question}</legend>
          <div>
            ${item.answers
              .map(
                ([answer, profile]) => `
                  <label>
                    <input type="radio" name="quiz-${questionIndex}" value="${profile}" ${state.quizAnswers[questionIndex] === profile ? "checked" : ""} />
                    ${answer}
                  </label>
                `
              )
              .join("")}
          </div>
        </fieldset>
      `
    )
    .join("");
}

function updatePersona() {
  const category = getActiveCategory();
  personaTitle.textContent = `${category.title}型`;
  personaCopy.textContent = category.feeling;
  personaCta.textContent = category.cta;
  document.querySelectorAll(".persona-meter span").forEach((item, index) => {
    item.classList.toggle("on", index < category.risk);
  });
  recommendTitle.textContent = `先看這幾檔${category.title}候選`;
  fundListTitle.textContent = `${category.title}基金：看懂後再決定下一步`;
}

function getVisibleFunds() {
  let list = funds.filter((fund) => {
    if (state.filters.tradable && !fund.tradable) return false;
    if (state.filters.swap && !fund.swap) return false;
    if (state.filters.tisa && !fund.tags.includes("TISA適格")) return false;
    return true;
  });

  const category = getActiveCategory();
  list = [...list].sort((a, b) => {
    const categoryScore = Number(b.categories.includes(category.id)) - Number(a.categories.includes(category.id));
    if (categoryScore !== 0) return categoryScore;
    if (category.id === "max-return") return b.month3 - a.month3;
    if (category.id === "newbie-low-risk") return Number(b.tags.includes("TISA適格")) - Number(a.tags.includes("TISA適格")) || b.cp - a.cp;
    return b.cp - a.cp;
  });

  if (state.sort === "nav") {
    list = [...list].sort((a, b) => b.since.replace(/[^0-9.]/g, "") - a.since.replace(/[^0-9.]/g, ""));
  } else if (state.sort === "swap") {
    list = [...list].sort((a, b) => Number(b.swap) - Number(a.swap) || b.cp - a.cp);
  }

  return list;
}

function renderRecommendations(list) {
  const category = getActiveCategory();
  recommendList.innerHTML = list
    .slice(0, 3)
    .map(
      (fund, index) => `
        <article class="recommend-card">
          <div class="section-title">
            <div>
              <p class="eyebrow">推薦 ${index + 1}</p>
              <h3>${fund.name}</h3>
            </div>
            <span class="summary-pill">報酬/波動 ${fund.cp.toFixed(2)}</span>
          </div>
          <p>${scoreCopy(fund)}</p>
          <div class="tags">
            <span class="tag orange">${category.title}</span>
            ${fund.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderFunds() {
  const list = getVisibleFunds();
  renderEntryCards();
  renderMirrorStrategy();
  updatePersona();
  resultCount.textContent = list.length;
  renderRecommendations(list);

  if (!list.some((fund) => fund.code === state.activeFundCode)) {
    state.activeFundCode = list[0]?.code || null;
  }

  fundList.innerHTML = list.map((fund, index) => renderFundCard(fund, index, state.activeFundCode)).join("");
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    state.sort = tab.dataset.sort;
    renderFunds();
  });
});

document.querySelectorAll("[data-filter]").forEach((input) => {
  input.addEventListener("change", () => {
    state.filters[input.dataset.filter] = input.checked;
    renderFunds();
  });
});

entryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-profile]");
  if (!button) return;
  state.profile = button.dataset.profile;
  renderFunds();
  document.querySelector("#strategyPanel").scrollIntoView({ behavior: "smooth", block: "start" });
});

quizList.addEventListener("change", (event) => {
  if (!event.target.matches("input[type='radio']")) return;
  const questionIndex = Number(event.target.name.replace("quiz-", ""));
  state.quizAnswers[questionIndex] = event.target.value;
  const counts = state.quizAnswers.reduce((acc, profile) => {
    acc[profile] = (acc[profile] || 0) + 1;
    return acc;
  }, {});
  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (winner) {
    state.profile = winner;
    renderFunds();
  }
});

fundList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-fund]");
  if (!toggle) return;
  const nextCode = toggle.dataset.toggleFund;
  state.activeFundCode = state.activeFundCode === nextCode ? null : nextCode;
  renderFunds();
});

document.querySelector("#resetQuiz").addEventListener("click", () => {
  state.quizAnswers = [];
  state.profile = "stable-growth";
  renderQuiz();
  renderFunds();
});

personaCta.addEventListener("click", () => {
  document.querySelector("#top-funds").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-fund]").forEach((dot) => {
  dot.addEventListener("click", () => {
    const fund = funds[Number(dot.dataset.fund)];
    openPanel("mirror", fund);
  });
});

document.querySelectorAll("[data-open-panel]").forEach((button) => {
  button.addEventListener("click", () => openPanel(button.dataset.openPanel));
});

document.querySelectorAll("[data-close-panel]").forEach((button) => {
  button.addEventListener("click", closePanel);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePanel();
});

function openPanel(type, fund) {
  const category = getActiveCategory();
  const copy = {
    filters: ["用條件縮小範圍", "先保留能交易、能快速換入或適合長期投入的基金，讓你不用從 200 筆裡慢慢找。"],
    profile: ["不知道怎麼選？", `你可以先從「${category.title}」開始。${category.description}`],
    mirror: ["這張圖怎麼看？", fund ? `${fund.name} 過去的報酬和波動都值得進一步研究。先加入比較，再看你是否能接受它的起伏。` : "越靠近右上方，代表過去報酬較高；但投資前仍要看波動和自己的承受度。"],
  }[type];

  panelTitle.textContent = copy[0];
  panelCopy.textContent = copy[1];
  sidePanel.classList.add("open");
  sidePanel.setAttribute("aria-hidden", "false");
}

function closePanel() {
  sidePanel.classList.remove("open");
  sidePanel.setAttribute("aria-hidden", "true");
}

renderQuiz();
renderFunds();
