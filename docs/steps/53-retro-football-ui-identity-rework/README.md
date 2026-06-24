# Phase 53 - Retro Football UI Identity Rework

## Goal

Rework the current web UI so it feels like a serious football management game:
Championship Manager / Scudetto inspired, retro-premium, dense, readable, and
modern where accessibility and clarity require it.

This phase is a visual and UX rework of the existing shell, dashboard, Inbox,
and match-preparation slice. It must not add unrelated career systems.

The UI should move away from a generic dashboard/SaaS feeling and toward a
football club control room:

- top navigation as the career map;
- left Inbox/Posta as a true decision rail;
- central content as the active operational section;
- dashboard as club control room;
- match preparation as a football-first screen with a vertical tactical pitch
  and compact squad list.

## Product Intent

The player should immediately feel:

- this is a football management game;
- the club context matters;
- match preparation is a tactical decision, not a form;
- Inbox/Posta is where the career stops and asks for decisions;
- the interface is dense enough for long sessions but clear enough to trust.

## Confirmed Direction

- Style: Championship Manager / Scudetto retro, with modern detail.
- Tone: club control room, not landing page and not SaaS dashboard.
- Density: high-density, controlled, built for repeated use.
- Main football cue: vertical realistic tactical pitch / lavagna.
- Match preparation: hybrid layout with pitch center and compact squad list
  laterally.
- Squad list row shape:
  - name;
  - role;
  - age;
  - fitness/condition;
  - foot;
  - status.
- Player attributes: detail panel on selection/click, not always visible in the
  list.
- Icons: minimal and functional only.
- Football graphics: present but restrained:
  - pitch lines;
  - club identity accents;
  - badge/crest placeholder treatment where useful;
  - tactical-board details;
  - no decorative clutter.

## Scope

Allowed:

- visual direction audit;
- CSS token/theme rework;
- shell/topbar/navigation visual rework;
- Inbox/Posta rail visual rework;
- dashboard control-room rework;
- match-preparation layout rework;
- vertical pitch component for selected lineup;
- compact squad list and selected-player detail panel for preparation;
- minimal functional icons where they improve recognition;
- updated visual QA and screenshots.

Not allowed:

- no new gameplay engine behavior;
- no full Inbox decision center;
- no real squad screen;
- no full tactics editor;
- no transfer/market/finance/youth/staff/archive UI;
- no match simulation or matchday playback;
- no browser save persistence;
- no automatic best XI;
- no hidden recommendations;
- no UI-only data that cannot later map to real career state;
- no hardcoded visible labels.

## Required Section Completion Review

Before closing the phase, document:

- dependency review;
- code quality review;
- architecture review;
- UI/UX review;
- accessibility review;
- football identity review;
- fun/agency review;
- improvement decision.

If the UI still does not feel like a football management game, improve it inside
this phase instead of moving on.

## Ordered Steps

1. `01-current-ui-audit-and-identity-scope.md`
2. `02-theme-tokens-and-retro-football-design-system.md`
3. `03-shell-topbar-and-navigation-rework.md`
4. `04-inbox-rail-football-decision-rework.md`
5. `05-dashboard-club-control-room-rework.md`
6. `06-match-preparation-pitch-and-squad-layout.md`
7. `07-responsive-accessibility-and-visual-qa.md`
8. `08-phase-report-and-next-phase-decision.md`

## Phase-Level Checks

- Focused tests for every touched app module.
- `pnpm --filter @game/web run typecheck` when web code changes.
- `pnpm --filter @game/web run test` when web tests exist.
- `pnpm --filter @game/web run build` when web code changes.
- `pnpm --filter @game/i18n run typecheck` if labels change.
- Focused i18n tests if labels change.
- `pnpm depcruise`
- `pnpm check`
- Playwright screenshot QA for desktop and narrow viewport.
- Keyboard/focus notes in the phase audit.
- `git diff --check`

## Definition Of Done

- The web UI no longer reads as a generic dashboard.
- Shell/dashboard/Posta/preparation share one coherent retro-football identity.
- Match preparation has a vertical football pitch and compact squad list.
- The user can still complete the Phase 52 preparation journey.
- Critical blockers remain visible early.
- Inbox/Posta feels like a real decision rail, not a decorative box.
- Desktop and narrow screenshots show no blank pages, overlap, clipped labels,
  or broken navigation.
- Accessibility remains at the WCAG 2.2 AA working target for this slice.
- The final report recommends exactly one next phase.
