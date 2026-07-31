# Step 06 - Contextual Prospect Current And Ceiling Generation

## Status

Not started.

## Goal

Generate young players whose current level and ceiling jointly match age,
division, dynamic club tier, role, and prospect class.

## Accepted Semantics

- A rare lower-division phenomenon is possible but exceptional.
- Transfer does not rewrite current ability or stored ceiling.
- Serious prospects meet their division ceiling bands; routine youth do not
  inherit those floors.
- Rare-prodigy current guardrails are age/category/strong-club aware.
- Role templates and off-role caps remain mandatory.

## What To Implement

- Replace the rare-prodigy-to-normal-current-lane shortcut.
- Encode the accepted ceiling matrix for interesting, serious, and rare
  prospects.
- Encode the accepted rare-prodigy current guardrails for ages 15-17 and
  18-20.
- Make opening senior generation and academy generation consume the same
  contextual prospect policy.
- Calibrate routine/good/serious frequencies toward the accepted category
  `3.5+` bands without hard-coding exact players.
- Preserve constructive generation and deterministic pre-allocation; do not
  use unbounded rejection sampling or post-force incompatible attributes.
- Add comments that future countries reuse the national policy at their own
  composition root.

## What NOT To Implement

- No national ceiling-six top-up, annual intake change, valuation, AI, or long
  run; Step 07 owns stock/intake.
- No transfer-triggered potential boost.
- No screen-specific stars or hidden development destination.

## Expected Files

- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/player-archetypes.test.ts`
- `packages/content/src/generators/player-current-ability-bands.ts`
- `packages/content/src/generators/player-current-ability-bands.test.ts`
- `packages/content/src/generators/player-current-profile-policy.ts`
- `packages/content/src/generators/player-current-profile-policy.test.ts`
- `packages/content/src/generators/player-potential-allocation.ts`
- `packages/content/src/generators/player-potential-allocation.test.ts`
- `packages/content/src/generators/player-potential-rarity.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/initial-youth-academies.ts`
- `packages/content/src/generators/initial-youth-academies.test.ts`
- `packages/content/src/generators/player-generation-quality.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/generators/player-archetypes.test.ts \
  packages/content/src/generators/player-current-ability-bands.test.ts \
  packages/content/src/generators/player-current-profile-policy.test.ts \
  packages/content/src/generators/player-potential-allocation.test.ts \
  packages/content/src/generators/fake-players.test.ts \
  packages/content/src/generators/initial-youth-academies.test.ts \
  packages/content/src/generators/player-generation-quality.test.ts
pnpm --filter @game/content run typecheck
git diff --check
graphify update .
```

## Definition Of Done

- Current/ceiling joint profiles satisfy the accepted contextual matrices.
- Serious prospects no longer start in the routine current lane.
- Ordinary young players remain the majority.
- Role coherence and constructive determinism pass.
- Step 07 is the only next action.
