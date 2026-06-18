/**
 * Resume-Mentor Wizard 引擎
 * 依 RM_CONFIG 動態渲染步驟、管理狀態(localStorage)、組裝 prompt。
 */
(function () {
  "use strict";
  const C = window.RM_CONFIG;
  const UI = C.ui;
  const STORE_KEY = "rm_wizard_state_v1";
  const SKILLS = window.RM_SKILLS || { ready: false, getSkill() { return null; } };
  const SKILL_RULES = C.skillSelection || {};

  /* ---------- 狀態 ---------- */
  let state = load() || { goal: null, promptLang: "zh", answers: {}, agents: [], stepIndex: 0 };

  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; } }

  /* ---------- 步驟組裝（依分支） ---------- */
  function buildSteps() {
    const steps = [{ kind: "goal" }];
    if (state.goal === "cv") {
      C.cv.questions.forEach((q) => steps.push({ kind: "question", q }));
    } else if (state.goal === "interview") {
      C.interview.questions.forEach((q) => steps.push({ kind: "question", q }));
    } else if (state.goal === "website") {
      steps.push({ kind: "wireframe" });
    }
    if (state.goal) {
      steps.push({ kind: "question", q: C.shared.industries });
      steps.push({ kind: "question", q: C.shared.jobFamilies });
      steps.push({ kind: "question", q: C.shared.seniorities });
      if (state.goal === "cv" || state.goal === "interview") steps.push({ kind: "agents" });
      steps.push({ kind: "result" });
    }
    return steps;
  }

  /* ---------- DOM 小工具 ---------- */
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function addMany(set, items) {
    (items || []).forEach((item) => {
      if (item) set.add(item);
    });
  }

  function effectiveAgentIds() {
    const ids = state.agents.slice();
    if (state.goal === "cv" && state.answers.tone === "harsh" && !ids.includes("devil")) ids.push("devil");
    return ids;
  }

  function effectiveSkillAgentIds() {
    const ids = effectiveAgentIds();
    const reviewIds = (C.agents[state.goal] || []).map((a) => a.id);
    const hasReviewSelection = reviewIds.some((id) => ids.includes(id));
    const chosenReview = hasReviewSelection ? ids.filter((id) => reviewIds.includes(id)) : reviewIds;
    const chosenSpecialists = ids.filter((id) => !reviewIds.includes(id));
    return chosenReview.concat(chosenSpecialists);
  }

  function selectedSkillNames() {
    const names = new Set();
    const goalRules = SKILL_RULES[state.goal] || {};

    addMany(names, goalRules.core);

    if (state.goal === "cv") {
      addMany(names, goalRules.byJobFamily && goalRules.byJobFamily[state.answers.jobFamily]);
      addMany(names, goalRules.byIndustry && goalRules.byIndustry[state.answers.industry]);
      addMany(names, goalRules.byTone && goalRules.byTone[state.answers.tone]);
    }

    if (state.goal === "interview") {
      addMany(names, goalRules.byCompany && goalRules.byCompany[state.answers.company]);
    }

    if (state.goal === "website") {
      addMany(names, goalRules.byWireframe && goalRules.byWireframe[state.answers.wireframe]);
    }

    const agentNames = effectiveSkillAgentIds().flatMap((id) => (SKILL_RULES.agents && SKILL_RULES.agents[id]) || []);
    addMany(names, agentNames);

    return Array.from(names);
  }

  function skillReferenceSection() {
    const names = selectedSkillNames();
    if (!names.length) return "";

    const blocks = names.map((name) => {
      const skill = SKILLS.getSkill(name);
      if (skill && skill.text) return skill.text;
      return [
        `### ${name}`,
        `**Goal:** Apply this skill to the user's selected career goal.`,
        `**Input:** User background, target role, selected agents, and available evidence.`,
        `**Output:** Concrete, truthful, role-specific guidance.`,
        `**Challenge Rules:** Do not invent missing facts; ask follow-up questions when evidence is missing.`,
        `**Review Rules:** Check clarity, relevance, credibility, and actionability.`,
        `**Success Criteria:** The user receives a usable next step without fabricated content.`,
      ].join("\n");
    });

    const note = SKILLS.sourceMode === "markdown"
      ? "以下內容直接從 skills/*.md 讀入，會隨 skill 檔更新而改變。"
      : "以下內容使用內建 skill registry；即使以純 HTML / file:// 開啟，也會注入完整 skill 規則。";

    return [`## /skills 參考`, note, ...blocks].join("\n\n");
  }

  /* ---------- 殼層元素 ---------- */
  const overlay = document.getElementById("wz-overlay");
  const card = document.getElementById("wz-card");
  const stage = document.getElementById("wz-stage");
  const fillEl = document.getElementById("wz-fill");
  const stepCountEl = document.getElementById("wz-stepcount");
  const etaEl = document.getElementById("wz-eta");
  const footer = document.getElementById("wz-footer");
  const prevBtn = document.getElementById("wz-prev");
  const nextBtn = document.getElementById("wz-next");
  const restartBtn = document.getElementById("wz-restart");

  let animating = false;

  /* ---------- 渲染（只重繪卡片內容 + 更新殼層） ---------- */
  function render() {
    const steps = buildSteps();
    if (state.stepIndex >= steps.length) state.stepIndex = steps.length - 1;
    if (state.stepIndex < 0) state.stepIndex = 0;
    const step = steps[state.stepIndex];

    card.innerHTML = "";
    if (step.kind === "goal") renderGoal(card);
    else if (step.kind === "question") renderQuestion(card, step.q);
    else if (step.kind === "wireframe") renderWireframe(card);
    else if (step.kind === "agents") renderAgents(card);
    else if (step.kind === "result") renderResult(card);

    updateChrome(steps, step);
    save();
  }

  /* ---------- 更新進度條 / 步數 / 剩餘 / 導航鈕 ---------- */
  function updateChrome(steps, step) {
    const total = steps.length;
    if (!state.goal) {
      fillEl.style.width = "6%";
      stepCountEl.textContent = UI.startHint;
      etaEl.textContent = "";
    } else {
      const pct = Math.round(((state.stepIndex + 1) / total) * 100);
      fillEl.style.width = pct + "%";
      stepCountEl.textContent = `第 ${state.stepIndex + 1} / ${total} 步`;
      const remaining = Math.max(0, total - 1 - state.stepIndex); // 不含 result
      if (step.kind === "result" || remaining === 0) {
        etaEl.textContent = "";
      } else {
        const mins = Math.ceil((remaining * 20) / 60);
        const t = mins >= 1 ? UI.etaMin.replace("{m}", mins) : UI.etaUnder1;
        etaEl.textContent = `${t} · ${UI.etaLeft.replace("{n}", remaining)}`;
      }
    }
    if (step.kind === "result") {
      footer.hidden = true;
    } else {
      footer.hidden = false;
      prevBtn.disabled = state.stepIndex === 0;
      const isLast = state.stepIndex === total - 2; // 下一步是 result
      nextBtn.textContent = isLast ? UI.generate : UI.next;
      nextBtn.disabled = !canAdvance(step);
    }
  }

  /* ---------- 翻頁（前進/後退動畫，250ms ease-out） ---------- */
  function go(delta) {
    if (animating) return;
    const steps = buildSteps();
    const step = steps[state.stepIndex];
    if (delta > 0 && !canAdvance(step)) return;
    const target = state.stepIndex + delta;
    if (target < 0 || target >= steps.length) return;
    animating = true;
    card.classList.add(delta > 0 ? "is-exit-next" : "is-exit-prev");
    setTimeout(() => {
      state.stepIndex = target;
      render();
      card.classList.remove("is-exit-next", "is-exit-prev");
      const enterCls = delta > 0 ? "is-enter-next" : "is-enter-prev";
      card.classList.add("no-anim", enterCls);
      void card.offsetWidth;
      card.classList.remove("no-anim");
      void card.offsetWidth;
      card.classList.remove(enterCls);
      if (stage) stage.scrollTop = 0;
      setTimeout(() => { animating = false; }, 260);
    }, 250);
  }

  /* ---------- 進入面談 ---------- */
  function enterInterview() {
    overlay.hidden = false;
    document.body.classList.add("wz-lock");
    render();
    if (stage) stage.scrollTop = 0;
  }

  /* ---------- 重新開始 ---------- */
  function doRestart() {
    state = { goal: null, promptLang: state.promptLang, answers: {}, agents: [], stepIndex: 0 };
    render();
  }
  function openRestartModal() {
    openModal({
      title: UI.restartTitle,
      body: UI.restartBody,
      buttons: [
        { label: UI.restartCancel, secondary: true },
        { label: UI.restartConfirm, onClick: doRestart },
      ],
    });
  }

  /* ---------- 成果範例 ---------- */
  function openSampleModal() {
    const s = (C.samples[state.goal] && C.samples[state.goal][state.promptLang]) || "";
    const pre = el("pre", "wz-sample");
    pre.textContent = s;
    openModal({ title: UI.sampleTitle, bodyNode: pre, buttons: [{ label: UI.sampleClose, secondary: true }], wide: true });
  }

  /* ---------- 通用 modal ---------- */
  function openModal(opts) {
    const back = el("div", "wz-modal");
    const box = el("div", "wz-modal-box" + (opts.wide ? " is-wide" : ""));
    if (opts.title) box.appendChild(el("h3", "wz-modal-title", opts.title));
    if (opts.body) box.appendChild(el("p", "wz-modal-body", opts.body));
    if (opts.bodyNode) box.appendChild(opts.bodyNode);
    const row = el("div", "wz-modal-actions");
    (opts.buttons || []).forEach((b) => {
      const btn = el("button", "button" + (b.secondary ? " secondary" : ""), b.label);
      btn.onclick = () => { close(); if (b.onClick) b.onClick(); };
      row.appendChild(btn);
    });
    box.appendChild(row);
    back.appendChild(box);
    back.onclick = (e) => { if (e.target === back) close(); };
    document.body.appendChild(back);
    function close() { back.remove(); }
    return close;
  }

  /* ---------- 鍵盤操作 ---------- */
  function selectByNumber(n) {
    const steps = buildSteps();
    const step = steps[state.stepIndex];
    if (step.kind === "goal") {
      const g = C.goals[n - 1];
      if (!g) return;
      if (state.goal !== g.id) { state.goal = g.id; state.answers = {}; state.agents = []; }
      render();
    } else if (step.kind === "question") {
      const opt = step.q.options[n - 1];
      if (!opt) return;
      toggle(step.q, opt.id, step.q.type === "multi");
      render();
    } else if (step.kind === "wireframe") {
      const w = C.website.wireframes[n - 1];
      if (!w) return;
      state.answers.wireframe = w.id;
      render();
    }
  }
  function onKey(e) {
    if (overlay.hidden) return;
    if (document.querySelector(".wz-modal")) return;
    const tag = ((e.target && e.target.tagName) || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (/^[1-9]$/.test(e.key)) { e.preventDefault(); selectByNumber(parseInt(e.key, 10)); }
  }

  /* ---------- 小提示 ---------- */
  function addHint(body, key) {
    const h = C.hints && C.hints[key];
    if (h) body.appendChild(el("p", "wz-hint", "💡 " + h));
  }

  /* ---------- Step: 目標 ---------- */
  function renderGoal(body) {
    body.appendChild(el("h2", "wz-q", "先問問你：現在最想準備什麼？"));
    addHint(body, "goal");
    const grid = el("div", "wz-grid");
    C.goals.forEach((g, i) => {
      const opt = el("button", "wz-opt-card" + (state.goal === g.id ? " is-on" : ""));
      opt.appendChild(el("span", "wz-key", String(i + 1)));
      const txt = el("div", "wz-opt-text");
      txt.appendChild(el("h3", null, g.label));
      txt.appendChild(el("p", null, g.desc));
      opt.appendChild(txt);
      opt.onclick = () => {
        if (state.goal !== g.id) { state.goal = g.id; state.answers = {}; state.agents = []; }
        render();
      };
      grid.appendChild(opt);
    });
    body.appendChild(grid);
  }

  /* ---------- Step: 一般問題 ---------- */
  function renderQuestion(body, q) {
    body.appendChild(el("h2", "wz-q", q.title));
    addHint(body, q.id);
    const grid = el("div", "wz-grid");
    const isMulti = q.type === "multi";
    q.options.forEach((opt, i) => {
      const selected = isSelected(q, opt.id);
      const card = el("button", "wz-opt-card" + (selected ? " is-on" : ""));
      if (i < 9) card.appendChild(el("span", "wz-key", String(i + 1)));
      card.appendChild(el("span", "wz-opt-label", opt.label));
      card.onclick = () => { toggle(q, opt.id, isMulti); render(); };
      grid.appendChild(card);
    });
    if (q.allowOther) {
      const otherSel = state.answers[q.id] === "__other__";
      const card = el("button", "wz-opt-card" + (otherSel ? " is-on" : ""));
      card.appendChild(el("span", "wz-opt-label", "其他"));
      card.onclick = () => { state.answers[q.id] = "__other__"; render(); };
      grid.appendChild(card);
    }
    body.appendChild(grid);
    if (q.allowOther && state.answers[q.id] === "__other__") {
      const inp = el("input", "wz-other");
      inp.type = "text";
      inp.placeholder = UI.otherPlaceholder;
      inp.value = state.answers[q.id + "_other"] || "";
      inp.oninput = () => { state.answers[q.id + "_other"] = inp.value; save(); };
      body.appendChild(inp);
      setTimeout(() => inp.focus(), 0);
    }
  }

  /* ---------- Step: Wireframe ---------- */
  function renderWireframe(body) {
    const q = C.website.wireframeQuestion;
    body.appendChild(el("h2", "wz-q", q.title));
    addHint(body, "wireframe");
    const grid = el("div", "wz-grid wz-grid-wire");
    C.website.wireframes.forEach((w) => {
      const selected = state.answers.wireframe === w.id;
      const card = el("button", "wz-opt-card wz-wire" + (selected ? " is-on" : ""));
      const thumb = el("div", "wz-wire-thumb");
      if (w.svg) thumb.innerHTML = w.svg;
      else thumb.appendChild(el("span", "wz-wire-ph", w.label));
      card.appendChild(thumb);
      card.appendChild(el("h3", null, w.label));
      card.appendChild(el("p", null, w.desc));
      card.onclick = () => { state.answers.wireframe = w.id; render(); };
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }

  /* ---------- Step: Agents ---------- */
  function isRecommended(a) {
    if (!a.match) return false;
    return a.match.includes(state.answers.jobFamily) || a.match.includes(state.answers.industry);
  }

  function renderAgentCard(grid, a, opts) {
    const selected = state.agents.includes(a.id);
    const forced = !!(opts && opts.forced);
    const card = el("button", "wz-opt-card wz-agent" + (selected || forced ? " is-on" : ""));
    card.appendChild(el("span", "wz-opt-label", a.name));
    card.appendChild(el("p", "wz-agent-focus", a.focusZh));
    if (forced) card.appendChild(el("span", "wz-tag", "已依語氣自動加入"));
    else if (opts && opts.recommended) card.appendChild(el("span", "wz-tag wz-tag-rec", "✨ 推薦"));
    card.onclick = () => {
      if (forced) return;
      const i = state.agents.indexOf(a.id);
      if (i >= 0) state.agents.splice(i, 1); else state.agents.push(a.id);
      render();
    };
    grid.appendChild(card);
  }

  function renderAgents(body) {
    body.appendChild(el("h2", "wz-q", "想找哪些角色，幫你一起看？（可複選）"));
    body.appendChild(el("p", "wz-sub", "這就是你的多代理顧問團：上面是審查／模擬角色，下面是各領域專家。每位都有自己的專長，會一起寫進你的提示詞。"));
    addHint(body, "agents");

    // 快捷操作
    const tools = el("div", "wz-agent-tools");
    const recBtn = el("button", "button secondary wz-mini", "✨ 加入推薦角色");
    recBtn.onclick = () => {
      (C.agents[state.goal] || []).forEach((a) => { if (!state.agents.includes(a.id)) state.agents.push(a.id); });
      (C.agents.specialists || []).forEach((a) => { if (isRecommended(a) && !state.agents.includes(a.id)) state.agents.push(a.id); });
      render();
    };
    const clearBtn = el("button", "button secondary wz-mini", "清除全部");
    clearBtn.onclick = () => { state.agents = []; render(); };
    tools.appendChild(recBtn);
    tools.appendChild(clearBtn);
    body.appendChild(tools);

    // 群組 1：審查 / 模擬角色
    body.appendChild(el("h3", "wz-group", state.goal === "interview" ? "面試考官" : "履歷審查角色"));
    const g1 = el("div", "wz-grid");
    (C.agents[state.goal] || []).forEach((a) => {
      const forced = state.goal === "cv" && state.answers.tone === "harsh" && a.id === "devil";
      renderAgentCard(g1, a, { forced });
    });
    body.appendChild(g1);

    // 群組 2：領域專家
    body.appendChild(el("h3", "wz-group", "領域專家顧問　·　依你的產業／職能挑選"));
    const g2 = el("div", "wz-grid");
    (C.agents.specialists || []).forEach((a) => renderAgentCard(g2, a, { recommended: isRecommended(a) }));
    body.appendChild(g2);
  }

  /* ---------- Step: 結果（完成頁） ---------- */
  function renderResult(body) {
    body.appendChild(el("div", "wz-done-badge", "✅ 已完成分析"));
    body.appendChild(el("h2", "wz-q wz-done-title", "你的 Prompt 已準備完成"));
    body.appendChild(el("p", "wz-sub", UI.resultHint));

    const langWrap = el("div", "wz-lang");
    langWrap.appendChild(el("span", "wz-lang-label", UI.langLabel + "："));
    [["zh", UI.langZh], ["en", UI.langEn]].forEach(([id, label]) => {
      const btn = el("button", "wz-lang-btn" + (state.promptLang === id ? " is-on" : ""), label);
      btn.onclick = () => { state.promptLang = id; render(); };
      langWrap.appendChild(btn);
    });
    body.appendChild(langWrap);

    const pre = el("textarea", "wz-output");
    pre.readOnly = true;
    pre.value = buildPrompt();
    body.appendChild(pre);

    const actions = el("div", "wz-actions");
    const copyBtn = el("button", "button", UI.copy);
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(pre.value).then(() => {
        copyBtn.textContent = UI.copied;
        setTimeout(() => (copyBtn.textContent = UI.copy), 1600);
      }, () => { pre.select(); document.execCommand("copy"); });
    };
    const reBtn = el("button", "button secondary", UI.reinterview);
    reBtn.onclick = openRestartModal;
    const sampleBtn = el("button", "button secondary", UI.viewSample);
    sampleBtn.onclick = openSampleModal;
    actions.appendChild(copyBtn);
    actions.appendChild(reBtn);
    actions.appendChild(sampleBtn);
    body.appendChild(actions);

    const back = el("button", "wz-link-back", UI.backEdit);
    back.onclick = () => go(-1);
    body.appendChild(back);
  }

  function canAdvance(step) {
    if (step.kind === "goal") return !!state.goal;
    if (step.kind === "agents") return true; // 可不選，預設全 council
    if (step.kind === "wireframe") return !!state.answers.wireframe;
    if (step.kind === "question") {
      const q = step.q;
      const v = state.answers[q.id];
      if (q.type === "multi") return Array.isArray(v) && v.length > 0;
      if (q.allowOther && v === "__other__") return !!(state.answers[q.id + "_other"] || "").trim();
      return !!v;
    }
    return true;
  }

  /* ---------- 選取邏輯 ---------- */
  function isSelected(q, optId) {
    const v = state.answers[q.id];
    if (q.type === "multi") return Array.isArray(v) && v.includes(optId);
    return v === optId;
  }
  function toggle(q, optId, isMulti) {
    if (isMulti) {
      const v = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
      const i = v.indexOf(optId);
      if (i >= 0) v.splice(i, 1); else v.push(optId);
      state.answers[q.id] = v;
    } else {
      state.answers[q.id] = optId;
    }
  }

  /* ---------- 取選項文字（依語言） ---------- */
  const isZh = () => state.promptLang === "zh";
  function optText(q, id) {
    const o = (q.options || []).find((x) => x.id === id);
    if (!o) return id;
    return isZh() ? o.promptZh || o.label : o.promptEn || o.promptZh || o.label;
  }
  function singleText(q) {
    const v = state.answers[q.id];
    if (v === "__other__") return state.answers[q.id + "_other"] || (isZh() ? "（其他）" : "(other)");
    return v ? optText(q, v) : "";
  }
  function multiText(q) {
    const v = state.answers[q.id];
    if (!Array.isArray(v) || !v.length) return "";
    return v.map((id) => optText(q, id)).join(isZh() ? "、" : ", ");
  }
  function findQ(branch, id) { return C[branch].questions.find((x) => x.id === id); }

  /* ---------- 背景區塊 ---------- */
  function backgroundLines() {
    const ind = singleText(C.shared.industries);
    const job = singleText(C.shared.jobFamilies);
    const sen = singleText(C.shared.seniorities);
    if (isZh()) return `產業：${ind}\n目標職能：${job}\n年資／職級：${sen}`;
    return `Industry: ${ind}\nTarget function: ${job}\nSeniority: ${sen}`;
  }

  /* ---------- 角色區塊 ---------- */
  function agentLines() {
    let ids = state.agents.slice();
    if (state.goal === "cv" && state.answers.tone === "harsh" && !ids.includes("devil")) ids.push("devil");
    const review = C.agents[state.goal] || [];
    const specialists = C.agents.specialists || [];
    let chosenReview = review.filter((a) => ids.includes(a.id));
    if (!chosenReview.length) chosenReview = review; // 沒選審查角色 → 用整組
    const chosenSpec = specialists.filter((a) => ids.includes(a.id));
    const chosen = chosenReview.concat(chosenSpec);
    return chosen
      .map((a) => {
        const name = isZh() ? a.name : a.name.replace(/（[^）]*）/g, "").trim();
        const sep = isZh() ? "：" : ": ";
        return `- ${name}${sep}${isZh() ? a.ruleZh : a.ruleEn}`;
      })
      .join("\n");
  }

  /* ---------- 組裝 Prompt ---------- */
  function buildPrompt() {
    if (!state.goal) return "";
    if (state.goal === "cv") return buildCV();
    if (state.goal === "interview") return buildInterview();
    if (state.goal === "website") return buildWebsite();
    return "";
  }

  function buildCV() {
    const g = C.guardrail[state.promptLang];
    const status = singleText(findQ("cv", "status"));
    const problems = multiText(findQ("cv", "problems"));
    const formats = multiText(findQ("cv", "formats"));
    const tone = singleText(findQ("cv", "tone"));
    const wants = multiText(findQ("cv", "wants"));
    const hasJD = state.answers.hasJD;
    const wantRewrite = (state.answers.wants || []).includes("rewrite");
    const of = C.outputFormats.cv[state.promptLang];
    const ofRewrite = wantRewrite ? "\n" + C.outputFormats.cvRewrite[state.promptLang] : "";
    const skills = skillReferenceSection();

    if (isZh()) {
      return [
        `# 角色`,
        `你是一個由以下角色組成的履歷審查團隊，請各自從自己的視角審查：`,
        agentLines(),
        g,
        ``,
        `# 我的背景`,
        backgroundLines(),
        `履歷狀態：${status}`,
        `想解決的問題：${problems}`,
        `想要的履歷版本：${formats}`,
        `挑戰語氣：${tone}`,
        ``,
        `# 任務`,
        `請先審查、再行動。我想要的產出：${wants}`,
        `先別急著美化句子；先找出缺口與證據問題，再依需求改寫。`,
        ``,
        skills ? `# 來自 /skills 的參考內容\n${skills}\n` : "",
        `# 我會提供的資料`,
        `履歷：（我會貼在這裡）`,
        hasJD === "yes" ? `目標職缺 JD：（我會貼在這裡）` : `目標職缺：${singleText(findQ("cv", "hasJD"))}`,
        ``,
        `# 輸出格式`,
        of + ofRewrite,
      ].join("\n");
    }
    return [
      `# Role`,
      `You are a resume review team made of the following roles; each reviews from its own perspective:`,
      agentLines(),
      g,
      ``,
      `# My background`,
      backgroundLines(),
      `Resume status: ${status}`,
      `Problems to solve: ${problems}`,
      `Resume versions wanted: ${formats}`,
      `Challenge tone: ${tone}`,
      ``,
      `# Task`,
      `Critique first, then act. Deliverables I want: ${wants}`,
      `Do not polish wording first; find gaps and evidence issues first, then rewrite as needed.`,
      ``,
      skills ? `# /skills reference\n${skills}\n` : "",
      `# What I will provide`,
      `Resume: (I will paste it here)`,
      hasJD === "yes" ? `Target job description: (I will paste it here)` : `Target role: ${singleText(findQ("cv", "hasJD"))}`,
      ``,
      `# Output format`,
      of + ofRewrite,
    ].join("\n");
  }

  function buildInterview() {
    const g = C.guardrail[state.promptLang];
    const rounds = multiText(findQ("interview", "rounds"));
    const company = singleText(findQ("interview", "company"));
    const weak = multiText(findQ("interview", "weakSpots"));
    const wants = multiText(findQ("interview", "wants"));
    const mode = singleText(findQ("interview", "mode"));
    const lang = singleText(findQ("interview", "lang"));
    const wantMock = (state.answers.wants || []).includes("mock");
    const of = C.outputFormats.interviewPerQuestion[state.promptLang];
    const ofMock = wantMock ? "\n" + C.outputFormats.interviewMock[state.promptLang] : "";
    const skills = skillReferenceSection();

    if (isZh()) {
      return [
        `# 角色`,
        `你是一個由以下考官組成的面試模擬團隊，請以對應風格出題與點評：`,
        agentLines(),
        g,
        ``,
        `# 我的背景`,
        backgroundLines(),
        `目標公司風格：${company}`,
        `要準備的面試關卡：${rounds}`,
        `最想練／最弱的環節：${weak}`,
        `面試語言：${lang}`,
        `練習模式：${mode}`,
        ``,
        `# 任務`,
        `請依上述進行面試準備。我希望你做到：${wants}`,
        `每題都要說明考官在測什麼，並使用我提供的真實經歷，不可編造。`,
        ``,
        skills ? `# 來自 /skills 的參考內容\n${skills}\n` : "",
        `# 我會提供的資料`,
        `目標職位／公司：（我會貼在這裡）`,
        `我的 3 個關鍵成就與經歷：（我會貼在這裡）`,
        ``,
        `# 輸出格式`,
        of + ofMock,
      ].join("\n");
    }
    return [
      `# Role`,
      `You are an interview simulation panel made of the following interviewers; ask and critique in their styles:`,
      agentLines(),
      g,
      ``,
      `# My background`,
      backgroundLines(),
      `Target company style: ${company}`,
      `Interview rounds to prepare: ${rounds}`,
      `Areas to practice / weakest: ${weak}`,
      `Interview language: ${lang}`,
      `Practice mode: ${mode}`,
      ``,
      `# Task`,
      `Help me prepare accordingly. I want you to: ${wants}`,
      `For each question, explain what the interviewer is testing; use my real experience, never fabricate.`,
      ``,
      skills ? `# /skills reference\n${skills}\n` : "",
      `# What I will provide`,
      `Target role / company: (I will paste it here)`,
      `My 3 key achievements and experiences: (I will paste it here)`,
      ``,
      `# Output format`,
      of + ofMock,
    ].join("\n");
  }

  function buildWebsite() {
    const g = C.guardrail[state.promptLang];
    const w = C.website.wireframes.find((x) => x.id === state.answers.wireframe);
    const style = w ? (isZh() ? w.promptZh : w.promptEn) : "";
    const of = C.outputFormats.website[state.promptLang];
    const skills = skillReferenceSection();
    if (isZh()) {
      return [
        `# 角色`,
        `你是一位個人品牌網站策略師與文案。`,
        g,
        ``,
        `# 我的背景`,
        backgroundLines(),
        `想要的排版風格：${style}`,
        ``,
        `# 任務`,
        `請依上述排版風格與我的背景，規劃個人網站／作品集。`,
        ``,
        skills ? `# 來自 /skills 的參考內容\n${skills}\n` : "",
        `# 我會提供的資料`,
        `我的經歷、專案與成果：（我會貼在這裡）`,
        ``,
        `# 輸出格式`,
        of,
      ].join("\n");
    }
    return [
      `# Role`,
      `You are a personal-brand website strategist and copywriter.`,
      g,
      ``,
      `# My background`,
      backgroundLines(),
      `Desired layout style: ${style}`,
      ``,
      `# Task`,
      `Plan a personal website/portfolio based on the layout style and my background.`,
      ``,
      skills ? `# /skills reference\n${skills}\n` : "",
      `# What I will provide`,
      `My experience, projects and results: (I will paste it here)`,
      ``,
      `# Output format`,
      of,
    ].join("\n");
  }

  /* ---------- 啟動 ---------- */
  document.querySelectorAll(".js-start-interview").forEach((b) => {
    b.addEventListener("click", (e) => { e.preventDefault(); enterInterview(); });
  });
  prevBtn.onclick = () => go(-1);
  nextBtn.onclick = () => go(1);
  restartBtn.onclick = openRestartModal;
  document.addEventListener("keydown", onKey);
  (async function bootstrap() {
    if (window.RM_SKILL_READY && typeof window.RM_SKILL_READY.then === "function") {
      try {
        await window.RM_SKILL_READY;
      } catch (error) {
        console.warn("[Resume-Mentor] Using fallback prompt without loaded skill markdown.", error);
      }
    }
    render();
  })();
})();
