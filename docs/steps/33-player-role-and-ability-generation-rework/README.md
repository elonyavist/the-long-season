# Phase 33 - Player Role And Ability Generation Rework

## Goal

Rework the global player role, archetype, attribute, potential, and development model so every generated player remains credible across division level, club tier, age, role, and long-run development.

Phase 32 showed that the youth pipeline cannot be fixed only by changing academy counts. The deeper problem is that all player generation and development need a stricter role-aware model: defenders must not become finishers, attackers must not become defensive specialists, goalkeepers must be evaluated through goalkeeper attributes, and lower-division prospects must carry high potential without already being first-division-ready.

## Product intent

- Preserve the Football Manager-like visible attribute scale: `1..20`.
- Treat third division as roughly Italian Serie C level.
- Make lower-division saves fun through rare white-fly players and high-potential prospects, not through broadly overpowered squads.
- Keep role identity stable: a player may become more familiar with nearby roles through usage, but does not randomly change his core role identity.
- Make role coherence apply to all players:
  - initial senior generation;
  - initial youth academy generation;
  - seasonal academy refill;
  - player development and aging;
  - future intake, market, scouting, and UI inspection.
- Keep the user's control principle:
  - AI clubs may promote, sell, or release youth players;
  - the user's club receives reports and decisions, not hidden automatic squad management.

## Core model decisions

### Attribute scale

- `1..4`: very poor
- `5..8`: low
- `9..11`: acceptable
- `12..14`: good
- `15..16`: very good
- `17..18`: excellent
- `19..20`: elite

### Official role list v1

- `goalkeeper`
- `center_back`
- `full_back`
- `wing_back`
- `defensive_midfielder`
- `central_midfielder`
- `attacking_midfielder`
- `wide_midfielder`
- `winger`
- `striker`

### Role identity model

Each player should have:

- `primaryRole`
- `archetype`
- `naturalRoles`
- `adaptedRoles`
- `weakRoles`
- `roleFamiliarity`

The `primaryRole` and `archetype` drive attribute generation and development caps. Familiarity affects how comfortably a player can be used in nearby roles, but does not turn a center back into a striker or remove role-based hard caps.

### Attribute classification

For each role/archetype, attributes are classified as:

- `coreForRole`: attributes that can become very high for strong players;
- `secondaryForRole`: useful attributes that can be good but should not dominate the profile;
- `allowedButLow`: attributes that may exist but normally remain low or medium;
- `cappedOutOfRole`: attributes with hard caps even for top players.

Examples:

- A defender in any division should not have `technical.finishing` above roughly `10..11` except for an explicitly documented rare exception.
- An attacker in any division should not have defensive attributes above roughly `10..11` unless a specific archetype allows a small controlled exception.
- Goalkeepers use a goalkeeper-specific model and are not penalized because outfield attributes are low.

### Senior division bands

```text
Third division senior
  core role: 8-13 normal, 14-15 rare, 16+ exceptional
  secondary: 6-11 normal, 12-13 rare
  out-of-role: 1-8 normal, 9-11 maximum rare

Second division senior
  core role: 10-15 normal, 16 rare, 17+ exceptional
  secondary: 8-13 normal, 14 rare
  out-of-role: 1-9 normal, 10-11 maximum rare

First division senior
  core role: 12-17 normal, 18-20 top player only
  secondary: 9-15 normal, 16 rare
  out-of-role: 1-10 normal, 11 maximum rare
```

### Youth bands

```text
Youth 15-17 in third division
  core current: 4-9 normal, 10-11 interesting, 12+ rare
  secondary current: 3-8
  out-of-role: 1-6, hard cap 8/9

Youth 18-19 in third division
  core current: 6-11 normal, 12-13 interesting, 14+ rare
  secondary current: 4-9
  out-of-role: 1-7, hard cap 9/10
```

An elite lower-division prospect should usually have high potential and contained current ability. He may have one or two impressive attributes for his age and role, but he must not already look like a complete first-division starter.

### Youth academy rules carried into this phase

- Every club has exactly `11` youth academy players after refill.
- Composition after refill is exactly:
  - `1` goalkeeper
  - `4` defenders
  - `4` midfielders
  - `2` attackers
- Youth academy age range is `15..19`.
- Players aged `20+` must leave the academy.
- Refill happens after aging, over-19 resolution, promotions, sales, and releases.
- Refill generates only missing players and is visible at least in reports.
- Refill prioritizes department first, then balances roles inside the department:
  - DEF: center back / full back / wing back
  - MID: defensive midfielder / central midfielder / attacking midfielder / wide midfielder
  - ATT: striker / winger
- AI clubs automatically promote only `high` or `elite` youth players when useful.
- User club youth decisions are reported, not automatically executed.

### Rarity budget

- `ordinary`: majority of youth players.
- `interesting`: common enough to create stories, but not guaranteed to become strong.
- `high`: few per division per season, roughly `2..5`.
- `elite`: very rare, roughly `0..1` per division per season, often `0`.

The rarity budget is per division and season, not per club.

## Step order

1. `01-generation-audit-and-model-spec.md`
2. `02-role-identity-and-familiarity-contracts.md`
3. `03-role-attribute-classification-and-hard-caps.md`
4. `04-division-age-and-current-ability-bands.md`
5. `05-potential-rarity-and-white-fly-budget.md`
6. `06-senior-generator-rework.md`
7. `07-youth-academy-refill-generator-rework.md`
8. `08-development-respects-role-caps.md`
9. `09-generation-quality-report-and-tests.md`
10. `10-long-run-gates-and-phase-report.md`

## Phase constraints

- Do not implement UI.
- Do not implement scouting, staff, facilities, contracts, wages, loans, or advanced market behavior.
- Do not tune match scoring to hide generation problems.
- Do not widen long-run thresholds to make reports pass.
- Do not expose exact hidden potential as user-facing truth.
- Do not make youth intake or academy refill produce guaranteed stars.
- Do not add automatic decisions for the user's club beyond reports.
- Preserve deterministic output by seed.
- Keep generated players fictional.
- Keep user-facing labels localized through the existing i18n layer.
- Do not add dead compatibility helpers or leave obsolete generation paths behind.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched domain/content/engine/simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli simulate-season --seed=world-a --player-generation-report`;
- `pnpm cli simulate-season --seed=world-b --player-generation-report`;
- `pnpm cli career --save=phase33-world-a --seed=world-a --new-world-preview`;
- `pnpm cli career --save=phase33-world-a --development-report`;
- `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=50 --seasons=10 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`;
- `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- The project has one explicit role identity model for all generated players.
- Role/archetype attribute classifications and hard caps exist and are tested.
- Senior and youth generation use division-aware current-ability bands.
- Potential and current ability remain separate.
- Lower-division high-potential players are rare and not immediately first-division-ready.
- Development cannot grow players past role-incoherent hard caps.
- Youth academies refill to exactly `11` players with the agreed department structure.
- Reports expose generated-player quality, youth refill, role-coherence anomalies, and long-run player-development anomalies.
- `250` worlds x `30` seasons has no structural squad collapse and no generation-coherence failures before the project moves back toward broader career systems.
