import { h } from "./dom.js";
import { renderPlayerChip } from "./playerChip.js";
import { resumePlayer, checkIn } from "../domain/transitions.js";
import { dispatch } from "../state.js";
import { locationDataset } from "./location.js";

export function renderPausedPanel(state, selectedPlayerId) {
  const byId = new Map(state.players.map((p) => [p.id, p]));

  return h("div", {}, [
    renderList({
      title: "暫停名單",
      ids: state.paused,
      byId,
      locType: "paused",
      actionLabel: "恢復",
      onAction: (id) => dispatch(resumePlayer, id),
      selectedPlayerId,
    }),
    renderList({
      title: "未到名單",
      ids: state.notArrived,
      byId,
      locType: "notArrived",
      actionLabel: "報到",
      onAction: (id) => dispatch(checkIn, id),
      selectedPlayerId,
    }),
  ]);
}

function renderList({ title, ids, byId, locType, actionLabel, onAction, selectedPlayerId }) {
  const rows = ids.map((id, index) => {
    const player = byId.get(id);
    const chip = renderPlayerChip(player, { type: locType, index }, { variant: locType, selected: id === selectedPlayerId });
    const row = h("div", { style: "display:flex;align-items:center;gap:8px;" }, [
      h("div", { style: "flex:1;" }, [chip]),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: actionLabel,
        onclick: () => onAction(id),
      }),
    ]);
    return row;
  });

  // 只在名單是空的時候,把提示文字本身變成可點選/拖放的目標;非空時直接以個別球員卡為目標,
  // 避免把 .slot 加到會捲動的容器上而擋掉觸控捲動(touch-action:none)。
  let emptyHint = null;
  if (rows.length === 0) {
    emptyHint = h("div", { class: "field__hint slot", text: `${title}目前是空的，可點選或拖曳球員移入` });
    Object.assign(emptyHint.dataset, locationDataset({ type: locType }));
  }
  const listEl = h("div", { class: "panel__list" }, rows.length > 0 ? rows : [emptyHint]);

  return h("details", { class: "panel" }, [
    h("summary", {}, [title, h("span", { class: "panel__count", text: `${ids.length} 人` })]),
    listEl,
  ]);
}
