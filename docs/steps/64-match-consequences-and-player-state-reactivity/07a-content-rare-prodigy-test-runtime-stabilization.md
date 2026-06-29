# 07a - Content Rare Prodigy Test Runtime Stabilization

## Goal

Unblock the Phase 64 regression gate by stabilizing the unrelated broad-suite
timeout in the content rare-prodigy generation test.

This is a narrowly authorized test-quality rework inside Phase 64 because Step
07 proved the Phase 64 implementation path is green, but `pnpm check` cannot
complete while the global content test times out.

The intent is to make the gate reliable without changing gameplay tuning,
player-generation probabilities, match consequences, or long-run thresholds.

## Expected files

- `packages/content/src/generators/fake-players.test.ts`
- `docs/audits/MATCH_CONSEQUENCES_REGRESSION_SMOKE.md`
- `docs/PROJECT_STATUS.md`

Only if the investigation proves the timeout is caused by a production-code
performance bug, stop and document the blocker before modifying production
content generation files.

## What to implement

1. Inspect the failing test:
   - `rare prodigies are possible across generated career worlds but not guaranteed`;
   - current loop count;
   - current seed strategy;
   - runtime cost of `generateFakeClubs` and `generateFakePlayersForClubs`.
2. Prefer a deterministic, smaller, faster test shape:
   - use known stable seed fixtures that include at least one rare prodigy case
     and at least one no-rare-prodigy case;
   - avoid scanning many generated worlds when a fixed seed set proves the same
     contract;
   - keep the test proving both parts of the product contract:
     - rare prodigies are possible;
     - rare prodigies are not guaranteed in every generated world.
3. If seed fixtures are not stable enough:
   - reduce world count only with a documented reason;
   - or split the test into explicit "possible" and "not guaranteed" assertions
     using deterministic seeds.
4. Avoid increasing the timeout as the first fix. Only raise a timeout if:
   - the smaller deterministic proof is impossible;
   - the reason is documented in `MATCH_CONSEQUENCES_REGRESSION_SMOKE.md`;
   - the resulting runtime is still acceptable for `pnpm check`.
5. Rerun the blocked gates:
   - focused content test;
   - full `pnpm check`;
   - Step 07 regression command pack as needed.
6. Update the regression smoke report with:
   - root cause;
   - adopted stabilization;
   - before/after command results;
   - confirmation that gameplay probabilities/tuning were not changed.

## What NOT to implement

- Do not change match consequences.
- Do not change match engine probabilities.
- Do not change player-generation rarity budgets or probabilities just to make
  this test pass.
- Do not tune long-run gates.
- Do not weaken the product contract that rare prodigies can exist but are not
  guaranteed.
- Do not add new features.
- Do not start Phase 65 or any next phase.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/generators/fake-players.test.ts
pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts
pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm check
test -f docs/audits/MATCH_CONSEQUENCES_REGRESSION_SMOKE.md
git diff --check
```

If source code changes are made, also run:

```bash
graphify update .
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- root cause of the timeout;
- adopted stabilization;
- confirmation that gameplay tuning was not changed;
- full verification result;
- next action:
  - return to Step 07 if the regression pack needs rerun;
  - otherwise continue to Step 08;
- blocker, if any.
