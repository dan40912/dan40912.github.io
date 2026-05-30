const personas = [
  {
    id: "conservative",
    title: "保守型",
    headline: "先看風險邊界",
    copy: "我想知道最壞情況有多痛，不想每天被淨值震醒。",
    note: "不是膽小，是你知道本金不是遊戲幣。",
    icon: "□",
    color: "#6EA8FF",
    metrics: [
      ["MDD 最大回撤", "過去最慘曾經跌多少，先確認自己扛不扛得住。"],
      ["波動度", "波動越高，情緒成本越高。"],
      ["修復時間", "跌下去多久爬回來，會影響能否持續持有。"],
    ],
  },
  {
    id: "aggressive",
    title: "積極型",
    headline: "先看成長動能",
    copy: "我能接受震盪，但要知道這個風險值不值得。",
    note: "你不是不怕跌，只是能把跌幅當成劇情反轉。",
    icon: "↗",
    color: "#FF7A3D",
    metrics: [
      ["3M / 6M 績效", "先看動能是否真的存在，不只看一日煙火。"],
      ["同類排名", "如果大家都漲，它只是跟著走；跑在前面才值得多看。"],
      ["MDD 警示", "積極不等於閉眼衝，回撤太深仍要先停下來。"],
    ],
  },
  {
    id: "longterm",
    title: "長期型",
    headline: "先看持續能力",
    copy: "我不想每天猜高低點，想把時間放進投資裡。",
    note: "不是佛系，是你知道每天看淨值不會讓它長比較快。",
    icon: "◎",
    color: "#6CCB9B",
    metrics: [
      ["1Y / 2Y 績效", "看它是不是只有短跑能力，還是真的有耐力。"],
      ["穩定度", "不是追最高，而是找比較不容易半路放棄的節奏。"],
      ["TISA / 定期投入", "如果要長期放，扣款節奏與標的穩定度都重要。"],
    ],
  },
];

const funds = [
  {
    name: "全球 AI 生產力基金",
    team: "Northstar Research Team",
    worldview: "AI 生產力",
    thesis: "追蹤企業是否持續為效率提升投入資本，而不是只追逐 AI 熱詞。",
    risk: "中高",
    mdd: "-28.4%",
    horizon: "3 年以上",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=82",
  },
  {
    name: "亞洲高股息紀律基金",
    team: "Harbor Income Desk",
    worldview: "高股息現金流",
    thesis: "把配息來源拆開看，確認現金流不是只靠漂亮配息率包裝。",
    risk: "中",
    mdd: "-18.7%",
    horizon: "2 年以上",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=82",
  },
  {
    name: "全球債券收益策略基金",
    team: "Duration Lab",
    worldview: "債券收益",
    thesis: "追蹤利率、信用與匯率，讓投資人知道收益背後承擔了什麼。",
    risk: "中低",
    mdd: "-12.2%",
    horizon: "2 年以上",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1000&q=82",
  },
];

let activePersona = "longterm";
const personaGrid = document.querySelector("#personaGrid");
const metricStrip = document.querySelector("#metricStrip");
const lensOutputTitle = document.querySelector("#lensOutputTitle");
const lensOutputCopy = document.querySelector("#lensOutputCopy");
const fundGrid = document.querySelector("#fundGrid");
const drawer = document.querySelector("#drawer");
const drawerTitle = document.querySelector("#drawerTitle");
const drawerEyebrow = document.querySelector("#drawerEyebrow");
const drawerBody = document.querySelector("#drawerBody");

function getPersona() {
  return personas.find((persona) => persona.id === activePersona) || personas[2];
}

function renderPersonas() {
  personaGrid.innerHTML = personas
    .map(
      (persona) => `
        <button class="persona-card ${persona.id === activePersona ? "active" : ""}" style="--lens-color: ${persona.color}" type="button" data-persona="${persona.id}">
          <span class="icon" aria-hidden="true">${persona.icon}</span>
          <strong>${persona.title}</strong>
          <h3>${persona.headline}</h3>
          <p>${persona.copy}</p>
          <small>${persona.note}</small>
        </button>
      `
    )
    .join("");
}

function renderLensOutput() {
  const persona = getPersona();
  lensOutputTitle.textContent = `${persona.title}會先看：${persona.metrics.map(([label]) => label).join("、")}`;
  lensOutputCopy.textContent = `${persona.note} ${persona.copy}`;
  metricStrip.innerHTML = persona.metrics
    .map(
      ([label, copy], index) => `
        <article class="metric-card">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${label}</strong>
          <p>${copy}</p>
        </article>
      `
    )
    .join("");
}

function renderFunds() {
  const persona = getPersona();
  fundGrid.innerHTML = funds
    .map(
      (fund) => `
        <article class="fund-card">
          <img src="${fund.image}" alt="" width="1000" height="667" loading="lazy" />
          <div class="fund-card-content">
            <span class="meta">${fund.worldview}</span>
            <h3>${fund.name}</h3>
            <p>${fund.thesis}</p>
            <div class="stats" aria-label="基金摘要">
              <div><span>風險</span><strong>${fund.risk}</strong></div>
              <div><span>MDD</span><strong>${fund.mdd}</strong></div>
              <div><span>持有</span><strong>${fund.horizon}</strong></div>
            </div>
            <button type="button" data-fund="${fund.name}">看這支基金如何被管理</button>
          </div>
        </article>
      `
    )
    .join("");
  document.querySelectorAll("[data-fund]").forEach((button) => {
    button.addEventListener("click", () => openFundDrawer(button.dataset.fund, persona));
  });
}

function openDrawer(type) {
  const content = {
    watchlist: {
      eyebrow: "OBSERVATION SHELF",
      title: "你的觀察書架",
      body: `
        <div class="drawer-list">
          <article>
            <h3>追蹤的世界觀</h3>
            <p>AI 生產力、退休長期配置、債券收益</p>
          </article>
          <article>
            <h3>待補完章節</h3>
            <p>全球 AI 生產力基金還差「風險控管」與「錯誤反思」兩個章節。</p>
          </article>
          <article>
            <h3>安全提醒</h3>
            <p>觀察書架不是投資組合，也不代表 Arena 建議你申購任何基金。</p>
          </article>
        </div>
      `,
    },
    film: {
      eyebrow: "FILM CHAPTERS",
      title: "Inside the Fund 章節",
      body: `
        <div class="drawer-list">
          <article><h3>01 市場觀點</h3><p>團隊如何判斷需求、估值與錯誤代價。</p></article>
          <article><h3>02 團隊討論</h3><p>好的投資想法必須經得起反對。</p></article>
          <article><h3>03 風險控管</h3><p>不只看怎麼賺錢，也看判斷錯時怎麼面對。</p></article>
          <article><h3>04 錯誤反思</h3><p>信任來自承認不確定，而不是永遠正確。</p></article>
        </div>
      `,
    },
  }[type];
  drawerEyebrow.textContent = content.eyebrow;
  drawerTitle.textContent = content.title;
  drawerBody.innerHTML = content.body;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function openFundDrawer(name, persona) {
  drawerEyebrow.textContent = "FUND DECISION CARD";
  drawerTitle.textContent = name;
  drawerBody.innerHTML = `
    <div class="drawer-list">
      <article>
        <h3>為什麼入選</h3>
        <p>以「${persona.title}」視角，這支基金值得先看 ${persona.metrics[0][0]} 與 ${persona.metrics[1][0]}。</p>
      </article>
      <article>
        <h3>你可能賺什麼</h3>
        <p>主要來自基金團隊對產業結構、利率或現金流的中長期判斷。</p>
      </article>
      <article>
        <h3>最大風險在哪</h3>
        <p>市場方向判斷錯誤、估值修正、匯率波動與集中度風險都可能造成本金損失。</p>
      </article>
      <article>
        <h3>下一步</h3>
        <p>建議先加入觀察或比較同類基金。本卡僅供資訊參考，不構成投資建議。</p>
      </article>
    </div>
  `;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

personaGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-persona]");
  if (!card) return;
  activePersona = card.dataset.persona;
  renderPersonas();
  renderLensOutput();
  renderFunds();
  document.querySelector(".lens-output").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelectorAll("[data-open-drawer]").forEach((button) => {
  button.addEventListener("click", () => openDrawer(button.dataset.openDrawer));
});

document.querySelectorAll("[data-close-drawer]").forEach((button) => {
  button.addEventListener("click", closeDrawer);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

document.querySelectorAll(".poll-list button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    button.textContent = `${button.textContent} · 已記錄`;
  });
});

renderPersonas();
renderLensOutput();
renderFunds();
