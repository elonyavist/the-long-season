# Career Advancement Interface Contract

Date: 2026-06-25
Phase: `63-canonical-career-advancement-use-case`
Step: `02-interface-and-ordering-contract.md`

## Purpose

Define the Interface for one canonical career season advancement Module before
implementation.

The Module must improve locality: the order for season development, exits,
youth lifecycle, squad refresh, transfers, history, and time movement belongs
in one engine place. CLI, simulation-tools, and the future web UI should not
know that order.

## Chosen Module and Interface

Module path:

- `packages/engine/src/career/advance-career-season.ts`

Public Interface:

- `advanceCareerOneSeason(input: AdvanceCareerOneSeasonInput): AdvanceCareerOneSeasonResult`

Rationale:

- "OneSeason" makes the unit of advancement explicit.
- The Interface is broad enough for durable save rollover and report-only
  long-run refresh.
- The implementation can stay deep: callers provide state and content-derived
  candidates, then receive one updated state plus structured facts.

## Input shape

The implementation should use this shape or an equivalent shape with the same
semantics:

```ts
export interface AdvanceCareerOneSeasonInput {
  readonly careerState: CareerState;
  readonly worldSeed: string;
  readonly mode: AdvanceCareerOneSeasonMode;
  readonly playerDevelopmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
  readonly seniorIntakeCandidates?: readonly CareerIntakeCandidate[];
  readonly createSeniorIntakeCandidates?: (
    context: CareerSeniorIntakeCandidateProviderContext,
  ) => readonly CareerIntakeCandidate[];
  readonly youthIntakeCandidates?: readonly YouthIntakeCandidate[];
  readonly createYouthIntakeCandidates?: (
    context: CareerYouthIntakeCandidateProviderContext,
  ) => readonly YouthIntakeCandidate[];
  readonly allowSelectedClubYouthPromotion?: boolean;
}

export type AdvanceCareerOneSeasonMode =
  | AdvanceCareerCompletedSeasonMode
  | AdvanceCareerReportRefreshMode;

export interface AdvanceCareerCompletedSeasonMode {
  readonly kind: "completedSeason";
  readonly tableRules: LeagueTableRules;
}

export interface AdvanceCareerReportRefreshMode {
  readonly kind: "reportRefresh";
  readonly nextSeasonId: SeasonId;
  readonly nextSeasonStartDate: GameDate;
}
```

### Why two modes behind one Interface

The project has two legitimate callers:

- durable career rollover from a completed save season;
- report/long-run refresh after a simulated season that is not persisted as
  fixture-by-fixture career state.

Those callers differ in data availability, but they should not duplicate the
season refresh order. A mode field keeps one external seam while allowing the
implementation to validate each scenario precisely.

## Adapter-owned inputs

Adapters are responsible for providing content-derived inputs because engine
must not import `@game/content`.

Allowed Adapter responsibilities:

- choose or create the fake/generated league system;
- provide `LeagueTableRules` for `completedSeason` mode;
- generate senior intake candidates;
- generate seasonal youth intake candidates;
- optionally provide candidate-generator callbacks when candidates need the
  post-lifecycle or post-promotion state while keeping content imports outside
  the engine;
- choose the next report season id/date for `reportRefresh` mode;
- run batch loops;
- load/write saves;
- render output.

The engine consumes all eligible participation rows at the season boundary.
Adapters must not pass a partial player list because development checkpoint
keys close a whole season/month, not an arbitrary subset of its players.

Forbidden Adapter responsibilities:

- order development, exits, youth lifecycle, youth intake, promotions, squad
  maintenance, transfer turnover, calendar rollover, and dynamic-state rollover;
- mutate career time directly after the canonical Module exists;
- derive report facts by re-running advancement rules outside the Module.

## Result shape

The implementation should use this shape or an equivalent shape with the same
semantics:

```ts
export type AdvanceCareerOneSeasonResult =
  | AdvanceCareerOneSeasonAdvanced
  | AdvanceCareerOneSeasonInvalid
  | AdvanceCareerOneSeasonBlocked;

export interface AdvanceCareerOneSeasonAdvanced {
  readonly status: "advanced";
  readonly careerState: CareerState;
  readonly facts: CareerSeasonAdvancementFacts;
}

export interface AdvanceCareerOneSeasonInvalid {
  readonly status: "invalid";
  readonly careerState: CareerState;
  readonly reason: AdvanceCareerOneSeasonInvalidReason;
  readonly fixtureId?: FixtureId;
}

export interface AdvanceCareerOneSeasonBlocked {
  readonly status: "blocked";
  readonly careerState: CareerState;
  readonly reason: AdvanceCareerOneSeasonBlockedReason;
  readonly facts: CareerSeasonAdvancementFacts;
}
```

Invalid means the input state is structurally not safe to advance. Blocked
means the state is valid but advancing would require a manager decision.

Initial invalid reasons:

- `current_season_incomplete`;
- `fixture_missing`;
- `fixture_home_club_not_found`;
- `fixture_away_club_not_found`;
- `no_current_season_fixtures`;
- `multiple_current_season_competitions`;
- `season_table_empty`;
- `selected_club_not_in_table`.

Initial blocked reasons:

- `selected_club_youth_decision_required`.

If no selected-club youth blocker is implemented in this phase, the Module must
still return facts for selected-club youth promotion candidates so a later
phase can stop the user before the next season.

## Structured facts

Facts must be language-agnostic and stable:

```ts
export interface CareerSeasonAdvancementFacts {
  readonly mode: "completedSeason" | "reportRefresh";
  readonly selectedClubId: ClubId;
  readonly previousSeasonId: SeasonId;
  readonly nextSeasonId: SeasonId;
  readonly previousDate: GameDate;
  readonly nextSeasonStartDate: GameDate;
  readonly seasonArchive?: CareerSeasonArchiveFact;
  readonly playerDevelopment: CareerPlayerDevelopmentFact;
  readonly playerExits: CareerPlayerExitFact;
  readonly youthLifecycle: CareerYouthLifecycleFact;
  readonly youthIntake: CareerYouthIntakeFact;
  readonly youthPromotions: CareerYouthPromotionFact;
  readonly squadMaintenance: CareerSquadMaintenanceFact;
  readonly transferTurnover: CareerTransferTurnoverFact;
  readonly squadHealth: CareerSquadHealthFact;
  readonly youthHealth: CareerYouthHealthFact;
  readonly warnings: readonly CareerSeasonAdvancementWarning[];
}
```

Minimum facts required for Phase 63:

- previous and next season id;
- previous and next date;
- selected club id;
- archived-season facts for durable rollover;
- player development change count, growth count, decline count, total growth,
  total decline;
- exit count and counts by reason;
- youth lifecycle record count, promotion-candidate count,
  external-move-candidate count, release count, and selected-club decision
  count;
- youth intake candidate count and accepted player count;
- youth promotion candidate/promoted counts;
- squad-maintenance added-player count and warning count;
- transfer-turnover movement count;
- senior/youth/active player counts;
- minimum/average/maximum senior squad size;
- minimum/average/maximum youth roster size;
- clubs below minimum squad size;
- clubs without natural goalkeeper;
- clubs above/below youth roster target.

Facts are not prose. Presentation Adapters may translate fact keys later.

## Canonical operation order

The Module must execute the following order:

1. Capture `previousSeasonId` and `previousDate`.
2. If `mode.kind === "completedSeason"`:
   - validate current-season completion;
   - generate next-season calendar;
   - compute final table with Adapter-provided `tableRules`;
   - compute aggregate goals;
   - build one season archive entry.
3. Derive the development season id from the current season and next season
   context.
4. Develop senior players.
5. Apply end-of-season player exits.
6. Apply youth academy lifecycle.
7. Apply seasonal youth intake using Adapter-provided candidates.
8. Promote youth candidates using `allowSelectedClubYouthPromotion`, defaulting
   to `false`.
9. Maintain senior squad shape using Adapter-provided senior intake candidates.
10. Simulate transfer turnover.
11. If `mode.kind === "completedSeason"`:
    - merge generated next-season fixtures;
    - append the archive entry;
    - clear saved match preparation.
12. Move date and current season id to the next season through
    `rolloverPlayersForNextSeason`.
13. Return copied career state plus structured facts.

## Preservation rules

- Do not simulate selected-club unplayed fixtures inside this Module.
- Do not choose selected-club lineup, tactic, bench, youth promotion, or
  transfer decisions inside this Module.
- Do not import content, storage, i18n, CLI, web, or UI code.
- Do not render text.
- Do not tune gameplay.
- Do not mutate input state.

## Expected migration plan

### CLI durable rollover

Current caller:

- `apps/cli/src/commands/career/season-labs.ts`

Migration:

- keep command parsing and save writing in CLI;
- build `completedSeason` input with table rules from content;
- call `advanceCareerOneSeason`;
- render facts through `season-rollover-output.ts`.

### CLI development report

Current caller:

- `apps/cli/src/commands/career/season-labs.ts`

Migration:

- keep report inspection-only;
- either call `advanceCareerOneSeason` repeatedly in `reportRefresh` mode or
  document the development report as a forecast Adapter if exact seven-year
  behavior cannot be preserved without adding fake season refresh side effects.

Preferred approach for Phase 63:

- call `advanceCareerOneSeason` repeatedly with empty intake candidates and
  report-only next season id/date, then aggregate selected-club development
  facts.

### Ten-season report and long-run gate

Current caller:

- `apps/cli/src/commands/ten-season-report/report-data.ts`

Migration:

- keep `runCareerLongRunSimulation`;
- keep content candidate generation in `report-data.ts`;
- replace `advanceCareerForReport` orchestration with
  `advanceCareerOneSeason(...mode: "reportRefresh")`;
- map returned facts to `CareerLongRunRefreshSummary`.

## Open decisions

No product decision blocks implementation.

Implementation decisions left to Step 03:

- exact TypeScript names for fact subtypes;
- whether selected-club youth decisions return `blocked` immediately in
  durable mode or are only emitted as facts for a later Inbox/Posta phase;
- whether report-refresh next-season ids use the existing synthetic
  `:long-run-N` form for output stability or the domain numeric increment
  helper.

## Career web roadmap check

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` remains checked for this step.
Phase 63 does not mark a web-section task complete. Its main relevance to the
web roadmap is future readiness: the web must call a read-model/Adapter around
this Module instead of parsing CLI output or reimplementing advancement order.
