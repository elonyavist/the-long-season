import {
  accruePlayerFixtureParticipations,
  createEmptyPlayerParticipationLedger,
  EMPTY_PLAYER_AVAILABILITY,
  formationSlotCoordinate,
  isCanonicalPlayerRole,
  playerUnavailabilityReason,
} from "@game/domain";
import {
  type CareerPlayerAvailabilityState,
  type CompetitionMatchRules,
  type AppliedMatchSubstitution,
  type MatchTacticalCommandRecord,
  type LiveMatchTeamState,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
  type PlayerStateCurvesConfig,
  type PlayerFixtureParticipationContribution,
  type PlayerParticipationLedger,
  type MatchPlayerConsequence,
  type MatchTacticsCalibrationConfig,
  type SelectedLineup,
  type TacticSetup,
  type ClubId,
  type CompetitionId,
  type Formation,
  type FormationKey,
  type Fixture,
  type FixtureId,
  type GameDate,
  type GameState,
  type LeagueTableRow,
  type LeagueTableRules,
  type LateralFocus,
  type Round,
  type SeasonId,
} from "@game/domain";
import { diffDays } from "@game/shared";

import { createMatchReport } from "../match-engine/create-match-report.ts";
import {
  buildPlayerMatchRatings,
  buildTacticTeamContext,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
  type LineupSlot,
  type MatchContext,
  type MatchEngineConfig,
  type MatchStepEvent,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  playerRatingRegistrationsFromContext,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
  assembleMatchTeamContext,
  deriveTeamStrength,
  matchPlayerIncidentProfilesForLineup,
  type TeamStrength,
  TeamStrengthError,
} from "../match-engine/index.ts";
import {
  runMatchSimulation,
  type SimulateMatchResult,
} from "../match-engine/match-simulation-runner.ts";
import {
  recoverFitnessForPlayers,
  spendFitnessForMinutes,
  type FitnessRules,
} from "../player-state/index.ts";
import { generateRoundRobinCalendar } from "../season-engine/calendar.ts";
import { computeLeagueTable } from "../season-engine/league-table.ts";
import {
  computeSeasonPlayerGoalStats,
  computeSeasonPlayerSummaryStats,
  type SeasonPlayerGoalStatRow,
  type SeasonPlayerSummaryStatRow,
  type SeasonPlayerStatRegistration,
} from "../season-engine/player-stats.ts";
import {
  AiSquadSelectionError,
  buildAiSquadMatchTeamContext,
  evaluateOwnSquadTacticalPolicies,
  runAutomatedProgressiveMatch,
  type AiInGameDecisionReasonKey,
  type AiInGameReplacementFailureKey,
  type AutomatedProgressiveAiDecision,
  type CatalogShapeChoice,
} from "../team-selection/index.ts";
import {
  derivePublicPlayerAssessment,
  type PublicPlayerAssessment,
} from "../squad/public-player-assessment.ts";
import {
  buildFixtureParticipationContributions,
  recentPlayerUseForFixture,
} from "../career/player-participation.ts";
import { selectAcademyCallUpPlayerIds } from "../career/career-ai-team-selection.ts";
import { applyMatchAvailabilityConsequences } from "../career/match-availability-consequences.ts";
import { applyMatchReportToFixture } from "./apply-match-report-to-fixture.ts";

/**
 * Optional AI squad-selection rules for one simulated club.
 *
 * When omitted, the team keeps the fixed lineup supplied by the caller. When
 * present, the season use-case can rebuild the AI lineup fixture by fixture
 * from the current roster, formation, and dynamic player states.
 */
export interface SimulateSeasonAiSquadSelection {
  /**
   * Optional imposed formation.
   *
   * Locked analysis profiles pass one to preserve their population. Ordinary
   * career reports omit it so the canonical selector chooses the best catalog
   * shape for the footballers available on that fixture date.
   */
  readonly formation?: Formation;
  /** Public projection policy used to assess candidates on each fixture date. */
  readonly potentialProjectionPolicy: PlayerPotentialProjectionPolicyConfig;
  /** Global rating scale paired with the projection policy. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Maximum substitutes to include in diagnostics. */
  readonly benchSize?: number;
  /** Explicit ordinary senior candidates; defaults to every player in the team lookup. */
  readonly rosterPlayerIds?: readonly PlayerId[];
  /** Same-club academy candidates from which at most three dated call-ups are selected. */
  readonly callUpPlayerIds?: readonly PlayerId[];
  /** Candidates tried only when the ordinary roster cannot produce a legal squad. */
  readonly emergencyPlayerIds?: readonly PlayerId[];
}

/**
 * Team data required to simulate all fixtures for one club.
 */
export interface SimulateSeasonTeamInput {
  /** Explicit ordered lineup used for every match in this first milestone. */
  readonly lineup: readonly LineupSlot[];
  /**
   * Player lookup for the lineup.
   *
   * Required, together with `roleWeights`, because department strength and
   * intrinsic tactical shape are both derived here from the same scoring pass.
   * A caller-supplied precomputed strength used to live on this input; it was
   * removed because it is derivable, and because a stored strength could end up
   * describing a different lineup than the shape simulated beside it.
   */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Role profiles for the lineup. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Tactical distribution input for every match in this first milestone. */
  readonly tacticalDistribution: MatchTacticalDistributionInput;
  /**
   * Static player states used when no fitness lifecycle supplies live ones.
   *
   * A caller who wants condition reflected in a season without running the
   * lifecycle supplies it here. `SimulateSeasonInput.fitnessLifecycle` always
   * wins when both are present, because those states are the current ones.
   */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional state curves used only when season fitness lifecycle is enabled. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
  /** Optional AI selector for fixture-by-fixture lineups. */
  readonly aiSelection?: SimulateSeasonAiSquadSelection;
}

/**
 * Explicit selected setup override for one club in one season simulation.
 *
 * The override is self-contained so the season use-case can build a replacement
 * match-team context without reading content packages or mutating base team
 * input. The array order in `SimulateSeasonInput.setupOverrides` is the only
 * traversal order used for duplicate checks.
 */
export interface SimulateSeasonSetupOverride {
  /** Club whose fixed season setup should be replaced. */
  readonly clubId: ClubId;
  /** Selected lineup to use for this club in every fixture. */
  readonly lineup: SelectedLineup;
  /** Tactical setup to use for this club in every fixture. */
  readonly tactic: TacticSetup;
  /** Explicit required lineup size for this override. */
  readonly requiredLineupSize: number;
  /** Player lookup available to the selected lineup. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Role profiles available to the selected lineup. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional dynamic states used only when multiplier curves are supplied. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional state multiplier curves for deriving team strength. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
}

/**
 * Explicit lineup override for one club in one generated fixture.
 *
 * This contract represents caller intent only: "use this ordered lineup for
 * this club in this fixture." It deliberately contains no fatigue heuristics,
 * recommendations, or automatic selection rules.
 */
export interface SimulateSeasonFixtureLineupOverride {
  /** Fixture whose lineup should be overridden. */
  readonly fixtureId: FixtureId;
  /** Club whose lineup should be overridden inside the fixture. */
  readonly clubId: ClubId;
  /** Ordered selected match lineup. */
  readonly lineup: readonly LineupSlot[];
  /** Explicit lineup size expected by the caller for this fixture. */
  readonly requiredLineupSize: number;
  /** Player lookup available to the selected lineup. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Role profiles available to the selected lineup. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional dynamic states used only when multiplier curves are supplied. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional state multiplier curves for deriving team strength. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
}

/**
 * Optional dynamic fitness lifecycle for one simulated season.
 *
 * The lifecycle is explicit and opt-in. Existing callers that omit it keep using
 * precomputed team strength, while callers that provide it get deterministic
 * recovery before each new fixture date and fitness spend after each played
 * fixture.
 */
export interface SimulateSeasonFitnessLifecycle {
  /** Current player-state lookup at season start. The use-case never mutates it. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Explicit ordered players who recover between match dates. */
  readonly playerIds: readonly PlayerId[];
  /** Complete player facts for age/resilience recovery derivation. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Versioned recovery content selected by the composition root. */
  readonly recoveryPolicy: PlayerStateCurvesConfig;
  /** Optional fitness rules; defaults are used when omitted. */
  readonly rules?: FitnessRules;
}

/**
 * Optional career facts carried through an automatic competition season.
 *
 * Callers pass the previous competition or season result back in rather than
 * resetting injuries, suspensions, or recent use at an adapter boundary.
 */
export interface SimulateSeasonAvailabilityLifecycle {
  /** Availability entering the first generated fixture. */
  readonly availability?: CareerPlayerAvailabilityState;
  /** Participation ledger entering the first generated fixture. */
  readonly participationLedger?: PlayerParticipationLedger;
  /** Stable career seed used by canonical injury-duration derivation. */
  readonly worldSeed: string;
}

/**
 * Input for deterministic one-season simulation.
 */
export interface SimulateSeasonInput {
  /** Run seed used by schedule and match RNG streams. */
  readonly seed: string;
  /** Season identity used by generated fixtures. */
  readonly seasonId: SeasonId;
  /** Competition identity used by generated fixtures. */
  readonly competitionId: CompetitionId;
  /** Explicit ordered competition participants. */
  readonly clubIds: readonly ClubId[];
  /** First round date. */
  readonly seasonStartDate: GameDate;
  /** Team simulation data keyed by club ID. */
  readonly teamsByClubId: Readonly<Record<ClubId, SimulateSeasonTeamInput>>;
  /** Ordered selected setup overrides for clubs that should not use base team input. */
  readonly setupOverrides?: readonly SimulateSeasonSetupOverride[];
  /** Ordered explicit lineup overrides for individual generated fixtures. */
  readonly fixtureLineupOverrides?: readonly SimulateSeasonFixtureLineupOverride[];
  /** Optional dynamic fitness lifecycle applied across the simulated season. */
  readonly fitnessLifecycle?: SimulateSeasonFitnessLifecycle;
  /** Optional availability and recent-use lifecycle for automatic selection. */
  readonly availabilityLifecycle?: SimulateSeasonAvailabilityLifecycle;
  /** Competition-owned substitution and suspension rules. */
  readonly matchRules: CompetitionMatchRules;
  /** Match engine config reused for each fixture. */
  readonly matchEngineConfig: MatchEngineConfig;
  /** Versioned match-tactics calibration reused for every team context. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Competition point rules for the final derived table. */
  readonly tableRules: LeagueTableRules;
  /**
   * Analysis-only paired replay using an absolute department-contest scale.
   *
   * The canonical season remains untouched. The replay shares its selected
   * players, seed and policy and contributes only a second table for causal
   * diagnostics. Phase 81A closeout owns removal of this oracle seam.
   */
  readonly analysisStrengthGapScale?: number;
  /** Retains compact fixture-dated age/load alternatives for the locked Phase 81A owner audit. */
  readonly collectSelectionLoadDiagnostics?: boolean;
  /** Retains exact selector-stage IDs for the locked Phase 81A squad-use audit. */
  readonly collectSquadUseDiagnostics?: boolean;
}

/**
 * Result of one deterministic season simulation.
 */
export interface SimulateSeasonResult {
  /** Ordered generated rounds. */
  readonly rounds: readonly Round[];
  /** Ordered fixture IDs across the season. */
  readonly fixtureIds: readonly FixtureId[];
  /** Ordered fixtures after match reports have been applied. */
  readonly fixtures: readonly Fixture[];
  /** Canonical fixture participation in the same stable fixture order. */
  readonly fixtureParticipation: readonly SimulateSeasonFixtureParticipation[];
  /** Final derived league table. */
  readonly table: readonly LeagueTableRow[];
  /** Best defense by goals against, using table order as tie-breaker. */
  readonly bestDefense: LeagueTableRow | undefined;
  /** Worst attack by goals for, using table order as tie-breaker. */
  readonly worstAttack: LeagueTableRow | undefined;
  /** Derived player goal statistics for the simulated season. */
  readonly playerGoalStats: readonly SeasonPlayerGoalStatRow[];
  /** Derived player summary statistics for currently supported season facts. */
  readonly playerSummaryStats: readonly SeasonPlayerSummaryStatRow[];
  /** Compact opportunity facts whose creator nomination is not durable after the match. */
  readonly playerOpportunityStats: readonly SeasonPlayerOpportunityStatRow[];
  /** Final dynamic player states when a fitness lifecycle was supplied. */
  readonly finalPlayerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Final availability when its lifecycle was supplied. */
  readonly finalPlayerAvailability?: CareerPlayerAvailabilityState;
  /** Ordered match consequences emitted by that lifecycle. */
  readonly playerAvailabilityConsequences?: readonly MatchPlayerConsequence[];
  /** Final participation ledger when its lifecycle was supplied. */
  readonly finalPlayerParticipationLedger?: PlayerParticipationLedger;
  /** Paired analysis table, absent from every ordinary product caller. */
  readonly analysisStrengthReplay?: {
    readonly scale: number;
    readonly table: readonly LeagueTableRow[];
  };
}

/** Canonical player-participation contributions produced by one batch fixture. */
export interface SimulateSeasonFixtureParticipation {
  /** Fixture whose committed match facts produced these contributions. */
  readonly fixtureId: FixtureId;
  /** Exact contributions ready for the career participation ledger. */
  readonly contributions: readonly PlayerFixtureParticipationContribution[];
  /** Exact kickoff selections consumed by the match engine. */
  readonly fieldedTeams: SimulateSeasonFixtureFieldedTeams;
  /** Non-derivable automatic progression facts from the same session. */
  readonly progression: SimulateSeasonFixtureProgression;
  /** Table positions frozen before any fixture in this round was applied. */
  readonly preMatchTable: SimulateSeasonFixturePreMatchTable;
}

/** One side's minimal non-derivable league-table state at kickoff. */
export interface SimulateSeasonFixtureTablePosition {
  readonly position: number;
  readonly played: number;
}

/** Both sides' table state from the canonical snapshot preceding their round. */
export interface SimulateSeasonFixturePreMatchTable {
  readonly home: SimulateSeasonFixtureTablePosition;
  readonly away: SimulateSeasonFixtureTablePosition;
}

/** Compact exact facts required to reconcile automatic match control. */
export interface SimulateSeasonFixtureProgression {
  readonly controlledSides: readonly ("home" | "away")[];
  readonly aiDecisionCount: Readonly<Record<"home" | "away", number>>;
  readonly aiCommandCount: Readonly<Record<"home" | "away", number>>;
  /** Exact policy reasons; accepted commands cannot reconstruct rejected/no-change decisions. */
  readonly aiReasonCounts: Readonly<Record<
    "home" | "away",
    Readonly<Record<AiInGameDecisionReasonKey, number>>
  >>;
  /** Exact replacement-funnel failures emitted with no-legal-substitute reasons. */
  readonly aiReplacementFailureCounts: Readonly<Record<
    "home" | "away",
    Readonly<Record<AiInGameReplacementFailureKey, number>>
  >>;
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  readonly finalLineups: Readonly<Record<"home" | "away", readonly LineupSlot[]>>;
}

/** Why one kickoff XI used its recorded shape. */
export type SimulateSeasonFormationSelectionSource =
  | "catalog_ai"
  | "imposed_ai"
  | "fixed_lineup"
  | "setup_override"
  | "fixture_lineup_override";

/** One side's actual kickoff selection, retained without reconstruction. */
export interface SimulateSeasonFixtureFieldedTeam {
  readonly clubId: ClubId;
  readonly lineup: readonly LineupSlot[];
  /** Exact lineup strength consumed by the match context at kickoff. */
  readonly kickoffStrength?: TeamStrength;
  /** Absent only when a caller supplied a lineup without a catalog shape. */
  readonly formationKey?: FormationKey;
  readonly selectionSource: SimulateSeasonFormationSelectionSource;
  /** Exact instructions present in the match context consumed at kickoff. */
  readonly tacticalDistribution: MatchTacticalDistributionInput;
  /** Exact in-memory route focus consumed at kickoff. */
  readonly lateralFocus: LateralFocus;
  /** Catalog diagnostics from the same selector walk; absent for imposed shapes. */
  readonly catalogChoice?: CatalogShapeChoice;
  /** Exact weak/invalid kickoff slots emitted by the selector, never reconstructed later. */
  readonly outOfPositionSlotCount?: number;
  /** Exact invalid kickoff slots; weak but credible cover is deliberately separate. */
  readonly invalidLineupSlotCount?: number;
  /** Academy call-ups actually selected into this match-day squad. */
  readonly callUpPlayerIds?: readonly PlayerId[];
  /** Exact emergency candidates selected into the XI or bench; absent when none were needed. */
  readonly emergencyPlayerIds?: readonly PlayerId[];
  /** Exact lifecycle inputs consumed by automatic selection; absent for override/fixed callers. */
  readonly lifecycleDiagnostics?: {
    readonly unavailableSelectedPlayerCount: number;
    readonly recentUsePlayerCount: number;
  };
  /** Analysis-only exact alternatives from the candidate pool consumed at kickoff. */
  readonly selectionLoadDiagnostics?: {
    readonly veteranStarterCount: number;
    readonly qualityMatchedYoungerAlternativeCount: number;
    readonly fresherQualityMatchedYoungerAlternativeCount: number;
  };
  /** Analysis-only exact stages consumed by the canonical fixture selector. */
  readonly squadUseDiagnostics?: {
    readonly candidatePlayerIds: readonly PlayerId[];
    readonly availablePlayerIds: readonly PlayerId[];
    readonly selectorPoolPlayerIds: readonly PlayerId[];
    readonly matchdayPlayerIds: readonly PlayerId[];
  };
}

/** One player's compact season opportunity facts retained before match reports discard creator nominations. */
export interface SeasonPlayerOpportunityStatRow {
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  /** Shot outcomes; this is also the shooter-nomination count by construction. */
  readonly shots: number;
  readonly shotsOnTarget: number;
  /** Pre-resolution creator selections; penalties deliberately have no creator. */
  readonly creatorNominations: number;
}

interface MutableSeasonPlayerOpportunityStatRow {
  readonly playerId: PlayerId;
  clubId: ClubId;
  shots: number;
  shotsOnTarget: number;
  creatorNominations: number;
  clubIsRegistrationOnly: boolean;
}

/** Both selections actually consumed by one simulated fixture. */
export interface SimulateSeasonFixtureFieldedTeams {
  readonly home: SimulateSeasonFixtureFieldedTeam;
  readonly away: SimulateSeasonFixtureFieldedTeam;
}

/** Error categories exposed by season simulation. */
export type SimulateSeasonErrorCode =
  | "missing_fixture"
  | "missing_team"
  | "duplicate_setup_override"
  | "duplicate_fixture_lineup_override"
  | "invalid_setup_override"
  | "invalid_fixture_lineup_override"
  | "invalid_fitness_lifecycle"
  | "invalid_analysis_strength_gap_scale"
  | "invalid_ai_squad_selection";

/**
 * Typed error thrown when a season cannot be simulated from its input.
 */
export class SimulateSeasonError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: SimulateSeasonErrorCode;
  /** Club owning the invalid selection when the failure is club-scoped. */
  public readonly clubId?: ClubId;

  /**
   * Creates a season-simulation error.
   */
  public constructor(code: SimulateSeasonErrorCode, message: string, clubId?: ClubId) {
    super(message);
    this.name = "SimulateSeasonError";
    this.code = code;
    if (clubId !== undefined) this.clubId = clubId;
  }
}

/**
 * Validated fixture-lineup overrides in both lookup and caller order.
 *
 * The lookup keeps match-context selection local and cheap, while `ordered`
 * preserves the caller-provided simulation order for player registrations.
 */
interface OrderedFixtureLineupOverrides {
  /** Override lookup keyed by fixture ID plus club ID. */
  readonly byKey: Readonly<Record<string, SimulateSeasonFixtureLineupOverride>>;
  /** Explicit override order supplied by the caller. */
  readonly ordered: readonly SimulateSeasonFixtureLineupOverride[];
}

/**
 * Simulates one deterministic double round-robin season and derives its table.
 *
 * The use-case does not persist state. It generates fixtures, simulates each
 * match, applies reports to fixture results, and computes the final table.
 */
export function simulateSeason(input: SimulateSeasonInput): SimulateSeasonResult {
  const calendar = generateRoundRobinCalendar({
    seed: input.seed,
    seasonId: input.seasonId,
    competitionId: input.competitionId,
    clubIds: input.clubIds,
    seasonStartDate: input.seasonStartDate,
  });
  const setupOverrides = setupOverridesByClubId(input);
  const fixtureLineupOverrides = fixtureLineupOverridesByKey(input, fixturesById(calendar.fixtures));
  let fitnessRuntime = initialFitnessRuntime(input);
  let availabilityRuntime = initialAvailabilityRuntime(input);
  let state = createFixtureState(input, fixturesById(calendar.fixtures), calendar.fixtureIds);
  let analysisState = input.analysisStrengthGapScale === undefined
    ? undefined
    : createFixtureState(input, fixturesById(calendar.fixtures), calendar.fixtureIds);
  validateAnalysisStrengthGapScale(input.analysisStrengthGapScale);
  const fixtureParticipation: SimulateSeasonFixtureParticipation[] = [];
  const opportunityStats = new Map<PlayerId, MutableSeasonPlayerOpportunityStatRow>();
  let preRoundTable: readonly LeagueTableRow[] = [];
  let preRoundNumber = 0;

  for (const fixtureId of calendar.fixtureIds) {
    const fixture = state.fixtures[fixtureId];

    if (fixture === undefined) {
      throw new SimulateSeasonError("missing_fixture", `Missing generated fixture: ${fixtureId}`);
    }

    if (fixture.roundNumber !== preRoundNumber) {
      preRoundNumber = fixture.roundNumber;
      preRoundTable = computeLeagueTable({
        clubIds: input.clubIds,
        fixtures: state.fixtures,
        fixtureIds: state.fixtureIds,
        rules: input.tableRules,
      });
    }
    const preMatchTable = fixturePreMatchTable(fixture, preRoundTable);

    fitnessRuntime = recoverFitnessBeforeFixture(input, fixture, fitnessRuntime);

    const matchSetup = matchSetupForFixture(
      input,
      fixture,
      setupOverrides,
      fixtureLineupOverrides,
      fitnessRuntime?.playerStates,
      availabilityRuntime,
    );
    const matchContext = matchSetup.matchContext;
    const completed = completeSeasonFixture(
      input,
      matchSetup,
      fitnessRuntime?.playerStates,
    );
    const simulatedMatch = completed.result;
    collectPlayerOpportunityStats(opportunityStats, simulatedMatch.events, matchContext);
    const tacticalContext = {
      home: {
        formation: matchSetup.home.formationKey ?? "not_observed",
        lateralFocus: matchSetup.home.lateralFocus,
      },
      away: {
        formation: matchSetup.away.formationKey ?? "not_observed",
        lateralFocus: matchSetup.away.lateralFocus,
      },
      commands: completed.tacticalCommandFacts,
    } as const;
    const report = createMatchReport(simulatedMatch, tacticalContext);
    const contributions = buildFixtureParticipationContributions({
      fixtureId,
      seasonId: input.seasonId,
      fixtureDate: fixture.date,
      finalMinute: simulatedMatch.finalMinute,
      sides: [
        {
          side: "home",
          initialContext: matchContext.home,
          finalContext: completed.finalContext.home,
          benchPlayerIds: matchSetup.home.benchPlayerIds,
        },
        {
          side: "away",
          initialContext: matchContext.away,
          finalContext: completed.finalContext.away,
          benchPlayerIds: matchSetup.away.benchPlayerIds,
        },
      ],
      appliedSubstitutions: completed.progression.appliedSubstitutions,
      playerExits: playerExitsFromCompletedMatch(simulatedMatch, completed.finalContext),
      playerRatings: buildPlayerMatchRatings({
        events: simulatedMatch.events,
        playerRegistrations: playerRatingRegistrationsFromContext(matchContext),
      }),
    }).contributions;
    fixtureParticipation.push({
      fixtureId,
      fieldedTeams: {
        home: fieldedTeamForFixture(fixture.homeClubId, matchSetup.home),
        away: fieldedTeamForFixture(fixture.awayClubId, matchSetup.away),
      },
      progression: completed.progression,
      contributions,
      preMatchTable,
    });
    state = applyMatchReportToFixture({ state, fixtureId, report });
    if (analysisState !== undefined && input.analysisStrengthGapScale !== undefined) {
      const analysisCompleted = completeSeasonFixture(
        input,
        matchSetup,
        fitnessRuntime?.playerStates,
        input.analysisStrengthGapScale,
      );
      analysisState = applyMatchReportToFixture({
        state: analysisState,
        fixtureId,
        report: createMatchReport(analysisCompleted.result, {
          ...tacticalContext,
          commands: analysisCompleted.tacticalCommandFacts,
        }),
      });
    }
    fitnessRuntime = spendFitnessAfterFixture(input, fixture, contributions, fitnessRuntime);
    availabilityRuntime = advanceAvailabilityAfterFixture(
      input,
      fixture,
      report,
      contributions,
      availabilityRuntime,
    );
  }

  const table = computeLeagueTable({
    clubIds: input.clubIds,
    fixtures: state.fixtures,
    fixtureIds: state.fixtureIds,
    rules: input.tableRules,
  });

  const registeredPlayers = playerRegistrations(input, setupOverrides, fixtureLineupOverrides);

  return {
    rounds: calendar.rounds,
    fixtureIds: state.fixtureIds,
    fixtures: orderedFixtures(state.fixtures, state.fixtureIds),
    fixtureParticipation,
    table,
    bestDefense: bestDefense(table),
    worstAttack: worstAttack(table),
    playerGoalStats: computeSeasonPlayerGoalStats({
      fixtures: state.fixtures,
      fixtureIds: state.fixtureIds,
      playerRegistrations: registeredPlayers,
    }),
    playerSummaryStats: computeSeasonPlayerSummaryStats({
      fixtures: state.fixtures,
      fixtureIds: state.fixtureIds,
      playerRegistrations: registeredPlayers,
    }),
    playerOpportunityStats: seasonPlayerOpportunityStats(opportunityStats, registeredPlayers),
    ...(fitnessRuntime === undefined ? {} : { finalPlayerStates: fitnessRuntime.playerStates }),
    ...(availabilityRuntime === undefined
      ? {}
      : {
          finalPlayerAvailability: availabilityRuntime.availability,
          playerAvailabilityConsequences: availabilityRuntime.consequences,
          finalPlayerParticipationLedger: consolidatedParticipationLedger(availabilityRuntime),
        }),
    ...(analysisState === undefined || input.analysisStrengthGapScale === undefined
      ? {}
      : {
          analysisStrengthReplay: {
            scale: input.analysisStrengthGapScale,
            table: computeLeagueTable({
              clubIds: input.clubIds,
              fixtures: analysisState.fixtures,
              fixtureIds: analysisState.fixtureIds,
              rules: input.tableRules,
            }),
          },
        }),
  };
}

/**
 * Reads only the two non-derivable rows needed after the round has completed.
 *
 * The table is snapshotted once per round by `simulateSeason`; looking it up
 * here prevents sequential fixtures on the same date from seeing each other.
 */
function fixturePreMatchTable(
  fixture: Fixture,
  table: readonly LeagueTableRow[],
): SimulateSeasonFixturePreMatchTable {
  const home = table.find(({ clubId }) => clubId === fixture.homeClubId);
  const away = table.find(({ clubId }) => clubId === fixture.awayClubId);
  if (home === undefined || away === undefined) {
    throw new SimulateSeasonError("missing_fixture", `Pre-match table row is missing: ${fixture.id}`);
  }
  return {
    home: { position: home.position, played: home.played },
    away: { position: away.position, played: away.played },
  };
}

/**
 * Creates the temporary fixture state used while applying match reports.
 */
function createFixtureState(
  input: SimulateSeasonInput,
  fixtures: Readonly<Record<FixtureId, Fixture>>,
  fixtureIds: readonly FixtureId[],
): GameState {
  return {
    meta: {
      seed: input.seed,
      rngAlgorithmVersion: "sfc32-v1",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: input.seasonStartDate,
      currentSeasonId: input.seasonId,
    },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: {},
    clubIds: input.clubIds,
    fixtures,
    fixtureIds,
  };
}

/**
 * Builds one match context from fixture sides and season team data.
 */
interface FixtureTeamSetup {
  /** Match-engine team context chosen for this exact fixture. */
  readonly teamContext: MatchTeamContext;
  /** Exact bench selected alongside the XI, empty for fixed-lineup callers. */
  readonly benchPlayerIds: readonly PlayerId[];
  /** Explicit kickoff focus; fixed analysis callers stay balanced. */
  readonly lateralFocus: LateralFocus;
  /** Detailed live team present when the canonical AI selected this squad. */
  readonly liveTeam?: LiveMatchTeamState;
  /** Exact catalog shape consumed by the match, when the caller supplied one. */
  readonly formationKey?: FormationKey;
  /** Selection path used to build this exact kickoff context. */
  readonly selectionSource: SimulateSeasonFormationSelectionSource;
  /** Diagnostics retained only when the catalog selector made the choice. */
  readonly catalogChoice?: CatalogShapeChoice;
  /** Exact weak/invalid kickoff slots emitted by the selector. */
  readonly outOfPositionSlotCount?: number;
  /** Exact invalid kickoff slots emitted by the selector. */
  readonly invalidLineupSlotCount?: number;
  /** Academy call-ups actually selected into this match-day squad. */
  readonly callUpPlayerIds?: readonly PlayerId[];
  /** Exact emergency candidates selected into this matchday squad. */
  readonly emergencyPlayerIds?: readonly PlayerId[];
  /** Non-reconstructible lifecycle inputs consumed by the automatic selector. */
  readonly lifecycleDiagnostics?: SimulateSeasonFixtureFieldedTeam["lifecycleDiagnostics"];
  /** Analysis-only compact age/load contrast from the exact selector input. */
  readonly selectionLoadDiagnostics?: SimulateSeasonFixtureFieldedTeam["selectionLoadDiagnostics"];
  /** Analysis-only exact squad-use stages from the same selector input. */
  readonly squadUseDiagnostics?: SimulateSeasonFixtureFieldedTeam["squadUseDiagnostics"];
}

interface FixtureMatchSetup {
  /** Match context consumed by the deterministic simulator. */
  readonly matchContext: MatchContext;
  /** Home selection facts retained for participation accrual. */
  readonly home: FixtureTeamSetup;
  /** Away selection facts retained for participation accrual. */
  readonly away: FixtureTeamSetup;
}

function matchSetupForFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  setupOverrides: Readonly<Record<ClubId, SimulateSeasonSetupOverride>>,
  fixtureLineupOverrides: OrderedFixtureLineupOverrides,
  playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>,
  availabilityRuntime?: SeasonAvailabilityRuntime,
): FixtureMatchSetup {
  const home = fixtureTeamSetup(
    input,
    fixture,
    fixture.homeClubId,
    setupOverrides,
    fixtureLineupOverrides,
    playerStates,
    availabilityRuntime,
  );
  const away = fixtureTeamSetup(
    input,
    fixture,
    fixture.awayClubId,
    setupOverrides,
    fixtureLineupOverrides,
    playerStates,
    availabilityRuntime,
  );

  return {
    home,
    away,
    matchContext: {
      fixtureId: fixture.id,
      seed: input.seed,
      home: home.teamContext,
      away: away.teamContext,
      engineConfig: input.matchEngineConfig,
      matchTacticsCalibration: input.matchTacticsCalibration,
    },
  };
}

interface CompletedSeasonFixture {
  readonly result: SimulateMatchResult;
  readonly finalContext: MatchContext;
  readonly progression: SimulateSeasonFixtureProgression;
  /** Accepted progressive commands, already ordered by the live session. */
  readonly tacticalCommandFacts: readonly MatchTacticalCommandRecord[];
}

function validateAnalysisStrengthGapScale(scale: number | undefined): void {
  if (scale === undefined) return;
  if (!Number.isFinite(scale) || scale < 1 || scale > 2) {
    throw new SimulateSeasonError(
      "invalid_analysis_strength_gap_scale",
      `Analysis strength-gap scale must be inside 1..2: ${scale}`,
    );
  }
}

function strengthGapOverrideMatchContext(context: MatchContext, scale: number): MatchContext {
  return {
    ...context,
    engineConfig: {
      ...context.engineConfig,
      strengthGapMultiplier: scale,
    },
  };
}

/** Uses AI progression when both selected squads expose a real bench. */
function completeSeasonFixture(
  input: SimulateSeasonInput,
  setup: FixtureMatchSetup,
  livePlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined,
  analysisStrengthGapScale?: number,
): CompletedSeasonFixture {
  const matchContext = analysisStrengthGapScale === undefined
    ? setup.matchContext
    : strengthGapOverrideMatchContext(setup.matchContext, analysisStrengthGapScale);
  const home = setup.home.liveTeam;
  const away = setup.away.liveTeam;
  if (home === undefined || away === undefined) {
    const result = runMatchSimulation({ context: matchContext });
    return {
      result,
      finalContext: matchContext,
      progression: {
        controlledSides: [],
        aiDecisionCount: { home: 0, away: 0 },
        aiCommandCount: { home: 0, away: 0 },
        aiReasonCounts: {
          home: aiReasonCounts([], "home"),
          away: aiReasonCounts([], "away"),
        },
        aiReplacementFailureCounts: {
          home: aiReplacementFailureCounts([], "home"),
          away: aiReplacementFailureCounts([], "away"),
        },
        appliedSubstitutions: [],
        finalLineups: {
          home: matchContext.home.lineup,
          away: matchContext.away.lineup,
        },
      },
      tacticalCommandFacts: [],
    };
  }

  const completed = runAutomatedProgressiveMatch({
    context: matchContext,
    rules: input.matchRules,
    players: playersForFixture(input, setup.matchContext),
    home,
    away,
    aiControlledSides: input.matchEngineConfig.minuteCount === 90
      ? ["home", "away"]
      : [],
    lateralFocusBySide: {
      home: setup.home.lateralFocus,
      away: setup.away.lateralFocus,
    },
    buildMatchTeamContext: (team, playerCondition) => {
      const rebuilt = rebuildLiveTeamContext(
        input,
        setup.matchContext,
        team,
        livePlayerStates,
        playerCondition,
      );
      return rebuilt;
    },
  });
  const state = completed.state;
  const aiDecisionCount = {
    home: completed.decisions.filter(({ side }) => side === "home").length,
    away: completed.decisions.filter(({ side }) => side === "away").length,
  };
  const aiCommandCount = {
    home: completed.decisions.filter(({ side, facts }) => side === "home" && facts.length > 0).length,
    away: completed.decisions.filter(({ side, facts }) => side === "away" && facts.length > 0).length,
  };
  const aiReasonCountBySide = {
    home: aiReasonCounts(completed.decisions, "home"),
    away: aiReasonCounts(completed.decisions, "away"),
  };
  const aiReplacementFailureCountBySide = {
    home: aiReplacementFailureCounts(completed.decisions, "home"),
    away: aiReplacementFailureCounts(completed.decisions, "away"),
  };
  return {
    result: {
      fixtureId: matchContext.fixtureId,
      finalMinute: state.simulation.minute,
      isComplete: state.phase === "full_time",
      score: state.simulation.score,
      stats: state.simulation.stats,
      events: state.events,
    },
    finalContext: state.simulation.context,
    progression: {
      controlledSides: input.matchEngineConfig.minuteCount === 90
        ? ["home", "away"]
        : [],
      aiDecisionCount,
      aiCommandCount,
      aiReasonCounts: aiReasonCountBySide,
      aiReplacementFailureCounts: aiReplacementFailureCountBySide,
      appliedSubstitutions: state.appliedSubstitutions,
      finalLineups: {
        home: state.simulation.context.home.lineup,
        away: state.simulation.context.away.lineup,
      },
    },
    tacticalCommandFacts: state.appliedTacticalCommandFacts,
  };
}

/** Counts canonical policy reasons without retaining every per-minute decision object. */
function aiReasonCounts(
  decisions: readonly AutomatedProgressiveAiDecision[],
  side: "home" | "away",
): Readonly<Record<AiInGameDecisionReasonKey, number>> {
  const counts = {
    forced_injury_replacement: 0,
    dismissal_reorganization: 0,
    low_condition: 0,
    poor_performance: 0,
    trailing_response: 0,
    protecting_lead: 0,
    no_legal_substitute: 0,
    no_material_change: 0,
    command_rejected: 0,
  } satisfies Record<AiInGameDecisionReasonKey, number>;

  for (const decision of decisions) {
    if (decision.side !== side) continue;
    for (const { reasonKey } of decision.selection.reasons) counts[reasonKey] += 1;
  }
  return counts;
}

/** Counts exact replacement-funnel failures beside their parent decision reasons. */
function aiReplacementFailureCounts(
  decisions: readonly AutomatedProgressiveAiDecision[],
  side: "home" | "away",
): Readonly<Record<AiInGameReplacementFailureKey, number>> {
  const counts = {
    substitution_limit: 0,
    no_available_bench: 0,
    no_positionally_credible_bench: 0,
    quality_floor: 0,
  } satisfies Record<AiInGameReplacementFailureKey, number>;
  for (const decision of decisions) {
    if (decision.side !== side) continue;
    for (const { replacementFailureKey } of decision.selection.reasons) {
      if (replacementFailureKey !== undefined) counts[replacementFailureKey] += 1;
    }
  }
  return counts;
}

/** Merges the two disjoint club lookups without relying on object order. */
function playersForFixture(
  input: SimulateSeasonInput,
  context: MatchContext,
): Readonly<Record<PlayerId, Player>> {
  const homePlayers = baseTeamInput(input, context.home.clubId).players;
  const awayPlayers = baseTeamInput(input, context.away.clubId).players;
  return { ...homePlayers, ...awayPlayers };
}

/** Rebuilds strength only after the canonical command has been accepted. */
function rebuildLiveTeamContext(
  input: SimulateSeasonInput,
  context: MatchContext,
  liveTeam: LiveMatchTeamState,
  livePlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined,
  playerCondition: Readonly<Partial<Record<PlayerId, number>>>,
): MatchTeamContext {
  const clubId = liveTeam.side === "home" ? context.home.clubId : context.away.clubId;
  const team = baseTeamInput(input, clubId);
  const playerStates = playerStatesAtLiveCondition(
    livePlayerStates ?? team.playerStates,
    liveTeam,
    playerCondition,
  );
  return buildTacticTeamContext({
    lineup: {
      clubId,
      slots: liveTeam.lineup.map((slot) => ({
        slotKey: slot.slotId,
        playerId: slot.playerId,
        canonicalRole: slot.role,
      })),
    },
    tactic: liveTeam.tactic,
    requiredLineupSize: liveTeam.lineup.length,
    players: team.players,
    roleWeights: team.roleWeights,
    matchTacticsCalibration: input.matchTacticsCalibration,
    ...(playerStates === undefined ? {} : { playerStates }),
    ...(playerStates === undefined || team.stateMultiplierCurves === undefined
      ? {}
      : { stateMultiplierCurves: team.stateMultiplierCurves }),
  });
}

function playerStatesAtLiveCondition(
  playerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined,
  team: LiveMatchTeamState,
  playerCondition: Readonly<Partial<Record<PlayerId, number>>>,
): Readonly<Record<PlayerId, PlayerDynamicState>> | undefined {
  if (playerStates === undefined) return undefined;
  const next = { ...playerStates };
  for (const { playerId } of team.lineup) {
    const current = next[playerId];
    const condition = playerCondition[playerId];
    if (current !== undefined && condition !== undefined) {
      next[playerId] = { ...current, fitness: condition as PlayerDynamicState["fitness"] };
    }
  }
  return next;
}

/** Retains only incident events that actually removed a player from the XI. */
function playerExitsFromCompletedMatch(
  result: SimulateMatchResult,
  finalContext: MatchContext,
): readonly {
  readonly side: "home" | "away";
  readonly playerId: PlayerId;
  readonly minute: number;
}[] {
  return result.events.flatMap((event) => {
    if (
      event.type !== "red_card"
      && event.type !== "second_yellow_card"
      && event.type !== "injury"
    ) return [];
    const finalLineup = event.side === "home" ? finalContext.home.lineup : finalContext.away.lineup;
    if (finalLineup.some(({ playerId }) => playerId === event.playerId)) return [];
    return [{ side: event.side, playerId: event.playerId, minute: event.minute }];
  });
}

/** Runtime fitness state carried while the season loop walks fixture dates. */
interface SeasonFitnessRuntime {
  /** Latest player states after recovery/spend. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Last fixture date already processed, used to compute deterministic rest days. */
  readonly previousFixtureDate?: GameDate;
}

/** Availability and recent-use state carried in fixture order. */
interface SeasonAvailabilityRuntime {
  readonly availability: CareerPlayerAvailabilityState;
  readonly participationLedger: PlayerParticipationLedger;
  /** One current month of ordered facts, consolidated when the month changes. */
  readonly pendingContributions: readonly PlayerFixtureParticipationContribution[];
  readonly consequences: readonly MatchPlayerConsequence[];
}

/**
 * Builds one side context for a fixture.
 */
function fixtureTeamSetup(
  input: SimulateSeasonInput,
  fixture: Fixture,
  clubId: ClubId,
  setupOverrides: Readonly<Record<ClubId, SimulateSeasonSetupOverride>>,
  fixtureLineupOverrides: OrderedFixtureLineupOverrides,
  playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>,
  availabilityRuntime?: SeasonAvailabilityRuntime,
): FixtureTeamSetup {
  const setupOverride = setupOverrides[clubId];
  const fixtureLineupOverride = fixtureLineupOverrides.byKey[fixtureLineupOverrideKey(fixture.id, clubId)];

  if (fixtureLineupOverride !== undefined) {
    const tacticalDistribution = setupOverride === undefined
      ? baseTeamInput(input, clubId).tacticalDistribution
      : buildSetupOverrideContext(
          setupOverride,
          input.matchTacticsCalibration,
          playerStates ?? setupOverride.playerStates,
        ).tacticalDistribution;

    return {
      teamContext: buildFixtureLineupOverrideContext(
        fixtureLineupOverride,
        clubId,
        tacticalDistribution,
        input.matchTacticsCalibration,
        playerStates ?? fixtureLineupOverride.playerStates,
      ),
      benchPlayerIds: [],
      lateralFocus: "balanced",
      selectionSource: "fixture_lineup_override",
    };
  }

  if (setupOverride !== undefined) {
    return {
      teamContext: buildSetupOverrideContext(
        setupOverride,
        input.matchTacticsCalibration,
        playerStates ?? setupOverride.playerStates,
      ),
      benchPlayerIds: [],
      lateralFocus: "balanced",
      selectionSource: "setup_override",
    };
  }

  const team = baseTeamInput(input, clubId);

  if (team.aiSelection !== undefined) {
    return aiSelectedMatchTeamContext(
      clubId,
      team,
      input.matchTacticsCalibration,
      playerStates,
      fixture,
      availabilityRuntime,
      input.collectSelectionLoadDiagnostics === true,
      input.collectSquadUseDiagnostics === true,
    );
  }

  return {
    teamContext: fixedLineupMatchTeamContext(clubId, team, input.matchTacticsCalibration, playerStates),
    benchPlayerIds: [],
    lateralFocus: "balanced",
    selectionSource: "fixed_lineup",
  };
}

/** Copies the exact kickoff selection into the durable season result. */
function fieldedTeamForFixture(
  clubId: ClubId,
  setup: FixtureTeamSetup,
): SimulateSeasonFixtureFieldedTeam {
  return {
    clubId,
    lineup: setup.teamContext.lineup,
    kickoffStrength: { ...setup.teamContext.strength },
    selectionSource: setup.selectionSource,
    tacticalDistribution: { ...setup.teamContext.tacticalDistribution },
    lateralFocus: setup.lateralFocus,
    ...(setup.formationKey === undefined ? {} : { formationKey: setup.formationKey }),
    ...(setup.catalogChoice === undefined ? {} : { catalogChoice: setup.catalogChoice }),
    ...(setup.outOfPositionSlotCount === undefined
      ? {}
      : { outOfPositionSlotCount: setup.outOfPositionSlotCount }),
    ...(setup.invalidLineupSlotCount === undefined
      ? {}
      : { invalidLineupSlotCount: setup.invalidLineupSlotCount }),
    ...(setup.callUpPlayerIds === undefined ? {} : { callUpPlayerIds: setup.callUpPlayerIds }),
    ...(setup.emergencyPlayerIds === undefined ? {} : { emergencyPlayerIds: setup.emergencyPlayerIds }),
    ...(setup.lifecycleDiagnostics === undefined ? {} : { lifecycleDiagnostics: setup.lifecycleDiagnostics }),
    ...(setup.selectionLoadDiagnostics === undefined
      ? {}
      : { selectionLoadDiagnostics: setup.selectionLoadDiagnostics }),
    ...(setup.squadUseDiagnostics === undefined
      ? {}
      : { squadUseDiagnostics: setup.squadUseDiagnostics }),
  };
}

/** Captures the one player fact durable reports intentionally cannot reconstruct. */
function collectPlayerOpportunityStats(
  rows: Map<PlayerId, MutableSeasonPlayerOpportunityStatRow>,
  events: readonly MatchStepEvent[],
  context: MatchContext,
): void {
  for (const event of events) {
    if (event.type === "penalty_outcome" && event.outcome !== "scored") {
      const clubId = event.side === "home" ? context.home.clubId : context.away.clubId;
      const taker = opportunityStatRow(rows, event.takerPlayerId, clubId, false);
      taker.shots += 1;
      taker.shotsOnTarget += event.outcome === "saved" ? 1 : 0;
      continue;
    }
    if (event.type !== "shot_outcome") continue;
    const clubId = event.side === "home" ? context.home.clubId : context.away.clubId;
    const shooterPlayerId = event.outcome === "goal"
      ? event.scorerPlayerId
      : event.shooterPlayerId;
    const shooter = opportunityStatRow(rows, shooterPlayerId, clubId, false);
    shooter.shots += 1;
    shooter.shotsOnTarget += event.isShotOnTarget ? 1 : 0;
    if (event.selectedCreatorPlayerId !== undefined) {
      opportunityStatRow(rows, event.selectedCreatorPlayerId, clubId, false).creatorNominations += 1;
    }
  }
}

/** Adds registered zero rows and freezes one deterministic season table. */
function seasonPlayerOpportunityStats(
  rows: Map<PlayerId, MutableSeasonPlayerOpportunityStatRow>,
  registrations: readonly SeasonPlayerStatRegistration[],
): readonly SeasonPlayerOpportunityStatRow[] {
  for (const registration of registrations) {
    opportunityStatRow(rows, registration.playerId, registration.clubId, true);
  }
  return [...rows.values()]
    .sort((left, right) =>
      String(left.clubId).localeCompare(String(right.clubId))
      || String(left.playerId).localeCompare(String(right.playerId)))
    .map(({ playerId, clubId, shots, shotsOnTarget, creatorNominations }) => ({
      playerId,
      clubId,
      shots,
      shotsOnTarget,
      creatorNominations,
    }));
}

/** Finds or creates one row while preferring the club observed in a real event. */
function opportunityStatRow(
  rows: Map<PlayerId, MutableSeasonPlayerOpportunityStatRow>,
  playerId: PlayerId,
  clubId: ClubId,
  registrationOnly: boolean,
): MutableSeasonPlayerOpportunityStatRow {
  const existing = rows.get(playerId);
  if (existing !== undefined) {
    if (!registrationOnly && existing.clubIsRegistrationOnly) {
      existing.clubId = clubId;
      existing.clubIsRegistrationOnly = false;
    }
    return existing;
  }
  const created: MutableSeasonPlayerOpportunityStatRow = {
    playerId,
    clubId,
    shots: 0,
    shotsOnTarget: 0,
    creatorNominations: 0,
    clubIsRegistrationOnly: registrationOnly,
  };
  rows.set(playerId, created);
  return created;
}

/**
 * Builds explicit player registrations from fixed season lineups.
 */
function playerRegistrations(
  input: SimulateSeasonInput,
  setupOverrides: Readonly<Record<ClubId, SimulateSeasonSetupOverride>>,
  fixtureLineupOverrides: OrderedFixtureLineupOverrides,
): readonly SeasonPlayerStatRegistration[] {
  const registrations: SeasonPlayerStatRegistration[] = [];

  for (const clubId of input.clubIds) {
    const registrationPlayerIds = seasonPlayerIdsForRegistration(input, clubId, setupOverrides);

    for (const playerId of registrationPlayerIds) {
      registrations.push({
        playerId,
        clubId,
      });
    }
  }

  for (const override of fixtureLineupOverrides.ordered) {
    for (const slot of override.lineup) {
      registrations.push({
        playerId: slot.playerId,
        clubId: override.clubId,
      });
    }
  }

  return registrations;
}

/**
 * Resolves the season-level lineup used for zero-row player registrations.
 */
function seasonPlayerIdsForRegistration(
  input: SimulateSeasonInput,
  clubId: ClubId,
  setupOverrides: Readonly<Record<ClubId, SimulateSeasonSetupOverride>>,
): readonly PlayerId[] {
  const setupOverride = setupOverrides[clubId];

  if (setupOverride !== undefined) {
    return buildSetupOverrideContext(
      setupOverride,
      input.matchTacticsCalibration,
      setupOverride.playerStates,
    ).lineup.map((slot) => slot.playerId);
  }

  const team = baseTeamInput(input, clubId);
  if (team.aiSelection !== undefined) {
    return aiSelectionCandidatePlayerIds(team);
  }

  return team.lineup.map((slot) => slot.playerId);
}

/**
 * Indexes explicit setup overrides by club while validating duplicates.
 */
function setupOverridesByClubId(input: SimulateSeasonInput): Readonly<Record<ClubId, SimulateSeasonSetupOverride>> {
  const overrides: Record<ClubId, SimulateSeasonSetupOverride> = {};
  const seenClubIds = new Set<ClubId>();

  for (const override of input.setupOverrides ?? []) {
    if (seenClubIds.has(override.clubId)) {
      throw new SimulateSeasonError("duplicate_setup_override", `Duplicate setup override for club: ${override.clubId}`);
    }

    const baseTeam = input.teamsByClubId[override.clubId];
    if (baseTeam === undefined) {
      throw new SimulateSeasonError("missing_team", `Missing base team input for setup override: ${override.clubId}`);
    }

    seenClubIds.add(override.clubId);
    overrides[override.clubId] = override;
  }

  return overrides;
}

/**
 * Indexes fixture lineup overrides by fixture/club while validating input.
 */
function fixtureLineupOverridesByKey(
  input: SimulateSeasonInput,
  fixtures: Readonly<Record<FixtureId, Fixture>>,
): OrderedFixtureLineupOverrides {
  const overrides: Record<string, SimulateSeasonFixtureLineupOverride> = {};
  const orderedOverrides: SimulateSeasonFixtureLineupOverride[] = [];
  const seenOverrideKeys = new Set<string>();

  for (const override of input.fixtureLineupOverrides ?? []) {
    const overrideKey = fixtureLineupOverrideKey(override.fixtureId, override.clubId);

    if (seenOverrideKeys.has(overrideKey)) {
      throw new SimulateSeasonError(
        "duplicate_fixture_lineup_override",
        `Duplicate fixture lineup override for fixture ${override.fixtureId} and club ${override.clubId}`,
      );
    }

    seenOverrideKeys.add(overrideKey);
    validateFixtureLineupOverride(input, fixtures, override);
    overrides[overrideKey] = override;
    orderedOverrides.push(override);
  }

  return {
    byKey: overrides,
    ordered: orderedOverrides,
  };
}

/**
 * Builds the stable lookup key for one fixture lineup override.
 */
function fixtureLineupOverrideKey(fixtureId: FixtureId, clubId: ClubId): string {
  return `${fixtureId}|${clubId}`;
}

/**
 * Validates one explicit fixture lineup override against generated fixtures.
 */
function validateFixtureLineupOverride(
  input: SimulateSeasonInput,
  fixtures: Readonly<Record<FixtureId, Fixture>>,
  override: SimulateSeasonFixtureLineupOverride,
): void {
  const fixture = fixtures[override.fixtureId];

  if (fixture === undefined) {
    throw new SimulateSeasonError("missing_fixture", `Missing fixture for lineup override: ${override.fixtureId}`);
  }

  if (input.teamsByClubId[override.clubId] === undefined) {
    throw new SimulateSeasonError("missing_team", `Missing base team input for lineup override: ${override.clubId}`);
  }

  if (fixture.homeClubId !== override.clubId && fixture.awayClubId !== override.clubId) {
    throw new SimulateSeasonError(
      "invalid_fixture_lineup_override",
      `Fixture lineup override club ${override.clubId} is not part of fixture ${override.fixtureId}`,
    );
  }

  validateFixtureLineupShape(override);

  try {
    const playerStates = fixtureLineupOverrideValidationStates(input, override);

    deriveTeamStrength({
      lineup: override.lineup,
      players: override.players,
      roleWeights: override.roleWeights,
      ...(playerStates === undefined ? {} : { playerStates }),
      ...(override.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: override.stateMultiplierCurves }),
    });
  } catch (error) {
    if (error instanceof TeamStrengthError) {
      throw new SimulateSeasonError(
        "invalid_fixture_lineup_override",
        `Invalid fixture lineup override for fixture ${override.fixtureId} and club ${override.clubId}: ${error.message}`,
      );
    }

    throw error;
  }
}

/**
 * Resolves player states available when validating one fixture lineup override.
 */
function fixtureLineupOverrideValidationStates(
  input: SimulateSeasonInput,
  override: SimulateSeasonFixtureLineupOverride,
): Readonly<Record<PlayerId, PlayerDynamicState>> | undefined {
  if (override.stateMultiplierCurves === undefined) {
    return override.playerStates;
  }

  return override.playerStates ?? input.fitnessLifecycle?.playerStates;
}

/**
 * Validates shape-level lineup constraints before deriving team strength.
 */
function validateFixtureLineupShape(override: SimulateSeasonFixtureLineupOverride): void {
  if (!Number.isInteger(override.requiredLineupSize) || override.requiredLineupSize <= 0) {
    throw new SimulateSeasonError(
      "invalid_fixture_lineup_override",
      `Fixture lineup override required size must be a positive integer: ${override.requiredLineupSize}`,
    );
  }

  if (override.lineup.length !== override.requiredLineupSize) {
    throw new SimulateSeasonError(
      "invalid_fixture_lineup_override",
      `Fixture lineup override must include exactly ${override.requiredLineupSize} slots: ${override.lineup.length}`,
    );
  }

  const seenSlotIds = new Set<string>();
  const seenPlayerIds = new Set<PlayerId>();

  for (const slot of override.lineup) {
    if (slot.slotId.length === 0) {
      throw new SimulateSeasonError("invalid_fixture_lineup_override", "Fixture lineup override slot ID must not be empty");
    }

    if (!isCanonicalPlayerRole(slot.canonicalRole)) {
      throw new SimulateSeasonError(
        "invalid_fixture_lineup_override",
        `Fixture lineup override slot ${slot.slotId} must carry a canonical role: ${String(slot.canonicalRole)}`,
      );
    }

    if (seenSlotIds.has(slot.slotId)) {
      throw new SimulateSeasonError(
        "invalid_fixture_lineup_override",
        `Duplicate fixture lineup override slot: ${slot.slotId}`,
      );
    }

    if (seenPlayerIds.has(slot.playerId)) {
      throw new SimulateSeasonError(
        "invalid_fixture_lineup_override",
        `Duplicate fixture lineup override player: ${slot.playerId}`,
      );
    }

    seenSlotIds.add(slot.slotId);
    seenPlayerIds.add(slot.playerId);
  }
}

/**
 * Builds a match-team context from one explicit fixture lineup override.
 */
function buildFixtureLineupOverrideContext(
  override: SimulateSeasonFixtureLineupOverride,
  clubId: ClubId,
  tacticalDistribution: MatchTacticalDistributionInput,
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
  playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>,
): MatchTeamContext {
  try {
    return assembleMatchTeamContext({
      clubId,
      lineup: override.lineup,
      tacticalDistribution,
      players: override.players,
      roleWeights: override.roleWeights,
      matchTacticsCalibration,
      ...(playerStates === undefined ? {} : { playerStates }),
      ...(override.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: override.stateMultiplierCurves }),
    });
  } catch (error) {
    if (error instanceof TeamStrengthError) {
      throw new SimulateSeasonError(
        "invalid_fixture_lineup_override",
        `Invalid fixture lineup override for fixture ${override.fixtureId} and club ${override.clubId}: ${error.message}`,
      );
    }

    throw error;
  }
}

/**
 * Reads required base team data for one club.
 */
function baseTeamInput(input: SimulateSeasonInput, clubId: ClubId): SimulateSeasonTeamInput {
  const team = input.teamsByClubId[clubId];

  if (team === undefined) {
    throw new SimulateSeasonError("missing_team", `Missing season team input: ${clubId}`);
  }

  return team;
}

/**
 * Converts one selected setup override into a match-team context.
 */
function buildSetupOverrideContext(
  override: SimulateSeasonSetupOverride,
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
  playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>,
): MatchTeamContext {
  const builderInput: BuildTacticTeamContextInput = {
    lineup: override.lineup,
    tactic: override.tactic,
    requiredLineupSize: override.requiredLineupSize,
    players: override.players,
    roleWeights: override.roleWeights,
    matchTacticsCalibration,
    ...(playerStates === undefined ? {} : { playerStates }),
    ...(override.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: override.stateMultiplierCurves }),
  };

  try {
    return buildTacticTeamContext(builderInput);
  } catch (error) {
    if (error instanceof TacticTeamContextError) {
      throw new SimulateSeasonError(
        "invalid_setup_override",
        `Invalid setup override for club ${override.clubId}: ${error.message}`,
      );
    }

    throw error;
  }
}

/**
 * Builds the fixed-lineup match-team context for one club.
 *
 * `livePlayerStates` is the fitness lifecycle's current view when the caller
 * enabled it. Without a lifecycle the team's own static states are used, so a
 * season that never recovers or spends fitness still starts from the condition
 * the caller described rather than from an invented full-fitness squad.
 */
function fixedLineupMatchTeamContext(
  clubId: ClubId,
  team: SimulateSeasonTeamInput,
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
  livePlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined,
): MatchTeamContext {
  if (livePlayerStates !== undefined && team.stateMultiplierCurves === undefined) {
    throw new SimulateSeasonError(
      "invalid_fitness_lifecycle",
      `Fitness lifecycle requires state multiplier curves for team: ${clubId}`,
    );
  }

  try {
    return assembleMatchTeamContext({
      clubId,
      lineup: team.lineup,
      tacticalDistribution: team.tacticalDistribution,
      players: team.players,
      roleWeights: team.roleWeights,
      matchTacticsCalibration,
      ...dynamicStateInputs(team, livePlayerStates),
    });
  } catch (error) {
    if (error instanceof TeamStrengthError) {
      throw new SimulateSeasonError(
        "invalid_fitness_lifecycle",
        `Invalid team strength input for club ${clubId}: ${error.message}`,
      );
    }

    throw error;
  }
}

/**
 * Selects the dynamic-state inputs a strength derivation may actually use.
 *
 * The multiplier curves are only meaningful alongside the states they read, so
 * a team that carries curves but has no states at all contributes neither. That
 * keeps "curves supplied, lifecycle not enabled" an inert configuration rather
 * than a failure, which is what callers who pre-wire fitness data expect.
 */
function dynamicStateInputs(
  team: SimulateSeasonTeamInput,
  livePlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined,
): {
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
} {
  const playerStates = livePlayerStates ?? team.playerStates;
  if (playerStates === undefined) return {};

  return {
    playerStates,
    ...(team.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: team.stateMultiplierCurves }),
  };
}

/**
 * Builds a fixture-specific AI match context without mutating the base team.
 */
function aiSelectedMatchTeamContext(
  clubId: ClubId,
  team: SimulateSeasonTeamInput,
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
  livePlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined,
  fixture: Fixture,
  availabilityRuntime: SeasonAvailabilityRuntime | undefined,
  collectSelectionLoadDiagnostics: boolean,
  collectSquadUseDiagnostics: boolean,
): FixtureTeamSetup {
  if (team.aiSelection === undefined) {
    throw new SimulateSeasonError(
      "invalid_ai_squad_selection",
      `AI selection requires a formation for team: ${clubId}`,
    );
  }
  const selectionPolicy = team.aiSelection;

  const rosterPlayerIds = selectionPolicy.rosterPlayerIds === undefined
    ? Object.keys(team.players).sort() as PlayerId[]
    : distinctPlayerIds(selectionPolicy.rosterPlayerIds);
  const emergencyPlayerIds = distinctPlayerIds(selectionPolicy.emergencyPlayerIds ?? [])
    .filter((playerId) => !rosterPlayerIds.includes(playerId));
  const callUpPlayerIds = distinctPlayerIds(selectionPolicy.callUpPlayerIds ?? [])
    .filter((playerId) => !rosterPlayerIds.includes(playerId));
  const availableSeniorPlayerIds = availabilityRuntime === undefined
    ? rosterPlayerIds
    : rosterPlayerIds.filter((playerId) => playerUnavailabilityReason(
        availabilityRuntime.availability,
        playerId,
        fixture.date,
        fixture.competitionId,
      ) === undefined);
  const availableCallUpPlayerIds = availabilityRuntime === undefined
    ? callUpPlayerIds
    : callUpPlayerIds.filter((playerId) => playerUnavailabilityReason(
        availabilityRuntime.availability,
        playerId,
        fixture.date,
        fixture.competitionId,
      ) === undefined);
  const selectedCallUpCandidates = selectAcademyCallUpPlayerIds(
    availableCallUpPlayerIds,
    publicAssessmentsForAiSelection(
      team.players,
      availableCallUpPlayerIds,
      fixture.date,
      selectionPolicy,
    ),
  );
  const availableRosterPlayerIds = distinctPlayerIds([
    ...availableSeniorPlayerIds,
    ...selectedCallUpCandidates,
  ]);
  const availableEmergencyPlayerIds = availabilityRuntime === undefined
    ? emergencyPlayerIds
    : emergencyPlayerIds.filter((playerId) => playerUnavailabilityReason(
        availabilityRuntime.availability,
        playerId,
        fixture.date,
        fixture.competitionId,
      ) === undefined);
  let attemptedPlayerIds = availableRosterPlayerIds;
  try {
    const buildSelection = (playerIds: readonly PlayerId[]) => {
      const recentUse = recentPlayerUseForFixture({
        ledger: availabilityRuntime?.participationLedger,
        ...(availabilityRuntime === undefined
          ? {}
          : { pendingContributions: availabilityRuntime.pendingContributions }),
        seasonId: fixture.seasonId,
        fixtureDate: fixture.date,
        playerIds,
      });
      const publicAssessments = publicAssessmentsForAiSelection(
        team.players,
        playerIds,
        fixture.date,
        selectionPolicy,
      );
      return {
        recentUse,
        publicAssessments,
        result: buildAiSquadMatchTeamContext({
          clubId,
          ...(selectionPolicy.formation === undefined
            ? {}
            : { formation: selectionPolicy.formation }),
          playerIds,
          players: team.players,
          publicAssessments,
          currentDate: fixture.date,
          recentUse,
          roleWeights: team.roleWeights,
          // A fixed setup: this use case is the instrument that holds a shape and a
          // tactic still in order to measure one of them, so the shape must not
          // modulate the other.
          tacticalDistribution: () => team.tacticalDistribution,
          matchTacticsCalibration,
          ...dynamicStateInputs(team, livePlayerStates),
          ...(selectionPolicy.benchSize === undefined ? {} : { benchSize: selectionPolicy.benchSize }),
        }),
      };
    };
    let built;
    try {
      built = buildSelection(availableRosterPlayerIds);
    } catch (error) {
      if (!(error instanceof AiSquadSelectionError) || availableEmergencyPlayerIds.length === 0) throw error;
      attemptedPlayerIds = distinctPlayerIds([...availableRosterPlayerIds, ...availableEmergencyPlayerIds]);
      built = buildSelection(attemptedPlayerIds);
    }
    const { recentUse, publicAssessments, result } = built;
    const tacticalPolicy = selectionPolicy.formation === undefined
      ? evaluateOwnSquadTacticalPolicies({
          shape: result.teamContext.shape,
          policy: matchTacticsCalibration.ownSquadTacticalPolicy,
        })
      : undefined;
    const selectedTeamContext = tacticalPolicy === undefined
      ? result.teamContext
      : { ...result.teamContext, tacticalDistribution: tacticalPolicy.ownFit.tactic };
    const selectedPlayerIds = [
      ...result.teamContext.lineup.map(({ playerId }) => playerId),
      ...result.selection.benchPlayerIds,
    ];
    const selectedEmergencyPlayerIds = availableEmergencyPlayerIds.filter((playerId) =>
      selectedPlayerIds.includes(playerId));
    const selectedCallUpPlayerIds = selectedCallUpCandidates.filter((playerId) =>
      selectedPlayerIds.includes(playerId));
    const outOfPositionSlotCount = result.selection.reasons.filter((reason) =>
      reason.selection === "lineup"
        && (reason.suitability === "weak" || reason.suitability === "invalid")
    ).length;
    const invalidLineupSlotCount = result.selection.reasons.filter((reason) =>
      reason.selection === "lineup" && reason.suitability === "invalid"
    ).length;
    return {
      teamContext: selectedTeamContext,
      benchPlayerIds: result.selection.benchPlayerIds,
      lateralFocus: tacticalPolicy?.ownFit.lateralFocus ?? "balanced",
      liveTeam: liveTeamFromAiSelection(
        fixture.homeClubId === clubId ? "home" : "away",
        result.selection.formation,
        selectedTeamContext,
        result.selection.benchPlayerIds,
      ),
      formationKey: result.selection.formation.key,
      selectionSource:
        selectionPolicy.formation === undefined ? "catalog_ai" : "imposed_ai",
      ...(result.selection.catalogChoice === undefined
        ? {}
        : { catalogChoice: result.selection.catalogChoice }),
      outOfPositionSlotCount,
      invalidLineupSlotCount,
      ...(selectedCallUpPlayerIds.length === 0
        ? {}
        : { callUpPlayerIds: selectedCallUpPlayerIds }),
      ...(selectedEmergencyPlayerIds.length === 0
        ? {}
        : { emergencyPlayerIds: selectedEmergencyPlayerIds }),
      ...(availabilityRuntime === undefined
        ? {}
        : {
            lifecycleDiagnostics: {
              unavailableSelectedPlayerCount: selectedTeamContext.lineup.filter(({ playerId }) =>
                playerUnavailabilityReason(
                  availabilityRuntime.availability,
                  playerId,
                  fixture.date,
                  fixture.competitionId,
                ) !== undefined
              ).length,
              recentUsePlayerCount: attemptedPlayerIds.filter((playerId) => recentUse[playerId] !== undefined).length,
            },
          }),
      ...(collectSelectionLoadDiagnostics
        ? {
            selectionLoadDiagnostics: selectionLoadDiagnostics({
              lineup: selectedTeamContext.lineup,
              availablePlayerIds: attemptedPlayerIds,
              players: team.players,
              publicAssessments,
              recentUse,
              playerStates: livePlayerStates ?? team.playerStates,
            }),
          }
        : {}),
      ...(collectSquadUseDiagnostics
        ? {
            squadUseDiagnostics: {
              candidatePlayerIds: distinctPlayerIds([
                ...rosterPlayerIds,
                ...callUpPlayerIds,
                ...emergencyPlayerIds,
              ]),
              availablePlayerIds: distinctPlayerIds([
                ...availableSeniorPlayerIds,
                ...availableCallUpPlayerIds,
                ...availableEmergencyPlayerIds,
              ]),
              selectorPoolPlayerIds: attemptedPlayerIds,
              matchdayPlayerIds: selectedPlayerIds,
            },
          }
        : {}),
    };
  } catch (error) {
    if (error instanceof AiSquadSelectionError) {
      const availablePositions = attemptedPlayerIds.flatMap((playerId) =>
        team.players[playerId]?.naturalPositions.map((position) => String(position)) ?? []
      ).sort().join(",");
      throw new SimulateSeasonError(
        "invalid_ai_squad_selection",
        `Invalid AI selection for fixture ${fixture.id} and club ${clubId}: ${error.message}; available positions: ${availablePositions}`,
        clubId,
      );
    }

    throw error;
  }
}

/**
 * Counts exact younger alternatives without retaining or rerunning a ranking.
 *
 * The candidate pool has already passed fixture-dated unavailability filtering.
 * A second selector walk would be both slower and free to drift from the team
 * actually fielded, so the locked audit keeps only these three non-derived
 * counts while the pool still exists.
 */
function selectionLoadDiagnostics(input: {
  readonly lineup: readonly LineupSlot[];
  readonly availablePlayerIds: readonly PlayerId[];
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly publicAssessments: Readonly<Record<PlayerId, PublicPlayerAssessment>>;
  readonly recentUse: Readonly<Partial<Record<PlayerId, {
    readonly recentMinutes: number;
    readonly recentStarts: number;
  }>>>;
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>> | undefined;
}): NonNullable<SimulateSeasonFixtureFieldedTeam["selectionLoadDiagnostics"]> {
  const lineupPlayerIds = new Set(input.lineup.map(({ playerId }) => playerId));
  let veteranStarterCount = 0;
  let qualityMatchedYoungerAlternativeCount = 0;
  let fresherQualityMatchedYoungerAlternativeCount = 0;

  for (const { playerId: veteranId } of input.lineup) {
    const veteran = input.players[veteranId];
    const veteranAssessment = input.publicAssessments[veteranId];
    if (
      veteran === undefined
      || veteran.primaryRole === undefined
      || veteranAssessment === undefined
      || veteranAssessment.age < 33
    ) continue;
    veteranStarterCount += 1;
    const veteranRecentMinutes = input.recentUse[veteranId]?.recentMinutes ?? 0;
    const veteranFitness = Number(input.playerStates?.[veteranId]?.fitness ?? 100);
    const alternatives = input.availablePlayerIds.filter((candidateId) => {
      if (lineupPlayerIds.has(candidateId)) return false;
      const candidate = input.players[candidateId];
      const assessment = input.publicAssessments[candidateId];
      return candidate?.primaryRole === veteran.primaryRole
        && assessment !== undefined
        && assessment.age >= 24
        && assessment.age <= 29
        && assessment.currentAbility >= veteranAssessment.currentAbility - 0.5;
    });
    if (alternatives.length === 0) continue;
    qualityMatchedYoungerAlternativeCount += 1;
    if (alternatives.some((candidateId) =>
      (input.recentUse[candidateId]?.recentMinutes ?? 0) <= veteranRecentMinutes
      && Number(input.playerStates?.[candidateId]?.fitness ?? 100) >= veteranFitness
    )) fresherQualityMatchedYoungerAlternativeCount += 1;
  }

  return {
    veteranStarterCount,
    qualityMatchedYoungerAlternativeCount,
    fresherQualityMatchedYoungerAlternativeCount,
  };
}

/** Exact AI candidates registered for possible season statistics. */
function aiSelectionCandidatePlayerIds(team: SimulateSeasonTeamInput): readonly PlayerId[] {
  const ordinary = team.aiSelection?.rosterPlayerIds
    ?? Object.keys(team.players).sort() as PlayerId[];
  return distinctPlayerIds([
    ...ordinary,
    ...(team.aiSelection?.callUpPlayerIds ?? []),
    ...(team.aiSelection?.emergencyPlayerIds ?? []),
  ]);
}

/** Stable first-occurrence player IDs without duplicated selection candidates. */
function distinctPlayerIds(playerIds: readonly PlayerId[]): readonly PlayerId[] {
  const seen = new Set<PlayerId>();
  return playerIds.filter((playerId) => {
    if (seen.has(playerId)) return false;
    seen.add(playerId);
    return true;
  });
}

/** Converts the selector's exact formation and squad into live command facts. */
function liveTeamFromAiSelection(
  side: "home" | "away",
  formation: Formation,
  context: MatchTeamContext,
  benchPlayerIds: readonly PlayerId[],
): LiveMatchTeamState {
  return {
    side,
    formation: formation.key,
    lineup: context.lineup.map((slot, index) => {
      const formationSlot = formation.slots[index];
      if (formationSlot === undefined) {
        throw new SimulateSeasonError(
          "invalid_ai_squad_selection",
          `Formation ${formation.key} has no slot at index ${index}`,
        );
      }
      return {
        slotId: slot.slotId,
        playerId: slot.playerId,
        role: slot.canonicalRole,
        ...formationSlotCoordinate(formationSlot.slotKey),
      };
    }),
    bench: benchPlayerIds.map((playerId, index) => ({
      slotId: `bench:${String(index + 1).padStart(2, "0")}`,
      playerId,
      status: "available" as const,
    })),
    unavailable: [],
    substitutionsUsed: 0,
    tactic: {
      mentality: context.tacticalDistribution.mentality,
      pressing: context.tacticalDistribution.pressing,
      directness: context.tacticalDistribution.directness,
      width: context.tacticalDistribution.width,
      risk: context.tacticalDistribution.risk,
    },
  };
}

/** Derives fixture-dated safe facts before the selector ranks candidates. */
function publicAssessmentsForAiSelection(
  players: Readonly<Record<PlayerId, Player>>,
  playerIds: readonly PlayerId[],
  currentDate: GameDate,
  policy: SimulateSeasonAiSquadSelection,
): Readonly<Record<PlayerId, PublicPlayerAssessment>> {
  const assessments: Record<PlayerId, PublicPlayerAssessment> = {};
  for (const playerId of playerIds) {
    const player = players[playerId];
    if (player === undefined) continue;
    assessments[playerId] = derivePublicPlayerAssessment({
      player,
      currentDate,
      potentialProjectionPolicy: policy.potentialProjectionPolicy,
      ratingScale: policy.ratingScale,
    });
  }
  return assessments;
}

/**
 * Creates runtime state only when the caller explicitly enables fitness lifecycle.
 */
function initialFitnessRuntime(input: SimulateSeasonInput): SeasonFitnessRuntime | undefined {
  if (input.fitnessLifecycle === undefined) {
    return undefined;
  }

  return {
    playerStates: input.fitnessLifecycle.playerStates,
  };
}

/** Creates lifecycle state only when the caller explicitly supplies it. */
function initialAvailabilityRuntime(
  input: SimulateSeasonInput,
): SeasonAvailabilityRuntime | undefined {
  if (input.availabilityLifecycle === undefined) return undefined;
  return {
    availability: input.availabilityLifecycle.availability ?? EMPTY_PLAYER_AVAILABILITY,
    participationLedger: input.availabilityLifecycle.participationLedger
      ?? createEmptyPlayerParticipationLedger(),
    pendingContributions: [],
    consequences: [],
  };
}

/** Flushes the final open month once at the competition boundary. */
function consolidatedParticipationLedger(
  runtime: SeasonAvailabilityRuntime,
): PlayerParticipationLedger {
  return runtime.pendingContributions.length === 0
    ? runtime.participationLedger
    : accruePlayerFixtureParticipations(runtime.participationLedger, runtime.pendingContributions);
}

/** Applies one completed fixture to the shared availability and use lifecycle. */
function advanceAvailabilityAfterFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  report: ReturnType<typeof createMatchReport>,
  contributions: readonly PlayerFixtureParticipationContribution[],
  runtime: SeasonAvailabilityRuntime | undefined,
): SeasonAvailabilityRuntime | undefined {
  if (runtime === undefined || input.availabilityLifecycle === undefined) return runtime;
  const consequenceResult = applyMatchAvailabilityConsequences({
    availability: runtime.availability,
    fixture,
    report,
    rules: input.matchRules,
    worldSeed: input.availabilityLifecycle.worldSeed,
    participatingPlayerIds: [
      ...registeredPlayerIdsForClub(input, fixture.homeClubId),
      ...registeredPlayerIdsForClub(input, fixture.awayClubId),
    ],
  });
  const pendingMonth = runtime.pendingContributions[0]?.monthKey;
  const contributionMonth = contributions[0]?.monthKey;
  const monthChanged = pendingMonth !== undefined
    && contributionMonth !== undefined
    && pendingMonth !== contributionMonth;
  const participationLedger = monthChanged
    ? accruePlayerFixtureParticipations(runtime.participationLedger, runtime.pendingContributions)
    : runtime.participationLedger;
  return {
    availability: consequenceResult.availability,
    participationLedger,
    pendingContributions: monthChanged
      ? [...contributions]
      : [...runtime.pendingContributions, ...contributions],
    consequences: [...runtime.consequences, ...consequenceResult.consequences],
  };
}

/** Returns a stable complete roster for availability consequence ownership. */
function registeredPlayerIdsForClub(
  input: SimulateSeasonInput,
  clubId: ClubId,
): readonly PlayerId[] {
  return Object.keys(baseTeamInput(input, clubId).players).sort() as PlayerId[];
}

/**
 * Recovers all lifecycle-tracked players once for each new fixture date.
 */
function recoverFitnessBeforeFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  runtime: SeasonFitnessRuntime | undefined,
): SeasonFitnessRuntime | undefined {
  if (runtime === undefined || input.fitnessLifecycle === undefined) {
    return runtime;
  }

  const previousFixtureDate = runtime.previousFixtureDate;
  if (previousFixtureDate === undefined) {
    return {
      ...runtime,
      previousFixtureDate: fixture.date,
    };
  }

  const dayCount = diffDays(Number(fixture.date), Number(previousFixtureDate));
  if (dayCount <= 0) {
    return runtime;
  }

  return {
    playerStates: recoverFitnessForPlayers({
      playerStates: runtime.playerStates,
      playerIds: input.fitnessLifecycle.playerIds,
      players: input.fitnessLifecycle.players,
      currentDate: fixture.date,
      recoveryPolicy: input.fitnessLifecycle.recoveryPolicy,
      dayCount,
      ...(input.fitnessLifecycle.rules === undefined ? {} : { rules: input.fitnessLifecycle.rules }),
    }),
    previousFixtureDate: fixture.date,
  };
}

/**
 * Spends match fitness from canonical appearance intervals after one fixture.
 */
function spendFitnessAfterFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  contributions: readonly PlayerFixtureParticipationContribution[],
  runtime: SeasonFitnessRuntime | undefined,
): SeasonFitnessRuntime | undefined {
  if (runtime === undefined || input.fitnessLifecycle === undefined) {
    return runtime;
  }

  return {
    playerStates: spendFitnessForMinutes({
      playerStates: runtime.playerStates,
      loads: contributions.map(({ playerId, minutes }) => ({ playerId, minutes })),
      players: input.fitnessLifecycle.players,
      currentDate: fixture.date,
      loadPolicy: input.fitnessLifecycle.recoveryPolicy,
      ...(input.fitnessLifecycle.rules === undefined ? {} : { rules: input.fitnessLifecycle.rules }),
    }),
    previousFixtureDate: fixture.date,
  };
}

/**
 * Indexes fixtures by ID without relying on object-key order.
 */
function fixturesById(fixtures: readonly Fixture[]): Readonly<Record<FixtureId, Fixture>> {
  const lookup: Record<FixtureId, Fixture> = {};

  for (const fixture of fixtures) {
    lookup[fixture.id] = fixture;
  }

  return lookup;
}

/**
 * Rebuilds ordered fixtures from the explicit fixture ID order.
 */
function orderedFixtures(
  fixtures: Readonly<Record<FixtureId, Fixture>>,
  fixtureIds: readonly FixtureId[],
): readonly Fixture[] {
  const ordered: Fixture[] = [];

  for (const fixtureId of fixtureIds) {
    const fixture = fixtures[fixtureId];

    if (fixture === undefined) {
      throw new SimulateSeasonError("missing_fixture", `Missing fixture in final state: ${fixtureId}`);
    }

    ordered.push(fixture);
  }

  return ordered;
}

/**
 * Finds the best defense by goals against.
 */
function bestDefense(table: readonly LeagueTableRow[]): LeagueTableRow | undefined {
  let best: LeagueTableRow | undefined;

  for (const row of table) {
    if (best === undefined || row.goalsAgainst < best.goalsAgainst) {
      best = row;
    }
  }

  return best;
}

/**
 * Finds the worst attack by goals for.
 */
function worstAttack(table: readonly LeagueTableRow[]): LeagueTableRow | undefined {
  let worst: LeagueTableRow | undefined;

  for (const row of table) {
    if (worst === undefined || row.goalsFor < worst.goalsFor) {
      worst = row;
    }
  }

  return worst;
}
