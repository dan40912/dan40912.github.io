/* ==========================================================================
   qc.js — 品質審查與自動修正
   error：違反硬規則（字數、重點數…），未修正前不能匯出
   warn ：建議調整（標題長度、講稿時間、版型重複…）
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;

  const BAD_OPENING = /^(今天|我今天|大家好|各位好|哈囉|我要(向|跟|和)大家|今天(我|要)(要)?(向|跟|和)?大家(介紹|分享))/;

  P.qcSlide = function (slide, i, deck) {
    const r = P.langRules(deck.meta.lang);
    const out = [];
    const e = (msg) => out.push({ level: 'error', msg });
    const w = (msg) => out.push({ level: 'warn', msg });

    const units = P.slideUnits(slide);
    if (units > r.slideLimit) e(`可見文字 ${units} ${r.unit}，超過 ${r.slideLimit} ${r.unit}上限`);
    if (units === 0) e('這一頁沒有任何可見文字');

    const fields = P.LAYOUTS[slide.layout].fields;
    if (fields.includes('points') && slide.points.length > 3) e(`有 ${slide.points.length} 個重點，最多 3 個`);
    if (fields.includes('steps')) {
      if (slide.steps.length > 3) e(`有 ${slide.steps.length} 個步驟，最多 3 個`);
      if (slide.steps.length < 2) w('流程圖至少需要 2 個步驟');
    }

    if (slide.layout === 'quote') {
      if (!slide.quote) e('金句頁缺少金句');
    } else {
      const tu = P.countUnits(slide.title);
      if (!tu) e('缺少標題');
      else if (tu > r.titleMax + 5) w(`標題 ${tu} ${r.unit}，建議 ${r.titleMin}–${r.titleMax}`);
      else if (tu < r.titleMin - 2 && slide.layout !== 'bignumber') w(`標題只有 ${tu} ${r.unit}，可以更有觀點`);
    }
    if (P.countUnits(slide.subtitle) > r.subtitleMax + 5) w(`副標題偏長（建議 ≤ ${r.subtitleMax}）`);
    slide.points.forEach((p, k) => { if (P.countUnits(p) > r.bodyMax) w(`第 ${k + 1} 點超過 ${r.bodyMax} ${r.unit}`); });
    if (slide.layout === 'bignumber' && !slide.number) e('數字頁缺少數字');
    if (slide.layout === 'contrast' && (!slide.left.label || !slide.right.label)) w('對比頁的左右標籤不完整');
    if (slide.media) {
      const tpl = P.TEMPLATES[deck.meta.template] || P.TEMPLATES.keynote;
      if (P.Assets && !P.Assets.get(slide.media)) w('指定的圖片已被移除');
      else if (!P.mediaShown(deck.meta.template, slide.layout)) w(`「${tpl.label}」模板的 ${slide.layout} 版型不顯示圖片`);
    }

    /* 講稿 */
    const n = slide.notes;
    if (!n.script) w('缺少演講講稿');
    else {
      const est = P.scriptSeconds(n.script, deck.meta.lang);
      if (est > n.seconds * 1.35 + 1) w(`講稿約需 ${Math.round(est)} 秒，但只分配 ${n.seconds} 秒`);
      else if (est < n.seconds * 0.5 - 1) w(`講稿約 ${Math.round(est)} 秒，分配了 ${n.seconds} 秒，可能冷場`);
    }
    if (!n.message) w('缺少本頁核心訊息');

    /* 敘事 */
    if (i === 0) {
      const opener = (slide.title || slide.quote || '') + ' ' + (n.script || '');
      if (BAD_OPENING.test(slide.title || '') || BAD_OPENING.test((n.script || '').trim())) e('開場使用了空泛的介紹句，請改為問題、對比或故事');
      else if (!opener.trim()) w('開場頁需要一個鉤子');
    }
    const prev = deck.slides[i - 1];
    if (prev && prev.layout === slide.layout) w('與上一頁使用相同版型');
    return out;
  };

  P.qcDeck = function (deck) {
    const r = P.langRules(deck.meta.lang);
    const slides = deck.slides.map((s, i) => ({ id: s.id, issues: P.qcSlide(s, i, deck) }));
    const issues = [];
    const n = deck.slides.length;

    if (!n) issues.push({ level: 'error', msg: '簡報沒有任何頁面' });
    const total = P.totalSeconds(deck);
    const target = deck.meta.duration;
    if (n && Math.abs(total - target) > Math.max(3, target * 0.1)) {
      issues.push({ level: 'warn', msg: `各頁秒數合計 ${P.fmtTime(total)}，目標 ${P.fmtTime(target)}` });
    }
    const rec = P.recommendSlides(target);
    if (n && n > rec.max + 2) issues.push({ level: 'warn', msg: `${n} 頁對 ${P.fmtDuration(target)} 來說偏多（建議 ${rec.min}–${rec.max}）` });
    if (n && n < rec.min - 2) issues.push({ level: 'warn', msg: `${n} 頁對 ${P.fmtDuration(target)} 來說偏少（建議 ${rec.min}–${rec.max}）` });
    const kinds = new Set(deck.slides.map((s) => s.layout));
    if (n >= 4 && kinds.size < 3) issues.push({ level: 'warn', msg: '版型變化太少，建議至少使用 3 種版型' });
    const last = deck.slides[n - 1];
    if (last && last.layout !== 'closing' && last.section !== 'closing') issues.push({ level: 'warn', msg: '最後一頁不是收尾頁' });
    if (last && /說服|募資/.test(deck.meta.purpose) && !last.cta) issues.push({ level: 'warn', msg: `演講目的是「${deck.meta.purpose}」，收尾頁需要明確的行動呼籲` });
    if (P.countUnits(deck.distill.bigIdea) > r.bigIdeaMax) issues.push({ level: 'warn', msg: `One Big Idea 超過 ${r.bigIdeaMax} ${r.unit}` });
    if (!deck.distill.bigIdea) issues.push({ level: 'warn', msg: '尚未設定 One Big Idea' });

    P.contentReview(deck).forEach((issue) => {
      const item = { level: issue.level, msg: issue.msg };
      if (issue.page == null) issues.push(item);
      else slides[issue.page].issues.push(item);
    });
    const all = slides.flatMap((s) => s.issues).concat(issues);
    return {
      slides,
      deck: issues,
      errors: all.filter((x) => x.level === 'error').length,
      warns: all.filter((x) => x.level === 'warn').length,
    };
  };

  /* 給 AI 修正用的問題清單 */
  P.qcProblems = function (deck, report) {
    const list = [];
    report.slides.forEach((s, i) => s.issues.forEach((x) => list.push(`第 ${i + 1} 頁：${x.msg}`)));
    report.deck.forEach((x) => list.push(x.msg));
    return list;
  };

  /* 講稿縮到預算字數內：以句子為單位保留，至少留第一句 */
  P.shortenScript = function (script, budget) {
    const sentences = String(script || '').split(/(?<=[。！？!?；;])/).filter((x) => x.trim());
    const units = (x) => P.countUnits(x.replace(/（停頓）|\(pause\)/gi, ''));
    let out = '';
    for (const s of sentences) {
      if (out && units(out + s) > budget) break;
      out += s;
    }
    if (units(out) > budget) out = P.clip(out, budget) + '。';
    return out.trim();
  };

  /* 不用 AI 的「縮短這一頁」：只刪減，不新增任何字 */
  P.shortenSlide = function (slide, lang) {
    const r = P.langRules(lang);
    const before = P.slideUnits(slide);
    const target = Math.max(10, Math.round(before * 0.6));
    const steps = [
      () => (slide.kicker = ''),
      () => (slide.subtitle = ''),
      () => (slide.points = slide.points.map((p) => P.clip(p, 10))),
      () => { slide.left.text = P.clip(slide.left.text, 8); slide.right.text = P.clip(slide.right.text, 8); },
      () => slide.steps.forEach((st) => (st.text = '')),
      () => (slide.cta = P.clip(slide.cta, 10)),
      () => (slide.quote = P.clip(slide.quote, 18)),
      () => (slide.title = P.clip(slide.title, Math.max(r.titleMin, 12))),
    ];
    for (const f of steps) {
      if (P.slideUnits(slide) <= target) break;
      f();
    }
    slide.notes.script = P.shortenScript(slide.notes.script, Math.round(slide.notes.seconds * r.rate * 0.85));
    return { before, after: P.slideUnits(slide) };
  };

  /* 自動修正：保證硬規則一定成立（只刪減，不新增內容） */
  P.autoFix = function (deck) {
    const r = P.langRules(deck.meta.lang);
    const log = [];
    deck.slides.forEach((s, i) => {
      if (s.points.length > 3) { s.points = s.points.slice(0, 3); log.push(`第 ${i + 1} 頁：重點精簡為 3 個`); }
      if (s.steps.length > 3) { s.steps = s.steps.slice(0, 3); log.push(`第 ${i + 1} 頁：步驟精簡為 3 個`); }
      s.points = s.points.map((p) => P.clip(p, r.bodyMax));
      if (P.countUnits(s.subtitle) > r.subtitleMax + 5) { s.subtitle = P.clip(s.subtitle, r.subtitleMax); log.push(`第 ${i + 1} 頁：副標題精簡`); }
      let guard = 0;
      while (P.slideUnits(s) > r.slideLimit && guard++ < 40) {
        // 依序精簡：副標 → 重點 → 對比說明 → 步驟說明 → 小標 → 標題
        if (P.countUnits(s.subtitle) > 8) s.subtitle = P.clip(s.subtitle, P.countUnits(s.subtitle) - 6);
        else if (s.points.length && P.countUnits(s.points.join('')) > 18) {
          const k = s.points.reduce((a, p, j) => (P.countUnits(p) > P.countUnits(s.points[a]) ? j : a), 0);
          s.points[k] = P.clip(s.points[k], Math.max(6, P.countUnits(s.points[k]) - 6));
        } else if (P.countUnits(s.left.text + s.right.text) > 16) {
          s.left.text = P.clip(s.left.text, Math.max(6, P.countUnits(s.left.text) - 4));
          s.right.text = P.clip(s.right.text, Math.max(6, P.countUnits(s.right.text) - 4));
        } else if (s.steps.some((st) => P.countUnits(st.text) > 6)) {
          s.steps.forEach((st) => (st.text = P.clip(st.text, Math.max(4, P.countUnits(st.text) - 4))));
        } else if (s.kicker) s.kicker = '';
        else if (s.subtitle) s.subtitle = '';
        else if (s.points.length) s.points.pop();
        else s.title = P.clip(s.title, Math.max(r.titleMin, P.countUnits(s.title) - 4));
      }
      if (guard) log.push(`第 ${i + 1} 頁：文字精簡至 ${P.slideUnits(s)} ${r.unit}`);
    });
    const total = P.totalSeconds(deck);
    if (deck.slides.length && Math.abs(total - deck.meta.duration) > Math.max(3, deck.meta.duration * 0.1)) {
      P.fitSeconds(deck);
      log.push(`各頁秒數重新分配為合計 ${P.fmtTime(deck.meta.duration)}`);
    }
    if (P.countUnits(deck.distill.bigIdea) > r.bigIdeaMax) {
      deck.distill.bigIdea = P.clip(deck.distill.bigIdea, r.bigIdeaMax);
      log.push('One Big Idea 精簡至字數上限');
    }
    return log;
  };
})();
