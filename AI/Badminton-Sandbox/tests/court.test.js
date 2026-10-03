import test from "node:test";
import assert from "node:assert/strict";
import { CourtRenderer } from "../court.js";
import {
  createMatch,
  defaults,
  choosePlan,
  makeShot,
  seeded,
} from "../model.js";

globalThis.ResizeObserver = class {
  observe() {}
};
globalThis.devicePixelRatio = 2;
globalThis.Image = class {
  complete = true;
  naturalWidth = 130;
};

function canvasFixture() {
  let visible = false,
    width = 390,
    height = 465,
    ellipses = 0,
    faces = 0;
  const ctx = new Proxy(
    {
      drawImage() {
        faces++;
      },
      createLinearGradient: () => ({ addColorStop() {} }),
      createRadialGradient: () => ({ addColorStop() {} }),
      ellipse(x, y, rx, ry) {
        assert([x, y, rx, ry].every(Number.isFinite));
        assert(rx >= 0 && ry >= 0);
        ellipses++;
      },
    },
    { get: (target, key) => target[key] || (() => {}) },
  );
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    getBoundingClientRect: () => ({
      width: visible ? width : 0,
      height: visible ? height : 0,
      left: 18,
      top: 100,
    }),
  };
  return {
    canvas,
    show() {
      visible = true;
    },
    hide() {
      visible = false;
    },
    size(w, h) {
      width = w;
      height = h;
    },
    ellipses: () => ellipses,
    faces: () => faces,
  };
}
test("hidden initial court never produces a negative scale or stops later rendering", () => {
  const f = canvasFixture(),
    r = new CourtRenderer(f.canvas),
    s = createMatch();
  r.render(s, defaults());
  assert.equal(f.ellipses(), 0);
  f.show();
  r.resize();
  r.render(s, defaults());
  assert(r.scale > 0);
  assert(f.ellipses() > 0);
  assert.equal(f.faces(), 4);
  f.hide();
  r.resize();
  r.render(s, defaults());
  f.show();
  r.resize();
  r.render(s, defaults());
  assert(r.scale > 0);
});
test("canvas touch coordinates map back to court positions across breakpoints", () => {
  const f = canvasFixture(),
    r = new CourtRenderer(f.canvas);
  f.show();
  for (const [width, height] of [
    [320, 465],
    [390, 465],
    [900, 580],
  ]) {
    f.size(width, height);
    r.resize();
    for (const p of [
      { x: 0, z: 0 },
      { x: 2.5, z: -5.5 },
      { x: -2, z: 3 },
    ]) {
      const q = r.project(p.x, p.z),
        result = r.point(q.x + 18, q.y + 100);
      assert(Math.abs(result.x - p.x) < 1e-9);
      assert(Math.abs(result.z - p.z) < 1e-9);
    }
  }
});
test("normal, paused and reduced-motion shot frames have finite geometry", () => {
  const f = canvasFixture(),
    r = new CourtRenderer(f.canvas),
    s = createMatch(),
    profiles = defaults(),
    event = makeShot(s, choosePlan(s, profiles, seeded(2)), profiles);
  f.show();
  r.resize();
  for (const reduceMotion of [false, true])
    for (const elapsed of [0, 100, 500, 1100, 1499])
      r.render(s, profiles, {
        animation: { event, elapsed, duration: 1500 },
        reduceMotion,
        trail: [event],
      });
  assert(f.ellipses() > 0);
  assert.equal(f.faces(), 40);
});
for (const view of ["broadcast", "low", "high"])
test(`${view} camera maps taps back to the floor and shrinks far players`, () => {
  const f = canvasFixture(),
    r = new CourtRenderer(f.canvas),
    s = createMatch(),
    profiles = defaults();
  f.show();
  r.setView("camera", { low: 0, broadcast: 0.7, high: 1 }[view]);
  for (const [width, height] of [
    [390, 465],
    [900, 580],
  ]) {
    f.size(width, height);
    r.resize();
    for (const p of [
      { x: 0, z: 0 },
      { x: 2.5, z: -5.5 },
      { x: -3.05, z: 6.7 },
    ]) {
      const q = r.project(p.x, p.z),
        result = r.point(q.x + 18, q.y + 100);
      assert(Math.abs(result.x - p.x) < 1e-6);
      assert(Math.abs(result.z - p.z) < 1e-6);
      assert(q.y >= 0 && q.y <= height);
      // The low view deliberately lets near baseline corners leave the frame.
      if (view !== "low" || p.z < 3)
        assert(q.x >= 0 && q.x <= width);
    }
    // Perspective: the far baseline is narrower and far players are smaller.
    const far = r.project(3.05, -6.7).x - r.project(-3.05, -6.7).x,
      near = r.project(3.05, 6.7).x - r.project(-3.05, 6.7).x;
    assert(far < near * 0.8);
    assert(r.unitAt(0, -6) < r.unitAt(0, 6));
  }
  const event = makeShot(s, choosePlan(s, profiles, seeded(2)), profiles);
  r.render(s, profiles, {
    animation: { event, elapsed: 600, duration: 1300, prep: 0.25 },
    trail: [event],
  });
  assert(f.ellipses() > 0);
});
test("a saved camera view loads safely while the court is still hidden", () => {
  const f = canvasFixture(),
    r = new CourtRenderer(f.canvas);
  r.setView("camera", 0);
  const q = r.project(1, -3, 1),
    p = r.point(50, 50);
  assert(Number.isFinite(q.x) && Number.isFinite(q.y));
  assert(Number.isFinite(r.unitAt(0, 0)));
  assert.equal(typeof p.x, "number");
  f.show();
  r.resize();
  r.render(createMatch(), defaults());
});
test("smash impact effects draw finite geometry and expire", () => {
  const f = canvasFixture(),
    r = new CourtRenderer(f.canvas),
    s = createMatch(),
    profiles = defaults();
  globalThis.performance ??= { now: () => Date.now() };
  f.show();
  r.resize();
  for (const view of ["tactical", "camera"]) {
    r.setView(view, 0.4);
    const t0 = 1000;
    r.effects.clear();
    r.effects.spawn("flash", { x: 1, z: 4, h: 2.6 }, t0);
    r.effects.spawn("impact", { x: 1, z: 4, h: 2.6, dir: -1.2, power: 1.15 }, t0);
    r.effects.spawn("shout", { x: 1, z: 4, h: 2.6, text: "SMASH!", sub: "184 km/h" }, t0);
    r.effects.spawn("splash", { x: -1, z: -5, power: 1.1 }, t0);
    r.effects.shake(6, 170, t0);
    for (const dt of [0, 40, 120, 300, 500])
      r.render(s, profiles, { time: t0 + dt });
    assert(f.ellipses() > 0);
    assert.equal(r.effects.busy(t0 + 2000), false);
  }
});
