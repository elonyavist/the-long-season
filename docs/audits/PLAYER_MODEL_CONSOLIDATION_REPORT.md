# Player Model Consolidation Report

Date: 2026-07-18  
Phase: `74-player-generation-and-model-consolidation-cleanup`  
Verdict: Phase 74 scoped player-model gate PASS; repository long-run gate retains two out-of-scope FAIL signals.

## Executive Result

Phase 74 now has one player model from creation to presentation:

- domain owns the 25-attribute vocabulary, current/potential invariant,
  role-weighted ability semantics, role buckets, and hard caps;
- content owns division, club, age, rarity, and deterministic generation
  policy, but every producer crosses one strict assembly and validation path;
- engine development, lifecycle, promotion, turnover, valuation, and
  willingness consume explicit canonical measures;
- storage normalizes fully absent historical role identity deterministically,
  rejects partial identity, and round-trips the same facts through JSON and
  SQLite/OPFS without a schema bump;
- CLI and web adapters project canonical player facts instead of defining
  private football formulas.

The 250-world x 30-season run completed all 7,500 seasons with:

- zero clubs below the minimum senior squad size;
- zero clubs without a natural goalkeeper;
- zero academies above or below the required bounds;
- senior population bounded at `396..450` and youth population fixed at `198`;
- no generation/development role-cap or potential-ordering failure.

The generated repository report remains honestly marked `FAIL` because two
seeds triggered existing non-player checks. Neither failure belongs to the
documented Phase 74 ownership, and no threshold was changed to hide them.

## Gate Classification

| Gate | Result | Evidence and meaning |
|---|---|---|
| Focused player/storage tests | PASS | 66 files, 384 tests after final dead-path cleanup. |
| Repository check | PASS | 171 files, 1,029 tests plus lint, localized-text checks, and all workspace typechecks. |
| Web regression | PASS | 56 files, 236 tests and web typecheck. |
| Dependency direction | PASS | 505 modules and 1,764 dependencies, with CLI role-quality projection routed through the engine API. |
| Architecture graph | PASS | Graphify refreshed after the final source and documentation cleanup. |
| Fixed seeds | PASS | `world-a`, `world-b`, career preview, squad, youth, and seven-season development inspected. |
| 50 worlds x 10 seasons | PASS | 0 failed worlds, 7 warning worlds, no structural failure. |
| 250 worlds x 30 seasons | Scoped PASS / global FAIL | 0 player-structure failures; 2 named non-player failures retained below. |
| Strict match balance | PASS | `calibration-v1`: goals `3.128`, home `0.440`, draws `0.215`, away `0.345`, first `69.65`, last `26.80`, spread `42.85`, upsets `0.364`. |
| Duplicate/dead path search | PASS | One canonical ability list and potential clamp remain; replaced role-classification bridge and private CLI ability arrays are deleted. |

## Fixed-Seed Comparison

### Senior generation

Initial senior IDs, names, nationalities, birth dates, clubs, ordering, roles,
archetypes, current attributes, potential attributes, and dynamic state remain
deterministic. The current-band report intentionally changed because it now
uses the canonical weighted primary-role measure instead of the previous local
five-attribute approximations.

| Seed | Report | `0..8` | `9..11` | `12..14` | `15+` | Role warnings |
|---|---|---:|---:|---:|---:|---:|
| `world-a` | baseline measure | 82 | 203 | 111 | 0 | 0 |
| `world-a` | canonical role measure | 120 | 251 | 25 | 0 | 0 |
| `world-b` | baseline measure | 75 | 219 | 102 | 0 | 0 |
| `world-b` | canonical role measure | 125 | 254 | 17 | 0 | 0 |

This is a measurement correction, not an unexplained senior-strength rewrite.
The important lower-division result remains: no third-division player is
reported in the `15+` current band and there are no role-coherence warnings.

Potential and rarity distribution remains bounded:

| Seed | Category | Interesting | Serious | Elite | White flies | Serious prospects | Rare wonderkids |
|---|---:|---:|---:|---:|---:|---:|---:|
| `world-a` | 252 | 140 | 4 | 0 | 3 | 4 | 0 |
| `world-b` | 247 | 145 | 4 | 0 | 1 | 4 | 0 |

All 18 clubs have prospects in both seeds. Exact hidden potential stays an
engine fact and is not exposed by the user-facing report.

### Youth generation

Both seeds retain exactly `198` academy players, exactly `11` per club, and the
locked department composition `GK=18`, `DEF=72`, `MID=72`, `ATT=36`.

| Seed | Age 15 | Age 16 | Age 17 | Age 18 | Age 19 | Role warnings |
|---|---:|---:|---:|---:|---:|---:|
| `world-a` | 24 | 50 | 68 | 46 | 10 | 0 |
| `world-b` | 24 | 52 | 53 | 54 | 15 | 0 |

Youth attributes changed deliberately: initial and seasonal academy players
now use the same role-aware current bands, strict constructor, scale, caps, and
potential ordering as every other generated player. Independent per-player
rarity rolls were replaced by one division budget of `2..5` high and `0..1`
elite prospects, often zero elite. This prevents youth overpopulation without
making every interesting youngster a future first-division star.

### Seven-season development

The final `world-a` selected-club inspection reviewed 22 players:

- improved: `13`;
- declined: `10`;
- stalled prospects: `0`;
- total role-relevant growth: `90.64`;
- total decline: `33.72`;
- biggest improver: Enrico Ruggieri, age `17 -> 24`, growth `18.59`;
- biggest decline: Luca Tarantino, age `30 -> 37`, decline `8.37`.

The baseline reported growth `86.50` and a different biggest improver because
it used local report formulas. The final report and mutation path now share the
same role semantics, apply the generated floor `1`, preserve potential
ordering, and reapply role hard caps after every change.

## Lifecycle And Market Inspection

Focused decision tests prove the football meaning at each consumer boundary:

- exits deliberately retain the canonical raw diagnostic threshold because
  that old threshold is compatibility policy, not a claim of role quality;
- academy age-out evaluates goalkeeper quality as goalkeeper quality and
  separates promotion candidates from released youth;
- AI promotion recognizes goalkeeper specialists and role-specific potential
  room, while ignoring inflated attributes outside the primary role;
- turnover protects strong role specialists, evaluates goalkeepers through
  goalkeeper attributes, preserves squad limits, and rejects casual downward
  moves;
- valuation rewards role-shaped specialists instead of diluting them through
  25 unrelated attributes;
- willingness rejects implausible downward moves for a role specialist hidden
  by the old raw average.

Representative CLI inspection covers goalkeeper, center-back, full-back,
midfielder, winger, striker, substitutes, and an exact 11-player academy. The
academy shows high-ceiling labels without senior-ready lower-division current
ability.

## Persistence Result

No durable player field changed, so no artificial migration was added.

- current JSON saves round-trip exactly;
- fully absent historical role metadata is derived from persisted positions
  and current abilities in deterministic role order;
- partially present or contradictory identity fails with typed
  `save_unreadable` recovery;
- loading does not write or mutate the save;
- SQLite remains schema version `6` and preserves ordered players, clubs,
  current/potential ability rows, dynamic states, roles, and fixtures;
- the complete browser journey passes through real SQLite WASM/OPFS after
  reload.

## Long-Run Evidence

### Diagnostic: 50 worlds x 10 seasons

- status: `PASS`;
- failed worlds: `0`; warning worlds: `7`;
- goals per match: `2.820`; draw rate: `0.240`;
- average table spread: `39.94`;
- longest champion streak: `5`;
- top-assist p95: `14`;
- minimum squad: `19`;
- clubs below minimum: `0`; clubs without natural goalkeeper: `0`;
- youth maximum: `11`; clubs outside academy bounds: `0`;
- active population: senior `396..449`, youth `198`.

Warnings were limited to existing production, table-spread, and champion-story
signals. No player-model repair was indicated.

### Release evidence: 250 worlds x 30 seasons

- all `7,500` seasons completed;
- minimum senior squad: `19`;
- clubs below minimum: `0`;
- clubs without natural goalkeeper: `0`;
- academy maximum: `11`; clubs above target or below minimum: `0`;
- active population: senior `396..450`, youth `198`;
- average goals: `2.750`; average draws: `0.250`;
- average table spread: `38.64`;
- warning worlds: `52`; failed worlds: `2`.

The `47,268` role-coverage warning facts are coarse depth observations such as
weak second-goalkeeper or department depth after maintenance. Across `135,000`
club-seasons they remain below the gate's one-warning-per-club-season monitor
threshold. They are not role-cap violations, missing goalkeepers, undersized
squads, or failed worlds.

### Named global failures

1. `phase74-player-model-world-00009`
   - failed check: `top_creator_goal_share_max`;
   - snapshot: one player supplied 7 assists for a club with only 17 goals,
     producing share `0.41`;
   - classification: match-event production/concentration signal, not player
     generation, development, lifecycle, persistence, or squad collapse.
2. `phase74-player-model-world-00233`
   - failed check: `champion_streak` with streak `11`;
   - context: 11 unique champions over 30 seasons, transfer turnover `120`,
     squad turnover `1,206`;
   - classification: competition/dynasty signal, not structural squad or
     player-model coherence failure.

The exact seeds remain in
`PLAYER_MODEL_CONSOLIDATION_LONG_RUN_REPORT.md`. Phase 74 does not alter match
events, league competitiveness, or thresholds, so repairing either result here
would violate scope. The repository-wide long-run report therefore remains
`FAIL`; the Phase 74 scoped acceptance gate is `PASS`.

## Duplicate And Dead-Path Closeout

Deleted or consolidated:

- content-owned `player-role-attribute-classification.ts` and its obsolete
  bridge test;
- development-local ability paths, read/write switches, role tables, and hard
  caps;
- senior/youth local potential clamps and construction copies;
- storage-local 25-key enumeration;
- lifecycle, market, report, and web private raw/role averages;
- the final CLI roster 25-value array and position-family role average.

The required search now finds only:

- `PLAYER_ABILITY_PATHS` in the canonical domain module;
- `potentialAtLeastCurrent` in the canonical domain module, its test, and the
  shared generated-player factory consumer.

Historical audits and the Step 03 plan still name the deleted source because
they describe the before-state and deletion contract. They are not live code
references.

## Complexity And Ownership

| Area | Baseline lines | Final lines | Result |
|---|---:|---:|---|
| `player-development.ts` | 916 | 457 | duplicated algebra and role tables removed |
| old content role classification | 461 | 0 | deleted after domain parity proof |
| domain ability/profile/constructor | 0 | 926 | explicit shared invariants with focused ownership |
| generated-player factory | 0 | 110 | one strict assembly seam, no producer policy |
| `fake-players.ts` | 631 | 579 | construction moved, senior policy retained |
| `initial-youth-academies.ts` | 558 | 543 | shared assembly plus bounded rarity policy |
| `career-intake-players.ts` | 258 | 253 | shared assembly, intake policy retained |
| lifecycle and market set | 1,505 | 1,420 | private scalar formulas removed |
| SQLite world mapper | 562 | 580 | canonical traversal plus explicit role round trip |
| ten-season report data | 1,478 | 1,441 | canonical facts replace local calculations |
| generated inspection output | 577 | 576 | public shape retained, semantics corrected |
| web preparation adapter | 431 | 436 | existing scale retained from role ability |

Line count is not used as a quality gate. The relevant result is that each
remaining file owns a coherent rule and no caller recreates player algebra.

## Residual Risks

- The two named repository-level long-run failures still require their owning
  match-production and competition/dynasty analysis if they remain product
  concerns.
- Coarse squad-depth warnings are numerous enough to monitor, although they do
  not approach their structural threshold and produce no missing goalkeeper or
  undersized squad.
- Phase 74 intentionally consolidates the existing development model. The
  already documented Phase 75 owns age-reachable potential, monthly
  participation/performance progression, physical decline, role familiarity,
  beta-save reset, and larger calibration gates.

## Reproduction

Run with Node `24.16.0`:

```bash
pnpm cli simulate-season --seed=world-a --player-generation-report
pnpm cli simulate-season --seed=world-b --player-generation-report
pnpm cli career --save=phase74-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase74-world-a --development-report
pnpm cli ten-season-report --seed-prefix=phase74-player-model --worlds=50 --seasons=10 --report-output=/tmp/phase74-player-model-50x10.md
pnpm cli ten-season-report --seed-prefix=phase74-player-model --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_MODEL_CONSOLIDATION_LONG_RUN_REPORT.md
pnpm cli balance-report --seed-prefix=phase74-balance --seasons=20 --target-profile=calibration-v1 --strict
```

## Next Recommendation

The only next recommendation is the already documented `Phase 75 - Player
Generation, Potential And Development Lifecycle Rework`. Phase 75 is not
started by this report.
