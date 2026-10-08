# 羽球模擬器 — design and quality ledger

## Objective
Rebuild both screens as a distinctive, polished badminton tactics experience, using apple-design principles and Awwwards / Webby / FWA award quality as the target. Award eligibility and jury decisions cannot be asserted by local testing.

## Required experience
- Team setup: men's, women's, mixed doubles; four editable profiles, default level 6, personality, playing style, face/hair/skin/accessory customization.
- Court: clear manual / automatic rally / automatic match workflows, pause, speed, readable court and ball, formation, legal service and scoring rotation.
- Animated cartoon characters with facial expressions, consistent identity between portraits and court.
- Actual net / out / missed reception animations match the declared result.
- Review individual shots, replay, branch from a shot, undo, complete export.
- Return to settings preserves the match; explicit restart protects records.
- First visit: fluid shuttle entrance, skippable, readable three-step guidance; reduced-motion equivalent. No artificial load delay.
- Responsive desktop/mobile layouts, keyboard workflow, labels, focus, contrast, reduced motion/transparency.
- Real browser visual review and workflow testing; deterministic engine regression tests.

## Review gates (not yet complete)
- Visual direction, typography, unique sports identity, readable characters.
- Full workflow, valid service, scoring, replay/branch, settings persistence.
- Mobile 390px and narrow desktop; no overflow or tiny primary controls.
- Console errors, hidden-canvas regression, font/resource fallback.
- Onboarding, reduced motion, keyboard and dialog behavior.

## Iterations
1. Existing prototype reviewed. Hidden canvas render crash had been fixed, but controls are dense, settings clear match progress, characters lack faces, and automatic outcomes are visually inconsistent. Rebuilding the shell and model to address these together.
2. Rebuilt as a warm-paper sports editorial identity, with four custom SVG cartoon portraits and a matching Canvas character renderer. Added a skippable first-visit shuttle entrance and three-step guide, replayable from Help. Profiles have face/hair/skin/accessory controls and instant preview.
3. Browser review exposed mobile grid overflow from timeline intrinsic sizing, an orphan headline, and a mode-selector synchronization error. Fixed all three. Moved the point result into the court margin so character reactions remain visible. Added a sticky mobile editor action bar.
4. Engine / rendering verification: `npm test` passes 10 tests. Includes 100 seeded complete series, service parity/rotation, deuce/caps, receiver restrictions, successful net clearance, actual out/net destinations, hidden-canvas initialization, coordinate mapping and reduced-motion geometry.
5. Actual browser workflow: manual serve/point, timeline review/fork restoring score, edited name/level/appearance, return-to-settings persistence, mobile 390px no horizontal overflow, automatic single rally stopping, and a full 11-point best-of-three series completed 2–0 over 37 rallies / 272 shots. Export preview confirms all 37 archived rallies, four profiles, final result and all 272 shots. The in-app browser did not emit a download completion event; added inspectable export with file and clipboard alternatives instead of asserting successful download.

## Current evidence / remaining audit
- First-visit mobile screenshot: output/rally-lab/onboarding-mobile.jpg.
- Desktop 1440px and mobile 390px / 320px reviewed. No horizontal overflow in measured DOM geometry. Desktop uses a diagonal court and mobile a frontal court; actual pointer target selection and inverse-mapping tests agree.
- Actual pause/resume verified mid-shot. First-visit guide verified in standard and simplified motion, skip returns to setup, and replay is available from Help. Final post-edit browser console reported no errors or warnings.
- Screenshots: output/rally-lab/setup-desktop.jpg, court-desktop.jpg, onboarding-desktop.jpg and onboarding-mobile.jpg. Actual match export counts are in output/rally-lab/browser-verification.json.
- Further quality work: strengthen contextual coaching from actual shot geometry, review readability and keyboard flow with larger text, and run cross-browser / performance checks. These remain part of the original award-quality objective.
- Award-quality is an aspirational design target. No award received or jury assessment is claimed; the active objective remains open while the remaining gates are checked.
- Keyboard audit: choosing a shot previously replaced its button and lost focus. Controls now reuse keyed button elements; actual browser Enter activation keeps focus on the selected shot with aria-pressed=true. All 10 engine/render tests still pass. Replayed onboarding and saved output/rally-lab/onboarding-current.jpg.
- Contextual coaching now describes intended zone and measured pre-shot receiver distance, with designated service receiver and explicit distance/outcome distinction. Net/out events describe actual failure instead of claiming planned placement. Used in target selection, completed shots and historical review. Two regression tests added (12 total passing); live browser target selection displayed correct zone/distance and console remained clear. Evidence: output/rally-lab/coaching-current.jpg. Larger-text, cross-browser and performance audit remain open.

## Sources
- Apple-design skill: C:/Users/dan40/.codex/skills/apple-design/SKILL.md
- Webby judging criteria: https://www.webbyawards.com/judging-criteria/
- Awwwards mobile excellence guidelines: https://www.awwwards.com/mobile-excellence-guidelines.pdf


## Playtest implementation — 2026-10-04
- Mobile court stays visible while choosing shots. Recommended shots can expand to all 13; transport adds a skill shortcut. Playing expands the court and hides the tactical controls until completion.
- Arcade/Tactical pacing; increased pressure from power shots, weak returns, faster momentum gain. Probability totals remain valid. Tactical keeps the original per-shot odds while using the shared faster momentum pacing.
- High-level ability budget caps at 40; legacy all-10 saves migrate to style presets. Two specialties exchange stat points and feed speed, odds and the radar.
- Signature workshop: base move, speed/deception/control bonus, charge/risk cost, four colors, trial animation. Active costs work in manual and auto play; passive Wall supports identity/color at its original 100-point cost. Player-card sharing and local saves preserve both workshop and specialties.
- 40 tests pass, including 40 full seeded series across both pacing modes and custom skills, plus specialty/share/charge/weak-return regressions. Browser checked mobile recommended/all shots, settings, trial canvas, fixed transport, expanded court and no console errors. Dialog overflow found in review and corrected with intrinsic-width constraints.
- Assets use explicit build versions to prevent stale module/style mixing after updates. No deployment or push performed.


## Character roster verification — 2026-10-05

- Desktop: existing paper/sports layout, two team panels, compact character grid, right-side detail drawer. Mixed doubles shows all 16 characters; men's and women's modes show the eight eligible characters.
- Mobile at 390 × 844: two-column roster, document width equals viewport width (390 px), detail sheet anchored to the bottom (88dvh).
- Browser interaction verified: full Ethan preset into Player Studio; Studio replacement with Brain; mixed-mode gender replacement; tap assignment of Luna; removal disables court entry; refilling enables it; tap swap between women's slots; entry to the existing court with the assigned lineup; reload keeps saved profiles.
- Drag handlers use the same assignment / swap rules as tap actions; pure tests verify stable characterId, uniqueness, gender restrictions and retained customized appearance. Synthetic drag through the in-app browser did not produce a drop, so native desktop drag still needs manual verification in Chrome.
- Full Node suite: 53 / 53 pass, including 100 seeded complete matches, probability invariants, tendency distribution, immutable templates, old profile migration and shared-card compatibility.

## Shot targets and portraits verification — 2026-10-08

- 57 / 57 Node tests pass. New coverage verifies all service diagonals and score parity, short/long depth rejection, rally target filtering, midpoint updates, intended waist receiver and successful waist-height contact; existing seeded match and net-clearance checks remain green.
- Chrome at 1440 × 1000 and 390 × 844: short/high/flick switching exposes only the corresponding three targets, clears incompatible selections, and rejects court taps in the wrong depth zone. Rally lifts show rear targets, net shots show front targets; between-player and left/right waist choices select correctly and complete a manual rally.
- Real pointer drags move opponents and update the selected waist target and midpoint. Both viewport widths have no horizontal document overflow; the court has nonblank pixels after rendering. The mobile canvas can briefly be cleared during a resize, so pixel checks wait for the next rendered frame.
- Visual review covers men's team portraits, all eight women's portraits, the court, short-service controls and the expanded waist-target grid. New hair/accessory selections persist after reload; rendered SVGs parse without errors and both browser passes report no page errors.
- Local screenshots were inspected in `/tmp/badminton-qa/`; they are transient QA evidence, not repository deliverables. Existing wider design-audit items above remain unchanged.
