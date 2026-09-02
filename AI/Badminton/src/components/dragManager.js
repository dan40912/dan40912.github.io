// 拖放與點選交換的統一輸入層(PRD §6.5)。用 Pointer Events,不依賴原生 HTML5 DnD,
// 以事件代理綁在 #app 上,避免每次重繪都要重新綁定。

import { swapByLocation } from "../domain/transitions.js";
import { dispatch, getUiState, setUiState } from "../state.js";
import { parseLocationFromElement } from "./location.js";

const DRAG_THRESHOLD = 8;
let initialized = false;
let drag = null; // { pointerId, sourceEl, sourceLoc, playerId, startX, startY, dragging, ghost, lastTarget }

export function initDragManager() {
  if (initialized) return;
  initialized = true;
  const root = document.getElementById("app");
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("keydown", onKeyDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);
}

function onPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  const el = e.target.closest(".slot");
  if (!el) return;
  const loc = parseLocationFromElement(el);
  if (!loc) return;
  const playerId = el.dataset.playerId || null;
  drag = {
    pointerId: e.pointerId,
    sourceEl: el,
    sourceLoc: loc,
    playerId,
    startX: e.clientX,
    startY: e.clientY,
    dragging: false,
    ghost: null,
    lastTarget: null,
  };
}

function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;

  if (!drag.dragging) {
    if (!drag.playerId) return; // 空位不能拖曳
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    startDragging(e);
  }

  if (drag.ghost) {
    drag.ghost.style.left = `${e.clientX}px`;
    drag.ghost.style.top = `${e.clientY}px`;
  }

  updateDropTarget(e);
}

function startDragging(e) {
  drag.dragging = true;
  drag.sourceEl.classList.add("player-chip--dragging");
  const rect = drag.sourceEl.getBoundingClientRect();
  const ghost = drag.sourceEl.cloneNode(true);
  ghost.style.position = "fixed";
  ghost.style.left = `${e.clientX}px`;
  ghost.style.top = `${e.clientY}px`;
  ghost.style.width = `${rect.width}px`;
  ghost.style.transform = "translate(-50%, -50%) rotate(-2deg)";
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "999";
  ghost.style.opacity = "0.9";
  ghost.classList.add("shadow-lift");
  document.body.appendChild(ghost);
  drag.ghost = ghost;
}

function updateDropTarget(e) {
  if (drag.ghost) drag.ghost.style.display = "none";
  const under = document.elementFromPoint(e.clientX, e.clientY);
  if (drag.ghost) drag.ghost.style.display = "";
  const targetEl = under ? under.closest(".slot") : null;

  if (drag.lastTarget && drag.lastTarget !== targetEl) {
    drag.lastTarget.classList.remove("slot--drop-target", "slot--drop-invalid");
  }
  if (targetEl && targetEl !== drag.sourceEl) {
    const valid = isValidDrop(drag.sourceLoc, parseLocationFromElement(targetEl));
    targetEl.classList.toggle("slot--drop-target", valid);
    targetEl.classList.toggle("slot--drop-invalid", !valid);
    drag.lastTarget = targetEl;
  } else {
    drag.lastTarget = null;
  }
}

function isValidDrop(sourceLoc, targetLoc) {
  if (!targetLoc) return false;
  if (sourceLoc.type === "court" && targetLoc.type === "court") {
    return !(sourceLoc.courtId === targetLoc.courtId && sourceLoc.area === targetLoc.area && sourceLoc.slotIndex === targetLoc.slotIndex);
  }
  if (sourceLoc.type !== "court" && targetLoc.type !== "court") {
    return !(sourceLoc.type === targetLoc.type && sourceLoc.index === targetLoc.index);
  }
  return true;
}

function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const wasDragging = drag.dragging;

  if (wasDragging) {
    if (drag.ghost) drag.ghost.style.display = "none";
    const under = document.elementFromPoint(e.clientX, e.clientY);
    if (drag.ghost) drag.ghost.remove();
    const targetEl = under ? under.closest(".slot") : null;
    drag.sourceEl.classList.remove("player-chip--dragging");
    if (drag.lastTarget) drag.lastTarget.classList.remove("slot--drop-target", "slot--drop-invalid");

    if (targetEl && targetEl !== drag.sourceEl) {
      const targetLoc = parseLocationFromElement(targetEl);
      if (isValidDrop(drag.sourceLoc, targetLoc)) {
        dispatch(swapByLocation, drag.sourceLoc, targetLoc);
      }
    }
    setUiState({ selectedChip: null });
  } else {
    handleActivate(drag.sourceLoc, drag.playerId);
  }
  drag = null;
}

function onPointerCancel(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  if (drag.ghost) drag.ghost.remove();
  if (drag.sourceEl) drag.sourceEl.classList.remove("player-chip--dragging");
  if (drag.lastTarget) drag.lastTarget.classList.remove("slot--drop-target", "slot--drop-invalid");
  drag = null;
}

function onKeyDown(e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = e.target.closest(".slot");
  if (!el) return;
  e.preventDefault();
  const loc = parseLocationFromElement(el);
  if (!loc) return;
  handleActivate(loc, el.dataset.playerId || null);
}

// 點選來源 → 點選目標(行動裝置拖放不穩時的等價操作,PRD §6.5)。
function handleActivate(loc, playerId) {
  const ui = getUiState();
  if (ui.selectedChip) {
    if (playerId && ui.selectedChip.playerId === playerId) {
      setUiState({ selectedChip: null });
      return;
    }
    if (isValidDrop(ui.selectedChip.loc, loc)) {
      dispatch(swapByLocation, ui.selectedChip.loc, loc);
    }
    setUiState({ selectedChip: null });
    return;
  }
  if (!playerId) return;
  setUiState({ selectedChip: { loc, playerId } });
}
