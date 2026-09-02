import { test } from "node:test";
import assert from "node:assert/strict";
import { selectionScore, splitTeams, computeBalanceStatus, snakeDistribute, planOnDeckRefill } from "../domain/scheduler.js";

function player(id, level, playCount = 0, waitingMatches = 0) {
  return { id, level, playCount, waitingMatches, status: "queued", courtId: null, slotIndex: null, lastPlayedAt: null, createdAt: "" };
}

test("selectionScore:出賽次數少者優先(分數較低)", () => {
  const a = player("a", 8, 0, 0);
  const b = player("b", 8, 3, 0);
  assert.ok(selectionScore(a, {}) < selectionScore(b, {}));
});

test("selectionScore:同次數時等待較久者優先", () => {
  const a = player("a", 8, 2, 5);
  const b = player("b", 8, 2, 1);
  assert.ok(selectionScore(a, {}) < selectionScore(b, {}));
});

test("selectionScore:剛下場者分數提高,較不易立刻再上場", () => {
  const a = player("a", 8, 2, 2);
  const justFinishedIds = new Set(["a"]);
  const withPenalty = selectionScore(a, { justFinishedIds });
  const without = selectionScore(a, { justFinishedIds: new Set() });
  assert.ok(withPenalty > without);
});

test("splitTeams:符合 PRD 範例 11+6 對 9+8", () => {
  const four = [player("p11", 11), player("p9", 9), player("p8", 8), player("p6", 6)];
  const split = splitTeams(four, []);
  assert.equal(split.levelDiff, 0);
  const teamLevels = [...split.a, ...split.b].map((p) => p.level).sort((a, b) => a - b);
  assert.deepEqual(teamLevels, [6, 8, 9, 11]);
});

test("splitTeams:同分時依歷史場次數輪替,不永遠固定同一組合", () => {
  const four = [player("a", 10), player("b", 10), player("c", 10), player("d", 10)];
  const results = new Set();
  for (let n = 0; n < 3; n += 1) {
    const matches = Array.from({ length: n }, () => ({ teamA: [], teamB: [] }));
    const split = splitTeams(four, matches);
    results.add(split.idx);
  }
  assert.ok(results.size > 1, "三種歷史場次數下應出現不同的分隊選擇");
});

test("computeBalanceStatus:達標為 ok,超標為 warn", () => {
  const ok = computeBalanceStatus([player("a", 11), player("b", 6)], [player("c", 9), player("d", 8)]);
  assert.equal(ok.status, "ok");

  const warn = computeBalanceStatus([player("a", 12), player("b", 6)], [player("c", 9), player("d", 8)]);
  assert.equal(warn.status, "warn");
});

test("snakeDistribute:兩組平均等級接近", () => {
  const players = [player("a", 15), player("b", 13), player("c", 5), player("d", 3)];
  const groups = snakeDistribute(players, 2);
  const sums = groups.map((g) => g.reduce((s, p) => s + p.level, 0));
  assert.equal(sums[0], sums[1]);
});

test("planOnDeckRefill:從等候名單依公平性挑最多 N 人", () => {
  const state = {
    players: [player("a", 8, 5), player("b", 8, 0), player("c", 8, 1)],
    queue: ["a", "b", "c"],
    matches: [],
  };
  const ids = planOnDeckRefill(state, "court1", 2, {});
  assert.deepEqual(ids, ["b", "c"]);
});
