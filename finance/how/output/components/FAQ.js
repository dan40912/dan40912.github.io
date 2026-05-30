export function renderFAQ(fund) {
  const questions = [
    ["我一定要一次買很多嗎？", "不用。若你擔心買在高點，可以先用小額、定期定額或分批方式開始。"],
    ["我需要每天看淨值嗎？", "不需要。基金比較適合用月或季來檢查，重點是它是否還符合你當初選它的理由。"],
    ["什麼時候該停下來重看？", "如果波動已經讓你睡不好，或基金投資方向和你原本想的不一樣，就該重新評估。"],
  ];

  return `
    <div class="fund-faq">
      <h4>你可能會想問</h4>
      ${questions
        .map(
          ([question, answer], index) => `
            <details ${index === 0 ? "open" : ""}>
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `
        )
        .join("")}
      <p class="faq-note">${fund.name} 的資料是幫你研究，不是叫你一定要買。下單前，請確認公開說明書與自己的風險承受度。</p>
    </div>
  `;
}
