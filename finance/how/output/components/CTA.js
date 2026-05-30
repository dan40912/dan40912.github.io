export function renderCTA(fund) {
  return `
    <div class="sticky-cta" aria-label="${fund.name} 下一步">
      <div>
        <span>看懂後的下一步</span>
        <strong>${fund.name}</strong>
      </div>
      <button class="btn soft">${fund.swap ? "用現有基金快速換入" : "先加入比較清單"}</button>
      <button class="btn primary">我想開始小額投資</button>
    </div>
  `;
}
