import test from "node:test";
import assert from "node:assert/strict";
import {
  defaults,
  createMatch,
  makeShot,
  targetPresets,
  shotOdds,
  shotSpeed,
  seeded,
  choosePlan,
  nextRally,
} from "../model.js";
import { presetStats, statTotal, budgetFor } from "../abilities.js";
import { encodeCard, decodeCard } from "../analysis.js";
import { skillDesign, skillCost, specialties } from "../workshop.js";
import { effectiveStats } from "../abilities.js";

function scenario(tempo = "tactical") {
  const profiles = defaults();
  let state = createMatch({ mode: "men", points: 11, bestOf: 1, tempo });
  state = makeShot(
    state,
    {
      actor: state.server,
      shot: "short",
      target: targetPresets(state, "short")[1],
    },
    profiles,
  ).after;
  const actor = state.nextActor;
  profiles[actor].skill = "thunder";
  return {
    profiles,
    state,
    plan: {
      actor,
      shot: "jumpSmash",
      target: targetPresets(state, "jumpSmash")[4],
    },
  };
}
test("high level players retain distinct strengths within the new budget", () => {
  assert.notDeepEqual(presetStats("attack", 18), presetStats("defense", 18));
  assert.equal(statTotal(presetStats("attack", 18)), budgetFor(18));
  assert.ok(Object.values(presetStats("attack", 18)).some((x) => x < 10));
});
test("specialties are distinct, limited to two, affect abilities and survive sharing", () => {
  const p = {...defaults()[0], specialties: []},
    before = effectiveStats(p);
  p.specialties = specialties(["heavy", "heavy", "trick", "rescue", "invalid"]);
  assert.deepEqual(p.specialties, ["heavy", "trick"]);
  const after = effectiveStats(p);
  assert.equal(after.power, Math.min(13, before.power + 1));
  assert.equal(after.control, before.control - 1);
  assert.deepEqual(decodeCard(encodeCard(p)).specialties, p.specialties);
});

test("custom skills and both tempos finish complete matches with valid probabilities", () => {
  for (const tempo of ["arcade", "tactical"])
    for (let seed = 1; seed <= 20; seed++) {
      const profiles = defaults();
      profiles.forEach((p, i) => {
        p.level = 6 + i * 3;
        p.stats = presetStats(p.style, p.level);
        p.skillDesign = skillDesign({
          effect: ["speed", "deceive", "control"][i % 3],
          cost: i % 2 ? "risk" : "charge",
          color: "fire",
        });
      });
      const random = seeded(seed);
      let s = createMatch({ mode: "men", points: 11, bestOf: 3, tempo }),
        shots = 0;
      while (!s.finished && shots < 3000) {
        if (s.phase === "ended") {
          s = nextRally(s);
          continue;
        }
        const plan = choosePlan(s, profiles, random),
          odds = shotOdds(s, plan, profiles);
        assert.ok(odds.error + odds.win <= 1);
        s = makeShot(s, plan, profiles, { random, simulate: true }).after;
        shots++;
      }
      assert.ok(s.finished, `${tempo} seed ${seed}`);
    }
});
test("arcade mode rewards attack and can force a weak return without awarding a point", () => {
  const { profiles, state, plan } = scenario();
  const normal = shotOdds(state, plan, profiles);
  state.config.tempo = "arcade";
  const fast = shotOdds(state, plan, profiles);
  assert.ok(fast.win > normal.win);
  assert.ok(fast.error < normal.error);
  let found = false;
  const random = seeded(92);
  for (let i = 0; i < 200; i++) {
    const e = makeShot(state, plan, profiles, { simulate: true, random });
    if (e.weakReturn) {
      assert.equal(e.outcome, "return");
      assert.equal(e.after.pressure, e.receiver);
      assert.deepEqual(e.after.score, [0, 0]);
      found = true;
      break;
    }
  }
  assert.ok(found);
});
test("custom skill requires its own charge, changes speed and round-trips with player card", () => {
  const { profiles, state, plan } = scenario();
  const p = profiles[plan.actor];
  p.skillDesign = skillDesign({ effect: "speed", cost: "risk", color: "fire" });
  assert.equal(skillCost(p), 70);
  state.meter[plan.actor] = 69;
  assert.throws(
    () => makeShot(state, { ...plan, skill: true }, profiles),
    /氣勢/,
  );
  state.meter[plan.actor] = 70;
  const e = makeShot(state, { ...plan, skill: true }, profiles);
  assert.equal(e.after.meter[plan.actor], 0);
  assert.ok(e.speed > shotSpeed(plan.shot, p.level, p));
  assert.deepEqual(decodeCard(encodeCard(p)).skillDesign, p.skillDesign);
});
