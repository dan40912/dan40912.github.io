/* ==========================================================================
   present.js — 播放模式：全螢幕、鍵盤 / 觸控換頁、進度條、計時、演講者模式
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;
  const $ = (s) => document.querySelector(s);

  const pr = {
    deck: null, index: 0, open: false,
    running: true, totalMs: 0, slideMs: 0, last: 0, raf: 0,
    idleTimer: 0, disposers: [],
  };

  const el = {};
  function cache() {
    ['presenter', 'pr-stage', 'pr-next', 'pr-notes', 'pr-progress', 'pr-count', 'pr-total', 'pr-slide', 'pr-target',
      'pr-slide-target', 'pr-clock', 'pr-timer-btn', 'pr-speaker', 'pr-black', 'pr-help', 'pr-bar']
      .forEach((id) => (el[id] = document.getElementById(id)));
  }

  P.present = function (deck, startIndex, opts) {
    if (!el.presenter) cache();
    opts = opts || {};
    pr.deck = deck;
    pr.index = Math.max(0, Math.min(startIndex || 0, deck.slides.length - 1));
    pr.open = true;
    pr.totalMs = 0; pr.slideMs = 0; pr.running = true; pr.last = performance.now();

    // 全部頁面放進舞台，用透明度切換，轉場才會平滑
    el['pr-stage'].innerHTML = deck.slides.map((s) => P.slideHTML(s, deck)).join('');
    el['pr-target'].textContent = '/ ' + P.fmtTime(deck.meta.duration);
    el.presenter.hidden = false;
    el.presenter.classList.toggle('speaker', !!opts.speaker);
    el['pr-speaker'].classList.toggle('on', !!opts.speaker);
    el['pr-black'].hidden = true;
    el['pr-help'].textContent = opts.preview
      ? '預覽中：← → 或點擊換頁 · 按「編輯這頁」回到微調'
      : '← → / Space 換頁 · F 全螢幕 · S 講稿 · P 暫停計時 · B 黑畫面 · Esc 離開';
    el['pr-help'].classList.remove('gone');
    setTimeout(() => el['pr-help'].classList.add('gone'), opts.preview ? 5200 : 3800);

    pr.disposers.push(P.fitStage(el['pr-stage']), P.fitStage(el['pr-next']));
    document.body.style.overflow = 'hidden';
    if (opts.fullscreen !== false && !opts.speaker) requestFS();
    show(pr.index, true);
    tick();
    poke();
  };

  function close() {
    pr.open = false;
    cancelAnimationFrame(pr.raf);
    pr.disposers.forEach((d) => d && d());
    pr.disposers = [];
    el.presenter.hidden = true;
    el['pr-stage'].innerHTML = '';
    el['pr-next'].innerHTML = '';
    document.body.style.overflow = '';
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    P.onPresentClose && P.onPresentClose(pr.index);
  }

  function show(i, first) {
    const n = pr.deck.slides.length;
    i = Math.max(0, Math.min(i, n - 1));
    if (i === pr.index && !first) return;
    pr.index = i;
    pr.slideMs = 0;
    const slides = el['pr-stage'].children;
    for (let k = 0; k < slides.length; k++) {
      const on = k === i;
      slides[k].classList.toggle('is-current', on);
      // 重新觸發進場動畫
      slides[k].classList.remove('is-live');
      if (on) { void slides[k].offsetWidth; slides[k].classList.add('is-live'); P.countUp(slides[k]); }
    }
    el['pr-progress'].style.width = ((i + 1) / n) * 100 + '%';
    el['pr-count'].textContent = (i + 1) + ' / ' + n;
    const s = pr.deck.slides[i];
    const next = pr.deck.slides[i + 1];
    el['pr-next'].innerHTML = next ? P.slideHTML(next, pr.deck) : '';
    el['pr-slide-target'].textContent = '/ ' + P.fmtTime(s.notes.seconds);
    el['pr-notes'].innerHTML =
      (s.notes.message ? `<p class="msg">${P.esc(s.notes.message)}</p>` : '') +
      `<div>${P.scriptHTML(s.notes.script || '（這一頁沒有講稿）')}</div>` +
      (s.notes.transition ? `<p class="trans">↳ ${P.esc(s.notes.transition)}</p>` : '');
    el['pr-notes'].scrollTop = 0;
  }

  const next = () => show(pr.index + 1);
  const prev = () => show(pr.index - 1);

  function tick() {
    const now = performance.now();
    const dt = now - pr.last;
    pr.last = now;
    if (pr.running) { pr.totalMs += dt; pr.slideMs += dt; }
    const total = pr.totalMs / 1000, slide = pr.slideMs / 1000;
    const target = pr.deck.meta.duration, st = pr.deck.slides[pr.index].notes.seconds;
    el['pr-total'].textContent = P.fmtTime(total);
    el['pr-slide'].textContent = P.fmtTime(slide);
    el['pr-clock'].textContent = P.fmtTime(total) + ' / ' + P.fmtTime(target);
    el['pr-total'].className = total > target ? 'over' : total > target * 0.85 ? 'warn' : '';
    el['pr-slide'].className = slide > st + 2 ? 'over' : slide > st * 0.8 ? 'warn' : '';
    el['pr-timer-btn'].classList.toggle('paused', !pr.running);
    pr.raf = requestAnimationFrame(tick);
  }

  function requestFS() {
    const r = el.presenter;
    if (!document.fullscreenElement && r.requestFullscreen) r.requestFullscreen().catch(() => {});
  }
  function toggleFS() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else requestFS();
  }
  function toggleSpeaker() {
    const on = !el.presenter.classList.contains('speaker');
    el.presenter.classList.toggle('speaker', on);
    el['pr-speaker'].classList.toggle('on', on);
  }
  function toggleBlack() { el['pr-black'].hidden = !el['pr-black'].hidden; }

  /* 滑鼠靜止時隱藏控制列 */
  function poke() {
    el.presenter.classList.remove('idle');
    clearTimeout(pr.idleTimer);
    pr.idleTimer = setTimeout(() => pr.open && el.presenter.classList.add('idle'), 2400);
  }

  function bind() {
    cache();
    document.getElementById('pr-prev').addEventListener('click', prev);
    document.getElementById('pr-next-btn').addEventListener('click', next);
    document.getElementById('pr-close').addEventListener('click', close);
    document.getElementById('pr-edit').addEventListener('click', close);
    document.getElementById('pr-fs').addEventListener('click', toggleFS);
    el['pr-speaker'].addEventListener('click', toggleSpeaker);
    el['pr-timer-btn'].addEventListener('click', () => (pr.running = !pr.running));
    document.getElementById('pr-reset').addEventListener('click', () => { pr.totalMs = 0; pr.slideMs = 0; });
    el['pr-stage'].addEventListener('click', (ev) => {
      // 點左側 1/4 回上一頁，其餘前進
      const r = el['pr-stage'].getBoundingClientRect();
      if (ev.clientX - r.left < r.width * 0.25) prev(); else next();
    });
    el['pr-black'].addEventListener('click', toggleBlack);
    el.presenter.addEventListener('mousemove', poke);

    // 觸控滑動
    let sx = 0, sy = 0, st = 0;
    el.presenter.addEventListener('touchstart', (ev) => {
      const t = ev.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now();
    }, { passive: true });
    el.presenter.addEventListener('touchend', (ev) => {
      const t = ev.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3 && Date.now() - st < 800) {
        ev.preventDefault();
        dx < 0 ? next() : prev();
      }
      poke();
    });

    document.addEventListener('keydown', (ev) => {
      if (!pr.open) return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const k = ev.key;
      let handled = true;
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') next();
      else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') prev();
      else if (k === 'Home') show(0);
      else if (k === 'End') show(pr.deck.slides.length - 1);
      else if (k === 'f' || k === 'F') toggleFS();
      else if (k === 's' || k === 'S' || k === 'n' || k === 'N') toggleSpeaker();
      else if (k === 'b' || k === 'B' || k === '.') toggleBlack();
      else if (k === 'p' || k === 'P') pr.running = !pr.running;
      else if (k === 'r' || k === 'R') { pr.totalMs = 0; pr.slideMs = 0; }
      else if (k === 'Escape') { if (!document.fullscreenElement) close(); }
      else handled = false;
      if (handled) { ev.preventDefault(); poke(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
