# Squad And Market Player Workspace Phase 79B Report

Date: 2026-07-28
Phase: `79b-squad-market-player-workspace-ui-ux-and-career-statistics`
Final step: `07-responsive-accessibility-visual-qa-and-phase-report`

## Verdict

Phase 79B is complete. Squad and Market now behave as sibling football
workbenches: both use the same public rating language and player-detail
primitives, while Squad owns selection and renewal decisions and Market owns
inspection and acquisition decisions.

The final bounded package, web, build, browser, and repository-wide evidence is
green. This report does not run, replace, weaken, or claim Phase 79 Step 14's
`750 x 50` long-run gate.

## Locked Decisions Delivered

### Public Player Assessment

- Current level and potential are public ratings from one to five stars in
  half-star increments.
- Both ratings use the selected club's current senior-squad standard.
- Canonical role ability `>= 17` forces five ordinary gold stars and adds one
  separate dark-orange elite marker.
- The elite marker is not danger red and is not a sixth linear rating level.
- Exact hidden numeric potential is absent from UI read models, accessible
  labels, DOM attributes, and browser state.

### Squad Placement And Actions

- Every Squad row has one named `Schieramento` select and one contextual action
  menu instead of an inline action cluster.
- Direct placement supports `Non convocato`, available bench places, and the
  real side-specific XI slots.
- Occupied XI choices swap deterministically. A replaced starter returns to the
  source XI slot, the same bench place, or the unselected pool according to the
  documented source state.
- A full bench does not advertise an impossible move. Weak but legal XI
  assignments remain visible; invalid assignments do not.
- The detailed XI-position dialog remains available from the menu.
- Squad and Tactics read the same preparation draft, so a Squad placement
  change appears unchanged in the canonical tactical workspace.

### Player Detail

- Squad exposes `Attributi`, `Statistiche`, and `Contratto`.
- Market exposes `Attributi`, `Statistiche`, and `Contratto e offerta`.
- Natural and adapted roles appear as compact chips; weak/red roles are omitted
  from profile identity.
- Goalkeepers receive goalkeeping, mental, and physical groups. Outfield
  players receive technical, mental, and physical groups.
- Market exposes exact current attributes immediately. No scouting fog,
  observation timer, knowledge percentage, or fake hidden-value placeholder was
  introduced.
- Renewal and offer panels stay mounted while hidden, preserving a draft across
  tab changes. Changing player resets the inspector to Attributes and cannot
  carry another player's draft with it.

### Career Statistics

- Durable rows store starts, substitute appearances, minutes, rating total and
  samples, goals, assists, and saves.
- Appearances and average rating are derived. Career average rating is weighted
  by rating samples rather than averaging season averages.
- Participation and match-event coverage remain independent and explicit as
  `complete`, `partial`, or `unavailable`; absent history is never presented as
  a truthful zero.
- Saves are exposed only for goalkeepers. Unsupported clean sheets, xG, cards,
  club splits, and inferred historical backfill remain absent.

## Architectural Ownership

| Layer | Final owner |
| --- | --- |
| Domain | `packages/domain/src/career/player-statistics.ts` owns the durable season-row and coverage vocabulary used by `CareerState`. Archived facts remain meaningful after the active player exits. |
| Engine | `packages/engine/src/career/player-statistics.ts` owns completed-season capture and deterministic current/career selection, including weighted ratings. `packages/engine/src/squad/public-club-player-assessment.ts` owns selected-club-relative half-star and elite assessment. |
| Storage | JSON envelope 7 carries the additive archive. SQLite schema 15 incrementally upgrades the supported schema-14 baseline; archived statistic rows deliberately have no active-player foreign key. Relational and JSON mappers round-trip the same canonical facts. |
| UI read models | `career-player-rating.ts`, `career-player-detail-view.ts`, and `career-player-statistics-view.ts` own framework-free public stars, natural/adapted roles, role-aware attributes, coverage-aware statistics, and the no-hidden-potential boundary. `career-market-target-view.ts` keeps list rows light and accepts one lazily resolved target detail. |
| Web adapters | The Squad adapter projects the canonical preparation draft and existing contract workflow. The Market adapter builds the catalog without selecting statistics for every row, then memoizes exact detail only for an opened target. |
| Web presentation | `PlayerStarRating`, `PlayerProfileTabs`, `PlayerRoleChips`, `PlayerAttributeGroups`, and `PlayerStatisticsPanel` are shared. `PlayerStatisticsPanel` owns the single locale/period/coverage formatter used by both dialogs. Squad retains its placement planner and portal menu; Market retains its canonical offer composer. |
| Localization | `@game/i18n` owns every visible and accessible label. The catalog test proves complete coverage for all five supported languages. |

React, Zustand, and CSS do not own rating, statistics, transfer eligibility,
finance, lineup-validity, or persistence policy.

## Chromium Vertical-Scroll Glitch

The reproducible glitch came from Chromium propagating the responsive Squad
table's very tall overflow into the document even though the table frame was
the intended scroll owner. Giving `.tls-squad-table-frame` an explicit
containing block with `position: relative` kept that overflow inside the frame;
the frame's `overflow-y: auto`, maximum height, and internal scroll range were
left unchanged.

Measured document heights before and after the correction:

| View | Before | After |
| --- | ---: | ---: |
| Narrow, 390 px | 19,002 px | 1,348 px |
| Narrow, useful 200% text | 37,961 px | 2,343 px |
| Desktop | 1,803 px | 928 px |

The browser regression `assertScrollFrameOwnsVerticalOverflow` now proves both
parts of the contract: the frame still has a real internal scroll range, while
the document height stays bounded by the visible app shell. Dialog checks
separately prove that a full-screen player profile owns the only moving
vertical scrollbar and cannot move the inert page underneath it.

## Evidence Matrix

All screenshot artifacts below are under
`/tmp/the-long-season-phase76`.

| Requirement | Final evidence | Result |
| --- | --- | --- |
| Squad table at desktop, narrow, and 200% text | `69-squad-desktop.png`, `69b-squad-narrow.png`, `69c-squad-text-zoom-narrow.png` | Pass |
| Market table at desktop, narrow, and 200% text | `79a-market-desktop.png`, `79c-market-narrow.png`, `79l-market-text-zoom-narrow.png` | Pass |
| All three Squad tabs | Desktop: `69i-player-profile-attributes-desktop.png`, `69a-player-profile-statistics-desktop.png`, `69g-player-profile-contract-desktop.png`; narrow/zoom: `69j`, `69f`, `69k`, `69l`, `69h`, and `69m` prefixed captures | Pass |
| All three Market tabs | Desktop: `79b-market-player-attributes-desktop.png`, `79e-market-player-statistics-desktop.png`, `79d-market-pending-offer-desktop.png`; narrow/zoom: `79f`, `79g`, `79i`, `79j`, and `79k` prefixed captures | Pass |
| Keyboard row, select, menu, tabs, close, and focus restoration | Playwright activates rows with the keyboard, guards child controls, exercises menu arrows/Home/End/Escape/Tab, changes tabs with orientation-aware arrows, closes dialogs, and checks focus returns to the originating row or trigger | Pass |
| Touch targets and responsive orientation | `79h-player-workspaces-hallmark-320.png`, `-375.png`, `-414.png`, and `-768.png`; each scenario taps Squad placement/menu/tabs and Market tabs/close controls | Pass |
| First/last menu positioning and scroll dismissal | Browser assertions prove the menu is portalled to `document.body`, remains inside the viewport, opens upward on the last row, closes on table scroll/outside interaction, and restores deterministic focus | Pass |
| Automatic occupied-slot swap visible in Tactics | `69d-squad-explicit-lineup-choice-desktop.png` and `69e-tactics-shared-plan-desktop.png`, plus exact select-value assertions before navigation | Pass |
| Renewal and offer draft retention | Browser assertions enter renewal wage and transfer-fee drafts, leave the mounted panel, return, and verify the exact value; `69g-player-profile-contract-desktop.png` and `79d-market-pending-offer-desktop.png` show the workflows | Pass |
| Goalkeeper/outfield attribute separation | Adapter/component tests assert the exact three groups for both player kinds and that only goalkeepers expose saves; browser inspection confirms one of technical/goalkeeping, never both | Pass |
| Natural/adapted-only roles | UI and adapter tests reject weak roles from detail; browser assertions require zero weak role chips | Pass |
| Half-stars and elite marker | Engine boundary tests prove quarter-boundary rounding and the ability-17 elite threshold; renderer tests prove half fill and one dark-orange elite marker with localized accessible text | Pass |
| Current/career and partial/unavailable statistics | Domain/engine/UI/storage tests prove weighted totals and independent coverage; both browser dialogs show the two periods and four visible coverage statements | Pass |
| One dialog scrollbar and no page overflow | Desktop, 390 px, useful 200% text, and the Hallmark width matrix run `assertNoPageOverflow` and `assertFullScreenDialogOwnsScroll`; the Chromium document-height regression is included | Pass |
| Reduced-motion parity | Narrow and Hallmark scenarios emulate reduced motion while exercising the same placement, menu, tab, and dialog decisions | Pass |
| SQLite 14 to 15 and archived retired-player statistics | Migration, mapper, storage, and OPFS browser tests prove incremental upgrade, reload, coverage, and a retired-player row without an active-player dependency | Pass |
| One shared statistics formatter | Both dialogs call `buildPlayerStatisticsPeriodItems` from `PlayerStatisticsPanel`; duplicated period, metric, coverage, and locale formatting is removed | Pass |

## Accessibility And Localization

- Tables retain semantic headers and focusable rows. Interactive descendants
  stop row activation so a select, menu item, tab, or form field cannot
  accidentally reopen a profile.
- Placement selects, action triggers, menus, tab lists, tabs, panels, close
  controls, statistics regions, star ratings, and coverage states have localized
  accessible names.
- Menus use real menu semantics and deterministic focus movement. Tabs implement
  the WAI-ARIA tabs pattern, including Home/End and horizontal or vertical arrow
  behavior matching the rendered breakpoint.
- Profile dialogs keep one scroll owner, trap the decision surface, close with
  Escape, and restore focus.
- Touch scenarios cover 320, 375, 414, and 768 px. Tab labels remain one line,
  horizontal page overflow stays absent, and useful 200% text remains
  operable.
- Contrast assertions cover control boundaries, empty-star outlines, and focus
  affordances at the required non-text threshold. Suitability, elite status,
  selection, and coverage also have text or semantic labels, so color is never
  their sole carrier.
- The i18n catalog and its tests cover English, Italian, German, Spanish, and
  French, including placement options, tabs, statistics fields/coverage, and
  public-rating accessible copy.

## Hallmark Closeout

The bounded Hallmark audit applied the universal checks relevant to an in-app
Workbench: structural specificity, token/font consistency, restrained accent,
interaction states, focus and contrast, reduced motion, honest copy, no
re-drawn chrome, no horizontal overflow, single-line clickable labels, and the
320/375/414/768 px matrix.

The shipped structure matches the locked Workbench family and the established
retro-football identity; it does not introduce a new page theme or decorative
enrichment. Marketing-only hero, marketing navigation/footer, and cross-page
theme-diversification gates are not applicable to these authenticated product
surfaces. No open Hallmark finding remains in this bounded scope.

## Verification

| Command/gate | Final result |
| --- | --- |
| `@game/domain` tests | Pass |
| `@game/engine` tests | Pass |
| `@game/storage` tests | Pass |
| `@game/ui` tests | Pass |
| `@game/i18n` tests | Pass |
| `@game/web` tests | Pass — 72 files, 322 tests |
| `@game/web` typecheck | Pass |
| `@game/web` production build | Pass; only the existing approximately 1.487 MB chunk-size warning remains |
| `pnpm web:visual:qa` | Pass — 29 of 29 scenarios in 4.4 minutes |
| Repository-wide `pnpm check` | Pass — lint, localized-text check, 235 files / 1,452 tests, all workspace typechecks, and dependency-cruiser 715 modules / 2,700 dependencies |
| `git diff --check` and `graphify update .` | Pass |
| Phase 79 Step 14 `750 x 50` | Not run; no pass claimed |

## Residual Risk And Handoff

- The production build still reports the known approximately 1.487 MB chunk
  warning. It is non-blocking for this phase and no bundle rewrite was in
  scope.
- No dead replacement player-detail path, duplicate statistics formatter,
  scouting fiction, or numeric hidden-potential path remains in the Phase 79B
  surface.

Control returns to
`docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`.
Phase 79 Step 15 is not started, and the `750 x 50` remains unrun and
unclaimed.
