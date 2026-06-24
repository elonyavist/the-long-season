# Shared Tactical Board Report

Date: 2026-06-24
Phase: `57-shared-tactical-board-and-tactics-screen-foundation`
Status: Complete

## Summary

Phase 57 replaced the old static match-preparation pitch with a shared tactical
board foundation that can be reused by match preparation, the future Tactics
screen, and a later read-only matchday view.

The implementation keeps the game-owned tactical model as the source of truth.
The supplied feature in `feature_richiesta/the-long-season-tactics/` was treated
as a reference for interaction and visual behavior, not as a runtime package or
second formation system.

## Integration Decisions

- The supplied `PitchMarkings.tsx` idea was adapted into
  `TacticalBoardPitchMarkings`.
- The supplied standalone Zustand store was rejected because the web app already
  owns career UI state in `career-ui-store`.
- The supplied `SAMPLE_SQUAD` was rejected from runtime code. The board now maps
  current match-preparation player facts through `tactical-board-squad.ts`.
- The supplied local role catalog was rejected. The board uses the Phase 56
  canonical role grammar and adapts browser-facing display role codes from the
  `@game/ui` formation facts.
- The supplied CSS hardcoded palette was replaced with the existing retro
  football design tokens and semantic suitability colors.

## Canonical Role Adaptation

The board exposes compact tactical display codes:

`POR`, `TD`, `DC`, `TS`, `MED`, `CC`, `ED`, `ES`, `TRQ`, `AD`, `AS`, `ATT`.

Those codes are display and interaction roles for the board. They map back to
the canonical player roles owned by the domain formation catalog. Side/channel
meaning remains slot metadata, not extra player-role names.

The current role-change menu uses the dragged normalized position to expose only
football-sensible role options. For example, dragging an `ED` into the attacking
right channel exposes `AD`; selecting it changes the slot role, its movement
zone, suitability, and the derived shape.

## Coordinate And State Contract

All tactical-board positions are normalized:

- `nx` from `0` to `1`: left to right.
- `ny` from `0` to `1`: opponent goal to own goal.

Pixel projection stays in `tactical-board-geometry.ts` through `toSvg`,
`toNorm`, and pointer conversion helpers tied to the `0 0 800 1170` SVG
viewBox.

The board keeps slot and player separate:

- a slot owns position, role, zone, lock state, and optional `playerId`;
- a player cannot occupy two board slots;
- removing a player sets `playerId` to `null` while preserving slot position and
  role;
- assigning a player fills that existing slot.

## Shared Board Ownership

The reusable board is owned by `apps/web/src/features/tactics-board/`.

Important files:

- `tactical-board-types.ts`: normalized board contracts.
- `tactical-board-roles.ts`: display roles, zones, and position-based role
  options.
- `tactical-board-geometry.ts`: SVG/normalized coordinate conversion and zone
  clamping.
- `tactical-board-formations.ts`: `@game/ui` formation adaptation and current
  shape derivation.
- `tactical-board-state.ts`: pure draft operations for load, move, role change,
  clear, and assign.
- `tactical-board-squad.ts`: current squad-to-board player mapping.
- `tactical-board-suitability.ts`: role suitability derivation.
- `components/TacticalBoardPitch.tsx`: controlled reusable tactical surface.

`CareerMatchPreparationScreen` consumes this board as a controlled component.
The store persists the `TacticalBoardDraft` in the current match-preparation
state.

## Real Squad Adapter

The board maps the current demo match-preparation squad into tactical-board
player facts:

- stable id;
- shirt number;
- surname;
- form trend from fitness;
- primary canonical role;
- alternative canonical roles;
- current ability;
- suitability by board role.

This replaces the supplied sample squad and keeps future real-save integration
straightforward: the adapter can switch source data without changing the board
component API.

## Suitability Calculation

`suitFor(player, role)` remains derived. It now uses the existing web
position-fit tiers derived from the game's player-position facts instead of the
supplied feature's lane heuristic.

It returns the same five visual levels:

- `natural`;
- `accomplished`;
- `competent`;
- `unconvincing`;
- `makeshift`.

The token border reads this level at render time, so role changes and
assignments update the color without storing suitability as mutable state.

## Match-Preparation Replacement

The match-preparation screen now renders the shared tactical board for the
starting XI while preserving the existing 8-player bench panel, tactic profile
selection, save readiness, dashboard blockers, Inbox/Posta blocker resolution,
and Continue integration.

Manager actions remain explicit:

- selecting or changing a player is user-driven;
- removing a player keeps the slot empty;
- changing base formation resets the board from the selected base shape through
  the existing preparation state flow;
- no hidden automatic lineup decision was introduced.

## Persistence Shape

The persisted browser draft is:

- `baseFormationId`;
- `slots`.

Each slot contains normalized position, role, canonical role, lock state, and
optional `playerId`.

This is enough for the future Tactics screen to reuse the same board and for a
future save adapter to serialize the selected tactical layout without storing
pixel coordinates.

## Touch And Accessibility QA

The Playwright visual QA covers:

- desktop and narrow layouts;
- empty and filled board states;
- no horizontal overflow;
- active drag-zone appearance and disappearance;
- goalkeeper movement lock;
- goalkeeper replacement;
- midfield clamp behavior;
- `ED -> AD` role change and derived shape update;
- remove-player behavior;
- candidate filtering for empty slots;
- suitability color changes;
- keyboard reachability;
- touch-style long-press open and cancel behavior.

Screenshots are written under `/tmp/the-long-season-phase57`.

## Remaining Non-Blocking Risks

- The board is now production-shaped, but the future Tactics screen still needs
  a real route and surrounding workflow.
- Bench drag/drop remains intentionally out of scope. The bench is still a
  separate match-preparation control.
- Real save persistence is not wired yet; the current browser state remains the
  demo career store.
- The future matchday board should reuse the same component in read-only mode
  rather than forking the pitch.
- The role-change options are intentionally conservative. More nuance can be
  added later only if it improves manager clarity, not just because the board
  can technically support it.

## Next Phase Decision

Inbox/Posta Decision Center can resume next.

Recommended next phase:

`Phase 58 - Inbox/Posta Decision Center`

Reason: the main technical blocker for routing attention events into match
preparation was the weak tactical surface. The board is now shared, tested, and
persistent enough for Inbox/Posta messages to link into real manager decisions
without building on placeholder UI.
