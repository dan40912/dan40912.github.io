import test from "node:test";
import assert from "node:assert/strict";
import { shotContext } from "../coaching.js";
import { createMatch, defaults } from "../model.js";

test("coaching uses designated service receiver and measured starting distance", () => {
  const profiles = defaults();
  const state = createMatch({ points: 21, bestOf: 1, mode: "men" });
  const target = { x: 1, z: -2.5 };
  const r = state.positions[state.receiver];
  const expected = Math.hypot(r.x - target.x, r.z - target.z).toFixed(1);
  const text = shotContext(state, state.server, "short", target, profiles);
  assert.ok(text.includes(profiles[state.receiver].name));
  assert.ok(text.includes(`${expected} m`));
  assert.ok(text.includes("指定接發者"));
});

test("failed shots describe actual result instead of claiming intended placement", () => {
  const state = createMatch({ points: 21, bestOf: 1, mode: "men" });
  const profiles = defaults(),
    target = { x: 1, z: -5 };
  const event = { receiver: state.receiver, outcome: "net" };
  assert.match(
    shotContext(state, state.server, "high", target, profiles, event),
    /落點沒有實現/,
  );
  event.outcome = "out";
  event.actual = { x: -3.5, z: -5 };
  assert.match(
    shotContext(state, state.server, "high", target, profiles, event),
    /3.5 m.*3.05 m/,
  );
});
