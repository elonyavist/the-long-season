# Pre-UI Career Loop Sample Review

Date: 2026-06-23
Phase: `47-pre-ui-engine-confidence-gate`
Step: `03-career-loop-sample-review`
Status: Complete

## Purpose

Review whether the current career loop creates believable multi-season manager
stories before starting UI readiness.

The review focuses on what the first career dashboard would need to expose:
selected club, next fixture, match preparation, squad condition, squad depth,
youth count, player development, and long-run world stability.

## Commands Reviewed

```bash
PATH=/Users/elianarducci/.nvm/versions/node/v24.19.0/bin:$PATH pnpm cli career --save=phase47-engine-check --seed=world-a --new-world-preview
PATH=/Users/elianarducci/.nvm/versions/node/v24.19.0/bin:$PATH pnpm cli career --save=phase47-engine-check --summary
PATH=/Users/elianarducci/.nvm/versions/node/v24.19.0/bin:$PATH pnpm cli career --save=phase47-engine-check --squad
PATH=/Users/elianarducci/.nvm/versions/node/v24.19.0/bin:$PATH pnpm cli career --save=phase47-engine-check --youth-academy
PATH=/Users/elianarducci/.nvm/versions/node/v24.19.0/bin:$PATH pnpm cli career --save=phase47-engine-check --development-report
PATH=/Users/elianarducci/.nvm/versions/node/v24.19.0/bin:$PATH pnpm cli ten-season-report --seed-prefix=phase47-career --worlds=10 --seasons=10
```

## Career Creation And Summary

Save: `phase47-engine-check`

Observed:

- selected club: `S.S. Perugia`;
- generated squad size: `22`;
- selected-club transfer funds: `EUR 6000000.00`;
- current date: `2026-08-01`;
- next selected-club fixture:
  `fixture:000003 2026-08-01 round 1: U.S. Pisa vs S.S. Perugia`;
- match preparation: `none saved`.

User-facing read:

The current career state already has enough facts for a first dashboard. The
manager can see the selected club, save identity, date, next match, and missing
preparation. The missing preparation is a good first-screen decision point, not
a problem.

Classification: ready for first dashboard.

## Senior Squad Review

Selected-club squad:

- roster size: `22`;
- all displayed players have `fitness=100`, `form=50`, `morale=50` at career
  start;
- role-strength values range from `5.2` to `12.0`;
- age spread includes first-team seniors, veterans, and several young players.

Notable players:

- `Matteo Baldini`, age `27`, GK role value `12.0`;
- `Davide Capelli`, age `18`, CB role value `9.9`;
- `Lukas Hartmann`, age `17`, CM role value `7.0`;
- `Enrico Ruggieri`, age `17`, LWB role value `5.2`;
- `Niklas Keller`, age `30`, RW role value `11.1`.

User-facing read:

The selected squad looks like a plausible third-division roster. It has usable
starters, reserves, a few raw young players, and older players who can decline.
For a dashboard, the important facts are not every player row, but readiness:
roster size, condition summary, and whether a lineup/tactic is saved.

Classification: ready for first dashboard.

## Youth Academy Review

Selected-club youth:

- selected-club youth count: `11`;
- active players: `senior=396`, `youth=198`, `total=594`;
- youth ages: `15-18`;
- role mix includes GK, defenders, midfielders, attacking midfielder, striker,
  and winger;
- all youth statuses are `academy`.

Positive signal:

The youth structure matches the intended pipeline: every club has a compact
academy, not an uncontrolled youth population.

Concern:

The youth CLI currently renders nationality as `unknown` for selected youth
players.

User-facing impact:

This is not a blocker for the first dashboard if Phase 48 only shows youth count
or academy alerts. It would become a blocker before a proper youth-academy UI
screen because player identity should not feel incomplete.

Classification: post-UI improvement for first dashboard; potential blocker
before a dedicated youth screen.

## Development Review

Seven-season development report:

- players reviewed: `22`;
- players improved: `13`;
- players declined: `10`;
- stalled prospects: `0`;
- total growth: `87.90`;
- total decline: `38.99`;
- biggest improver: `Enrico Ruggieri`, age `17->23`, growth `18.53`;
- biggest decline: `Niklas Keller`, age `30->36`, decline `10.01`.

User-facing read:

This is exactly the type of story the game needs before UI work: a raw
17-year-old wing-back can become materially better over seven seasons, while a
30-year-old winger declines. It supports long-term squad planning and makes the
dashboard useful.

Classification: positive fun signal.

## Ten-Season Report Review

Command status: `PASS`.

Key output:

- worlds: `10`;
- seasons: `10`;
- failed worlds: `0`;
- warning worlds: `2`;
- goals per match avg/p95: `2.820 / 2.900`;
- table spread avg/min: `39.63 / 36.40`;
- draw rate avg/max: `0.250 / 0.260`;
- champion streak max: `3`;
- top assist p95: `16`;
- minimum squad size observed: `20`;
- clubs below minimum squad size: `0`;
- clubs without natural goalkeeper: `0`;
- youth roster max observed: `11`;
- active players: `senior=396..438`, `youth=198..198`,
  `total=594..636`;
- warning checks: `top_assist_max=1`,
  `top_creator_goal_share_max=1`;
- signal groups: `monitor=1`, `story=1`;
- failing checks: `none`.

User-facing read:

The career world does not structurally collapse across this sample. Senior
population can move, youth remains controlled, no club drops below minimum squad
size, and no club loses natural goalkeepers. The warnings are production
concentration signals, not first-dashboard blockers.

The one number to keep watching is `Role coverage warnings: total=977 p95=115`.
It does not currently coincide with squad collapse or missing goalkeeper
failures, so it should remain a monitoring signal rather than a blocker. A first
UI dashboard should avoid rendering role-coverage warnings as automatic squad
needs; the manager should interpret formation fit manually.

Classification: pass with monitoring signals.

## Findings

| Finding | Classification | UI Impact | Action |
|---|---|---|---|
| Career summary exposes selected club, date, next fixture, and missing preparation. | Positive fun signal | Strong first-dashboard foundation. | Proceed. |
| Senior squad has credible third-division spread and condition baseline. | Positive fun signal | Dashboard can show readiness and condition summary. | Proceed. |
| Youth academy starts at `11` players and remains controlled in long-run sample. | Positive fun signal | Dashboard can show youth count without population concern. | Proceed. |
| Youth-player nationality renders as `unknown`. | Post-UI improvement | Not a first-dashboard blocker; would be poor in a youth detail screen. | Track before dedicated youth UI. |
| Development report shows young growth and veteran decline. | Positive fun signal | Supports long-term manager stories. | Proceed. |
| 10x10 report has two warning worlds, no failures. | Monitoring signal | Warnings do not block first dashboard. | Preserve and monitor. |
| Role coverage warning count is high in report output. | Monitoring signal | Do not show as squad advice in first UI; investigate later if tied to bad roster decisions. | Proceed with note. |

## Step 03 Decision

Proceed to Step 04.

No pre-UI career-loop blocker was found for the first dashboard slice. The loop
already exposes meaningful manager decisions: prepare the next fixture, inspect
squad readiness, understand squad age/development, and watch controlled
long-run turnover.
