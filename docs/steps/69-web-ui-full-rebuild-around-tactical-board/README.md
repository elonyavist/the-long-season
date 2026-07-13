# Phase 69 - Web UI Full Rebuild Around Tactical Board

## Goal

Rebuild the `apps/web` UI from a clean, maintainable presentation language while
preserving the approved tactical board.

The approved design source is:

- `docs/superpowers/specs/2026-06-30-web-ui-redesign-design.md`

This phase supersedes the partially executed Phase 68 implementation direction.
Phase 68 produced the UX reset and approval gate; Phase 69 is the operational
implementation plan for the approved full web UI rebuild.

## Product intent

The first MVP must feel like a modern Football Manager style desktop product
with a sober retro skin:

- persistent sidebar with all major sections visible;
- persistent right rail for career context, Continue, and manager attention;
- compact, dense, football-first screens;
- the tactical board as the visual anchor;
- fewer actions, clearer hierarchy, and no debug-table feeling;
- each visible control must map to useful manager intent.

## Execution mode

This phase is intentionally approval-gated by visual slices.

Unlike earlier automated implementation phases, do **not** execute this entire
phase in one uninterrupted pass. Each step must:

1. implement one small UI slice;
2. run its checks;
3. capture or expose the slice in the browser;
4. update `docs/PROJECT_STATUS.md`;
5. stop and let the user visually review it before the next step starts.

The user may request rework after any step. Rework belongs to the current step
until the visible slice is accepted.

## Preserved tactical-board invariant

Do not rewrite or casually modify the tactical-board logic.

Preserve:

- `apps/web/src/features/tactics-board/tactical-board-geometry.ts`;
- `apps/web/src/features/tactics-board/tactical-board-roles.ts`;
- `apps/web/src/features/tactics-board/tactical-board-interactions.ts`;
- `apps/web/src/features/tactics-board/tactical-board-suitability.ts`;
- `apps/web/src/features/tactics-board/tactical-board-formations.ts`;
- `apps/web/src/features/tactics-board/tactical-board-state.ts`;
- `apps/web/src/features/tactics-board/tactical-board-bench.ts`;
- `apps/web/src/features/tactics-board/tactical-board-squad.ts`;
- `apps/web/src/features/tactics-board/tactical-board-adapters.ts`;
- `apps/web/src/features/tactics-board/tactical-board-types.ts`;
- `apps/web/src/features/tactics-board/components/TacticalBoardPitchMarkings.tsx`;
- pointer, drag, long-press, and context-menu behavior in
  `TacticalBoardPitch.tsx`.

Only tactical-board chrome CSS may be isolated or re-skinned when the step says
so. The pitch SVG and board behavior remain the anchor.

## Architecture intent

Rebuild the web presentation without hiding complexity in a new mess.

Ownership:

- `apps/web/src/app` owns top-level routing and preferences only;
- `apps/web/src/features/app-shell` owns persistent sidebar/right rail layout;
- `apps/web/src/features/app-entry` owns the menu outside the shell;
- `apps/web/src/features/dashboard` owns the career command centre;
- `apps/web/src/features/match-preparation` owns the tactical preparation
  workspace around the shared board;
- `apps/web/src/features/matchday` owns the broadcast-style match centre;
- `apps/web/src/shared/ui` owns only reusable presentation units that are used
  by at least two real screens or are already shared by this phase;
- `apps/web/src/styles` owns the single visual identity, base reset, shell
  layout, screen styles, and isolated tactical-board CSS;
- `packages/ui` remains framework-free and language-agnostic;
- `packages/i18n` owns every visible label in all five supported languages.

## Binding constraints

- Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/ARCHITECTURE.md`,
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`,
  `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`, and the approved
  redesign spec before each step.
- Check `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` on every step and update
  the relevant progress note.
- Use `nvm use 24` before package commands.
- Use Playwright/browser screenshots for every browser-rendered step.
- Keep visible labels localized in Italian, English, German, Spanish, and
  French.
- Keep engine/domain output structured; no rendered prose from engine/domain.
- Do not parse CLI output in the web app.
- Keep Zustand as browser adapter state, not a gameplay engine.
- Remove obsolete callers and styles as soon as their replacement owns the
  screen; do not defer obvious dead code.
- If a file becomes hard for a junior developer to follow, split by real Module
  ownership instead of adding comments around unclear code.

## What NOT to implement

- No new gameplay systems.
- No persistence/localStorage rewrite.
- No market, finances, youth, staff, archive, facilities, or squad feature
  implementation beyond visible disabled navigation entries.
- No runtime LLM.
- No team talks, opponent tactical board, cards, penalties, injuries, cup extra
  time, or live replay.
- No new tactical-board replacement.
- No theme-palette expansion.
- No decorative placeholder data.
- No dead screens that cannot be reached and tested in browser.
- No UI-only state that cannot map to existing career facts.

## Ordered steps

1. [01-app-entry-single-identity-and-theme-removal.md](01-app-entry-single-identity-and-theme-removal.md)
2. [02-tactical-board-css-isolation-and-visual-lock.md](02-tactical-board-css-isolation-and-visual-lock.md)
3. [03-base-layout-foundation-and-focus-language.md](03-base-layout-foundation-and-focus-language.md)
4. [04-shared-ui-primitives-rebuild-in-place.md](04-shared-ui-primitives-rebuild-in-place.md)
5. [04a-responsive-squad-list-information-rework.md](04a-responsive-squad-list-information-rework.md)
6. [05-app-shell-sidebar-and-right-rail.md](05-app-shell-sidebar-and-right-rail.md)
7. [06-dashboard-command-centre-rebuild.md](06-dashboard-command-centre-rebuild.md)
8. [07-posta-attention-rail-and-navigation-states.md](07-posta-attention-rail-and-navigation-states.md)
9. [08-match-preparation-board-first-layout.md](08-match-preparation-board-first-layout.md)
10. [09-match-preparation-tabs-and-save-flow.md](09-match-preparation-tabs-and-save-flow.md)
11. [10-matchday-broadcast-pre-match-and-phase-frame.md](10-matchday-broadcast-pre-match-and-phase-frame.md)
12. [11-matchday-half-time-board-decision.md](11-matchday-half-time-board-decision.md)
13. [12-matchday-full-time-compact-result.md](12-matchday-full-time-compact-result.md)
14. [13-legacy-code-and-css-removal.md](13-legacy-code-and-css-removal.md)
15. [14-visual-qa-accessibility-and-phase-report.md](14-visual-qa-accessibility-and-phase-report.md)

## Phase-level checks

Run these at the end of the phase unless a step blocks earlier:

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm check
git diff --check
```

If source code changes are made, also run:

```bash
graphify update .
```

The final step must also run the rebuilt Playwright visual QA suite for desktop
and narrow viewports.

## Definition of Done

- The web app has one approved visual identity, not multiple experimental
  palettes.
- App entry, dashboard, match preparation, and matchday use the new shell or
  full-screen entry language consistently.
- Sidebar shows all major sections, with unavailable sections visibly inert and
  not misleading.
- The right rail gives career context and manager attention without becoming a
  second dashboard.
- Match preparation uses the approved tactical board as the dominant object:
  field left, bench below, tabs right.
- Matchday is a broadcast-style experience, not a log table.
- Tactical-board logic and pitch markings remain protected.
- Obsolete theme/shell/screen CSS and React files are removed when no longer
  referenced.
- All visible labels are localized.
- Playwright screenshots prove the main flow at desktop and narrow widths.
- `pnpm check` passes.
