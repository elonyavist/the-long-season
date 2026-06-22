# Youth Academy Pipeline Spec

Date: 2026-06-22
Phase: `32-youth-academy-and-squad-pipeline-v1`
Step: `01-phase-31-findings-and-youth-pipeline-spec.md`

## Phase 31 Baseline

Phase 31 made long-run senior squad refresh structurally stable without adding a youth academy.

Observed validation state:

- `50` worlds x `10` seasons: PASS
- `250` worlds x `30` seasons: PASS
- `10,000` worlds x `50` seasons: not run because the current serial CLI runner would likely take multiple hours

The remaining blocker is operational validation runtime, not an observed squad-collapse failure.

## Why Phase 32 Exists

The current refresh model can preserve senior squads, but it still depends heavily on external generated intake. That keeps the world alive mechanically, but it is less believable than a club pipeline where young players enter, develop, age out, and sometimes reach the first team.

Phase 32 adds that pipeline while keeping the user-control rule intact: the game may maintain AI club pipelines, but it must not silently choose the user's senior squad, lineup, tactics, market strategy, or youth promotions as hidden manager decisions.

## Population Targets

The initial model is intentionally conservative.

| Area | Target |
|---|---:|
| Senior squad target | `23..25` players |
| Senior squad hard minimum | `18` players |
| Initial youth players per club | `8` players |
| Youth roster target | `8..12` players |
| Annual youth intake | deterministic `2..4` players per club |
| Youth intake age | `15..17` |
| Youth roster age range | `15..19` |
| Youth exit boundary | end of season after age `19`, unless promoted or retained by an explicit rule |

For the current 18-club single-division world, this implies:

- senior active players: about `414..450`;
- youth active players: about `144..216`;
- total active players: about `558..666`.

These are not final real-world academy numbers. They are the first playable simulation bounds designed to prevent overpopulation while still creating enough future-player stories.

## Youth Quality Rules

Youth quality must follow the same product rules as senior generation:

- deterministic and fictional;
- coherent by country, division, club tier, broad role, age, current ability, and potential;
- current ability and potential remain separate;
- lower-division academies may produce interesting prospects, but not constant first-division-ready players;
- rare "white fly" prospects are allowed only through explicit rarity budgets;
- a third-division academy can produce players who become useful later, but most should become third-division, second-division, or reserve-level players rather than stars;
- exact hidden potential must not be presented as user-facing truth.

The first implementation should preserve the Phase 24 generation intent:

- role-relevant attributes drive current quality;
- irrelevant attributes stay capped unless an explicit archetype allows an exception;
- potential outliers are rare and test-covered.

## Lifecycle Rules

Youth players should move through factual lifecycle states:

- initial academy member;
- seasonal intake player;
- developing academy player;
- promotion candidate;
- promoted senior player;
- released player;
- external-move candidate;
- aged-out player.

Phase 32 only needs the deterministic state transitions and reporting hooks. It does not need full contracts, wages, staff, facilities, loans, youth matches, scouting reports, or UI confirmation flows.

## User-Control Boundary

AI clubs can use explicit deterministic rules to promote youth players into senior squads when their squad shape needs it.

For the selected club:

- no hidden promotion should happen in ordinary career play;
- CLI long-run lab commands may apply automated selected-club promotions only if the command clearly documents that it is an automated simulation lab;
- inspection commands may show candidates without committing them.

This keeps the future game aligned with the Football Manager-style principle: the manager sees the academy and chooses what to do.

## Required Long-Run Metrics

The Phase 32 report must expose:

- total active senior players;
- total active youth players;
- total active players;
- youth players per club min/avg/max;
- annual youth intake count;
- youth exits/releases count;
- youth promotions count;
- selected-club youth size;
- clubs above the youth-size target;
- clubs below the youth-size minimum;
- clubs below senior minimum squad size;
- clubs without a natural goalkeeper;
- existing match-balance metrics.

Population anomalies must be visible and machine-readable. The report must not hide overpopulation by widening thresholds without evidence.

## Non-Goals

Phase 32 does not implement:

- UI;
- youth scouting;
- staff or facility effects;
- youth match simulation;
- contracts, wages, loans, or transfer fees for youth players;
- exact potential display;
- full user confirmation flows;
- broad career-world expansion beyond the current single-division long-run lab.

## Success Criteria

Phase 32 is successful if:

- every club has a bounded deterministic youth roster;
- annual youth intake exists and does not grow forever;
- youth aging, development, exits, and promotions are reportable;
- senior squad refresh can use youth promotions before external intake where appropriate;
- selected-club automation boundaries are explicit;
- `50` worlds x `10` seasons passes;
- `250` worlds x `30` seasons passes or reports exact failing seeds and reasons;
- match balance remains inside `calibration-v1`.
