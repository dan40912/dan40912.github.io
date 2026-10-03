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
} from "./model.js";
import { playHit, unlockAudio } from "./audio.js";
import { portrait, describe, escapeHTML, TEAM_COLORS } from "./characters.js";
import { CourtRenderer, ELEVATION } from "./court.js";
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
    profiles = data.profiles.map((p) => ({ ...p, gender: genderOf(p) }));
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
        `<button class="player-card ${i > 1 ? "coral-card" : ""}" data-player="${i}" aria-label="編輯${safe(p.name)}，${p.level}級，${PERSONALITIES[p.personality]}，${STYLES[p.style]}"><div class="player-topline"><span class="player-number">${i < 2 ? "BLUE" : "CORAL"} / 0${(i % 2) + 1} · ${gender(i)}</span><span class="level-pill">LV. ${p.level} · ${tierOf(p.level).name}</span></div><div class="player-portrait">${portrait(p, i)}</div><div class="player-info"><div class="player-name">${safe(p.name)}<span>↗</span></div><div class="player-tags"><span>${PERSONALITIES[p.personality]}</span><span>${STYLES[p.style]}</span></div><p class="player-desc">${describe(p)}</p></div></button>`,
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
  draft = {
    ...draft,
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
  renderPicker();
  const ok = validLevel(draft.level);
  $("levelDescription").textContent = ok
    ? levelText(draft.level)
    : `請輸入 1–${MAX_LEVEL} 級`;
  $("levelDetail").textContent = ok
    ? `${LEVEL_NOTES[draft.level]} 殺球約 ${shotSpeed("smash", draft.level)} km/h。`
    : "";
}
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
    before.style !== draft.style
  )
    edited.add(editing);
  profiles[editing] = { ...clone(draft), gender: gender(editing) };
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
        renderRoster();
        save();
        if (swapped.length)
          toast(`已換上符合賽制的球員：${swapped.join("、")}（級數、性格與球風保留）`);
      }),
  );
$("matchPoints").onchange = () => {
  config.points = Number($("matchPoints").value);
  settingsNotice();
  save();
};
$("matchFormat").onchange = () => {
  config.bestOf = Number($("matchFormat").value);
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
    `<div class="score-team ${t ? "right-team" : ""}">${!t ? avatarPair(t) : ""}<div><div class="score-team-name">${team(s.server) === t ? '<i class="serve-indicator"></i>' : ""}${t ? "CORAL TEAM" : "BLUE TEAM"} · ${t ? "紅隊" : "藍隊"}</div><p class="score-team-players">${safe(profiles[t * 2].name)} <b>${profiles[t * 2].level}</b> / ${safe(profiles[t * 2 + 1].name)} <b>${profiles[t * 2 + 1].level}</b></p></div>${t ? avatarPair(t) : ""}</div>`;
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
            `<button class="timeline-shot ${team(e.actor) ? "coral-shot" : ""}" data-index="${i}" aria-pressed="${reviewIndex === i}" aria-label="回看第${n + 1}拍，${safe(profiles[e.actor].name)}，${SHOTS[e.shot].label}"><strong>${String(n + 1).padStart(2, "0")} · ${SHOTS[e.shot].label}</strong><span>${safe(profiles[e.actor].name)} · ${shotSpeed(e.shot, profiles[e.actor].level)} km/h${e.outcome !== "return" ? " · " + e.after.reason : ""}</span></button>`,
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
    `<span class="result-label">${s.finished ? "MATCH COMPLETE" : s.gameEnded ? "GAME COMPLETE" : "POINT COMPLETE"}</span><strong>${s.winner ? "紅" : "藍"}隊${s.finished ? "贏得比賽" : s.gameEnded ? "拿下這一局" : "得分"}</strong><p>${safe(s.reason)} · ${s.total} 拍的攻防</p>${!s.finished && !running ? '<button class="button primary" id="nextPointButton">' + (s.gameEnded ? "開始下一局" : "開始下一回合") + " ↗</button>" : ""}`;
  if ($("nextPointButton")) $("nextPointButton").onclick = startNext;
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
  const step = e.shot === "smash" ? 300 : 340,
    flight = flightMs(e.shot, profiles[e.actor]?.level ?? 6),
    duration = reduceMotion() ? 500 : e.kind === "shot" ? step + flight : 450;
  animation = {
    event: e,
    elapsed: 0,
    duration,
    prep: reduceMotion() ? 0.5 : step / duration,
    hit: false,
    isReplay,
  };
  paused = false;
  updateUI();
}
function finishAnimation() {
  const { event, isReplay } = animation;
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
    const o = shotOdds(s, { actor, shot: shotKey, target: point }, profiles),
      pct = (v) => Math.round(v * 100);
    return `依級數估算：球速約 ${shotSpeed(shotKey, profiles[actor].level)} km/h・失誤 ${pct(o.error)}%・直接得分 ${pct(o.win)}%・被回擊 ${pct(1 - o.error - o.win)}%（${profiles[actor].name} ${profiles[actor].level} 級 vs ${profiles[o.receiver].name} ${profiles[o.receiver].level} 級）。`;
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
      makeShot(match, { actor: selected, shot, target }, profiles, {
        random,
        simulate: preferences.outcome === "model",
        formation: $("formationSelect").value,
      }),
    );
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
  save();
  $("restartDialog").close();
  page("court");
  note("新的比賽，新的可能", "陣容與人物設定已保留，從第一個發球開始。");
};
let exportUrl = null;
$("exportButton").onclick = () => {
  running = false;
  if (animation) paused = true;
  updateUI();
  const data = {
    title: "Rally Lab 羽球沙盤推演",
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
    "rally-lab-" + new Date().toISOString().slice(0, 10) + ".json";
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
    if (animation && !paused) {
      animation.elapsed += dt * Number($("speed").value);
      if (
        !animation.hit &&
        animation.event.kind === "shot" &&
        animation.elapsed >= animation.duration * animation.prep
      ) {
        animation.hit = true;
        if (preferences.sound) playHit(soundFor(animation.event.shot));
      }
      if (animation.elapsed >= animation.duration) finishAnimation();
    }
    autoTick(dt);
    const s = displayState(),
      trail =
        reviewIndex === null ? entries : entries.slice(0, reviewIndex + 1);
    if (renderer.dirty || (animation && !paused)) {
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
requestAnimationFrame(tick);
