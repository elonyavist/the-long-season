# Web Retro Football UI Identity Scope

Date: 2026-06-23
Phase: `53-retro-football-ui-identity-rework`
Step: `01-current-ui-audit-and-identity-scope`

## Scope

This audit locks the visual direction before changing source code. It reviews
the Phase 52 web UI evidence and the current browser code for the shell,
dashboard, Inbox/Posta rail, and match-preparation screen.

Reviewed evidence:

- `/tmp/the-long-season-phase52/main-menu-desktop.png`
- `/tmp/the-long-season-phase52/dashboard-before-preparation-desktop.png`
- `/tmp/the-long-season-phase52/preparation-empty-desktop.png`
- `/tmp/the-long-season-phase52/preparation-inbox-narrow.png`
- `/tmp/the-long-season-phase52/preparation-saved-desktop.png`
- `/tmp/the-long-season-phase52/dashboard-cleared-narrow.png`
- `/tmp/the-long-season-phase52/dashboard-matchday-desktop.png`
- `apps/web/src/components/CareerShell.tsx`
- `apps/web/src/components/CareerInboxPanel.tsx`
- `apps/web/src/screens/CareerDashboardScreen.tsx`
- `apps/web/src/screens/CareerMatchPreparationScreen.tsx`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Current Problems

The current UI is functional but does not yet feel enough like a football
management game.

### Generic Dashboard Feeling

The dashboard is still built from isolated cards. It communicates facts, but
the composition feels closer to a SaaS status dashboard than to a club control
room. The user can understand blockers, but the page does not yet create the
feeling of running a football club.

Specific issues:

- the top area does not strongly communicate a matchday office or club context;
- dashboard facts are visually similar regardless of decision importance;
- the next fixture and preparation blockers are clear, but not staged as the
  manager's immediate football problem;
- the screen lacks football-specific spatial cues beyond text labels.

### Inbox/Posta Is Present But Not Yet A Decision Rail

The left Inbox/Posta rail is structurally correct, but it still reads like a
compact card list. It needs to feel more like the place where a Football
Manager / Championship Manager career pauses and asks for attention.

Specific issues:

- message rows need stronger hierarchy, priority, and action treatment;
- action-required state must be visible by shape, labels, and placement, not
  color alone;
- the rail should look like a persistent decision surface, not a dashboard
  widget.

### Match Preparation Feels Like Form Filling

The current match-preparation screen correctly lets the user pick lineup slots
and a tactic, but the interaction feels like a web form. It does not yet feel
like preparing a football team.

Specific issues:

- there is no vertical pitch / lavagna view;
- lineup slots are cards, not a recognizable tactical shape;
- the squad choice is hidden inside each slot select instead of being a compact
  squad list the manager scans;
- there is no selected-player detail area for role, age, fitness, foot, status,
  and later attributes;
- tactic profiles sit below the lineup rather than feeling part of the match
  preparation room.

### Visual Identity Is Too Soft

The existing dark green/gold palette is a useful starting point, but the UI
needs a sharper retro-football identity. It should feel like Championship
Manager / Scudetto with modern accessibility and density, not like a generic
dark admin panel.

Specific issues:

- surfaces are too card-heavy;
- panels do not yet resemble scoreboards, club-office documents, tactical
  boards, or fixture rooms;
- typography is readable but not yet characterful enough for the product;
- football cues are mostly textual and should become structural.

## Adopted Direction

The phase adopts a Championship Manager / Scudetto-inspired direction with
modern usability.

Key principles:

- retro football management, not modern Football Manager gloss;
- club control room, not landing page and not SaaS dashboard;
- dense, scan-friendly, desktop-first composition;
- strong top navigation and Continue as the career heartbeat;
- persistent left Inbox/Posta rail as the attention surface;
- central content as the selected operational section;
- vertical tactical pitch / lavagna as the main match-preparation cue;
- compact squad list beside the pitch;
- selected-player detail panel for deeper inspection;
- minimal functional icons only where they help recognition;
- restrained football graphics: pitch lines, tactical-board marks, club accent
  strips, badge/crest placeholder treatment when useful.

## Functional Behavior To Preserve

Phase 53 must preserve the complete Phase 52 journey:

- main menu starts a demo career;
- dashboard renders selected club, save context, next fixture, preparation
  state, condition, table context, recent match, actions, and blockers;
- Continue can create attention stops;
- Inbox/Posta action can open match preparation;
- dashboard action can open match preparation;
- the user can choose players manually;
- the user can choose a tactic manually;
- Save preparation is disabled until the lineup and tactic are valid;
- saving preparation clears the missing-lineup and missing-tactic blockers;
- dashboard and Inbox/Posta reflect the cleared preparation state;
- no browser save persistence is introduced;
- no automatic best XI, hidden tactic recommendation, or automatic manager
  decision is introduced.

## Phase Boundaries

Allowed in this phase:

- CSS token and visual system rework;
- shell/topbar/navigation visual rework;
- Inbox/Posta rail visual rework;
- dashboard layout and visual hierarchy rework;
- match-preparation layout rework;
- vertical pitch component inside the current web slice;
- compact squad-list presentation inside match preparation;
- selected-player detail presentation based on available web/demo facts;
- localized labels for any new visible text;
- Playwright screenshots and keyboard/accessibility notes.

Not allowed in this phase:

- no new gameplay engine behavior;
- no full Inbox/Posta decision center;
- no real squad screen;
- no full tactics editor;
- no market, finance, youth, staff, archive, structures, or calendar section;
- no matchday playback or fixture simulation UI;
- no browser persistence;
- no automatic lineup selection;
- no advice that tells the manager what to do;
- no UI-only data that cannot later map to career state;
- no hardcoded visible labels.

## Roadmap Constraint Check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` says Phase 53 exists because the
current web slice works, but the visual language does not yet feel enough like
football management. This step confirms that constraint: before building the
full Inbox/Posta center, Squad, Tactics, Calendar, or Market sections, the
shared web identity must be corrected so future sections inherit the right
language.

The phase should therefore improve the existing screens rather than add new
sections.

## Step 02 Direction

Step 02 should start from visual foundation, not screen rewrites. The theme
tokens should create a sharper retro-football system:

- darker office base;
- pitch/lavagna green as a tactical surface, not the entire UI;
- warm ivory text and paper lines;
- muted gold for primary action and career heartbeat;
- brick red for blockers and danger;
- stronger table/list rules;
- visible focus treatment that fits the retro style;
- reusable surface classes for scoreboard strips, pitch panels, message rows,
  and compact tables.

This foundation must avoid a one-note green palette and must not make the UI
less accessible.

