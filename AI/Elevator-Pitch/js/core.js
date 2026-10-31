/* ==========================================================================
   core.js — 命名空間、資料模型、字數計算、通用工具
   不使用 ES Modules，讓 index.html 可直接以 file:// 開啟。
   ========================================================================== */
(function () {
  'use strict';

  const P = (window.Pitch = window.Pitch || {});

  /* ---------- 常數 ---------- */

  P.DURATIONS = [
    { sec: 30, label: '30 秒' },
    { sec: 60, label: '60 秒' },
    { sec: 90, label: '90 秒' },
    { sec: 180, label: '3 分鐘' },
    { sec: 300, label: '5 分鐘' },
    { sec: 600, label: '10 分鐘' },
  ];

  // 「自動」：交給 AI 依內容判斷；離線草稿則不強加行動呼籲
  P.AUDIENCES = ['自動', '投資人', '主管', '客戶', '一般大眾', '同事 / 團隊'];
  P.PURPOSES = ['自動', '說服', '募資', '介紹', '教育', '啟發'];
  P.DEFAULT_INPUT = { text: '', duration: 60, audience: '自動', purpose: '自動', lang: 'zh-Hant' };
  P.LANGS = [
    { id: 'zh-Hant', label: '繁體中文' },
    { id: 'en', label: 'English' },
  ];

  /* 每一頁在短講中的角色 */
  P.SECTIONS = {
    hook: { label: 'Hook', zh: '抓住注意力' },
    problem: { label: 'Context', zh: '建立情境' },
    insight: { label: 'Core', zh: '傳達核心' },
    solution: { label: 'How', zh: '提出做法' },
    impact: { label: 'Proof', zh: '讓想法具體' },
    closing: { label: 'Close', zh: '留下記憶' },
  };

  /* 每種版型會顯示哪些欄位（決定字數計算與編輯器欄位） */
  P.LAYOUTS = {
    statement: { label: 'Statement　全幅主張', fields: ['kicker', 'title', 'subtitle', 'points'] },
    question: { label: 'Question　大型提問', fields: ['kicker', 'title', 'subtitle'] },
    contrast: { label: 'Contrast　左右對比', fields: ['kicker', 'title', 'left', 'right'] },
    bignumber: { label: 'Big Number　數字焦點', fields: ['kicker', 'number', 'title', 'subtitle'] },
    story: { label: 'Story　圖像故事', fields: ['kicker', 'title', 'subtitle', 'image'] },
    diagram: { label: 'Diagram　流程圖', fields: ['kicker', 'title', 'steps', 'subtitle'] },
    quote: { label: 'Quote　金句', fields: ['quote', 'by'] },
    closing: { label: 'Closing　強力收尾', fields: ['title', 'subtitle', 'cta'] },
  };

  P.THEMES = [
    { id: 'dark', label: '深黑' },
    { id: 'charcoal', label: '炭灰' },
    { id: 'paper', label: '米白' },
  ];

  P.DEFAULT_ACCENT = '#ff4a36';

  /* 三種模板：決定背景主題、字體性格，以及圖片怎麼出現在每一頁 */
  P.TEMPLATES = {
    keynote: {
      label: '發表會', en: 'Keynote', theme: 'dark',
      desc: '黑底、巨大字、主角圖滿版。自信、高級。',
      fit: '產品、募資',
      media: ['statement', 'question', 'bignumber', 'quote', 'closing', 'contrast', 'diagram', 'story'],
    },
    editorial: {
      label: '雜誌', en: 'Editorial', theme: 'paper',
      desc: '米白底、襯線標題、圖文不對稱排版。有質感、可信。',
      fit: '品牌故事、個人分享',
      media: ['statement', 'question', 'bignumber', 'quote', 'closing', 'story'],
    },
    impact: {
      label: '數據焦點', en: 'Impact', theme: 'charcoal',
      desc: '炭灰底、大數字、左右切割的圖片。有說服力。',
      fit: '成果報告、提案',
      media: ['statement', 'question', 'bignumber', 'quote', 'closing', 'contrast', 'story'],
    },
  };
  P.mediaShown = function (template, layout) {
    const t = P.TEMPLATES[template] || P.TEMPLATES.keynote;
    return t.media.includes(layout);
  };

  P.COVER_FORMATS = {
    '16x9': { label: '16:9', w: 1920, h: 1080, use: '簡報 / YouTube' },
    '1x1': { label: '1:1', w: 1080, h: 1080, use: 'IG 貼文 / LinkedIn' },
    '9x16': { label: '9:16', w: 1080, h: 1920, use: '限時動態 / Reels' },
  };

  /* 語言相關的限制與語速 */
  P.langRules = function (lang) {
    if (lang === 'en') {
      return {
        slideLimit: 45, // 英文以「字」計
        titleMin: 3, titleMax: 10,
        subtitleMax: 18, bodyMax: 25, bigIdeaMax: 15,
        rate: 2.4, // words / second（約 145 wpm）
        unit: 'words',
      };
    }
    return {
      slideLimit: 100,
      titleMin: 5, titleMax: 15,
      subtitleMax: 30, bodyMax: 40, bigIdeaMax: 30,
      rate: 4, // 字 / 秒（約 240 字 / 分，自然口語）
      unit: '字',
    };
  };

  /* 依演講時間建議頁數（AI 依內容在範圍內自行決定） */
  /* 短講預設 3–5 頁：每頁都要有自己的角色，不為了湊頁數拆頁 */
  P.recommendSlides = function (sec) {
    if (sec <= 30) return { min: 3, max: 3 };
    if (sec <= 60) return { min: 3, max: 5 };
    if (sec <= 90) return { min: 4, max: 6 };
    if (sec <= 180) return { min: 6, max: 9 };
    if (sec <= 300) return { min: 9, max: 12 };
    return { min: 14, max: 18 };
  };

  /* ---------- 字數計算 ----------
     規則：中日韓文字每字計 1；英文單字或數字串整體計 1；標點與空白不計。 */
  const UNIT_RE = /[㐀-鿿豈-﫿぀-ヿ가-힯]|[A-Za-z0-9][A-Za-z0-9'’.\-%+]*/g;

  P.countUnits = function (s) {
    if (!s) return 0;
    const m = String(s).match(UNIT_RE);
    return m ? m.length : 0;
  };

  /* 依字數單位截短，優先停在標點處，不加任何新字 */
  P.clip = function (s, max) {
    s = String(s || '').trim();
    if (P.countUnits(s) <= max) return s;
    UNIT_RE.lastIndex = 0;
    let n = 0, cut = s.length, m;
    const re = new RegExp(UNIT_RE.source, 'g');
    while ((m = re.exec(s))) {
      n++;
      if (n === max) { cut = m.index + m[0].length; break; }
    }
    let out = s.slice(0, cut);
    const punct = /[，。、；：！？,.;:!?—]/g;
    let last = -1, pm;
    while ((pm = punct.exec(out))) last = pm.index;
    if (last > 0 && P.countUnits(out.slice(0, last)) >= Math.ceil(max * 0.55)) out = out.slice(0, last);
    return out.replace(/[，、；：,;:\s—]+$/, '');
  };

  /* 取出一張投影片「觀眾看得到」的所有文字 */
  P.visibleTexts = function (slide) {
    const L = P.LAYOUTS[slide.layout] || P.LAYOUTS.statement;
    const out = [];
    L.fields.forEach((f) => {
      if (f === 'image') return;
      if (f === 'points') (slide.points || []).forEach((p) => out.push(p));
      else if (f === 'steps') (slide.steps || []).forEach((st) => { out.push(st.label); out.push(st.text); });
      else if (f === 'left' || f === 'right') { const side = slide[f] || {}; out.push(side.label); out.push(side.text); }
      else out.push(slide[f]);
    });
    return out.filter(Boolean);
  };

  P.slideUnits = function (slide) {
    return P.visibleTexts(slide).reduce((a, t) => a + P.countUnits(t), 0);
  };

  /* 講稿去掉停頓標記後估算秒數 */
  P.scriptSeconds = function (script, lang) {
    const r = P.langRules(lang);
    const clean = String(script || '').replace(/（停頓）|\(pause\)/gi, '');
    const pauses = (String(script || '').match(/（停頓）|\(pause\)/gi) || []).length;
    return P.countUnits(clean) / r.rate + pauses * 0.8;
  };

  /* ---------- 資料模型 ---------- */

  let seq = 0;
  P.uid = function () {
    seq++;
    return 's' + Date.now().toString(36) + seq.toString(36) + Math.random().toString(36).slice(2, 5);
  };

  P.blankSlide = function (layout) {
    return {
      id: P.uid(),
      layout: layout || 'statement',
      section: 'insight',
      kicker: '',
      title: '',
      subtitle: '',
      points: [],
      number: '',
      left: { label: '', text: '' },
      right: { label: '', text: '' },
      steps: [],
      quote: '',
      by: '',
      cta: '',
      image: '',
      media: '', // 圖片素材 id（優先於 image 網址）
      focus: '', // 圖片焦點（object-position），空字串＝置中
      visual: '',
      notes: { message: '', script: '', transition: '', seconds: 8 },
    };
  };

  /* 把任何來源（AI、匯入檔、舊版）轉成完整結構 */
  P.normalizeSlide = function (raw) {
    const s = P.blankSlide();
    if (!raw || typeof raw !== 'object') return s;
    const str = (v) => (v == null ? '' : String(v).trim());
    s.id = str(raw.id) || s.id;
    s.layout = P.LAYOUTS[raw.layout] ? raw.layout : 'statement';
    s.section = P.SECTIONS[raw.section] ? raw.section : 'insight';
    ['kicker', 'title', 'subtitle', 'number', 'quote', 'by', 'cta', 'image', 'media', 'focus', 'visual'].forEach((k) => (s[k] = str(raw[k])));
    s.points = Array.isArray(raw.points) ? raw.points.map(str).filter(Boolean) : [];
    s.steps = Array.isArray(raw.steps)
      ? raw.steps.map((st) => (typeof st === 'string' ? { label: str(st), text: '' } : { label: str(st && st.label), text: str(st && st.text) })).filter((st) => st.label || st.text)
      : [];
    ['left', 'right'].forEach((k) => {
      const v = raw[k] || {};
      s[k] = { label: str(v.label), text: str(v.text) };
    });
    const n = raw.notes || {};
    s.notes = {
      message: str(n.message),
      script: str(n.script),
      transition: str(n.transition),
      seconds: Math.max(1, Math.round(Number(n.seconds) || 8)),
    };
    return s;
  };

  P.normalizeDeck = function (raw, fallbackMeta) {
    raw = raw || {};
    const m = Object.assign({}, fallbackMeta || {}, raw.meta || {});
    const d = raw.distill || {};
    const c = raw.cover || {};
    const str = (v) => (v == null ? '' : String(v).trim());
    const template = P.TEMPLATES[m.template] ? m.template : 'keynote';
    return {
      version: 2,
      hero: str(raw.hero),
      cover: {
        title: str(c.title),
        kicker: str(c.kicker),
        hero: str(c.hero),
        format: P.COVER_FORMATS[c.format] ? c.format : '16x9',
      },
      meta: {
        template,
        title: str(m.title) || '未命名演講',
        duration: Number(m.duration) || 60,
        audience: str(m.audience) || '自動',
        purpose: str(m.purpose) || '自動',
        lang: m.lang === 'en' ? 'en' : 'zh-Hant',
        theme: P.THEMES.some((t) => t.id === m.theme) ? m.theme : P.TEMPLATES[template].theme,
        accent: /^#[0-9a-f]{6}$/i.test(m.accent || '') ? m.accent : P.DEFAULT_ACCENT,
        source: str(m.source) || 'manual',
      },
      distill: {
        bigIdea: str(d.bigIdea),
        problem: str(d.problem),
        insight: str(d.insight),
        takeaway: str(d.takeaway),
        narrative: ['invitation', 'story', 'product', 'insight', 'introduction'].includes(d.narrative) ? d.narrative : 'insight',
        audienceNeed: str(d.audienceNeed),
        uniqueValue: str(d.uniqueValue),
        action: str(d.action),
        evidence: Array.isArray(d.evidence) ? d.evidence.map(str).filter(Boolean).slice(0, 5) : [],
        storyline: Array.isArray(d.storyline)
          ? d.storyline.map((b) => ({ section: P.SECTIONS[b && b.section] ? b.section : 'insight', beat: str(b && b.beat) })).filter((b) => b.beat)
          : [],
      },
      slides: (Array.isArray(raw.slides) ? raw.slides : []).map(P.normalizeSlide),
    };
  };

  /* 讓各頁秒數總和等於目標時間（保留相對比例） */
  P.fitSeconds = function (deck, weights) {
    const target = deck.meta.duration;
    const slides = deck.slides;
    if (!slides.length) return;
    const w = weights || slides.map((s) => Math.max(1, s.notes.seconds || 1));
    const sum = w.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    slides.forEach((s, i) => {
      s.notes.seconds = Math.max(2, Math.round((w[i] / sum) * target));
      acc += s.notes.seconds;
    });
    // 把四捨五入誤差補在最長的那頁
    const diff = target - acc;
    if (diff) {
      let k = 0;
      slides.forEach((s, i) => { if (s.notes.seconds > slides[k].notes.seconds) k = i; });
      slides[k].notes.seconds = Math.max(2, slides[k].notes.seconds + diff);
    }
  };

  P.totalSeconds = function (deck) {
    return deck.slides.reduce((a, s) => a + (Number(s.notes.seconds) || 0), 0);
  };

  /* ---------- 通用工具 ---------- */

  P.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  P.fmtTime = function (sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  };

  P.fmtDuration = function (sec) {
    const d = P.DURATIONS.find((x) => x.sec === sec);
    if (d) return d.label;
    return sec < 120 ? sec + ' 秒' : Math.round(sec / 60) + ' 分鐘';
  };

  P.clone = (o) => JSON.parse(JSON.stringify(o));

  /* localStorage 包在 try/catch，私密視窗或被封鎖時仍可運作 */
  P.store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('pitch:' + key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('pitch:' + key, JSON.stringify(value)); } catch (e) { /* 忽略 */ }
    },
    remove(key) {
      try { localStorage.removeItem('pitch:' + key); } catch (e) { /* 忽略 */ }
    },
  };

  /* 從 AI 回覆中取出 JSON（容忍 ```json 包裝或前後說明文字） */
  P.extractJSON = function (text) {
    if (text && typeof text === 'object') return text;
    text = String(text || '').trim();
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) text = fence[1].trim();
    try { return JSON.parse(text); } catch (e) { /* 繼續嘗試 */ }
    const a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(text.slice(a, b + 1));
    throw new Error('找不到有效的 JSON 內容');
  };
})();
