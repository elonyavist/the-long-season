# Step 15 - Checkpointed 50x20, Phase Report And Phase 81A Handoff

## Status

**Done 2026-08-07, with one Definition of Done line recorded as not met.** The
cohort ran and replayed on 2026-08-06; the closing documents were written the
following day.

The carried `goals_per_match_avg` monitor is **closed at cohort scale**: mean
`2.670`, p95 `2.740`, band `2.3 .. 3.0` unchanged, failing in `0` of `50` worlds.
That is the evidence Phase 81 exists to produce, and it is the reason the phase
closes.

The line that is not met is the tactical half of "existing and tactical
structural gates have positive observations and pass". The long-run report holds
the formation still for every club by design, so tactical observations over this
population would be vacuous. The reason is in *What Was Found*; the phase's
tactical evidence is the bounded scenario audit, where it has always lived.

The full closing report is
`docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_ENGINE_REPORT.md`.

### Adopted Solution

**The frozen command was run verbatim, twice, with no engine change between the
two runs.** That is what makes the replay a determinism proof rather than a
coincidence: the working tree carried no production modification from the first
run to the second.

| Reading | Value |
|---|---|
| First run | `resumed=0`, `resumed_worlds=0`, `simulated_worlds=50` |
| Replay | `resumed=50`, `resumed_worlds=50`, `simulated_worlds=0` |
| Partition hashes | `50`, identical and in identical order |
| Report diff | **one line of `1493`** |

The one differing line is `Execution:`, which reports whether work was resumed -
the one line that must differ between a run and its replay. Every fact is
byte-identical.

Wall clock was approximately `2h 54m`, a steady `~17` worlds per hour, one world
per shard. No world crashed, none was excluded, and none needed to be declared -
the A10 clarification about declaring crashed worlds did not have to be used.

### What Was Found

**F1 - the carried monitor is closed on genuine cohort evidence.** `2.670` mean,
`2.740` p95, `0` of `50` worlds failing, against the `36/634/80` inherited from
Phase 80A over `750` worlds. Threshold, denominator and severity class are exactly
as inherited. The recorded Step 06-versus-Step 07 ownership disagreement does not
return, because the condition that would have returned it did not occur.

**F2 - the exit code is `1` and no tactical check is red.** Three checks fail, all
of them belonging to other phases:

| Check | Worlds | Owner |
|---|---:|---|
| `player_economy_young_stored_ceiling_six_stock_arrival_category_placement` | `50/50` | Phase 80A, unowned |
| `contract_finance_structural_integrity` | `13/50` | Phase 79, unowned |
| `preliminary_agreement_integrity` | `12/50` | Phase 79, **unowned and new to the record** |

**F3 - `preliminary_agreement_integrity` is named and handed to Phase 79, not
adopted.** It is a `structure`-class check on `preliminaryAgreementViolationCount`
with the rule `pass 0; fail >0`, in
`packages/simulation-tools/src/long-run/contract-finance-stability.ts:742`, and it
concerns preliminary agreements - market behaviour this step may not fix. The
likely reason it appears now is horizon: this cohort runs twenty seasons where
Step 14's ran ten, and its companion check moved from `1` of `20` worlds to `13`
of `50` over the same change. That is a hypothesis this step states and does not
test.

**F4 - the tactical observation line is not met, and was not made to read
otherwise.** `ten-season-report` fields `4-4-2` for every club unless an
inspection hook supplies a per-club shape
(`apps/cli/src/commands/ten-season-report/report-data.ts:4127`), and the frozen
command exposes no flag for it. A formation-diversity observation over this
population reads `1` by construction and an extreme-shape frequency reads `0`. The
phase's own Definition of Done forbids a bounded diagnostic passing on zero
observations, and `AGENTS.md` names this exact failure - a gate that cannot fail
is not a gate - with `asymmetric_incoherence_cost` and `permittedRegression` as
its precedents.

The alternative was considered and rejected with a reason: supplying the per-club
shape through the existing `formationForClub` hook, as Step 12's A10 run did,
would have measured the carried monitor on a different population from the
`36/634/80` it must be reported beside, at the moment that monitor is being
closed. The monitor is why this cohort exists.

**F5 - twenty seasons confirm the A10 clarification empirically.** Club ability
spread collapses from `~6.0..6.9` to `~2.5..3.1` across the horizon. That is why
Step 12's inspection was specified `20 x 5` and not `5 x 20`: a long horizon
measures a world whose clubs have stopped being unequal.

**F6 - the seven-of-ten role defect now has a size.** `5579` role coverage
warnings over `1000` seasons, p95 `119` per world. Known since Step 11, still
unowned, still not this step's - but no longer unmeasured.

**F7 - `PROJECT_STATUS`'s output-path warning was stale for this command.**
`ten-season-report` resolves relative output from the workspace root via
`resolveWorkspaceOutputPath(...)`, which walks up to `pnpm-workspace.yaml`
(`apps/cli/src/commands/ten-season-report.ts:176`). The report and checkpoints
landed at the repository root, not under `apps/cli/`. Corrected in
`PROJECT_STATUS`; not checked for other CLI commands.

**F8 - the generated cohort report still titles itself "Phase 80A Prospect And
Player-Economy Bounded Gates Report".** The long-run instrument is shared and its
heading is not parameterised by caller. Recorded as an observation; this step may
make no production change.

### Football Readings At Twenty Seasons

Table spread average `38.64`, lowest world average `34.70`. Draw rate average
`0.270`, world maximum `0.280`. Champion streak maximum `6`. Top assist maximum
p95 `15`. Minimum squad size `18` with `0` clubs below minimum and `0` clubs
without a natural goalkeeper. Contract/finance structural violations `14` across
`13` worlds.

Warnings, visible and unsuppressed: `senior_active_player_population=50`,
`total_active_player_population=50`, `youth_active_player_population=50`,
`free_agent_population_share=39`, `champion_streak=6`,
`table_points_spread_avg=3`. Signal counts `monitor=150`, `structural=39`,
`story=9`.

## Entry Gate

- Phase 80 and Phase 80A are Done, the latter having carried its
  `goals_per_match_avg` monitor into this phase.
- Phase 81 Steps 01-14 are Done, and Step 13 recorded the carried monitor
  inside its unchanged band.
- Phases 82A and 82B are Planned and not started: no loans, postures, or
  competitive races exist in the world this cohort observes.
- Bounded tactical, finance, persistence, browser, accessibility, repository,
  and absence gates are green.
- No production or cleanup change remains pending.
- Seed, report path, checkpoint path, shards, seasons, and worker count below
  remain unchanged.

## Goal

Run and replay this phase's `50 x 20` against the accepted player model and
tactical match engine, confirm the carried goal-rate monitor holds at cohort
scale, close Phase 81 truthfully, and hand control to Phase 81A.

## What This Cohort Does And Does Not Prove

It proves the accepted tactical match engine over twenty seasons: shape,
matchup, route behaviour, AI selection, competition stability, and the goal
rate carried in from Phase 80A.

It is not market evidence. Under the 2026-08-02 phase order the market work
follows this phase, so this cohort observes a world with no postures, no loans,
and no competitive races. Phase 82B Step 09 owns a second cohort for those. The
report must state this plainly rather than leaving the scope to be inferred, so
that no later phase reuses these numbers as market evidence.

## Frozen Command

```bash
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
```

## What To Implement

- Run the frozen command once after the entry gate.
- Preserve checkpoints until deterministic replay is accepted.
- Record actual workers, stable shard hashes, completed/resumed counts,
  warnings, failures, and positive observation counts.
- Verify years 1, 10, and 20 for existing player, development, market, finance,
  competition, and tactical metrics. Race and loan metrics do not apply: that
  behaviour does not exist yet and its gates report `not_evaluated`, never
  `PASS`.
- Confirm `goals_per_match_avg` stays inside its unchanged band at cohort scale,
  and record the distribution beside the `36/634/80` inherited from Phase 80A
  Step 09. This is the closing evidence for the monitor this phase accepted.
- Add tactical long-run observations without replacing bounded scenario gates:
  formation/route diversity, extreme-shape frequency, tactical warning
  frequency, AI assignment validity, tactic-change frequency, route/goal
  distribution, and no invalid/NaN state.
- Confirm tactical structure does not erase player-quality hierarchy, create a
  universal formation, collapse scoring, or destabilize long-run competitions.
- Rerun the identical command and prove checkpoint reuse plus identical report
  facts.
- Run final `pnpm check`.
- Write the Phase 81 report with delivered behaviour, code/refactor removals,
  verification, manual inspection, warnings, residual monitors, and an explicit
  statement that this cohort observed no loans and no races.
- Write the Phase 81A handoff. That phase is already scoped in
  `docs/steps/81a-season-anchored-contracts-free-agent-economy-and-background-fixtures/`,
  so the handoff confirms its entry gate rather than restating its scope:
  the carried monitor is inside band, the four seams below exist, and no loan,
  posture, or race behaviour was introduced.
- Record the seams this phase leaves for that work: the named squad-depth
  accessor, the context constructor taking an explicit squad, the non-selected
  club as an ordinary caller, and the `(worldSeed, fixtureId)` match RNG key
  that makes resolution order irrelevant.
- Leave Phase 79 Step 14 Reopened, paused, unrun, and unclaimed.
- Close only on genuine pass; otherwise mark Phase 81 blocked without tuning.

## What NOT To Implement

- No production fix, refactor, tuning, threshold relaxation, seed exception,
  manual report edit, warning suppression, or checkpoint deletion.
- No worker count other than `7`.
- No longer-than-20-season, duplicate, or release-scale Phase 79 cohort.
- No market or race claim from this cohort: the behaviour did not exist when it
  ran.
- No Phase 81A implementation. This step names the work and hands it over.
- No Phase 79 Step 14/15 implementation.

## Expected Files

- `docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md`
- `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_ENGINE_REPORT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- this phase README
- this step document
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`

Checkpoint files remain ignored under:

- `saves/long-run-checkpoints/phase81-tactical-shape-50x20/`

## Required Checks

```bash
nvm use 24
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
pnpm check
test -f docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
git diff --check
graphify update .
```

## Definition Of Done

| Line | Status |
|---|---|
| `50 x 20` completes from 50 stable shards with exactly seven workers | **met** - `simulated_worlds=50`, `shards=50`, `workers=7`, one world per shard |
| Replay reuses checkpoints and reproduces report facts | **met** - `resumed=50`, `simulated_worlds=0`, one differing line of `1493`, `50` identical partition hashes |
| Existing and tactical structural gates have positive observations and pass | **NOT MET.** Existing gates: met. Tactical: the long-run report fields one formation for every club, so these observations cannot have a positive denominator on this population. F4 records why, and no gate was added that would have passed vacuously |
| No universal tactic, invalid shape, dead path, duplicate calculation, or compatibility residue remains | **met** - `pnpm check` green, including the localized-text, squad-depth and role-department absence checks |
| Warnings stay visible and truthfully classified | **met** - six warning families reported, none suppressed |
| `goals_per_match_avg` inside its unchanged band at cohort scale, beside the inherited `36/634/80` | **met** - `2.670` mean, `2.740` p95, `0/50` failing; F1 |
| The report states plainly that this cohort observed no loans and no races | **met** |
| Phase 81 is complete | **met**, with the line above recorded as not met rather than claimed |
| Phase 81A is the only next owner, entry gate confirmed, four seams named | **met** |
| Phase 79 Step 14 remains unrun and unclaimed | **met** - and two of its checks are named in its own step document by this step |

## Handoff, 2026-08-07

**Phase 81A inherits an engine this step did not touch.** No production file was
modified here. The working tree carried no change between the run and the replay,
which is what makes the one-line report diff a proof of determinism rather than of
luck.

Its entry gate is confirmed: the carried monitor is inside band at cohort scale,
no loan, posture or race behaviour exists, and the four seams it consumes are in
place - the named squad-depth accessor, the context constructor taking an explicit
squad, the non-selected club as an ordinary caller, and the `(worldSeed,
fixtureId)` match RNG key. Named for it also: the contract-duration representation
change and the simulate-match command as the background-fixture resolution point.

**Two seam caveats travel with it.** The A6 absence assertion **enumerates nine
files and cannot see a tenth**; Step 13 found three readers outside it
(`career-squad-adapter.ts:245`, `formation-fit-output.ts:108`,
`report-data.ts:4106`). Nothing differs today and Phase 82A's loan change is where
that stops being true. Step 02 owns making it discover rather than enumerate, and
it is not done.

**Handed to Phase 79**, in its own step document rather than only here:
`contract_finance_structural_integrity` at `13/50` and
`preliminary_agreement_integrity` at `12/50`, the second new to the record. Phase
79 Step 14 stays Reopened, paused, unrun and unclaimed.

**Still unowned, and this step adopts none of them:** the seven-of-ten role
generation - now measured at `5579` role coverage warnings over `1000` seasons -
the Phase 80A
`young_stored_ceiling_six_stock_arrival_category_placement` check at `50/50`
worlds, the incomplete `presentationMessageKey` families from Step 10, and the
timing-sensitive `wide journey` browser assertion.

**The counter-move work has a first step and it is not a coefficient.** Step 14
handed over the lopsided population and the conservation question, together. This
step's closing report carries that diagnosis one level deeper: capacities are
independent monotone functions of the same eleven with no shared budget, because
`validateContributionWeights(...)` imposes no constraint on the sum of a role's
task weights
(`packages/domain/src/balance/match-tactics-calibration.ts:833`). Ranking by route
advantage therefore *is* ranking by mean capacity, and the matrix is transitive by
construction - which is why Step 14's `57`-configuration sweep could not find a
3-cycle at any setting.

Two notes for that owner, both hypotheses stated and not tested here. A
conservation law may only relocate the dominant strategy rather than remove it,
because `saturate(r) = r / (r + reference)` is concave and a balanced allocation
maximises the sum of capacities; declare that prediction before measuring. And
Step 14's sweep does **not** rule out `routeSelectionSharpness` once capacities are
conserved - it ruled it out over positively correlated capacities, where no
setting could have worked. Conservation first, then re-measure.

Asymmetry cannot come from the weight table: weights are declared per task rather
than per capacity precisely so left/right mirror symmetry is structural
(`packages/domain/src/balance/match-tactics-calibration.ts:63`). It can only come
from `slot.side` and the channel policy. The two halves touch two different seams,
which is why they must be taken together and why neither is a small change.
