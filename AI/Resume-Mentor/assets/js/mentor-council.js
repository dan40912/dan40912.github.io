/**
 * Resume-Mentor — 首頁顧問團（全寬自動左右滑動的 carousel）
 * 讀 window.RM_MENTORS，渲染成一條會自己滑的卡片帶；hover 暫停，點卡片開始。
 */
(function () {
  "use strict";

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  /**
   * 首頁這 30 位是展示櫥窗，跟 wizard 內的 agents 不是同一組人，
   * 所以不能假裝「點了就把這個人加進顧問團」。改成依所屬分類把人帶到對應路線。
   */
  const GROUP_ROUTE = {
    "履歷": "cv",
    "面試": "interview",
    "個人品牌": "linkedin",
    "職涯成長": "assessment",
    "主管視角": "cv",
    "核心": "cv",
    "把關": "cv",
    "領域專家": "cv",
  };

  function routeFor(m) {
    return GROUP_ROUTE[m.g] || "cv";
  }

  function card(m) {
    const c = el("article", "council-card");

    const fig = el("div", "council-figure");
    const img = document.createElement("img");
    img.src = m.img;
    img.alt = m.n;
    img.decoding = "async";
    img.loading = "lazy";
    // 明確尺寸：30 張圖 × 2 份，沒有寬高會在載入時整條帶子跳動
    img.width = 162;
    img.height = 229;
    fig.appendChild(img);
    c.appendChild(fig);

    const body = el("div", "council-body");
    body.appendChild(el("span", "council-tag", m.g));
    body.appendChild(el("h3", "council-name", m.n));
    body.appendChild(el("p", "council-persona", m.p));
    c.appendChild(body);

    const open = function () {
      if (window.RM_openWizard) window.RM_openWizard(routeFor(m), c);
    };

    const add = el("button", "council-add", "看這條路線 →");
    add.type = "button";
    add.addEventListener("click", function (e) {
      e.stopPropagation();
      open();
    });
    c.appendChild(add);

    // 這支 script 比 wizard.js 早執行，RM_openWizard 此刻還不存在，
    // 所以無條件綁定、在點擊當下才檢查（原本的 if 判斷等於永遠不成立）。
    c.setAttribute("role", "button");
    c.tabIndex = 0;
    c.addEventListener("click", open);
    c.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    return c;
  }

  function render() {
    const wrap = document.getElementById("rm-mentor-council");
    const list = window.RM_MENTORS;
    if (!wrap || !Array.isArray(list) || !list.length) return;

    const track = el("div", "council-track");
    // 渲染兩份，做成無縫循環
    [0, 1].forEach(function (pass) {
      list.forEach(function (m) {
        const c = card(m);
        if (pass === 1) {
          // 第二份只是為了無縫循環的視覺複本：對輔助技術隱藏，也不該被 Tab 走到
          c.setAttribute("aria-hidden", "true");
          c.tabIndex = -1;
          c.querySelectorAll("button").forEach(function (b) { b.tabIndex = -1; });
        }
        track.appendChild(c);
      });
    });

    // 速度跟卡片數量成正比，維持一致的滑動感
    track.style.animationDuration = Math.max(40, list.length * 2.6).toFixed(0) + "s";

    wrap.innerHTML = "";
    wrap.appendChild(track);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
