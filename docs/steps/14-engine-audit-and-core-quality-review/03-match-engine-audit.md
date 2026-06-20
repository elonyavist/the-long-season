# Match Engine Audit

## Goal

Audit the current match engine for correctness, coherence, causal player attribution, stat consistency, and maintainability.

## Why we implement it this way

The match engine is the core of the game. Before adding market or youth systems, match outputs must be believable enough that squad decisions matter. The audit should focus on whether current events, stats, tactical inputs, and player attribution tell a coherent football story without pretending to model full possession chains.

## What to implement

- Add or update the `3. Match Engine Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`.
- Review:
  - team strength derivation;
  - match context contracts;
  - `stepMatch`;
  - `simulateMatch`;
  - segmented manual tactic simulation;
  - chance actor selection;
  - goal, assist, shooter, goalkeeper save, block defender, and creator attribution;
  - durable `MatchReport` schema;
  - player match stats derivation;
  - CLI fixture event output as a consumer of structured data.
- Check for duplicated attribution paths or obsolete helper code.
- Check whether event schema versions are coherent and documented.
- Check whether current limitations are explicit:
  - no full possession chain;
  - no substitutions;
  - no injuries;
  - no cards;
  - no set-piece detail beyond current structured keys.

## What NOT to implement

- Do not change scoring probabilities or event algorithms.
- Do not add new match events.
- Do not add possession chains, substitutions, injuries, cards, penalties, or set-piece systems.
- Do not fix distribution issues inside this audit step; record them as findings.

## Allowed dependencies

- No new dependencies.
- Documentation-only output is expected.

## Expected files

- `docs/audits/ENGINE_CORE_AUDIT.md`
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm exec vitest run packages/engine/src/match-engine packages/engine/src/season-engine/player-match-stats.test.ts`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `rg -n "attributeGoal|attributeAssist|attributeShot|attributeGoalkeeper|TODO|FIXME|compat|legacy" packages/engine/src/match-engine packages/engine/src/season-engine`

## Definition of Done

- The audit report states whether the match engine is ready to support market/youth consequences.
- Event/stat consistency is reviewed with concrete files and outputs.
- Known limitations are classified as acceptable current scope or next-phase blockers.
- `docs/PROJECT_STATUS.md` records the step result and next action.

## Claude Code task prompt

Read the required project docs and this step. Audit the match engine and player-event/stat pipeline, run the listed checks, update the `3. Match Engine Audit` section in `docs/audits/ENGINE_CORE_AUDIT.md`, update `docs/PROJECT_STATUS.md`, and stop after this step.
