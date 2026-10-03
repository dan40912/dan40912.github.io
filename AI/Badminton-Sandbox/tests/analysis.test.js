import test from "node:test";
import assert from "node:assert/strict";
import {
  summarize,
  insight,
  highlights,
  matchup,
  encodeCard,
  decodeCard,
} from "../analysis.js";
import {
  createMatch,
  defaults,
  choosePlan,
  makeShot,
  nextRally,
  seeded,
} from "../model.js";

function playRallies(n) {
  const rnd = seeded(4),
    profiles = defaults(),
    rallies = [];
  let s = createMatch(),
    current = [];
  while (rallies.length < n) {
    if (s.phase === "ended") {
      rallies.push(current);
      current = [];
      s = s.finished ? createMatch() : nextRally(s);
      continue;
    }
    const e = makeShot(s, choosePlan(s, profiles, rnd), profiles, {
      random: rnd,
      simulate: true,
    });
    current.push(e);
    s = e.after;
  }
  return { rallies, profiles };
}
test("summary accounts for every point exactly once", () => {
  const { rallies, profiles } = playRallies(40),
    { players, teams } = summarize(rallies, profiles);
  assert.equal(teams[0].points + teams[1].points, 40);
  for (const t of teams) assert.equal(t.points, t.fromWinners + t.fromErrors);
  const winners = players.reduce((n, p) => n + p.winners, 0),
    errors = players.reduce((n, p) => n + p.errors, 0);
  assert.equal(winners + errors, 40);
  for (const p of players) assert.equal(typeof insight(p), "string");
});
test("highlights point at real rallies", () => {
  const { rallies, profiles } = playRallies(30),
    list = highlights(rallies, profiles);
  assert(list.length >= 1 && list.length <= 3);
  for (const h of list) assert(rallies[h.index]);
});
test("matchup tests every archetype at the player's own level", () => {
  const p = defaults()[0],
    a = matchup(p, { rallies: 150 }),
    b = matchup(p, { rallies: 150 });
  assert.equal(a.length, 5);
  assert.deepEqual(a, b, "seeded, so repeatable");
  const avg = a.reduce((n, r) => n + r.rate, 0) / a.length;
  assert(avg > 0.35 && avg < 0.65, `even-level average ${avg}`);
});
test("player cards round-trip and reject tampered payloads", () => {
  const p = { ...defaults()[0], name: "Jay 傑", skillName: "天外飛殺" },
    back = decodeCard(encodeCard(p));
  assert.equal(back.name, "Jay 傑");
  assert.equal(back.skillName, "天外飛殺");
  assert.deepEqual(back.stats, p.stats);
  assert.equal(decodeCard("not-a-card"), null);
  const bad = encodeCard({ ...p, level: 40 });
  assert.equal(decodeCard(bad), null);
  const evil = encodeCard({ ...p, face: "<img onerror=x>" });
  assert.equal(decodeCard(evil), null);
});
test("settlement rates are consistent and an MVP is picked", async () => {
  const { settlement, gameScores } = await import("../analysis.js");
  const { rallies, profiles } = playRallies(40),
    st = settlement(rallies, profiles, 0);
  assert.equal(st.rows.length, 4);
  assert(st.rows[st.mvp]);
  assert.equal(typeof st.reason, "string");
  for (const r of st.rows) {
    for (const k of ["winRate", "errorRate", "activeRate", "passiveRate", "skillRate"])
      assert(r[k] >= 0 && r[k] <= 1, `${k} ${r[k]}`);
    if (r.rallyShots) assert(Math.abs(r.activeRate + r.passiveRate - 1) < 1e-9);
  }
  assert.deepEqual(
    gameScores([
      { game: 1, score: [1, 0] },
      { game: 1, score: [21, 15] },
      { game: 2, score: [3, 21] },
    ]),
    [
      { game: 1, score: [21, 15] },
      { game: 2, score: [3, 21] },
    ],
  );
});
