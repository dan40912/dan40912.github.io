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

  function card(m) {
    const c = el("article", "council-card");

    const fig = el("div", "council-figure");
    const img = document.createElement("img");
    img.src = m.img;
    img.alt = m.n;
    img.decoding = "async";
    fig.appendChild(img);
    c.appendChild(fig);

    const body = el("div", "council-body");
    body.appendChild(el("span", "council-tag", m.g));
    body.appendChild(el("h3", "council-name", m.n));
    body.appendChild(el("p", "council-persona", m.p));
    c.appendChild(body);

    const add = el("button", "council-add", "＋ 選他");
    add.type = "button";
    add.addEventListener("click", function (e) {
      e.stopPropagation();
      if (window.RM_openWizard) window.RM_openWizard();
    });
    c.appendChild(add);

    if (window.RM_openWizard) {
      c.setAttribute("role", "button");
      c.tabIndex = 0;
      c.addEventListener("click", function () { window.RM_openWizard(); });
    }
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
        if (pass === 1) c.setAttribute("aria-hidden", "true");
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
