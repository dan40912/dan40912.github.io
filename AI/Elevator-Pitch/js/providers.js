/* ==========================================================================
   providers.js — 可替換的 AI 介面
   每個 provider 都實作：generate(input, onStatus) → Promise<deck>
   API Key 永遠不會出現在前端：
     - local  ：離線規則式草稿（非 AI）
     - proxy  ：呼叫你自己部署的代理端點（Key 存在伺服器端，見 /proxy）
     - manual ：複製提示詞到任何 AI 對話，再把 JSON 貼回來
   新增供應商：P.registerProvider('id', { label, generate })
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;
  const providers = {};

  P.registerProvider = function (id, impl) { providers[id] = impl; };
  P.getProvider = function (id) { return providers[id] || providers.local; };
  P.listProviders = function () { return Object.keys(providers).map((id) => ({ id, label: providers[id].label })); };

  P.aiSettings = function () {
    return Object.assign({ provider: 'local', endpoint: '' }, P.store.get('ai', {}));
  };

  /* 依序把圖片分配到適合的頁面：主角圖放開場，其餘平均分散（規則式，不判斷圖意） */
  P.allocateMedia = function (deck, ids, heroId) {
    if (!ids || !ids.length || !deck.slides.length) return;
    const hero = heroId && ids.includes(heroId) ? heroId : ids[0];
    const rest = ids.filter((id) => id !== hero);
    deck.slides.forEach((s) => (s.media = ''));
    deck.slides[0].media = hero;
    const tpl = deck.meta.template;
    const slots = deck.slides.slice(1).filter((s) => P.mediaShown(tpl, s.layout) && s.layout !== 'contrast');
    if (slots.length && rest.length) {
      const step = slots.length / rest.length;
      rest.forEach((id, k) => {
        const s = slots[Math.min(slots.length - 1, Math.floor(k * step + step / 2))];
        if (s && !s.media) s.media = id;
      });
    }
    deck.hero = hero;
  };

  /* 把 AI 回覆中的 img1…img5 對應回實際的圖片 id */
  function applyAssets(deck, raw, input) {
    const ids = input.assetIds || [];
    const map = (v) => {
      const m = String(v || '').match(/img\s*(\d)/i);
      if (m) return ids[Number(m[1]) - 1] || '';
      return ids.includes(v) ? v : '';
    };
    const seen = new Set();
    deck.slides.forEach((s) => {
      s.media = map(s.media);
      if (s.media && seen.has(s.media)) s.media = '';
      if (s.media) seen.add(s.media);
    });
    (raw.assets || []).forEach((r) => {
      const id = map(r && r.id);
      const a = id && P.Assets.get(id);
      if (!a) return;
      const patch = {};
      if (!a.caption && r.caption && !/待補充/.test(r.caption)) patch.caption = String(r.caption).slice(0, 60);
      if (r.role) patch.role = String(r.role).slice(0, 10);
      P.Assets.update(id, patch);
    });
    if (ids.length && !seen.size) P.allocateMedia(deck, ids, input.heroId);
    deck.hero = input.heroId || map(raw.hero) || (deck.slides.find((s) => s.media) || {}).media || ids[0] || '';
  }

  /* 封面預設：開場那一句最吸睛 */
  P.defaultCover = function (deck) {
    const first = deck.slides[0] || {};
    const r = P.langRules(deck.meta.lang);
    if (!deck.cover.title) deck.cover.title = P.clip(first.title || first.quote || deck.distill.bigIdea, r.titleMax + 8);
    if (!deck.cover.kicker) deck.cover.kicker = P.clip(deck.meta.title, 10);
  };

  /* 共用：把 AI 的 JSON 變成合法簡報，跑品質審查，必要時自動修正 */
  P.finalizeDeck = function (raw, input, source) {
    const deck = P.normalizeDeck(raw, {
      duration: input.duration, audience: input.audience, purpose: input.purpose, lang: input.lang,
    });
    deck.meta.duration = input.duration;
    if (input.audience !== '自動') deck.meta.audience = input.audience;
    if (input.purpose !== '自動') deck.meta.purpose = input.purpose;
    deck.meta.lang = input.lang;
    deck.meta.source = source;
    if (!deck.slides.length) throw new Error('AI 回覆中沒有任何投影片');
    deck.slides.forEach((s, i) => { if (i === deck.slides.length - 1) s.notes.transition = ''; });
    applyAssets(deck, raw, input);
    P.defaultCover(deck);
    const fixes = P.autoFix(deck);
    return { deck, fixes };
  };

  /* ---------- 生成進度：四個步驟 ----------
     onStatus(step, detail)：step 0 找核心觀點、1 安排開場收尾、2 設計畫面、3 準備圖片與播放稿 */
  P.GEN_STEPS = ['正在找出這段內容的核心觀點', '正在安排短講的開場和收尾', '正在設計投影片畫面', '正在準備圖片與播放稿'];
  const tick = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- local ---------- */
  P.registerProvider('local', {
    label: '離線規則式草稿（不使用 AI）',
    async generate(input, onStatus) {
      const step = (i) => onStatus && onStatus(i);
      step(0); await tick(0);
      const deck = P.localGenerate(input);
      step(1); await tick(0);
      step(2); await tick(0);
      step(3);
      P.allocateMedia(deck, input.assetIds, input.heroId);
      P.defaultCover(deck);
      const fixes = P.autoFix(deck);
      await tick(0);
      const imgNote = (input.assetIds || []).length ? '圖片依上傳順序分配，主角圖放在開場。' : '';
      return { deck, fixes, note: '這是離線草稿：只重組你原文中的句子，沒有使用 AI。' + imgNote + '設定 AI 服務可以得到真正的觀點提煉與看圖配圖。' };
    },
  });

  /* ---------- proxy ----------
     請求：POST { system, messages:[{role,content}], task:'pitch-deck' }
     回應：{ text: "<模型輸出>" }（也接受直接回傳簡報 JSON） */
  async function callProxy(endpoint, system, messages, images) {
    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, messages, images: images || [], task: 'pitch-deck' }),
      });
    } catch (err) {
      throw new Error('連不到 AI 代理端點，請確認網址、網路，以及代理是否允許這個網站');
    }
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).error || ''; } catch (e) { /* 忽略 */ }
      throw new Error(`AI 代理回應 ${res.status}${detail ? '：' + detail : ''}`);
    }
    const data = await res.json();
    return typeof data.text === 'string' ? data.text : JSON.stringify(data);
  }

  P.registerProvider('proxy', {
    label: '自訂 AI 代理端點（推薦）',
    vision: true,
    async generate(input, onStatus) {
      const step = (i, d) => onStatus && onStatus(i, d);
      const { endpoint } = P.aiSettings();
      if (!endpoint) throw new Error('尚未設定 AI 代理端點，請到「AI 設定」填寫。');
      // 圖片縮到 1024px 再送出，只附在第一則訊息
      const images = [];
      for (const id of input.assetIds || []) {
        const url = await P.Assets.dataURL(id, 1024, 0.82);
        const m = url.match(/^data:(image\/[a-z]+);base64,(.*)$/);
        if (m) images.push({ media_type: m[1], data: m[2] });
      }
      const prompt = P.buildPrompt(Object.assign({}, input, { imagesAttached: images.length > 0 }));
      const messages = [{ role: 'user', content: prompt.user }];

      step(0, images.length ? `AI 正在閱讀內容與 ${images.length} 張圖片，通常需要 20–60 秒` : 'AI 正在閱讀內容，通常需要 20–60 秒');
      let text = await callProxy(endpoint, prompt.system, messages, images);
      let raw = P.extractJSON(text);
      step(1);

      // One bounded repair request. Keep unaffected pages and accept only improvements.
      const plan = P.planContent(input);
      raw.distill = Object.assign({ action: plan.action, evidence: plan.evidence, uniqueValue: plan.uniqueValue }, raw.distill || {});
      let deck = P.normalizeDeck(raw, input);
      deck.meta.duration = input.duration; deck.meta.lang = input.lang; if (input.purpose !== '自動') deck.meta.purpose = input.purpose;
      const report = P.qcDeck(deck);
      if (report.errors > 0 || report.warns > 0) {
        const pages = report.deck.length ? deck.slides.map((_, i) => i)
          : report.slides.flatMap((s, i) => s.issues.length ? [i] : []);
        step(2, `正在檢查敘事與時間，只修正 ${pages.length} 頁`);
        const request = {
          problems: P.qcProblems(deck, report),
          pages: pages.map((index) => ({ index, slide: deck.slides[index] })),
          core: deck.distill, duration: input.duration, lang: input.lang,
          outline: deck.slides.map((s, index) => ({ index, title: s.title || s.quote, section: s.section })),
        };
        const repair = `請只修正指定頁面，保留原文事實與行動邀請。index 從 0 開始；不得新增或刪除頁面。只輸出 {"replacements":[{"index":0,"slide":{完整單頁欄位}}]}。不要輸出整份簡報。問題與上下文：\n${JSON.stringify(request)}`;
        try {
          const reply = P.extractJSON(await callProxy(endpoint, prompt.system, [{ role: 'user', content: repair }], []));
          if (!Array.isArray(reply.replacements)) throw new Error('Invalid repair');
          const candidate = JSON.parse(JSON.stringify(deck));
          const changed = new Set();
          for (const patch of reply.replacements) {
            if (!Number.isInteger(patch.index) || !pages.includes(patch.index) || changed.has(patch.index) || !patch.slide || typeof patch.slide !== 'object' || Array.isArray(patch.slide)) throw new Error('Invalid page');
            const old = candidate.slides[patch.index];
            candidate.slides[patch.index] = Object.assign(P.normalizeSlide(patch.slide), { id: old.id, media: old.media, image: old.image, focus: old.focus });
            changed.add(patch.index);
          }
          const next = P.qcDeck(candidate);
          if (next.errors < report.errors || (next.errors === report.errors && next.warns < report.warns)) {
            raw.slides = candidate.slides;
          }
        } catch (e) { /* Keep the original on failed or malformed repair. */ }
      } else { step(2); }
      step(3);
      return P.finalizeDeck(raw, input, 'ai');
    },
  });

  /* ---------- 單頁微調（需要 AI 代理） ---------- */
  P.canAISlide = function () {
    const s = P.aiSettings();
    return s.provider === 'proxy' && !!s.endpoint;
  };
  P.aiSlide = async function (deck, index, mode) {
    const { endpoint } = P.aiSettings();
    const text = await callProxy(endpoint, P.SYSTEM_PROMPT, [{ role: 'user', content: P.buildSlidePrompt(deck, index, mode) }], []);
    let raw = P.extractJSON(text);
    if (raw && Array.isArray(raw.slides)) raw = raw.slides[0];
    const old = deck.slides[index];
    const s = P.normalizeSlide(raw);
    // 圖片、焦點與時間預算維持原樣，只換內容
    Object.assign(s, { id: old.id, media: old.media, focus: old.focus, image: old.image });
    s.notes.seconds = old.notes.seconds;
    return s;
  };

  /* ---------- manual ---------- 由 UI 處理複製與貼上，這裡只負責解析 */
  P.registerProvider('manual', {
    label: '手動：複製提示詞到任何 AI，再貼回結果',
    manual: true,
    async generate() { throw new Error('manual'); },
    parse(text, input) { return P.finalizeDeck(P.extractJSON(text), input, 'ai'); },
  });
})();
