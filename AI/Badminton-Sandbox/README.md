# RALLY LAB · 羽球戰術工作室

Static, dependency-free application served at `/AI/Badminton-Sandbox/` on GitHub Pages. No backend: HTML, CSS and ES modules only, with the session kept in the browser's localStorage. `package.json` and `tests/` are only for local Node tests and are not needed at runtime.

## Preview

From the repository root:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/AI/Badminton-Sandbox/`. Serve over HTTP rather than opening `index.html` directly, because the app uses JavaScript modules.

## Experience

- A skippable first-visit shuttle entrance and a three-step introduction. Help can replay it. System reduced-motion settings are respected; Court Settings also offers a simplified mode.
- A character pool of eight cartoon players (four men, four women). The player studio offers the characters that fit the slot; switching men's / women's / mixed doubles swaps in matching characters while keeping each slot's level, personality and style.
- Four editable cartoon players: name, level 1–18 (default 6) tiered after the Taiwan Badminton Promotion Association scale; level drives per-shot error, shuttle speed (km/h and animation flight time) and outright-winner odds, personality, playing style, face shape, hairstyle, skin tone and accessory.
- Men's / women's / mixed doubles; 21-point or 11-point games; single game or best-of-three.
- Manual shots, automatic rally, automatic match; pause/resume and playback speed.
- Manual shots are resolved by the same level/personality/style model as automatic play (net, out, outright winner), with pre-shot odds shown in Courtside Notes. Court Settings can switch back to route-only mode with a manual point winner.
- Camera views: the tactical diagonal view, plus a perspective camera behind the blue baseline with presets for broadcast and low courtside angles. In the perspective camera, drag vertically on empty court (or use the slider) to raise or lower the camera continuously; a tap still picks a landing spot.
- Per-shot flight time (smash fastest, clears slowest) and three synthesised hit sounds (smash, clear, other) with a sound toggle.
- Draggable court positions and keyboard-accessible player/shot/target buttons. Space plays/pauses when focus is outside an input or button.
- Shot timeline, replay, undo and branching from the state before a selected shot; score and records roll back with the branch.
- Browser-local session persistence. Editing the roster preserves progress; restart explicitly clears the match.
- Inspectable JSON export, file download and clipboard alternatives.

## Implementation

- `model.js`: pure match rules, service slots, shot selection, seeded simulation and trajectories.
- `court.js`: responsive Canvas renderer, tactical (diagonal desktop / frontal mobile) and broadcast perspective projections, inverse touch mapping and image cache.
- `audio.js`: Web Audio synthesis for the three hit sounds; no audio assets.
- `characters.js`: original SVG portraits and expressions, shared between roster and court.
- `app.js`: UI orchestration, animation/replay state, persistence and onboarding.
- `styles.css`: responsive editorial sports interface, keyboard focus and reduced-motion/transparency/contrast variants.

There are no runtime packages. Web fonts use `font-display: swap` and system fallbacks. An internet connection is only needed for the optional font styles; court graphics and characters are local.

## Verification

From this folder:

```powershell
npm.cmd test
```

Nineteen Node tests cover service rules, scoring/deuce/caps, 100 seeded complete series, real net/out destinations, successful flight clearance, hidden-canvas regression, tactical and broadcast projection/inverse mapping, reduced-motion rendering, shot timing/sound classes and level-driven odds. Actual browser checks and outstanding design work are recorded in `DESIGN-QUALITY.md`.

The automatic model is a simplified tactical simulation, not a real-world win probability estimator. Route-only manual mode lets the user declare the rally winner. Service height, double hits and complete collision physics are outside the model.
