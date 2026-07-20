# Step 10 - Motion, Accessibility, Long-Run Gate, Cleanup And Phase Report

## Status

Done.

## Goal

Prove that the complete Phase 77 match loop is deterministic, credible,
accessible, visually premium, structurally clean, and safe across a complete
season before the project starts another section.

## User-Visible Outcome

The finished Matchday is stable and understandable across desktop, narrow,
keyboard, touch, 200% text, and reduced motion. Its pacing feels football-like,
decisions remain clear, and no animation, statistic, or command causes layout
growth, skipped facts, or a frozen-looking interface.

## Scope

1. Inventory every Phase 77 engine, UI, command, event, statistics, incident,
   AI, board, and Motion owner and remove superseded or unused paths.
2. Complete semantic Motion treatment for ordinary commentary, important
   events, goal emphasis, penalty signal/outcome, card/injury decision pause,
   substitution continuity, interval, and full time.
3. Verify reduced motion preserves facts, decision holds, commands, focus, and
   destinations without decorative transforms.
4. Verify keyboard, touch, screen-reader names, focus return, tab semantics,
   live-region behavior, contrast, non-color cues, and 200% text.
5. Verify no horizontal page overflow, cumulative commentary growth, unstable
   score/header dimensions, clipped tabellino, or inaccessible drag-only flow.
6. Run a 50-world one-complete-season deterministic gate using the canonical
   engine path.
7. Report distributions for possession, shots, shots on target, xG, corners,
   fouls, yellows, reds, injuries by severity, substitutions, AI changes,
   ratings, and selected result/table metrics.
8. Assert structural invariants: score/event agreement, 100% possession total,
   xG/shot coherence, card and dismissal consistency, max five substitutions,
   no re-entry, legal goalkeeper coverage, no duplicate player, no missing
   fixture commit, and same-seed reproducibility.
9. Classify anomalies by football meaning and user fun; do not tune thresholds
   merely to remove warnings.
10. Run package, browser, dependency, full monorepo, diff, and Graphify gates.
11. Update architecture and roadmaps with the final canonical live-match
    ownership and exactly one next-phase recommendation.
12. Finish `LIVE_MATCH_CONTROL_REPORT.md` with numerical, visual, accessibility,
    removed-code, residual-risk, and manual-inspection evidence.

## Implementation Contract

- Cleanup removes dead code only after current callers and tests prove the new
  owner is canonical.
- The long-run gate exercises real engine facts without browser rendering and
  does not weaken locked thresholds during execution.
- Motion remains web-only presentation and uses existing semantic categories.
- Browser QA uses the real local app and current SQLite/OPFS career journey.
- Any blocker discovered here is fixed within Phase 77 scope or recorded as a
  blocker; the next phase does not start around it.

## Expected Files

- Phase 77 production/test files from Steps 01-09 only where final defects or
  dead paths are found
- `packages/simulation-tools/` Phase 77 gate/report Modules and focused tests
- current CLI/report wiring only if required to run the documented gate
- `apps/web/src/visual-qa/current-product.spec.ts`
- existing shared Motion Modules only for production-used cleanup
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/steps/README.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`

## What NOT To Implement

- No new gameplay feature, competition, statistic, animation family, tactical
  command, content corpus, or next roadmap section.
- No warning suppression, target loosening, hardcoded seed exception, or
  cosmetic number normalization.
- No retained obsolete staged, half-time-only, UI-statistics, consequence,
  board, or motion path without an active tested caller.
- No broad unrelated refactor.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/ui run test
pnpm --filter @game/storage run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

Run the documented Phase 77 `50 worlds x 1 complete season` gate twice with
the same seed prefix and compare its structured hash/output.

## Manual Inspection

- Inspect the complete new-career to preparation to Matchday to Dashboard
  journey on desktop and narrow viewports.
- Inspect ordinary play, goal, penalty, cards, every injury decision, manual
  pause, AI change, substitutions, adaptation popover, half time, and full time.
- Repeat with keyboard-only, touch, 200% text, and reduced motion.
- Confirm the product remains readable with animation disabled and colors
  desaturated.
- Review outlier worlds as football stories and identify any result that harms
  decision quality or fun despite satisfying arithmetic bounds.

## Completion Criteria

- All ten Phase 77 steps are Done and every required gate passes.
- The 50-world season report is reproducible and has no structural failure.
- Matchday passes desktop/narrow/reduced-motion/accessibility visual inspection
  with no page overflow, cumulative feed growth, focus loss, or drag-only task.
- Architecture identifies one canonical minute session, statistics projection,
  incident lifecycle, AI policy, board command surface, and career commit path.
- Superseded and unused code is deleted.
- The final report explains distributions, accepted anomalies, remaining risks,
  and exactly one next-phase recommendation.
- Phase 77 is marked complete without starting the next phase.
