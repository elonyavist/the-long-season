# Step 13 - Explicit Lineup Selection And Tactics Synchronization

## Status

Done.

## Goal

Let Squad actions edit the same current plan used by Tactics, preparation, and
Matchday, with explicit replacement and no hidden selection.

## User-Visible Outcome

The manager can field or remove a player from the Squad table, choose exactly
which occupied slot to replace, then see the same plan on the Tactics board and
at the next match.

## Scope

1. Enable the separate Tactics navigation destination around the approved
   shared tactical board and bench.
2. Reuse the current canonical plan store/command boundary across Squad,
   Tactics, preparation, and Matchday.
3. Add `Field`, `Remove`, and bench/selection actions to the Squad table where
   current state permits them.
4. When XI is full, open one explicit replacement chooser ordered by canonical
   suitability, then current level, condition, and stable player ID.
5. When a role slot is empty, offer compatible slots first without hiding weak
   choices.
6. Prevent XI/bench duplicates and move a chosen player atomically from the
   other selection location.
7. Keep unavailable players selected but disable illegal kickoff, not plan
   editing.
8. Persist the plan only through the existing deliberate save/autosave session
   boundary.
9. Prove changes survive route switches, refresh after save, full time, and the
   next fixture.

## Implementation Contract

- One command/use case owns plan mutation; React screens do not synchronize
  copies with effects.
- The shared board remains the only graphical XI/bench implementation.
- Suitability ordering reuses the canonical role-fit owner.
- No click action silently removes another player.
- Motion communicates slot continuity but never completes the command.

## Expected Files

- current canonical match-plan command/state Modules/tests in engine/web
- new or current `apps/web/src/features/squad/` action Modules/tests
- new or current `apps/web/src/features/tactics/` route/screen Modules/tests
- current `apps/web/src/features/tactics-board/` Modules only where a shared
  public integration seam is required
- current preparation and Matchday adapters/tests only to consume the shared
  plan owner
- current i18n catalogs/tests
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No second board, second plan store, hidden best-XI command, auto-replacement,
  drag-only action, or duplicated suitability ranking.
- No combined Squad/Tactics top-level tab screen.
- No change to live-match substitution rules.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
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

- Field a player into an empty slot, replace an occupied slot, move an XI
  player to bench, remove a player, and undo each action explicitly.
- Switch among Squad, Tactics, preparation, and Matchday and compare all 19
  selected slots and roles.

## Completion Criteria

- All four surfaces consume one canonical plan.
- Replacement is explicit, ranked, accessible, and atomic.
- No hidden lineup mutation or duplicate selection remains.
- Step 14 remains the only next implementation step.
