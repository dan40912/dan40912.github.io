import { test } from "node:test";
import assert from "node:assert/strict";
import {
  swapByLocation,
  endMatch,
  checkIn,
  pausePlayer,
  applyAutoArrangePlan,
} from "../domain/transitions.js";
import { findDuplicatePlacements } from "../domain/validators.js";

function player(id, level, extra = {}) {
  return {
    id,
    name: id,
    level,
    status: "queued",
    courtId: null,
    slotIndex: null,
    playCount: 0,
    waitingMatches: 0,
    lastPlayedAt: null,
    createdAt: "",
    ...extra,
  };
}

function makeState({ courtCount = 2, players = [] } = {}) {
  const courts = Array.from({ length: courtCount }, (_, i) => ({
    id: `court${i + 1}`,
    name: `場地 ${i + 1}`,
    playingSlots: [null, null, null, null],
    onDeckSlots: [null, null, null, null],
    activeMatchId: null,
    matchStartSnapshot: null,
  }));
  return {
    schemaVersion: 1,
    event: { name: "test" },
    players,
    courts,
    queue: players.map((p) => p.id),
    paused: [],
    notArrived: [],
    matches: [],
  };
}

function totalPlayerCount(state) {
  let n = 0;
  for (const c of state.courts) {
    n += c.playingSlots.filter(Boolean).length + c.onDeckSlots.filter(Boolean).length;
  }
  return n + state.queue.length + state.paused.length + state.notArrived.length;
}

test("驗收 #2:任何球員不會同時出現在兩個位置", () => {
  const players = Array.from({ length: 8 }, (_, i) => player(`p${i}`, 6));
  let state = makeState({ courtCount: 2, players });
  for (let i = 0; i < 4; i += 1) {
    state = swapByLocation(state, { type: "queue", index: 0 }, { type: "court", courtId: "court1", area: "playing", slotIndex: i });
  }
  assert.equal(findDuplicatePlacements(state).length, 0);
  assert.equal(totalPlayerCount(state), 8);
});

test("驗收 #3:等候名單球員拖到已佔用候場槽,兩人互換,總人數不變", () => {
  const players = [player("q0", 6), player("q1", 6), player("onDeckP", 6)];
  let state = makeState({ courtCount: 1, players });
  state = swapByLocation(state, { type: "queue", index: 2 }, { type: "court", courtId: "court1", area: "onDeck", slotIndex: 0 });
  assert.deepEqual(state.courts[0].onDeckSlots, ["onDeckP", null, null, null]);
  assert.deepEqual(state.queue, ["q0", "q1"]);

  const before = state;
  state = swapByLocation(state, { type: "queue", index: 0 }, { type: "court", courtId: "court1", area: "onDeck", slotIndex: 0 });
  assert.deepEqual(state.courts[0].onDeckSlots, ["q0", null, null, null]);
  // 被替換的候場球員回到來源球員原本的等候順位(index 0)
  assert.deepEqual(state.queue, ["onDeckP", "q1"]);
  assert.equal(totalPlayerCount(before), totalPlayerCount(state));
  assert.equal(findDuplicatePlacements(state).length, 0);
});

test("驗收 #4:候場與場上交換立即生效,結束時以按鈕當下為準", () => {
  const players = [player("play0", 6), player("play1", 6), player("play2", 6), player("play3", 6), player("deck0", 6)];
  let state = makeState({ courtCount: 1, players: [] });
  state = { ...state, players, queue: [] };
  ["play0", "play1", "play2", "play3"].forEach((id, i) => {
    state.courts[0].playingSlots[i] = id;
  });
  state.courts[0].onDeckSlots[0] = "deck0";

  state = swapByLocation(
    state,
    { type: "court", courtId: "court1", area: "onDeck", slotIndex: 0 },
    { type: "court", courtId: "court1", area: "playing", slotIndex: 0 },
  );
  assert.equal(state.courts[0].playingSlots[0], "deck0");
  assert.equal(state.courts[0].onDeckSlots[0], "play0");

  const next = endMatch(state, "court1");
  const deck0 = next.players.find((p) => p.id === "deck0");
  const play0 = next.players.find((p) => p.id === "play0");
  assert.equal(deck0.playCount, 1, "交換後實際在場上的 deck0 應計次");
  assert.equal(play0.playCount, 0, "交換後被換下的 play0(此時在候場)不應計次");
});

test("驗收 #5:結束一面場不影響另一面正在進行的場上名單", () => {
  const players = [
    player("c1a", 6), player("c1b", 6), player("c1c", 6), player("c1d", 6),
    player("c2a", 6), player("c2b", 6), player("c2c", 6), player("c2d", 6),
  ];
  let state = makeState({ courtCount: 2, players: [] });
  state = { ...state, players, queue: [] };
  ["c1a", "c1b", "c1c", "c1d"].forEach((id, i) => (state.courts[0].playingSlots[i] = id));
  ["c2a", "c2b", "c2c", "c2d"].forEach((id, i) => (state.courts[1].playingSlots[i] = id));

  const next = endMatch(state, "court1");
  assert.deepEqual(next.courts[1].playingSlots, ["c2a", "c2b", "c2c", "c2d"]);
});

test("驗收 #6:結束一場後原候場依順位上場,原場上各 +1 場並回等候名單", () => {
  const playing = ["p0", "p1", "p2", "p3"].map((id) => player(id, 8));
  const onDeck = ["d0", "d1", "d2", "d3"].map((id) => player(id, 8));
  const spare = ["s0", "s1", "s2", "s3"].map((id) => player(id, 8));
  let state = makeState({ courtCount: 1, players: [...playing, ...onDeck, ...spare] });
  // 保留足夠的候補名單(spare),避免剛下場的 p0-p3 因等候名單為空而被迫立刻連打回候場。
  state = { ...state, queue: spare.map((p) => p.id) };
  playing.forEach((p, i) => (state.courts[0].playingSlots[i] = p.id));
  onDeck.forEach((p, i) => (state.courts[0].onDeckSlots[i] = p.id));

  const next = endMatch(state, "court1");
  for (const p of playing) {
    assert.equal(next.players.find((x) => x.id === p.id).playCount, 1);
    assert.equal(next.players.find((x) => x.id === p.id).status, "queued");
  }
  const nowPlayingIds = next.courts[0].playingSlots;
  for (const p of onDeck) {
    assert.ok(nowPlayingIds.includes(p.id));
  }
  assert.equal(findDuplicatePlacements(next).length, 0);
  assert.equal(totalPlayerCount(next), 12);
});

test("暫停期間不累計等待優先權(waitingMatches 不遞增)", () => {
  const players = [
    player("waiting", 6),
    player("paused", 6),
    player("p0", 6),
    player("p1", 6),
    player("p2", 6),
    player("p3", 6),
    player("spare0", 6),
    player("spare1", 6),
    player("spare2", 6),
    player("spare3", 6),
  ];
  let state = makeState({ courtCount: 1, players: [] });
  // spare0-3 排在 waiting 之前:公平性同分時依序挑選,確保候場遞補恰好選滿 4 位 spare,
  // 不會連帶選走 waiting,才能單獨驗證等待場次計算。
  state = {
    ...state,
    players,
    queue: ["spare0", "spare1", "spare2", "spare3", "waiting", "paused", "p0", "p1", "p2", "p3"],
    paused: [],
  };
  state = pausePlayer(state, "paused");
  assert.deepEqual(state.paused, ["paused"]);

  ["p0", "p1", "p2", "p3"].forEach((id, i) => (state.courts[0].playingSlots[i] = id));
  state = { ...state, queue: state.queue.filter((id) => !["p0", "p1", "p2", "p3"].includes(id)) };

  const next = endMatch(state, "court1");
  const waiting = next.players.find((p) => p.id === "waiting");
  const paused = next.players.find((p) => p.id === "paused");
  assert.equal(waiting.waitingMatches, 1);
  assert.equal(paused.waitingMatches, 0);
});

test("報到:未到場球員報到後進入等候名單", () => {
  let state = makeState({ courtCount: 1, players: [player("x", 6, { status: "notArrived" })] });
  state = { ...state, queue: [], notArrived: ["x"] };
  state = checkIn(state, "x");
  assert.deepEqual(state.queue, ["x"]);
  assert.equal(state.players[0].status, "queued");
});

test("applyAutoArrangePlan:分配後移出等候名單且無重複", () => {
  const players = Array.from({ length: 8 }, (_, i) => player(`p${i}`, 5 + (i % 5)));
  let state = makeState({ courtCount: 1, players });
  const plan = [{ courtId: "court1", playingIds: ["p0", "p1", "p2", "p3"], onDeckIds: ["p4", "p5"] }];
  state = applyAutoArrangePlan(state, plan);
  assert.deepEqual(state.courts[0].playingSlots, ["p0", "p1", "p2", "p3"]);
  assert.deepEqual(state.courts[0].onDeckSlots, ["p4", "p5", null, null]);
  assert.deepEqual(state.queue.sort(), ["p6", "p7"]);
  assert.equal(findDuplicatePlacements(state).length, 0);
});
