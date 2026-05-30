export function renderReturnChart(fund) {
  const points = [
    { label: "3月", value: fund.month3 },
    { label: "6月", value: fund.month6 },
    { label: "1年", value: fund.year1 },
    { label: "2年", value: fund.year2 },
  ];
  const max = Math.max(...points.map((point) => point.value));

  return `
    <div class="return-chart" aria-label="${fund.name} 過去報酬圖表">
      <div class="return-chart-head">
        <span>過去報酬</span>
        <strong>先看它曾經怎麼漲，再想自己能不能承受波動</strong>
      </div>
      <div class="return-bars">
        ${points
          .map(
            (point) => `
              <div class="return-bar">
                <span>${point.label}</span>
                <i style="height:${Math.max(12, (point.value / max) * 100)}%"></i>
                <strong>${point.value > 0 ? "+" : ""}${point.value.toFixed(1)}%</strong>
              </div>
            `
          )
          .join("")}
      </div>
      <p>這張圖只是在翻譯過去績效：它讓你知道這檔基金曾經創造什麼報酬，但不代表未來一定重演。</p>
    </div>
  `;
}
