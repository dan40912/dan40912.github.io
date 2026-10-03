// Ability radar, signature skills and momentum. Pure data and maths, no DOM.
//
// Stats express a player's *shape*: the model reads each stat relative to the
// player's own average, so strengths come with matching weaknesses and level
// stays the single measure of overall strength.
export const STATS = [
  { key: "power", label: "力量", note: "殺球、平抽的球速與得分率" },
  { key: "speed", label: "速度", note: "回位範圍，被調動時能否接到" },
  { key: "net", label: "網前", note: "放網、撲球、擋網的成功率" },
  { key: "defense", label: "防守", note: "接殺球與救球美技" },
  { key: "control", label: "穩定", note: "失誤率與長回合體力" },
];
export const STAT_MIN = 1,
  STAT_MAX = 10;
// Points to distribute grow with level: 17 at level 1, 27 at 6, 50 at 18.
export const budgetFor = (level) => Math.min(50, 15 + level * 2);
const WEIGHTS = {
  allround: { power: 1, speed: 1, net: 1, defense: 1, control: 1 },
  attack: { power: 1.6, speed: 1.1, net: 0.8, defense: 0.75, control: 0.85 },
  net: { power: 0.8, speed: 1, net: 1.65, defense: 0.8, control: 1.1 },
  drive: { power: 1.2, speed: 1.35, net: 1, defense: 0.8, control: 0.85 },
  defense: { power: 0.75, speed: 1.2, net: 0.8, defense: 1.65, control: 1.1 },
};
const keys = STATS.map((s) => s.key);
const clampStat = (v) => Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(v)));
export const statTotal = (stats) => keys.reduce((n, k) => n + stats[k], 0);
// Spread a level's budget along a style's shape, landing exactly on budget.
export function presetStats(style = "allround", level = 6) {
  const w = WEIGHTS[style] || WEIGHTS.allround,
    budget = budgetFor(level),
    sum = keys.reduce((n, k) => n + w[k], 0),
    stats = Object.fromEntries(keys.map((k) => [k, clampStat((budget * w[k]) / sum)]));
  let diff = budget - statTotal(stats);
  // Hand rounding leftovers to the style's strongest (or weakest) stats first.
  const order = [...keys].sort((a, b) => w[b] - w[a]);
  for (let guard = 0; diff !== 0 && guard < 60; guard++) {
    const k = diff > 0 ? order[guard % 5] : order[4 - (guard % 5)],
      next = stats[k] + Math.sign(diff);
    if (next >= STAT_MIN && next <= STAT_MAX) {
      stats[k] = next;
      diff -= Math.sign(diff);
    }
  }
  return stats;
}
// Accept saved or shared stats; repair anything missing, out of range or over budget.
export function normalizeStats(stats, level, style) {
  if (!stats || keys.some((k) => !Number.isFinite(stats[k])))
    return presetStats(style, level);
  const out = Object.fromEntries(keys.map((k) => [k, clampStat(stats[k])])),
    budget = budgetFor(level);
  // Over budget (e.g. the level was lowered): trim the highest stats first.
  for (let guard = 0; statTotal(out) > budget && guard < 100; guard++) {
    const k = keys.reduce((a, b) => (out[b] > out[a] ? b : a));
    if (out[k] <= STAT_MIN) break;
    out[k]--;
  }
  return out;
}
// How far a stat sits above (+) or below (−) the player's own average, roughly −1…1.
// Rackets reshape the radar. Strengths and weaknesses are read from published
// specs (balance point, shaft stiffness and diameter); every racket's modifiers
// sum to roughly zero, so a racket changes a player's shape, not their level.
// Colours follow each racket's best-known colourway: [frame, accent].
export const RACKETS = {
  standard: {
    name: "標準練習拍",
    brand: "",
    type: "均衡入門",
    good: "沒有明顯短板",
    bad: "也沒有特別突出的地方",
    colors: ["#6f8174", "#d9dccf"],
    mods: {},
  },
  zf2: {
    name: "Voltric Z-Force II",
    brand: "Yonex",
    type: "頭重・超硬・極細中管",
    good: "後場重殺、下壓角度",
    bad: "揮拍偏慢，被壓制時防守吃力",
    colors: ["#1d1d1f", "#c8262c"],
    mods: { power: 3, speed: -1, defense: -2 },
  },
  ax100zz: {
    name: "Astrox 100ZZ",
    brand: "Yonex",
    type: "頭重・超硬・6.2 mm 中管",
    good: "連續重殺、出球穩定",
    bad: "需要足夠力量，防守轉換慢",
    colors: ["#1f2f55", "#d23b3b"],
    mods: { power: 2, control: 1, speed: -1, defense: -2 },
  },
  ryuga: {
    name: "Thruster Ryuga",
    brand: "VICTOR",
    type: "頭重・硬・單打重攻",
    good: "爆發式殺球、後場壓制",
    bad: "網前細膩度與防守反應",
    colors: ["#d7362b", "#1b1b1b"],
    mods: { power: 2, speed: -1, net: -1 },
  },
  ars90k: {
    name: "Auraspeed 90K Metallic",
    brand: "VICTOR",
    type: "速度型攻擊・硬中管",
    good: "揮拍速度、連續快攻",
    bad: "長時間相持時控球不穩",
    colors: ["#e88fb0", "#3fb58a"],
    mods: { speed: 2, power: 1, control: -1, defense: -2 },
  },
  tkf: {
    name: "Thruster F 隼",
    brand: "VICTOR",
    type: "中平頭・6.4 mm 極細中管",
    good: "手感細膩、假動作與控球",
    bad: "純力量的重殺較吃虧",
    colors: ["#1b1b1b", "#c9a227"],
    mods: { control: 2, net: 1, power: -2, speed: -1 },
  },
  ax99pro: {
    name: "Astrox 99 Pro",
    brand: "Yonex",
    type: "頭重・硬・加長拍身",
    good: "單打重殺、陡峭下壓",
    bad: "揮拍沉，快速平抽與防守較慢",
    colors: ["#f2f0ea", "#b8323b"],
    mods: { power: 3, speed: -1, control: -1, defense: -1 },
  },
  ax77pro: {
    name: "Astrox 77 Pro",
    brand: "Yonex",
    type: "頭重・中等硬度",
    good: "好上手，攻擊兼顧穩定",
    bad: "極限速度與網前搶攻普通",
    colors: ["#f2731c", "#1f2f55"],
    mods: { control: 2, power: 1, speed: -1, net: -1, defense: -1 },
  },
  ax88dpro: {
    name: "Astrox 88D Pro",
    brand: "Yonex",
    type: "雙打後場・頭重・硬",
    good: "後場連續進攻、穩定出球",
    bad: "網前反應與小球手感",
    colors: ["#222428", "#b8bcc2"],
    mods: { power: 2, control: 1, speed: -1, net: -2 },
  },
  bs12: {
    name: "Brave Sword 12",
    brand: "VICTOR",
    type: "均衡・中偏硬・破風框",
    good: "揮拍快、平抽與防守轉換",
    bad: "重殺力量不足",
    colors: ["#1e4fa8", "#eef2f7"],
    mods: { speed: 2, defense: 1, power: -2, control: -1 },
  },
  zspeed: {
    name: "Nanoray Z-Speed",
    brand: "Yonex",
    type: "均衡・硬・速度型",
    good: "出球極快、搶攻與平抽",
    bad: "容錯低，防守與控球要求高",
    colors: ["#f2d21b", "#1b1b1b"],
    mods: { speed: 2, power: 1, net: 1, control: -2, defense: -2 },
  },
};
export const racketOf = (p) => RACKETS[p?.racket] || RACKETS.standard;
// Base stats plus racket modifiers. May exceed 10: that overflow is the racket.
export function effectiveStats(p) {
  const s = p?.stats;
  if (!s) return null;
  const mods = racketOf(p).mods;
  return Object.fromEntries(
    keys.map((k) => [k, Math.max(STAT_MIN, Math.min(STAT_MAX + 3, s[k] + (mods[k] || 0)))]),
  );
}
export function edge(profile, key) {
  const s = effectiveStats(profile);
  if (!s) return 0;
  const mean = statTotal(s) / 5;
  return Math.max(-1.25, Math.min(1.25, (s[key] - mean) / 4));
}

// Signature skills. "active" skills are chosen for a shot; "passive" ones fire
// on their own when the moment comes.
export const SKILLS = {
  thunder: {
    name: "雷霆重殺",
    icon: "ϟ",
    style: "attack",
    type: "active",
    shots: ["jumpSmash"],
    force: "jumpSmash",
    note: "下一拍騰空跳殺：球速提升，直接得分率大增。",
    bonus: { win: 0.2, error: -0.03, pace: 1.18 },
  },
  magic: {
    name: "網前魔術",
    icon: "✦",
    style: "net",
    type: "active",
    shots: ["net", "cross", "kill", "block", "cut", "drop"],
    note: "網前假動作：對手判斷錯誤，得分率大增。",
    bonus: { win: 0.11, error: -0.02, pace: 1 },
  },
  storm: {
    name: "平抽風暴",
    icon: "≫",
    style: "drive",
    type: "active",
    shots: ["drive", "push"],
    note: "平抽平推又快又準，壓得對手抬不起拍。",
    bonus: { win: 0.13, error: -0.04, pace: 1.12 },
  },
  hawk: {
    name: "鷹眼",
    icon: "◎",
    style: "allround",
    type: "active",
    shots: null,
    note: "看穿空檔：這一拍失誤減半，得分率提升。",
    bonus: { win: 0.09, error: 0, errorScale: 0.5, pace: 1 },
  },
  wall: {
    name: "鐵壁",
    icon: "⛨",
    style: "defense",
    type: "passive",
    shots: null,
    note: "氣勢滿時，對手下一記必殺球必定被救起。",
    bonus: { win: 0, error: 0, pace: 1 },
  },
};
export const skillFor = (style) =>
  Object.keys(SKILLS).find((k) => SKILLS[k].style === style) || "hawk";
export const skillName = (p) =>
  (p?.skillName && p.skillName.trim()) || SKILLS[p?.skill]?.name || "";
// Whether a skill can power this particular shot.
export const skillFits = (key, shot) => {
  const sk = SKILLS[key];
  return !!sk && sk.type === "active" && (!sk.shots || sk.shots.includes(shot));
};

// Momentum: each player builds a 0–100 meter; a full meter unlocks the skill.
export const METER_FULL = 100;
export const meterOf = (s, i) => (s.meter ? s.meter[i] : 0);
export function gainMomentum(s, event) {
  const m = (s.meter ||= [0, 0, 0, 0]);
  const add = (i, v) => (m[i] = Math.min(METER_FULL, m[i] + v));
  add(event.actor, 1.5);
  if (event.outcome === "winner") add(event.actor, 12);
  if (event.outcome === "save") add(event.receiver, 15);
  // Long rallies charge everyone: the crowd feels it too.
  if (s.total >= 8) [0, 1, 2, 3].forEach((i) => add(i, 1.5));
  if (event.skill) m[event.skillUser ?? event.actor] = 0;
}
