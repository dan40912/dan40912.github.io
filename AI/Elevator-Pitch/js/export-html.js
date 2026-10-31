/* ==========================================================================
   export-html.js — 匯出「單一 HTML」：投影片、圖片、字型與播放器都在同一個檔案裡
   下載後直接用瀏覽器開啟即可播放，不需要網路、帳號或原本的網站。
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;

  const PLAYER_CSS = `
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#000;overflow:hidden;font-family:'Inter','Noto Sans TC',-apple-system,'PingFang TC','Microsoft JhengHei',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.pl{position:fixed;inset:0;display:flex;flex-direction:column}
.pl-progress{height:3px;background:rgba(255,255,255,.08);flex:none}
.pl-progress i{display:block;height:100%;width:0;background:var(--accent);transition:width .45s cubic-bezier(.2,.7,.2,1)}
.pl-main{flex:1;display:grid;grid-template-columns:minmax(0,1fr);min-height:0}
.pl.notes .pl-main{grid-template-columns:minmax(0,1fr) minmax(300px,32%)}
.pl .stage{position:relative;overflow:hidden;width:100%;height:100%;cursor:pointer}
.pl .stage>.slide{opacity:0;visibility:hidden;transition:opacity .45s cubic-bezier(.4,0,.2,1),visibility 0s .45s}
.pl .stage>.slide.on{opacity:1;visibility:visible;transition:opacity .45s cubic-bezier(.4,0,.2,1),visibility 0s;z-index:1}
.pl-notes{display:none;background:#111113;color:#e9e6e0;padding:22px 24px 90px;overflow-y:auto;font-size:19px;line-height:1.75;border-left:1px solid #2a2a2e}
.pl.notes .pl-notes{display:block}
.pl-notes .k{font-size:11px;letter-spacing:.14em;color:#77756f;font-weight:700;margin:0 0 10px}
.pl-notes .msg{color:#9c9993;font-size:14px;margin:0 0 12px}
.pl-notes .tr{color:#9c9993;font-size:14px;margin-top:14px}
.pause{display:inline-block;font-size:11px;font-weight:700;line-height:1;padding:4px 7px;margin:0 4px;border-radius:99px;background:rgba(255,74,54,.16);color:var(--accent);vertical-align:2px}
.pl-bar{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);display:flex;align-items:center;gap:2px;padding:6px;border-radius:14px;background:rgba(20,20,22,.84);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);z-index:5;transition:opacity .35s,transform .35s}
.pl.idle .pl-bar{opacity:0;transform:translate(-50%,10px);pointer-events:none}
.pl.idle{cursor:none}
.pl-bar button{min-width:40px;height:40px;border:0;border-radius:10px;background:none;color:#ddd;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-size:13px;font-weight:700;padding:0 10px;transition:transform .1s,background .15s}
.pl-bar button:hover{background:rgba(255,255,255,.1);color:#fff}
.pl-bar button:active{transform:scale(.94)}
.pl-bar button.on{color:var(--accent)}
.pl-bar svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.pl-count{min-width:60px;text-align:center;color:#ddd;font-weight:700;font-size:14px;font-variant-numeric:tabular-nums}
.pl-hint{position:fixed;top:16px;left:50%;transform:translateX(-50%);font-size:12px;color:rgba(255,255,255,.62);background:rgba(0,0,0,.55);padding:6px 12px;border-radius:99px;z-index:5;transition:opacity .6s;white-space:nowrap}
.pl-hint.gone{opacity:0}
@media (max-width:760px){.pl.notes .pl-main{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr}.pl.notes .stage{height:auto;aspect-ratio:16/9}.pl-notes{border-left:0;border-top:1px solid #2a2a2e}.pl-hint{display:none}.pl-bar{bottom:12px}}
@media (prefers-reduced-motion:reduce){.pl .stage>.slide,.pl .stage>.slide.on,.pl-progress i{transition:none}}
`;

  /* 播放器：會以 toString() 內嵌到匯出檔，所以不能引用外部變數 */
  function player(D) {
    var $ = function (id) { return document.getElementById(id); };
    var root = $('pl'), stage = $('stage'), notesEl = $('notes');
    stage.innerHTML = D.slides.join('');
    var slides = stage.children, n = slides.length, idx = 0, idle = 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!D.notes) $('b-notes').style.display = 'none';

    function fit() {
      var s = Math.min(stage.clientWidth / 1920, stage.clientHeight / 1080);
      if (s > 0) stage.style.setProperty('--scale', s);
    }
    function countUp(el) {
      var num = el.querySelector('.n-num[data-count]');
      if (!num || reduce) return;
      var raw = num.getAttribute('data-count');
      var m = raw.match(/^(\D*)(\d[\d,]*\.?\d*)(.*)$/);
      if (!m) return;
      var target = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 1100), v = target * (1 - Math.pow(1 - k, 3));
        num.textContent = k < 1 ? m[1] + v.toFixed(dec) + m[3] : raw;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }
    function show(i) {
      i = Math.max(0, Math.min(n - 1, i));
      idx = i;
      for (var k = 0; k < n; k++) {
        var on = k === i;
        slides[k].classList.toggle('on', on);
        slides[k].classList.remove('is-live');
        if (on) { void slides[k].offsetWidth; slides[k].classList.add('is-live'); countUp(slides[k]); }
      }
      $('progress').style.width = ((i + 1) / n) * 100 + '%';
      $('count').textContent = (i + 1) + ' / ' + n;
      if (D.notes) {
        var x = D.notes[i];
        notesEl.innerHTML = '<p class="k">講稿 · ' + x.sec + ' 秒</p>' + (x.m ? '<p class="msg">' + x.m + '</p>' : '') +
          '<div>' + (x.s || '（這一頁沒有講稿）') + '</div>' + (x.t ? '<p class="tr">↳ ' + x.t + '</p>' : '');
        notesEl.scrollTop = 0;
      }
      try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) { /* file:// 可能不允許 */ }
    }
    function fs() {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
    }
    function toggleNotes() {
      if (!D.notes) return;
      root.classList.toggle('notes');
      $('b-notes').classList.toggle('on', root.classList.contains('notes'));
      setTimeout(fit, 0);
    }
    function poke() {
      root.classList.remove('idle');
      clearTimeout(idle);
      idle = setTimeout(function () { root.classList.add('idle'); }, 2400);
    }

    $('b-prev').onclick = function () { show(idx - 1); };
    $('b-next').onclick = function () { show(idx + 1); };
    $('b-notes').onclick = toggleNotes;
    $('b-fs').onclick = fs;
    stage.addEventListener('click', function (ev) {
      var r = stage.getBoundingClientRect();
      if (ev.clientX - r.left < r.width * 0.25) show(idx - 1); else show(idx + 1);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var k = ev.key, h = true;
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') show(idx + 1);
      else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') show(idx - 1);
      else if (k === 'Home') show(0);
      else if (k === 'End') show(n - 1);
      else if (k === 'f' || k === 'F') fs();
      else if (k === 'n' || k === 'N' || k === 's' || k === 'S') toggleNotes();
      else h = false;
      if (h) { ev.preventDefault(); poke(); }
    });
    var sx = 0, sy = 0, st = 0;
    root.addEventListener('touchstart', function (ev) { var t = ev.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
    root.addEventListener('touchend', function (ev) {
      var t = ev.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3 && Date.now() - st < 800) { ev.preventDefault(); show(dx < 0 ? idx + 1 : idx - 1); }
      poke();
    });
    root.addEventListener('mousemove', poke);
    window.addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);
    setTimeout(function () { $('hint').classList.add('gone'); }, 3600);

    var start = parseInt((location.hash || '').slice(1), 10);
    fit();
    show(start > 0 ? start - 1 : 0);
    poke();
  }

  /* ---------- 字型：向 Google Fonts 取「只含用到的字」的子集，轉成內嵌 data URL ---------- */
  function deckText(deck, withNotes) {
    const parts = [deck.meta.title, '講稿秒或點擊換頁全螢幕停頓'];
    deck.slides.forEach((s) => {
      parts.push(...P.visibleTexts(s), s.by);
      if (withNotes) parts.push(s.notes.message, s.notes.script, s.notes.transition);
    });
    return parts.join('') + '0123456789%.,:/-–— ';
  }

  async function blobToDataURL(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(blob);
    });
  }

  async function inlineFonts(deck, withNotes) {
    const chars = Array.from(new Set(Array.from(deckText(deck, withNotes).replace(/\s+/g, '')))).join('') + ' ';
    const fams = ['Noto+Sans+TC:wght@500;600;700;800;900', 'Inter:wght@500;600;700;800;900'];
    if (deck.meta.template === 'editorial') fams.push('Noto+Serif+TC:wght@700;900');
    const url = 'https://fonts.googleapis.com/css2?' + fams.map((f) => 'family=' + f).join('&') +
      '&display=swap&text=' + encodeURIComponent(chars);
    const res = await fetch(url);
    if (!res.ok) throw new Error('fonts ' + res.status);
    let css = await res.text();
    const urls = Array.from(new Set((css.match(/url\((https:[^)]+)\)/g) || []).map((m) => m.slice(4, -1))));
    for (const u of urls) {
      const blob = await (await fetch(u)).blob();
      css = css.split(u).join(await blobToDataURL(blob));
    }
    return css;
  }

  /* ---------- 匯出 ---------- */
  P.exportHTML = async function (deck, opts) {
    opts = opts || {};
    const status = opts.onStatus || (() => {});
    const tpl = deck.meta.template;

    status('正在打包圖片…');
    const map = {};
    for (const s of deck.slides) {
      if (s.media && !map[s.media] && P.Assets.get(s.media) && P.mediaShown(tpl, s.layout)) {
        map[s.media] = await P.Assets.dataURL(s.media, 1920, 0.86);
      }
    }
    const srcFor = (s) => (s.media ? map[s.media] || '' : s.image);
    const slides = deck.slides.map((s) => P.slideHTML(s, deck, '', srcFor));
    const notes = opts.includeNotes
      ? deck.slides.map((s) => ({ m: P.esc(s.notes.message), s: P.scriptHTML(s.notes.script), t: P.esc(s.notes.transition), sec: s.notes.seconds }))
      : null;

    status('正在內嵌字型…');
    let fontCSS = '';
    try { fontCSS = await inlineFonts(deck, !!opts.includeNotes); } catch (err) { fontCSS = ''; }

    status('正在產生檔案…');
    const data = { title: deck.meta.title, slides, notes };
    // 避免內容中的 < 或 U+2028/U+2029 截斷 <script>
    const LS = String.fromCharCode(0x2028), PS = String.fromCharCode(0x2029), BS = String.fromCharCode(92);
    const json = JSON.stringify(data).split('<').join(BS + 'u003c').split(LS).join(BS + 'u2028').split(PS).join(BS + 'u2029');
    const lang = deck.meta.lang === 'en' ? 'en' : 'zh-Hant';
    const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="elevator-pitch">
<title>${P.esc(deck.meta.title)}</title>
<style>${fontCSS}
${P.SLIDES_CSS}
${PLAYER_CSS}</style>
</head>
<body style="--accent:${P.esc(deck.meta.accent)}">
<div class="pl" id="pl">
  <div class="pl-progress"><i id="progress"></i></div>
  <div class="pl-main"><div class="stage" id="stage"></div><aside class="pl-notes" id="notes"></aside></div>
  <div class="pl-bar">
    <button id="b-prev" aria-label="上一頁"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <span class="pl-count" id="count"></span>
    <button id="b-next" aria-label="下一頁"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
    <button id="b-notes" aria-label="顯示講稿"><svg viewBox="0 0 24 24"><path d="M5 5h14M5 10h14M5 15h9"/></svg>講稿</button>
    <button id="b-fs" aria-label="全螢幕"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
  </div>
  <div class="pl-hint" id="hint">← → 或點擊換頁 · F 全螢幕${notes ? ' · N 講稿' : ''}</div>
</div>
<script>(${player.toString()})(${json});</script>
</body>
</html>`;
    return { html, bytes: new Blob([html]).size, fontsInlined: !!fontCSS };
  };

  P.downloadHTML = function (html, filename) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  };
})();
