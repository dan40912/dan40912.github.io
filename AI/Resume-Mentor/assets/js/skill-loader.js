(function () {
  "use strict";

  const config = window.RM_CONFIG || {};
  const sourceMap = config.skillSources || {};
  const sources = Object.entries(sourceMap).map(([id, path]) => ({ id, path }));

  const state = {
    ready: false,
    error: null,
    sourceMode: "embedded",
    files: {},
    blocks: [],
    byName: new Map(),
  };

  function normalizeTitle(value) {
    return String(value || "")
      .replace(/^#+\s*/, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function stripHeading(value) {
    return String(value || "")
      .replace(/^#+\s*/, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .trim();
  }

  function parseBlocks(text, fileId) {
    const lines = String(text || "").split(/\r?\n/);
    const blocks = [];
    let current = null;

    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        if (current && current.title) blocks.push(current);
        current = {
          fileId,
          level: match[1].length,
          title: stripHeading(match[2]),
          rawTitle: match[2].trim(),
          lines: [],
        };
        continue;
      }
      if (current) current.lines.push(line);
    }

    if (current && current.title) blocks.push(current);
    return blocks.filter((block) => /skill/i.test(block.title));
  }

  function blockText(block) {
    const heading = `${"#".repeat(block.level)} ${block.title}`;
    return [heading, ...block.lines].join("\n").trim();
  }

  function registerBlocks(fileId, text, blocks) {
    state.files[fileId] = text;
    for (const block of blocks) {
      const normalized = normalizeTitle(block.title);
      const payload = {
        fileId,
        title: block.title,
        rawTitle: block.rawTitle,
        level: block.level,
        text: blockText(block),
      };
      state.blocks.push(payload);
      const existing = state.byName.get(normalized);
      if (!existing || existing.fileId === "fallback") state.byName.set(normalized, payload);
    }
  }

  function registerFallbacks(fallbacks) {
    let count = 0;
    Object.entries(fallbacks || {}).forEach(([title, text]) => {
      const normalized = normalizeTitle(title);
      if (state.byName.has(normalized)) return;
      const payload = {
        fileId: "fallback",
        title,
        rawTitle: title,
        level: 3,
        text: `### ${title}\n${String(text || "").trim()}`,
      };
      state.blocks.push(payload);
      state.byName.set(normalized, payload);
      count += 1;
    });
    return count;
  }

  async function loadSource(source) {
    const response = await fetch(source.path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${source.path}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const blocks = parseBlocks(text, source.id);
    registerBlocks(source.id, text, blocks);
  }

  const api = {
    ready: false,
    error: null,
    sourceMode: state.sourceMode,
    files: state.files,
    blocks: state.blocks,
    getSkill(name) {
      return state.byName.get(normalizeTitle(name)) || null;
    },
    listSkills() {
      return Array.from(state.byName.values()).map((item) => item.title);
    },
  };

  window.RM_SKILLS = api;
  const fallbackCount = registerFallbacks(config.skillFallbacks);
  if (fallbackCount > 0) {
    state.ready = true;
    api.ready = true;
    api.sourceMode = "embedded";
  }

  const canFetchMarkdown = sources.length > 0 && /^https?:$/.test(window.location.protocol);
  if (!canFetchMarkdown) {
    window.RM_SKILL_READY = Promise.resolve(api);
    return;
  }

  window.RM_SKILL_READY = Promise.all(sources.map(loadSource))
    .then(() => {
      state.ready = true;
      api.ready = true;
      api.sourceMode = "markdown";
      return api;
    })
    .catch((error) => {
      state.error = error;
      api.error = String(error && error.message ? error.message : error);
      api.ready = fallbackCount > 0;
      api.sourceMode = fallbackCount > 0 ? "embedded" : "unavailable";
      console.warn("[Resume-Mentor] Skill markdown load failed; using embedded skills:", error);
      return api;
    });
})();
