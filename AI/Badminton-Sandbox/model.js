import {
  presetStats,
  skillFor,
  edge,
  SKILLS,
  skillFits,
  METER_FULL,
  gainMomentum,
} from "./abilities.js";
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const team = (i) => (i < 2 ? 0 : 1);
export const sign = (i) => (i < 2 ? 1 : -1);
export const mate = (i) => i ^ 1;
export const SHOTS = {
  short: {
    label: "短發球",
    icon: "⌒",
    note: "把球送到短發球線附近，限制接發者直接下壓。",
  },
  flick: {
    label: "偷後場",
    icon: "↗",
    note: "突然加長發球，調動靠前的接發者；落點仍須在雙打後發球線內。",
  },
  high: {
    label: "高遠發球",
    icon: "⤴",
    note: "用高度爭取準備時間，但對方可能在後場主動進攻。",
  },
  lift: {
    label: "挑球／高遠",
    icon: "⤴",
    note: "把對手推回後場，爭取時間恢復左右防守。",
  },
  smash: {
    label: "殺球",
    icon: "↘",
    note: "由高點快速下壓，隊友靠前準備封網。",
  },
  drop: {
    label: "吊球",
    icon: "⌒",
    note: "從後場送往網前，以深淺變化調動防守。",
  },
  net: {
    label: "放網",
    icon: "∿",
    note: "把落點壓在網前，迫使對方挑球或上網。",
  },
  drive: {
    label: "平抽",
    icon: "→",
    note: "用中低弧線壓縮反應時間，爭取中場主動權。",
  },
  push: {
    label: "平推",
    icon: "↗",
    note: "找中場空檔與兩人之間的縫隙，延續主動權。",
  },
  block: {
    label: "擋網",
    icon: "⌁",
    note: "卸掉來球速度，送回網前，再準備下一拍。",
  },
  cut: {
    label: "切吊",
    icon: "⌄",
    note: "切削後場球，又快又短地落在前場，逼對手急停上網。",
  },
  cross: {
    label: "勾對角",
    icon: "⤧",
    note: "網前手腕一勾，球落到對角網前，調動對手橫向移動。",
  },
  stick: {
    label: "點殺",
    icon: "↓",
    note: "角度陡、落點近的殺球，力量稍輕但更準、更難回。",
  },
  slice: {
    label: "劈殺",
    icon: "↙",
    note: "切劈拍面打出斜線殺球，速度稍慢但方向難判斷。",
  },
  jumpSmash: {
    label: "跳殺",
    icon: "⇘",
    note: "騰空起跳全力下壓，最快也最冒險的一拍。",
  },
  kill: {
    label: "撲球",
    icon: "⤓",
    note: "網前高點直接下撲，只在對方回球過高時出手。",
  },
};
// Smash family: steep power shots that share the smash sound and impact effects.
export const SMASHES = ["smash", "jumpSmash", "stick", "slice"];
export const POWER_SHOTS = [...SMASHES, "kill"];
export const PERSONALITIES = {
  balanced: "沉著均衡",
  bold: "積極冒險",
  patient: "耐心穩健",
};
export const STYLES = {
  allround: "全面均衡",
  attack: "後場進攻",
  net: "網前控制",
  defense: "防守反擊",
  drive: "平抽快壓",
};
// 1–18 級，分階參考台灣羽球推廣協會羽球程度分級制度（2021-04-19 版），說明為摘要改寫。
export const MAX_LEVEL = 18;
export const TIERS = [
  { name: "新手階", levels: [1, 3], note: "球齡一年內" },
  { name: "初階", levels: [4, 5], note: "球齡 1–3 年" },
  { name: "初中階", levels: [6, 7], note: "球齡 3–5 年" },
  { name: "中階", levels: [8, 9], note: "球齡 5–10 年" },
  { name: "中進階", levels: [10, 12], note: "球齡 10 年以上" },
  { name: "高階", levels: [13, 15], note: "校隊前段、體保、社會甲組" },
  { name: "職業級", levels: [16, 18], note: "甲組、國家代表選手" },
];
export const LEVEL_NOTES = {
  1: "剛接觸羽球，正在熟悉比賽規則與禮儀。",
  2: "中場高球能來回約 10 拍，發球約一半成功。",
  3: "定點能打到後場三分之二處，發球大多成功。",
  4: "握拍正確，長球定點可到中後場，會基本平推。",
  5: "懂基本腳步，非受迫時球路已有一定水準。",
  6: "懂基本輪轉但未熟練，開始會殺球與切球。",
  7: "殺、切、長球不論定點或移動，成功率約七成。",
  8: "有基本戰術與打點，熟悉輪轉，切殺長吊穩定。",
  9: "多種球路高準確度，發力有強度，防守有變化。",
  10: "輪轉熟悉且能活用，戰術與打點能有效得分。",
  11: "切殺長吊兼具速度與準確，能輕鬆反拍回球。",
  12: "高速移位、步法靈活，殺切吊都極具侵略性。",
  13: "各種球路穩定熟練，防守無死角，戰術組織完整。",
  14: "球速快、質量高，爆發力與戰略組織都屬上等。",
  15: "攻守全面且穩定，已是頂尖業餘水準。",
  16: "球路、戰術、步法爐火純青。",
  17: "具國家隊等級的速度、穩定與壓迫感。",
  18: "發展出個人獨特球路風格的頂尖選手。",
};
export const tierOf = (level) =>
  TIERS.find((t) => level >= t.levels[0] && level <= t.levels[1]) || TIERS[0];
export const validLevel = (v) =>
  Number.isInteger(v) && v >= 1 && v <= MAX_LEVEL;
// Base unforced-error rate per shot: ~32% for a beginner, ~2% for a pro.
export const baseError = (level) => 0.32 * Math.exp(-0.163 * (level - 1));
// Shuttle speed scale: a level-1 player hits at ~35% of a pro's pace.
export const paceOf = (level) => 0.35 + (0.65 * (level - 1)) / 17;
// Character pool: identity (name, gender, look) plus a suggested play profile.
export const ROSTER = [
  { id: "ze", name: "Jay", gender: "男", level: 6, racket: "zf2", personality: "bold", style: "attack", face: "angular", hair: "crop", skin: "warm", accessory: "none" },
  { id: "yu", name: "Curt", gender: "男", level: 6, racket: "ax77pro", personality: "patient", style: "net", face: "round", hair: "crop", skin: "light", accessory: "glasses" },
  { id: "kai", name: "Leo", gender: "男", level: 6, racket: "zspeed", personality: "balanced", style: "drive", face: "oval", hair: "sweep", skin: "deep", accessory: "band" },
  { id: "xiang", name: "KK", gender: "男", level: 6, racket: "ax88dpro", personality: "patient", style: "defense", face: "angular", hair: "sweep", skin: "light", accessory: "none" },
  { id: "qing", name: "Rena", gender: "女", level: 6, racket: "tkf", personality: "patient", style: "net", face: "round", hair: "bob", skin: "light", accessory: "none" },
  { id: "you", name: "Mia", gender: "女", level: 6, racket: "bs12", personality: "patient", style: "defense", face: "oval", hair: "pony", skin: "warm", accessory: "glasses" },
  { id: "han", name: "Ivy", gender: "女", level: 6, racket: "ax99pro", personality: "bold", style: "attack", face: "angular", hair: "pony", skin: "light", accessory: "band" },
  { id: "qian", name: "Nora", gender: "女", level: 6, racket: "ars90k", personality: "balanced", style: "drive", face: "round", hair: "bob", skin: "deep", accessory: "none" },
];
// Slot order is blue 1, blue 2, coral 1, coral 2; mixed pairs a man and a woman.
export function slotGender(mode, i) {
  return mode === "mixed" ? (i % 2 ? "女" : "男") : mode === "women" ? "女" : "男";
}
export const genderOf = (p) =>
  p.gender || (["bob", "pony"].includes(p.hair) ? "女" : "男");
export function defaults(mode = "men") {
  const pick = { 男: ["ze", "yu", "kai", "xiang"], 女: ["qing", "you", "han", "qian"] },
    used = { 男: 0, 女: 0 };
  return [0, 1, 2, 3].map((i) => {
    const g = slotGender(mode, i),
      id = mode === "mixed" ? pick[g][[0, 0, 2, 2][i]] : pick[g][used[g]++];
    const { id: _id, ...profile } = ROSTER.find((c) => c.id === id);
    return {
      ...profile,
      stats: presetStats(profile.style, profile.level),
      skill: skillFor(profile.style),
    };
  });
}
export function seeded(seed = 20261003) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
export function createMatch(config = { points: 21, bestOf: 1 }) {
  return setupServe({
    phase: "serve",
    score: [0, 0],
    wins: [0, 0],
    slots: [
      [0, 1],
      [2, 3],
    ],
    game: 1,
    gameEnded: false,
    finished: false,
    server: 0,
    receiver: 2,
    side: "right",
    turn: 0,
    total: 0,
    positions: [],
    origin: { x: 0, z: 0 },
    nextActor: 0,
    meter: [0, 0, 0, 0],
    pressure: null,
    config: clone(config),
  });
}
export function setupServe(
  input,
  server = input.server,
  receiver = input.receiver,
) {
  const s = clone(input),
    t = team(server),
    side = s.score[t] % 2 ? "left" : "right",
    x = sign(server) * (side === "right" ? 1 : -1),
    z = sign(server);
  s.server = server;
  s.receiver = receiver;
  s.side = side;
  s.turn = t;
  s.phase = "serve";
  s.total = 0;
  s.pressure = null;
  s.nextActor = server;
  s.positions[server] = { x: x * 0.75, z: z * 2.45 };
  s.positions[mate(server)] = { x: -x * 0.6, z: z * 4.4 };
  s.positions[receiver] = { x: -x * 0.8, z: -z * 2.65 };
  s.positions[mate(receiver)] = { x: x * 0.6, z: -z * 4.25 };
  s.origin = clone(s.positions[server]);
  const slot = s.score[t] % 2;
  if (s.slots[t][slot] !== server) s.slots[t].reverse();
  if (s.slots[1 - t][slot] !== receiver) s.slots[1 - t].reverse();
  return s;
}
export function serveRegion(s) {
  const x = sign(s.server) * (s.side === "right" ? -1 : 1),
    z = sign(s.server);
  return {
    x0: x < 0 ? -3.05 : 0,
    x1: x < 0 ? 0 : 3.05,
    z0: z > 0 ? -5.94 : 1.98,
    z1: z > 0 ? -1.98 : 5.94,
  };
}
export function legalTarget(s, p) {
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z)) return false;
  if (s.phase === "serve") {
    const r = serveRegion(s);
    return p.x >= r.x0 && p.x <= r.x1 && p.z >= r.z0 && p.z <= r.z1;
  }
  return (
    Math.abs(p.x) <= 3.05 &&
    Math.abs(p.z) <= 6.7 &&
    p.z * (s.turn === 0 ? 1 : -1) < 0
  );
}
export function validStanding(s) {
  const z = sign(s.server),
    x = z * (s.side === "right" ? 1 : -1),
    a = s.positions[s.server],
    b = s.positions[s.receiver];
  return (
    a.x * x > 0 &&
    Math.abs(a.x) < 3.05 &&
    a.z * z > 1.98 &&
    a.z * z < 5.94 &&
    b.x * x < 0 &&
    Math.abs(b.x) < 3.05 &&
    b.z * z < -1.98 &&
    b.z * z > -5.94
  );
}
export function actors(s) {
  if (s.phase === "ended") return [];
  if (s.phase === "serve") return [s.server];
  if (s.total === 1) return [s.receiver];
  return s.turn === 0 ? [0, 1] : [2, 3];
}
export function shotKeys(s) {
  return s.phase === "serve"
    ? ["short", "flick", "high"]
    : [
        "lift",
        "drop",
        "cut",
        "net",
        "cross",
        "block",
        "drive",
        "push",
        "smash",
        "stick",
        "slice",
        "jumpSmash",
        "kill",
      ];
}
export function targetPresets(s, shot) {
  if (s.phase === "serve") {
    const r = serveRegion(s),
      x = r.x1 === 0 ? -1 : 1,
      z = -sign(s.server);
    return [
      ["短內", x * 0.2, z * 2.15],
      ["短中", x * 1.4, z * 2.15],
      ["短外", x * 2.75, z * 2.15],
      ["長內", x * 0.2, z * 5.6],
      ["長中", x * 1.4, z * 5.6],
      ["長外", x * 2.75, z * 5.6],
    ].map(([label, x, z]) => ({ label, x, z }));
  }
  const z = s.turn === 0 ? -1 : 1;
  return [
    ["後左", -2.45, z * 6.05],
    ["後中", 0, z * 6.05],
    ["後右", 2.45, z * 6.05],
    ["中左", -2.3, z * 3.3],
    ["中間", 0, z * 3.3],
    ["中右", 2.3, z * 3.3],
    ["網左", -2.2, z * 0.7],
    ["網中", 0, z * 0.7],
    ["網右", 2.2, z * 0.7],
  ].map(([label, x, z]) => ({ label, x, z }));
}
export function awardPoint(input, winner, reason = "手動指定得分") {
  const s = clone(input);
  if (s.phase === "ended" || s.finished) throw Error("回合已結束");
  s.score[winner]++;
  if (winner === team(s.server)) s.slots[winner].reverse();
  s.phase = "ended";
  s.winner = winner;
  s.reason = reason;
  const goal = s.config.points,
    cap = goal === 21 ? 30 : 15;
  if (
    s.score[winner] >= goal &&
    (s.score[winner] - s.score[1 - winner] >= 2 || s.score[winner] >= cap)
  ) {
    s.wins[winner]++;
    s.gameEnded = true;
    s.finished = s.wins[winner] >= Math.ceil(s.config.bestOf / 2);
  }
  return s;
}
export function nextRally(input) {
  if (input.phase !== "ended" || input.finished) return clone(input);
  let s = clone(input);
  if (s.gameEnded) {
    s.game++;
    s.score = [0, 0];
    s.gameEnded = false;
  }
  const slot = s.score[s.winner] % 2,
    server = s.slots[s.winner][slot],
    receiver = s.slots[1 - s.winner][slot];
  return setupServe(s, server, receiver);
}
function weighted(items, random) {
  let total = items.reduce((n, [, w]) => n + w, 0),
    r = random() * total;
  for (const [key, w] of items) {
    r -= w;
    if (r <= 0 && w > 0) return key;
  }
  return items.filter(([, w]) => w > 0).at(-1)[0];
}
export function choosePlan(s, profiles, random) {
  const actor = s.nextActor,
    p = profiles[actor];
  let shot,
    skill = false;
  if (s.phase === "serve")
    shot = weighted(
      [
        ["short", p.personality === "patient" ? 9 : 6],
        ["flick", p.personality === "bold" ? 4 : 1],
        ["high", 1],
      ],
      random,
    );
  else if (s.pressure === actor)
    // Just survived a would-be winner: only a scrambling lift or block is on.
    shot = weighted(
      [
        ["lift", 3],
        ["block", 2],
      ],
      random,
    );
  else {
    const depth = Math.abs(s.origin.z),
      back = depth > 3,
      front = depth < 2.2,
      w = {
        lift: 2,
        smash: back ? 3.2 : 0,
        stick: back ? 1.4 : 0,
        slice: back ? 1 : 0,
        jumpSmash: depth > 3.5 ? 0.9 : 0,
        drop: back ? 2 : 0,
        cut: back ? 1.3 : 0,
        net: front ? 3.2 : 0,
        cross: front ? 1.4 : 0,
        kill: front ? 1.1 : 0,
        drive: depth < 4 ? 3 : 1,
        push: 2,
        block: depth < 4 ? 2 : 1,
      };
    const favorites = {
      attack: ["smash", "jumpSmash", "stick"],
      net: ["net", "cross", "kill"],
      defense: ["lift", "block"],
      drive: ["drive", "push"],
    }[p.style];
    favorites?.forEach((k) => w[k] && (w[k] *= 2.4));
    if (p.personality === "bold") SMASHES.forEach((k) => (w[k] *= 1.7));
    if (p.personality === "patient") w.lift *= 1.8;
    shot = weighted(Object.entries(w), random);
    // A full meter: decide whether to unleash the signature skill now.
    const sk = SKILLS[p.skill];
    if (sk?.type === "active" && (s.meter?.[actor] ?? 0) >= METER_FULL) {
      const eager =
        { bold: 0.85, balanced: 0.6, patient: 0.4 }[p.personality] ?? 0.6;
      const candidates = (sk.shots || [shot]).filter(
        (k) => w[k] > 0 || k === sk.force,
      );
      if (candidates.length && random() < eager && (!sk.force || depth > 3)) {
        shot =
          sk.force || weighted(candidates.map((k) => [k, w[k] || 1]), random);
        skill = true;
      }
    }
  }
  let target;
  if (s.phase === "serve") {
    const r = serveRegion(s);
    target = {
      x: (r.x0 + r.x1) / 2 + (random() - 0.5) * 1.8,
      z: -sign(actor) * (shot === "short" ? 2.13 : 5.65),
    };
  } else {
    const deep = shot === "lift",
      shortShot = ["drop", "net", "block", "cut", "cross"].includes(shot),
      x =
        shot === "cross"
          ? (s.origin.x >= 0 ? -1 : 1) * (1.6 + random() * 0.9)
          : (random() - 0.5) * 5.3;
    target = {
      x,
      z:
        -sign(actor) *
        (deep ? 6.05 : shortShot ? 0.7 : shot === "stick" ? 2.6 : 3.3),
    };
  }
  return { actor, shot, target, skill };
}
const ATTACKING = [...POWER_SHOTS, "drive", "push"],
  NET_SHOTS = ["net", "block", "short", "cut", "cross", "kill", "drop"],
  STYLE_SHOTS = {
    attack: [...SMASHES, "drop", "cut"],
    net: ["net", "block", "cross", "kill"],
    drive: ["drive", "push"],
    defense: ["lift", "block"],
  },
  // Extra risk and reward of each special shot on top of the base formula.
  SHOT_MOD = {
    smash: { error: 0.025, win: 0.05 },
    jumpSmash: { error: 0.055, win: 0.11 },
    stick: { error: 0.012, win: 0.07 },
    slice: { error: 0.03, win: 0.06, deceive: 0.2 },
    kill: { error: 0.03, win: 0.12 },
    cut: { error: 0.02, win: 0.025, deceive: 0.12 },
    cross: { error: 0.025, win: 0.02, deceive: 0.25 },
  };
// Risk and reward move together: a bold player misses more but finishes more;
// a patient player keeps the rally alive but rarely ends it outright.
// Stats tilt the odds toward a player's strengths (see abilities.js).
function oddsFor(s, actor, shot, p, d, distance, skill = null) {
  const control = edge(p, "control"),
    fatigue = Math.max(0, s.total - 18) * 0.004 * (1 - control * 0.5),
    attacking = ATTACKING.includes(shot),
    signature = STYLE_SHOTS[p.style]?.includes(shot),
    mod = SHOT_MOD[shot] || { error: 0, win: 0 },
    // A stronger opponent forces more errors; an easy one lets the hitter relax.
    pressure = clamp(0.55 + d.level / 26, 0.55, 1.25),
    scrambling = s.pressure === actor,
    bonus = skill ? SKILLS[skill].bonus : null;
  let error =
    baseError(p.level) * pressure * (1 - control * 0.25) +
    (p.personality === "bold"
      ? 0.03
      : p.personality === "patient"
        ? -0.025
        : 0) +
    mod.error * (1 - p.level / 24) -
    (signature ? 0.012 : 0) -
    (NET_SHOTS.includes(shot) ? edge(p, "net") * 0.008 : 0) +
    (scrambling ? 0.06 : 0) +
    fatigue;
  // Higher-level and faster receivers cover ground better.
  const reach =
    clamp(1.35 - d.level / 24, 0.6, 1.3) *
    (1 - edge(d, "speed") * 0.18) *
    (1 + (mod.deceive || 0));
  let win =
    0.02 +
    (p.level - d.level) * 0.011 +
    distance * 0.016 * reach +
    mod.win +
    (POWER_SHOTS.includes(shot) || ["drive", "push"].includes(shot)
      ? edge(p, "power") * 0.035
      : 0) +
    (NET_SHOTS.includes(shot) && shot !== "short" ? edge(p, "net") * 0.022 : 0) -
    (attacking ? edge(d, "defense") * 0.015 : 0) +
    (p.personality === "bold" && attacking ? 0.045 : 0) -
    (p.personality === "patient" ? 0.02 : 0) +
    (signature ? 0.022 : 0) +
    (p.style === "allround" ? 0.008 : 0);
  if (scrambling) win *= 0.4;
  if (bonus) {
    error = error * (bonus.errorScale ?? 1) + bonus.error;
    win += bonus.win;
  }
  return { error: clamp(error, 0.008, 0.6), win: clamp(win, 0.003, 0.6) };
}
// Chance the receiver scrambles back a shot that would otherwise win the point.
function saveChance(p, d, shot) {
  return clamp(
    (0.05 +
      edge(d, "defense") * 0.05 +
      edge(d, "speed") * 0.03 +
      (d.level - p.level) * 0.008) *
      (SMASHES.includes(shot) ? 0.8 : 1),
    0.01,
    0.25,
  );
}
export function receiverFor(s, actor, target) {
  if (s.phase === "serve") return s.receiver;
  const opponents = team(actor) === 0 ? [2, 3] : [0, 1],
    far = (i) =>
      Math.hypot(s.positions[i].x - target.x, s.positions[i].z - target.z);
  return far(opponents[0]) <= far(opponents[1]) ? opponents[0] : opponents[1];
}
// Pre-shot odds for the UI, from the same formula the simulation samples.
export function shotOdds(s, { actor, shot, target, skill = false }, profiles) {
  const receiver = receiverFor(s, actor, target),
    distance = Math.hypot(
      s.positions[receiver].x - target.x,
      s.positions[receiver].z - target.z,
    ),
    { error, win } = oddsFor(
      s,
      actor,
      shot,
      profiles[actor],
      profiles[receiver],
      distance,
      skill && skillFits(profiles[actor].skill, shot)
        ? profiles[actor].skill
        : null,
    );
  return { error, win, receiver, distance };
}
// Flight time in milliseconds: a smash crosses the court far faster than a clear.
export const FLIGHT_MS = {
  jumpSmash: 300,
  smash: 340,
  stick: 360,
  kill: 330,
  slice: 420,
  cut: 820,
  cross: 1050,
  drive: 700,
  push: 760,
  block: 900,
  net: 1000,
  short: 1000,
  drop: 1050,
  flick: 1250,
  lift: 1450,
  high: 1550,
};
// Top-level (level 18) initial shuttle speed in km/h for each shot.
export const PRO_KMH = {
  jumpSmash: 380,
  smash: 340,
  stick: 290,
  slice: 260,
  kill: 200,
  cut: 150,
  cross: 40,
  drive: 210,
  push: 170,
  lift: 230,
  high: 200,
  flick: 190,
  drop: 120,
  block: 70,
  net: 45,
  short: 55,
};
// Power stat adds or takes up to ~10% of pace; a skill can add more.
export const shotSpeed = (shot, level, profile = null, skill = null) =>
  Math.round(
    (PRO_KMH[shot] ?? 100) *
      paceOf(level) *
      (1 + edge(profile, "power") * 0.08) *
      (skill ? (SKILLS[skill]?.bonus.pace ?? 1) : 1),
  );
// Animation flight time: FLIGHT_MS is a level-6 hitter; faster hitters fly shorter.
export const flightMs = (shot, level = 6) =>
  Math.round((FLIGHT_MS[shot] ?? 1000) * (paceOf(6) / paceOf(level)) ** 0.55);
export const soundFor = (shot) =>
  POWER_SHOTS.includes(shot)
    ? "smash"
    : ["lift", "high", "flick"].includes(shot)
      ? "clear"
      : "touch";
export function makeShot(
  input,
  plan,
  profiles,
  { random = Math.random, simulate = false, formation = "auto" } = {},
) {
  const { actor, target } = plan,
    s = clone(input);
  s.meter ||= [0, 0, 0, 0];
  let shot = plan.shot,
    skill = null,
    skillUser = null;
  if (plan.skill) {
    const key = profiles[actor].skill,
      sk = SKILLS[key];
    if (!sk || sk.type !== "active") throw Error("這位球員的絕技會自動發動");
    if (s.meter[actor] < METER_FULL) throw Error("氣勢還沒集滿");
    if (sk.force) shot = sk.force;
    if (!skillFits(key, shot)) throw Error(`${sk.name}只能搭配特定球路`);
    skill = key;
    skillUser = actor;
  }
  if (!actors(s).includes(actor)) throw Error("請選擇這一拍可擊球的球員");
  if (!shotKeys(s).includes(shot)) throw Error("球路不適用於目前回合");
  if (!legalTarget(s, target)) throw Error("請選擇對方有效區域的落點");
  if (s.phase === "serve" && !validStanding(s))
    throw Error("發球者與接發者須站在斜對角發球區內");
  const from = clone(s.phase === "serve" ? s.positions[actor] : s.origin);
  const receiver = receiverFor(s, actor, target);
  const distance = Math.hypot(
      s.positions[receiver].x - target.x,
      s.positions[receiver].z - target.z,
    ),
    p = profiles[actor],
    d = profiles[receiver];
  let outcome = "return",
    actual = clone(target),
    winner = null;
  if (simulate) {
    const { error, win } = oddsFor(s, actor, shot, p, d, distance, skill),
      r = random();
    if (r < error) {
      outcome = random() < 0.45 ? "net" : "out";
      winner = 1 - team(actor);
      if (outcome === "net")
        actual = { x: target.x * 0.45, z: sign(actor) * 0.12 };
      else actual = { x: (target.x < 0 ? -1 : 1) * 3.5, z: target.z };
    } else if (r < error + win) {
      outcome = "winner";
      winner = team(actor);
      // Wall: a full-meter defender always digs out the would-be winner.
      const wall =
        d.skill === "wall" && s.meter[receiver] >= METER_FULL && !skill;
      if (wall || random() < saveChance(p, d, shot)) {
        outcome = "save";
        winner = null;
        if (wall) {
          skill = "wall";
          skillUser = receiver;
        }
      }
    }
  }
  const contact = clone(s.positions);
  contact[actor] = clone(from);
  let after = clone(s);
  after.positions = clone(contact);
  const z = sign(actor),
    partner = mate(actor);
  if (formation === "auto") {
    if (["lift", "flick", "high"].includes(shot)) {
      const left = contact[actor].x <= contact[partner].x;
      after.positions[actor] = { x: left ? -1.45 : 1.45, z: z * 3.8 };
      after.positions[partner] = { x: left ? 1.45 : -1.45, z: z * 3.8 };
    } else if ([...POWER_SHOTS, "drop", "cut"].includes(shot)) {
      after.positions[actor] = { x: clamp(from.x, -2.4, 2.4), z: z * 4.8 };
      after.positions[partner] = { x: target.x * 0.4, z: z * 1.4 };
    } else if (["short", "net", "block", "cross"].includes(shot)) {
      after.positions[actor] = { x: clamp(from.x, -2.3, 2.3), z: z * 1.35 };
      after.positions[partner] = { x: -target.x * 0.3, z: z * 4.4 };
    }
  }
  if (outcome === "return" || outcome === "save")
    after.positions[receiver] = clone(target);
  else if (outcome === "winner") {
    const start = s.positions[receiver];
    after.positions[receiver] = {
      x: start.x + (target.x - start.x) * 0.65,
      z: start.z + (target.z - start.z) * 0.65,
    };
  }
  after.origin = clone(actual);
  after.turn = 1 - team(actor);
  after.phase = "rally";
  after.total++;
  after.nextActor = receiver;
  after.pressure = outcome === "save" ? receiver : null;
  gainMomentum(after, { actor, receiver, outcome, skill, skillUser });
  if (winner !== null)
    after = awardPoint(
      after,
      winner,
      { net: "下網", out: "出界", winner: "接球未及" }[outcome],
    );
  return {
    kind: "shot",
    actor,
    shot,
    target: clone(target),
    actual,
    from,
    receiver,
    outcome,
    winner,
    skill,
    skillUser,
    speed: shotSpeed(shot, p.level, p, skill),
    before: clone(input),
    contact,
    after,
  };
}
export function trajectory(event, t) {
  t = clamp(t, 0, 1);
  const high = ["lift", "flick", "high"].includes(event.shot),
    START = {
      smash: 2.65,
      jumpSmash: 3.05,
      stick: 2.75,
      slice: 2.5,
      kill: 2.0,
      drop: 2.15,
      cut: 2.3,
    },
    start = START[event.shot] ?? 1.1;
  let arc = high
    ? 4.1
    : ["short", "net", "block", "cross"].includes(event.shot)
      ? 1.15
      : event.shot === "kill"
        ? 0.15
        : ["drop", "cut"].includes(event.shot)
          ? 0.65
          : 0.6;
  const crossing = -event.from.z / (event.actual.z - event.from.z);
  // A completed return must visibly clear the net; a failed net shot must not.
  if (event.outcome !== "net" && crossing > 0 && crossing < 1) {
    const base = start * (1 - crossing) + 0.12 * crossing;
    arc = Math.max(arc, (1.68 - base) / Math.sin(Math.PI * crossing));
  }
  let h = start * (1 - t) + 0.12 * t + arc * Math.sin(Math.PI * t);
  if (event.outcome === "net")
    h = 1.1 * (1 - t) + 0.15 * t + 0.35 * Math.sin(Math.PI * t);
  return {
    x: event.from.x + (event.actual.x - event.from.x) * t,
    z: event.from.z + (event.actual.z - event.from.z) * t,
    h,
  };
}

// "GAME POINT" / "MATCH POINT" for the team one rally from taking the game.
export function pointLabel(s) {
  if (!s || s.phase === "ended") return null;
  const goal = s.config.points,
    cap = goal === 21 ? 30 : 15,
    need = Math.ceil(s.config.bestOf / 2);
  for (const t of [0, 1]) {
    const next = s.score[t] + 1,
      wins = next >= cap || (next >= goal && next - s.score[1 - t] >= 2);
    if (wins)
      return {
        team: t,
        label: s.wins[t] + 1 >= need ? "MATCH POINT" : "GAME POINT",
      };
  }
  return null;
}
