# 02 - Person Identity Domain Contract

## Goal

Add a small language-agnostic identity contract that players and future staff can share.

The contract must represent fictional football people without introducing staff gameplay, scouting fog, real databases, or presentation-specific prose.

## What to implement

- Domain types for:
  - supported fictional nationality/country codes used by generated content;
  - name culture keys used by content name pools;
  - a reusable `PersonIdentity` value shape with first name, last name, nationality, optional second nationality, birth country, and name culture.
- Validation helpers or constructors that reject:
  - empty names;
  - unsupported nationality or name-culture keys;
  - duplicate primary/secondary nationality;
  - rendered prose fields that do not belong in domain state.
- Integration with the existing `Player` domain entity only if the step explicitly lists the player entity as an expected file.
- Focused tests for valid and invalid identity data.
- TSDoc/JSDoc comments on new exported types and helpers.

## What NOT to implement

- Do not create content name pools.
- Do not generate names yet.
- Do not add staff gameplay.
- Do not add scouting fog or visible-profile logic.
- Do not add localized labels for names.
- Do not use real player/staff data.
- Do not change match, market, or career behavior.

## Expected files

- `packages/domain/src/value-objects/person-identity.ts`
- `packages/domain/src/value-objects/person-identity.test.ts`
- `packages/domain/src/entities/player.entity.ts` only if the chosen contract requires moving player names into `PersonIdentity`
- `packages/domain/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/19-fictional-people-identity-foundation/03-name-culture-pools.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- focused domain identity tests
- `pnpm check`
- `rg -n "from .*(engine|storage|content|cli|i18n)" packages/domain/src`

## Definition of Done

- Domain has a reusable person-identity contract.
- The contract can support players now and staff later.
- The contract remains language-agnostic and deterministic.
- Domain package boundaries remain clean.
- `docs/PROJECT_STATUS.md` records the adopted identity shape.
