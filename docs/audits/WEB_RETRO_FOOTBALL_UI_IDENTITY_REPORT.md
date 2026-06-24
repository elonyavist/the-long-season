# Web Retro Football UI Identity Report

Date: 2026-06-23
Phase: `53-retro-football-ui-identity-rework`

## Result

PASS.

The web UI now has a strong enough football-management identity to build the
next career web sections on top of it. The app no longer reads as a generic
SaaS dashboard: it now presents a denser club control room, a true left
Inbox/Posta decision rail, and a match-preparation screen centered on a
football pitch/lavagna.

## What Changed

### Visual Identity

- Adopted a Championship Manager / Scudetto-inspired direction.
- Replaced the soft generic dashboard feel with a darker, denser, operational
  football-management surface.
- Added restrained football cues: club-office surfaces, pitch treatment,
  scoreboard-like panels, stronger borders, and sharper action states.

### Tokens And Theme

- Expanded `apps/web/src/styles/tokens.css` with football-specific colors and
  surfaces:
  - club-office dark;
  - pitch green;
  - scoreboard surface;
  - stronger line/border colors;
  - more visible focus ring.
- Updated base/layout/component styles to use the same retro-premium language
  across menu, shell, dashboard, Inbox/Posta, and preparation.

### Shell, Topbar, And Navigation

- Reworked `CareerShell` into a club operations header.
- Added selected-club identity treatment and a compact crest placeholder.
- Added localized context facts supplied by screens.
- Preserved the top career navigation, Main menu action, Continue action, left
  Inbox/Posta rail, and central content outlet.

### Inbox/Posta Rail

- Reworked `CareerInboxPanel` into a more serious decision rail.
- Added action-required visual state, compact counts, priority/status badges,
  related labels, and stronger action placement.
- Kept the panel compact. A full Inbox/Posta message center remains future
  scope.

### Dashboard Control Room

- Reworked `CareerDashboardScreen` so the first useful viewport shows:
  - blockers;
  - next selected-club fixture;
  - preparation readiness;
  - available actions.
- Moved secondary save/world/date facts lower.
- Preserved existing read models and action callbacks.

### Match Preparation Pitch And Squad List

- Reworked `CareerMatchPreparationScreen` around a vertical tactical pitch.
- Kept lineup selection explicit with native selects in each tactical slot.
- Added a compact squad list with name, role, age, fitness, foot, and status.
- Added a player detail panel for selected-player facts.
- Kept tactic profile controls visible and factual.
- Added demo-only player age/foot facts in `apps/web/src/career/match-preparation-demo.ts`
  so the shape can later map to real career state without touching the engine.

### Accessibility And Visual QA

- Added `apps/web/src/visual-qa/retro-football-identity.spec.ts`.
- Ran desktop and narrow Playwright QA with screenshots under
  `/tmp/the-long-season-phase53`.
- Verified:
  - main menu;
  - shell/top navigation;
  - left Inbox/Posta rail;
  - dashboard control room;
  - dashboard and Inbox/Posta paths into match preparation;
  - pitch layout;
  - squad list;
  - tactic selection;
  - save preparation;
  - dashboard blocker clearance;
  - Continue to matchday;
  - no horizontal page overflow;
  - keyboard focus path to the first player select.
- Findings are documented in
  `docs/audits/WEB_RETRO_FOOTBALL_UI_VISUAL_QA.md`.

## Intentionally Out Of Scope

- No new gameplay behavior.
- No full Inbox/Posta Decision Center.
- No full Squad screen.
- No full Tactics screen.
- No Calendar, Fixtures, Market, Finances, Facilities, Youth, Staff, or Archive
  screens.
- No browser save persistence.
- No match simulation or matchday playback.
- No automatic best XI.
- No tactic/player recommendations.
- No market/squad-needs advice.
- No fake production crests.

## Section Completion Review

### Dependency Review

- `@game/ui` remains framework-free and language-agnostic.
- `apps/web` owns browser presentation, demo adapter state, React components,
  and visual QA.
- The engine was not changed.
- No CLI output is parsed by the web app.
- Dependency Cruiser passed.

### Code Quality Review

- The changes are concentrated in the existing web adapter boundaries:
  - screens;
  - components;
  - styles;
  - visual QA;
  - localized labels.
- The match-preparation screen is larger than before, but still readable because
  helpers separate squad-row derivation, formatting, status mapping, and fixture
  formatting.
- Post-review rework extracted the tactical pitch, sortable squad table,
  selected-player fact panel, and shared tactical label helpers into reusable web
  components. `CareerMatchPreparationScreen` now orchestrates those pieces
  instead of owning the future Tactics UI surface directly.
- CSS is growing. This is acceptable through Phase 53 because the project is
  still defining shared visual language. Future section phases should split CSS
  only when repeated patterns make that extraction useful.

### Architecture Review

- The UI remains open to extension through read models and adapters, not direct
  engine coupling.
- Demo player facts added for age/foot are web-adapter facts only and are shaped
  to map to future real career state.
- The future Tactics section should reuse `TacticalPitchLineup`,
  `SquadSelectionTable`, and `PlayerFactPanel`; formation switching and reserve
  bench selection need documented read-model contracts before implementation.
- `App` now resets scroll on screen changes so single-page navigation behaves
  like a real selected-section switch.

### UI/UX Review

- Critical blockers are visible near the top of the dashboard.
- Inbox/Posta reads as a decision rail.
- Match preparation reads as a football tactical screen rather than a form.
- Desktop layout is strong.
- Narrow layout is usable; the squad table is dense, but the player detail panel
  keeps selected-player facts available.

### Accessibility Review

- Landmarks remain available for banner, navigation, complementary Inbox/Posta,
  and main content.
- Native selects and radio buttons preserve keyboard operation.
- Focus path to the first lineup select was verified by Playwright.
- Focus rings remain visible against the dark palette.
- No production accessibility dependency was needed.

### Football Identity Review

- The UI now has a coherent football-management identity across shell,
  dashboard, Inbox/Posta, and match preparation.
- The pitch/lavagna is useful because it carries actual lineup controls.
- The design avoids decorative clutter while still adding football-specific
  cues.

### Fun And Agency Review

- The user now sees the career as a club operations loop, not a static report.
- The first blocking decision, match preparation, feels more like a manager
  action.
- The next best source of agency is the Inbox/Posta Decision Center, because it
  will turn advancement stops into explicit decisions and keep the career loop
  moving like Football Manager / Scudetto.

## Known Non-Blocking Issues

- Narrow squad-list columns are dense. The future full Squad screen should use
  a richer responsive list/table pattern.
- The crest remains a placeholder. Real generated or user-visible club crests
  should be handled in a later club-identity/UI asset phase.
- The full Inbox/Posta center is not implemented yet; the current rail is only
  the compact decision surface.
- Formation switching and reserve-bench selection are not implemented in this
  visual identity phase. They should be implemented as real match-preparation /
  tactics contracts, not as UI-only controls.

## Post-Report Visual Correction

After manual review, the tactical pitch was corrected because it exposed too
much text, showed noisy `valid`/`missing` words inside every slot, and allowed
controls to visually crowd the pitch.

The correction:

- removes visible valid/missing text from pitch slots;
- shows only a compact alert marker when a slot needs attention;
- keeps accessible slot labels for screen readers;
- reduces pitch slot information to position code plus player selector;
- tightens the pitch grid so selectors remain inside their slot;
- adds a fixed-height, scrollable squad table;
- adds local column sorting for the squad table.
- orders each lineup select by slot suitability first, so natural fits appear
  before adapted, weak, and clearly poor fits;
- sorts the squad table role column by tactical position order rather than
  localized broad role text.

`apps/web/src/career/player-position-ordering.ts` owns the reusable web-side
ordering helper for this behavior. It is intentionally outside the React screen
so future Squad and Tactics screens can reuse it without duplicating sorting
rules.

This improves the current visual quality without pretending to solve future
formation switching or reserve selection.

## Verification

Commands passed:

```sh
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run typecheck
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run test
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm --filter @game/web run build
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && node --experimental-strip-types apps/web/src/visual-qa/retro-football-identity.spec.ts
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm depcruise
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && pnpm check
git diff --check
```

## Next Phase Recommendation

Post-review update: the original next-phase recommendation was Inbox/Posta, but
the tactical workspace review showed that match preparation still needs
formation switching and bench selection before Inbox can route to it as a strong
decision screen.

Recommend exactly one next phase:

`Phase 54 - Tactics And Match Preparation Workspace Completion`

Reason: the visual identity is now strong enough, but the highest-value next
section is completing the football decision that currently blocks the career
loop: formation, starting XI, bench, tactic, and save readiness. Inbox/Posta
should follow once it can link to this complete workspace.
