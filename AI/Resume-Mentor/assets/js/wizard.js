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
  function blankState(promptLang) {
    return { v: C.configVersion, goal: null, promptLang: promptLang || "zh", answers: {}, agents: [], stepIndex: 0 };
  }

  let state = load() || blankState();
  // 有沒有一份「上次沒做完」的進度，決定進 wizard 時要不要先問接續／重來
  let hasResumableState = !!(state.goal && state.stepIndex > 0);

  function save() {
    try {
      state.v = C.configVersion;
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  /**
   * 讀回進度。config 改版（configVersion 不符）就整份丟掉，
   * 否則舊的問題／選項 id 會殘留，最後被 optText() 原封不動寫進提示詞。
   */
  function load() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; }
    if (!raw || typeof raw !== "object") return null;
    if (raw.v !== C.configVersion) return null;
    if (raw.goal && !C.goals.some((g) => g.id === raw.goal && !g.disabled)) return null;
    return {
      v: C.configVersion,
      goal: raw.goal || null,
      promptLang: raw.promptLang === "en" ? "en" : "zh",
      answers: pruneAnswers(raw.goal, raw.answers),
      agents: Array.isArray(raw.agents) ? raw.agents.filter((id) => knownAgentIds(raw.goal).has(id)) : [],
      stepIndex: Number.isInteger(raw.stepIndex) && raw.stepIndex >= 0 ? raw.stepIndex : 0,
    };
  }

  function knownAgentIds(goal) {
    const ids = new Set();
    (C.agents[goal] || []).forEach((a) => ids.add(a.id));
    (C.agents.specialists || []).forEach((a) => ids.add(a.id));
    return ids;
  }

  /** 只留下目前 config 仍然認得的答案，避免無效 id 進入提示詞。 */
  function pruneAnswers(goal, answers) {
    if (!answers || typeof answers !== "object" || !goal) return {};
    const questions = new Map();
    Object.values(C.shared || {}).forEach((q) => q && q.id && questions.set(q.id, q));
    ((C[goal] && C[goal].questions) || []).forEach((q) => q && q.id && questions.set(q.id, q));

    const clean = {};
    Object.entries(answers).forEach(([key, value]) => {
      if (key === "wireframe") {
        if ((C.website.wireframes || []).some((w) => w.id === value)) clean[key] = value;
        return;
      }
      if (key.endsWith("_other")) return; // 跟著它的主答案一起處理
      const q = questions.get(key);
      if (!q) return;
      const valid = (id) => id === "__other__" ? !!q.allowOther : (q.options || []).some((o) => o.id === id);
      if (q.type === "multi") {
        const kept = (Array.isArray(value) ? value : []).filter(valid);
        if (kept.length) clean[key] = kept;
      } else if (valid(value)) {
        clean[key] = value;
        if (value === "__other__" && answers[key + "_other"]) clean[key + "_other"] = answers[key + "_other"];
      }
    });
    return clean;
  }

  /* ---------- 步驟組裝（依分支） ---------- */
  function buildSteps() {
    const steps = [{ kind: "goal" }];
    if (state.goal === "encourage") {
      (C.encourage.questions || []).forEach((q) => steps.push({ kind: "question", q }));
    } else if (state.goal) {
      steps.push({ kind: "question", q: C.shared.sourcePack });
      steps.push({ kind: "question", q: C.shared.goalOutcome });
      steps.push({ kind: "question", q: C.shared.industries });
      steps.push({ kind: "question", q: C.shared.jobFamilies });
      steps.push({ kind: "question", q: C.shared.seniorities });
      steps.push({ kind: "question", q: C.shared.tone });
      if (state.goal === "cv") {
        C.cv.questions.forEach((q) => steps.push({ kind: "question", q }));
      } else if (state.goal === "linkedin") {
        C.linkedin.questions.forEach((q) => steps.push({ kind: "question", q }));
      } else if (state.goal === "recommendation") {
        C.recommendation.questions.forEach((q) => steps.push({ kind: "question", q }));
      } else if (state.goal === "assessment") {
        C.assessment.questions.forEach((q) => steps.push({ kind: "question", q }));
      } else if (state.goal === "interview") {
        C.interview.questions.forEach((q) => steps.push({ kind: "question", q }));
      } else if (state.goal === "website") {
        steps.push({ kind: "wireframe" });
      }
    }
    if (state.goal) {
      // 每條啟用路線都要能挑顧問；jobs 尚未開放，沒有對應的 agent 群組。
      if (C.agents[state.goal]) steps.push({ kind: "agents" });
      steps.push({ kind: "result" });
    }
    return steps;
  }

  /* ---------- DOM 小工具 ---------- */
  /** 一律用 textContent：提示詞內含使用者自由輸入的「其他」欄位，不能走 innerHTML。 */
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /** 只給我們自己產生的 SVG 標記用（剪影），不接受任何使用者輸入。 */
  function elHTML(tag, cls, html) {
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

  /** 語氣選「嚴格」時自動加入毒舌角色 —— 但只在這條路線真的有這位顧問時。 */
  function isForcedDevil(agentId) {
    return agentId === "devil"
      && state.answers.tone === "harsh"
      && (C.agents[state.goal] || []).some((a) => a.id === "devil");
  }

  /**
   * 使用者實際選到的顧問（含依語氣自動加入的）。
   * 提示詞與 skill 選取都走這裡，避免兩邊各寫一份規則而不一致。
   */
  function effectiveAgentIds() {
    const ids = state.agents.slice();
    if (isForcedDevil("devil") && !ids.includes("devil")) ids.push("devil");
    return ids;
  }

  /**
   * 顧問顯示名稱。設定檔存的是「Recruiter（招募專員）」這種雙語格式，
   * 中文情境只取中文、英文情境只取英文，避免全站中英夾雜。
   */
  const HAS_CJK = /[㐀-鿿]/;
  function displayName(agent, lang) {
    const raw = String(agent.name || "");
    const m = raw.match(/^(.*?)（(.+)）\s*$/);
    if (!m) return raw;
    const outside = m[1].trim();
    const inside = m[2].trim();
    if (lang === "en") return HAS_CJK.test(outside) ? inside : outside;
    return HAS_CJK.test(outside) ? outside : inside;
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

    if (state.goal === "linkedin") {
      addMany(names, goalRules.byFocus && state.answers.focus && state.answers.focus.map((id) => goalRules.byFocus[id]).flat());
      addMany(names, goalRules.byAudience && goalRules.byAudience[state.answers.audience]);
      addMany(names, goalRules.byIndustry && goalRules.byIndustry[state.answers.industry]);
    }

    if (state.goal === "recommendation") {
      addMany(names, goalRules.byUseCase && goalRules.byUseCase[state.answers.useCase]);
      addMany(names, goalRules.byRelationship && goalRules.byRelationship[state.answers.relationship]);
    }

    if (state.goal === "assessment") {
      addMany(names, goalRules.byType && goalRules.byType[state.answers.assessmentType]);
      addMany(names, goalRules.byFormat && goalRules.byFormat[state.answers.format]);
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

  /**
   * 從 skill 全文裡抽出真正會改變 AI 行為的三個欄位。
   * Category / Input / Output / Review Rules 是給人看的樣板，全文注入只會稀釋指令，
   * 所以不進提示詞（使用者仍可在結果頁點 skill 看完整原文）。
   */
  const SKILL_KEEP_FIELDS = ["Goal", "Challenge Rules", "Success Criteria"];

  function condenseSkill(name) {
    const skill = SKILLS.getSkill(name);
    const text = (skill && skill.text) || "";
    const lines = [];
    SKILL_KEEP_FIELDS.forEach((field) => {
      const m = text.match(new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`));
      if (m) lines.push(`- ${field}: ${m[1].trim()}`);
    });
    if (!lines.length) {
      lines.push(`- Goal: Apply this skill to the user's selected career goal.`);
      lines.push(`- Challenge Rules: Do not invent missing facts; ask follow-up questions when evidence is missing.`);
      lines.push(`- Success Criteria: The user receives a usable next step without fabricated content.`);
    }
    return [`**${name}**`, ...lines].join("\n");
  }

  function skillReferenceSection() {
    const limit = C.skillPackLimit || 8;
    const names = selectedSkillNames().slice(0, limit);
    if (!names.length) return "";
    return names.map(condenseSkill).join("\n\n");
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
  const closeBtn = document.getElementById("wz-close");

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
  // 記住是誰打開 wizard 的，關閉時把焦點還回去
  let lastTrigger = null;

  function showWizard() {
    overlay.hidden = false;
    document.body.classList.add("wz-lock");
    render();
    if (stage) stage.scrollTop = 0;
    focusFirst();
  }

  function openWizard(goalId, trigger) {
    lastTrigger = trigger || document.activeElement || null;

    if (goalId && C.goals.some((g) => g.id === goalId && !g.disabled)) {
      if (state.goal !== goalId) {
        state.goal = goalId;
        state.answers = {};
        state.agents = [];
      }
      state.stepIndex = 1;
      hasResumableState = false;
      showWizard();
      return;
    }

    // 沒指定路線 → 若上次還有未完成的進度，先問要接續還是重來，
    // 不要把回訪者直接丟回上次的半成品（常常就是結果頁）。
    if (hasResumableState) {
      hasResumableState = false;
      openModal({
        title: UI.resumeTitle,
        body: UI.resumeBody,
        buttons: [
          { label: UI.resumeRestart, secondary: true, onClick: () => { doRestart(); showWizard(); } },
          { label: UI.resumeContinue, onClick: showWizard },
        ],
      });
      return;
    }
    showWizard();
  }

  function closeWizard() {
    overlay.hidden = true;
    document.body.classList.remove("wz-lock");
    save();
    // 下次再打開時，如果還沒做完就該問要不要接續
    hasResumableState = !!(state.goal && state.stepIndex > 0);
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    lastTrigger = null;
  }

  const FOCUSABLE = 'button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function focusFirst() {
    const target = card.querySelector(FOCUSABLE) || nextBtn;
    if (target && typeof target.focus === "function") target.focus();
  }

  /** 把 Tab 圈在 overlay 內，避免焦點跑到底下已被遮住的首頁。 */
  function trapFocus(e) {
    if (e.key !== "Tab" || overlay.hidden) return;
    if (document.querySelector(".wz-modal")) return; // modal 自己處理
    const items = Array.from(overlay.querySelectorAll(FOCUSABLE)).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- 重新開始 ---------- */
  function doRestart() {
    state = blankState(state.promptLang);
    hasResumableState = false;
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

    // modal 自己吃掉 Esc（onKey 在有 modal 時會略過，否則 Esc 會完全沒作用）
    function onModalKey(e) {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    }
    document.addEventListener("keydown", onModalKey, true);

    const firstBtn = row.querySelector("button");
    if (firstBtn) firstBtn.focus();

    function close() {
      document.removeEventListener("keydown", onModalKey, true);
      back.remove();
      if (!overlay.hidden) focusFirst();
    }
    return close;
  }

  function openSkillPreview(name) {
    const skill = SKILLS.getSkill(name);
    const title = skill ? skill.title : name;
    const body = el("div", "wz-skill-preview");
    const meta = el("p", "wz-modal-body", skill && skill.fileId ? `來源：${skill.fileId === "fallback" ? "內建規則" : skill.fileId}` : "來源：內建規則庫");
    body.appendChild(meta);
    const pre = el("pre", "wz-sample wz-skill-preview-pre");
    pre.textContent = skill && skill.text ? skill.text : `### ${name}\n\nNo skill text found.`;
    body.appendChild(pre);
    openModal({ title, bodyNode: body, buttons: [{ label: UI.sampleClose, secondary: true }], wide: true });
  }

  /* ---------- 鍵盤操作 ---------- */
  function selectByNumber(n) {
    const steps = buildSteps();
    const step = steps[state.stepIndex];
    if (step.kind === "goal") {
      const g = C.goals[n - 1];
      if (!g || g.disabled) return;
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
    if (e.key === "Tab") { trapFocus(e); return; }
    if (document.querySelector(".wz-modal")) return;
    if (e.key === "Escape") { e.preventDefault(); closeWizard(); return; }
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
      const disabled = !!g.disabled || !!g.comingSoon;
      const opt = el("button", "wz-opt-card wz-goal-card" + (state.goal === g.id ? " is-on" : "") + (disabled ? " is-disabled" : ""));
      if (disabled) opt.disabled = true;
      opt.appendChild(el("span", "wz-key", String(i + 1)));
      const top = el("div", "wz-goal-top");
      const txt = el("div", "wz-opt-text");
      txt.appendChild(el("h3", "wz-goal-title", g.label));
      txt.appendChild(el("p", "wz-goal-desc", g.desc));
      top.appendChild(txt);
      if (disabled) top.appendChild(el("span", "wz-goal-badge", "即將推出"));
      opt.appendChild(top);
      opt.onclick = () => {
        if (disabled) return;
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

  // 每個 agent 對應到顧問團那套真人剪影圖（沒有完全對應的取最接近的概念）
  const AGENT_IMG = {
    recruiter: "02-recruiter-agent", hm: "03-hiring-manager-agent", ats: "04-ats-system-agent",
    ceo: "14-ceo-agent", devil: "06-devils-advocate-agent", coach: "10-interview-coach-agent",
    headhunter: "13-executive-recruiter-agent",
    google: "03-hiring-manager-agent", amazon: "08-jd-match-agent", binance: "25-compliance-agent",
    startup: "28-startup-founder-agent", exec: "13-executive-recruiter-agent",
    "li-strategist": "19-linkedin-optimizer-agent", "li-search": "02-recruiter-agent",
    "li-story": "11-star-story-agent", "li-tone": "20-personal-branding-agent",
    referee: "10-interview-coach-agent", credibility: "05-evidence-agent",
    tone: "20-personal-branding-agent", guardrail: "30-no-fabrication-guardrail-agent",
    "assessment-designer": "01-career-architect-agent", "bias-checker": "25-compliance-agent",
    rolefit: "09-career-gap-analyzer-agent", framer: "11-star-story-agent",
    "sp-finance": "14-ceo-agent", "sp-hr": "24-promotion-coach-agent", "sp-amlkyc": "26-aml-agent",
    "sp-compliance": "25-compliance-agent", "sp-pm": "16-product-director-agent",
    "sp-eng": "17-engineering-manager-agent", "sp-design": "18-design-director-agent",
    "sp-data": "08-jd-match-agent", "sp-growth": "29-growth-agent", "sp-sales": "23-salary-negotiation-agent",
    "sp-startup": "28-startup-founder-agent", "sp-ops": "15-coo-agent",
    buddy: "01-career-architect-agent", warm: "10-interview-coach-agent", cheer: "28-startup-founder-agent",
    mirror: "05-evidence-agent", veteran: "13-executive-recruiter-agent",
    // 個人網站 / 作品集路線
    portfolio: "21-portfolio-agent", "gh-profile": "22-github-profile-agent",
    brand: "20-personal-branding-agent", "site-rewrite": "07-resume-rewrite-agent",
    narrative: "12-leadership-agent",
  };

  function renderAgentCard(grid, a, opts) {
    const selected = state.agents.includes(a.id);
    const forced = !!(opts && opts.forced);
    const card = el("button", "wz-opt-card wz-agent" + (selected || forced ? " is-on" : ""));
    const imgFile = AGENT_IMG[a.id];
    if (imgFile) {
      const figure = el("div", "wz-agent-figure");
      const img = document.createElement("img");
      img.src = "assets/images/agents/mentors-clean/" + imgFile + ".png";
      img.alt = "";
      img.loading = "lazy";
      figure.appendChild(img);
      card.appendChild(figure);
    } else if (window.RM_SILHOUETTES && a.pose) {
      const figure = elHTML("div", "wz-agent-figure wz-agent-figure-svg", window.RM_SILHOUETTES.svg(a.pose));
      card.appendChild(figure);
    }
    const text = el("div", "wz-agent-text");
    text.appendChild(el("span", "wz-opt-label", displayName(a, "zh")));
    text.appendChild(el("p", "wz-agent-focus", a.focusZh));
    if (a.persona) text.appendChild(el("p", "wz-agent-persona", a.persona));
    if (forced) text.appendChild(el("span", "wz-tag", "已依語氣自動加入"));
    else if (opts && opts.recommended) text.appendChild(el("span", "wz-tag wz-tag-rec", "✨ 推薦"));
    card.appendChild(text);
    card.onclick = () => {
      if (forced) return;
      const i = state.agents.indexOf(a.id);
      if (i >= 0) state.agents.splice(i, 1); else state.agents.push(a.id);
      render();
    };
    grid.appendChild(card);
  }

  // 每條路線的「審查／模擬角色」群組標題（原本一律寫「履歷審查角色」）
  const AGENT_GROUP_LABEL = {
    cv: "履歷審查角色",
    interview: "面試考官",
    linkedin: "LinkedIn 顧問",
    recommendation: "推薦文顧問",
    assessment: "適性測驗顧問",
    website: "個人網站顧問",
    encourage: "挺你的人",
  };

  function renderAgents(body) {
    const isEncourage = state.goal === "encourage";
    body.appendChild(el("h2", "wz-q", isEncourage ? "想找誰來挺你？（可複選）" : "想找哪些角色，幫你一起看？（可複選）"));
    body.appendChild(el("p", "wz-sub", isEncourage
      ? "這是一群會挺你的人，每個用自己的方式給你力量。不知道選誰？按「✨ 加入推薦角色」就好。"
      : "這就是你的多代理顧問團：上面是審查／模擬角色，下面是各領域專家。每位都有自己的專長，會一起寫進你的提示詞。"));
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
    body.appendChild(el("h3", "wz-group", AGENT_GROUP_LABEL[state.goal] || "審查角色"));
    const g1 = el("div", "wz-grid wz-grid-agents");
    (C.agents[state.goal] || []).forEach((a) => {
      const forced = state.goal === "cv" && state.answers.tone === "harsh" && a.id === "devil";
      renderAgentCard(g1, a, { forced });
    });
    body.appendChild(g1);

    // 群組 2：領域專家（打氣路線不需要）
    if (!isEncourage) {
      body.appendChild(el("h3", "wz-group", "領域專家顧問　·　依你的產業／職能挑選"));
      const g2 = el("div", "wz-grid wz-grid-agents");
      (C.agents.specialists || []).forEach((a) => renderAgentCard(g2, a, { recommended: isRecommended(a) }));
      body.appendChild(g2);
    }
  }

  function parsePromptSections(prompt) {
    return String(prompt || "")
      .split(/\n(?=# )/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const lines = block.split("\n");
        const title = (lines.shift() || "").replace(/^#\s*/, "");
        return { title, body: lines.join("\n").trim() };
      });
  }

  function renderPromptSections(body, prompt) {
    const sections = parsePromptSections(prompt);
    if (!sections.length) return;
    body.appendChild(el("h3", "wz-group", UI.sectionsTitle));
    const wrap = el("div", "wz-section-cards");
    sections.forEach((section) => {
      const card = el("button", "wz-section-card");
      card.type = "button";
      card.appendChild(el("span", "wz-section-kicker", section.title));
      const preview = section.body.split("\n").slice(0, 4).join("\n");
      card.appendChild(el("pre", "wz-section-preview", preview));
      card.onclick = () => {
        openModal({
          title: section.title,
          bodyNode: el("pre", "wz-sample wz-section-full", `${section.title}\n${section.body}`),
          buttons: [{ label: UI.sampleClose, secondary: true }],
          wide: true,
        });
      };
      wrap.appendChild(card);
    });
    body.appendChild(wrap);
  }

  function renderSkillPack(body) {
    const names = selectedSkillNames();
    if (!names.length) return;
    body.appendChild(el("h3", "wz-group", UI.skillPackTitle));
    const wrap = el("div", "wz-skill-pack");
    names.slice(0, C.skillPackLimit || 8).forEach((name) => {
      const btn = el("button", "wz-skill-pill", name);
      btn.type = "button";
      btn.onclick = () => openSkillPreview(name);
      wrap.appendChild(btn);
    });
    body.appendChild(wrap);
  }

  /* ---------- Step: 結果（完成頁） ---------- */
  function renderResult(body) {
    body.appendChild(el("div", "wz-done-badge", "✅ 已產生"));
    body.appendChild(el("h2", "wz-q wz-done-title", "你的提示詞，已經做好了。"));
    body.appendChild(el("p", "wz-sub", "直接複製貼給 ChatGPT、Claude 或任何 AI。也可以在下面直接修改，補上你的 LinkedIn、GitHub 連結或任何細節，再複製。"));

    // 語言切換
    const langWrap = el("div", "wz-lang");
    langWrap.appendChild(el("span", "wz-lang-label", UI.langLabel + "："));
    [["zh", UI.langZh], ["en", UI.langEn]].forEach(([id, label]) => {
      const btn = el("button", "wz-lang-btn" + (state.promptLang === id ? " is-on" : ""), label);
      btn.onclick = () => { state.promptLang = id; render(); };
      langWrap.appendChild(btn);
    });
    body.appendChild(langWrap);

    // 可編輯的完整提示詞（放最上面，第一眼就看到）
    const prompt = buildPrompt();
    const pre = el("textarea", "wz-output wz-output-edit");
    pre.value = prompt;
    pre.spellcheck = false;
    pre.setAttribute("aria-label", "提示詞內容，可直接編輯");
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
    actions.appendChild(copyBtn);
    actions.appendChild(reBtn);
    if (C.samples[state.goal]) {
      const sampleBtn = el("button", "button secondary", UI.viewSample);
      sampleBtn.onclick = openSampleModal;
      actions.appendChild(sampleBtn);
    }
    body.appendChild(actions);

    // 拆解好的區塊 ＋ 這次真正用到的顧問規則
    renderPromptSections(body, prompt);
    renderSkillPack(body);

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
  function findQ(branch, id) {
    if (branch === "shared") return C.shared[id] || null;
    return C[branch].questions.find((x) => x.id === id);
  }

  function sourcePackText() {
    return multiText(findQ("shared", "sourcePack"));
  }

  function goalOutcomeText() {
    return multiText(findQ("shared", "goalOutcome"));
  }

  function toneText() {
    return singleText(findQ("shared", "tone"));
  }

  function sharedContextLines() {
    const source = sourcePackText();
    const outcome = goalOutcomeText();
    const tone = toneText();
    const lines = [];
    if (source) lines.push(isZh() ? `手上材料：${source}` : `Available materials: ${source}`);
    if (outcome) lines.push(isZh() ? `這次目標：${outcome}` : `Primary outcome: ${outcome}`);
    if (tone) lines.push(isZh() ? `挑戰語氣：${tone}` : `Challenge tone: ${tone}`);
    return lines.join("\n");
  }

  /* ---------- 背景區塊 ---------- */
  function backgroundLines() {
    const ind = singleText(C.shared.industries);
    const job = singleText(C.shared.jobFamilies);
    const sen = singleText(C.shared.seniorities);
    if (isZh()) return `產業：${ind}\n目標職能：${job}\n年資／職級：${sen}`;
    return `Industry: ${ind}\nTarget function: ${job}\nSeniority: ${sen}`;
  }

  /* ---------- 角色區塊 ---------- */
  function chosenAgents() {
    const ids = effectiveAgentIds();
    const review = C.agents[state.goal] || [];
    const specialists = C.agents.specialists || [];
    let chosenReview = review.filter((a) => ids.includes(a.id));
    if (!chosenReview.length) chosenReview = review; // 沒選審查角色 → 用整組
    return chosenReview.concat(specialists.filter((a) => ids.includes(a.id)));
  }

  function agentLines() {
    const lang = state.promptLang;
    const sep = isZh() ? "：" : ": ";
    return chosenAgents()
      .map((a) => `- ${displayName(a, lang)}${sep}${isZh() ? a.ruleZh : a.ruleEn}`)
      .join("\n");
  }

  /* ---------- 打氣路線 ---------- */
  function buildEncourage() {
    const g = C.guardrail[state.promptLang];
    const mood = multiText(findQ("encourage", "mood"));
    const support = singleText(findQ("encourage", "support"));
    if (isZh()) {
      return [
        `# 角色`,
        `你是一群真心挺使用者的人，請各自用自己的方式回應、給他力量：`,
        agentLines(),
        g,
        ``,
        `# 我的背景`,
        mood ? `我最近最累的是：${mood}` : "",
        support ? `我想要的陪伴方式：${support}` : "",
        ``,
        `# 任務`,
        `先接住情緒，再給力量。請依「我想要的陪伴方式」調整語氣。不要說教、不要急著叫我振作、不要否定我的感受。可以具體提醒我做過的事、我的價值，以及這一切會過去。最後給我一兩個今天就能做、很小的下一步。`,
        ``,
        `# 我會提供的資料`,
        `我最近的狀況：（我會貼在這裡）`,
        ``,
        `# 輸出格式`,
        [
          `1. 先同理：用兩三句話讓我知道你懂我現在的感受。`,
          `2. 看見我：具體點出我（從我提供的內容裡）做過、但自己低估的努力與價值。`,
          `3. 打氣：用溫暖、相信我的語氣，提醒我為什麼撐得過去。`,
          `4. 一小步：給 1–2 個今天就能做、低負擔的小行動。`,
          `語氣全程溫暖、真誠、不油膩；不要列我的缺點，不要批評。`,
        ].join("\n"),
      ].join("\n");
    }
    return [
      `# Role`,
      `You are a group of people who genuinely have the user's back; each responds in their own warm way:`,
      agentLines(),
      g,
      ``,
      `# My background`,
      mood ? `What's been draining me lately: ${mood}` : "",
      support ? `The kind of support I want: ${support}` : "",
      ``,
      `# Task`,
      `Hold space for my feelings first, then lift me up. Match the tone to the support I asked for. Do not lecture, do not rush me to "cheer up", do not dismiss my feelings. Remind me of what I've actually done, my worth, and that this will pass. End with one or two tiny, doable next steps.`,
      ``,
      `# What I will provide`,
      `What I'm going through lately: (I will paste it here)`,
      ``,
      `# Output format`,
      [
        `1. Empathize: a few sentences showing you understand how I feel right now.`,
        `2. See me: point to specific efforts and worth (from what I shared) that I've underrated.`,
        `3. Encourage: a warm, believing tone; remind me why I can get through this.`,
        `4. One small step: 1–2 tiny, low-effort actions I can take today.`,
        `Keep the whole tone warm and sincere, never cheesy; do not list my flaws or criticize.`,
      ].join("\n"),
    ].join("\n");
  }

  /* ---------- 組裝 Prompt ---------- */
  function buildPrompt() {
    if (!state.goal) return "";
    let prompt = "";
    if (state.goal === "cv") prompt = buildCV();
    else if (state.goal === "linkedin") prompt = buildLinkedIn();
    else if (state.goal === "recommendation") prompt = buildRecommendation();
    else if (state.goal === "assessment") prompt = buildAssessment();
    else if (state.goal === "interview") prompt = buildInterview();
    else if (state.goal === "website") prompt = buildWebsite();
    else if (state.goal === "encourage") prompt = buildEncourage();
    else if (state.goal === "jobs") {
      prompt = isZh()
        ? `# 角色\n你是一位職缺選擇顧問。\n\n# 任務\n這個入口目前仍在規劃中。請先不要產生正式建議，改為向使用者說明這個功能會在未來支援職缺比對、篩選與排序。\n\n# 我會提供的資料\n職缺與偏好資料：（未啟用）\n\n# 輸出格式\n功能預告，不輸出正式職缺建議。`
        : `# Role\nYou are a job selection advisor.\n\n# Task\nThis entry is still under planning. Do not generate a final recommendation yet. Explain that this feature will later support job matching, filtering, and ranking.\n\n# What I will provide\nJobs and preference data: (not enabled)\n\n# Output format\nFeature teaser, not a formal job recommendation.`;
    }
    return prompt ? enforcePromptArchitecture(prompt) : "";
  }

  function enforcePromptArchitecture(prompt) {
    const sections = parsePromptSections(prompt);
    const byTitle = new Map(sections.map((section) => [section.title.toLowerCase(), section.body]));
    const get = (titles) => {
      for (const title of titles) {
        const body = byTitle.get(title.toLowerCase());
        if (body) return body;
      }
      return "";
    };
    const guardrail = C.guardrail[state.promptLang];
    const role = get(["角色", "Role"]).replace(guardrail, "").trim();
    const context = get(["我的背景", "My background"]);
    const task = get(["任務", "Task"]);
    const skills = get(["來自 /skills 的參考內容", "/skills reference"]);
    const inputs = get(["我會提供的資料", "What I will provide"]);
    const output = get(["輸出格式", "Output format"]);

    // 標題跟著 promptLang 走，避免中文提示詞頂著一排英文段落標題。
    const T = C.promptSections[state.promptLang] || C.promptSections.zh;

    return [
      `# ${T.goal}`,
      goalStatement(),
      ``,
      `# ${T.context}`,
      context || (isZh() ? "使用者尚未提供完整背景。" : "The user has not provided complete background yet."),
      ``,
      `# ${T.council}`,
      role || (isZh() ? "依目前路線使用預設多 Agent 顧問團。" : "Use the default multi-agent council for the selected route."),
      ``,
      `# ${T.task}`,
      task || (isZh() ? "依照使用者選擇的職涯路線產出可執行建議。" : "Produce actionable guidance for the selected career route."),
      ``,
      `# ${T.skills}`,
      skills || (isZh() ? "使用目前路線的預設 skill pack；不得編造缺少的設定。" : "Use the default skill pack for the current route; do not fabricate missing settings."),
      ``,
      `# ${T.inputs}`,
      inputs || (isZh() ? "請使用者貼上真實履歷、LinkedIn、推薦文素材、職缺或背景資料。" : "Ask the user to paste real resume, LinkedIn, recommendation, job, or background material."),
      ``,
      `# ${T.output}`,
      output || (isZh() ? "請輸出結構化建議、缺口、追問與下一步。" : "Output structured guidance, gaps, follow-up questions, and next steps."),
      ``,
      `# ${T.guardrails}`,
      guardrail,
    ].join("\n");
  }

  /**
   * 目標區塊。原本這裡塞的是 Task 的內容，段落名稱與內容不符；
   * 改成真的講「這次要解決什麼」＝ 路線 ＋ 想拿到的結果。
   */
  function goalStatement() {
    const goal = C.goals.find((g) => g.id === state.goal);
    const label = goal ? goal.label : state.goal;
    const outcome = goalOutcomeText();
    if (isZh()) {
      return outcome
        ? `我這次要處理的是「${label}」，最想拿到的結果是：${outcome}。`
        : `我這次要處理的是「${label}」。`;
    }
    const enLabel = goal ? (goal.labelEn || label) : state.goal;
    return outcome
      ? `I am working on "${enLabel}". The outcome I want most: ${outcome}.`
      : `I am working on "${enLabel}".`;
  }

  function buildCV() {
    const g = C.guardrail[state.promptLang];
    const source = sourcePackText();
    const outcome = goalOutcomeText();
    const tone = toneText();
    const status = singleText(findQ("cv", "status"));
    const problems = multiText(findQ("cv", "problems"));
    const formats = multiText(findQ("cv", "formats"));
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
        source ? `手上材料：${source}` : "",
        outcome ? `這次目標：${outcome}` : "",
        tone ? `挑戰語氣：${tone}` : "",
        `履歷狀態：${status}`,
        `想解決的問題：${problems}`,
        `想要的履歷版本：${formats}`,
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
      source ? `Available materials: ${source}` : "",
      outcome ? `Primary outcome: ${outcome}` : "",
      tone ? `Challenge tone: ${tone}` : "",
      `Resume status: ${status}`,
      `Problems to solve: ${problems}`,
      `Resume versions wanted: ${formats}`,
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

  function buildLinkedIn() {
    const g = C.guardrail[state.promptLang];
    const source = sourcePackText();
    const outcome = goalOutcomeText();
    const tone = toneText();
    const profileState = singleText(findQ("linkedin", "profileState"));
    const focus = multiText(findQ("linkedin", "focus"));
    const audience = singleText(findQ("linkedin", "audience"));
    const wants = multiText(findQ("linkedin", "wants"));
    const of = C.outputFormats.linkedin[state.promptLang];
    const skills = skillReferenceSection();

    if (isZh()) {
      return [
        `# 角色`,
        `你是一個 LinkedIn 顧問團，由以下角色組成，請各自從自己的視角檢視：`,
        agentLines(),
        g,
        ``,
        `# 我的背景`,
        backgroundLines(),
        source ? `手上材料：${source}` : "",
        outcome ? `這次目標：${outcome}` : "",
        tone ? `挑戰語氣：${tone}` : "",
        `目前狀態：${profileState}`,
        `想強化的區塊：${focus}`,
        `目標受眾：${audience}`,
        ``,
        `# 任務`,
        `請先診斷目前 LinkedIn 的定位問題，再輸出可直接改寫的建議與草稿。`,
        `我希望你完成：${wants}`,
        `請同時兼顧搜尋可見度、可信度與個人品牌一致性，不要把履歷原封不動搬過去。`,
        ``,
        skills ? `# 來自 /skills 的參考內容\n${skills}\n` : "",
        `# 我會提供的資料`,
        `LinkedIn 內容 / 履歷 / 專案資訊：（我會貼在這裡）`,
        ``,
        `# 輸出格式`,
        of,
      ].join("\n");
    }
    return [
      `# Role`,
      `You are a LinkedIn advisory board made of the following roles; each reviews from its own perspective:`,
      agentLines(),
      g,
      ``,
      `# My background`,
      backgroundLines(),
      source ? `Available materials: ${source}` : "",
      outcome ? `Primary outcome: ${outcome}` : "",
      tone ? `Challenge tone: ${tone}` : "",
      `Current profile state: ${profileState}`,
      `Areas to strengthen: ${focus}`,
      `Target audience: ${audience}`,
      ``,
      `# Task`,
      `First diagnose the profile positioning, then provide actionable recommendations and drafts.`,
      `Deliverables I want: ${wants}`,
      `Balance discoverability, credibility, and personal-brand consistency; do not copy the resume verbatim.`,
      ``,
      skills ? `# /skills reference\n${skills}\n` : "",
      `# What I will provide`,
      `LinkedIn content / resume / project info: (I will paste it here)`,
      ``,
      `# Output format`,
      of,
    ].join("\n");
  }

  function buildRecommendation() {
    const g = C.guardrail[state.promptLang];
    const source = sourcePackText();
    const outcome = goalOutcomeText();
    const tone = toneText();
    const relationship = singleText(findQ("recommendation", "relationship"));
    const useCase = singleText(findQ("recommendation", "useCase"));
    const evidence = multiText(findQ("recommendation", "evidence"));
    const wants = multiText(findQ("recommendation", "wants"));
    const of = C.outputFormats.recommendation[state.promptLang];
    const skills = skillReferenceSection();

    if (isZh()) {
      return [
        `# 角色`,
        `你是一個推薦文顧問團，由以下角色組成，請各自從自己的視角檢視：`,
        agentLines(),
        g,
        ``,
        `# 我的背景`,
        backgroundLines(),
        source ? `手上材料：${source}` : "",
        outcome ? `這次目標：${outcome}` : "",
        tone ? `挑戰語氣：${tone}` : "",
        `推薦人關係：${relationship}`,
        `使用情境：${useCase}`,
        `可用證據：${evidence}`,
        ``,
        `# 任務`,
        `請先把可信的證據抽出來，再根據不同使用情境輸出正式版與較口語版。`,
        `我希望你完成：${wants}`,
        `任何沒看過、沒證據的內容都不要寫成肯定句。`,
        ``,
        skills ? `# 來自 /skills 的參考內容\n${skills}\n` : "",
        `# 我會提供的資料`,
        `關係背景 / 成就 / 使用單位 / 口吻要求：（我會貼在這裡）`,
        ``,
        `# 輸出格式`,
        of,
      ].join("\n");
    }
    return [
      `# Role`,
      `You are a recommendation board made of the following roles; each reviews from its own perspective:`,
      agentLines(),
      g,
      ``,
      `# My background`,
      backgroundLines(),
      source ? `Available materials: ${source}` : "",
      outcome ? `Primary outcome: ${outcome}` : "",
      tone ? `Challenge tone: ${tone}` : "",
      `Recommender relationship: ${relationship}`,
      `Use case: ${useCase}`,
      `Available evidence: ${evidence}`,
      ``,
      `# Task`,
      `First extract only the credible evidence, then output formal and more casual versions for the specific use case.`,
      `Deliverables I want: ${wants}`,
      `Do not write unsupported facts as certainty.`,
      ``,
      skills ? `# /skills reference\n${skills}\n` : "",
      `# What I will provide`,
      `Relationship context / achievements / recipient / tone requirements: (I will paste it here)`,
      ``,
      `# Output format`,
      of,
    ].join("\n");
  }

  function buildAssessment() {
    const g = C.guardrail[state.promptLang];
    const source = sourcePackText();
    const outcome = goalOutcomeText();
    const tone = toneText();
    const assessmentType = singleText(findQ("assessment", "assessmentType"));
    const focus = multiText(findQ("assessment", "focus"));
    const format = singleText(findQ("assessment", "format"));
    const wants = multiText(findQ("assessment", "wants"));
    const of = C.outputFormats.assessment[state.promptLang];
    const skills = skillReferenceSection();

    if (isZh()) {
      return [
        `# 角色`,
        `你是一個適性測驗顧問團，由以下角色組成，請各自從自己的視角檢視：`,
        agentLines(),
        g,
        ``,
        `# 我的背景`,
        backgroundLines(),
        source ? `手上材料：${source}` : "",
        outcome ? `這次目標：${outcome}` : "",
        tone ? `挑戰語氣：${tone}` : "",
        `適性檢視類型：${assessmentType}`,
        `關注面向：${focus}`,
        `輸出形式：${format}`,
        ``,
        `# 任務`,
        `請把角色適配、能力缺口與可練習的題目拆開，不要做成模糊的性格測驗。`,
        `我希望你完成：${wants}`,
        `請同時給我診斷、練習題與補強路線。`,
        ``,
        skills ? `# 來自 /skills 的參考內容\n${skills}\n` : "",
        `# 我會提供的資料`,
        `履歷 / 工作背景 / 目標職位 / 現有證據：（我會貼在這裡）`,
        ``,
        `# 輸出格式`,
        of,
      ].join("\n");
    }
    return [
      `# Role`,
      `You are an aptitude and role-fit advisory board made of the following roles; each reviews from its own perspective:`,
      agentLines(),
      g,
      ``,
      `# My background`,
      backgroundLines(),
      source ? `Available materials: ${source}` : "",
      outcome ? `Primary outcome: ${outcome}` : "",
      tone ? `Challenge tone: ${tone}` : "",
      `Assessment type: ${assessmentType}`,
      `Focus areas: ${focus}`,
      `Output format: ${format}`,
      ``,
      `# Task`,
      `Separate role fit, capability gaps, and practice questions; do not turn this into a vague personality test.`,
      `Deliverables I want: ${wants}`,
      `Give me diagnostics, practice questions, and a strengthening roadmap.`,
      ``,
      skills ? `# /skills reference\n${skills}\n` : "",
      `# What I will provide`,
      `Resume / work background / target role / available evidence: (I will paste it here)`,
      ``,
      `# Output format`,
      of,
    ].join("\n");
  }

  function buildInterview() {
    const g = C.guardrail[state.promptLang];
    const source = sourcePackText();
    const outcome = goalOutcomeText();
    const tone = toneText();
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
        source ? `手上材料：${source}` : "",
        outcome ? `這次目標：${outcome}` : "",
        tone ? `挑戰語氣：${tone}` : "",
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
      source ? `Available materials: ${source}` : "",
      outcome ? `Primary outcome: ${outcome}` : "",
      tone ? `Challenge tone: ${tone}` : "",
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
    const source = sourcePackText();
    const outcome = goalOutcomeText();
    const tone = toneText();
    const w = C.website.wireframes.find((x) => x.id === state.answers.wireframe);
    const style = w ? (isZh() ? w.promptZh : w.promptEn) : "";
    const of = C.outputFormats.website[state.promptLang];
    const skills = skillReferenceSection();
    if (isZh()) {
      return [
        `# 角色`,
        `你是一個個人網站顧問團，由以下角色組成，請各自從自己的視角檢視：`,
        agentLines(),
        g,
        ``,
        `# 我的背景`,
        backgroundLines(),
        source ? `手上材料：${source}` : "",
        outcome ? `這次目標：${outcome}` : "",
        tone ? `挑戰語氣：${tone}` : "",
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
      `You are a personal-website advisory board made of the following roles; each reviews from its own perspective:`,
      agentLines(),
      g,
      ``,
      `# My background`,
      backgroundLines(),
      source ? `Available materials: ${source}` : "",
      outcome ? `Primary outcome: ${outcome}` : "",
      tone ? `Challenge tone: ${tone}` : "",
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

  function renderLandingEnhancements() {
    const goalWrap = document.getElementById("rm-goals-gallery");
    if (goalWrap) {
      goalWrap.innerHTML = "";
      C.goals.forEach((g) => {
        const disabled = !!g.disabled || !!g.comingSoon;
        const card = el("button", "wz-goal-card" + (disabled ? " is-disabled" : ""));
        card.type = "button";
        if (disabled) card.disabled = true;
        card.appendChild(el("div", "wz-goal-top", ""));
        card.querySelector(".wz-goal-top").appendChild(el("div", "wz-opt-text", ""));
        const txt = card.querySelector(".wz-opt-text");
        txt.appendChild(el("h3", "wz-goal-title", g.label));
        txt.appendChild(el("p", "wz-goal-desc", g.desc));
        if (disabled) {
          card.querySelector(".wz-goal-top").appendChild(el("span", "wz-goal-badge", "即將推出"));
        }
        card.onclick = () => { if (!disabled) openWizard(g.id, card); };
        goalWrap.appendChild(card);
      });
    }

    const skillWrap = document.getElementById("rm-skill-gallery");
    if (skillWrap) {
      skillWrap.innerHTML = "";
      const skills = [
        ["Resume Discovery Skill", "履歷探勘", "用反問挖出你沒寫出來的成就、數字與證據。"],
        ["LinkedIn Headline Skill", "LinkedIn 標題", "把你的定位濃縮成一句搜尋得到、又不浮誇的標題。"],
        ["Referral Request Skill", "推薦請求", "幫你開口請人推薦，並給對方好寫的素材。"],
        ["Assessment Design Skill", "適性測驗設計", "設計跟目標職位真的相關的測驗，不是人格占卜。"],
        ["Job Search Strategy Skill", "求職策略", "把找工作拆成可執行的步驟，不再亂槍打鳥。"],
        ["No-Fabrication Guardrail Skill", "不編造守則", "缺證據就標記待補，絕不替你發明數字。"],
      ];
      skills.forEach((item) => {
        const key = item[0];
        const card = el("article", "wz-skill-card");
        card.appendChild(el("h3", null, item[1]));
        card.appendChild(el("p", null, item[2]));
        const btn = el("button", "wz-skill-open", "看規則");
        btn.onclick = () => openSkillPreview(key);
        card.appendChild(btn);
        skillWrap.appendChild(card);
      });
    }
  }

  /* ---------- 啟動 ---------- */
  window.RM_openWizard = openWizard;
  window.RM_showSkillPreview = openSkillPreview;
  window.RM_closeWizard = closeWizard;
  document.querySelectorAll(".js-start-interview").forEach((b) => {
    b.addEventListener("click", (e) => { e.preventDefault(); openWizard(null, b); });
  });
  prevBtn.onclick = () => go(-1);
  nextBtn.onclick = () => go(1);
  restartBtn.onclick = openRestartModal;
  if (closeBtn) closeBtn.onclick = closeWizard;
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
    renderLandingEnhancements();
  })();
})();
