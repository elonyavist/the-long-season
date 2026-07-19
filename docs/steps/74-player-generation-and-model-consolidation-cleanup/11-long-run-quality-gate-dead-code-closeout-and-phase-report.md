# Step 11 - Long-Run Quality Gate, Dead-Code Closeout, And Phase Report

## Status

Done.

## Goal

Prove the consolidated player model remains credible and deterministic across
fixed seeds and long careers, then remove every replaced path and close the
phase with one architectural report.

## Inspectable Outcome

- One final report compares the Step 01 baseline to the consolidated model.
- The report separates exact-output preservation, deliberate semantic changes,
  distribution evidence, and unresolved risk.
- A junior developer can follow player creation through development,
  lifecycle, valuation, persistence, and presentation from `ARCHITECTURE.md`.
- No duplicate ability/role formula or dead compatibility path remains.

## Scope

1. Run all focused and repository-wide checks from the phase README.
2. Produce 50x10 diagnostic evidence before the 250x30 release gate.
3. Compare senior/youth generation, role CA/PA, rarity, academy, development,
   lifecycle, valuation, persistence, and balance to the baseline.
4. Investigate every failure by seed and football meaning; fix only within the
   documented Phase 74 scope.
5. Search for duplicate 25-key lists, private ability averages, role tables,
   potential clamps, old constructors, obsolete exports, and compatibility
   branches.
6. Record before/after file size and ownership without claiming line-count
   reduction as product correctness.
7. Update architecture with the canonical player lifecycle and package entry
   points.
8. Write the final consolidation and long-run reports.
9. Reconcile status, both roadmaps, and exactly one next-phase recommendation
   without implementing it.

## Gate Contract

- The 50x10 run is diagnostic; the 250x30 run is the release gate.
- Failed seeds remain named and reproducible.
- No threshold is loosened in this final step.
- A balance failure caused by a deliberate role-aware semantic correction must
  be fixed in the owning Phase 74 module or the phase is blocked.
- Existing known non-player warnings are classified, not opportunistically
  repaired.
- Phase completion requires zero structural squad collapse and zero
  generation/development role-coherence failure.

## Expected Files

- `docs/audits/PLAYER_MODEL_CONSOLIDATION_BASELINE.md`
- `docs/audits/PLAYER_MODEL_CONSOLIDATION_REPORT.md`
- `docs/audits/PLAYER_MODEL_CONSOLIDATION_LONG_RUN_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No new gameplay feature or screen.
- No match-engine, economy, staff, personality, contract, or scouting work.
- No hidden failed seed or widened threshold.
- No cleanup outside proven player-model ownership.
- No placeholder next-phase code.
- Do not start Phase 75 or any web backlog phase.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src packages/content/src/generators packages/engine/src/career packages/engine/src/market packages/storage/src
pnpm --filter @game/domain run typecheck
pnpm --filter @game/content run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm depcruise
pnpm check
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm cli career --save=phase74-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase74-world-a --development-report
pnpm cli ten-season-report --seed-prefix=phase74-player-model --worlds=50 --seasons=10 --report-output=/tmp/phase74-player-model-50x10.md
pnpm cli ten-season-report --seed-prefix=phase74-player-model --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_MODEL_CONSOLIDATION_LONG_RUN_REPORT.md
pnpm cli balance-report --seed-prefix=phase74-balance --seasons=20 --target-profile=calibration-v1 --strict
rg -n "averageAbilities|averagePlayerAbilities|potentialAtLeastCurrent|ABILITY_PATHS|ROLE_ATTRIBUTE_CLASSIFICATION" packages apps
git diff --check
graphify update .
```

## Manual Inspection

- Compare at least `world-a` and `world-b` senior/youth reports to baseline.
- Inspect representative goalkeeper, defender, full-back/wing-back,
  midfielder, winger, and striker current/potential profiles.
- Inspect one lower-division high-potential youth through 5-7 simulated
  seasons; verify growth without immediate dominance or cap violations.
- Inspect promotion, release, exit, turnover, and valuation examples affected
  by explicit role-aware semantics.
- Inspect a supported pre-Phase-74 save after load and round trip.

## Completion Criteria

- All phase-level checks pass.
- 250 worlds x 30 seasons has no structural squad collapse and no player-model
  coherence failure.
- Fixed-seed differences are either zero or explicitly justified and bounded.
- Every migrated duplicate/dead path is removed.
- Architecture and reports make the full lifecycle easy to trace.
- `docs/PROJECT_STATUS.md` marks Phase 74 complete or records a concrete blocker.
- Exactly one next phase is recommended and not started.
