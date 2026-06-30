# Phase 68 - MVP UX Language Reset Around Tactical Board

## Goal

Reset the first MVP web UX language before adding persistence or new sections.

Phase 67 proved that the flow can be technically simplified, but the product
experience is still not acceptable. The current UI still feels too much like a
debug/dashboard surface in several areas. This phase must define and implement
a stronger football-manager UX language for the first MVP.

## Approved visual anchor

The tactical board shown by the user after Phase 67 is the approved visual
anchor for the next UX direction.

Preserve:

- vertical football pitch proportions;
- green tactical-board pitch tone and line treatment;
- circular empty/player slot grammar;
- current-shape placement near the board;
- restrained navy surrounding surface when it supports the board;
- board-first tactical hierarchy.

Do not preserve blindly:

- current shell chrome;
- current dashboard layout;
- current Inbox/Posta layout;
- current matchday result/log layout;
- current button hierarchy;
- current table/panel visual language;
- current preparation screen chrome around the board.

The rest of the MVP must be redesigned around the tactical board quality, not
the other way around.

## Product intent

The first MVP should feel like a compact, serious, retro-premium football
manager:

- dense but not cluttered;
- operational, not SaaS;
- football-first, not generic dashboard;
- fast to act, but rich enough to inspect;
- table-heavy only where tables help decision-making;
- matchday as emotional payoff, not a report dump;
- Inbox/Posta as manager attention, not a decorative feed.

## Architecture intent

This phase may touch web presentation and UI read models, but it must not alter
engine outcomes, introduce persistence, or add new gameplay systems.

Ownership:

- `docs/audits` records the UX failure analysis, approved target, and visual QA;
- `docs/design` may hold the MVP UX language guide and static direction notes;
- `packages/ui` owns any changed read-model surface needed to simplify screen
  hierarchy;
- `apps/web` owns React layout, shared components, visual system, routing
  presentation, and Playwright screenshots;
- `packages/i18n` owns any new visible labels;
- `packages/engine` and `packages/domain` should not change unless a step
  explicitly discovers a structured fact is missing and documents why.

## Binding constraints

- Read `docs/PROJECT_RULES.md`, `docs/ARCHITECTURE.md`,
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`, and
  `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` before each step.
- Check and update `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` on every step.
- Use `nvm use 24` before package commands.
- Use Playwright for desktop and narrow screenshot QA once browser-rendered
  screens exist.
- Preserve the approved tactical board visual grammar unless a step explicitly
  proves a small surrounding integration change is necessary.
- Keep all visible labels localized in Italian, English, German, Spanish, and
  French.
- Keep engine/domain output structured; no rendered prose from engine/domain.
- Keep Zustand as adapter state, not a gameplay engine or UI rule source.
- Do not ship another screen that looks like a debug table or generic SaaS
  dashboard.

## What NOT to implement

- No web persistence/localStorage/save adapter.
- No market, finances, youth, staff, archive, facilities, or squad-section
  feature expansion.
- No new match engine behavior.
- No balance tuning.
- No team talks.
- No opponent tactical board.
- No live replay.
- No runtime LLM.
- No new design palette explosion.
- No new tactical-board replacement.
- No decorative controls that do not map to useful manager actions.

## Ordered steps

1. [01-current-mvp-ux-failure-audit-and-board-anchor-lock.md](01-current-mvp-ux-failure-audit-and-board-anchor-lock.md)
2. [02-mvp-ux-language-principles-and-screen-hierarchy.md](02-mvp-ux-language-principles-and-screen-hierarchy.md)
3. [03-first-mvp-information-architecture-and-manager-flow.md](03-first-mvp-information-architecture-and-manager-flow.md)
4. [04-static-screen-direction-and-approval-gate.md](04-static-screen-direction-and-approval-gate.md)
5. [05-shared-web-layout-and-component-language-rework.md](05-shared-web-layout-and-component-language-rework.md)
6. [06-dashboard-and-inbox-command-centre-rework.md](06-dashboard-and-inbox-command-centre-rework.md)
7. [07-match-preparation-shell-around-approved-board.md](07-match-preparation-shell-around-approved-board.md)
8. [08-matchday-centre-ux-rework.md](08-matchday-centre-ux-rework.md)
9. [09-visual-qa-accessibility-and-phase-report.md](09-visual-qa-accessibility-and-phase-report.md)

## Phase-level checks

Run these at the end of the phase unless a step explicitly blocks earlier:

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm check
git diff --check
```

If code changes are made, also run:

```bash
graphify update .
```

Browser-rendered final screens must also pass a dedicated Playwright visual QA
script for desktop and narrow viewports.

## Definition of Done

- The current MVP UX failure is documented honestly.
- The tactical board is locked as approved visual anchor.
- The first MVP information architecture is explicit.
- The target UX language has a written guide that a junior developer can follow.
- Static screen direction is reviewed before app-wide rework starts.
- Dashboard, Inbox/Posta, match preparation, and matchday no longer feel like
  debug tables or generic SaaS dashboards.
- The tactical board remains visually stable and stronger surrounding chrome
  supports it.
- Primary actions are clearer and fewer.
- Accessibility remains WCAG 2.2 AA target.
- Playwright screenshots prove desktop/narrow layouts are not broken.
- Final report states whether persistence can resume or another UX pass is
  still required.
