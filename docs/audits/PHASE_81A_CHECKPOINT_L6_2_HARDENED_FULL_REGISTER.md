# Phase 81A - Checkpoint L6.2 Hardened Full Register

## Verdict

`REFINE`, with a separate upset decision of `GO`.

The league now expresses the intended football relationship: hierarchy is
visible, a side around tenth can credibly beat one around third, and last
beating first remains rare rather than impossible. L6.2 does not pass overall
because the inherited player-renewal, veteran-load, squad-use, identity and
local replacement gates remain red. No hierarchy correction is authorized.

## Executed Population

- command: `pnpm cli simulation-report --profile=phase81a-integrated-l6-2-7x10 --format=json --report-output=simulation-out/phase81a-integrated-l6-2-7x10.json`;
- seed prefix: `phase81a-integrated-l6-2-v1`;
- population: `7` worlds, `10` seasons, three divisions;
- First-Division upset population: `70` league-seasons;
- workers: exactly `7`;
- wall time: approximately `14m 45s`;
- process exit: `1`, because the canonical decision is `REFINE`;
- report hash: `697f2ca79deeab3e8f561f667bc798ff`;
- artifact SHA-256:
  `4b074648e92706af24cbfe5fa523eca8f7eb644fa0575f9aa66cbf620e6a560a`;
- reconciliation failures: `0`;
- fallback selections: `0`;
- unavailable selected players: `0`.

The profile ran after the historical targets in
`PHASE_81A_BIG_FIVE_UPSET_BASELINE.md` were frozen. No target changed after
reading this output.

## Upset Result: GO

All five rank-distance lanes are observed in all `70` First-Division seasons
and pass both historical win and non-loss bands.

| Rank gap | Fixtures | Underdog win mean | Historical band | Non-loss mean | Historical band |
|---|---:|---:|---:|---:|---:|
| `1..3` | 6,015 | 0.315758 | 0.262816..0.377940 | 0.609081 | 0.544878..0.669958 |
| `4..6` | 4,757 | 0.255446 | 0.215495..0.352678 | 0.537524 | 0.474414..0.630905 |
| `7..9` | 3,469 | 0.221353 | 0.173763..0.333333 | 0.471550 | 0.409530..0.590523 |
| `10..14` | 3,380 | 0.176394 | 0.132353..0.274934 | 0.404886 | 0.348419..0.529048 |
| `15+` | 649 | 0.130166 | 0.038187..0.242241 | 0.309011 | 0.158286..0.454545 |

The user's two concrete stories are therefore represented:

- roughly tenth versus roughly third sits in `7..9`: the lower-ranked side
  wins about `22.1%` and avoids defeat about `47.2%` of the time;
- exact first versus last has `105` observations, `8` underdog wins and `24`
  non-losses: win share `0.076190` and non-loss share `0.228571`, both inside
  the frozen historical Wilson intervals.

### Fine kickoff-strength diagnostic

| Strength gap | Fixtures | Favorite win | Draw | Underdog win |
|---|---:|---:|---:|---:|
| `<0.25` | 2,509 | 0.363491 | 0.289757 | 0.346752 |
| `0.25..<0.5` | 2,504 | 0.386981 | 0.297923 | 0.315096 |
| `0.5..<1` | 4,256 | 0.421992 | 0.305216 | 0.272791 |
| `1..<1.5` | 3,555 | 0.501828 | 0.282982 | 0.215190 |
| `1.5..<2` | 2,824 | 0.557365 | 0.259561 | 0.183074 |
| `2..<3` | 3,267 | 0.636058 | 0.226507 | 0.137435 |
| `3+` | 2,505 | 0.762475 | 0.170858 | 0.066667 |

The old `1+` lane is no longer stored. Its owner diagnostic derives by summing
the final four disjoint lanes. Quality increasingly matters without reaching
certainty.

## Inherited Register: REFINE

Standings are healthy in all three divisions:

| Division | Champion points | Last points | Spread | Goals/match | Draw share | Decision |
|---|---:|---:|---:|---:|---:|---|
| First | 74.4143 | 23.0000 | 51.4143 | 2.8140 | 0.2651 | GO |
| Second | 67.7429 | 26.4571 | 41.2857 | 2.7169 | 0.2837 | GO |
| Third | 70.5714 | 25.2714 | 45.3000 | 2.6739 | 0.2843 | GO |

The remaining red families are not table hierarchy:

- four-formation retention and one opening identity row;
- career-generated leader share `0.295238` against `>= 0.50`;
- age-33-plus starts `22.1655` and minutes `1818.40`;
- player-use appearance share `0.648306` and distinct users `23.0175`;
- top-ten scorer mean `19.99`, scorer mean age `29.84`, assist mean age
  `29.96`, age-33-plus scorer share `0.23`, assist share `0.28`;
- local replacement capacity `0.053333`, while division-wide capacity is
  `0.533333`.

## Reachability And Integrity

- engine tests prove every club has one pre-round position, every same-round
  fixture sees the same matches-played count, and final rows reconcile at 34;
- fine strength partitions reconcile to all non-tied fixtures and the old
  aggregate is derived, not copied;
- a real generated one-world/one-season L6.2 test reaches the exact-upset
  observation-floor failure while observing all five rank lanes. The failure
  branch is therefore reachable on product data, not only a synthetic fixture;
- the complete `pnpm check` before the run passed `306` files and `2,385`
  tests, all dependency and custom checks, and typecheck.

## Handoff

L6.2 is complete and valid despite `REFINE`. It opens the already-authorized
06B22 structural actor-allocation replacement. That step may replace the
post-output actor divisors and immediately checkpoint minutes, ages and
concentration; it may not tune table hierarchy or upset rates, which are green.
