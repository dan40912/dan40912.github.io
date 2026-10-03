// Match analysis, highlight picking, matchup testing and shareable player
// cards. Pure functions: no DOM, so they are easy to test.
import {
  SHOTS,
  SMASHES,
  team,
  createMatch,
  nextRally,
  choosePlan,
  makeShot,
  seeded,
  validLevel,
  PERSONALITIES,
  STYLES,
  shotSpeed,
} from "./model.js";
import { presetStats, normalizeStats, skillFor, SKILLS, RACKETS } from "./abilities.js";

const shotsOf = (rally) => rally.filter((e) => e.kind === "shot");
const speedOf = (e, profiles) =>
  e.speed ?? shotSpeed(e.shot, profiles[e.actor]?.level ?? 6, profiles[e.actor]);

// Per-player and per-team breakdown of how points were won and lost.
export function summarize(rallies, profiles) {
  const players = profiles.map((p) => ({
      name: p.name,
      shots: 0,
      winners: 0,
      errors: 0,
      saves: 0,
      skills: 0,
      fastest: 0,
      byShot: {},
    })),
    teams = [0, 1].map(() => ({ points: 0, fromWinners: 0, fromErrors: 0 }));
  for (const rally of rallies)
    for (const e of shotsOf(rally)) {
      const me = players[e.actor];
      me.shots++;
      if (SMASHES.includes(e.shot)) me.fastest = Math.max(me.fastest, speedOf(e, profiles));
      if (e.skill) players[e.skillUser ?? e.actor].skills++;
      if (e.outcome === "save") players[e.receiver].saves++;
      if (e.outcome === "winner") {
        me.winners++;
        me.byShot[e.shot] = (me.byShot[e.shot] || 0) + 1;
        teams[team(e.actor)].points++;
        teams[team(e.actor)].fromWinners++;
      }
      if (e.outcome === "net" || e.outcome === "out") {
        me.errors++;
        teams[1 - team(e.actor)].points++;
        teams[1 - team(e.actor)].fromErrors++;
      }
    }
  return { players, teams };
}
// One sentence on where a player's points come from.
export function insight(player) {
  const total = player.winners;
  if (!player.shots) return "還沒有出手紀錄。";
  if (!total)
    return player.errors
      ? `還沒有直接得分，失誤 ${player.errors} 次，先求穩再找機會。`
      : "穩穩延續回合，還在等待得分機會。";
  const [shot, n] = Object.entries(player.byShot).sort((a, b) => b[1] - a[1])[0],
    share = Math.round((n / total) * 100);
  const errorNote =
    player.errors > total ? `，但失誤 ${player.errors} 次多於得分` : "";
  return `${share}% 的直接得分來自${SHOTS[shot].label}${errorNote}。`;
}
// Up to three moments worth replaying.
export function highlights(rallies, profiles) {
  const out = [];
  let longest = null,
    fastest = null,
    skillWin = null;
  rallies.forEach((rally, index) => {
    const shots = shotsOf(rally);
    if (!shots.length) return;
    if (!longest || shots.length > longest.n) longest = { index, n: shots.length };
    for (const e of shots) {
      if (SMASHES.includes(e.shot)) {
        const v = speedOf(e, profiles);
        if (!fastest || v > fastest.v) fastest = { index, v, who: e.actor };
      }
      if (e.skill && (e.outcome === "winner" || e.outcome === "save"))
        skillWin = { index, who: e.skillUser ?? e.actor, skill: e.skill };
    }
  });
  if (longest && longest.n >= 3)
    out.push({ index: longest.index, title: "最長回合", detail: `${longest.n} 拍的拉鋸` });
  if (fastest)
    out.push({
      index: fastest.index,
      title: "最快殺球",
      detail: `${profiles[fastest.who].name} ${fastest.v} km/h`,
    });
  if (skillWin)
    out.push({
      index: skillWin.index,
      title: "絕技時刻",
      detail: `${profiles[skillWin.who].name}・${profiles[skillWin.who].skillName || SKILLS[skillWin.skill].name}`,
    });
  return out;
}

// Matchup test: a pair of `profile` against a pair of each style archetype at
// the same level, over many simulated rallies.
export const ARCHETYPES = ["attack", "net", "drive", "defense", "allround"];
export function matchup(profile, { rallies = 400, seed = 11 } = {}) {
  const rnd = seeded(seed);
  return ARCHETYPES.map((style) => {
    const foe = {
        ...profile,
        name: STYLES[style],
        style,
        personality: "balanced",
        stats: presetStats(style, profile.level),
        skill: skillFor(style),
        skillName: "",
        racket: "standard",
      },
      profiles = [profile, profile, foe, foe];
    let s = createMatch({ points: 21, bestOf: 1 }),
      won = 0,
      played = 0;
    for (let guard = 0; played < rallies && guard < rallies * 60; guard++) {
      if (s.phase === "ended") {
        played++;
        if (s.winner === 0) won++;
        s = s.finished || s.gameEnded ? createMatch({ points: 21, bestOf: 1 }) : nextRally(s);
        continue;
      }
      const e = makeShot(s, choosePlan(s, profiles, rnd), profiles, {
        random: rnd,
        simulate: true,
      });
      s = e.after;
    }
    return { style, label: STYLES[style], rate: played ? won / played : 0 };
  });
}

// Shareable player cards: a compact, validated JSON payload in the URL hash.
const LOOKS = {
  face: ["round", "oval", "angular"],
  hair: ["crop", "sweep", "bob", "pony"],
  skin: ["light", "warm", "deep"],
  accessory: ["none", "band", "glasses"],
};
const CARD_KEYS = ["name", "gender", "level", "personality", "style", "face", "hair", "skin", "accessory", "stats", "skill", "skillName", "racket"];
export function encodeCard(profile) {
  const card = Object.fromEntries(CARD_KEYS.map((k) => [k, profile[k]])),
    bytes = new TextEncoder().encode(JSON.stringify(card));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeCard(text) {
  try {
    const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/")),
      bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0)),
      c = JSON.parse(new TextDecoder().decode(bytes));
    const name = typeof c.name === "string" ? c.name.trim().slice(0, 16) : "";
    if (!name || !validLevel(c.level) || !PERSONALITIES[c.personality] || !STYLES[c.style])
      return null;
    if (Object.entries(LOOKS).some(([k, ok]) => !ok.includes(c[k]))) return null;
    return {
      name,
      gender: c.gender === "女" ? "女" : "男",
      level: c.level,
      personality: c.personality,
      style: c.style,
      face: c.face,
      hair: c.hair,
      skin: c.skin,
      accessory: c.accessory,
      stats: normalizeStats(c.stats, c.level, c.style),
      skill: SKILLS[c.skill] ? c.skill : skillFor(c.style),
      skillName: typeof c.skillName === "string" ? c.skillName.trim().slice(0, 10) : "",
      racket: RACKETS[c.racket] ? c.racket : "standard",
    };
  } catch {
    return null;
  }
}

// End-of-match settlement: per-player rates and an MVP.
// Initiative shots press the opponent; passive ones only survive (a lift, a
// block, or any reply made while scrambling after a save). Serves count for
// neither, so active + passive covers every rally shot.
const PASSIVE = ["lift", "block"],
  SERVES = ["short", "flick", "high"];
export function settlement(rallies, profiles, winnerTeam = null) {
  const rows = profiles.map((p, i) => ({
    index: i,
    name: p.name,
    shots: 0,
    rallyShots: 0,
    active: 0,
    passive: 0,
    winners: 0,
    errors: 0,
    saves: 0,
    skills: 0,
    skillPoints: 0,
    skillRallies: 0,
  }));
  for (const rally of rallies) {
    const used = new Set();
    for (const e of shotsOf(rally)) {
      const me = rows[e.actor];
      me.shots++;
      if (!SERVES.includes(e.shot)) {
        me.rallyShots++;
        const scrambling = e.before?.pressure === e.actor;
        if (scrambling || PASSIVE.includes(e.shot)) me.passive++;
        else me.active++;
      }
      if (e.outcome === "winner") me.winners++;
      if (e.outcome === "net" || e.outcome === "out") me.errors++;
      if (e.outcome === "save") rows[e.receiver].saves++;
      if (e.skill) {
        const user = rows[e.skillUser ?? e.actor];
        user.skills++;
        used.add(user.index);
        if (e.outcome === "winner" || e.outcome === "save") user.skillPoints++;
      }
    }
    used.forEach((i) => rows[i].skillRallies++);
  }
  const rate = (a, b) => (b ? a / b : 0),
    total = rallies.length;
  for (const r of rows) {
    r.winRate = rate(r.winners, r.shots);
    r.errorRate = rate(r.errors, r.shots);
    r.activeRate = rate(r.active, r.rallyShots);
    r.passiveRate = rate(r.passive, r.rallyShots);
    r.skillRate = rate(r.skillRallies, total);
    r.mvpScore =
      r.winners * 3 +
      r.saves * 2 +
      r.skillPoints * 2 -
      r.errors * 1.5 +
      (winnerTeam !== null && team(r.index) === winnerTeam ? 4 : 0);
  }
  const mvp = rows.reduce((a, b) =>
    b.mvpScore > a.mvpScore || (b.mvpScore === a.mvpScore && b.winRate > a.winRate) ? b : a,
  );
  // Why this player: lead with their biggest contribution.
  const reasons = [
    mvp.winners && `${mvp.winners} 記直接得分`,
    mvp.saves && `${mvp.saves} 次救球`,
    mvp.skillPoints && `${mvp.skillPoints} 次絕技建功`,
    `失誤率 ${Math.round(mvp.errorRate * 100)}%`,
  ].filter(Boolean);
  return { rows, mvp: mvp.index, reason: reasons.slice(0, 3).join("・"), rallies: total };
}
// Final score of each game, from the per-point records.
export function gameScores(records) {
  const last = new Map();
  for (const r of records) last.set(r.game, r.score);
  return [...last.entries()].map(([game, score]) => ({ game, score }));
}
