const quickFilters = ["配息", "低波動", "科技", "AI", "債券", "TISA", "退休"];

const funds = [
  {
    id: "f1",
    name: "野村鴻運基金",
    type: "台股股票型",
    region: "台灣",
    currency: "台幣",
    dividend: "不配息",
    risk: 3,
    return1y: 16.8,
    volatility: 12.4,
    tags: ["TISA", "台股", "核心"],
    why: "適合想用台股核心部位參與成長、又不想只追單一題材的人。",
    riskNote: "台股集中度較高，遇到電子股修正時淨值可能跟著波動。",
  },
  {
    id: "f2",
    name: "安聯台灣科技基金",
    type: "科技股票型",
    region: "台灣",
    currency: "台幣",
    dividend: "不配息",
    risk: 5,
    return1y: 28.6,
    volatility: 21.8,
    tags: ["科技", "AI", "成長"],
    why: "適合能承受大起伏、想把 AI 與半導體成長放進衛星部位的人。",
    riskNote: "題材熱度高時容易追高，短期回檔幅度可能比平衡型基金大。",
  },
  {
    id: "f3",
    name: "全球優質收益基金",
    type: "全球平衡型",
    region: "全球",
    currency: "美元",
    dividend: "月配",
    risk: 2,
    return1y: 11.2,
    volatility: 9.8,
    tags: ["配息", "低波動", "TISA"],
    why: "適合想先求穩、同時保留每月現金流感受的使用者。",
    riskNote: "配息不等於保證收益，市場下跌時仍可能出現淨值回落。",
  },
  {
    id: "f4",
    name: "聯博全球高收益債基金",
    type: "高收益債券型",
    region: "全球",
    currency: "美元",
    dividend: "月配",
    risk: 4,
    return1y: 13.6,
    volatility: 16.2,
    tags: ["配息", "債券"],
    why: "適合已理解信用風險、想用債券型基金增加配息來源的人。",
    riskNote: "高收益債受景氣與信用利差影響，不能只看配息率。",
  },
  {
    id: "f5",
    name: "富達全球科技基金",
    type: "全球科技型",
    region: "全球",
    currency: "美元",
    dividend: "不配息",
    risk: 4,
    return1y: 24.1,
    volatility: 17.6,
    tags: ["科技", "AI", "成長"],
    why: "適合想分散台灣單一市場、但仍看好全球科技趨勢的人。",
    riskNote: "科技股評價變動快，利率與大型股財報會明顯影響表現。",
  },
  {
    id: "f6",
    name: "退休穩健配置基金",
    type: "全球平衡型",
    region: "全球",
    currency: "台幣",
    dividend: "季配",
    risk: 2,
    return1y: 9.8,
    volatility: 7.2,
    tags: ["退休", "低波動", "TISA", "配息"],
    why: "適合把穩定持有放第一順位、想用定期投入累積資產的人。",
    riskNote: "報酬不會最亮眼，若只追短期績效可能覺得它太慢。",
  },
  {
    id: "f7",
    name: "亞洲新興成長基金",
    type: "新興市場股票型",
    region: "亞洲",
    currency: "美元",
    dividend: "不配息",
    risk: 5,
    return1y: 19.4,
    volatility: 22.5,
    tags: ["成長"],
    why: "適合想增加新興亞洲市場曝險、且能接受較大波動的人。",
    riskNote: "匯率、政策與資金流向都會放大新興市場波動。",
  },
  {
    id: "f8",
    name: "美元投資級債基金",
    type: "投資級債券型",
    region: "美國",
    currency: "美元",
    dividend: "月配",
    risk: 2,
    return1y: 7.4,
    volatility: 6.8,
    tags: ["債券", "配息", "低波動", "退休"],
    why: "適合想降低股票波動、用債券部位穩住投資組合的人。",
    riskNote: "債券價格仍會受利率變動影響，美元資產也有匯率風險。",
  },
  {
    id: "f9",
    name: "全球 AI 基礎建設基金",
    type: "主題股票型",
    region: "全球",
    currency: "美元",
    dividend: "不配息",
    risk: 4,
    return1y: 22.7,
    volatility: 18.9,
    tags: ["AI", "科技", "成長"],
    why: "適合想投資 AI 供應鏈，但希望比單押個股更分散的人。",
    riskNote: "主題型基金容易受市場情緒影響，題材降溫時可能快速修正。",
  },
  {
    id: "f10",
    name: "好好全球多元收益基金",
    type: "多重資產型",
    region: "全球",
    currency: "台幣",
    dividend: "季配",
    risk: 3,
    return1y: 10.6,
    volatility: 8.4,
    tags: ["配息", "低波動", "退休"],
    why: "適合不想自己配置股債比例，希望先用一檔基金建立底倉的人。",
    riskNote: "多元配置能降低單一風險，但不代表市場下跌時不會虧損。",
  },
].map((fund) => ({
  ...fund,
  cp: Number((fund.return1y / fund.volatility).toFixed(2)),
}));

const state = {
  query: "",
  chips: new Set(),
  type: "",
  region: "",
  risk: "",
  currency: "",
  dividend: "",
  sort: "cp-desc",
  view: "cards",
  compare: new Set(),
};

const searchInput = document.querySelector("#fundSearch");
const clearSearch = document.querySelector("#clearSearch");
const quickChips = document.querySelector("#quickChips");
const resultCount = document.querySelector("#resultCount");
const summaryText = document.querySelector("#summaryText");
const typeFilter = document.querySelector("#typeFilter");
const regionFilter = document.querySelector("#regionFilter");
const riskFilter = document.querySelector("#riskFilter");
const currencyFilter = document.querySelector("#currencyFilter");
const dividendFilter = document.querySelector("#dividendFilter");
const resetFilters = document.querySelector("#resetFilters");
const sortSelect = document.querySelector("#sortSelect");
const fundResults = document.querySelector("#fundResults");
const emptyState = document.querySelector("#emptyState");
const compareCount = document.querySelector("#compareCount");
const compareItems = document.querySelector("#compareItems");
const compareButton = document.querySelector("#compareButton");
const viewToggle = document.querySelector(".view-toggle");

function uniqueOptions(key) {
  return [...new Set(funds.map((fund) => fund[key]))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function matchesRisk(fund) {
  if (!state.risk) return true;
  if (state.risk === "1-2") return fund.risk <= 2;
  if (state.risk === "3") return fund.risk === 3;
  return fund.risk >= 4;
}

function matchesQuery(fund) {
  if (!state.query) return true;
  const target = [fund.name, fund.type, fund.region, fund.currency, fund.dividend, ...fund.tags].join(" ").toLowerCase();
  return target.includes(state.query.toLowerCase());
}

function matchesChips(fund) {
  if (state.chips.size === 0) return true;
  return [...state.chips].every((chip) => fund.tags.includes(chip) || fund.type.includes(chip));
}

function getFilteredFunds() {
  const filtered = funds.filter(
    (fund) =>
      matchesQuery(fund) &&
      matchesChips(fund) &&
      (!state.type || fund.type === state.type) &&
      (!state.region || fund.region === state.region) &&
      matchesRisk(fund) &&
      (!state.currency || fund.currency === state.currency) &&
      (!state.dividend || fund.dividend === state.dividend)
  );

  return filtered.sort((a, b) => {
    if (state.sort === "return-desc") return b.return1y - a.return1y;
    if (state.sort === "volatility-asc") return a.volatility - b.volatility;
    return b.cp - a.cp;
  });
}

function renderChips() {
  quickChips.innerHTML = quickFilters
    .map((chip) => `<button class="chip ${state.chips.has(chip) ? "active" : ""}" type="button" data-chip="${chip}">${chip}</button>`)
    .join("");
}

function renderSummary(filtered) {
  resultCount.textContent = `${filtered.length} 檔基金`;
  if (state.chips.size > 0 || state.query) {
    summaryText.textContent = "已依你的關鍵字與標籤縮小候選，接著可用風險、幣別或配息頻率再收斂。";
    return;
  }
  summaryText.textContent = "先用搜尋或快速標籤縮小範圍，再比較 CP 值、報酬與波動。";
}

function renderRisk(level) {
  return `<span class="risk-badge">RR${level}</span>`;
}

function renderFundCard(fund) {
  const isSelected = state.compare.has(fund.id);
  const tags = fund.tags
    .slice(0, 4)
    .map((tag, index) => `<span class="tag ${index === 0 ? "primary" : ""}">${tag}</span>`)
    .join("");
  return `
    <article class="fund-card ${state.view === "list" ? "list-mode" : ""} ${isSelected ? "selected" : ""}">
      <div class="fund-header">
        <div>
          <h3>${fund.name}</h3>
          <div class="fund-meta">
            <span class="tag">${fund.type}</span>
            <span class="tag">${fund.region}</span>
            <span class="tag">${fund.currency}</span>
            ${tags}
          </div>
        </div>
        <label class="compare-check">
          <input type="checkbox" data-compare="${fund.id}" ${isSelected ? "checked" : ""} />
          加入比較
        </label>
      </div>
      <div class="fund-stats">
        <div class="stat"><span>1年報酬</span><strong>${formatPercent(fund.return1y)}</strong></div>
        <div class="stat"><span>波動度</span><strong>${formatPercent(fund.volatility)}</strong></div>
        <div class="stat"><span>CP值</span><strong>${fund.cp.toFixed(2)}</strong></div>
        <div class="stat"><span>風險 / 配息</span><strong>${renderRisk(fund.risk)} ${fund.dividend}</strong></div>
      </div>
      <div class="decision-row">
        <div class="decision-box good">
          <span>為什麼適合你</span>
          <p>${fund.why}</p>
        </div>
        <div class="decision-box risk">
          <span>主要風險</span>
          <p>${fund.riskNote}</p>
        </div>
      </div>
    </article>
  `;
}

function renderResults() {
  const filtered = getFilteredFunds();
  renderSummary(filtered);
  fundResults.className = `fund-results ${state.view}`;
  fundResults.innerHTML = filtered.map(renderFundCard).join("");
  emptyState.hidden = filtered.length > 0;
}

function renderCompare() {
  const selected = funds.filter((fund) => state.compare.has(fund.id));
  compareCount.textContent = `${selected.length} / 3`;
  compareButton.disabled = selected.length < 2;
  compareItems.innerHTML =
    selected.length === 0
      ? `<span class="tag">最多選 3 檔基金</span>`
      : selected
          .map(
            (fund) => `
              <span class="compare-chip">
                ${fund.name}
                <button type="button" aria-label="移除 ${fund.name}" data-remove="${fund.id}">×</button>
              </span>
            `
          )
          .join("");
}

function renderAll() {
  renderChips();
  renderResults();
  renderCompare();
}

function resetState() {
  state.query = "";
  state.chips.clear();
  state.type = "";
  state.region = "";
  state.risk = "";
  state.currency = "";
  state.dividend = "";
  searchInput.value = "";
  typeFilter.value = "";
  regionFilter.value = "";
  riskFilter.value = "";
  currencyFilter.value = "";
  dividendFilter.value = "";
}

fillSelect(typeFilter, uniqueOptions("type"));
fillSelect(regionFilter, uniqueOptions("region"));
fillSelect(currencyFilter, uniqueOptions("currency"));
fillSelect(dividendFilter, uniqueOptions("dividend"));

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderAll();
});

clearSearch.addEventListener("click", () => {
  state.query = "";
  searchInput.value = "";
  renderAll();
});

quickChips.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-chip]");
  if (!chip) return;
  const value = chip.dataset.chip;
  if (state.chips.has(value)) state.chips.delete(value);
  else state.chips.add(value);
  renderAll();
});

typeFilter.addEventListener("change", (event) => {
  state.type = event.target.value;
  renderAll();
});

regionFilter.addEventListener("change", (event) => {
  state.region = event.target.value;
  renderAll();
});

riskFilter.addEventListener("change", (event) => {
  state.risk = event.target.value;
  renderAll();
});

currencyFilter.addEventListener("change", (event) => {
  state.currency = event.target.value;
  renderAll();
});

dividendFilter.addEventListener("change", (event) => {
  state.dividend = event.target.value;
  renderAll();
});

resetFilters.addEventListener("click", () => {
  resetState();
  renderAll();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderAll();
});

viewToggle.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  state.view = button.dataset.view;
  viewToggle.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  renderResults();
});

fundResults.addEventListener("change", (event) => {
  const input = event.target.closest("[data-compare]");
  if (!input) return;
  const id = input.dataset.compare;
  if (input.checked && state.compare.size >= 3 && !state.compare.has(id)) {
    input.checked = false;
    window.alert("最多只能比較 3 檔基金。");
    return;
  }
  if (input.checked) state.compare.add(id);
  else state.compare.delete(id);
  renderAll();
});

compareItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  state.compare.delete(button.dataset.remove);
  renderAll();
});

compareButton.addEventListener("click", () => {
  const names = funds.filter((fund) => state.compare.has(fund.id)).map((fund) => fund.name);
  window.alert(`Demo：準備比較 ${names.join("、")}`);
});

renderAll();
