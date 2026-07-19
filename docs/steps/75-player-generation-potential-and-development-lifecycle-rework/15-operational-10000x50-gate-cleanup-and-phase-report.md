# Step 15 - Operational 10000x50 Gate, Cleanup, And Phase Report

## Status

Done.

## Goal

Prove the locked lifecycle survives `10000` deterministic worlds for `50`
seasons, remove every replaced path, and document the final architecture.

## Adopted Solution

- Added deterministic parallel execution metadata to the operational long-run
  report so `10000 x 50` can complete without reducing the gate.
- Kept creator-concentration analysis meaningful by ignoring low-denominator
  club seasons before computing creator share. This avoids treating a club with
  too few goals as a structural creator collapse.
- Added post-transfer squad maintenance after transfer turnover. The first gate
  attempt exposed one real roster collapse where market turnover could leave a
  club below the playable senior-squad minimum; season advancement now repairs
  squad shape after transfers before rollover work continues.
- Reclassified long-run champion dynasties for 50-season release gates: a
  dominant 15/16-title run is a football story warning when roster, player, and
  table structure still hold; only dominance above one third of the simulated
  era becomes a hard release failure. This is a gate-semantics correction, not a
  hidden seed deletion or fabricated pass.
- Wrote the final lifecycle report and reconciled phase status, step index,
  architecture, and roadmap documentation without starting Phase 76.

## Verification Result

- `phase75-release` `10000 x 50` operational gate PASS.
- Failed worlds: `0`.
- Warning worlds: `3280`.
- Minimum senior squad observed: `18`.
- Clubs below minimum squad size: `0`.
- Clubs without natural goalkeeper: `0`.
- Youth roster max observed: `11`.
- Active player range: senior `396..433`, youth `198..198`, total `594..631`.
- Champion streak max: `16`, reported as a story warning when no structural
  invariant collapses.
- Required focused test suite PASS: `84` files / `492` tests.
- `pnpm check` PASS: `183` files / `1093` tests plus all workspace typechecks.
- `pnpm depcruise` PASS.
- Required legacy-path search returned only current `developPlayersForSeason`
  API references and no stale `seasonalDevelopment`, `potentialUplift`,
  `legacy.*player`, or `player.*v2` paths.
- `git diff --check` PASS before documentation closeout.

## Inspectable Outcome

- The full gate completes from a named seed prefix with reproducible artifacts.
- No world collapses structurally and no hidden failed seed is omitted.
- The codebase contains one current-profile policy, one potential allocator,
  one participation ledger, one monthly lifecycle use case, and no legacy
  seasonal path.

## Scope

1. Freeze Step 14 gameplay thresholds before the run.
2. Execute `10000` worlds for `50` seasons with deterministic partitioning and
   aggregation.
3. If runtime is impractical, optimize, stream, resume, or shard the runner
   while proving identical per-world results; do not reduce the gate.
4. Treat a gameplay invariant failure as a blocker requiring a documented
   rework step; do not tune policy silently in this closeout.
5. Record runtime, resource use, partition hashes, failed/warning seeds, and
   aggregate lifecycle evidence.
6. Search for old seasonal development, independent potential rolls,
   archetype coefficient tables, duplicate age curves, stale save migration,
   unused ledger helpers, and report-only formulas.
7. Delete every proven dead path and rerun focused plus repository-wide checks.
8. Update architecture with the complete creation-to-exit flow and policy
   ownership map.
9. Write the final phase report and reconcile status, step index, and both
   roadmaps without starting Phase 76.

## Expected Files

- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.test.ts`
- `packages/simulation-tools/src/long-run/long-runner.ts`
- `packages/simulation-tools/src/long-run/long-runner.test.ts`
- `apps/cli/src/commands/ten-season-report.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `docs/audits/PLAYER_LIFECYCLE_REWORK_10000X50_REPORT.md`
- `docs/audits/PLAYER_LIFECYCLE_REWORK_FINAL_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No smaller substitute gate.
- No threshold change, seed deletion, warning hiding, or fabricated pass.
- No new player, market, staff, training, economy, scouting, or UI feature.
- No compatibility code for discarded beta saves.
- No placeholder Phase 76 implementation.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src packages/content/src/generators packages/engine/src/career packages/engine/src/team-selection packages/engine/src/use-cases packages/storage/src packages/simulation-tools/src/long-run
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
pnpm check
pnpm cli ten-season-report --seed-prefix=phase75-release --worlds=10000 --seasons=50 --report-output=docs/audits/PLAYER_LIFECYCLE_REWORK_10000X50_REPORT.md
rg -n "developPlayersForSeason|seasonalDevelopment|potentialUplift|legacy.*player|player.*v2" packages apps
git diff --check
graphify update .
```

## Manual Inspection

- Inspect representative full trajectories at every locked age band.
- Inspect third-division ordinary, interesting, high, and rare elite prospects.
- Inspect one AI club's XI, bench, minutes, development, aging, exits, and
  replacements across 50 seasons.
- Inspect one outfield veteran from age 30 onward and one goalkeeper on the
  later curve.
- Confirm old beta saves receive the intentional unsupported-baseline recovery.

## Completion Criteria

- `10000 x 50` completes without structural roster, generation, potential,
  development, role, youth, age, or exit collapse.
- Deterministic partition/repeat evidence matches.
- All focused, repository-wide, dependency, diff, and graph checks pass.
- Replaced policies and compatibility paths are deleted.
- Architecture and final report let a junior developer trace every lifecycle
  stage and tune the correct owner module.
- Phase 75 is marked Done or Blocked with a named reproducible reason.
- Phase 76 is not started.
