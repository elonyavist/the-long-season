# Phase 56 - Canonical Formation And Role Catalog

## Goal

Define and enforce one canonical formation and role grammar before continuing
with Inbox/Posta or broader tactics UI work.

This phase exists because the tactical workspace exposed a core modelling risk:
the project was mixing player roles, formation slots, side labels, and pitch
coordinates. That creates UI bugs, weak football semantics, and future engine
confusion.

## Product Decision

The game has exactly these player roles:

- goalkeeper
- right_full_back
- center_back
- left_full_back
- defensive_midfielder
- central_midfielder
- right_midfielder
- left_midfielder
- attacking_midfielder
- right_winger
- left_winger
- striker

Localized Italian presentation:

- portiere
- terzino destro
- difensore centrale
- terzino sinistro
- mediano
- centrocampista centrale
- esterno destro
- esterno sinistro
- trequartista
- ala destra
- ala sinistra
- attaccante centrale

Formation slots may have side/channel placement such as left center, right
center, or central pair, but those are not player roles. A player can be a
`center_back`; a slot can be "left center back". The role remains
`center_back`.

## Canonical Formation Rules

- 1 forward means one `striker`.
- 2 forwards means two `striker` slots.
- 3 forwards means `left_winger`, `striker`, `right_winger`.
- One or two defensive midfielders are always above center backs and below
  central midfielders.
- `right_midfielder` and `left_midfielder` are midfield wide players.
- `right_winger` and `left_winger` are forward-line wide attackers.
- No role key may encode side pair semantics like `cb-right`, `cm-left`, or
  `dm-right`.
- Side/channel belongs to the formation slot, not to the role.

## Manager-Triggered Selection Rules

The tactical workspace may provide explicit manager-triggered helper actions:

- `Auto`: fill starting XI and bench using deterministic player quality plus
  role suitability.
- `Fill gaps`: keep current manager choices and fill only empty starting-XI and
  bench slots.
- `Clear`: empty starting XI and bench selection.

These are not hidden recommendations and they must never run automatically. The
manager presses a button, sees the result, and can override any selected player.

Selection quality must consider both:

- player strength/current ability;
- suitability for the specific canonical role and slot side/channel.

The scoring must allow a top player who can genuinely play an adapted role to
rank above a mediocre natural-fit player. Natural fit is important, but it is
not allowed to dominate the player's football quality absolutely.

## Ordered Steps

1. `01-current-formation-role-divergence-audit.md`
2. `02-canonical-role-contract.md`
3. `03-domain-formation-catalog-rewrite.md`
4. `04-position-suitability-and-selection-ordering.md`
5. `04a-manager-triggered-selection-actions.md`
6. `05-ui-read-model-derives-from-domain-catalog.md`
7. `06-i18n-and-web-pitch-slot-mapping.md`
8. `06a-pitch-svg-background-integration.md`
9. `07-regression-visual-qa-and-accessibility.md`
10. `08-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

Run after the final step:

```sh
nvm use 24
pnpm check
node --experimental-strip-types apps/web/src/visual-qa/tactics-workspace.spec.ts
git diff --check
graphify update .
```

## What NOT To Implement In This Phase

- Do not build Inbox/Posta Decision Center.
- Do not add drag-and-drop.
- Do not add hidden automatic best XI, hidden best bench, or tactic
  recommendations; only explicit manager-triggered selection buttons are in
  scope.
- Do not change match engine probabilities.
- Do not add new player attributes.
- Do not add new tactics beyond the canonical formation/role cleanup.
- Do not keep duplicated formation catalogs once the domain catalog can serve
  the same need.

## Definition Of Done

- The canonical role list is represented in domain code.
- Formation definitions use canonical roles plus slot side/channel metadata.
- UI read models do not maintain an independent formation catalog that can drift
  from domain.
- Web pitch coordinates map from slot placement, not from fake role names.
- The tactical pitch uses the provided vertical football-pitch SVG as its field
  background and shows the whole field without clipping.
- The match-preparation workspace has explicit `Auto`, `Fill gaps`, and `Clear`
  actions for XI and bench selection.
- Automatic helper selection is deterministic and ranks by player quality plus
  role suitability, so an elite adapted player can beat a mediocre natural-fit
  player.
- Localized labels distinguish player roles from slot labels.
- Tests prevent reintroducing role keys such as `cb-right`, `cm-left`, or
  `dm-right` as player roles.
- Playwright proves critical formations render without overlap or clipping.
- The next phase recommendation is updated, with Inbox/Posta moved after this
  cleanup unless a stronger blocker appears.
