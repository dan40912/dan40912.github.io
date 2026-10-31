/* Shared content planning and explainable checks; never invents source facts. */
(function () {
  'use strict';
  const P = window.Pitch;
  const sentences = (text) => String(text || '').split(/(?<=[。！？!?；;])|\n+/).map((s) => s.trim()).filter(Boolean);
  const actionRE = /邀請|歡迎|報名|加入|參加|帶[上來一本]|聯絡|預約|試用|立即|invite|join|register|sign up|contact|try it/i;
  P.planContent = function (input) {
    const text = [input.text || '', ...(input.assets || []).map((a) => a.caption || '')].join('\n');
    const list = sentences(text);
    const action = list.filter((s) => /邀請|歡迎|報名|加入|參加|聯絡|預約|試用|invite|join|register|sign up|contact/i.test(s)).pop() || list.filter((s) => actionRE.test(s)).pop() || '';
    const narrative = /求職|面試|自我介紹|履歷|升遷|self.introduction|job fair|promotion|resume/i.test(text) ? 'introduction'
      : /讀書會|社群|活動|聚會|報名|工作坊|community|event|workshop/i.test(text) ? 'invitation'
      : /我曾|那天|當時|後來|經歷|品牌故事|one day|my story/i.test(text) ? 'story'
      : /產品|服務|工具|平台|系統|product|service|platform/i.test(text) ? 'product' : 'insight';
    const core = list.find((s) => /真正|關鍵|而是|核心|發現|the key/i.test(s)) || list[0] || '';
    const uniqueValue = list.find((s) => /只需|只要|每次只|不必|無需|不同|獨特|專長|擅長|only|unlike|speciali[sz]/i.test(s)) || '';
    return { narrative, audience: input.audience || '自動', core, action, uniqueValue,
      evidence: list.filter((s) => /\d|每週|每次|每人|分鐘|章節|例如|比如|for example/i.test(s)).slice(0, 3) };
  };

  // Keep complete clauses even when a suggested title budget is exceeded.
  // Layout/QC can request a rewrite; it must not silently cut a word in half.
  P.completeHeadline = function (text, budget) {
    const clean = String(text || '').trim().replace(/[。！!；;]+$/, '');
    if (P.countUnits(clean) <= budget) return clean;
    const parts = clean.split(/[，,；;：:]/).map((s) => s.trim()).filter(Boolean);
    const fitting = parts.filter((s) => P.countUnits(s) <= budget);
    return fitting.length ? fitting[fitting.length - 1].replace(/^(而是|但是|但)[，,\s]*/, '') : clean;
  };

  P.contentReview = function (deck) {
    const issues = [];
    const add = (page, msg) => issues.push({ page, level: 'warn', msg });
    const key = (s) => String(s || '').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
    const seen = new Map();
    deck.slides.forEach((s, i) => {
      const headline = s.title || s.quote || '';
      const k = key(headline);
      if (k && seen.has(k)) add(i, `與第 ${seen.get(k) + 1} 頁重複主句，請增加新資訊`);
      else if (k) seen.set(k, i);
      if (/^(為什麼|why).{0,2}[？?]?$/i.test(headline)) add(i, '開場問題缺少具體內容');
      if (!s.visual) add(i, '補上這一頁的視覺用途：場景、證據、對比或純文字');
    });
    if (['product', 'introduction'].includes(deck.distill.narrative) && !deck.distill.uniqueValue) {
      add(null, '尚未說清楚獨特價值；請補充與眾不同的做法、能力或原文證據，避免空泛自稱領先');
    }
    const last = deck.slides[deck.slides.length - 1];
    if (last && /^(了解更多|立即行動|今天就開始|一起開始|learn more|act now)[。！!.\s]*$/i.test(last.cta || '')) {
      add(deck.slides.length - 1, '收尾行動太籠統，請說清楚下一步，例如約時間、試用或聯絡方式；不得虛構連結與日期');
    }
    if (last && deck.distill.action && !last.cta) add(deck.slides.length - 1, '素材有明確行動邀請，收尾尚未保留');
    const spoken = deck.slides.reduce((n, s) => n + P.scriptSeconds([s.notes.script, s.notes.transition].filter(Boolean).join(' '), deck.meta.lang), 0);
    if (spoken && (spoken < deck.meta.duration * 0.7 || spoken > deck.meta.duration * 1.2)) {
      add(null, `預估朗讀 ${Math.round(spoken)} 秒，目標 ${deck.meta.duration} 秒；請調整內容或目標時間，勿只重分配秒數`);
    }
    return issues;
  };
})();
