# Step 06B25A - Checkpoint L6.5 Bounded Succession Priority 7 x 10

## Status

**Done on 2026-08-12: `REFINE: market_distribution`.** The candidate safely
moves replacement capacity across the division, but not into the same club and
not into season-ten leaderboards.

## Question

On identical fresh worlds, does bounded within-club succession priority move
already-viable young players into the clubs that need them without increasing
market capacity or damaging tactical identity?

## Frozen Population

- profile `phase81a-succession-priority-l6-5-7x10`;
- prefix `phase81a-succession-priority-l6-5-v1`;
- exactly `7` fresh worlds, `10` seasons and `7` workers;
- two serial arms on the same world seeds: `legacy_order` and
  `bounded_succession_order`;
- both arms use the current generator, development, market caps, finance,
  formation selector and `match-discipline-calibration-v2`;
- every arm gets its own collision-proof cache directory;
- the candidate changes only within-club need order.

## Preregistered Decision

All comparisons are paired by world. `GO` requires:

- local replacement capacity improves by at least `0.05` pooled and by a
  positive amount in at least `5/7` worlds;
- career-generated season-ten leader share improves by at least `0.03` pooled
  and in at least `5/7` worlds;
- division replacement capacity stays at least `0.50` and loses no more than
  `0.02`;
- pooled four-formation replication loses no more than `0.02`, and at least
  `5/7` candidate worlds retain the four-formation condition in at least
  `75%` of their observed competition-seasons;
- total transfer acquisitions do not exceed the legacy arm by more than `5%`;
- no structural, origin, participation, finance, transfer, population-signature
  or observer reconciliation fails.

The first two floors are material changes, not a demand that one bounded rule
finish all renewal in a single pass. If local succession improves but leader
share does not, the decision is `REFINE: downstream_selection`; if leader share
moves without the linked local transition, it is `STOP_RETHINK`.

`GO` accepts the bounded ordering as the product default. `REFINE` reopens only
06B25 with targets unchanged. `STOP_RETHINK` removes the candidate and its
analysis seam in the same step; no dead alternate policy survives.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts` and test: serial
  paired execution, linked-world evaluator and fail-closed decision;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test: pure preregistered comparison, independent guardrail failures and
  total decision mapping;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test:
  one locked profile and isolated arm caches;
- `packages/i18n/src/labels.ts`: discoverable profile labels in five languages;
- 06B25 engine/advancement files only if the accepted product default must be
  finalized after the measured decision;
- this step, Phase README, status, audit and audit index.

## Canonical Command

```bash
nvm use 24.19.0
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-succession-priority-l6-5-7x10 \
  --format=json \
  --report-output=simulation-out/phase81a-succession-priority-l6-5-7x10.json
git diff --check
graphify update .
```

The simulation gate runs alone. No HTML is rendered until this causal decision
is complete; the final integrated checkpoint owns the user-facing view.

## Outcome

Both arms completed `7/7` worlds and `70` world-seasons with zero observer or
population-signature reconciliation. The bounded candidate is not accepted:

| Metric | Legacy | Candidate | Delta | Gate |
|---|---:|---:|---:|---|
| local replacement capacity | `0.069767` | `0.054945` | `-0.014822` | fail, `2/7` positive |
| division replacement capacity | `0.476744` | `0.560440` | `+0.083695` | held |
| generated leader share | `0.240476` | `0.245238` | `+0.004762` | fail, `3/7` positive |
| four-formation retention | `0.885714` | `0.871429` | `-0.014286` | held, `7/7` worlds |
| transfer acquisitions | `5,050` | `5,263` | ratio `1.042178` | held |

The result rejects “priority alone” without reopening generation, growth,
market capacity or tactical identity. The next cached attribution joins each
fulfilled succession episode to the acquired player's age and origin. It will
decide prospect eligibility versus downstream selection before another product
rule is proposed.

Report hash: `09aa4fb6ee066111fd6053a51acc7d02`. File SHA-256:
`463b4c4c2342b3d1116eea4527f897303016c697a790352ddcc3565fcb370247`.
Full record:
[`PHASE_81A_CHECKPOINT_L6_5_BOUNDED_SUCCESSION_PRIORITY.md`](../../audits/PHASE_81A_CHECKPOINT_L6_5_BOUNDED_SUCCESSION_PRIORITY.md).
