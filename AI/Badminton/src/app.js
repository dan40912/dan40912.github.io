import { h, clear } from "./components/dom.js";
import * as store from "./state.js";
import { renderSetupScreen } from "./components/setupScreen.js";
import { renderCourtCard } from "./components/courtCard.js";
import { renderQueuePanel } from "./components/queuePanel.js";
import { renderPausedPanel } from "./components/pausedPanel.js";
import { initDragManager } from "./components/dragManager.js";
import { planAutoArrange } from "./domain/scheduler.js";
import { applyAutoArrangePlan, isCourtEmpty, addPlayerMidEvent, toggleSpeech } from "./domain/transitions.js";
import { downloadStateAsJSON, readImportedFile } from "./services/export.js";
import { hasPersistedState } from "./services/storage.js";
import { testVoice, isSpeechSupported } from "./services/speech.js";

const appEl = document.getElementById("app");
const toastRoot = document.getElementById("toast-root");
let toastTimer = null;

function render() {
  const ui = store.getUiState();
  clear(appEl);
  if (ui.screen === "start") {
    appEl.appendChild(renderStartScreen());
  } else if (ui.screen === "setup") {
    renderSetupScreen(appEl);
  } else {
    appEl.appendChild(renderMainScreen(store.getState()));
  }
  renderToastOverlay();
}

// ---------- 啟動畫面 ----------

function renderStartScreen() {
  const hasSaved = hasPersistedState();
  return h("div", { class: "start-screen" }, [
    h("div", { class: "start-screen__title", text: "羽毛球排場工具" }),
    h("div", { class: "start-screen__subtitle", text: "現場排場、換人與計次" }),
    h("div", { class: "start-screen__actions" }, [
      hasSaved
        ? h("button", {
            class: "btn btn--primary",
            type: "button",
            text: "繼續上次活動",
            onclick: () => {
              const s = store.loadPersisted();
              if (s) store.setUiState({ screen: "main" });
            },
          })
        : null,
      h("button", {
        class: "btn btn--ghost",
        type: "button",
        text: "建立新活動",
        onclick: () => store.setUiState({ screen: "setup" }),
      }),
      hasSaved
        ? h("button", {
            class: "btn btn--danger btn--sm",
            type: "button",
            text: "清除本機資料",
            onclick: () => {
              const ok = window.confirm("清除本機資料？此動作無法復原，所有球員與場次紀錄都會消失。");
              if (!ok) return;
              store.resetAll();
              store.setUiState({ screen: "setup" });
            },
          })
        : null,
    ]),
  ]);
}

// ---------- 主排場畫面 ----------

function renderMainScreen(appState) {
  const ui = store.getUiState();
  const selectedPlayerId = ui.selectedChip ? ui.selectedChip.playerId : null;

  const topbar = renderTopbar(appState);
  const courtSwitcher = renderCourtSwitcher(appState, ui);
  const courtsGrid = h(
    "div",
    { class: "courts-grid" },
    appState.courts.map((c) => renderCourtCard(appState, c, selectedPlayerId)),
  );
  const sidePanels = h("div", { class: "side-panels" }, [
    renderQueuePanel(appState, selectedPlayerId),
    renderPausedPanel(appState, selectedPlayerId),
  ]);
  const mainContent = h("div", { class: "main-content" }, [courtsGrid, sidePanels]);

  return h("div", { class: "main-screen" }, [topbar, courtSwitcher, mainContent]);
}

function renderTopbar(appState) {
  const totalPlaying = appState.courts.reduce((n, c) => n + c.playingSlots.filter(Boolean).length, 0);
  const totalOnDeck = appState.courts.reduce((n, c) => n + c.onDeckSlots.filter(Boolean).length, 0);

  return h("div", { class: "topbar" }, [
    h("div", { class: "topbar__title", text: appState.event.name }),
    h("div", { class: "topbar__stats" }, [
      h("span", {}, [h("b", { text: String(appState.courts.length) }), " 面場"]),
      h("span", {}, [h("b", { text: String(totalPlaying) }), " 上場"]),
      h("span", {}, [h("b", { text: String(totalOnDeck) }), " 候場"]),
      h("span", {}, [h("b", { text: String(appState.queue.length) }), " 等候"]),
      h("span", {}, [h("b", { text: String(appState.paused.length) }), " 暫停"]),
    ]),
    h("div", { class: "topbar__actions" }, [
      h("button", {
        class: "btn btn--icon btn--ghost",
        type: "button",
        "aria-label": appState.event.speechEnabled ? "關閉語音" : "開啟語音",
        text: appState.event.speechEnabled ? "🔊" : "🔇",
        onclick: () => store.dispatch(toggleSpeech),
      }),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "復原",
        disabled: !store.canUndo(),
        onclick: () => store.undo(),
      }),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "自動安排首場",
        onclick: handleAutoArrange,
      }),
      h("button", { class: "btn btn--ghost btn--sm", type: "button", text: "新增球員", onclick: handleAddPlayer }),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "測試語音",
        disabled: !isSpeechSupported(),
        onclick: () => testVoice(),
      }),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "匯出",
        onclick: () => downloadStateAsJSON(appState),
      }),
      renderImportButton(),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "離開活動",
        onclick: () => store.setUiState({ screen: "start" }),
      }),
      h("button", {
        class: "btn btn--danger btn--sm",
        type: "button",
        text: "結束活動",
        onclick: handleEndEvent,
      }),
    ]),
  ]);
}

// 對局已結束時的逃出方式:清除本機資料,直接回到建立新活動的畫面。
function handleEndEvent() {
  const ok = window.confirm("結束活動並清除本機資料？此動作無法復原，所有球員與場次紀錄都會消失。");
  if (!ok) return;
  store.resetAll();
  store.setUiState({ screen: "setup" });
}

function renderCourtSwitcher(appState, ui) {
  const activeId = ui.activeCourtId || appState.courts[0]?.id;
  return h(
    "div",
    { class: "court-switcher" },
    appState.courts.map((c) =>
      h("button", {
        class: `court-switcher__btn${activeId === c.id ? " court-switcher__btn--active" : ""}`,
        type: "button",
        text: c.name,
        onclick: () => {
          store.setActiveCourt(c.id);
          document.getElementById(`court-card-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      }),
    ),
  );
}

function renderImportButton() {
  const input = h("input", {
    type: "file",
    accept: "application/json",
    style: "display:none;",
    onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const result = await readImportedFile(file);
      if (!result.valid) {
        store.showToast({ message: `匯入失敗：${result.errors[0]}`, createdAt: Date.now(), durationMs: 4000 });
        e.target.value = "";
        return;
      }
      const ok = window.confirm("匯入將覆蓋目前活動資料，確定繼續？");
      if (ok) {
        store.commit(result.data, { record: false, immediate: true });
        store.setUiState({ screen: "main" });
      }
      e.target.value = "";
    },
  });
  const btn = h("button", {
    class: "btn btn--ghost btn--sm",
    type: "button",
    text: "匯入",
    onclick: () => input.click(),
  });
  return h("span", {}, [btn, input]);
}

function handleAutoArrange() {
  const appState = store.getState();
  const emptyCourtIds = appState.courts.filter(isCourtEmpty).map((c) => c.id);
  if (emptyCourtIds.length === 0) {
    store.showToast({ message: "沒有空場地可自動安排", createdAt: Date.now(), durationMs: 3000 });
    return;
  }
  const plan = planAutoArrange(appState, emptyCourtIds, { justFinishedIds: new Set(), recentCourtMap: new Map() });
  store.dispatch(applyAutoArrangePlan, plan);
}

function handleAddPlayer() {
  const name = window.prompt("新球員姓名？");
  if (!name || !name.trim()) return;
  const defaultLevel = store.getState().event.defaultLevel;
  const levelStr = window.prompt("等級（1–15）？", String(defaultLevel));
  const level = Math.min(15, Math.max(1, parseInt(levelStr, 10) || defaultLevel));
  store.dispatch(addPlayerMidEvent, { name: name.trim(), level });
}

// ---------- Toast ----------

function renderToastOverlay() {
  clear(toastRoot);
  clearTimeout(toastTimer);
  const ui = store.getUiState();
  if (!ui.toast) return;
  const { message, actionLabel, onAction, createdAt, durationMs } = ui.toast;
  const remaining = durationMs - (Date.now() - createdAt);
  if (remaining <= 0) {
    store.dismissToast();
    return;
  }
  const toastEl = h("div", { class: "toast", role: "status" }, [
    h("span", { text: message }),
    actionLabel
      ? h("button", {
          class: "btn btn--sm",
          type: "button",
          text: actionLabel,
          onclick: () => {
            onAction && onAction();
            store.dismissToast();
          },
        })
      : null,
  ]);
  toastRoot.appendChild(toastEl);
  toastTimer = setTimeout(() => store.dismissToast(), remaining);
}

// ---------- 啟動 ----------

initDragManager();
store.setUiState({ screen: hasPersistedState() ? "start" : "setup" });
store.subscribe(render);
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
