# Matchday Flow Simplification Audit

Date: 2026-06-30
Phase: `67-web-matchday-flow-simplification-and-half-time-tactical-decisions`
Step: `01-current-button-click-and-matchday-flow-audit`

## Purpose

Audit the current web path from dashboard to full time before changing
behavior. The user-facing goal is not to remove clicks for its own sake: the
match should feel like the central football event, with one obvious next action
and no inert controls competing for attention.

## Current Cold Flow

Starting state: new demo career, missing saved lineup and saved tactic.

Current useful path:

1. Dashboard primary action: `Prepare match`.
2. Match preparation helper: `Auto` or manual XI/bench selection.
3. Match preparation tactic card selection.
4. Bottom-page action: `Save preparation`.
5. User remains on match preparation.
6. Shell/global `Continue` or Dashboard button.
7. Dashboard or Continue routing opens matchday.
8. Matchday pre-match action: `Start match`.
9. Half-time substitution panel: optional substitution action.
10. Half-time action: `Second half`.
11. Full-time action: `Dashboard`.

Baseline cold click count for the happy path:

- With `Auto`: 7-8 clicks depending on whether the user uses shell Continue or
  bounces through Dashboard after saving.
- With manual selection: 7-8 plus every manual lineup, bench, tactic, and role
  decision.

Main issue: the click count itself is not catastrophic, but two clicks feel
bureaucratic: saving preparation does not move directly into the match, and
the shell still advertises unrelated global actions while the user is inside a
focused match flow.

## Current Warm Flow

Starting state: saved lineup and saved tactic already complete.

Current useful path:

1. Dashboard primary action: `Go to match`.
2. Matchday pre-match action: `Start match`.
3. Half-time action: optional substitution, then `Second half`.
4. Full-time action: `Dashboard`.

Baseline warm click count:

- 4 clicks without substitution.
- 5 clicks with one substitution.

Main issue: warm flow is close, but the matchday shell still shows Inbox/Posta,
global Continue, and main menu while the match is active. The user can also see
future navigation buttons that look like a real application menu even when they
are disabled future sections.

## Current Button Surface

### Dashboard

Visible controls:

- Shell `Main menu`: useful outside focused matchday.
- Shell `Continue`: useful globally, but competes with the dashboard primary
  action because the dashboard already calculates the next action.
- Top navigation: Dashboard available, every future section disabled.
- Primary CTA: `Prepare match`, `Go to match`, or `Continue` depending on
  state.
- Dashboard action list:
  - `Inspect squad`: rendered as available but currently has no useful handler.
  - `Inspect lineup`: rendered as available but currently has no useful handler.
  - `Inspect tactic`: rendered as available but currently has no useful handler.
  - `Prepare match`: available and useful.
  - `Advance next fixture`: blocked or relabeled to `Go to match` when ready.
  - `Inspect table`: rendered as available but currently has no useful handler.
- Inbox/Posta actions: useful when Continue generated attention messages.

Decision:

- Keep one dashboard primary CTA.
- Remove or make non-actionable any available dashboard action without a real
  handler.
- Avoid duplicating `Prepare match` and `Go to match` between the hero primary
  CTA and the lower action list.
- Keep shell `Continue` on the normal dashboard if it is visually secondary to
  the dashboard primary action.

### Match Preparation

Visible controls:

- Shell `Main menu`: useful but should not compete with preparation.
- Shell `Continue`: ambiguous here because preparation has a save/advance
  obligation.
- Top navigation and Inbox/Posta rail: visible while preparing.
- Header `Dashboard`: useful escape, but secondary.
- Board helper buttons: `Auto`, `Fill gaps`, `Clear`.
- Formation selector.
- Tactical board slot/context controls.
- Bench board slot/context controls.
- Tactic radio cards.
- Bottom `Save preparation` action.

Decision:

- Replace the bottom save as the main action with a top-level `Save and go to
  match`.
- Keep `Auto`, `Fill gaps`, `Clear`, formation, board, bench, and tactic
  controls because they are real manager decisions.
- Hide or de-emphasize shell `Continue` while preparing; it is not the right
  primary action on this screen.
- Keep `Dashboard` as an escape, not as the obvious next step.

### Pre-Match

Visible controls:

- Shell `Main menu`.
- Shell `Continue`.
- Inbox/Posta rail.
- Header `Dashboard`.
- Match centre primary action: `Start match`.

Decision:

- Keep explicit `Start match`; the user asked for this ritual.
- Hide Inbox/Posta and ambiguous shell Continue during matchday.
- Keep a restrained escape only if it does not read as the primary action.

### Half-Time

Visible controls:

- Shell `Main menu`.
- Shell `Continue`.
- Inbox/Posta rail.
- Header `Dashboard`.
- Substitution controls.
- `Apply substitution`.
- `Second half`.
- Timeline, key events, player table.

Decision:

- Half-time must become a tactical decision workspace, not a small substitution
  form inside a report screen.
- Keep one primary progression action: `Start second half`.
- Keep substitutions.
- Add full tactical-board changes in later Phase 67 steps.
- Do not expose team talks or opponent board in this phase.

### Full Time

Visible controls:

- Shell `Main menu`.
- Shell `Continue`.
- Inbox/Posta rail.
- Header `Dashboard`.
- Consequences panel.
- Full-time `Dashboard` button.

Decision:

- Replace the full-time `Dashboard` wording with one final `Continue` action.
- Return to a clean dashboard after that click.
- Keep consequences only at full time, not during live phases.

### Dashboard After Match

Visible controls:

- Dashboard primary action depends on the updated next stop.
- Recent match and condition context update.
- Inbox/Posta may still contain old messages unless flow clears or rebuilds
  state.

Decision:

- The post-match dashboard should be clean: no stale match-preparation or
  matchday action message should remain actionable after full-time resolution.
- It should surface the next meaningful career action, not the completed match.

## Current Duplicates And Dead Actions

| Surface | Action | Current issue | Phase 67 decision |
|---|---|---|---|
| Dashboard | `Inspect squad` | Available but no useful handler/screen. | Remove from available button surface or render as non-action backlog text. |
| Dashboard | `Inspect lineup` | Available but no useful handler/screen. | Remove from available button surface. |
| Dashboard | `Inspect tactic` | Available but no useful handler/screen. | Remove from available button surface. |
| Dashboard | `Inspect table` | Available but no useful handler/screen. | Remove from available button surface. |
| Dashboard | `Prepare match` | Duplicates the primary CTA when blockers exist. | Keep only the primary CTA. |
| Dashboard | `Go to match` / `Advance next fixture` | Can duplicate the primary CTA when ready. | Keep only the primary CTA. |
| Shell | `Continue` | Competes with screen-specific primary actions during preparation/matchday. | Contextual: visible on dashboard, hidden or unavailable in focused workspaces. |
| Match preparation | `Save preparation` | Useful but placed as bottom duplicate of the desired transition. | Rename/replace with top `Save and go to match`. |
| Matchday | Header `Dashboard` | Competes with match progression. | Keep only as secondary/escape or remove during active phases. |
| Full time | `Dashboard` | Product language should be `Continue`. | Rename final progression action to `Continue`. |

## Target Flow

Accepted target cold flow:

```text
Dashboard
  -> Prepare match
  -> Auto or manual selection
  -> choose tactic
  -> Save and go to match
  -> Pre-match
  -> Start match
  -> Half-time
  -> substitutions and full tactical-board changes
  -> Start second half
  -> Full time
  -> Continue
  -> clean Dashboard
```

Target cold click count:

- 6 clicks with `Auto` and already acceptable default formation:
  1. `Prepare match`
  2. `Auto`
  3. tactic choice if missing or changed
  4. `Save and go to match`
  5. `Start match`
  6. `Start second half`
  7. `Continue`
- If a tactic is already selected by default and Auto fills the necessary
  setup, the target is 6 clicks from dashboard to clean post-match dashboard.
- Manual lineup/bench/tactical changes are intentionally extra clicks because
  they are real manager decisions.

Target warm click count:

- 4 clicks:
  1. `Go to match`
  2. `Start match`
  3. `Start second half`
  4. `Continue`
- Half-time substitutions or tactical changes add intentional decision clicks.

## Visual And Accessibility Targets

- The active screen has exactly one visually dominant primary action.
- Disabled future navigation remains visible but cannot be mistaken for active
  buttons.
- Focus order reaches the primary action before secondary escape actions when
  this does not break semantic layout.
- Matchday hides the Inbox/Posta rail and global Continue so the match feels
  like a focused event.
- No user-facing control is visible as available unless it has a real handler.
- The final Playwright QA must capture desktop and narrow evidence for the
  target flow and no horizontal overflow.

## Step Mapping

- Step 02: contextual shell mode, disabled navigation cleanup, Inbox/Posta hide
  during matchday.
- Step 03: dashboard primary-action cleanup and dead available action removal.
- Step 04: `Save and go to match` from preparation.
- Step 05: pre-match/full-time primary action wording and routing cleanup.
- Step 06: structured half-time tactical decision contract.
- Step 07: half-time tactical-board workspace.
- Step 08: click-count, screenshot, keyboard, and accessibility QA.

## Conclusion

The current flow is structurally playable, but it still feels like a prototype
because there are too many available-looking actions that do not resolve a real
manager decision. The Phase 67 implementation should not chase animation or
cosmetic polish first. It should remove ambiguity: one primary action per
screen, no dead dashboard buttons, no shell noise during matchday, and a real
half-time tactical stop.
