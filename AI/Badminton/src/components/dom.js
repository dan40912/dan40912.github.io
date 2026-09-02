// 極簡 DOM 建構工具。一律使用 textContent/屬性設定,不使用 innerHTML 帶入使用者資料,避免注入(PRD §10.4)。

export function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "value" && "value" in node) node.value = v;
    else if (k === "checked") node.checked = !!v;
    else if (k === "disabled") node.disabled = !!v;
    else if (v === true) node.setAttribute(k, "");
    else node.setAttribute(k, String(v));
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === "string" || typeof child === "number" ? document.createTextNode(String(child)) : child);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function mount(container, node) {
  clear(container);
  container.appendChild(node);
}
