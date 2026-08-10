# Step 06B15 - Checkpoint L5.3: Player Renewal And Leaders 7 x 10

## Status

**REFINE on 2026-08-10.** The locked `7 x 10` completed with exactly seven
workers and zero reconciliation failures. Task-quality nomination correlations
became material, but player renewal, veteran load, leader ages and scorer
concentration remain outside their frozen bands. Step 06B15A owns the new
attribution; Step 06B16 remains closed.

## User-Facing Reason

This is the first powered check that asks whether ten career seasons now tell a
credible player story at once: veterans still contribute without owning every
leaderboard, generated players replace the opening generation, relevant skill
affects production, and top-scorer/top-assist levels remain recognisable.

## Frozen Population

- profile: `phase81a-player-renewal-leaders-l5-3-7x10`;
- fresh prefix: `phase81a-player-renewal-leaders-l5-3-v1`;
- `7` worlds, `10` seasons, all three divisions simulated;
- player gates read first-division facts only;
- exactly `7` workers and resumable canonical world shards;
- sections: players, formations and development; diagnostic JSON;
- the canonical owner observer supplies starts, minutes, nominations, current
  ability, leader rows and origin. No report reconstructs them afterwards.

## Frozen Gates

| Metric | Target |
|---|---:|
| age-33+ starts mean | `12..17` |
| age-33+ minutes mean | `1100..1500` |
| career-generated leader share, season 10 | `>= 0.30` |
| opening leader share, season 10 | `<= 0.50` |
| top-ten scorer mean | `14.5..18.5` |
| top-ten assist mean | `8..10.5` |
| scorer mean age | `25.5..28.5` |
| assist mean age | `25..28.5` |
| age-33+ scorer leader share | `<= 0.12` |
| age-33+ assist leader share | `<= 0.12` |
| real age-33+ leader observations | `> 0` |
| reconciliation failures | `0` |

The final reachability row prevents the age bands from passing because no older
player can succeed. Every interval is evaluated on the pooled declared corpus;
no individual season is required to look average.

## Decision

- `GO`: all gates hold; Step 06B16 may correct only persistent club identity.
- `REFINE`: record raw metrics and failed keys. Do not tune the actor multiplier,
  development curve or age policy without a new owner attribution.

## What NOT To Implement

- no code or threshold changes after reading output;
- no extra seed, reduced season count or worker override;
- no age/output cap, generated-player bonus or leaderboard post-processing;
- no HTML claim from this checkpoint; the integrated HTML belongs to 06B17.

## Expected Files

- `owner-attribution.ts` and tests for the total L5.3 decision;
- `career-sections.ts` and tests for the exhaustive checkpoint route;
- `report-registry.ts` and tests for the locked profile;
- i18n labels in all five languages;
- `simulation-out/phase81a-player-renewal-leaders-l5-3-7x10.json`;
- this step, phase README, audit README and `docs/PROJECT_STATUS.md`;
- Step 06B16 only after the decision is recorded.

## Required Checks

Profile contract test, total decision reachability, exactly seven reported
workers, `7 x 10` reconciliation, JSON artifact, `pnpm check`,
`git diff --check`, `graphify update .`.

## Outcome

| Metric | Observed | Target |
|---|---:|---:|
| age-33+ starts mean | `22.6115` | `12..17` |
| age-33+ minutes mean | `1851.67` | `1100..1500` |
| generated leader share, season 10 | `0.2071` | `>= 0.30` |
| opening leader share, season 10 | `0.7929` | `<= 0.50` |
| top-ten scorer mean | `30.15` | `14.5..18.5` |
| top-ten assist mean | `10.64` | `8..10.5` |
| scorer / assist mean age | `30.09 / 29.91` | `<= 28.5 / <= 28.5` |
| age-33+ scorer / assist share | `0.26 / 0.27` | `<= 0.12 / <= 0.12` |
| shooter / creator nomination correlation | `0.3753 / 0.4746` | diagnostic |
| real age-33+ leader observations | `53` | `> 0` |

Artifact:
`simulation-out/phase81a-player-renewal-leaders-l5-3-7x10.json`.

The correlation result proves that Step 06B14 made player skill causal; it also
rules out flat nomination as the residual owner. The checkpoint does not permit
changing a target or applying an age/output correction. Step 06B15A reads the
canonical player and generation facts to distinguish stored-ceiling renewal
from selection, and actor concentration from conversion-centering error.
