# 01 - Current Player State And Match Consequence Audit

## Goal

Audit the current player-state, matchday, and career progression behavior before
adding new post-match consequences.

The audit must answer what already changes after a fixture, what state values
already exist, what facts are available from match reports, and where Phase 64
can safely add form/morale reactivity without duplicating existing logic.

## Expected files

- `docs/audits/MATCH_CONSEQUENCES_STATE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Read the current career matchday path:
   - `packages/engine/src/career/progress-fixture.ts`
   - `packages/engine/src/career/career-condition-consequences.ts`
   - `packages/engine/src/career/career-weekly-recovery.ts`
   - `apps/cli/src/commands/career/progression.ts`
   - `apps/cli/src/commands/career/matchday-output.ts`
2. Read the state contracts:
   - `packages/domain/src/state/career-state.ts`
   - `packages/domain/src/state/game-state.ts`
   - player dynamic state definitions in domain.
3. Read match facts available today:
   - `packages/domain/src/entities/match.entity.ts`
   - `packages/domain/src/entities/match-event.entity.ts`
   - `packages/engine/src/match-engine/create-match-report.ts`
4. Read team-strength state multiplier behavior:
   - `packages/engine/src/match-engine/team-strength.ts`
   - current content `stateMultiplierCurves` source.
5. Write `MATCH_CONSEQUENCES_STATE_AUDIT.md` with:
   - current fitness spend/recovery flow;
   - current form/morale lifecycle;
   - available post-match facts;
   - missing facts that must stay out of scope;
   - safest implementation seam;
   - risks to fun and credibility.

## What NOT to implement

- Do not change source code.
- Do not define final formulas yet.
- Do not add UI.
- Do not add injuries, team talks, training, staff, or personality.
- Do not change match balance or player generation.

## Required checks

```bash
test -f docs/audits/MATCH_CONSEQUENCES_STATE_AUDIT.md
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step;
- audit status;
- key findings;
- next action;
- blocker, if any.

