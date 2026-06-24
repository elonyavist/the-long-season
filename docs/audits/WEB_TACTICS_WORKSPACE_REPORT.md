# Web Tactics Workspace Report

Date: 2026-06-23
Phase: `54-tactics-and-match-preparation-workspace-completion`

## Result

Phase 54 is complete.

The match-preparation screen is now a reusable tactical workspace instead of a
single-purpose form. It supports manual formation choice, manual starting XI
selection, manual 8-player substitute bench selection, tactic profile choice,
save readiness, dashboard/Inbox/Posta entry, and Continue blocker clearance.

The workspace is strong enough for `Phase 55 - Inbox/Posta Decision Center` to
build on it.

## What Changed

- `@game/ui` owns a framework-free match-preparation contract for formation,
  lineup, bench, tactic, validation blockers, and save action readiness.
- The formation catalog now supports common shapes:
  `4-4-2`, `4-3-3`, `4-2-3-1`, `4-3-1-2`, `3-5-2`, `3-4-3`, `5-3-2`, and
  `4-1-4-1`.
- The web demo adapter stores selected formation, selected XI, ordered bench,
  selected tactic, and saved/unsaved preparation state.
- Formation switching preserves only still-valid slot assignments and does not
  auto-fill players.
- `TacticalPitchLineup` renders formation-specific pitch slots with compact
  unresolved-slot alerts.
- `SquadSelectionTable` remains a fixed-height, sortable squad-picking table and
  sorts role views by football position order.
- `BenchSelectionPanel` renders the required 8 substitute slots.
- `PlayerFactPanel` and tactical label helpers keep repeated tactical
  presentation out of the screen component.
- The dashboard and Inbox/Posta paths open the workspace.
- Saved complete preparation clears dashboard blockers and allows Continue to
  reach the next attention stop.
- Visible labels were localized through the existing i18n label system.
- Browser QA captures desktop and narrow screenshots under
  `/tmp/the-long-season-phase54`.

## Dependency Review

Status: pass.

- `packages/ui` remains framework-free and language-agnostic.
- `apps/web` owns React state, demo adapter state, and visual interaction.
- Engine rules did not move into React components.
- CLI output is not parsed by web code.
- `pnpm depcruise` reports no package-boundary violations.

## Code Quality Review

Status: pass with one watch item.

- Tactical pitch, bench selection, squad table, player details, tactical labels,
  and pitch coordinates are split into reusable files instead of being buried in
  `CareerMatchPreparationScreen.tsx`.
- Focused tests cover read-model validation, web preparation state, component
  behavior, career-loop readiness, and browser QA.
- The screen component still coordinates several sections. This is acceptable
  for the current workspace, but the future full Tactics section should reuse
  the extracted components rather than adding more local logic to this screen.

## Architecture Review

Status: pass.

- Match-preparation facts flow from `@game/ui` read models into web components.
- The web demo adapter is the clear replacement point for future real-save
  preparation data.
- Formation and bench validation are not UI-only behavior; they are represented
  in the shared UI read model.
- The component split leaves the design open to the future Tactics section
  without adding unused abstractions.

## UI/UX Review

Status: pass.

- The first useful workspace viewport shows preparation context, blockers,
  formation, tactical pitch, squad list, bench, tactic, and save readiness.
- Empty slots use compact alert markers instead of large `missing`/`valid`
  labels.
- The pitch no longer overflows or overlaps on the checked desktop viewport.
- The squad table keeps a fixed-height scroll area.
- Narrow layout is dense but stable and readable enough for the current
  prototype. It should be reviewed again when the full Tactics section is built.

## Accessibility Review

Status: pass for current scope.

- Native selects, radios, and buttons preserve predictable keyboard behavior.
- Keyboard flow reaches formation, XI slots, bench slots, tactic options, and
  Save preparation.
- Focus rings remain visible in the dark retro-football theme.
- Validation is not color-only: unresolved slots expose alert markers and
  status text.
- Landmarks remain stable: top shell, left Inbox/Posta rail, and central content
  outlet.

## Football Identity Review

Status: pass.

- The workspace now reads more like a Championship Manager / Scudetto tactical
  surface: vertical pitch, squad table, substitutes, role-oriented player
  choice, and explicit preparation save.
- The manager chooses the football setup manually.
- The game does not recommend a best XI, auto-fill a bench, or show market/squad
  needs from this screen.

## Fun And Agency Review

Status: pass.

The section creates a real manager decision: before continuing, the user must
choose a formation, decide the XI, pick the bench, and choose a tactic. This is
more engaging than clearing a generic dashboard blocker because the blocked
state is resolved through a football action, not a form checkbox.

The best current source of tension is manual responsibility: the game exposes
facts and blockers, while the manager owns the choice. That matches the product
direction discussed for tactics and squad management.

## Known Non-Blocking Issues

- The narrow squad table is intentionally compact. It works, but a future
  mobile-specific tactical flow may need a stronger drawer/detail pattern.
- The current preparation state is still an in-memory web prototype. Real career
  save integration remains future work.
- Drag-and-drop is not implemented. Native controls are acceptable now because
  they keep the flow accessible and deterministic.
- The screen does not yet support in-match substitutions. That belongs to a
  future matchday/tactics phase.

## Improvement Decision

Do not add more tactical features inside Phase 54.

The section is complete enough for the next dependency: Inbox/Posta needs to
route users to this workspace and explain why the career stopped. The tactical
workspace can absorb future improvements without being rewritten because the
read model and reusable components now exist.

## Next Phase Recommendation

Recommended next phase:

`Phase 55 - Inbox/Posta Decision Center`

Reason:

The career loop now has a real resolvable attention event. Inbox/Posta can move
from compact rail to decision center without building on a weak preparation
screen.

## Verification

- `pnpm --filter @game/ui run typecheck`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- Phase 54 Playwright visual QA:
  `node --experimental-strip-types apps/web/src/visual-qa/tactics-workspace.spec.ts`
- `test -f docs/audits/WEB_TACTICS_WORKSPACE_VISUAL_QA.md`
- `pnpm depcruise`
- `pnpm check`
- `git diff --check`
