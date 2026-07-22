# Step 14 - Full-Screen Player Profile And Renewal Workspace

## Status

Done.

## Goal

Complete the player profile as the one place to understand the footballer and
manage the selected club's active contract.

## User-Visible Outcome

The manager can inspect a player in a premium full-screen football profile,
understand current ability and future assessment, review every active contract
term, and submit or answer a renewal without leaving the player context.

## Scope

1. Complete the full-screen overlay header with identity, age, persistent
   number, main role, availability, condition, morale, value, level, and
   potential assessment.
2. Present exact current attributes by technical, mental, physical, and
   goalkeeper families with role-relevant hierarchy.
3. Present canonical roles and suitability without duplicating the board
   formula.
4. Present active contract type, dates, annual wage, agreed squad status,
   signing/appearance/goal/clean-sheet bonuses, remaining time, and history.
5. Present club cash, wage-budget room, and the before/after effect while
   drafting supported renewal terms.
6. Submit, revise, withdraw, accept, or reject through Step 06/07 commands.
7. Show pending response date and read-only negotiation state truthfully.
8. Add validation, loading, success, counteroffer, rejection, and storage-error
   states without closing or losing the current draft.
9. Complete focus trap/restore, Escape/close, keyboard, touch, screen-reader,
   200% text, narrow layout, and reduced-motion behavior.

## Implementation Contract

- Exact hidden potential and raw ability aggregates never enter DOM props,
  rendered text, test snapshots, or analytics.
- Finance previews use engine results and integer money, never client arithmetic.
- Commands run through the existing command lock and working-session boundary.
- The overlay has one URL/screen context and restores focus to the originating
  Squad row.
- Motion is a bounded transition/micro-feedback treatment only.

## Expected Files

- `apps/web/src/features/squad/` profile, contract, command, and focused test
  Modules
- current shared full-screen dialog/icon/form primitives only where a reusable
  production improvement is required
- current runtime/session command adapters/tests
- current i18n catalogs/tests
- current web styles/tokens for production-used profile selectors only
- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No fake biography, personality, media description, scout report, agent,
  promise, unsupported contract clause, or exact hidden potential.
- No separate contract truth in Zustand.
- No decorative motion, nested modal chain, or horizontal page scroll.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/ui run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Inspect goalkeeper, defender, midfielder, attacker, young prospect, prime
  starter, veteran, injured, suspended, and expiring-contract profiles.
- Complete a renewal and counteroffer journey using keyboard-only and narrow
  touch layouts.

## Completion Criteria

- The full profile contains every locked fact and no unsupported fiction.
- Renewal commands are affordable, durable, accessible, and recoverable.
- Profile state and focus survive command failure correctly.
- Step 15 remains the only next implementation step.
