/* ==========================================================================
   demo.js — 示範內容：一段雜亂筆記，以及它被蒸餾後的 60 秒簡報
   示範主題就是這個工具本身，因此沒有任何虛構的數據或人物。
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;

  P.DEMO_INPUT = {
    text: `我發現大部分人做簡報的方式都錯了。大家花很多時間把內容塞進投影片，每頁一大堆字，結果觀眾在台下忙著讀字，根本沒在聽講者說什麼。講完之後問他們記得什麼，通常什麼都說不出來。
其實問題不在設計，而是我們把簡報當成文件在做。文件是給人讀的，簡報是幫人記住的。
我想做一個工具：你把雜亂的筆記、文章丟進來，它先幫你找出你真正想講的一句話，再照觀眾理解的順序重新排，最後做成每頁不超過100字的投影片，還附上逐頁講稿和時間配置。
目標是讓任何人都能在60秒內，把一個想法講清楚、講到讓人記住。適合要募資的創業者、要跟主管提案的人、要上台分享的人。`,
    duration: 60,
    audience: '一般大眾',
    purpose: '說服',
    lang: 'zh-Hant',
  };

  const S = (o) => P.normalizeSlide(o);

  /* ---------- 示範插圖（程式繪製，不是照片） ---------- */
  function rng(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function toBlob(c) { return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9)); }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

  /* 1. 塞滿文字的投影片 */
  function crammed() {
    const c = canvas(1600, 1000), x = c.getContext('2d'), R = rng(7);
    const g = x.createLinearGradient(0, 0, 1600, 1000);
    g.addColorStop(0, '#3a3b40'); g.addColorStop(1, '#1d1e21');
    x.fillStyle = g; x.fillRect(0, 0, 1600, 1000);
    x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 60; x.shadowOffsetY = 30;
    x.fillStyle = '#fafafa'; x.fillRect(150, 110, 1300, 780); x.restore();
    x.fillStyle = '#1f3a8a'; x.fillRect(150, 110, 1300, 90);
    x.fillStyle = '#fff'; x.fillRect(190, 140, 520, 30);
    for (let col = 0; col < 2; col++) {
      for (let i = 0; i < 17; i++) {
        const bx = 190 + col * 430, by = 240 + i * 36;
        x.fillStyle = '#1f3a8a'; x.fillRect(bx, by + 6, 10, 10);
        x.fillStyle = i % 4 === 0 ? '#555' : '#9a9a9a';
        x.fillRect(bx + 22, by + 4, 220 + R() * 160, 12);
      }
    }
    // 密密麻麻的表格與圖表
    x.strokeStyle = '#bbb'; x.lineWidth = 2;
    for (let r = 0; r < 9; r++) for (let k = 0; k < 4; k++) x.strokeRect(1070 + k * 85, 240 + r * 34, 85, 34);
    for (let k = 0; k < 9; k++) { const h = 40 + R() * 160; x.fillStyle = ['#1f3a8a', '#d33', '#e9a400'][k % 3]; x.fillRect(1080 + k * 36, 840 - h, 24, h); }
    x.fillStyle = '#d33'; x.fillRect(1380, 125, 50, 50);
    return c;
  }

  /* 2. 散落的便利貼筆記 */
  function notes() {
    const c = canvas(1600, 1000), x = c.getContext('2d'), R = rng(23);
    x.fillStyle = '#e8e2d4'; x.fillRect(0, 0, 1600, 1000);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(0,0,0,${R() * 0.035})`; x.fillRect(R() * 1600, R() * 1000, 2, 2); }
    const colors = ['#ffe36e', '#ffb3c1', '#a7d8ff', '#c6f1a3', '#ffe36e', '#ffd28a', '#a7d8ff'];
    const spots = [[260, 250], [640, 190], [1040, 260], [1330, 420], [420, 640], [820, 580], [1180, 720]];
    spots.forEach(([cx, cy], i) => {
      x.save(); x.translate(cx, cy); x.rotate((R() - 0.5) * 0.5);
      x.shadowColor = 'rgba(0,0,0,.22)'; x.shadowBlur = 24; x.shadowOffsetY = 12;
      x.fillStyle = colors[i]; x.fillRect(-150, -150, 300, 300);
      x.shadowColor = 'transparent';
      x.strokeStyle = 'rgba(30,30,40,.78)'; x.lineWidth = 6; x.lineCap = 'round';
      for (let l = 0; l < 4; l++) {
        const y = -90 + l * 52, len = 140 + R() * 90;
        x.beginPath(); x.moveTo(-110, y);
        for (let s = 0; s <= len; s += 18) x.lineTo(-110 + s, y + Math.sin(s / 9 + l) * 6 + (R() - 0.5) * 5);
        x.stroke();
      }
      x.restore();
    });
    // 箭頭與圈選
    x.strokeStyle = '#d6332a'; x.lineWidth = 7; x.lineCap = 'round';
    x.beginPath(); x.moveTo(470, 360); x.quadraticCurveTo(600, 470, 720, 520); x.stroke();
    x.beginPath(); x.moveTo(700, 490); x.lineTo(722, 522); x.lineTo(684, 528); x.stroke();
    x.beginPath(); x.ellipse(1330, 420, 200, 190, 0.2, 0.3, Math.PI * 1.9); x.stroke();
    return c;
  }

  /* 3. 只有一句話的投影片 */
  function oneIdea() {
    const c = canvas(1600, 1000), x = c.getContext('2d');
    const g = x.createRadialGradient(800, 380, 60, 800, 500, 900);
    g.addColorStop(0, '#3a3a3f'); g.addColorStop(1, '#09090a');
    x.fillStyle = g; x.fillRect(0, 0, 1600, 1000);
    x.save(); x.shadowColor = 'rgba(255,255,255,.12)'; x.shadowBlur = 90;
    x.fillStyle = '#050505'; x.fillRect(260, 170, 1080, 608); x.restore();
    x.fillStyle = '#f5f3ef'; rr(x, 380, 420, 640, 64, 14); x.fill();
    x.fillStyle = '#ff4a36'; x.beginPath(); x.arc(1110, 452, 30, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#5a5a5a'; rr(x, 380, 520, 360, 22, 11); x.fill();
    // 講者剪影
    x.fillStyle = '#000';
    x.beginPath(); x.arc(800, 880, 60, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(800, 1060, 170, 140, 0, 0, Math.PI * 2); x.fill();
    return c;
  }

  P.demoAssets = async function () {
    const list = [
      { id: 'demo1', make: crammed, caption: '示範插圖：塞滿文字的投影片', role: '場景', hero: true },
      { id: 'demo2', make: notes, caption: '示範插圖：散落的便利貼筆記', role: '場景' },
      { id: 'demo3', make: oneIdea, caption: '示範插圖：只有一句話的投影片', role: '對比' },
    ];
    return Promise.all(list.map(async (a) => {
      const c = a.make();
      return { id: a.id, blob: await toBlob(c), w: c.width, h: c.height, caption: a.caption, role: a.role, hero: !!a.hero };
    }));
  };

  P.demoDeck = function () {
    const deck = P.normalizeDeck({
      hero: 'demo1',
      cover: { title: '你上一次記住一張投影片，是什麼時候？', kicker: '簡報是幫人記住的' },
      meta: {
        title: '簡報是幫人記住的',
        duration: 60, audience: '一般大眾', purpose: '說服', lang: 'zh-Hant',
        theme: 'dark', accent: P.DEFAULT_ACCENT, source: 'demo',
      },
      distill: {
        bigIdea: '簡報不是給人讀的，是幫人記住的',
        problem: '投影片塞滿文字，觀眾忙著讀，講完什麼也記不住。',
        insight: '問題不在設計，而是我們把簡報當成文件在做。',
        takeaway: '一頁只留一個想法。',
        storyline: [
          { section: 'hook', beat: '用提問讓觀眾回想：自己記住過哪張投影片？' },
          { section: 'problem', beat: '點出矛盾：字越多，觀眾記得越少。' },
          { section: 'insight', beat: '翻轉認知：文件給人讀，簡報幫人記。' },
          { section: 'solution', beat: '讓想法具體：丟進筆記，三步變成演講。' },
          { section: 'closing', beat: '呼應開場的「記住」，並請觀眾立即行動。' },
        ],
      },
      slides: [
        S({
          section: 'hook', layout: 'question', media: 'demo1',
          title: '你上一次記住一張投影片，是什麼時候？',
          visual: '純黑背景，問題置中，大量留白。',
          notes: {
            message: '讓觀眾先想起自己的經驗。',
            script: '想一想。（停頓）你上一次記住別人的投影片，是什麼時候？',
            transition: '大多數人都想不起來，原因很簡單。',
            seconds: 6,
          },
        }),
        S({
          section: 'problem', layout: 'statement', kicker: '問題',
          title: '觀眾忙著讀字，就沒在聽你說話',
          subtitle: '一頁塞滿資訊，講完之後，台下什麼也記不住。',
          visual: '標題靠左，副標以低對比灰色呈現。',
          notes: {
            message: '字越多，觀眾記得越少。',
            script: '我們把內容塞滿投影片。（停頓）結果觀眾忙著讀字，沒在聽你說話；講完一問，什麼都不記得。',
            transition: '但問題，其實不在設計。',
            seconds: 9,
          },
        }),
        S({
          section: 'insight', layout: 'contrast', kicker: '洞察',
          title: '我們把簡報，當成了文件',
          left: { label: '文件', text: '給人閱讀，越完整越好' },
          right: { label: '簡報', text: '幫人記住，一頁一個想法' },
          visual: '左側低對比，右側使用強調色，形成選擇感。',
          notes: {
            message: '文件與簡報的目的完全不同。',
            script: '問題不在設計。（停頓）文件是給人讀的，越完整越好；簡報是幫人記住的，一頁只該留一個想法。',
            transition: '所以我做了一個工具，幫你完成這個轉換。',
            seconds: 10,
          },
        }),
        S({
          section: 'solution', layout: 'diagram', kicker: '解法', media: 'demo2',
          title: '丟進雜亂筆記，拿回一場演講',
          steps: [
            { label: '蒸餾', text: '找出你真正想說的一句話' },
            { label: '重組', text: '照觀眾理解的順序重排' },
            { label: '呈現', text: '每頁一個想法，附講稿' },
          ],
          visual: '三個節點由左至右，以細線連接，依序出現。',
          notes: {
            message: '三個步驟，把原始想法變成演講。',
            script: '把筆記丟進來，它先找出你真正想說的那一句話，（停頓）再照觀眾的理解順序重排，最後變成簡報和逐頁講稿。',
            transition: '所以，下一次上台之前——',
            seconds: 11,
          },
        }),
        S({
          section: 'closing', layout: 'closing', media: 'demo3',
          title: '下一場演講，只留一個想法',
          subtitle: '創業者、提案者、分享者，都能在 60 秒內講清楚。',
          cta: '貼上你的筆記，開始排練',
          visual: '呼應第一頁的極簡構圖，CTA 以強調色膠囊按鈕呈現。',
          notes: {
            message: '呼應開場，請觀眾立即行動。',
            script: '問問自己：（停頓）如果觀眾只能記住一件事，會是什麼？現在，就把你的筆記貼進來。',
            transition: '',
            seconds: 8,
          },
        }),
      ],
    });
    // 依講稿長度分配 60 秒
    P.fitSeconds(deck, deck.slides.map((x) => Math.max(3, P.scriptSeconds(x.notes.script, 'zh-Hant'))));
    return deck;
  };
})();
