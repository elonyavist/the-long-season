# Web Accessibility, Responsive, And Interaction State Audit

Date: 2026-07-15  
Phase: `73a-web-product-ui-ux-quality-audit-and-premium-design-baseline`  
Status: current-product audit; no production changes

## Executive Result

The current browser product is structurally usable, but it is not yet at the
project's WCAG 2.2 AA and premium narrow-screen baseline.

The positive foundation is substantial: every primary state has a named
`main` landmark and one H1; the career shell exposes named navigation and
complementary regions; tactical slots are keyboard operable; context menus
close with Escape; the unsaved-work guard is a native modal with focus
restoration; asynchronous commands preserve context, announce progress, and
lock conflicting controls; reduced motion is respected; and no tested primary
surface overflows horizontally at 1440 x 900, 1920 x 1080, or 390 x 844,
including 200% text zoom.

Four P1 findings remain:

1. repeated shell controls cannot be bypassed by a keyboard-only manager;
2. screen changes leave focus on `body` instead of the new task;
3. normal-size red blocker text has only 3.97:1 contrast;
4. on narrow and zoomed layouts, persistent chrome pushes the current football
   task one or more viewports below the page start.

The first three are accessibility defects or direct WCAG risks. The fourth is
a usability defect rather than a horizontal-reflow failure. Two P2 QA/control
risks are also recorded. No P0 was found, and no accessibility or responsive
source was changed during this step.

## Evidence And Method

Evidence was collected with Node 24.16.0, Chromium, the production
SQLite/OPFS adapter, deterministic current career data, source inspection,
keyboard walkthroughs, computed-style probes, and existing focused tests.

Required viewports:

- desktop: 1440 x 900;
- wide desktop: 1920 x 1080;
- narrow: 390 x 844 (375 CSS-pixel layout viewport in the captured browser).

New Step 05 screenshots:

- `/tmp/the-long-season-phase73a-step05/01-dashboard-1440x900.png`;
- `/tmp/the-long-season-phase73a-step05/02-preparation-390x844.png`;
- `/tmp/the-long-season-phase73a-step05/03-preparation-1920x1080.png`;
- `/tmp/the-long-season-phase73a-step05/04-dashboard-1920x1080.png`;
- `/tmp/the-long-season-phase73a-step05/05-inbox-1920x1080.png`;
- `/tmp/the-long-season-phase73a-step05/06-preparation-ready-1920x1080.png`;
- `/tmp/the-long-season-phase73a-step05/07-matchday-pre-1920x1080.png`;
- `/tmp/the-long-season-phase73a-step05/08-entry-saved-1920x1080.png`.

Supporting current-product evidence:

- all desktop/narrow screen states:
  `/tmp/the-long-season-phase73a-step03/`;
- component states and computed styles:
  `/tmp/the-long-season-phase73a-step04/`;
- loading states:
  `/tmp/the-long-season-phase72/01-pre-match-loading-desktop.png` through
  `/tmp/the-long-season-phase72/05-preparation-loading-narrow.png`;
- Posta at 200% text zoom:
  `/tmp/the-long-season-phase73/08-posta-text-zoom-narrow.png`;
- reduced motion:
  `/tmp/the-long-season-phase73/05-reduced-motion-posta-desktop.png`.

Current automated evidence:

- Phase 73 Posta Playwright journey: 2/2 tests pass, including keyboard focus,
  narrow reflow, 200% text zoom, and reduced motion;
- Phase 72 save/loading browser journey: passes, including pending command,
  recoverable error, dirty work, dialog focus, and reduced motion;
- tactical-board focused unit tests: 2 files and 11 tests pass;
- the older shared-board visual runner stops on a stale candidate-order
  assertion before reaching its pointer/touch checks.

Automated checks were treated as supporting evidence, not as a replacement for
manual keyboard and screenshot inspection.

## Responsive Geometry

### Horizontal Reflow

| Surface | 1440 x 900 | 1920 x 1080 | 390 x 844 | Result |
| --- | --- | --- | --- | --- |
| App entry | No horizontal overflow | No horizontal overflow | No horizontal overflow | Pass |
| Dashboard | 1425/1425 scroll/client width | 1905/1905 | No horizontal overflow | Pass |
| Posta | No horizontal overflow | 1905/1905 | No horizontal overflow | Pass |
| Match preparation | No horizontal overflow | 1905/1905 | 375/375 | Pass |
| Matchday | No horizontal overflow | 1905/1905 | No horizontal overflow | Pass |
| Posta, 200% text | Not applicable | Not applicable | No horizontal overflow | Pass |

No clipped or horizontally unreachable primary command was found at the
required widths. This satisfies the current narrow non-breaking contract and
provides positive evidence for WCAG 1.4.10 Reflow.

### Vertical Cost

The layout reflows by stacking the persistent shell before the active task.
That prevents overlap but imposes excessive interaction cost:

| State at 390 x 844 | Shell/rail bottom | Main starts | Primary task/action |
| --- | ---: | ---: | ---: |
| Dashboard | 588 px | 604 px | primary action at 746-798 px |
| Posta detail | 588 px | 604 px | message action at 1359-1399 px |
| Preparation | 588 px | 604 px | confirm at 789-829 px; board starts at 1538 px in current Step 05 capture |
| Matchday | about 425 px | 441 px | phase command at 784-834 px |

At 200% text zoom the shell consumes roughly 940 vertical pixels before the
selected Posta task. Content remains reachable, so this is not recorded as a
WCAG 1.4.10 failure. It is a P1 action-economy and responsive-priority defect:
the product adapts its width but not its task hierarchy.

## Semantic Structure

### Current Strengths

- Each inspected screen has one H1 and one `main` landmark.
- The career shell has named navigation and complementary regions.
- Posta uses list/detail structure and an `aria-live` detail pane.
- Repeated player facts use semantic tables or lists where comparison matters.
- Current/selected state is communicated by text or accessibility state, not
  color alone.
- The tactical pitch is an SVG image with keyboard-focusable slot/player
  controls and explicit accessible names.
- Context candidates expose name, role group, condition, and suitability in
  their accessible names.
- Storage failures are focused alerts; pending commands use a polite atomic
  live region.
- The unsaved-career guard uses native `dialog.showModal()` with a labelled
  title, description, Cancel autofocus, and restoration to the trigger.

### Missing Bypass

There is no skip link or equivalent keyboard-focusable control that moves
directly to the current `main` content. Landmarks help screen-reader landmark
navigation, but a keyboard-only manager must traverse repeated brand,
navigation, Posta, save, and career controls on every screen. The cost is
especially severe after the shell stacks at narrow width or 200% zoom.

This is recorded against the keyboard intent of WCAG 2.4.1 Bypass Blocks.

## Keyboard And Focus Walkthrough

| Journey/state | Keyboard result | Assessment |
| --- | --- | --- |
| Entry | New career, Continue, save selection, language, and currency are reachable with visible focus | Pass |
| New career -> Dashboard | Route succeeds; `document.activeElement` becomes `body` | P1 focus defect |
| Dashboard -> Posta | Route succeeds; focus becomes `body`; Inbox H1 is not programmatically focused | P1 focus defect |
| Posta -> preparation | Route succeeds; focus becomes `body`; Match preparation H1 is not focused | P1 focus defect |
| Preparation -> Matchday | Command succeeds; focus becomes `body`; Matchday H1 is not focused | P1 focus defect |
| Tactical empty slot | Enter opens the named Assign player region | Pass |
| Tactical context menu | Escape closes the open menu | Pass |
| Unsaved exit | Modal opens with Cancel focused; Cancel closes and restores focus to Main menu | Pass |
| Storage recovery | Alert receives programmatic focus | Pass |

Global focus styling is visible and uses the gold interaction language. The
defect is not an invisible ring; it is loss of logical focus on SPA screen
transitions. The next Tab restarts from shell controls instead of continuing at
the newly presented task. This conflicts with WCAG 2.4.3 Focus Order and also
prevents reliable screen-change announcement for assistive-technology users.

## Pointer, Touch, And Context Interaction

Current production ownership includes:

- right-click context menus for pitch players/slots;
- keyboard activation and Escape dismissal;
- outside-click and pitch-click dismissal paths;
- touch long press with cancellation after movement beyond a threshold;
- role-zone drag clamping and a non-draggable goalkeeper;
- the same shared tactical interaction surface in preparation and half time.

Manual current-browser checks confirmed keyboard open/Escape dismissal. The
focused tactical unit suite passes. The historical full browser runner contains
direct assertions for outside click, pitch click, Escape, long-press open,
movement cancellation, and role-zone clamping, but currently stops before
those assertions because its expected candidate ordering predates the current
ranking rule. Therefore touch/pointer behavior is not classified as broken;
its end-to-end proof is classified as stale QA debt.

## Async, Empty, Error, Dialog, And Recovery States

| State | Current behavior | Result |
| --- | --- | --- |
| Empty entry | New career remains explicit; unavailable Continue explains why | Pass |
| Empty Posta | Counts and an explicit no-message state remain visible | Pass |
| Empty preparation | Empty slots, validation, and disabled confirmation remain understandable | Pass, with hierarchy debt |
| Loading | Action-specific label, spinner, `aria-busy`, polite live status, disabled conflicts, stable geometry | Pass |
| Reduced-motion loading | Spinner animation is removed while text/status remains | Pass |
| Calendar transition | Visible bounded date movement; reduced motion jumps coherently to stop date | Pass |
| Save/storage error | Focused `role=alert`; recovery action; dirty work retained | Pass |
| Dirty exit dialog | Native modal, labelled context, safe default, focus restoration | Pass |
| Disabled command | Native disabled state and unavailable pointer behavior | Pass semantically; visual distinction remains Step 04 debt |

The app does not replace the whole screen with a generic loader, so current
commands feel active rather than frozen. Error recovery preserves the football
context and user work.

## Reduced Motion

With `prefers-reduced-motion: reduce`:

- the calendar transition does not animate through intermediate dates;
- loading indicators retain a textual status but remove spinner animation;
- no essential state is communicated by motion alone;
- the final date and routed destination remain deterministic.

The current implementation passes the audited reduced-motion contract.

## Contrast Probe

| Foreground/background | Ratio | Requirement/result |
| --- | ---: | --- |
| body text / panel | 13.79:1 | Pass |
| muted text / panel | 8.26:1 | Pass |
| heading / panel | 14.14:1 | Pass |
| gold / panel | 8.70:1 | Pass |
| primary button text / gold | 9.71:1 | Pass |
| red blocker text / panel | 3.97:1 | Fail for 16px, weight 400 normal text |
| cream / red surface | 3.48:1 | Insufficient for normal text where this pairing is used |
| green / panel | 6.24:1 | Pass |
| blue / panel | 4.28:1 | Below 4.5 if used for normal text; requires usage-specific review |

The rendered blocker sample is `rgb(195, 95, 67)` at 16px and weight 400 on
`rgb(21, 31, 48)`, yielding 3.97:1. It communicates a blocking manager action,
so this is a P1 WCAG 1.4.3 Contrast (Minimum) failure, not a decorative-color
preference.

## Findings

### A11Y-01 - Repeated career chrome has no keyboard bypass

- Severity: P1.
- Standard: WCAG 2.4.1 Bypass Blocks.
- Reproduction: open Dashboard, Posta, preparation, or Matchday; press Tab from
  the document start; there is no skip-to-main control before repeated shell
  actions.
- User impact: keyboard-only managers repeatedly traverse navigation, Posta,
  save, and context controls before every football task. Narrow and 200% zoom
  layouts amplify the cost.
- Ownership: `apps/web/src/features/app-shell/AppShell.tsx` and shared shell
  layout.
- Required remediation boundary: one keyboard-visible-on-focus bypass to the
  active main region, with stable target identity and browser regression.

### A11Y-02 - SPA screen changes lose task focus

- Severity: P1.
- Standard: WCAG 2.4.3 Focus Order; screen-change announcement risk.
- Reproduction: activate New career, Inbox, Prepare match, or Confirm and go to
  match with the keyboard; inspect `document.activeElement` after the route.
  It is `body`, not the active heading/main task.
- User impact: the new context is not reliably announced and the next Tab
  restarts in persistent shell controls.
- Ownership: `apps/web/src/app/App.tsx` route/screen composition plus a shared
  screen-focus boundary.
- Required remediation boundary: focus the active screen heading or main
  container only after genuine screen changes, without stealing focus during
  same-screen updates.

### A11Y-03 - Blocking red text misses normal-text contrast

- Severity: P1.
- Standard: WCAG 1.4.3 Contrast (Minimum).
- Reproduction: render preparation or Dashboard blockers; computed foreground
  and background yield 3.97:1 at 16px/400.
- User impact: the information that explains why play cannot continue is
  harder to read for low-vision and contrast-sensitive users.
- Ownership: `apps/web/src/styles/tokens.css` semantic danger colors and their
  blocker consumers.
- Required remediation boundary: correct the semantic danger foreground and
  every actual foreground/background pairing, then verify normal, hover,
  selected, disabled, and alert states.

### RESP-01 - Narrow reflow preserves width but loses task priority

- Severity: P1 usability; not classified as a WCAG 1.4.10 failure.
- Principle: first-useful-viewport and action economy.
- Reproduction: use 390 x 844 or 200% text zoom; Dashboard main starts at
  604px, Posta action at 1359px, and preparation board below 1500px.
- User impact: the manager sees global chrome before the reason they opened the
  screen and must scroll through one or more viewports before acting.
- Ownership: shell responsive layout first, then feature-level narrow order.
- Required remediation boundary: compact/collapse persistent narrow chrome and
  place the active decision before supporting context; do not hide essential
  information.

### A11Y-04 - Compact Matchday control target lacks an explicit target-size contract

- Severity: P2.
- Standard: WCAG 2.5.8 Target Size (Minimum), including its spacing exception.
- Evidence: a current compact Matchday rail target measures approximately
  172 x 18px. Native checkboxes/radios also render at 13 x 13px but may have
  larger associated label targets.
- Risk: future CSS changes can remove the spacing/label exception because the
  component does not encode or test a 24px target/spacing contract.
- Ownership: Matchday compact control/phase presentation and shared form
  controls.
- Disposition: verify effective clickable boxes and center spacing before
  classifying a conformance failure; normalize the contract in bounded
  remediation.

### QA-01 - Tactical pointer/touch browser proof is stale

- Severity: P2 QA debt.
- Evidence: tactical interaction unit tests pass and current keyboard behavior
  works, but `shared-tactical-board.spec.ts` fails first on an obsolete
  role-candidate ordering expectation before outside-click, drag, and
  long-press assertions execute.
- User impact: a regression in a core touch interaction can escape the current
  full browser gate even though the behavior and test code both exist.
- Ownership: tactical-board visual QA only; production behavior is not proven
  defective.
- Disposition: align the fixture expectation with the canonical current
  ranking rule, then retain the existing interaction assertions. Do not weaken
  ordering or touch behavior to make the runner green.

## Severity Summary

| Severity | Count | IDs |
| --- | ---: | --- |
| P0 | 0 | none |
| P1 | 4 | A11Y-01, A11Y-02, A11Y-03, RESP-01 |
| P2 | 2 | A11Y-04, QA-01 |
| Monitor | 0 | none |

## Preservation Boundaries

Future remediation must preserve:

- the approved tactical board and fixed pitch asset;
- keyboard-operable slots and candidates;
- textual suitability and status, not color-only meaning;
- native modal semantics and focus restoration;
- focused storage recovery;
- contextual, action-specific loading feedback;
- deterministic reduced-motion calendar behavior;
- zero horizontal overflow at all three required viewports and 200% text zoom.

## Ownership And Remediation Order

The evidence supports a bounded order, not scattered one-off fixes:

1. shell bypass and screen-change focus contract;
2. semantic danger contrast across real component states;
3. narrow shell/task order while preserving desktop structure;
4. compact target-size contract;
5. repair the stale tactical browser fixture and rerun touch/pointer checks.

This order keeps semantics and navigation stable before visual geometry and QA
are adjusted. It does not require a new state manager, dependency, component
library, or mobile-only product branch.

## Step 06 Handoff

The architecture audit must determine where one shared screen-focus boundary
and one narrow-shell ordering rule can live without duplicating behavior across
Dashboard, Posta, preparation, and Matchday. It must also distinguish the
stale tactical visual fixture from dead code: the runner still owns valuable
current interaction assertions and should not be deleted based on its first
obsolete expectation.

No Step 06 assumption or expected file needs to change.
