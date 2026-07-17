# Web Premium Visual System And Component Language Audit

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Status: current-product audit; no production changes

## Executive Result

The web product has a recognizable visual foundation: one fixed navy, cream,
gold, red, green, and pitch-green palette; restrained radii; clear primary
commands; visible focus; deterministic loading feedback; and a tactical board
that immediately communicates football management.

It does not yet operate as one premium component system. Operational screens
combine oversized identity typography, repeated framed panels, several local
control families, and more decorative layers than the decision hierarchy can
support. The result is coherent in color but inconsistent in emphasis: a
future navigation item, a fact panel, a selected row, and a command often share
the same rectangular visual grammar.

There are no P0 visual-system findings. There is one P1 finding, six P2
findings, and one bounded maintenance signal for Step 06. The approved
`campo-calcio.svg` and tactical-board interaction language remain preservation
boundaries.

## Evidence

Evidence was collected against the current production web path with Node
24.16.0, Chromium, the real SQLite/OPFS persistence adapter, and deterministic
career data.

- Desktop visual states: 1440 x 960.
- Current cross-screen screenshots:
  `/tmp/the-long-season-phase73a-step04/01-entry-normal.png` through
  `/tmp/the-long-season-phase73a-step04/08-matchday-phase-rail-and-command-state.png`.
- Comparison sheet:
  `/tmp/the-long-season-phase73a-step04/contact-sheet.png`.
- Computed-style probe:
  `/tmp/the-long-season-phase73a-step04/computed-style-sample.json`.
- Full desktop/narrow product state set:
  `/tmp/the-long-season-phase73a-step03/`.
- Loading-state evidence:
  `/tmp/the-long-season-phase72/01-pre-match-loading-desktop.png` through
  `/tmp/the-long-season-phase72/05-preparation-loading-narrow.png`.
- Current token source: `apps/web/src/styles/tokens.css`.
- Global and product CSS: `apps/web/src/styles/base.css`,
  `apps/web/src/styles/layout.css`, and
  `apps/web/src/styles/components.css`.
- Preserved board CSS: `apps/web/src/styles/tactical-board.css`.

Current stylesheet size:

| File | Lines | Exact `.tls-*` classes | Role |
| --- | ---: | ---: | --- |
| `tokens.css` | 117 | 0 | Theme, semantic aliases, typography, spacing, radius, border, shadow |
| `base.css` | 98 | 1 | Reset, page background, base controls, global focus |
| `layout.css` | 707 | 52 | Entry and persistent shell geometry |
| `components.css` | 3,319 | 211 | Dashboard, preparation, Matchday, Posta, save, feedback, dialogs |
| `tactical-board.css` | 409 | 30 | Approved football board and bench language |
| Total | 4,656 | 288 unique across all files | Current presentation layer |

The counts are not defects by themselves. They become evidence when a small
token vocabulary is bypassed by local values and local component states.

## Current Visual Identity Contract

### Accepted Skin

The current product exposes one fixed dark skin. Phase 69 intentionally removed
the rejected palette picker and root `data-theme-palette` attribute. The old
multi-skin direction is therefore historical context, not a current accepted
contract.

The current fixed skin is directionally appropriate:

- deep navy app and shell establish a night-match/club-office atmosphere;
- cream is the reading color, not a decorative beige page wash;
- gold is reserved primarily for current selection and the next command;
- red communicates blockers or destructive risk;
- green communicates fitness/suitability/success and the football surface;
- the pitch colors are independent from user theming.

Future remediation must improve hierarchy inside this skin before considering
additional skins. A palette selector would multiply current inconsistencies.

### Color Token Inventory

| Semantic role | Current token | Current value/source | Current usage result |
| --- | --- | --- | --- |
| App canvas | `--tls-theme-app-background` | `#070b13` | Stable dark foundation |
| Shell | `--tls-theme-shell-surface` | `#0f1724` | Sidebar, scoreboard-like chrome |
| Workspace | `--tls-theme-panel-surface` | `#151f30` | Main screens and most nested panels |
| Elevated workspace | `--tls-theme-elevated-panel-surface` | `#1d2c43` | Inbox workspace, grouped command surfaces |
| Table header | `--tls-theme-table-header-surface` | `#0b1320` | Data/list headers |
| Table rows | row/alternate/selected tokens | `#1a2940`, `#20314a`, `#293c59` | Useful row differentiation |
| Text | text/muted/heading tokens | cream and blue-gray | Clear base reading hierarchy |
| Primary action | primary/hover/text tokens | gold/gold-light/dark ink | Strong, recognizable CTA |
| Secondary action | `--tls-theme-secondary-action-surface` | blue navy | Shared secondary button/select base |
| Semantic status | `--tls-color-red`, green, blue | fixed semantic colors | Blocker, positive/suitability, informational |
| Pitch | pitch/pitch-dark/field-text | fixed greens and white | Correctly isolated football surface |

The palette is duplicated through two alias layers: `--tls-theme-*` and
`--tls-color-*`, plus a compatibility block explicitly described as temporary.
Several compatibility aliases have no current production consumer. Step 06
must determine the minimal canonical semantic layer; this audit does not
remove aliases.

### Broken Token References

Three product-level properties are referenced but not defined:

| Missing property | Current consumers | Browser result | User-facing impact |
| --- | --- | --- | --- |
| `--tls-font-size-xxs` | Matchday phase rail, event kinds, compact signal labels | Declaration becomes invalid; rendered rail label measured at inherited `16px` | A supposedly quiet progress indicator becomes visually button-like and competes with match facts |
| `--tls-theme-muted-surface` | Match pressure, half-time toolbar, decision-signal surfaces | Background declaration becomes invalid or transparent | Supporting groups lose the intended surface tier and blend inconsistently |
| `--tls-color-surface` | Storage recovery color mix | Background declaration becomes invalid | Recovery alert falls back to an unintended transparent treatment |

The custom properties for pitch image, slot coordinates, and tactical menu
coordinates are valid runtime inputs supplied by React; they are not missing
design tokens.

This is a P2 visual-contract defect, not a browser-crash defect.

## Typography Audit

### Current Families

| Family token | Intended role | Current result |
| --- | --- | --- |
| `--tls-font-ui` | Commands, body, labels | Readable and suitably utilitarian |
| `--tls-font-display` | Product identity and rare football editorial emphasis | Overused for operational page titles and some fixture/live copy |
| `--tls-font-mono` | Dates, scores, counts, ratings, stable numeric facts | Useful for scanability but also used for many uppercase metadata labels |

The token scale defines only `0.75`, `0.875`, `1`, `1.25`, and `2rem`.
Operational CSS adds large `clamp()` titles up to `4.75rem`, score values up to
`4.25rem`, and an undefined extra-small tier. `components.css` alone contains
102 distinct literal `rem`/`px` sizes.

Current positive behavior:

- numeric scores, dates, ratings, and counters scan quickly in monospace;
- body text uses a familiar UI face with comfortable default rendering;
- display serif gives the app entry a restrained retro identity;
- letter spacing remains zero as required by project rules.

Current hierarchy problems:

- the same large serif H1 pattern is used for Dashboard, preparation, and
  Matchday even though these are dense operational tools;
- `line-height: 0.96` on page titles treats headings as poster typography and
  increases clipping/density risk at zoom;
- uppercase UI and monospace metadata accumulate around the match centre,
  making football decisions read like diagnostics;
- labels at intended extra-small size silently inherit 16px because the token
  does not exist;
- values sometimes become display elements while their decision relevance is
  low (`100%`, roster count, unknown context).

### Required Typography Contract

1. Display serif is for product identity and one rare editorial result moment,
   not every operational H1.
2. Operational screen titles use the UI family at a bounded size that keeps the
   first task in the first viewport.
3. Monospace is limited to values whose fixed-width rhythm improves comparison:
   score, minute, date, rating, money, count, and compact formation.
4. Metadata labels use the UI family; uppercase is reserved for short section
   labels, never explanatory copy.
5. Every used type tier must exist as a named token with a defined line height.
6. Text zoom must not depend on `line-height` below 1 for functional content.

## Spacing, Shape, Border, And Layering Audit

### Current Foundations

- Spacing tokens form a sensible 4, 8, 12, 16, 24, 32px progression.
- Radius tokens are restrained at 3px and 6px.
- Pill radius is mostly limited to badges, counters, and player tokens.
- One panel shadow and one inset highlight are defined.
- Borders have thin and strong semantic variants.

These foundations fit the requested modern Football Manager structure with a
restrained retro skin.

### Current Drift

`layout.css` contains 35 distinct literal size values and `components.css`
contains 102. Local `0.35rem`, `0.45rem`, `0.65rem`, `1.1rem`, custom minimums,
and one-off grid tracks are often justified by component geometry, but there is
no documented distinction between geometry exceptions and spacing drift.

More importantly, framing is applied at too many nested levels:

1. app/shell panel;
2. feature screen panel;
3. grouped command/elevated panel;
4. individual card;
5. row or fact cell;
6. inset highlight and border on most of those levels.

The screenshots show the result as a grid of bordered navy rectangles. This
weakens the tactical board, Posta workspace, and score frame because everything
appears equally contained and equally important.

### Required Surface Contract

| Tier | Meaning | Allowed treatment |
| --- | --- | --- |
| Canvas | Product environment | Background texture only; never a card |
| Shell | Persistent club navigation/context | One stable surface and one boundary |
| Workspace | Current screen/task | Unframed within main where possible; one boundary only when needed |
| Decision surface | Current fixture, message, tactical decision, score | Deliberate elevation/accent; maximum one per viewport |
| Supporting group | Related facts or controls | Spacing/divider first; muted surface only when grouping is unclear |
| Data row | Repeated comparable information | Row surface, selected/current state, no panel shadow |

No page section should become a card merely to create separation. Nested cards
are prohibited unless the inner items are genuinely repeated selectable items.

## Component Language Audit

### Cross-Screen State Comparison

| Component/state | Screenshot evidence | Current result |
| --- | --- | --- |
| Primary action, normal/hover/focus | Step04 `01`, `02`, `03` | Gold remains readable and focus ring is visible; strongest current contract |
| Current vs disabled navigation | Step04 `04` | Current gold is clear, but eight disabled future rows retain full control geometry and dominate the sidebar |
| Selected/unread/filter states | Step04 `05` | Selected row, unread marker, severity edge, and pressed filter are distinguishable; all rely on several simultaneous treatments |
| Disabled confirmation | Step04 `06`; computed style JSON | Gold gradient remains while the whole button drops to `0.58` opacity; it can look faded/loading rather than unavailable |
| Enabled confirmation and selected plan | Step04 `07` | Primary command is clear, tactical board carries football identity, surrounding control/card density remains high |
| Matchday command/progress | Step04 `08` | Score and command are legible; phase rail inherits 16px and reads closer to a segmented control than a passive indicator |
| Pending command | Phase72 screenshots | Spinner, pending label, `aria-busy`, and preserved geometry communicate work rather than freeze |
| Dialog | Phase72 desktop journey | Native dialog hierarchy and focused Cancel are directionally correct; all actions still use full-width generic button treatment |

### Buttons And Commands

The shared `.tls-menu-button` and primary modifier are a good foundation.
However, navigation items, Dashboard actions, preparation tabs/filters, Inbox
filters, message rows, tactical tokens, and context-menu items each define
their own interactive visual rules.

Required contract:

- one filled primary command per decision surface;
- secondary text command for reversible navigation;
- compact icon button only for a familiar tool action where text would add
  noise, always with an accessible name and tooltip when meaning is not obvious;
- no full-width rectangle for static navigation availability;
- disabled state changes fill/border/cursor and includes a nearby reason when
  the user must resolve it;
- pending state preserves button size, replaces label with verb-progress, and
  does not resemble disabled idle state;
- destructive action uses red only in confirmation context, not as the default
  button family.

### Navigation And Phase Indicators

Live navigation currently works as vertical rectangular rows. Disabled future
destinations preserve almost the same size and chrome as available sections.
Matchday phases are correctly non-interactive in markup, but the missing type
token and five equal boxes/bars make them look actionable.

Required contract:

- active destination, available destination, future destination, and current
  process phase must have visibly different shapes or density;
- passive progress must never borrow button affordance;
- on narrow screens, navigation collapses or moves behind one familiar control
  so active task content is not displaced;
- Posta attention remains visible without duplicating the active Posta screen.

### Tables, Lists, Rows, And Selectable Items

The row palette and selected-row token are strong foundations. Preparation and
Posta already use row-oriented structures rather than cards for repeated data.

Required contract:

- use tables only for comparison across stable columns;
- use list rows for messages/events and card-like rows only at narrow widths;
- selection uses one selected surface plus one non-color cue, not gold text,
  border, inset line, and badge simultaneously unless severity also changes;
- hover may preview interactivity but cannot be the only signal;
- row height is stable and horizontal scrolling is not used for manager-critical
  columns at the supported narrow width;
- sortable headings, filter segments, and status markers need one shared
  grammar instead of per-feature recreations.

### Alerts, Status, Loading, And Recovery

Positive:

- red is consistently associated with blockers/recovery;
- green is used for positive readiness and suitability;
- pending commands include a spinner and label;
- reduced-motion styles remove spinner/date animation.

Problems:

- blocker panels, red inset edges, red borders, red text lists, and status badges
  create several alert variants without a documented severity contract;
- disabled and pending can both be represented by an unavailable button,
  depending on whether the spinner is present;
- storage recovery references an undefined background token;
- success/readiness can be repeated across board status, summary metrics,
  Posta, and action enablement instead of one owning surface.

Required contract:

| State | Visual rule | Content rule |
| --- | --- | --- |
| Blocking | Red edge/icon plus plain-language title | Explain the exact next resolution; never rely on red alone |
| Important | Gold marker, not a full alert panel by default | Explain why Continue stopped |
| Informational | Muted blue/neutral marker | No false command |
| Success/ready | Green check/status near the committed object | Do not repeat in every summary |
| Pending | Spinner/progress verb and locked conflicting controls | Preserve current context |
| Error/recovery | Alert role, recovery action, retained work where possible | State what failed and what is safe |

### Icons And Tooltips

The current interface uses very few shared icons. Some status glyphs are drawn
with CSS, while most commands and navigation rely on text. Text is appropriate
for major commands such as Continue, Start match, and Confirm team. A future
icon pass must not replace clear commands with unfamiliar symbols.

The missing contract is bounded:

- one icon source for status and familiar utility actions;
- icon-only controls only when the symbol is conventional;
- tooltip plus accessible name for unfamiliar icon controls;
- no decorative icon beside every heading;
- football event icons may support, never replace, goal/card/injury text.

No icon library is added in this audit.

## Findings

### VIS-01 - Operational hierarchy is flattened by oversized titles and repeated framing

Severity: **P1**  
Owners: `apps/web/src/styles/layout.css`, `components.css`, shell and feature screens

Reproduction:

1. Open Dashboard, preparation, Posta, and Matchday at 1440 x 960 and 390 x 844.
2. Compare the page title, persistent shell, decision surface, supporting facts,
   and primary command.
3. Count the bordered/elevated layers before the football object or decision.

Observed:

- operational H1s use identity-scale serif typography;
- most sections receive a border, radius, inset highlight, and often a shadow;
- future navigation retains the footprint of active controls;
- at narrow width the visual chrome materially delays the active task, as
  measured in Step 03.

User impact: the eye cannot reliably infer what requires action, what is
supporting information, and what is merely navigation. The product feels like
a collection of styled panels instead of one manager workspace.

Required remediation: adopt the typography and surface-tier contracts in this
audit, then validate each primary state at desktop and narrow widths. This is a
bounded system correction, not a palette rewrite.

### VIS-02 - Undefined visual tokens produce unintended browser fallbacks

Severity: **P2**  
Owner: `apps/web/src/styles/tokens.css`, consumers in `components.css`

`--tls-font-size-xxs`, `--tls-theme-muted-surface`, and
`--tls-color-surface` are used but undefined. Chromium measured a 16px phase
rail label instead of the intended compact label. Define or remove each
semantic role and add a token-contract test.

### VIS-03 - Interactive states are recreated by feature instead of shared by role

Severity: **P2**  
Owner: web shared UI and feature CSS

The product has a shared button base, but navigation rows, Dashboard actions,
preparation tabs/filters, Inbox filters/rows, and context menus implement local
hover/selected/disabled rules. Similar shapes therefore mean different things.
Future remediation should consolidate behavior by semantic role, not by
creating a universal component that ignores domain context.

### VIS-04 - Spacing and component geometry lack an exception policy

Severity: **P2**  
Owner: web presentation layer

The six-step spacing scale is sound, but 102 distinct literal sizes in
`components.css` make drift difficult to distinguish from necessary tactical
geometry. Keep pixel/percentage geometry local to the tactical board; require
named spacing/sizing contracts for reusable product chrome.

### VIS-05 - Typography roles are broader than manager comprehension needs

Severity: **P2**  
Owner: web presentation layer

Display serif, UI, and monospace are all valid, but they are applied to too many
metadata and operational title roles. Tighten usage according to the typography
contract and test 200% text zoom before changing font families.

### VIS-06 - Semantic color and attention treatments have local variants

Severity: **P2**  
Owner: tokens and feature CSS

Suitability includes hardcoded intermediate greens/orange; alert borders use
several hardcoded rgba values; pitch/bench visuals correctly own deliberate
football colors. Move product status colors to semantic tokens while preserving
board-specific colors as documented exceptions.

### VIS-07 - Passive progress and disabled navigation retain button affordance

Severity: **P2**  
Owner: shell and Matchday component language

The phase rail is not clickable and future nav is correctly non-interactive in
markup, but both preserve repeated control-like geometry. Reduce passive state
chrome and keep interaction affordance for actual controls.

### VIS-08 - Legacy visual families remain an architecture signal

Severity: **maintenance signal for Step 06**, not yet a product priority  
Owner: web CSS architecture

An exact string scan found 43 `.tls-*` classes with no reference in production
TSX, including the old `.tls-career-shell-*`, Dashboard Inbox/action families,
and legacy Matchday blocks. Tests/specs still mention some historical classes.
Step 06 must prove ownership and removal safety before classifying or deleting
them. This audit does not treat line count alone as a defect.

## Minimum Premium Component Baseline

The next implementation phase must be able to test all of the following:

1. One fixed visual skin remains the default and only current skin.
2. Every used custom property is defined or intentionally provided at runtime.
3. One current task receives the strongest visual emphasis per viewport.
4. Operational H1s do not displace the task; display serif is bounded.
5. Canvas, shell, workspace, decision, supporting group, and data row have
   distinct documented roles.
6. Page sections are not automatically cards and cards are not nested.
7. Primary, secondary, destructive, disabled, and pending commands are visually
   distinct and keyboard-visible.
8. Active navigation, future navigation, selection, passive process progress,
   and attention are not represented by the same rectangle.
9. Tables/list rows share selected, hover, focus, disabled, and unavailable
   contracts.
10. Blocking, important, informational, ready, pending, and recovery states use
    non-color cues and one owning surface.
11. Spacing tokens cover product chrome; tactical geometry remains an explicit
    exception.
12. Motion has a purpose, a bounded duration, and a reduced-motion equivalent.
13. Icons support comprehension and are never added as decoration.
14. Desktop, wide, narrow, 200% text zoom, keyboard, and loading screenshots
    are reviewed before visual remediation closes.

## Tactical Board Preservation Boundary

Preserve:

- `campo-calcio.svg` content, colors, and pitch markings;
- normalized board geometry and slot/player separation;
- player-token number, surname, role, form, and suitability semantics;
- drag-zone, context-menu, long-press, bench, and candidate ordering behavior;
- board and bench as the football-specific interaction anchor.

May be improved only at the integration boundary:

- space and hierarchy around the board;
- duplicated headings/current-shape summaries outside the board;
- surrounding toolbar, validation, and candidate-panel component language;
- responsive ordering so the board reaches the first useful viewport;
- shared focus, menu, tooltip, and status contracts when behavior is preserved.

The board must not be visually restyled to match generic cards.

## Step 05 Handoff

Step 05 must validate rather than assume:

- core and semantic contrast at WCAG 2.2 AA;
- disabled-primary distinguishability without relying on opacity alone;
- focus visibility and route-change focus;
- passive Matchday phase semantics after the undefined token fallback;
- all primary journeys at 1440 x 900, 1920 x 1080, and 390 x 844;
- 200% text zoom, including display headings and Inbox detail actions;
- reduced-motion behavior for spinner and calendar transition;
- pointer/touch target size and tactical menu dismissal;
- whether shell displacement and repeated framing create keyboard/zoom failures
  in addition to visual hierarchy defects.

No Step 05 scope change is required.
