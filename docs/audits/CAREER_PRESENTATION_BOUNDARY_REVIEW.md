# Career Presentation Boundary Review

Date: 2026-06-23
Phase: `45-career-presentation-decomposition-and-view-model-readiness`
Step: `07-career-presentation-boundary-review`

## Summary

Phase 45 split the career CLI presentation layer by output family. The career
command is now easier to follow from entry point to rendered output:

1. `career.ts` parses intent, loads/writes saves, calls composition helpers, and
   dispatches to one output module.
2. `career/*-output.ts` modules render one product area each.
3. `career/format.ts` is no longer a broad renderer; it is a shared helper
   module.

No UI view-model contracts were created in this phase. The current boundary is
still CLI-local by design.

## Pure CLI Renderers

These modules primarily convert already-built facts into localized CLI lines:

- `apps/cli/src/commands/career/overview-output.ts`
  - new-world preview;
  - career summary;
  - career inspect.
- `apps/cli/src/commands/career/preparation-output.ts`
  - saved lineup output;
  - saved tactic output;
  - match-preparation summary lines.
- `apps/cli/src/commands/career/matchday-output.ts`
  - career fixture advancement;
  - recovery/condition consequence lines;
  - optional explanation trace.
- `apps/cli/src/commands/career/roster-output.ts`
  - senior squad inspection;
  - youth academy inspection.
- `apps/cli/src/commands/career/development-output.ts`
  - multi-season development report.
- `apps/cli/src/commands/career/market-output.ts`
  - permanent-transfer apply result.
- `apps/cli/src/commands/career/season-rollover-output.ts`
  - season rollover result.

## Builder-Like Modules

These modules still build structured facts before output:

- `apps/cli/src/commands/career/scenarios.ts`
  - creates career saves from generated worlds and market demo scenarios.
- `apps/cli/src/commands/career/preparation.ts`
  - persists selected lineup/tactic preparation.
- `apps/cli/src/commands/career/progression.ts`
  - prepares save-driven match contexts and calls engine career progression.
- `apps/cli/src/commands/career/season-labs.ts`
  - builds development and rollover lab results.

These are not presentation modules and should not absorb rendering logic.

## Shared Presentation Helpers

`apps/cli/src/commands/career/format.ts` now owns only shared CLI presentation
helpers:

- club/player labels;
- money and signed-number formatting;
- fixture metadata lookup/formatting;
- transfer-history and affected-club inspection lines;
- stable ASCII sorting;
- role/tactic key formatting;
- localized message-key construction.

This shape is acceptable for now because several extracted output modules share
these helpers. A future cleanup can rename it to `presentation-helpers.ts`, but
that is cosmetic unless the current filename causes confusion.

## Future UI View-Model Candidates

Good candidates for future structured UI-facing builders:

- Career overview:
  - save metadata;
  - selected club;
  - next fixture;
  - transfer history;
  - match preparation.
- Matchday:
  - advanced fixture result;
  - pre-match recovery;
  - post-match condition changes;
  - explanation trace sections.
- Roster and youth:
  - senior squad rows;
  - youth academy rows;
  - derived ability/development bands.
- Market:
  - accepted/rejected status;
  - budget before/after;
  - roster preview;
  - willingness/rejection reasons.

Do not add these builders until there is a real UI consumer. Until then, the CLI
renderer modules are easier to maintain.

## Remaining Hotspots

1. `apps/cli/src/commands/career/parse-career-args.ts`
   - 810 lines.
   - Still broad because it owns career command intent parsing and help text.
   - Recommended next action: split only when adding or reorganizing career
     commands, not as part of presentation cleanup.

2. `apps/cli/src/commands/career/season-labs.ts`
   - 448 lines.
   - Still mixes development-report and rollover lab construction.
   - Recommended next action: split if career lab commands grow again.

3. `apps/cli/src/commands/ten-season-report.ts`
   - Still the major CLI presentation/report hotspot outside career.
   - Recommended next action: future phase after the career presentation phase,
     because it has separate long-run report concerns.

## Recommendation

Close Phase 45 after the final report. Do not start UI work yet from this phase.
The career CLI presentation boundary is now clean enough to support a later UI
slice without carrying the old monolithic `career/format.ts` shape forward.
