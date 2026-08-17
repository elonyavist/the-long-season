# Step 09 - Full Time Football Story And Consequence Hierarchy

## Status

Done.

## Goal

Turn full time into a concise football story: result, decisive tabellino,
selected-club ratings, durable consequences, and one return to Dashboard.

## Findings Closed

- Full-time portion of `Q-P1-04` technical content leaks.
- Full-time portion of `Q-P1-05` flattened hierarchy.
- Final phase decomposition portion of `Q-P1-10`.
- Full-time table and narrow-layout portions of `Q-P2-01` and `Q-P2-05`.

## User-Visible Outcome

- The final score and result dominate with restrained operational typography.
- Goals and penalties are prominent; cards, injuries, and substitutions are
  quieter but still scannable from structured facts.
- Selected-club ratings show role, condition, and contribution without a
  horizontal page scrollbar.
- Durable condition and career consequences appear only after full time.
- One Return to Dashboard action closes the match review.

## Scope

1. Extract one `MatchdayFullTimePhase` composition from the current screen.
2. Define event priority and grouping using existing structured match facts.
3. Present selected-club ratings in a responsive football-specific hierarchy.
4. Present durable consequences after ratings without repeating diagnostics.
5. Omit unavailable optional facts rather than rendering `unknown`, `none`,
   raw IDs, or empty technical labels.
6. Keep exactly one return action and preserve idempotent full-time commit.
7. Cover win, draw, loss, event-rich, and event-light outcomes.

## Implementation Contract

- The UI may prioritize or format structured facts but may not invent narrative
  events, causes, quotes, or player judgments.
- Ratings and consequences remain deterministic engine/application facts.
- Event priority must not hide a card, injury, penalty, substitution, or goal.
- Consequences do not appear in pre-match, live, or half-time states.
- Returning to Dashboard acknowledges the review; it does not simulate or save
  a second result.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.test.tsx`
- `apps/web/src/runtime/web-career-runtime.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No generated commentary, prose story, LLM copy, or inferred causal claim.
- No engine event, rating, consequence, or balance change.
- No media, press, fan, board, finance, or morale reaction.
- No all-player diagnostic dump or horizontal desktop-style data grid on narrow
  screens.
- No duplicate Dashboard/Continue action.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Capture win, draw, loss, event-rich, event-light, desktop, narrow, and 200%
  text full-time states.
- Verify result, tabellino, ratings, consequences, and return action read in
  that order without scrolling sideways.
- Verify goals/penalties have higher visual priority than cards, injuries, and
  substitutions without hiding the latter.
- Verify no technical ID, fallback word, duplicated action, or diagnostic dump
  appears.
- Refresh before and after returning; verify one committed result and coherent
  Dashboard/Posta state.

## Cleanup Boundary

Delete replaced full-time cards, fallback branches, duplicate next actions,
obsolete selectors, inline phase JSX, and dedicated dead tests after the new
current composition and idempotent journey are covered.

## Completion Criteria

- Full time reads as a football result, not a technical report.
- Every current structured event remains discoverable at the right priority.
- Ratings and consequences are responsive and factually exact.
- One return action completes the journey exactly once.
- No dead fallback, duplicate action, or inline full-time branch remains.

## Implementation

- Added `MatchdayFullTimePhase` as the single full-time composition owner.
- Extended the pure matchday presenter with selected-club ratings, ordered
  tabellino groups, deterministic result state, and presentation-relevant
  durable consequences derived only from existing structured facts.
- Promoted goals and penalties above secondary incidents while keeping cards,
  injuries, and substitutions discoverable.
- Replaced the all-player technical table with a responsive selected-club
  rating list that omits unavailable role, contribution, and condition facts.
- Merged each player's meaningful durable consequences into one compact item.
  Ordinary team-wide result reasons and the normal post-match fitness cost are
  not repeated per player because the score and rating rows already expose
  those facts.
- Reduced the focused matchday shell to score/review content plus one Return to
  Dashboard command; the right rail and duplicate exit paths are absent.
- Added localized full-time outcome, tabellino, event, rating, consequence,
  and focused-navigation copy across every supported locale.
- Replaced the old inline full-time grids, diagnostic fallbacks, selectors, and
  dedicated tests after the new composition had equivalent deterministic
  coverage.

## Verification

- Node `24.19.0` active.
- i18n tests PASS.
- Web tests PASS: 54 files / 229 tests.
- Web typecheck and build PASS; the existing non-blocking large-chunk warning
  remains unchanged.
- Canonical Playwright PASS: 12/12, covering explicit win/draw/loss,
  event-rich, event-light, desktop, narrow, and 200% text states under
  `/tmp/the-long-season-phase73b/step-09/`.
- Dependency Cruiser PASS: 510 modules / 1,809 dependencies, zero violations.
- Full `pnpm check` PASS: 167 files / 984 tests.
- `git diff --check` PASS.
- `graphify update .` PASS: 15,606 nodes, 24,154 edges, 1,037 communities.

## Lessons Learned

- Consequence hierarchy must reflect a manager's decision value, not merely the
  number of available structured deltas. Team-wide result facts and routine
  match fatigue become noise when repeated once per player.
- A narrow 200% text check catches min-content pressure that ordinary mobile
  screenshots do not; the scoreboard and action row need explicit reflow
  behavior even when the page has no horizontal scrollbar at default text.
