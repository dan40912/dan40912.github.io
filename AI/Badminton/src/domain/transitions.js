// 狀態轉移:交換、結束比賽、遞補、報到/暫停(PRD §6.5-§6.7、§9)。純函式,輸入 state 輸出新 state。
import { genId } from "./id.js";
import { planOnDeckRefill, splitTeams } from "./scheduler.js";

// ---------- 位置定址 ----------

export function locationOfPlayer(state, playerId) {
  for (const c of state.courts) {
    const pi = c.playingSlots.indexOf(playerId);
    if (pi !== -1) return { type: "court", courtId: c.id, area: "playing", slotIndex: pi };
    const oi = c.onDeckSlots.indexOf(playerId);
    if (oi !== -1) return { type: "court", courtId: c.id, area: "onDeck", slotIndex: oi };
  }
  let idx = state.queue.indexOf(playerId);
  if (idx !== -1) return { type: "queue", index: idx };
  idx = state.paused.indexOf(playerId);
  if (idx !== -1) return { type: "paused", index: idx };
  idx = state.notArrived.indexOf(playerId);
  if (idx !== -1) return { type: "notArrived", index: idx };
  return null;
}

export function getPlayerIdAtLocation(state, loc) {
  if (!loc) return null;
  if (loc.type === "court") {
    const c = state.courts.find((c) => c.id === loc.courtId);
    if (!c) return null;
    return (loc.area === "playing" ? c.playingSlots : c.onDeckSlots)[loc.slotIndex] ?? null;
  }
  const arr = state[loc.type];
  if (typeof loc.index === "number") return arr[loc.index] ?? null;
  return null;
}

function placeAtLocation(state, loc, playerId) {
  if (loc.type === "court") {
    return {
      ...state,
      courts: state.courts.map((c) => {
        if (c.id !== loc.courtId) return c;
        const key = loc.area === "playing" ? "playingSlots" : "onDeckSlots";
        const slots = [...c[key]];
        slots[loc.slotIndex] = playerId;
        return { ...c, [key]: slots };
      }),
    };
  }
  const arrayKey = loc.type; // 'queue' | 'paused' | 'notArrived'
  let arr = [...state[arrayKey]];
  if (playerId === null) {
    if (typeof loc.index === "number") arr.splice(loc.index, 1);
  } else if (typeof loc.index === "number" && loc.index < arr.length) {
    arr[loc.index] = playerId;
  } else {
    arr.push(playerId);
  }
  return { ...state, [arrayKey]: arr };
}

function locationToStatus(loc) {
  if (loc.type === "court") return loc.area === "playing" ? "playing" : "onDeck";
  if (loc.type === "queue") return "queued";
  return loc.type; // 'paused' | 'notArrived'
}

function syncPlayerLocation(state, playerId, loc) {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId
        ? {
            ...p,
            status: locationToStatus(loc),
            courtId: loc.type === "court" ? loc.courtId : null,
            slotIndex: loc.type === "court" ? loc.slotIndex : null,
          }
        : p,
    ),
  };
}

function refreshMatchStartSnapshots(state) {
  const now = new Date().toISOString();
  return {
    ...state,
    courts: state.courts.map((c) => {
      const full = c.playingSlots.every((id) => id !== null);
      if (full && !c.matchStartSnapshot) {
        return { ...c, matchStartSnapshot: { ids: [...c.playingSlots], capturedAt: now } };
      }
      if (!full && c.matchStartSnapshot) {
        return { ...c, matchStartSnapshot: null };
      }
      return c;
    }),
  };
}

// 拖放/點選交換的統一入口(PRD §6.5 交換規則 1-5)。
export function swapByLocation(state, sourceLoc, targetLoc) {
  const sourceId = getPlayerIdAtLocation(state, sourceLoc);
  if (!sourceId) return state;
  const targetId = getPlayerIdAtLocation(state, targetLoc);
  if (sourceId === targetId) return state;

  let next = placeAtLocation(state, sourceLoc, targetId ?? null);
  next = placeAtLocation(next, targetLoc, sourceId);
  next = syncPlayerLocation(next, sourceId, targetLoc);
  if (targetId) next = syncPlayerLocation(next, targetId, sourceLoc);

  return refreshMatchStartSnapshots(next);
}

function moveToOpenList(state, playerId, listType) {
  const source = locationOfPlayer(state, playerId);
  if (!source) return state;
  return swapByLocation(state, source, { type: listType });
}

// ---------- 報到 / 暫停 / 離場 ----------

export function checkIn(state, playerId) {
  return moveToOpenList(state, playerId, "queue");
}

export function pausePlayer(state, playerId) {
  return moveToOpenList(state, playerId, "paused");
}

export function resumePlayer(state, playerId) {
  return moveToOpenList(state, playerId, "queue");
}

export function markNotArrived(state, playerId) {
  return moveToOpenList(state, playerId, "notArrived");
}

export function addPlayerMidEvent(state, { name, level }) {
  const now = new Date().toISOString();
  const player = {
    id: genId("player"),
    name,
    level,
    status: "queued",
    courtId: null,
    slotIndex: null,
    playCount: 0,
    waitingMatches: 0,
    lastPlayedAt: null,
    createdAt: now,
  };
  return { ...state, players: [...state.players, player], queue: [...state.queue, player.id] };
}

export function renameCourt(state, courtId, name) {
  return { ...state, courts: state.courts.map((c) => (c.id === courtId ? { ...c, name } : c)) };
}

export function toggleSpeech(state) {
  return { ...state, event: { ...state.event, speechEnabled: !state.event.speechEnabled } };
}

export function updateEventSettings(state, patch) {
  return { ...state, event: { ...state.event, ...patch } };
}

// ---------- 自動安排 ----------

export function isCourtEmpty(court) {
  return court.playingSlots.every((id) => id === null) && court.onDeckSlots.every((id) => id === null);
}

export function applyAutoArrangePlan(state, plan) {
  let next = state;
  for (const { courtId, playingIds, onDeckIds } of plan) {
    playingIds.forEach((id, i) => {
      next = placeAtLocation(next, { type: "court", courtId, area: "playing", slotIndex: i }, id);
      next = syncPlayerLocation(next, id, { type: "court", courtId, area: "playing", slotIndex: i });
      next = { ...next, queue: next.queue.filter((q) => q !== id) };
    });
    onDeckIds.forEach((id, i) => {
      next = placeAtLocation(next, { type: "court", courtId, area: "onDeck", slotIndex: i }, id);
      next = syncPlayerLocation(next, id, { type: "court", courtId, area: "onDeck", slotIndex: i });
      next = { ...next, queue: next.queue.filter((q) => q !== id) };
    });
  }
  return refreshMatchStartSnapshots(next);
}

// 重新安排某一場的候場區:釋回目前候場球員,依公平性重新挑選。
export function regenerateOnDeck(state, courtId) {
  const court = state.courts.find((c) => c.id === courtId);
  if (!court) return state;
  let next = state;
  for (const id of court.onDeckSlots) {
    if (id) next = moveToOpenList(next, id, "queue");
  }
  const context = { justFinishedIds: new Set(), recentCourtMap: buildRecentCourtMap(next.matches), courtId };
  const refillIds = planOnDeckRefill(next, courtId, 4, context);
  refillIds.forEach((id, i) => {
    next = placeAtLocation(next, { type: "court", courtId, area: "onDeck", slotIndex: i }, id);
    next = syncPlayerLocation(next, id, { type: "court", courtId, area: "onDeck", slotIndex: i });
    next = { ...next, queue: next.queue.filter((q) => q !== id) };
  });
  return next;
}

function buildRecentCourtMap(matches) {
  const map = new Map();
  for (const m of matches) {
    for (const id of [...m.teamA, ...m.teamB]) map.set(id, m.courtId);
  }
  return map;
}

// ---------- 本場結束(PRD §6.7,原子操作) ----------

export function endMatch(state, courtId) {
  const court = state.courts.find((c) => c.id === courtId);
  if (!court) return state;
  const finishedIds = court.playingSlots.filter((id) => id !== null);
  if (finishedIds.length === 0) return state;

  const now = new Date().toISOString();
  const teamA = court.playingSlots.slice(0, 2).filter(Boolean);
  const teamB = court.playingSlots.slice(2, 4).filter(Boolean);
  const isIncomplete = finishedIds.length < 4;

  const byId = new Map(state.players.map((p) => [p.id, p]));
  const levelSnapshot = {};
  for (const id of finishedIds) levelSnapshot[id] = byId.get(id).level;

  const snapshot = court.matchStartSnapshot;
  const wasManuallyAdjusted = snapshot
    ? snapshot.ids.some((id, i) => id !== court.playingSlots[i])
    : false;
  const substitutions = [];
  if (snapshot) {
    snapshot.ids.forEach((outId, i) => {
      const inId = court.playingSlots[i];
      if (outId !== inId) substitutions.push({ slotIndex: i, outPlayerId: outId, inPlayerId: inId });
    });
  }

  const sequence = state.matches.filter((m) => m.courtId === courtId).length + 1;
  const matchRecord = {
    id: genId("match"),
    courtId,
    sequence,
    teamA,
    teamB,
    levelSnapshot,
    startedAt: snapshot ? snapshot.capturedAt : null,
    endedAt: now,
    substitutions,
    isIncomplete,
    wasManuallyAdjusted,
  };

  // 1) 已在候場前的等候名單球員等待場次 +1(暫停中不計)。
  const queueBeforeIds = new Set(state.queue);
  let next = {
    ...state,
    players: state.players.map((p) => {
      if (finishedIds.includes(p.id)) {
        return { ...p, playCount: p.playCount + 1, lastPlayedAt: now, waitingMatches: 0 };
      }
      if (queueBeforeIds.has(p.id)) {
        return { ...p, waitingMatches: p.waitingMatches + 1 };
      }
      return p;
    }),
    matches: [...state.matches, matchRecord],
  };

  // 2) 原場上球員回到等候名單尾端。
  next = { ...next, queue: [...next.queue, ...finishedIds] };

  // 3) 候場依順位遞補場上,並依分隊邏輯決定 A/B 隊。
  const promotedIds = court.onDeckSlots.filter((id) => id !== null);
  const promotedPlayers = promotedIds.map((id) => next.players.find((p) => p.id === id));
  let newPlaying = [null, null, null, null];
  if (promotedPlayers.length === 4) {
    const split = splitTeams(promotedPlayers, next.matches);
    newPlaying = [split.a[0].id, split.a[1].id, split.b[0].id, split.b[1].id];
  } else {
    promotedPlayers.forEach((p, i) => {
      newPlaying[i] = p.id;
    });
  }

  next = {
    ...next,
    courts: next.courts.map((c) =>
      c.id === courtId
        ? { ...c, playingSlots: newPlaying, onDeckSlots: [null, null, null, null], activeMatchId: null }
        : c,
    ),
  };
  next = {
    ...next,
    players: next.players.map((p) => {
      const idx = newPlaying.indexOf(p.id);
      if (idx === -1) return p;
      return { ...p, status: "playing", courtId, slotIndex: idx, waitingMatches: 0 };
    }),
    queue: next.queue.filter((id) => !promotedIds.includes(id)),
  };

  // 4) 從等候名單挑最多 4 人補入候場區。
  const context = {
    justFinishedIds: new Set(finishedIds),
    recentCourtMap: buildRecentCourtMap(next.matches),
    courtId,
  };
  const refillIds = planOnDeckRefill(next, courtId, 4, context);
  const newOnDeck = [null, null, null, null];
  refillIds.forEach((id, i) => {
    newOnDeck[i] = id;
  });
  next = {
    ...next,
    courts: next.courts.map((c) => (c.id === courtId ? { ...c, onDeckSlots: newOnDeck } : c)),
    players: next.players.map((p) => {
      const idx = newOnDeck.indexOf(p.id);
      if (idx === -1) return p;
      return { ...p, status: "onDeck", courtId, slotIndex: idx, waitingMatches: 0 };
    }),
    queue: next.queue.filter((id) => !refillIds.includes(id)),
  };

  return refreshMatchStartSnapshots(next);
}

export function newOnCourtNames(prevState, nextState, courtId) {
  const prevCourt = prevState.courts.find((c) => c.id === courtId);
  const nextCourt = nextState.courts.find((c) => c.id === courtId);
  if (!nextCourt) return [];
  const prevIds = new Set(prevCourt ? prevCourt.playingSlots.filter(Boolean) : []);
  const byId = new Map(nextState.players.map((p) => [p.id, p]));
  return nextCourt.playingSlots
    .filter((id) => id && !prevIds.has(id))
    .map((id) => byId.get(id).name);
}
