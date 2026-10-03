// Synthesised racket sounds, so the app stays asset-free.
// smash: a hard crack with a low body thump and a whoosh.
// clear: a deep, round "thock" for lifts, clears and long serves.
// touch: a light tick for net shots, drives, drops and short serves.
let ctx = null,
  noise = null;
function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function burst(a, t, { type, freq, q = 1, gain, decay, sweepTo }) {
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
  src.connect(filter).connect(amp).connect(a.destination);
  src.start(t);
  src.stop(t + decay + 0.02);
}
function tone(a, t, { from, to, gain, decay, type = "sine" }) {
  const osc = a.createOscillator(),
    amp = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + decay);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.003);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  osc.connect(amp).connect(a.destination);
  osc.start(t);
  osc.stop(t + decay + 0.02);
}
const VOICES = {
  smash(a, t) {
    // Racket whoosh first, then the crack at contact.
    burst(a, t, { type: "bandpass", freq: 900, sweepTo: 3200, q: 0.8, gain: 0.12, decay: 0.07 });
    const hit = t + 0.05;
    burst(a, hit, { type: "highpass", freq: 2400, gain: 0.55, decay: 0.05 });
    burst(a, hit, { type: "bandpass", freq: 1500, q: 2, gain: 0.35, decay: 0.07 });
    tone(a, hit, { from: 170, to: 70, gain: 0.32, decay: 0.12 });
  },
  clear(a, t) {
    burst(a, t, { type: "bandpass", freq: 1150, q: 3, gain: 0.32, decay: 0.09 });
    tone(a, t, { from: 340, to: 190, gain: 0.2, decay: 0.11, type: "triangle" });
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
