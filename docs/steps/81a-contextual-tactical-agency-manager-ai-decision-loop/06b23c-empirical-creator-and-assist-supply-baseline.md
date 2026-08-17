# Step 06B23C - Empirical Creator And Assist-Supply Baseline

## Status

Done - **assist_supply**. Creator concentration differs by less than the frozen
material floor; assisted-goal supply is materially low and opens 06B23D.

## User-Facing Question

Top-ten scoring is now credible, but assists remain too dispersed. Before
changing gameplay, distinguish two football problems that need different
solutions:

1. the same set of players may be asked to create too evenly;
2. a credible creator may be selected, but too few goals may receive an assist.

A direct coefficient chosen from the game's `7.1614` output could make the
checkpoint green without making the football more credible. This step instead
measures real creator frequency and real assist supply from the same external
event corpus that owns shooter propensity.

## Frozen Source And Corpus

- StatsBomb Open Data commit
  `b0bc9f22dd77c206ddedc1d742893b3bbe64baec`;
- Premier League, La Liga and Serie A `2015/16`: `380` matches each;
- Ligue 1 `2015/16`: `377` matches;
- total `1,517` complete matches, exactly the accepted 06B22A corpus;
- exactly `7` workers and two complete byte-identical extractions;
- Bundesliga and incomplete/club-selected seasons remain excluded before
  output for the same coverage reason as 06B22A.

No competition, match, event or role may be selected after reading a creator
rate. StatsBomb is credited in the resulting audit.

## Frozen External Facts

The extractor reuses 06B22A's already accepted canonical role microseconds,
position mapping and aggregate hash. Replaying the same timeline into a second
owner would duplicate one external fact and require a test that two derivations
agree. This step rereads only the event fields it adds: shot-assist passes,
their linked shots and goal-assist flags. Event position must still map through
06B22A's total mapping, and each actor role must have a positive accepted
denominator.

### Creator propensity

- one creator event is a `Pass` with `pass_shot_assist = true`;
- the joined shot must exist in the same match and must not be a penalty or
  direct free kick, exactly matching 06B22A's eligible shot population;
- use the pass event's explicit position, reconciled with the accepted
  06B22A position vocabulary;
- versionable rate:

```text
creatorPropensityBasisPoints = round(nonSetPieceShotAssists * 5_400_000_000
                                     / fieldedMicroseconds)
```

The scale is ten-thousandths of one shot assist per 90, matching the empirical
shooter mapping. Goalkeeper is reported for reconciliation but remains excluded
from the game creator draw.

### Assist supply

For every goal shot, record whether StatsBomb links a distinct goal-assist pass
to it. Report both:

- all non-own goals, including penalties and set pieces, for comparison with
  the game's existing season `assists / goals` fact;
- non-penalty, non-direct-free-kick goals, for the route-engine population.

Missing linked shots, duplicate shot IDs, a goal-assist pass linked to a
non-goal, unknown actor positions or count disagreement are structural
failures, never unassisted defaults.

### Concentration

Per competition-season, record:

- distinct players with at least one eligible shot assist;
- top-ten eligible shot-assist share;
- effective creator count `1 / sum(playerShare^2)`;
- role shares and per-90 role rates.

The four competition-season rows are reported individually. Their pooled mean
is presentation; no p10/p90 is invented from four observations.

## Frozen Game Before-State

From the corrected L6.3B cached first-division facts (`70` world-seasons):

- `7,529.3429` creator nominations per league-season;
- `314.8571` nominated players;
- effective nominated-player count `195.2106`;
- top-ten nomination share `0.0980`;
- `448.5571` assists and `828.4571` goals per league-season;
- assist/goal share `0.5413`;
- top-ten nominated players own only `0.1064` of credited assists.

These are attribution denominators, not calibration targets. The current cache
cannot separate self-created shots from distinct creators, so this step must not
pretend that all game nominations equal StatsBomb shot assists.

## Predeclared Handoff

- **creator_frequency:** external role rates and concentration show a material
  role-owned creator hierarchy, while the game remains diffuse. Open an
  empirical creator-propensity implementation; assist-credit probabilities stay
  closed.
- **assist_supply:** external assisted-goal share exceeds the game by at least
  `0.05`, while creator concentration is not materially different. Open only a
  same-population assist-credit attribution; no probability is tuned here.
- **shared:** both differences are material. Split them into separate owner
  steps and checkpoint after each; never ship a bundled correction.
- **not_attributed:** definitions cannot reconcile, roles are unreachable or
  neither difference is material. Stop without changing gameplay.

For concentration, `0.02` absolute top-ten share is the predeclared material
floor. Role hierarchy additionally requires all `11/11` outfield roles to have
positive minutes and at least one eligible creator event. These floors are
fixed before extraction and never moved from the output.

## What NOT To Implement

- no engine, content, schema, report, probability or target change;
- no use of simulated output to scale an external rate;
- no retained downloader, parser, raw dataset or second report command;
- no causal subtraction between different game seed populations;
- no claim that a StatsBomb shot assist and every game creator nomination are
  already the same fact.

## Expected Files

- this step;
- a new creator/assist-supply audit under `docs/audits/` and its index;
- the Phase README and `docs/PROJECT_STATUS.md`;
- one next step document only after the staged handoff identifies its owner.

The extractor may exist temporarily outside the repository and must be deleted
after the accepted hashes are recorded.

## Required Verification

```bash
nvm use 24.19.0
# temporary extractor, two complete runs, exactly seven workers
git diff --check
```

The extraction runs alone. This step changes no production code, so `pnpm
check` is inherited from commit `799b52b` unless a repository file other than
the declared documents changes.

## Outcome

- two complete seven-worker extractions over `1,517` matches and `5,321,459`
  events are byte-identical at SHA-256
  `287e3fb15f9f90d485eee4be2773c0ea323763e87cc91023b9d86c1bc7bbe60a`;
- `24,439` eligible shot-assist passes and all `2,596` goal-assist passes
  reconcile to their linked shots; all `11/11` outfield roles are reachable;
- real top-ten creator share `0.1108` versus game `0.0980` differs by `0.0128`,
  below the frozen `0.02` creator-frequency floor;
- real all-goal assist share `0.6710` versus game `0.5413` differs by `0.1297`,
  above the frozen `0.05` supply floor;
- preregistered outcome: **assist_supply**. No creator rate is implemented.
  06B23D owns a same-population decomposition of self-created versus distinct
  uncredited goals before any probability or actor rule may change.
