// Synthesised racket sounds, so the app stays asset-free.
// smash: a hard crack with a low body thump and a whoosh.
// clear: a deep, round "thock" for lifts, clears and long serves.
// touch: a light tick for net shots, drives, drops and short serves.
let ctx = null,
  noise = null,
  out = null,
  crunch = null;
function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    // A limiter lets the smash hit hard without clipping the other voices.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.12;
    out = ctx.createGain();
    out.gain.value = 1;
    out.connect(limiter).connect(ctx.destination);
    // Soft-clip curve that gives the smash crack its crunch.
    crunch = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * 3.2);
    }
    crunch.curve = curve;
    crunch.connect(out);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function burst(a, t, { type, freq, q = 1, gain, decay, sweepTo, dest }) {
  const src = a.createBufferSource(),
    filter = a.createBiquadFilter(),
    amp = a.createGain();
  src.buffer = noise;
  filter.type = type;
  filter.frequency.setValueAtTime(freq, t);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + decay);
  filter.Q.value = q;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  src.connect(filter).connect(amp).connect(dest || out);
  src.start(t);
  src.stop(t + decay + 0.02);
}
function tone(a, t, { from, to, gain, decay, type = "sine", dest }) {
  const osc = a.createOscillator(),
    amp = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + decay);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.003);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  osc.connect(amp).connect(dest || out);
  osc.start(t);
  osc.stop(t + decay + 0.02);
}
const VOICES = {
  smash(a, t) {
    // Racket whoosh first, then a crunchy crack, a body thump and a sub boom.
    burst(a, t, { type: "bandpass", freq: 700, sweepTo: 4200, q: 0.7, gain: 0.3, decay: 0.07 });
    const hit = t + 0.05;
    burst(a, hit, { type: "highpass", freq: 2000, gain: 0.95, decay: 0.06, dest: crunch });
    burst(a, hit, { type: "bandpass", freq: 1400, q: 1.6, gain: 0.8, decay: 0.09, dest: crunch });
    tone(a, hit, { from: 210, to: 60, gain: 0.85, decay: 0.16 });
    tone(a, hit, { from: 70, to: 38, gain: 0.7, decay: 0.28 });
    // Short room tail so the hit lingers for a moment.
    burst(a, hit + 0.03, { type: "lowpass", freq: 1800, gain: 0.12, decay: 0.32 });
  },
  clear(a, t) {
    burst(a, t, { type: "bandpass", freq: 1150, q: 3, gain: 0.32, decay: 0.09 });
    tone(a, t, { from: 340, to: 190, gain: 0.2, decay: 0.11, type: "triangle" });
  },
  // Rising sweep and a bright chime when a signature skill fires.
  skill(a, t) {
    burst(a, t, { type: "bandpass", freq: 400, sweepTo: 6000, q: 1.2, gain: 0.35, decay: 0.35 });
    tone(a, t + 0.18, { from: 880, to: 1320, gain: 0.25, decay: 0.4, type: "triangle" });
    tone(a, t + 0.18, { from: 1320, to: 1760, gain: 0.12, decay: 0.45, type: "sine" });
  },
  // Low double thump for long rallies.
  heart(a, t) {
    tone(a, t, { from: 70, to: 48, gain: 0.5, decay: 0.12 });
    tone(a, t + 0.17, { from: 64, to: 44, gain: 0.35, decay: 0.12 });
  },
  touch(a, t) {
    burst(a, t, { type: "bandpass", freq: 2900, q: 4, gain: 0.18, decay: 0.035 });
    tone(a, t, { from: 760, to: 520, gain: 0.06, decay: 0.04, type: "triangle" });
  },
};
export function playHit(kind, volume = 1) {
  if (volume <= 0) return;
  const a = context();
  if (!a || !VOICES[kind]) return;
  VOICES[kind](a, a.currentTime + 0.01);
}
// Call from a user gesture so later, timer-driven hits are allowed to sound.
export function unlockAudio() {
  context();
}
