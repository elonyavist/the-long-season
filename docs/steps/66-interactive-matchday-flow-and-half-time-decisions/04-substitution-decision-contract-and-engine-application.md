# 04 - Substitution Decision Contract And Engine Application

## Goal

Let the selected-club manager make half-time substitutions and apply them before
second-half simulation.

## Scope

Add the smallest deterministic contract for half-time substitutions:

- substitution decision shape:
  - outgoing starter player ID;
  - incoming bench player ID;
  - minute/phase reason key if needed;
- validation:
  - outgoing player must be on the selected club's current pitch lineup;
  - incoming player must be on the selected club's bench;
  - no duplicate player after substitutions;
  - maximum number of changes follows current phase scope;
- application:
  - update the second-half selected-club lineup/context before continuing;
  - preserve existing player IDs and match attribution consistency;
  - expose applied substitution facts for UI/read model.

This step can use a conservative v1 limit if the current game does not yet have
competition-specific substitution rules. It must document that competition rules
will own this later.

## Expected files

- `packages/domain/src/match/substitution.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/match-engine/half-time-substitutions.ts`
- `packages/engine/src/match-engine/half-time-substitutions.test.ts`
- `packages/engine/src/match-engine/staged-match-progression.ts`
- `packages/engine/src/match-engine/staged-match-progression.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add substitution UI yet.
- Do not add in-match substitutions outside half-time.
- Do not add opponent AI substitutions unless current step needs a neutral
  placeholder for deterministic simulation integrity.
- Do not add cup/competition-specific substitution rules.
- Do not add tactical role changes unless already required to keep the existing
  lineup valid.
- Do not hide automatic substitutions for the user's club.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/match-engine/half-time-substitutions.test.ts
pnpm exec vitest run packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
git diff --check
```

## Done when

- Tests prove valid half-time substitutions affect the second-half context.
- Tests reject duplicate, non-bench, and non-starter substitutions.
- Tests prove selected-club substitutions are manager-declared, not hidden
  automatic choices.
- Future competition-rule ownership is documented without implementing it.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
