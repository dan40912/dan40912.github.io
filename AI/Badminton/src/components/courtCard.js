import { h } from "./dom.js";
import { renderPlayerChip, renderEmptySlot } from "./playerChip.js";
import { computeBalanceStatus } from "../domain/scheduler.js";
import { renameCourt, endMatch, regenerateOnDeck, newOnCourtNames } from "../domain/transitions.js";
import { dispatch, getState, showToast, undo } from "../state.js";
import { speak, buildAnnouncement, isSpeechSupported } from "../services/speech.js";

export function renderCourtCard(state, court, selectedPlayerId) {
  const byId = new Map(state.players.map((p) => [p.id, p]));
  const teamA = court.playingSlots.slice(0, 2).filter(Boolean).map((id) => byId.get(id));
  const teamB = court.playingSlots.slice(2, 4).filter(Boolean).map((id) => byId.get(id));
  const balance = computeBalanceStatus(teamA, teamB);

  const nameInput = h("input", {
    class: "court-card__name",
    value: court.name,
    "aria-label": "場地名稱",
    onchange: (e) => {
      const v = e.target.value.trim();
      if (v) dispatch(renameCourt, court.id, v);
    },
  });

  const badge =
    balance.status === "incomplete"
      ? null
      : h("span", {
          class: `balance-badge${balance.status === "warn" ? " balance-badge--warn" : balance.status === "danger" ? " balance-badge--danger" : ""}`,
          text: `等級差 ${balance.sumDiff}`,
        });

  const canEnd = court.playingSlots.some(Boolean);

  const card = h("div", { class: "court-card", id: `court-card-${court.id}` }, [
    h("div", { class: "court-card__header" }, [nameInput, badge]),
    h("div", { class: "court-section__label", text: "場上區" }),
    h("div", { class: "playing-grid" }, [
      renderTeamGroup(byId, court, "a", [0, 1], selectedPlayerId),
      renderTeamGroup(byId, court, "b", [2, 3], selectedPlayerId),
    ]),
    h("div", { class: "court-section__label", text: "候場區" }),
    h(
      "div",
      { class: "ondeck-row" },
      court.onDeckSlots.map((id, i) => {
        const loc = { type: "court", courtId: court.id, area: "onDeck", slotIndex: i };
        return id
          ? renderPlayerChip(byId.get(id), loc, { selected: id === selectedPlayerId })
          : renderEmptySlot(loc);
      }),
    ),
    h("div", { class: "court-card__actions" }, [
      h("button", {
        class: "btn btn--primary",
        type: "button",
        text: "本場結束",
        disabled: !canEnd,
        onclick: () => handleEndMatch(court),
      }),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "重新安排候場",
        onclick: () => dispatch(regenerateOnDeck, court.id),
      }),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "語音重播",
        onclick: () => replayAnnouncement(court),
      }),
    ]),
  ]);
  return card;
}

function renderTeamGroup(byId, court, teamKey, indices, selectedPlayerId) {
  const children = indices.map((i) => {
    const id = court.playingSlots[i];
    const loc = { type: "court", courtId: court.id, area: "playing", slotIndex: i };
    return id
      ? renderPlayerChip(byId.get(id), loc, { selected: id === selectedPlayerId })
      : renderEmptySlot(loc);
  });
  return h("div", { class: `team-group team-group--${teamKey}` }, [
    h("div", { class: "team-group__label", text: teamKey === "a" ? "A 隊" : "B 隊" }),
    ...children,
  ]);
}

function handleEndMatch(court) {
  const filled = court.playingSlots.filter(Boolean).length;
  if (filled < 4) {
    const ok = window.confirm("場上不足 4 人，仍計為正式場次？");
    if (!ok) return;
  }
  const prevState = getState();
  dispatch(endMatch, court.id);
  const nextState = getState();
  const names = newOnCourtNames(prevState, nextState, court.id);
  if (names.length > 0 && nextState.event.speechEnabled) {
    speak(buildAnnouncement(court.name, names), {
      rate: nextState.event.speechRate,
      volume: nextState.event.speechVolume,
    });
  }
  showToast({
    message: "已結束本場",
    actionLabel: "復原本場結束",
    onAction: () => undo(),
    createdAt: Date.now(),
    durationMs: 10000,
  });
}

function replayAnnouncement(court) {
  const state = getState();
  const names = court.playingSlots.filter(Boolean).map((id) => state.players.find((p) => p.id === id).name);
  if (names.length === 0) return;
  if (!isSpeechSupported()) {
    showToast({ message: "此裝置不支援語音播放", createdAt: Date.now(), durationMs: 3000 });
    return;
  }
  speak(buildAnnouncement(court.name, names), { rate: state.event.speechRate, volume: state.event.speechVolume });
}
