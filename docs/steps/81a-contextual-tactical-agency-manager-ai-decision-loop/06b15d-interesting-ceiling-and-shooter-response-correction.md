# Step 06B15D - Interesting Ceiling And Shooter Response Correction

## Status

**Done and green on 2026-08-10.** Checkpoint L5.3B is active.

## Attribution

### Renewal

The serious-prospect count is now reachable inside the authored `4..8` budget,
and generated season-ten leader share rose by `8.10` percentage points. Yet
first-division annual players aged `21..24` average `10.9442` current ability
with only `0.1462` potential room; `124 / 804` are senior quality. Opening
senior leaders remain at `13.8915` among the age-`33+` survivors.

Increasing serious rarity again would violate the budget that justified
06B15B. The residual sits in the first-division `interesting` ceiling band:
`3.5..4` describes a prospect worth monitoring but leaves most mature good
prospects below the senior alternatives they must eventually contest. Second
and Third Division bands are not implicated and stay unchanged.

### Scorer concentration

The creator response now passes both output and causality diagnostics. Shooter
response remains too strong because shot nomination and conversion are both
legitimate quality paths. It moves alone. Using the same measured baseline,
the current scorer excess above `17.83` is `4.75`, while only `0.67` remains
before the target maximum `18.5`: `0.67 / 4.75 = 0.141`. The next response is
therefore at most one seventh of 06B15B's shooter response.

## Frozen Correction

1. First Division `interesting` prospect ceilings become `4..4.5` stars.
   Serious (`4..5`), rare, Second Division and Third Division bands do not move.
2. Shooter-only task response uses divisor `70` and symmetric bounds
   `0.95..1.05`. Creator response remains divisor `10`, bounds
   `0.625..1.375`.
3. Exact task-weighted conversion centring remains unchanged.
   The focused reachability pre-check exposed one structural inversion before
   the powered run: mandatory creator/shooter separation made an all-round
   finisher more likely to be chosen as creator and therefore ineligible to
   shoot. Select both actors independently. The existing occasion contract
   already makes `creator === shooter` a self-created chance with no assist;
   both self-created and two-player chances must be reachable, and the obsolete
   exclusion helper is removed in the same edit.
4. No aging, recovery, injury, retirement, origin, selection-score, result or
   leaderboard rule changes. The earlier aging and exit experiments stay
   closed; current evidence still shows too few quality-matched alternatives.

## Reachability

- a real generated first-division `good_prospect` must reach the new four-star
  lower edge without becoming serious or ceiling-six;
- the same-role strong shooter must remain selected more often than the weak
  shooter, and both remain reachable;
- self-created and two-player chances must both be reached by the real actor
  stream; a player never receives an assist on his own shot;
- creator reachability and expected shooter conversion centring stay green;
- all contextual ceiling feasibility, rarity and potential-ordering gates hold.

## Expected Files

- `packages/content/src/generators/player-potential-rarity.ts` and contextual
  prospect tests; `player-potential-allocation.test.ts` is the second exact
  reader of the accepted ceiling matrix and must move with its owner;
- `packages/engine/src/match-engine/chance-actors.ts` and tests;
- `packages/engine/src/match-engine/step-match.test.ts` corrects its causal
  boundary: the first identical opportunity is outcome-neutral, while a later
  opportunity may legitimately read the score changed by the first;
- `packages/engine/src/use-cases/simulate-season.test.ts` re-records only the
  measured top-scorer rows; every structural season sentinel remains exact;
- any deterministic projection/economy assets and identities that actually
  move, atomically and without beta compatibility residue;
- all affected career cache identities in `report-registry.ts`;
- canonical CLI/web identity records together;
- this step, phase README, project status and the fresh L5.3B checkpoint.

## Required Checks

Focused reachability/feasibility tests, the complete projection matrix if it
moves, `pnpm check`, `git diff --check`, `graphify update .`, then the locked
L5.3B `7 x 10` alone with exactly seven workers.

## Verification

- seven real first-division annual populations contain reachable four-star
  `good_prospect` ceilings without reclassifying them as serious or rare;
- `20,000` real actor selections keep both same-role shooters reachable and
  select the stronger one more often; creators retain their stronger response;
- ordinary lineups reach both self-created and two-player chances, self-assists
  remain impossible, and shooter conversion stays centred;
- all structural season sentinels stayed exact; only the measured top-scorer
  identities/counts moved under the new actor policy;
- projection/economy matrices stayed green; CLI/web canonical identity moved
  together to `f79237da`; every career cache contract advanced;
- `pnpm check`: `303` files, `2,334` tests, `875` modules, exit `0`.
