# Phase 81B - Latent Career Trajectory, Player Population And Succession Engine

## Status

**Approved. Active from Step 00, after the Phase 81A closeout commit.** This is
the successor to Phase 81A, which closed with `STOP_RETHINK` when its succession
hypothesis was falsified. The previous contract/background-world Phase 81B has
been narrowed and moved to Phase 81C.

The product decisions in *Locked Product Decisions* are **accepted**. This
self-contained folder records the thesis, measured failure, accepted product
decisions, target architecture, code impact map, implementation steps and
validation ladder.

`requirements.md` is **not** edited during the Phase 81A closeout. Step 00 reads
its real text, identifies the clauses semantically involved, and applies the new
contract in one coherent pass. Where a clause an earlier draft said it would
"replace" does not literally exist, Step 00 records the requirement as **added or
clarified** rather than inventing a prior requirement to supersede.

Phase 81B follows Phase 81A and precedes Phase 81C, 82A and 82B. Loans, market
races, season-clock contracts and complete-background-world work must not be
built on the current ambiguous `Player.potential` semantics.

## Thesis

The generational-renewal failure is not primarily an AI error and it is not
fixed by producing more five-star players.

Today one persisted field, `Player.potential`, has four incompatible jobs:

1. hidden football truth;
2. source of the public P50/upper forecast;
3. growth limit consumed by monthly development;
4. value compressed toward current ability by aging.

Generation selects exceptional players through special five/six-star lanes,
the forecast applies age coefficients to the room between current ability and
that ceiling, and aging reduces the same ceiling before many players accumulate
sustained opportunity. Forecast, development limit and observed outcome are
different readings of the same mutable number.

The measured result is a truncated pyramid: useful and good generated players
exist, but the upper tail does not renew. The current five-star diagnostic
cohort entered with median expected ceiling `14.38`, lost its `16` ceiling
before sustained exposure in `152/154` judgeable cases, and produced no `16+`
player at fifteen seasons. Raising P50 would relabel the same population.

The definitive solution separates four truths:

- **current ability**: what the player can do now;
- **latent career trajectory**: stable, hidden, multidimensional innate facts;
- **reachable career path**: derived from trajectory, age, development,
  opportunity, injuries and decline;
- **public forecast**: one uncertain absolute distribution shared by manager,
  AI, valuation and presentation.

Generation creates one continuous, long-tailed population across every tier.
Five and six stars are derived forecasts, not creation lanes. The world needs
elite players, strong starters, ordinary starters, backups and late surprises.
Succession replaces the opening cohort across the entire pyramid.

## Product Outcome

After fifteen seasons the game should still contain:

- a credible first-, second- and third-division ability pyramid;
- numerous `10-13` players useful in lower divisions or as depth;
- `14-15` players who are strong starters or rotation options;
- a thin, non-zero `16+` elite tail;
- generated players replacing the opening cohort at every tier;
- forecast classes with ordered but overlapping outcomes;
- rare over-33 stars without systematic veteran domination;
- AI recruitment for immediate upgrade, dependable depth and succession;
- AI recruitment from owned players and free agents through the same need and
  candidate-scoring policy;
- transfers moving players toward a level where they can contribute.

No single club, season or division must contain every tier. The invariant is
statistical across declared populations.

## Entry Gate

Phase 81B starts only when:

- **Phase 81A is closed with `STOP_RETHINK`, L6.43B valid and L6.44 formally
  `superseded_not_executed`.** Satisfied. 16M-C and 16N are superseded rather
  than blocked; no GO was manufactured for a policy that was never adopted. The
  81A artifacts remain evidence of the old model, not targets for the new one.
- **The product decisions below are accepted.** Satisfied.
- **Step 00 is authorized to freeze the baseline and numeric register before any
  gameplay change**, and owns the six-star baseline measurement described under
  *Six-Star Baseline*. No Step 01/02 production change may precede that freeze.
- Phase 81C, 82A and 82B have not started, and their entry gates require this
  phase to close with GO.
- The dirty Phase 81A tree is closed by its owner in the closeout commit. Phase
  81B never overwrites another phase's only copy.

## Six-Star Baseline

Step 00 measures the **old** six-star lane before any generation change, in the
same locked baseline profile, separating at least: supply, opportunity and
minutes, `16+` attainment, initial forecast, ceiling loss or compression,
censoring, and outcome. Neither lane is a target of the new architecture; the
measurement records what the superseded model did.

It carries one conclusion forward as a constraint: **the six-star lane is today
load-bearing.** L6.43B measured it as the only elite-capable generation in the
engine - ceilings `17.02..19.75` against five-star's `16.01..16.49` - so its
removal may not precede a demonstration that the new continuous tail is
reachable. This measurement does not block the 81A closeout; it blocks the
production changes in Steps 01 and 02 until Step 00 has frozen it.

## Locked Product Decisions

- Public ratings remain global and absolute. The existing `1..6` half-star
  presentation remains unless Step 00 explicitly supersedes it.
- Six stars are an extraordinary derived class; no six-star generation lane.
- `16` remains the elite role-ability threshold.
- Hidden trajectory is stable and multidimensional. Career events affect
  realization, not innate talent.
- Serious injury may persist physical career damage without rewriting latent
  technical/mental talent.
- AI and manager receive the same public forecast and no hidden oracle.
- Five stars have the highest elite probability but no guarantee. Four-star
  and ordinary players retain non-zero breakthrough probability.
- Opening seniors, academies and annual intake use one population Module,
  conditioned by age/readiness.
- Long-run high-tail supply follows deterministic `3:2:1` across D1/D2/D3,
  not exact per-season or per-club quotas.
- Clubs in one division have equal base talent access. Club identity shapes
  roles/profiles, not hidden quality, until academy quality exists.
- Division affects readiness more than innate talent. Lower divisions retain
  rare access to elite latent talent.
- Intake quantity responds to exits, headcount and role health. Quality never
  rubber-bands to replace missing stars.
- Every player receives base training; minutes/performance add bounded
  acceleration. Lost time consumes the window but does not delete talent.
- Maturation and decline differ by ability family and role.
- Every player retires no later than the end of the season in which he turns
  `37`.
- AI uses three intents: `immediate_upgrade`, `depth`, `succession`; it may buy
  young prospects, ready stars or medium backups.
- The same recruitment policy ranks owned-market and free-agent candidates.
  Free-agent status changes transaction mechanics, not squad-need semantics.
- Phase 81B measures free-agent stock, inflow, outflow and attributed signing
  under the current contract clock. Phase 81C later changes the season clock
  and revalidates its cadence; it must not create a second signing policy.
- Loans consume the development Interface later in Phase 82A; not here.
- Incompatible beta saves are deleted. No migration, fallback or dual reader.

## Architecture Summary

The phase deepens three Modules:

1. `PlayerCareerTrajectory` owns non-derivable hidden career facts behind a
   small domain Interface.
2. `derivePublicPlayerAssessment(...)` remains the single forecast Seam and
   becomes probability-based. UI, AI, valuation, wages and willingness consume
   that one Interface.
3. `PlayerPopulationPolicy` becomes the content-owned source for opening
   seniors, academies and annual intake. Composition roots provide context but
   do not implement separate talent models.

The deletion test is binding: after migration, deleting the old rarity
allocator, reachable-potential allocator or potential ratchet must not spread
their complexity into callers. Their behavior is replaced by the three deep
Modules, then obsolete Modules/exports are deleted.

Supporting documents:

- [`ANALYSIS.md`](ANALYSIS.md)
- [`DESIGN_CONTRACT.md`](DESIGN_CONTRACT.md)
- [`CODE_IMPACT_MAP.md`](CODE_IMPACT_MAP.md)
- [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md)
- [`VALIDATION_PROTOCOL.md`](VALIDATION_PROTOCOL.md)

## Ordered Steps

1. `00-product-contract-requirements-and-frozen-baseline.md`
2. `01-domain-trajectory-contract-persistence-and-single-beta-reset.md`
3. `02-continuous-national-player-population-policy.md`
4. `03-checkpoint-a-generation-and-forecast-reachability.md`
5. `04-canonical-probability-forecast-and-market-consumers.md`
6. `05-development-aging-injury-and-retirement-realization.md`
7. `06-checkpoint-b-two-season-realization-and-aging.md`
8. `07-ai-recruitment-intents-and-role-succession.md`
9. `08-web-presentation-and-obsolete-model-deletion.md`
10. `09-checkpoint-c-five-season-market-and-squad-renewal.md`
11. `10-checkpoint-d-seven-by-fifteen-longitudinal-pyramid.md`
12. `11-owner-only-calibration.md`
13. `12-checkpoint-e-repeated-seven-by-fifteen.md`
14. `13-checkpoint-f-fifty-by-twenty-html.md`
15. `14-closeout-and-phase-81c-handoff.md`

## Validation Ladder

- Step 00 freezes evidence/numeric hypotheses before implementation.
- Steps 01-02 replace persisted truth and generation owner.
- Checkpoint A proves population and forecast reachability on real worlds.
- Steps 04-05 connect forecast, development, aging, injury and retirement
  without parallel formulas.
- Checkpoint B runs `7 x 2` with exactly seven workers.
- Steps 07-08 migrate AI, free-agent recruitment and presentation, then delete
  obsolete callers, exports, fixtures and config fields.
- Checkpoint C runs `7 x 5` for AI intents, free-agent flow, market and early
  renewal.
- Checkpoint D is the decisive `7 x 15` owner-attribution run.
- Step 11 changes only owners demonstrated by D.
- Checkpoint E repeats the identical `7 x 15` population/gates.
- Checkpoint F is the broad `50 x 20` HTML product review, split into four
  five-season windows. It replaces `100 x 10` and does not substitute for the
  paired fifteen-season attribution evidence.

Every batch uses `pnpm cli simulation-report`, Node `24.16.0`, exactly `7`
workers when seven work items exist, and runs alone.

The implementation paths, locked profile IDs, formulas, populations,
non-vacuity rules and failure owners are centralized in
[`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md).
Step documents name their exact minimum files and cite that register; they do
not maintain second copies of metric definitions.

## What This Phase Does Not Implement

- No scouting fog, staff, facilities or club-specific academy quality.
- No loans, recall, loan promises or loan development bonus.
- No transfer races or multi-buyer resolution.
- No season-anchored contract rewrite, background-fixture completion or
  `simulate-match`; Phase 81C owns those later.
- No claim that the 50 x 20 HTML proves complete domestic tables. It reviews
  the player model on the facts the canonical runner currently owns.
- No direct age penalty to goals, assists or selection.
- No hard guarantee that one club/season contains a star, role or tier.
- No AI oracle, second simulator/report/projection, or beta compatibility path.

## Phase Definition Of Done

- `Player.potential` no longer carries four meanings.
- One persisted latent trajectory and one continuous generation policy exist.
- Special five/six-star lanes and the potential ratchet are deleted without
  callers/exports left behind.
- Public forecast is absolute, probabilistic, deterministic and shared.
- Development, aging, serious injury and retirement consume the trajectory
  through one engine Interface.
- AI demonstrably recruits ready upgrades, depth and successors using public
  facts only, including free agents through the same policy.
- Checkpoints A-F close in order; later green evidence cannot launder an
  earlier red gate.
- `pnpm check`, dependency rules, determinism, storage, Graphify and browser QA
  are green on Node `24.16.0`.
- Phase 81C consumes the new recruitment/development/forecast Interfaces and
  owns the contract clock plus complete domestic world before Phase 82A.
