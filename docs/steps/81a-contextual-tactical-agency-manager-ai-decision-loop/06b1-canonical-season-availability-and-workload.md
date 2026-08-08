# Step 06B1 - Canonical Season Availability And Workload

## Status

Prepared by Checkpoint L1's `REFINE`; not started. It opens only after Step 06B
has recorded its stopped-main outcome and repository checks are green.

## Goal

Make the batch career season exercise the same football truths the ordinary
fixture-by-fixture career already owns: an injury or suspension makes a player
unavailable later, and recent starts/minutes can make a fit reserve the better
selection. This is a lifecycle connection, not an aging calibration.

## User-Facing Reason

A ten-season career is not credible when every veteran scorer and assist leader
plays all `34` league matches. Rotation must emerge from workload, condition and
real absences before old-player attributes or retirement are made harsher.

## Before-State

The locked `7 x 10` canary records:

- season-ten `33+` share: `86.4%` among retained top-ten scorers and `76.5%`
  among retained top-ten assist providers;
- every retained `33+` leader: exactly `34` appearances and `3060` minutes;
- `simulateSeason(...)` produces match injury events but never calls
  `applyMatchAvailabilityConsequences(...)`;
- weekly recovery is `5` per day against an `8` match cost, so fitness alone is
  back at `100` before the next ordinary fixture;
- `boundedRecentUseModifier(...)` already reaches `-1.65`, but the batch path
  supplies no `recentUse`, so it is always zero;
- the ordinary career selector already filters
  `playerUnavailabilityReason(...)` and reads the current-month participation
  ledger.

The complete finding and real-football comparison live in
[`PHASE_81A_CHECKPOINT_L1_LEAGUE_DIVERSITY_100X10.md`](../../audits/PHASE_81A_CHECKPOINT_L1_LEAGUE_DIVERSITY_100X10.md).

## What To Implement

1. Give `simulateSeason(...)` one explicit, optional availability lifecycle:
   initial availability, competition match rules, world seed and the ordered
   registered player IDs for each participating club.
2. Before every fixture selection, remove players whose canonical availability
   says injured or suspended. Do not reject them after selection and do not
   invent a report-only availability formula.
3. After every fixture, feed its canonical `MatchReport` to
   `applyMatchAvailabilityConsequences(...)`. Return final availability and the
   ordered consequences in `SimulateSeasonResult` so callers never reconstruct
   them from events.
4. Carry recent use fixture by fixture from the exact participation
   contributions already produced by the season loop. Feed the selector's
   existing `AiRecentPlayerUse` input; do not duplicate
   `boundedRecentUseModifier(...)` or its coefficients.
5. Use the same month-key definition as the ordinary career path. One helper
   owns conversion from canonical participation rows/contributions to the
   selector input; if the current private helper must move, remove the old home
   in the same change.
6. Pass the career state's real opening availability and competition rules from
   `createCompetitionCareerSeasonInput(...)`, then carry final availability
   back into the report career before the next competition/season boundary.
   Multiple competitions must not overwrite one another: combine ordered
   consequences over one shared availability owner.
7. Extend the existing modular report facts, not the CLI surface, with complete
   availability/workload reconciliation and age-by-season diagnostics.

## What NOT To Implement

- No new report command, profile override, simulator or injury generator.
- No arbitrary age term in injury probability.
- No change to aging, development, retirement, transfer targeting, role weights
  or the match injury probabilities/durations.
- No hidden opponent-aware AI, new formation policy or tactical coefficient.
- No persistence/schema/beta reset; this step connects an in-memory batch path.
- No `??` fallback that silently treats missing availability, rules or workload
  as healthy data on the locked profile.

## Frozen Checkpoint L2 Measurements

Run the same locked `phase81a-league-diversity-canary-7x10` profile with exactly
seven workers. Its original seeds, seasons, sections and tactical thresholds do
not move. Add these facts before implementation output exists:

- unavailable selected starters: exactly `0`;
- availability reconciliation failures: exactly `0`;
- worlds with at least one real time-loss injury consequence: `7/7`;
- worlds with at least one non-zero recent-use selector input: `7/7`;
- club-seasons repeating one identical XI in all `34` fixtures: exactly `0`;
- among retained `33+` scorer/assist leaders, share with `34` appearances:
  `<= 0.50` in every seed set;
- pooled seasons `8-10`, `33+` share: `<= 0.25` for top scorers and `<= 0.25`
  for top assist providers;
- absolute difference between pooled seasons `1-2` and `9-10` mean leader age:
  `<= 2.0` years for scorers and assists;
- existing goal-rate, role, stable-ID, reconciliation and selection-fallback
  gates do not regress.

The `0.25` late-career allowance is deliberately far above the `2024/25` Big
Five references (`0.08` scorers, `0.06` assists): it permits a fictional league
to produce several Lewandowski/Budimir-type outliers while rejecting a majority
of elderly leaders. The `0.50` full-schedule allowance is not a demand that old
players be injured; it only rejects the canary's universal perfect availability.

If availability and recent use pass structurally but either age-distribution
target remains red, Checkpoint L2 records `REFINE` and opens a separate aging /
development attribution step. This step is not allowed to tune those systems to
claim its own `GO`.

## Decision

- **GO:** every new lifecycle gate passes and carried gates do not regress;
  return to Step 06B's locked canary before considering the `100 x 10` main run.
- **REFINE:** availability or recent use is still disconnected; reopen only this
  step with the same targets.
- **AGE_ATTRIBUTION:** lifecycle connection is correct but late-career leader
  gates remain red; create the named aging/development step before changing a
  curve.
- **STOP / RETHINK:** the canonical fixture consequences cannot be reused
  without a second simulator or conflicting state owner.

## Expected Files

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/engine/src/career/career-ai-team-selection.ts` and its test, only if
  the current private recent-use projection must move to one shared owner.
- `packages/engine/src/career/match-availability-consequences.ts` and its test,
  only if accepting an ordered batch fact requires deepening the canonical
  owner rather than copying it.
- `packages/engine/src/index.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`
- `apps/cli/src/commands/simulation-report/career-sections.ts`
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`
- `docs/audits/PHASE_81A_CHECKPOINT_L2_PLAYER_LIFECYCLE.md` **(new)**
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- this step document
- `06b-checkpoint-l1-league-diversity-100x10.md`
- `README.md`

Any file exposed by Graphify or a real failing golden is added here with its
ownership reason before editing. A helper moved to shared ownership is deleted
from its old home in the same change; no compatibility wrapper survives.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulation-report/career-world-facts.test.ts apps/cli/src/commands/simulation-report/career-sections.test.ts --maxWorkers=7
pnpm cli simulation-report --profile=phase81a-league-diversity-canary-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-league-diversity-canary-7x10.json
pnpm cli simulation-report --from-report=simulation-out/phase81a-league-diversity-canary-7x10.json --format=html --report-output=simulation-out/phase81a-league-diversity-canary-7x10.html
pnpm check
git diff --check
graphify update .
```

The canary and `pnpm check` run alone, never concurrently. The stale `35`
main-profile checkpoints predate this behaviour and must be removed through the
explicit checkpoint-directory owner before a later main run; they may never be
resumed as post-change evidence.

## Definition Of Done

The batch season consumes canonical availability and recent workload, no
unavailable player is selected, facts reconcile, L2 records one of its declared
decisions on the unchanged `7 x 10`, the report has no new entrypoint or dead
path, and no aging/development coefficient moved inside this step.
