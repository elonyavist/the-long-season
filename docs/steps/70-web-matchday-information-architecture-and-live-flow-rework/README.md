# Phase 70 - Web Matchday Information Architecture And Live Flow Rework

## Goal

Rework the matchday screen into a clear, football-first match centre before
browser persistence is implemented.

The current matchday is functional, but product review rejected it because the
screen scatters information across large panels, exposes debug-like labels, and
does not make the match feel like the emotional payoff of preparation.

This phase replaces that information architecture with a focused five-state
flow:

1. pre-match confirmation;
2. first-half live screen;
3. half-time decision screen;
4. second-half live screen;
5. full-time review.

## Product intent

The matchday must feel closer to a modern Football Manager match centre with a
sober retro skin:

- one clear job per phase;
- one primary command per phase;
- compact phase indicators, not button-like tabs;
- a dominant but not wasteful score header;
- a visual tabellino for goals, penalties, cards, injuries, and substitutions;
- goals more prominent than secondary events;
- player ratings directly under the full-time tabellino;
- tactical-board decisions only where the user can actually change something;
- no empty report panels;
- no debug labels such as `Live line`, `Next command`, or raw next-action
  diagnostics.

## User-approved decisions

- Pre-match is only confirmation and start. No last-minute tactical editing on
  the matchday pre-match screen.
- The first and second halves need intermediate live screens.
- Full time shows the tabellino first, then player ratings immediately below.
- Match phases are visual progress indicators only. They must be smaller and
  must not look like clickable buttons.
- Full-time primary action returns to the dashboard.

## Architecture intent

The matchday UI remains an Adapter over structured facts.

- Engine/domain keep producing structured, language-agnostic match facts.
- `@game/ui` may expose framework-free read models or presenters when shared
  logic is needed.
- `apps/web/src/features/matchday` owns React composition, local display state,
  and browser-only event playback.
- Event playback may reveal already-generated structured events progressively,
  but must not create gameplay truth or mutate engine results.
- Cards, injuries, penalties, and substitutions are rendered only when real
  structured facts exist. Do not invent fake events to fill the tabellino.
- Tactical-board behavior remains owned by the existing shared board modules.

## Binding constraints

- Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`,
  `docs/ARCHITECTURE.md`,
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`, and
  `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` before each step.
- Check `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` on every step and update
  the relevant Phase 70 progress note.
- Use `nvm use 24` before package commands.
- Keep every visible label localized in Italian, English, German, Spanish, and
  French.
- Do not parse CLI output in the web app.
- Do not add runtime LLM behavior.
- Use Playwright/browser screenshots for every browser-rendered step.
- Keep WCAG 2.2 AA as the working target: keyboard access, visible focus,
  semantic regions, accessible names, and no essential state conveyed by color
  alone.
- Preserve the approved tactical-board component and pitch visual language.
- If a slice still looks like a log table or a generic dashboard, the step is
  not done.

## What NOT to implement

- No browser persistence or save-list lifecycle.
- No new career storage model.
- No team talks.
- No opponent tactical board.
- No active extra time or penalties until cup rules exist.
- No fake cards, injuries, penalties, or substitutions.
- No animated 2D/3D match viewer.
- No engine tuning for UI cosmetics.
- No new market, finance, youth, staff, facilities, or archive sections.
- No new theme palette work.
- No decorative panels that do not map to current structured match facts.

## Ordered steps

1. [01-current-matchday-information-architecture-audit.md](01-current-matchday-information-architecture-audit.md)
2. [02-matchday-event-priority-and-view-model-contract.md](02-matchday-event-priority-and-view-model-contract.md)
3. [03-compact-score-header-and-phase-indicator.md](03-compact-score-header-and-phase-indicator.md)
4. [04-pre-match-confirmation-only-screen.md](04-pre-match-confirmation-only-screen.md)
5. [05-first-half-live-screen-and-event-playback.md](05-first-half-live-screen-and-event-playback.md)
6. [06-half-time-decision-screen-recomposition.md](06-half-time-decision-screen-recomposition.md)
7. [07-second-half-live-screen-and-match-pressure.md](07-second-half-live-screen-and-match-pressure.md)
8. [08-full-time-tabellino-ratings-and-dashboard-return.md](08-full-time-tabellino-ratings-and-dashboard-return.md)
9. [09-copy-localization-and-accessibility-pass.md](09-copy-localization-and-accessibility-pass.md)
10. [10-playwright-visual-qa-fun-review-and-phase-report.md](10-playwright-visual-qa-fun-review-and-phase-report.md)

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

The final step must run Playwright screenshot QA for desktop and narrow
viewports across at least pre-match, first half, half-time, second half, and
full time.

## Definition of Done

- Pre-match is a clean confirmation screen with exactly one primary action:
  start match.
- First half and second half each have a real intermediate live screen.
- Phase indicators are compact visual progress, not large clickable tabs.
- The score header is dominant, compact, and does not waste vertical space.
- The tabellino prioritizes goals visually and renders secondary events with
  lower emphasis.
- Full time shows tabellino first and player ratings immediately below.
- Full time returns to dashboard through one clear primary action.
- Empty event/stat panels are not shown.
- Debug labels and raw technical diagnostics are removed from user-facing UI.
- The matchday flow is keyboard reachable and has visible focus.
- Playwright screenshots show no clipped text, overlap, horizontal overflow, or
  log-table feeling.
- The final report documents dependency, code quality, architecture, UI/UX,
  accessibility, and fun review before recommending exactly one next phase.
