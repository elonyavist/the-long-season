# Phase 81 - Season Recap Design

Design contract for the season-recap instrument and the hundred-season engine
inspection. Written before either is built, so the expectations below are
predictions rather than descriptions of output already seen.

## Why This Exists

`goals_per_match_avg` reads `2.78` and passes. That number is true and it is
almost useless on its own: it stays `2.78` whether the goals were scored by
strikers or by centre backs, whether one forward scored `45` and everyone else
none, whether the same club won every season for twenty years, and whether every
club fielded the same shape.

Phase 81 added intrinsic shape, relational matchup, phase-aware routes, causal
actors, and AI whole-XI selection. Every one of those changes *who does what* on
the pitch, and almost none of it is visible in an aggregate rate.

**A league table, a scorer chart and an assist chart are the cheapest complete
test of whether the football is real.** A manager reading them knows instantly
whether the engine works, in a way no invariant states. This instrument produces
them, and states in advance what they must look like.

## What This Is, And What It Is Not

It is an **inspection instrument**. It reads facts the season simulation already
produces and prints them as football, then checks them against bands declared
here in advance.

It is **not** the phase cohort. Step 15 alone owns the checkpointed `50 x 20`
and remains the only statistical evidence Phase 81 closes on. Nothing produced
here is cited as balance evidence, and nothing here may be used to justify
changing a calibration value. Its job is to make a defect *visible*, not to
measure its size.

Running it before Step 15 requires phase amendment **A10**, because the phase
README forbids any cohort before that step. That rule exists to stop premature
statistical claims, which is exactly what the paragraph above forbids anyway.

## Where The Numbers Come From

Nothing here simulates anything new. Every field already exists:

| Chart | Source |
|---|---|
| League table | `SimulateSeasonResult.table` (`LeagueTableRow[]`) |
| Goals, assists | `SimulateSeasonResult.playerSummaryStats` (`SeasonPlayerSummaryStatRow`) |
| Role | `Player.primaryRole`, joined by `playerId` |
| Shape fielded | the formation each AI club selected (Step 09) |

`apps/cli/src/commands/ten-season-report/report-data.ts` already retains both
`table` and `playerSummaryStats` per season and aggregates them away. The
instrument keeps them and prints them instead.

## The Four Charts

Per simulated season, in a readable file per season:

1. **League table** - position, club, played, won, drawn, lost, goals for,
   goals against, goal difference, points.
2. **Top scorers** - player, club, **role**, goals, matches played.
3. **Top assists** - player, club, **role**, assists, matches played.
4. **Shapes fielded** - each formation used, by how many clubs, and the mean
   points of the clubs that used it.

The fourth is not decoration. Step 14 has to raise formation from `0.0312` to
`~0.047` as a counter-move reward, and it cannot do that without first knowing
that clubs actually field different shapes and how those shapes finish.

## What Must Be True, Declared In Advance

Bands are stated as **rates per match played**, because the generated league
system does not have to keep the club count real football happens to use. The
absolute is shown beside it for readability; the rate is what the gate reads.

Reference is one full domestic season in a top European league, which is the
football this engine is imitating.

| Check | Band | Why this band |
|---|---|---|
| champion points per match | `1.95 - 2.65` | `74 - 100` points over `38` |
| bottom club points per match | `0.35 - 0.80` | relegation is possible, collapse is not routine |
| points spread first to last, per match | `1.25 - 2.05` | a league, not a lottery and not a procession |
| top scorer goals per match | `0.45 - 0.95` | `18 - 36` over `38` |
| top assists per match | `0.20 - 0.50` | `8 - 19` over `38` |
| goals per match | `2.30 - 3.10` | the carried A7 monitor's own football range |
| home win share | `0.38 - 0.52` | home advantage exists and does not decide everything |
| draw share | `0.18 - 0.32` | draws are common and not dominant |

Role checks, which are the sharpest of the lot:

| Check | Band |
|---|---|
| top ten scorers who are strikers, wingers or attacking midfielders | `>= 0.60` |
| goalkeepers in the top ten scorers | `0` |
| centre backs in the top ten scorers | `<= 1` |
| top ten assists who are midfielders or wide players | `>= 0.55` |

Across the whole inspection:

| Check | Band | Why |
|---|---|---|
| distinct champions over `20` seasons | `>= 3` | no permanent dynasty |
| distinct formations fielded in a season | `>= 5` | Step 09 gave clubs real shapes; this proves they use them |
| seasons with any `NaN`, negative or impossible value | `0` | absolute |

**A band that fails is a finding, never a reason to widen the band.** The
project rule is already written: *do not tune systems just to make reports
greener*. If the champion averages `2.9` points a match, the answer is to find
out why, not to move the number to `2.95`.

## What This Instrument Cannot See

Stated because a measurement whose population is unstated is not evidence.

- **One country.** The bands are conditioned on a single-country population, the
  same condition A4 puts on the frozen quality-versus-structure bands.
- **No market.** Under the 2026-08-02 phase order there are no loans, no
  postures and no competitive races. Squads change only through the mechanisms
  that exist today.
- **No manager.** Every club here is AI-selected. It says nothing about whether
  a human manager's decisions matter, which is what the Step 07B decision table
  measures instead.
- **Sample size.** A hundred seasons resolves gross defects, not small effects.
  Anything near a band edge is unresolved and belongs to Step 15's cohort.

## Reading Order

The aggregate is what a person reads. The per-season files are what they open
when the aggregate looks wrong. Designing it the other way round produces two
thousand table rows nobody ever reads and a defect that survives anyway.
