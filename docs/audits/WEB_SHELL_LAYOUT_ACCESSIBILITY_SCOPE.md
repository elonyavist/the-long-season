# Web Shell Layout Accessibility Scope

Date: 2026-06-23
Phase: `51-web-layout-shell-navigation-and-accessible-inbox-placement`
Step: `01-phase-50-output-and-layout-accessibility-scope`

## Decision

Phase 51 adopts a Football Manager style browser shell:

- global career navigation at the top;
- Inbox/Posta as a persistent left attention rail;
- selected screen content in the central area;
- Continue as the prominent career heartbeat action.

This replaces the older "News tab only" UI note in `requirements.md`. The new
decision is not to build a full mail/news client now, but to make the manager's
attention queue visible and reachable while the rest of the screen changes.

## Phase 50 Behavior To Preserve

The Phase 50 Continue/InBox foundation must keep working while the layout moves:

- main menu loads;
- New career opens the demo dashboard;
- Continue remains visible from the career dashboard shell;
- Continue delegates to the pure engine `continueCareerUntilAttention` rule;
- missing match preparation creates a structured attention stop;
- the stop remains visible to the user;
- the Inbox/Posta message still exposes a `prepare_match` action;
- no fixture is played automatically;
- no lineup, tactic, market, contract, youth, or economics choice is made for
  the manager.

## Shell Layout Scope

The target desktop shell is:

```text
top navigation
left Inbox/Posta rail | central selected content
```

The top navigation is the stable career map. It may initially contain only the
sections needed for the prototype plus disabled future sections. It should use
structured label keys, not hardcoded visible text.

The left Inbox/Posta rail is the persistent decision surface. It should show
compact priority, unread/action-required counts, and the current attention
messages. It should not become a full news feed in this phase.

The central area owns the selected screen. In this phase the dashboard remains
the only real central screen.

On narrow viewports the rail can stack below the top navigation or collapse
only if the collapsed state is keyboard and screen-reader reachable.

## Accessibility Target

The web UI working target is WCAG 2.2 AA.

Phase 51 should begin enforcing practical accessibility rules:

- keyboard traversal through app entry, top navigation, Continue, Inbox, and
  central content;
- visible focus on all interactive controls;
- focus must not be hidden by sticky or fixed regions;
- semantic landmarks for shell regions (`header`, `nav`, `aside`, `main` where
  appropriate);
- accessible names for navigation, Inbox rail, buttons, selects, and action
  groups;
- current navigation state exposed with `aria-current` or an equivalent
  semantic indicator;
- disabled controls must expose disabled state and visible reason where useful;
- state and urgency must not rely only on color;
- hit targets should be comfortable for desktop pointer use and not smaller
  than the WCAG 2.2 AA target-size expectation where practical;
- desktop and narrow viewport screenshots must be checked for clipped text,
  overlap, blank pages, hidden focus, and broken navigation.

Automated tests are necessary but insufficient. The phase must include
Playwright screenshot QA and a manual keyboard-flow note.

## Product Rationale

The user should feel the career loop as:

1. choose where to go from the top navigation;
2. read what needs attention from the left rail;
3. act in the central screen;
4. press Continue when ready.

This keeps the manager in control and avoids hidden automation. The Inbox/Posta
is useful because it stops the user from missing decisions; it is not a random
flavor-news surface.

## Out Of Scope

Phase 51 must not add:

- match preparation editor;
- lineup editor;
- tactic editor;
- match viewer;
- real browser save persistence;
- market UI;
- contracts, wages, staff, stadium, ticket price, sponsorship, or economics UI;
- youth academy decision UI;
- random news;
- full mail client behavior;
- automatic choices or hidden recommendations.

## Step 02 Implication

The next step should add a small `@game/ui` shell/navigation contract only if it
keeps React from owning layout meaning. The contract should remain dependency
free and label-key based.
