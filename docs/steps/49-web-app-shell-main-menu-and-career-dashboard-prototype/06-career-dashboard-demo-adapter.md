# 06 - Career Dashboard Demo Adapter

## Goal

Create the web adapter that feeds the career dashboard prototype.

This adapter should build a deterministic demo dashboard from structured data
and `@game/ui`. It should not parse CLI output and should not write saves.

## Expected files

- `apps/web/src/career/build-demo-career-dashboard.ts`
- `apps/web/src/career/build-demo-career-dashboard.test.ts`
- `apps/web/src/career/career-dashboard-presenter.ts`
- `apps/web/src/career/career-dashboard-presenter.test.ts`
- `apps/web/src/app/navigation.ts`, only if screen routing state is introduced.
- `apps/web/src/App.tsx` or `apps/web/src/app/App.tsx`
- `packages/ui/src/career/*`, only if a narrow contract extension is needed.
- `packages/i18n/src/labels.ts`, only for new visible web labels.
- focused web/UI/i18n tests for touched files
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Build a deterministic demo dashboard for seed `world-a` or a documented demo
  seed.
- Use `@game/ui` dashboard builder.
- Use structured content/game facts directly; never use CLI text.
- Keep the adapter read-only.
- Represent the same dashboard facts proven by Phase 48:
  - career context;
  - selected club;
  - next fixture;
  - saved lineup/tactic readiness;
  - condition summary;
  - table context;
  - recent match;
  - action availability;
  - blockers.
- Keep the adapter small enough that a future real save adapter can replace it.

## What NOT to implement

- Do not persist browser saves.
- Do not implement a real save loader.
- Do not advance fixtures.
- Do not implement lineup/tactic editing.
- Do not implement new engine/content behavior.
- Do not show hidden potential or hidden recommendations.
- Do not duplicate dashboard readiness logic already owned by `@game/ui`.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/ui run typecheck` if UI contracts change.
- focused adapter tests proving deterministic output.
- `pnpm check`
- `git diff --check`

## Definition of Done

- Web can produce a deterministic career dashboard view model.
- The adapter is read-only and does not parse CLI prose.
- A future real save adapter has a clear replacement point.
