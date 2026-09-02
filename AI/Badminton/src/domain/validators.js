// 唯一性與資料完整性檢查(PRD §6.3、§6.11)。

export const SCHEMA_VERSION = 1;

// 每位球員只能出現在一個位置:場上、候場、等候、暫停或未到。
export function findDuplicatePlacements(state) {
  const seen = new Map(); // playerId -> [locations]
  const record = (id, location) => {
    if (!id) return;
    if (!seen.has(id)) seen.set(id, []);
    seen.get(id).push(location);
  };

  for (const court of state.courts) {
    court.playingSlots.forEach((id, i) => record(id, `court:${court.id}:playing:${i}`));
    court.onDeckSlots.forEach((id, i) => record(id, `court:${court.id}:onDeck:${i}`));
  }
  state.queue.forEach((id) => record(id, "queue"));
  state.paused.forEach((id) => record(id, "paused"));
  state.notArrived.forEach((id) => record(id, "notArrived"));

  const duplicates = [];
  for (const [id, locations] of seen.entries()) {
    if (locations.length > 1) {
      duplicates.push({ playerId: id, locations });
    }
  }
  return duplicates;
}

export function isStateConsistent(state) {
  return findDuplicatePlacements(state).length === 0;
}

// 匯入前驗證 schema 與必要欄位;錯誤檔案不可覆蓋現有資料(PRD §6.11)。
export function validateImportedState(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["檔案格式錯誤"] };
  }
  if (typeof data.schemaVersion !== "number") errors.push("缺少 schemaVersion");
  if (!Array.isArray(data.players)) errors.push("缺少 players 陣列");
  if (!Array.isArray(data.courts)) errors.push("缺少 courts 陣列");
  if (!Array.isArray(data.queue)) errors.push("缺少 queue 陣列");
  if (!Array.isArray(data.paused)) errors.push("缺少 paused 陣列");
  if (!Array.isArray(data.notArrived)) errors.push("缺少 notArrived 陣列");
  if (!Array.isArray(data.matches)) errors.push("缺少 matches 陣列");

  if (errors.length === 0) {
    for (const c of data.courts) {
      if (!Array.isArray(c.playingSlots) || c.playingSlots.length !== 4) errors.push(`場地 ${c.id} playingSlots 格式錯誤`);
      if (!Array.isArray(c.onDeckSlots) || c.onDeckSlots.length !== 4) errors.push(`場地 ${c.id} onDeckSlots 格式錯誤`);
    }
    for (const p of data.players) {
      if (!p.id) errors.push("球員缺少 id");
    }
  }

  return { valid: errors.length === 0, errors };
}
