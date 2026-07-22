# Step 10 - Market Workspace And Player Inspection

## Status

Ready.

## Goal

Deliver the primary Market route as a dense, football-first target browser
that reuses the current shell and player-profile language.

## User-Visible Outcome

Market is a real section: the manager can scan targets, filter quickly, inspect
a player, understand window and budget context, and reach one valid next action
without horizontal scrolling or dashboard-style clutter.

## Scope

1. Replace the current Market placeholder/legacy output with one production
   route backed by Step 09 view models.
2. Present a compact header with window state and one budget/exposure strip.
3. Present a fixed-header, vertically scrolling target table with useful
   responsive column priorities and no horizontal page or table scroll.
4. Add accessible search, role, age, contract, value, and eligibility filters
   with clear reset behavior.
5. Open target inspection through the existing full-screen player-profile
   pattern, adapted only for market facts and allowed commands.
6. Preserve filters, scroll, and focus after closing detail or completing a
   command.
7. Present closed-window, empty, loading, error, and storage-recovery states
   through current shared primitives.
8. Use semantic Motion for route/detail transitions and changed results only.

## Implementation Contract

- Market route state is transient web state; career facts remain in the working
  session and engine.
- Reuse shell, table, full-screen overlay, money, date, status, command, and
  motion primitives after verifying they fit.
- Desktop should be dense and scan-friendly; narrow layouts must reflow, not
  clip or hide the main action.
- Every action has a keyboard and non-drag path.

## Expected Files

- focused Market feature folder under `apps/web/src/features/market/`
- current routing/navigation/shell files only where Market becomes active
- current shared table/profile/overlay/status/motion primitives only where a
  reusable correction is required
- focused web tests and current-product visual QA fixture updates
- `packages/i18n/` labels/tests required by visible copy
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No copied Squad table, second player profile, permanent third panel, card
  wall, decorative scouting rating, or browser business rule.
- No offer composer or command mutation yet.
- No dead responsive variant or desktop-only interaction.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Inspect desktop, wide, narrow, 200% text, keyboard-only, touch, reduced
  motion, empty, closed-window, and populated states.
- Confirm the table answers who, where, how good, how expensive, how close to
  expiry, and whether an approach is legal without opening every player.

## Completion Criteria

- Market is a complete inspection workspace, not a placeholder.
- No horizontal scroll, clipped action, focus loss, or hidden state exists.
- Existing profile/table primitives are reused without parallel copies.
- Step 11 is the only next implementation step.
