# Step 06B10C - Paired Table-Hierarchy Attribution

## Status

Done on 2026-08-09. The paired response identifies `population_strength`;
no match-translation or draw coefficient is authorized.

## Goal

Distinguish a compressed squad-strength population from insufficient match
translation without adding a tier-to-result term.

## Method

Run current and analysis-oracle arms with identical worlds, schedules, selected
kickoff players, availability, AI policy and match seed. The analysis arm may
make different in-match decisions after a changed score: suppressing that
reaction would test a second policy rather than the canonical automatic match.
The oracle changes only centred kickoff-strength gaps, at the frozen scale
`1.5`, and contributes only a second table. The control career state, fitness,
availability, transfers and RNG stream remain those of the ordinary arm. Read
champion points, spread, PPG deviation, draw share and favorite response. The
oracle is removed at Phase 81A closeout and never becomes a product caller.

The decision bands are frozen before paired output exists:

- `population_strength`: paired minus control points spread is at least `5.0`
  and paired minus control PPG standard deviation is at least `0.04`;
- `match_translation`: the absolute spread response is below `2.0` and the
  absolute PPG-deviation response is below `0.02`;
- `draw_resolution`: the control draw share is above the level-one historical
  maximum, the paired spread response is at least `5.0`, and paired draw share
  falls by at least `0.02`;
- every other response is `not_attributed` and therefore `STOP / RETHINK` at
  the fail-closed retry.

`draw_resolution` is checked before `population_strength`; it can therefore
only own an otherwise material response when excess draws are actually present.

`deriveTeamStrength(...)` is the candidate population boundary;
`deriveOpportunityQuality(...)` is the candidate translation boundary.

## Exit

- population responds materially: `population_strength`;
- strengthened gaps do not open results: `match_translation`;
- excess draws alone erase a demonstrated response: `draw_resolution`;
- ambiguous or non-reproduced: `STOP / RETHINK`.

No owner coefficient changes in this step.

## Expected Files

- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and tests;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and
  `career-world-facts.ts`: attach the frozen scale to the locked profile and
  forward the compact paired table from the canonical season producer;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`: invalidate only the locked profile's stale shards;
- `packages/engine/src/use-cases/simulate-season.ts` and its test: the smallest
  analysis seam production-code inspection found; ordinary callers receive no
  additional table and the canonical result is asserted unchanged;
- `packages/engine/src/index.ts`: re-export only the changed season contract;
- this step, phase README and project status.

## Required Checks

Focused tests, paired replay with exactly `7` workers, `pnpm check`,
`git diff --check`, `graphify update .`.

## Recorded Outcome

The locked `7 x 10`, exactly-seven-worker replay completed over `70`
first-division seasons with zero reconciliation failures. At the frozen `1.5`
scale:

- points spread moved `40.8143 -> 47.6000`, delta `+6.7857`;
- PPG standard deviation moved `0.3284 -> 0.3894`, delta `+0.0610`;
- champion points moved `66.9857 -> 70.9714`;
- draw share moved `0.2801 -> 0.2692`, reduction `0.0109`.

The first two deltas clear the preregistered material-response bands. Draw
share was not above the historical first-division maximum and its reduction did
not clear `0.02`, so `draw_resolution` is excluded. The canonical arm remained
byte-identical in the focused engine proof. The global report correctly stayed
`REFINE` because later owner families were not all identified.

Artifact:
`simulation-out/phase81a-l5-1-owner-attribution-7x10-table-attribution.json`.

Next: 06B10D attributes the excessive veteran load independently from leader
production.
