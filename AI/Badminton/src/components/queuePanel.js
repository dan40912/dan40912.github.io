import { h, clear } from "./dom.js";
import { renderPlayerChip } from "./playerChip.js";
import { locationDataset } from "./location.js";

let searchQuery = "";
let sortMode = "fairness"; // 'fairness' | 'name' | 'level' | 'playCount'

export function renderQueuePanel(state, selectedPlayerId) {
  const byId = new Map(state.players.map((p) => [p.id, p]));
  const listContainer = h("div", { class: "panel__list" });

  function updateList() {
    let rows = state.queue.map((id, index) => ({ player: byId.get(id), index }));
    const q = searchQuery.trim().toLowerCase();
    if (q) rows = rows.filter(({ player }) => player.name.toLowerCase().includes(q));
    if (sortMode === "name") rows.sort((a, b) => a.player.name.localeCompare(b.player.name, "zh-Hant"));
    else if (sortMode === "level") rows.sort((a, b) => b.player.level - a.player.level);
    else if (sortMode === "playCount") rows.sort((a, b) => a.player.playCount - b.player.playCount);

    clear(listContainer);
    if (rows.length === 0) {
      // 空清單時把提示文字變成可點選/拖放目標,讓球員能被移入(例如報到/恢復後第一位進入等候名單)。
      const emptyHint = h("div", { class: "field__hint slot", text: "等候名單目前沒有球員" });
      Object.assign(emptyHint.dataset, locationDataset({ type: "queue" }));
      listContainer.appendChild(emptyHint);
      return;
    }
    for (const { player, index } of rows) {
      listContainer.appendChild(
        renderPlayerChip(player, { type: "queue", index }, { variant: "queued", selected: player.id === selectedPlayerId }),
      );
    }
  }

  const searchInput = h("input", {
    type: "search",
    placeholder: "搜尋姓名",
    value: searchQuery,
    "aria-label": "搜尋等候名單",
    oninput: (e) => {
      searchQuery = e.target.value;
      updateList();
    },
  });

  const sortSelect = h(
    "select",
    {
      "aria-label": "排序方式",
      onchange: (e) => {
        sortMode = e.target.value;
        updateList();
      },
    },
    [
      h("option", { value: "fairness", selected: sortMode === "fairness", text: "候場順序" }),
      h("option", { value: "name", selected: sortMode === "name", text: "姓名" }),
      h("option", { value: "level", selected: sortMode === "level", text: "等級" }),
      h("option", { value: "playCount", selected: sortMode === "playCount", text: "出賽次數" }),
    ],
  );

  updateList();

  return h("details", { class: "panel", open: true }, [
    h("summary", {}, ["等候名單", h("span", { class: "panel__count", text: `${state.queue.length} 人` })]),
    h("div", { class: "panel__toolbar" }, [searchInput, sortSelect]),
    listContainer,
  ]);
}
