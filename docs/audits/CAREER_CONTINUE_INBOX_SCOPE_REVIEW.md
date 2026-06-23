# Career Continue And Inbox Scope Review

Date: 2026-06-23
Phase: `50-career-continue-and-inbox-foundation`
Step: `01-phase-49-output-and-continue-loop-scope`
Status: Complete

## Phase 49 Baseline

Phase 49 delivered a buildable web shell with:

- localized main menu;
- language and currency preferences;
- in-memory demo career creation;
- deterministic career dashboard view;
- dashboard blockers for missing saved lineup and missing saved tactic;
- no browser save persistence;
- no match preparation screens;
- no fixture advancement from the web.

The dashboard is a good first screen, but it is still static. The next useful
behavior is not another standalone screen: it is the career heartbeat.

## Product Decision

Phase 50 should implement a Football Manager style `Continue` loop.

The manager presses `Continue`; the career advances only until the next event
that requires attention. When the career stops, the reason must be visible in
the Inbox / Posta as structured data rendered by the UI.

This preserves manager agency:

- no hidden lineup choices;
- no automatic tactic choices;
- no skipped matchday;
- no market or contract decisions resolved in the background.

## Implemented In This Phase

Only these stop categories are implemented in Phase 50:

- `match_preparation_required`;
- `matchday_reached`.

The first web demo may stop immediately if the current dashboard already has
missing preparation blockers. That is acceptable and useful: the user sees why
the game refuses to move forward.

## Documented For Future Systems

These categories are product-valid but should remain future work until their
systems exist:

- transfer offer received for a user player;
- response to a user transfer offer;
- player contract negotiation required;
- incoming contract response;
- player request or unhappiness;
- injury or suspension that invalidates preparation;
- youth academy decision;
- player aging out of youth academy;
- board objective decision;
- finance warning requiring action;
- staff report requiring a choice;
- season rollover decision;
- registration or squad-list deadline;
- important competition draw or calendar event.

Future phases may add these as generated events only after the underlying
career system exists. Phase 50 may define extension-safe keys, but it must not
generate dead future messages.

## Explicitly Out Of Scope

Phase 50 does not implement:

- match preparation UI;
- lineup editor;
- tactic editor;
- match viewer;
- fixture playback;
- market simulation;
- contracts and wages;
- youth decisions;
- finance/economics;
- staff reports;
- full Inbox route;
- persistence of Inbox messages.

## Package Boundary Direction

Expected package ownership:

- `@game/domain` owns language-agnostic Inbox and attention contracts.
- `@game/engine` owns deterministic continue-until-attention logic.
- `@game/ui` owns framework-free Inbox read models.
- `apps/web` owns React rendering and demo adapter wiring.
- `@game/i18n` owns all visible labels.

No layer should parse CLI output or store rendered prose as game state.

## Next Step

Proceed to `02-inbox-domain-contract.md`.
