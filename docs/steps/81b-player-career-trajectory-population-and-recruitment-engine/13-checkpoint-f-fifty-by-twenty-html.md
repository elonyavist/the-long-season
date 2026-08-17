# Step 13 - Checkpoint F: Fifty-By-Twenty HTML

## Status

Blocked behind Checkpoint E GO.

## Goal

Produce the broad, human-readable player-model review: 50 worlds over 20
seasons in canonical JSON and a derived desktop HTML view. This uses the same
`1,000` world-season planning volume as `100 x 10`, but gives late developers,
multiple intake cohorts, decline, retirement and succession enough time to
become observable.

It does not certify the complete domestic world owned by Phase 81C.

## Why Fifty By Twenty

- Twenty seasons observe several generated cohorts rather than mostly the
  opening population.
- Late maturation, age-37 retirement and succession after a prospect sale can
  complete inside the horizon.
- Failures that emerge only after seasons 10-15 cannot hide behind a broader
  but shallower sample.
- Fifty independent worlds remain the breadth unit. Rare outcomes are also
  reported with player-level denominators and per-world coherence, never from
  a cohort mean alone.
- `50 x 20` replaces `100 x 10`; both must never run as Phase 81B acceptance
  cohorts.

## What To Implement

- Register a locked `7 x 20` canary and a locked `50 x 20` acceptance profile.
- Use exactly seven workers. Acceptance uses 50 stable one-world shards and an
  ignored checkpoint directory.
- Use the real canonical player population, public forecast, AI selection,
  match, recruitment/free-agent and career paths. Fallback formation/report
  source count must be zero.
- Canonical JSON reports both whole-horizon summaries and four fixed windows:
  - seasons `1-5`;
  - seasons `6-10`;
  - seasons `11-15`;
  - seasons `16-20`.
- For every window and whole horizon include:
  - ability pyramid by division, origin, age and role;
  - generated-player share of appearances, minutes, goals, assists and leaders;
  - opening-senior survival and generated replacement share;
  - public forecast class versus realized ability, with censored cohorts kept
    separate from failures;
  - AI acquisitions by `immediate_upgrade`, `depth` and `succession`;
  - free-agent stock, unique inflow, attributed signing and closing stock;
  - successor preparation, sale, replacement and reopened need where reachable;
  - retirements, injury availability and permanent damage;
  - over-33 starts/minutes/goals/assists and age distributions;
  - squad size, role floors and formation diversity;
  - transfer fee in euros plus buying/selling club and division.
- Include league tables, points, W/D/L, GF/GA/GD, champions, scorers and assists
  only for competitions the canonical runner truthfully completes. Every
  incomplete population is visibly `NOT_EVALUATED`, never reconstructed.
- Re-evaluate all Checkpoint E gates meaningful at 20 seasons. A ten- or
  fifteen-season gate keeps its original declared population; the report may
  add a 20-season diagnostic but cannot silently change its denominator.
- Emit the exact Checkpoint F structural metric IDs from
  [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md).
  The canary is an operational preflight, never a calibration sample.
- Render HTML only through `simulation-report --from-report`; renderer performs
  no simulation, formula or gate.
- HTML may be English, desktop-only and without accessibility by accepted
  diagnostic scope. It must remain legible and internally reconciled.
- Select manual examples before acceptance output: at least one world per
  declared window, one high-tail success, one late developer, one depth player,
  one succession chain and every structural anomaly class.

## What NOT To Implement

- No gameplay change after viewing canary or acceptance HTML.
- No renderer-side derived metric.
- No new report command, simulator or `.tmp` artifact.
- No `100 x 10` companion run.
- No claim that Checkpoint F replaces the paired `7 x 15` attribution evidence.
- No background-fixture implementation or complete domestic-world claim.
- No localization/accessibility work for diagnostic HTML.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/locked-profile-sections.ts` and test
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test only
  for non-derivable evidence absent from the final Checkpoint E artifact
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.ts` and
  test
- `apps/cli/src/commands/simulation-report/report-planner.ts` and test
- `apps/cli/src/commands/simulation-report/report-html.ts` and test
- `apps/cli/src/commands/simulation-report/report-renderers.ts`
- `packages/simulation-tools/src/modular-report/report-contract.ts` and test
- the exact Checkpoint E evaluators from Step 10, without target/formula edits
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only for a pre-canary production-
  truth correction; never after canary output
- generated JSON/HTML/checkpoints under ignored directories only
- `docs/audits/PHASE_81B_CHECKPOINT_F_50X20_PRODUCT_REVIEW.md`
- `docs/audits/README.md`
- this step, phase README and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24

# Canary, alone.
pnpm cli simulation-report \
  --profile=phase81b-product-f-canary-7x20 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-f-canary-7x20.json

# Acceptance, alone and only after canary GO.
pnpm cli simulation-report \
  --profile=phase81b-product-f-50x20 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-f-50x20.json

# Derive HTML without simulation or recomputation.
pnpm cli simulation-report \
  --from-report=simulation-out/phase81b-f-50x20.json \
  --format=html \
  --report-output=simulation-out/phase81b-f-50x20.html

pnpm check
git diff --check
```

The acceptance profile owns its ignored 50-shard checkpoint directory and
cache signature in `report-registry.ts`. The CLI deliberately exposes no
`--checkpoint-dir` override.

## Definition Of Done

- Canary and acceptance complete/reconcile with exactly seven workers.
- All 50 stable shards resume deterministically and reconcile.
- HTML rebuild is byte-identical and contains no hidden player truth beyond
  diagnostic fields explicitly approved for the locked profile.
- The four five-season windows expose whether renewal remains stable after
  season 10 rather than hiding behind a whole-horizon average.
- User can inspect player pyramid, leaders, ages, roles, transfers, free-agent
  flow, retirement and succession through season 20.
- No gameplay conclusion relies on renderer logic.
- Step 14 is the only next action.
