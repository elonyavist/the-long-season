# Phase 81A Checkpoint L5 - Integrated Player World

## Decision

**REFINE.** Rotation, substitutions, availability and injuries are now healthy,
but career-generated players still replace opening leaders too slowly and the
late-career leader distribution remains too old. A separate formation-
replication gate also remains below target. The `100 x 10` main run is not
authorized.

## Locked Population

- profile `phase81a-league-diversity-canary-7x10`;
- seven worlds, ten seasons, three competitions, exactly seven workers;
- all eight career sections produced by the one canonical world execution;
- fresh complete-world cache `facts-v5` under the v9 projection bundle;
- canonical report hash `b2dc660f8024fe7f754dd85547b54025`;
- JSON SHA-256
  `3ff22d4e3b97360dde4647b5ca5acf14120e24561563d42e2fccd5415d9be917`;
- HTML SHA-256
  `338815379856a1e4e2cdf9b417f70edbbbbee70ccc6e28275746efcc2cb9fa7f`.

The first aggregation exposed an old `Math.min(...rows)`/`Math.max(...rows)`
call whose argument list overflowed at `128,520` team-match rows. The seven
complete world checkpoints were valid. The aggregate was changed to a linear
bound reduction and replayed from those exact shards; no match was simulated a
second time and no result was inspected before the fix.

## Match, Rotation And Availability

| Metric | Result | Gate |
|---|---:|---:|
| mean substitutions per team-match | `4.277397` | `3.5..4.9` |
| median first substitution minute | `60` | `50..70` |
| substitution range | `0..5` | non-mechanical, max `5` |
| invalid minutes / rule violations / reconciliation | `0 / 0 / 0` | `0` |
| unavailable selected players | `0` | `0` |
| time-loss injuries per `1000` player-hours | `22.476841` | `20..50` |
| clubs fielding one identical XI in all `34` matches | `0` | `0` |
| `33+` leaders with all `34` appearances | `0.023952` | `<= 0.50` |

This is the important separation: the original all-34-appearances anomaly is
fixed without forcing every team to make five changes and without using age in
goal or assist resolution. Increasing injuries or generic fatigue again would
target a result that is already green.

## Age And Renewal

| Metric | Result | Gate |
|---|---:|---:|
| scorer `33+` share, seasons `8..10` | `0.422222` | `<= 0.25` |
| assist `33+` share, seasons `8..10` | `0.373016` | `<= 0.25` |
| scorer mean-age drift, seasons `1..2` vs `9..10` | `2.535714` | `<= 2.0` |
| assist mean-age drift | `2.085714` | `<= 2.0` |
| active opening-senior survival at season ten | `0.545575` | `<= 0.60` |
| opening-origin season-ten leaderboard share | `0.773810` | `<= 0.50` |
| career-generated season-ten leaderboard share | `0.226190` | `>= 0.30` |
| worlds with a career-generated leader | `7/7` | `7/7` |
| worlds reaching development parity | `5/7` | `>= 5/7` |

The origin shares come from the generation-boundary observer, not from player-ID
patterns. The result rules out the tempting inference that the visible younger
names in one retained table prove sufficient renewal. Development can now
produce senior-level players at the exact lower bound. Fresh L4.3 attribution
therefore moves from development realization to downstream selection/outcome
in `5/7` worlds, but opening players still retain too much leaderboard share.

The next owner must therefore distinguish age-conditioned ability evolution,
selection quality and exit/retention on paired existing facts. It must not add
a direct age penalty to goals or assists, and it must not enlarge senior squads
merely to increase the count of young players: a larger incumbent roster can
reduce the minutes available to the academy path that is already working.

## Carried Tactical Health

Opening gates pass, all ten roles persist in every competition-season, at least
six shapes persist in all `210` competition-seasons, top-share retention is
`0.990476`, maximum top share is `0.333333`, and all fallback, missing-ID and
reconciliation counts are zero. The remaining failure is
`fourReplicatedFormationRetentionShare = 0.890476` against `0.95`. It is a
separate long-run population/selection owner and is not evidence for changing
player aging.

## HTML Review

The English desktop artifact was rendered only from the canonical JSON and a
second render was byte-identical. The unchanged renderer's `1440 x 1000` QA has
body width `1440`, eight navigation links and eight visible sections with no
blank or clipped page shell. The transfer section contains formatted euro
amounts and both buying and selling competition facts; the JSON retains integer
minor units. Screenshots are local artifacts under `simulation-out/` and are
not evidence beyond presentation QA.

## Reproduction

```bash
pnpm cli simulation-report --profile=phase81a-league-diversity-canary-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-league-diversity-canary-7x10.json
pnpm cli simulation-report --from-report=simulation-out/phase81a-league-diversity-canary-7x10.json --format=html --report-output=simulation-out/phase81a-league-diversity-canary-7x10.html
```

Both commands exit `1` because rendering preserves the canonical `REFINE`
decision. They still write their complete artifacts; the exit is not a runtime
failure.
