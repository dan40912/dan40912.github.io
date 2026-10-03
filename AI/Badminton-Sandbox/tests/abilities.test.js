import test from "node:test";
import assert from "node:assert/strict";
import {
  presetStats,
  normalizeStats,
  budgetFor,
  statTotal,
  edge,
  SKILLS,
  skillFor,
  METER_FULL,
} from "../abilities.js";
import {
  createMatch,
  defaults,
  makeShot,
  choosePlan,
  shotOdds,
  pointLabel,
  awardPoint,
  seeded,
  nextRally,
} from "../model.js";

test("style presets spend exactly the level budget within 1–10", () => {
  for (const style of ["allround", "attack", "net", "drive", "defense"])
    for (const level of [1, 6, 12, 18]) {
      const s = presetStats(style, level);
      assert.equal(statTotal(s), Math.min(budgetFor(level), 50));
      assert(Object.values(s).every((v) => v >= 1 && v <= 10));
    }
  const attack = presetStats("attack", 6);
  assert(attack.power > attack.defense);
});
test("normalize repairs bad stats and trims to a lowered level", () => {
  assert.deepEqual(normalizeStats(null, 6, "net"), presetStats("net", 6));
  const trimmed = normalizeStats(presetStats("attack", 18), 3, "attack");
  assert(statTotal(trimmed) <= budgetFor(3));
  assert(Object.values(trimmed).every((v) => v >= 1 && v <= 10));
});
test("edge is relative to the player's own average", () => {
  const flat = { stats: { power: 5, speed: 5, net: 5, defense: 5, control: 5 } };
  assert.equal(edge(flat, "power"), 0);
  const p = { stats: { power: 10, speed: 5, net: 5, defense: 2, control: 5 } };
  assert(edge(p, "power") > 0 && edge(p, "defense") < 0);
});
test("every style has a signature skill", () => {
  for (const style of ["allround", "attack", "net", "drive", "defense"])
    assert(SKILLS[skillFor(style)]);
});

function rallyState() {
  const profiles = defaults();
  let s = createMatch();
  s = makeShot(s, { actor: 0, shot: "short", target: { x: -1.4, z: -2.15 } }, profiles).after;
  s = makeShot(s, { actor: 2, shot: "lift", target: { x: 0, z: 6.05 } }, profiles).after;
  return { s, profiles };
}
test("an active skill needs a full meter, forces its shot and boosts odds", () => {
  const { s, profiles } = rallyState(),
    actor = s.nextActor;
  profiles[actor].skill = "thunder";
  const plan = { actor, shot: "smash", target: { x: 0, z: -3.3 }, skill: true };
  assert.throws(() => makeShot(s, plan, profiles), /氣勢/);
  s.meter[actor] = METER_FULL;
  const e = makeShot(s, plan, profiles);
  assert.equal(e.shot, "jumpSmash");
  assert.equal(e.skill, "thunder");
  assert.equal(e.after.meter[actor], 0);
  const base = shotOdds(s, { ...plan, shot: "jumpSmash", skill: false }, profiles),
    boosted = shotOdds(s, { ...plan, shot: "jumpSmash" }, profiles);
  assert(boosted.win > base.win);
});
test("wall turns a would-be winner into a save and keeps the rally going", () => {
  const { s, profiles } = rallyState(),
    actor = s.nextActor,
    plan = { actor, shot: "smash", target: { x: 0, z: -3.3 } },
    odds = shotOdds(s, plan, profiles);
  profiles[odds.receiver].skill = "wall";
  s.meter[odds.receiver] = METER_FULL;
  // Land the draw inside the winner band; the full wall must still save it.
  const r = odds.error + odds.win / 2,
    e = makeShot(s, plan, profiles, { simulate: true, random: () => r });
  assert.equal(e.outcome, "save");
  assert.equal(e.skill, "wall");
  assert.equal(e.skillUser, odds.receiver);
  assert.equal(e.after.phase, "rally");
  assert.equal(e.after.pressure, odds.receiver);
  assert.equal(e.after.meter[odds.receiver], 0);
});
test("auto play uses skills and saves within a full game", () => {
  const rnd = seeded(3),
    profiles = defaults();
  let s = createMatch(),
    skills = 0,
    saves = 0;
  for (let guard = 0; guard < 3000 && !s.finished; guard++) {
    if (s.phase === "ended") s = nextRally(s);
    const e = makeShot(s, choosePlan(s, profiles, rnd), profiles, {
      random: rnd,
      simulate: true,
    });
    if (e.skill) skills++;
    if (e.outcome === "save") saves++;
    s = e.after;
  }
  assert(s.finished);
  assert(skills > 0);
  assert(saves > 0);
});
test("game point and match point labels", () => {
  let s = createMatch({ points: 21, bestOf: 3 });
  s.score = [20, 10];
  assert.deepEqual(pointLabel(s), { team: 0, label: "GAME POINT" });
  s.wins = [1, 0];
  assert.deepEqual(pointLabel(s), { team: 0, label: "MATCH POINT" });
  s.score = [20, 20];
  assert.equal(pointLabel(s), null);
  s.score = [29, 29];
  assert.equal(pointLabel(s).label, "MATCH POINT");
  assert.equal(pointLabel(awardPoint({ ...s, phase: "rally" }, 0)), null);
});
test("rackets reshape stats without changing overall strength", async () => {
  const { RACKETS, effectiveStats } = await import("../abilities.js");
  for (const [key, r] of Object.entries(RACKETS)) {
    const sum = Object.values(r.mods).reduce((a, b) => a + b, 0);
    assert(Math.abs(sum) <= 1, `${key} modifiers sum to ${sum}`);
    assert.equal(r.colors.length, 2);
  }
  const p = { ...defaults()[0], racket: "standard" },
    heavy = { ...p, racket: "zf2" };
  assert.deepEqual(effectiveStats(p), p.stats);
  assert(edge(heavy, "power") > edge(p, "power"));
  assert(edge(heavy, "defense") < edge(p, "defense"));
});
test("every roster character carries a real racket", async () => {
  const { RACKETS } = await import("../abilities.js");
  for (const mode of ["men", "women", "mixed"])
    for (const p of defaults(mode)) assert(RACKETS[p.racket], p.name);
  assert(defaults("men").some((p) => p.name === "KK"));
});
