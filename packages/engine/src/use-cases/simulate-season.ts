import { isCanonicalPlayerRole } from "@game/domain";
import {
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
  type PlayerFixtureParticipationContribution,
  type MatchTacticsCalibrationConfig,
  type SelectedLineup,
  type TacticSetup,
  type ClubId,
  type CompetitionId,
  type Formation,
  type Fixture,
  type FixtureId,
  type GameDate,
  type GameState,
  type LeagueTableRow,
  type LeagueTableRules,
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
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  playerRatingRegistrationsFromContext,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
  assembleMatchTeamContext,
  deriveTeamStrength,
  matchPlayerIncidentProfilesForLineup,
  TeamStrengthError,
} from "../match-engine/index.ts";
import { simulateMatch } from "../match-engine/simulate-match.ts";
import {
  recoverFitnessForPlayers,
  spendFitnessForPlayers,
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
import { AiSquadSelectionError, buildAiSquadMatchTeamContext } from "../team-selection/index.ts";
import {
  derivePublicPlayerAssessment,
  type PublicPlayerAssessment,
} from "../squad/public-player-assessment.ts";
import { buildFixtureParticipationContributions } from "../career/player-participation.ts";
import { applyMatchReportToFixture } from "./apply-match-report-to-fixture.ts";

/**
 * Optional AI squad-selection rules for one simulated club.
 *
 * When omitted, the team keeps the fixed lineup supplied by the caller. When
 * present, the season use-case can rebuild the AI lineup fixture by fixture
 * from the current roster, formation, and dynamic player states.
 */
export interface SimulateSeasonAiSquadSelection {
  /** Base formation used to select a valid match XI. */
  readonly formation: Formation;
  /** Public projection policy used to assess candidates on each fixture date. */
  readonly potentialProjectionPolicy: PlayerPotentialProjectionPolicyConfig;
  /** Global rating scale paired with the projection policy. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Maximum substitutes to include in diagnostics. */
  readonly benchSize?: number;
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
  /** Optional fitness rules; defaults are used when omitted. */
  readonly rules?: FitnessRules;
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
  /** Match engine config reused for each fixture. */
  readonly matchEngineConfig: MatchEngineConfig;
  /** Versioned match-tactics calibration reused for every team context. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Competition point rules for the final derived table. */
  readonly tableRules: LeagueTableRules;
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
  /** Final dynamic player states when a fitness lifecycle was supplied. */
  readonly finalPlayerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
}

/** Canonical player-participation contributions produced by one batch fixture. */
export interface SimulateSeasonFixtureParticipation {
  /** Fixture whose committed match facts produced these contributions. */
  readonly fixtureId: FixtureId;
  /** Exact contributions ready for the career participation ledger. */
  readonly contributions: readonly PlayerFixtureParticipationContribution[];
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
  | "invalid_ai_squad_selection";

/**
 * Typed error thrown when a season cannot be simulated from its input.
 */
export class SimulateSeasonError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: SimulateSeasonErrorCode;

  /**
   * Creates a season-simulation error.
   */
  public constructor(code: SimulateSeasonErrorCode, message: string) {
    super(message);
    this.name = "SimulateSeasonError";
    this.code = code;
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
  let state = createFixtureState(input, fixturesById(calendar.fixtures), calendar.fixtureIds);
  const fixtureParticipation: SimulateSeasonFixtureParticipation[] = [];

  for (const fixtureId of calendar.fixtureIds) {
    const fixture = state.fixtures[fixtureId];

    if (fixture === undefined) {
      throw new SimulateSeasonError("missing_fixture", `Missing generated fixture: ${fixtureId}`);
    }

    fitnessRuntime = recoverFitnessBeforeFixture(input, fixture, fitnessRuntime);

    const matchSetup = matchSetupForFixture(
      input,
      fixture,
      setupOverrides,
      fixtureLineupOverrides,
      fitnessRuntime?.playerStates,
    );
    const matchContext = matchSetup.matchContext;
    const simulatedMatch = simulateMatch(matchContext);
    const report = createMatchReport(simulatedMatch);
    fixtureParticipation.push({
      fixtureId,
      contributions: buildFixtureParticipationContributions({
        fixtureId,
        seasonId: input.seasonId,
        fixtureDate: fixture.date,
        finalMinute: simulatedMatch.finalMinute,
        sides: [
          {
            side: "home",
            initialContext: matchContext.home,
            finalContext: matchContext.home,
            benchPlayerIds: matchSetup.home.benchPlayerIds,
          },
          {
            side: "away",
            initialContext: matchContext.away,
            finalContext: matchContext.away,
            benchPlayerIds: matchSetup.away.benchPlayerIds,
          },
        ],
        appliedSubstitutions: simulatedMatch.events.filter(
          (event) => event.type === "substitution",
        ),
        playerRatings: buildPlayerMatchRatings({
          events: simulatedMatch.events,
          playerRegistrations: playerRatingRegistrationsFromContext(matchContext),
        }),
      }).contributions,
    });
    state = applyMatchReportToFixture({ state, fixtureId, report });
    fitnessRuntime = spendFitnessAfterFixture(input, fixture, matchContext, fitnessRuntime);
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
    ...(fitnessRuntime === undefined ? {} : { finalPlayerStates: fitnessRuntime.playerStates }),
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
): FixtureMatchSetup {
  const home = fixtureTeamSetup(
    input,
    fixture,
    fixture.homeClubId,
    setupOverrides,
    fixtureLineupOverrides,
    playerStates,
  );
  const away = fixtureTeamSetup(
    input,
    fixture,
    fixture.awayClubId,
    setupOverrides,
    fixtureLineupOverrides,
    playerStates,
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

/** Runtime fitness state carried while the season loop walks fixture dates. */
interface SeasonFitnessRuntime {
  /** Latest player states after recovery/spend. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Last fixture date already processed, used to compute deterministic rest days. */
  readonly previousFixtureDate?: GameDate;
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
    };
  }

  const team = baseTeamInput(input, clubId);

  if (team.aiSelection !== undefined) {
    return aiSelectedMatchTeamContext(clubId, team, input.matchTacticsCalibration, playerStates, fixture);
  }

  return {
    teamContext: fixedLineupMatchTeamContext(clubId, team, input.matchTacticsCalibration, playerStates),
    benchPlayerIds: [],
  };
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
    return Object.keys(team.players).sort() as PlayerId[];
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
): FixtureTeamSetup {
  if (team.aiSelection === undefined) {
    throw new SimulateSeasonError(
      "invalid_ai_squad_selection",
      `AI selection requires a formation for team: ${clubId}`,
    );
  }

  try {
    const playerIds = Object.keys(team.players).sort() as PlayerId[];
    const result = buildAiSquadMatchTeamContext({
      clubId,
      formation: team.aiSelection.formation,
      playerIds,
      players: team.players,
      publicAssessments: publicAssessmentsForAiSelection(
        team.players,
        playerIds,
        fixture.date,
        team.aiSelection,
      ),
      currentDate: fixture.date,
      roleWeights: team.roleWeights,
      // A fixed setup: this use case is the instrument that holds a shape and a
      // tactic still in order to measure one of them, so the shape must not
      // modulate the other.
      tacticalDistribution: () => team.tacticalDistribution,
      matchTacticsCalibration,
      ...dynamicStateInputs(team, livePlayerStates),
      ...(team.aiSelection.benchSize === undefined ? {} : { benchSize: team.aiSelection.benchSize }),
    });
    return {
      teamContext: result.teamContext,
      benchPlayerIds: result.selection.benchPlayerIds,
    };
  } catch (error) {
    if (error instanceof AiSquadSelectionError) {
      throw new SimulateSeasonError(
        "invalid_ai_squad_selection",
        `Invalid AI selection for fixture ${fixture.id} and club ${clubId}: ${error.message}`,
      );
    }

    throw error;
  }
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
      dayCount,
      ...(input.fitnessLifecycle.rules === undefined ? {} : { rules: input.fitnessLifecycle.rules }),
    }),
    previousFixtureDate: fixture.date,
  };
}

/**
 * Spends match fitness for the two selected starting lineups after one fixture.
 */
function spendFitnessAfterFixture(
  input: SimulateSeasonInput,
  fixture: Fixture,
  matchContext: MatchContext,
  runtime: SeasonFitnessRuntime | undefined,
): SeasonFitnessRuntime | undefined {
  if (runtime === undefined || input.fitnessLifecycle === undefined) {
    return runtime;
  }

  return {
    playerStates: spendFitnessForPlayers({
      playerStates: runtime.playerStates,
      playerIds: fixturePlayerIds(matchContext),
      ...(input.fitnessLifecycle.rules === undefined ? {} : { rules: input.fitnessLifecycle.rules }),
    }),
    previousFixtureDate: fixture.date,
  };
}

/**
 * Returns ordered player IDs that appeared in one simulated fixture.
 */
function fixturePlayerIds(matchContext: MatchContext): readonly PlayerId[] {
  return [
    ...matchContext.home.lineup.map((slot) => slot.playerId),
    ...matchContext.away.lineup.map((slot) => slot.playerId),
  ];
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
