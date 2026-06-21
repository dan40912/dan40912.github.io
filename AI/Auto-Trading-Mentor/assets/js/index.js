const steps = [
  {
    title: "選擇使用目的",
    hint: "先決定這份 Prompt 是用來回放檢討、模擬測試、只讀觀察，還是需要人工確認。"
  },
  {
    title: "設定風控邊界",
    hint: "把單筆虧損、日損、風報比、口數與加碼規則寫成 AI 每輪決策前必須檢查的硬性條件。"
  },
  {
    title: "選擇策略框架與審查角色",
    hint: "策略框架決定 AI 要看什麼；審查角色負責阻擋不完整或高風險決策。"
  },
  {
    title: "選擇要放進 Prompt 的內容",
    hint: "勾選你希望 AI 在交易判斷時額外記住的規則。保守使用者建議保留前兩項。"
  }
];

const modes = [
  {
    id: "replay",
    name: "回放檢討",
    description: "用歷史行情回放檢查策略、風控與 AI 輸出品質，不涉及即時下單。",
    badge: "推薦起點",
    difference: "適合復盤、練習、找出 Prompt 盲點。",
    hint: "選這個模式時，AI 只需要評論歷史情境與下一步規則，不應輸出任何實盤操作。"
  },
  {
    id: "paper",
    name: "紙上交易",
    description: "使用假資金測試完整流程。AI 仍必須先通過安全與風控檢查。",
    badge: "安全預設",
    difference: "適合驗證交易流程，但不連動真實資金。",
    hint: "紙上交易可以用來觀察 AI 是否穩定遵守規則，仍不代表策略具有獲利能力。"
  },
  {
    id: "demo",
    name: "模擬帳戶",
    description: "只適用畫面明確顯示 Demo 的帳戶；帳戶狀態不清楚就改由人工處理。",
    badge: "需確認帳戶",
    difference: "適合在交易平台模擬環境測試按鈕、部位與成交回報。",
    hint: "如果畫面沒有清楚標示 Demo，Prompt 會要求 AI 輸出 MANUAL，而不是猜測帳戶模式。"
  },
  {
    id: "live_view",
    name: "實盤只讀",
    description: "AI 只讀畫面並輸出觀察，不得點擊買進、賣出、平倉、取消或改單。",
    badge: "只讀",
    difference: "適合真實市場觀察，但不授權任何交易動作。",
    hint: "這是實盤環境中最保守的模式，AI 只能描述風險、狀態與等待條件。"
  },
  {
    id: "live_approve",
    name: "實盤人工確認",
    description: "AI 只能提出建議；每個真實資金動作都必須等待使用者確認。",
    badge: "人工確認",
    difference: "適合進階使用者，保留人工核准作為最後安全關卡。",
    hint: "AI 不得自行下單。它只能產生建議與理由，使用者確認後才可進行下一步。"
  },
  {
    id: "live_auto",
    name: "實盤自動",
    description: "已停用。目前版本不支援真實資金全自動交易。",
    badge: "不可用",
    difference: "風險最高，因此不在目前產品範圍內。",
    hint: "這個選項刻意停用，避免把 Prompt 工具誤用成全自動交易機器人。",
    disabled: true
  }
];

const strategies = [
  {
    id: "trend",
    name: "順勢延續",
    description: "順勢交易。重點檢查高低點結構、VWAP / EMA 方向、回踩品質與追價風險。"
  },
  {
    id: "breakout",
    name: "突破回測",
    description: "突破與回測。重點檢查量能、假突破、流動性掃單與 RR 是否仍合理。"
  },
  {
    id: "reversal",
    name: "反轉交易",
    description: "反轉交易。重點檢查過度延伸、背離、關鍵位拒絕與停損是否太寬。"
  },
  {
    id: "range",
    name: "區間均值回歸",
    description: "區間交易。重點檢查上下緣、VWAP、假突破與是否在區間中段亂進場。"
  }
];

const roles = [
  {
    id: "master_policy",
    name: "主策略規則員",
    figure: "assets/images/agents/master-policy-agent.png",
    description: "先定義 AI 可以做什麼、不能做什麼。",
    style: "冷靜、保守、重視規則優先順序。遇到安全、授權、風控衝突時，先保護帳戶，再討論交易機會。",
    locked: true
  },
  {
    id: "safety",
    name: "安全守門員",
    figure: "assets/images/agents/safety-agent.png",
    description: "資料不完整時，直接阻擋後續判斷。",
    style: "嚴格、少話、寧願錯過也不越界。帳戶、商品、口數、持倉或停損看不清楚時，一律要求人工處理。",
    locked: true
  },
  {
    id: "authorization",
    name: "授權確認員",
    figure: "assets/images/agents/authorization-agent.png",
    description: "確認目前模式允許 AI 做到哪一步。",
    style: "制度派、重視權限邊界。它會區分回放、紙上、模擬、實盤只讀與實盤人工確認，避免 AI 越權。"
  },
  {
    id: "market",
    name: "市場掃描員",
    figure: "assets/images/agents/market-scan-agent.png",
    description: "掃描趨勢、區間、流動性與關鍵位置。",
    style: "觀察型、重視結構，不追情緒。它先判斷盤面是否值得討論，再把背景交給風控與執行角色。"
  },
  {
    id: "risk",
    name: "風控主管",
    figure: "assets/images/agents/risk-manager-agent.png",
    description: "檢查虧損、風報比、口數與加碼規則。",
    style: "強勢、保守、有否決權。只要單筆虧損、日損、風報比或口數不合格，就先阻擋交易。",
    locked: true
  },
  {
    id: "tpsl",
    name: "停利停損規劃員",
    figure: "assets/images/agents/tp-sl-agent.png",
    description: "把進場、停損、停利寫成可檢查條件。",
    style: "精準、討厭模糊。沒有清楚停損、停利、失效條件與最低風報比，就不允許進場。"
  },
  {
    id: "position",
    name: "部位管理員",
    figure: "assets/images/agents/position-manager-agent.png",
    description: "先處理既有持倉，再討論新交易。",
    style: "務實、重視當前狀態。它會先確認是否已有倉位、是否只能減倉或平倉，避免新想法蓋過舊風險。"
  },
  {
    id: "execution",
    name: "執行裁決員",
    figure: "assets/images/agents/execution-agent.png",
    description: "把團隊結論整理成最後行動。",
    style: "果斷、短句、重視可執行性。它不負責猜方向，只負責把通過檢查的結論轉成等待、人工處理、觀察或需確認。"
  },
  {
    id: "heartbeat",
    name: "交易紀錄員",
    figure: "assets/images/agents/heartbeat-reporter-agent.png",
    description: "記錄每輪結論、阻擋原因與檢討欄位。",
    style: "細心、長期主義。它會留下行動、理由、信心、阻擋原因與檢討欄位，讓之後能修正 Prompt。"
  }
];

const state = {
  step: 0,
  mode: "",
  market: "XAUUSD",
  currency: "USD",
  risk: {
    maxTradeLoss: 1000,
    dailyLoss: 3000,
    minimumRR: 1,
    maxContracts: 4,
    profitTarget: 3000,
    addRule: "禁止加碼"
  },
  strategy: "",
  roles: ["master_policy", "safety", "risk"],
  output: {
    includeRunLog: true,
    includeFailure: true,
    includeFunded: false
  },
  prompt: ""
};

const $ = id => document.getElementById(id);

function init() {
  renderChoices();
  bindControls();
  bindOverlayControls();
  updateUI();
}

function renderChoices() {
  $("modeChoices").innerHTML = modes.map(mode => `
    <button class="choice mode-choice ${mode.disabled ? "blocked" : ""}" type="button" data-type="mode" data-id="${mode.id}" ${mode.disabled ? "aria-disabled=\"true\"" : ""}>
      <span class="mode-choice-head">
        <strong>${mode.name}</strong>
        <small>${mode.badge}</small>
      </span>
      <span>${mode.description}</span>
      <em>${mode.difference}</em>
      <span class="hint-dot" tabindex="0" aria-label="${mode.hint}" data-hint="${mode.hint}">?</span>
    </button>
  `).join("");

  $("strategyChoices").innerHTML = strategies.map(strategy => `
    <button class="choice" type="button" data-type="strategy" data-id="${strategy.id}">
      <strong>${strategy.name}</strong>
      <span>${strategy.description}</span>
    </button>
  `).join("");

  $("roleChoices").innerHTML = roles.map(role => `
    <button class="role-card ${role.locked ? "selected" : ""}" type="button" data-type="role" data-id="${role.id}" ${role.locked ? "aria-disabled=\"true\"" : ""}>
      <img class="role-card-figure" src="${role.figure}" alt="${role.name} 角色剪影" loading="lazy">
      <span class="role-card-body">
        <strong>${role.name}</strong>
        <span>${role.description}</span>
        <small>${role.locked ? "核心角色" : "可選角色"}</small>
      </span>
      <span class="role-preview" aria-hidden="true">
        <img src="${role.figure}" alt="">
        <strong>${role.name}</strong>
        <span>${role.style}</span>
      </span>
    </button>
  `).join("");
}

function bindControls() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-type]");
    if (!button) return;

    const type = button.dataset.type;
    const id = button.dataset.id;

    if (type === "mode") {
      const mode = modes.find(item => item.id === id);
      if (mode?.disabled) {
        state.mode = "";
        updateUI("實盤自動已停用。請選擇回放檢討、紙上交易、模擬帳戶、實盤只讀或實盤人工確認。");
        return;
      }
      state.mode = id;
      if (state.step === 0) goToStep(1);
    }

    if (type === "strategy") {
      state.strategy = id;
    }

    if (type === "role") {
      const role = roles.find(item => item.id === id);
      if (role?.locked) return;
      if (state.roles.includes(id)) {
        state.roles = state.roles.filter(roleId => roleId !== id);
      } else {
        state.roles.push(id);
      }
    }

    updateUI();
  });

  $("backBtn").addEventListener("click", () => goToStep(state.step - 1));
  $("nextBtn").addEventListener("click", () => {
    if (!validateStep()) return;
    if (state.step < steps.length - 1) {
      goToStep(state.step + 1);
      return;
    }
    buildResults();
  });

  ["marketInput", "currencyInput", "maxTradeLossInput", "dailyLossInput", "minimumRRInput", "maxContractsInput", "profitTargetInput", "addRuleInput"].forEach(id => {
    $(id).addEventListener("input", syncRiskState);
  });

  ["includeRunLogInput", "includeFailureInput", "includeFundedInput"].forEach(id => {
    $(id).addEventListener("change", syncOutputState);
  });

  $("togglePromptBtn").addEventListener("click", () => {
    $("promptPanel").classList.toggle("is-collapsed");
    $("togglePromptBtn").textContent = $("promptPanel").classList.contains("is-collapsed") ? "展開 Prompt" : "收合 Prompt";
  });

  $("copyPromptBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText(state.prompt);
    flashButton($("copyPromptBtn"), "已複製");
  });

  $("downloadPromptBtn").addEventListener("click", () => {
    const blob = new Blob([state.prompt], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-trading-workflow.md";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function syncRiskState() {
  state.market = $("marketInput").value;
  state.currency = $("currencyInput").value;
  state.risk.maxTradeLoss = Number($("maxTradeLossInput").value);
  state.risk.dailyLoss = Number($("dailyLossInput").value);
  state.risk.minimumRR = Number($("minimumRRInput").value);
  state.risk.maxContracts = Number($("maxContractsInput").value);
  state.risk.profitTarget = Number($("profitTargetInput").value);
  state.risk.addRule = $("addRuleInput").value;
  updateUI();
}

function syncOutputState() {
  state.output.includeRunLog = $("includeRunLogInput").checked;
  state.output.includeFailure = $("includeFailureInput").checked;
  state.output.includeFunded = $("includeFundedInput").checked;
  updateUI();
}

function bindOverlayControls() {
  document.querySelectorAll(".js-open-wizard").forEach(button => {
    button.addEventListener("click", openWizard);
  });

  $("closeWizardBtn")?.addEventListener("click", closeWizard);
  $("restartWizardBtn")?.addEventListener("click", restartWizardView);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("starter")?.hidden) {
      closeWizard();
    }
  });
}

function openWizard() {
  const overlay = $("starter");
  if (!overlay) return;
  overlay.hidden = false;
  document.body.classList.add("wizard-open");
  $("tradeStage")?.scrollTo({ top: 0 });
}

function closeWizard() {
  const overlay = $("starter");
  if (!overlay) return;
  overlay.hidden = true;
  document.body.classList.remove("wizard-open");
}

function restartWizardView() {
  state.step = 0;
  state.mode = "";
  state.market = "XAUUSD";
  state.currency = "USD";
  state.risk = {
    maxTradeLoss: 1000,
    dailyLoss: 3000,
    minimumRR: 1,
    maxContracts: 4,
    profitTarget: 3000,
    addRule: "禁止加碼"
  };
  state.strategy = "";
  state.roles = ["master_policy", "safety", "risk"];
  state.output = {
    includeRunLog: true,
    includeFailure: true,
    includeFunded: false
  };
  state.prompt = "";

  $("marketInput").value = state.market;
  $("currencyInput").value = state.currency;
  $("maxTradeLossInput").value = state.risk.maxTradeLoss;
  $("dailyLossInput").value = state.risk.dailyLoss;
  $("minimumRRInput").value = state.risk.minimumRR;
  $("maxContractsInput").value = state.risk.maxContracts;
  $("profitTargetInput").value = state.risk.profitTarget;
  $("addRuleInput").value = state.risk.addRule;
  $("includeRunLogInput").checked = state.output.includeRunLog;
  $("includeFailureInput").checked = state.output.includeFailure;
  $("includeFundedInput").checked = state.output.includeFunded;
  $("results").classList.add("is-hidden");
  $("builder").classList.remove("is-hidden");
  $("promptPanel").classList.add("is-collapsed");
  $("togglePromptBtn").textContent = "展開 Prompt";
  updateUI();
  $("tradeStage")?.scrollTo({ top: 0, behavior: "smooth" });
}

function goToStep(nextStep) {
  state.step = Math.max(0, Math.min(steps.length - 1, nextStep));
  updateUI();
  const stage = $("tradeStage");
  if (stage) {
    stage.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    $("builder").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function validateStep() {
  if (state.step === 0 && !state.mode) {
    updateUI("請先選擇使用目的。實盤自動已停用。");
    return false;
  }

  if (state.step === 1) {
    syncRiskState();
    const valid = [
      ["maxTradeLossInput", state.risk.maxTradeLoss > 0],
      ["dailyLossInput", state.risk.dailyLoss > 0],
      ["minimumRRInput", state.risk.minimumRR >= 0.5],
      ["maxContractsInput", Number.isInteger(state.risk.maxContracts) && state.risk.maxContracts > 0],
      ["profitTargetInput", state.risk.profitTarget > 0]
    ];

    let ok = true;
    valid.forEach(([id, isValid]) => {
      $(id).closest(".field").classList.toggle("invalid", !isValid);
      if (!isValid) ok = false;
    });
    if (!ok) updateUI("風控數值不完整。請修正紅色欄位。");
    return ok;
  }

  if (state.step === 2 && !state.strategy) {
    updateUI("請選擇一個策略框架。");
    return false;
  }

  return true;
}

function updateUI(message) {
  const step = steps[state.step];
  $("stepBadge").textContent = `第 ${state.step + 1} / ${steps.length} 步`;
  $("stepTitle").textContent = step.title;
  $("stepHint").textContent = step.hint;
  $("progressBar").style.width = `${((state.step + 1) / steps.length) * 100}%`;

  document.querySelectorAll(".step-panel").forEach(panel => {
    panel.classList.toggle("active", Number(panel.dataset.step) === state.step);
  });

  document.querySelectorAll("[data-type='mode']").forEach(button => {
    button.classList.toggle("selected", button.dataset.id === state.mode);
  });
  document.querySelectorAll("[data-type='strategy']").forEach(button => {
    button.classList.toggle("selected", button.dataset.id === state.strategy);
  });
  document.querySelectorAll("[data-type='role']").forEach(button => {
    button.classList.toggle("selected", state.roles.includes(button.dataset.id));
  });

  $("backBtn").disabled = state.step === 0;
  $("nextBtn").textContent = state.step === steps.length - 1 ? "產生 Prompt" : "下一步";

  $("summaryMode").textContent = labelFor(modes, state.mode) || "尚未選擇";
  $("summaryMarket").textContent = state.market;
  $("summaryCurrency").textContent = state.currency;
  $("summaryTradeLoss").textContent = formatNumber(state.risk.maxTradeLoss);
  $("summaryDailyLoss").textContent = formatNumber(state.risk.dailyLoss);
  $("summaryRR").textContent = String(state.risk.minimumRR);
  $("summaryContracts").textContent = String(state.risk.maxContracts);
  $("summaryProfitTarget").textContent = formatNumber(state.risk.profitTarget);
  $("summaryAddRule").textContent = state.risk.addRule;
  $("summaryStrategy").textContent = labelFor(strategies, state.strategy) || "尚未選擇";
  $("summaryRoles").textContent = state.roles.map(id => labelFor(roles, id)).filter(Boolean).join(" / ");

  $("readiness").textContent = message || (state.step === steps.length - 1
    ? "設定完成後會產生交易 Prompt、交易行動卡與安全停止規則。"
    : "完成 4 步後，會產生可貼進 Codex 的交易 Prompt。");
}

function buildResults() {
  syncOutputState();
  state.prompt = buildPrompt();
  $("promptOutput").value = state.prompt;
  $("tradingCard").innerHTML = buildTradingCardHtml();
  $("builder").classList.add("is-hidden");
  $("results").classList.remove("is-hidden");
  const stage = $("tradeStage");
  if (stage) {
    stage.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    $("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function buildTradingCardHtml() {
  const modeLabel = labelFor(modes, state.mode);
  const strategyLabel = labelFor(strategies, state.strategy);
  return [
    ["行動", defaultAction()],
    ["模式", modeLabel],
    ["市場", state.market],
    ["Currency", state.currency],
    ["策略", strategyLabel],
    ["單筆最大虧損", `${formatNumber(state.risk.maxTradeLoss)} ${state.currency}`],
    ["每日最大虧損", `${formatNumber(state.risk.dailyLoss)} ${state.currency}`],
    ["最低風報比", state.risk.minimumRR],
    ["最大口數", state.risk.maxContracts],
    ["預期盈利目標", `${formatNumber(state.risk.profitTarget)} ${state.currency}`],
    ["加碼規則", state.risk.addRule],
    ["安全停止", "帳戶、商品、持倉、損益、停損或成交狀態不清楚時，輸出 MANUAL"]
  ].map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`).join("");
}

function buildPrompt() {
  const modeLabel = labelFor(modes, state.mode);
  const strategyLabel = labelFor(strategies, state.strategy);
  const roleDescriptions = state.roles.map(id => {
    const role = roles.find(item => item.id === id);
    return `- ${role.name}: ${role.description}`;
  }).join("\n");

  return `# AI Trading Workflow

你是交易工作流審查助手。你的任務不是預測市場，也不是提供投資建議。你的任務是依照使用者設定，讀取 TradingView 與交易平台畫面，先檢查安全與風控，再輸出 WAIT / MANUAL / OBSERVE / APPROVE_REQUIRED。

## Non-negotiable safety boundary

1. 這不是投資建議，不保證獲利，不提供財務建議。
2. Codex / ChatGPT / Claude 不是 broker，不代表使用者有交易授權。
3. 任何 Real / Live / 真實資金相關動作都必須人工確認。
4. MVP 不支援 Live Auto。若畫面顯示 Live 或 Real，禁止自動點擊 Buy / Sell / Close / Cancel / Replace。
5. 不允許移除 stop loss、放大口數、攤平、DCA 或自動加碼。
6. 如果帳戶模式、商品、口數、持倉、PnL、working orders、stop order 或成交狀態不清楚，立即輸出 MANUAL。

## User configuration

- Mode: ${modeLabel}
- Market: ${state.market}
- Currency: ${state.currency}
- Strategy framework: ${strategyLabel}
- Max trade loss: ${formatNumber(state.risk.maxTradeLoss)} ${state.currency}
- Daily loss limit: ${formatNumber(state.risk.dailyLoss)} ${state.currency}
- Minimum RR: ${state.risk.minimumRR}
- Max contracts: ${state.risk.maxContracts}
- Expected profit target: ${formatNumber(state.risk.profitTarget)} ${state.currency}
- Add rule: ${state.risk.addRule}

## Mandatory pre-decision risk checks

Before every WAIT / MANUAL / OBSERVE / APPROVE_REQUIRED / PAPER_ACTION decision, check these hard conditions first:

1. Confirm the active market is ${state.market}. If the symbol is unclear or different, output MANUAL.
2. Confirm all money values are in ${state.currency}. If currency or account denomination is unclear, output MANUAL.
3. If proposed single-trade loss exceeds ${formatNumber(state.risk.maxTradeLoss)} ${state.currency}, output WAIT or MANUAL.
4. If realized plus open daily loss reaches ${formatNumber(state.risk.dailyLoss)} ${state.currency}, stop new trades and output WAIT or MANUAL.
5. If planned RR is below ${state.risk.minimumRR}, do not propose an entry.
6. If total size would exceed ${state.risk.maxContracts} contracts/lots, do not propose an entry or add.
7. If current profit has reached ${formatNumber(state.risk.profitTarget)} ${state.currency}, prioritize profit protection, reduced exposure, or no new trades.
8. Apply add rule exactly: ${state.risk.addRule}.

## Review roles

${roleDescriptions}

## Decision order

1. Safety Gate 先檢查帳戶模式、商品、口數、持倉、PnL、working orders、stop order 與可見交易按鈕。
2. Risk Manager 檢查單筆止損、每日虧損、最低 RR、最大口數與加碼規則。
3. Market Structure 檢查 setup 是否符合策略框架。
4. Liquidity / News / Run Logger 只在被選用時加入審查。
5. 只有 Replay / Demo / Paper 且所有安全條件完整時，才可輸出 APPROVE_REQUIRED 或 PAPER_ACTION。
6. Live View 只能輸出 OBSERVE。
7. Live Manual Approve 只能輸出 APPROVE_REQUIRED，等待使用者確認單一具體動作。

## Output format

Action: WAIT / MANUAL / OBSERVE / APPROVE_REQUIRED / PAPER_ACTION
Reason: 用一句話說明主因。
Risk Status: pass / fail / unclear
Account Mode: replay / demo / paper / live / real / unclear
Market: ${state.market} / unclear
Position Status: flat / long / short / unclear
Allowed Action: none / observe_only / manual_approve / paper_action
Next: 下一步要使用者做什麼。

${state.output.includeFailure ? buildFailureRules() : ""}
${state.output.includeRunLog ? buildRunLogSection() : ""}
${state.output.includeFunded ? buildFundedRules() : ""}

## Default response

如果沒有清楚、完整、安全的交易畫面，輸出：

Action: MANUAL
Reason: 安全資訊不足，無法確認帳戶模式、持倉、PnL、stop 或成交狀態。
Risk Status: unclear
Allowed Action: none
Next: 請使用者人工確認畫面，或切換到 Replay / Demo / Paper 後再執行。`;
}

function buildFailureRules() {
  return `## Fail-closed rules

遇到以下任一情況，禁止交易並輸出 MANUAL：

- 帳戶模式不明，或畫面顯示 Real / Live。
- 商品代號不明，或不是使用者設定的市場。
- 口數、持倉、PnL、working orders 不可見或互相矛盾。
- stop order 不存在、不清楚或被移除。
- fill status 未確認。
- RR 低於 ${state.risk.minimumRR}。
- 單筆止損超過 ${formatNumber(state.risk.maxTradeLoss)} ${state.currency}。
- 當日虧損達到 ${formatNumber(state.risk.dailyLoss)} ${state.currency}。
- 當日盈利達到 ${formatNumber(state.risk.profitTarget)} ${state.currency} 後，新增交易必須先保護盈利並重新確認風險。
- 需要加碼，但加碼規則不是明確人工確認。
- 平台出現彈窗、錯誤訊息、延遲或未知狀態。`;
}

function buildRunLogSection() {
  return `## Run log fields

每次 heartbeat 後記錄：

- timestamp
- mode
- market
- account_mode_detected
- setup_type
- action
- confidence
- risk_status
- blocked_reason
- manual_intervention_required
- planned_entry
- planned_stop
- planned_take_profit
- planned_rr
- realized_outcome
- rule_violation
- screenshot_saved: false by default

不要儲存：帳號、密碼、API key、token、完整帳戶號碼、未遮罩 broker 截圖。`;
}

function buildFundedRules() {
  return `## Funded trader constraints

- 必須人工設定 daily reset time。
- 若有 trailing drawdown，任何新倉前都要檢查剩餘可承受虧損。
- 若有 consistency rule，不得為了達標而提高口數。
- 達到每日虧損、最大回撤或 funded account 規則不明時，輸出 MANUAL。
- 不允許自動加碼、攤平或 revenge trading。`;
}

function defaultAction() {
  if (state.mode === "live_view") return "OBSERVE only";
  if (state.mode === "live_approve") return "APPROVE_REQUIRED";
  return "WAIT until safety and risk pass";
}

function labelFor(list, id) {
  return list.find(item => item.id === id)?.name || "";
}

function formatNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-US") : "unclear";
}

function flashButton(button, text) {
  const original = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

init();
