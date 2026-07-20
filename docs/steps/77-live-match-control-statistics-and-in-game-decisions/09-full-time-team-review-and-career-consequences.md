# Step 09 - Full-Time Team Review And Career Consequences

## Status

Done.

## Goal

Close the live match with a concise football review that commits one coherent
fixture result and explains selected-club consequences before returning to the
Dashboard.

## User-Visible Outcome

- The final result and cumulative tabellino remain visible above three tabs:
  `Riepilogo`, `La tua squadra`, and `Avversario`.
- The selected-club tab combines final ratings, condition, form/morale changes,
  injuries, and suspensions.
- The opponent tab shows only observable match facts.
- One `Continua` command commits the completed fixture and returns to the
  Dashboard with updated table, availability, Posta, and career state.

## Scope

1. Keep the final score and cumulative tabellino stable above full-time tabs.
2. Build `Riepilogo` from final team statistics and decisive structured facts.
3. Build `La tua squadra` from final ratings, role, contribution, condition,
   condition delta, form/morale delta, injury diagnosis, return date, cards,
   and suspension.
4. Build `Avversario` from public ratings, role, contribution, cards, injuries
   visible in the match, and final condition where observable; exclude hidden
   morale/form consequences.
5. Integrate each team's observable consequences into its own team tab; do not
   retain a fourth consequences tab or a duplicate consequence panel.
6. Reuse the same live rating projection as the final consolidated rating.
7. Commit result, participation, condition, form/morale, injury, discipline,
   table, and Posta consequences exactly once through the canonical career
   use-case.
8. Make `Continua` the only final primary command and return to Dashboard after
   successful commit.
9. Preserve the current save cadence: fixture commit changes in-memory career
   truth, while manual/autosave policy decides when the durable save is written.
10. Provide immediate pending/success/error feedback and preserve the full-time
   screen if commit fails.
11. Remove superseded consequence panels, duplicate team lists, and obsolete
    return-to-club actions after all callers move.

## Implementation Contract

- Full-time tabs are projections of one final report and one committed career
  result, not separate calculations.
- `Continua` is idempotent/locked against duplicate commit.
- Career mutation remains in engine/use-case owners; React only invokes the
  command and renders returned facts.
- Failure does not discard the completed in-memory match review or navigate
  away.
- Motion marks the full-time checkpoint and selected tab change but never owns
  commit timing or navigation correctness.

## Expected Files

- `packages/engine/src/match-engine/create-match-report.ts`
- focused final-report tests
- `packages/engine/src/career/progress-fixture.ts`
- `packages/engine/src/career/career-match-state-consequences.ts`
- `packages/engine/src/career/career-condition-consequences.ts`
- `packages/engine/src/career/career-inbox-lifecycle.ts`
- focused career commit/consequence tests
- `packages/ui/src/career/career-matchday-view.ts`
- focused `@game/ui` tests
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayTeamRatings.tsx`
- new focused full-time tab/team review components under the same feature
- Matchday presenter/adapter/runtime files required for final commit
- focused web tests
- `apps/web/src/styles/components.css` and feature-owned styles/tokens
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No separate `Torna al club` action, press conference, awards, finance gate,
  opponent hidden morale, replay viewer, share card, or narrative summary.
- No second consequence calculator in UI.
- No immediate forced autosave or per-match save-policy change.
- No duplicate result commit or fallback mutation path.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Complete wins, draws, losses, injury matches, and red-card matches.
- Compare live ratings/statistics to full-time values and confirm no fact resets
  or changes owners.
- Use `Continua` once and confirm Dashboard table, player availability, and
  Posta reflect the committed match.
- Force a commit failure and confirm the review stays visible with a useful
  retry path and no duplicate consequence.

## Completion Criteria

- Full time explains result and selected-club consequences without information
  duplication.
- The opponent view exposes only public facts.
- One idempotent `Continua` command commits and returns to Dashboard.
- Superseded panels/actions and duplicate consequence paths are removed.
- Step 10 remains the only next implementation step.
