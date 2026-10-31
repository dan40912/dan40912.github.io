/* ==========================================================================
   slides-css.js — 投影片版型樣式（1920×1080 畫布，等比縮放）
   放在 JS 裡是為了「匯出單一 HTML」：直接開啟 file:// 時無法讀取 CSS 檔，
   但可以從這裡取得同一份樣式內嵌到匯出檔。這是投影片樣式唯一的來源。
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.Pitch = window.Pitch || {});

  P.SLIDES_CSS = String.raw`/* ==========================================================================
   slides.css — 投影片版型（1920×1080 畫布，等比縮放）
   視覺方向：TED Storytelling × Keynote × Editorial
   ========================================================================== */

/* ---------- 縮放舞台 ---------- */
.stage { position: relative; overflow: hidden; }
.stage > .slide {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%) scale(var(--scale, .3));
  transform-origin: center center;
}

/* ---------- 主題 ---------- */
.slide {
  --bg: #0b0b0c; --fg: #f5f3ef; --mute: #8f8b85; --line: rgba(255,255,255,.13); --soft: rgba(255,255,255,.045);
  --on-accent: #fff;
  --font: 'Inter', 'Noto Sans TC', -apple-system, 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif;
  width: 1920px; height: 1080px; position: relative; overflow: hidden;
  background: var(--bg); color: var(--fg); font-family: var(--font);
  font-feature-settings: 'palt' 1; -webkit-font-smoothing: antialiased;
  box-sizing: border-box; user-select: none;
}
.slide *, .slide *::before, .slide *::after { box-sizing: border-box; }
.slide[data-theme="charcoal"] { --bg: #1c1d20; --fg: #f2f0eb; --mute: #9b978f; --line: rgba(255,255,255,.14); --soft: rgba(255,255,255,.05); }
.slide[data-theme="paper"] { --bg: #f3efe6; --fg: #141414; --mute: #6d685f; --line: rgba(0,0,0,.13); --soft: rgba(0,0,0,.04); }

/* ---------- 共用文字層級 ---------- */
.slide .wrap { position: absolute; inset: 0; padding: 140px 170px; display: flex; flex-direction: column; justify-content: center; }
.slide .wrap-center { align-items: center; text-align: center; }
.slide .title {
  --fs: 112px; font-size: calc(var(--fs) * var(--fit, 1));
  font-weight: 800; line-height: 1.16; letter-spacing: -0.012em; margin: 0;
  max-width: 1580px; text-wrap: balance;
  /* 中文標題優先在標點處換行，避免把詞拆開；過長時才任意斷行 */
  word-break: keep-all; overflow-wrap: anywhere;
}
.slide .fit-1 { --fit: .86; }
.slide .fit-2 { --fit: .72; }
.slide .sub { font-size: 46px; line-height: 1.5; color: var(--mute); margin: 44px 0 0; max-width: 1380px; font-weight: 500; text-wrap: pretty; }
.slide .kicker {
  display: inline-flex; align-items: center; gap: 22px; margin-bottom: 48px;
  font-size: 30px; font-weight: 700; letter-spacing: .22em; color: var(--accent); text-transform: uppercase;
}
.slide .kicker::before { content: ''; width: 56px; height: 4px; background: var(--accent); border-radius: 2px; }
.slide .wrap-center .kicker::before { display: none; }

/* ---------- Statement ---------- */
.L-statement .points {
  list-style: none; margin: 96px 0 0; padding: 52px 0 0; border-top: 2px solid var(--line);
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 64px; max-width: 1580px;
}
.L-statement .points li { font-size: 40px; line-height: 1.45; font-weight: 600; display: flex; flex-direction: column; gap: 18px; }
.L-statement .pn { font-size: 28px; font-weight: 700; color: var(--accent); letter-spacing: .1em; font-variant-numeric: tabular-nums; }

/* ---------- Question ---------- */
.L-question .q-mark {
  position: absolute; right: -60px; bottom: -330px; font-size: 1380px; line-height: 1; font-weight: 900;
  color: var(--accent); opacity: .09; font-family: var(--font); pointer-events: none;
}
.L-question .q-title { --fs: 124px; max-width: 1540px; }

/* ---------- Contrast ---------- */
.L-contrast .c-title { --fs: 92px; }
.L-contrast .c-grid { display: grid; grid-template-columns: 1fr 150px 1fr; align-items: stretch; margin-top: 96px; width: 100%; max-width: 1580px; }
.L-contrast .c-side { border-radius: 28px; padding: 60px 64px; display: flex; flex-direction: column; justify-content: center; gap: 26px; min-height: 340px; }
.L-contrast .c-left { background: var(--soft); border: 2px solid var(--line); color: var(--mute); }
.L-contrast .c-right { background: var(--accent); color: var(--on-accent); }
.L-contrast .c-label { font-size: 72px; font-weight: 800; line-height: 1.1; }
.L-contrast .c-text { font-size: 42px; line-height: 1.45; font-weight: 500; }
.L-contrast .c-arrow { display: flex; align-items: center; justify-content: center; color: var(--mute); }
.L-contrast .c-arrow svg { width: 96px; }

/* ---------- Big Number ---------- */
.L-bignumber .n-num {
  --fs: 400px; font-size: calc(var(--fs) * var(--fit, 1));
  font-weight: 900; line-height: .95; letter-spacing: -.045em; color: var(--accent);
  font-variant-numeric: tabular-nums; font-family: 'Inter', var(--font);
}
.L-bignumber .n-title { --fs: 76px; margin-top: 56px; }

/* ---------- Story ---------- */
.L-story .st-grid { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; }
.L-story .st-media { position: relative; overflow: hidden; background: var(--soft); color: var(--fg); }
.L-story .st-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.L-story .motif { width: 100%; height: 100%; display: block; }
.L-story .st-text { padding: 140px 150px 140px 120px; display: flex; flex-direction: column; justify-content: center; }
.L-story .st-title { --fs: 92px; }

/* ---------- Diagram ---------- */
.L-diagram .d-title { --fs: 92px; }
.L-diagram .flow { position: relative; display: grid; grid-template-columns: repeat(var(--n), 1fr); margin-top: 120px; width: 100%; max-width: 1580px; }
.L-diagram .flow-line { position: absolute; top: 50px; left: calc(100% / var(--n) / 2); right: calc(100% / var(--n) / 2); height: 3px; background: var(--line); }
.L-diagram .flow-line::after { content: ''; position: absolute; inset: 0; background: var(--accent); transform-origin: left; }
.L-diagram .node { position: relative; text-align: center; padding: 0 28px; }
.L-diagram .node-dot {
  width: 100px; height: 100px; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: var(--bg); border: 3px solid var(--accent); color: var(--accent); font-size: 40px; font-weight: 800; position: relative;
}
.L-diagram .node-label { font-size: calc(62px * var(--fit, 1)); font-weight: 800; margin-top: 44px; line-height: 1.2; }
.L-diagram .node-text { font-size: 36px; color: var(--mute); margin-top: 18px; line-height: 1.45; }
.L-diagram .d-sub { margin-top: 90px; }

/* ---------- Quote ---------- */
.L-quote .qt-mark { width: 150px; height: auto; margin-bottom: 64px; }
.L-quote .qt-text { --fs: 104px; font-size: calc(var(--fs) * var(--fit, 1)); font-weight: 750; line-height: 1.32; margin: 0; max-width: 1560px; text-wrap: balance; word-break: keep-all; overflow-wrap: anywhere; }
.L-quote .qt-by { font-size: 38px; color: var(--mute); margin-top: 56px; font-weight: 500; }

/* ---------- Closing ---------- */
.L-closing .cl-bar { width: 120px; height: 10px; border-radius: 5px; background: var(--accent); margin-bottom: 76px; }
.L-closing .cl-title { --fs: 132px; }
.L-closing .cta {
  margin-top: 84px; display: inline-flex; align-items: center; gap: 22px;
  padding: 34px 64px; border-radius: 999px; background: var(--accent); color: var(--on-accent);
  font-size: 44px; font-weight: 700;
}
.L-closing .cta svg { width: 44px; height: 44px; }

/* ---------- 進場動畫（只在播放中的頁面） ---------- */
@keyframes rv-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
@keyframes draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes fade { from { opacity: 0; } to { opacity: .09; } }
.slide.is-live .rv { animation: rv-in .85s cubic-bezier(.16,.84,.24,1) both; animation-delay: calc(var(--d, 0) * 110ms + 160ms); }
.slide.is-live .flow-line::after { animation: draw 1.3s .4s cubic-bezier(.6,0,.2,1) both; }
.slide.is-live .q-mark { animation: fade 1.6s .1s ease-out both; }

@media (prefers-reduced-motion: reduce) {
  .slide.is-live .rv, .slide.is-live .flow-line::after, .slide.is-live .q-mark { animation: none; }
}

/* ==========================================================================
   模板（T-keynote / T-editorial / T-impact）與圖片
   統一 5 張圖的關鍵：同樣的裁切、同樣的調色（--grade）、同樣的邊距
   ========================================================================== */
.slide .wrap, .slide .st-grid { z-index: 1; }
.slide .media { z-index: 0; overflow: hidden; }
.slide .m-img { width: 100%; height: 100%; object-fit: cover; display: block; filter: var(--grade, none); }
.L-story .st-media { overflow: hidden; }

/* ---------- 發表會：滿版主角圖 + 深色漸層 ---------- */
.T-keynote { --grade: saturate(.9) contrast(1.06) brightness(.92); }
.T-keynote .media-bg { position: absolute; inset: 0; }
.T-keynote .media-bg::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,.84) 0%, rgba(0,0,0,.56) 50%, rgba(0,0,0,.22) 100%),
              linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 55%);
}
.T-keynote.L-question .media-bg::after,
.T-keynote.L-bignumber .media-bg::after,
.T-keynote.L-closing .media-bg::after { background: radial-gradient(ellipse at center, rgba(0,0,0,.72) 0%, rgba(0,0,0,.88) 100%); }
.T-keynote.L-contrast .media-bg::after,
.T-keynote.L-diagram .media-bg::after { background: rgba(0,0,0,.76); }
.T-keynote.has-media { --fg: #fff; --mute: rgba(255,255,255,.8); --line: rgba(255,255,255,.3); --soft: rgba(0,0,0,.38); color: var(--fg); }
.T-keynote.has-media .title, .T-keynote.has-media .qt-text { text-shadow: 0 2px 40px rgba(0,0,0,.35); }
.T-keynote.has-media .q-mark { display: none; }
.T-keynote.has-media .node-dot { background: rgba(0,0,0,.55); }

/* ---------- 雜誌：米白、襯線標題、右側圖框 ---------- */
.T-editorial {
  --grade: saturate(.82) sepia(.1) contrast(.97) brightness(1.02);
  --serif: 'Noto Serif TC', 'Songti TC', 'PMingLiU', serif;
}
.T-editorial .title, .T-editorial .qt-text, .T-editorial .n-num, .T-editorial .c-label, .T-editorial .node-label { font-family: var(--serif); font-weight: 900; letter-spacing: 0; }
.T-editorial .kicker { color: var(--fg); font-weight: 600; letter-spacing: .32em; }
.T-editorial .kicker::before { width: 80px; height: 3px; }
.T-editorial .sub { font-weight: 400; }
.T-editorial .q-mark { font-family: var(--serif); opacity: .07; }
.T-editorial .media-fig { position: absolute; top: 120px; right: 130px; bottom: 120px; width: 660px; margin: 0; overflow: visible; }
.T-editorial .media-fig .m-img { box-shadow: 0 40px 90px rgba(0,0,0,.18); }
.T-editorial .media-fig::after {
  content: ''; position: absolute; left: -34px; bottom: -34px; width: 150px; height: 150px;
  border-left: 5px solid var(--accent); border-bottom: 5px solid var(--accent);
}
.T-editorial.has-media .wrap { padding-right: 930px; }
.T-editorial.has-media .wrap-center { align-items: flex-start; text-align: left; }
.T-editorial.has-media .title { --fs: 86px; }
.T-editorial.has-media .q-title, .T-editorial.has-media .cl-title { --fs: 92px; }
.T-editorial.has-media .n-num { --fs: 300px; }
.T-editorial.has-media .qt-text { --fs: 78px; }
.T-editorial.has-media .sub { font-size: 40px; }
.T-editorial.has-media .q-mark { display: none; }
.T-editorial .st-media { margin: 120px 30px 120px 130px; background: none; }

/* ---------- 數據焦點：左半切割、強調色雙色調 ---------- */
.T-impact { --grade: grayscale(1) contrast(1.12) brightness(.82); }
.T-impact .kicker { font-weight: 800; letter-spacing: .26em; }
.T-impact .title { letter-spacing: -.02em; }
.T-impact .n-num { letter-spacing: -.06em; }
.T-impact .media-half { position: absolute; left: 0; top: 0; bottom: 0; width: 46%; border-right: 10px solid var(--accent); }
.T-impact .media-half::after,
.T-impact .st-media::after,
.T-impact .c-media::after { content: ''; position: absolute; inset: 0; background: var(--accent); mix-blend-mode: multiply; opacity: .4; pointer-events: none; }
.T-impact .st-media { position: relative; }
.T-impact.has-media .wrap { padding-left: calc(46% + 120px); padding-right: 130px; }
.T-impact.has-media .wrap-center { align-items: flex-start; text-align: left; }
.T-impact.has-media .title { --fs: 86px; }
.T-impact.has-media .q-title, .T-impact.has-media .cl-title { --fs: 92px; }
.T-impact.has-media .n-num { --fs: 320px; }
.T-impact.has-media .qt-text { --fs: 78px; }
.T-impact.has-media .sub { font-size: 40px; }
.T-impact.has-media .q-mark { display: none; }
.T-impact .c-right.has-img { position: relative; overflow: hidden; }
.T-impact .c-media { position: absolute; inset: 0; }
.T-impact .c-media::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgba(0,0,0,.7), rgba(0,0,0,.15)); }
.T-impact .c-right.has-img > .c-label, .T-impact .c-right.has-img > .c-text { position: relative; z-index: 2; }

/* 圖片緩慢推近（Ken Burns），只在播放中的頁面 */
@keyframes kb { from { transform: scale(1.08); } to { transform: scale(1); } }
.slide.is-live .media .m-img, .slide.is-live .st-media .m-img { animation: kb 9s cubic-bezier(.2,.6,.3,1) both; }
@media (prefers-reduced-motion: reduce) {
  .slide.is-live .media .m-img, .slide.is-live .st-media .m-img { animation: none; }
}`;

  const style = document.createElement('style');
  style.id = 'slides-css';
  style.textContent = P.SLIDES_CSS;
  // 放在其他樣式表之前，讓 app.css 可以覆寫
  document.head.insertBefore(style, document.head.querySelector('link[rel="stylesheet"]'));
})();
