import { renderRiskLevel } from "./RiskLevel.js";
import { renderReturnChart } from "./ReturnChart.js";
import { renderFAQ } from "./FAQ.js";
import { renderCTA } from "./CTA.js";

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

function scenarioCopy(fund) {
  if (fund.risk >= 5) return "這類基金的機會和波動都比較大。適合先想清楚：如果短期下跌，你還能不能照原計畫持有。";
  if (fund.categories.includes("newbie-low-risk")) return "你可以把它當成第一批研究名單，先用小額或定期定額熟悉基金投資。";
  if (fund.categories.includes("high-dividend")) return "如果你在意配息感，除了看配息，也要看淨值是否穩得住。";
  return "它比較適合想慢慢累積的人。重點不是每天看漲跌，而是確認它是否仍符合你的目標。";
}

function allocation(fund) {
  if (fund.risk >= 5) return ["主要投資 40%", "成長嘗試 40%", "保留現金 20%"];
  if (fund.risk <= 2) return ["主要投資 60%", "小額嘗試 20%", "保留現金 20%"];
  return ["主要投資 50%", "成長嘗試 30%", "保留現金 20%"];
}

export function renderFundCard(fund, index, activeCode) {
  const isOpen = fund.code === activeCode;

  return `
    <article class="fund-card ${isOpen ? "expanded" : ""}" data-code="${fund.code}">
      <button class="fund-summary" data-toggle-fund="${fund.code}" aria-expanded="${isOpen}">
        <span class="rank">${index + 1}</span>
        <span class="fund-title">
          <strong>${fund.name}</strong>
          <span class="tags">
            ${fund.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            ${fund.swap ? `<span class="tag orange">能快速交換</span>` : ""}
          </span>
        </span>
        <span class="metrics">
          <span class="metric"><span>報酬/波動</span><strong>${fund.cp.toFixed(2)}</strong></span>
          <span class="metric"><span>近 3 月</span><strong>${formatPercent(fund.month3)}</strong></span>
          <span class="metric"><span>1 年</span><strong>${formatPercent(fund.year1)}</strong></span>
          <span class="metric"><span>近 3 月走勢</span>${miniChart()}</span>
        </span>
        <span class="card-actions">
          <span class="btn soft">${fund.swap ? "快速換入" : "先存起來比較"}</span>
          <span class="btn primary">看懂這檔</span>
        </span>
      </button>
      ${
        isOpen
          ? `
            <div class="fund-expand">
              <section class="expand-hero">
                <p class="eyebrow">這檔基金在做什麼</p>
                <h3>${fund.name}：先看可能賺什麼，再看你要承擔什麼</h3>
                <p>${scenarioCopy(fund)}</p>
              </section>
              <div class="expand-grid">
                ${renderReturnChart(fund)}
                ${renderRiskLevel(fund.risk, fund.riskNote)}
                <div class="scenario-card">
                  <h4>如果你真的買了</h4>
                  <p>${fund.story}</p>
                  <strong>${fund.bestFor}</strong>
                </div>
                <div class="ai-allocation">
                  <h4>可以怎麼放進你的投資</h4>
                  <div>
                    ${allocation(fund).map((item) => `<span>${item}</span>`).join("")}
                  </div>
                  <p>不是叫你一次買滿，而是先想清楚這檔基金在你的投資裡扮演什麼角色。</p>
                </div>
                <div class="story-card">
                  <h4>比較真實的投資畫面</h4>
                  <p>${fund.lifeStory}</p>
                </div>
                ${renderFAQ(fund)}
              </div>
              ${renderCTA(fund)}
            </div>
          `
          : ""
      }
    </article>
  `;
}
