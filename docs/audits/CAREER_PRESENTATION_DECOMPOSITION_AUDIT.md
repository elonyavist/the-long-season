# Career Presentation Decomposition Audit

Date: 2026-06-23
Phase: `45-career-presentation-decomposition-and-view-model-readiness`
Step: `01-career-format-responsibility-audit`

## Summary

`apps/cli/src/commands/career/format.ts` is the largest remaining
presentation-only career file. It currently has useful locality because all
career output lives in one place, but at `1322` lines it is too broad for a
junior developer to trace quickly.

The right split is by output family, not by helper size. The command adapter
already stays fairly small at `apps/cli/src/commands/career.ts`; Phase 45 should
keep it that way and move only presentation ownership into named CLI-local
modules.

No source behavior should change in this audit step.

## Current Module Inventory

| File | Lines | Responsibility |
|---|---:|---|
| `apps/cli/src/commands/career.ts` | 373 | Career command storage/dispatch adapter. |
| `apps/cli/src/commands/career/format.ts` | 1322 | All localized career output, shared helper formatting, and some report-specific display calculations. |
| `apps/cli/src/commands/career/parse-career-args.ts` | 810 | Career argument parsing and validation. |
| `apps/cli/src/commands/career/preparation.ts` | 286 | Save-writing lineup/tactic preparation builders. |
| `apps/cli/src/commands/career/progression.ts` | 267 | Career matchday context/progression adapter. |
| `apps/cli/src/commands/career/scenarios.ts` | 301 | New-world and market-demo career scenario construction. |
| `apps/cli/src/commands/career/season-labs.ts` | 448 | Development report and season rollover lab builders. |
| `apps/cli/src/commands/career/types.ts` | 39 | CLI-local career type aliases. |

## Responsibility Map

### Market Apply Output

`formatCareerMarketApplyOutput` and helpers:

- `formatReasonLines`
- `formatRosterPersistedLines`
- `formatCareerTransferStatus`
- shared money/player/club helpers

This is a coherent output family and should eventually live in
`career/market-output.ts`. It is not the safest first move because it touches
`CareerMarketScenario`, `FakeLeagueSystem`, and transfer-result formatting.

### Overview Output

`formatNewCareerWorldOutput`, `formatCareerSummaryOutput`,
`formatCareerInspectOutput`, and helpers:

- `formatCareerWorldMetadataLines`
- `formatNextSelectedClubFixtureLines`
- `findNextSelectedClubFixture`
- `countPlayedSelectedClubFixtures`
- `formatCareerNationalitySummary`
- `formatCareerAgeSummary`
- `formatCareerProspectSummary`
- `formatTransferHistoryLines`
- `formatAffectedClubLines`
- `affectedClubIds`
- `findClubTransferBudget`

This is the safest Step 02 target. These outputs are read-only and already form
the first user-facing career screens: new-world preview, summary, and inspect.
They also expose the clearest future UI-view candidates without changing saves
or gameplay.

### Preparation Output

`formatCareerLineupSaveOutput`, `formatCareerTacticSaveOutput`, and helpers:

- `formatCareerMatchPreparationLines`
- `formatSavedLineupSlotLines`
- `formatLineupChangeLines`
- `formatLineupRole`
- `formatTacticSetup`
- `formatMentality`
- `formatTacticKnob`

This should move after overview because summary/inspect also show persisted
match preparation. The future module should expose a narrow helper for rendering
saved preparation when overview output needs it.

### Matchday Output

`formatCareerAdvanceOutput` and helpers:

- `formatCareerAdvanceRecoveryLines`
- `formatCareerAdvanceConditionLines`
- `restedFirstTeamConditionChanges`
- `formatConditionChangeLines`
- `formatFitnessRange`
- `formatCareerAdvanceInvalidReason`
- `formatCareerFixtureExplanationTraceOutput`
- explanation trace helpers for strength, tactic, lineup, condition, chance
  summary, bucket formatting, and variance markers.

This is coherent but broader than overview. It depends on `CareerAdvanceResult`
and `MatchExplanationTrace`, so it should move after preparation output is
already separated.

### Roster And Youth Output

`formatCareerSquadOutput`, `formatCareerYouthAcademyOutput`, and helpers:

- `formatCareerSquadPlayerLine`
- `formatCareerYouthPlayerLine`
- `formatUnknownNationality`
- `youthAbilityBand`
- `youthDevelopmentCategory`
- `averagePotentialRoom`
- `abilityValues`
- `formatPrimaryPosition`
- `roleRelevantCurrentAbility`
- `average`

This should become a player-facing roster module. It must keep hidden-potential
rules intact and must not add columns or expose raw hidden numbers.

### Development Report Output

`formatCareerDevelopmentReportOutput` and helpers:

- `formatDevelopmentExample`
- `formatDelta`

This can live with roster output if that keeps player-report locality, or in a
dedicated `development-output.ts` if the roster module becomes too broad.

### Season Rollover Output

`formatCareerSeasonRolloverOutput` and helpers:

- `formatCareerRolloverInvalidReason`
- shared club/date/money/signed-number helpers.

This is a separate output family from market and development, but it can be
split in the later market/rollover step because it is one of the remaining large
families after the player-facing modules move.

### Shared Helpers

These helpers are presentation infrastructure:

- `formatMoney`
- `formatSignedNumber`
- `playerLabel`
- `clubLabel`
- `presentationMessageKey`
- `compareAscii`

Do not create a shared helper module until at least two extracted modules need
the helper. If Step 02 needs some of them, move only the smallest set required
or keep them in `format.ts` until the second extracted module proves a real
shared need.

## Recommended Step 02 Target

Create:

`apps/cli/src/commands/career/overview-output.ts`

The module should own:

- new career world preview output;
- career summary output;
- career inspect output;
- world metadata lines;
- next selected-club fixture lines;
- selected-club transfer budget lookup needed by summary/inspect;
- transfer-history and affected-club inspection lines needed by inspect;
- selected-club nationality/age/prospect summaries needed by new-world preview.

`career/format.ts` should remain the public import surface for now only if it
keeps downstream imports smaller. If that would create pass-through wrappers,
update `career.ts` to import the moved functions directly.

## What Must Remain In `format.ts` For Now

Until later steps move their families, `format.ts` should still own:

- market apply output;
- lineup/tactic preparation save output;
- career advancement output and explanation trace formatting;
- squad/youth output;
- development report output;
- season rollover output;
- any helper still used by multiple unmoved families.

## Risks To Control

1. Overview extraction can accidentally duplicate helper logic. Remove the old
   helper from `format.ts` if no active caller remains.
2. `formatCareerMatchPreparationLines` is shared by summary/inspect and
   preparation output. Step 02 should either leave it in `format.ts` temporarily
   or keep the smallest local version until Step 03 owns it.
3. New-world preview uses `FakeLeagueSystem` for identity/prospect summaries.
   This is CLI presentation/report logic, not content generation; do not move it
   into content.
4. User-visible output spacing and ordering must remain stable.

## Verification For This Step

No source behavior changed. Verification:

- `git diff --check`

## Next Step Decision

Proceed with:

`docs/steps/45-career-presentation-decomposition-and-view-model-readiness/02-career-overview-output-module.md`

## Step 02 Implementation Note

Implemented:

- `apps/cli/src/commands/career/overview-output.ts` now owns new career world
  preview, career summary, and career inspect output.
- `apps/cli/src/commands/career.ts` imports the overview formatters directly
  instead of routing these three views through `career/format.ts`.
- `career/format.ts` no longer owns the three overview output functions.

Kept shared in `career/format.ts` for now:

- world metadata lines;
- next selected-club fixture lookup and formatting;
- selected-club played fixture counting;
- transfer-history and affected-club inspection lines;
- club/player/money/message-key helpers.

Reason:

These helpers are already used by non-overview output families such as career
advancement, squad, and youth-academy inspection. Moving them into the overview
module would create the wrong dependency direction, and duplicating them would
leave dead cleanup pressure. A dedicated helper module should be introduced only
when the next extracted families prove a stable shared boundary.

Verification:

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm check`
- `pnpm cli career --save=phase45-overview --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-overview --summary`
- `pnpm cli career --save=phase45-overview --inspect`
- `git diff --check`

Next:

`docs/steps/45-career-presentation-decomposition-and-view-model-readiness/03-career-preparation-output-module.md`

## Step 03 Implementation Note

Implemented:

- `apps/cli/src/commands/career/preparation-output.ts` now owns saved lineup
  output, saved tactic output, and persisted match-preparation lines used by
  summary and inspect.
- `career.ts` imports lineup/tactic save output directly from the preparation
  output module.
- `overview-output.ts` imports only the narrow
  `formatCareerMatchPreparationLines` helper from the preparation output module.
- `career/format.ts` no longer owns preparation output functions.

Kept shared in `career/format.ts` for now:

- `formatLineupRole`
- `formatTacticKnob`

Reason:

Those two helpers are still used by career match explanation output, which will
move in Step 04. Keeping them in `format.ts` avoids an import cycle while the
matchday family still lives there.

Verification:

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm check`
- `pnpm cli career --save=phase45-prep --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-prep --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase45-prep --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase45-prep --summary`
- `git diff --check`

Next:

`docs/steps/45-career-presentation-decomposition-and-view-model-readiness/04-career-matchday-output-module.md`

## Step 04 Implementation Note

Implemented:

- `apps/cli/src/commands/career/matchday-output.ts` now owns career fixture
  advancement output, no-next/invalid advancement output, pre-match recovery
  lines, post-match condition lines, and optional fixture explanation trace
  output.
- `career.ts` imports the advancement formatter directly from the matchday
  output module.
- `career/format.ts` no longer owns matchday advancement or explanation trace
  rendering.

Kept shared in `career/format.ts` for now:

- `formatSignedNumber`
- `compareAscii`
- club/player/fixture/tactic helper functions still needed by multiple extracted
  modules and remaining output families.

Reason:

Step 04 creates the second large extracted runtime presentation module. The
remaining helper pressure is now visible, but creating a broad helper module in
the middle of the phase would be a separate structural move. Step 07 should
decide whether these shared helpers stay in `format.ts` until the monolith is
empty or move to a focused `presentation-helpers` module.

Verification:

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm check`
- `pnpm cli career --save=phase45-matchday --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-matchday --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase45-matchday --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase45-matchday --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase45-matchday --summary`
- `git diff --check`

Next:

`docs/steps/45-career-presentation-decomposition-and-view-model-readiness/05-career-roster-and-development-output-module.md`

## Step 05 Implementation Note

Implemented:

- `apps/cli/src/commands/career/roster-output.ts` now owns selected squad and
  youth-academy inspection output, including player row formatting, role-relevant
  displayed ability, youth ability bands, and youth development labels.
- `apps/cli/src/commands/career/development-output.ts` now owns the multi-season
  development report output and player example formatting.
- `career.ts` imports these player-facing formatters directly.
- `career/format.ts` no longer owns squad, youth, or development report output.

Hidden-information note:

The move preserved the existing presentation rule: youth and squad reports show
derived bands/role-relevant display values only. No raw hidden potential or
scouting-only number was exposed.

Verification:

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm check`
- `pnpm cli career --save=phase45-roster --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-roster --squad`
- `pnpm cli career --save=phase45-roster --youth-academy`
- `pnpm cli career --save=phase45-roster --development-report`
- `git diff --check`

Next:

`docs/steps/45-career-presentation-decomposition-and-view-model-readiness/06-career-market-and-rollover-output-module.md`

## Step 06 Implementation Note

Implemented:

- `apps/cli/src/commands/career/market-output.ts` now owns permanent-transfer
  apply output, feasibility reason lines, roster persisted preview lines, and
  transfer status formatting.
- `apps/cli/src/commands/career/season-rollover-output.ts` now owns season
  rollover output and rollover invalid-reason formatting.
- `career.ts` imports market and rollover formatters directly.
- `career/format.ts` no longer owns broad output families.

Remaining `career/format.ts` responsibility:

`career/format.ts` is now a shared presentation helper module. It owns labels,
money, signed-number, fixture lookup/formatting, world metadata, transfer
history/affected club lines, stable ordering, and small role/tactic formatting
helpers used by multiple extracted modules.

Verification:

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/career.test.ts`
- `pnpm check`
- `pnpm cli career --save=phase45-market --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-market --apply-market-demo=pro01-affordable-permanent`
- `pnpm cli career --save=phase45-rollover --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase45-rollover --rollover-season`
  - Expected existing behavior: exits `1` because a freshly created season is
    incomplete, while still rendering localized invalid rollover output.
- `git diff --check`

Next:

`docs/steps/45-career-presentation-decomposition-and-view-model-readiness/07-career-presentation-boundary-review.md`
