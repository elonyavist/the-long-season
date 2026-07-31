# Step 04 - Quarterly Development With Monthly Evidence

## Status

Not started.

## Goal

Apply player development every three completed months while preserving exact
monthly minutes, ratings, age, deterministic variance, and season-end residual
work.

## Accepted Semantics

- Fixture statistics and participation accrue immediately.
- Monthly participation rows remain canonical.
- One quarterly command consumes up to three complete monthly rows.
- Residual complete months flush at season rollover.
- Each row uses age at its own checkpoint.
- Batching must equal sequential monthly processing.
- Club environment is applied after age/minutes/performance and remains
  bounded by the accepted multiplier.
- No permanent hidden realization modifier survives.
- Variance is derived from world/player/season/month and cannot be rerolled by
  save reload.

## What To Implement

- Replace monthly orchestration with quarterly checkpoint selection while
  retaining the monthly ledger.
- Reuse the ledger's existing ordered monthly rows and closed-month keys; do
  not persist a second quarterly checkpoint collection.
- Refactor development so one pass processes ordered monthly rows without
  repeated whole-state copying.
- Replace player-only stable realization with month-specific deterministic
  variance.
- Apply the frozen environment multiplier to positive growth only.
- Preserve decline, hard role caps, stored ceiling, role adaptation, and
  idempotent closed-month keys.
- Add sequential-versus-quarterly equivalence, reload, birthday-boundary,
  residual-flush, minutes/performance, environment, bench, and goalkeeper
  tests.

## What NOT To Implement

- No P50/upper, generation, value, AI, or UI change.
- No per-match attribute update and no synthetic performance bonus.
- No automatic growth for loan/prospect labels.

## Expected Files

- `packages/domain/src/career/player-participation.ts`
- `packages/domain/src/career/player-participation.test.ts`
- `packages/engine/src/career/advance-career-month.ts`
- `packages/engine/src/career/advance-career-month.test.ts`
- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `packages/engine/src/career/player-development-policy.ts`
- `packages/engine/src/career/player-development-policy.test.ts`
- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `packages/engine/src/career/youth-lifecycle.ts`
- `packages/engine/src/career/youth-lifecycle.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/domain/src/career/player-participation.test.ts \
  packages/engine/src/career/advance-career-month.test.ts \
  packages/engine/src/career/player-development-policy.test.ts \
  packages/engine/src/career/player-development.test.ts \
  packages/engine/src/career/youth-lifecycle.test.ts \
  packages/engine/src/career/advance-career-season.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Twelve monthly facts need at most four normal development checkpoints.
- Quarterly and sequential processing return identical player/state facts.
- Residual months process once at rollover.
- Player-only permanent realization no longer exists.
- No duplicate quarterly ledger or checkpoint truth exists.
- Minutes and performance dominate environment; bench players do not receive
  invented growth.
- Step 05 is the only next action.
