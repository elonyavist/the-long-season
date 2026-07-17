# 03 - Durable Active Match Checkpoint Contract

## Goal

Represent an in-progress selected-club match as durable structured career state
so half-time can survive a refresh without persisting engine or UI internals.

## Scope

- Define a domain-owned active-match checkpoint with only facts required to
  restore:
  - fixture identity;
  - current regulation phase and minute;
  - lineups and bench state;
  - applied substitutions;
  - half-time tactical plan when present;
  - deterministic simulation resume data;
  - accumulated structured events/stats required for exact continuation.
- Extend `CareerState` and its validation with an optional active checkpoint.
- Add pure engine adapters that create, validate, resume, and complete the
  checkpoint without storage imports.
- Prove that a serialized half-time checkpoint resumes to the same full-time
  report as uninterrupted staged progression.
- Keep inactive extra-time/penalty phases out of the active contract.

## What NOT to implement

- No SQLite or browser code.
- No UI view model in domain state.
- No rendered event prose.
- No mutable RNG object or nondeterministic cursor persistence.
- No cups, extra time, penalties, injuries, cards, or team talks.

## Expected files

- `packages/domain/src/career/active-match-checkpoint.ts`
- `packages/domain/src/career/active-match-checkpoint.test.ts`
- `packages/domain/src/state/career-state.ts`
- `packages/domain/src/state/career-state.test.ts`
- `packages/domain/src/index.ts`
- `packages/engine/src/career/active-match-checkpoint.ts`
- `packages/engine/src/career/active-match-checkpoint.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/71-web-career-persistence-and-save-lifecycle-foundation/04-sqlite-wasm-opfs-worker-and-schema-bootstrap.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/career/active-match-checkpoint.test.ts packages/domain/src/state/career-state.test.ts packages/engine/src/career/active-match-checkpoint.test.ts packages/engine/src/match-engine/staged-match-progression.test.ts
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm depcruise
git diff --check
```

## Definition of Done

- Half-time state is durable domain truth rather than a web `Demo*` object.
- Engine continuation is deterministic after serialization.
- Storage can persist the checkpoint without importing engine types.
- No future phase values are activated.

