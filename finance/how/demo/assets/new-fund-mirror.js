const personas = [
  {
    id: "newbie",
    title: "新手入門",
    icon: "01",
    headline: "先避開看不懂與太刺激的基金",
    copy: "優先看風險等級、波動度與基金類型是否容易理解，不會只用報酬率排序。",
    criteria: [
      ["風險等級", "先看 2-3 級，避免一開始就承受太大起伏。"],
      ["波動度", "波動越低，第一次持有比較不容易被嚇到。"],
      ["基金類型", "優先看平衡型、全球型或 TISA 候選。"],
    ],
    match: (fund) => fund.risk <= 3 && fund.volatility <= 14,
    reason: "新手入門會先避開高波動與高風險，讓你先建立看懂基金的節奏。",
  },
  {
    id: "retirement",
    title: "穩健退休",
    icon: "02",
    headline: "先看能不能長期放得住",
    copy: "優先看長期報酬、波動控制、TISA 或定期投入適合度，避免只追短期熱門。",
    criteria: [
      ["1 年報酬", "不是追最高，而是看報酬是否穩定合理。"],
      ["波動控制", "退休規劃更在意下跌時能不能持續持有。"],
      ["TISA / 定期投入", "適合長期節奏的基金更值得先研究。"],
    ],
    match: (fund) => fund.risk <= 3 && fund.return1y >= 10 && fund.tags.includes("TISA"),
    reason: "穩健退休不追求最刺激的報酬，而是找長期節奏較容易持續的候選。",
  },
  {
    id: "growth",
    title: "積極成長",
    icon: "03",
    headline: "看成長力，也把波動放在旁邊",
    copy: "優先看 1 年報酬、CP 值與成長題材，但會同步提醒風險等級與波動度。",
    criteria: [
      ["1 年報酬", "先看是否有明確成長動能。"],
      ["CP 值", "用報酬除以波動，避免只看漲幅。"],
      ["風險等級", "積極不等於閉眼衝，風險太高仍要知道代價。"],
    ],
    match: (fund) => fund.return1y >= 18 && fund.cp >= 1.25,
    reason: "積極成長會優先找報酬動能較強的基金，但仍要看波動與風險是否能承受。",
  },
  {
    id: "income",
    title: "現金流配息",
    icon: "04",
    headline: "先看配息節奏，再看淨值波動",
    copy: "優先看配息頻率、波動度與基金類型，提醒使用者配息不等於保證收益。",
    criteria: [
      ["配息頻率", "月配或季配較符合現金流期待。"],
      ["波動度", "配息基金仍會有淨值上下波動。"],
      ["配息來源", "配息率漂亮，不代表總報酬一定漂亮。"],
    ],
    match: (fund) => fund.dividend !== "不配息" && fund.volatility <= 18,
    reason: "現金流配息會先看配息節奏與淨值波動，避免只被高配息率吸引。",
  },
];

const funds = [
  {
    id: "f1",
    name: "野村鴻運基金",
    type: "台股股票型",
    return1y: 16.8,
    volatility: 12.4,
    risk: 3,
    dividend: "不配息",
    tags: ["TISA", "主基金"],
  },
  {
    id: "f2",
    name: "安聯台灣科技基金",
    type: "科技股票型",
    return1y: 28.6,
    volatility: 21.8,
    risk: 5,
    dividend: "不配息",
    tags: ["科技", "成長"],
  },
  {
    id: "f3",
    name: "全球優質收益基金",
    type: "全球平衡型",
    return1y: 11.2,
    volatility: 9.8,
    risk: 2,
    dividend: "月配",
    tags: ["配息", "TISA"],
  },
  {
    id: "f4",
    name: "聯博全球高收益債基金",
    type: "高收益債券型",
    return1y: 13.6,
    volatility: 16.2,
    risk: 4,
    dividend: "月配",
    tags: ["配息", "債券"],
  },
  {
    id: "f5",
    name: "富達全球科技基金",
    type: "全球科技型",
    return1y: 24.1,
    volatility: 17.6,
    risk: 4,
    dividend: "不配息",
    tags: ["科技", "成長"],
  },
  {
    id: "f6",
    name: "退休穩健配置基金",
    type: "全球平衡型",
    return1y: 9.8,
    volatility: 7.2,
    risk: 2,
    dividend: "季配",
    tags: ["TISA", "退休", "配息"],
  },
  {
    id: "f7",
    name: "亞洲新興成長基金",
    type: "新興市場股票型",
    return1y: 19.4,
    volatility: 22.5,
    risk: 5,
    dividend: "不配息",
    tags: ["成長"],
  },
  {
    id: "f8",
    name: "美元投資級債基金",
    type: "投資級債券型",
    return1y: 7.4,
    volatility: 6.8,
    risk: 2,
    dividend: "月配",
    tags: ["配息", "債券"],
  },
].map((fund) => ({
  ...fund,
  cp: Number((fund.return1y / fund.volatility).toFixed(2)),
}));

let activePersona = "newbie";
let selectedFundId = funds[0].id;

const personaGrid = document.querySelector("#personaGrid");
const criteriaTitle = document.querySelector("#criteriaTitle");
const criteriaCopy = document.querySelector("#criteriaCopy");
const criteriaGrid = document.querySelector("#criteriaGrid");
const fundDots = document.querySelector("#fundDots");
const fundTable = document.querySelector("#fundTable");
const resultCount = document.querySelector("#resultCount");
const detailName = document.querySelector("#detailName");
const detailReason = document.querySelector("#detailReason");
const detailType = document.querySelector("#detailType");
const detailReturn = document.querySelector("#detailReturn");
const detailVolatility = document.querySelector("#detailVolatility");
const detailCp = document.querySelector("#detailCp");
const detailRisk = document.querySelector("#detailRisk");

function getPersona() {
  return personas.find((persona) => persona.id === activePersona) || personas[0];
}

function getFund() {
  return funds.find((fund) => fund.id === selectedFundId) || funds[0];
}

function isMatch(fund) {
  return getPersona().match(fund);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function renderPersonas() {
  personaGrid.innerHTML = personas
    .map(
      (persona) => `
        <button class="persona-card ${persona.id === activePersona ? "active" : ""}" type="button" data-persona="${persona.id}">
          <span>${persona.icon}</span>
          <strong>${persona.title}</strong>
          <p>${persona.headline}</p>
        </button>
      `
    )
    .join("");
}

function renderCriteria() {
  const persona = getPersona();
  criteriaTitle.textContent = persona.headline;
  criteriaCopy.textContent = persona.copy;
  criteriaGrid.innerHTML = persona.criteria
    .map(
      ([label, copy], index) => `
        <article class="criteria-card">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${label}</strong>
          <p>${copy}</p>
        </article>
      `
    )
    .join("");
}

function renderChart() {
  const matched = funds.filter(isMatch);
  resultCount.textContent = `${matched.length} 檔候選`;
  fundDots.innerHTML = funds
    .map((fund) => {
      const x = Math.min(92, Math.max(8, (fund.volatility / 26) * 100));
      const y = Math.min(90, Math.max(10, 100 - (fund.return1y / 32) * 100));
      return `
        <button
          class="fund-dot ${isMatch(fund) ? "match" : ""} ${fund.id === selectedFundId ? "selected" : ""}"
          style="--x:${x}%; --y:${y}%"
          type="button"
          data-fund="${fund.id}"
          aria-label="${fund.name}，1年報酬 ${formatPercent(fund.return1y)}，波動度 ${formatPercent(fund.volatility)}"
        ></button>
      `;
    })
    .join("");
}

function renderDetail() {
  const fund = getFund();
  const persona = getPersona();
  const matchedText = isMatch(fund) ? "符合目前需求" : "可列入比較，但不是目前需求的優先候選";
  detailName.textContent = fund.name;
  detailReason.textContent = `${matchedText}。${persona.reason}`;
  detailType.textContent = fund.type;
  detailReturn.textContent = formatPercent(fund.return1y);
  detailVolatility.textContent = formatPercent(fund.volatility);
  detailCp.textContent = fund.cp.toFixed(2);
  detailRisk.innerHTML = Array.from({ length: 5 }, (_, index) => `<i class="${index < fund.risk ? "on" : ""}"></i>`).join("");
}

function renderTable() {
  fundTable.innerHTML = funds
    .map(
      (fund) => `
        <tr class="${fund.id === selectedFundId ? "selected" : ""}" data-row="${fund.id}">
          <td><strong>${fund.name}</strong></td>
          <td>${fund.type}</td>
          <td>${formatPercent(fund.return1y)}</td>
          <td>${formatPercent(fund.volatility)}</td>
          <td>${fund.cp.toFixed(2)}</td>
          <td><span class="risk-badge">RR${fund.risk}</span></td>
          <td><span class="freq-badge">${fund.dividend}</span></td>
          <td><span class="decision-badge">${isMatch(fund) ? "符合條件" : "可比較"}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderAll() {
  renderPersonas();
  renderCriteria();
  renderChart();
  renderDetail();
  renderTable();
}

personaGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-persona]");
  if (!card) return;
  activePersona = card.dataset.persona;
  const firstMatch = funds.find(isMatch);
  selectedFundId = firstMatch?.id || funds[0].id;
  renderAll();
});

fundDots.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-fund]");
  if (!dot) return;
  selectedFundId = dot.dataset.fund;
  renderChart();
  renderDetail();
  renderTable();
});

fundTable.addEventListener("click", (event) => {
  const row = event.target.closest("[data-row]");
  if (!row) return;
  selectedFundId = row.dataset.row;
  renderChart();
  renderDetail();
  renderTable();
  document.querySelector("#mirror").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderAll();
