# Canonical Formation Role Audit

Date: 2026-06-24
Phase: `56-canonical-formation-and-role-catalog`
Step: `01-current-formation-role-divergence-audit`

## User-Facing Problem

The tactical workspace must feel like a football-management tool, not a layout
hack. The current implementation works, but formation facts are split across
domain, UI, web helpers, and localization. That makes it too easy for future
tactics, squad, Inbox/Posta, and match-preparation screens to disagree about
what a role means.

The agreed product rule is:

- player roles are canonical football roles;
- slot side/channel is metadata;
- pitch coordinates are web presentation, not role identity.

## Current Sources Of Formation And Role Truth

### `packages/domain/src/tactics/formations.ts`

Current responsibility:

- Owns the broad formation catalog through `FORMATION_KEYS`,
  `FORMATION_CATALOG`, and `FORMATIONS`.
- Defines `FormationSlot`, `FormationLine`, `FormationDepartment`,
  `FormationSide`, and `FormationPositionFamily`.
- Stores slot keys such as `cb-right`, `cm-left`, `dm-center`, and `st-right`.
- Stores football requirement in `positionFamily`.

Current divergence:

- `FormationPositionFamily` has 15 families, not the agreed 12 canonical
  player roles.
- Extra families are:
  - `right_wing_back`;
  - `left_wing_back`;
  - `second_striker`.
- Wing-backs and second striker should become slot/shape interpretation, not
  canonical player roles.
- Several slot keys include side information. That is acceptable for stable
  slot identity, but it must not be confused with player role.

Canonical direction:

- Domain should own the canonical formation catalog.
- Each formation slot should expose:
  - stable slot key;
  - canonical player role;
  - line;
  - department;
  - side/channel metadata.

### `packages/domain/src/tactics/position-suitability.ts`

Current responsibility:

- Maps `PlayerPosition` values to `FormationPositionFamily`.
- Returns `natural`, `adapted`, `weak`, or `invalid`.

Current divergence:

- Suitability is still keyed to the 15-family formation model.
- Wing-back and second-striker suitability exists as role-like target families.
- No player-strength scoring exists yet, so select ordering cannot implement
  the requested rule that a strong adapted player may beat a mediocre natural
  player.

Canonical direction:

- Suitability should evaluate a player's canonical/natural positions against a
  canonical slot role first.
- Side/channel should be a secondary signal.
- A deterministic scoring helper should combine player strength with
  suitability for explicit manager-triggered selection actions.

### `packages/ui/src/career/career-match-preparation-view.ts`

Current responsibility:

- Owns the match-preparation read model.
- Defines a smaller `CareerMatchPreparationFormationId` subset.
- Duplicates formation slot arrays in `CAREER_MATCH_PREPARATION_FORMATIONS`.
- Converts slot keys to label keys and broad role keys.

Current divergence:

- `@game/ui` has an independent formation catalog that can drift from domain.
- It is currently framework-free and language-agnostic, which is correct, but
  it lacks a domain-derived formation adapter.
- It exposes `roleKey` and `positionKey` as strings, but those are not tied to a
  single canonical contract.

Canonical direction:

- `@game/ui` should derive formation facts from domain or the dependency rule
  must explicitly document why not.
- The preferred direction for Phase 56 is to allow `ui -> domain` for stable
  read-model formation contracts while keeping UI free of React, i18n, engine,
  storage, CLI, and web imports.

### `apps/web/src/features/match-preparation/tactical-pitch-layout.ts`

Current responsibility:

- Maps slot keys to CSS grid coordinates.
- Keeps the visual pitch bounded for supported formations.

Current divergence:

- Coordinates are keyed directly by slot strings.
- This is acceptable as a presentation adapter, but only after the domain slot
  metadata is canonical.
- It should not invent new fake role keys to solve layout.

Canonical direction:

- Web pitch coordinates should map from stable slot keys produced by the domain
  catalog.
- The supplied vertical SVG field should replace CSS-drawn field lines in step
  `06a`.

### `apps/web/src/shared/lib/player-position-ordering.ts`

Current responsibility:

- Orders squad rows and select options by position rather than localized role
  text.
- Contains slot fit tiers keyed by slot key.

Current divergence:

- It repeats suitability-like knowledge in the web app.
- It still knows about position keys such as `rwb`, `lwb`, `wide`, and
  `winger`.
- It does not use domain suitability scoring and cannot account for player
  strength/current ability yet.

Canonical direction:

- Web ordering may remain a thin presentation helper, but fit scoring should be
  owned by domain or a shared read-model layer rather than buried in React/web.
- Final option ordering must remain deterministic.

### `packages/i18n/src/labels.ts`

Current responsibility:

- Owns visible formation, slot, status, and CLI formation-fit labels for five
  supported languages.

Current divergence:

- Includes user-facing labels for `right_wing_back`, `left_wing_back`, and
  `second_striker`.
- Includes slot labels such as `DCD`, `CCD`, and `MCD`, which are acceptable as
  abbreviations only if they are explicitly slot labels and not player roles.
- Does not yet expose compact labels for `Auto`, `Fill gaps`, and `Clear`.

Canonical direction:

- Keep role labels and slot labels separate.
- Add helper-action labels in all five supported languages with English
  fallback.
- Remove or stop using non-canonical role labels where the formation catalog no
  longer exposes those roles.

## Related Code Paths To Preserve

- CLI formation-fit inspection:
  - `apps/cli/src/commands/simulate-season/formation-fit-output.ts`
  - `packages/engine/src/squad/formation-squad-fit.ts`
- Match-preparation web adapter:
  - `apps/web/src/features/match-preparation/match-preparation-demo.ts`
  - `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
  - `apps/web/src/features/match-preparation/TacticalPitchLineup.tsx`
  - `apps/web/src/features/match-preparation/BenchSelectionPanel.tsx`
  - `apps/web/src/shared/ui/SquadSelectionTable.tsx`
- Visual QA:
  - `apps/web/src/visual-qa/tactics-workspace.spec.ts`
- Localization tests:
  - `packages/i18n/src/labels.test.ts`

## Migration Order

1. Add a domain `player-roles.ts` contract with exactly the 12 canonical roles.
2. Rewrite domain formation slots to use canonical role plus side/channel
   metadata.
3. Update domain suitability and web option ordering to consume canonical roles
   and deterministic scoring.
4. Add explicit manager-triggered helper actions for `Auto`, `Fill gaps`, and
   `Clear`.
5. Derive `@game/ui` formation facts from domain and update package dependency
   rules intentionally.
6. Update localized role, slot, formation, and helper-action labels.
7. Integrate the supplied SVG pitch background without clipping.
8. Run browser visual QA across critical formations and keyboard flows.
9. Close with architecture documentation and one next-phase recommendation.

## Canonical Ownership Decision

Domain should become the source of truth for:

- canonical player roles;
- formation keys;
- formation slot semantics;
- slot line, department, side/channel metadata.

`@game/ui` should expose a framework-free read model derived from domain
formation facts. `apps/web` should own only browser interaction, SVG field
rendering, pitch slot placement, and visual layout.

## Step 01 Result

Proceed with Phase 56. The current implementation has no blocking code defect,
but it has enough duplicated formation knowledge that Inbox/Posta and future
tactics/squad screens should not be built on top of it yet.
