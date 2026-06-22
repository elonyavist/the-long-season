# Step 08 - Development Respects Role Caps

## Goal

Ensure player development and aging preserve role coherence over many seasons.

## Context

Generation can be correct on day one and still fail after ten seasons if development pushes players past out-of-role caps. A center back should improve mostly as a center back. An attacker should not grow into a defensive specialist unless a future explicit retraining feature is added.

This step makes development use the same role/archetype classification and caps introduced by this phase.

## Expected files

- `packages/engine/src/career/*.ts`
- `packages/engine/src/career/*.test.ts`
- `packages/content/src/**/*.ts`
- `packages/content/src/**/*.test.ts`
- `packages/simulation-tools/src/**/*.ts`
- `packages/simulation-tools/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Update development logic to:
  - prioritize `coreForRole`;
  - allow smaller growth for `secondaryForRole`;
  - keep `allowedButLow` modest;
  - never exceed `cappedOutOfRole` hard caps.
- Keep `primaryRole` stable.
- Do not implement automatic primary-role changes.
- Allow future role familiarity improvements to be represented, but do not build a full retraining feature.
- Add tests:
  - a defender cannot grow finishing beyond the hard cap;
  - an attacker cannot grow defensive attributes beyond hard caps;
  - a goalkeeper remains goalkeeper-shaped;
  - high-potential youth can grow strongly in role-core attributes;
  - aging decline still works.

## What NOT to implement

- Do not implement role retraining.
- Do not add training UI.
- Do not add staff/facility modifiers.
- Do not change potential visibility.
- Do not change match-engine scoring.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/content run typecheck`
- `pnpm --filter @game/simulation-tools run typecheck`
- focused tests for touched engine/content/simulation-tools files
- `pnpm check`
- `git diff --check`

## Definition of Done

- Long-run development cannot create role-incoherent players.
- High-potential players grow mainly through role-relevant abilities.
- Primary role remains stable.
- Development reports can expose cap-related anomalies if they appear.
