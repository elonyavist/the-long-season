# Phase 81A Checkpoint L4.4 - Development And Renewal

## Decision

**REFINE.** The canonical `7 x 10 x 7` run exited `1`. L5 remains closed and no
replacement HTML was generated.

## Evidence

- profile: `phase81a-development-renewal-l4-4-7x10`;
- report: `simulation-out/phase81a-development-renewal-l4-4-7x10.json`;
- canonical report hash: `d7c730cbc6b0a619b76e616aa619f7b8`;
- worlds / seasons / workers: `7 / 10 / 7`;
- ability pairs observed: `4,303,475`; current-above-potential and out-of-range
  violations: `0 / 0`;
- soft outfield age-`33/34` retirements: `402`; active `33+` players / leader
  rows: `2,547 / 252`;
- generated leader reachability: `7/7` worlds.

The renewal targets remain red:

- worlds reaching the opening-senior median in at least `2/3` divisions: `0/7`
  against `>= 5/7`;
- opening-senior survival: `63.54%` against `<= 60%`;
- opening-origin leaderboard share: `93.10%` against `<= 50%`;
- career-generated leaderboard share: `6.90%` against `30..60%`.

## Structural Finding

The structural checks correctly forced `REFINE` before those behavioural reds
could be treated as an accepted experiment:

1. The L4.3 generation signature moved from frozen
   `972f0c28ae8416ffa703a1cb9ea8bb1c` to
   `a4433bc8b13318ec698300a87cf3238c`. Opening counts, opening medians and
   accepted-intake counts are identical in all `21` world/division rows, but
   accepted-potential P90 is not. The development change therefore altered the
   accepted profile distribution indirectly even though no generation
   coefficient was edited.
2. All `21/21` annual-intake rows cover exactly `8/10` roles. `wing_back` and
   `wide_midfielder` are absent everywhere. This is production truth, not an
   observer defect: `YOUTH_ACADEMY_POSITION_PLAN` contains neither `rwb/lwb`
   nor `rm/lm`, while `positionForIntakeSlot(...)` samples
   `cb/rb/lb/cm/dm/am/rw/lw/st` only.

The checkpoint document had assigned every non-behaviour refinement to Step
06B7F. That owner is wrong for the second finding: annual role continuity is
owned by content generation. Code truth therefore blocks a blind reopen of the
growth coefficient.

## Consequence

No threshold or coefficient moved after output. The `0.18` implementation and
aligned beta-v8 bundle remain the measured code state, but are not sufficient
to open L5.

The recommended next design amendment is a separate annual-intake role-
continuity step that makes both academy refills and senior intake capable of
producing the same ten canonical roles as the initial world, with deterministic
competition-level coverage. That deliberately changes the L4.3 generation
signature, so it requires a newly preregistered paired checkpoint rather than a
post-output relaxation of L4.4. If renewal still misses after that structural
repair, the frozen behavioural result requires a broader development pathway
(reserve/loan/training opportunity), not another unmeasured increase of
`MAX_SINGLE_MONTH_GROWTH`.
