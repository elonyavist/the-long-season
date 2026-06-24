# Web Tactics Workspace Scope

Date: 2026-06-23
Phase: `54-tactics-and-match-preparation-workspace-completion`
Step: `01-phase-53-output-and-workspace-scope`

## Result

Phase 54 should proceed before Inbox/Posta Decision Center.

The current web career loop already proves the user can open match preparation,
select a basic lineup and tactic, save, and then continue. Phase 53 improved the
visual identity and extracted reusable tactical components, but the core
football decision is still incomplete:

- formation cannot be changed;
- substitutes are not selectable;
- save readiness does not include a bench;
- the pitch is not yet driven by a formation catalog;
- Inbox/Posta would route to an unfinished decision screen if implemented next.

## Evidence Reviewed

- `docs/audits/WEB_MATCH_PREPARATION_SLICE_REPORT.md`
- `docs/audits/WEB_RETRO_FOOTBALL_UI_IDENTITY_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## Current Problems

### Formation Is Fixed

The current match-preparation UI exposes tactical slots, but the manager cannot
change module. This is not enough for a football-management tactics workspace:
the user expects to choose recognizable formations such as `4-4-2`, `4-3-3`,
`3-5-2`, and `4-2-3-1`.

### Bench Is Missing

The current preparation flow only validates the starting XI and tactic. A real
matchday preparation needs substitutes because squad rotation, fatigue, and
matchday options are core manager decisions.

### Components Were Extracted But Not Yet Proven Across Formation Shapes

`TacticalPitchLineup`, `SquadSelectionTable`, and `PlayerFactPanel` now exist,
but Phase 54 must prove they handle multiple formations and bench workflow
without pushing tactical logic back into `CareerMatchPreparationScreen`.

### Inbox/Posta Depends On A Strong Target Screen

Inbox/Posta should become the place where the career stops and asks for
decisions. It should not link to a tactical decision screen that still lacks
formation switching and reserves.

## Adopted Scope

Phase 54 should implement a complete tactical preparation workspace with:

- formation catalog;
- selected formation;
- formation-specific pitch slots;
- manual starting XI selection;
- manual 8-player substitute bench selection;
- duplicate validation across XI and bench;
- tactic profile selection;
- explicit save readiness;
- dashboard, Inbox/Posta rail, and Continue integration;
- desktop and narrow Playwright screenshot QA.

## Out Of Scope

Phase 54 must not implement:

- drag-and-drop;
- in-match substitutions;
- individual player instructions;
- role training/adaptation;
- automatic best XI;
- automatic bench fill;
- tactic recommendations;
- market/squad-needs advice;
- full Inbox/Posta Decision Center;
- browser save persistence;
- real matchday playback.

## Roadmap Constraint Check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` already places:

1. `Phase 54 - Tactics And Match Preparation Workspace Completion`;
2. `Phase 55 - Inbox/Posta Decision Center`;
3. `Phase 56 - Squad Screen`.

This order is correct because the tactical workspace is the decision target that
Inbox/Posta will later open when preparation blocks career advancement.

## User Experience Target

The workspace should feel like a retro football tactical room:

- football-first, not SaaS;
- dense but readable;
- explicit manager agency;
- no hidden recommendations;
- no buried blockers;
- clear formation, XI, bench, tactic, and save readiness;
- accessible keyboard-first operation.

## Decision

Proceed to Step 02 and extend the `@game/ui` read model before changing web UI.
Formation, XI, bench, tactic, blockers, and save readiness must be structured
data first; React should render those facts, not invent behavior locally.
