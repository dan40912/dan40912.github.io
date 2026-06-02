const findFunds = [
  { id: "f1", name: "全球核心配置基金", type: "全球平衡", r1y: 12.6, r3y: 28.4, dividend: "季配", risk: "RR3", cp: 78, volatility: 11, reason: "適合想要長期持有、不要單一市場過度集中者。" },
  { id: "f2", name: "NASDAQ 100 成長基金", type: "科技股票", r1y: 31.2, r3y: 66.8, dividend: "不配息", risk: "RR5", cp: 69, volatility: 24, reason: "成長動能強，但波動大，適合能承受短期起伏者。" },
  { id: "f3", name: "高股息收益基金", type: "收益型", r1y: 10.8, r3y: 22.1, dividend: "月配", risk: "RR3", cp: 74, volatility: 12, reason: "適合想建立現金流者，但仍需看淨值與總報酬。" },
  { id: "f4", name: "美元投資級債券基金", type: "債券", r1y: 7.4, r3y: 13.6, dividend: "月配", risk: "RR2", cp: 82, volatility: 7, reason: "適合重視波動控制者，需留意利率與匯率變動。" },
  { id: "f5", name: "AI 科技趨勢基金", type: "主題股票", r1y: 42.3, r3y: 91.7, dividend: "不配息", risk: "RR5", cp: 71, volatility: 29, reason: "適合積極型投資人，但不適合作為新手唯一核心部位。" },
];

const mirrorFunds = [
  { id: "nbbu", name: "路博邁5G股票基金T累積(新臺幣)", x: 74, y: 18, cp: "6.52", beatSp: "是", beatNas: "是", risk: "科技題材集中", type: "fund", zone: "衝刺型候選", interpret: "過去一年報酬很高，但波動也高。它不等於最適合所有人，應先看最大回撤、同類基金與大盤基準。" },
  { id: "sp500", name: "S&P 500", x: 42, y: 38, cp: "基準", beatSp: "-", beatNas: "-", risk: "市場基準", type: "benchmark", zone: "大盤基準", interpret: "S&P 500 作為美股大盤基準，幫助判斷基金是否真的跑贏市場。" },
  { id: "nas100", name: "NASDAQ 100", x: 58, y: 26, cp: "基準", beatSp: "-", beatNas: "-", risk: "科技集中", type: "benchmark", zone: "大盤基準", interpret: "NASDAQ 100 可作為科技基金的基準，不應只拿科技基金跟低風險債券比較。" },
  { id: "health", name: "全球醫療保健基金", x: 31, y: 44, cp: "3.18", beatSp: "否", beatNas: "否", risk: "防禦產業", type: "industry", zone: "穩定型候選", interpret: "報酬較溫和但波動較低，適合用來理解不同產業的風險報酬差異。" },
  { id: "em", name: "新興市場機會基金", x: 78, y: 66, cp: "1.42", beatSp: "否", beatNas: "否", risk: "匯率與區域風險", type: "industry", zone: "需謹慎觀察", interpret: "承擔較高波動但報酬未反映時，不應急著申購，應先看國家與匯率風險。" },
  { id: "utility", name: "公用事業收益基金", x: 25, y: 62, cp: "2.40", beatSp: "否", beatNas: "否", risk: "成長有限", type: "industry", zone: "穩定型候選", interpret: "低波動但報酬也較低，適合保守配置，不適合追求高成長者。" },
];

const tradingViewHeatmaps = [
  {
    id: "spx500",
    label: "S&P 500",
    note: "目前顯示 S&P 500 產業熱力圖。若科技板塊整體大漲，科技基金績效也可能受到整體產業行情推動。",
    config: { dataSource: "SPX500", blockColor: "change", blockSize: "market_cap_basic", grouping: "sector" },
  },
  {
    id: "nasdaq100",
    label: "NASDAQ 100",
    note: "目前顯示 NASDAQ 100 熱力圖，適合拿來判斷科技與成長型基金是否只是跟著大盤題材上漲。",
    config: { dataSource: "NASDAQ100", blockColor: "change", blockSize: "market_cap_basic", grouping: "sector" },
  },
  {
    id: "taiwan",
    label: "台股",
    note: "目前顯示台股市場熱力圖，可用來觀察台股基金是否受半導體、金融或傳產板塊影響。",
    config: { dataSource: "TWSE", blockColor: "change", blockSize: "market_cap_basic", grouping: "sector" },
  },
  {
    id: "crypto",
    label: "Crypto",
    note: "目前顯示加密資產熱力圖，適合用來理解高波動資產與傳統基金之間的風險差異。",
    config: { dataSource: "Crypto", blockColor: "change", blockSize: "market_cap_calc", grouping: "sector" },
  },
];

function formatCurrency(value) {
  return `NT$ ${Math.round(value).toLocaleString("zh-TW")}`;
}

function initFindPage() {
  const fundList = document.querySelector("#fundList");
  if (!fundList) return;

  const selected = new Set();
  let prompted = false;
  const selectedCount = document.querySelector("#selectedCount");
  const trayTitle = document.querySelector("#trayTitle");
  const trayCopy = document.querySelector("#trayCopy");
  const trayButton = document.querySelector("#trayButton");
  const compareDialog = document.querySelector("#compareDialog");
  const compareChart = document.querySelector("#compareChart");

  function renderFunds() {
    fundList.innerHTML = `
      <div class="fund-head">
        <div class="cell">基金名稱</div><div class="cell">類型</div><div class="cell">1 年</div><div class="cell">3 年</div><div class="cell">配息</div><div class="cell">風險</div><div class="cell">為什麼值得看</div><div class="cell">比較</div>
      </div>
      ${findFunds.map((fund) => `
        <div class="fund-row">
          <div class="cell"><span class="fund-name">${fund.name}</span></div>
          <div class="cell">${fund.type}</div>
          <div class="cell positive">+${fund.r1y}%</div>
          <div class="cell positive">+${fund.r3y}%</div>
          <div class="cell">${fund.dividend}</div>
          <div class="cell risk">${fund.risk}</div>
          <div class="cell"><span class="reason">${fund.reason}</span></div>
          <div class="cell"><label class="compare-check"><input type="checkbox" data-fund="${fund.id}" ${selected.has(fund.id) ? "checked" : ""} />比較</label></div>
        </div>
      `).join("")}
    `;
  }

  function renderCompare() {
    selectedCount.textContent = `已選 ${selected.size} / 3`;
    trayTitle.textContent = `已選 ${selected.size} 檔基金`;
    trayCopy.textContent = selected.size >= 2 ? "可以立刻看到圖表比較，而不是回列表慢慢猜。" : "選任兩檔基金後，立即彈窗提醒比較。";
    trayButton.disabled = selected.size < 2;

    const funds = findFunds.filter((fund) => selected.has(fund.id));
    compareChart.innerHTML = funds.map((fund) => `
      <section>
        <h3>${fund.name}</h3>
        ${[
          ["CP 值", fund.cp],
          ["低波動", Math.max(8, 100 - fund.volatility * 3)],
          ["1 年報酬", Math.min(100, fund.r1y * 2)],
        ].map(([label, value]) => `
          <div class="chart-row">
            <div class="chart-head"><span>${label}</span><span>${Math.round(value)}</span></div>
            <div class="track"><div class="fill" style="width:${Math.min(100, value)}%"></div></div>
          </div>
        `).join("")}
      </section>
    `).join("");
  }

  fundList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-fund]");
    if (!checkbox) return;
    if (checkbox.checked && selected.size >= 3) {
      checkbox.checked = false;
      return;
    }
    checkbox.checked ? selected.add(checkbox.dataset.fund) : selected.delete(checkbox.dataset.fund);
    renderCompare();
    if (selected.size === 2 && !prompted) {
      prompted = true;
      compareDialog.showModal();
    }
  });

  document.querySelector("#dialogClose")?.addEventListener("click", () => compareDialog.close());
  document.querySelector("#dialogLater")?.addEventListener("click", () => compareDialog.close());
  document.querySelector("#dialogCompare")?.addEventListener("click", () => compareDialog.close());
  trayButton?.addEventListener("click", () => selected.size >= 2 && compareDialog.showModal());

  document.querySelector("#runAiSearch")?.addEventListener("click", () => {
    const query = document.querySelector("#aiQuery").value;
    document.querySelector("#aiResult").innerHTML = `
      <span>AI 篩選摘要</span>
      <strong>${query.includes("配息") ? "適合先看：高股息 / 收益型 / 債券" : "適合先看：平衡型 / 全球配置 / TISA 候選"}</strong>
      <p>系統已把需求翻成：可承受波動、持有時間、基金類型、配息需求與應優先看的風險欄位。</p>
    `;
  });

  const ratios = { nas100: { 1: 1.36, 3: 1.82, 5: 2.46 }, sp500: { 1: 1.22, 3: 1.54, 5: 1.92 } };
  function renderCalc() {
    const index = document.querySelector("#calcIndex").value;
    const amount = Number(document.querySelector("#calcAmount").value || 0);
    const years = document.querySelector("#calcYears").value;
    const value = amount * ratios[index][years];
    document.querySelector("#calcValue").textContent = formatCurrency(value);
    document.querySelector("#calcCopy").textContent = `以 ${index === "nas100" ? "NASDAQ 100" : "S&P 500"} ${years} 年歷史模擬，僅作為教育展示，非未來報酬保證。`;
    document.querySelector("#miniLine").innerHTML = [25, 36, 42, 58, 64, 76, 88].map((h) => `<i style="height:${h}%"></i>`).join("");
  }
  ["#calcIndex", "#calcAmount", "#calcYears"].forEach((selector) => document.querySelector(selector)?.addEventListener("input", renderCalc));

  renderFunds();
  renderCompare();
  renderCalc();
}

function initMirrorPage() {
  const map = document.querySelector("#quadrantMap");
  if (!map) return;
  const guideDialog = document.querySelector("#guideDialog");
  const seen = localStorage.getItem("fundMirrorGuideSeen");
  if (!seen) {
    setTimeout(() => {
      guideDialog.showModal();
      localStorage.setItem("fundMirrorGuideSeen", "1");
    }, 500);
  }
  document.querySelector("#openGuide")?.addEventListener("click", () => guideDialog.showModal());
  document.querySelector("#closeGuide")?.addEventListener("click", () => guideDialog.close());

  function setSelected(item) {
    document.querySelector("#selectedName").textContent = item.name;
    document.querySelector("#selectedInterpret").textContent = `這個點落在「${item.zone}」：${item.interpret}`;
    document.querySelector("#cpValue").textContent = item.cp;
    document.querySelector("#beatSp").textContent = item.beatSp;
    document.querySelector("#beatNas").textContent = item.beatNas;
    document.querySelector("#riskText").textContent = item.risk;
    document.querySelectorAll(".dot").forEach((dot) => dot.classList.toggle("selected", dot.dataset.id === item.id));
  }

  document.querySelector("#mirrorDots").innerHTML = mirrorFunds.map((item) => `
    <button class="dot ${item.type} ${item.id === "nbbu" ? "selected" : ""}" type="button" data-id="${item.id}" style="left:${item.x}%; top:${item.y}%" aria-label="${item.name}"></button>
    <span class="dot-label" style="left:${item.x}%; top:${item.y}%">${item.name}</span>
  `).join("");
  document.querySelector("#mirrorDots").addEventListener("click", (event) => {
    const dot = event.target.closest("[data-id]");
    if (!dot) return;
    setSelected(mirrorFunds.find((item) => item.id === dot.dataset.id));
  });

  const picker = document.querySelector("#tvMarketPicker");
  const frame = document.querySelector("#tradingviewHeatmapFrame");
  const note = document.querySelector("#tvHeatmapNote");

  function heatmapUrl(item) {
    return `https://www.tradingview.com/heatmap/stock/#${encodeURIComponent(JSON.stringify(item.config))}`;
  }

  function setTradingViewHeatmap(id) {
    const item = tradingViewHeatmaps.find((heatmap) => heatmap.id === id) || tradingViewHeatmaps[0];
    frame.src = heatmapUrl(item);
    note.textContent = item.note;
    picker.querySelectorAll("[data-tv-market]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tvMarket === item.id);
    });
  }

  picker.innerHTML = tradingViewHeatmaps
    .map((item) => `<button type="button" class="${item.id === "spx500" ? "active" : ""}" data-tv-market="${item.id}">${item.label}</button>`)
    .join("");
  picker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tv-market]");
    if (!button) return;
    setTradingViewHeatmap(button.dataset.tvMarket);
  });
  setTradingViewHeatmap("spx500");
}

initFindPage();
initMirrorPage();
