const banners = [
  {
    alt: "TISA",
    src: "https://www.fundswap.com.tw/trade/api/banner-image/A001/5bV1D5xTM3hQQD7GAhZOE3/TISA_1440x420%20(1)%201.png",
  },
  {
    alt: "這mo好康",
    src: "https://www.fundswap.com.tw/trade/api/banner-image/A001/4aJxmFEcFrBUS0leIOEemp/ic_banner_momo_1440x420%20(2)%201%20(1).png",
  },
  {
    alt: "一筆交易永久申購免手續費",
    src: "https://www.fundswap.com.tw/trade/api/banner-image/A001/4595S4BMo1eN4GBNwySjfE/ic_sip_0_fee_1440x420.png",
  },
  {
    alt: "基金照妖鏡",
    src: "https://www.fundswap.com.tw/trade/api/banner-image/A001/84TcI2fF81MK15yCLBapB/ic_banner_%E5%9F%BA%E9%87%91%E7%85%A7%E5%A6%96%E9%8F%A1_1440x420_202411.png",
  },
];

const excellentFunds = [
  {
    id: "e1",
    name: "華南永昌台灣環境永續高股息指數基金(A類新台幣)",
    tags: ["主基金", "持有 ETF"],
    r3m: "+27.34%",
    r6m: "+29.67%",
    r1y: "+26.85%",
    r2y: "+9.78%",
    r3y: "+98.25%",
    r5y: "--",
    inception: "+126.80%",
    cp: 84,
    risk: 46,
    income: 78,
  },
  {
    id: "e2",
    name: "富邦美國傘型基金之富邦NASDAQ-100指數基金-A類型(新臺幣)",
    tags: ["主基金", "持有 ETF"],
    r3m: "+21.33%",
    r6m: "--",
    r1y: "--",
    r2y: "--",
    r3y: "--",
    r5y: "--",
    inception: "+18.30%",
    cp: 72,
    risk: 68,
    income: 8,
  },
  {
    id: "e3",
    name: "玉山新興趨勢組合基金",
    tags: ["主基金", "持有 ETF"],
    r3m: "+16.83%",
    r6m: "+39.14%",
    r1y: "+75.19%",
    r2y: "+72.27%",
    r3y: "+98.75%",
    r5y: "+59.15%",
    inception: "+106.90%",
    cp: 79,
    risk: 62,
    income: 28,
  },
  {
    id: "e4",
    name: "玉山策略成長ETF組合基金-新台幣",
    tags: ["主基金", "持有 ETF"],
    r3m: "+15.59%",
    r6m: "+22.38%",
    r1y: "+43.24%",
    r2y: "+43.93%",
    r3y: "+80.43%",
    r5y: "+79.29%",
    inception: "+119.14%",
    cp: 77,
    risk: 54,
    income: 18,
  },
  {
    id: "e5",
    name: "兆豐雙動能組合基金-新台幣",
    tags: ["主基金", "持有 ETF"],
    r3m: "+14.30%",
    r6m: "+25.58%",
    r1y: "--",
    r2y: "--",
    r3y: "--",
    r5y: "--",
    inception: "+26.66%",
    cp: 68,
    risk: 58,
    income: 22,
  },
];

const brandFunds = [
  {
    id: "b1",
    name: "野村台灣運籌基金",
    tags: ["主基金"],
    r3m: "+61.70%",
    r6m: "+127.08%",
    r1y: "+312.68%",
    r2y: "+295.11%",
    r3y: "+466.28%",
    r5y: "+579.22%",
    inception: "+3,954.44%",
    cp: 95,
    risk: 78,
    income: 4,
  },
  {
    id: "b2",
    name: "野村中小基金-累積類型",
    tags: ["主基金"],
    r3m: "+59.35%",
    r6m: "+121.39%",
    r1y: "+275.29%",
    r2y: "+249.18%",
    r3y: "+387.39%",
    r5y: "+514.29%",
    inception: "+6,517.96%",
    cp: 91,
    risk: 82,
    income: 3,
  },
  {
    id: "b3",
    name: "野村鴻運基金",
    tags: ["主基金"],
    r3m: "+58.97%",
    r6m: "+123.60%",
    r1y: "+307.51%",
    r2y: "+287.92%",
    r3y: "+455.41%",
    r5y: "+610.16%",
    inception: "+4,039.88%",
    cp: 94,
    risk: 80,
    income: 3,
  },
  {
    id: "b4",
    name: "野村成長基金",
    tags: ["主基金"],
    r3m: "+58.59%",
    r6m: "+119.62%",
    r1y: "+288.10%",
    r2y: "+263.91%",
    r3y: "+422.40%",
    r5y: "+512.26%",
    inception: "+6,571.43%",
    cp: 90,
    risk: 79,
    income: 3,
  },
  {
    id: "b5",
    name: "野村優質基金-累積類型新臺幣計價",
    tags: ["主基金"],
    r3m: "+58.33%",
    r6m: "+103.13%",
    r1y: "+235.74%",
    r2y: "+210.57%",
    r3y: "+341.68%",
    r5y: "+417.04%",
    inception: "+4,179.20%",
    cp: 87,
    risk: 74,
    income: 4,
  },
];

let activeBanner = 0;
const selected = new Set();
let hasPrompted = false;

const heroBanner = document.querySelector("#heroBanner");
const bannerDots = document.querySelector("#bannerDots");
const excellentTable = document.querySelector("#excellentFunds");
const brandTable = document.querySelector("#brandFunds");
const selectedLabel = document.querySelector("#selectedLabel");
const compareGrid = document.querySelector("#compareGrid");
const trayTitle = document.querySelector("#trayTitle");
const trayCopy = document.querySelector("#trayCopy");
const trayButton = document.querySelector("#trayButton");
const compareDialog = document.querySelector("#compareDialog");
const dialogClose = document.querySelector("#dialogClose");
const dialogCompare = document.querySelector("#dialogCompare");
const dialogLater = document.querySelector("#dialogLater");

function allFunds() {
  return [...excellentFunds, ...brandFunds];
}

function renderBanner() {
  const item = banners[activeBanner];
  heroBanner.src = item.src;
  heroBanner.alt = item.alt;
  bannerDots.innerHTML = banners
    .map((_, index) => `<button type="button" class="${index === activeBanner ? "active" : ""}" data-dot="${index}" aria-label="第 ${index + 1} 張"></button>`)
    .join("");
}

function fundRow(fund) {
  const isChecked = selected.has(fund.id) ? "checked" : "";
  const badges = fund.tags.map((tag) => `<span>${tag}</span>`).join("");
  return `
    <div class="fund-row">
      <div class="fund-cell">
        <div class="fund-name">${fund.name}</div>
        <div class="fund-badges">${badges}</div>
      </div>
      <div class="fund-cell muted">近 3 月走勢</div>
      <div class="fund-cell positive">${fund.r3m}</div>
      <div class="fund-cell positive">${fund.r6m}</div>
      <div class="fund-cell positive">${fund.r1y}</div>
      <div class="fund-cell positive">${fund.r2y}</div>
      <div class="fund-cell positive">${fund.r3y}</div>
      <div class="fund-cell positive">${fund.r5y}</div>
      <div class="fund-cell">
        <label class="compare-check">
          <input type="checkbox" data-fund="${fund.id}" ${isChecked} />
          比較
        </label>
      </div>
    </div>
  `;
}

function tableMarkup(funds) {
  return `
    <div class="fund-header">
      <div class="fund-cell">基金名稱</div>
      <div class="fund-cell">近 3 月走勢</div>
      <div class="fund-cell">3 個月</div>
      <div class="fund-cell">6 個月</div>
      <div class="fund-cell">1 年</div>
      <div class="fund-cell">2 年</div>
      <div class="fund-cell">3 年</div>
      <div class="fund-cell">5 年</div>
      <div class="fund-cell">比較</div>
    </div>
    ${funds.map(fundRow).join("")}
  `;
}

function renderTables() {
  excellentTable.innerHTML = tableMarkup(excellentFunds);
  brandTable.innerHTML = tableMarkup(brandFunds);
}

function selectedFunds() {
  return allFunds().filter((fund) => selected.has(fund.id));
}

function renderCompare() {
  const funds = selectedFunds();
  selectedLabel.textContent = `已選 ${selected.size} / 3`;
  trayTitle.textContent = `已選 ${selected.size} 檔基金`;
  trayCopy.textContent = selected.size >= 2 ? "可以立刻用圖表比較差異。" : "勾選兩檔基金後，系統會提醒你立即比較。";
  trayButton.disabled = selected.size < 2;

  if (!funds.length) {
    compareGrid.innerHTML = `
      <article class="compare-card">
        <h3>尚未選擇基金</h3>
        <p>從上方基金列表勾選 2-3 檔，這裡會顯示比較圖表。</p>
      </article>
    `;
    return;
  }

  compareGrid.innerHTML = funds
    .map((fund) => {
      const metrics = [
        ["CP 值", fund.cp],
        ["低風險", Math.max(8, 100 - fund.risk)],
        ["配息感", fund.income],
      ];
      const bars = metrics
        .map(
          ([label, value]) => `
            <div class="bar-row">
              <div class="bar-head"><span>${label}</span><span>${value}</span></div>
              <div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>
            </div>
          `
        )
        .join("");
      return `<article class="compare-card"><h3>${fund.name}</h3>${bars}</article>`;
    })
    .join("");
}

function openCompareDialog() {
  if (typeof compareDialog.showModal === "function") {
    compareDialog.showModal();
  } else {
    compareDialog.setAttribute("open", "");
  }
}

document.addEventListener("click", (event) => {
  const bannerButton = event.target.closest("[data-banner]");
  if (bannerButton) {
    activeBanner = bannerButton.dataset.banner === "next" ? (activeBanner + 1) % banners.length : (activeBanner - 1 + banners.length) % banners.length;
    renderBanner();
    return;
  }

  const dot = event.target.closest("[data-dot]");
  if (dot) {
    activeBanner = Number(dot.dataset.dot);
    renderBanner();
    return;
  }
});

document.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-fund]");
  if (!checkbox) return;
  if (checkbox.checked && selected.size >= 3) {
    checkbox.checked = false;
    return;
  }
  if (checkbox.checked) {
    selected.add(checkbox.dataset.fund);
  } else {
    selected.delete(checkbox.dataset.fund);
  }
  renderCompare();
  if (selected.size === 2 && !hasPrompted) {
    hasPrompted = true;
    openCompareDialog();
  }
});

trayButton.addEventListener("click", () => {
  if (selected.size >= 2) {
    document.querySelector("#comparePanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

dialogCompare.addEventListener("click", () => {
  compareDialog.close();
  document.querySelector("#comparePanel").scrollIntoView({ behavior: "smooth", block: "start" });
});

dialogClose.addEventListener("click", () => compareDialog.close());
dialogLater.addEventListener("click", () => compareDialog.close());

renderBanner();
renderTables();
renderCompare();
