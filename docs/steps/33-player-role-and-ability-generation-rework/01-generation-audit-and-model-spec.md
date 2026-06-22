# Step 01 - Generation Audit And Model Spec

## Goal

Turn the player-generation design decisions into a written model spec and audit the current code against it before changing implementation.

## Context

Phase 32 exposed youth underpopulation warnings and long-run anomalies, but the design discussion showed the real issue is broader: all generated players need stricter role identity, role-based caps, division-aware current ability, and potential separation.

This step is documentation and audit only. It must create a clear target model so the next steps can rework code without guessing.

## Expected files

- `docs/audits/PLAYER_ROLE_AND_ABILITY_GENERATION_SPEC.md`
- `docs/audits/PLAYER_ROLE_AND_ABILITY_CURRENT_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read:
  - `requirements.md`
  - `docs/PROJECT_RULES.md`
  - `docs/PROJECT_STATUS.md`
  - `docs/audits/YOUTH_ACADEMY_AND_SQUAD_PIPELINE_REPORT.md`
  - `docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`
  - existing Phase 24 player-generation docs and reports.
- Record the agreed model:
  - `1..20` attribute scale descriptions;
  - official role list v1;
  - role identity vs role familiarity;
  - `coreForRole`, `secondaryForRole`, `allowedButLow`, `cappedOutOfRole`;
  - senior division bands;
  - youth age bands;
  - rarity budgets;
  - youth academy refill model.
- Audit current generated players and code paths for:
  - defenders with high finishing;
  - attackers with high defensive attributes;
  - goalkeepers with outfield-heavy profiles;
  - lower-division players with too many `15+` current attributes;
  - development paths that can break role caps;
  - duplicate or obsolete generation logic.
- Decide which code areas must be changed in later steps.

## What NOT to implement

- Do not write production code.
- Do not change generator behavior.
- Do not change tests except documentation-only checks if needed.
- Do not widen existing gates.
- Do not solve youth academy refill yet.

## Required checks

- `test -f docs/audits/YOUTH_ACADEMY_AND_SQUAD_PIPELINE_REPORT.md`
- `test -f docs/audits/YOUTH_ACADEMY_LONG_RUN_REPORT.md`
- `rg -n "generate.*Player|archetype|potential|abilities|youth|academy|developPlayersForSeason" packages apps docs`
- `git diff --check`

## Definition of Done

- The target role and ability model is written down.
- The current generator audit identifies concrete gaps and touched areas.
- Later steps can implement from the spec without reopening the product discussion.
