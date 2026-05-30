export function riskLabel(level) {
  if (level <= 2) return "比較溫和";
  if (level === 3) return "中等起伏";
  if (level === 4) return "起伏偏大";
  return "起伏很大";
}

export function renderRiskLevel(level, note = "短期仍可能上下波動，先確認自己能接受再投入。") {
  return `
    <div class="risk-level" aria-label="風險等級 ${level}/5">
      <div class="risk-head">
        <span>你要承受的起伏</span>
        <strong>${riskLabel(level)} ${level}/5</strong>
      </div>
      <div class="risk-bars">
        ${Array.from({ length: 5 }, (_, index) => `<i class="${index < level ? "on" : ""}"></i>`).join("")}
      </div>
      <p>${note}</p>
    </div>
  `;
}
