import test from "node:test";
import assert from "node:assert/strict";
import {
  createMatch,
  setupServe,
  serveRegion,
  legalTarget,
  targetPresets,
  validStanding,
  actors,
  defaults,
  choosePlan,
  makeShot,
  awardPoint,
  nextRally,
  seeded,
  trajectory,
  SHOTS,
} from "../model.js";

test("all servers, receivers and service parity have legal standing and diagonal boundaries", () => {
  for (let server = 0; server < 4; server++)
    for (const score of [0, 1, 2, 3]) {
      let s = createMatch();
      s.score[server < 2 ? 0 : 1] = score;
      s = setupServe(s, server, server < 2 ? 2 : 0);
      assert.equal(validStanding(s), true);
      assert.equal(s.side, score % 2 ? "left" : "right");
      const r = serveRegion(s);
      assert(legalTarget(s, { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 }));
      assert(legalTarget(s, { x: r.x0, z: r.z0 }));
      assert(!legalTarget(s, { x: r.x0 - 0.01, z: (r.z0 + r.z1) / 2 }));
    }
});
test("the first reply belongs to the designated receiver; input is immutable", () => {
  const before = createMatch(),
    snapshot = JSON.stringify(before),
    plan = choosePlan(before, defaults(), seeded(8));
  const e = makeShot(before, plan, defaults());
  assert.deepEqual(actors(e.after), [before.receiver]);
  assert.equal(JSON.stringify(before), snapshot);
  assert.throws(() =>
    makeShot(
      e.after,
      { actor: 3, shot: "lift", target: { x: 0, z: 6 } },
      defaults(),
    ),
  );
});
test("service winner rotates slots; receiving winner takes service with score parity", () => {
  let s = createMatch();
  s.phase = "rally";
  s = awardPoint(s, 0);
  s = nextRally(s);
  assert.equal(s.server, 0);
  assert.equal(s.side, "left");
  assert.deepEqual(s.slots[0], [1, 0]);
  s.phase = "rally";
  s = awardPoint(s, 1);
  s = nextRally(s);
  assert.equal(s.server, 3);
  assert.equal(s.side, "left");
  assert.equal(s.receiver, 0);
});
test("deuce, caps, game reset and best-of-three termination", () => {
  let s = createMatch({ points: 21, bestOf: 3 });
  s.score = [20, 20];
  s.phase = "rally";
  s = awardPoint(s, 0);
  assert(!s.gameEnded);
  s = nextRally(s);
  s.phase = "rally";
  s = awardPoint(s, 0);
  assert.equal(s.gameEnded, true);
  assert(!s.finished);
  assert.deepEqual(s.score, [22, 20]);
  s = nextRally(s);
  assert.deepEqual(s.score, [0, 0]);
  assert.equal(s.game, 2);
  s.score = [29, 29];
  s.phase = "rally";
  s = awardPoint(s, 0);
  assert(s.finished);
  assert.deepEqual(s.wins, [2, 0]);
  let short = createMatch({ points: 11, bestOf: 1 });
  short.score = [14, 14];
  short.phase = "rally";
  short = awardPoint(short, 1);
  assert(short.finished);
  assert.deepEqual(short.score, [14, 15]);
});
test("simulated outcomes have visually consistent actual targets and ball trajectories", () => {
  const s = createMatch(),
    p = choosePlan(s, defaults(), seeded(1));
  const net = makeShot(s, p, defaults(), { simulate: true, random: () => 0 });
  assert.equal(net.outcome, "net");
  assert(net.actual.z > 0);
  assert.equal(net.after.winner, 1);
  let draws = [0, 0.9];
  const out = makeShot(s, p, defaults(), {
    simulate: true,
    random: () => draws.shift(),
  });
  assert.equal(out.outcome, "out");
  assert(Math.abs(out.actual.x) > 3.05);
  for (const e of [net, out]) {
    const final = trajectory(e, 1);
    assert(Math.abs(final.x - e.actual.x) < 1e-9);
    assert(Math.abs(final.z - e.actual.z) < 1e-9);
    assert.equal(e.after.phase, "ended");
  }
});
test("100 seeded full matches finish, with legal plans, valid positions and correct series winners", () => {
  const profiles = defaults();
  for (let seed = 1; seed <= 100; seed++) {
    const random = seeded(seed);
    let s = createMatch({ points: seed % 2 ? 11 : 21, bestOf: 3 }),
      shots = 0;
    while (!s.finished && shots < 10000) {
      if (s.phase === "ended") {
        s = nextRally(s);
        continue;
      }
      const p = choosePlan(s, profiles, random);
      assert(legalTarget(s, p.target, p.shot));
      assert(actors(s).includes(p.actor));
      const e = makeShot(s, p, profiles, { random, simulate: true });
      s = e.after;
      assert(
        s.positions.every((p) => Number.isFinite(p.x) && Number.isFinite(p.z)),
      );
      shots++;
    }
    assert(s.finished, `seed ${seed} did not finish`);
    assert.equal(Math.max(...s.wins), 2);
  }
});

test("short and long serves expose only compatible targets on either diagonal", () => {
  for (const server of [0, 1, 2, 3]) for (const score of [0, 1]) {
    let s = createMatch();
    s.score[server < 2 ? 0 : 1] = score;
    s = setupServe(s, server, server < 2 ? 2 : 0);
    const short = targetPresets(s, "short"), long = targetPresets(s, "high");
    assert.equal(short.length, 3);
    assert.equal(long.length, 3);
    for (const p of short) {
      assert(p.label.startsWith("短"));
      assert(legalTarget(s, p, "short"));
      assert(!legalTarget(s, p, "high"));
      assert.throws(() => makeShot(s, {actor: server, shot: "high", target: p}, defaults()), /有效落點/);
    }
    for (const p of long) {
      assert(p.label.startsWith("長"));
      assert(legalTarget(s, p, "flick"));
      assert(!legalTarget(s, p, "short"));
      assert.throws(() => makeShot(s, {actor: server, shot: "short", target: p}, defaults()), /有效落點/);
    }
    const r = serveRegion(s), x = (r.x0 + r.x1) / 2, z = server < 2 ? -1 : 1;
    assert(legalTarget(s, {x, z: z * 3}, "short"));
    assert(!legalTarget(s, {x, z: z * 3.01}, "short"));
    assert(!legalTarget(s, {x, z: z * 4.79}, "high"));
    assert(legalTarget(s, {x, z: z * 4.8}, "high"));
  }
});

test("net shots stay short and lifts stay deep in rallies and direct point selection", () => {
  for (const turn of [0, 1]) {
    const s = {...createMatch(), phase: "rally", turn, total: 2};
    const z = turn === 0 ? -1 : 1;
    for (const shot of ["drop", "net", "block", "cut", "cross"]) {
      const presets = targetPresets(s, shot);
      assert(presets.length >= 3);
      assert(presets.every((p) => Math.abs(p.z) <= 1.98 && legalTarget(s, p, shot)));
      assert(!legalTarget(s, {x: 0, z: z * 6}, shot));
    }
    assert(targetPresets(s, "lift").every((p) => Math.abs(p.z) >= 4.8));
    assert(!legalTarget(s, {x: 0, z: z * 0.7}, "lift"));
    assert(!legalTarget(s, {x: 0, z: -z * 6}, "lift"));
  }
});

test("midpoint and waist targets follow both opponents, with waist-height contact", () => {
  const s = {...createMatch(), phase: "rally", turn: 0, total: 2, nextActor: 0};
  s.positions[2] = {x: 1.8, z: -4};
  s.positions[3] = {x: -1.4, z: -2.8};
  let presets = targetPresets(s, "drive");
  const middle = presets.find((p) => p.label === "兩人中間");
  assert(Math.abs(middle.x - 0.2) < 1e-9);
  assert.equal(middle.z, -3.4);
  const waist = presets.filter((p) => p.kind === "waist");
  assert.deepEqual(waist.map((p) => p.player), [3, 2]);
  for (const target of waist) {
    const e = makeShot(s, {actor: 0, shot: "drive", target}, defaults());
    assert.equal(e.receiver, target.player);
    assert.equal(trajectory(e, 1).h, 1.05);
    const crossing = -e.from.z / (e.actual.z - e.from.z);
    assert(trajectory(e, crossing).h >= 1.679999);
    assert(Math.abs(trajectory({...e, outcome: "out"}, 1).h - 0.12) < 1e-9);
    assert(!legalTarget(s, target, "lift"));
    assert(!legalTarget(s, target, "net"));
  }
  s.positions[3] = {x: -2.2, z: -3.8};
  presets = targetPresets(s, "drive");
  assert.equal(presets.find((p) => p.kind === "waist" && p.player === 3).x, -2.2);
  assert.equal(presets.find((p) => p.label === "兩人中間").z, -3.9);
  assert(!targetPresets(createMatch(), "short").some((p) => p.kind === "waist"));
});

test("every successful flight visibly clears the net across legal target depths", () => {
  for (const shot of Object.keys(SHOTS))
    for (const depth of [0.7, 2.15, 3.3, 6.05]) {
      const e = {
        shot,
        outcome: "return",
        from: { x: 1, z: 6.1 },
        actual: { x: -2, z: -depth },
      };
      const crossing = 6.1 / (6.1 + depth);
      assert(trajectory(e, crossing).h >= 1.679999);
    }
});
test("power shots fly fastest, clears slowest; three distinct hit sounds", async () => {
  const { FLIGHT_MS, soundFor, POWER_SHOTS } = await import("../model.js");
  const others = Object.keys(SHOTS).filter((k) => !POWER_SHOTS.includes(k));
  const slowestPower = Math.max(...POWER_SHOTS.map((k) => FLIGHT_MS[k]));
  assert(others.every((k) => FLIGHT_MS[k] > slowestPower));
  assert(FLIGHT_MS.jumpSmash < FLIGHT_MS.smash);
  assert(FLIGHT_MS.lift > FLIGHT_MS.drive);
  for (const k of POWER_SHOTS) assert.equal(soundFor(k), "smash");
  for (const k of ["lift", "high", "flick"]) assert.equal(soundFor(k), "clear");
  for (const k of ["net", "drive", "drop", "short", "block", "push", "cut", "cross"])
    assert.equal(soundFor(k), "touch");
});
test("pre-shot odds follow level, so edited levels change the simulation", async () => {
  const { shotOdds } = await import("../model.js");
  let s = createMatch();
  const plan = { actor: 0, shot: "short", target: { x: -1.4, z: -2.15 } };
  const weak = defaults().map((p) => ({ ...p, level: 3 })),
    strong = defaults().map((p, i) => ({ ...p, level: i < 2 ? 11 : 3 }));
  const a = shotOdds(s, plan, weak),
    b = shotOdds(s, plan, strong);
  assert(b.error < a.error);
  assert(b.win > a.win);
  assert.equal(a.receiver, s.receiver);
});
test("18 levels follow the association tiers and scale error, pace and odds", async () => {
  const { tierOf, baseError, shotSpeed, flightMs, validLevel, shotOdds } =
    await import("../model.js");
  const tiers = [1, 4, 6, 8, 10, 13, 16].map((l) => tierOf(l).name);
  assert.deepEqual(tiers, ["新手階", "初階", "初中階", "中階", "中進階", "高階", "職業級"]);
  assert.equal(tierOf(3).name, "新手階");
  assert.equal(tierOf(12).name, "中進階");
  assert.equal(tierOf(18).name, "職業級");
  assert(validLevel(18) && !validLevel(19) && !validLevel(0));
  for (let l = 1; l < 18; l++) {
    assert(baseError(l + 1) < baseError(l));
    assert(shotSpeed("smash", l + 1) > shotSpeed("smash", l));
    assert(flightMs("smash", l + 1) <= flightMs("smash", l));
  }
  const s = createMatch(),
    plan = { actor: 0, shot: "short", target: { x: -1.4, z: -2.15 } },
    team = (a, b) => defaults().map((p, i) => ({ ...p, level: i < 2 ? a : b }));
  const pro = shotOdds(s, plan, team(18, 6)),
    rookie = shotOdds(s, plan, team(1, 6));
  assert(pro.error < rookie.error && pro.win > rookie.win);
});
