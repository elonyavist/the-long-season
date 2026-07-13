# 04a - Responsive Squad List Information Rework

## Status

Done. Browser-visible result awaiting user visual acceptance before any next
phase starts.

## Goal

Rework the shared match-preparation squad list into a compact football-facing
selection surface that stays fully readable without horizontal scrolling.

The user must be able to scan who the player is, where he plays, his age,
current physical condition, and whether he is in the XI or on the bench without
reading secondary data or technical status prose.

This is a targeted post-Phase-69 follow-up to Step 04. Execute only this step;
do not reopen the completed shell, dashboard, tactical-board, or matchday work.

## Locked product decisions

- The list is primarily a selection and inspection tool.
- Clicking a row focuses the player and opens the existing player-detail flow.
- Assigning a player to a tactical slot remains owned by the tactical board;
  the list must not introduce a competing hidden assignment interaction.
- The visible information hierarchy is:
  `shirt number + name | primary position | age | condition | selection status`.
- Show only the primary position, using the compact canonical football code
  available to the web adapter (`POR`, `TD`, `DC`, `TS`, `MED`, `CC`, `ED`,
  `ES`, `TRQ`, `AD`, `AS`, `ATT`).
- Preferred foot is removed from the list and remains available in player
  detail only.
- Current physical condition is shown as a percentage. It must not be labelled
  or presented as recent form.
- `available` is the quiet default and has no visible status label or icon.
- Starting-XI and bench membership use compact, accessible visual markers that
  do not rely on language-specific letters.
- The list has compact department filters: `All`, `GK`, `DEF`, `MID`, `ATT`
  through localized football-facing labels.
- Name, position, age, condition, and status remain sortable.
- Horizontal scrolling is forbidden at every supported viewport.

## Current structured-fact boundary

The current production `SquadSelectionRow` exposes only:

- `selected`;
- `bench`;
- `available`.

Injury, suspension, and registration/ineligibility reasons are not currently
exposed by the active match-preparation read model. Do not create synthetic
statuses, placeholder injuries, unused enum variants, or UI-only career truth
to demonstrate icons.

When those facts become part of the structured player-availability contract, a
future step may add distinct injury, suspension, and ineligible markers with
localized accessible reasons. This step must keep the status renderer small and
exhaustive so that extension remains straightforward, but it must not add dead
branches today.

## Scope

### 1. Compact information model

- Remove preferred foot from the squad-list columns and sort options.
- Remove any table-only preferred-foot prop or helper that becomes unused.
- Adapt the displayed broad role into the canonical compact position already
  available from the player option/read model. Do not duplicate the canonical
  role catalog in React.
- Keep the existing real name, age, condition, selected-player focus, and
  selection membership facts.
- Keep deterministic position ordering and stable identity tie-breakers.

### 2. Selection-status presentation

- Render a compact check marker for `selected`.
- Render a compact bench-shaped marker for `bench`.
- Render no marker for `available`.
- Give each visible marker a localized accessible name and a native or custom
  accessible tooltip where pointer hover is available.
- Do not communicate status through color alone.
- Replace the current fragmented selected-row cell borders with one coherent
  row treatment: a restrained leading accent plus a subtle selected surface.

### 3. Condition presentation

- Show the numeric percentage because it is decision-relevant.
- Add a small restrained condition signal beside the percentage only when it
  improves scanning.
- The signal must use existing semantic design tokens and must retain the
  percentage as text; color or an icon alone is insufficient.
- Unknown condition remains an explicit localized unknown value.

### 4. Department filters and sorting

- Add a compact single-choice filter above the list for all players,
  goalkeepers, defenders, midfielders, and attackers.
- Derive department membership from the canonical position/role mapping; do
  not compare localized labels.
- Preserve sortable name, primary position, age, condition, and status facts.
- Make the current sort and filter state visible and keyboard operable.
- Filtering must not mutate squad or tactical state.

### 5. Responsive, overflow-free layout

- Keep the desktop presentation dense and table-like.
- Use stable column sizing so long names cannot force the container wider.
- Permit player names to wrap to at most two lines or truncate with an
  accessible full-name label where necessary.
- On narrow panels, recompose each player row into a deliberate compact layout
  while preserving all five required facts and sorting access.
- The list may scroll vertically inside its fixed-height decision panel.
- The list, its header, its rows, and its controls must never scroll
  horizontally.
- Do not solve overflow by shrinking text below the shared readable type scale.

## Architecture constraints

- Keep `SquadSelectionTable` presentation-only and controlled through props.
- Keep sorting/filtering local to the reusable list unless a second real
  consumer needs shared state.
- Do not add Zustand state for ephemeral table filtering or sorting.
- Reuse canonical player-position ordering and role mappings already present in
  `apps/web/src/shared/lib` or the existing tactics-board adapter.
- Do not import domain directly into a shared React component.
- Keep localization in `@game/i18n`; do not hardcode visible Italian or English
  strings in React.
- Remove obsolete columns, sort branches, CSS selectors, tests, and helpers in
  the same step. No compatibility leftovers.

## What NOT to implement

- No new full Squad section.
- No drag-and-drop from the list to the tactical board.
- No second lineup-assignment workflow.
- No player comparison mode.
- No preferred-foot column or horizontal scroll.
- No recent-form model disguised as condition.
- No injuries, suspensions, registration rules, or availability facts invented
  in the web adapter.
- No new gameplay state, engine tuning, persistence, or CLI parsing.
- No tactical-board geometry, pitch SVG, drag, menu, or suitability changes.
- No new icon dependency solely for decorative presentation; use the existing
  UI language or a minimal accessible status primitive.

## Expected files

- `apps/web/src/shared/ui/SquadSelectionTable.tsx`
- `apps/web/src/shared/ui/SquadSelectionTable.test.tsx`
- `apps/web/src/shared/lib/player-position-ordering.ts` only if a reusable
  department mapping is genuinely missing.
- `apps/web/src/shared/lib/player-position-ordering.test.ts` only when that
  shared mapping changes.
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
  only for the existing row adapter facts required by the compact role/status
  presentation.
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx`
  only when the screen adapter changes.
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/squad-list-responsive.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

Do not modify files outside this list unless a failing required check proves a
direct dependency. Record that dependency in `docs/PROJECT_STATUS.md` before
expanding scope.

## Required tests and checks

```bash
nvm use 24
pnpm exec vitest run \
  apps/web/src/shared/ui/SquadSelectionTable.test.tsx \
  apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx \
  packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run build
node apps/web/src/visual-qa/squad-list-responsive.spec.ts
git diff --check
graphify update .
```

The focused component tests must cover:

- default position ordering;
- all five sort keys;
- each department filter;
- XI, bench, and quiet available presentation;
- selected-player focus behavior;
- unknown age/condition behavior;
- absence of preferred-foot header and cells;
- accessible names for sorting, filtering, starting-XI, and bench markers.

## Browser-visible review

Capture and inspect at least:

- `/tmp/the-long-season-phase69-step04a/squad-list-desktop.png`;
- `/tmp/the-long-season-phase69-step04a/squad-list-narrow.png`;
- `/tmp/the-long-season-phase69-step04a/squad-list-filtered.png`;
- `/tmp/the-long-season-phase69-step04a/squad-list-selected-player.png`.

The Playwright/browser check must assert:

- `scrollWidth <= clientWidth` for the squad-list container and its table/list
  surface on desktop and narrow viewports;
- no page-level horizontal overflow caused by the list;
- all required facts remain visible at narrow width;
- the list keeps vertical scrolling for a full squad;
- filters and sortable headers are keyboard reachable with visible focus;
- clicking a player row focuses that player and reveals the existing detail;
- status meaning remains available without relying on color;
- no text overlaps, clipped controls, or unreadably compressed columns.

## Manual inspection for the user

Open Match Preparation, select the Squad tab, and verify:

1. the eye finds player name and position before secondary facts;
2. the current XI and bench are recognizable without repeated status prose;
3. available players remain visually quiet;
4. condition percentages are easy to compare;
5. filtering by department reduces scanning time;
6. sorting still feels immediate and predictable;
7. the player detail opens from a row click;
8. no horizontal scrollbar appears at desktop or narrow width.

Stop after presenting this browser-visible slice. Do not begin persistence or a
new career section until the user accepts the list.

## Definition of Done

- The squad list has no horizontal scrolling at any supported viewport.
- Preferred foot is absent from the list and remains available in player
  detail.
- Every row exposes number/name, primary position, age, condition percentage,
  and meaningful selection status.
- Available players have no redundant `available` label.
- Starting-XI and bench membership have compact, accessible non-text markers.
- Filters and all five required sorts are deterministic and accessible.
- Desktop and narrow screenshots show a dense football-management list rather
  than a squeezed generic data table.
- No fake unavailable states, dead props, stale CSS, or unused helpers remain.
- Focused tests, build, visual QA, `git diff --check`, and `graphify update .`
  pass.
- `docs/PROJECT_STATUS.md` and the web roadmap record the accepted result.
