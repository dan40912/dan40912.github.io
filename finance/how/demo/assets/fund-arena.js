const palette = ["#ff9664", "#0eb9b5", "#2f80ed"];

const dimensions = [
  { key: "returnScore", label: "報酬", compare: "越高代表近一年報酬表現越突出" },
  { key: "stabilityScore", label: "波動控制", compare: "越高代表波動相對可控" },
  { key: "cpScore", label: "CP值", compare: "越高代表報酬與波動的比例較好" },
  { key: "feeScore", label: "費用", compare: "越高代表費用負擔相對低" },
  { key: "incomeScore", label: "配息", compare: "越高代表配息節奏較明確" },
  { key: "riskScore", label: "風險等級", compare: "越高代表風險等級較低" },
];

const funds = [
  {
    id: "f1",
    name: "退休穩健配置基金",
    type: "全球平衡型",
    region: "全球",
    dividend: "季配",
    risk: 2,
    return1y: 9.8,
    volatility: 7.2,
    cp: 1.36,
    fee: 1.1,
    tags: ["退休", "低波動", "TISA"],
    returnScore: 54,
    stabilityScore: 88,
    cpScore: 78,
    feeScore: 74,
    incomeScore: 66,
    riskScore: 84,
    scenarios: {
      stable: 92,
      growth: 45,
      income: 72,
    },
    fit: "適合把穩定持有放在第一順位、想先看波動控制的人。",
    riskNote: "報酬速度可能較慢，不適合只追短期績效的人。",
  },
  {
    id: "f2",
    name: "全球優質收益基金",
    type: "全球平衡型",
    region: "全球",
    dividend: "月配",
    risk: 2,
    return1y: 11.2,
    volatility: 9.8,
    cp: 1.14,
    fee: 1.25,
    tags: ["配息", "低波動", "月配"],
    returnScore: 60,
    stabilityScore: 80,
    cpScore: 68,
    feeScore: 68,
    incomeScore: 90,
    riskScore: 84,
    scenarios: {
      stable: 86,
      growth: 48,
      income: 94,
    },
    fit: "適合重視現金流節奏、也希望基金類型不要過度刺激的人。",
    riskNote: "配息不等於保證收益，淨值仍可能受市場下跌影響。",
  },
  {
    id: "f3",
    name: "美元投資級債基金",
    type: "投資級債券型",
    region: "美國",
    dividend: "月配",
    risk: 2,
    return1y: 7.4,
    volatility: 6.8,
    cp: 1.09,
    fee: 0.95,
    tags: ["債券", "低波動", "月配"],
    returnScore: 42,
    stabilityScore: 92,
    cpScore: 64,
    feeScore: 82,
    incomeScore: 82,
    riskScore: 84,
    scenarios: {
      stable: 90,
      growth: 32,
      income: 84,
    },
    fit: "適合想降低股票波動、用債券部位穩住投資組合的人。",
    riskNote: "仍有利率、信用與美元匯率風險。",
  },
  {
    id: "f4",
    name: "野村鴻運基金",
    type: "台股股票型",
    region: "台灣",
    dividend: "不配息",
    risk: 3,
    return1y: 16.8,
    volatility: 12.4,
    cp: 1.35,
    fee: 1.45,
    tags: ["台股", "TISA", "核心"],
    returnScore: 74,
    stabilityScore: 66,
    cpScore: 76,
    feeScore: 58,
    incomeScore: 20,
    riskScore: 66,
    scenarios: {
      stable: 64,
      growth: 76,
      income: 28,
    },
    fit: "適合想用台股核心部位參與成長、但不想只押單一主題的人。",
    riskNote: "台股集中度較高，電子股修正時淨值可能同步波動。",
  },
  {
    id: "f5",
    name: "富達全球科技基金",
    type: "全球科技型",
    region: "全球",
    dividend: "不配息",
    risk: 4,
    return1y: 24.1,
    volatility: 17.6,
    cp: 1.37,
    fee: 1.6,
    tags: ["科技", "AI", "成長"],
    returnScore: 92,
    stabilityScore: 44,
    cpScore: 79,
    feeScore: 50,
    incomeScore: 20,
    riskScore: 48,
    scenarios: {
      stable: 38,
      growth: 94,
      income: 22,
    },
    fit: "適合能承受較大淨值起伏、想參與全球科技成長的人。",
    riskNote: "科技股評價變動快，利率與大型股財報會放大波動。",
  },
  {
    id: "f6",
    name: "全球 AI 基礎建設基金",
    type: "主題股票型",
    region: "全球",
    dividend: "不配息",
    risk: 4,
    return1y: 22.7,
    volatility: 18.9,
    cp: 1.20,
    fee: 1.55,
    tags: ["AI", "主題", "成長"],
    returnScore: 88,
    stabilityScore: 40,
    cpScore: 70,
    feeScore: 52,
    incomeScore: 20,
    riskScore: 48,
    scenarios: {
      stable: 34,
      growth: 90,
      income: 20,
    },
    fit: "適合想觀察 AI 供應鏈、且理解主題型基金波動的人。",
    riskNote: "題材退燒時修正可能很快，不適合短期資金。",
  },
];

let selectedIds = new Set(["f1", "f2"]);

const fundPicker = document.querySelector("#fundPicker");
const selectedCount = document.querySelector("#selectedCount");
const emptyArena = document.querySelector("#emptyArena");
const arenaGrid = document.querySelector("#arenaGrid");
const scenarioSection = document.querySelector("#scenarios");
const tableSection = document.querySelector("#tableSection");
const radarChart = document.querySelector("#radarChart");
const radarLegend = document.querySelector("#radarLegend");
const scoreList = document.querySelector("#scoreList");
const scenarioGrid = document.querySelector("#scenarioGrid");
const compareHead = document.querySelector("#compareHead");
const compareBody = document.querySelector("#compareBody");
const autoPickButton = document.querySelector("#autoPickButton");

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function getSelectedFunds() {
  return funds.filter((fund) => selectedIds.has(fund.id));
}

function renderPicker() {
  const isFull = selectedIds.size >= 3;
  selectedCount.textContent = `${selectedIds.size} / 3`;
  fundPicker.innerHTML = funds
    .map((fund) => {
      const selected = selectedIds.has(fund.id);
      const disabled = isFull && !selected;
      return `
        <button class="pick-card ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" type="button" data-fund="${fund.id}" ${disabled ? "aria-disabled=\"true\"" : ""}>
          <h3>${fund.name}</h3>
          <div class="fund-meta">
            <span class="tag primary">${fund.type}</span>
            <span class="tag">${fund.region}</span>
            <span class="tag">RR${fund.risk}</span>
          </div>
          <div class="mini-stats">
            <div><span>1年報酬</span><strong>${formatPercent(fund.return1y)}</strong></div>
            <div><span>波動度</span><strong>${formatPercent(fund.volatility)}</strong></div>
            <div><span>CP值</span><strong>${fund.cp.toFixed(2)}</strong></div>
            <div><span>配息</span><strong>${fund.dividend}</strong></div>
          </div>
        </button>
      `;
    })
    .join("");
}

function pointFor(index, score) {
  const center = 210;
  const radius = (score / 100) * 150;
  const angle = -Math.PI / 2 + (index / dimensions.length) * Math.PI * 2;
  return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
}

function polygonPoints(score = 100) {
  return dimensions.map((_, index) => pointFor(index, score).join(",")).join(" ");
}

function renderRadar(selected) {
  const grid = [100, 75, 50, 25]
    .map((score) => `<polygon points="${polygonPoints(score)}" fill="none" stroke="#e0e0e0" stroke-width="1" />`)
    .join("");
  const axes = dimensions
    .map((dimension, index) => {
      const [x, y] = pointFor(index, 100);
      const labelX = 210 + (x - 210) * 1.13;
      const labelY = 210 + (y - 210) * 1.13;
      return `
        <line x1="210" y1="210" x2="${x}" y2="${y}" stroke="#ebebeb" />
        <text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="#666" font-size="13" font-weight="800">${dimension.label}</text>
      `;
    })
    .join("");
  const fundShapes = selected
    .map((fund, fundIndex) => {
      const points = dimensions.map((dimension, index) => pointFor(index, fund[dimension.key]).join(",")).join(" ");
      const color = palette[fundIndex];
      return `
        <polygon points="${points}" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="3" />
        ${dimensions
          .map((dimension, index) => {
            const [x, y] = pointFor(index, fund[dimension.key]);
            return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" />`;
          })
          .join("")}
      `;
    })
    .join("");
  radarChart.innerHTML = `${grid}${axes}${fundShapes}<circle cx="210" cy="210" r="3" fill="#999" />`;
  radarLegend.innerHTML = selected
    .map(
      (fund, index) => `
        <span class="legend-item"><i class="legend-dot" style="background:${palette[index]}"></i>${fund.name}</span>
      `
    )
    .join("");
}

function getDiffTag(values) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max - min >= 35) return "差異大";
  if (max - min >= 18) return "差異中";
  return "接近";
}

function renderScores(selected) {
  scoreList.innerHTML = dimensions
    .map((dimension) => {
      const values = selected.map((fund) => fund[dimension.key]);
      return `
        <section class="score-group">
          <header>
            <div>
              <h4>${dimension.label}</h4>
              <small>${dimension.compare}</small>
            </div>
            <span class="diff-tag">${getDiffTag(values)}</span>
          </header>
          ${selected
            .map(
              (fund, index) => `
                <div class="score-fund-line">
                  <span class="score-name">${fund.name}</span>
                  <span class="bar-track"><i class="bar-fill" style="--score:${fund[dimension.key]}%; --color:${palette[index]}"></i></span>
                  <span class="score-value">${fund[dimension.key]}</span>
                </div>
              `
            )
            .join("")}
        </section>
      `;
    })
    .join("");
}

function bestFor(selected, scenario) {
  return [...selected].sort((a, b) => b.scenarios[scenario] - a.scenarios[scenario])[0];
}

function renderScenarios(selected) {
  const stable = bestFor(selected, "stable");
  const growth = bestFor(selected, "growth");
  const income = bestFor(selected, "income");
  const scenarios = [
    {
      title: "誰比較適合穩健型",
      fund: stable,
      tag: "看波動控制 / 風險等級 / 費用",
      copy: `${stable.name} 在目前選擇中較偏穩健情境，適合優先理解波動與持有節奏。`,
    },
    {
      title: "誰比較適合成長型",
      fund: growth,
      tag: "看報酬動能 / CP值 / 成長題材",
      copy: `${growth.name} 的成長屬性較明顯，但需要同步接受較大的淨值起伏。`,
    },
    {
      title: "誰比較適合配息型",
      fund: income,
      tag: "看配息頻率 / 收益型特徵 / 波動",
      copy: `${income.name} 較符合配息觀察情境，但配息不代表總報酬一定較高。`,
    },
  ];
  scenarioGrid.innerHTML = scenarios
    .map(
      (item) => `
        <article class="scenario-card">
          <h3>${item.title}</h3>
          <div class="scenario-meta">
            <span class="tag primary">${item.fund.name}</span>
            <span class="tag">${item.tag}</span>
          </div>
          <p>${item.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderTable(selected) {
  const rows = [
    ["基金類型", (fund) => fund.type],
    ["投資區域", (fund) => fund.region],
    ["1年報酬", (fund) => formatPercent(fund.return1y)],
    ["波動度", (fund) => formatPercent(fund.volatility)],
    ["CP值", (fund) => fund.cp.toFixed(2)],
    ["費用率", (fund) => `${fund.fee.toFixed(2)}%`],
    ["配息", (fund) => fund.dividend],
    ["風險等級", (fund) => `RR${fund.risk}`],
    ["適合情境", (fund) => fund.fit],
    ["注意風險", (fund) => fund.riskNote],
  ];
  compareHead.innerHTML = `<tr><th>比較維度</th>${selected.map((fund) => `<th>${fund.name}</th>`).join("")}</tr>`;
  compareBody.innerHTML = rows
    .map(([label, getValue]) => `<tr><td><strong>${label}</strong></td>${selected.map((fund) => `<td>${getValue(fund)}</td>`).join("")}</tr>`)
    .join("");
}

function renderArena() {
  const selected = getSelectedFunds();
  const ready = selected.length >= 2;
  emptyArena.hidden = ready;
  arenaGrid.hidden = !ready;
  scenarioSection.hidden = !ready;
  tableSection.hidden = !ready;
  if (!ready) return;
  renderRadar(selected);
  renderScores(selected);
  renderScenarios(selected);
  renderTable(selected);
}

function renderAll() {
  renderPicker();
  renderArena();
}

fundPicker.addEventListener("click", (event) => {
  const card = event.target.closest("[data-fund]");
  if (!card) return;
  const id = card.dataset.fund;
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else if (selectedIds.size < 3) {
    selectedIds.add(id);
  }
  renderAll();
});

autoPickButton.addEventListener("click", () => {
  selectedIds = new Set(["f1", "f2", "f5"]);
  renderAll();
  document.querySelector("#arena").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderAll();
