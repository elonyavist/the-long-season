# Step 06B22A - Empirical Shooter-Propensity Baseline

## Status

Done - **GO**. The frozen corpus reconciled twice with byte-identical output;
the adopted baseline is in
`docs/audits/PHASE_81A_STATSBOMB_SHOOTER_PROPENSITY_BASELINE.md`.

## Why 06B22 Reopened

L6.3 rejected the Step 06B22 shooter rule: top-ten scoring reached `37.38`.
The error is semantic, not numerical. Tactical-shape allocation describes how a
role contributes to the team's capacity to reach the final third; it is not the
frequency with which one player takes the team's shots. Reusing it as actor
propensity made striker responsibility `7.71x` central-midfield responsibility
before ability entered.

Creator allocation remains out of scope. L6.3 records creator correlation
`0.3197` and top-ten assists `10.25`, both healthy.

## Frozen External Source

Use [StatsBomb Open Data](https://github.com/statsbomb/open-data), which exposes
match, lineup and event JSON and explicitly includes the acting player's
position on events. The repository is frozen at commit
[`b0bc9f22dd77c206ddedc1d742893b3bbe64baec`](https://github.com/statsbomb/open-data/tree/b0bc9f22dd77c206ddedc1d742893b3bbe64baec)
(`2026-05-26T14:59:55Z`). Any later upstream update is a different corpus and
cannot replace this one inside the step.

The frozen male domestic-league population is:

| Competition | IDs | Season | Matches |
|---|---:|---:|---:|
| Premier League | `2 / 27` | 2015/16 | 380 |
| La Liga | `11 / 27` | 2015/16 | 380 |
| Serie A | `12 / 27` | 2015/16 | 380 |
| Ligue 1 | `7 / 27` | 2015/16 | 377 |

Total: `1,517` matches. Bundesliga is excluded before extraction because the
open-data season exposes only `34` matches, not a league population. Other
listed La Liga seasons are excluded because many are club-selected rather than
complete league seasons. The corpus is selected by coverage, never by the
propensity values it produces.

StatsBomb must be credited in the resulting audit, as required by its open-data
terms.

## Frozen Derivation

The output is **non-penalty, non-direct-free-kick shots per 90 position-minutes**
for each canonical role. It is a per-fielded-slot propensity, not a raw event
share and not a game-output calibration.

For each match and team:

1. initialize active players and positions from the `Starting XI` tactics row;
2. convert event minute/second to a monotonic match second;
3. accrue exact elapsed seconds to every active player in his current position;
4. on `Tactical Shift`, replace positions for the active IDs stated by the
   canonical tactics lineup;
5. on `Substitution`, accrue first, remove the outgoing player and give the
   replacement the outgoing player's current position until a later tactical
   shift;
6. on red or second-yellow dismissal, accrue first and remove the player;
7. accrue the final interval to the maximum recorded match second;
8. attribute every eligible `Shot` to the event's explicit position; exclude
   shot types `Penalty` and `Free Kick` because the current route engine has no
   dead-ball actor route;
9. reconcile each shot position with the player's active position at that
   second. Any unknown position, missing initial lineup, negative interval,
   unknown active player or mismatch is `STOP / RETHINK`, not a fallback;
10. compute `shots * 5,400 / positionSeconds` and record the raw counts,
    position-minutes and rate before mapping to the game vocabulary.

### Pre-output correction: tactical snapshots after a dismissal

The first extraction stopped with zero output on match `3754217`. StatsBomb's
first `Tactical Shift` after Gabriel's red card still listed the dismissed
player, while the dismissal event and the later match events correctly kept him
off the field. Therefore a tactics lineup is a position snapshot, not the owner
of the active-player lifecycle.

This interpretation was fixed **before any rate existed**. Substitution and
dismissal events own the active set. A tactical shift must contain every active
player exactly once and updates those players' positions; rows for players
already removed by a dismissal are ignored and counted in the audit as stale
tactical rows. A missing active player, a duplicated active player or a later
event by a removed player still stops the extraction. This is narrower than
accepting the tactics row wholesale: it cannot resurrect a dismissed player or
silently remove an active one.

The corrected run then stopped, still before output, on match `3825869` because
a player whose event position is explicitly `Substitute` received a bench red
card. A dismissal with StatsBomb position `Substitute` is therefore counted as
a bench dismissal and does not alter the active set. An inactive dismissal with
any field position remained an error at that point. The next zero-output stop,
match `3900519`, was a different legitimate case: a starter substituted at
minute 29 received a red on the bench at minute 94, while the event retained his
last field position. The lifecycle therefore also records substituted-out IDs;
a later dismissal of exactly one of those IDs is counted as post-substitution
and does not change minutes. An inactive dismissal that is neither explicitly a
`Substitute` nor a previously substituted player remains an error. Both rules
follow facts that precede the dismissal and cannot be selected from the rates.

### Post-output correction: deterministic duration accumulation

The first complete extraction reconciled all `1,517` matches, but validation
before accepting its audit found that concurrent fetch completion determined
the order in which floating-point seconds were added. Counts and rounded basis
points were stable, yet the raw duration and aggregate hash could differ by an
ulp. That complete output was therefore discarded before becoming evidence.

Event timestamps are now parsed to integer microseconds, padded to six decimal
places, and every interval is accumulated as a safe integer. Rates are derived
only after integer aggregation. The corpus, eligibility and role mapping are
unchanged; this correction is about reproducibility, not the observed ordering
of roles. Acceptance additionally requires two complete seven-worker runs to
produce byte-identical JSON and the same aggregate hash.

StatsBomb positions map totally to the closest canonical match role. Wing-backs
map to `right_midfielder` / `left_midfielder`, matching the game's existing
canonical-position owner. Left/right/central variants of defensive, central
and attacking midfield map to their one canonical family. Center-forward,
left/right center-forward and second-striker positions map to `striker`. Any
position name outside the preregistered total mapping stops the derivation.

The versioned content value is the observed shot rate in integer ten-thousandths
of a shot per 90:

```text
shooterPropensityBasisPoints = round(shotsPer90 * 10_000)
actor weight = shooterPropensityBasisPoints[assigned canonical role]
             * route-specific shooter task quality
```

The common `10_000` scale cancels in the weighted draw. There is no response
divisor, clamp, exponent or coefficient chosen from simulated output. A real
role with positive observed propensity and a real player ability in `1..20`
remains reachable. Goalkeeper stays excluded.

## Staged Exit

This step contains no gameplay.

- **GO:** all `1,517` matches parse, every used external position maps exactly,
  event/lineup timelines reconcile, every supported outfield canonical role has
  positive minutes and shots, and the audit freezes counts/rates plus source
  SHA. Open 06B22B.
- **REFINE:** a declared source field needs a deterministic interpretation that
  can be decided without reading the rates. Correct this document, discard the
  partial output and rerun the same corpus.
- **STOP / RETHINK:** missing/selected matches, unmappable positions, incomplete
  timelines, a zero-propensity supported role, or a need to choose a coefficient
  after seeing the game report.

## What NOT To Implement

- no engine/content/schema change;
- no simulation report, second game simulator or generated-world run;
- no creator-path change;
- no use of L6.3 `37.38` to scale a rate;
- no retained one-off downloader, unused parser or generated raw dataset in the
  repository. The durable artifact is the audit with source SHA, corpus,
  algorithm, reconciliation and aggregate facts.

## Expected Files

- a new StatsBomb shooter-propensity audit under `docs/audits/`;
- `docs/audits/README.md`;
- this step document, the Phase README and `docs/PROJECT_STATUS.md`;
- Step 06B22B only after the baseline reaches `GO`.

The extraction may use a temporary script outside the repository. It must be
removed after the aggregate and reconciliation hashes are recorded; no dead
development command enters the product tree.

## Outcome

- `1,517/1,517` matches and `5,321,459` events parsed with exactly `7` workers;
- `35,739` eligible shots, `400` penalties and `1,749` direct free kicks;
- all `11/11` supported outfield canonical roles have positive minutes and
  shots;
- external and canonical totals both reconcile to `35,739` shots and
  `189,855,033,974,000` microseconds;
- two complete runs were byte-identical at SHA-256
  `429b0f0d01f46a97e0b49e8d25ce5b2b24a4f23a421a70abf88ef75cb5d48991`;
- the content aggregate hash is
  `7fac6859305188c9065f5aa210c2eb0ee7543d936d6e3a61ea7c0379b93bdd7e`.

The first complete float-duration output was deliberately discarded before it
became evidence because its addition order depended on network completion.
Integer microseconds made the accepted evidence reproducible. Step 06B22B is
open; creator allocation and all game-output target bands remain unchanged.
