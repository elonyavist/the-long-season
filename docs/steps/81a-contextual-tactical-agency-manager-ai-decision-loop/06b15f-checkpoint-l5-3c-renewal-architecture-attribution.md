# Step 06B15F - Checkpoint L5.3C: Renewal Architecture Attribution

## Status

**Done - `OWNER_IDENTIFIED: market_distribution` (2026-08-10).** This step changes no gameplay. It
uses one fresh `7 x 10` to decide whether season-ten incumbency comes from
selection despite available replacements, failure to redistribute available
domestic replacements, or a real role-and-quality renewal shortage.

## User-Facing Reason

A ten-season career should contain continuity and renewal together. A player
who was 21 at the opening may credibly remain a leader at 30; that is different
from an old incumbent blocking a ready replacement. The game should therefore
change only the system that actually prevents new prime-age quality from
reaching clubs, rather than forcing veterans out or making every academy
produce stars.

## Frozen Population

- profile `phase81a-renewal-architecture-l5-3c-7x10`;
- fresh prefix `phase81a-renewal-architecture-l5-3c-v1`;
- seven worlds, ten seasons, all three divisions, exactly seven workers;
- first-division season ten owns the replacement-capacity decision;
- the complete ten-season history owns exits, acquisitions and intake-provider
  reachability;
- canonical career execution, player facts and fixture schedules only; no
  second simulator or generated counterfactual player;
- diagnostic JSON, no HTML and no gameplay correction.

## Frozen Origin Taxonomy

The four origins remain separate throughout the checkpoint:

1. `opening_senior` - a registered senior at career creation;
2. `opening_academy` - inherited youth already present at career creation;
3. `annual_academy_intake` - a youth generated during the career;
4. `annual_senior_intake` - an external senior materialized during the career.

`opening_academy` belongs neither to opening incumbents nor to career-generated
players. It is reported as inherited youth. This decision is semantic and
frozen before the new cohort: it prevents the old two-way grouping from making
the `generated` and `opening` gates complementary by construction.

## Paired Architectural Attribution

The analysis joins the existing per-player season facts to the origin facts
from the same observer and the same world. It never changes a player, result,
lineup, seed or schedule.

For every distinct season-ten `opening_senior` leader, two one-to-one maximum
matchings are calculated. A replacement must:

- be age `21..29` at season ten;
- have a different origin from `opening_senior`;
- have the same primary role;
- have current ability at least `incumbent - 0.5`;
- be used at most once in each matching.

The **local** matching is restricted to the same club. The **division** matching
may use any first-division player and is an analysis ceiling, never a transfer
or production policy. Ties use stable player ID. The `0.5` ability tolerance is
the already-frozen quality-matching resolution used by L5.1; it is not derived
from this output.

The report also records:

- leader slots by all four origins and distinct leader players;
- opening age/current-ability pairs and season-ten ability deltas for opening
  leaders;
- annual-academy accepted potential P90, mature current P90, opening-senior
  median and material-minute conversion;
- exits by origin and reason;
- internal transfer and free-agent acquisitions by origin;
- annual-senior provider requested/generated seasons, materialized players and
  leader slots, as an emergency-maintenance diagnostic only;
- exact reconciliation between joined player IDs, origin facts and the
  canonical leaderboards.

## Frozen Decision

- `selection_retention`: opening incumbents exceed `0.50` of leader slots and
  local one-to-one replacement capacity is at least `0.50`. Clubs already own
  enough comparable prime-age replacements, so selection/retention owns the
  block.
- `market_distribution`: local replacement capacity is below `0.50` while
  division replacement capacity is at least `0.50`. Comparable prime-age
  domestic players exist, but the canonical market/selection path does not
  place them where incumbents lead.
- `academy_realization`: division replacement capacity is below `0.50` and
  either fewer than `6/7` worlds have mature annual-academy P90 at or above
  their opening-senior median, or fewer than `75%` of senior-quality annual
  academy players reach the frozen `900` material minutes. Development/intake
  remains the owner.
- `renewal_supply`: opening incumbents exceed `0.50`, local and division
  capacity are below `0.50`, and the aggregate academy-realization checks pass.
  The world produces some senior-quality youth but not enough comparable
  prime-age replacements in the required roles; the next step must correct the
  demonstrated role-and-quality supply owner, not fabricate an external pool.
- `coupled_or_not_attributed`: more than one rule competes, denominators are
  absent, reconciliation is non-zero or none of the rules identifies the
  residual. No gameplay step opens.

The checkpoint result is `OWNER_IDENTIFIED` only for one of the first four
owners with zero reconciliation failures. Otherwise it is `STOP_RETHINK`.
No threshold or origin grouping changes after output.

The `annual_senior_intake` lane cannot become the solution: `requirements.md`
states that the three-division domestic world does not use a synthetic external
pool to imitate unsimulated categories. Its zero/non-zero counts reveal whether
hard maintenance ever requested the existing emergency provider; they do not
authorize broad external recruitment.

## What NOT To Implement

- no retirement, decline, age/output or origin bonus;
- no extra academy quality, quantity or ceiling;
- no generated external player, transfer or free-agent policy;
- no leaderboard reclassification in the historical L5.3 artifacts;
- no additional seeds, smaller season horizon or worker override;
- no 06B16 or 06B17 work before this checkpoint identifies one owner.

## Expected Files

- `apps/cli/src/commands/simulation-report/generational-succession.ts` and its
  test expose origin facts from the existing observer only for this profile;
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and its test
  expose one shared top-ten derivation instead of copying leaderboard logic;
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.ts`
  and its test own the joined metrics, maximum matching and total decision;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and its test own
  the exhaustive checkpoint route and fail-closed section placement;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts` register the locked profile and a fresh cache
  identity;
- `packages/i18n/src/labels.ts` owns the profile labels in all five languages;
- `simulation-out/phase81a-renewal-architecture-l5-3c-7x10.json`;
- `docs/audits/PHASE_81A_CHECKPOINT_L5_3C_RENEWAL_ARCHITECTURE.md` **(new)**
  owns the compact durable result, while the generated JSON remains the exact
  machine-readable evidence;
- `docs/audits/README.md` indexes the active result;
- this step, the phase README and `docs/PROJECT_STATUS.md`;
- the next owner step only after the decision is recorded.

Every additional file must be listed here with its ownership before editing.

## Required Checks

Focused join, taxonomy, one-to-one matching, reachability and total-decision
tests; locked-profile contract; exactly seven reported workers; fresh `7 x 10`
alone; `pnpm check`; `git diff --check`; `graphify update .`.

## Definition Of Done

- all four origins are non-ambiguous and every observed player joins once;
- local and division matching cannot reuse a replacement;
- all decision arms are reachable on real generated career populations, not
  hand-built result objects alone;
- the fresh cohort records one owner or a truthful `STOP_RETHINK`;
- no gameplay, target or historical artifact changes in this step.

## Outcome

The fresh profile completed with real exit `0`, exactly seven workers and zero
reconciliation failures:

| fact | result |
|---|---:|
| opening-senior leader-slot share | `0.6500` |
| local one-to-one replacement capacity | `0.0641` |
| first-division replacement capacity | `0.5256` |
| worlds where mature-academy P90 reaches opening median | `7/7` |
| senior-quality annual academy players reaching 900 minutes | `0.8959` |
| annual-senior provider requests/materializations | `0 / 0` |
| reconciliation failures | `0` |

The same clubs possess comparable prime-age replacements for only `5/78`
distinct opening-senior leaders, while the division contains one-to-one
replacements for `41/78`. Aggregate academy realization is healthy. The unique
owner is therefore `market_distribution`: domestic players exist, but the
canonical market does not place them at the clubs whose opening incumbents keep
the leader slots.

Opening leaders averaged only `23.77` years old at world creation and gained
about `0.49` current-ability points by season ten. They are not simply ancient
players protected by a retirement bug. That result forbids another general age
penalty or academy-growth increase.

## Handoff

Open 06B16 as the owner-only correction for AI domestic recruitment and turnover. It
must improve role/quality need discovery and movement of already-canonical
players; it must not create a synthetic external pool, force a sale, award a
young-player bonus or change leaderboard accounting. A fresh paired checkpoint
must validate the correction before any later gameplay step opens.
