# Step 06B19 - Checkpoint L6.1: Renewal Ablation And Funnel Attribution

## Status

**Planned; opens only after 06B18 is Done.** Authorized by Design Contract
Amendment A6 on 2026-08-10 and revised the same day after cross-review. This
checkpoint changes no gameplay. It discharges the 06B16 confounding debt with
a preregistered factorial `2 x 2` ablation, locates the renewal funnel's
bottleneck per unique need, and settles the First-Division champion-points
miss with a frozen truth table. Its verdict alone decides which conditional
correction steps (06B20A-C) may be written.

## Questions This Checkpoint Answers

1. Which of 06B16's two bundled mechanisms - role-aware market, intake
   blueprint - moves local replacement capacity, division replacement
   capacity, four-formation retention and the generated-leader share?
2. Where does the renewal funnel actually break, measured per **unique
   need**? The L5.4 counters (`661,080` recruitable evaluations, `7,311`
   targets found) are repeated evaluations of the same needs across the
   career: their ratio is not a fulfillment rate and is not a premise here.
   Establishing the true unique-need rate is this checkpoint's job.
3. Is the champion-points miss (`72.2571` vs `72.3842`) owned by the shared
   hierarchy calibration, by one of the two mechanisms, or by their
   interaction?

## Frozen Design

### Ablation arms

Four **fresh** arms on the identical seven world seeds, ten seasons, exactly
`7` workers, each run alone:

- `control` - role-aware market AND intake blueprint both disabled;
- `market` - role-aware market enabled, blueprint disabled;
- `blueprint` - blueprint enabled, role-aware market disabled;
- `combined` - both enabled.

The combined arm is re-simulated (not read from cache) because the two new
gates require a canonical observation built from match participations, which
the cached L5.4 fact rows do not retain. The new instrumentation is
observation-only, verified by a **four-part comparison** against the L5.4
report - the two schemas are intentionally different after 06B18, so a
literal whole-report comparison would produce a false `STOP`:

- canonical facts and shared metrics: bit-identical;
- overall decision: still `REFINE`;
- consolidated keys: compared through the mapping 06B18 declared;
- new gates: excluded from the historical comparison, read for the first
  time here.

A deviation in the shared facts proves the instrumentation touched gameplay
and is `STOP`; a schema difference alone never is.

The switches live in an analysis policy at the orchestration boundary,
following the `analysisStrengthGapScale` precedent of 06B10C: never
persisted, never exposed to the game, removal owned by Phase 81A closeout.
The two "off" arms must reproduce the documented pre-06B16 semantics -
department-only `AiMarketNeed` without role succession; generic-balancing
annual intake without the identity blueprint - pinned by unit tests on the
exact decision functions, bit-exact where possible. An "off" arm that only
approximates pre-06B16 behaviour is `REFINE`.

**Coupling asymmetry, declared before the run:** the market axis shares the
generation RNG stream with control (market decisions happen after
generation), so its contrast is tightly coupled. The blueprint axis changes
intake generation, so its stream diverges from the first annual intake
onward and is coupled at seed level only. First divergence is measured on a
frozen per-season signature: the ordered set of `(playerId, clubId, origin,
primaryRole, currentAbility, potentialAbility)`; the first season where an
arm's set differs from control's is its divergence season, recorded per arm.
Blueprint verdicts carry this lower statistical power explicitly.

### Attribution rule (factorial)

For each metric `M` in {local replacement capacity, division replacement
capacity, `fourReplicatedFormationRetentionShare`,
`careerGeneratedLeaderShareSeasonTen`}, compute the four contrasts and the
interaction:

```text
market  without blueprint = market   - control
market  with    blueprint = combined - blueprint
blueprint without market  = blueprint - control
blueprint with    market  = combined - market
interaction               = combined - market - blueprint + control
```

Axis `A` owns `M` only when **all** of the following hold:

- both of `A`'s conditional contrasts exceed `M`'s material floor with the
  same sign;
- per-world coherence reaches `5/7` **for each conditional contrast
  separately**: a world agrees when its per-world delta sign matches the
  aggregate contrast's sign; zeros and per-world deltas below the floor
  never count as agreeing; both contrasts must reach `5/7`;
- the interaction stays within the floor - a material interaction is
  classified `shared/interaction`, never attributed to one axis.

Discordant contrasts, or all contrasts within the floor: `not_reproduced`,
which is `REFINE` for this checkpoint and never a licence to correct.

Material floors, frozen now at no less than two quantization steps of each
metric's real denominator: replacement capacities `0.03`; four-formation
retention `0.02`; generated-leader share `0.02`; champion points `0.5` on
the cohort mean. No floor moves after output.

### Funnel instrumentation (unique needs)

Unique key `world-division-club-season-role`. Per key the funnel records:
first appearance date, the maximum stage reached during the season, and the
terminal outcome at season end; `fulfilled` when at least one coherent
transfer completes. A need first observed with the transfer window closed is
never terminally failed by the window: the June need may complete in August.

A need can reopen within the same season (striker bought, then sold or
unavailable, second striker need). Either a test proves the lifecycle allows
at most one episode per `club-season-role`, or the key gains a
`needEpisodeOrdinal` incremented on every closure or reopening - a fulfilled
first episode must never hide a failed second one. "Maximum stage reached"
requires a total stage ordering, frozen before the run.

The terminal taxonomy is frozen before the run by exhaustive enumeration of
the engine's actual market diagnostic states in `ai-market-lifecycle.ts`,
covering at least: no candidate by age/role/quality, price above valuation
band, seller floor refusal, seller unavailable, player willingness refusal,
buyer budget insufficient, active-negotiation cap, seasonal-start cap,
protected selected club, club already handled in the cycle, recruitment
impossible, negotiation still open at season end, completion failed,
fulfilled. Stage sums reconcile exactly with the unique need-episode total;
a non-zero reconciliation is `REFINE` regardless of any other result.

### Standings truth table

Champion-points cohort mean is read on all four arms with continuous
per-world deltas and the `0.5`-point floor:

- all arms miss similarly -> shared pre-existing owner
  (`population_strength`; opens 06B20C);
- control passes, combined misses -> one axis or the interaction owns it,
  per the factorial contrasts;
- control misses, market/blueprint improve beyond the floor -> positive axis
  response, not a shared regression;
- discordant signs -> `not_attributed`;
- everything within the floor -> `not_reproduced`.

The L5.4 reading is neither rounded nor re-measured in isolation.

## Exit

- **Owners demonstrated:** each of the four metrics has one owner
  (`market`, `blueprint`, `shared/interaction`) or an explicit
  `not_reproduced`; the funnel names the dominant terminal stage per
  division on unique needs; the standings truth-table row is recorded. Only
  then may the matching conditional steps be written - 06B20A for a
  demonstrated market owner, 06B20B for a demonstrated blueprint/identity
  owner, 06B20C for a demonstrated hierarchy owner - one owner per
  correction step, each with an immediate checkpoint.
- **`REFINE`:** any `not_reproduced` metric, any reconciliation failure, a
  non-equivalent "off" arm, or an ablation policy observable in the product.
- **`STOP / RETHINK`:** the combined arm deviates from L5.4 on the
  bit-identical shared-facts comparison (instrument contamination), or the
  arms contradict each other in a way no owner model explains.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts` (arm profiles
  orchestration and factorial reading)
- `apps/cli/src/commands/simulation-report/career-sections.test.ts`
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.ts`
  (unique-need funnel and reconciliation)
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.test.ts`
- `apps/cli/src/commands/simulation-report/report-registry.ts` (four locked
  arm profiles)
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` (analysis policy seam at
  the orchestration boundary, removal owner Phase 81A closeout)
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts` (market-off semantics
  and diagnostic-state enumeration for the funnel taxonomy)
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/content/src/generators/annual-intake-role-plan.ts` (blueprint-off
  path)
- `packages/content/src/generators/annual-intake-role-plan.test.ts`
- `packages/content/src/generators/career-intake-players.ts` (blueprint-off
  path, if the toggle propagates here)
- `packages/content/src/generators/initial-youth-academies.ts` (blueprint-off
  path, if the toggle propagates here)
- `packages/i18n/src/labels.ts` (arm profile titles/descriptions, five
  languages)
- `docs/PROJECT_STATUS.md`
- this step document
- the audit document recording the L6.1 verdict

Files discovered to need refactoring inside this scope are added here with an
ownership note before they change.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/simulation-report/renewal-architecture-attribution.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/career-sections.test.ts
pnpm exec vitest run apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm exec vitest run packages/engine/src/career/ai-market-lifecycle.test.ts
pnpm exec vitest run packages/content/src/generators/annual-intake-role-plan.test.ts
pnpm check
# each of the four arms runs alone, exactly 7 workers, locked profile:
# pnpm cli simulation-report --profile <l6-1 arm profile> --workers=7
git diff --check
graphify update .
```

## What NOT To Implement

No gameplay correction, no coefficient change, no target or floor change
after output, no persisted or player-visible ablation state, no approximated
"off" arms, no cache-derived reading of the two new gates, no interpretation
of blueprint-axis noise as attribution, no correction step opened before the
verdict is recorded.

## Definition Of Done

Four arm runs reconciled at seven workers with the combined arm reproducing
L5.4 exactly; every metric has a named owner, `shared/interaction` or an
honest `not_reproduced` under the frozen floors; the unique-need funnel and
the standings truth-table row are recorded with the frozen rules quoted; the
verdict names exactly which conditional steps may now be written.
