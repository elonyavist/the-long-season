# Web Visual Identity Target

Date: 2026-06-24
Phase: `61-web-visual-identity-system-rework`
Status: Target locked for implementation

## Visual Goal

The web UI must feel like a serious retro-premium football management game,
not a generic dashboard with football labels. The target is a dense club
operations interface inspired by Championship Manager / Scudetto and modern
Football Manager skins: readable tables, strong hierarchy, compact action
areas, restrained accents, and surfaces that feel like a manager's office,
match programme, press room, or floodlit control room.

The priority is user experience and football-manager mood. Contrast and layout
checks are necessary, but they are not enough if the result still looks
amateurish.

## Approved Genre References

- Championship Manager / Scudetto style density: tabular, menu-driven, low
  decoration, fast to scan.
- Modern Football Manager skins: complete visual systems with consistent dark
  and light surfaces, not isolated color swaps.
- Club office material language: ink, paper, ruled borders, low-glare panels,
  restrained gold for priority actions.
- Matchday operations language: clear blockers, fixture context, selection
  state, and primary continue/preparation actions.

## Rejected Visual Patterns

- Palette variants that exist only to reach a high count.
- Purple, teal, pastel, or soft sage palettes without a strong football
  management reason.
- Light skins that reuse dark-theme component assumptions.
- Neon accents, washed-out gold, decorative gradients, blobs, or marketing
  hero styling.
- Table headers that look detached from their cards.
- Critical blockers hidden in low-priority panels or treated as decoration.
- Any theme that recolors the tactical field or weakens pitch readability.

## Target Skin List

The accepted skin set is intentionally small:

1. `floodlight-navy`
   Night-match navy/ink skin with crisp ivory, controlled gold, and strong table
   contrast. This is the default.
2. `club-office`
   Muted green-grey office skin with low glare and selected/action accents only
   where the manager needs them.
3. `press-room`
   Charcoal/slate skin for dashboard/news/inbox-heavy screens, with sober
   contrast and minimal accent usage.

## Current Palette Decisions

Current Phase 60 ids are not production names. They should be migrated or
removed as compatibility inputs:

- `classic-manager-dark` and `classic-green` -> `club-office`
- `nocturne-navy` and `dugout-navy` -> `floodlight-navy`
- `azzurri-office` and `clubhouse-sage` -> `club-office`
- `heritage-cream`, `programme-paper`, and `programme-ivory` -> `club-office`
- `violet-director` -> `press-room`
- `touchline-stone` and `archive-sepia` -> `press-room`

No old id should remain visible in the settings UI after this phase.

## Skin Token Contract

The public skin contract is owned by `apps/web/src/app/theme-palettes.ts`.
Skins may control only UI chrome:

- app background;
- shell surface;
- panel surface;
- elevated panel surface;
- table header surface;
- table row surface;
- table alternate row surface;
- selected row surface;
- border;
- strong border;
- text;
- muted text;
- heading text;
- primary action surface;
- primary action hover;
- primary action text;
- secondary action surface;
- focus ring;
- shell overlay.

Old broad CSS names such as `scoreboard`, `raised`, `line`, `accent`, and
`button` may remain as compatibility aliases only while existing components
are migrated. They are not the public skin taxonomy.

## Field And SVG Non-Touch Rule

This phase must not change:

- `apps/web/src/assets/campo-calcio.svg`;
- tactical pitch grass and stripe colors;
- tactical pitch markings when they are part of field readability;
- bench mini-field football surface unless a later pitch-art phase owns it;
- role-suitability colors;
- fitness arrows;
- danger, success, and warning semantic colors.

These colors communicate football surface or gameplay state. They are not user
theme chrome.

## Manual Visual Acceptance Criteria

A skin is acceptable only if all of these are true:

- The first viewport reads as a football-management control room, not a SaaS
  dashboard.
- The active navigation and primary action are obvious but not loud.
- Tables have clear header, row, alternate/selected-row, and border hierarchy.
- Muted text is secondary without looking disabled or dirty.
- Light skins feel intentionally designed, not inverted dark skins.
- Blockers and attention states remain visible and serious.
- The tactical field remains stable across skins.
- Desktop and narrow screenshots show no horizontal overflow.
- The screen still feels usable after repeated scanning, not just attractive in
  one screenshot.
