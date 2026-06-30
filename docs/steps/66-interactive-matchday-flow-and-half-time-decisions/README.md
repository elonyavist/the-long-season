# Phase 66 - Interactive Matchday Flow And Half-Time Decisions

## Goal

Replace the Phase 65 "play once and show a report" matchday with a real
football-manager matchday flow: pre-match, first half, half-time decisions,
second half, and full time.

The user must feel that the match is a playable event, not a log table.

## Product intent

The match is one of the core emotional loops of the game. The manager prepares,
watches the first half, reads what is happening, makes decisions at half-time,
then sees the consequences.

This phase must improve fun and clarity before persistence. Persisting the
current Phase 65 matchday would make a weak experience durable.

Non-negotiable product principles:

- the match UI must look like a football-management match centre, not a debug
  report;
- the manager must understand the match state at a glance;
- half-time must create a real decision point;
- player ratings must be derived from structured football facts, not random
  cosmetic numbers;
- clicks must be reduced: when Continue reaches matchday, the route to the
  match centre must be direct and obvious;
- consequences belong to full time, not mixed into the live match state.

## Architecture intent

Phase 65 currently calls the full fixture progression path in one action. Phase
66 must introduce a staged matchday path without making React or Zustand own
game rules.

The intended ownership is:

- `packages/engine` owns staged match simulation and deterministic period
  boundaries;
- `packages/domain` owns any durable language-agnostic contracts needed for
  match phase, substitutions, ratings, or future period types;
- `packages/ui` owns matchday view models for each phase of the match;
- `apps/web` owns browser interaction, local demo adapter state, routing, and
  presentation;
- `packages/i18n` owns all visible labels;
- `apps/web/src/visual-qa` owns screenshot and accessibility QA.

Extra time and penalties must be structurally considered but not activated until
cup rules exist. Do not build fake extra-time/penalty UI or uncalled code paths
just to say they are ready.

## Binding constraints

- Read `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` before each
  step and keep it aligned with this new Phase 66 decision.
- Check `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` on every step and update
  only when a step genuinely advances the matchday section.
- Use `nvm use 24` before package commands.
- Use Playwright and browser screenshots for visual QA.
- Keep labels localized through the existing i18n path.
- Keep UI read models language-agnostic where possible.
- Keep engine/domain output structured; no runtime LLM/narrative prose.
- Do not parse CLI output.
- Keep UI state in Zustand and keep engine rules out of Zustand.
- Preserve the accepted visual identity system; this phase may redesign the
  matchday screen layout, not the global theme system.
- Do not change the tactical pitch SVG unless a documented step requires a
  local layout fix around an existing component.
- Keep code readable for a junior developer: small files, clear entry points,
  TSDoc/JSDoc where it explains contracts, and tests around engine/adapters/read
  models.

## What NOT to implement

- No persistence/localStorage/save adapter.
- No full animated 2D or 3D match viewer.
- No team talks unless a later step explicitly documents them; this phase is
  about substitutions, ratings, phase flow, and presentation.
- No opponent tactical board.
- No injuries, suspensions, press conferences, scouting, finances, contracts,
  market, staff, training, or cup-system implementation.
- No active extra time or penalties until cup rules exist.
- No fake player ratings.
- No hidden automatic user-club decisions.
- No engine tuning just to make the web screen look better.
- No decorative match UI that is not backed by real structured facts.

## Ordered steps

1. [01-current-matchday-flow-and-ui-audit.md](01-current-matchday-flow-and-ui-audit.md)
2. [02-engine-staged-match-progression-contract.md](02-engine-staged-match-progression-contract.md)
3. [03-half-time-snapshot-and-player-ratings-foundation.md](03-half-time-snapshot-and-player-ratings-foundation.md)
4. [04-substitution-decision-contract-and-engine-application.md](04-substitution-decision-contract-and-engine-application.md)
5. [05-ui-matchday-phase-read-model.md](05-ui-matchday-phase-read-model.md)
6. [06-web-demo-staged-matchday-adapter-and-store-flow.md](06-web-demo-staged-matchday-adapter-and-store-flow.md)
7. [07-match-centre-visual-redesign.md](07-match-centre-visual-redesign.md)
8. [08-half-time-substitution-and-rating-ui.md](08-half-time-substitution-and-rating-ui.md)
9. [09-dashboard-continue-click-flow-rework.md](09-dashboard-continue-click-flow-rework.md)
10. [10-playwright-accessibility-and-fun-qa.md](10-playwright-accessibility-and-fun-qa.md)
11. [11-section-quality-review-and-phase-report.md](11-section-quality-review-and-phase-report.md)

## Phase-level checks

Run these at the end of the phase unless a step explicitly blocks earlier:

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm exec vitest run packages/engine/src/match-engine/player-match-rating.test.ts
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm --filter @game/web run test
node --experimental-strip-types apps/web/src/visual-qa/interactive-matchday-flow.spec.ts
pnpm check
git diff --check
```

If code changes are made, also run:

```bash
graphify update .
```

## Definition of Done

- The current matchday UX and engine gap is audited before implementation.
- The engine can deterministically progress a match to half-time and later to
  full time without simulating the whole fixture in one opaque web action.
- Half-time exposes structured score, event, stat, condition, and rating facts.
- The user can make half-time substitutions for the selected club.
- Player ratings exist as deterministic derived facts from structured match
  events/stats/context.
- The web match centre has a compact dominant scoreboard, visual event timeline,
  phase panel, useful player table, and full-time-only consequences.
- Continue/dashboard/Inbox routes make matchday direct and obvious.
- Playwright desktop/narrow QA proves the flow is visually credible,
  accessible, and not a log table.
- The final report states whether persistence is now the next phase or whether
  another matchday blocker must be fixed first.
