# Player Willingness V1

## Goal

Add deterministic player willingness for permanent-transfer feasibility.

## Why we implement it this way

The user explicitly wants credible market behavior: a star from a higher division should not accept a normal move to a much lower division, while an aging or fringe player may accept a lower-level role if the sporting context makes sense.

This step adds that first credibility layer without contracts, wages, agents, scouting, or negotiation.

## What to implement

- Add a pure engine market Module for permanent-transfer willingness.
- Willingness input should include:
  - player;
  - current/selling club;
  - buying club;
  - optional valuation/quality signal from Step 03;
  - current date or season context if needed to derive age.
- Willingness output should include:
  - accepted/rejected status;
  - structured reason codes and numeric/context data;
  - no rendered prose.
- The first willingness model must consider:
  - buyer category versus seller category;
  - buyer reputation versus seller reputation;
  - player quality relative to destination category;
  - age/career-stage approximation from `birthDate`;
  - a simple role/fringe approximation if available without new systems.
- Add focused tests for:
  - star senior rejects a steep sporting downgrade;
  - lower-category or aging/fringe player can accept a plausible move;
  - same-category move can pass when reputation/value is plausible;
  - reason codes are stable and language-agnostic;
  - same input returns the same result.
- Export the willingness Module from `@game/engine`.

## What NOT to implement

- Do not add wages, contracts, agents, negotiation, bonuses, promises, personality, ambition, or morale effects.
- Do not add scouting fog or visible ranges.
- Do not add loans or loan-specific willingness.
- Do not add transfer feasibility or apply-preview logic.
- Do not add CLI output.
- Do not add automatic squad planning.
- Do not write user-facing prose in engine/domain.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/market/player-willingness.ts`
- `packages/engine/src/market/player-willingness.test.ts`
- `packages/engine/src/market/index.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/17-market-mvp-permanent-transfers/05-transfer-feasibility-and-apply-preview.md` only if willingness output changes feasibility scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/market/player-willingness.test.ts`
- `pnpm check`
- `rg -n "Math\\.random|Date\\.now|new Date|crypto\\.randomUUID|performance\\.now" packages/engine/src/market`
- `rg -n "wage|contract|agent|loan|scout|fog|negotiation|promise|personality|ambition" packages/engine/src/market/player-willingness.ts`

The final `rg` should return no out-of-scope implementation logic unless the match is a documented non-code explanation.

## Definition of Done

- Engine can determine deterministic permanent-transfer willingness.
- Unrealistic sporting downgrades can be rejected with structured reasons.
- No contracts, wages, scouting, loans, negotiation, persistence, or CLI behavior is introduced.
- `docs/PROJECT_STATUS.md` records the adopted willingness shape and next action.

## Claude Code task prompt

Read the required project docs and this step document. Implement only deterministic permanent-transfer willingness v1 in engine with focused tests. Do not add feasibility, apply-preview, CLI, persistence, scouting, wages, contracts, agents, loans, or negotiation. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop unless executing the whole phase prompt.
