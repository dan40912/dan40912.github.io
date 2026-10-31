/* ==========================================================================
   render.js — 把一張投影片資料渲染成 1920×1080 的 HTML，並等比縮放到容器
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;
  const e = P.esc;

  const rv = (d) => `rv" style="--d:${d}`;
  // 編輯器中按 Enter 可手動指定換行位置
  const t = (s) => e(s).replace(/\n/g, '<br>');

  function fitClass(text, steps) {
    const n = P.countUnits(text);
    for (let i = steps.length - 1; i >= 0; i--) if (n > steps[i]) return ' fit-' + (i + 1);
    return '';
  }

  function kicker(s, d) {
    return s.kicker ? `<div class="kicker ${rv(d)}" data-f="kicker">${e(s.kicker)}</div>` : '';
  }

  /* 沒有圖片時的抽象圖形（同心弧線＋一點強調色） */
  function motif() {
    let arcs = '';
    for (let i = 1; i <= 7; i++) {
      arcs += `<circle cx="480" cy="540" r="${i * 62}" fill="none" stroke="currentColor" stroke-opacity="${(0.05 + i * 0.022).toFixed(3)}" stroke-width="2"/>`;
    }
    return `<svg class="motif" viewBox="0 0 960 1080" aria-hidden="true">${arcs}
      <circle cx="480" cy="540" r="14" fill="var(--accent)"/>
      <line x1="480" y1="540" x2="914" y2="540" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 10"/></svg>`;
  }

  const LAYOUT_HTML = {
    statement(s) {
      const pts = s.points.length
        ? `<ol class="points">${s.points.map((p, i) => `<li class="${rv(3 + i)}"><span class="pn">${String(i + 1).padStart(2, '0')}</span><span data-f="points.${i}">${e(p)}</span></li>`).join('')}</ol>`
        : '';
      return `<div class="wrap wrap-left">
        ${kicker(s, 0)}
        <h1 class="title${fitClass(s.title, [16, 22])} ${rv(1)}" data-f="title">${t(s.title)}</h1>
        ${s.subtitle ? `<p class="sub ${rv(2)}" data-f="subtitle">${t(s.subtitle)}</p>` : ''}
        ${pts}</div>`;
    },
    question(s) {
      return `<div class="q-mark" aria-hidden="true">?</div>
        <div class="wrap wrap-center">
        ${kicker(s, 0)}
        <h1 class="title q-title${fitClass(s.title, [14, 20])} ${rv(1)}" data-f="title">${t(s.title)}</h1>
        ${s.subtitle ? `<p class="sub ${rv(2)}" data-f="subtitle">${t(s.subtitle)}</p>` : ''}</div>`;
    },
    contrast(s, src, tpl) {
      // 數據焦點模板：圖片放進「推薦的一方」，形成 Before / After
      const inSide = src && tpl === 'impact' ? `<div class="c-media" data-media>${img(src, s.focus)}</div>` : '';
      return `<div class="wrap wrap-left c-wrap">
        ${kicker(s, 0)}
        <h2 class="title c-title${fitClass(s.title, [16, 22])} ${rv(1)}" data-f="title">${t(s.title)}</h2>
        <div class="c-grid">
          <div class="c-side c-left ${rv(2)}"><div class="c-label" data-f="left.label">${e(s.left.label)}</div><div class="c-text" data-f="left.text">${e(s.left.text)}</div></div>
          <div class="c-arrow ${rv(3)}" aria-hidden="true"><svg viewBox="0 0 120 40"><path d="M2 20h108M92 4l18 16-18 16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="c-side c-right${inSide ? ' has-img' : ''} ${rv(4)}">${inSide}<div class="c-label" data-f="right.label">${e(s.right.label)}</div><div class="c-text" data-f="right.text">${e(s.right.text)}</div></div>
        </div></div>`;
    },
    bignumber(s) {
      return `<div class="wrap wrap-center n-wrap">
        ${kicker(s, 0)}
        <div class="n-num${fitClass(s.number, [3, 5])} ${rv(1)}" data-count="${e(s.number)}" data-f="number">${e(s.number)}</div>
        <h2 class="title n-title ${rv(2)}" data-f="title">${t(s.title)}</h2>
        ${s.subtitle ? `<p class="sub ${rv(3)}" data-f="subtitle">${t(s.subtitle)}</p>` : ''}</div>`;
    },
    story(s, src) {
      const media = src ? img(src, s.focus) : motif();
      return `<div class="st-grid">
        <div class="st-media ${rv(0)}" data-media>${media}</div>
        <div class="st-text">
          ${kicker(s, 1)}
          <h2 class="title st-title${fitClass(s.title, [12, 18])} ${rv(2)}" data-f="title">${t(s.title)}</h2>
          ${s.subtitle ? `<p class="sub ${rv(3)}" data-f="subtitle">${t(s.subtitle)}</p>` : ''}
        </div></div>`;
    },
    diagram(s) {
      const steps = s.steps.slice(0, 3);
      return `<div class="wrap wrap-left d-wrap">
        ${kicker(s, 0)}
        <h2 class="title d-title${fitClass(s.title, [16, 22])} ${rv(1)}" data-f="title">${t(s.title)}</h2>
        <div class="flow" style="--n:${steps.length || 1}">
          <div class="flow-line" aria-hidden="true"></div>
          ${steps.map((st, i) => `<div class="node ${rv(2 + i)}">
              <div class="node-dot">${i + 1}</div>
              <div class="node-label${fitClass(st.label, [5, 8])}" data-f="steps.${i}.label">${e(st.label)}</div>
              ${st.text ? `<div class="node-text" data-f="steps.${i}.text">${e(st.text)}</div>` : ''}
            </div>`).join('')}
        </div>
        ${s.subtitle ? `<p class="sub d-sub ${rv(5)}" data-f="subtitle">${t(s.subtitle)}</p>` : ''}</div>`;
    },
    quote(s) {
      return `<div class="wrap wrap-left qt-wrap">
        <svg class="qt-mark ${rv(0)}" viewBox="0 0 120 90" aria-hidden="true"><path d="M0 90V52Q0 10 46 0l6 12Q24 22 22 46h26v44zm68 0V52q0-42 46-52l6 12q-28 10-30 34h26v44z" fill="var(--accent)"/></svg>
        <blockquote class="qt-text${fitClass(s.quote, [18, 26])} ${rv(1)}" data-f="quote">${t(s.quote)}</blockquote>
        ${s.by ? `<div class="qt-by ${rv(2)}">— <span data-f="by">${e(s.by)}</span></div>` : ''}</div>`;
    },
    closing(s) {
      return `<div class="wrap wrap-center cl-wrap">
        <div class="cl-bar ${rv(0)}" aria-hidden="true"></div>
        <h1 class="title cl-title${fitClass(s.title, [12, 18])} ${rv(1)}" data-f="title">${t(s.title)}</h1>
        ${s.subtitle ? `<p class="sub ${rv(2)}" data-f="subtitle">${t(s.subtitle)}</p>` : ''}
        ${s.cta ? `<div class="cta ${rv(3)}"><span data-f="cta">${e(s.cta)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}</div>`;
    },
  };

  /* focus：圖片焦點（object-position），讓裁切保留重要的部分 */
  function img(src, focus) {
    const pos = /^\d{1,3}% \d{1,3}%$/.test(focus || '') ? ` style="object-position:${focus}"` : '';
    return `<img class="m-img" src="${e(src)}" alt="" draggable="false" referrerpolicy="no-referrer"${pos}>`;
  }

  /* 圖片來源：上傳的素材優先，其次是網址；匯出 HTML 時用 srcFor 改成內嵌的 data URL */
  P.slideMediaSrc = function (slide, srcFor) {
    if (srcFor) return srcFor(slide) || '';
    return (slide.media && P.Assets && P.Assets.url(slide.media)) || slide.image || '';
  };

  /* 每個模板放圖的方式：發表會＝滿版背景、雜誌＝右側圖框、數據焦點＝左半切割 */
  function mediaLayer(tpl, src, focus) {
    if (tpl === 'editorial') return `<figure class="media media-fig" data-media>${img(src, focus)}</figure>`;
    if (tpl === 'impact') return `<div class="media media-half" data-media>${img(src, focus)}</div>`;
    return `<div class="media media-bg" data-media>${img(src, focus)}</div>`;
  }

  P.slideHTML = function (slide, deck, extraClass, srcFor) {
    const fn = LAYOUT_HTML[slide.layout] || LAYOUT_HTML.statement;
    const tpl = P.TEMPLATES[deck.meta.template] ? deck.meta.template : 'keynote';
    const src = P.slideMediaSrc(slide, srcFor);
    const shown = !!src && P.mediaShown(tpl, slide.layout);
    const layered = shown && slide.layout !== 'story' && !(slide.layout === 'contrast' && tpl === 'impact');
    const cls = `slide L-${slide.layout} T-${tpl}${layered ? ' has-media' : ''}${extraClass ? ' ' + extraClass : ''}`;
    return `<div class="${cls}" data-theme="${e(deck.meta.theme)}" style="--accent:${e(deck.meta.accent)}" data-id="${e(slide.id)}">` +
      (layered ? mediaLayer(tpl, src, slide.focus) : '') +
      fn(slide, shown ? src : '', tpl) + '</div>';
  };

  /* 把 1920×1080 的投影片等比縮放進任意容器 */
  P.fitStage = function (stage) {
    const apply = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / 1920, h / 1080);
      stage.style.setProperty('--scale', s);
    };
    apply();
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(apply);
      ro.observe(stage);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  };

  /* 大數字的計數動畫（只處理開頭是純數字的情況，例如 100、47%、3.5 倍） */
  P.countUp = function (root) {
    const el = root.querySelector('.n-num[data-count]');
    if (!el) return;
    const raw = el.getAttribute('data-count');
    const m = raw.match(/^(\D*)(\d[\d,]*\.?\d*)(.*)$/);
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = parseFloat(m[2].replace(/,/g, ''));
    const decimals = (m[2].split('.')[1] || '').length;
    const comma = m[2].includes(',');
    const t0 = performance.now(), dur = 1100;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const v = target * (1 - Math.pow(1 - k, 3));
      let txt = v.toFixed(decimals);
      if (comma) txt = Number(txt).toLocaleString('en-US', { minimumFractionDigits: decimals });
      el.textContent = m[1] + txt + m[3];
      if (k < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };

  /* 講稿中的（停頓）轉成視覺標記 */
  P.scriptHTML = function (script) {
    return e(script).replace(/（停頓）|\(pause\)/gi, '<span class="pause" title="停頓">停頓</span>');
  };
})();
