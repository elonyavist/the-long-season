# 04 - Deterministic Season History And Facts

## Goal

Make the canonical season advancement output explainable without making adapters inspect internal engine details.

The engine should emit structured facts that can power CLI reports now and UI/inbox summaries later.

## Expected files

- `packages/engine/src/career/advance-career-season.ts`
- `packages/engine/src/career/advance-career-season.test.ts`
- `docs/audits/CAREER_ADVANCEMENT_INTERFACE_CONTRACT.md`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Ensure the season advancement result includes structured facts for:
   - source season id;
   - target season id/date context;
   - selected club id;
   - player development counts;
   - player decline counts;
   - exits;
   - youth lifecycle exits;
   - youth intake count;
   - youth promotions;
   - squad maintenance actions;
   - transfer turnover actions;
   - warnings or invalid reasons.
2. Keep facts deterministic and stable for tests.
3. Keep facts semantic, not prose. Example: use ids, counts, reason codes, and structured summaries.
4. Add tests that prove:
   - facts are stable for the same input;
   - facts are sufficient for an adapter to render a season report without re-running rules;
   - facts do not expose adapter-only formatting.
5. If existing career state already has season history structures, use them. If not, return facts without adding a save schema change in this phase.

## What NOT to implement

- Do not add narrative prose.
- Do not add LLM hooks.
- Do not add new save schema unless impossible to avoid. If unavoidable, stop and document a blocker.
- Do not localize facts inside the engine.
- Do not add UI.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/advance-career-season.test.ts
pnpm --filter @game/engine run typecheck
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- active step path;
- fact model summary;
- verification result;
- any missing fact that should become a future phase.
