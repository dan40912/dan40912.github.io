// 全域狀態:AppState 讀寫、簡易 pub-sub 重繪、復原歷史。
import { saveStateThrottled, saveStateNow, loadState, clearState } from "./services/storage.js";
import { findDuplicatePlacements, SCHEMA_VERSION } from "./domain/validators.js";
import { genId } from "./domain/id.js";

const HISTORY_LIMIT = 20;

let state = null;
let uiState = {
  screen: "start", // 'start' | 'setup' | 'main'
  activeCourtId: null, // 手機版目前顯示的場地
  selectedChip: null, // 點選來源交換:{ playerId, from }
  toast: null, // { message, actionLabel, onAction, expiresAt }
};
const listeners = new Set();
const historyStack = [];

export { genId };

export function getState() {
  return state;
}

export function getUiState() {
  return uiState;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn();
}

export function setUiState(patch) {
  uiState = { ...uiState, ...patch };
  notify();
}

export function commit(nextState, { record = true, immediate = false } = {}) {
  if (record && state) {
    historyStack.push(state);
    if (historyStack.length > HISTORY_LIMIT) historyStack.shift();
  }
  state = nextState;
  const issues = findDuplicatePlacements(state);
  if (issues.length > 0) {
    console.error("狀態不一致,球員出現在多個位置", issues);
  }
  if (immediate) saveStateNow(state);
  else saveStateThrottled(state);
  notify();
}

export function dispatch(reducer, ...args) {
  if (!state) return;
  const next = reducer(state, ...args);
  if (next && next !== state) commit(next);
  return next;
}

export function canUndo() {
  return historyStack.length > 0;
}

export function undo() {
  if (historyStack.length === 0) return false;
  state = historyStack.pop();
  saveStateThrottled(state);
  notify();
  return true;
}

export function loadPersisted() {
  const s = loadState();
  if (s) state = s;
  return s;
}

export function resetAll() {
  clearState();
  state = null;
  historyStack.length = 0;
  uiState = { screen: "start", activeCourtId: null, selectedChip: null, toast: null };
  notify();
}

export function buildInitialAppState(eventSettings, rosterEntries) {
  const courts = Array.from({ length: eventSettings.courtCount }, (_, i) => ({
    id: genId("court"),
    name: `場地 ${i + 1}`,
    playingSlots: [null, null, null, null],
    onDeckSlots: [null, null, null, null],
    activeMatchId: null,
    matchStartSnapshot: null,
  }));

  const now = new Date().toISOString();
  const players = rosterEntries.map((e) => ({
    id: e.id,
    name: e.name,
    level: e.level,
    status: e.arrived ? "queued" : "notArrived",
    courtId: null,
    slotIndex: null,
    playCount: 0,
    waitingMatches: 0,
    lastPlayedAt: null,
    createdAt: now,
  }));

  const queue = players.filter((p) => p.status === "queued").map((p) => p.id);
  const notArrived = players.filter((p) => p.status === "notArrived").map((p) => p.id);

  return {
    schemaVersion: SCHEMA_VERSION,
    event: { ...eventSettings, createdAt: now },
    players,
    courts,
    queue,
    paused: [],
    notArrived,
    matches: [],
  };
}

export function setActiveCourt(courtId) {
  setUiState({ activeCourtId: courtId });
}

export function showToast(toast) {
  setUiState({ toast });
}

export function dismissToast() {
  setUiState({ toast: null });
}
