# Manual Tactical Changes V1 Steps

## Goal

Let the manager prepare multiple tactical setups and manually choose when to switch during a match.

## Why we implement it this way

Phase 08 proved that a selected lineup/tactic setup can change deterministic output, but applying one aggressive setup for a whole season is not how classic football managers are played. In Football Manager and older Scudetto-style games, the user prepares tactical options and decides when to use them.

This phase should move toward that model without building a live match UI yet. The system must support explicit manager intent: "start balanced, switch to attacking at minute 46" is valid; "if losing at halftime, automatically switch to attacking" is out of scope.

This keeps responsibility clear. The user chooses. The engine applies the chosen setup from the declared minute. The CLI only inspects the behavior.

## What to implement

- Review the current Phase 08 tactic/lineup output and decide whether the demo profile naming and behavior are good enough to build on.
- Add a tiny set of deterministic saved tactic profiles for CLI inspection, such as balanced, attacking, and defensive.
- Define a narrow engine contract for manual match tactic changes or match tactical segments.
- Apply one explicit manual tactic switch during one fixture simulation.
- Expose a CLI inspection path that shows the profile timeline and resulting fixture detail.
- Preserve deterministic output and keep all ordering explicit.
- Make it clear in output and docs that the switch is user-declared, not system-selected.

## What NOT to implement

- Do not add automatic tactical AI that changes setup based on score, minute, or match context.
- Do not implement live interactive match sessions, auto-pause commands, substitutions, team talks, tactical familiarity, fatigue, form, morale, injuries, cards, penalties, set-piece takers, player ratings, possession, or xG.
- Do not implement React UI, tactical board UI, web app, desktop app, storage, saves, career mode, market, contracts, economy, board pressure, staff, scouting, youth, facilities, media, localization, modding editor, or launch work.
- Do not tune scoring rates, conversion probabilities, calibration targets, fake content generation, or team-strength formulas unless a specific active step proves a measured regression and documents the fix.
- Do not store rendered prose in domain events or reports.

## Allowed dependencies

- `domain -> nothing`
- `engine -> domain, shared`
- `content -> domain, shared`
- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `simulation-tools -> domain, engine, shared`

## Expected files

- `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md`
- `docs/steps/09-manual-tactical-changes-v1/02-saved-tactic-demo-profiles.md`
- `docs/steps/09-manual-tactical-changes-v1/03-manual-tactic-change-contract.md`
- `docs/steps/09-manual-tactical-changes-v1/04-segmented-fixture-simulation.md`
- `docs/steps/09-manual-tactical-changes-v1/05-cli-manual-tactic-switch-inspection.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.

## Definition of Done

- Phase 09 has a documented incremental path from Phase 08 review to CLI-visible manual tactic switching.
- The first active step is a review/check step, so the project does not add new tactical switching scope on top of an unreviewed Phase 08 result.
- Saved profiles, engine contract, segmented simulation, and CLI inspection are split into separate steps.
- The phase explicitly bans automatic tactical switching.
- The project still has exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and `docs/steps/09-manual-tactical-changes-v1/01-phase-8-output-review.md`. Review current Phase 08 output before implementing manual tactic switching. Update `docs/PROJECT_STATUS.md` with the decision and stop.
