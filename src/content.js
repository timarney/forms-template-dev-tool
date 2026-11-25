(() => {
  const hostId = "gc-forms-storage-inspector";
  if (document.getElementById(hostId)) return;

  const host = document.createElement("div");
  host.id = hostId;
  Object.assign(host.style, {
    position: "fixed",
    zIndex: "2147483647",
    right: "20px",
    bottom: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  });
  document.documentElement.append(host);

  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      button, select, input { font: inherit; }
      button { cursor: pointer; }
      .toggle { border: 1px solid #557177; border-radius: 999px; background: #163b40;
        color: #f4ffff; padding: 9px 13px; font-size: 13px; font-weight: 650;
        box-shadow: 0 3px 14px #0005; }
      .toggle:hover { background: #205057; }
      .panel { position: fixed; right: 20px; bottom: 64px; width: min(680px, calc(100vw - 32px));
        height: min(74vh, 680px); min-height: 280px; display: flex; flex-direction: column;
        overflow: hidden; color: #e8eeee; background: #172326; border: 1px solid #597074;
        border-radius: 10px; box-shadow: 0 12px 40px #0008; }
      .panel[hidden] { display: none; }
      .header { display: flex; align-items: center; gap: 8px; padding: 10px 12px;
        background: #203438; border-bottom: 1px solid #425a5e; }
      .title { margin-right: auto; font-size: 13px; font-weight: 700; white-space: nowrap; }
      .header select { min-width: 105px; max-width: 145px; padding: 6px 8px; border-radius: 5px;
        color: #effafa; background: #10272a; border: 1px solid #547075; }
      .header button, .pin-action { padding: 6px 9px; border: 1px solid #547075;
        border-radius: 5px; color: #effafa; background: #29474b; font-size: 12px; }
      .header button:hover, .pin-action:hover { background: #376168; }
      .tabs { display: flex; align-items: center; gap: 4px; padding: 7px 10px;
        background: #1b2c2f; border-bottom: 1px solid #344a4e; }
      .tab { padding: 6px 10px; border: 0; border-radius: 5px; color: #b9cccc;
        background: transparent; font-size: 12px; }
      .tab[aria-selected="true"] { color: #effafa; background: #315156; }
      .count { margin-left: 4px; color: #b9e8e8; }
      .search-wrap { flex: 1; position: relative; margin-left: 8px; }
      .search { width: 100%; padding: 7px 10px; border: 1px solid #547075; border-radius: 6px;
        outline: none; color: #effafa; background: #10272a; font-size: 12px; }
      .search:focus { border-color: #7dd5d8; box-shadow: 0 0 0 2px #7dd5d833; }
      .search::placeholder { color: #9bb0b2; }
      .status { padding: 6px 12px; min-height: 28px; color: #b9cccc; font-size: 11px;
        border-bottom: 1px solid #344a4e; }
      .view { flex: 1; min-height: 0; overflow: auto; }
      .tree { padding: 8px 10px 14px; font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .node { min-width: 0; }
      .node-row { display: flex; align-items: flex-start; gap: 5px; min-height: 23px; padding: 1px 3px;
        border-radius: 4px; }
      .node-row:hover { background: #ffffff0d; }
      .node-content { min-width: 0; overflow-wrap: anywhere; white-space: pre-wrap; }
      .node-key { color: #88b6ff; }
      .node-value { color: #e3eeee; }
      .node-type { color: #a9babb; }
      .twisty, .pin { flex: 0 0 20px; width: 20px; height: 20px; padding: 0; border: 0;
        color: #a9c0c2; background: transparent; font-size: 12px; }
      .pin { color: #a9c0c2; font-size: 15px; }
      .pin[aria-pressed="true"] { color: #ffd36b; }
      .node-children { margin-left: 18px; border-left: 1px solid #344a4e; padding-left: 5px; }
      .empty { padding: 14px; color: #c2d0d1; font: 12px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .pinned-list { display: grid; gap: 8px; padding: 10px; }
      .pinned-card { overflow: hidden; border: 1px solid #3d585d; border-radius: 7px; background: #1c2d30; }
      .pinned-head { display: flex; align-items: center; gap: 8px; padding: 7px 9px;
        border-bottom: 1px solid #344a4e; }
      .pinned-path { min-width: 0; margin-right: auto; overflow: hidden; color: #a9cbff;
        text-overflow: ellipsis; white-space: nowrap; font: 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .pinned-value { max-height: 180px; overflow: auto; margin: 0; padding: 9px;
        color: #e3eeee; white-space: pre-wrap; overflow-wrap: anywhere;
        font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      .missing { color: #f1bb8a; }
      @media (max-width: 560px) {
        .panel { right: 8px; bottom: 58px; width: calc(100vw - 16px); height: 68vh; }
        .header { gap: 5px; padding: 8px; }
        .title { font-size: 12px; }
        .header select { min-width: 74px; max-width: 100px; font-size: 11px; }
        .header button { padding: 6px; font-size: 11px; }
        .tabs { padding: 6px; }
        .tab { padding: 6px; }
      }
    </style>
    <button class="toggle" type="button" aria-expanded="false">Form data</button>
    <section class="panel" aria-label="Form storage inspector" hidden>
      <div class="header">
        <span class="title">Storage inspector</span>
        <select class="source" aria-label="Storage type">
          <option value="sessionStorage">Session</option>
          <option value="localStorage">Local</option>
        </select>
        <select class="key" aria-label="Storage key"></select>
        <button class="refresh" type="button">Refresh</button>
        <button class="close" type="button" aria-label="Hide inspector">Hide</button>
      </div>
      <div class="tabs" role="tablist" aria-label="Inspector views">
        <button class="tab json-tab" type="button" role="tab" aria-selected="true">JSON</button>
        <button class="tab pinned-tab" type="button" role="tab" aria-selected="false">Pinned<span class="count"></span></button>
        <label class="search-wrap"><input class="search" type="search" placeholder="Search keys and values…" aria-label="Search JSON"></label>
      </div>
      <div class="status" role="status"></div>
      <div class="view"></div>
    </section>
  `;

  const toggle = root.querySelector(".toggle");
  const panel = root.querySelector(".panel");
  const sourceSelect = root.querySelector(".source");
  const keySelect = root.querySelector(".key");
  const view = root.querySelector(".view");
  const status = root.querySelector(".status");
  const searchInput = root.querySelector(".search");
  const jsonTab = root.querySelector(".json-tab");
  const pinnedTab = root.querySelector(".pinned-tab");
  const searchWrap = root.querySelector(".search-wrap");
  const pinCount = root.querySelector(".count");
  let activeTab = "json";
  let currentValue;
  let currentRaw = "";
  let currentPathValues = new Map();
  let pinnedPaths = new Set();
  let collapsedPaths = new Set();
  let expandedPaths = new Set();
  let refreshTimer;
  let pinRequest = 0;
  const memoryPins = new Map();

  function extensionStorageKey() {
    return `gc-forms-inspector:${location.origin}:${sourceSelect.value}:${keySelect.value}`;
  }

  function storageFor(source) {
    try { return window[source]; } catch (error) { return null; }
  }

  function currentKeys() {
    const storage = storageFor(sourceSelect.value);
    if (!storage) return [];
    try {
      return Array.from({ length: storage.length }, (_, index) => storage.key(index))
        .filter((key) => key !== null)
        .sort((a, b) => a.localeCompare(b));
    } catch (error) { return []; }
  }

  function updateKeys() {
    const keys = currentKeys();
    const preferredKey = keySelect.value || "form-storage";
    keySelect.replaceChildren();
    if (keys.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No keys";
      keySelect.append(option);
      return;
    }
    for (const key of keys) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      keySelect.append(option);
    }
    keySelect.value = keys.includes(preferredKey)
      ? preferredKey
      : keys.includes("form-storage") ? "form-storage" : keys[0];
  }

  async function loadPins() {
    const request = ++pinRequest;
    const storageKey = extensionStorageKey();
    try {
      if (!globalThis.chrome?.storage?.local) throw new Error("Extension storage unavailable");
      const result = await new Promise((resolve) => chrome.storage.local.get(storageKey, resolve));
      if (request !== pinRequest) return;
      pinnedPaths = new Set(result[storageKey] || []);
    } catch (error) {
      pinnedPaths = new Set(memoryPins.get(storageKey) || []);
    }
    render();
  }

  async function savePins() {
    const storageKey = extensionStorageKey();
    const paths = [...pinnedPaths];
    memoryPins.set(storageKey, paths);
    try {
      if (globalThis.chrome?.storage?.local) {
        await new Promise((resolve) => chrome.storage.local.set({ [storageKey]: paths }, resolve));
      }
    } catch (error) { /* Keep the current-session pins available in memory. */ }
  }

  function appendPinButton(row, path) {
    const button = document.createElement("button");
    const isPinned = pinnedPaths.has(path);
    button.className = "pin";
    button.type = "button";
    button.textContent = isPinned ? "★" : "☆";
    button.title = isPinned ? "Unpin element" : "Pin element";
    button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-pressed", String(isPinned));
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (pinnedPaths.has(path)) pinnedPaths.delete(path);
      else pinnedPaths.add(path);
      await savePins();
      render();
    });
    row.append(button);
  }

  function childPath(parent, key, isArray) {
    if (isArray) return `${parent}[${key}]`;
    return /^[A-Za-z_$][\w$]*$/.test(key)
      ? `${parent}.${key}`
      : `${parent}[${JSON.stringify(key)}]`;
  }

  function valueLabel(value) {
    if (value === null) return "null";
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "object") return Array.isArray(value) ? `[${value.length}]` : "{…}";
    return String(value);
  }

  function matchesSubtree(value, label, query) {
    if (!query) return true;
    if (String(label).toLowerCase().includes(query)) return true;
    if (value === null || typeof value !== "object") {
      return String(value).toLowerCase().includes(query) || JSON.stringify(value).toLowerCase().includes(query);
    }
    const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item]) : Object.entries(value);
    return entries.some(([key, item]) => matchesSubtree(item, key, query));
  }

  function makeNode(value, label, path, query, depth = 0, pinnedRoot = false) {
    const isObject = value !== null && typeof value === "object";
    if (!matchesSubtree(value, label, query)) return null;
    currentPathValues.set(path, value);

    const node = document.createElement("div");
    node.className = "node";
    node.dataset.path = path;
    const row = document.createElement("div");
    row.className = "node-row";
    row.style.paddingLeft = `${depth * 12}px`;

    if (isObject) {
      const twisty = document.createElement("button");
      const expanded = pinnedRoot
        ? !collapsedPaths.has(path)
        : query ? !collapsedPaths.has(path) : expandedPaths.has(path);
      twisty.className = "twisty";
      twisty.type = "button";
      twisty.textContent = expanded ? "▾" : "▸";
      twisty.setAttribute("aria-label", expanded ? "Collapse element" : "Expand element");
      twisty.addEventListener("click", () => {
        if (query) {
          if (collapsedPaths.has(path)) collapsedPaths.delete(path);
          else collapsedPaths.add(path);
        } else if (expanded) {
          expandedPaths.delete(path);
          collapsedPaths.add(path);
        } else {
          expandedPaths.add(path);
          collapsedPaths.delete(path);
        }
        render();
      });
      row.append(twisty);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "twisty";
      row.append(spacer);
    }

    const content = document.createElement("span");
    content.className = "node-content";
    const key = document.createElement("span");
    key.className = "node-key";
    key.textContent = `${label}: `;
    content.append(key);
    const val = document.createElement("span");
    val.className = isObject ? "node-type" : "node-value";
    val.textContent = valueLabel(value);
    content.append(val);
    row.append(content);
    appendPinButton(row, path);
    node.append(row);

    const expanded = pinnedRoot
      ? !collapsedPaths.has(path)
      : query ? !collapsedPaths.has(path) : expandedPaths.has(path);
    if (isObject && expanded) {
      const children = document.createElement("div");
      children.className = "node-children";
      const isArray = Array.isArray(value);
      const entries = isArray ? value.map((item, index) => [String(index), item]) : Object.entries(value);
      for (const [childKey, childValue] of entries) {
        const child = makeNode(childValue, childKey, childPath(path, childKey, isArray), query, depth + 1);
        if (child) children.append(child);
      }
      node.append(children);
    }
    return node;
  }

  function renderTree() {
    view.replaceChildren();
    if (currentValue === undefined) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = currentRaw ? "This storage value is not valid JSON. Switch to Pinned to view saved paths." : "No storage entry selected.";
      view.append(empty);
      return;
    }
    const tree = document.createElement("div");
    tree.className = "tree";
    const query = searchInput.value.trim().toLowerCase();
    const isArray = Array.isArray(currentValue);
    const entries = currentValue !== null && typeof currentValue === "object"
      ? (isArray ? currentValue.map((item, index) => [String(index), item]) : Object.entries(currentValue))
      : [["value", currentValue]];
    for (const [key, value] of entries) {
      const path = childPath("$", key, isArray);
      const node = makeNode(value, key, path, query);
      if (node) tree.append(node);
    }
    if (!tree.childElementCount) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No matching keys or values.";
      view.append(empty);
    } else view.append(tree);
  }

  function renderPinned() {
    view.replaceChildren();
    const paths = [...pinnedPaths].sort((a, b) => a.localeCompare(b));
    pinCount.textContent = paths.length ? ` ${paths.length}` : "";
    if (!paths.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No pinned elements yet. In the JSON tab, select the star beside an element to pin it here.";
      view.append(empty);
      return;
    }
    const list = document.createElement("div");
    list.className = "pinned-list";
    for (const path of paths) {
      const card = document.createElement("section");
      card.className = "pinned-card";
      const head = document.createElement("div");
      head.className = "pinned-head";
      const pathLabel = document.createElement("code");
      pathLabel.className = "pinned-path";
      pathLabel.textContent = path;
      pathLabel.title = path;
      head.append(pathLabel);
      const showButton = document.createElement("button");
      showButton.className = "pin-action";
      showButton.type = "button";
      showButton.textContent = "Show";
      showButton.addEventListener("click", () => showPinnedPath(path));
      head.append(showButton);
      const unpinButton = document.createElement("button");
      unpinButton.className = "pin-action";
      unpinButton.type = "button";
      unpinButton.textContent = "Unpin";
      unpinButton.addEventListener("click", async () => {
        pinnedPaths.delete(path);
        await savePins();
        render();
      });
      head.append(unpinButton);
      card.append(head);
      const pinnedTree = document.createElement("div");
      pinnedTree.className = "tree";
      if (currentPathValues.has(path)) {
        const pinnedNode = makeNode(currentPathValues.get(path), "value", path, "", 0, true);
        if (pinnedNode) pinnedTree.append(pinnedNode);
      } else {
        const missing = document.createElement("div");
        missing.className = "empty missing";
        missing.textContent = "Not present in the currently selected JSON value.";
        pinnedTree.append(missing);
      }
      card.append(pinnedTree);
      list.append(card);
    }
    view.append(list);
  }

  function indexPaths(value, path) {
    currentPathValues.set(path, value);
    if (value === null || typeof value !== "object") return;
    const isArray = Array.isArray(value);
    const entries = isArray ? value.map((item, index) => [String(index), item]) : Object.entries(value);
    for (const [key, childValue] of entries) {
      indexPaths(childValue, childPath(path, key, isArray));
    }
  }

  function render() {
    jsonTab.setAttribute("aria-selected", String(activeTab === "json"));
    pinnedTab.setAttribute("aria-selected", String(activeTab === "pinned"));
    searchWrap.hidden = activeTab !== "json";
    pinCount.textContent = pinnedPaths.size ? ` ${pinnedPaths.size}` : "";
    if (activeTab === "json") renderTree();
    else renderPinned();
  }

  function showPinnedPath(path) {
    activeTab = "json";
    searchInput.value = "";
    const parts = path.match(/(?:^\$)|(?:\.([A-Za-z_$][\w$]*))|(?:\[(?:\d+|"(?:\\.|[^"])*")\])/g) || [];
    let currentPath = "$";
    collapsedPaths.delete(currentPath);
    expandedPaths.add(currentPath);
    for (const part of parts.slice(1, -1)) {
      currentPath += part;
      collapsedPaths.delete(currentPath);
      expandedPaths.add(currentPath);
    }
    render();
    requestAnimationFrame(() => {
      const node = [...root.querySelectorAll(".node")].find((item) => item.dataset.path === path);
      node?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  function refresh() {
    updateKeys();
    currentPathValues = new Map();
    const storage = storageFor(sourceSelect.value);
    const key = keySelect.value;
    if (!storage || !key) {
      currentValue = undefined;
      currentRaw = "";
      status.textContent = `${sourceSelect.value} · 0 keys`;
      render();
      return;
    }
    try {
      currentRaw = storage.getItem(key) ?? "";
      if (!currentRaw) {
        currentValue = undefined;
        status.textContent = `${sourceSelect.value} · ${key} · missing`;
      } else {
        try {
          currentValue = JSON.parse(currentRaw);
          const size = new Blob([currentRaw]).size;
          status.textContent = `${sourceSelect.value} · ${key} · ${size.toLocaleString()} bytes`;
        } catch (error) {
          currentValue = undefined;
          status.textContent = `${sourceSelect.value} · ${key} · value is not JSON`;
        }
      }
      if (currentValue !== undefined) indexPaths(currentValue, "$");
    } catch (error) {
      currentValue = undefined;
      currentRaw = "";
      status.textContent = `${sourceSelect.value} · access error: ${error.message}`;
    }
    render();
  }

  async function selectStorage() {
    updateKeys();
    await loadPins();
    refresh();
  }

  function show() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.textContent = "Hide form data";
    refresh();
    loadPins();
    refreshTimer = window.setInterval(refresh, 1000);
  }

  function hide() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Form data";
    window.clearInterval(refreshTimer);
  }

  toggle.addEventListener("click", () => panel.hidden ? show() : hide());
  root.querySelector(".close").addEventListener("click", hide);
  root.querySelector(".refresh").addEventListener("click", refresh);
  sourceSelect.addEventListener("change", selectStorage);
  keySelect.addEventListener("change", selectStorage);
  searchInput.addEventListener("input", render);
  jsonTab.addEventListener("click", () => { activeTab = "json"; render(); });
  pinnedTab.addEventListener("click", () => { activeTab = "pinned"; render(); });
})();
