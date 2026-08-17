# Step 07 - Checkpointed 750x10 World-Integrity Cohort And HTML

## Status

Blocked behind Step 06 GO. Final Phase 81C checkpoint.

## Goal

Run the complete domestic world for 750 independent careers over ten seasons,
resume it deterministically and provide canonical JSON plus a derived desktop
HTML view for product inspection.

## Evidence Boundary

This cohort can evaluate:

- season-clock contracts and free-agent cadence;
- complete domestic fixtures, tables, points, scorers, assists and appearances;
- Phase 81B player population, aging, retirement, recruitment and succession;
- Phase 81A tactical selection/formation usage in real automatic matches;
- transfers and finances available before loans/races.

It cannot evaluate loans, recalls, competitive transfer races or player choice.
Those sections are `NOT_EVALUATED`, never pass.

## Frozen Execution Contract

Step 06 must register before any acceptance seed runs:

- one exact `7 x 10` canary profile;
- one exact `750 x 10` acceptance profile;
- exactly seven workers for both;
- 750 stable one-world acceptance shards;
- ignored checkpoint directory under `saves/long-run-checkpoints/`;
- ignored canonical JSON/HTML under `simulation-out/`;
- real selector/background producer with fallback source count required to be
  zero;
- actual runtime/memory/artifact budgets and stop conditions;
- cache signature covering producer, policies, schema and diagnostic payload;
- verdict table mapping each failure to a single owner.

No CLI flag may widen or shrink either locked population.

## Canonical Report

Canonical JSON must include and reconcile:

1. execution metadata, shard state and resume accounting;
2. tables by world/season/division with P/W/D/L/GF/GA/GD/points;
3. champions and historical benchmark comparisons by division;
4. scorers and assists with stable player ID, name, age, role, club, division,
   starts, appearances and minutes;
5. transfers with fee in euros, buying/selling club and division, free-agent
   status and Phase 81B recruitment intent;
6. ability pyramid, origin, forecast class, generated-player share, opening
   senior survival, retirement, injuries and permanent damage;
7. formation/tactic usage and league replication from fielded lineups;
8. contract expiry and free-agent stock/flow reconciliation;
9. structural warnings, outliers and every binding gate from Step 06;
10. explicit `NOT_EVALUATED` for unavailable Phase 82A/82B behavior.

Player ages use the canonical completed-age function. Names are presentation;
all joins and reconciliations use stable IDs.

## Diagnostic HTML

- Render only from canonical JSON via `simulation-report --from-report`.
- Renderer performs no simulation, formula or gate evaluation.
- HTML may be English, desktop-only and without accessibility by accepted
  diagnostic scope.
- Provide navigation/filters for world, season, division, tables, leaders,
  transfers, player pyramid, tactics and warnings.
- Rebuilding twice from identical JSON must be byte-identical.
- Fresh/resume execution telemetry may differ; canonical simulation sections
  and final render identity are evaluated under the Step 06 separation rule.

## Execution Sequence

1. Run the `7 x 10` canary alone.
2. Validate non-vacuity, reconciliation, selector source, budgets, shards,
   resume and HTML rebuild.
3. On canary GO only, run/resume the `750 x 10` alone.
4. Reconcile all shards before evaluating any football gate.
5. Review only preregistered HTML examples plus explicitly recorded anomalies.

## What NOT To Implement

- No gameplay or threshold change after viewing acceptance output.
- No raw 7,500-season dump committed to Git.
- No second report command, simulator, parser or renderer.
- No renderer-derived facts.
- No loan/race claim.

## Expected Files

Finalized by Step 06 and must include:

- locked registry profiles and validators
- actual world runner/worker/shard/checkpoint owners and tests
- canonical section/world-fact producers and reconciliation tests
- existing HTML renderer/formatter and byte-identity tests
- `docs/audits/PHASE_81C_750X10_WORLD_INTEGRITY_REPORT.md`
- audit index, this step, phase README, steps index and project status
- generated JSON/HTML/checkpoints only in ignored directories

## Required Checks

```bash
nvm use 24

# Canary, alone.
pnpm cli simulation-report \
  --profile=phase81c-world-integrity-canary-7x10-v1 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81c-world-integrity-canary-7x10-v1.json

# Acceptance, alone and only after canary GO.
pnpm cli simulation-report \
  --profile=phase81c-world-integrity-750x10-v1 \
  --workers=7 --format=json \
  --checkpoint-dir=saves/long-run-checkpoints/phase81c-world-integrity-750x10-v1 \
  --report-output=simulation-out/phase81c-world-integrity-750x10-v1.json

# Derive the diagnostic view without simulation.
pnpm cli simulation-report \
  --from-report=simulation-out/phase81c-world-integrity-750x10-v1.json \
  --format=html \
  --report-output=simulation-out/phase81c-world-integrity-750x10-v1.html

pnpm check
git diff --check
graphify update .
```

Profile IDs remain provisional until Step 06 freezes them.

## Decision

- **GO:** every Phase 81C binding gate and reconciliation passes; close Phase
  81C and hand the measured Interfaces to Phase 82A.
- **REFINE:** reopen only the named Phase 81C owner and repeat its bounded
  checkpoint before any acceptance rerun.
- **STOP_RETHINK:** the background-world/contract architecture cannot support a
  truthful career world without a new product decision.
- **STOP_INSTRUMENT:** non-vacuity, continuity, reconciliation, cache or resume
  fails; no football conclusion is read.

## Definition Of Done

- Canary and acceptance use exactly seven workers and declared populations.
- All 750 shards reconcile and resume deterministically.
- Complete domestic tables and player statistics reconcile from canonical
  fixtures.
- HTML is byte-identical from canonical JSON and manually reviewed.
- Phase 82A receives an explicit evidence-backed handoff or stays closed with
  the failed owner named.
