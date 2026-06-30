# 02 - Matchday Read Model And Action Contract

## Goal

Create a UI-owned matchday read model that converts structured career matchday
facts into stable data for web screens, without embedding game rules or prose.

## Scope

Add a small `packages/ui` contract for:

- matchday status before and after play;
- selected club and opponent context;
- fixture round/date/venue facts;
- final score and result state;
- ordered key event rows;
- basic player stat rows;
- condition changes from starter spend/recovery;
- form and morale consequence summaries from Phase 64;
- next stop/attention facts;
- available actions such as `playFixture`, `backToDashboard`, and
  `prepareMatch` when still blocked.

The read model must be deterministic, language-agnostic where possible, and
usable by both web and future UI surfaces.

## Expected files

- `packages/ui/src/career/career-matchday-view.ts`
- `packages/ui/src/career/career-matchday-view.test.ts`
- `packages/ui/src/career/index.ts`
- `packages/ui/src/index.ts`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not call the engine from `packages/ui`.
- Do not import web or React code.
- Do not add localization dictionaries here unless the existing UI package
  pattern requires it.
- Do not invent match facts when they are missing.
- Do not add advice such as "rotate this player" or "change tactic".
- Do not change dashboard or match-preparation read models except for a minimal
  export needed by this contract.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-matchday-view.test.ts
pnpm --filter @game/ui run typecheck
git diff --check
```

## Done when

- Tests cover pre-play blocked state, playable state, played result state, empty
  missing facts, and ordered consequence rows.
- Exported types/functions are documented enough for a junior developer to know
  which layer owns which responsibility.
- `docs/PROJECT_STATUS.md` records the adopted solution, verification, next
  action, and any blocker.
