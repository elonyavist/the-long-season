# 02 - Consequence Model And State Contract

## Goal

Define the Phase 64 post-match consequence model before code changes.

The model must be small enough to implement safely, but precise enough that a
future UI can explain why state changed.

## Expected files

- `docs/audits/MATCH_CONSEQUENCES_MODEL_CONTRACT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

Write `MATCH_CONSEQUENCES_MODEL_CONTRACT.md` with the v1 rules:

1. State values affected:
   - keep existing fitness consequences unchanged;
   - add bounded `form` changes for selected-club starters;
   - add bounded `morale` changes for selected-club starters;
   - do not apply fake bench-specific morale unless durable bench/minutes facts
     are available in the current core career save.
2. Participant model:
   - starter = selected-club player in the saved lineup/team context;
   - non-starter = no v1 form/morale change unless supported by explicit data;
   - no substitutions/minute shares in this phase.
3. Football reasons:
   - result direction: win/draw/loss;
   - team score context: goals for/against and clean sheet where relevant;
   - individual involvement currently visible in match report events/stats:
     goal, assist, goalkeeper save, shot volume, visible negative involvement
     only if currently tracked;
   - all reason keys must be stable and language-agnostic.
4. Delta budget:
   - small deltas only;
   - cap per player per match;
   - clamp final `form` and `morale` to `0..100`;
   - deterministic tie-breakers and ordered processing.
5. Structured facts:
   - player id;
   - before/after form;
   - before/after morale;
   - signed deltas;
   - participant role such as `starter`;
   - reason keys;
   - aggregate summary facts for CLI/UI.
6. Out of scope:
   - injuries;
   - team talks;
   - personality volatility;
   - manager promises;
   - bench dissatisfaction without durable bench data;
   - automatic recommendations.

## What NOT to implement

- Do not change source code.
- Do not introduce formulas that require facts not present today.
- Do not make morale swings large enough to dominate the match engine.
- Do not persist prose.

## Required checks

```bash
test -f docs/audits/MATCH_CONSEQUENCES_MODEL_CONTRACT.md
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- adopted v1 model;
- explicit out-of-scope decisions;
- next action;
- blocker, if any.

