(function () {
  const config = {
    chatUrl: "https://dify.startpray.online/chat/fpIBKDhsB32PXBL9",
    title: "好好基金小幫手",
    subtitle: "可以詢問基金挑選、比較與投資方向",
    prompts: [
      "我適合哪一類基金？",
      "怎麼比較基金 CP 值？",
      "新手如何開始定期定額？",
      "幫我理解基金照妖鏡",
    ],
  };

  const pageConfig = window.goodFundAssistantConfig || {};
  const merged = { ...config, ...pageConfig };
  const chatUrl = String(merged.chatUrl || config.chatUrl);

  function buildPromptLinks() {
    return (merged.prompts || [])
      .map((prompt) => {
        const href = `${chatUrl}?q=${encodeURIComponent(prompt)}`;
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
          src="${chatUrl}"
          loading="lazy"
          referrerpolicy="origin"
          allow="microphone"
        ></iframe>
        <div class="fundswap-dify-fallback">
          若尚未看到聊天視窗，可以
          <a href="${chatUrl}" target="_blank" rel="noreferrer">另開小幫手</a>。
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
