# Youth Academy And Squad Pipeline Report

Date: 2026-06-22
Phase: `32-youth-academy-and-squad-pipeline-v1`
Status: BLOCKED BEFORE NEXT PHASE

## Summary

Phase 32 successfully added a deterministic youth-academy pipeline:

- every new career world starts with bounded youth rosters;
- annual youth intake is deterministic and capped;
- youth players develop separately from senior players;
- age-out outcomes are explicit;
- promotion into senior squads is explicit and manager-controlled for the selected club;
- long-run reports now expose senior/youth/total population metrics;
- `pnpm cli career --save=<saveId> --youth-academy` inspects the selected club academy without mutating the save.

The phase is not fully green because the required `250` worlds x `30` seasons gate failed in `8` worlds. The failures are not youth overpopulation failures; they are match-production anomaly failures on `top_creator_goal_share_max`.

## Required Checks

| Check | Result |
|---|---:|
| `pnpm check` | PASS |
| `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` | PASS |
| `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=50 --seasons=10 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md` | PASS with warnings |
| `pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=250 --seasons=30 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md` | FAIL |
| `git diff --check` | PASS |

## Balance Regression Check

`calibration-v1` strict mode still passes after the youth pipeline changes.

Observed `20`-season balance:

- Goals per match: `2.859`
- Home win rate: `0.413`
- Draw rate: `0.238`
- Away win rate: `0.349`
- First-place points: `70.500`
- Last-place points: `25.500`
- Table points spread: `45.000`
- Upset proxy rate: `0.350`

## Phase 31 vs Phase 32 250x30

| Metric | Phase 31 `phase31-gate` | Phase 32 `phase32-youth` |
|---|---:|---:|
| Worlds | 250 | 250 |
| Seasons per world | 30 | 30 |
| Total seasons | 7500 | 7500 |
| Status | PASS | FAIL |
| Failed worlds | 0 | 8 |
| Warning worlds | 169 | 242 |
| Goals per match avg | 2.690 | 2.700 |
| Goals per match p95 | 2.730 | 2.750 |
| Top assist p95 | 17 | 17 |
| Age 30+ share p95 | 0.29 | 0.23 |
| Minimum senior squad size observed | 19 | 19 |
| Clubs below minimum senior squad size | 0 | 0 |
| Clubs without natural goalkeeper | 0 | 0 |
| Role coverage warnings total | 62226 | 96356 |
| Role coverage warnings p95 | 284 | 430 |
| Youth roster max observed | unavailable | 12 |
| Clubs above youth target | unavailable | 0 |
| Clubs below youth minimum | unavailable | 2523 |

## Youth Population Findings

The youth pipeline does not overpopulate the world:

- maximum youth roster observed: `12`;
- clubs above youth target: `0`;
- senior minimum squad size observed: `19`;
- clubs below senior minimum squad size: `0`;
- clubs without natural goalkeeper: `0`.

The youth pipeline does underpopulate too often:

- `clubs_below_youth_minimum=250` warning worlds;
- `youth_roster_min_size=250` warning worlds;
- `2523` club-season observations below the youth minimum.

This means the cap is working, but the intake/lifecycle balance is too conservative over `30` seasons. It is not structural collapse, but it should be reworked before relying on academies as the main long-run squad pipeline.

## Failed Worlds

The `250x30` gate failed only on `top_creator_goal_share_max`:

- `phase32-youth-world-00027`
- `phase32-youth-world-00031`
- `phase32-youth-world-00125`
- `phase32-youth-world-00136`
- `phase32-youth-world-00166`
- `phase32-youth-world-00174`
- `phase32-youth-world-00196`
- `phase32-youth-world-00216`

These failures indicate a creator concentration issue in some long-run worlds. It may be connected to youth/squad turnover changing player distributions, but it is not caused by youth overpopulation.

## CLI Inspection Finding

`pnpm cli career --save=<saveId> --youth-academy` is useful for inspecting one selected club academy:

- selected youth count;
- active senior/youth/total counts;
- player name;
- age;
- primary role;
- broad ability band;
- broad development category;
- lifecycle status.

The current save model does not persist per-player nationality metadata. The inspection therefore prints nationality as unavailable when loading from a saved career. This is intentionally not guessed from names. A future durable identity metadata step should solve this if nationality must be visible in saved-career inspection.

## Decision

Do not start broader UI exploration or new career features yet.

Recommended next active work:

1. Rework Phase 32 youth pipeline tuning and long-run anomaly fallout.
2. Keep youth roster cap at `12`; do not weaken it.
3. Reduce youth underpopulation without allowing overpopulation.
4. Investigate `top_creator_goal_share_max` failures on the listed seeds.
5. Re-run `50x10` and `250x30`; Phase 32 can be considered complete only when `250x30` has `0` failed worlds.

## Reproduction

```bash
pnpm check
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=50 --seasons=10 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md
pnpm cli ten-season-report --seed-prefix=phase32-youth --worlds=250 --seasons=30 --report-output=docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md
```
