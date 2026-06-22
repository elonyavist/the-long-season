# Step 05 - Tactic Lineup And Condition Effect Audit

## Goal

Review whether manager choices affect match outcomes enough to be meaningful
without becoming an automatic win button.

This step focuses on user agency: tactics, selected lineup, role suitability,
and player condition should matter in ways the user can understand.

## Context

The current project supports saved tactics, manual tactic switches, lineup
overrides, role suitability, formation fit, and fitness lifecycle. These systems
are core to the eventual playable loop, so their calculator effects need a
quality review before adding more features.

## Expected files

- `docs/audits/MATCH_ENGINE_CALCULATOR_QUALITY_REVIEW.md`
- focused tests/diagnostics only if needed
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Compare deterministic outputs for:
  - balanced vs attacking setup;
  - balanced vs defensive setup;
  - first-team lineup vs rotated lineup;
  - fit lineup vs adapted/weak role usage when current tools support it;
  - fresh players vs low-fitness players when current tools support it.
- Evaluate whether effects are:
  - visible enough to matter;
  - not so strong that tactics dominate squad quality;
  - explainable through event mix, score, shots, goals against, or table impact.
- Check that manual tactical changes remain user-declared, not automatic.
- Record any need for future diagnostics, such as tactical effect trace, role fit
  penalty report, or condition impact report.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- Do not add automatic tactics.
- Do not add training, injuries, staff, morale, or scouting.
- Do not add UI.
- Do not rebalance tactics unless a narrow bug is proven.
- Do not start Step 06.

## Required checks

- focused tests for touched files
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-balanced`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-attacking`
- `pnpm cli simulate-season --seed=demo-001 --setup-demo=pro01-defensive`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `git diff --check`

## Definition of Done

- The audit states whether tactical, lineup, and condition effects currently
  support fun user agency.
- Any missing visibility is recorded as diagnostics/UI future work, not hidden.
- No automatic-tactic behavior is introduced.
- `docs/PROJECT_STATUS.md` points to Step 06 as the next active step.
