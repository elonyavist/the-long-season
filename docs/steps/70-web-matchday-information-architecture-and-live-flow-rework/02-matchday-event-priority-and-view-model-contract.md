# 02 - Matchday Event Priority And View-Model Contract

## Goal

Create the structured presentation contract needed for a football-first
tabellino and live phase layout.

This step should prepare the data shape before redesigning screens so the UI
does not hardcode one-off event logic in React components.

## Scope

- Add or refine matchday presentation helpers for:
  - phase status;
  - compact score header facts;
  - primary command per phase;
  - compact visual phase-indicator state;
  - event priority groups.
- Define event priority:
  - goals: highest visual priority;
  - penalties: high priority when real penalty facts exist;
  - red/yellow cards: secondary priority when real facts exist;
  - injuries: secondary priority when real facts exist;
  - substitutions: secondary priority when real facts exist;
  - misses/saves/errors: live-feed detail, not full-time tabellino headline
    unless the existing facts classify them as decisive.
- Keep event rendering based on structured event kinds and stable IDs.
- Add tests for event ordering and missing-event behavior.
- Update the roadmap Phase 70 progress note.

## What NOT to implement

- No screen redesign yet beyond a minimal smoke if needed.
- No fake cards, injuries, penalties, or substitutions.
- No engine event schema changes unless the current read model cannot identify
  existing structured facts.
- No rendered prose inside engine/domain.
- No runtime narrator or LLM.

## Expected files

- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `packages/ui/src/career/*` if shared framework-free contracts are justified
- `packages/ui/src/career/*.test.ts` if `@game/ui` changes
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

If the step changes rendered output, capture the current matchday screen.

Acceptance:

- event priority is testable without inspecting CSS;
- missing event kinds do not render empty sections;
- React components can consume grouped event facts without re-deriving match
  semantics locally.

Stop after this step for review if any browser output changes.

## Definition of Done

- Matchday event hierarchy exists as structured presentation data.
- Tests prove goals sort and display as the highest-priority tabellino events.
- Status and roadmap are updated.
