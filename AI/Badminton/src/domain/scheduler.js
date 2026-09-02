// 選人評分、分隊與分場(PRD §6.8)。純函式,不直接讀寫 state。

export const SCORE_WEIGHTS = {
  playCount: 100,
  waitingMatches: 15,
  playedImmediatelyBefore: 40,
  sameCourtRecently: 5,
};

const LEVEL_MAX_MIN_TARGET = 5;
const TEAM_SUM_DIFF_TARGET = 3;

// 分數越低越優先上場。
export function selectionScore(player, context = {}) {
  const { justFinishedIds, recentCourtMap, courtId } = context;
  let score = player.playCount * SCORE_WEIGHTS.playCount;
  score -= player.waitingMatches * SCORE_WEIGHTS.waitingMatches;
  if (justFinishedIds && justFinishedIds.has(player.id)) {
    score += SCORE_WEIGHTS.playedImmediatelyBefore;
  }
  if (recentCourtMap && courtId && recentCourtMap.get(player.id) === courtId) {
    score += SCORE_WEIGHTS.sameCourtRecently;
  }
  return score;
}

export function rankByFairness(players, ids, context = {}) {
  const byId = new Map(players.map((p) => [p.id, p]));
  return ids
    .map((id) => ({ id, score: selectionScore(byId.get(id), context) }))
    .sort((a, b) => a.score - b.score)
    .map((s) => s.id);
}

function sameSet(a, b) {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

function countTogether(matches, idA, idB) {
  let count = 0;
  for (const m of matches) {
    if (
      (m.teamA.includes(idA) && m.teamA.includes(idB)) ||
      (m.teamB.includes(idA) && m.teamB.includes(idB))
    ) {
      count += 1;
    }
  }
  return count;
}

function countHeadToHead(matches, teamA, teamB) {
  let count = 0;
  for (const m of matches) {
    if (
      (sameSet(m.teamA, teamA) && sameSet(m.teamB, teamB)) ||
      (sameSet(m.teamA, teamB) && sameSet(m.teamB, teamA))
    ) {
      count += 1;
    }
  }
  return count;
}

// 四人分隊:列舉 3 種不重複的 2 對 2 分法,依序比較等級差、同隊歷史、對戰歷史。
export function splitTeams(fourPlayers, matches = []) {
  const [p0, p1, p2, p3] = fourPlayers;
  const options = [
    { a: [p0, p1], b: [p2, p3] },
    { a: [p0, p2], b: [p1, p3] },
    { a: [p0, p3], b: [p1, p2] },
  ];

  const scored = options.map((opt, idx) => {
    const sumA = opt.a[0].level + opt.a[1].level;
    const sumB = opt.b[0].level + opt.b[1].level;
    const levelDiff = Math.abs(sumA - sumB);
    const sameTeamCount =
      countTogether(matches, opt.a[0].id, opt.a[1].id) + countTogether(matches, opt.b[0].id, opt.b[1].id);
    const headToHeadCount = countHeadToHead(
      matches,
      [opt.a[0].id, opt.a[1].id],
      [opt.b[0].id, opt.b[1].id],
    );
    return { ...opt, sumA, sumB, levelDiff, sameTeamCount, headToHeadCount, idx };
  });

  // 同分時用可重現的輪替規則(依歷史場次數決定偏好順位),避免每次都固定同一組合。
  const rotation = matches.length % 3;
  scored.sort(
    (x, y) =>
      x.levelDiff - y.levelDiff ||
      x.sameTeamCount - y.sameTeamCount ||
      x.headToHeadCount - y.headToHeadCount ||
      ((x.idx - rotation + 3) % 3) - ((y.idx - rotation + 3) % 3),
  );

  return scored[0];
}

// 場內程度平衡狀態:綠(達標)、黃(部分超標)、紅(明顯失衡)。門檻以外為軟性判斷,不阻擋流程。
export function computeBalanceStatus(teamAPlayers, teamBPlayers) {
  const all = [...teamAPlayers, ...teamBPlayers];
  if (all.length < 4) {
    return { status: "incomplete", maxMinDiff: null, sumDiff: null };
  }
  const levels = all.map((p) => p.level);
  const maxMinDiff = Math.max(...levels) - Math.min(...levels);
  const sumA = teamAPlayers.reduce((s, p) => s + p.level, 0);
  const sumB = teamBPlayers.reduce((s, p) => s + p.level, 0);
  const sumDiff = Math.abs(sumA - sumB);

  let status = "ok";
  if (maxMinDiff > LEVEL_MAX_MIN_TARGET || sumDiff > TEAM_SUM_DIFF_TARGET) status = "warn";
  if (maxMinDiff > LEVEL_MAX_MIN_TARGET * 1.6 || sumDiff > TEAM_SUM_DIFF_TARGET * 2) status = "danger";
  return { status, maxMinDiff, sumDiff, sumA, sumB };
}

// 多場地平均程度:蛇形分配(snake draft),讓各場地平均等級接近。
export function snakeDistribute(players, groupCount) {
  const sorted = [...players].sort((a, b) => b.level - a.level);
  const groups = Array.from({ length: groupCount }, () => []);
  let dir = 1;
  let idx = 0;
  for (const p of sorted) {
    groups[idx].push(p);
    if (dir === 1 && idx === groupCount - 1) dir = -1;
    else if (dir === -1 && idx === 0) dir = 1;
    else idx += dir;
  }
  return groups;
}

// 自動安排首場/整體重新安排:從等候名單選出所需球員,分配到各面需要補位的場地。
export function planAutoArrange(state, courtIds, context = {}) {
  const byId = new Map(state.players.map((p) => [p.id, p]));
  const needed = courtIds.length * 8; // 每場最多 4 上場 + 4 候場
  const ranked = rankByFairness(state.players, state.queue, context);
  const chosen = ranked.slice(0, needed).map((id) => byId.get(id));

  const playingPoolSize = Math.min(courtIds.length * 4, chosen.length);
  const playingPool = chosen.slice(0, playingPoolSize);
  const onDeckPool = chosen.slice(playingPoolSize);

  const playingGroups = snakeDistribute(playingPool, courtIds.length);
  const onDeckGroups = snakeDistribute(onDeckPool, courtIds.length);

  return courtIds.map((courtId, i) => {
    const four = playingGroups[i] || [];
    let playingIds = [];
    if (four.length === 4) {
      const split = splitTeams(four, state.matches);
      playingIds = [split.a[0].id, split.a[1].id, split.b[0].id, split.b[1].id];
    } else {
      playingIds = four.map((p) => p.id);
    }
    const onDeckIds = (onDeckGroups[i] || []).slice(0, 4).map((p) => p.id);
    return { courtId, playingIds, onDeckIds };
  });
}

// 單一場地候場遞補:從等候名單挑最多 4 人補入候場區。
export function planOnDeckRefill(state, courtId, slotsNeeded, context = {}) {
  const byId = new Map(state.players.map((p) => [p.id, p]));
  const ranked = rankByFairness(state.players, state.queue, { ...context, courtId });
  return ranked.slice(0, slotsNeeded).map((id) => byId.get(id).id);
}
