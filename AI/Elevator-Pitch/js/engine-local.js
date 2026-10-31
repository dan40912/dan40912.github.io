/* ==========================================================================
   engine-local.js — 離線「規則式草稿」引擎（非 AI）
   沒有設定 AI 服務時使用：只重新排列、截短使用者原文中的句子，
   不會產生任何原文沒有的事實或數據。結果是一份待編輯的草稿。
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Pitch;

  const CUES = {
    problem: /問題|痛點|困難|浪費|無法|不能|沒辦法|卻|然而|但是|缺乏|太多|太少|太難|麻煩|失敗|錯|風險|擔心|卡住|不夠|沒有/g,
    insight: /其實|關鍵|真正|原來|本質|發現|不是.{1,20}而是|並非|核心|秘密|反而|事實上/g,
    solution: /我們|打造|提供|透過|讓|平台|工具|方法|系統|解決|設計|做一個|開發|服務|流程|步驟/g,
    impact: /提升|降低|節省|增加|減少|成長|結果|改變|效果|目標|價值|幫助|能夠|可以|讓.{1,10}更/g,
  };
  const NUM_RE = /\d[\d,.]*\s*(%|％|倍|萬|億|千|百|人|位|個|次|小時|分鐘|秒|天|週|月|年|元|美元|台幣|字|頁)/;
  const FILLER = /^(今天|我今天|大家好|首先|然後|另外|還有|所以|因此|總之|其實|我發現|我覺得|我想說|簡單來說)[，,、\s]*/;

  function splitSentences(text) {
    return String(text || '')
      .replace(/\r/g, '')
      .split(/(?<=[。！？!?；;])|\n+/)
      .map((s) => s.replace(/^[\s\-•*·\d.、)）]+/, '').trim())
      .filter((s) => P.countUnits(s) >= 4)
      .map((s, i) => {
        const score = {};
        Object.keys(CUES).forEach((k) => (score[k] = (s.match(CUES[k]) || []).length));
        return {
          i, text: s, score,
          question: /[？?]\s*$/.test(s),
          number: NUM_RE.test(s) ? s.match(NUM_RE)[0] : '',
        };
      });
  }

  function pick(list, key, used) {
    let best = null;
    list.forEach((s) => {
      if (used.has(s.i)) return;
      const v = s.score[key] + (key === 'impact' && s.number ? 2 : 0);
      if (v > 0 && (!best || v > best.v)) best = { s, v };
    });
    if (best) used.add(best.s.i);
    return best ? best.s : null;
  }

  /* 一句話 → 標題（第一個子句）＋副標（其餘） */
  function split(s, lang) {
    const r = P.langRules(lang);
    const clean = s.replace(FILLER, '').replace(/[。！!；;]+$/, '');
    const parts = clean.split(/[，,：:]/);
    let title = parts[0];
    let k = 1;
    while (k < parts.length && P.countUnits(title + parts[k]) <= r.titleMax) { title += '，' + parts[k]; k++; }
    const rest = parts.slice(k).join('，');
    return { title: P.completeHeadline(title, r.titleMax + 3), subtitle: P.completeHeadline(rest, r.subtitleMax) };
  }

  /* 偵測「不是 A，而是 B」或「A 是…，B 是…」的對比 */
  function findContrast(list) {
    for (const s of list) {
      const m = s.text.match(/不是(.{1,24}?)[，,]?\s*而是(.{1,24}?)[。！!，,]?$/);
      if (m) return { s, left: m[1], right: m[2] };
      const m2 = s.text.match(/(.{1,6})是(給人|用來|為了)?(.{2,16})的[，,；;](.{1,6})是(給人|用來|為了)?(.{2,16})的/);
      if (m2) return { s, left: m2[1], leftText: (m2[2] || '') + m2[3], right: m2[4], rightText: (m2[5] || '') + m2[6] };
    }
    return null;
  }

  /* 偵測步驟：子句以「先、再、然後、接著、最後、第一…」等順序詞開頭 */
  const STEP_RE = /^(它|你|我們)?(首先|先|第[一二三四]|再|然後|接著|最後)/;
  function findSteps(sol) {
    if (!sol) return null;
    const steps = sol.text.split(/[，,；;：:。]/)
      .map((x) => x.trim())
      .filter((x) => STEP_RE.test(x))
      .map((x) => x.replace(STEP_RE, '').replace(/^(幫你|會|就)/, '').trim())
      .filter((x) => P.countUnits(x) >= 2);
    return steps.length >= 2 ? steps.slice(0, 3) : null;
  }

  /* 數字所在子句（含前一個短子句）作為大數字頁的說明 */
  function numberCaption(s, max) {
    const clauses = s.text.replace(/[。！!；;]+$/, '').split(/[，,]/);
    let k = clauses.findIndex((c) => c.includes(s.number.trim()));
    if (k < 0) k = clauses.length - 1;
    let cap = clauses[k];
    while (k > 0 && P.countUnits(clauses[k - 1] + cap) <= max) { k--; cap = clauses[k] + '，' + cap; }
    return P.clip(cap.replace(FILLER, ''), max);
  }

  const CTA = {
    '說服': '今天，就一起開始。',
    '募資': '會後，讓我們深入聊聊。',
    '介紹': '現在就試試看。',
    '教育': '下一次，試著用一次。',
    '啟發': '從下一次開始改變。',
  };
  const BRIDGE = {
    problem: '那麼，問題出在哪裡？',
    insight: '但真正的關鍵是——',
    solution: '所以，我們這樣做。',
    impact: '這會帶來什麼改變？',
    closing: '最後，',
  };

  P.localGenerate = function (input) {
    const lang = input.lang;
    const r = P.langRules(lang);
    // 文字很少時，把使用者為圖片寫的說明也當成素材
    let text = input.text || '';
    const caps = (input.assets || []).map((a) => a.caption).filter(Boolean);
    if (P.countUnits(text) < 40 && caps.length) text += '\n' + caps.join('。\n') + '。';
    const plan = P.planContent(input);
    const list = splitSentences(text);
    if (!list.length) throw new Error('內容太短，請至少輸入幾句完整的句子。');
    const used = new Set();

    const qSent = list.find((s) => s.question);
    if (qSent) used.add(qSent.i);
    const contrast = findContrast(list);
    if (contrast) used.add(contrast.s.i);
    const problem = pick(list, 'problem', used) || list.find((s) => !used.has(s.i) && used.add(s.i));
    const insight = contrast ? contrast.s : pick(list, 'insight', used);
    const solution = pick(list, 'solution', used);
    const numSent = list.find((s) => s.number && !used.has(s.i));
    if (numSent) used.add(numSent.i);
    const impact = numSent || pick(list, 'impact', used);

    const bigSrc = insight || solution || list[0];
    const bigIdea = P.completeHeadline((plan.core || bigSrc.text).replace(FILLER, ''), r.bigIdeaMax);

    const slides = [];
    const add = (o, src) => {
      const s = P.normalizeSlide(o);
      s.notes.script = s.notes.script || (src ? src.text : '');
      slides.push(s);
      return s;
    };

    /* Hook */
    if (qSent) {
      add({ section: 'hook', layout: 'question', title: P.clip(qSent.text, 22), notes: { message: '用原文中的問題引發好奇。', script: qSent.text + '（停頓）' } });
    } else if (plan.narrative === 'invitation' || plan.narrative === 'story') {
      const opening = problem ? problem.text : list[0].text;
      add({ section: 'hook', layout: 'statement', title: P.completeHeadline(opening, r.titleMax + 5), notes: { message: '以素材中的具體情境建立共鳴。', script: opening } }, problem || list[0]);
    } else {
      const ph = problem ? split(problem.text, lang).title : bigIdea;
      const q = ph.replace(/[？?。！!]+$/, '').replace(/^為什麼/, '').replace(/^(我們|大家)(?!的)/, '');
      add({ section: 'hook', layout: 'question', title: P.clip('為什麼' + q + '？', 22), notes: { message: '以問題開場（規則式產生，建議改寫）。', script: '先問大家一個問題。（停頓）' + (problem ? problem.text : '') } });
    }

    /* Problem：開場已用了第一個問題句，這裡優先用第二個，避免重複 */
    let pSrc = problem;
    if (!qSent && problem) {
      const after = list.find((s) => s.i === problem.i + 1 && !used.has(s.i));
      pSrc = pick(list, 'problem', used) || after || problem;
      if (pSrc === after) used.add(after.i);
    }
    if (pSrc) {
      let t = split(pSrc.text, lang);
      // 仍是同一句時，把後半句升為標題：開場提問，這頁回答
      if (!qSent && pSrc === problem && t.subtitle) t = { title: P.clip(t.subtitle, r.titleMax + 3), subtitle: '' };
      add({ section: 'problem', layout: 'statement', kicker: '問題', title: t.title, subtitle: t.subtitle, notes: { message: '讓觀眾理解問題為何值得解決。' } }, pSrc);
    }

    /* Insight */
    if (contrast) {
      add({
        section: 'insight', layout: 'contrast', kicker: '洞察',
        title: P.clip(bigIdea, r.titleMax + 3),
        left: { label: P.clip(contrast.left, 8), text: P.clip(contrast.leftText || '', 14) },
        right: { label: P.clip(contrast.right, 8), text: P.clip(contrast.rightText || '', 14) },
        notes: { message: '翻轉觀眾原本的認知。' },
      }, contrast.s);
    } else if (insight) {
      add({ section: 'insight', layout: 'quote', quote: P.clip(insight.text.replace(FILLER, ''), 34), notes: { message: '提出核心洞察。' } }, insight);
    }

    /* Solution */
    if (solution) {
      const steps = findSteps(solution);
      const t = split(solution.text, lang);
      if (steps) {
        add({ section: 'solution', layout: 'diagram', kicker: '解法', title: t.title, steps: steps.map((x) => ({ label: P.clip(x, 12), text: '' })), notes: { message: '用流程說明解法。' } }, solution);
      } else {
        add({ section: 'solution', layout: 'statement', kicker: '解法', title: t.title, subtitle: t.subtitle, notes: { message: '清楚說明解法。' } }, solution);
      }
    }

    /* 長時間演講：用剩下的句子補充內容頁（只用原文） */
    const rec = P.recommendSlides(input.duration);
    const rest = list.filter((s) => !used.has(s.i) && s !== impact);
    const room = Math.max(0, rec.min - 2 - slides.length);
    for (let k = 0; k < room && k < rest.length; k++) {
      const src = rest[k];
      used.add(src.i);
      const t = split(src.text, lang);
      const layout = k % 2 ? 'story' : 'statement';
      const sec = src.score.problem > src.score.solution ? 'problem' : src.score.impact ? 'impact' : 'solution';
      const s = P.normalizeSlide({ section: sec, layout, title: t.title, subtitle: t.subtitle, notes: { message: '補充說明。', script: src.text } });
      // 插在 Closing 之前、Impact 之前的位置
      slides.push(s);
    }

    /* Impact */
    if (impact) {
      if (impact.number) {
        const num = impact.number.replace(/\s+/g, '');
        add({ section: 'impact', layout: 'bignumber', number: num, title: numberCaption(impact, r.titleMax + 3), notes: { message: '用原文中的數字讓價值具體化。' } }, impact);
      } else {
        const t = split(impact.text, lang);
        add({ section: 'impact', layout: 'story', kicker: '改變', title: t.title, subtitle: t.subtitle, notes: { message: '呈現帶來的改變。' } }, impact);
      }
    }

    /* Closing */
    const needCTA = !!plan.action || /說服|募資|介紹/.test(input.purpose);
    add({
      section: 'closing', layout: 'closing',
      title: P.completeHeadline(bigIdea, r.titleMax + 3),
      subtitle: '',
      cta: plan.action || (needCTA ? CTA[input.purpose] || CTA['說服'] : ''),
      notes: { message: '呼應開場，留下一句核心主張。', script: '如果今天只記得一件事，請記得：（停頓）' + bigIdea + '。' + (plan.action || (needCTA ? (CTA[input.purpose] || '') : '')) },
    });

    /* 短講頁數上限：依角色優先順序刪頁，開場與收尾一定保留 */
    const KEEP = { hook: 0, closing: 0, insight: 1, impact: 2, problem: 3, solution: 4 };
    while (slides.length > rec.max) {
      let k = -1;
      slides.forEach((s, i) => {
        if (i === 0 || i === slides.length - 1) return;
        if (k < 0 || KEEP[s.section] >= KEEP[slides[k].section]) k = i;
      });
      if (k < 0) break;
      slides.splice(k, 1);
    }

    /* 銜接語 + 依講稿長度分配時間 */
    slides.forEach((s, i) => {
      const next = slides[i + 1];
      s.notes.transition = next ? (BRIDGE[next.section] && next.section !== s.section ? BRIDGE[next.section] : '接下來，') : '';
      s.visual = s.visual || '依版型預設：大字、高對比、大量留白。';
    });

    const deck = P.normalizeDeck({
      meta: {
        title: P.completeHeadline(bigIdea, 15), duration: input.duration, audience: input.audience,
        purpose: input.purpose, lang, source: 'local',
      },
      distill: {
        bigIdea,
        narrative: plan.narrative, action: plan.action, evidence: plan.evidence, uniqueValue: plan.uniqueValue,
        problem: problem ? problem.text : '',
        insight: insight ? insight.text : '',
        takeaway: bigIdea,
        storyline: slides.map((s) => ({ section: s.section, beat: s.notes.message })),
      },
      slides,
    });
    P.fitSeconds(deck, deck.slides.map((s) => Math.max(3, P.scriptSeconds(s.notes.script, lang))));
    return deck;
  };
})();
