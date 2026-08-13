# Step 12B - Specialised Own-Squad Plan Implementation

## Status

**Ready.** Step 12A froze Amendment A8 before implementation.

## Goal

Ship the six frozen plans through one versioned owner used identically by
manager UI, career AI, automatic matches and web opponents, without changing
match formulas or reading the opponent.

## What To Implement

- Replace generic profile keys and content rows with Amendment A8 verbatim.
- Keep one conserved fit evaluator; do not add route prediction, readiness,
  result scoring or another table.
- Advance the match-tactics content version. The schema version changes only if
  the serialized shape changes; a vocabulary/content change alone is not a new
  schema.
- Remove obsolete generic labels, fixtures and assertions in the same change.
- Prove every plan and focus is reachable on the already-observed A/B
  development populations. Those populations may test reachability and wiring;
  they may not decide D2 result materiality.
- Prove manager and AI read the same plan objects and CLI/web paths remain
  byte-equivalent for the same world and fixture.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.ts`
- `packages/engine/src/team-selection/own-squad-tactical-policy.test.ts`
- `packages/engine/src/career/career-ai-team-selection.test.ts`
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-world.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- the phase `README.md`
- this step document
- `12c-checkpoint-d2-specialised-own-squad-agency.md`

Discovered callers enter this list with ownership before modification. Storage
and match-engine formula files are outside scope.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/engine/src/team-selection/own-squad-tactical-policy.test.ts \
  packages/engine/src/career/career-ai-team-selection.test.ts \
  apps/web/src/features/match-preparation/match-preparation-adapter.test.ts \
  apps/web/src/features/matchday/matchday-adapter.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
git diff --check
graphify update .
```

## Definition Of Done

Six specialised plans are active and reachable through one content owner;
generic presets leave no residue; no opponent/result input or direct bonus
exists; all product paths agree; D2 remains untouched and is next.
