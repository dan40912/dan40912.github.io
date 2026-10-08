import {
  clamp,
  sign,
  serveRegion,
  targetDepth,
  trajectory,
} from "./model.js?v=20261008-targets";
import { portrait, TEAM_COLORS } from "./characters.js?v=20261008-targets";
import { Effects, speedWedges } from "./effects.js?v=20261008-targets";
import { racketOf } from "./abilities.js?v=20261008-targets";
// Camera rigs (metres, radians) along one elevation track the user can drag:
// 0 = courtside seat, 0.7 = TV broadcast, 1 = high stand.
const RIGS = [
  { at: 0, y: 2.6, z: 10.6, pitch: 0.24 },
  { at: 0.7, y: 7.4, z: 15.2, pitch: 0.6 },
  { at: 1, y: 10.2, z: 15.4, pitch: 0.86 },
];
export const ELEVATION = { low: 0, broadcast: 0.7 };
const lerp = (a, b, t) => a + (b - a) * t;
function rigAt(e) {
  const i = e <= RIGS[1].at ? 0 : 1,
    a = RIGS[i],
    b = RIGS[i + 1],
    t = (e - a.at) / (b.at - a.at);
  return {
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    pitch: lerp(a.pitch, b.pitch, t),
  };
}
export class CourtRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.scale = 1;
    this.faces = new Map();
    this.effects = new Effects(this);
    this.dirty = true;
    this.view = "tactical";
    this.C = 0.56;
    this.elevation = ELEVATION.broadcast;
    this.focal = 1;
    this.bx = 0;
    this.by = 0;
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
  }
  resize() {
    this.dirty = true;
    const r = this.canvas.getBoundingClientRect();
    if (r.width < 50 || r.height < 100) return;
    const d = Math.min(devicePixelRatio || 1, 2);
    this.width = r.width;
    this.height = r.height;
    this.canvas.width = Math.round(r.width * d);
    this.canvas.height = Math.round(r.height * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    // A diagonal court uses landscape space; a frontal court stays easy to tap on phones.
    this.angle = clamp((r.width - 440) / 500, 0, 1) * 0.6;
    this.cos = Math.cos(this.angle);
    this.sin = Math.sin(this.angle);
    // Tall phone canvases tilt the frontal court up so it fills the height and
    // the far half stays large enough to tap.
    this.C = r.height > r.width * 1.15 ? 0.74 : 0.56;
    const C = this.C;
    this.scale = Math.min(
      (r.width - 45) / (8.1 * this.cos + 14.4 * this.sin),
      (r.height - 90) / ((13.4 * this.cos + 6.1 * this.sin) * C + 1.8),
    );
    this.cx = r.width / 2;
    this.cy = r.height / 2 + 23;
    this.fitCamera();
  }
  // view: "tactical" or "camera"; elevation 0–1 positions the camera rig.
  setView(view, elevation = this.elevation) {
    this.view = view === "camera" ? "camera" : "tactical";
    this.elevation = clamp(Number(elevation) || 0, 0, 1);
    this.fitCamera();
    this.dirty = true;
  }
  get perspective() {
    return this.view === "camera";
  }
  // How far the framing has moved from the courtside seat toward the wide shot.
  get wideness() {
    return clamp(this.elevation / 0.6, 0, 1);
  }
  // Perspective views use a pinhole camera behind the blue baseline:
  // far court is narrower and players shrink with distance.
  fitCamera() {
    // Set the rig even while the canvas is hidden, so projection never sees no camera.
    const cam = rigAt(this.elevation);
    this.cam = {
      y: cam.y,
      z: cam.z,
      sin: Math.sin(cam.pitch),
      cos: Math.cos(cam.pitch),
    };
    if (!this.perspective || !this.width) return;
    this.focal = 1;
    this.bx = 0;
    this.by = 0;
    const w = this.wideness,
      // Low cameras fit width at the near service area, so the near baseline
      // corners spill off the sides like a courtside photo.
      wide = [-6.9, lerp(2.6, 7.2, w)].flatMap((z) =>
        [-3.4, 3.4].map((x) => this.camera(x, z, 0)),
      ),
      // Height: far players' heads down to the near baseline (and a near head).
      tall = [
        this.camera(0, -6.7, 2.4),
        this.camera(0, lerp(6.9, 7.2, w), 0),
        this.camera(0, 6.2, 1.9),
      ];
    const minX = Math.min(...wide.map((p) => p.x)),
      maxX = Math.max(...wide.map((p) => p.x)),
      minY = Math.min(...tall.map((p) => p.y)),
      maxY = Math.max(...tall.map((p) => p.y));
    this.focal = Math.min(
      (this.width - lerp(10, 40, w)) / (maxX - minX),
      (this.height - lerp(56, 80, w)) / (maxY - minY),
    );
    this.bx = this.width / 2 - ((minX + maxX) / 2) * this.focal;
    this.by = this.height / 2 + 12 - ((minY + maxY) / 2) * this.focal;
  }
  camera(x, z, h) {
    const { y, z: cz, sin, cos } = this.cam,
      dy = h - y,
      dz = z - cz,
      depth = -dz * cos - dy * sin,
      up = dy * cos - dz * sin;
    return { x: x / depth, y: -up / depth, depth };
  }
  project(x, z, h = 0) {
    if (this.perspective) {
      const p = this.camera(x, z, h);
      return { x: this.bx + p.x * this.focal, y: this.by + p.y * this.focal };
    }
    return {
      x: this.cx + (x * this.cos + z * this.sin) * this.scale,
      y: this.cy + (z * this.cos - x * this.sin - h) * this.scale * this.C,
    };
  }
  // Pixels per metre at a court position, so sprites shrink with distance.
  unitAt(x = 0, z = 0) {
    if (!this.perspective) return this.scale;
    return this.focal / this.camera(x, z, 0).depth;
  }
  // A ground-plane ellipse that follows the active projection.
  floorRing(x, z, r, fill, stroke, line = 1) {
    const c = this.ctx;
    c.beginPath();
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2,
        q = this.project(x + Math.cos(a) * r, z + Math.sin(a) * r);
      i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y);
    }
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = line;
      c.stroke();
    }
  }
  point(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    if (this.perspective) {
      // Cast a ray through the pixel and intersect it with the floor (h = 0).
      const u = (clientX - r.left - this.bx) / this.focal,
        v = (clientY - r.top - this.by) / this.focal,
        { y, z: cz, sin, cos } = this.cam,
        dir = { x: u, y: -sin - v * cos, z: -cos + v * sin };
      if (dir.y >= -1e-6) return { x: NaN, z: NaN };
      const t = -y / dir.y;
      return { x: dir.x * t, z: cz + dir.z * t };
    }
    const x = (clientX - r.left - this.cx) / this.scale;
    const z = (clientY - r.top - this.cy) / (this.scale * this.C);
    return { x: x * this.cos - z * this.sin, z: x * this.sin + z * this.cos };
  }
  face(profile, index, expression) {
    const key = JSON.stringify([
      profile.face,
      profile.hair,
      profile.hairColor,
      profile.visualTheme?.accent,
      profile.skin,
      profile.accessory,
      profile.personality,
      expression,
    ]);
    if (!this.faces.has(key)) {
      const img = new Image();
      img.onload = () => {
        this.dirty = true;
      };
      img.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(
          portrait(profile, index, { expression, faceOnly: true }),
        );
      this.faces.set(key, img);
    }
    return this.faces.get(key);
  }
  ellipse(x, y, rx, ry, fill, stroke, line = 1) {
    const c = this.ctx;
    c.beginPath();
    c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, Math.PI * 2);
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = line;
      c.stroke();
    }
  }
  polygon(points, fill, stroke) {
    const c = this.ctx;
    c.beginPath();
    points.forEach((p, i) => {
      const q = this.project(...p);
      i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y);
    });
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 1.2;
      c.stroke();
    }
  }
  line(points, color = "#f3f7e6", line = 1, dash = []) {
    const c = this.ctx;
    c.beginPath();
    points.forEach((p, i) => {
      const q = this.project(...p);
      i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y);
    });
    c.strokeStyle = color;
    c.lineWidth = line;
    c.setLineDash(dash);
    c.stroke();
    c.setLineDash([]);
  }
  marker(p, preview = false) {
    const q = this.project(p.x, p.z),
      c = this.ctx;
    this.floorRing(
      p.x,
      p.z,
      0.3,
      preview ? "#ddea9870" : "#f6f0b870",
      "#f5efba",
      2,
    );
    c.fillStyle = "#fff9";
    c.beginPath();
    c.arc(q.x, q.y, 2.2, 0, Math.PI * 2);
    c.fill();
  }
  arrow(a, b, color) {
    const p = this.project(a.x, a.z),
      q = this.project(b.x, b.z),
      c = this.ctx;
    c.beginPath();
    c.moveTo(p.x, p.y);
    c.lineTo(q.x, q.y);
    c.strokeStyle = color;
    c.lineWidth = 1.4;
    c.setLineDash([4, 5]);
    c.stroke();
    c.setLineDash([]);
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    c.beginPath();
    c.moveTo(q.x, q.y);
    c.lineTo(
      q.x - 7 * Math.cos(angle - 0.45),
      q.y - 7 * Math.sin(angle - 0.45),
    );
    c.lineTo(
      q.x - 7 * Math.cos(angle + 0.45),
      q.y - 7 * Math.sin(angle + 0.45),
    );
    c.closePath();
    c.fillStyle = color;
    c.fill();
  }
  drawCourt(state, shot) {
    const c = this.ctx,
      s = this.scale;
    this.polygon(
      [
        [-3.4, -6.95],
        [3.4, -6.95],
        [3.4, 7.1],
        [-3.4, 7.1],
      ],
      "#183d3110",
    );
    this.polygon(
      [
        [-3.05, -6.7],
        [3.05, -6.7],
        [3.05, 6.7],
        [-3.05, 6.7],
      ],
      "#6c8c68",
    );
    this.polygon(
      [
        [-3.05, 0],
        [3.05, 0],
        [3.05, 6.7],
        [-3.05, 6.7],
      ],
      "#76966f",
    );
    for (let z = -6; z < 7; z += 1.5)
      this.polygon(
        [
          [-3.05, z],
          [3.05, z],
          [3.05, Math.min(z + 0.7, 6.7)],
          [-3.05, Math.min(z + 0.7, 6.7)],
        ],
        "#fff4",
      );
    if (state.phase !== "ended" && (state.phase === "serve" || shot)) {
      const r = state.phase === "serve" ? serveRegion(state) : { x0: -3.05, x1: 3.05 };
      const [near, far] = shot ? targetDepth(state, shot) : [1.98, 5.94];
      const z = state.turn === 0 ? -1 : 1;
      this.polygon(
        [
          [r.x0, z * near],
          [r.x1, z * near],
          [r.x1, z * far],
          [r.x0, z * far],
        ],
        "#e7f1a342",
      );
    }
    this.line(
      [
        [-3.05, -6.7],
        [3.05, -6.7],
        [3.05, 6.7],
        [-3.05, 6.7],
        [-3.05, -6.7],
      ],
      "#f6f7e9",
      1.6,
    );
    [-2.59, 2.59].forEach((x) =>
      this.line(
        [
          [x, -6.7],
          [x, 6.7],
        ],
        "#f3f7e6a6",
        1,
      ),
    );
    [-5.94, -1.98, 1.98, 5.94].forEach((z) =>
      this.line(
        [
          [-3.05, z],
          [3.05, z],
        ],
        "#f3f7e6c7",
        1,
      ),
    );
    this.line(
      [
        [0, -6.7],
        [0, -1.98],
      ],
      "#f3f7e6c7",
    );
    this.line(
      [
        [0, 1.98],
        [0, 6.7],
      ],
      "#f3f7e6c7",
    );
    c.font = '600 8px "DM Sans",system-ui';
    c.textAlign = "center";
    c.fillStyle = "#5c7052";
    let q = this.project(-3.7, 0);
    c.save();
    c.translate(q.x, q.y);
    c.rotate(-Math.PI / 2);
    c.fillText("羽球模擬器 / TACTICAL CLUB", 0, 0);
    c.restore();
    q = this.project(0, 7.3);
    c.font = "8px system-ui";
    c.fillStyle = "#53694e";
    c.fillText("BLUE TEAM / 我方", q.x, q.y);
    // In the broadcast view the far label would sit behind the far players.
    if (!this.perspective) {
      q = this.project(0, -7.15);
      c.fillText("CORAL TEAM / 對方", q.x, q.y);
    }
  }
  drawNet() {
    this.polygon(
      [
        [-3.2, 0, 0.1],
        [3.2, 0, 0.1],
        [3.2, 0, 1.55],
        [-3.2, 0, 1.55],
      ],
      "#163d312e",
    );
    for (let x = -3.2; x <= 3.2; x += 0.24)
      this.line(
        [
          [x, 0, 0.1],
          [x, 0, 1.55],
        ],
        "#f7faef68",
        0.5,
      );
    for (let h = 0.15; h < 1.55; h += 0.15)
      this.line(
        [
          [-3.2, 0, h],
          [3.2, 0, h],
        ],
        "#f7faef68",
        0.5,
      );
    this.line(
      [
        [-3.2, 0, 1.55],
        [3.2, 0, 1.55],
      ],
      "#fffefa",
      2.7,
    );
    [-3.2, 3.2].forEach((x) => {
      this.line(
        [
          [x, 0],
          [x, 0, 1.6],
        ],
        "#334e3b",
        3,
      );
      const q = this.project(x, 0);
      this.ellipse(q.x, q.y, 5, 2.2, "#334e3b");
    });
  }
  drawPlayer(
    p,
    i,
    profile,
    {
      selected = false,
      expression = "ready",
      swing = 0,
      moving = 0,
      charged = false,
      dive = 0,
    } = {},
  ) {
    const c = this.ctx,
      base = this.project(p.x, p.z),
      size = this.perspective
        ? clamp(
            this.unitAt(p.x, p.z) * lerp(0.82, 1.02, this.wideness),
            14,
            lerp(92, 72, this.wideness),
          )
        : clamp(this.scale * 0.82, 23, 48),
      outline = "#263e35",
      jersey = TEAM_COLORS[i],
      skin = { light: "#f4d2ba", warm: "#dca77f", deep: "#a66c4d" }[
        profile.skin
      ];
    this.ellipse(base.x + 2, base.y + 2, size * 0.48, size * 0.16, "#183d3127");
    if (charged) {
      // A full momentum meter glows gold under the player's feet.
      this.ellipse(
        base.x,
        base.y,
        size * 0.7,
        size * 0.28,
        "#f2d35a40",
        "#e0b532",
        2.5,
      );
    }
    if (selected)
      this.ellipse(
        base.x,
        base.y,
        size * 0.59,
        size * 0.24,
        null,
        "#f0f5b0",
        2,
      );
    c.save();
    c.translate(base.x, base.y);
    // Diving save: the whole body tips toward the shuttle and drops low.
    if (dive) {
      c.translate(0, size * 0.18 * Math.abs(dive));
      c.rotate(dive * 0.9);
    }
    const bounce = moving ? Math.sin(moving) * 1.7 : 0;
    c.translate(0, bounce);
    c.lineCap = "round";
    c.lineJoin = "round";
    const limb = (a, b, color, w) => {
      c.beginPath();
      c.moveTo(...a);
      c.lineTo(...b);
      c.strokeStyle = color;
      c.lineWidth = w;
      c.stroke();
    };
    const stride = moving ? Math.sin(moving) * size * 0.09 : 0;
    limb(
      [-size * 0.12, -size * 0.37],
      [-size * 0.24 + stride, -size * 0.08],
      outline,
      size * 0.15,
    );
    limb(
      [size * 0.12, -size * 0.37],
      [size * 0.24 - stride, -size * 0.08],
      outline,
      size * 0.15,
    );
    limb(
      [-size * 0.24 + stride, -size * 0.06],
      [-size * 0.38 + stride, -size * 0.04],
      "#f7f5e8",
      size * 0.12,
    );
    limb(
      [size * 0.24 - stride, -size * 0.06],
      [size * 0.37 - stride, -size * 0.04],
      "#f7f5e8",
      size * 0.12,
    );
    c.fillStyle = jersey;
    c.strokeStyle = outline;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(-size * 0.25, -size * 0.83);
    c.quadraticCurveTo(0, -size * 0.98, size * 0.25, -size * 0.83);
    c.lineTo(size * 0.25, -size * 0.36);
    c.quadraticCurveTo(0, -size * 0.29, -size * 0.25, -size * 0.36);
    c.closePath();
    c.fill();
    c.stroke();
    limb(
      [-size * 0.22, -size * 0.8],
      [-size * 0.34, -size * 0.54],
      skin,
      size * 0.1,
    );
    const swingAngle = -0.7 - swing * 1.7,
      hand = [
        size * 0.25 + Math.cos(swingAngle) * size * 0.27,
        -size * 0.74 + Math.sin(swingAngle) * size * 0.27,
      ];
    limb([size * 0.22, -size * 0.8], hand, skin, size * 0.11);
    const end = [
      hand[0] + Math.cos(swingAngle) * size * 0.29,
      hand[1] + Math.sin(swingAngle) * size * 0.29,
    ];
    const [frame, accent] = racketOf(profile).colors;
    limb(hand, end, accent, 2);
    c.save();
    c.translate(...end);
    c.rotate(swingAngle + Math.PI / 2);
    this.ellipse(
      0,
      -size * 0.09,
      size * 0.105,
      size * 0.16,
      "#eaf0dc55",
      outline,
      2.6,
    );
    this.ellipse(0, -size * 0.09, size * 0.105, size * 0.16, null, frame, 1.5);
    c.restore();
    c.fillStyle = "#f5f3e4";
    c.font = `700 ${Math.max(8, size * 0.21)}px system-ui`;
    c.textAlign = "center";
    c.fillText((i < 2 ? "B" : "R") + ((i % 2) + 1), 0, -size * 0.49);
    const img = this.face(profile, i, expression);
    if (img.complete && img.naturalWidth)
      c.drawImage(img, -size * 0.43, -size * 1.68, size * 0.86, size * 0.93);
    c.restore();
    c.textAlign = "center";
    c.font = `600 ${this.width < 450 ? 8 : 10}px system-ui`;
    const label =
      profile.name.length > 7 ? profile.name.slice(0, 7) + "…" : profile.name;
    c.fillStyle = "#fffefa";
    c.strokeStyle = "#365435";
    c.lineWidth = 3;
    const below = Math.max(12, size * 0.3);
    c.strokeText(label, base.x, base.y + below);
    c.fillText(label, base.x, base.y + below);
  }
  drawBall(ball, event, t) {
    const q = this.project(ball.x, ball.z, ball.h),
      ground = this.project(ball.x, ball.z),
      c = this.ctx,
      k = this.perspective
        ? clamp(this.unitAt(ball.x, ball.z) / 38, 0.6, 1.7)
        : 1;
    this.ellipse(
      ground.x,
      ground.y,
      Math.max(2, 4 - ball.h * 0.3) * k,
      1.8 * k,
      "#183d312b",
    );
    // Fast shots leave a motion streak so speed reads even in a still frame.
    const powerShot =
      event &&
      ["smash", "jumpSmash", "stick", "slice", "kill"].includes(event.shot);
    if (
      event &&
      (powerShot || event.skill || ["drive", "push"].includes(event.shot)) &&
      t > 0
    ) {
      const tail = trajectory(
          event,
          Math.max(0, t - (event.shot === "smash" ? 0.22 : 0.12)),
        ),
        a = this.project(tail.x, tail.z, tail.h),
        g = c.createLinearGradient(a.x, a.y, q.x, q.y);
      g.addColorStop(0, "#fffefa00");
      g.addColorStop(
        1,
        event.skillColor || (powerShot ? "#fff6c8e6" : "#fffefa99"),
      );
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(q.x, q.y);
      c.strokeStyle = g;
      c.lineWidth =
        (powerShot ? 4.5 : 2.5) *
        k *
        clamp((event.speed || 180) / 180, 0.8, 1.6);
      c.lineCap = "round";
      c.stroke();
      if (powerShot) speedWedges(c, q, a, event.skill ? 1.5 : 1.1);
    }
    c.save();
    c.translate(q.x, q.y);
    c.scale(k, k);
    if (event) {
      const end = this.project(event.actual.x, event.actual.z);
      c.rotate(Math.atan2(end.y - q.y, end.x - q.x) + Math.PI / 2);
    }
    c.shadowColor = "#fff5cc";
    c.shadowBlur = 7;
    c.fillStyle = "#fffefa";
    c.strokeStyle = "#4c6444";
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(0, 3.5);
    c.lineTo(-4, -6);
    c.quadraticCurveTo(0, -9, 4, -6);
    c.closePath();
    c.fill();
    c.stroke();
    this.ellipse(0, 3.5, 2.4, 2.4, "#e6c28d", "#536646", 0.7);
    c.restore();
  }
  render(
    state,
    profiles,
    {
      animation = null,
      selected = 0,
      target = null,
      trail = [],
      showTrail = true,
      time = 0,
      previewShot = null,
      reduceMotion = false,
      tension = 0,
    } = {},
  ) {
    if (!this.width || this.canvas.getBoundingClientRect().width < 50) return;
    const c = this.ctx;
    c.clearRect(0, 0, this.width, this.height);
    const jolt = reduceMotion ? { x: 0, y: 0 } : this.effects.offset(time);
    c.save();
    c.translate(jolt.x, jolt.y);
    this.drawCourt(state, previewShot);
    if (tension > 0) this.effects.tension(tension, reduceMotion ? 0 : time);
    if (showTrail)
      trail
        .filter((e) => e.kind === "shot")
        .forEach((e, i, all) =>
          this.arrow(
            e.from,
            e.actual,
            TEAM_COLORS[e.actor] + (i >= all.length - 3 ? "88" : "28"),
          ),
        );
    if (target && !animation) {
      this.marker(target, true);
      this.arrow(state.origin, target, "#eff1a950");
      if (previewShot) {
        const event = {
          from: state.origin,
          actual: target,
          shot: previewShot,
          outcome: "return",
        };
        c.beginPath();
        for (let i = 0; i <= 24; i++) {
          const b = trajectory(event, i / 24),
            q = this.project(b.x, b.z, b.h);
          i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y);
        }
        c.strokeStyle = "#f5edb5c0";
        c.lineWidth = 1.4;
        c.setLineDash([3, 5]);
        c.stroke();
        c.setLineDash([]);
      }
    }
    let positions = state.positions,
      progress = 0;
    // Share of the animation spent stepping in before contact; the rest is flight.
    const cut = animation?.prep ?? 0.22;
    if (animation) {
      const e = animation.event;
      progress = clamp(animation.elapsed / animation.duration, 0, 1);
      if (e.kind === "shot") {
        const prep = clamp(progress / cut, 0, 1),
          flight = clamp((progress - cut) / (1 - cut), 0, 1);
        positions = e.before.positions.map((p, i) => {
          const contact = e.contact[i],
            after = e.after.positions[i];
          return progress < cut
            ? {
                x: p.x + (contact.x - p.x) * prep,
                z: p.z + (contact.z - p.z) * prep,
              }
            : {
                x: contact.x + (after.x - contact.x) * flight,
                z: contact.z + (after.z - contact.z) * flight,
              };
        });
      } else
        positions = e.before.positions.map((p, i) => ({
          x: p.x + (e.after.positions[i].x - p.x) * progress,
          z: p.z + (e.after.positions[i].z - p.z) * progress,
        }));
    }
    if (animation && reduceMotion)
      positions =
        progress < 0.5
          ? animation.event.before.positions
          : animation.event.after.positions;
    const objects = positions.map((p, i) => ({
      z: p.z,
      draw: () => {
        let expression = "ready",
          swing = 0,
          moving = 0,
          dive = 0;
        if (animation) {
          const e = animation.event;
          if (e.actor === i) {
            expression = "focus";
            swing =
              e.kind === "shot"
                ? Math.sin(
                    clamp((progress - cut * 0.7) / (cut * 0.75), 0, 1) *
                      Math.PI,
                  )
                : 0;
          }
          const before = e.before.positions[i],
            after = e.after.positions[i];
          if (Math.hypot(before.x - after.x, before.z - after.z) > 0.4)
            moving = progress * 22;
          if (e.outcome === "save" && e.receiver === i && progress > cut) {
            const lean = clamp((progress - 0.55) / 0.3, 0, 1),
              side = Math.sign(e.actual.x - before.x) || 1;
            dive = lean * side;
            expression = "focus";
          }
        } else if (state.phase === "ended") {
          expression = (i < 2 ? 0 : 1) === state.winner ? "happy" : "sad";
        }
        this.drawPlayer(p, i, profiles[i], {
          selected: i === selected,
          expression,
          swing: reduceMotion ? 0 : swing,
          moving: reduceMotion ? 0 : moving,
          dive: reduceMotion ? 0 : dive,
          charged: (state.meter?.[i] ?? 0) >= 100,
        });
      },
    }));
    objects.push({ z: 0, draw: () => this.drawNet() });
    objects.sort((a, b) => a.z - b.z).forEach((o) => o.draw());
    if (animation?.event.kind === "shot") {
      const e = animation.event,
        t = reduceMotion
          ? progress < 0.5
            ? 0
            : 1
          : clamp((progress - cut) / (1 - cut), 0, 1);
      this.marker(e.actual);
      this.drawBall(trajectory(e, t), e, t);
    } else if (state.phase !== "ended")
      this.drawBall({
        ...state.origin,
        h: state.phase === "serve" ? 0.9 : 0.25,
      });
    else this.drawBall({ ...state.origin, h: 0.1 });
    this.effects.draw(time);
    c.restore();
  }
}
