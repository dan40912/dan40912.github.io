(function () {
  const config = {
    baseUrl: "https://dify.startpray.online",
    token: "5dc04e07-b71b-4817-9ab8-4bd3604b4f62",
    title: "好好基金小幫手",
    subtitle: "先問需求，再把基金資料翻成可比較的方向",
    prompts: [
      "我是新手，想低波動，該先看哪類基金？",
      "我想月配息，但怕配息陷阱，要看什麼？",
      "AI / 科技基金漲很多，怎麼判斷風險？",
      "照妖鏡右上角高報酬高波動，代表適合我嗎？"
    ]
  };

  const pageConfig = window.goodFundAssistantConfig || {};
  const merged = { ...config, ...pageConfig };
  const baseUrl = String(merged.baseUrl || "").replace(/\/$/, "");
  const chatbotUrl = `${baseUrl}/chatbot/${encodeURIComponent(merged.token)}`;

  function buildPromptLinks() {
    return (merged.prompts || [])
      .map((prompt) => {
        const href = `${chatbotUrl}?q=${encodeURIComponent(prompt)}`;
        return `<a href="${href}" target="fundswapDifyFrame" rel="noreferrer">${prompt}</a>`;
      })
      .join("");
  }

  function createWidget() {
    if (document.querySelector("[data-fundswap-dify-widget]")) return;

    const widget = document.createElement("aside");
    widget.className = "fundswap-dify-widget";
    widget.setAttribute("data-fundswap-dify-widget", "true");
    widget.innerHTML = `
      <div class="fundswap-dify-panel" role="dialog" aria-label="${merged.title}" aria-modal="false">
        <div class="fundswap-dify-panel__head">
          <div>
            <strong>${merged.title}</strong>
            <span>${merged.subtitle}</span>
          </div>
          <button class="fundswap-dify-close" type="button" aria-label="關閉好好基金小幫手">×</button>
        </div>
        <div class="fundswap-dify-prompts" aria-label="常見問題">
          ${buildPromptLinks()}
        </div>
        <iframe
          class="fundswap-dify-frame"
          name="fundswapDifyFrame"
          title="${merged.title}"
          src="${chatbotUrl}"
          loading="lazy"
          referrerpolicy="origin"
          allow="microphone"
        ></iframe>
        <div class="fundswap-dify-fallback">
          若尚未看到聊天視窗，請先確認 Dify app 已發佈。也可以
          <a href="${chatbotUrl}" target="_blank" rel="noreferrer">另開小幫手</a>。
        </div>
      </div>
      <button class="fundswap-dify-trigger" type="button" aria-label="開啟好好基金小幫手" aria-expanded="false">
        <span class="fundswap-dify-trigger__icon" aria-hidden="true">好</span>
        <span>${merged.title}</span>
      </button>
    `;

    document.body.appendChild(widget);

    const trigger = widget.querySelector(".fundswap-dify-trigger");
    const closeButton = widget.querySelector(".fundswap-dify-close");

    function setOpen(nextOpen) {
      widget.classList.toggle("is-open", nextOpen);
      trigger.setAttribute("aria-expanded", String(nextOpen));
    }

    trigger.addEventListener("click", () => {
      setOpen(!widget.classList.contains("is-open"));
    });

    closeButton.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }
})();
