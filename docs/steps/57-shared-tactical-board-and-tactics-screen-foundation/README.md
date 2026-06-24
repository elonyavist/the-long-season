# Phase 57 - Shared Tactical Board And Tactics Screen Foundation

## Goal

Integrate the supplied draggable tactical-pitch feature as a shared tactical
board for the game, starting from match preparation and keeping it ready for the
future Tactics section and matchday read-only usage.

This phase exists because the current match-preparation pitch is good enough as
a static selection workspace, but the game now needs a real football tactical
board: normalized slot positions, constrained movement zones, role changes from
pitch location, visible fit feedback, and durable preparation state.

## Product Decision

The supplied feature in
`feature_richiesta/the-long-season-tactics/src/features/tactics/` is a reference
implementation, not a second tactical model.

Adopt its interaction behavior, geometry model, and visual pitch approach, but
adapt it to the game's canonical Phase 56 model:

- use only the 12 canonical roles;
- derive formation shape from effective slot roles;
- keep slot and player separate;
- keep coordinates normalized as `nx, ny in [0,1]`;
- store pixel projection only in a geometry helper;
- use real game squad/player data instead of `SAMPLE_SQUAD`;
- use game design tokens and localization keys;
- keep the 8-player bench as a separate panel outside the pitch.

## Canonical Role Codes For The Board

The board may use short Italian tactical codes for display, but those codes
must map to canonical domain roles:

- `POR` -> `goalkeeper`
- `TD` -> `right_full_back`
- `DC` -> `center_back`
- `TS` -> `left_full_back`
- `MED` -> `defensive_midfielder`
- `CC` -> `central_midfielder`
- `ED` -> `right_midfielder`
- `ES` -> `left_midfielder`
- `TRQ` -> `attacking_midfielder`
- `AD` -> `right_winger`
- `AS` -> `left_winger`
- `ATT` -> `striker`

Do not preserve reference-only roles such as `REG`, `SP`, or `PC` as game
roles. Map them into canonical roles during the integration:

- `REG` -> `MED` or `CC` depending on the slot position;
- `SP` -> `TRQ` or `ATT` depending on the slot position;
- `PC` -> `ATT`.

## Interaction Rules

- The goalkeeper slot is fixed: it cannot be dragged and cannot change role.
- The goalkeeper can still be replaced by assigning a different available
  player to the slot.
- Dragging a player shows only that role's movement zone.
- Releasing a player hides the zone.
- Movement is clamped to the current role's zone.
- Right-click opens the context menu for a player or empty slot.
- Long press on touch opens the same context menu and cancels if the pointer
  moves beyond a small threshold.
- Context role options come from the dragged slot's current normalized
  location.
- Example acceptance case: dragging `ED` forward into the attacking-right area
  makes `AD` available; choosing it changes the role, clamps to the new zone,
  and updates the derived shape from `4-4-2` to `4-3-3`.
- Removing a player leaves the slot's position and role intact and sets
  `playerId` to `null`.
- Empty slot assignment shows only players not already in the XI, with fitness
  and suitability for that slot's role.

## Persistence Decision

Persist:

- `baseFormationId`;
- ordered pitch `slots` with `slotId`, normalized `nx`, normalized `ny`,
  canonical role, `playerId`, and lock state;
- existing bench player IDs and selected tactic profile through the current
  match-preparation state.

The derived shape is not persisted. It is recalculated from slot roles.

## Ordered Steps

1. `01-supplied-feature-audit-and-integration-map.md`
2. `02-canonical-board-role-and-geometry-contract.md`
3. `03-shared-tactical-board-state-and-adapters.md`
4. `04-pitch-markings-token-and-player-token-integration.md`
5. `05-drag-zone-context-menu-and-touch-interactions.md`
6. `06-real-squad-mapping-and-role-suitability.md`
7. `07-match-preparation-replacement-and-persistence.md`
8. `08-regression-visual-qa-accessibility-and-touch.md`
9. `09-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

Run after the final step:

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/shared-tactical-board.spec.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement In This Phase

- Do not implement Inbox/Posta Decision Center.
- Do not implement the full Tactics section as a separate screen yet.
- Do not add opponent/second-team mirrored board.
- Do not add live matchday tactical changes.
- Do not add drag-and-drop for the bench.
- Do not add complex tactical instructions.
- Do not introduce non-canonical roles.
- Do not store pixel coordinates in state.
- Do not duplicate the domain formation catalog.
- Do not parse CLI output for web data.
- Do not hide automatic lineup decisions behind the board.

## Definition Of Done

- The shared tactical board uses canonical roles and normalized coordinates.
- The board replaces the current match-preparation pitch without regressing
  bench, tactic, save readiness, or dashboard/Continue integration.
- The supplied `PitchMarkings.tsx` behavior is adapted into the game rather than
  creating a second field background system.
- The board is usable with real game/demo squad data and no runtime dependency
  on `SAMPLE_SQUAD`.
- `suitFor(player, role)` remains derived and uses the best available current
  game information.
- Drag zones, role changes, empty-slot assignment, goalkeeper locking, and
  touch long-press behavior are verified.
- The component is reusable by a future Tactics screen and matchday read-only
  board.
- Playwright screenshots prove desktop and narrow behavior.
- The phase report recommends exactly one next phase.
