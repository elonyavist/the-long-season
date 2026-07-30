# Design — The Long Season

A locked design system for the browser career. Every page-level redesign reads
this file before emitting code. Extend this system deliberately; do not create a
different theme for an individual route.

## Genre

Modern-minimal football workbench with a restrained retro club-office identity.
The interface should feel like a serious management tool rather than a generic
dashboard or a decorative game menu.

## Macrostructure Family

- App pages: **Workbench**. A clear page heading leads into one dense primary
  workspace, with compact filters or context controls above it and details
  opened without losing the manager's place.
- Focused inspectors: **Workbench detail**. Identity and the most important
  public facts stay fixed at the top; compact tabs organize attributes,
  statistics, and contract decisions below.
- Content pages: **Long document**, only for reports or explanatory material.
- Marketing pages: not currently part of the product.

Squad and Market are sibling workbenches. They share table density, rating
language, player-detail structure, interaction states, and responsive rules.
Their decisions differ: Squad owns selection and renewal; Market owns
inspection and acquisition.

## Theme

The existing dark teal, chalk, and muted gold identity is canonical. Production
values live in `apps/web/src/styles/tokens.css`; this file documents their
roles and must not create a parallel runtime token set.

- App background: `--tls-theme-app-background` (`#050a0c`)
- Shell and panel surfaces: `--tls-theme-shell-surface`,
  `--tls-theme-panel-surface`, and `--tls-theme-elevated-panel-surface`
- Dense rows: `--tls-theme-table-row-surface` and
  `--tls-theme-table-alternate-row-surface`
- Primary text and headings: `--tls-theme-text` and
  `--tls-theme-heading-text`
- Muted text: `--tls-theme-muted-text`
- Primary action and ordinary stars: `--tls-theme-primary-action-surface`
- Focus: `--tls-theme-focus-ring`
- Elite sixth star: a dedicated dark-orange semantic token, never the danger
  red and never a tactical-suitability token

Gold remains a scarce attention colour. It marks the primary action, focus,
selected control, ordinary rating stars, and small football accents; it should
not wash entire panels.

## Typography

- Display: `--tls-font-display` — self-hosted Rokkitt Variable.
- Body and controls: `--tls-font-ui` — self-hosted Mulish Variable.
- Numeric and compact operational facts: `--tls-font-mono`.
- Page titles use the display face; table labels, menus, tabs, and explanatory
  copy use the UI face; values that benefit from column alignment use mono.
- Avoid all-caps prose. Uppercase may be used only for short data labels with
  restrained tracking.

## Spacing And Shape

- Use the existing four-point scale `--tls-space-1` through `--tls-space-8`.
- Dense tables use 8–12 px internal rhythm; dialogs use 16–24 px section
  rhythm; major page separations use 32–48 px.
- Controls share `--tls-control-height`.
- Corners stay restrained: `--tls-radius-sm` or `--tls-radius-md`; pills are
  reserved for compact status or role chips.
- Dividers and contrast between adjacent teal surfaces create hierarchy before
  shadows do.

## Component Voice

### Tables

- Tables are operational surfaces, not cards repeated per row.
- The row remains scannable at desktop and reflows into labelled facts at
  narrow widths without horizontal page scrolling.
- Squad gives each player one explicit placement select and one `…` action
  menu. Secondary actions do not form an inline button cluster.
- Interactive descendants stop row activation; row keyboard activation runs
  only when the row itself owns focus.

### Player Rating

- Current level and potential use one global, club-independent scale from one
  to six in half-star increments.
- Values through five use ordinary gold stars. `5.5` adds a half-filled
  dark-orange sixth star after five full gold stars; `6` fills it completely.
- The sixth star is a derived presentation of the numeric rating, not a
  separate elite flag, and never uses danger red.
- The accessible name states the complete public rating. Exact hidden
  potential never enters browser output.

### Menus

- Context menus render in the top layer or a body portal so scroll frames cannot
  clip them.
- They support pointer, touch, Escape, outside click, Home/End, arrow keys, and
  deterministic focus restoration.
- Menus close on table scroll, filter/sort changes, resize, and route/dialog
  transitions.

### Tabs

- Player inspectors expose exactly three tabs:
  `Attributi`, `Statistiche`, and `Contratto` in Squad;
  `Attributi`, `Statistiche`, and `Contratto e offerta` in Market.
- Tabs follow the WAI-ARIA tabs pattern and retain mounted form panels so an
  unfinished renewal or offer draft is not discarded by navigation.
- Changing player resets the selected tab to `Attributi`.

### Player Roles And Attributes

- Detail headers show only natural and adapted roles. Weak/red roles are not
  useful identity facts and remain available only where a tactical assignment
  genuinely permits a makeshift choice.
- Role facts are compact chips with a short role code, localized full name, and
  suitability colour; they do not become a grid of large cards.
- Outfield players show technical, mental, and physical attributes.
- Goalkeepers show goalkeeping, mental, and physical attributes.
- Market shows exact current attributes with one digit after the decimal
  separator for now. Potential remains public stars; no decorative scouting
  fog is introduced without a real knowledge model.

### Player Statistics

- Current season and career totals are distinct, plainly labelled blocks.
- Appearances and average rating are derived from canonical totals; a weighted
  career rating uses total rating samples rather than averaging averages.
- Missing or partial source coverage is stated as such and never rendered as a
  truthful zero.
- Only supported facts appear: starts, substitute appearances, minutes, average
  rating, goals, assists, and saves.

## Motion

- Motion class is `micro` for menu/tab/control feedback and `transition` only
  for the existing full-screen inspector entrance.
- No gameplay, persistence, focus completion, or form state depends on
  animation completion.
- Respect `prefers-reduced-motion`; tab and menu state remains fully legible
  with motion removed.

## Responsive And Accessibility Contract

- Desktop target: 1440 px; narrow target: 390 px; useful 200% text zoom is
  mandatory.
- No horizontal page scroll. A deliberately scrollable table region must remain
  keyboard reachable and may not create a second modal scrollbar.
- Minimum pointer target is 44 px where space permits; dense native selects
  remain at the shared control height.
- Visible focus, semantic table headers, named controls, live command feedback,
  and keyboard parity are required.
- Colour is never the sole carrier of suitability, elite status, selection, or
  coverage.

## Copy Voice

Short, factual, football-specific, and manager-facing. Prefer `Schieramento`,
`Titolare`, `Panchina`, `Non convocato`, `Stagione corrente`, and
`Carriera`. Avoid technical IDs, implementation vocabulary, and motivational
marketing copy.

## What Pages Must Share

- App shell, dark-teal/chalk/gold identity, Rokkitt/Mulish pairing, four-point
  spacing, control height, focus ring, table rhythm, star component, role chips,
  tabs, statistics presentation, and menu behaviour.
- Exact localized labels and deterministic structured facts.

## What Pages May Differ On

- Squad prioritizes selection state, availability, and renewal.
- Market prioritizes employment, eligibility, value, and offer composition.
- Column sets and contextual actions may differ when their manager decisions
  differ; the visual and interaction grammar may not.

## Hallmark Phase 79B Closeout Audit

Audit date: 2026-07-28. Scope: the universal Hallmark subset relevant to the
Squad and Market application workbenches; marketing hero, marketing
navigation/footer, and cross-theme diversification gates are not applicable.

- The shipped macrostructure is the locked Workbench family, not a generic
  card-dashboard or marketing-page sequence. Squad and Market share the system
  without losing their distinct manager decisions.
- The established retro-football palette, Rokkitt/Mulish/mono roles, four-point
  spacing, restrained gold accent, and existing runtime tokens remain intact.
  No per-screen theme or decorative enrichment was introduced.
- Final browser QA passed 29 of 29 scenarios. It covers desktop, 390 px, useful
  200% text, reduced motion, and touch widths 320/375/414/768; clickable tab
  labels stay on one line and horizontal page overflow remains absent.
- Keyboard, touch, focus restoration, menu portal/clamping, tab orientation,
  contrast, non-color semantics, and the single dialog scroll owner are
  asserted rather than inferred from screenshots.
- The Chromium responsive-table overflow defect was corrected with an explicit
  containing block while preserving the intentional internal table scroll.
- Honest-copy and product-boundary checks remain satisfied: no invented
  metrics, fake scouting state, re-drawn chrome, or hidden-potential value was
  added.

No open critical, major, or minor Hallmark finding remains in this bounded
Phase 79B surface audit. The final evidence is recorded in
`docs/audits/SQUAD_MARKET_PLAYER_WORKSPACE_79B_REPORT.md`.

## Exports

The canonical runtime export is
`apps/web/src/styles/tokens.css`. The mappings below make the design portable
without adding duplicate production files.

### tokens.css

```css
:root {
  --color-paper: var(--tls-theme-app-background);
  --color-paper-2: var(--tls-theme-shell-surface);
  --color-paper-3: var(--tls-theme-panel-surface);
  --color-ink: var(--tls-theme-heading-text);
  --color-ink-2: var(--tls-theme-text);
  --color-muted: var(--tls-theme-muted-text);
  --color-rule: var(--tls-theme-border);
  --color-rule-2: var(--tls-theme-strong-border);
  --color-accent: var(--tls-theme-primary-action-surface);
  --color-accent-ink: var(--tls-theme-primary-action-text);
  --color-focus: var(--tls-theme-focus-ring);
  --font-display: var(--tls-font-display);
  --font-body: var(--tls-font-ui);
  --font-outlier: var(--tls-font-mono);
  --space-3xs: var(--tls-space-1);
  --space-2xs: var(--tls-space-2);
  --space-xs: var(--tls-space-3);
  --space-sm: var(--tls-space-4);
  --space-md: var(--tls-space-5);
  --space-lg: var(--tls-space-6);
  --space-xl: var(--tls-space-7);
  --space-2xl: var(--tls-space-8);
  --radius-card: var(--tls-radius-md);
  --radius-input: var(--tls-radius-sm);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: var(--tls-theme-app-background);
  --color-paper-2: var(--tls-theme-shell-surface);
  --color-paper-3: var(--tls-theme-panel-surface);
  --color-ink: var(--tls-theme-heading-text);
  --color-muted: var(--tls-theme-muted-text);
  --color-accent: var(--tls-theme-primary-action-surface);
  --color-focus: var(--tls-theme-focus-ring);
  --font-display: var(--tls-font-display);
  --font-body: var(--tls-font-ui);
  --font-outlier: var(--tls-font-mono);
  --spacing-3xs: var(--tls-space-1);
  --spacing-2xs: var(--tls-space-2);
  --spacing-xs: var(--tls-space-3);
  --spacing-sm: var(--tls-space-4);
  --spacing-md: var(--tls-space-5);
  --spacing-lg: var(--tls-space-6);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "#050a0c", "$type": "color" },
    "paper-2": { "$value": "#0b1519", "$type": "color" },
    "paper-3": { "$value": "#101e24", "$type": "color" },
    "ink": { "$value": "#f4edd9", "$type": "color" },
    "muted": { "$value": "#a9b7b3", "$type": "color" },
    "accent": { "$value": "#d4b253", "$type": "color" },
    "focus": { "$value": "#e1c36d", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Rokkitt Variable, Rockwell, Georgia, serif", "$type": "fontFamily" },
    "body": { "$value": "Mulish Variable, Avenir Next, Segoe UI, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "SFMono-Regular, Consolas, monospace", "$type": "fontFamily" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 19% 0.015 220;
  --foreground: 94% 0.025 88;
  --card: 25% 0.025 220;
  --card-foreground: 94% 0.025 88;
  --popover: 25% 0.025 220;
  --popover-foreground: 94% 0.025 88;
  --primary: 76% 0.115 88;
  --primary-foreground: 20% 0.015 130;
  --secondary: 31% 0.035 220;
  --secondary-foreground: 91% 0.02 88;
  --muted: 34% 0.02 220;
  --muted-foreground: 73% 0.025 170;
  --border: 45% 0.02 100;
  --input: 45% 0.02 100;
  --ring: 82% 0.11 88;
  --radius: 6px;
}
```
