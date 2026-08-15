# Phase 81A Development-Realization Recovery Contract

## Status

**Active design contract after L6.43A.** Step 16M-B owns an observation-only
monthly mechanism replay. Step 16M-C is blocked until that result names one
owner. Step 16N remains the final current-product JSON/HTML checkpoint.

## Thesis

The game needs uncertain, legible succession. A young player with real upside,
a credible club environment and sustained football should have a meaningful
chance to become a senior reference. He may still stall, move, lose his place
or fall short; failure is part of the football story. What is not credible is a
system in which a national stream of selected prospects produces no closed-
window current-16 player at all.

L6.43A traces `716` exact-five assignments. `424` have a closed academy window
and `292` are still open. Among the closed cohort:

- `173` reach senior use and at least `900` minutes but never current ability
  `16`;
- `124` do not reach senior registration;
- `88` register but make no senior appearance;
- `39` remain below `900` senior minutes;
- zero reach current `16`.

`development_realization` is the largest exclusive loss in `6/7` worlds,
owns `0.4080` of the closed cohort and leads the next owner by `0.1156`. This
authorizes investigation of the canonical potential-to-current path. It does
not yet prove which fact inside that path is wrong.

## Why Another Generic Growth Increase Is Forbidden

The canonical owner is already `developPlayersFromParticipationRows(...)`.
Positive growth derives from age, real minutes, performance, club environment,
deterministic variance, role relevance and remaining potential. True potential
and role hard caps remain final ceilings.

This phase already changed `MAX_SINGLE_MONTH_GROWTH` from `0.08` to `0.18` and
then `0.27`, and removed the duplicate multiplication by remaining room. The
fresh L6.43A result was measured with that current implementation. Raising the
same scalar again would repeat a rejected class of remedy and could inflate the
entire player population to make one selected cohort pass.

No engine rule may read `career-generated`, `successor assignment`, a report
cohort or an expected future club need. Any adopted development rule must apply
to every player with the same football facts.

## Step 16M-B - Mechanism Attribution

Replay the exact L6.43A candidate seeds and policy through the same canonical
world producer. The annual cache does not contain the exact month in which a
player crosses `900` senior minutes, so it cannot order opportunity against
dated ceiling loss without guessing. The new observer therefore retains the
existing canonical monthly development changes and participation rows for the
selected IDs; it does not calculate development itself.

The replay must reproduce the L6.43A assignment count (`716`), closed/open
windows (`424/292`), exclusive terminal counts, owner, six-star first-
divergence facts and all world hashes outside the added observation payload.
Any difference is `STOP_INSTRUMENT`, not a new population to interpret.

Every player receives exactly one ordered mechanism:

1. `expected_ceiling_below_16_at_intake` - stored ceiling is five-star but the
   assignment-time p50 is below current ability `16`;
2. `ceiling_lost_before_opportunity` - assignment p50 is at least `16`, but
   canonical role potential is below `16` before the exact month cumulative
   senior minutes first reach `900`;
3. `opportunity_after_growth_window` - canonical role potential remains at
   least `16`, but `900` minutes arrive only when the canonical role/age growth
   multiplier is zero;
4. `realization_rate_under_viable_projection` - p50 is at least `16` at
   assignment, role potential remains at least `16` at `900` minutes and the
   player reaches that threshold during a positive-growth age window, yet
   never reaches current `16`;
5. `instrument_failure` - missing boundary, contradictory projection,
   duplicated ID or impossible non-monotone participation.

The ordered vocabulary is versioned before reading the output. Categories are
exclusive; the evaluator must reconcile to exactly `173`.

One owner is named only when it is the largest category in at least `5/7`
worlds, owns at least `0.20` of the pooled cohort and leads the second category
by at least `0.05`. Otherwise the verdict is `MIXED`. Any instrument failure is
`STOP_INSTRUMENT`.

## Step 16M-C - Conditional Product Correction

Only the L6.43B owner may open a product change:

- `expected_ceiling_below_16_at_intake`: change the one successor allocation
  contract to count credible expected senior ceiling, not merely an upper-tail
  stored ceiling. Keep aptitude and outcome uncertainty; never set current
  ability or guarantee one prospect per club.
- `ceiling_lost_before_opportunity`: correct only the owner that makes a dated
  viable projection disappear before real opportunity. Do not remove aging or
  clamp potential after the fact.
- `opportunity_after_growth_window`: correct only the academy-to-senior timing
  boundary. Do not award protected appearances, synthetic minutes or a
  selected-cohort bonus.
- `realization_rate_under_viable_projection`: reshape the shared canonical
  age/opportunity/potential conversion. Do not raise the global monthly cap and
  do not read player origin or assignment status.
- `MIXED`: no product correction. Pre-register a factorial that separates the
  tied mechanisms.

The chosen branch, exact formula and reachability thresholds are written into
Step 16M-C before implementation. A branch cannot be substituted after seeing
its output.

## Frozen Outcome Bands

The correction must make succession possible without making it automatic.
L6.42A measured `71/7 = 10.14` opening current-16 players surviving at season
ten. L6.43A has `424/7 = 60.57` closed selected windows per world. Pure
replacement therefore requires approximately `71/424 = 0.1675` selected-
cohort conversion before ordinary non-selected supply is credited.

The paired candidate must satisfy all of these:

- closed selected-cohort current-16 conversion `0.20..0.50` pooled;
- at least one selected success and one selected failure in every evaluated
  world;
- generated season-ten current-16 stock reaches opening-senior stock in
  `>=5/7` worlds;
- generated current-16 stock exceeds paired control in `>=5/7` worlds;
- pooled career-generated scorer/creator leader share is `>=0.50`;
- no instant five-star senior at intake and no total current-16 inflation above
  the opening world;
- six-star rarity/allocation identity, all existing football/economy/tactical
  gates and the exceptional-veteran reachability gate remain unchanged.

The `0.20` floor provides a small margin above the measured replacement need.
The `0.50` ceiling guarantees that failure remains the majority outcome; it is
not a target to maximize.

## Execution And Clean-Code Contract

- `pnpm cli simulation-report` remains the only report entrypoint;
- every locked run uses exactly seven workers;
- L6.43B uses the exact L6.43A seeds in a fresh observation-only replay and
  refuses any headline-fact drift;
- L6.43C uses fresh paired control/candidate worlds and independent caches;
- product and analysis arms differ at one typed decision seam;
- any analysis flag, rejected branch, superseded profile, fixture and i18n key
  is removed by Step 16N;
- CLI and web use the same product default;
- Graphify, byte-identical rebuild, `git diff --check` and `pnpm check` are
  mandatory.

## What Must Not Be Implemented

- another global growth-cap increase;
- direct current/potential clamps or post-generation repair;
- origin-, assignment- or club-need-based development bonuses;
- guaranteed stars, protected lineups or synthetic participation;
- a second development formula in a report;
- a second report command;
- threshold relaxation after output.
