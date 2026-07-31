# Step 08 - Integrated Browser, Accessibility And Regression Closeout

## Status

Done.

## Goal

Verify all five accepted reworks together, remove obsolete paths, and freeze a
clean UI baseline before the Phase 80 closeout and Phase 80A handoff.

## What To Verify

- Potential stars distinguish achieved, conservative, uncertain, empty, and
  exceptional-six segments in Market, Squad, and both detail workspaces.
- Market filter/sort/pagination order, `250 ms` typed delay, immediate selects,
  age clamping, result count, and focus are correct.
- Squad age/order/search timing, placement commands, contextual menu, and row
  selection remain correct.
- Read-only and editable money is exact and locale-aware across supported
  languages.
- Transfer-offer drafts survive scrolling, tabs, and accidental light-dismiss
  interaction.
- Desktop, narrow, touch, keyboard, focus restoration, reduced motion, and
  relevant `200%` text paths pass.
- No replaced renderer, parser, local pagination rule, duplicate debounce
  helper, or Market-specific dialog workaround remains.

## What To Implement

- Add or refine only integration/regression evidence missing from Steps 03-07.
- Run the full repository, build, dependency, and browser gates.
- Record a concise Phase 80 implementation audit with screenshots/check
  results and manual-inspection targets.
- Fix failures in their owning Step 03-07 scope before marking this step Done.

## What NOT To Implement

- No new product feature, gameplay/economy tuning, save reset, threshold
  change, or long run.
- No broad visual redesign beyond `P80-R01..P80-R05`.
- No suppressing browser assertions to manufacture a pass.

## Expected Files

- `apps/web/src/visual-qa/current-product.spec.ts`
- `docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_REPORT.md`
- `docs/audits/README.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- `docs/steps/80-graphical-and-structural-rework/README.md`
- `docs/steps/80-graphical-and-structural-rework/08-integrated-browser-accessibility-and-regression-closeout.md`
- files already owned by Steps 03-07, only when fixing a discovered regression

## Required Checks

```bash
pnpm check
pnpm --filter @game/web run build
pnpm depcruise
pnpm web:visual:qa
git diff --check
graphify update .
```

No long run belongs to this step.

## Definition Of Done

- All five inventory items pass together in the supported browser journeys.
- Repository, build, dependency, full Playwright, diff, and Graphify checks
  pass.
- Manual inspection targets and any residual monitor items are documented.
- No obsolete or duplicate implementation path remains.
- Step 09 is the only next action; no long run has started.
