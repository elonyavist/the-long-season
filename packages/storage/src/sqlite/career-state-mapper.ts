import {
  isCanonicalPlayerRole,
  clubFinanceLedgerEntryId,
  clubId,
  competitionId,
  contractNegotiationId,
  createClubCompetitiveTierState,
  createClubFinanceState,
  createCareerState,
  createCareerPlayerAvailabilityState,
  createContractNegotiationState,
  createTransferNegotiationState,
  createPreliminaryAgreementState,
  createPlayerParticipationLedger,
  createSeniorSquadState,
  careerInboxMessageId,
  createCareerInboxMessage,
  fixtureId,
  gameDate,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  playerId,
  preliminaryAgreementId,
  seasonId,
  seniorSquadRegistrationId,
  transferNegotiationId,
  type AgreedSquadStatus,
  type CareerMatchPreparation,
  type CareerAttentionBlockerKey,
  type CareerAttentionLevel,
  type CareerAttentionContinuePolicy,
  type CareerInboxActionId,
  type CareerInboxCategory,
  type CareerInboxSource,
  type CareerPlayerSeasonStatistics,
  type CareerPlayerStatisticsCoverage,
  type CareerSeasonArchiveEntry,
  type CareerState,
  type CreateCareerStateInput,
  type CareerPlayerAvailabilityState,
  type ClubCompetitiveTier,
  type ClubCompetitiveTierState,
  type ClubFinanceLedgerDirection,
  type ClubFinanceLedgerEntry,
  type ClubFinanceLedgerEntryId,
  type ClubFinanceLedgerReason,
  type ClubFinanceState,
  type ClubId,
  type CurrencyCode,
  type ContractDemandSnapshot,
  type ContractNegotiation,
  type ContractNegotiationId,
  type ContractNegotiationState,
  type ContractOfferEvaluation,
  type ContractOfferEvaluationReason,
  type ContractOfferTerms,
  type LeagueTableRow,
  type MatchEvent,
  type MatchInjurySeverity,
  type MatchSubstitutionReasonKey,
  type MatchSuspensionReason,
  type PenaltyOutcome,
  type MatchReport,
  type MatchSideStats,
  type PlayerParticipationLedger,
  type PlayerParticipationRow,
  type PlayerId,
  type PlayerContract,
  type PlayerContractHistoryEntry,
  type PlayerContractHistoryEntryId,
  type PlayerContractId,
  type PlayerContractType,
  type SaveId,
  type SeniorSquadRegistration,
  type SeniorSquadRegistrationId,
  type SeniorSquadState,
  type TransferNegotiation,
  type TransferNegotiationState,
  type PreliminaryAgreement,
  type PreliminaryAgreementState,
  type YouthAcademyState,
  type YouthAcademyClubRoster,
  type YouthPlayerLifecycle,
  type YouthPlayerStatus,
} from "@game/domain";

import type { CanonicalPlayerRole } from "@game/domain";
import { SqliteWorldStateError, type SqliteBindValue, type SqliteWorldDatabase } from "./world-state-mapper.ts";

/** Writes every durable career slice after the ordered world rows exist. */
export function insertCareerStateRows(database: SqliteWorldDatabase, state: CareerState): void {
  const save = state.saveId;
  if (state.careerWorld !== undefined) {
    database.run("INSERT INTO career_world (save_id, world_seed, generator_version, creation_source_key) VALUES (?, ?, ?, ?)", [save, state.careerWorld.worldSeed, state.careerWorld.generatorVersion, state.careerWorld.creationSourceKey]);
  }
  insertClubCompetitiveTierState(database, state);
  insertSeniorSquadState(database, state);
  insertClubFinanceState(database, state);
  insertContractNegotiationState(database, state);
  insertTransferNegotiationState(database, state);
  insertPreliminaryAgreementState(database, state);
  for (const entry of state.transferHistory) {
    database.run(`INSERT INTO transfer_history
      (save_id, sequence_number, movement_kind, occurred_on, buying_club_id, selling_club_id, player_id,
       public_value, initial_asking_price, offered_fee, counter_fee, agreed_fee, completed_fee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      save,
      entry.sequenceNumber,
      entry.kind,
      entry.occurredOn,
      entry.buyingClubId,
      entry.kind === "permanent_transfer" ? entry.sellingClubId : null,
      entry.playerId,
      entry.publicValue,
      entry.kind === "permanent_transfer" ? entry.initialAskingPrice : null,
      entry.kind === "permanent_transfer" ? entry.offeredFee : null,
      entry.kind === "permanent_transfer" ? entry.counterFee ?? null : null,
      entry.kind === "permanent_transfer" ? entry.agreedFee : null,
      entry.completedFee,
    ]);
  }
  insertYouthState(database, state);
  insertCurrentSeasonInbox(database, state);
  insertPlayerAvailability(database, state);
  insertPlayerParticipationLedger(database, state);
  insertSeasonHistory(database, state);
  insertMatchPreparation(database, state);
  insertFixtureReports(database, state);
}

/** Adds all current durable career systems to a reconstructed world snapshot. */
export function loadCareerStateRows(
  database: SqliteWorldDatabase,
  requestedSaveId: SaveId,
  world: CreateCareerStateInput,
): CareerState {
  const gameState = attachFixtureReports(database, requestedSaveId, world.gameState);
  const clubCompetitiveTierState = loadClubCompetitiveTierState(
    database,
    requestedSaveId,
    gameState.clubIds,
    gameState.calendar.currentSeasonId,
  );
  const seniorSquadState = loadSeniorSquadState(database, requestedSaveId, gameState);
  const clubFinanceState = loadClubFinanceState(database, requestedSaveId, gameState, seniorSquadState);
  const contractNegotiationState = loadContractNegotiationState(
    database,
    requestedSaveId,
    gameState,
    seniorSquadState,
  );
  const transferNegotiationState = loadTransferNegotiationState(
    database,
    requestedSaveId,
  );
  const preliminaryAgreementState = loadPreliminaryAgreementState(
    database,
    requestedSaveId,
    gameState,
    seniorSquadState,
  );
  return createCareerState({
    ...world,
    gameState,
    clubCompetitiveTierState,
    ...(loadCareerWorldMetadata(database, requestedSaveId) ?? {}),
    seniorSquadState,
    clubFinanceState,
    ...(contractNegotiationState === undefined ? {} : { contractNegotiationState }),
    ...(transferNegotiationState === undefined ? {} : { transferNegotiationState }),
    ...(preliminaryAgreementState === undefined ? {} : { preliminaryAgreementState }),
    transferHistory: loadTransferHistory(database, requestedSaveId),
    currentSeasonInbox: loadCurrentSeasonInbox(database, requestedSaveId),
    ...(loadPlayerAvailability(database, requestedSaveId) ?? {}),
    ...(loadPlayerParticipationLedger(database, requestedSaveId) ?? {}),
    ...(loadYouthState(database, requestedSaveId, gameState) ?? {}),
    ...(loadSeasonHistory(database, requestedSaveId) ?? {}),
    ...(loadMatchPreparation(database, requestedSaveId) ?? {}),
  });
}

/** Writes the one current tier header and assignments in active-club order. */
function insertClubCompetitiveTierState(
  database: SqliteWorldDatabase,
  state: CareerState,
): void {
  const snapshot = state.clubCompetitiveTierState;
  database.run(
    `INSERT INTO club_competitive_tier_state (save_id, policy_version, season_id)
     VALUES (?, ?, ?)`,
    [state.saveId, snapshot.policyVersion, snapshot.seasonId],
  );

  state.gameState.clubIds.forEach((orderedClubId, sortOrder) => {
    const tier = snapshot.tierByClubId[orderedClubId];
    if (tier === undefined) {
      throw mappingFailure(`competitive tier is missing for active club ${orderedClubId}`);
    }
    database.run(
      `INSERT INTO club_competitive_tier_assignments
       (save_id, sort_order, club_id, tier) VALUES (?, ?, ?, ?)`,
      [state.saveId, sortOrder, orderedClubId, tier],
    );
  });
}

/** Loads one required current tier snapshot without beta compatibility defaults. */
function loadClubCompetitiveTierState(
  database: SqliteWorldDatabase,
  save: SaveId,
  activeClubIds: readonly ClubId[],
  activeSeasonId: ReturnType<typeof seasonId>,
): ClubCompetitiveTierState {
  const headers = database.queryAll(
    `SELECT policy_version, season_id FROM club_competitive_tier_state
     WHERE save_id = ?`,
    [save],
  );
  if (headers.length !== 1) {
    throw mappingFailure(`competitive-tier header is missing or duplicated for ${save}`);
  }

  const tierByClubId = {} as Record<ClubId, ClubCompetitiveTier>;
  const assignments = database.queryAll(
    `SELECT sort_order, club_id, tier FROM club_competitive_tier_assignments
     WHERE save_id = ? ORDER BY sort_order`,
    [save],
  );
  assignments.forEach((row, expectedSortOrder) => {
    if (number(row, "sort_order") !== expectedSortOrder) {
      throw mappingFailure(`competitive-tier assignment order is not contiguous for ${save}`);
    }
    const assignedClubId = clubId(text(row, "club_id"));
    if (tierByClubId[assignedClubId] !== undefined) {
      throw mappingFailure(`competitive tier is duplicated for club ${assignedClubId}`);
    }
    tierByClubId[assignedClubId] = text(row, "tier") as ClubCompetitiveTier;
  });

  const header = headers[0]!;
  return createClubCompetitiveTierState(
    {
      policyVersion: text(header, "policy_version") as ClubCompetitiveTierState["policyVersion"],
      seasonId: seasonId(text(header, "season_id")),
      tierByClubId,
    },
    activeClubIds,
    activeSeasonId,
  );
}

/** Writes durable injuries, suspensions, and competition yellow-card totals. */
function insertPlayerAvailability(database: SqliteWorldDatabase, state: CareerState): void {
  const availability = state.playerAvailability;
  if (availability === undefined) return;
  availability.injuries.forEach((injury, sortOrder) => {
    database.run(`INSERT INTO career_player_injuries
      (save_id, sort_order, player_id, fixture_id, severity, occurred_on, unavailable_until)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, injury.playerId, injury.fixtureId, injury.severity,
      injury.occurredOn, injury.unavailableUntil,
    ]);
  });
  availability.suspensions.forEach((suspension, sortOrder) => {
    database.run(`INSERT INTO career_player_suspensions
      (save_id, sort_order, player_id, fixture_id, competition_id, reason, remaining_matches)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, suspension.playerId, suspension.fixtureId,
      suspension.competitionId, suspension.reason, suspension.remainingMatches,
    ]);
  });
  availability.yellowCards.forEach((entry, sortOrder) => {
    database.run(`INSERT INTO career_player_yellow_cards
      (save_id, sort_order, player_id, competition_id, card_count) VALUES (?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, entry.playerId, entry.competitionId, entry.count,
    ]);
  });
}

/** Reconstructs the optional durable player-availability slice. */
function loadPlayerAvailability(
  database: SqliteWorldDatabase,
  save: SaveId,
): Pick<CareerState, "playerAvailability"> | undefined {
  const injuries = database.queryAll(
    "SELECT * FROM career_player_injuries WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => ({
    playerId: playerId(text(row, "player_id")),
    fixtureId: fixtureId(text(row, "fixture_id")),
    severity: text(row, "severity") as MatchInjurySeverity,
    occurredOn: gameDate(number(row, "occurred_on")),
    unavailableUntil: gameDate(number(row, "unavailable_until")),
  }));
  const suspensions = database.queryAll(
    "SELECT * FROM career_player_suspensions WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => ({
    playerId: playerId(text(row, "player_id")),
    fixtureId: fixtureId(text(row, "fixture_id")),
    competitionId: competitionId(text(row, "competition_id")),
    reason: text(row, "reason") as MatchSuspensionReason,
    remainingMatches: number(row, "remaining_matches"),
  }));
  const yellowCards = database.queryAll(
    "SELECT * FROM career_player_yellow_cards WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => ({
    playerId: playerId(text(row, "player_id")),
    competitionId: competitionId(text(row, "competition_id")),
    count: number(row, "card_count"),
  }));
  if (injuries.length === 0 && suspensions.length === 0 && yellowCards.length === 0) return undefined;
  const playerAvailability: CareerPlayerAvailabilityState = createCareerPlayerAvailabilityState({
    injuries,
    suspensions,
    yellowCards,
  });
  return { playerAvailability };
}

/** Writes monthly participation facts used by the player-development lifecycle. */
function insertPlayerParticipationLedger(database: SqliteWorldDatabase, state: CareerState): void {
  const ledger = state.playerParticipationLedger;
  if (ledger === undefined) return;

  database.run("INSERT INTO player_participation_ledgers (save_id) VALUES (?)", [state.saveId]);
  ledger.rowKeys.forEach((rowKey, sortOrder) => {
    const row = ledger.rows[rowKey];
    if (row === undefined) throw mappingFailure(`ordered participation row is missing: ${rowKey}`);
    database.run(`INSERT INTO player_participation_rows
      (save_id, sort_order, row_key, player_id, season_id, month_key, starts, substitute_appearances,
       minutes, rating_total, rating_samples)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId,
      sortOrder,
      row.rowKey,
      row.playerId,
      row.seasonId,
      row.monthKey,
      row.starts,
      row.substituteAppearances,
      row.minutes,
      row.ratingTotal,
      row.ratingSamples,
    ]);
    Object.entries(row.playedRoleMinutes).sort(([left], [right]) => left.localeCompare(right)).forEach(
      ([roleKey, minutes], roleOrder) => {
        if (minutes !== undefined) {
          database.run(`INSERT INTO player_participation_role_minutes
            (save_id, row_key, sort_order, role_key, minutes) VALUES (?, ?, ?, ?, ?)`,
          [state.saveId, row.rowKey, roleOrder, roleKey, minutes]);
        }
      },
    );
    Object.entries(row.clubMinutes).sort(([left], [right]) => left.localeCompare(right)).forEach(
      ([representedClubId, minutes], clubOrder) => {
        if (minutes !== undefined) {
          database.run(`INSERT INTO player_participation_club_minutes
            (save_id, row_key, sort_order, club_id, minutes) VALUES (?, ?, ?, ?, ?)`,
          [state.saveId, row.rowKey, clubOrder, representedClubId, minutes]);
        }
      },
    );
    row.appliedFixtureIds.forEach((appliedFixtureId, fixtureOrder) => {
      database.run(`INSERT INTO player_participation_applied_fixtures
        (save_id, row_key, sort_order, fixture_id) VALUES (?, ?, ?, ?)`,
      [state.saveId, row.rowKey, fixtureOrder, appliedFixtureId]);
    });
  });
  ledger.closedMonthKeys.forEach((monthKey, sortOrder) => {
    database.run(`INSERT INTO player_participation_closed_months
      (save_id, sort_order, month_key) VALUES (?, ?, ?)`,
    [state.saveId, sortOrder, monthKey]);
  });
}

/** Reconstructs the optional player-development participation ledger. */
function loadPlayerParticipationLedger(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "playerParticipationLedger"> | undefined {
  if (database.queryAll("SELECT save_id FROM player_participation_ledgers WHERE save_id = ?", [save]).length === 0) {
    return undefined;
  }

  const rows: Record<string, PlayerParticipationRow> = {};
  const rowKeys = database.queryAll("SELECT * FROM player_participation_rows WHERE save_id = ? ORDER BY sort_order", [save]).map((row) => {
    const rowKey = text(row, "row_key");
    const playedRoleMinutes = Object.fromEntries(
      database.queryAll(
        "SELECT role_key, minutes FROM player_participation_role_minutes WHERE save_id = ? AND row_key = ? ORDER BY sort_order",
        [save, rowKey],
      ).map((roleRow) => [text(roleRow, "role_key"), number(roleRow, "minutes")]),
    ) as PlayerParticipationRow["playedRoleMinutes"];
    const clubMinutes = Object.fromEntries(
      database.queryAll(
        "SELECT club_id, minutes FROM player_participation_club_minutes WHERE save_id = ? AND row_key = ? ORDER BY sort_order",
        [save, rowKey],
      ).map((clubRow) => [clubId(text(clubRow, "club_id")), number(clubRow, "minutes")]),
    ) as PlayerParticipationRow["clubMinutes"];
    rows[rowKey] = {
      rowKey,
      playerId: playerId(text(row, "player_id")),
      seasonId: seasonId(text(row, "season_id")),
      monthKey: text(row, "month_key"),
      starts: number(row, "starts"),
      substituteAppearances: number(row, "substitute_appearances"),
      minutes: number(row, "minutes"),
      ratingTotal: number(row, "rating_total"),
      ratingSamples: number(row, "rating_samples"),
      playedRoleMinutes,
      clubMinutes,
      appliedFixtureIds: database.queryAll(
        "SELECT fixture_id FROM player_participation_applied_fixtures WHERE save_id = ? AND row_key = ? ORDER BY sort_order",
        [save, rowKey],
      ).map((fixture) => fixtureId(text(fixture, "fixture_id"))),
    };
    return rowKey;
  });
  const closedMonthKeys = database.queryAll(
    "SELECT month_key FROM player_participation_closed_months WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => text(row, "month_key"));
  const playerParticipationLedger: PlayerParticipationLedger = createPlayerParticipationLedger({
    rows,
    rowKeys,
    closedMonthKeys,
  });

  return { playerParticipationLedger };
}

type PersistedNegotiationTermsKind =
  | "draft"
  | "submitted"
  | "counter"
  | "accepted"
  | "demand_preferred"
  | "demand_minimum";

/** Writes the optional ordered contract-negotiation state without JSON blobs. */
function insertContractNegotiationState(database: SqliteWorldDatabase, state: CareerState): void {
  const negotiationState = state.contractNegotiationState;
  if (negotiationState === undefined) return;

  database.run("INSERT INTO contract_negotiation_states (save_id) VALUES (?)", [state.saveId]);
  negotiationState.negotiationIds.forEach((negotiationIdValue, sortOrder) => {
    const negotiation = negotiationState.negotiations[negotiationIdValue];
    if (negotiation === undefined) {
      throw mappingFailure(`ordered contract negotiation is missing: ${negotiationIdValue}`);
    }

    let draftCreatedOn: SqliteBindValue = null;
    let submittedOn: SqliteBindValue = null;
    let responseDueOn: SqliteBindValue = null;
    let counterIssuedOn: SqliteBindValue = null;
    let counterExpiresOn: SqliteBindValue = null;
    let acceptedOn: SqliteBindValue = null;
    let acceptedSource: SqliteBindValue = null;
    let activatedContractId: SqliteBindValue = null;
    let rejectedOn: SqliteBindValue = null;
    let rejectedBy: SqliteBindValue = null;
    let withdrawnOn: SqliteBindValue = null;
    let expiredOn: SqliteBindValue = null;
    let expiryReason: SqliteBindValue = null;
    let decidedOn: SqliteBindValue = null;

    switch (negotiation.status) {
      case "draft":
        draftCreatedOn = negotiation.draft.createdOn;
        break;
      case "awaiting_response":
        submittedOn = negotiation.submittedOffer.submittedOn;
        responseDueOn = negotiation.submittedOffer.responseDueOn;
        break;
      case "countered":
        submittedOn = negotiation.submittedOffer.submittedOn;
        responseDueOn = negotiation.submittedOffer.responseDueOn;
        counterIssuedOn = negotiation.counterOffer.issuedOn;
        counterExpiresOn = negotiation.counterOffer.expiresOn;
        break;
      case "accepted":
        submittedOn = negotiation.submittedOffer.submittedOn;
        responseDueOn = negotiation.submittedOffer.responseDueOn;
        acceptedOn = negotiation.acceptedOn;
        acceptedSource = negotiation.acceptedSource;
        activatedContractId = negotiation.activatedContractId;
        break;
      case "rejected":
        submittedOn = negotiation.submittedOffer.submittedOn;
        responseDueOn = negotiation.submittedOffer.responseDueOn;
        rejectedOn = negotiation.rejectedOn;
        rejectedBy = negotiation.rejectedBy;
        break;
      case "withdrawn":
        withdrawnOn = negotiation.withdrawnOn;
        break;
      case "expired":
        expiredOn = negotiation.expiredOn;
        expiryReason = negotiation.reason;
        break;
      case "release_at_expiry":
        decidedOn = negotiation.decidedOn;
        break;
    }

    database.run(`INSERT INTO contract_negotiations
      (save_id, sort_order, negotiation_id, player_id, club_id, current_contract_id, created_on, status,
       draft_created_on, submitted_on, response_due_on, counter_issued_on, counter_expires_on,
       accepted_on, accepted_source, activated_contract_id, rejected_on, rejected_by, withdrawn_on,
       expired_on, expiry_reason, decided_on)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId,
      sortOrder,
      negotiation.id,
      negotiation.playerId,
      negotiation.clubId,
      negotiation.currentContractId,
      negotiation.createdOn,
      negotiation.status,
      draftCreatedOn,
      submittedOn,
      responseDueOn,
      counterIssuedOn,
      counterExpiresOn,
      acceptedOn,
      acceptedSource,
      activatedContractId,
      rejectedOn,
      rejectedBy,
      withdrawnOn,
      expiredOn,
      expiryReason,
      decidedOn,
    ]);

    switch (negotiation.status) {
      case "draft":
        insertNegotiationTerms(database, state.saveId, "contract_negotiation_terms", "negotiation_id", negotiation.id, "draft", negotiation.draft.terms);
        break;
      case "awaiting_response":
        insertNegotiationTerms(database, state.saveId, "contract_negotiation_terms", "negotiation_id", negotiation.id, "submitted", negotiation.submittedOffer.terms);
        break;
      case "countered":
        insertNegotiationTerms(database, state.saveId, "contract_negotiation_terms", "negotiation_id", negotiation.id, "submitted", negotiation.submittedOffer.terms);
        insertNegotiationTerms(database, state.saveId, "contract_negotiation_terms", "negotiation_id", negotiation.id, "counter", negotiation.counterOffer.terms);
        insertNegotiationEvaluation(database, state.saveId, "contract_negotiation_evaluations", "contract_negotiation_evaluation_reasons", "contract_negotiation_terms", "negotiation_id", negotiation.id, negotiation.counterOffer.evaluation);
        break;
      case "accepted":
        insertNegotiationTerms(database, state.saveId, "contract_negotiation_terms", "negotiation_id", negotiation.id, "submitted", negotiation.submittedOffer.terms);
        insertNegotiationTerms(database, state.saveId, "contract_negotiation_terms", "negotiation_id", negotiation.id, "accepted", negotiation.acceptedTerms);
        insertNegotiationEvaluation(database, state.saveId, "contract_negotiation_evaluations", "contract_negotiation_evaluation_reasons", "contract_negotiation_terms", "negotiation_id", negotiation.id, negotiation.evaluation);
        break;
      case "rejected":
        insertNegotiationTerms(database, state.saveId, "contract_negotiation_terms", "negotiation_id", negotiation.id, "submitted", negotiation.submittedOffer.terms);
        if (negotiation.evaluation !== undefined) {
          insertNegotiationEvaluation(database, state.saveId, "contract_negotiation_evaluations", "contract_negotiation_evaluation_reasons", "contract_negotiation_terms", "negotiation_id", negotiation.id, negotiation.evaluation);
        }
        break;
      case "withdrawn":
      case "expired":
      case "release_at_expiry":
        break;
    }
  });
}

/** Writes durable club-to-club transfer negotiations. */
function insertTransferNegotiationState(database: SqliteWorldDatabase, state: CareerState): void {
  const negotiationState = state.transferNegotiationState;
  if (negotiationState === undefined) return;

  database.run("INSERT INTO transfer_negotiation_states (save_id) VALUES (?)", [state.saveId]);
  negotiationState.negotiationIds.forEach((negotiationIdValue, sortOrder) => {
    const negotiation = negotiationState.negotiations[negotiationIdValue];
    if (negotiation === undefined) {
      throw mappingFailure(`ordered transfer negotiation is missing: ${negotiationIdValue}`);
    }

    let submittedOn: SqliteBindValue = null;
    let responseDueOn: SqliteBindValue = null;
    const offeredFee: SqliteBindValue = negotiation.offeredFee;
    const counterFee: SqliteBindValue = negotiation.counterFee ?? null;
    let counterIssuedOn: SqliteBindValue = null;
    let agreedFee: SqliteBindValue = null;
    let acceptedOn: SqliteBindValue = null;
    let clubAcceptedOn: SqliteBindValue = null;
    let rejectedOn: SqliteBindValue = null;
    let rejectionReason: SqliteBindValue = null;
    let withdrawnOn: SqliteBindValue = null;
    let expiredOn: SqliteBindValue = null;
    let cancelledOn: SqliteBindValue = null;
    let failedOn: SqliteBindValue = null;
    let completionFailureReason: SqliteBindValue = null;
    let completedOn: SqliteBindValue = null;
    let completedFee: SqliteBindValue = null;
    let acceptedSource: SqliteBindValue = null;
    let activatedContractId: SqliteBindValue = null;
    let transferHistorySequence: SqliteBindValue = null;
    let stageDeadlineDate: SqliteBindValue = null;
    let stageDeadlineReason: SqliteBindValue = null;

    switch (negotiation.status) {
      case "submitted":
        submittedOn = negotiation.submittedOn;
        responseDueOn = negotiation.clock.responseDueOn;
        stageDeadlineDate = negotiation.clock.deadline;
        break;
      case "countered":
        submittedOn = negotiation.submittedOn;
        responseDueOn = negotiation.clock.responseDueOn;
        counterIssuedOn = negotiation.counterIssuedOn;
        stageDeadlineDate = negotiation.clock.deadline;
        break;
      case "accepted":
        submittedOn = negotiation.clock.submittedOn;
        responseDueOn = negotiation.clock.responseDueOn;
        agreedFee = negotiation.agreedFee;
        acceptedOn = negotiation.acceptedOn;
        stageDeadlineDate = negotiation.clock.deadline;
        break;
      case "player_offer_submitted":
        agreedFee = negotiation.agreedFee;
        clubAcceptedOn = negotiation.clubAcceptedOn;
        submittedOn = negotiation.submittedOn;
        responseDueOn = negotiation.clock.responseDueOn;
        stageDeadlineDate = negotiation.clock.deadline;
        break;
      case "player_countered":
        agreedFee = negotiation.agreedFee;
        clubAcceptedOn = negotiation.clubAcceptedOn;
        submittedOn = negotiation.submittedOn;
        responseDueOn = negotiation.clock.responseDueOn;
        counterIssuedOn = negotiation.counterIssuedOn;
        stageDeadlineDate = negotiation.clock.deadline;
        break;
      case "player_rejected":
        agreedFee = negotiation.agreedFee;
        rejectedOn = negotiation.rejectedOn;
        rejectionReason = negotiation.reason;
        break;
      case "player_expired":
        agreedFee = negotiation.agreedFee;
        expiredOn = negotiation.expiredOn;
        break;
      case "completion_failed":
        agreedFee = negotiation.agreedFee;
        failedOn = negotiation.failedOn;
        completionFailureReason = negotiation.reason;
        break;
      case "completed":
        agreedFee = negotiation.agreedFee;
        completedFee = negotiation.completedFee;
        completedOn = negotiation.completedOn;
        acceptedSource = negotiation.acceptedSource;
        activatedContractId = negotiation.activatedContractId;
        transferHistorySequence = negotiation.transferHistorySequence;
        break;
      case "rejected":
        rejectedOn = negotiation.rejectedOn;
        rejectionReason = negotiation.reason;
        break;
      case "withdrawn":
        withdrawnOn = negotiation.withdrawnOn;
        break;
      case "expired":
        expiredOn = negotiation.expiredOn;
        break;
      case "unaffordable":
        cancelledOn = negotiation.cancelledOn;
        break;
    }

    database.run(`INSERT INTO transfer_negotiations
      (save_id, sort_order, negotiation_id, buying_club_id, selling_club_id, player_id, status,
       public_value, initial_asking_price, current_asking_price,
       submitted_on, response_due_on, offered_fee, counter_fee, counter_issued_on, agreed_fee, completed_fee, accepted_on,
       club_accepted_on, rejected_on, rejection_reason, withdrawn_on, expired_on, cancelled_on,
       failed_on, completion_failure_reason, completed_on, accepted_source, activated_contract_id,
       transfer_history_sequence, stage_deadline_date, stage_deadline_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId,
      sortOrder,
      negotiation.id,
      negotiation.buyingClubId,
      negotiation.sellingClubId,
      negotiation.playerId,
      negotiation.status,
      negotiation.publicValue,
      negotiation.initialAskingPrice,
      negotiation.currentAskingPrice,
      submittedOn,
      responseDueOn,
      offeredFee,
      counterFee,
      counterIssuedOn,
      agreedFee,
      completedFee,
      acceptedOn,
      clubAcceptedOn,
      rejectedOn,
      rejectionReason,
      withdrawnOn,
      expiredOn,
      cancelledOn,
      failedOn,
      completionFailureReason,
      completedOn,
      acceptedSource,
      activatedContractId,
      transferHistorySequence,
      stageDeadlineDate,
      stageDeadlineReason,
    ]);

    switch (negotiation.status) {
      case "player_offer_submitted":
        insertNegotiationTerms(database, state.saveId, "transfer_negotiation_terms", "negotiation_id", negotiation.id, "offered", negotiation.offeredTerms);
        insertContractDemandSnapshot(database, state.saveId, "transfer_negotiation_evaluations", "transfer_negotiation_evaluation_reasons", "transfer_negotiation_terms", "negotiation_id", negotiation.id, negotiation.demand);
        break;
      case "player_countered":
        insertNegotiationTerms(database, state.saveId, "transfer_negotiation_terms", "negotiation_id", negotiation.id, "offered", negotiation.offeredTerms);
        insertNegotiationTerms(database, state.saveId, "transfer_negotiation_terms", "negotiation_id", negotiation.id, "counter", negotiation.counterTerms);
        insertNegotiationEvaluation(database, state.saveId, "transfer_negotiation_evaluations", "transfer_negotiation_evaluation_reasons", "transfer_negotiation_terms", "negotiation_id", negotiation.id, negotiation.evaluation);
        break;
      case "player_rejected":
        if (negotiation.evaluation !== undefined) {
          insertNegotiationEvaluation(database, state.saveId, "transfer_negotiation_evaluations", "transfer_negotiation_evaluation_reasons", "transfer_negotiation_terms", "negotiation_id", negotiation.id, negotiation.evaluation);
        }
        break;
      case "completed":
        insertNegotiationTerms(database, state.saveId, "transfer_negotiation_terms", "negotiation_id", negotiation.id, "accepted", negotiation.acceptedTerms);
        insertNegotiationEvaluation(database, state.saveId, "transfer_negotiation_evaluations", "transfer_negotiation_evaluation_reasons", "transfer_negotiation_terms", "negotiation_id", negotiation.id, negotiation.evaluation);
        break;
    }
  });
}

/** Writes durable preliminary agreements. */
function insertPreliminaryAgreementState(database: SqliteWorldDatabase, state: CareerState): void {
  const agreementState = state.preliminaryAgreementState;
  if (agreementState === undefined) return;

  database.run("INSERT INTO preliminary_agreement_states (save_id) VALUES (?)", [state.saveId]);
  agreementState.agreementIds.forEach((agreementIdValue, sortOrder) => {
    const agreement = agreementState.agreements[agreementIdValue];
    if (agreement === undefined) {
      throw mappingFailure(`ordered preliminary agreement is missing: ${agreementIdValue}`);
    }

    let counterIssuedOn: SqliteBindValue = null;
    let responseDueOn: SqliteBindValue = null;
    let agreedOn: SqliteBindValue = null;
    let acceptedSource: SqliteBindValue = null;
    let rejectedOn: SqliteBindValue = null;
    let rejectionReason: SqliteBindValue = null;
    let withdrawnOn: SqliteBindValue = null;
    let expiredOn: SqliteBindValue = null;
    let expiryReason: SqliteBindValue = null;
    let cancelledOn: SqliteBindValue = null;
    let cancellationReason: SqliteBindValue = null;
    let activatedOn: SqliteBindValue = null;
    let activatedContractId: SqliteBindValue = null;
    let stageDeadlineDate: SqliteBindValue = null;
    let stageDeadlineReason: SqliteBindValue = null;

    switch (agreement.status) {
      case "offer_submitted":
        responseDueOn = agreement.clock.responseDueOn;
        stageDeadlineDate = agreement.clock.deadline;
        break;
      case "countered":
        counterIssuedOn = agreement.counterIssuedOn;
        responseDueOn = agreement.clock.responseDueOn;
        stageDeadlineDate = agreement.clock.deadline;
        break;
      case "agreed":
        agreedOn = agreement.agreedOn;
        acceptedSource = agreement.acceptedSource;
        break;
      case "rejected":
        rejectedOn = agreement.rejectedOn;
        rejectionReason = agreement.reason;
        break;
      case "withdrawn":
        withdrawnOn = agreement.withdrawnOn;
        break;
      case "expired":
        expiredOn = agreement.expiredOn;
        expiryReason = agreement.reason;
        break;
      case "activation_cancelled":
        cancelledOn = agreement.cancelledOn;
        agreedOn = agreement.agreedOn;
        acceptedSource = agreement.acceptedSource;
        cancellationReason = agreement.reason;
        break;
      case "activated":
        agreedOn = agreement.agreedOn;
        acceptedSource = agreement.acceptedSource;
        activatedOn = agreement.activatedOn;
        activatedContractId = agreement.activatedContractId;
        break;
    }

    database.run(`INSERT INTO preliminary_agreements
      (save_id, sort_order, agreement_id, player_id, current_club_id, offering_club_id, current_contract_id,
       created_on, response_due_on, future_starts_on, status, counter_issued_on, agreed_on, accepted_source, rejected_on,
       rejection_reason, withdrawn_on, expired_on, expiry_reason, cancelled_on, cancellation_reason,
       activated_on, activated_contract_id, stage_deadline_date, stage_deadline_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId,
      sortOrder,
      agreement.id,
      agreement.playerId,
      agreement.currentClubId,
      agreement.offeringClubId,
      agreement.currentContractId,
      agreement.createdOn,
      responseDueOn,
      agreement.futureStartsOn,
      agreement.status,
      counterIssuedOn,
      agreedOn,
      acceptedSource,
      rejectedOn,
      rejectionReason,
      withdrawnOn,
      expiredOn,
      expiryReason,
      cancelledOn,
      cancellationReason,
      activatedOn,
      activatedContractId,
      stageDeadlineDate,
      stageDeadlineReason,
    ]);

    switch (agreement.status) {
      case "offer_submitted":
        insertNegotiationTerms(database, state.saveId, "preliminary_agreement_terms", "agreement_id", agreement.id, "offered", agreement.offeredTerms);
        insertContractDemandSnapshot(database, state.saveId, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", agreement.id, agreement.demand);
        break;
      case "countered":
        insertNegotiationTerms(database, state.saveId, "preliminary_agreement_terms", "agreement_id", agreement.id, "offered", agreement.offeredTerms);
        insertNegotiationTerms(database, state.saveId, "preliminary_agreement_terms", "agreement_id", agreement.id, "counter", agreement.counterTerms);
        insertNegotiationEvaluation(database, state.saveId, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", agreement.id, agreement.evaluation);
        break;
      case "agreed":
      case "activation_cancelled":
      case "activated":
        insertNegotiationTerms(database, state.saveId, "preliminary_agreement_terms", "agreement_id", agreement.id, "agreed", agreement.agreedTerms);
        insertNegotiationEvaluation(database, state.saveId, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", agreement.id, agreement.evaluation);
        break;
      case "rejected":
        if (agreement.evaluation !== undefined) {
          insertNegotiationEvaluation(database, state.saveId, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", agreement.id, agreement.evaluation);
        }
        break;
    }
  });
}

function insertContractDemandSnapshot(
  database: SqliteWorldDatabase,
  save: SaveId,
  tableName: string,
  reasonsTableName: string,
  termsTableName: string,
  ownerIdColumn: string,
  ownerId: string,
  demand: ContractDemandSnapshot,
  decision: ContractOfferEvaluation["decision"] = "countered",
  scoreBasisPoints: number = 0,
): void {
  database.run(`INSERT INTO ${tableName}
    (save_id, ${ownerIdColumn}, decision, score_basis_points, evaluated_on, age, current_ability,
     public_potential_p50_ability, role, expected_squad_status, current_annual_wage, remaining_contract_days,
     club_reputation, club_category, free_agent_leverage_basis_points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    save,
    ownerId,
    decision,
    scoreBasisPoints,
    demand.evaluatedOn,
    demand.age,
    demand.currentAbility,
    demand.publicPotentialP50Ability,
    demand.role,
    demand.expectedSquadStatus,
    demand.currentAnnualWage,
    demand.remainingContractDays,
    demand.clubReputation,
    demand.clubCategory,
    demand.freeAgentLeverageBasisPoints,
  ]);
  insertNegotiationTerms(database, save, termsTableName, ownerIdColumn, ownerId, "demand_preferred", demand.preferredTerms);
  insertNegotiationTerms(database, save, termsTableName, ownerIdColumn, ownerId, "demand_minimum", demand.minimumTerms);
}

function loadContractDemandSnapshot(
  database: SqliteWorldDatabase,
  save: SaveId,
  tableName: string,
  termsTableName: string,
  ownerIdColumn: string,
  ownerId: string,
): ContractDemandSnapshot {
  const rows = database.queryAll(
    `SELECT * FROM ${tableName} WHERE save_id = ? AND ${ownerIdColumn} = ?`,
    [save, ownerId],
  );
  if (rows.length !== 1) throw mappingFailure(`expected one demand snapshot row for ${ownerIdColumn}: ${ownerId}`);
  const row = rows[0]!;
  return {
    evaluatedOn: gameDate(number(row, "evaluated_on")),
    age: number(row, "age"),
    currentAbility: number(row, "current_ability"),
    publicPotentialP50Ability: number(row, "public_potential_p50_ability"),
    role: text(row, "role") as ContractDemandSnapshot["role"],
    expectedSquadStatus: text(row, "expected_squad_status") as AgreedSquadStatus,
    currentAnnualWage: nonNegativeMoney(number(row, "current_annual_wage")),
    remainingContractDays: number(row, "remaining_contract_days"),
    clubReputation: number(row, "club_reputation"),
    clubCategory: text(row, "club_category") as ContractDemandSnapshot["clubCategory"],
    freeAgentLeverageBasisPoints: number(row, "free_agent_leverage_basis_points"),
    preferredTerms: loadNegotiationTerms(database, save, termsTableName, ownerIdColumn, ownerId, "demand_preferred"),
    minimumTerms: loadNegotiationTerms(database, save, termsTableName, ownerIdColumn, ownerId, "demand_minimum"),
  };
}

/** Writes one supported term set for a contract, transfer, or preliminary agreement negotiation. */
function insertNegotiationTerms(
  database: SqliteWorldDatabase,
  save: SaveId,
  tableName: string,
  ownerIdColumn: string,
  ownerId: string,
  kind: string,
  terms: ContractOfferTerms,
): void {
  database.run(`INSERT INTO ${tableName}
    (save_id, ${ownerIdColumn}, terms_kind, duration_years, annual_wage, squad_status,
     signing_bonus, appearance_bonus, goal_bonus, clean_sheet_bonus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    save,
    ownerId,
    kind,
    terms.durationYears,
    terms.annualWage,
    terms.squadStatus,
    terms.bonuses.signingBonus,
    terms.bonuses.appearanceBonus,
    terms.bonuses.goalBonus ?? null,
    terms.bonuses.cleanSheetBonus ?? null,
  ]);
}

/** Writes one deterministic player response and its objective demand snapshot. */
function insertNegotiationEvaluation(
  database: SqliteWorldDatabase,
  save: SaveId,
  tableName: string,
  reasonsTableName: string,
  termsTableName: string,
  ownerIdColumn: string,
  ownerId: string,
  evaluation: ContractOfferEvaluation,
): void {
  insertContractDemandSnapshot(
    database,
    save,
    tableName,
    reasonsTableName,
    termsTableName,
    ownerIdColumn,
    ownerId,
    evaluation.demand,
    evaluation.decision,
    evaluation.scoreBasisPoints,
  );
  evaluation.reasons.forEach((reason, sortOrder) => {
    database.run(`INSERT INTO ${reasonsTableName}
      (save_id, ${ownerIdColumn}, sort_order, reason) VALUES (?, ?, ?, ?)`,
    [save, ownerId, sortOrder, reason]);
  });
}

/** Reconstructs an optional ordered contract negotiation state from normalized rows. */
function loadContractNegotiationState(
  database: SqliteWorldDatabase,
  save: SaveId,
  gameState: CareerState["gameState"],
  seniorSquadState: SeniorSquadState,
): ContractNegotiationState | undefined {
  if (database.queryAll("SELECT save_id FROM contract_negotiation_states WHERE save_id = ?", [save]).length === 0) {
    return undefined;
  }

  const negotiations: Record<ContractNegotiationId, ContractNegotiation> = {};
  const negotiationIds = database.queryAll(
    "SELECT * FROM contract_negotiations WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = contractNegotiationId(text(row, "negotiation_id"));
    const common = {
      id,
      playerId: playerId(text(row, "player_id")),
      clubId: clubId(text(row, "club_id")),
      currentContractId: playerContractId(text(row, "current_contract_id")),
      createdOn: gameDate(number(row, "created_on")),
    };
    const status = text(row, "status") as ContractNegotiation["status"];
    const submittedOffer = () => ({
      submittedOn: gameDate(number(row, "submitted_on")),
      responseDueOn: gameDate(number(row, "response_due_on")),
      terms: loadNegotiationTerms(database, save, "contract_negotiation_terms", "negotiation_id", id, "submitted"),
    });

    switch (status) {
      case "draft":
        negotiations[id] = {
          ...common,
          status,
          draft: {
            createdOn: gameDate(number(row, "draft_created_on")),
            terms: loadNegotiationTerms(database, save, "contract_negotiation_terms", "negotiation_id", id, "draft"),
          },
        };
        break;
      case "awaiting_response":
        negotiations[id] = { ...common, status, submittedOffer: submittedOffer() };
        break;
      case "countered":
        negotiations[id] = {
          ...common,
          status,
          submittedOffer: submittedOffer(),
          counterOffer: {
            issuedOn: gameDate(number(row, "counter_issued_on")),
            expiresOn: gameDate(number(row, "counter_expires_on")),
            terms: loadNegotiationTerms(database, save, "contract_negotiation_terms", "negotiation_id", id, "counter"),
            evaluation: requireNegotiationEvaluation(database, save, "contract_negotiation_evaluations", "contract_negotiation_evaluation_reasons", "contract_negotiation_terms", "negotiation_id", id),
          },
        };
        break;
      case "accepted":
        negotiations[id] = {
          ...common,
          status,
          submittedOffer: submittedOffer(),
          acceptedOn: gameDate(number(row, "accepted_on")),
          acceptedTerms: loadNegotiationTerms(database, save, "contract_negotiation_terms", "negotiation_id", id, "accepted"),
          acceptedSource: text(row, "accepted_source") as "submitted_offer" | "counter_offer",
          evaluation: requireNegotiationEvaluation(database, save, "contract_negotiation_evaluations", "contract_negotiation_evaluation_reasons", "contract_negotiation_terms", "negotiation_id", id),
          activatedContractId: playerContractId(text(row, "activated_contract_id")),
        };
        break;
      case "rejected": {
        const evaluation = loadNegotiationEvaluation(database, save, "contract_negotiation_evaluations", "contract_negotiation_evaluation_reasons", "contract_negotiation_terms", "negotiation_id", id);
        negotiations[id] = {
          ...common,
          status,
          submittedOffer: submittedOffer(),
          rejectedOn: gameDate(number(row, "rejected_on")),
          rejectedBy: text(row, "rejected_by") as "player" | "club",
          ...(evaluation === undefined ? {} : { evaluation }),
        };
        break;
      }
      case "withdrawn":
        negotiations[id] = { ...common, status, withdrawnOn: gameDate(number(row, "withdrawn_on")) };
        break;
      case "expired":
        negotiations[id] = {
          ...common,
          status,
          expiredOn: gameDate(number(row, "expired_on")),
          reason: text(row, "expiry_reason") as "counter_offer_expired" | "current_contract_expired",
        };
        break;
      case "release_at_expiry":
        negotiations[id] = { ...common, status, decidedOn: gameDate(number(row, "decided_on")) };
        break;
    }
    return id;
  });

  return createContractNegotiationState(gameState, seniorSquadState, { negotiations, negotiationIds });
}

/** Reconstructs an optional ordered transfer negotiation state from normalized rows. */
function loadTransferNegotiationState(
  database: SqliteWorldDatabase,
  save: SaveId,
): TransferNegotiationState | undefined {
  if (database.queryAll("SELECT save_id FROM transfer_negotiation_states WHERE save_id = ?", [save]).length === 0) {
    return undefined;
  }

  const negotiations: Record<string, TransferNegotiation> = {};
  const negotiationIds = database.queryAll(
    "SELECT * FROM transfer_negotiations WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = transferNegotiationId(text(row, "negotiation_id"));
    const buyingClubId = clubId(text(row, "buying_club_id"));
    const sellingClubId = clubId(text(row, "selling_club_id"));
    const playerIdVal = playerId(text(row, "player_id"));
    const status = text(row, "status") as TransferNegotiation["status"];

    const counterFeeValue = optionalNumber(row, "counter_fee");
    const baseParties = {
      id,
      buyingClubId,
      sellingClubId,
      playerId: playerIdVal,
      publicValue: nonNegativeMoney(number(row, "public_value")),
      initialAskingPrice: nonNegativeMoney(number(row, "initial_asking_price")),
      currentAskingPrice: nonNegativeMoney(number(row, "current_asking_price")),
      offeredFee: nonNegativeMoney(number(row, "offered_fee")),
      ...(counterFeeValue === undefined
        ? {}
        : { counterFee: nonNegativeMoney(counterFeeValue) }),
    };

    switch (status) {
      case "submitted": {
        const subOn = gameDate(number(row, "submitted_on"));
        negotiations[id] = {
          ...baseParties,
          status,
          submittedOn: subOn,
          clock: {
            submittedOn: subOn,
            responseDueOn: gameDate(number(row, "response_due_on")),
            deadline: gameDate(number(row, "stage_deadline_date")),
          },
        };
        break;
      }
      case "countered": {
        const subOn = gameDate(number(row, "submitted_on"));
        negotiations[id] = {
          ...baseParties,
          status,
          submittedOn: subOn,
          counterFee: nonNegativeMoney(number(row, "counter_fee")),
          counterIssuedOn: gameDate(number(row, "counter_issued_on")),
          clock: {
            submittedOn: subOn,
            responseDueOn: gameDate(number(row, "response_due_on")),
            deadline: gameDate(number(row, "stage_deadline_date")),
          },
        };
        break;
      }
      case "accepted": {
        const submittedOn = gameDate(number(row, "submitted_on"));
        negotiations[id] = {
          ...baseParties,
          status,
          agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
          acceptedOn: gameDate(number(row, "accepted_on")),
          clock: {
            submittedOn,
            responseDueOn: gameDate(number(row, "response_due_on")),
            deadline: gameDate(number(row, "stage_deadline_date")),
          },
        };
        break;
      }
      case "player_offer_submitted": {
        const offeredTerms = loadNegotiationTerms(database, save, "transfer_negotiation_terms", "negotiation_id", id, "offered");
        const demand = loadContractDemandSnapshot(database, save, "transfer_negotiation_evaluations", "transfer_negotiation_terms", "negotiation_id", id);
        const subOn = gameDate(number(row, "submitted_on"));
        negotiations[id] = {
          ...baseParties,
          status,
          agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
          clubAcceptedOn: gameDate(number(row, "club_accepted_on")),
          submittedOn: subOn,
          offeredTerms,
          demand,
          clock: {
            submittedOn: subOn,
            responseDueOn: gameDate(number(row, "response_due_on")),
            deadline: gameDate(number(row, "stage_deadline_date")),
          },
        };
        break;
      }
      case "player_countered": {
        const offeredTerms = loadNegotiationTerms(database, save, "transfer_negotiation_terms", "negotiation_id", id, "offered");
        const counterTerms = loadNegotiationTerms(database, save, "transfer_negotiation_terms", "negotiation_id", id, "counter");
        const evaluation = requireNegotiationEvaluation(database, save, "transfer_negotiation_evaluations", "transfer_negotiation_evaluation_reasons", "transfer_negotiation_terms", "negotiation_id", id);
        const subOn = gameDate(number(row, "submitted_on"));
        negotiations[id] = {
          ...baseParties,
          status,
          agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
          clubAcceptedOn: gameDate(number(row, "club_accepted_on")),
          submittedOn: subOn,
          offeredTerms,
          counterIssuedOn: gameDate(number(row, "counter_issued_on")),
          counterTerms,
          evaluation,
          clock: {
            submittedOn: subOn,
            responseDueOn: gameDate(number(row, "response_due_on")),
            deadline: gameDate(number(row, "stage_deadline_date")),
          },
        };
        break;
      }
      case "player_rejected": {
        const evaluation = loadNegotiationEvaluation(database, save, "transfer_negotiation_evaluations", "transfer_negotiation_evaluation_reasons", "transfer_negotiation_terms", "negotiation_id", id);
        negotiations[id] = {
          ...baseParties,
          status,
          agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
          rejectedOn: gameDate(number(row, "rejected_on")),
          reason: text(row, "rejection_reason") as any,
          ...(evaluation === undefined ? {} : { evaluation }),
        };
        break;
      }
      case "player_expired":
        negotiations[id] = {
          ...baseParties,
          status,
          agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
          expiredOn: gameDate(number(row, "expired_on")),
        };
        break;
      case "completion_failed":
        negotiations[id] = {
          ...baseParties,
          status,
          agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
          failedOn: gameDate(number(row, "failed_on")),
          reason: text(row, "completion_failure_reason") as any,
        };
        break;
      case "completed": {
        const acceptedTerms = loadNegotiationTerms(database, save, "transfer_negotiation_terms", "negotiation_id", id, "accepted");
        const evaluation = requireNegotiationEvaluation(database, save, "transfer_negotiation_evaluations", "transfer_negotiation_evaluation_reasons", "transfer_negotiation_terms", "negotiation_id", id);
        negotiations[id] = {
          ...baseParties,
          status,
          agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
          completedFee: nonNegativeMoney(number(row, "completed_fee")),
          completedOn: gameDate(number(row, "completed_on")),
          acceptedTerms,
          acceptedSource: text(row, "accepted_source") as any,
          evaluation,
          activatedContractId: playerContractId(text(row, "activated_contract_id")),
          transferHistorySequence: number(row, "transfer_history_sequence"),
        };
        break;
      }
      case "rejected":
        negotiations[id] = {
          ...baseParties,
          status,
          rejectedOn: gameDate(number(row, "rejected_on")),
          reason: text(row, "rejection_reason") as any,
        };
        break;
      case "withdrawn":
        negotiations[id] = {
          ...baseParties,
          status,
          withdrawnOn: gameDate(number(row, "withdrawn_on")),
        };
        break;
      case "expired":
        negotiations[id] = {
          ...baseParties,
          status,
          expiredOn: gameDate(number(row, "expired_on")),
        };
        break;
      case "unaffordable":
        negotiations[id] = {
          ...baseParties,
          status,
          cancelledOn: gameDate(number(row, "cancelled_on")),
        };
        break;
    }
    return id;
  });

  return createTransferNegotiationState({ negotiations, negotiationIds });
}

/** Reconstructs an optional ordered preliminary agreement state from normalized rows. */
function loadPreliminaryAgreementState(
  database: SqliteWorldDatabase,
  save: SaveId,
  gameState: CareerState["gameState"],
  seniorSquadState: SeniorSquadState,
): PreliminaryAgreementState | undefined {
  if (database.queryAll("SELECT save_id FROM preliminary_agreement_states WHERE save_id = ?", [save]).length === 0) {
    return undefined;
  }

  const agreements: Record<string, PreliminaryAgreement> = {};
  const agreementIds = database.queryAll(
    "SELECT * FROM preliminary_agreements WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = preliminaryAgreementId(text(row, "agreement_id"));
    const playerIdVal = playerId(text(row, "player_id"));
    const currentClubId = clubId(text(row, "current_club_id"));
    const offeringClubId = clubId(text(row, "offering_club_id"));
    const currentContractId = playerContractId(text(row, "current_contract_id"));
    const createdOn = gameDate(number(row, "created_on"));
    const futureStartsOn = gameDate(number(row, "future_starts_on"));
    const status = text(row, "status") as PreliminaryAgreement["status"];

    const baseAgreement = {
      id,
      playerId: playerIdVal,
      currentClubId,
      offeringClubId,
      currentContractId,
      createdOn,
      futureStartsOn,
    };

    switch (status) {
      case "offer_submitted": {
        const offeredTerms = loadNegotiationTerms(database, save, "preliminary_agreement_terms", "agreement_id", id, "offered");
        const demand = loadContractDemandSnapshot(database, save, "preliminary_agreement_evaluations", "preliminary_agreement_terms", "agreement_id", id);
        agreements[id] = {
          ...baseAgreement,
          status,
          offeredTerms,
          demand,
          clock: {
            submittedOn: createdOn,
            responseDueOn: gameDate(number(row, "response_due_on")),
            deadline: gameDate(number(row, "stage_deadline_date")),
          },
        };
        break;
      }
      case "countered": {
        const offeredTerms = loadNegotiationTerms(database, save, "preliminary_agreement_terms", "agreement_id", id, "offered");
        const counterTerms = loadNegotiationTerms(database, save, "preliminary_agreement_terms", "agreement_id", id, "counter");
        const evaluation = requireNegotiationEvaluation(database, save, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", id);
        agreements[id] = {
          ...baseAgreement,
          status,
          offeredTerms,
          counterTerms,
          counterIssuedOn: gameDate(number(row, "counter_issued_on")),
          evaluation,
          clock: {
            submittedOn: createdOn,
            responseDueOn: gameDate(number(row, "response_due_on")),
            deadline: gameDate(number(row, "stage_deadline_date")),
          },
        };
        break;
      }
      case "agreed": {
        const agreedTerms = loadNegotiationTerms(database, save, "preliminary_agreement_terms", "agreement_id", id, "agreed");
        const evaluation = requireNegotiationEvaluation(database, save, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", id);
        agreements[id] = {
          ...baseAgreement,
          status,
          agreedOn: gameDate(number(row, "agreed_on")),
          agreedTerms,
          acceptedSource: text(row, "accepted_source") as any,
          evaluation,
        };
        break;
      }
      case "rejected": {
        const evaluation = loadNegotiationEvaluation(database, save, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", id);
        agreements[id] = {
          ...baseAgreement,
          status,
          rejectedOn: gameDate(number(row, "rejected_on")),
          reason: text(row, "rejection_reason") as any,
          ...(evaluation === undefined ? {} : { evaluation }),
        };
        break;
      }
      case "withdrawn":
        agreements[id] = {
          ...baseAgreement,
          status,
          withdrawnOn: gameDate(number(row, "withdrawn_on")),
        };
        break;
      case "expired":
        agreements[id] = {
          ...baseAgreement,
          status,
          expiredOn: gameDate(number(row, "expired_on")),
          reason: text(row, "expiry_reason") as any,
        };
        break;
      case "activation_cancelled": {
        const agreedTerms = loadNegotiationTerms(database, save, "preliminary_agreement_terms", "agreement_id", id, "agreed");
        const evaluation = requireNegotiationEvaluation(database, save, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", id);
        agreements[id] = {
          ...baseAgreement,
          status,
          cancelledOn: gameDate(number(row, "cancelled_on")),
          agreedOn: gameDate(number(row, "agreed_on")),
          agreedTerms,
          acceptedSource: text(row, "accepted_source") as any,
          evaluation,
          reason: text(row, "cancellation_reason") as any,
        };
        break;
      }
      case "activated": {
        const agreedTerms = loadNegotiationTerms(database, save, "preliminary_agreement_terms", "agreement_id", id, "agreed");
        const evaluation = requireNegotiationEvaluation(database, save, "preliminary_agreement_evaluations", "preliminary_agreement_evaluation_reasons", "preliminary_agreement_terms", "agreement_id", id);
        agreements[id] = {
          ...baseAgreement,
          status,
          agreedOn: gameDate(number(row, "agreed_on")),
          agreedTerms,
          acceptedSource: text(row, "accepted_source") as any,
          evaluation,
          activatedOn: gameDate(number(row, "activated_on")),
          activatedContractId: playerContractId(text(row, "activated_contract_id")),
        };
        break;
      }
    }

    return id;
  });

  return createPreliminaryAgreementState(gameState, seniorSquadState, { agreements, agreementIds });
}

/** Reconstructs one named term set and rejects incomplete relational rows. */
function loadNegotiationTerms(
  database: SqliteWorldDatabase,
  save: SaveId,
  tableName: string,
  ownerIdColumn: string,
  ownerId: string,
  kind: string,
): ContractOfferTerms {
  const rows = database.queryAll(
    `SELECT * FROM ${tableName} WHERE save_id = ? AND ${ownerIdColumn} = ? AND terms_kind = ?`,
    [save, ownerId, kind],
  );
  if (rows.length !== 1) throw mappingFailure(`expected one ${kind} term set for ${ownerIdColumn}: ${ownerId}`);
  const row = rows[0]!;
  const goalBonus = optionalNumber(row, "goal_bonus");
  const cleanSheetBonus = optionalNumber(row, "clean_sheet_bonus");
  return {
    durationYears: number(row, "duration_years"),
    annualWage: nonNegativeMoney(number(row, "annual_wage")),
    squadStatus: text(row, "squad_status") as AgreedSquadStatus,
    bonuses: {
      signingBonus: nonNegativeMoney(number(row, "signing_bonus")),
      appearanceBonus: nonNegativeMoney(number(row, "appearance_bonus")),
      ...(goalBonus === undefined ? {} : { goalBonus: nonNegativeMoney(goalBonus) }),
      ...(cleanSheetBonus === undefined ? {} : { cleanSheetBonus: nonNegativeMoney(cleanSheetBonus) }),
    },
  };
}

/** Reconstructs one optional deterministic player-response evaluation. */
function loadNegotiationEvaluation(
  database: SqliteWorldDatabase,
  save: SaveId,
  tableName: string,
  reasonsTableName: string,
  termsTableName: string,
  ownerIdColumn: string,
  ownerId: string,
): ContractOfferEvaluation | undefined {
  const rows = database.queryAll(
    `SELECT * FROM ${tableName} WHERE save_id = ? AND ${ownerIdColumn} = ?`,
    [save, ownerId],
  );
  if (rows.length === 0) return undefined;
  if (rows.length !== 1) throw mappingFailure(`expected one evaluation for ${ownerIdColumn}: ${ownerId}`);
  const row = rows[0]!;
  return {
    decision: text(row, "decision") as ContractOfferEvaluation["decision"],
    scoreBasisPoints: number(row, "score_basis_points"),
    reasons: database.queryAll(
      `SELECT reason FROM ${reasonsTableName} WHERE save_id = ? AND ${ownerIdColumn} = ? ORDER BY sort_order`,
      [save, ownerId],
    ).map((reasonRow) => text(reasonRow, "reason") as ContractOfferEvaluationReason),
    demand: {
      evaluatedOn: gameDate(number(row, "evaluated_on")),
      age: number(row, "age"),
      currentAbility: number(row, "current_ability"),
      publicPotentialP50Ability: number(row, "public_potential_p50_ability"),
      role: text(row, "role") as ContractOfferEvaluation["demand"]["role"],
      expectedSquadStatus: text(row, "expected_squad_status") as AgreedSquadStatus,
      currentAnnualWage: nonNegativeMoney(number(row, "current_annual_wage")),
      remainingContractDays: number(row, "remaining_contract_days"),
      clubReputation: number(row, "club_reputation"),
      clubCategory: text(row, "club_category") as ContractOfferEvaluation["demand"]["clubCategory"],
      freeAgentLeverageBasisPoints: number(row, "free_agent_leverage_basis_points"),
      preferredTerms: loadNegotiationTerms(database, save, termsTableName, ownerIdColumn, ownerId, "demand_preferred"),
      minimumTerms: loadNegotiationTerms(database, save, termsTableName, ownerIdColumn, ownerId, "demand_minimum"),
    },
  };
}

/** Requires the evaluation owned by a countered or accepted negotiation. */
function requireNegotiationEvaluation(
  database: SqliteWorldDatabase,
  save: SaveId,
  tableName: string,
  reasonsTableName: string,
  termsTableName: string,
  ownerIdColumn: string,
  ownerId: string,
): ContractOfferEvaluation {
  const evaluation = loadNegotiationEvaluation(database, save, tableName, reasonsTableName, termsTableName, ownerIdColumn, ownerId);
  if (evaluation === undefined) throw mappingFailure(`negotiation evaluation is missing for ${ownerIdColumn}: ${ownerId}`);
  return evaluation;
}

/** Writes ordered current-season message facts without rendered text or blobs. */
function insertCurrentSeasonInbox(database: SqliteWorldDatabase, state: CareerState): void {
  (state.currentSeasonInbox ?? []).forEach((message, sortOrder) => {
    database.run(`INSERT INTO career_inbox_messages
      (save_id, sort_order, message_id, message_date, category, source, attention_level,
       continue_policy, is_read, is_acknowledged, is_resolved, fixture_id, club_id, player_id,
       contract_id, contract_negotiation_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId,
      sortOrder,
      message.id,
      message.date,
      message.category,
      message.source,
      message.level,
      message.continuePolicy,
      message.lifecycle.read ? 1 : 0,
      message.lifecycle.acknowledged ? 1 : 0,
      message.lifecycle.resolved ? 1 : 0,
      message.related.fixtureId ?? null,
      message.related.clubId ?? null,
      message.related.playerId ?? null,
      message.related.contractId ?? null,
      message.related.contractNegotiationId ?? null,
    ]);
    message.blockerKeys.forEach((blockerKey, blockerOrder) => {
      database.run(`INSERT INTO career_inbox_blockers
        (save_id, message_id, sort_order, blocker_key) VALUES (?, ?, ?, ?)`,
      [state.saveId, message.id, blockerOrder, blockerKey]);
    });
    message.actionIds.forEach((actionId, actionOrder) => {
      database.run(`INSERT INTO career_inbox_actions
        (save_id, message_id, sort_order, action_id) VALUES (?, ?, ?, ?)`,
      [state.saveId, message.id, actionOrder, actionId]);
    });
  });
}

/** Reconstructs the exact ordered current-season message slice. */
function loadCurrentSeasonInbox(database: SqliteWorldDatabase, save: SaveId): NonNullable<CareerState["currentSeasonInbox"]> {
  return database.queryAll("SELECT * FROM career_inbox_messages WHERE save_id = ? ORDER BY sort_order", [save]).map((row) => {
    const messageId = careerInboxMessageId(text(row, "message_id"));
    const fixture = optionalText(row, "fixture_id");
    const club = optionalText(row, "club_id");
    const player = optionalText(row, "player_id");
    const contract = optionalText(row, "contract_id");
    const negotiation = optionalText(row, "contract_negotiation_id");
    return createCareerInboxMessage({
      id: messageId,
      date: gameDate(number(row, "message_date")),
      category: text(row, "category") as CareerInboxCategory,
      source: text(row, "source") as CareerInboxSource,
      level: text(row, "attention_level") as CareerAttentionLevel,
      continuePolicy: text(row, "continue_policy") as CareerAttentionContinuePolicy,
      lifecycle: {
        read: boolean(row, "is_read"),
        acknowledged: boolean(row, "is_acknowledged"),
        resolved: boolean(row, "is_resolved"),
      },
      related: {
        ...(fixture === undefined ? {} : { fixtureId: fixtureId(fixture) }),
        ...(club === undefined ? {} : { clubId: clubId(club) }),
        ...(player === undefined ? {} : { playerId: playerId(player) }),
        ...(contract === undefined ? {} : { contractId: playerContractId(contract) }),
        ...(negotiation === undefined ? {} : { contractNegotiationId: contractNegotiationId(negotiation) }),
      },
      blockerKeys: database.queryAll(
        "SELECT blocker_key FROM career_inbox_blockers WHERE save_id = ? AND message_id = ? ORDER BY sort_order",
        [save, messageId],
      ).map((blocker) => text(blocker, "blocker_key") as CareerAttentionBlockerKey),
      actionIds: database.queryAll(
        "SELECT action_id FROM career_inbox_actions WHERE save_id = ? AND message_id = ? ORDER BY sort_order",
        [save, messageId],
      ).map((action) => text(action, "action_id") as CareerInboxActionId),
    });
  });
}

function insertYouthState(database: SqliteWorldDatabase, state: CareerState): void {
  const youth = state.youthAcademyState;
  if (youth === undefined) return;
  database.run("INSERT INTO youth_state (save_id) VALUES (?)", [state.saveId]);
  youth.clubRosterIds.forEach((rosterClubId, sortOrder) => {
    const roster = youth.clubRosters[rosterClubId];
    if (roster === undefined) throw mappingFailure(`ordered youth roster is missing: ${rosterClubId}`);
    database.run("INSERT INTO youth_club_rosters (save_id, sort_order, club_id) VALUES (?, ?, ?)", [state.saveId, sortOrder, roster.clubId]);
    roster.playerIds.forEach((rosterPlayerId, playerOrder) => {
      database.run("INSERT INTO youth_roster_players (save_id, club_id, sort_order, player_id) VALUES (?, ?, ?, ?)", [state.saveId, roster.clubId, playerOrder, rosterPlayerId]);
    });
  });
  youth.playerLifecycleIds.forEach((lifecyclePlayerId, sortOrder) => {
    const lifecycle = youth.playerLifecycle[lifecyclePlayerId];
    if (lifecycle === undefined) throw mappingFailure(`ordered youth lifecycle is missing: ${lifecyclePlayerId}`);
    database.run(`INSERT INTO youth_lifecycle
      (save_id, sort_order, player_id, club_id, status, academy_entry_season_id, academy_entry_date, status_changed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [state.saveId, sortOrder, lifecycle.playerId, lifecycle.clubId, lifecycle.status, lifecycle.academyEntrySeasonId, lifecycle.academyEntryDate, lifecycle.statusChangedAt ?? null]);
  });
}

function insertSeasonHistory(database: SqliteWorldDatabase, state: CareerState): void {
  for (const entry of state.seasonHistory ?? []) {
    const selected = entry.selectedClubFinish;
    const playerStatistics = entry.playerStatistics;
    database.run(`INSERT INTO season_history
      (save_id, sequence_number, season_id, competition_id, champion_club_id, fixture_count, total_goals,
       participation_coverage, event_coverage, selected_position, selected_club_id, selected_played,
       selected_wins, selected_draws, selected_losses, selected_goals_for, selected_goals_against,
       selected_goal_difference, selected_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, entry.sequenceNumber, entry.seasonId, entry.competitionId, entry.championClubId,
      entry.aggregateGoals.fixtureCount, entry.aggregateGoals.totalGoals,
      playerStatistics?.participationCoverage ?? "unavailable",
      playerStatistics?.eventCoverage ?? "unavailable",
      ...tableRowValues(selected),
    ]);
    entry.finalTable.forEach((row, sortOrder) => {
      database.run(`INSERT INTO season_table_rows
        (save_id, history_sequence_number, sort_order, position, club_id, played, wins, draws, losses,
         goals_for, goals_against, goal_difference, points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [state.saveId, entry.sequenceNumber, sortOrder, ...tableRowValues(row)]);
    });
    playerStatistics?.rows.forEach((row, sortOrder) => {
      database.run(`INSERT INTO season_player_statistics
        (save_id, history_sequence_number, sort_order, player_id, starts, substitute_appearances,
         minutes, rating_total, rating_samples, goals, assists, saves)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        state.saveId,
        entry.sequenceNumber,
        sortOrder,
        row.playerId,
        row.starts,
        row.substituteAppearances,
        row.minutes,
        row.ratingTotal,
        row.ratingSamples,
        row.goals,
        row.assists,
        row.saves,
      ]);
    });
  }
}

function insertMatchPreparation(database: SqliteWorldDatabase, state: CareerState): void {
  const preparation = state.matchPreparation;
  if (preparation === undefined) return;
  const tactic = preparation.tactic;
  database.run(`INSERT INTO match_preparation
    (save_id, selected_club_id, target_fixture_id, updated_at, has_lineup, has_tactic,
     tactic_mentality, tactic_pressing, tactic_directness, tactic_width, tactic_risk, base_formation_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    state.saveId, preparation.selectedClubId, preparation.targetFixtureId ?? null, preparation.updatedAt,
    preparation.selectedLineup === undefined ? 0 : 1, tactic === undefined ? 0 : 1,
    tactic?.mentality ?? null, tactic?.pressing ?? null, tactic?.directness ?? null, tactic?.width ?? null, tactic?.risk ?? null,
    preparation.baseFormationId ?? null,
  ]);
  preparation.selectedLineup?.slots.forEach((slot, sortOrder) => {
    database.run(`INSERT INTO match_preparation_lineup
      (save_id, sort_order, club_id, slot_key, player_id, role_key) VALUES (?, ?, ?, ?, ?, ?)`,
    [state.saveId, sortOrder, preparation.selectedLineup?.clubId ?? preparation.selectedClubId, slot.slotKey, slot.playerId, slot.canonicalRole]);
  });
  preparation.boardSlots?.forEach((slot, sortOrder) => {
    database.run(`INSERT INTO match_preparation_board_slots
      (save_id, sort_order, slot_key, nx, ny, role_key) VALUES (?, ?, ?, ?, ?, ?)`,
    [state.saveId, sortOrder, slot.slotKey, slot.nx, slot.ny, slot.roleKey]);
  });
  preparation.benchSlots?.forEach((slot, sortOrder) => {
    database.run(`INSERT INTO match_preparation_bench
      (save_id, sort_order, slot_key, player_id) VALUES (?, ?, ?, ?)`,
    [state.saveId, sortOrder, slot.slotKey, slot.playerId]);
  });
}

function insertFixtureReports(database: SqliteWorldDatabase, state: CareerState): void {
  for (const fixtureIdValue of state.gameState.fixtureIds) {
    const report = state.gameState.fixtures[fixtureIdValue]?.result?.report;
    if (report === undefined) continue;
    insertMatchReport(database, state.saveId, report);
  }
}

function insertMatchReport(database: SqliteWorldDatabase, save: SaveId, report: MatchReport): void {
  database.run(`INSERT INTO match_reports
    (save_id, fixture_id, event_schema_version, final_minute, score_home, score_away,
     home_opportunities, home_shots, home_shots_on_target, home_goals,
     away_opportunities, away_shots, away_shots_on_target, away_goals)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [save, report.fixtureId, report.eventSchemaVersion, report.finalMinute,
    report.score.home, report.score.away, ...sideStatsValues(report.stats.home), ...sideStatsValues(report.stats.away)]);
  insertMatchEvents(database, save, "report", report.fixtureId, report.events);
}

function insertMatchEvents(database: SqliteWorldDatabase, save: SaveId, ownerKind: "report", ownerId: string, events: readonly MatchEvent[]): void {
  events.forEach((event, sortOrder) => {
    const shot = "shot" in event ? event.shot : undefined;
    const score = "score" in event ? event.score : undefined;
    const side = "side" in event ? event.side : shot?.side;
    const minute = shot?.minute ?? ("minute" in event ? event.minute : 0);
    database.run(`INSERT INTO match_events
      (save_id, owner_kind, owner_id, sort_order, event_type, event_minute, side, quality, is_shot_on_target,
       shot_type, chance_type, scorer_player_id, assist_player_id, creator_player_id, shooter_player_id,
       goalkeeper_player_id, primary_defender_player_id, score_home, score_away,
       committed_by_player_id, suffered_by_player_id, zone_danger, card_player_id, fouled_player_id,
       penalty_taker_player_id, penalty_outcome, injury_player_id, injury_severity,
       outgoing_player_id, incoming_player_id, slot_id, substitution_reason_key)
      VALUES (${placeholders(32)})`, [save, ownerKind, ownerId, sortOrder, event.type, minute,
      side ?? null, shot?.quality ?? null, shot === undefined ? null : shot.isShotOnTarget ? 1 : 0,
      shot?.shotType ?? null, shot?.chanceType ?? null,
      "scorerPlayerId" in event ? event.scorerPlayerId : null,
      "assistPlayerId" in event ? event.assistPlayerId ?? null : null,
      "creatorPlayerId" in event ? event.creatorPlayerId ?? null : null,
      "shooterPlayerId" in event ? event.shooterPlayerId ?? null : null,
      "goalkeeperPlayerId" in event ? event.goalkeeperPlayerId : null,
      "primaryDefenderPlayerId" in event ? event.primaryDefenderPlayerId ?? null : null,
      score?.home ?? null, score?.away ?? null,
      event.type === "foul" ? event.committedByPlayerId : event.type === "penalty_awarded" ? event.committedByPlayerId ?? null : null,
      event.type === "foul" ? event.sufferedByPlayerId ?? null : null,
      event.type === "foul" ? event.zoneDanger : null,
      event.type === "yellow_card" || event.type === "second_yellow_card" || event.type === "red_card" ? event.playerId : null,
      event.type === "penalty_awarded" ? event.fouledPlayerId ?? null : null,
      event.type === "penalty_outcome" ? event.takerPlayerId : null,
      event.type === "penalty_outcome" ? event.outcome : null,
      event.type === "injury" ? event.playerId : null,
      event.type === "injury" ? event.severity : null,
      event.type === "substitution" ? event.outgoingPlayerId : null,
      event.type === "substitution" ? event.incomingPlayerId : null,
      event.type === "substitution" ? event.slotId : null,
      event.type === "substitution" ? event.reasonKey : null]);
  });
}

function loadCareerWorldMetadata(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "careerWorld"> | undefined {
  const row = database.queryAll("SELECT world_seed, generator_version, creation_source_key FROM career_world WHERE save_id = ?", [save])[0];
  return row === undefined ? undefined : { careerWorld: { worldSeed: text(row, "world_seed"), generatorVersion: number(row, "generator_version"), creationSourceKey: text(row, "creation_source_key") } };
}

/** Writes canonical registrations, immutable contracts, active IDs, and history. */
function insertSeniorSquadState(database: SqliteWorldDatabase, state: CareerState): void {
  const senior = state.seniorSquadState;
  if (senior === undefined) throw mappingFailure("senior-squad state is required by the Phase 78 save baseline");

  senior.registrationIds.forEach((id, sortOrder) => {
    const registration = senior.registrations[id];
    if (registration === undefined) throw mappingFailure(`ordered registration is missing: ${id}`);
    database.run(`INSERT INTO senior_squad_registrations
      (save_id, sort_order, registration_id, player_id, club_id, shirt_number, registered_on)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, registration.id, registration.playerId, registration.clubId,
      registration.shirtNumber, registration.registeredOn,
    ]);
  });

  senior.contractIds.forEach((id, sortOrder) => {
    const contract = senior.contracts[id];
    if (contract === undefined) throw mappingFailure(`ordered contract is missing: ${id}`);
    database.run(`INSERT INTO player_contracts
      (save_id, sort_order, contract_id, player_id, club_id, contract_type, starts_on, ends_on,
       annual_wage, squad_status, signing_bonus, appearance_bonus, goal_bonus, clean_sheet_bonus)
      VALUES (${placeholders(14)})`, [
      state.saveId, sortOrder, contract.id, contract.playerId, contract.clubId, contract.type,
      contract.startsOn, contract.endsOn, contract.annualWage, contract.squadStatus,
      contract.bonuses.signingBonus, contract.bonuses.appearanceBonus,
      contract.bonuses.goalBonus ?? null, contract.bonuses.cleanSheetBonus ?? null,
    ]);
  });

  senior.activeContractIds.forEach((id, sortOrder) => {
    database.run(
      "INSERT INTO active_player_contracts (save_id, sort_order, contract_id) VALUES (?, ?, ?)",
      [state.saveId, sortOrder, id],
    );
  });

  senior.contractHistoryEntryIds.forEach((id, sortOrder) => {
    const entry = senior.contractHistory[id];
    if (entry === undefined) throw mappingFailure(`ordered contract-history entry is missing: ${id}`);
    database.run(`INSERT INTO player_contract_history
      (save_id, sort_order, history_entry_id, sequence_number, occurred_on, event_type,
       contract_id, player_id, club_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, entry.id, entry.sequenceNumber, entry.occurredOn, entry.event,
      entry.contractId, entry.playerId, entry.clubId,
    ]);
  });
}

/** Reconstructs and validates the complete senior-squad persistence slice. */
function loadSeniorSquadState(
  database: SqliteWorldDatabase,
  save: SaveId,
  gameState: CareerState["gameState"],
): SeniorSquadState {
  const registrations: Record<SeniorSquadRegistrationId, SeniorSquadRegistration> = {};
  const registrationIds = database.queryAll(
    "SELECT * FROM senior_squad_registrations WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = seniorSquadRegistrationId(text(row, "registration_id"));
    registrations[id] = {
      id,
      playerId: playerId(text(row, "player_id")),
      clubId: clubId(text(row, "club_id")),
      shirtNumber: number(row, "shirt_number"),
      registeredOn: gameDate(number(row, "registered_on")),
    };
    return id;
  });

  const contracts: Record<PlayerContractId, PlayerContract> = {};
  const contractIds = database.queryAll(
    "SELECT * FROM player_contracts WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = playerContractId(text(row, "contract_id"));
    const goalBonus = optionalNumber(row, "goal_bonus");
    const cleanSheetBonus = optionalNumber(row, "clean_sheet_bonus");
    contracts[id] = {
      id,
      playerId: playerId(text(row, "player_id")),
      clubId: clubId(text(row, "club_id")),
      type: text(row, "contract_type") as PlayerContractType,
      startsOn: gameDate(number(row, "starts_on")),
      endsOn: gameDate(number(row, "ends_on")),
      annualWage: nonNegativeMoney(number(row, "annual_wage")),
      squadStatus: text(row, "squad_status") as AgreedSquadStatus,
      bonuses: {
        signingBonus: nonNegativeMoney(number(row, "signing_bonus")),
        appearanceBonus: nonNegativeMoney(number(row, "appearance_bonus")),
        ...(goalBonus === undefined ? {} : { goalBonus: nonNegativeMoney(goalBonus) }),
        ...(cleanSheetBonus === undefined
          ? {}
          : { cleanSheetBonus: nonNegativeMoney(cleanSheetBonus) }),
      },
    };
    return id;
  });

  const activeContractIds = database.queryAll(
    "SELECT contract_id FROM active_player_contracts WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => playerContractId(text(row, "contract_id")));

  const contractHistory: Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry> = {};
  const contractHistoryEntryIds = database.queryAll(
    "SELECT * FROM player_contract_history WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = playerContractHistoryEntryId(text(row, "history_entry_id"));
    contractHistory[id] = {
      id,
      sequenceNumber: number(row, "sequence_number"),
      occurredOn: gameDate(number(row, "occurred_on")),
      event: text(row, "event_type") as PlayerContractHistoryEntry["event"],
      contractId: playerContractId(text(row, "contract_id")),
      playerId: playerId(text(row, "player_id")),
      clubId: clubId(text(row, "club_id")),
    };
    return id;
  });

  return createSeniorSquadState(gameState, {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds,
    contractHistory,
    contractHistoryEntryIds,
  });
}

/** Writes exact account balances and the ordered finance ledger. */
function insertClubFinanceState(database: SqliteWorldDatabase, state: CareerState): void {
  const finances = state.clubFinanceState;
  if (finances === undefined) throw mappingFailure("club-finance state is required by the Phase 78 save baseline");

  finances.clubIds.forEach((id, sortOrder) => {
    const account = finances.accounts[id];
    if (account === undefined) throw mappingFailure(`ordered finance account is missing: ${id}`);
    database.run(`INSERT INTO club_finance_accounts
      (save_id, sort_order, club_id, currency, cash_balance, annual_transfer_budget,
       available_transfer_budget, annual_wage_budget, committed_annual_wages,
       season_income, season_expenses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, account.clubId, account.currency, account.cashBalance,
      account.annualTransferBudget, account.availableTransferBudget, account.annualWageBudget,
      account.committedAnnualWage, account.seasonIncome, account.seasonExpenses,
    ]);
  });

  finances.ledgerEntryIds.forEach((id, sortOrder) => {
    const entry = finances.ledgerEntries[id];
    if (entry === undefined) throw mappingFailure(`ordered finance-ledger entry is missing: ${id}`);
    database.run(`INSERT INTO club_finance_ledger
      (save_id, sort_order, ledger_entry_id, sequence_number, club_id, occurred_on, currency,
       reason, direction, amount, balance_after, reference_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, entry.id, entry.sequenceNumber, entry.clubId, entry.occurredOn,
      entry.currency, entry.reason, entry.direction, entry.amount, entry.balanceAfter,
      entry.referenceId,
    ]);
  });
}

/** Reconstructs and validates all club accounts and ledger movements. */
function loadClubFinanceState(
  database: SqliteWorldDatabase,
  save: SaveId,
  gameState: CareerState["gameState"],
  seniorSquadState: SeniorSquadState,
): ClubFinanceState {
  const accounts: ClubFinanceState["accounts"] extends Readonly<Record<ClubId, infer Account>>
    ? Record<ClubId, Account>
    : never = {};
  const clubIds = database.queryAll(
    "SELECT * FROM club_finance_accounts WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = clubId(text(row, "club_id"));
    accounts[id] = {
      clubId: id,
      currency: text(row, "currency") as CurrencyCode,
      cashBalance: nonNegativeMoney(number(row, "cash_balance")),
      annualTransferBudget: nonNegativeMoney(number(row, "annual_transfer_budget")),
      availableTransferBudget: nonNegativeMoney(number(row, "available_transfer_budget")),
      annualWageBudget: nonNegativeMoney(number(row, "annual_wage_budget")),
      committedAnnualWage: nonNegativeMoney(number(row, "committed_annual_wages")),
      seasonIncome: nonNegativeMoney(number(row, "season_income")),
      seasonExpenses: nonNegativeMoney(number(row, "season_expenses")),
    };
    return id;
  });

  const ledgerEntries: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = {};
  const ledgerEntryIds = database.queryAll(
    "SELECT * FROM club_finance_ledger WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => {
    const id = clubFinanceLedgerEntryId(text(row, "ledger_entry_id"));
    ledgerEntries[id] = {
      id,
      sequenceNumber: number(row, "sequence_number"),
      clubId: clubId(text(row, "club_id")),
      occurredOn: gameDate(number(row, "occurred_on")),
      currency: text(row, "currency") as CurrencyCode,
      reason: text(row, "reason") as ClubFinanceLedgerReason,
      direction: text(row, "direction") as ClubFinanceLedgerDirection,
      amount: nonNegativeMoney(number(row, "amount")),
      balanceAfter: nonNegativeMoney(number(row, "balance_after")),
      referenceId: text(row, "reference_id"),
    };
    return id;
  });

  const currency = accounts[clubIds[0] ?? ("" as ClubId)]?.currency ?? "EUR";
  return createClubFinanceState(gameState, seniorSquadState, {
    currency,
    accounts,
    clubIds,
    ledgerEntries,
    ledgerEntryIds,
  });
}

function loadTransferHistory(database: SqliteWorldDatabase, save: SaveId): CareerState["transferHistory"] {
  return database.queryAll(`SELECT sequence_number, movement_kind, occurred_on, buying_club_id,
      selling_club_id, player_id, public_value, initial_asking_price, offered_fee,
      counter_fee, agreed_fee, completed_fee
    FROM transfer_history WHERE save_id = ? ORDER BY sequence_number`, [save]).map((row) => {
    const common = {
      sequenceNumber: number(row, "sequence_number"),
      occurredOn: gameDate(number(row, "occurred_on")),
      buyingClubId: clubId(text(row, "buying_club_id")),
      playerId: playerId(text(row, "player_id")),
      publicValue: nonNegativeMoney(number(row, "public_value")),
      completedFee: nonNegativeMoney(number(row, "completed_fee")),
    };
    if (text(row, "movement_kind") === "free_agent_signing") {
      return { ...common, kind: "free_agent_signing" as const };
    }
    const counterFee = optionalNumber(row, "counter_fee");
    return {
      ...common,
      kind: "permanent_transfer" as const,
      sellingClubId: clubId(text(row, "selling_club_id")),
      initialAskingPrice: nonNegativeMoney(number(row, "initial_asking_price")),
      offeredFee: nonNegativeMoney(number(row, "offered_fee")),
      ...(counterFee === undefined
        ? {}
        : { counterFee: nonNegativeMoney(counterFee) }),
      agreedFee: nonNegativeMoney(number(row, "agreed_fee")),
    };
  });
}

function loadYouthState(database: SqliteWorldDatabase, save: SaveId, gameState: CareerState["gameState"]): Pick<CareerState, "youthAcademyState"> | undefined {
  if (database.queryAll("SELECT save_id FROM youth_state WHERE save_id = ?", [save]).length === 0) return undefined;
  const clubRosters: Record<string, YouthAcademyClubRoster> = {};
  const clubRosterIds = database.queryAll("SELECT club_id FROM youth_club_rosters WHERE save_id = ? ORDER BY sort_order", [save]).map((row) => {
    const rosterClubId = clubId(text(row, "club_id"));
    const playerIds = database.queryAll("SELECT player_id FROM youth_roster_players WHERE save_id = ? AND club_id = ? ORDER BY sort_order", [save, rosterClubId]).map((playerRow) => playerId(text(playerRow, "player_id")));
    clubRosters[rosterClubId] = { clubId: rosterClubId, playerIds };
    return rosterClubId;
  });
  const playerLifecycle: Record<string, YouthPlayerLifecycle> = {};
  const playerLifecycleIds = database.queryAll(`SELECT player_id, club_id, status, academy_entry_season_id, academy_entry_date, status_changed_at
    FROM youth_lifecycle WHERE save_id = ? ORDER BY sort_order`, [save]).map((row) => {
    const lifecyclePlayerId = playerId(text(row, "player_id"));
    const changed = optionalNumber(row, "status_changed_at");
    playerLifecycle[lifecyclePlayerId] = { playerId: lifecyclePlayerId, clubId: clubId(text(row, "club_id")), status: text(row, "status") as YouthPlayerStatus,
      academyEntrySeasonId: seasonId(text(row, "academy_entry_season_id")), academyEntryDate: gameDate(number(row, "academy_entry_date")),
      ...(changed === undefined ? {} : { statusChangedAt: gameDate(changed) }) };
    return lifecyclePlayerId;
  });
  return { youthAcademyState: { clubRosters, clubRosterIds, playerLifecycle, playerLifecycleIds } };
}

function loadSeasonHistory(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "seasonHistory"> | undefined {
  const historyRows = database.queryAll("SELECT * FROM season_history WHERE save_id = ? ORDER BY sequence_number", [save]);
  if (historyRows.length === 0) return undefined;
  const seasonHistory: CareerSeasonArchiveEntry[] = historyRows.map((row) => {
    const sequenceNumber = number(row, "sequence_number");
    const finalTable = database.queryAll("SELECT * FROM season_table_rows WHERE save_id = ? AND history_sequence_number = ? ORDER BY sort_order", [save, sequenceNumber]).map((tableRow) => readTableRow(tableRow));
    const playerStatistics: CareerPlayerSeasonStatistics = {
      participationCoverage: text(row, "participation_coverage") as CareerPlayerStatisticsCoverage,
      eventCoverage: text(row, "event_coverage") as CareerPlayerStatisticsCoverage,
      rows: database.queryAll(
        "SELECT * FROM season_player_statistics WHERE save_id = ? AND history_sequence_number = ? ORDER BY sort_order",
        [save, sequenceNumber],
      ).map((statisticsRow) => ({
        playerId: playerId(text(statisticsRow, "player_id")),
        starts: number(statisticsRow, "starts"),
        substituteAppearances: number(statisticsRow, "substitute_appearances"),
        minutes: number(statisticsRow, "minutes"),
        ratingTotal: number(statisticsRow, "rating_total"),
        ratingSamples: number(statisticsRow, "rating_samples"),
        goals: number(statisticsRow, "goals"),
        assists: number(statisticsRow, "assists"),
        saves: number(statisticsRow, "saves"),
      })),
    };
    return { sequenceNumber, seasonId: seasonId(text(row, "season_id")), competitionId: competitionId(text(row, "competition_id")),
      finalTable, championClubId: clubId(text(row, "champion_club_id")), selectedClubFinish: readTableRow(row, "selected_"),
      aggregateGoals: { fixtureCount: number(row, "fixture_count"), totalGoals: number(row, "total_goals") },
      playerStatistics };
  });
  return { seasonHistory };
}

function loadMatchPreparation(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "matchPreparation"> | undefined {
  const row = database.queryAll("SELECT * FROM match_preparation WHERE save_id = ?", [save])[0];
  if (row === undefined) return undefined;
  const hasLineup = boolean(row, "has_lineup");
  const hasTactic = boolean(row, "has_tactic");
  const targetFixture = optionalText(row, "target_fixture_id");
  const baseFormationId = optionalText(row, "base_formation_id");
  const boardSlots = database.queryAll("SELECT slot_key, nx, ny, role_key FROM match_preparation_board_slots WHERE save_id = ? ORDER BY sort_order", [save]);
  const benchSlots = database.queryAll("SELECT slot_key, player_id FROM match_preparation_bench WHERE save_id = ? ORDER BY sort_order", [save]);
  const matchPreparation: CareerMatchPreparation = {
    selectedClubId: clubId(text(row, "selected_club_id")),
    ...(targetFixture === undefined ? {} : { targetFixtureId: fixtureId(targetFixture) }),
    ...(hasLineup ? { selectedLineup: { clubId: clubId(text(database.queryAll("SELECT club_id FROM match_preparation_lineup WHERE save_id = ? ORDER BY sort_order", [save])[0]!, "club_id")),
      slots: database.queryAll("SELECT slot_key, player_id, role_key FROM match_preparation_lineup WHERE save_id = ? ORDER BY sort_order", [save]).map((slot) => ({ slotKey: text(slot, "slot_key"), playerId: playerId(text(slot, "player_id")), canonicalRole: persistedCanonicalRole(text(slot, "role_key")) })) } } : {}),
    ...(hasTactic ? { tactic: { mentality: text(row, "tactic_mentality") as NonNullable<CareerMatchPreparation["tactic"]>["mentality"], pressing: number(row, "tactic_pressing"), directness: number(row, "tactic_directness"), width: number(row, "tactic_width"), risk: number(row, "tactic_risk") } } : {}),
    ...(baseFormationId === undefined ? {} : { baseFormationId }),
    ...(boardSlots.length === 0 ? {} : { boardSlots: boardSlots.map((slot) => ({ slotKey: text(slot, "slot_key"), nx: number(slot, "nx"), ny: number(slot, "ny"), roleKey: text(slot, "role_key") })) }),
    ...(benchSlots.length === 0 ? {} : { benchSlots: benchSlots.map((slot) => ({ slotKey: text(slot, "slot_key"), playerId: playerId(text(slot, "player_id")) })) }),
    updatedAt: gameDate(number(row, "updated_at")),
  };
  return { matchPreparation };
}

function attachFixtureReports(database: SqliteWorldDatabase, save: SaveId, gameState: CareerState["gameState"]): CareerState["gameState"] {
  const fixtures = { ...gameState.fixtures };
  for (const row of database.queryAll("SELECT * FROM match_reports WHERE save_id = ?", [save])) {
    const reportFixtureId = fixtureId(text(row, "fixture_id"));
    const fixture = fixtures[reportFixtureId];
    if (fixture?.result === undefined) throw mappingFailure(`match report has no compact fixture result: ${reportFixtureId}`);
    const report: MatchReport = { eventSchemaVersion: number(row, "event_schema_version") as MatchReport["eventSchemaVersion"], fixtureId: reportFixtureId,
      finalMinute: number(row, "final_minute"), score: { home: number(row, "score_home"), away: number(row, "score_away") },
      stats: readStats(row), events: loadMatchEvents(database, save, "report", reportFixtureId) };
    fixtures[reportFixtureId] = { ...fixture, result: { ...fixture.result, report } };
  }
  return { ...gameState, fixtures };
}

function loadMatchEvents(database: SqliteWorldDatabase, save: SaveId, ownerKind: "report", ownerId: string): readonly MatchEvent[] {
  return database.queryAll("SELECT * FROM match_events WHERE save_id = ? AND owner_kind = ? AND owner_id = ? ORDER BY sort_order", [save, ownerKind, ownerId]).map(readMatchEvent);
}

function readMatchEvent(row: Record<string, unknown>): MatchEvent {
  const type = text(row, "event_type");
  const minute = number(row, "event_minute");
  if (type === "kickoff") return { type, minute: 0 };
  if (type === "half_time" || type === "full_time") return { type, minute, score: { home: number(row, "score_home"), away: number(row, "score_away") } };
  const side = text(row, "side") as "home" | "away";
  if (type === "foul") return { type, minute, side, committedByPlayerId: playerId(text(row, "committed_by_player_id")), ...optionalPlayer(row, "suffered_by_player_id", "sufferedByPlayerId"), zoneDanger: number(row, "zone_danger") };
  if (type === "yellow_card" || type === "second_yellow_card" || type === "red_card") return { type, minute, side, playerId: playerId(text(row, "card_player_id")) };
  if (type === "penalty_awarded") return { type, minute, side, ...optionalPlayer(row, "fouled_player_id", "fouledPlayerId"), ...optionalPlayer(row, "committed_by_player_id", "committedByPlayerId") };
  if (type === "penalty_outcome") return { type, minute, side, takerPlayerId: playerId(text(row, "penalty_taker_player_id")), goalkeeperPlayerId: playerId(text(row, "goalkeeper_player_id")), outcome: text(row, "penalty_outcome") as PenaltyOutcome };
  if (type === "injury") return { type, minute, side, playerId: playerId(text(row, "injury_player_id")), severity: text(row, "injury_severity") as MatchInjurySeverity };
  if (type === "substitution") return { type, minute, side, outgoingPlayerId: playerId(text(row, "outgoing_player_id")), incomingPlayerId: playerId(text(row, "incoming_player_id")), slotId: text(row, "slot_id"), reasonKey: text(row, "substitution_reason_key") as MatchSubstitutionReasonKey };
  const shot = { minute, side, quality: number(row, "quality"), isShotOnTarget: boolean(row, "is_shot_on_target"), shotType: text(row, "shot_type") as "normal" | "header" | "set_piece", chanceType: text(row, "chance_type") as "open_play" | "counter" | "cross" | "dead_ball" };
  if (type === "goal") return { type, shot, scorerPlayerId: playerId(text(row, "scorer_player_id")), ...optionalPlayer(row, "assist_player_id", "assistPlayerId"), ...optionalPlayer(row, "creator_player_id", "creatorPlayerId") };
  if (type === "save") return { type, shot, ...optionalPlayer(row, "shooter_player_id", "shooterPlayerId"), goalkeeperPlayerId: playerId(text(row, "goalkeeper_player_id")) };
  if (type === "miss") return { type, shot, ...optionalPlayer(row, "shooter_player_id", "shooterPlayerId") };
  if (type === "block") return { type, shot, ...optionalPlayer(row, "shooter_player_id", "shooterPlayerId"), ...optionalPlayer(row, "primary_defender_player_id", "primaryDefenderPlayerId") };
  throw mappingFailure(`unsupported match event type: ${type}`);
}

function optionalPlayer(row: Record<string, unknown>, column: string, property: string): Record<string, PlayerId> {
  const value = optionalText(row, column);
  return value === undefined ? {} : { [property]: playerId(value) };
}

function readStats(row: Record<string, unknown>): MatchReport["stats"] {
  return { home: readSideStats(row, "home_"), away: readSideStats(row, "away_") };
}

function readSideStats(row: Record<string, unknown>, prefix: string): MatchSideStats {
  return { opportunities: number(row, `${prefix}opportunities`), shots: number(row, `${prefix}shots`), shotsOnTarget: number(row, `${prefix}shots_on_target`), goals: number(row, `${prefix}goals`) };
}

function sideStatsValues(stats: MatchSideStats): readonly number[] {
  return [stats.opportunities, stats.shots, stats.shotsOnTarget, stats.goals];
}

function tableRowValues(row: LeagueTableRow): readonly SqliteBindValue[] {
  return [row.position, row.clubId, row.played, row.wins, row.draws, row.losses, row.goalsFor, row.goalsAgainst, row.goalDifference, row.points];
}

function readTableRow(row: Record<string, unknown>, prefix = ""): LeagueTableRow {
  return { position: number(row, `${prefix}position`), clubId: clubId(text(row, `${prefix}club_id`)), played: number(row, `${prefix}played`), wins: number(row, `${prefix}wins`), draws: number(row, `${prefix}draws`), losses: number(row, `${prefix}losses`), goalsFor: number(row, `${prefix}goals_for`), goalsAgainst: number(row, `${prefix}goals_against`), goalDifference: number(row, `${prefix}goal_difference`), points: number(row, `${prefix}points`) };
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => "?").join(", ");
}

function text(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw mappingFailure(`SQLite column ${key} is not text`);
  return value;
}

function optionalText(row: Record<string, unknown>, key: string): string | undefined {
  const value = row[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") throw mappingFailure(`SQLite column ${key} is not nullable text`);
  return value;
}

function number(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint" && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) return Number(value);
  throw mappingFailure(`SQLite column ${key} is not numeric`);
}

function optionalNumber(row: Record<string, unknown>, key: string): number | undefined {
  return row[key] === null || row[key] === undefined ? undefined : number(row, key);
}

function boolean(row: Record<string, unknown>, key: string): boolean {
  const value = number(row, key);
  if (value !== 0 && value !== 1) throw mappingFailure(`SQLite column ${key} is not boolean`);
  return value === 1;
}

function mappingFailure(message: string): Error {
  return new Error(`relational career mapping failed: ${message}`);
}

/**
 * Reads one persisted lineup role back as a canonical role.
 *
 * The column keeps its `role_key` name and its `TEXT` type, but its meaning
 * changed with the typed tactical slot: it now stores the manager's canonical
 * role rather than the four-way engine weight key. A save written before that
 * change holds `defender` or `attacker`, which are not canonical roles, and is
 * rejected here rather than silently reinterpreted. Beta saves are deleted, not
 * migrated.
 */
function persistedCanonicalRole(value: string): CanonicalPlayerRole {
  if (!isCanonicalPlayerRole(value)) {
    throw new SqliteWorldStateError(
      "unsupported_bootstrap_state",
      `persisted lineup role is not a canonical role: ${value}`,
    );
  }

  return value;
}
