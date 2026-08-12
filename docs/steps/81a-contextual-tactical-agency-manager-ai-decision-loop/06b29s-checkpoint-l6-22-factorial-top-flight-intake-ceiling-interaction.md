# Step 06B29S — Checkpoint L6.22 Factorial Top-Flight Intake And Ceiling Interaction

## Status

Done — `STOP / RETHINK` on 2026-08-12. Both factors and all L6.22-only code
were removed.

## User-Facing Reason

The game still produces too few career-generated leaders after ten seasons.
L6.19 shows that a small top-flight ceiling tail alone does not solve it; L6.21
shows that producing more interesting prospects alone does not solve it. A
credible academy prospect needs both enough probability of appearing and enough
room to become a senior leader. This checkpoint tests that interaction before
changing another system.

## Frozen Factors

Only annual First-Division academy intake changes. The two binary factors are:

- **frequency off/on:** the L6.21 `+0.12` interesting probability, taken wholly
  from routine probability;
- **ceiling off/on:** the L6.19 interesting-prospect five-star tail, with a
  `1500` basis-point chance of ceiling five rather than the ordinary interesting
  ceiling.

This produces four exact arms on the same L6.20 seeds:

| Arm | Frequency | Ceiling tail |
| --- | --- | --- |
| `00` current | off | off |
| `10` frequency | on | off |
| `01` ceiling | off | on |
| `11` combined | on | on |

`00` and `10` reuse the already-written L6.20 and L6.21 facts only after cache
identity and world-seed equality are proven. `01` and `11` are fresh. There is
no RNG-neutral claim between arms: each arm is a deterministic world-level
policy comparison, and all decisions are paired by world seed.

## Frozen Measurements

Seven worlds, ten seasons, exactly seven workers. For each renewal metric report:

- all four arm levels;
- `10 - 00` and `01 - 00` isolated effects;
- the interaction `(11 - 01) - (10 - 00)`;
- the combined effect `11 - 00`;
- per-world signs and threshold coherence.

The report also records generated and accepted volume, prospect-class counts by
division, First-Division interesting leaders, current/stored quality, role
coverage, six-star stock, formations, champion points, transfers, integrated
gate keys and reconciliation.

## Frozen Decision

`GO` adopts both factors together only when arm `11` satisfies every L6.21
product target against `00`:

- routine share of First-Division stored-ceiling failures improves `>=0.10`;
- mature below-leader-quality share improves `>=0.04` in `>=5/7` worlds;
- stored-ceiling-below-leader share improves `>=0.06` in `>=5/7` worlds;
- career-generated leader share improves `>=0.03`, reaches `>=0.28`, and
  improves by `>=0.03` in `>=5/7` worlds;
- First-Division interesting leaders increase by `>=8`;
- the generated-leader-share interaction is positive by `>=0.02`, so the
  combined result is not merely one factor rediscovered;
- all four prospect classes remain reachable;
- Second/Third prospect-class counts and every division's total generation
  volume are exactly unchanged from `00`;
- no new integrated failure, guardrail regression or reconciliation failure.

`REFINE` removes both factors and closes probability/ceiling tuning when the
combined arm misses any renewal target without a structural failure.
`STOP / RETHINK` applies to cache mismatch, unreachable arms, new integrated
failure, lower-tier/volume drift, reconciliation failure, or contamination where
the fresh combined run does not reproduce its own deterministic cache replay.
No coefficient or target moves after arm output.

## Execution Order

1. Prove `00` and `10` cache identity and freeze the evaluator with unit tests.
2. Enable ceiling only, run and cache `01` alone.
3. Enable frequency as well, run and cache `11` alone.
4. Evaluate all four cached arms without simulating.
5. On `GO`, retain the combined product but remove arm-only instrumentation.
   On `REFINE`, remove both product factors and all L6.22-only code.
6. Update graphify, run the focused checks, then `pnpm check` alone.

## Expected Files

- `packages/content/src/generators/youth-development-level.ts` and test;
- `packages/content/src/generators/initial-youth-academies.ts` and test;
- `packages/content/src/generators/player-potential-rarity.ts` and test;
- `packages/content/src/generators/player-potential-allocation.ts` and test;
- `packages/content/src/generators/player-prospect-joint-profile.ts` and test;
  the annual root passes an explicit semantic band while opening academies keep
  the canonical matrix, so the arm cannot leak into the opening population;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, phase README and status.

No engine, domain, persistence, web, market, growth, minutes, career-exit or
second report code.

### Instrument Correction Before Arm Output

The first focused reachability assertion was placed in
`career-intake-players.test.ts`, whose direct generator produces annual senior
candidates. The product path under test is annual academy intake through
`generateSeasonalYouthIntakePlayers(...)`. Before either fresh arm ran, the
assertion was moved to that canonical root and the unrelated test restored
byte-for-byte. A fixed 35-seed real-generation search reaches both the retained
`4.0..4.5` outcomes and the `5.0` edge; opening academies still read the
unchanged canonical matrix.

## Required Checks

All gates run alone. The two fresh arms and the cache-only evaluator use:

```bash
pnpm cli simulation-report \
  --profile=phase81a-factorial-ceiling-only-l6-22-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-factorial-ceiling-only-l6-22-7x10.json

pnpm cli simulation-report \
  --profile=phase81a-factorial-combined-l6-22-7x10 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-factorial-combined-l6-22-7x10.json

pnpm cli simulation-report \
  --profile=phase81a-factorial-evaluation-l6-22-cached \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81a-factorial-evaluation-l6-22-cached.json
```

All three profiles are locked to the L6.20 seed prefix, seven worlds and ten
seasons. Closeout requires focused tests, typecheck, `git diff --check`,
graphify update and one full `pnpm check` run alone.

## Outcome

Both fresh arms completed `7 x 10` with exactly seven workers and zero
reconciliation failures. The cache-only four-arm evaluator was replayed to a
second output path; both artifacts are byte-identical with SHA-256
`86c06696593beab6ca88198b96ed9de251b0bf69e06ccdee86bdac9409e35204`.

| Metric, arm `11` versus `00` | Observed | GO |
| --- | ---: | ---: |
| Routine ceiling-failure improvement | `0.0702` | `>=0.10` |
| Mature below-leader-quality improvement | `0.0215`, `3/7` | `>=0.04`, `5/7` |
| Stored-ceiling-below-leader improvement | `0.0098`, `0/7` | `>=0.06`, `5/7` |
| Generated-leader share delta | `-0.0238`, `2/7` | `>=0.03`, `5/7` |
| Combined generated-leader share | `0.2476` | `>=0.28` |
| Generated-leader interaction | `-0.0333` | `>=0.02` |
| First-Division interesting leaders | `17 -> 15` | `+8` |

The isolated leader-share effects were `+0.0024` for frequency and `+0.0071`
for ceiling. Their combination was antagonistic, not complementary. It also
shifted one Third-Division player from interesting to routine through downstream
career dynamics despite no lower-tier content coefficient changing. Total
generation volume and every reconciliation held; no new integrated failure
appeared. The zero lower-tier distribution gate therefore correctly returned
structural `STOP / RETHINK`, while the renewal targets independently reject the
candidate even if that single spillover is ignored.

The first reachability test accidentally exercised the annual senior-candidate
generator. It was moved before arm output to the real annual academy root,
where a fixed 35-seed search reached both the ordinary and five-star paths. No
threshold moved.

Frequency/ceiling tuning is closed. Step 06B29T follows identical generated
player IDs across cached `00` and `11` arms and attributes the negative
conversion to current-profile cost, minutes, development, exit/retention or
leader displacement before any new product correction.

Evidence:
`docs/audits/PHASE_81A_CHECKPOINT_L6_22_ACADEMY_INTAKE_FACTORIAL.md`.
