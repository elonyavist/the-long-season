# Step 02 - Typed Tactical Slot Context And Collapse Removal

## Status

Not started.

## Goal

Carry canonical formation and positional facts into the match context through
typed domain unions, and remove the web-owned four-role tactical collapse.

## User-Facing Reason

The match cannot react credibly to the manager's formation if line, channel,
position family, and canonical role are discarded before simulation.

## What To Implement

- Deepen the lineup-slot/team-context seam so each selected slot carries typed
  `FormationLine`, `FormationPositionFamily`, optional `FormationSide`,
  `CanonicalPlayerRole`, and its destination-role weight key.
- Keep `slotId` as identity only. Remove every parser or convention that tries
  to recover tactical meaning from it.
- Move canonical-role-to-role-weight resolution out of the web Adapter into
  one engine-owned total mapping with deterministic failure for unsupported
  profiles.
- Remove `engineRoleKeyForPersistedRole` and every equivalent four-way web
  mapping once callers use the typed builder.
- Update manager, batch, manual-tactic, test-fixture, and current AI context
  builders to provide the same typed facts.
- Add total mappings and `never` guards for every formation line, position
  family, side, and canonical role consumer.
- Preserve existing `TeamStrength` numbers for ordinary lineups in this step;
  no shape behaviour lands yet.

## Clean-Code Requirements

- Do not add optional tactical fields to preserve callers. Migrate every
  current caller in this step.
- Do not expose five separate primitive parameters where one named tactical
  slot fact owns the invariant.
- Remove obsolete adapters, fallback role maps, fixtures, and tests made
  redundant by the typed seam.
- Exported contracts explain identity versus tactical semantics and exhaustive
  failure modes.

## What NOT To Implement

- No intrinsic capacities, matchup, suitability modifier, route, or tactic
  behaviour.
- No open-string line/channel/role values.
- No new formation catalog or UI controls.
- No beta compatibility fallback.

## Expected Files

- `packages/domain/src/tactics/formations.ts`
- `packages/domain/src/tactics/formations.test.ts`
- `packages/domain/src/tactics/index.ts`
- `packages/engine/src/match-engine/team-strength.ts`
- `packages/engine/src/match-engine/team-strength.test.ts`
- `packages/engine/src/match-engine/match-context.ts`
- `packages/engine/src/match-engine/match-context.test.ts`
- `packages/engine/src/match-engine/tactic-team-context.ts`
- `packages/engine/src/match-engine/tactic-team-context.test.ts`
- `packages/engine/src/match-engine/manual-tactic-change.ts`
- `packages/engine/src/match-engine/manual-tactic-change.test.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/team-selection/ai-squad-selection.ts`
- `packages/engine/src/team-selection/ai-squad-selection.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/tactics/formations.test.ts \
  packages/engine/src/match-engine/team-strength.test.ts \
  packages/engine/src/match-engine/match-context.test.ts \
  packages/engine/src/match-engine/tactic-team-context.test.ts \
  packages/engine/src/match-engine/manual-tactic-change.test.ts \
  packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts \
  packages/engine/src/team-selection/ai-squad-selection.test.ts \
  apps/web/src/features/match-preparation/match-preparation-adapter.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Every match lineup slot has typed canonical tactical semantics.
- Web owns no canonical-role-to-four-role gameplay mapping.
- Existing ordinary team-strength and match determinism remain unchanged.
- Adding a domain union member breaks exhaustive owners at typecheck.
- No obsolete role-collapse helper or compatibility caller remains.
- Step 03 is the only next action.
