import { h, mount } from "./dom.js";
import { parseRoster } from "../domain/parser.js";
import { buildInitialAppState, commit, setUiState, genId } from "../state.js";

let draft = createDraft();

function createDraft() {
  return {
    name: "",
    courtCount: 2,
    expectedPlayerCount: 8,
    defaultLevel: 6,
    speechEnabled: true,
    speechRate: "normal",
    speechVolume: 100,
    autoFillOnDeck: true,
    rosterText: "",
    entries: [],
  };
}

export function resetSetupDraft() {
  draft = createDraft();
}

const ROSTER_PLACEHOLDER = `1. 王小明 8
2、陳大華／11
03 李安
Amy, 6
Peter-9
Jay`;

export function renderSetupScreen(container) {
  const root = h("div", { class: "setup-screen" }, [
    h("h1", { class: "setup-screen__title", text: "建立活動" }),
    renderBasicFields(),
    renderRosterField(),
    draft.entries.length > 0 ? renderConfirmList() : null,
    renderActions(),
  ]);
  mount(container, root);
}

function rerender() {
  const container = document.querySelector("#app");
  renderSetupScreen(container);
}

function field(labelText, hintText, inputNode) {
  return h("div", { class: "field" }, [
    h("label", { class: "field__label", text: labelText }),
    inputNode,
    hintText ? h("div", { class: "field__hint", text: hintText }) : null,
  ]);
}

function renderBasicFields() {
  return h("div", {}, [
    field(
      "活動／場地名稱",
      null,
      h("input", {
        class: "field__input",
        type: "text",
        placeholder: "例如：週三民權球團",
        maxlength: 50,
        value: draft.name,
        oninput: (e) => {
          draft.name = e.target.value;
        },
      }),
    ),
    h("div", { class: "field__row" }, [
      field(
        "場地數量",
        "1–6 面，預設 2",
        h("input", {
          class: "field__input",
          type: "number",
          min: 1,
          max: 6,
          value: draft.courtCount,
          oninput: (e) => {
            draft.courtCount = clamp(parseInt(e.target.value, 10) || 1, 1, 6);
          },
        }),
      ),
      field(
        "預計球員總數",
        "僅提醒名單是否齊全，之後仍可增刪",
        h("input", {
          class: "field__input",
          type: "number",
          min: 4,
          max: 100,
          value: draft.expectedPlayerCount,
          oninput: (e) => {
            draft.expectedPlayerCount = clamp(parseInt(e.target.value, 10) || 4, 4, 100);
          },
        }),
      ),
      field(
        "預設等級",
        "1（最弱）–15（最強），預設 6",
        h("input", {
          class: "field__input",
          type: "number",
          min: 1,
          max: 15,
          value: draft.defaultLevel,
          oninput: (e) => {
            draft.defaultLevel = clamp(parseInt(e.target.value, 10) || 6, 1, 15);
          },
        }),
      ),
    ]),
    h("div", { class: "field__row" }, [
      field(
        "語音播報",
        null,
        h("select", { class: "field__input", onchange: (e) => (draft.speechEnabled = e.target.value === "on") }, [
          h("option", { value: "on", selected: draft.speechEnabled, text: "開啟" }),
          h("option", { value: "off", selected: !draft.speechEnabled, text: "關閉" }),
        ]),
      ),
      field(
        "語速",
        null,
        h(
          "select",
          { class: "field__input", onchange: (e) => (draft.speechRate = e.target.value) },
          [
            { v: "slow", t: "慢" },
            { v: "normal", t: "中" },
            { v: "fast", t: "快" },
          ].map((o) => h("option", { value: o.v, selected: draft.speechRate === o.v, text: o.t })),
        ),
      ),
      field(
        "自動排入候場區",
        null,
        h("select", { class: "field__input", onchange: (e) => (draft.autoFillOnDeck = e.target.value === "on") }, [
          h("option", { value: "on", selected: draft.autoFillOnDeck, text: "開啟" }),
          h("option", { value: "off", selected: !draft.autoFillOnDeck, text: "關閉" }),
        ]),
      ),
    ]),
  ]);
}

function renderRosterField() {
  return h("div", {}, [
    field(
      "球員名單",
      "支援混合格式，每行一位；行尾數字視為等級，未填則套用預設等級",
      h("textarea", {
        placeholder: ROSTER_PLACEHOLDER,
        value: draft.rosterText,
        oninput: (e) => {
          draft.rosterText = e.target.value;
        },
      }),
    ),
    h("button", {
      class: "btn btn--primary",
      type: "button",
      text: "解析名單",
      onclick: () => {
        const { entries } = parseRoster(draft.rosterText, draft.defaultLevel);
        draft.entries = entries.map((e) => ({ ...e, arrived: false }));
        rerender();
      },
    }),
  ]);
}

function renderConfirmList() {
  const counts = summarize(draft.entries);
  const diff = draft.expectedPlayerCount - draft.entries.length;
  const rows = draft.entries.map((entry, idx) => renderRosterRow(entry, idx));

  return h("div", {}, [
    h("div", { class: "roster-summary" }, [
      h("span", {}, [h("strong", { text: String(draft.entries.length) }), " 人已解析"]),
      counts.defaultLevel ? h("span", { text: `${counts.defaultLevel} 人套用預設等級` }) : null,
      counts.needsConfirm ? h("span", { text: `${counts.needsConfirm} 人需確認` }) : null,
      counts.duplicate ? h("span", { text: `${counts.duplicate} 人疑似重複` }) : null,
      diff !== 0 ? h("span", { text: `與預計人數差 ${Math.abs(diff)} 人` }) : null,
    ]),
    h("div", { class: "roster-list" }, rows),
    h("div", { class: "field__row" }, [
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "全部標記已到",
        onclick: () => {
          draft.entries.forEach((e) => (e.arrived = true));
          rerender();
        },
      }),
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        text: "新增球員",
        onclick: () => {
          draft.entries.push({
            id: genId("draft"),
            name: "",
            level: draft.defaultLevel,
            usedDefaultLevel: true,
            invalidLevelToken: null,
            needsConfirm: true,
            duplicate: false,
            error: true,
            arrived: false,
          });
          rerender();
        },
      }),
    ]),
  ]);
}

function renderRosterRow(entry, idx) {
  const flagged = entry.error || entry.needsConfirm || entry.duplicate;
  return h("div", { class: `roster-row${flagged ? " roster-row--flagged" : ""}` }, [
    h("span", { text: String(idx + 1) }),
    h("input", {
      class: "roster-row__name",
      type: "text",
      placeholder: "姓名",
      value: entry.name,
      "aria-label": "姓名",
      oninput: (e) => {
        entry.name = e.target.value;
        entry.error = entry.name.trim().length === 0;
      },
      onchange: () => rerender(),
    }),
    h("input", {
      class: "field__input roster-row__level",
      type: "number",
      min: 1,
      max: 15,
      value: entry.level,
      "aria-label": "等級",
      oninput: (e) => {
        entry.level = clamp(parseInt(e.target.value, 10) || 6, 1, 15);
        entry.usedDefaultLevel = false;
        entry.needsConfirm = entry.error;
      },
      onchange: () => rerender(),
    }),
    h("label", { class: "roster-row__tag" }, [
      h("input", {
        type: "checkbox",
        checked: entry.arrived,
        onchange: (e) => {
          entry.arrived = e.target.checked;
        },
      }),
      " 已抵達",
    ]),
    h("button", {
      class: "btn btn--icon btn--sm btn--danger",
      type: "button",
      "aria-label": "刪除",
      text: "×",
      onclick: () => {
        draft.entries.splice(idx, 1);
        rerender();
      },
    }),
  ]);
}

function renderActions() {
  const canCreate = draft.entries.length > 0 && draft.entries.every((e) => e.name.trim().length > 0) && draft.name.trim().length > 0;
  const underfilled = draft.entries.length < draft.courtCount * 4;

  return h("div", { class: "setup-actions" }, [
    h("button", {
      class: "btn btn--ghost",
      type: "button",
      text: "返回",
      onclick: () => setUiState({ screen: "start" }),
    }),
    h("div", {}, [
      underfilled && draft.entries.length > 0
        ? h("div", { class: "field__hint", text: "部分場地無法滿員" })
        : null,
      h("button", {
        class: "btn btn--primary",
        type: "button",
        text: "建立活動",
        disabled: !canCreate,
        onclick: () => {
          const eventSettings = {
            name: draft.name.trim(),
            courtCount: draft.courtCount,
            expectedPlayerCount: draft.expectedPlayerCount,
            defaultLevel: draft.defaultLevel,
            speechEnabled: draft.speechEnabled,
            speechRate: draft.speechRate,
            speechVolume: draft.speechVolume,
            autoFillOnDeck: draft.autoFillOnDeck,
          };
          const appState = buildInitialAppState(eventSettings, draft.entries);
          commit(appState, { record: false, immediate: true });
          resetSetupDraft();
          setUiState({ screen: "main" });
        },
      }),
    ]),
  ]);
}

function summarize(entries) {
  return {
    defaultLevel: entries.filter((e) => e.usedDefaultLevel && !e.error).length,
    needsConfirm: entries.filter((e) => e.needsConfirm).length,
    duplicate: entries.filter((e) => e.duplicate).length,
  };
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
