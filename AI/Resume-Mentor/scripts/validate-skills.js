const fs = require("fs");
const vm = require("vm");

const REQUIRED_FIELDS = [
  "Goal",
  "Input",
  "Output",
  "Challenge Rules",
  "Review Rules",
  "Success Criteria",
];

function normalizeTitle(value) {
  return String(value || "")
    .replace(/^#+\s*/, "")
    .replace(/^\d+[\.)]\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function collectSkillNames(value, names = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (typeof item === "string") names.add(item);
      else collectSkillNames(item, names);
    });
    return names;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectSkillNames(item, names));
  }

  return names;
}

function parseMarkdownBlocks(markdown) {
  const headings = [];
  for (const match of markdown.matchAll(/^(#{2,3})\s+(.*)$/gm)) {
    headings.push({ index: match.index, title: match[2] });
  }

  const blocks = new Map();
  headings.forEach((heading, index) => {
    const end = headings[index + 1] ? headings[index + 1].index : markdown.length;
    blocks.set(normalizeTitle(heading.title), markdown.slice(heading.index, end).trim());
  });
  return blocks;
}

function loadConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync("assets/js/wizard-config.js", "utf8"), sandbox);
  return sandbox.window.RM_CONFIG;
}

function main() {
  const config = loadConfig();
  const selectedSkills = Array.from(collectSkillNames(config.skillSelection)).sort();
  const markdown = [
    fs.readFileSync("skills/resume-mentor-skill-library.md", "utf8"),
    fs.readFileSync("skills/business-agent-skills.md", "utf8"),
  ].join("\n");

  const blocks = parseMarkdownBlocks(markdown);
  const fallback = config.skillFallbacks || {};
  const missingMarkdown = [];
  const incompleteMarkdown = [];
  const missingFallback = [];

  selectedSkills.forEach((name) => {
    const block = blocks.get(normalizeTitle(name));
    if (!block) {
      missingMarkdown.push(name);
    } else {
      const missingFields = REQUIRED_FIELDS.filter((field) => {
        return !new RegExp(`\\*\\*${field}:\\*\\*`, "i").test(block);
      });
      if (missingFields.length) {
        incompleteMarkdown.push(`${name} missing ${missingFields.join(", ")}`);
      }
    }

    if (!fallback[name]) missingFallback.push(name);
  });

  const oldMissingMessage = [
    "assets/js/wizard.js",
    "assets/js/skill-loader.js",
    "assets/js/wizard-config.js",
  ].some((file) => fs.readFileSync(file, "utf8").includes(["目前", "找不到"].join("")));

  const result = {
    selectedSkillCount: selectedSkills.length,
    missingMarkdown,
    incompleteMarkdown,
    missingFallback,
    oldMissingMessage,
  };

  console.log(JSON.stringify(result, null, 2));

  if (
    missingMarkdown.length ||
    incompleteMarkdown.length ||
    missingFallback.length ||
    oldMissingMessage
  ) {
    process.exit(1);
  }
}

main();
