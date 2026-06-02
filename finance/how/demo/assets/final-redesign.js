const findFunds = [
  { id: "DQ09", name: "台新主流基金", type: "台股股票", r1y: 24.5, r3y: 82.4, dividend: "不配息", risk: "RR5", cp: 86, volatility: 22, reason: "台股大型權值與科技題材，適合積極型投資人觀察。", endValue: 200.59, compareReturn: 280.05, date: "2026/06/02", series: [0, 8, 16, 25, 38, 52, 64, 92, 120, 158, 214, 280] },
  { id: "LG21", name: "利安資金韓國基金(美元)", type: "韓國股票", r1y: 21.8, r3y: 64.7, dividend: "不配息", risk: "RR5", cp: 78, volatility: 25, reason: "韓國科技與出口循環題材，波動較高但成長動能明確。", endValue: 3.393, compareReturn: 245.87, date: "2026/05/29", series: [0, 6, 14, 22, 34, 48, 72, 88, 126, 168, 205, 246] },
  { id: "AL01", name: "安聯台灣科技基金", type: "台股科技", r1y: 19.6, r3y: 58.3, dividend: "不配息", risk: "RR5", cp: 74, volatility: 23, reason: "集中科技供應鏈，適合用來比較高波動成長型標的。", endValue: 71.45, compareReturn: 207.34, date: "2026/06/02", series: [0, 5, 12, 20, 30, 42, 56, 76, 98, 135, 174, 207] },
  { id: "AL46", name: "安聯收益成長基金", type: "多重資產", r1y: 12.4, r3y: 31.8, dividend: "月配", risk: "RR3", cp: 82, volatility: 12, reason: "兼顧配息與成長，適合和純股票基金比較波動差異。", endValue: 11.82, compareReturn: 88.16, date: "2026/06/02", series: [0, 3, 7, 10, 16, 24, 32, 39, 48, 61, 74, 88] },
  { id: "CS04", name: "瑞銀全球創新趨勢基金", type: "全球股票", r1y: 17.8, r3y: 44.2, dividend: "不配息", risk: "RR4", cp: 77, volatility: 18, reason: "全球創新題材，適合分散單一市場但仍承擔成長波動。", endValue: 25.7, compareReturn: 126.45, date: "2026/06/02", series: [0, 4, 10, 19, 24, 36, 52, 62, 77, 92, 110, 126] },
  { id: "F006", name: "野村優質基金", type: "台股股票", r1y: 16.2, r3y: 39.5, dividend: "不配息", risk: "RR4", cp: 73, volatility: 17, reason: "偏大型績優股配置，適合做台股核心候選比較。", endValue: 42.61, compareReturn: 118.3, date: "2026/06/02", series: [0, 3, 9, 14, 21, 32, 44, 58, 71, 88, 104, 118] },
  { id: "F007", name: "統一奔騰基金", type: "台股科技", r1y: 28.9, r3y: 76.6, dividend: "不配息", risk: "RR5", cp: 80, volatility: 27, reason: "科技彈性大，適合觀察高報酬是否伴隨高波動。", endValue: 184.2, compareReturn: 232.7, date: "2026/06/02", series: [0, 7, 17, 29, 44, 61, 83, 112, 146, 190, 218, 233] },
  { id: "F008", name: "群益馬拉松基金", type: "台股股票", r1y: 14.7, r3y: 33.4, dividend: "不配息", risk: "RR4", cp: 70, volatility: 16, reason: "長期台股主動型基金，可作為穩健台股比較基準。", endValue: 139.8, compareReturn: 96.4, date: "2026/06/02", series: [0, 2, 8, 13, 20, 27, 39, 50, 61, 75, 88, 96] },
  { id: "F009", name: "富達全球科技基金", type: "全球科技", r1y: 25.1, r3y: 69.8, dividend: "不配息", risk: "RR5", cp: 79, volatility: 24, reason: "全球科技龍頭配置，適合和 NASDAQ 題材基金比較。", endValue: 98.35, compareReturn: 214.9, date: "2026/06/02", series: [0, 6, 15, 27, 39, 58, 73, 94, 128, 166, 197, 215] },
  { id: "F010", name: "摩根美國科技基金", type: "美國科技", r1y: 23.4, r3y: 62.5, dividend: "不配息", risk: "RR5", cp: 76, volatility: 23, reason: "美國科技集中度高，適合檢視題材集中風險。", endValue: 44.05, compareReturn: 188.6, date: "2026/06/02", series: [0, 5, 13, 24, 36, 51, 68, 86, 112, 148, 171, 189] },
  { id: "F011", name: "貝萊德世界能源基金", type: "能源股票", r1y: 6.2, r3y: 21.9, dividend: "不配息", risk: "RR4", cp: 58, volatility: 20, reason: "能源循環題材，適合和科技基金比較景氣循環差異。", endValue: 19.45, compareReturn: 52.2, date: "2026/06/02", series: [0, 4, 1, 8, 18, 11, 22, 30, 28, 40, 45, 52] },
  { id: "F012", name: "施羅德環球氣候基金", type: "永續股票", r1y: 9.5, r3y: 24.6, dividend: "不配息", risk: "RR4", cp: 63, volatility: 15, reason: "永續與氣候題材，適合關注長線政策與產業轉型。", endValue: 15.76, compareReturn: 68.9, date: "2026/06/02", series: [0, 2, 5, 9, 14, 20, 29, 36, 44, 51, 60, 69] },
  { id: "F013", name: "景順全球消費趨勢基金", type: "全球消費", r1y: 10.8, r3y: 29.1, dividend: "不配息", risk: "RR4", cp: 67, volatility: 14, reason: "消費品牌與電商配置，適合搭配科技基金分散比較。", endValue: 28.33, compareReturn: 74.5, date: "2026/06/02", series: [0, 3, 6, 12, 18, 25, 34, 42, 49, 58, 66, 75] },
  { id: "F014", name: "聯博美國收益基金", type: "債券收益", r1y: 5.8, r3y: 15.7, dividend: "月配", risk: "RR3", cp: 72, volatility: 8, reason: "配息型債券基金，適合和高股息基金比較淨值穩定度。", endValue: 9.62, compareReturn: 31.8, date: "2026/06/02", series: [0, 1, 3, 6, 8, 12, 15, 17, 21, 24, 28, 32] },
  { id: "F015", name: "PIMCO 多元收益基金", type: "債券收益", r1y: 6.5, r3y: 17.4, dividend: "月配", risk: "RR3", cp: 75, volatility: 9, reason: "多元債券配置，適合保守型投資人檢視收益來源。", endValue: 10.11, compareReturn: 38.4, date: "2026/06/02", series: [0, 2, 4, 7, 11, 13, 18, 21, 25, 30, 34, 38] },
  { id: "F016", name: "富蘭克林高科技基金", type: "美國科技", r1y: 20.9, r3y: 55.2, dividend: "不配息", risk: "RR5", cp: 73, volatility: 22, reason: "科技成長配置，適合和全球科技基金比較區域集中度。", endValue: 64.92, compareReturn: 169.7, date: "2026/06/02", series: [0, 4, 11, 20, 32, 46, 61, 79, 101, 132, 153, 170] },
  { id: "F017", name: "元大台灣高股息基金", type: "台股收益", r1y: 11.2, r3y: 27.8, dividend: "季配", risk: "RR4", cp: 69, volatility: 13, reason: "高股息配置，適合重視現金流但仍需看總報酬者。", endValue: 31.27, compareReturn: 82.6, date: "2026/06/02", series: [0, 2, 6, 11, 17, 24, 32, 41, 51, 62, 73, 83] },
  { id: "F018", name: "復華台灣智能基金", type: "台股量化", r1y: 13.9, r3y: 36.2, dividend: "不配息", risk: "RR4", cp: 71, volatility: 15, reason: "量化選股策略，適合和主動選股基金比較穩定性。", endValue: 21.88, compareReturn: 103.5, date: "2026/06/02", series: [0, 3, 8, 15, 23, 31, 43, 55, 67, 82, 94, 104] },
  { id: "F019", name: "路博邁全球高收益債基金", type: "高收益債", r1y: 7.9, r3y: 19.8, dividend: "月配", risk: "RR3", cp: 64, volatility: 10, reason: "信用風險較高的收益來源，適合和投資級債區分。", endValue: 8.47, compareReturn: 44.1, date: "2026/06/02", series: [0, 1, 4, 7, 12, 16, 20, 24, 29, 34, 39, 44] },
  { id: "F020", name: "摩根新興市場基金", type: "新興市場", r1y: 8.4, r3y: 18.6, dividend: "不配息", risk: "RR5", cp: 55, volatility: 21, reason: "新興市場匯率與區域風險較高，適合謹慎觀察。", endValue: 18.03, compareReturn: 48.9, date: "2026/06/02", series: [0, 4, 2, 10, 7, 18, 22, 19, 31, 38, 42, 49] },
];

const mirrorFunds = [
  { id: "nbbu", compareId: "DQ09", name: "路博邁5G股票基金T累積(新臺幣)", x: 74, y: 18, cp: "6.52", beatSp: "是", beatNas: "是", risk: "科技題材集中", type: "fund", zone: "衝刺型候選", interpret: "過去一年報酬很高，但波動也高。它不等於最適合所有人，應先看最大回撤、同類基金與大盤基準。" },
  { id: "sp500", compareId: "AL46", name: "S&P 500", x: 42, y: 38, cp: "基準", beatSp: "-", beatNas: "-", risk: "市場基準", type: "benchmark", zone: "大盤基準", interpret: "S&P 500 作為美股大盤基準，幫助判斷基金是否真的跑贏市場。" },
  { id: "nas100", compareId: "AL01", name: "NASDAQ 100", x: 58, y: 26, cp: "基準", beatSp: "-", beatNas: "-", risk: "科技集中", type: "benchmark", zone: "大盤基準", interpret: "NASDAQ 100 可作為科技基金的基準，不應只拿科技基金跟低風險債券比較。" },
  { id: "health", compareId: "CS04", name: "全球醫療保健基金", x: 31, y: 44, cp: "3.18", beatSp: "否", beatNas: "否", risk: "防禦產業", type: "industry", zone: "穩定型候選", interpret: "報酬較溫和但波動較低，適合用來理解不同產業的風險報酬差異。" },
  { id: "em", compareId: "F020", name: "新興市場機會基金", x: 78, y: 66, cp: "1.42", beatSp: "否", beatNas: "否", risk: "匯率與區域風險", type: "industry", zone: "需謹慎觀察", interpret: "承擔較高波動但報酬未反映時，不應急著申購，應先看國家與匯率風險。" },
  { id: "utility", compareId: "F014", name: "公用事業收益基金", x: 25, y: 62, cp: "2.40", beatSp: "否", beatNas: "否", risk: "成長有限", type: "industry", zone: "穩定型候選", interpret: "低波動但報酬也較低，適合保守配置，不適合追求高成長者。" },
];

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

function formatCurrency(value) {
  return `NT$ ${Math.round(value).toLocaleString("zh-TW")}`;
}

function initFindPage() {
  const fundList = document.querySelector("#fundList");
  if (!fundList) return;

  const maxCompare = 5;
  const selected = new Set();
  const selectedCount = document.querySelector("#selectedCount");
  const trayTitle = document.querySelector("#trayTitle");
  const trayCopy = document.querySelector("#trayCopy");
  const trayButton = document.querySelector("#trayButton");
  const compareDialog = document.querySelector("#compareDialog");
  const compareChart = document.querySelector("#compareChart");
  const lineColors = ["#ff7e40", "#42c5f5", "#d958ff", "#6dbd95", "#ff4d4f"];

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
          <div class="cell"><label class="compare-check"><input type="checkbox" data-fund="${fund.id}" ${selected.has(fund.id) ? "checked" : ""} />加入比較</label></div>
        </div>
      `).join("")}
    `;
  }

  function applyCompareFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const compareIds = (params.get("compare") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, maxCompare);
    if (compareIds.length < 2) return;

    compareIds.forEach((id) => {
      if (findFunds.some((fund) => fund.id === id)) selected.add(id);
    });
  }

  function buildLinePoints(series, index, total) {
    const width = 540;
    const height = 260;
    const allValues = findFunds
      .filter((fund) => selected.has(fund.id))
      .flatMap((fund) => fund.series);
    const min = Math.min(0, ...allValues);
    const max = Math.max(300, ...allValues);
    return series
      .map((value, pointIndex) => {
        const x = (pointIndex / (series.length - 1)) * width;
        const y = height - ((value - min) / (max - min)) * height + index * Math.min(4, total);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  function renderCompare() {
    selectedCount.textContent = `已選 ${selected.size} / ${maxCompare}`;
    trayTitle.textContent = `已選 ${selected.size} 檔基金`;
    trayCopy.textContent = selected.size >= 2 ? "可查看績效折線圖與基金摘要。" : `最多可選 ${maxCompare} 檔基金，選任兩檔後即可比較。`;
    trayButton.disabled = selected.size < 2;

    const funds = findFunds.filter((fund) => selected.has(fund.id));
    if (funds.length < 2) {
      compareChart.innerHTML = `<p class="compare-empty">請至少勾選 2 檔基金進行比較。</p>`;
      return;
    }

    compareChart.innerHTML = `
      <div class="compare-tabs">
        <button type="button" class="active">績效分析</button>
        <button type="button">基金資料</button>
      </div>
      <div class="compare-periods">
        ${["3月", "6月", "今年", "1年", "2年", "3年", "5年", "自訂"].map((period) => `<button type="button" class="${period === "1年" ? "active" : ""}">${period}</button>`).join("")}
      </div>
      <p class="compare-date">2025/06/02 ~ 2026/06/02</p>
      <div class="compare-line-chart" aria-label="基金績效折線圖">
        <svg viewBox="0 0 600 320" role="img">
          <g class="grid-lines">
            ${[40, 90, 140, 190, 240, 290].map((y) => `<line x1="24" y1="${y}" x2="584" y2="${y}" />`).join("")}
          </g>
          <g transform="translate(32 24)">
            ${funds
              .map((fund, index) => `<polyline points="${buildLinePoints(fund.series, index, funds.length)}" style="--line-color:${lineColors[index]}" />`)
              .join("")}
          </g>
          <g class="axis-labels">
            <text x="40" y="310">Jul '25</text>
            <text x="175" y="310">Sep '25</text>
            <text x="310" y="310">Jan '26</text>
            <text x="450" y="310">Mar '26</text>
            <text x="545" y="310">May '26</text>
          </g>
        </svg>
      </div>
      <div class="compare-fund-list">
        ${funds
          .map(
            (fund, index) => `
              <article class="compare-fund-row" style="--line-color:${lineColors[index]}">
                <div>
                  <strong>${fund.name}</strong>
                  <span>${fund.endValue}</span>
                </div>
                <b>+${fund.compareReturn.toFixed(2)}%</b>
                <time>${fund.date}</time>
                <button type="button" aria-label="收藏 ${fund.name}">♡</button>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  fundList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-fund]");
    if (!checkbox) return;
    if (checkbox.checked && selected.size >= maxCompare) {
      checkbox.checked = false;
      trayCopy.textContent = `最多只能選 ${maxCompare} 檔基金比較。`;
      return;
    }
    checkbox.checked ? selected.add(checkbox.dataset.fund) : selected.delete(checkbox.dataset.fund);
    renderCompare();
    if (selected.size >= 2) {
      compareDialog.showModal();
    }
  });

  document.querySelector("#dialogClose")?.addEventListener("click", () => compareDialog.close());
  document.querySelector("#dialogLater")?.addEventListener("click", () => compareDialog.close());
  document.querySelector("#dialogCompare")?.addEventListener("click", () => compareDialog.close());
  trayButton?.addEventListener("click", () => {
    renderCompare();
    if (selected.size >= 2) compareDialog.showModal();
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

  applyCompareFromUrl();
  renderFunds();
  renderCompare();
  renderCalc();

  if (selected.size >= 2) {
    setTimeout(() => compareDialog.showModal(), 250);
  }
}

function initMirrorPage() {
  const map = document.querySelector("#quadrantMap");
  if (!map) return;
  const defaultCompareIds = ["DQ09", "LG21", "AL01", "AL46", "CS04"];
  const compareLinks = document.querySelectorAll("[data-mirror-compare-link]");

  function compareUrlForMirrorItem(item) {
    const ids = [item.compareId, ...defaultCompareIds].filter(Boolean);
    const uniqueIds = [...new Set(ids)].slice(0, 5);
    return `11-find-funds-final.html?compare=${uniqueIds.join(",")}#fundList`;
  }

  function setSelected(item) {
    document.querySelector("#selectedName").textContent = item.name;
    document.querySelector("#selectedInterpret").textContent = `這個點落在「${item.zone}」：${item.interpret}`;
    document.querySelector("#cpValue").textContent = item.cp;
    document.querySelector("#beatSp").textContent = item.beatSp;
    document.querySelector("#beatNas").textContent = item.beatNas;
    document.querySelector("#riskText").textContent = item.risk;
    document.querySelectorAll(".dot").forEach((dot) => dot.classList.toggle("selected", dot.dataset.id === item.id));
    compareLinks.forEach((link) => {
      link.href = compareUrlForMirrorItem(item);
    });
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
  setSelected(mirrorFunds[0]);

  const picker = document.querySelector("#industryPicker");
  const heatmapTitle = document.querySelector("#heatmapTitle");
  const heatmapSubtitle = document.querySelector("#heatmapSubtitle");
  const tradingviewHeatmap = document.querySelector("#tradingviewHeatmap");

  function getIndustry() {
    return industries.find((industry) => industry.id === activeIndustryId) || industries[0];
  }

  function renderIndustryPicker() {
    picker.innerHTML = industries
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

  picker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-industry]");
    if (!button) return;
    activeIndustryId = button.dataset.industry;
    renderIndustryPicker();
    renderHeatmap();
  });
  renderIndustryPicker();
  renderHeatmap();
}

initFindPage();
initMirrorPage();
