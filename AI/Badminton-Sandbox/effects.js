// Manga-style impact effects, drawn procedurally on the court canvas:
// radial focus lines, a jagged white burst, speed wedges, a ground splash and
// a shout label. Positions are court metres, so they follow every camera view.
const INK = "#16241f",
  PAPER = "#fffefa",
  ease = (t) => 1 - (1 - t) ** 3;
function rng(seed) {
  let v = seed >>> 0;
  return () => {
    v = (Math.imul(v, 1664525) + 1013904223) >>> 0;
    return v / 4294967296;
  };
}
const LIFE = { impact: 420, splash: 560, shout: 760, flash: 160 };
export class Effects {
  constructor(renderer) {
    this.r = renderer;
    this.items = [];
    this.shakeUntil = 0;
    this.shakePower = 0;
  }
  spawn(type, data, now = performance.now()) {
    this.items.push({ type, ...data, t0: now, seed: (now * 1000) | 0 });
    this.r.dirty = true;
  }
  shake(power, ms, now = performance.now()) {
    this.shakePower = power;
    this.shakeUntil = now + ms;
  }
  busy(now) {
    this.items = this.items.filter((e) => now - e.t0 < LIFE[e.type]);
    return this.items.length > 0 || now < this.shakeUntil;
  }
  clear() {
    this.items = [];
    this.shakeUntil = 0;
  }
  offset(now) {
    if (now >= this.shakeUntil) return { x: 0, y: 0 };
    const left = (this.shakeUntil - now) / 160,
      p = this.shakePower * Math.min(1, left);
    return {
      x: Math.sin(now * 0.31) * p,
      y: Math.cos(now * 0.43) * p * 0.7,
    };
  }
  draw(now) {
    for (const e of this.items) {
      const t = Math.min(1, (now - e.t0) / LIFE[e.type]);
      if (e.type === "flash") this.flash(e, t);
      if (e.type === "impact") this.impact(e, t);
      if (e.type === "splash") this.splash(e, t);
      if (e.type === "shout") this.shout(e, t);
    }
  }
  flash(e, t) {
    const c = this.r.ctx,
      q = this.r.project(e.x, e.z, e.h),
      g = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, this.r.width * 0.6);
    g.addColorStop(0, `rgba(255,254,240,${0.55 * (1 - t)})`);
    g.addColorStop(1, "rgba(255,254,240,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, this.r.width, this.r.height);
  }
  // Contact: focus lines rushing outward plus a jagged white starburst.
  impact(e, t) {
    const c = this.r.ctx,
      q = this.r.project(e.x, e.z, e.h),
      unit = this.r.unitAt(e.x, e.z),
      // Scale with distance, but never swamp the court in close camera views.
      cap = Math.min(this.r.width, this.r.height) * 0.075,
      size = Math.min(cap, Math.max(22, unit * 1.2)) * e.power,
      grow = ease(Math.min(1, t / 0.3)),
      fade = t < 0.45 ? 1 : 1 - (t - 0.45) / 0.55,
      rand = rng(e.seed);
    c.save();
    c.translate(q.x, q.y);
    c.globalAlpha = fade;
    // Focus lines: thin tapered wedges, longest along the shot direction.
    const lines = 30;
    c.fillStyle = INK;
    for (let i = 0; i < lines; i++) {
      const a = (i / lines) * Math.PI * 2 + rand() * 0.18,
        along = Math.abs(Math.cos(a - e.dir)),
        inner = size * (0.55 + rand() * 0.25) * grow,
        outer = inner + size * (0.5 + rand() * 0.6 + along * 0.9) * grow,
        w = 0.025 + rand() * 0.03;
      c.beginPath();
      c.moveTo(Math.cos(a - w) * inner, Math.sin(a - w) * inner);
      c.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      c.lineTo(Math.cos(a + w) * inner, Math.sin(a + w) * inner);
      c.closePath();
      c.fill();
    }
    // Jagged burst: alternating radii, white with an ink outline.
    const spikes = 11,
      core = size * 0.62 * grow;
    c.beginPath();
    for (let i = 0; i <= spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2 + e.dir,
        rad =
          i % 2 ? core * (0.42 + rand() * 0.12) : core * (0.85 + rand() * 0.45);
      i
        ? c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad)
        : c.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    c.closePath();
    c.fillStyle = e.color || (e.gold ? "#f6d65a" : PAPER);
    c.fill();
    c.lineWidth = 2.2;
    c.strokeStyle = INK;
    c.stroke();
    // A few ink flecks thrown off the burst.
    for (let i = 0; i < 6; i++) {
      const a = rand() * Math.PI * 2,
        d = size * (0.9 + rand() * 0.8) * grow;
      c.beginPath();
      c.arc(Math.cos(a) * d, Math.sin(a) * d, 1 + rand() * 2.2, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  // Landing: a flattened spiky splash on the floor and an expanding ring.
  splash(e, t) {
    const c = this.r.ctx,
      q = this.r.project(e.x, e.z),
      unit = this.r.unitAt(e.x, e.z),
      cap = Math.min(this.r.width, this.r.height) * 0.065,
      size = Math.min(cap, Math.max(18, unit * 0.9)) * e.power,
      grow = ease(Math.min(1, t / 0.35)),
      fade = t < 0.4 ? 1 : 1 - (t - 0.4) / 0.6,
      rand = rng(e.seed);
    c.save();
    c.globalAlpha = fade;
    this.r.floorRing(e.x, e.z, 0.25 + 0.9 * ease(t) * e.power, null, INK, 1.6);
    c.translate(q.x, q.y);
    c.scale(1, 0.42);
    const spikes = 14;
    c.beginPath();
    for (let i = 0; i <= spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2,
        up = Math.sin(a) < 0 ? 1.6 : 0.8,
        rad = (i % 2 ? 0.45 : 1 + rand() * 0.6 * up) * size * grow;
      i
        ? c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad)
        : c.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    c.closePath();
    c.fillStyle = PAPER;
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = INK;
    c.stroke();
    c.restore();
  }
  // Shout label: pops in, tilts, holds, then lifts away.
  shout(e, t) {
    const c = this.r.ctx,
      q = this.r.project(e.x, e.z, e.h),
      pop =
        t < 0.18
          ? 0.6 + 0.6 * ease(t / 0.18)
          : t < 0.3
            ? 1.2 - (t - 0.18) * 1.6
            : 1,
      fade = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3,
      big = Math.max(18, Math.min(34, this.r.width / 24)) * (e.big ? 1.5 : 1);
    c.save();
    c.translate(q.x + big * 0.6, q.y - big * 1.6 - t * 14);
    c.rotate(-0.12);
    c.scale(pop, pop);
    c.globalAlpha = fade;
    c.textAlign = "center";
    c.lineJoin = "round";
    c.font = `900 italic ${big}px "DM Sans", "Noto Sans TC", system-ui`;
    c.lineWidth = 6;
    c.strokeStyle = INK;
    c.strokeText(e.text, 0, 0);
    c.fillStyle = e.color || (e.gold ? "#f6d65a" : PAPER);
    c.fillText(e.text, 0, 0);
    if (e.sub) {
      c.font = `800 ${big * 0.42}px "DM Sans", system-ui`;
      c.lineWidth = 4;
      c.strokeText(e.sub, 0, big * 0.62);
      c.fillStyle = "#f3e98d";
      c.fillText(e.sub, 0, big * 0.62);
    }
    c.restore();
  }
}
Effects.prototype.tension = function (level, now) {
  // Long rallies: focus lines creep in from the edges and breathe slowly.
  const c = this.r.ctx,
    w = this.r.width,
    h = this.r.height,
    rand = rng(7),
    breathe = 0.85 + 0.15 * Math.sin(now / 260),
    cx = w / 2,
    cy = h / 2,
    reach = Math.hypot(cx, cy);
  c.save();
  c.globalAlpha = 0.5 * level * breathe;
  c.fillStyle = INK;
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2 + rand() * 0.05,
      inner = reach * (0.78 - level * 0.16 + rand() * 0.12),
      wdt = 0.006 + rand() * 0.01;
    c.beginPath();
    c.moveTo(
      cx + Math.cos(a - wdt) * reach * 1.1,
      cy + Math.sin(a - wdt) * reach * 1.1,
    );
    c.lineTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    c.lineTo(
      cx + Math.cos(a + wdt) * reach * 1.1,
      cy + Math.sin(a + wdt) * reach * 1.1,
    );
    c.closePath();
    c.fill();
  }
  c.restore();
};
// Speed wedges trailing a fast shuttle: tapered ink strokes parallel to travel.
export function speedWedges(ctx, head, tail, power = 1) {
  const dx = head.x - tail.x,
    dy = head.y - tail.y,
    len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len,
    uy = dy / len,
    px = -uy,
    py = ux;
  ctx.save();
  ctx.fillStyle = INK;
  [-11, -6, 0, 6, 11].forEach((off, i) => {
    const reach = len * (i === 2 ? 1.25 : 0.7 + (i % 2) * 0.25) * power,
      w = i === 2 ? 2.4 : 1.4,
      sx = head.x + px * off - ux * 6,
      sy = head.y + py * off - uy * 6;
    ctx.globalAlpha = i === 2 ? 0.75 : 0.45;
    ctx.beginPath();
    ctx.moveTo(sx + px * w, sy + py * w);
    ctx.lineTo(sx - ux * reach, sy - uy * reach);
    ctx.lineTo(sx - px * w, sy - py * w);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}
