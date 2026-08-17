# Step 06B25 - Bounded Role-Succession Priority

## Status

**Done on 2026-08-12 as an analysis candidate; not accepted as product.** The
real-data branch is reachable and verified, but L6.5 returned `REFINE` because
bounded priority did not improve same-club succession.

## TESI

The game already produces senior-quality young players and gives them minutes.
The missing transition is club-specific succession: a club with an aging
incumbent often spends its one market action on an opportunity or a generic
quality need before checking the exact role that needs a successor.

Do not generate stronger players, accelerate development, raise active talks,
raise seasonal starts or loosen finance and seller floors. Reorder only a
single club's already-derived needs. Structural depth and expiring-contract
needs remain ahead of succession; succession moves ahead of generic aging,
quality and elite-opportunity needs. Inter-club ordering remains unchanged so
the rule cannot silently decide which club reaches a contested player first.

## Product Rule

For the positions already occupied by one club in the canonical need stream:

1. preserve structural-depth and expiring-contract needs first;
2. then inspect exact-role succession needs;
3. then preserve every remaining need in its prior relative order.

The reordered per-club queue is written back into that club's original stream
positions. No need is added, removed or duplicated. A succession need that
finds no viable target falls through to the later needs exactly as today.

The current order survives only as an analysis control with a Phase 81A
closeout removal owner. The shipped default becomes bounded succession order;
no compatibility path is required in beta and no save field is introduced.

## Reachability

A real-data search must find at least one generated career state where the same
club has both an exact-role succession need and a lower-tier need, prove that
their order changes in the healthy direction, and prove that structural and
expiring needs never move behind succession. Hand-built needs are insufficient
as the only reachability evidence.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts` and test: one total,
  deterministic within-club ordering function and its real-data reachability;
- `packages/engine/src/index.ts`: expose the active ordering function to the
  package-boundary reachability test; no duplicate wrapper is introduced;
- `packages/engine/src/career/advance-career-month.ts` and test: forward the
  analysis-only legacy-order control;
- `packages/engine/src/career/advance-career-season.ts` and test only where the
  existing monthly seam is forwarded;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test:
  expose the legacy/candidate choice only to the locked paired checkpoint;
- `apps/cli/src/commands/simulation-report/role-aware-market-reachability.test.ts`:
  prove the ordering rule moves real generated needs in the healthy direction;
- this step, phase README and status; the next checkpoint document may be
  corrected before execution if production code disproves an assumption.

## Verification

```bash
nvm use 24.19.0
pnpm vitest run packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/engine/src/career/advance-career-month.test.ts \
  packages/engine/src/career/advance-career-season.test.ts \
  apps/cli/src/commands/simulation-report/career-world-facts.test.ts
pnpm check
git diff --check
graphify update .
```

Step 06B25 changes no generator, development curve, lineup rule, transfer cap,
budget, persistence schema, HTML, web surface or report entrypoint.

## Outcome

The ordering function, legacy control and paired orchestration are green, but
the product default remains `legacy`. The candidate improved division-level
replacement while reducing local replacement. It stays callable only by the
locked L6.5 analysis profile and has a Phase 81A closeout removal owner; it is
not a second product policy.
