// Ability radar: five stats plus a sixth "skill" axis, drawn as inline SVG.
import { STATS, SKILLS, STAT_MAX } from "./abilities.js";
import { escapeHTML } from "./characters.js";

// Order around the hexagon, clockwise from the top. The skill axis sits at the
// bottom so the special quadrant reads as the foundation of the player.
const AXES = ["power", "speed", "net", "skill", "defense", "control"];
const LABEL = Object.fromEntries(STATS.map((s) => [s.key, s.label]));
// Skill mastery grows with level: 2 at level 1, 10 at level 18.
export const masteryFor = (level) =>
  Math.max(2, Math.min(10, Math.round(2 + ((level - 1) * 8) / 17)));
export function radarSVG(
  stats,
  {
    level = 6,
    skill = null,
    skillLabel = "",
    color = "#4782a5",
    size = 220,
    labels = true,
    title = "",
    base = null,
  } = {},
) {
  const c = size / 2,
    r = size * (labels ? 0.36 : 0.44),
    angle = (i) => -Math.PI / 2 + (i * Math.PI) / 3,
    at = (i, v) => [
      c + Math.cos(angle(i)) * r * (v / STAT_MAX),
      c + Math.sin(angle(i)) * r * (v / STAT_MAX),
    ],
    value = (k) => (k === "skill" ? masteryFor(level) : stats[k]),
    pts = (vals) => vals.map((v, i) => at(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
  const rings = [2, 4, 6, 8, 10]
      .map(
        (v) =>
          `<polygon points="${pts(AXES.map(() => v))}" fill="none" stroke="#183d31" stroke-opacity="${v === 10 ? 0.22 : 0.09}"/>`,
      )
      .join(""),
    spokes = AXES.map((_, i) => {
      const [x, y] = at(i, STAT_MAX);
      return `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#183d31" stroke-opacity=".1"/>`;
    }).join(""),
    vals = AXES.map(value),
    // The skill quadrant: a gold wedge between the skill axis and its neighbours.
    si = AXES.indexOf("skill"),
    wedge = [at(si - 1, vals[si - 1]), at(si, vals[si]), at(si + 1, vals[si + 1])]
      .map((p) => p.map((n) => n.toFixed(1)).join(","))
      .join(" "),
    shape = `<polygon points="${pts(vals)}" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`,
    // Without the racket: a dashed outline, so the racket's effect is visible.
    ghost = base
      ? `<polygon points="${pts(AXES.map((k) => (k === "skill" ? masteryFor(level) : base[k])))}" fill="none" stroke="#183d31" stroke-opacity=".55" stroke-width="1.4" stroke-dasharray="4 3"/>`
      : "",
    gold = `<polygon points="${c},${c} ${wedge}" fill="#e9c94a" fill-opacity=".55" stroke="#b8932a" stroke-width="1.5" stroke-linejoin="round"/>`,
    dots = vals
      .map((v, i) => {
        const [x, y] = at(i, v);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size > 120 ? 3.2 : 2}" fill="${AXES[i] === "skill" ? "#b8932a" : color}"/>`;
      })
      .join("");
  const text = labels
    ? AXES.map((k, i) => {
        const [x, y] = at(i, STAT_MAX * 1.32),
          anchor = Math.abs(x - c) < 4 ? "middle" : x > c ? "start" : "end",
          name =
            k === "skill"
              ? `${SKILLS[skill]?.icon ?? "★"} ${escapeHTML(skillLabel || "絕技")}`
              : LABEL[k];
        return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" font-size="${size * 0.058}" font-weight="700" fill="${k === "skill" ? "#8a6a14" : "#183d31"}">${name} <tspan font-weight="500" fill-opacity=".6">${vals[i]}</tspan></text>`;
      }).join("")
    : "";
  const box = labels ? `${-size * 0.2} 0 ${size * 1.4} ${size}` : `0 0 ${size} ${size}`;
  return `<svg viewBox="${box}" role="img" aria-label="${escapeHTML(title || "能力雷達圖")}：${AXES.map((k, i) => `${k === "skill" ? "絕技" : LABEL[k]} ${vals[i]}`).join("、")}">${rings}${spokes}${gold}${shape}${ghost}${dots}${text}</svg>`;
}
