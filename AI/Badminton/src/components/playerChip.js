import { h } from "./dom.js";
import { locationDataset } from "./location.js";

export function levelColor(level) {
  const t = (level - 1) / 14;
  const hue = 210 - t * 210; // 弱(藍 210°) -> 強(紅 0°)
  return `hsl(${hue}, 62%, 46%)`;
}

export function renderPlayerChip(player, loc, opts = {}) {
  const chip = h(
    "div",
    {
      class: `player-chip slot player-chip--${opts.variant || player.status}${opts.selected ? " player-chip--selected" : ""}`,
      tabindex: "0",
      role: "button",
      "aria-label": `${player.name}，等級 ${player.level}，已打 ${player.playCount} 場`,
    },
    [
      h("div", { class: "player-chip__top" }, [
        h("span", { class: "level-dot", style: `background:${levelColor(player.level)}` }),
        h("span", { class: "player-chip__name", text: player.name }),
      ]),
      h("span", { class: "player-chip__meta", text: `Lv.${player.level} · 第 ${player.playCount} 場` }),
    ],
  );
  Object.assign(chip.dataset, locationDataset(loc), { playerId: player.id });
  return chip;
}

export function renderEmptySlot(loc, label = "等待球員") {
  const el = h("div", { class: "empty-slot slot", text: label });
  Object.assign(el.dataset, locationDataset(loc));
  return el;
}
