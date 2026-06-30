# Phase 67 - Web Matchday Flow Simplification And Half-Time Tactical Decisions

## Goal

Make the web matchday path simpler, cleaner, and more managerial before any
persistence work makes it durable.

The current Phase 66 slice is structurally correct, but it still has too many
competing buttons, duplicate routes, inactive dashboard actions, and noisy shell
regions during matchday. This phase must reduce friction and make every click
serve a real manager decision.

## Product intent

The dashboard is the career command centre. Match preparation and matchday are
focused workspaces opened from that centre.

The target cold flow is:

```text
Dashboard
  -> Prepare match
  -> Auto or manual selection
  -> choose tactic
  -> Save and go to match
  -> Pre-match
  -> Start match
  -> Half-time
  -> substitutions and full tactical-board changes
  -> Start second half
  -> Full time
  -> Continue
  -> clean Dashboard
```

Non-negotiable product principles:

- one screen has one primary action;
- no visible action may be marked available if it does not do anything useful;
- no dashboard bounce after saving match preparation;
- matchday removes Inbox/Posta and unrelated shell noise;
- pre-match keeps an explicit "Start match" ritual;
- half-time always stops and must feel like a useful decision point;
- half-time allows substitutions and full tactical-board changes, including
  changing formation;
- full time has one final primary action: "Continue";
- after full time, the user returns to a clean dashboard;
- future sections may remain visible but must not look like available buttons.

## Architecture intent

This phase is primarily a web and UI-read-model cleanup, but half-time tactical
changes may require a narrow engine contract extension.

Ownership:

- `packages/ui` owns action availability, shell/navigation read models, and any
  matchday/preparation view-model changes;
- `packages/engine` owns any structured half-time tactical-decision application
  that affects second-half simulation;
- `apps/web` owns routing, Zustand adapter state, shell presentation, tactical
  workspace composition, and Playwright QA;
- `packages/i18n` owns all new visible labels;
- `docs/audits` records click counts and visual QA findings.

## Binding constraints

- Read `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` before each
  step and keep the Phase 67 decision aligned.
- Check `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` on every step and update
  only when a step genuinely advances this web matchday flow.
- Use `nvm use 24` before package commands.
- Use Playwright and browser screenshots for visual QA.
- Keep all visible labels localized in the five supported languages.
- Keep engine/domain output structured; no rendered prose from engine/domain.
- Keep Zustand as an adapter; do not calculate match outcomes in React.
- Keep the current visual identity and field SVG intact unless a step
  explicitly changes surrounding layout.
- Keep code readable for a junior developer: clear entry points, small helpers,
  and focused tests.

## What NOT to implement

- No persistence/localStorage/save adapter.
- No new career storage model.
- No market, finances, youth, staff, facilities, archive, or squad section.
- No team talks.
- No opponent tactical board.
- No injuries, suspensions, cards, penalties, extra time, or cup rules.
- No live minute-by-minute replay; this phase simplifies the existing staged
  flow and half-time decision workspace.
- No engine balance tuning unless needed to apply a manager-declared half-time
  tactical decision correctly.
- No hidden automatic selected-club decisions.
- No decorative controls that are not backed by structured behavior.

## Ordered steps

1. [01-current-button-click-and-matchday-flow-audit.md](01-current-button-click-and-matchday-flow-audit.md)
2. [02-shell-action-mode-and-disabled-navigation-cleanup.md](02-shell-action-mode-and-disabled-navigation-cleanup.md)
3. [03-dashboard-single-primary-action-and-dead-action-removal.md](03-dashboard-single-primary-action-and-dead-action-removal.md)
4. [04-match-preparation-save-and-go-to-match.md](04-match-preparation-save-and-go-to-match.md)
5. [05-pre-match-and-full-time-primary-action-cleanup.md](05-pre-match-and-full-time-primary-action-cleanup.md)
6. [06-half-time-tactical-decision-contract.md](06-half-time-tactical-decision-contract.md)
7. [07-half-time-tactical-board-workspace.md](07-half-time-tactical-board-workspace.md)
8. [08-click-count-playwright-accessibility-and-flow-qa.md](08-click-count-playwright-accessibility-and-flow-qa.md)
9. [09-section-quality-review-and-next-phase-decision.md](09-section-quality-review-and-next-phase-decision.md)

## Phase-level checks

Run these at the end of the phase unless a step explicitly blocks earlier:

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-shell-view.test.ts
pnpm exec vitest run packages/ui/src/career/build-career-dashboard-view.test.ts
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm exec vitest run apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx
pnpm exec vitest run apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run test
node --experimental-strip-types apps/web/src/visual-qa/matchday-flow-simplification.spec.ts
pnpm check
git diff --check
```

If code changes are made, also run:

```bash
graphify update .
```

## Definition of Done

- Current button/click flow is audited with a target flow and baseline click
  count.
- Matchday shell hides Inbox/Posta and removes ambiguous global Continue.
- Future navigation sections remain visible but no longer behave like available
  controls.
- Dashboard exposes one meaningful primary action and no dead available actions.
- Match preparation has a top-level "Save and go to match" action and no
  bottom duplicate save action.
- Pre-match has one explicit "Start match" action.
- Half-time always stops and supports selected-club substitutions plus full
  tactical-board changes, including formation changes, without hidden
  automatic choices.
- Full time has one primary "Continue" action and returns to a clean dashboard.
- Playwright desktop/narrow QA proves the reduced-click flow, no horizontal
  overflow, accessible primary actions, and no duplicated meaningless buttons.
- Final report states whether web persistence is now safe to start or whether a
  remaining matchday flow blocker must be fixed first.
