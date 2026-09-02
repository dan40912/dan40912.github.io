// 名單解析(PRD §6.2)。純函式,輸入原始文字,輸出可編輯的球員候選清單。

const LEADING_INDEX_RE = /^\s*[(（]?\d{1,3}[)）]?(?:[.、,，]|\s)\s*/;
const TRAILING_LEVEL_RE = /[\s/／\-－、,，]*(\d{1,2})\s*$/;

let seq = 0;
function nextId() {
  seq += 1;
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p_${Date.now()}_${seq}`;
}

function stripLeadingIndex(line) {
  return line.replace(LEADING_INDEX_RE, "");
}

function extractLevel(line, defaultLevel) {
  const match = line.match(TRAILING_LEVEL_RE);
  if (!match) {
    return { name: line.trim(), level: defaultLevel, usedDefaultLevel: true, invalidLevelToken: null };
  }
  const num = parseInt(match[1], 10);
  const nameWithoutLevel = line.slice(0, match.index).trim();
  if (num >= 1 && num <= 15) {
    return { name: nameWithoutLevel, level: num, usedDefaultLevel: false, invalidLevelToken: null };
  }
  // 數字不在 1–15 時不自動套用,標記需確認,名稱保留原字串(含該數字)
  return { name: line.trim(), level: defaultLevel, usedDefaultLevel: true, invalidLevelToken: num };
}

export function parseRoster(text, defaultLevel = 6) {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const entries = lines.map((raw) => {
    const stripped = stripLeadingIndex(raw);
    const { name, level, usedDefaultLevel, invalidLevelToken } = extractLevel(stripped, defaultLevel);
    const error = name.length === 0;
    return {
      id: nextId(),
      raw,
      name,
      level,
      usedDefaultLevel,
      invalidLevelToken,
      needsConfirm: invalidLevelToken !== null || error,
      duplicate: false,
      error,
    };
  });

  const nameCounts = new Map();
  for (const e of entries) {
    if (e.error) continue;
    nameCounts.set(e.name, (nameCounts.get(e.name) || 0) + 1);
  }
  for (const e of entries) {
    if (!e.error && nameCounts.get(e.name) > 1) {
      e.duplicate = true;
    }
  }

  const counts = {
    total: entries.length,
    success: entries.filter((e) => !e.usedDefaultLevel && !e.needsConfirm && !e.duplicate && !e.error).length,
    defaultLevel: entries.filter((e) => e.usedDefaultLevel && !e.error).length,
    needsConfirm: entries.filter((e) => e.needsConfirm).length,
    duplicate: entries.filter((e) => e.duplicate).length,
    error: entries.filter((e) => e.error).length,
  };

  return { entries, counts };
}
