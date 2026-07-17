# Step 11 - Accessibility, Playwright, Cleanup, And Phase Report

## Status

Done.

## Goal

Prove that Posta is a useful, accessible decision center, remove every replaced
path, and close Phase 73 with one evidence-based next phase.

## Scope

- Run the complete current-season career journey in Chromium with real
  SQLite/OPFS persistence.
- Verify desktop and narrow layouts for:
  - compact left Posta rail;
  - full two-column Posta outlet;
  - narrow list-to-detail navigation and Back behavior;
  - `All`, `To handle`, and `Unread` filters;
  - read, acknowledged, unresolved, and resolved visual states;
  - one same-date batch with deterministic highest-priority selection;
  - incomplete and ready matchday primary actions;
  - informational result delivery;
  - important season-rollover acknowledgement when supported;
  - current-season reset;
  - normal and reduced-motion calendar transitions;
  - refresh before save versus refresh after manual/autosave commit.
- Verify keyboard order, visible focus, named regions, selected-row semantics,
  unread meaning without color dependence, live announcements, text zoom, and
  no horizontal overflow.
- Confirm that Posta rows remain dense football-management information rather
  than nested cards or a generic email application.
- Scan for and delete replaced attention categories, old Posta summary paths,
  duplicate action routing, unused localization keys, obsolete tests, and dead
  CSS selectors.
- Reconcile architecture documentation with the actual ownership boundaries.
- Record final UX, fun, dependency, persistence, and no-dead-code findings.
- Retain the future extension matrix for market, contracts, finances, youth,
  and staff in both roadmaps and the final report.
- Recommend exactly the already-roadmapped
  `Phase 74 - Player Generation And Model Consolidation Cleanup` without
  implementing it. Keep Squad Screen And Player Memory Foundation as the next
  unnumbered web-section backlog item until the global phase sequence assigns
  it an unambiguous number.

## Expected files

- `apps/web/src/visual-qa/inbox-decision-center.spec.ts`
- `apps/web/src/visual-qa/inbox-decision-center.spec.test.ts`
- `docs/audits/WEB_INBOX_DECISION_CENTER_VISUAL_QA.md`
- `docs/audits/INBOX_POSTA_DECISION_CENTER_REPORT.md`
- `docs/audits/CAREER_INBOX_FUTURE_MESSAGE_EXTENSION_MATRIX.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- Any production or test file already touched by Phase 73 only when cleanup or
  a QA failure proves that change necessary.

## Manual inspection questions

- Is it immediately clear why `Continue` stopped?
- Does one date feel like one coherent management moment rather than several
  bureaucratic interruptions?
- Is the primary action obvious without reading technical status prose?
- Can the manager distinguish unread, to-handle, and resolved meaning without
  relying on color alone?
- Does the rail provide awareness without stealing space from the active club
  screen?
- Does the full Posta outlet feel dense, football-specific, and useful?
- Does the day transition add anticipation without slowing repeated play?

## What NOT to implement

- No Phase 74 player-generation cleanup and no Squad Screen implementation.
- No future market, contract, finance, youth, or staff messages.
- No aesthetic redesign outside Posta and the calendar transition.
- No relaxing accessibility, persistence, determinism, or no-dead-code gates
  to make screenshots pass.
- No unresolved known blocker marked as a warning merely to close the phase.

## Required checks

```bash
nvm use 24
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/storage run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm depcruise
pnpm check
pnpm exec playwright test apps/web/src/visual-qa/inbox-decision-center.spec.ts
rg -n "match_preparation_required|AppShellPostaRail|prepare_match|open_matchday|Mark resolved" packages apps/web/src
rg -n "market|contract|finance|youth|staff" packages/domain/src/career/inbox.ts packages/engine/src/career apps/web/src/features/inbox
git diff --check
graphify update .
```

## Completion criteria

- The full deterministic journey passes on desktop and narrow Chromium.
- Accessibility, reduced motion, focus, and overflow checks pass.
- Save/load and current-season reset behavior are proven against SQLite/OPFS.
- Replaced code, tests, CSS, and labels are deleted.
- The final reports explain both product value and architectural ownership.
- The five deferred message areas remain explicit without production
  scaffolding.
- `pnpm check` passes.
- `docs/PROJECT_STATUS.md` marks Phase 73 complete and recommends exactly the
  already-roadmapped Phase 74 without starting it.
