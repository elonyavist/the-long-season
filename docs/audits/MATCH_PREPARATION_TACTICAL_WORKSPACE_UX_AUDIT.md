# Match Preparation Tactical Workspace UX Audit

Date: 2026-06-24
Phase: `58-match-preparation-tactical-workspace-ux-rework`
Step: `01-current-ux-issue-audit-and-target-layout`
Status: Complete

## Why This Audit Exists

Phase 57 made the shared tactical board technically strong, but the current
match-preparation screen still does not yet feel like a dense football manager
workspace.

The problem is not that the screen lacks data. The problem is hierarchy:
important preparation blockers, fixture context, formation controls, lineup
selection, bench selection, and player detail are present, but too much of the
first viewport is spent on large panels and sparse facts. The user reaches the
actual football decision too late.

The goal for Phase 58 is therefore not a decorative reskin. It is a usability
rework of a core decision screen: prepare the next match quickly, understand
what is missing, choose players intelligently, and keep the UI consistent.

## Current Issues

### Oversized Context Area

The current match-preparation screen shows fixture and selected-club facts in a
large block. The facts are useful, but the layout gives them too much vertical
weight.

User-facing impact:

- The first useful viewport feels like a report page instead of a preparation
  desk.
- The tactical board is pushed down even though it is the main decision area.
- Counts such as `0/11` and `0/8` are useful but should live in a compact
  status strip, not in a large card.

### Oversized Blocker Area

The current blockers panel repeats missing-lineup, missing-bench, and
missing-tactic state in a tall section.

User-facing impact:

- The manager sees the same incomplete state in multiple places.
- The screen spends too much space explaining the problem instead of letting
  the manager resolve it.

### Detached Board Controls

Formation, `Auto`, `Fill gaps`, and `Clear` currently read as detached controls
above or beside the board rather than as the board toolbar.

User-facing impact:

- The manager has to visually scan too much to understand the tactical controls.
- The helper actions feel like generic dashboard buttons instead of tactical
  desk controls.

### Sticky Tactical Menu

The tactical-board menu currently stays open after clicking on the pitch or
outside the menu in some cases.

User-facing impact:

- The board feels unfinished.
- The manager has no natural way to dismiss a context menu except choosing an
  action or opening something else.

Required behavior:

- pitch background click closes the menu;
- outside click closes the menu;
- `Esc` closes the menu;
- assign/remove/role-change actions close the menu.

### Candidate Ordering Needs Football Meaning

Candidates shown from an empty slot or replacement menu must be ordered by
usefulness for the target role.

Required ordering:

1. suitability for the role;
2. current ability;
3. fitness/form;
4. stable display name or player id.

This is not an automatic choice. It is a manager-facing sort that makes the
best candidates easier to inspect first.

### XI And Bench Pickers Feel Different

The XI board menu and the bench currently use different visual languages.

User-facing impact:

- The bench feels like a form section instead of part of the same tactical
  selection workflow.
- The manager has to interpret reserve choices with less context than XI
  choices.

The bench should use the same compact candidate row language as the XI picker:
number, surname, role, fitness as `%`, foot where available, and suitability.

### Three-Player Central Lines Need More Space

The tactical board is close to correct, but three `CC` or three `DC` players can
look visually cramped because they sit near the center circle or defensive arc.

Required behavior:

- keep every slot inside the pitch;
- add slightly more horizontal separation for three-player central lines;
- do not disturb two-player or four-player lines.

## Adopted Target Layout

### First Viewport

Use a denser layout:

1. Page title and dashboard action.
2. Compact match header:
   - selected club;
   - opponent/fixture;
   - date;
   - round;
   - home/away;
   - preparation status;
   - XI count;
   - bench count;
   - tactic state.
3. Compact alert strip:
   - missing XI;
   - missing bench;
   - missing tactic;
   - no large blocker card.
4. Tactical board workspace:
   - board toolbar;
   - pitch;
   - bench below/outside field;
   - squad/detail area as supporting context.

### Board Toolbar

The board toolbar owns:

- formation selector;
- `Auto`;
- `Fill gaps`;
- `Clear`;
- base formation/current shape facts if still useful.

Helper actions remain explicit manager actions. No hidden best XI or hidden best
bench behavior is introduced.

### Player Selection

Left click:

- selects the player and updates the detail panel.

Right click or long press:

- opens tactical actions and assignment/replacement menu.

Candidate row:

- shirt number;
- surname;
- natural/current role;
- compact fitness `%`;
- foot when available;
- suitability badge/color.

### Bench Selection

The bench remains outside the pitch and keeps exactly 8 explicit reserve slots.

Bench suitability uses the player natural/current role only. It does not infer
hidden squad coverage or make tactical recommendations.

### Desktop And Narrow Layout

Desktop:

- board is the primary area;
- squad list remains visible as supporting context;
- candidate menus and bench controls must not obscure the board awkwardly.

Narrow:

- no horizontal overflow;
- board remains usable;
- candidate rows remain readable;
- bench remains reachable after the board.

## Components To Change

- `CareerMatchPreparationScreen.tsx`
  Compact header, alert strip, board toolbar placement, bench visual parity.
- `TacticalBoardPitch.tsx`
  Menu dismissal behavior, candidate ordering, optional toolbar-facing density
  improvements.
- `TacticalBoardMenu.tsx`
  Candidate-row integration.
- `BenchSelectionPanel.tsx`
  Shared candidate picker/row visual language.
- `tactical-board-squad.ts`
  Deterministic candidate ranking helper if it belongs near board player facts.
- `tactical-board-formations.ts`
  Minor normalized coordinate adjustment for three central midfielders/center
  backs if needed.
- `components.css`
  Density, toolbar, alert strip, candidate rows, bench parity, and spacing.
- i18n labels
  Only where new visible labels are introduced.

## Components Not To Change

- Domain formation catalog.
- Engine simulation and match readiness rules.
- Save/readiness logic.
- Inbox/Posta behavior.
- Full Tactics route.
- Bench drag/drop.
- Market, finances, squad, youth, staff, calendar, and matchday systems.

## Roadmap Decision

Inbox/Posta Decision Center remains deferred until this UX pass is complete.

Reason: Inbox/Posta will route the manager into match preparation. It should
not route into a screen that is technically correct but still sparse,
inconsistent, and partially awkward to use.

## Acceptance Summary For Later Steps

Phase 58 should be considered successful when:

- the first viewport is visibly denser;
- blockers are compact but still clear;
- the board toolbar feels attached to the tactical board;
- the tactical menu dismisses naturally;
- role candidates sort by usefulness;
- XI and bench candidate selection share one visual grammar;
- three `CC` and three `DC` lines have better spacing;
- Playwright screenshots prove desktop and narrow behavior.
