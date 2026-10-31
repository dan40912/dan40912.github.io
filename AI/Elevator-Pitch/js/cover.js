/* ==========================================================================
   cover.js — 單張吸睛封面（Canvas 繪製，可直接匯出 PNG）
   三種尺寸：16:9、1:1、9:16；三種模板各有自己的構圖。
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;

  const PALETTE = {
    dark: { bg: '#0b0b0c', fg: '#f5f3ef', mute: 'rgba(245,243,239,.62)' },
    charcoal: { bg: '#1c1d20', fg: '#f2f0eb', mute: 'rgba(242,240,235,.62)' },
    paper: { bg: '#f3efe6', fg: '#141414', mute: 'rgba(20,20,20,.58)' },
  };
  const SANS = '"Noto Sans TC", "Inter", "PingFang TC", "Microsoft JhengHei", sans-serif';
  const SERIF = '"Noto Serif TC", "Songti TC", "PMingLiU", serif';
  const NUM = '"Inter", "Noto Sans TC", sans-serif';
  const GRADE = {
    keynote: 'saturate(.9) contrast(1.06) brightness(.84)',
    editorial: 'saturate(.82) sepia(.1) contrast(.97) brightness(1.02)',
    impact: 'grayscale(1) contrast(1.12) brightness(.82)',
  };

  function loadImage(src) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = src;
    });
  }

  async function ensureFonts(text) {
    if (!document.fonts || !document.fonts.load) return;
    const sample = text || '字';
    try {
      await Promise.all([
        document.fonts.load(`900 80px "Noto Sans TC"`, sample),
        document.fonts.load(`700 40px "Noto Sans TC"`, sample),
        document.fonts.load(`900 80px "Noto Serif TC"`, sample),
        document.fonts.load(`900 80px "Inter"`, '0123456789%'),
      ]);
    } catch (e) { /* 字型載入失敗就用系統字 */ }
  }

  /* 等比裁切填滿（偏上方，保留人物頭部） */
  function drawCover(ctx, img, x, y, w, h, filter) {
    const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / k, sh = h / k;
    const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) * 0.4;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if ('filter' in ctx) ctx.filter = filter || 'none';
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
  }

  /* ---------- 文字排版：中文逐字、英文整字，避頭點 ---------- */
  const TOKEN = /[A-Za-z0-9][A-Za-z0-9'’.\-%+]*|\n|\s+|./gu;
  const NO_START = /^[，。、；：！？」』）〕】,.;:!?)\]%]/;

  /* 逐字換行（片語太長時才用） */
  function charWrap(ctx, text, maxW) {
    const tokens = String(text || '').match(TOKEN) || [];
    const lines = [];
    let line = '';
    tokens.forEach((tk) => {
      const next = line + tk;
      if (ctx.measureText(next).width <= maxW || !line.trim() || NO_START.test(tk)) line = next;
      else { lines.push(line.trim()); line = /^\s+$/.test(tk) ? '' : tk; }
    });
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  /* 先依標點切成片語，片語盡量完整地放在同一行；回傳 broken 表示有片語被拆開 */
  function wrap(ctx, text, maxW) {
    const out = [];
    let broken = false;
    String(text || '').split('\n').forEach((para) => {
      const phrases = para.split(/(?<=[，。！？；：、,!?;:])/).filter((x) => x.trim());
      let line = '';
      phrases.forEach((ph) => {
        if (ctx.measureText(line + ph).width <= maxW) { line += ph; return; }
        if (line) { out.push(line.trim()); line = ''; }
        if (ctx.measureText(ph).width <= maxW) { line = ph; return; }
        broken = true;
        const parts = charWrap(ctx, ph, maxW);
        line = parts.pop() || '';
        parts.forEach((p) => out.push(p));
      });
      if (line.trim()) out.push(line.trim());
    });
    out.broken = broken;
    return out;
  }

  /* 找出能放進 maxLines 行的最大字級；優先選片語不被拆開的字級，再平均各行長度 */
  function fit(ctx, text, font, maxW, maxLines, start, min) {
    const tryAt = (size, w) => { ctx.font = font(size); return wrap(ctx, text, w || maxW); };
    let size = start, lines;
    for (let s = start; s >= Math.max(min, start * 0.7); s = Math.floor(s * 0.95)) {
      const l = tryAt(s);
      if (l.length <= maxLines && !l.broken) { size = s; lines = l; break; }
    }
    if (!lines) {
      for (size = start; size >= min; size = Math.floor(size * 0.94)) {
        lines = tryAt(size);
        if (lines.length <= maxLines) break;
      }
      size = Math.max(size, min);
      lines = tryAt(size);
    }
    const n = lines.length;
    if (n > 1) {
      let lo = maxW * 0.5, hi = maxW;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        const l = tryAt(size, mid);
        if (l.length > n || (l.broken && !lines.broken)) lo = mid; else hi = mid;
      }
      lines = tryAt(size, hi);
    }
    ctx.font = font(size);
    return { size, lines };
  }

  function drawLines(ctx, lines, x, y, lh, align) {
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'alphabetic';
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  }

  function spaced(ctx, value) { if ('letterSpacing' in ctx) ctx.letterSpacing = value; }

  function kicker(ctx, text, x, y, size, color, accent, bar) {
    if (!text) return;
    ctx.save();
    if (bar) { ctx.fillStyle = accent; ctx.fillRect(x, y - size * 0.42, size * 2, Math.max(3, size * 0.14)); x += size * 2.7; }
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px ${SANS}`;
    spaced(ctx, Math.round(size * 0.24) + 'px');
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), x, y - size * 0.32);
    ctx.restore();
  }

  function motif(ctx, cx, cy, r, color, accent) {
    ctx.save();
    for (let i = 1; i <= 7; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (r / 7) * i, 0, Math.PI * 2);
      ctx.strokeStyle = color; ctx.globalAlpha = 0.05 + i * 0.022; ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ---------- 三種構圖 ---------- */
  function keynote(ctx, d) {
    const { W, H, pad, img, pal, accent, shape } = d;
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
    const light = !!img || pal.bg !== PALETTE.paper.bg;
    if (img) {
      drawCover(ctx, img, 0, 0, W, H, GRADE.keynote);
      let g;
      if (shape === 'wide') {
        g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, 'rgba(0,0,0,.86)'); g.addColorStop(0.55, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,.15)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      g = ctx.createLinearGradient(0, H, 0, H * 0.25);
      g.addColorStop(0, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else {
      motif(ctx, shape === 'wide' ? W * 0.78 : W * 0.62, shape === 'tall' ? H * 0.3 : H * 0.36, Math.min(W, H) * 0.62, pal.fg, accent);
    }
    const fg = light ? '#fff' : pal.fg;
    const maxW = shape === 'wide' ? W * 0.62 : W - pad * 2;
    const t = fit(ctx, d.title, (s) => `900 ${s}px ${SANS}`, maxW, shape === 'tall' ? 5 : 4, Math.round(Math.min(W, H) * (shape === 'tall' ? 0.11 : 0.105)), 40);
    const lh = t.size * 1.18;
    const bottom = H - pad;
    const top = bottom - lh * (t.lines.length - 1);
    ctx.fillStyle = fg; ctx.font = `900 ${t.size}px ${SANS}`;
    spaced(ctx, '0px');
    drawLines(ctx, t.lines, pad, top, lh);
    kicker(ctx, d.kicker, pad, top - t.size - pad * 0.35, Math.round(Math.min(W, H) * 0.028), accent, accent, true);
  }

  function editorial(ctx, d) {
    const { W, H, pad, img, pal, accent, shape } = d;
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
    let frame = null, text;
    if (shape === 'wide') {
      frame = { x: W * 0.53, y: pad, w: W * 0.47 - pad, h: H - pad * 2 };
      text = { x: pad, y: pad, w: W * 0.53 - pad * 1.8, h: H - pad * 2 };
    } else {
      const fh = shape === 'tall' ? H * 0.52 : H * 0.5;
      frame = { x: pad, y: pad, w: W - pad * 2, h: fh - pad };
      text = { x: pad, y: fh + pad * 0.6, w: W - pad * 2, h: H - fh - pad * 1.6 };
    }
    if (img) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
      ctx.fillStyle = pal.bg; ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
      ctx.restore();
      drawCover(ctx, img, frame.x, frame.y, frame.w, frame.h, GRADE.editorial);
      // 強調色的角框
      const c = Math.min(frame.w, frame.h) * 0.16, lw = Math.max(4, W * 0.003), o = lw * 6;
      ctx.strokeStyle = accent; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(frame.x - o, frame.y + frame.h - c); ctx.lineTo(frame.x - o, frame.y + frame.h + o); ctx.lineTo(frame.x - o + c, frame.y + frame.h + o); ctx.stroke();
    } else {
      text = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };
    }
    const ks = Math.round(Math.min(W, H) * 0.024);
    const start = Math.min(W, H) * (!img ? 0.11 : shape === 'tall' ? 0.1 : 0.085);
    const t = fit(ctx, d.title, (s) => `900 ${s}px ${SERIF}`, text.w, shape === 'wide' ? 5 : 4, Math.round(start), 36);
    const lh = t.size * 1.28;
    const blockH = ks * 2.6 + lh * t.lines.length;
    const y0 = text.y + Math.max(0, (text.h - blockH) / 2);
    ctx.fillStyle = accent; ctx.fillRect(text.x, y0, ks * 3, Math.max(3, ks * 0.12));
    if (d.kicker) {
      ctx.save();
      ctx.fillStyle = pal.fg; ctx.font = `600 ${ks}px ${SANS}`; spaced(ctx, Math.round(ks * 0.32) + 'px');
      ctx.textBaseline = 'middle'; ctx.fillText(d.kicker.toUpperCase(), text.x + ks * 3.8, y0 + 2);
      ctx.restore();
    }
    ctx.fillStyle = pal.fg; ctx.font = `900 ${t.size}px ${SERIF}`;
    drawLines(ctx, t.lines, text.x, y0 + ks * 2.6 + t.size, lh);
  }

  function impact(ctx, d) {
    const { W, H, pad, img, pal, accent, shape, number } = d;
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
    let text = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };
    if (img) {
      let r;
      if (shape === 'wide') { r = { x: 0, y: 0, w: W * 0.46, h: H }; text = { x: W * 0.46 + pad, y: pad, w: W * 0.54 - pad * 2, h: H - pad * 2 }; }
      else { const ih = shape === 'tall' ? H * 0.46 : H * 0.48; r = { x: 0, y: 0, w: W, h: ih }; text = { x: pad, y: ih + pad * 0.8, w: W - pad * 2, h: H - ih - pad * 1.8 }; }
      drawCover(ctx, img, r.x, r.y, r.w, r.h, GRADE.impact);
      ctx.save();
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.4; ctx.fillStyle = accent;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.restore();
      ctx.fillStyle = accent;
      if (shape === 'wide') ctx.fillRect(r.w - 10, 0, 10, H); else ctx.fillRect(0, r.h - 10, W, 10);
    }
    const ks = Math.round(Math.min(W, H) * 0.026);
    const t = fit(ctx, d.title, (s) => `800 ${s}px ${SANS}`, text.w, number ? 3 : 4, Math.round(Math.min(W, H) * (number ? 0.06 : 0.095)), 34);
    const lh = t.size * 1.2;
    // 大數字吃掉剩下的高度；放不下就不放
    let numH = 0, n = null;
    if (number) {
      const room = text.h - ks * 4 - lh * t.lines.length;
      const start = Math.min(Math.round(Math.min(W, H) * (img ? 0.26 : 0.32)), Math.floor(room / 0.95));
      if (start >= 60) {
        n = fit(ctx, number, (s) => `900 ${s}px ${NUM}`, text.w, 1, start, 60);
        numH = n.size * 0.95;
      }
    }
    // 數字一定附上它代表什麼，避免沒有脈絡的數字
    const capSize = Math.round(ks * 1.25);
    const capH = n && d.numberCaption ? capSize * 1.9 : 0;
    const blockH = ks * 2.4 + (numH ? numH + ks * 1.6 + capH : 0) + lh * t.lines.length;
    let y = text.y + Math.max(0, (text.h - blockH) / 2);
    kicker(ctx, d.kicker, text.x, y + ks, ks, accent, accent, false);
    y += ks * 2.4;
    if (n) {
      ctx.save();
      ctx.fillStyle = accent; ctx.font = `900 ${n.size}px ${NUM}`; spaced(ctx, Math.round(-n.size * 0.05) + 'px');
      ctx.textBaseline = 'top'; ctx.fillText(n.lines[0], text.x - n.size * 0.04, y);
      ctx.restore();
      y += numH + ks * 0.6;
      if (capH) {
        ctx.save();
        ctx.fillStyle = pal.mute; ctx.font = `600 ${capSize}px ${SANS}`; ctx.textBaseline = 'top';
        const cap = charWrap(ctx, d.numberCaption, text.w)[0] || '';
        ctx.fillText(cap, text.x, y);
        ctx.restore();
        y += capH;
      }
      y += ks * 1.0;
    }
    ctx.fillStyle = pal.fg; ctx.font = `800 ${t.size}px ${SANS}`;
    drawLines(ctx, t.lines, text.x, y + t.size * 0.9, lh);
  }

  /* 封面使用的圖片：封面指定 → 主角圖 → 使用者標星 → 第一頁的圖 */
  P.coverHero = function (deck) {
    const ok = (id) => id && P.Assets.get(id) ? id : '';
    if (deck.cover.hero === 'none') return ''; // 使用者選了「無圖」
    return ok(deck.cover.hero) || ok(deck.hero) || ok(P.Assets.hero()) || ok((deck.slides.find((s) => s.media) || {}).media) || '';
  };

  P.drawCover = async function (canvas, deck, formatKey) {
    const f = P.COVER_FORMATS[formatKey] || P.COVER_FORMATS['16x9'];
    canvas.width = f.w; canvas.height = f.h;
    const ctx = canvas.getContext('2d');
    const heroId = P.coverHero(deck);
    const img = heroId ? await loadImage(P.Assets.url(heroId)) : null;
    const numSlide = deck.meta.template === 'impact' ? deck.slides.find((s) => s.layout === 'bignumber' && s.number) : null;
    const title = deck.cover.title || (deck.slides[0] && (deck.slides[0].title || deck.slides[0].quote)) || deck.distill.bigIdea || deck.meta.title;
    await ensureFonts(title + deck.cover.kicker);
    const W = f.w, H = f.h;
    const d = {
      W, H, img, title, kicker: deck.cover.kicker,
      pad: Math.round(Math.min(W, H) * 0.085),
      pal: PALETTE[deck.meta.theme] || PALETTE.dark,
      accent: deck.meta.accent,
      shape: W > H * 1.2 ? 'wide' : H > W * 1.2 ? 'tall' : 'square',
      number: numSlide ? numSlide.number : '',
      numberCaption: numSlide ? numSlide.title : '',
    };
    ctx.clearRect(0, 0, W, H);
    ({ keynote, editorial, impact })[deck.meta.template in P.TEMPLATES ? deck.meta.template : 'keynote'](ctx, d);
    return canvas;
  };

  P.downloadCover = async function (deck, formatKey) {
    const canvas = await P.drawCover(document.createElement('canvas'), deck, formatKey);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(deck.meta.title || 'cover').replace(/[\\/:*?"<>|\s]/g, '_')}-封面-${formatKey}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  };
})();
