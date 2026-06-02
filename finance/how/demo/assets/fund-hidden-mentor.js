const mentors = [
  {
    id: "landlord",
    name: "收租公",
    type: "穩定現金流",
    image: "assets/personas/landlord.webp",
    fallback: "linear-gradient(135deg, #d7d9dc 0%, #f0ebe5 44%, #a9b4bd 100%)",
    quote: "現金流比暴漲更重要。",
    speech: "現金流比暴漲更重要。\n如果你希望未來有穩定被動收入，\n我建議先從高股息基金、收益型基金與月配息基金開始了解。",
    recommendations: ["高股息基金", "收益型基金", "月配息基金"],
    styleTitle: "穩定現金流型",
    styleCopy: "你的投資風格偏向現金流配置，在追求資產成長的同時，也重視配息節奏與下跌承受度。",
  },
  {
    id: "keeper",
    name: "掌櫃",
    type: "穩健保值",
    image: "assets/personas/keeper.webp",
    fallback: "linear-gradient(135deg, #ebe7df 0%, #d7d2ca 48%, #b8b4ad 100%)",
    quote: "守住本金，才能走得更遠。",
    speech: "守住本金，才能走得更遠。\n如果你不喜歡資產大起大落，\n我會先帶你看平衡型基金、債券基金與防禦型基金。",
    recommendations: ["平衡型基金", "債券基金", "防禦型基金"],
    styleTitle: "穩健保值型",
    styleCopy: "你的投資風格偏向防守與長期持有，優先確認最大回撤、波動度與資產配置是否能承受。",
  },
  {
    id: "taoist",
    name: "道士",
    type: "高風險高報酬",
    image: "assets/personas/taoist.webp",
    fallback: "linear-gradient(135deg, #d9e1e8 0%, #c3cad4 45%, #8d98aa 100%)",
    quote: "波動只是成長的代價。",
    speech: "波動只是成長的代價。\n如果你願意承擔短期起伏，\n我會帶你觀察 AI 基金、科技基金與成長基金，但先看最大回撤。",
    recommendations: ["AI 基金", "科技基金", "成長基金"],
    styleTitle: "積極成長型",
    styleCopy: "你的投資風格偏向追求成長，但需要把高報酬旁邊的波動與最大回撤一起看。",
  },
  {
    id: "farmer",
    name: "農夫",
    type: "長期累積",
    image: "assets/personas/farmer.webp",
    fallback: "linear-gradient(135deg, #e2eadf 0%, #c7d8c1 46%, #9fb996 100%)",
    quote: "每天一點點，十年差很多。",
    speech: "每天一點點，十年差很多。\n如果你想用時間累積資產，\n我會建議先理解定期定額、全球股票基金與 ETF。",
    recommendations: ["定期定額", "全球股票基金", "ETF"],
    styleTitle: "長期累積型",
    styleCopy: "你的投資風格偏向定期投入與長期持有，重點不是短期排名，而是費用、分散與持續性。",
  },
  {
    id: "traveler",
    name: "旅客",
    type: "全球機會",
    image: "assets/personas/traveler.webp",
    fallback: "linear-gradient(135deg, #e4e8ee 0%, #ccd4dd 46%, #9aaabc 100%)",
    quote: "機會從來不只在一個國家。",
    speech: "機會從來不只在一個國家。\n如果你想分散單一市場風險，\n我會帶你看全球基金、區域基金與新興市場基金。",
    recommendations: ["全球基金", "區域基金", "新興市場基金"],
    styleTitle: "全球機會型",
    styleCopy: "你的投資風格偏向跨市場配置，除了報酬，也要看區域集中、匯率與市場輪動風險。",
  },
  {
    id: "collector",
    name: "收藏家",
    type: "頂級團隊",
    image: "assets/personas/collector.webp",
    fallback: "linear-gradient(135deg, #ebe3dc 0%, #d3cbc3 47%, #b6aaa0 100%)",
    quote: "我只投資最好的團隊。",
    speech: "我只投資最好的團隊。\n如果你重視長期品質，\n我會帶你研究晨星五星基金、長期績效基金與頂級基金經理人。",
    recommendations: ["晨星五星基金", "長期績效基金", "頂級基金經理人"],
    styleTitle: "精品研究型",
    styleCopy: "你的投資風格偏向研究基金品質，除了績效，也會看經理人、評級、團隊穩定度與長期排名。",
  },
];

let activeMentorId = "landlord";
let typingTimer = null;
let activeIndustryId = "technology";

const industries = [
  {
    id: "technology",
    label: "資訊科技",
    subtitle: "AI、半導體、雲端與軟體族群",
    cells: [
      ["NVDA", "+3.8%", "large tv-up-3"],
      ["MSFT", "+1.4%", "tv-up-1"],
      ["AAPL", "-0.6%", "tv-down-1"],
      ["TSM", "+2.7%", "wide tv-up-2"],
      ["AVGO", "+2.1%", "tv-up-2"],
      ["AMD", "+1.8%", "tv-up-1"],
      ["ADBE", "-1.2%", "tv-down-1"],
      ["CRM", "+0.4%", "tv-flat"],
    ],
  },
  {
    id: "finance",
    label: "金融",
    subtitle: "銀行、保險、支付與資產管理",
    cells: [
      ["JPM", "+1.1%", "large tv-up-1"],
      ["BAC", "+0.8%", "tv-up-1"],
      ["V", "-0.2%", "tv-flat"],
      ["MA", "+0.3%", "wide tv-flat"],
      ["GS", "-1.0%", "tv-down-1"],
      ["MS", "+0.6%", "tv-up-1"],
      ["BLK", "+1.5%", "tv-up-1"],
      ["AXP", "-0.7%", "tv-down-1"],
    ],
  },
  {
    id: "healthcare",
    label: "醫療保健",
    subtitle: "製藥、生技、醫材與醫療服務",
    cells: [
      ["LLY", "+2.4%", "large tv-up-2"],
      ["UNH", "-1.8%", "tv-down-2"],
      ["JNJ", "+0.2%", "tv-flat"],
      ["MRK", "+0.9%", "wide tv-up-1"],
      ["PFE", "-0.5%", "tv-down-1"],
      ["ABBV", "+1.0%", "tv-up-1"],
      ["TMO", "-0.9%", "tv-down-1"],
      ["ISRG", "+1.7%", "tv-up-1"],
    ],
  },
  {
    id: "energy",
    label: "能源",
    subtitle: "石油、天然氣、能源設備與新能源",
    cells: [
      ["XOM", "-2.8%", "large tv-down-3"],
      ["CVX", "-1.9%", "tv-down-2"],
      ["COP", "-1.3%", "tv-down-1"],
      ["SLB", "+0.4%", "wide tv-flat"],
      ["EOG", "-0.8%", "tv-down-1"],
      ["MPC", "+1.2%", "tv-up-1"],
      ["VLO", "+1.6%", "tv-up-1"],
      ["OXY", "-2.1%", "tv-down-2"],
    ],
  },
  {
    id: "consumer",
    label: "消費",
    subtitle: "品牌零售、電商、餐飲與民生消費",
    cells: [
      ["AMZN", "+2.2%", "large tv-up-2"],
      ["TSLA", "-3.4%", "tv-down-3"],
      ["MCD", "+0.5%", "tv-flat"],
      ["HD", "+1.1%", "wide tv-up-1"],
      ["NKE", "-1.5%", "tv-down-1"],
      ["COST", "+1.6%", "tv-up-1"],
      ["SBUX", "-0.4%", "tv-flat"],
      ["WMT", "+0.7%", "tv-up-1"],
    ],
  },
];

const mentorGrid = document.querySelector("#mentorGrid");
const activePersonaTitle = document.querySelector("#activePersonaTitle");
const typewriterText = document.querySelector("#typewriterText");
const recommendList = document.querySelector("#recommendList");
const heroStyleTitle = document.querySelector("#heroStyleTitle");
const heroStyleCopy = document.querySelector("#heroStyleCopy");
const industryPicker = document.querySelector("#industryPicker");
const heatmapTitle = document.querySelector("#heatmapTitle");
const heatmapSubtitle = document.querySelector("#heatmapSubtitle");
const tradingviewHeatmap = document.querySelector("#tradingviewHeatmap");

function getMentor() {
  return mentors.find((mentor) => mentor.id === activeMentorId) || mentors[0];
}

function renderMentors() {
  mentorGrid.classList.add("has-active");
  mentorGrid.innerHTML = mentors
    .map(
      (mentor) => `
        <button class="mentor-card ${mentor.id === activeMentorId ? "active" : ""}" type="button" data-mentor="${mentor.id}" aria-label="${mentor.name} ${mentor.type}">
          <div
            class="portrait-wrap"
            data-src="${mentor.image}"
            style="--portrait-url: url('${mentor.image}'); --portrait-fallback: ${mentor.fallback};"
          ></div>
          <div class="mentor-copy">
            <span class="mentor-tag">${mentor.type}</span>
            <h3>${mentor.name}</h3>
            <div class="quote">「${mentor.quote}」</div>
          </div>
        </button>
      `
    )
    .join("");
  observePortraits();
}

function renderRecommendations(mentor) {
  recommendList.innerHTML = mentor.recommendations
    .map(
      (item) => `
        <article class="recommend-item">
          <strong>${item}</strong>
          <p>先理解這類基金的報酬來源、波動與適合持有時間，再進入照妖鏡比較。</p>
        </article>
      `
    )
    .join("");
}

function typeText(text) {
  clearInterval(typingTimer);
  typewriterText.textContent = "";
  let index = 0;
  typingTimer = setInterval(() => {
    typewriterText.textContent += text[index] || "";
    index += 1;
    if (index >= text.length) {
      clearInterval(typingTimer);
    }
  }, 40);
}

function setMentor(id) {
  activeMentorId = id;
  const mentor = getMentor();
  renderMentors();
  activePersonaTitle.textContent = `${mentor.name}｜${mentor.type}`;
  heroStyleTitle.textContent = mentor.styleTitle;
  heroStyleCopy.textContent = mentor.styleCopy;
  renderRecommendations(mentor);
  typeText(mentor.speech);
}

function observePortraits() {
  const portraits = document.querySelectorAll(".portrait-wrap");
  if (!("IntersectionObserver" in window)) {
    portraits.forEach((portrait) => portrait.classList.add("loaded"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("loaded");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "120px" }
  );

  portraits.forEach((portrait) => observer.observe(portrait));
}

function getIndustry() {
  return industries.find((industry) => industry.id === activeIndustryId) || industries[0];
}

function renderIndustryPicker() {
  industryPicker.innerHTML = industries
    .map(
      (industry) => `
        <button class="${industry.id === activeIndustryId ? "active" : ""}" type="button" data-industry="${industry.id}">
          ${industry.label}
        </button>
      `
    )
    .join("");
}

function renderHeatmap() {
  const industry = getIndustry();
  heatmapTitle.textContent = industry.label;
  heatmapSubtitle.textContent = industry.subtitle;
  tradingviewHeatmap.innerHTML = industry.cells
    .map(
      ([symbol, value, className]) => `
        <article class="tv-cell ${className}">
          <strong>${symbol}</strong>
          <span>${value}</span>
        </article>
      `
    )
    .join("");
}

mentorGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-mentor]");
  if (!card) return;
  setMentor(card.dataset.mentor);
});

industryPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-industry]");
  if (!button) return;
  activeIndustryId = button.dataset.industry;
  renderIndustryPicker();
  renderHeatmap();
});

renderMentors();
const initialMentor = getMentor();
activePersonaTitle.textContent = `${initialMentor.name}｜${initialMentor.type}`;
heroStyleTitle.textContent = initialMentor.styleTitle;
heroStyleCopy.textContent = initialMentor.styleCopy;
renderRecommendations(initialMentor);
typeText(initialMentor.speech);
renderIndustryPicker();
renderHeatmap();
