# Shared Tactical Board Feature Audit

Date: 2026-06-24
Phase: `57-shared-tactical-board-and-tactics-screen-foundation`
Step: `01-supplied-feature-audit-and-integration-map`

## Scope

This audit reviews the supplied tactical-board reference in
`feature_richiesta/the-long-season-tactics/src/features/tactics/` before any
runtime source is copied into `apps/web`.

The reference is useful as an interaction and geometry prototype, not as a
second football model. Phase 56 remains the source of truth for canonical roles
and formation semantics.

## Supplied Module Map

| Supplied module | Decision | Reason |
|---|---|---|
| `components/PitchView.tsx` | Reimplement against current game contracts | The component proves drag, active-zone rendering, context menu, and shape display, but it is coupled to a standalone Zustand store, `SAMPLE_SQUAD`, visible hardcoded labels, and a local role catalog. |
| `components/PitchMarkings.tsx` | Copy/adapt | The SVG field markings match the required vertical pitch, stripe texture, own goal at bottom, and outward penalty arcs. Colors and IDs must be adapted to design-system tokens and collision-safe SVG IDs. |
| `components/PlayerToken.tsx` | Reimplement/adapt | The token layout matches the required number, surname, role code, form arrow, and suitability border. Runtime labels, colors, player data, and accessibility need game integration. |
| `components/SlotContextMenu.tsx` | Reimplement/adapt | The menu proves role-change/removal/assignment flows, but it hardcodes Italian prose, uses reference suitability levels, and does not support long press. |
| `components/tactics.css` | Reject as direct copy | Useful as a layout reference only. The game must use existing retro-football design tokens and avoid a second visual system. |
| `geometry.ts` | Copy/adapt | The normalized `nx, ny` model, `toSvg`, `toNorm`, `pointerToNorm`, and `clampToZone` align with the phase contract and viewBox `0 0 800 1170`. |
| `roles.ts` | Reimplement around canonical roles | Movement zones, `cellOf`, and role options are useful, but the role list contains non-canonical `REG`, `SP`, and `PC`. |
| `formations.ts` | Reimplement from domain catalog | The presets are useful examples, but the game already owns formations in `@game/domain`. Duplicating a permanent formation catalog in web would create drift. |
| `suitability.ts` | Reimplement | The signature concept is correct, but the current band/channel heuristic must be replaced with the game's suitability levels and available player facts. |
| `display.ts` | Reimplement with tokens | Suitability and form semantics are useful. Hardcoded colors and visible labels are not acceptable for runtime game UI. |
| `tacticsStore.ts` | Reject as direct copy | Standalone Zustand state duplicates current `career-ui-store` and initializes from `SAMPLE_SQUAD`. Its pure actions should be ported into board state helpers. |
| `sampleSquad.ts` | Reject from runtime | It can inform tests but must not be imported by the game app. The board must map current demo/career squad data. |
| `types.ts` | Reimplement/adapt | The slot/player separation and normalized-coordinate comments are useful. Role and suitability types must align to the game. |

## Role Model Mismatches

The reference role list includes 15 role codes:

- accepted board display codes: `POR`, `TS`, `TD`, `DC`, `ES`, `ED`, `CC`,
  `MED`, `AS`, `AD`, `TRQ`;
- reference-only codes to remove from game runtime: `REG`, `SP`, `PC`.

Required remaps:

- `REG` becomes `MED` or `CC` according to slot location and base formation
  semantics;
- `SP` becomes `TRQ` or `ATT` according to slot location;
- `PC` becomes `ATT`.

The board can still show compact Italian display codes, but every slot must
map to one of the 12 canonical domain roles:

- `goalkeeper`;
- `right_full_back`;
- `center_back`;
- `left_full_back`;
- `defensive_midfielder`;
- `central_midfielder`;
- `right_midfielder`;
- `left_midfielder`;
- `attacking_midfielder`;
- `right_winger`;
- `left_winger`;
- `striker`.

## Current Web Integration Targets

The current match-preparation UI lives in:

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`;
- `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx`;
- `apps/web/src/features/match-preparation/BenchSelectionPanel.tsx`;
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`;
- `apps/web/src/stores/career-ui-store.ts`;
- shared table/detail helpers under `apps/web/src/shared/ui/`.

The visible replacement target is `TacticalPitchLineup.tsx`. The bench panel
must remain separate from the pitch.

## Persistence Targets

The current browser prototype persists match-preparation draft state in
`apps/web/src/stores/career-ui-store.ts`, backed by
`DemoMatchPreparationState` in `match-preparation-demo.ts`.

Phase 57 should persist the board draft in that same web-store seam:

- `baseFormationId`;
- ordered tactical board slots with normalized `nx`, normalized `ny`, display
  role, canonical role, `playerId`, and lock state;
- existing bench player IDs;
- selected tactic profile;
- saved/unsaved state.

The derived shape must not be persisted.

## Out Of Scope Confirmed

The following supplied-feature capabilities or natural extensions stay outside
Phase 57:

- opponent or second-team mirrored board;
- live matchday tactical changes;
- full Tactics section route;
- bench drag-and-drop;
- complex tactical instructions;
- non-canonical roles;
- pixel coordinates in state;
- CLI output parsing;
- hidden automatic lineup decisions.

## First Safe Code Step

The first safe code step is Step 02:

1. create `apps/web/src/features/tactics-board/`;
2. define the canonical board role/geometry contract;
3. adapt geometry and movement-zone helpers;
4. derive base slots from the domain formation catalog;
5. add tests before rendering anything.

This keeps the domain catalog as the source of truth and gives later React work
a stable, tested contract.
