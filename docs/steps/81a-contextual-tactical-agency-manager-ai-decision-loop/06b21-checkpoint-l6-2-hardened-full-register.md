# Phase 81A Step 06B21 - Checkpoint L6.2 Hardened Full Register

## Status

`Done` - `REFINE`, with the historically calibrated upset lane at `GO`.

## Thesis

L6.1D2 accepted a healthier translation of real squad strength into the table,
but its `1+` kickoff-strength bucket combines ordinary favorites with extreme
mismatches. It proves surprises exist; it cannot prove that a tenth-placed side
can credibly beat third or that last beating first remains rare.

L6.2 is a measurement step, not another gameplay correction. It reruns the
complete hardened register on seven fresh worlds over ten seasons and adds two
truthful views of hierarchy:

1. finer kickoff-strength buckets, derived from the exact strength already
   consumed by the match engine;
2. rank-gap facts captured from the canonical league table before a round is
   played, never reconstructed from the final season.

The player-facing purpose is a league where quality matters without making a
result inevitable. There is no comeback factor, rank rubber-banding or hidden
underdog bonus.

## Frozen Population

- profile: `phase81a-integrated-l6-2-7x10`;
- seed prefix: `phase81a-integrated-l6-2-v1`;
- worlds: exactly `7` fresh worlds;
- seasons: exactly `10` per world;
- workers: exactly `7` through the canonical execution policy;
- report entrypoint: only `pnpm cli simulation-report`;
- output: canonical JSON, no HTML in this checkpoint;
- gameplay: current product, including the accepted
  `strengthGapMultiplier = 1.25`;
- every First-, Second- and Third-Division season remains in the full register;
  the new historical upset gates read First Division only.

The run is never resized after output. A `REFINE` is an answer, not a reason to
choose different seeds or a smaller historical band.

## Frozen Measurements

### Canonical pre-round table fact

`simulateSeason(...)` snapshots `computeLeagueTable(...)` once before the first
fixture of each round. Every fixture in that round receives the same snapshot.
The participation fact stores only each side's non-derivable position and
matches played; it does not duplicate points, goals or the table. Fixtures are
eligible for rank analysis only when both sides had at least five matches in
that snapshot.

Capturing after each sequential fixture would let an earlier same-round result
change a later fixture's rank. Reconstructing after the season would be a
second standings simulator. Both are forbidden.

### Kickoff-strength buckets

The old buckets below `1` remain and `1+` is replaced by four disjoint children:

```text
under_0_25
0_25_to_0_5
0_5_to_1
1_to_1_5
1_5_to_2
2_to_3
3_plus
```

The existing largest-gap owner diagnostic derives by summing the last four
buckets. No second `1+` counter is stored.

### Historical rank-gap gates

The sole target source is
[`PHASE_81A_BIG_FIVE_UPSET_BASELINE.md`](../../audits/PHASE_81A_BIG_FIVE_UPSET_BASELINE.md).
For each rank band, L6.2 computes each simulated First-Division league-season's
underdog win and non-loss share, then compares their cohort means with the
frozen historical `p10..p90`:

| Rank gap | Win target | Non-loss target |
|---|---:|---:|
| `1..3` | 0.262816..0.377940 | 0.544878..0.669958 |
| `4..6` | 0.215495..0.352678 | 0.474414..0.630905 |
| `7..9` | 0.173763..0.333333 | 0.409530..0.590523 |
| `10..14` | 0.132353..0.274934 | 0.348419..0.529048 |
| `15+` | 0.038187..0.242241 | 0.158286..0.454545 |

Exact leader versus last place is pooled across the cohort and requires at
least `50` observations. Its gates are win share `0.054674..0.151355` and
non-loss share `0.153299..0.287469`. Fewer than `50` observations is
`not_evaluated` and therefore `REFINE`.

### Complete-register decision

L6.2 wraps the unchanged L5.4 hardened evaluator and adds the upset gates. It
does not remove, rename or suppress any existing failure. The decision is:

- `GO`: every inherited and new gate passes, with zero reconciliation;
- `REFINE`: the population is valid and at least one gate fails;
- `STOP / RETHINK`: current-result leakage, inconsistent round snapshots,
  reconciliation failure or locked-profile contamination.

A valid `REFINE` still opens the already-authorized structural Step 06B22; it
does not authorize any hierarchy correction. `STOP / RETHINK` opens nothing.

## What To Implement

1. Add the minimal pre-round position fact to canonical fixture participation,
   with engine tests proving same-round identity, no result leakage and exact
   final reconciliation.
2. Replace the broad strength bucket with disjoint fine buckets and derive the
   historical `1+` owner reading by summation.
3. Add the versioned Big Five upset target register and tests.
4. Add an L6.2 evaluator which composes the unchanged L5.4 result with rank-gap
   and exact leader-versus-last facts.
5. Register one locked `7 x 10` profile, localized in all five languages, using
   the canonical report entrypoint and seven workers.
6. Run focused tests, `pnpm check`, then the profile alone. Record raw counts,
   rates, failed keys, report hash, artifact SHA-256, wall time and worker count.
7. Update Graphify before using it on changed code and before closeout.

## What NOT To Implement

- no gameplay coefficient or match formula change;
- no rank-based bonus, favorite penalty, comeback logic or rubber-banding;
- no second table implementation and no final-table reconstruction;
- no new report command, formatter or HTML view;
- no threshold movement after the L6.2 artifact exists;
- no 100 x 10 run;
- no Step 06B22 actor-allocation change.

## Expected Files

- `packages/engine/src/use-cases/simulate-season.ts`;
- `packages/engine/src/use-cases/simulate-season.test.ts`;
- `packages/simulation-tools/src/season-recap/season-recap.test.ts` (the only
  hand-built canonical participation fixture must carry the new required fact);
- `apps/cli/src/commands/simulation-report/owner-attribution.ts`;
- `apps/cli/src/commands/simulation-report/owner-attribution.test.ts`;
- `apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`;
- `apps/cli/src/commands/simulation-report/historical-simulation-targets.test.ts`;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts`;
- `apps/cli/src/commands/simulation-report/report-planner.test.ts` (the
  registry has no own test file; this is the locked-profile contract reader);
- `packages/i18n/src/labels.ts`;
- `docs/audits/PHASE_81A_BIG_FIVE_UPSET_BASELINE.md` (new, frozen before run);
- `docs/audits/PHASE_81A_CHECKPOINT_L6_2_HARDENED_FULL_REGISTER.md` (new,
  generated from the completed run);
- `docs/audits/README.md`;
- `docs/steps/81a-contextual-tactical-agency-manager-ai-decision-loop/README.md`;
- this step document;
- `docs/PROJECT_STATUS.md`.

Any additional production file must be named here with its ownership reason
before it is edited.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts \
  apps/cli/src/commands/simulation-report/historical-simulation-targets.test.ts \
  apps/cli/src/commands/simulation-report/owner-attribution.test.ts \
  apps/cli/src/commands/simulation-report/career-sections.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-integrated-l6-2-7x10 \
  --format=json \
  --report-output=simulation-out/phase81a-integrated-l6-2-7x10.json
git diff --check
graphify update .
```

Every gate runs alone. The profile command's real exit code is captured before
reading its artifact; `REFINE` is expected to exit non-zero and is not rewritten
as a process success.

## Definition Of Done

- the historical targets existed before product output;
- rank facts cannot see their own result or another fixture from the same round;
- fine strength buckets are exhaustive, disjoint and reconcile exactly;
- exact first-versus-last and all five rank bands are non-vacuous or explicitly
  `not_evaluated`;
- the complete inherited register remains visible in the decision;
- no gameplay changed and no dead compatibility path remains;
- the canonical artifact, audit, hashes, command and outcome are recorded;
- a valid outcome hands off to 06B22; a structural failure stops.

## Outcome - 2026-08-11

The locked profile completed with exit `1`, zero reconciliation and report hash
`697f2ca79deeab3e8f561f667bc798ff`. The complete decision is `REFINE`; the
new upset decision is independently `GO`:

- every rank-gap lane was observed in all `70` First-Division seasons;
- `7..9` recorded underdog win `0.221353` and non-loss `0.471550`;
- exact first-versus-last recorded `105` fixtures, win share `0.076190` and
  non-loss share `0.228571`;
- all seven fine strength lanes are non-vacuous and show a monotone practical
  hierarchy from underdog win `0.346752` below `0.25` to `0.066667` at `3+`;
- all three standings families are `GO`;
- inherited player renewal, veteran load, squad use, identity and local
  replacement gates remain red.

The real one-season reachability test observes all five rank lanes and fails
the exact-upset sample floor, proving the new rule can fail on generated product
data. Adopted solution, full counts, hashes and handoff live in
`PHASE_81A_CHECKPOINT_L6_2_HARDENED_FULL_REGISTER.md`. No gameplay changed.

Next: document and execute 06B22, replacing only the structural actor-allocation
owner. Upset and hierarchy metrics are green and outside that scope.
