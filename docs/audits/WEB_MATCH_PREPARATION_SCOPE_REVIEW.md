# Web Match Preparation Scope Review

Date: 2026-06-23
Phase: `52-web-match-preparation-slice`
Step: `01-phase-51-output-and-preparation-scope`

## Verdict

Phase 52 should start with match preparation.

The current web prototype has a working shell, Continue action, left Inbox/Posta
rail, and central dashboard outlet, but the main career loop stops immediately
because the selected club has no saved lineup and no saved tactic. This is the
right first section to build because it turns the UI from a read-only prototype
into a real manager decision loop.

## Roadmap Constraint Check

The roadmap requires every section to be backed by a decision, not decoration.
Match preparation satisfies that gate:

- **User decision:** choose which players start and which tactic profile is used.
- **Engine/domain state:** selected lineup and tactic setup already exist as
  structured contracts in the domain and are used by career preparation.
- **UI read model:** needed before React implementation so the web screen does
  not invent its own rules.
- **Web adapter:** should be replaceable later by real save persistence.
- **Playwright proof:** must show opening preparation, selecting lineup/tactic,
  saving, clearing blockers, and reaching matchday-ready Continue behavior.
- **Dead-code risk:** high if the phase only renders static controls; low if the
  save flow changes dashboard and Inbox/Posta state.

## Current Phase 51 Baseline

Phase 51 delivered:

- top global navigation;
- left Inbox/Posta rail;
- central selected-content outlet;
- Continue as the career heartbeat;
- WCAG 2.2 AA as working target;
- Playwright shell QA for desktop and narrow viewports.

The shell report explicitly recommends `Phase 52 - Web Match Preparation Slice`
because the shell is ready to host the first real manager decision screen.

## Current Blockers To Resolve

The dashboard currently exposes:

- missing saved lineup;
- missing saved tactic.

The Phase 52 section must let the user resolve both blockers from the web UI.
The result should be visible on the dashboard and through the Continue flow.

## Shell Placement Decision

Match preparation should use all three shell surfaces:

- **Top navigation**
  The active section can be `tactics` or a preparation-specific central state in
  the current shell. Since the shell section list does not yet include
  `preparation`, Phase 52 should avoid adding a permanent top-level section
  unless the view contract proves it is needed. The central outlet can render
  preparation while the dashboard/inbox action is active.
- **Left Inbox/Posta rail**
  Action-required messages should open the preparation screen. The rail remains
  the attention surface, not a full mail client.
- **Central outlet**
  The preparation screen renders here. It should show fixture context, lineup
  slots, tactic choices, blockers, and save state.

## First Useful Section Shape

The section is useful only if it includes:

- next fixture context;
- selected club context;
- selected club condition/readiness summary;
- ordered lineup slots;
- selectable player options per slot;
- duplicate/missing player validation;
- tactic profile choices;
- save-preparation action;
- blocked and saved states;
- dashboard and Inbox/Posta paths into the section;
- dashboard blocker clearing after save;
- Continue behavior that no longer stops on missing preparation after save.

## Out Of Scope

Do not implement:

- drag-and-drop lineup editing;
- automatic best XI;
- hidden tactic recommendation;
- full tactic editor;
- full squad screen;
- market/squad-needs advice;
- match simulation or match playback;
- real browser save persistence;
- localStorage/sessionStorage;
- finances, contracts, youth, staff, archive, or market UI.

## Dependency Notes

Expected dependency direction:

- `@game/ui` owns language-agnostic match-preparation read models.
- `apps/web` owns React rendering, in-memory prototype state, and demo adapter.
- `@game/i18n` owns visible labels.
- Domain/engine contracts can inform the adapter, but React components should
  not duplicate validation rules or engine decisions.

The first code step should start in `@game/ui`, not in React.

## Risks To Avoid

- A static preparation page that does not clear blockers would be dead UI.
- A React-only validation model would be hard to replace with real saves later.
- A "best lineup" shortcut would violate manager agency.
- Burying blockers below dashboard cards would repeat the Phase 51 layout issue.
- Creating a full squad/tactic editor now would expand beyond the current
  section and delay the first playable loop.

## Decision

Proceed to Step 02: add a framework-free match-preparation view contract in
`@game/ui`.
