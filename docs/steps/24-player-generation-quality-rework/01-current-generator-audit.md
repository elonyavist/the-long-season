# Step 01 - Current Generator Audit

## Goal

Audit the current player-generation pipeline before changing it.

## Context

The user observed that generated third-division players can look too strong and role-incoherent. This step must turn that concern into measurable findings: where current attributes come from, how division strength is represented, how role profiles affect attributes, and whether potential/current ability are clearly separated.

## Expected files

- `docs/audits/PLAYER_GENERATION_QUALITY_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Read current content generator files for clubs, players, archetypes, nationality distribution, and league system.
- Inspect how current ability, potential, age, role, club strength, and division level are represented.
- Record examples of suspicious output, especially:
  - third-division players with too many high attributes;
  - defenders with high finishing or penalties;
  - attackers with high tackling or defensive values;
  - goalkeepers with outfield-like profiles;
  - too many players who look first-division-ready.
- Record which behavior is confirmed by code and which is only a hypothesis.
- Produce an audit with concrete follow-up requirements for the rest of Phase 24.

## What NOT to implement

- Do not change player-generation code.
- Do not change match-engine code.
- Do not tune balance targets.
- Do not add a new CLI report yet.
- Do not claim the generator is fixed by documentation.

## Required checks

- `rg -n "fakePlayer|generate.*Player|archetype|ability|potential|nationality|division|club.*tier" packages/content/src`
- `pnpm --filter @game/content run typecheck`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-b --identity-review`
- `git diff --check`

## Definition of Done

- The audit file exists.
- The audit identifies specific generator risks and exact source areas.
- The next step has enough information to define division and club-tier attribute bands.
- No production code changed.
