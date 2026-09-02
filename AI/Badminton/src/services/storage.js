// 本機保存(PRD §6.11)。localStorage 為主,節流寫入避免頻繁操作卡頓。

import { SCHEMA_VERSION } from "../domain/validators.js";

const KEY = "badminton:appState";
const THROTTLE_MS = 300;
let timer = null;

export function saveStateThrottled(state) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => saveStateNow(state), THROTTLE_MS);
}

export function saveStateNow(state) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error("本機保存失敗", err);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.schemaVersion !== SCHEMA_VERSION) return null;
    return data;
  } catch (err) {
    console.error("讀取本機資料失敗", err);
    return null;
  }
}

export function clearState() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  localStorage.removeItem(KEY);
}

export function hasPersistedState() {
  return localStorage.getItem(KEY) !== null;
}
