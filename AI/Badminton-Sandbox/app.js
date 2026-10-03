import {
  clone,
  clamp,
  team,
  sign,
  mate,
  defaults,
  seeded,
  createMatch,
  setupServe,
  actors,
  shotKeys,
  targetPresets,
  legalTarget,
  choosePlan,
  makeShot,
  awardPoint,
  nextRally,
  SHOTS,
  PERSONALITIES,
  STYLES,
  shotOdds,
  soundFor,
  ROSTER,
  slotGender,
  genderOf,
  MAX_LEVEL,
  LEVEL_NOTES,
  tierOf,
  validLevel,
  flightMs,
  shotSpeed,
  trajectory,
  POWER_SHOTS,
  SMASHES,
  pointLabel,
} from "./model.js";
import { playHit, unlockAudio } from "./audio.js";
import { portrait, describe, escapeHTML, TEAM_COLORS } from "./characters.js";
import { CourtRenderer, ELEVATION } from "./court.js";
import {
  STATS,
  STAT_MAX,
  STAT_MIN,
  SKILLS,
  budgetFor,
  presetStats,
  normalizeStats,
  statTotal,
  skillFor,
  skillName,
  skillFits,
  METER_FULL,
  meterOf,
  RACKETS,
  racketOf,
  effectiveStats,
} from "./abilities.js";
import { radarSVG } from "./radar.js";
import {
  summarize,
  insight,
  highlights,
  matchup,
  encodeCard,
  decodeCard,
  settlement,
  gameScores,
} from "./analysis.js";
import { shotContext } from "./coaching.js";
const $ = (id) => document.getElementById(id),
  safe = escapeHTML;
const STORAGE = "rally-lab-session-v2",
  WELCOME = "rally-lab-welcome-v1";
let profiles = defaults(),
  config = { mode: "men", points: 21, bestOf: 1 },
  match = null,
  entries = [],
  archives = [],
  records = [],
  selected = 0,
  shot = "short",
  target = null,
  playMode = "manual",
  running = false,
  paused = false,
  animation = null,
  reviewIndex = null,
  replay = null,
  autoWait = 0,
  drag = null,
  editing = 0,
  draft = null,
  lastTime = performance.now(),
  toastTimer;
let random = seeded(Date.now()),
  saveWarning = false;
let preferences = {
  motion: "system",
  formation: "auto",
  view: "tactical",
  elevation: ELEVATION.broadcast,
  sound: true,
  outcome: "model",
};
const edited = new Set();
// Set when players, format or scoring change while a match is in progress.
let lineupDirty = false;
function markLineup() {
  if (match) lineupDirty = true;
  renderLineupPrompt();
}
function renderLineupPrompt() {
  const show = !!match && lineupDirty;
  $("setupLineupPrompt").hidden = !show;
  $("courtLineupPrompt").hidden = !show;
}
let useSkill = false;
// Camera views, in toggle order.
// Camera presets in toggle order; "camera" views share one draggable elevation.
const VIEWS = [
  { view: "tactical" },
  { view: "camera", elevation: ELEVATION.broadcast },
  { view: "camera", elevation: ELEVATION.low },
];
function viewName() {
  if (preferences.view === "tactical") return "戰術";
  const e = preferences.elevation;
  return e < 0.3 ? "低視角" : e > 0.85 ? "高空" : "轉播";
}
function applyView() {
  renderer.setView(preferences.view, preferences.elevation);
  $("elevationControl").hidden = preferences.view !== "camera";
  $("elevation").value = Math.round(preferences.elevation * 100);
  syncToggles();
}
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const reduceMotion = () => reduced.matches || preferences.motion === "reduce";
const renderer = new CourtRenderer($("court"));
function toast(text) {
  $("toast").textContent = text;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 3600);
}
function note(title, text) {
  $("noteTitle").textContent = title;
  $("noteText").textContent = text;
}
function save() {
  try {
    localStorage.setItem(
      STORAGE,
      JSON.stringify({
        version: 2,
        profiles,
        config,
        match,
        entries,
        archives,
        records,
        preferences,
      }),
    );
  } catch {
    if (!saveWarning) {
      toast("瀏覽器暫時無法保存，請匯出推演以保留紀錄。");
      saveWarning = true;
    }
  }
}
// Earlier default names; saved sessions pick up the current roster names.
const RENAMED = {
  阿澤: "Jay",
  小宇: "Curt",
  阿凱: "Leo",
  大翔: "KK",
  Max: "KK",
  小晴: "Rena",
  小悠: "Mia",
  若涵: "Ivy",
  芊芊: "Nora",
};
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE));
    if (data?.version !== 2) return;
    if (!Array.isArray(data.profiles) || data.profiles.length !== 4) return;
    if (
      data.profiles.some(
        (p) =>
          typeof p.name !== "string" ||
          !p.name.trim() ||
          !validLevel(p.level) ||
          !PERSONALITIES[p.personality] ||
          !STYLES[p.style],
      )
    )
      return;
    profiles = data.profiles.map((p) => ({
      ...p,
      name: RENAMED[p.name] ?? p.name,
      gender: genderOf(p),
      stats: normalizeStats(p.stats, p.level, p.style),
      skill: SKILLS[p.skill] ? p.skill : skillFor(p.style),
      racket: RACKETS[p.racket] ? p.racket : "standard",
      skillName: typeof p.skillName === "string" ? p.skillName.slice(0, 10) : "",
    }));
    if (
      ["system", "reduce"].includes(data.preferences?.motion) &&
      ["auto", "hold"].includes(data.preferences?.formation)
    )
      preferences = {
        ...preferences,
        motion: data.preferences.motion,
        formation: data.preferences.formation,
        // Older saves stored "broadcast" / "low" presets.
        view: ["camera", "broadcast", "low"].includes(data.preferences.view)
          ? "camera"
          : "tactical",
        elevation: Number.isFinite(data.preferences.elevation)
          ? clamp(data.preferences.elevation, 0, 1)
          : data.preferences.view === "low"
            ? ELEVATION.low
            : ELEVATION.broadcast,
        sound: data.preferences.sound !== false,
        outcome: data.preferences.outcome === "manual" ? "manual" : "model",
      };
    if (
      ["men", "women", "mixed"].includes(data.config?.mode) &&
      [11, 21].includes(data.config?.points) &&
      [1, 3].includes(data.config?.bestOf)
    )
      config = data.config;
    if (
      data.match &&
      Array.isArray(data.match.positions) &&
      data.match.positions.length === 4 &&
      data.match.positions.every(
        (p) => Number.isFinite(p.x) && Number.isFinite(p.z),
      ) &&
      ["serve", "rally", "ended"].includes(data.match.phase) &&
      data.match.score?.every(Number.isInteger)
    ) {
      match = data.match;
      entries = data.entries || [];
      archives = data.archives || [];
      records = data.records || [];
      selected = match.nextActor;
      shot = shotKeys(match)[0];
    }
  } catch {
    /* A bad or unavailable saved session must not prevent opening the app. */
  }
}
function gender(i) {
  const m = match && !$("courtPage").hidden ? match.config.mode : config.mode;
  return slotGender(m, i);
}
const LOOK = ["name", "gender", "face", "hair", "skin", "accessory"];
// Swap who the player is, but keep how they play (level, personality, style).
function withIdentity(profile, character) {
  const next = { ...profile };
  LOOK.forEach((key) => (next[key] = character[key]));
  return next;
}
function fitRosterToMode() {
  const swapped = [];
  profiles.forEach((p, i) => {
    const need = slotGender(config.mode, i);
    if (genderOf(p) === need) return;
    const taken = new Set(profiles.map((x) => x.name)),
      c = ROSTER.find((c) => c.gender === need && !taken.has(c.name));
    if (!c) return;
    swapped.push(`${p.name} → ${c.name}`);
    profiles[i] = withIdentity(p, c);
  });
  return swapped;
}
function renderRoster() {
  $("roster").innerHTML = profiles
    .map(
      (p, i) =>
        `<button class="player-card ${i > 1 ? "coral-card" : ""}" data-player="${i}" aria-label="編輯${safe(p.name)}，${p.level}級，${PERSONALITIES[p.personality]}，${STYLES[p.style]}"><div class="player-topline"><span class="player-number">${i < 2 ? "BLUE" : "CORAL"} / 0${(i % 2) + 1} · ${gender(i)}</span><span class="level-pill">LV. ${p.level} · ${tierOf(p.level).name}</span></div><div class="player-portrait">${portrait(p, i)}</div><div class="player-info"><div class="player-name">${safe(p.name)}<span>↗</span></div><div class="player-tags"><span>${PERSONALITIES[p.personality]}</span><span>${STYLES[p.style]}</span><span class="skill-chip">${SKILLS[p.skill]?.icon ?? "★"} ${safe(skillName(p))}</span><span class="racket-chip"><i style="background:${racketOf(p).colors[0]};border-color:${racketOf(p).colors[1]}"></i>${racketOf(p).name}</span></div><p class="player-desc">${describe(p)}</p><div class="card-radar">${radarSVG(effectiveStats(p), { level: p.level, skill: p.skill, color: TEAM_COLORS[i], size: 90, labels: false, title: `${p.name}的能力（含球拍）` })}</div></div></button>`,
    )
    .join("");
  $("roster")
    .querySelectorAll("[data-player]")
    .forEach((b) => (b.onclick = () => openEditor(Number(b.dataset.player))));
  $("modeTabs")
    .querySelectorAll("button")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.mode === config.mode)),
    );
  $("matchPoints").value = config.points;
  $("matchFormat").value = config.bestOf;
  $("enterCourt").innerHTML = match
    ? "回到球場，繼續推演 <span>↗</span>"
    : "陣容就緒，進入球場 <span>↗</span>";
  $("navCourt").disabled = !match;
  settingsNotice();
  renderLineupPrompt();
}
function settingsNotice() {
  const changed =
    match &&
    (match.config.points !== config.points ||
      match.config.bestOf !== config.bestOf);
  $("settingsNotice").textContent = changed
    ? "分數與賽制已更新，下次重新開賽時套用；目前比賽與紀錄會保留。"
    : match
      ? "目前比賽已保留。人物調整會套用到下一拍。"
      : "";
}
function page(which) {
  const court = which === "court";
  if (!court) {
    running = false;
    if (replay) {
      animation = null;
      replay = null;
    }
    paused = !!animation;
    reviewIndex = null;
  } else {
    if (!match) {
      match = createMatch(config);
      selected = match.server;
      save();
    }
    match.config.mode = config.mode;
    $("navCourt").disabled = false;
    announceRoster();
  }
  $("setupPage").hidden = court;
  $("courtPage").hidden = !court;
  $("navSetup").toggleAttribute("aria-current", !court);
  if (!court) $("navSetup").setAttribute("aria-current", "step");
  $("navCourt").toggleAttribute("aria-current", court);
  if (court) $("navCourt").setAttribute("aria-current", "step");
  if (court) {
    renderer.resize();
    updateUI();
  } else renderRoster();
  window.scrollTo({ top: 0, behavior: "instant" });
  $(court ? "courtHeading" : "setupHeading").focus({ preventScroll: true });
}
// Profiles are read live on every shot; confirm edits when the user returns to court.
function announceRoster() {
  if (!edited.size) return;
  const changed = [...edited].sort().map((i) => profiles[i]);
  edited.clear();
  toast(
    `已套用：${changed.map((p) => `${p.name} ${p.level} 級・${PERSONALITIES[p.personality]}`).join("、")}`,
  );
  note(
    "人物設定已套用",
    `從下一拍起，${changed.map((p) => p.name).join("、")}的失誤率、得分率與選球都依新的級數、性格與球風計算。`,
  );
}
function levelText(level) {
  const t = tierOf(level);
  return `${t.name}・${t.note}`;
}
function openEditor(i) {
  editing = i;
  draft = clone(profiles[i]);
  const map = {
    playerName: "name",
    playerLevel: "level",
    playerPersonality: "personality",
    playerStyle: "style",
    faceShape: "face",
    hairStyle: "hair",
    skinTone: "skin",
    accessory: "accessory",
  };
  Object.entries(map).forEach(([id, key]) => ($(id).value = draft[key]));
  draft.stats = normalizeStats(draft.stats, draft.level, draft.style);
  $("playerSkill").innerHTML = Object.entries(SKILLS)
    .map(
      ([k, sk]) =>
        `<option value="${k}">${sk.icon} ${sk.name}${k === skillFor(draft.style) ? "（本球風）" : ""}</option>`,
    )
    .join("");
  $("playerSkill").value = draft.skill;
  $("playerSkillName").value = draft.skillName || "";
  $("playerError").textContent = "";
  updateEditor();
  $("playerDialog").showModal();
}
function renderPicker() {
  const need = gender(editing),
    others = new Set(
      profiles.filter((_, i) => i !== editing).map((p) => p.name),
    );
  $("characterPicker").innerHTML = ROSTER.filter((c) => c.gender === need)
    .map((c) => {
      const active = LOOK.every((k) => draft[k] === c[k]),
        taken = others.has(c.name);
      return `<button type="button" data-character="${c.id}" aria-pressed="${active}" ${taken ? "disabled" : ""} aria-label="${c.name}${taken ? "（已在陣容中）" : ""}"><span class="picker-face">${portrait(c, editing, { faceOnly: true })}</span><span>${c.name}</span></button>`;
    })
    .join("");
  $("characterPicker")
    .querySelectorAll("[data-character]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const c = ROSTER.find((c) => c.id === b.dataset.character);
          $("playerName").value = c.name;
          $("faceShape").value = c.face;
          $("hairStyle").value = c.hair;
          $("skinTone").value = c.skin;
          $("accessory").value = c.accessory;
          draft.gender = c.gender;
          updateEditor();
          $("characterPicker").querySelector(`[data-character="${c.id}"]`)?.focus();
        }),
    );
}
function updateEditor() {
  const prev = draft;
  draft = {
    ...draft,
    skill: $("playerSkill").value || draft.skill,
    skillName: $("playerSkillName").value.trim().slice(0, 10),
    name: $("playerName").value.trim(),
    level: Number($("playerLevel").value),
    personality: $("playerPersonality").value,
    style: $("playerStyle").value,
    face: $("faceShape").value,
    hair: $("hairStyle").value,
    skin: $("skinTone").value,
    accessory: $("accessory").value,
  };
  $("editorPortrait").innerHTML = portrait(draft, editing, {
    expression: draft.personality === "bold" ? "focus" : "ready",
  });
  $("editorTeamLabel").textContent =
    `${editing < 2 ? "BLUE TEAM" : "CORAL TEAM"} / ${gender(editing)}`;
  $("editorDescription").textContent = describe(draft);
  syncAbilities(prev);
  renderPicker();
  const ok = validLevel(draft.level);
  $("levelDescription").textContent = ok
    ? levelText(draft.level)
    : `請輸入 1–${MAX_LEVEL} 級`;
  $("levelDetail").textContent = ok
    ? `${LEVEL_NOTES[draft.level]} 殺球約 ${shotSpeed("smash", draft.level)} km/h。`
    : "";
}
// Untouched preset stats follow level and style; hand-tuned ones are kept
// (only trimmed if a lower level shrinks the budget).
function syncAbilities(prev) {
  if (!validLevel(draft.level)) return;
  const wasPreset =
    validLevel(prev.level) &&
    JSON.stringify(prev.stats) ===
      JSON.stringify(presetStats(prev.style, prev.level));
  draft.stats =
    wasPreset && (prev.style !== draft.style || prev.level !== draft.level)
      ? presetStats(draft.style, draft.level)
      : normalizeStats(draft.stats, draft.level, draft.style);
  if (prev.style !== draft.style && draft.skill === skillFor(prev.style)) {
    draft.skill = skillFor(draft.style);
    $("playerSkill").value = draft.skill;
  }
  renderAbilities();
}
function renderAbilities() {
  const budget = budgetFor(draft.level),
    left = budget - statTotal(draft.stats),
    sk = SKILLS[draft.skill];
  $("statBudget").textContent = left
    ? `剩餘 ${left} 點 / 共 ${budget} 點`
    : `${budget} 點已分配完`;
  $("statBudget").classList.toggle("has-points", left > 0);
  renderRackets();
  $("editorRadar").innerHTML = radarSVG(effectiveStats(draft), {
    base: draft.racket && draft.racket !== "standard" ? draft.stats : null,
    level: draft.level,
    skill: draft.skill,
    skillLabel: skillName(draft),
    color: TEAM_COLORS[editing],
    size: 240,
    title: `${draft.name || "球員"}的能力`,
  });
  const rows = $("statRows");
  if (!rows.children.length)
    rows.innerHTML = STATS.map(
      (s) =>
        `<div class="stat-row" data-stat="${s.key}"><span class="stat-name" title="${s.note}">${s.label}</span><button type="button" data-step="-1" aria-label="${s.label}減一">−</button><output></output><button type="button" data-step="1" aria-label="${s.label}加一">＋</button></div>`,
    ).join("");
  rows.querySelectorAll(".stat-row").forEach((row) => {
    const key = row.dataset.stat,
      v = draft.stats[key];
    row.querySelector("output").textContent = v;
    row.querySelector('[data-step="-1"]').disabled = v <= STAT_MIN;
    row.querySelector('[data-step="1"]').disabled = v >= STAT_MAX || left <= 0;
  });
  $("skillNote").textContent = sk
    ? `${sk.type === "passive" ? "被動" : "主動"}・${sk.note}${sk.style !== draft.style ? "（非本球風絕技也能使用。）" : ""}`
    : "";
}
const STAT_LABEL = Object.fromEntries(STATS.map((s) => [s.key, s.label]));
const modText = (mods) =>
  Object.entries(mods)
    .map(([k, v]) => `<b class="${v > 0 ? "up" : "down"}">${STAT_LABEL[k]} ${v > 0 ? "+" : ""}${v}</b>`)
    .join("");
function renderRackets() {
  const host = $("racketPicker");
  if (!host.children.length) {
    host.innerHTML = Object.entries(RACKETS)
      .map(
        ([k, r]) =>
          `<button type="button" role="radio" data-racket="${k}"><svg viewBox="0 0 24 60" aria-hidden="true"><ellipse cx="12" cy="15" rx="9" ry="13" fill="#fffefa" stroke="${r.colors[0]}" stroke-width="3.2"/><path d="M12 28v20" stroke="${r.colors[1]}" stroke-width="3" stroke-linecap="round"/><path d="M12 46v11" stroke="#243b35" stroke-width="4.5" stroke-linecap="round"/></svg><span class="racket-name">${r.brand ? `<small>${r.brand}</small>` : ""}${r.name}</span><span class="racket-mods">${modText(r.mods) || "<b>無加減</b>"}</span></button>`,
      )
      .join("");
    host.onclick = (e) => {
      const b = e.target.closest("[data-racket]");
      if (!b) return;
      draft.racket = b.dataset.racket;
      renderAbilities();
      host.querySelector(`[data-racket="${draft.racket}"]`)?.focus();
    };
  }
  host.querySelectorAll("[data-racket]").forEach((b) => {
    b.setAttribute("aria-checked", String(b.dataset.racket === (draft.racket || "standard")));
  });
  const r = racketOf(draft);
  $("racketNote").innerHTML = `<strong>${safe(r.name)}</strong>・${r.type}。擅長：${r.good}；不擅長：${r.bad}。雷達圖虛線是不含球拍的原始能力。`;
}
$("statRows").onclick = (e) => {
  const b = e.target.closest("[data-step]");
  if (!b) return;
  const key = b.closest(".stat-row").dataset.stat,
    next = draft.stats[key] + Number(b.dataset.step),
    left = budgetFor(draft.level) - statTotal(draft.stats);
  if (next < STAT_MIN || next > STAT_MAX || (Number(b.dataset.step) > 0 && left <= 0))
    return;
  draft.stats = { ...draft.stats, [key]: next };
  renderAbilities();
};
$("shareCard").onclick = async () => {
  updateEditor();
  if (!draft.name || !validLevel(draft.level)) {
    $("playerError").textContent = "請先填好姓名與級數，再分享球員卡。";
    return;
  }
  const url = `${location.href.split("#")[0]}#player=${encodeCard({ ...draft, gender: gender(editing) })}`;
  try {
    await navigator.clipboard.writeText(url);
    toast("球員卡連結已複製，傳給朋友就能加入對戰。");
  } catch {
    window.prompt("複製這個球員卡連結：", url);
  }
};
// Opening a #player= link offers to drop that player into a slot.
function checkSharedCard() {
  const m = location.hash.match(/^#player=([\w-]+)$/);
  if (!m) return;
  history.replaceState(null, "", location.pathname + location.search);
  const card = decodeCard(m[1]);
  if (!card) {
    toast("這張球員卡無法讀取，可能已損壞。");
    return;
  }
  $("importCard").innerHTML = `<div class="import-face">${portrait(card, 0)}</div><div><strong>${safe(card.name)}</strong><p>${card.level} 級 ${tierOf(card.level).name}・${PERSONALITIES[card.personality]}・${STYLES[card.style]}</p><p class="skill-line">${SKILLS[card.skill].icon} ${safe(skillName(card))}</p><div class="import-radar">${radarSVG(card.stats, { level: card.level, skill: card.skill, skillLabel: skillName(card), size: 200, title: `${card.name}的能力` })}</div></div>`;
  $("importSlots").innerHTML = profiles
    .map(
      (p, i) =>
        `<button class="button" data-slot="${i}">${i < 2 ? "藍" : "紅"}隊 ${(i % 2) + 1}・替換 ${safe(p.name)}</button>`,
    )
    .join("");
  $("importSlots")
    .querySelectorAll("[data-slot]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const i = Number(b.dataset.slot);
          profiles[i] = clone(card);
          markLineup();
          edited.add(i);
          save();
          renderRoster();
          if (!$("courtPage").hidden) updateUI();
          $("importDialog").close();
          toast(
            card.gender !== gender(i)
              ? `${card.name} 已加入（與目前賽制的性別位置不同，切換賽制時可能被替換）`
              : `${card.name} 已加入${i < 2 ? "藍" : "紅"}隊`,
          );
        }),
    );
  $("importDialog").showModal();
}
window.addEventListener("hashchange", checkSharedCard);
$("statPreset").onclick = () => {
  draft.stats = presetStats(draft.style, draft.level);
  renderAbilities();
};
$("playerForm").oninput = updateEditor;
$("playerForm").onchange = updateEditor;
$("levelDown").onclick = () => {
  $("playerLevel").value = clamp(Number($("playerLevel").value) - 1, 1, MAX_LEVEL);
  updateEditor();
};
$("levelUp").onclick = () => {
  $("playerLevel").value = clamp(Number($("playerLevel").value) + 1, 1, MAX_LEVEL);
  updateEditor();
};
$("playerForm").onsubmit = (e) => {
  e.preventDefault();
  updateEditor();
  if (!draft.name || !validLevel(draft.level)) {
    $("playerError").textContent = `請填入姓名，級數須為 1–${MAX_LEVEL} 的整數。`;
    return;
  }
  const before = profiles[editing];
  if (
    before.level !== draft.level ||
    before.personality !== draft.personality ||
    before.style !== draft.style ||
    before.skill !== draft.skill ||
    before.racket !== draft.racket ||
    JSON.stringify(before.stats) !== JSON.stringify(draft.stats)
  )
    edited.add(editing);
  profiles[editing] = { ...clone(draft), gender: gender(editing) };
  markLineup();
  save();
  $("playerDialog").close();
  renderRoster();
  toast(`${draft.name} 的人物設定已儲存`);
};
$("modeTabs")
  .querySelectorAll("button")
  .forEach(
    (b) =>
      (b.onclick = () => {
        config.mode = b.dataset.mode;
        const swapped = fitRosterToMode();
        if (match && (swapped.length || match.config.mode !== config.mode))
          markLineup();
        renderRoster();
        save();
        if (swapped.length)
          toast(`已換上符合賽制的球員：${swapped.join("、")}（級數、性格與球風保留）`);
      }),
  );
$("matchPoints").onchange = () => {
  config.points = Number($("matchPoints").value);
  markLineup();
  settingsNotice();
  save();
};
$("matchFormat").onchange = () => {
  config.bestOf = Number($("matchFormat").value);
  markLineup();
  settingsNotice();
  save();
};
$("enterCourt").onclick = () => page("court");
$("editTeam").onclick = () => page("setup");
$("navSetup").onclick = () => page("setup");
$("navCourt").onclick = () => page("court");
$("brandHome").onclick = (e) => {
  e.preventDefault();
  page("setup");
};
function displayState() {
  return reviewIndex !== null
    ? entries[reviewIndex].after
    : replay
      ? replay.display
      : match;
}
function renderScore(s) {
  const side = (t) =>
    `<div class="score-team ${t ? "right-team" : ""}">${!t ? avatarPair(t) : ""}<div><div class="score-team-name">${team(s.server) === t ? '<i class="serve-indicator"></i>' : ""}<span class="team-en">${t ? "CORAL TEAM" : "BLUE TEAM"} · </span>${t ? "紅隊" : "藍隊"}</div><p class="score-team-players">${safe(profiles[t * 2].name)} <b>${profiles[t * 2].level}</b> / ${safe(profiles[t * 2 + 1].name)} <b>${profiles[t * 2 + 1].level}</b></p><div class="score-meters">${[t * 2, t * 2 + 1].map((i) => `<i class="${meterOf(s, i) >= METER_FULL ? "full" : ""}" title="${safe(profiles[i].name)} 氣勢 ${Math.round(meterOf(s, i))}"><b style="width:${meterOf(s, i)}%"></b></i>`).join("")}</div></div>${t ? avatarPair(t) : ""}</div>`;
  function avatarPair(t) {
    return `<div class="score-avatars">${[t * 2, t * 2 + 1].map((i) => `<div class="score-avatar">${portrait(profiles[i], i, { faceOnly: true })}</div>`).join("")}</div>`;
  }
  $("scoreboard").innerHTML =
    `${side(0)}<div class="score-center"><div class="score-numbers"><span>${s.score[0]}</span><span class="divider">:</span><span>${s.score[1]}</span></div><div class="game-status">${s.finished ? "比賽結束" : `第 ${s.game} 局`} · 局數 ${s.wins[0]}–${s.wins[1]}</div></div>${side(1)}`;
}
function buttonList(container, items, active, onClick, disabled = false) {
  const host = $(container);
  const existing = new Map(
    Array.from(host.children, (button) => [button.dataset.value, button]),
  );
  items.forEach((item) => {
    const key = String(item.value);
    const b = existing.get(key) || document.createElement("button");
    existing.delete(key);
    b.dataset.value = key;
    b.type = "button";
    const content = item.html || safe(item.label);
    if (b.innerHTML !== content) b.innerHTML = content;
    b.setAttribute("aria-pressed", String(item.value === active));
    b.disabled = disabled || item.disabled;
    b.onclick = () => onClick(item);
    if (b.parentElement !== host) host.append(b);
  });
  existing.forEach((button) => button.remove());
}
function updateUI() {
  renderer.dirty = true;
  if (!match) return;
  const s = displayState(),
    busy = !!animation || !!replay || running || reviewIndex !== null,
    ended = s.phase === "ended",
    available = actors(s);
  if (
    !available.includes(selected) &&
    !ended &&
    reviewIndex === null &&
    !animation
  )
    selected = s.nextActor;
  const p = profiles[selected];
  renderScore(s);
  $("courtStatus").textContent =
    reviewIndex !== null
      ? `回看第 ${s.total} 拍`
      : replay
        ? "回合重播中"
        : ended
          ? s.finished
            ? "比賽結束"
            : "回合結束"
          : s.phase === "serve"
            ? `${profiles[s.server].name} · ${s.side === "right" ? "右" : "左"}區發球`
            : `第 ${s.total + 1} 拍 · ${s.turn ? "紅" : "藍"}隊回球`;
  $("currentPlayer").innerHTML =
    `<div class="current-avatar" style="background:${selected < 2 ? "var(--blue-light)" : "var(--coral-light)"}">${portrait(p, selected, { faceOnly: true })}</div><div><strong>${safe(p.name)}</strong><span class="turn-badge">${ended ? "回合結束" : s.phase === "serve" ? "發球者" : "擊球者"}</span><p>${p.level} 級 ${tierOf(p.level).name} · ${STYLES[p.style]}</p></div>`;
  renderSkillBox(s, ended || busy);
  renderTension(s);
  $("manualTools").hidden = playMode !== "manual";
  $("autoTools").hidden = playMode === "manual";
  $("autoDescription").textContent =
    playMode === "rally"
      ? "完整看一個回合。球員會自行選球與移動，得分後停下來，讓你觀察配合。"
      : "讓四位球員打完一場比賽。依比分輪轉發球，平手須領先兩分，達封頂分數即結束。";
  $("manualResult").hidden =
    playMode !== "manual" || s.phase !== "rally" || busy;
  buttonList(
    "actorButtons",
    [0, 1, 2, 3]
      .filter((i) => team(i) === s.turn)
      .map((i) => ({
        label: profiles[i].name,
        value: i,
        disabled: !available.includes(i),
      })),
    selected,
    (item) => {
      selected = item.value;
      if (target) note("落點已選，準備擊球", plannedNote(s));
      updateUI();
    },
    busy || ended,
  );
  if (!shotKeys(s).includes(shot)) shot = shotKeys(s)[0];
  buttonList(
    "shotButtons",
    shotKeys(s).map((key) => ({
      value: key,
      html: `<span aria-hidden="true">${SHOTS[key].icon}</span>${SHOTS[key].label}`,
    })),
    shot,
    (item) => {
      shot = item.value;
      note(
        SHOTS[shot].label,
        target ? plannedNote(s) : SHOTS[shot].note,
      );
      updateUI();
    },
    busy || ended,
  );
  const points = targetPresets(s, shot);
  buttonList(
    "targetButtons",
    points.map((p, i) => ({ label: p.label, value: i, point: p })),
    points.findIndex((p) => target && p.x === target.x && p.z === target.z),
    (item) => {
      target = { x: item.point.x, z: item.point.z };
      note("落點已選，準備擊球", plannedNote(s));
      updateUI();
    },
    busy || ended,
  );
  $("targetLabel").textContent = target
    ? `落點：橫向 ${target.x.toFixed(1)} m / 距網 ${Math.abs(target.z).toFixed(1)} m`
    : "也可以直接點球場";
  $("courtHint").textContent =
    reviewIndex !== null
      ? "選擇其他拍數回看，或從這一拍重新推演"
      : animation
        ? paused
          ? "已暫停，可繼續播放"
          : "觀察擊球與雙方補位"
        : ended
          ? "回看球路，或開始下一回合"
          : playMode === "manual"
            ? target
              ? "落點已選，按「打出這一拍」"
              : "① 選球員 ② 選球路 ③ 點落點"
            : "按下開始，球員會自行選球與移動";
  let label =
    reviewIndex !== null
      ? "回到目前進度"
      : animation
        ? paused
          ? "繼續播放"
          : "擊球進行中"
        : ended
          ? s.finished
            ? "比賽已結束"
            : "開始下一回合"
          : playMode === "manual"
            ? "打出這一拍"
            : running
              ? "自動推演中"
              : playMode === "rally"
                ? "開始自動回合"
                : "開始全自動比賽";
  $("playButton").innerHTML = `${label} <span>↗</span>`;
  $("playButton").disabled =
    reviewIndex === null &&
    ((!!animation && !paused) || running || s.finished || !!replay);
  $("pauseButton").disabled = !animation && !running && !replay;
  $("pauseButton").textContent = paused ? "繼續" : "暫停";
  $("undoButton").disabled =
    !!animation ||
    running ||
    !!replay ||
    reviewIndex !== null ||
    !entries.length;
  $("replayButton").disabled =
    !!animation ||
    running ||
    !!replay ||
    !entries.some((e) => e.kind === "shot");
  $("courtSettings").disabled =
    !!animation || running || !!replay || reviewIndex !== null;
  $("editTeam").disabled = !!replay;
  $("transportStatus").textContent =
    reviewIndex !== null
      ? "回看模式"
      : paused
        ? "已暫停"
        : running
          ? "球員正在自主推演"
          : playMode === "manual"
            ? "由你決定下一拍"
            : "等待開始";
  $("returnLive").hidden = reviewIndex === null;
  $("reviewBar").hidden = reviewIndex === null;
  renderTimeline();
  renderRecords();
  renderResult(s);
  renderAnalysis();
}
// Momentum meter and the manual "unleash" toggle for the selected player.
function renderSkillBox(s, locked) {
  const p = profiles[selected],
    sk = SKILLS[p.skill],
    m = meterOf(s, selected),
    full = m >= METER_FULL;
  $("meterFill").style.width = `${m}%`;
  $("meterValue").textContent = full ? "MAX" : Math.round(m);
  $("skillBox").classList.toggle("charged", full);
  if (!full || locked || playMode !== "manual" || sk.type !== "active")
    useSkill = false;
  $("skillButton").disabled =
    !full || locked || playMode !== "manual" || sk.type !== "active";
  $("skillButton").setAttribute("aria-pressed", String(useSkill));
  $("skillButton").innerHTML =
    sk.type === "passive"
      ? `${sk.icon} ${safe(skillName(p))}<small>${full ? "已就緒・自動發動" : "被動絕技・集滿自動發動"}</small>`
      : `${sk.icon} ${useSkill ? "已準備：" : "發動 "}${safe(skillName(p))}<small>${full ? (playMode === "manual" ? sk.note : "全自動時由球員自行判斷") : `氣勢集滿後可發動（${Math.round(m)}/100）`}</small>`;
}
// Rally counter, game / match point banner and the court's tension overlay.
function renderTension(s) {
  const total = s.phase === "ended" ? 0 : s.total,
    label = pointLabel(s);
  $("rallyCount").hidden = total < 6;
  $("rallyCount").textContent = `${total} 拍`;
  $("rallyCount").classList.toggle("hot", total >= 10);
  $("pointBanner").hidden = !label;
  if (label) {
    $("pointBanner").textContent = `${label.label} · ${label.team ? "紅" : "藍"}隊`;
    $("pointBanner").className = `point-banner ${label.team ? "banner-coral" : "banner-blue"} ${label.label === "MATCH POINT" ? "match" : ""}`;
  }
}
$("skillButton").onclick = () => {
  const p = profiles[selected],
    sk = SKILLS[p.skill];
  useSkill = !useSkill;
  if (useSkill && sk.force) shot = sk.force;
  if (useSkill && !skillFits(p.skill, shot)) {
    const fit = shotKeys(match).find((k) => skillFits(p.skill, k));
    if (fit) shot = fit;
  }
  note(
    useSkill ? `${skillName(p)} 準備就緒` : "已取消絕技",
    useSkill
      ? `${sk.note}${sk.shots ? ` 可搭配：${sk.shots.map((k) => SHOTS[k].label).join("、")}。` : ""}${target ? " " + plannedNote(match) : " 選好落點後出手。"}`
      : "這一拍以一般球路出手，氣勢會保留。",
  );
  updateUI();
};
// ---- Analysis: highlights, point sources, matchup test ----
let matchupFor = null,
  matchupResult = null;
function renderAnalysis() {
  if (!$("analysisPanel").open) return;
  const rallies = archives.length ? archives : [],
    { players, teams } = summarize(rallies, profiles),
    picks = highlights(rallies, profiles),
    pct = (a, b) => (b ? Math.round((a / b) * 100) : 0),
    total = teams[0].points + teams[1].points;
  const bar = total
    ? `<div class="source-bar" role="img" aria-label="藍隊 ${teams[0].points} 分，紅隊 ${teams[1].points} 分">${[0, 1]
        .map(
          (t) =>
            `<span class="src ${t ? "src-coral" : "src-blue"}" style="flex:${teams[t].fromWinners || 0.0001}" title="${t ? "紅" : "藍"}隊直接得分 ${teams[t].fromWinners}"></span><span class="src ${t ? "src-coral" : "src-blue"} faded" style="flex:${teams[t].fromErrors || 0.0001}" title="${t ? "紅" : "藍"}隊因對手失誤得分 ${teams[t].fromErrors}"></span>`,
        )
        .join("")}</div><p class="source-legend">藍隊 ${teams[0].points} 分（${pct(teams[0].fromWinners, teams[0].points)}% 直接得分）・紅隊 ${teams[1].points} 分（${pct(teams[1].fromWinners, teams[1].points)}% 直接得分）。淡色是靠對手失誤拿到的分數。</p>`
    : "";
  const cards = players
    .map(
      (p, i) =>
        `<div class="analysis-card ${i > 1 ? "coral-side" : ""}"><div class="analysis-head"><span class="analysis-face">${portrait(profiles[i], i, { faceOnly: true })}</span><strong>${safe(profiles[i].name)}</strong></div><dl><div><dt>得分</dt><dd>${p.winners}</dd></div><div><dt>失誤</dt><dd>${p.errors}</dd></div><div><dt>救球</dt><dd>${p.saves}</dd></div><div><dt>絕技</dt><dd>${p.skills}</dd></div></dl><p>${p.fastest ? `最快殺球 ${p.fastest} km/h。` : ""}${insight(p)}</p></div>`,
    )
    .join("");
  const moments = picks.length
    ? `<div class="highlight-list">${picks
        .map(
          (h) =>
            `<button class="highlight" data-highlight="${h.index}"><span>${h.title}</span><strong>${safe(h.detail)}</strong><small>第 ${h.index + 1} 回合・▶ 重播</small></button>`,
        )
        .join("")}</div>`
    : '<p class="empty-note">打完幾個回合後，這裡會挑出最精彩的時刻。</p>';
  const tests = matchupResult
    ? (() => {
        const worst = matchupResult.reduce((a, b) => (b.rate < a.rate ? b : a)),
          best = matchupResult.reduce((a, b) => (b.rate > a.rate ? b : a));
        return `<div class="matchup-result">${matchupResult
          .map(
            (r) =>
              `<div class="matchup-row"><span>${r.label}</span><div class="matchup-bar"><i style="width:${Math.round(r.rate * 100)}%"></i></div><b>${Math.round(r.rate * 100)}%</b></div>`,
          )
          .join("")}<p>${safe(profiles[matchupFor].name)}最怕<strong>${worst.label}</strong>（每回合勝率 ${Math.round(worst.rate * 100)}%），最擅長對付<strong>${best.label}</strong>（${Math.round(best.rate * 100)}%）。</p></div>`;
      })()
    : "";
  $("analysis").innerHTML = `<h3>精彩回顧</h3>${moments}<h3>得分來源</h3>${bar || '<p class="empty-note">還沒有完成的回合。</p>'}<div class="analysis-grid">${cards}</div><h3>對位測試</h3><p class="muted">讓同一位球員組成雙打，對上五種球風的同級對手，各模擬 400 回合，看出強項與罩門。</p><div class="matchup-pick">${profiles
    .map(
      (p, i) =>
        `<button class="button ${matchupFor === i ? "primary" : ""}" data-matchup="${i}">${safe(p.name)}</button>`,
    )
    .join("")}</div>${tests}`;
  $("analysis")
    .querySelectorAll("[data-highlight]")
    .forEach((b) => (b.onclick = () => playHighlight(Number(b.dataset.highlight))));
  $("analysis")
    .querySelectorAll("[data-matchup]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          matchupFor = Number(b.dataset.matchup);
          matchupResult = matchup(profiles[matchupFor]);
          renderAnalysis();
        }),
    );
}
$("analysisPanel").addEventListener("toggle", renderAnalysis);
// ---- End-of-match report ----
function showSettlement() {
  if (!match?.finished || $("settleDialog").open) return;
  const st = settlement(archives, profiles, match.winner),
    pct = (v) => `${Math.round(v * 100)}%`,
    best = (key, low = false) =>
      st.rows.reduce((a, b) => ((low ? b[key] < a[key] : b[key] > a[key]) ? b : a)).index,
    top = { win: best("winRate"), err: best("errorRate", true), skill: best("skillRate") },
    m = profiles[st.mvp],
    mvpRow = st.rows[st.mvp];
  $("settleTitle").textContent = `${match.winner ? "紅" : "藍"}隊贏得比賽`;
  $("settleGames").innerHTML = gameScores(records)
    .map(
      (g) =>
        `<span class="${g.score[0] > g.score[1] ? "blue-won" : "coral-won"}">第 ${g.game} 局 <b>${g.score[0]} : ${g.score[1]}</b></span>`,
    )
    .join("") + `<span>共 ${st.rallies} 回合</span>`;
  $("settleMvp").innerHTML = `<div class="mvp-face ${st.mvp < 2 ? "" : "coral"}">${portrait(m, st.mvp, { expression: "happy" })}</div><div><span class="mvp-badge">MVP</span><strong>${safe(m.name)}</strong><p>${st.reason}</p><p class="muted">${m.level} 級 ${tierOf(m.level).name}・${STYLES[m.style]}・${racketOf(m).name}</p></div><div class="mvp-stats"><div><b>${pct(mvpRow.winRate)}</b><span>得分率</span></div><div><b>${pct(mvpRow.errorRate)}</b><span>失誤率</span></div><div><b>${mvpRow.saves}</b><span>救球</span></div></div>`;
  $("settleRows").innerHTML = st.rows
    .map((r) => {
      const p = profiles[r.index];
      return `<tr class="${r.index === st.mvp ? "is-mvp" : ""} ${r.index > 1 ? "coral-row" : ""}"><th scope="row"><span class="settle-face">${portrait(p, r.index, { faceOnly: true })}</span><span>${safe(p.name)}${r.index === st.mvp ? ' <i class="mvp-tag">MVP</i>' : ""}<small>${r.shots} 次出手・得分 ${r.winners}・失誤 ${r.errors}</small></span></th><td data-label="得分率" class="${r.index === top.win ? "lead" : ""}">${pct(r.winRate)}</td><td data-label="失誤率" class="${r.index === top.err ? "lead" : ""}">${pct(r.errorRate)}</td><td data-label="主動／被動"><div class="split" role="img" aria-label="主動 ${pct(r.activeRate)}，被動 ${pct(r.passiveRate)}"><i style="flex:${r.activeRate || 0.0001}"></i><i class="passive" style="flex:${r.passiveRate || 0.0001}"></i></div><small>${pct(r.activeRate)} ／ ${pct(r.passiveRate)}</small></td><td data-label="絕技出現率" class="${r.index === top.skill && r.skills ? "lead" : ""}">${pct(r.skillRate)}<small>${r.skills} 次・${safe(skillName(p))}</small></td></tr>`;
    })
    .join("");
  $("settleDialog").showModal();
}
$("settleAnalysis").onclick = () => {
  $("settleDialog").close();
  $("analysisPanel").open = true;
  renderAnalysis();
  $("analysisPanel").scrollIntoView({ behavior: "smooth", block: "start" });
};
$("settleAgain").onclick = () => {
  $("settleDialog").close();
  askRestart();
};
function playHighlight(index) {
  const events = archives[index];
  if (!events?.length || animation || running) return;
  reviewIndex = null;
  replay = { events: clone(events), index: 0, display: clone(events[0].before) };
  note("精彩回顧", `重播第 ${index + 1} 回合。播完後會回到目前進度。`);
  document.querySelector(".arena").scrollIntoView({ behavior: "smooth", block: "center" });
  startAnimation(replay.events[0], true);
}
function renderTimeline() {
  const shots = entries
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.kind === "shot");
  $("shotCount").textContent = `/ ${shots.length} 拍`;
  $("timeline").innerHTML = shots.length
    ? shots
        .map(
          ({ e, i }, n) =>
            `<button class="timeline-shot ${team(e.actor) ? "coral-shot" : ""}" data-index="${i}" aria-pressed="${reviewIndex === i}" aria-label="回看第${n + 1}拍，${safe(profiles[e.actor].name)}，${SHOTS[e.shot].label}"><strong>${String(n + 1).padStart(2, "0")} · ${SHOTS[e.shot].label}</strong><span>${safe(profiles[e.actor].name)} · ${shotSpeed(e.shot, profiles[e.actor].level)} km/h${e.outcome === "save" ? " · 救球" : e.outcome !== "return" ? " · " + e.after.reason : ""}${e.skill ? " · " + safe(skillName(profiles[e.skillUser ?? e.actor])) : ""}</span></button>`,
        )
        .join("")
    : '<p class="empty-note">第一拍，從你的發球開始。</p>';
  $("timeline")
    .querySelectorAll("button")
    .forEach((b) => (b.onclick = () => review(Number(b.dataset.index))));
}
function renderRecords() {
  $("recordCount").textContent = `/ ${records.length} 回合`;
  $("matchRecords").innerHTML = records.length
    ? records
        .slice()
        .reverse()
        .map(
          (r, n) =>
            `<div class="record-row"><strong>${r.winner ? "紅" : "藍"}隊得分 · ${r.score.join(" : ")}</strong><span>第 ${r.game} 局 / ${r.shots} 拍 / ${safe(r.reason)}</span></div>`,
        )
        .join("")
    : '<p class="empty-note">每一回合，都會留下紀錄。</p>';
}
function renderResult(s) {
  const show =
    s.phase === "ended" && !animation && reviewIndex === null && !replay;
  $("resultOverlay").hidden = !show;
  if (!show) return;
  $("resultOverlay").innerHTML =
    `<span class="result-label">${s.finished ? "MATCH COMPLETE" : s.gameEnded ? "GAME COMPLETE" : "POINT COMPLETE"}</span><strong>${s.winner ? "紅" : "藍"}隊${s.finished ? "贏得比賽" : s.gameEnded ? "拿下這一局" : "得分"}</strong><p>${safe(s.reason)} · ${s.total} 拍的攻防</p>${!s.finished && !running ? '<button class="button primary" id="nextPointButton">' + (s.gameEnded ? "開始下一局" : "開始下一回合") + " ↗</button>" : ""}${s.finished ? '<button class="button primary" id="settleButton">查看結算表 ↗</button><button class="button" id="highlightButton">精彩回顧與分析 ↓</button>' : ""}`;
  if ($("settleButton")) $("settleButton").onclick = showSettlement;
  if ($("nextPointButton")) $("nextPointButton").onclick = startNext;
  if ($("highlightButton"))
    $("highlightButton").onclick = () => {
      $("analysisPanel").open = true;
      renderAnalysis();
      $("analysisPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    };
}
function captureEvent(e) {
  e.recordCountBefore = records.length;
  e.archiveCountBefore = archives.length;
  return e;
}
function recordPoint(e) {
  const s = e.after;
  records.push({
    game: s.game,
    winner: s.winner,
    score: clone(s.score),
    shots: s.total,
    reason: s.reason,
  });
  archives.push(clone(entries));
}
function commit(e) {
  match = clone(e.after);
  entries.push(e);
  selected = match.nextActor;
  target = null;
  if (match.phase === "ended") {
    recordPoint(e);
    // Let the final landing and shout play before the report opens.
    if (match.finished)
      setTimeout(showSettlement, reduceMotion() ? 0 : 1100);
    const autoEnd =
      playMode === "rally" || match.finished || $("pauseAtPoint").checked;
    if (autoEnd) running = false;
    note(
      `${match.winner ? "紅" : "藍"}隊得分：${match.reason}`,
      e.kind === "shot"
        ? `${profiles[e.actor].name} · ${SHOTS[e.shot].label}。${shotContext(e.before, e.actor, e.shot, e.target, profiles, e)}可點時間軸回看這一拍。`
        : "得分已記錄，下一回合會按比分安排發球。",
    );
  } else if (e.kind === "shot")
    note(
      `${profiles[e.actor].name} · ${SHOTS[e.shot].label}`,
      shotContext(e.before, e.actor, e.shot, e.target, profiles, e),
    );
  shot = shotKeys(match)[0];
  save();
  updateUI();
}
function startAnimation(e, isReplay = false) {
  // Step-in before contact, then a flight time that depends on the shot.
  const calm = reduceMotion(),
    step = POWER_SHOTS.includes(e.shot) ? 240 : 340,
    pace = e.skill ? (SKILLS[e.skill]?.bonus.pace ?? 1) : 1,
    // The shot that decides a game plays out in slow motion.
    decisive = e.kind === "shot" && !!e.after?.gameEnded && !calm,
    flight = (flightMs(e.shot, profiles[e.actor]?.level ?? 6) / pace) * (decisive ? 2.2 : 1),
    duration = calm ? 500 : e.kind === "shot" ? step + flight : 450;
  animation = {
    event: e,
    elapsed: 0,
    duration,
    prep: calm ? 0.5 : step / duration,
    hit: false,
    decisive,
    // Signature skills open with a manga cut-in while the court holds still.
    freeze: e.skill && !calm ? 900 : 0,
    isReplay,
  };
  if (e.kind === "shot") {
    if (e.skill) showCutIn(e);
    if (preferences.sound && e.before.total >= 9) playHit("heart");
    if (preferences.sound && e.skill) playHit("skill");
  }
  paused = false;
  updateUI();
}
// Smash contact: a beat of hit-stop, a flash, an ink burst and a shout.
function smashImpact(anim, now) {
  const e = anim.event,
    start = trajectory(e, 0),
    a = renderer.project(start.x, start.z, start.h),
    b = renderer.project(e.actual.x, e.actual.z, 0),
    calm = reduceMotion(),
    fx = renderer.effects;
  const power = POWER_SHOTS.includes(e.shot),
    big = e.shot === "jumpSmash" || (e.skill && e.skillUser === e.actor);
  if (!calm) {
    anim.freeze = big ? 120 : 80;
    fx.spawn("flash", { ...start }, now);
    fx.shake(big ? 9 : power ? 6 : 3, big ? 220 : 170, now);
  }
  fx.spawn(
    "impact",
    {
      ...start,
      dir: Math.atan2(b.y - a.y, b.x - a.x),
      power: big ? 1.4 : power ? 1.15 : 0.85,
      gold: !!e.skill && e.skillUser === e.actor,
    },
    now,
  );
  const SHOUT = {
    smash: "SMASH!",
    jumpSmash: "JUMP SMASH!!",
    stick: "STICK!",
    slice: "SLICE!",
    kill: "KILL!",
  };
  if (e.skill !== "wall")
    fx.spawn(
      "shout",
      {
        ...start,
        text:
          e.skill && e.skillUser === e.actor
            ? skillName(profiles[e.actor])
            : SHOUT[e.shot] || "",
        sub: `${e.speed ?? shotSpeed(e.shot, profiles[e.actor]?.level ?? 6)} km/h`,
        gold: !!e.skill,
      },
      now,
    );
}
// Landing: smashes and outright winners hit the floor with a splash.
function landingImpact(e) {
  if (e.kind !== "shot" || e.outcome === "net") return;
  const fx = renderer.effects,
    smash = SMASHES.includes(e.shot) || e.shot === "kill";
  if (e.outcome === "save") {
    // The scramble: a dust splash where the receiver dived and a SAVE! shout.
    fx.spawn("splash", { x: e.actual.x, z: e.actual.z, power: 0.8 });
    fx.spawn("shout", {
      x: e.actual.x,
      z: e.actual.z,
      h: 1.2,
      text: e.skill === "wall" ? `${skillName(profiles[e.skillUser])}!` : "SAVE!",
      sub: e.skill === "wall" ? "必殺球被擋下" : "救球美技",
      gold: e.skill === "wall",
    });
    if (preferences.sound) playHit("touch");
    return;
  }
  if (!smash && e.outcome !== "winner") return;
  fx.spawn("splash", { x: e.actual.x, z: e.actual.z, power: smash ? 1.1 : 0.75 });
  if (smash && !reduceMotion()) fx.shake(3, 120);
  if (e.outcome === "winner")
    fx.spawn("shout", {
      x: e.actual.x,
      z: e.actual.z,
      h: 0.4,
      text: e.after.finished ? "MATCH!" : e.after.gameEnded ? "GAME!" : smash ? "KILL!" : "NICE!",
      big: !!e.after.gameEnded,
    });
}
function showCutIn(e) {
  if (reduceMotion()) return;
  const who = e.skillUser ?? e.actor,
    p = profiles[who],
    el = $("cutin");
  $("cutinFace").innerHTML = portrait(p, who, { expression: "focus", faceOnly: true });
  $("cutinWho").textContent = `${p.name} · ${SKILLS[p.skill]?.type === "passive" ? "被動絕技" : "絕技發動"}`;
  $("cutinName").textContent = `${SKILLS[p.skill]?.icon ?? ""} ${skillName(p)}`;
  el.className = `cutin ${who < 2 ? "cutin-blue" : "cutin-coral"}`;
  el.hidden = false;
  // Restart the CSS animation, then hide once it has played.
  void el.offsetWidth;
  el.classList.add("play");
  clearTimeout(showCutIn.timer);
  showCutIn.timer = setTimeout(() => (el.hidden = true), 950);
}
function finishAnimation() {
  const { event, isReplay } = animation;
  landingImpact(event);
  animation = null;
  if (isReplay) {
    replay.display = clone(event.after);
    replay.index++;
    if (replay.index < replay.events.length)
      startAnimation(replay.events[replay.index], true);
    else {
      replay = null;
      paused = false;
      note("回合重播完成", "目前比賽進度已恢復。你可以回看單拍，或繼續推演。");
      updateUI();
    }
  } else commit(event);
}
function oddsText(s, actor, shotKey, point) {
  if (preferences.outcome !== "model" || playMode !== "manual" || !point)
    return "";
  try {
    const o = shotOdds(
        s,
        { actor, shot: shotKey, target: point, skill: useSkill },
        profiles,
      ),
      pct = (v) => Math.round(v * 100);
    return `${useSkill ? `【${skillName(profiles[actor])}】` : ""}依級數估算：球速約 ${shotSpeed(shotKey, profiles[actor].level, profiles[actor], useSkill ? profiles[actor].skill : null)} km/h・失誤 ${pct(o.error)}%・直接得分 ${pct(o.win)}%・被回擊 ${pct(1 - o.error - o.win)}%（${profiles[actor].name} ${profiles[actor].level} 級 vs ${profiles[o.receiver].name} ${profiles[o.receiver].level} 級）。`;
  } catch {
    return "";
  }
}
function plannedNote(s) {
  return oddsText(s, selected, shot, target) + shotContext(s, selected, shot, target, profiles);
}
function hitManual() {
  if (!target) {
    toast("先選一個落點：點球場，或使用右側落點按鈕。");
    $("targetButtons").querySelector("button")?.focus();
    return;
  }
  try {
    const e = captureEvent(
      makeShot(match, { actor: selected, shot, target, skill: useSkill }, profiles, {
        random,
        simulate: preferences.outcome === "model",
        formation: $("formationSelect").value,
      }),
    );
    useSkill = false;
    startAnimation(e);
  } catch (error) {
    toast(error.message);
    note("這一拍需要調整", error.message);
  }
}
function startNext() {
  if (match.finished) return;
  match = nextRally(match);
  entries = [];
  target = null;
  selected = match.server;
  shot = "short";
  save();
  note(
    "新回合，重新找節奏",
    `${profiles[match.server].name} 在${match.side === "right" ? "右" : "左"}區發球，由 ${profiles[match.receiver].name} 接發。`,
  );
  updateUI();
}
$("playButton").onclick = () => {
  unlockAudio();
  if (reviewIndex !== null) {
    returnLive();
    return;
  }
  if (animation && paused) {
    paused = false;
    updateUI();
    return;
  }
  if (match.phase === "ended") {
    startNext();
    return;
  }
  if (playMode === "manual") hitManual();
  else {
    running = true;
    paused = false;
    autoWait = 0;
    updateUI();
  }
};
$("pauseButton").onclick = () => {
  paused = !paused;
  updateUI();
};
$("playModes")
  .querySelectorAll("button")
  .forEach(
    (b) =>
      (b.onclick = () => {
        running = false;
        playMode = b.dataset.play;
        if (animation) paused = true;
        if (replay) {
          animation = null;
          replay = null;
        }
        reviewIndex = null;
        $("playModes")
          .querySelectorAll("button")
          .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        updateUI();
      }),
  );
function autoTick(dt) {
  if (!running || paused || animation || replay || reviewIndex !== null) return;
  autoWait += dt * Number($("speed").value);
  // Keep a rally flowing; pause longer only between points.
  if (autoWait < (match.phase === "ended" ? 1100 : 90)) return;
  autoWait = 0;
  if (match.finished) {
    running = false;
    updateUI();
    return;
  }
  if (match.phase === "ended") {
    startNext();
    return;
  }
  try {
    const plan = choosePlan(match, profiles, random);
    selected = plan.actor;
    shot = plan.shot;
    target = plan.target;
    startAnimation(
      captureEvent(
        makeShot(match, plan, profiles, {
          random,
          simulate: true,
          formation: $("formationSelect").value,
        }),
      ),
    );
  } catch (error) {
    running = false;
    toast(error.message);
    updateUI();
  }
}
function review(i) {
  running = false;
  paused = false;
  animation = null;
  replay = null;
  reviewIndex = i;
  target = null;
  selected = entries[i].actor;
  note(
    `回看第 ${entries[i].after.total} 拍`,
    `${profiles[selected].name} · ${SHOTS[entries[i].shot].label}。${shotContext(entries[i].before, selected, entries[i].shot, entries[i].target, profiles, entries[i])}`,
  );
  updateUI();
}
function returnLive() {
  reviewIndex = null;
  selected = match.nextActor;
  updateUI();
}
$("returnLive").onclick = returnLive;
$("forkButton").textContent = "從這一拍重新打 →";
$("forkButton").onclick = () => {
  if (reviewIndex === null) return;
  const e = entries[reviewIndex];
  match = clone(e.before);
  records.length = e.recordCountBefore;
  archives.length = e.archiveCountBefore;
  entries = entries.slice(0, reviewIndex);
  reviewIndex = null;
  selected = e.actor;
  shot = e.shot;
  target = clone(e.target);
  save();
  note("新的戰術分支", "已回到這一拍擊球前。調整球路與落點，試試另一種配合。");
  updateUI();
};
$("undoButton").onclick = () => {
  if (!entries.length) return;
  const e = entries.pop();
  match = clone(e.before);
  records.length = e.recordCountBefore;
  archives.length = e.archiveCountBefore;
  selected = e.actor ?? match.nextActor;
  target = e.target ? clone(e.target) : null;
  shot = e.shot || shotKeys(match)[0];
  save();
  note("已撤回上一個動作", "比分與站位也已恢復，你可以重新選擇。");
  updateUI();
};
$("replayButton").onclick = () => {
  if (!entries.length) return;
  running = false;
  reviewIndex = null;
  replay = {
    events: clone(entries),
    index: 0,
    display: clone(entries[0].before),
  };
  startAnimation(replay.events[0], true);
};
function manualEnd(winner) {
  if (match.phase !== "rally" || animation) return;
  const before = clone(match),
    after = awardPoint(match, winner);
  commit(captureEvent({ kind: "end", winner, before, after }));
}
$("blueWin").onclick = () => manualEnd(0);
$("coralWin").onclick = () => manualEnd(1);
$("trailToggle").onclick = () => {
  const active = $("trailToggle").getAttribute("aria-pressed") !== "true";
  $("trailToggle").setAttribute("aria-pressed", String(active));
  $("trailToggle").innerHTML = `軌跡 <span>${active ? "開" : "關"}</span>`;
};
function syncToggles() {
  $("viewToggle").setAttribute(
    "aria-pressed",
    String(preferences.view !== "tactical"),
  );
  $("viewToggle").innerHTML = `視角 <span>${viewName()}</span>`;
  $("soundToggle").setAttribute("aria-pressed", String(preferences.sound));
  $("soundToggle").innerHTML = `音效 <span>${preferences.sound ? "開" : "關"}</span>`;
}
$("viewToggle").onclick = () => {
  // Step to the next preset after whichever one the current camera is closest to.
  const now =
    preferences.view === "tactical"
      ? 0
      : preferences.elevation < 0.35
        ? 2
        : 1,
    next = VIEWS[(now + 1) % VIEWS.length];
  preferences.view = next.view;
  if (next.elevation !== undefined) preferences.elevation = next.elevation;
  applyView();
  syncToggles();
  save();
};
$("elevation").oninput = () => {
  preferences.elevation = Number($("elevation").value) / 100;
  applyView();
  save();
};
$("soundToggle").onclick = () => {
  preferences.sound = !preferences.sound;
  if (preferences.sound) {
    unlockAudio();
    playHit("touch");
  }
  syncToggles();
  save();
};
function courtOptions() {
  const serving = match.phase === "serve";
  $("serverSelect").innerHTML = profiles
    .map((p, i) => `<option value="${i}">${safe(p.name)}</option>`)
    .join("");
  $("serverSelect").value = match.server;
  receiverOptions();
  $("serverSelect").disabled = !serving;
  $("receiverSelect").disabled = !serving;
}
function receiverOptions() {
  const server = Number($("serverSelect").value),
    foes = team(server) ? [0, 1] : [2, 3];
  $("receiverSelect").innerHTML = foes
    .map((i) => `<option value="${i}">${safe(profiles[i].name)}</option>`)
    .join("");
  $("receiverSelect").value = foes.includes(match.receiver)
    ? match.receiver
    : foes[0];
}
$("courtSettings").onclick = () => {
  courtOptions();
  $("settingsDialog").showModal();
};
$("serverSelect").onchange = receiverOptions;
$("applyCourtSettings").onclick = () => {
  if (match.phase === "serve") {
    match = setupServe(
      match,
      Number($("serverSelect").value),
      Number($("receiverSelect").value),
    );
    selected = match.server;
    target = null;
    save();
  }
  preferences.motion = $("motionSetting").value;
  preferences.formation = $("formationSelect").value;
  preferences.outcome = $("outcomeSetting").value;
  save();
  $("settingsDialog").close();
  updateUI();
  toast("球場設定已套用");
};
function askRestart() {
  running = false;
  if (animation) paused = true;
  $("restartDialog").showModal();
  if (match) updateUI();
}
$("setupRestart").onclick = askRestart;
$("courtRestart").onclick = askRestart;
$("keepLineup").onclick = () => {
  lineupDirty = false;
  renderLineupPrompt();
  toast("保留目前比分，新陣容從下一拍開始。");
};
$("restartButton").onclick = () => {
  running = false;
  if (animation) paused = true;
  $("restartDialog").showModal();
  updateUI();
};
$("confirmRestart").onclick = () => {
  running = false;
  paused = false;
  animation = null;
  replay = null;
  reviewIndex = null;
  match = createMatch(config);
  entries = [];
  archives = [];
  records = [];
  target = null;
  selected = 0;
  shot = "short";
  lineupDirty = false;
  renderLineupPrompt();
  save();
  $("restartDialog").close();
  page("court");
  note("新的比賽，新的可能", "陣容與人物設定已保留，從第一個發球開始。");
  // Arrange who serves and receives first for the new lineup.
  if ($("arrangeAfterRestart").checked) {
    courtOptions();
    $("settingsDialog").showModal();
  }
};
let exportUrl = null;
$("exportButton").onclick = () => {
  running = false;
  if (animation) paused = true;
  updateUI();
  const data = {
    title: "羽球模擬器 羽球沙盤推演",
    version: 2,
    exportedAt: new Date().toISOString(),
    config,
    profiles,
    match,
    records,
    completedRallies: archives,
    currentRally: entries,
    coordinates: "公尺；x 向畫面右、z 向藍隊底線；球網 z=0",
    model: "簡化戰術機率模型，非真實勝率預測",
  };
  const json = JSON.stringify(data, null, 2);
  if (exportUrl) URL.revokeObjectURL(exportUrl);
  exportUrl = URL.createObjectURL(
    new Blob([json], { type: "application/json" }),
  );
  $("exportContent").value = json;
  $("downloadExport").href = exportUrl;
  $("downloadExport").download =
    "badminton-simulator-" + new Date().toISOString().slice(0, 10) + ".json";
  $("exportSummary").textContent =
    `${records.length} 個回合 · ${profiles.length} 位球員 · ${match.config.bestOf === 3 ? "三局兩勝" : "一局決勝"}`;
  $("exportDialog").showModal();
};
$("copyExport").onclick = async () => {
  try {
    await navigator.clipboard.writeText($("exportContent").value);
    toast("完整紀錄已複製");
  } catch {
    $("exportDialog").querySelector("details").open = true;
    $("exportContent").focus();
    $("exportContent").select();
    toast("請按 Ctrl+C 或 Command+C 複製紀錄。");
  }
};
function info(type) {
  running = false;
  if (animation) paused = true;
  if (match) updateUI();
  $("infoTitle").textContent =
    type === "model" ? "關於推演模型" : "三步，開始你的推演";
  $("infoContent").innerHTML =
    type === "model"
      ? `<p>這是一個探索雙打配合的沙盤。級數 1–18 級，分階參考台灣羽球推廣協會的羽球程度分級（新手階、初階、初中階、中階、中進階、高階、職業級）；性別不直接改變能力。級數同時影響失誤率、球速與得分率：1 級每拍失誤約三成、殺球約 120 km/h；18 級失誤約 2%、殺球約 340 km/h。</p><h3>自動推演怎麼決定？</h3><p>球路依性格、球風與擊球位置選擇。擊球失誤與接球能力依級數、對手壓力、移動距離、進攻風險和長回合疲勞抽樣；高級數球員回位範圍較大，球飛得也較快。動畫會呈現出界、下網與接球未及，結果不代表真實比賽勝率。</p><h3>計分與場地</h3><p>21 分局最多 30 分，11 分短局最多 15 分；達目標後須領先兩分，封頂時先到者勝。雙打發球落點距網 1.98–5.94 m，回合底線距網 6.70 m，寬 6.10 m。落點壓線視為界內。</p><p>逐球模式預設也依級數、性格與球風判定下網、出界與得分，擊球前會顯示估算機率；可在球場設定改為「只推演路線，由我判定得分」。未判定發球高度、雙擊與完整球體碰撞。</p>`
      : `<h3>01 ／ 組建陣容</h3><p>選擇男雙、女雙或混雙。點人物卡即可設定姓名、1–18 級、性格、球風與外觀，預設都是 6 級（初中階）。</p><h3>02 ／ 選擇節奏</h3><p>逐球模式：選擊球者 → 選球路 → 點落點 → 打出這一拍。自動回合只打到一分；全自動比賽則依賽制打到結束。</p><h3>03 ／ 看懂每一拍</h3><p>按暫停觀察補位；點時間軸回看單拍。選「從這一拍重新打」可以改寫之後的推演，比分也會一起恢復。</p><p>可拖曳球員調整站位，也可用按鈕選球員和落點。<kbd>空白鍵</kbd> 播放／暫停，<kbd>Esc</kbd> 關閉面板。</p><p>返回組隊會保留進度；重新開賽才會清空紀錄。人物與比賽會自動儲存在此瀏覽器。</p><button class="button" id="showWelcomeAgain">重新播放首次引導 ↗</button>`;
  $("infoDialog").showModal();
  if ($("showWelcomeAgain"))
    $("showWelcomeAgain").onclick = () => {
      $("infoDialog").close();
      showWelcome();
    };
}
$("helpButton").onclick = () => {
  running = false;
  if (animation) paused = true;
  if (match) updateUI();
  info("help");
};
$("modelInfo").onclick = () => info("model");
document
  .querySelectorAll("[data-close]")
  .forEach((b) => (b.onclick = () => $(b.dataset.close).close()));
document.querySelectorAll("dialog").forEach((d) =>
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  }),
);
function courtLocked() {
  return (
    !match ||
    animation ||
    running ||
    replay ||
    reviewIndex !== null ||
    match.phase === "ended"
  );
}
$("court").addEventListener("pointerdown", (e) => {
  if (!match) return;
  const r = $("court").getBoundingClientRect(),
    q = { x: e.clientX - r.left, y: e.clientY - r.top },
    hits = courtLocked()
      ? []
      : match.positions
          .map((p, i) => {
            const a = renderer.project(p.x, p.z, 0.85);
            return { i, d: Math.hypot(q.x - a.x, q.y - a.y) };
          })
          .filter((x) => x.d < 27)
          .sort((a, b) => a.d - b.d);
  if (hits.length) {
    const i = hits[0].i,
      point = renderer.point(e.clientX, e.clientY),
      p = match.positions[i];
    if (actors(match).includes(i)) selected = i;
    drag = {
      kind: "player",
      id: e.pointerId,
      actor: i,
      start: q,
      before: clone(match),
      offset: { x: p.x - point.x, z: p.z - point.z },
      moved: false,
    };
    $("court").setPointerCapture(e.pointerId);
    updateUI();
    return;
  }
  // Empty court: a tap picks a landing spot; a vertical drag tilts the camera.
  if (courtLocked() && preferences.view !== "camera") return;
  drag = {
    kind: "look",
    id: e.pointerId,
    start: q,
    client: { x: e.clientX, y: e.clientY },
    elevation: preferences.elevation,
    moved: false,
  };
  $("court").setPointerCapture(e.pointerId);
});
function pickTarget(clientX, clientY) {
  if (courtLocked()) return;
  const point = renderer.point(clientX, clientY);
  if (!legalTarget(match, point)) {
    toast(
      match.phase === "serve"
        ? "發球請選黃色斜對角接發球區內。"
        : "請選對方半場內的落點。",
    );
    return;
  }
  target = point;
  note("落點已選，準備擊球", plannedNote(match));
  updateUI();
}
$("court").addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const r = $("court").getBoundingClientRect(),
    dx = e.clientX - r.left - drag.start.x,
    dy = e.clientY - r.top - drag.start.y;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  if (drag.kind === "look") {
    if (preferences.view !== "camera") return;
    drag.moved = true;
    // Drag up to raise the camera, down to sit lower beside the court.
    preferences.elevation = clamp(drag.elevation - dy / 260, 0, 1);
    applyView();
    return;
  }
  drag.moved = true;
  const p = renderer.point(e.clientX, e.clientY),
    i = drag.actor,
    z = sign(i);
  match.positions[i] = {
    x: clamp(p.x + drag.offset.x, -3, 3),
    z: z * clamp((p.z + drag.offset.z) * z, 0.2, 6.6),
  };
  renderer.dirty = true;
  if (match.phase === "serve" && i === match.server)
    match.origin = clone(match.positions[i]);
});
function finishDrag(e) {
  const d = drag;
  drag = null;
  if (!d) return;
  if (d.kind === "look") {
    if (d.moved) save();
    else if (e.type === "pointerup") pickTarget(d.client.x, d.client.y);
    return;
  }
  if (d.moved) {
    entries.push(
      captureEvent({
        kind: "move",
        actor: d.actor,
        before: d.before,
        after: clone(match),
      }),
    );
    save();
    updateUI();
  }
}
["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
  $("court").addEventListener(type, finishDrag),
);
window.addEventListener("keydown", (e) => {
  if (
    e.code !== "Space" ||
    $("courtPage").hidden ||
    document.querySelector("dialog[open]") ||
    !$("welcome").hidden ||
    /INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)
  )
    return;
  e.preventDefault();
  if (animation || running || replay) $("pauseButton").click();
  else $("playButton").click();
});
let welcomeAnimations = [];
function showWelcome() {
  running = false;
  if (animation) paused = true;
  $("welcome").hidden = false;
  document.body.classList.add("welcome-open");
  $("welcome").classList.remove("leaving");
  document.querySelector(".app-shell").inert = true;
  $("beginWelcome").focus();
  welcomeAnimations.forEach((a) => a.cancel());
  welcomeAnimations = [];
  if (!reduceMotion()) {
    const shuttle = $("welcome").querySelector(".welcome-flight");
    welcomeAnimations.push(
      shuttle.animate(
        [
          {
            transform: "translate(-65vw,28vh) rotate(-80deg)",
            opacity: 0,
            offset: 0,
          },
          {
            transform: "translate(-25vw,-8vh) rotate(-25deg)",
            opacity: 1,
            offset: 0.5,
          },
          { transform: "translate(0,0) rotate(25deg)", opacity: 1, offset: 1 },
        ],
        { duration: 1150, easing: "cubic-bezier(.18,.72,.22,1)", fill: "both" },
      ),
    );
    welcomeAnimations.push(
      $("welcome")
        .querySelector(".welcome-content")
        .animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 420,
            delay: 250,
            easing: "cubic-bezier(.2,.7,.2,1)",
            fill: "both",
          },
        ),
    );
  }
}
function closeWelcome() {
  welcomeAnimations.forEach((a) => a.cancel());
  welcomeAnimations = [];
  page("setup");
  try {
    localStorage.setItem(WELCOME, "seen");
  } catch {}
  document.querySelector(".app-shell").inert = false;
  $("welcome").classList.add("leaving");
  const finish = () => {
    $("welcome").hidden = true;
    document.body.classList.remove("welcome-open");
    $("setupHeading").setAttribute("tabindex", "-1");
    $("setupHeading").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  if (reduceMotion()) finish();
  else
    $("welcome")
      .animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 220,
        easing: "ease-out",
      })
      .finished.then(finish)
      .catch(finish);
}
$("beginWelcome").onclick = closeWelcome;
$("skipWelcome").onclick = closeWelcome;
$("welcome").addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeWelcome();
    return;
  }
  if (e.key === "Tab") {
    const buttons = [$("skipWelcome"), $("beginWelcome")];
    if (e.shiftKey && document.activeElement === buttons[0]) {
      e.preventDefault();
      buttons[1].focus();
    } else if (!e.shiftKey && document.activeElement === buttons[1]) {
      e.preventDefault();
      buttons[0].focus();
    }
  }
});
function tick(now) {
  const dt = Math.min(60, now - lastTime);
  lastTime = now;
  if (document.hidden) {
    requestAnimationFrame(tick);
    return;
  }
  if (!$("courtPage").hidden && match) {
    if (animation && !paused && animation.freeze > 0) animation.freeze -= dt;
    else if (animation && !paused) {
      animation.elapsed += dt * Number($("speed").value);
      if (
        !animation.hit &&
        animation.event.kind === "shot" &&
        animation.elapsed >= animation.duration * animation.prep
      ) {
        animation.hit = true;
        if (preferences.sound) playHit(soundFor(animation.event.shot));
        const ev = animation.event;
        if (POWER_SHOTS.includes(ev.shot) || (ev.skill && ev.skillUser === ev.actor))
          smashImpact(animation, now);
      }
      if (animation.elapsed >= animation.duration) finishAnimation();
    }
    autoTick(dt);
    const s = displayState(),
      trail =
        reviewIndex === null ? entries : entries.slice(0, reviewIndex + 1);
    if (renderer.dirty || (animation && !paused) || renderer.effects.busy(now)) {
      renderer.dirty = false;
      renderer.render(s, profiles, {
        animation,
        selected,
        target,
        trail,
        showTrail: $("trailToggle").getAttribute("aria-pressed") === "true",
        time: now,
        previewShot: shot,
        reduceMotion: reduceMotion(),
        tension: s.phase === "ended" ? 0 : clamp((s.total - 8) / 10, 0, 1),
      });
    }
  }
  requestAnimationFrame(tick);
}
load();
if (match)
  note(
    match.phase === "ended"
      ? `已恢復比賽：${match.winner ? "紅" : "藍"}隊得分`
      : "已恢復上次的推演",
    match.phase === "ended"
      ? `${match.reason}。你可以回看球路或開始下一回合。`
      : "比分、人物與球路紀錄已保留，從目前進度繼續。",
  );
renderRoster();
$("formationSelect").value = preferences.formation;
$("motionSetting").value = preferences.motion;
$("outcomeSetting").value = preferences.outcome;
applyView();
let seen = false;
try {
  seen = localStorage.getItem(WELCOME) === "seen";
} catch {}
if (!seen) showWelcome();
checkSharedCard();
requestAnimationFrame(tick);
