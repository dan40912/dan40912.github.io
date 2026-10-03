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
