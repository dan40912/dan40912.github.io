/* ==========================================================================
   app.js — 介面控制：素材 → 預覽與微調 → 播放或下載
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const e = P.esc;
  const tick = (ms) => new Promise((r) => setTimeout(r, ms));

  const state = {
    view: 'input',
    input: Object.assign({}, P.DEFAULT_INPUT, P.store.get('input', {})),
    deck: null,
    current: 0,
    tab: 'slide',
    note: null,
  };

  const savedDeck = P.store.get('deck', null);
  if (savedDeck && Array.isArray(savedDeck.slides)) state.deck = P.normalizeDeck(savedDeck);

  /* ======================================================================
     儲存與復原 / 重做
     ====================================================================== */
  let saveTimer = 0;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      P.store.set('input', state.input);
      if (state.deck) P.store.set('deck', state.deck); else P.store.remove('deck');
    }, 250);
  }

  const hist = { stack: [], i: -1, timer: 0 };
  function save() { persist(); snapshot(); }
  function resetHistory() {
    clearTimeout(hist.timer);
    hist.stack = state.deck ? [JSON.stringify(state.deck)] : [];
    hist.i = hist.stack.length - 1;
    updateUndo();
  }
  function takeSnapshot() {
    hist.timer = 0;
    if (!state.deck) return;
    const s = JSON.stringify(state.deck);
    if (s === hist.stack[hist.i]) return;
    hist.stack = hist.stack.slice(0, hist.i + 1);
    hist.stack.push(s);
    if (hist.stack.length > 100) hist.stack.shift();
    hist.i = hist.stack.length - 1;
    updateUndo();
  }
  function snapshot() { clearTimeout(hist.timer); hist.timer = setTimeout(takeSnapshot, 400); }
  function flushSnapshot() { if (hist.timer) { clearTimeout(hist.timer); takeSnapshot(); } }
  function restore() {
    state.deck = P.normalizeDeck(JSON.parse(hist.stack[hist.i]));
    state.current = Math.min(state.current, state.deck.slides.length - 1);
    persist();
    updateUndo();
    if (state.view === 'edit') renderEdit();
    if (state.view === 'share') renderShare();
  }
  function undo() { flushSnapshot(); if (hist.i > 0) { hist.i--; restore(); toast('已復原'); } }
  function redo() { flushSnapshot(); if (hist.i < hist.stack.length - 1) { hist.i++; restore(); toast('已重做'); } }
  function updateUndo() {
    const u = $('#btn-undo'), r = $('#btn-redo');
    if (u) u.disabled = hist.i <= 0;
    if (r) r.disabled = hist.i >= hist.stack.length - 1;
  }

  /* ---------- 提示訊息 ---------- */
  let toastTimer = 0;
  function toast(msg, isErr) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('err', !!isErr);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), isErr ? 4200 : 2400);
  }

  function mountStages(container) {
    (container._disposers || []).forEach((d) => d());
    container._disposers = $$('.stage', container).map((st) => P.fitStage(st));
  }

  const roleOf = (s) => P.SECTIONS[s.section].zh;

  /* ======================================================================
     導覽：三個階段
     ====================================================================== */
  function go(view) {
    if (view !== 'input' && !state.deck) { toast('先提供素材，生成你的短講'); view = 'input'; }
    closePicker();
    state.view = view;
    $$('.view').forEach((v) => v.classList.toggle('active', v.dataset.view === view));
    $$('.step').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    if (view === 'input') renderInput();
    if (view === 'edit') renderEdit();
    if (view === 'share') renderShare();
    window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + view); } catch (err) { /* file:// 可能不允許 */ }
  }

  function refreshNav() {
    $$('.step').forEach((b) => (b.disabled = b.dataset.view !== 'input' && !state.deck));
    $('#btn-play').disabled = !state.deck;
  }

  function setDeck(deck) {
    state.deck = deck;
    state.current = 0;
    persist();
    resetHistory();
    refreshNav();
  }

  /* ======================================================================
     1. 素材
     ====================================================================== */
  function renderInput() {
    $('#in-text').value = state.input.text;
    renderCustom();
    renderAssets();
    updateInputMeta();
  }

  function renderCustom() {
    const i = state.input;
    $('#in-duration').innerHTML = P.DURATIONS.map((d) =>
      `<button type="button" role="radio" aria-checked="${d.sec === i.duration}" data-v="${d.sec}">${d.label}</button>`).join('');
    const isPreset = P.AUDIENCES.includes(i.audience);
    $('#in-audience').innerHTML = P.AUDIENCES.map((a) =>
      `<button type="button" role="radio" aria-checked="${a === i.audience}" data-v="${e(a)}">${e(a)}</button>`).join('');
    $('#in-audience-custom').value = isPreset ? '' : i.audience;
    $('#in-purpose').innerHTML = P.PURPOSES.map((p) =>
      `<button type="button" role="radio" aria-checked="${p === i.purpose}" data-v="${e(p)}">${e(p)}</button>`).join('');
    $('#in-lang').innerHTML = P.LANGS.map((l) => `<option value="${l.id}"${l.id === i.lang ? ' selected' : ''}>${l.label}</option>`).join('');
    renderEngine();
  }

  function updateInputMeta() {
    const i = state.input;
    const n = P.countUnits(i.text);
    const imgs = P.Assets.count;
    const dur = P.fmtDuration(i.duration);
    $('#in-count').textContent = [n ? `${n} 字` : '', imgs ? `${imgs} 張圖` : ''].filter(Boolean).join(' · ');
    $('#in-hint').textContent = (n > 0 && n < 40 && !imgs) || (!n && imgs && !P.Assets.list.some((a) => a.caption))
      ? (n ? '加上一句你想讓聽眾記得的話，結果會更聚焦。' : '替圖片寫一句說明，或加幾句文字，系統才知道你想說什麼。')
      : '';
    $('#hero-sub').textContent = `我會把它整理成一段約 ${dur}、可直接播放的短講。`;
    $('#go-meta').textContent = `約 ${dur} · 可直接播放 · 可匯出 HTML`;
    const custom = [i.duration !== 60 ? dur : '', i.audience !== '自動' ? i.audience : '', i.purpose !== '自動' ? i.purpose : '', i.lang === 'en' ? 'English' : ''].filter(Boolean);
    $('#custom-sum').textContent = custom.length ? custom.join(' · ') : '長度 60 秒，其他自動判斷';
  }

  function renderEngine() {
    const s = P.aiSettings();
    const on = s.provider === 'proxy' ? !!s.endpoint : s.provider === 'manual';
    $('#engine-dot').classList.toggle('on', on);
    $('#ai-dot').classList.toggle('on', on);
    $('#engine-text').textContent =
      s.provider === 'proxy' ? (s.endpoint ? 'AI 代理' : 'AI 代理（尚未填網址）') :
      s.provider === 'manual' ? '手動 AI（複製提示詞）' : '離線草稿（不使用 AI）';
    updateQuickBar();
  }

  function bindInput() {
    $('#in-text').addEventListener('input', (ev) => { state.input.text = ev.target.value; updateInputMeta(); persist(); });
    const seg = (id, key, cast) => $(id).addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-v]');
      if (!b) return;
      state.input[key] = cast ? cast(b.dataset.v) : b.dataset.v;
      $$('button', $(id)).forEach((x) => x.setAttribute('aria-checked', x === b));
      if (key === 'audience') $('#in-audience-custom').value = '';
      updateInputMeta(); persist();
    });
    seg('#in-duration', 'duration', Number);
    seg('#in-audience', 'audience');
    seg('#in-purpose', 'purpose');
    $('#in-audience-custom').addEventListener('input', (ev) => {
      const v = ev.target.value.trim();
      state.input.audience = v || '自動';
      $$('#in-audience button').forEach((x) => x.setAttribute('aria-checked', String(!v && x.dataset.v === '自動')));
      updateInputMeta(); persist();
    });
    $('#in-lang').addEventListener('change', (ev) => { state.input.lang = ev.target.value; updateInputMeta(); persist(); });
    $('#btn-generate').addEventListener('click', () => generate(false));
    $('#btn-demo').addEventListener('click', loadDemo);
    $('#btn-open').addEventListener('click', () => $('#file-import').click());
    $('#btn-clear').addEventListener('click', async () => {
      if ((state.input.text || P.Assets.count) && !confirm('清空文字與圖片？')) return;
      state.input.text = '';
      await P.Assets.clear();
      renderInput(); persist();
      $('#in-text').focus();
    });
    $('#btn-blank').addEventListener('click', () => {
      if (state.deck && !confirm('目前的簡報會被空白簡報取代，確定嗎？')) return;
      const s = P.blankSlide('question');
      s.section = 'hook';
      s.title = '在這裡寫下你的開場問題';
      setDeck(P.normalizeDeck({ meta: Object.assign({}, state.input, { title: '我的短講', source: 'manual' }), slides: [s] }));
      state.deck.slides[0].notes.seconds = state.input.duration;
      state.note = null;
      go('edit');
    });
  }

  async function loadDemo() {
    if ((P.Assets.count || state.deck) && !confirm('示範內容會取代目前的素材與簡報，確定嗎？')) return;
    state.input = Object.assign({}, P.DEFAULT_INPUT, P.DEMO_INPUT);
    await P.Assets.replaceWith(await P.demoAssets());
    persist();
    finishGeneration({ deck: P.demoDeck(), note: '這是示範：由「素材」頁的筆記與 3 張示範插圖生成。點投影片上的文字就能修改。' });
  }

  /* ---------- 圖片素材 ---------- */
  const ICON_STAR = '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICON_NONE = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M6.5 17.5l11-11"/></svg>';
  const ICON_PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

  function renderAssets() {
    const list = P.Assets.list;
    $('#asset-list').innerHTML = list.map((a, i) => `
      <li class="asset${a.hero ? ' is-hero' : ''}" data-id="${a.id}" data-i="${i}" draggable="true">
        <div class="asset-thumb">
          <img src="${e(a.url)}" alt="">
          <span class="asset-no">圖 ${i + 1}</span>
          <button type="button" class="asset-btn star${a.hero ? ' on' : ''}" data-act="hero" title="設為主角圖（開場與封面）" aria-pressed="${a.hero}">${ICON_STAR}</button>
          <button type="button" class="asset-btn del" data-act="del" title="移除">${ICON_X}</button>
        </div>
        <input class="input" data-cap value="${e(a.caption)}" placeholder="一句說明（選填）" maxlength="60" aria-label="圖 ${i + 1} 說明">
      </li>`).join('');
    $('#dropzone').hidden = list.length >= P.Assets.MAX;
  }

  async function addImages(files) {
    if (!files || !files.length) return null;
    if (P.Assets.count >= P.Assets.MAX) { toast('最多 5 張圖片'); return null; }
    try {
      const r = await P.Assets.add(files);
      if (r.skipped) toast(`只加入 ${r.added} 張，最多 5 張`);
      return r;
    } catch (err) { toast('無法讀取圖片：' + err.message, true); return null; }
  }

  /* 圖片被移除時，清掉簡報中對它的引用 */
  function syncDeckAssets() {
    if (!state.deck) return;
    let changed = false;
    const ok = (id) => !id || id === 'none' || P.Assets.get(id);
    state.deck.slides.forEach((s) => { if (!ok(s.media)) { s.media = ''; changed = true; } });
    if (!ok(state.deck.hero)) { state.deck.hero = ''; changed = true; }
    if (!ok(state.deck.cover.hero)) { state.deck.cover.hero = ''; changed = true; }
    if (changed) save();
  }

  function bindAssets() {
    const dz = $('#dropzone'), fi = $('#file-images'), ol = $('#asset-list'), card = $('#material');
    dz.addEventListener('click', () => fi.click());
    dz.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fi.click(); } });
    fi.addEventListener('change', () => { addImages(fi.files); fi.value = ''; });
    // 整張素材卡都能接住拖進來的圖片
    const hasFiles = (ev) => ev.dataTransfer && Array.from(ev.dataTransfer.types || []).includes('Files');
    ['dragenter', 'dragover'].forEach((t) => card.addEventListener(t, (ev) => { if (hasFiles(ev)) { ev.preventDefault(); card.classList.add('drag'); } }));
    card.addEventListener('dragleave', (ev) => { if (!card.contains(ev.relatedTarget)) card.classList.remove('drag'); });
    card.addEventListener('drop', (ev) => { card.classList.remove('drag'); if (hasFiles(ev)) { ev.preventDefault(); addImages(ev.dataTransfer.files); } });
    document.addEventListener('paste', (ev) => {
      if (state.view !== 'input' || !ev.clipboardData) return;
      const files = Array.from(ev.clipboardData.files || []).filter((f) => /^image\//.test(f.type));
      if (files.length) { ev.preventDefault(); addImages(files); }
    });

    ol.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-act]'); if (!b) return;
      const id = b.closest('.asset').dataset.id;
      if (b.dataset.act === 'hero') P.Assets.setHero(id);
      else P.Assets.remove(id);
    });
    ol.addEventListener('input', (ev) => {
      if (ev.target.dataset.cap == null) return;
      P.Assets.update(ev.target.closest('.asset').dataset.id, { caption: ev.target.value.trim() });
      updateInputMeta();
    });
    let from = -1;
    ol.addEventListener('dragstart', (ev) => {
      const li = ev.target.closest('.asset'); if (!li) return;
      from = Number(li.dataset.i); li.classList.add('dragging');
      ev.dataTransfer.effectAllowed = 'move';
      try { ev.dataTransfer.setData('text/plain', String(from)); } catch (err) { /* 忽略 */ }
    });
    ol.addEventListener('dragover', (ev) => {
      const li = ev.target.closest('.asset'); if (!li || from < 0) return;
      ev.preventDefault();
      $$('.asset', ol).forEach((x) => x.classList.toggle('drop-before', x === li));
    });
    ol.addEventListener('drop', (ev) => {
      const li = ev.target.closest('.asset'); if (!li || from < 0) return;
      ev.preventDefault(); ev.stopPropagation();
      P.Assets.move(from, Number(li.dataset.i));
    });
    ol.addEventListener('dragend', () => { from = -1; $$('.asset', ol).forEach((x) => x.classList.remove('dragging', 'drop-before')); });

    P.Assets.onChange(() => {
      renderAssets();
      updateInputMeta();
      syncDeckAssets();
      if (state.view === 'edit') { renderThumbs(); renderPreview(); if (state.tab === 'slide') renderEditor(); }
      if (state.view === 'share') renderCoverControls();
    });
  }

  /* ======================================================================
     生成：四個步驟的進度
     ====================================================================== */
  function buildInput() {
    const list = P.Assets.list;
    return Object.assign({}, state.input, {
      assetIds: list.map((a) => a.id),
      heroId: P.Assets.hero(),
      assets: list.map((a) => ({ caption: a.caption, w: a.w, h: a.h, hero: a.hero })),
    });
  }

  const progress = {
    el: () => $('#progress'),
    open() {
      $('#progress-title').textContent = '正在生成你的短講';
      $('#progress-steps').innerHTML = P.GEN_STEPS.map((t, i) => `<li data-s="${i}">${e(t)}</li>`).join('');
      $('#progress-detail').textContent = '';
      $('#progress-actions').hidden = true;
      this.el().hidden = false;
    },
    step(i, detail) {
      $$('#progress-steps li').forEach((li, k) => {
        li.classList.toggle('done', k < i);
        li.classList.toggle('active', k === i);
        li.classList.remove('fail');
      });
      $('#progress-detail').textContent = detail || '';
    },
    done() { $$('#progress-steps li').forEach((li) => { li.classList.remove('active'); li.classList.add('done'); }); $('#progress-detail').textContent = '完成，正在打開預覽…'; },
    fail(i, msg, canFallback) {
      const li = $$('#progress-steps li')[i];
      if (li) { li.classList.remove('active'); li.classList.add('fail'); }
      $('#progress-title').textContent = '這一步沒有成功';
      $('#progress-detail').textContent = msg + '。你的素材都還在。';
      $('#btn-fallback').hidden = !canFallback;
      $('#progress-actions').hidden = false;
    },
    close() { this.el().hidden = true; },
  };

  async function generate(forceLocal) {
    const input = buildInput();
    const settings = P.aiSettings();
    const provId = forceLocal ? 'local' : settings.provider;
    const prov = P.getProvider(provId);
    const canSeeImages = prov.vision && input.assets.length > 0;
    const capUnits = input.assets.reduce((n, a) => n + P.countUnits(a.caption), 0);
    if (!canSeeImages && P.countUnits(input.text) + capUnits < 15) {
      toast(input.assets.length ? '目前模式無法直接看圖，請補上圖片說明，或切換到 AI 代理模式' : '內容太少了，請至少寫幾句完整的想法', true);
      $('#in-text').focus();
      return;
    }
    if (!forceLocal && state.deck && state.deck.meta.source !== 'demo' && hist.stack.length > 1 &&
      !confirm('重新生成會取代目前的簡報（包含你的修改），確定嗎？')) return;

    if (prov.manual) return openManual(input);

    progress.open();
    let step = 0;
    progress.step(0);
    try {
      const res = await prov.generate(input, (i, d) => { step = i; progress.step(i, d); });
      progress.done();
      await tick(320);
      progress.close();
      finishGeneration(res);
    } catch (err) {
      console.error(err);
      progress.fail(step, err.message || '發生錯誤', provId !== 'local');
    }
  }

  function bindProgress() {
    $('#btn-retry').addEventListener('click', () => generate(false));
    $('#btn-fallback').addEventListener('click', () => generate(true));
    $('#btn-back').addEventListener('click', () => { progress.close(); $('#in-text').focus(); });
  }

  /* 生成完成：直接進入播放預覽，關掉預覽就回到微調 */
  function finishGeneration(res) {
    setDeck(res.deck);
    state.note = noteHTML(res);
    state.tab = 'slide';
    go('edit');
    play(0, { fullscreen: false, preview: true });
  }

  function noteHTML(res) {
    const d = res.deck;
    const spoken = d.slides.reduce((n, s) => n + P.scriptSeconds([s.notes.script, s.notes.transition].filter(Boolean).join(' '), d.meta.lang), 0);
    let h = `<b>已生成 ${d.slides.length} 頁 · 目標 ${P.fmtDuration(d.meta.duration)} · 預估朗讀 ${P.fmtTime(spoken)}。</b>`;
    if (res.note) h += ' ' + e(res.note);
    if (res.fixes && res.fixes.length) h += `<ul>${res.fixes.map((f) => `<li>自動修正：${e(f)}</li>`).join('')}</ul>`;
    return h;
  }

  /* ---------- 手動 AI 模式 ---------- */
  function openManual(input) {
    const dlg = $('#dlg-manual');
    $('#manual-prompt').value = P.buildManualPrompt(input);
    $('#manual-response').value = '';
    $('#manual-error').hidden = true;
    dlg._input = input;
    dlg.showModal();
  }

  function bindManual() {
    $('#btn-copy-prompt').addEventListener('click', async () => {
      const ta = $('#manual-prompt');
      try { await navigator.clipboard.writeText(ta.value); }
      catch (err) { ta.select(); document.execCommand('copy'); }
      toast('提示詞已複製');
    });
    $('#btn-manual-import').addEventListener('click', () => {
      const dlg = $('#dlg-manual');
      try {
        const res = P.getProvider('manual').parse($('#manual-response').value, dlg._input);
        dlg.close();
        finishGeneration(res);
      } catch (err) {
        $('#manual-error').textContent = '無法解析：' + err.message + '。請確認貼上的是 AI 回覆的完整 JSON。';
        $('#manual-error').hidden = false;
      }
    });
  }

  /* ---------- 生成方式（AI 設定） ---------- */
  const PROVIDER_HELP = {
    local: '不呼叫任何 AI。依關鍵詞重組你原文的句子，產生可以修改的草稿。',
    proxy: '呼叫你自己部署的端點（例如 Cloudflare Worker），Key 只存在伺服器端。可看圖配圖，也能逐頁改寫。',
    manual: '把提示詞貼到 Claude 等任何 AI 對話，再把 JSON 結果貼回來。不需要任何設定。',
  };
  function openAI() {
    const s = P.aiSettings();
    $('#provider-list').innerHTML = P.listProviders().map((p) => `
      <label class="provider"><input type="radio" name="provider" value="${p.id}"${p.id === s.provider ? ' checked' : ''}>
      <div><b>${e(p.label)}</b><span>${e(PROVIDER_HELP[p.id] || '')}</span></div></label>`).join('');
    $('#ai-endpoint').value = s.endpoint || '';
    const sync = () => ($('#endpoint-field').hidden = $('input[name=provider]:checked').value !== 'proxy');
    $$('input[name=provider]').forEach((r) => r.addEventListener('change', sync));
    sync();
    $('#dlg-ai').showModal();
  }
  function bindAI() {
    $('#btn-ai').addEventListener('click', openAI);
    $('#btn-ai-2').addEventListener('click', openAI);
    $('#dlg-ai').addEventListener('close', () => {
      if ($('#dlg-ai').returnValue !== 'save') return;
      const provider = $('input[name=provider]:checked').value;
      const endpoint = $('#ai-endpoint').value.trim();
      if (provider === 'proxy' && endpoint && !/^https:\/\/|^http:\/\/(localhost|127\.0\.0\.1)/.test(endpoint)) {
        toast('代理端點必須是 https 網址', true);
        return;
      }
      P.store.set('ai', { provider, endpoint });
      renderEngine();
      toast('已儲存生成方式');
    });
  }

  /* ======================================================================
     2. 預覽與微調
     ====================================================================== */
  function cur() { return state.deck.slides[state.current]; }

  function renderEdit() {
    state.current = Math.max(0, Math.min(state.current, state.deck.slides.length - 1));
    renderNote();
    renderThumbs();
    renderPreview();
    renderEditor();
    renderQC();
    updateUndo();
    updateQuickBar();
  }

  function renderNote() {
    const n = $('#gen-note');
    n.hidden = !state.note;
    n.innerHTML = state.note ? state.note + `<button class="icon-btn x" id="note-x" aria-label="關閉">${ICON_X}</button>` : '';
  }

  function renderThumbs() {
    const report = P.qcDeck(state.deck);
    const r = P.langRules(state.deck.meta.lang);
    const ol = $('#thumbs');
    ol.innerHTML = state.deck.slides.map((s, i) => {
      const iss = report.slides[i].issues;
      const cls = iss.some((x) => x.level === 'error') ? 'err' : iss.length ? 'warn' : '';
      return `<li class="thumb${i === state.current ? ' active' : ''}" data-i="${i}" draggable="true">
        <span class="t-num">${i + 1}</span>
        <div><div class="t-frame"><div class="stage">${P.slideHTML(s, state.deck)}</div>
        <span class="t-badge ${cls}" title="可見文字">${P.slideUnits(s)}/${r.slideLimit}</span></div>
        <span class="t-role">${roleOf(s)} · ${s.notes.seconds} 秒</span></div></li>`;
    }).join('');
    mountStages(ol);
    const active = $('.thumb.active', ol);
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /* 主畫布：文字可直接編輯 */
  function renderPreview() {
    const st = $('#main-stage');
    st.innerHTML = P.slideHTML(cur(), state.deck);
    if (!st._fit) st._fit = P.fitStage(st);
    $$('[data-f]', st).forEach((el) => {
      el.setAttribute('contenteditable', 'plaintext-only');
      if (el.contentEditable !== 'plaintext-only') el.setAttribute('contenteditable', 'true');
      el.spellcheck = false;
    });
    $('#slide-pos').textContent = `第 ${state.current + 1} / ${state.deck.slides.length} 頁 · ${roleOf(cur())}`;
  }

  function renderQC() {
    const report = P.qcDeck(state.deck);
    const r = P.langRules(state.deck.meta.lang);
    const s = cur();
    const units = P.slideUnits(s);
    const pct = Math.min(100, (units / r.slideLimit) * 100);
    const iss = report.slides[state.current].issues;
    const cls = units > r.slideLimit ? 'over' : units > r.slideLimit * 0.85 ? 'near' : '';
    const total = P.totalSeconds(state.deck);
    $('#qc-panel').innerHTML = `
      <div class="qc-row">
        <div class="counter ${cls}"><span>可見文字</span><div class="bar"><i style="width:${pct}%"></i></div><b>${units}</b> / ${r.slideLimit} ${r.unit}</div>
        <span class="pill">${s.notes.seconds} 秒</span>
        <span class="pill ${report.errors ? 'err' : 'ok'}">${report.errors ? report.errors + ' 個必須修正' : '字數規則全部通過'}</span>
        <span class="pill">${P.fmtTime(total)} / ${P.fmtTime(state.deck.meta.duration)}</span>
        ${report.errors || report.deck.length ? '<button class="btn ghost sm" id="btn-autofix">自動精簡與調整</button>' : ''}
      </div>
      ${iss.length || report.deck.length ? `<ul class="issues">${iss.concat(report.deck).map((x) => `<li class="${x.level}">${e(x.msg)}</li>`).join('')}</ul>` : ''}`;
  }

  let liveTimer = 0;
  function liveUpdate(opts) {
    opts = opts || {};
    if (!opts.keepStage) renderPreview();
    renderQC();
    clearTimeout(liveTimer);
    liveTimer = setTimeout(renderThumbs, 250);
    save();
  }

  function select(i) {
    closePicker();
    state.current = Math.max(0, Math.min(i, state.deck.slides.length - 1));
    $$('.thumb').forEach((t) => t.classList.toggle('active', Number(t.dataset.i) === state.current));
    renderPreview(); renderEditor(); renderQC();
  }

  function setField(obj, path, val) {
    const keys = path.split('.');
    let o = obj;
    for (let k = 0; k < keys.length - 1; k++) {
      if (o[keys[k]] == null) o[keys[k]] = /^\d+$/.test(keys[k + 1]) ? [] : {};
      o = o[keys[k]];
    }
    o[keys[keys.length - 1]] = val;
  }

  /* ---------- 在投影片上直接編輯 ---------- */
  const MULTILINE = /^(title|subtitle|quote)$/;
  function bindCanvas() {
    const st = $('#main-stage');
    st.addEventListener('input', (ev) => {
      const el = ev.target.closest('[data-f]'); if (!el) return;
      const path = el.dataset.f;
      let v = el.innerText.replace(/ /g, ' ').replace(/\n+$/, '');
      if (!MULTILINE.test(path)) v = v.replace(/\n/g, ' ');
      setField(cur(), path, v);
      // 右側面板的同一個欄位也跟著更新
      const twin = $(`#editor [data-bind="${path}"]`);
      if (twin && twin !== document.activeElement) twin.value = v;
      liveUpdate({ keepStage: true });
    });
    st.addEventListener('keydown', (ev) => {
      const el = ev.target.closest('[data-f]'); if (!el) return;
      if (ev.key === 'Escape' || (ev.key === 'Enter' && !MULTILINE.test(el.dataset.f))) { ev.preventDefault(); el.blur(); }
      ev.stopPropagation(); // 不要觸發換頁快捷鍵
    });
    st.addEventListener('paste', (ev) => {
      const el = ev.target.closest('[data-f]'); if (!el || el.contentEditable === 'plaintext-only') return;
      ev.preventDefault();
      document.execCommand('insertText', false, (ev.clipboardData || window.clipboardData).getData('text/plain'));
    });
    st.addEventListener('focusout', () => {
      setTimeout(() => {
        if (st.contains(document.activeElement)) return;
        const s = cur();
        s.points = s.points.filter((p) => p.trim());
        s.steps = s.steps.filter((x) => x.label.trim() || x.text.trim());
        renderPreview();
        if (state.tab !== 'deck') renderEditor();
        renderThumbs();
      }, 0);
    });
    st.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-f]')) return;
      const m = ev.target.closest('[data-media]');
      if (m) openPicker(m.getBoundingClientRect());
    });
  }

  /* ---------- 右側面板 ---------- */
  const fieldLabels = {
    kicker: '小標（可空）', title: '標題', subtitle: '副標題', points: '重點（最多 3 個）', number: '數字',
    left: '左側（被比較的一方）', right: '右側（推薦的一方）', steps: '步驟（最多 3 個）',
    quote: '金句', by: '出處（只填真實出處，可空）', cta: '行動呼籲',
  };
  const titleLabel = { question: '問題', bignumber: '數字代表什麼', closing: '收尾主張' };
  const FOCUS = ['0% 0%', '50% 0%', '100% 0%', '0% 50%', '50% 50%', '100% 50%', '0% 100%', '50% 100%', '100% 100%'];

  function inputFor(bind, value, opts) {
    opts = opts || {};
    const v = e(value == null ? '' : value);
    if (opts.area) return `<textarea class="input" rows="${opts.rows || 2}" data-bind="${bind}" placeholder="${e(opts.ph || '')}">${v}</textarea>`;
    return `<input class="input" data-bind="${bind}" value="${v}" placeholder="${e(opts.ph || '')}"${opts.type ? ` type="${opts.type}"` : ''}>`;
  }

  function mediaBlock(s) {
    const src = s.media && P.Assets.url(s.media);
    const shown = P.mediaShown(state.deck.meta.template, s.layout);
    const focus = s.focus || '50% 50%';
    return `<div class="field"><span class="label">圖片</span>
      <div class="media-row">
        <button type="button" class="media-thumb" data-pick title="換圖">${src ? `<img src="${e(src)}" alt="">` : '＋ 加圖'}</button>
        <div class="media-side">
          <button type="button" class="btn ghost sm" data-pick>${src ? '換一張圖' : '選擇圖片'}</button>
          ${src ? `<span class="meta">圖片焦點</span><div class="focus-grid" role="group" aria-label="圖片焦點">${FOCUS.map((f) =>
            `<button type="button" data-focus="${f}" aria-pressed="${f === focus}" title="${f}"></button>`).join('')}</div>` : ''}
        </div>
      </div>
      ${src && !shown ? `<p class="help">「${P.TEMPLATES[state.deck.meta.template].label}」風格的這個版型不顯示圖片，可以改用 Statement 或 Story 版型。</p>` : ''}</div>`;
  }

  function slideForm(s) {
    const fields = P.LAYOUTS[s.layout].fields.filter((f) => f !== 'image');
    let h = `<div class="row2">
      <div class="field"><label class="label">這頁的角色</label><select class="input" data-bind="section">${Object.keys(P.SECTIONS).map((k) => `<option value="${k}"${k === s.section ? ' selected' : ''}>${P.SECTIONS[k].zh}</option>`).join('')}</select></div>
      <div class="field"><label class="label">版型</label><select class="input" data-bind="layout">${Object.keys(P.LAYOUTS).map((k) => `<option value="${k}"${k === s.layout ? ' selected' : ''}>${P.LAYOUTS[k].label.split('　')[0]}</option>`).join('')}</select></div>
    </div>`;
    h += mediaBlock(s) + '<hr>';
    fields.forEach((f) => {
      const label = f === 'title' ? (titleLabel[s.layout] || '標題') : fieldLabels[f];
      h += `<div class="field"><label class="label">${label}</label>`;
      if (f === 'points') {
        h += `<div class="stack">${[0, 1, 2].map((k) => `<input class="input" data-list="points" value="${e(s.points[k] || '')}" placeholder="重點 ${k + 1}">`).join('')}</div>`;
      } else if (f === 'steps') {
        h += `<div class="stack">${[0, 1, 2].map((k) => {
          const st = s.steps[k] || { label: '', text: '' };
          return `<div class="step-row"><input class="input" data-step="${k}" data-k="label" value="${e(st.label)}" placeholder="步驟 ${k + 1}"><input class="input" data-step="${k}" data-k="text" value="${e(st.text)}" placeholder="一句說明"></div>`;
        }).join('')}</div>`;
      } else if (f === 'left' || f === 'right') {
        h += `<div class="side-box">${inputFor(f + '.label', s[f].label, { ph: '標籤，例如：之前' })}${inputFor(f + '.text', s[f].text, { ph: '一句說明' })}</div>`;
      } else if (f === 'title' || f === 'subtitle' || f === 'quote') {
        h += inputFor(f, s[f], { area: true, rows: f === 'quote' ? 3 : 2 });
      } else {
        h += inputFor(f, s[f]);
      }
      h += '</div>';
    });
    h += `<hr><div class="field"><label class="label">視覺建議（不顯示在投影片）</label>${inputFor('visual', s.visual, { area: true, rows: 2 })}</div>`;
    return h;
  }

  function notesForm(s) {
    const d = state.deck, lang = d.meta.lang, r = P.langRules(lang);
    const total = P.totalSeconds(d);
    const est = d.slides.reduce((a, x) => a + P.scriptSeconds(x.notes.script, lang), 0);
    const mine = P.scriptSeconds(s.notes.script, lang);
    const over = est > d.meta.duration * 1.1;
    return `
      <div class="field">
        <div class="time-sum${over ? ' over' : ''}"><span>朗讀約 <b>${P.fmtTime(est)}</b> · 目標 ${P.fmtTime(d.meta.duration)}</span><span>分配 ${P.fmtTime(total)}</span></div>
        <div class="timebar" style="margin-top:8px">${d.slides.map((x, i) =>
          `<span class="sec-${x.section}${i === state.current ? ' on' : ''}" style="flex:${x.notes.seconds}" data-goto="${i}" title="第 ${i + 1} 頁 · ${x.notes.seconds} 秒">${i + 1}</span>`).join('')}</div>
        <div class="row2" style="margin-top:8px">
          <button type="button" class="btn ghost sm" data-fit="script">依講稿長度分配</button>
          <button type="button" class="btn ghost sm" data-trim-all${over ? '' : ' disabled'}>縮短過長講稿</button>
        </div>
      </div>
      <hr>
      <div class="field"><label class="label">第 ${state.current + 1} 頁的核心訊息</label>${inputFor('notes.message', s.notes.message)}</div>
      <div class="field"><label class="label">口語講稿</label>${inputFor('notes.script', s.notes.script, { area: true, rows: 8 })}
        <div class="row2" style="margin-top:8px"><button type="button" class="btn ghost sm" id="btn-pause">插入（停頓）</button><span></span></div>
        <p class="est${mine > s.notes.seconds * 1.35 + 1 ? ' over' : ''}" id="est">預估 <b>${Math.round(mine)}</b> 秒，分配 ${s.notes.seconds} 秒（約每秒 ${r.rate} ${r.unit}）</p></div>
      <div class="field"><label class="label">轉到下一頁的銜接語</label>${inputFor('notes.transition', s.notes.transition, { area: true, rows: 2 })}</div>
      <div class="field"><label class="label">這頁秒數</label>${inputFor('notes.seconds', s.notes.seconds, { type: 'number' })}</div>`;
  }

  function deckForm() {
    const d = state.deck, m = d.meta;
    const r = P.langRules(m.lang);
    const accents = ['#ff4a36', '#ff7a1a', '#f5b544', '#3ccf8e', '#4fb3ff', '#8b6bff'];
    const bi = P.countUnits(d.distill.bigIdea);
    return `
      <div class="field bigidea-box"><div class="card-head"><label class="label">核心觀點</label><span class="meta" style="${bi > r.bigIdeaMax ? 'color:var(--err)' : ''}">${bi} / ${r.bigIdeaMax} ${r.unit}</span></div>
        ${inputFor('distill.bigIdea', d.distill.bigIdea, { area: true, rows: 2, ph: '觀眾聽完最該記住的一句話' })}</div>
      <div class="field"><label class="label">觀眾在意什麼</label>${inputFor('distill.audienceNeed', d.distill.audienceNeed, { area: true, rows: 2, ph: '對方的需求、困擾或期待' })}</div>
      <div class="field"><label class="label">有什麼不同</label>${inputFor('distill.uniqueValue', d.distill.uniqueValue, { area: true, rows: 2, ph: '素材支持的獨特做法或能力；沒有就先留空' })}</div>
      <div class="field"><label class="label">素材中的下一步</label>${inputFor('distill.action', d.distill.action, { area: true, rows: 2, ph: '希望對方參加、試用、聯絡或繼續交流' })}</div>
      <div class="field"><label class="label">標題</label>${inputFor('meta.title', m.title)}</div>
      <div class="field"><label class="label">長度</label><select class="input" data-meta="duration">${P.DURATIONS.map((x) => `<option value="${x.sec}"${x.sec === m.duration ? ' selected' : ''}>${x.label}</option>`).join('')}</select>
        <p class="help">變更長度會依比例重新分配每頁秒數；要增減頁數請重新生成。</p></div>
      <div class="field"><span class="label">風格</span><div class="tpl-mini" role="radiogroup">${Object.keys(P.TEMPLATES).map((k) => {
        const t = P.TEMPLATES[k];
        const view = Object.assign({}, d, { meta: Object.assign({}, m, { template: k, theme: t.theme }) });
        return `<button type="button" class="tpl-opt" role="radio" aria-checked="${k === m.template}" data-tpl-pick="${k}">
          <div class="stage">${P.slideHTML(cur(), view)}</div><div><b>${t.label}</b><span>${e(t.desc)}</span></div></button>`;
      }).join('')}</div></div>
      <div class="field"><label class="label">背景</label><div class="theme-pick">${P.THEMES.map((t) => {
        const bg = t.id === 'paper' ? '#f3efe6' : t.id === 'charcoal' ? '#1c1d20' : '#0b0b0c';
        const fg = t.id === 'paper' ? '#141414' : '#f5f3ef';
        return `<button type="button" data-theme-pick="${t.id}" class="${t.id === m.theme ? 'active' : ''}" style="background:${bg};color:${fg}">${t.label}</button>`;
      }).join('')}</div></div>
      <div class="field"><label class="label">強調色（品牌色）</label><div class="swatches">${accents.map((c) => `<button type="button" class="swatch${c === m.accent ? ' active' : ''}" data-accent="${c}" style="background:${c}" title="${c}"></button>`).join('')}
        <input type="color" data-accent-custom value="${e(m.accent)}" title="自訂顏色"></div></div>
      <div class="row2">
        <div class="field"><label class="label">觀眾</label>${inputFor('meta.audience', m.audience)}</div>
        <div class="field"><label class="label">目的</label><select class="input" data-meta="purpose">${P.PURPOSES.map((p) => `<option${p === m.purpose ? ' selected' : ''}>${p}</option>`).join('')}</select></div>
      </div>`;
  }

  function renderEditor() {
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === state.tab));
    const ed = $('#editor');
    ed.innerHTML = state.tab === 'slide' ? slideForm(cur()) : state.tab === 'notes' ? notesForm(cur()) : deckForm();
    if (state.tab === 'deck') mountStages(ed);
  }

  function bindEditor() {
    const ed = $('#editor');
    ed.addEventListener('input', (ev) => {
      const t = ev.target;
      const s = cur();
      if (t.dataset.bind) {
        const path = t.dataset.bind;
        if (path === 'layout' || path === 'section') return; // 由 change 處理
        if (/^(meta|distill)\./.test(path)) {
          setField(state.deck, path, t.value);
          if (path === 'distill.bigIdea') {
            const n = P.countUnits(t.value), mx = P.langRules(state.deck.meta.lang).bigIdeaMax;
            const c = t.closest('.field').querySelector('.meta');
            c.textContent = `${n} / ${mx} ${P.langRules(state.deck.meta.lang).unit}`;
            c.style.color = n > mx ? 'var(--err)' : '';
          }
          save(); renderQC();
          return;
        }
        let v = t.value;
        if (path === 'notes.seconds') v = Math.max(1, Math.round(Number(v) || 1));
        setField(s, path, v);
        if (path === 'notes.script') {
          const el = $('#est b'); if (el) el.textContent = Math.round(P.scriptSeconds(v, state.deck.meta.lang));
        }
        liveUpdate();
      } else if (t.dataset.list === 'points') {
        s.points = $$('[data-list=points]', ed).map((x) => x.value.trim()).filter(Boolean);
        liveUpdate();
      } else if (t.dataset.step != null) {
        s.steps = [0, 1, 2].map((k) => ({
          label: $(`[data-step="${k}"][data-k=label]`, ed).value.trim(),
          text: $(`[data-step="${k}"][data-k=text]`, ed).value.trim(),
        })).filter((st) => st.label || st.text);
        liveUpdate();
      } else if (t.dataset.accentCustom != null) {
        state.deck.meta.accent = t.value;
        liveUpdate();
      }
    });
    ed.addEventListener('change', (ev) => {
      const t = ev.target;
      const s = cur();
      if (t.dataset.bind === 'layout') { s.layout = t.value; renderEditor(); liveUpdate(); }
      else if (t.dataset.bind === 'section') { s.section = t.value; liveUpdate(); renderPreview(); }
      else if (t.dataset.bind === 'notes.seconds' || t.dataset.bind === 'notes.script') { if (state.tab === 'notes') renderEditor(); }
      else if (t.dataset.meta === 'duration') {
        state.deck.meta.duration = Number(t.value);
        P.fitSeconds(state.deck);
        liveUpdate(); toast('已依比例重新分配每頁秒數');
      } else if (t.dataset.meta === 'purpose') { state.deck.meta.purpose = t.value; liveUpdate(); }
      else if (t.dataset.accentCustom != null) renderEditor();
    });
    ed.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      const d = state.deck;
      if (b.dataset.pick != null) openPicker(b.getBoundingClientRect());
      else if (b.dataset.focus) {
        cur().focus = b.dataset.focus === '50% 50%' ? '' : b.dataset.focus;
        $$('[data-focus]', ed).forEach((x) => x.setAttribute('aria-pressed', x === b));
        liveUpdate();
      } else if (b.id === 'btn-pause') {
        const ta = $('[data-bind="notes.script"]', ed);
        const pos = ta.selectionStart || ta.value.length;
        ta.value = ta.value.slice(0, pos) + '（停頓）' + ta.value.slice(ta.selectionEnd || pos);
        ta.focus();
        ta.selectionStart = ta.selectionEnd = pos + 4;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (b.dataset.goto != null) {
        select(Number(b.dataset.goto));
      } else if (b.dataset.tplPick) {
        d.meta.template = b.dataset.tplPick;
        d.meta.theme = P.TEMPLATES[b.dataset.tplPick].theme;
        renderEditor(); renderThumbs(); liveUpdate();
        toast(`已換成「${P.TEMPLATES[b.dataset.tplPick].label}」風格`);
      } else if (b.dataset.themePick) {
        d.meta.theme = b.dataset.themePick; renderEditor(); renderThumbs(); liveUpdate();
      } else if (b.dataset.accent) {
        d.meta.accent = b.dataset.accent; renderEditor(); renderThumbs(); liveUpdate();
      } else if (b.dataset.fit) {
        P.fitSeconds(d, d.slides.map((s) => Math.max(2, P.scriptSeconds(s.notes.script, d.meta.lang))));
        liveUpdate(); renderEditor(); toast('已依講稿長度分配時間');
      } else if (b.dataset.trimAll != null) {
        const r = P.langRules(d.meta.lang);
        let n = 0;
        d.slides.forEach((s) => {
          if (P.scriptSeconds(s.notes.script, d.meta.lang) > s.notes.seconds * 1.15) {
            s.notes.script = P.shortenScript(s.notes.script, Math.round(s.notes.seconds * r.rate)); n++;
          }
        });
        liveUpdate(); renderEditor(); toast(n ? `已縮短 ${n} 頁講稿，可按復原回到原本` : '講稿長度都在時間內');
      }
    });
    // timebar 是 span，需要另外處理
    ed.addEventListener('click', (ev) => {
      const sp = ev.target.closest('.timebar [data-goto]');
      if (sp) select(Number(sp.dataset.goto));
    });
    $$('.tab').forEach((t) => t.addEventListener('click', () => { state.tab = t.dataset.tab; renderEditor(); }));
  }

  /* ---------- 這一頁的快速操作 ---------- */
  function updateQuickBar() {
    if (!$('#quick-bar')) return;
    const ai = P.canAISlide();
    $$('[data-qa=rewrite], [data-qa=regenerate]').forEach((b) => {
      b.classList.toggle('need-ai', !ai);
      b.title = ai ? '' : '需要 AI 代理端點（右上角設定生成方式）';
    });
    $('[data-qa=shorten]').title = ai ? '請 AI 把這一頁縮短' : '把這一頁的文字與講稿縮短';
  }

  async function quickAction(kind, btn) {
    const d = state.deck, i = state.current;
    if (kind === 'image') return openPicker(btn.getBoundingClientRect());
    const ai = P.canAISlide();
    if ((kind === 'rewrite' || kind === 'regenerate') && !ai) {
      toast('「' + (kind === 'rewrite' ? '改寫' : '重新生成') + '」需要 AI 代理端點，可在右上角設定');
      return;
    }
    if (kind === 'shorten' && !ai) {
      const res = P.shortenSlide(cur(), d.meta.lang);
      liveUpdate(); renderEditor(); renderThumbs();
      toast(res.after < res.before ? `可見文字從 ${res.before} 縮到 ${res.after} 字，可按復原回到原本` : '這一頁已經很精簡了');
      return;
    }
    btn.classList.add('busy');
    try {
      flushSnapshot();
      const s = await P.aiSlide(d, i, kind);
      d.slides[i] = s;
      P.autoFix(d);
      save(); renderEdit();
      toast('已更新這一頁，可按復原回到原本');
    } catch (err) {
      toast('沒有成功：' + err.message, true);
    } finally {
      btn.classList.remove('busy');
    }
  }

  /* ---------- 換圖浮層 ---------- */
  function openPicker(rect) {
    const pop = $('#img-pop');
    const s = cur();
    const list = P.Assets.list;
    $('#img-pop-grid').innerHTML =
      `<button type="button" data-img="" aria-pressed="${!s.media}">${ICON_NONE}無圖片</button>` +
      list.map((a, k) => `<button type="button" data-img="${a.id}" aria-pressed="${a.id === s.media}" title="圖 ${k + 1}${a.caption ? '：' + e(a.caption) : ''}"><img src="${e(a.url)}" alt="圖 ${k + 1}"></button>`).join('') +
      (list.length < P.Assets.MAX ? `<button type="button" data-upload>${ICON_PLUS}上傳新圖</button>` : '');
    const shown = P.mediaShown(state.deck.meta.template, s.layout);
    $('#img-pop-note').textContent = !shown
      ? `「${P.TEMPLATES[state.deck.meta.template].label}」風格的 ${P.LAYOUTS[s.layout].label.split('　')[0]} 版型不顯示圖片。`
      : list.length ? '每張圖只會用在一頁；選了別頁的圖，會從那一頁移過來。' : '還沒有圖片，可以直接上傳。';
    pop.hidden = false;
    const w = pop.offsetWidth, h = pop.offsetHeight;
    let x = rect.left + rect.width / 2 - w / 2, y = rect.bottom + 8;
    if (y + h > window.innerHeight - 8) y = Math.max(8, rect.top - h - 8);
    x = Math.max(8, Math.min(x, window.innerWidth - w - 8));
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
  }
  function closePicker() { const p = $('#img-pop'); if (p) p.hidden = true; }

  function assignMedia(id) {
    const s = cur();
    if (id) state.deck.slides.forEach((x) => { if (x !== s && x.media === id) x.media = ''; });
    s.media = id;
    s.focus = '';
    if (state.current === 0 && id) state.deck.hero = id;
    closePicker();
    liveUpdate(); renderEditor(); renderThumbs();
  }

  function bindPicker() {
    const pop = $('#img-pop');
    pop.addEventListener('click', (ev) => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.upload != null) $('#file-slide-image').click();
      else if (b.dataset.img != null) assignMedia(b.dataset.img);
    });
    $('#img-pop-close').addEventListener('click', closePicker);
    $('#file-slide-image').addEventListener('change', async (ev) => {
      const r = await addImages(ev.target.files);
      ev.target.value = '';
      if (r && r.added) assignMedia(P.Assets.list[P.Assets.count - 1].id);
    });
    document.addEventListener('mousedown', (ev) => {
      if (pop.hidden || pop.contains(ev.target) || ev.target.closest('[data-pick],[data-media],[data-qa=image]')) return;
      closePicker();
    });
    window.addEventListener('resize', closePicker);
  }

  function bindEdit() {
    const ol = $('#thumbs');
    ol.addEventListener('click', (ev) => {
      const li = ev.target.closest('.thumb');
      if (li) select(Number(li.dataset.i));
    });
    let dragFrom = -1;
    ol.addEventListener('dragstart', (ev) => {
      const li = ev.target.closest('.thumb'); if (!li) return;
      dragFrom = Number(li.dataset.i); li.classList.add('dragging');
      ev.dataTransfer.effectAllowed = 'move';
      try { ev.dataTransfer.setData('text/plain', String(dragFrom)); } catch (err) { /* 忽略 */ }
    });
    ol.addEventListener('dragover', (ev) => {
      const li = ev.target.closest('.thumb'); if (!li || dragFrom < 0) return;
      ev.preventDefault();
      $$('.thumb', ol).forEach((t) => t.classList.toggle('drop-before', t === li));
    });
    ol.addEventListener('drop', (ev) => {
      const li = ev.target.closest('.thumb'); if (!li || dragFrom < 0) return;
      ev.preventDefault();
      move(dragFrom, Number(li.dataset.i));
    });
    ol.addEventListener('dragend', () => { dragFrom = -1; $$('.thumb', ol).forEach((t) => t.classList.remove('dragging', 'drop-before')); });

    $('#add-layout').innerHTML = Object.keys(P.LAYOUTS).map((k) => `<option value="${k}">${P.LAYOUTS[k].label}</option>`).join('');
    $('#btn-add').addEventListener('click', () => {
      const s = P.blankSlide($('#add-layout').value);
      Object.assign(s, {
        statement: { title: '一句有觀點的主張' }, question: { title: '一個讓人想知道答案的問題？' },
        contrast: { title: '兩種做法，差在哪裡', left: { label: '之前', text: '' }, right: { label: '之後', text: '' } },
        bignumber: { number: '0', title: '這個數字代表什麼' }, story: { title: '一個關鍵瞬間' },
        diagram: { title: '三個步驟', steps: [{ label: '步驟一', text: '' }, { label: '步驟二', text: '' }, { label: '步驟三', text: '' }] },
        quote: { quote: '一句值得被記住的話。' }, closing: { title: '一句好記的收尾', cta: '' },
      }[s.layout]);
      s.section = cur() ? cur().section : 'insight';
      state.deck.slides.splice(state.current + 1, 0, s);
      state.current++;
      save(); renderEdit();
    });
    $('#btn-up').addEventListener('click', () => move(state.current, state.current - 1));
    $('#btn-down').addEventListener('click', () => move(state.current, state.current + 1));
    $('#btn-dup').addEventListener('click', () => {
      const c = P.clone(cur()); c.id = P.uid();
      state.deck.slides.splice(state.current + 1, 0, c);
      state.current++; save(); renderEdit();
    });
    $('#btn-del').addEventListener('click', () => {
      if (state.deck.slides.length <= 1) { toast('至少需要保留一頁'); return; }
      state.deck.slides.splice(state.current, 1);
      state.current = Math.min(state.current, state.deck.slides.length - 1);
      save(); renderEdit();
      toast('已刪除這一頁，可按復原找回');
    });
    $('#btn-undo').addEventListener('click', undo);
    $('#btn-redo').addEventListener('click', redo);
    $('#btn-preview').addEventListener('click', () => play(state.current, { fullscreen: false, preview: true }));
    $('#quick-bar').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-qa]');
      if (b) quickAction(b.dataset.qa, b);
    });
    $('#qc-panel').addEventListener('click', (ev) => {
      if (!ev.target.closest('#btn-autofix')) return;
      const log = P.autoFix(state.deck);
      save(); renderEdit();
      toast(log.length ? `已修正 ${log.length} 項` : '沒有可自動修正的項目，建議手動調整');
    });
    $('#gen-note').addEventListener('click', (ev) => { if (ev.target.closest('#note-x')) { state.note = null; renderNote(); } });

    document.addEventListener('keydown', (ev) => {
      if (!$('#presenter').hidden) return;
      const inField = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      const mod = ev.ctrlKey || ev.metaKey;
      if (ev.key === 'Escape') closePicker();
      if (!state.deck || state.view === 'input') return;
      if (mod && !inField && (ev.key === 'z' || ev.key === 'Z')) { ev.preventDefault(); ev.shiftKey ? redo() : undo(); return; }
      if (mod && !inField && (ev.key === 'y' || ev.key === 'Y')) { ev.preventDefault(); redo(); return; }
      if (state.view !== 'edit' || inField || mod) return;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') { ev.preventDefault(); select(state.current + 1); }
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') { ev.preventDefault(); select(state.current - 1); }
    });
  }

  function move(from, to) {
    const arr = state.deck.slides;
    if (to < 0 || to >= arr.length || from === to) return;
    const [s] = arr.splice(from, 1);
    arr.splice(to, 0, s);
    state.current = to;
    save(); renderEdit();
  }

  /* ======================================================================
     3. 播放或下載
     ====================================================================== */
  const safeName = (s) => (s || 'pitch').replace(/[\\/:*?"<>|\s]+/g, '_').replace(/^_+|_+$/g, '') || 'pitch';

  function renderShare() {
    const d = state.deck;
    $('#share-meta').textContent = `${d.meta.title} · ${d.slides.length} 頁 · 約 ${P.fmtDuration(d.meta.duration)} · ${P.TEMPLATES[d.meta.template].label}風格`;
    const st = $('#share-stage');
    st.innerHTML = P.slideHTML(d.slides[0], d);
    if (!st._fit) st._fit = P.fitStage(st);
    if (!$('#html-name').value || $('#html-name').dataset.auto === '1') { $('#html-name').value = safeName(d.meta.title); $('#html-name').dataset.auto = '1'; }
    $('#html-status').textContent = '';
    renderCoverControls();
    drawCover();
  }

  async function downloadHTML() {
    if (!exportGate()) return;
    const btn = $('#btn-html'), status = $('#html-status');
    btn.classList.add('busy'); btn.disabled = true;
    try {
      const res = await P.exportHTML(state.deck, { includeNotes: $('#html-notes').checked, onStatus: (t) => (status.textContent = t) });
      const name = safeName($('#html-name').value) + '.html';
      P.downloadHTML(res.html, name);
      const mb = res.bytes > 1024 * 1024 ? (res.bytes / 1024 / 1024).toFixed(1) + ' MB' : Math.round(res.bytes / 1024) + ' KB';
      status.textContent = `已下載 ${name}（${mb}）。` + (res.fontsInlined ? '字型已內嵌，離線也能播放。' : '字型沒有內嵌（目前離線），在沒有網路的電腦會改用系統字型。');
    } catch (err) {
      status.textContent = '匯出失敗：' + err.message;
    } finally {
      btn.classList.remove('busy'); btn.disabled = false;
    }
  }

  function renderCoverControls() {
    if (!state.deck) return;
    const c = state.deck.cover;
    $('#cover-format').innerHTML = Object.keys(P.COVER_FORMATS).map((k) => {
      const f = P.COVER_FORMATS[k];
      return `<button type="button" role="radio" aria-checked="${c.format === k}" data-v="${k}">${f.label}<small>${f.use}</small></button>`;
    }).join('');
    $('#cover-title').value = c.title;
    $('#cover-kicker').value = c.kicker;
    updateCoverCount();
    const heroId = P.coverHero(state.deck);
    $('#cover-hero').innerHTML = `<button type="button" role="radio" aria-checked="${!heroId}" data-hero="" title="不使用圖片">無圖</button>` +
      P.Assets.list.map((a, i) => `<button type="button" role="radio" aria-checked="${a.id === heroId}" data-hero="${a.id}" title="圖 ${i + 1}"><img src="${e(a.url)}" alt="圖 ${i + 1}"></button>`).join('');
  }

  function updateCoverCount() {
    const n = P.countUnits(state.deck.cover.title);
    const el = $('#cover-count');
    el.textContent = `${n} / 20 字`;
    el.style.color = n > 20 ? 'var(--warn)' : '';
  }

  let coverTimer = 0, coverSeq = 0;
  function drawCover() {
    clearTimeout(coverTimer);
    coverTimer = setTimeout(async () => {
      const seq = ++coverSeq;
      const cv = $('#cover-canvas');
      cv.classList.add('busy');
      const off = document.createElement('canvas');
      await P.drawCover(off, state.deck, state.deck.cover.format);
      if (seq !== coverSeq) return;
      cv.width = off.width; cv.height = off.height;
      cv.getContext('2d').drawImage(off, 0, 0);
      cv.classList.remove('busy');
    }, 120);
  }

  function bindShare() {
    $('#btn-html').addEventListener('click', downloadHTML);
    $('#html-name').addEventListener('input', (ev) => (ev.target.dataset.auto = '0'));
    $('#btn-play-full').addEventListener('click', () => play(0));
    $('#btn-rehearse').addEventListener('click', () => play(0, { speaker: true, fullscreen: false }));
    $$('[data-export]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.export;
      if (k === 'pdf') printDeck('slides');
      else if (k === 'pdf-notes') printDeck('notes');
      else if (k === 'json' && exportGate()) downloadJSON();
    }));
    $('#cover-format').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-v]'); if (!b) return;
      state.deck.cover.format = b.dataset.v; save();
      $$('#cover-format button').forEach((x) => x.setAttribute('aria-checked', x === b));
      drawCover();
    });
    $('#cover-title').addEventListener('input', (ev) => { state.deck.cover.title = ev.target.value; updateCoverCount(); save(); drawCover(); });
    $('#cover-kicker').addEventListener('input', (ev) => { state.deck.cover.kicker = ev.target.value; save(); drawCover(); });
    $('#cover-hero').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-hero]'); if (!b) return;
      state.deck.cover.hero = b.dataset.hero || 'none'; // 「無圖」要記住，避免又自動帶入主角圖
      save();
      $$('#cover-hero button').forEach((x) => x.setAttribute('aria-checked', x === b));
      drawCover();
    });
    $('#btn-cover-dl').addEventListener('click', () => P.downloadCover(state.deck, state.deck.cover.format));
    $('#btn-cover-all').addEventListener('click', async () => {
      for (const k of Object.keys(P.COVER_FORMATS)) {
        await P.downloadCover(state.deck, k);
        await tick(400);
      }
    });
  }

  /* ======================================================================
     播放、匯出、匯入
     ====================================================================== */
  function play(i, opts) {
    if (!state.deck || !state.deck.slides.length) return;
    closePicker();
    P.present(state.deck, i || 0, opts);
  }
  P.onPresentClose = function (index) {
    if (state.view === 'edit') select(index);
  };

  function exportGate() {
    const report = P.qcDeck(state.deck);
    if (!report.errors) return true;
    const first = report.slides.findIndex((s) => s.issues.some((x) => x.level === 'error'));
    toast(`還有 ${report.errors} 個字數或結構問題，修正後才能匯出`, true);
    state.current = Math.max(0, first);
    go('edit');
    return false;
  }

  function printDeck(mode) {
    if (!exportGate()) return;
    const d = state.deck;
    const root = $('#print-root');
    root.className = mode === 'notes' ? 'print-notes' : 'print-slides';
    if (mode === 'notes') {
      root.innerHTML = d.slides.map((s, i) => `<div class="print-page">
        <div class="pn-head"><span>${e(d.meta.title)}</span><span>${i + 1} / ${d.slides.length} · ${s.notes.seconds} 秒</span></div>
        <div class="stage">${P.slideHTML(s, d)}</div>
        <div class="pn-body">${s.notes.message ? `<h4>${e(s.notes.message)}</h4>` : ''}<p>${P.scriptHTML(s.notes.script)}</p>${s.notes.transition ? `<p>↳ ${e(s.notes.transition)}</p>` : ''}</div>
      </div>`).join('');
      $('#print-page-style').textContent = '@page { size: A4 portrait; margin: 16mm; }';
      $$('.stage', root).forEach((st) => st.style.setProperty('--scale', 673 / 1920)); // A4 可印寬度約 673px
    } else {
      root.innerHTML = d.slides.map((s) => `<div class="print-page">${P.slideHTML(s, d)}</div>`).join('');
      $('#print-page-style').textContent = '@page { size: 1920px 1080px; margin: 0; }';
    }
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(() => setTimeout(() => window.print(), 60));
  }

  async function downloadJSON() {
    const assets = await P.Assets.exportAll(); // 圖片一起打包，檔案可以單獨分享
    const blob = new Blob([JSON.stringify(Object.assign({}, state.deck, { assets }), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = safeName(state.deck.meta.title) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function bindTop() {
    $$('.step').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
    $$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
    $('#btn-play').addEventListener('click', () => play(state.view === 'edit' ? state.current : 0));
    $('#file-import').addEventListener('change', async (ev) => {
      const f = ev.target.files[0]; if (!f) return;
      try {
        const raw = JSON.parse(await f.text());
        const deck = P.normalizeDeck(raw);
        if (!deck.slides.length) throw new Error('檔案中沒有投影片');
        if (Array.isArray(raw.assets) && raw.assets.length) await P.Assets.importAll(raw.assets);
        setDeck(deck); syncDeckAssets();
        state.note = null;
        go('edit');
        toast('已開啟簡報檔');
      } catch (err) { toast('無法開啟：' + err.message, true); }
      ev.target.value = '';
    });
    window.addEventListener('afterprint', () => { $('#print-root').innerHTML = ''; });
  }

  /* ======================================================================
     啟動
     ====================================================================== */
  async function init() {
    bindTop(); bindInput(); bindAssets(); bindProgress(); bindManual(); bindAI();
    bindCanvas(); bindEditor(); bindPicker(); bindEdit(); bindShare();
    await P.Assets.load();
    if (state.deck) P.defaultCover(state.deck);
    resetHistory();
    refreshNav();
    const hash = (location.hash || '').slice(1);
    const legacy = { distill: 'edit', template: 'edit', studio: 'edit', script: 'edit' };
    const view = legacy[hash] || hash;
    go(['edit', 'share'].includes(view) && state.deck ? view : 'input');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
