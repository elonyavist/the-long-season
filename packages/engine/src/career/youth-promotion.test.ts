import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubFinanceLedgerEntryId,
  clubId,
  contractNegotiationId,
  createCareerState,
  createClubFinanceState,
  createSeniorSquadState,
  gameDate,
  getPlayerRoleProfile,
  mapPlayerAbilities,
  nonNegativeMoney,
  playerContractId,
  playerId,
  saveId,
  seasonId,
  seniorSquadRegistrationId,
  stateValue,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  type CareerState,
  type Club,
  type ClubFinanceState,
  type GameState,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SeniorSquadState,
} from "@game/domain";

import {
  promoteYouthCandidatesToSeniorSquads as promoteYouthCandidatesToSeniorSquadsWithPolicy,
} from "./youth-promotion.ts";
import {
  offerContractRenewal as offerContractRenewalWithPolicy,
} from "./contract-negotiation.ts";
import {
  prepareSeniorSquadSigning,
  SeniorSquadTransferError,
} from "./senior-squad-transfer.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { derivePublicPlayerAssessment } from "../squad/public-player-assessment.ts";

function promoteYouthCandidatesToSeniorSquads(
  input: Omit<
    Parameters<typeof promoteYouthCandidatesToSeniorSquadsWithPolicy>[0],
    "wagePolicy" | "marketBehaviorPolicy" | "valuationConfig"
  >,
) {
  return promoteYouthCandidatesToSeniorSquadsWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
    valuationConfig: playerValuationConfigFixture(),
  });
}

function offerContractRenewal(
  input: Omit<Parameters<typeof offerContractRenewalWithPolicy>[0], "wagePolicy">,
) {
  return offerContractRenewalWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
  });
}

/** Tests for explicit youth-to-senior promotion rules. */

test("promoteYouthCandidatesToSeniorSquads promotes AI club candidates when there is room", () => {
  const candidate = playerId("player:ai-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
  });
  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.promoted, true);
  assert.equal(result.records[0]?.reason, "promoted");
  assert.equal(result.careerState.gameState.clubs[clubId("club:pro02")]?.playerIds.includes(candidate), true);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[candidate]?.status, "promoted");
  const registration = result.careerState.seniorSquadState?.registrationIds
    .map((id) => result.careerState.seniorSquadState?.registrations[id])
    .find((row) => row?.playerId === candidate);
  const contract = result.careerState.seniorSquadState?.activeContractIds
    .map((id) => result.careerState.seniorSquadState?.contracts[id])
    .find((row) => row?.playerId === candidate);
  assert.ok(registration);
  assert.equal(contract?.type, "professional");
  assert.equal(
    result.careerState.seniorSquadState?.contractHistoryEntryIds
      .map((id) => result.careerState.seniorSquadState?.contractHistory[id])
      .some((entry) => entry?.playerId === candidate && entry.event === "signed"),
    true,
  );
  assert.equal(
    result.careerState.clubFinanceState?.accounts[clubId("club:pro02")]?.committedAnnualWage,
    (careerState.clubFinanceState?.accounts[clubId("club:pro02")]?.committedAnnualWage ?? 0)
      + (contract?.annualWage ?? 0),
  );
});

test("promoteYouthCandidatesToSeniorSquads protects the selected club by default", () => {
  const candidate = playerId("player:selected-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro01",
    candidate,
  });
  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.promoted, false);
  assert.equal(result.records[0]?.reason, "selected_club_protected");
  assert.equal(result.careerState.gameState.clubs[clubId("club:pro01")]?.playerIds.includes(candidate), false);
  assert.equal(result.careerState.youthAcademyState?.playerLifecycle[candidate]?.status, "promotion_candidate");
});

test("promoteYouthCandidatesToSeniorSquads ignores historical candidates that already left the active world", () => {
  const candidate = playerId("player:historical-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
  });
  const gameState = {
    ...careerState.gameState,
    playerIds: careerState.gameState.playerIds.filter((playerIdValue) => playerIdValue !== candidate),
    playerStates: Object.fromEntries(
      Object.entries(careerState.gameState.playerStates)
        .filter(([playerIdValue]) => playerIdValue !== candidate),
    ),
  };
  const historicalCareerState = createCareerState({ ...careerState, gameState });

  const result = promoteYouthCandidatesToSeniorSquads({ careerState: historicalCareerState });

  assert.deepEqual(result.records, []);
  assert.equal(result.careerState.gameState.clubs[clubId("club:pro02")]?.playerIds.includes(candidate), false);
  assert.equal(
    result.careerState.youthAcademyState?.playerLifecycle[candidate]?.status,
    "promotion_candidate",
  );
});

test("prepareSeniorSquadSigning rejects historical players outside the active world", () => {
  const candidate = playerId("player:historical-signing-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
  });
  const gameState: GameState = {
    ...careerState.gameState,
    playerIds: careerState.gameState.playerIds.filter((activePlayerId) => activePlayerId !== candidate),
    playerStates: Object.fromEntries(
      Object.entries(careerState.gameState.playerStates)
        .filter(([activePlayerId]) => activePlayerId !== candidate),
    ),
  };

  assert.throws(
    () => prepareSeniorSquadSigning({
      gameState,
      seniorSquadState: careerState.seniorSquadState!,
      playerId: candidate,
      clubId: clubId("club:pro02"),
      occurredOn: gameState.calendar.currentDate,
      transitionSequence: 1,
      acceptedTerms: {
        durationYears: 2,
        annualWage: nonNegativeMoney(100_000_00),
        squadStatus: "prospect",
        bonuses: {
          signingBonus: nonNegativeMoney(0),
          appearanceBonus: nonNegativeMoney(0),
        },
      },
    }),
    (error: unknown) => error instanceof SeniorSquadTransferError
      && error.message === `Signing player is not active: ${candidate}`,
  );
});

test("promoteYouthCandidatesToSeniorSquads can explicitly promote selected-club candidates for lab automation", () => {
  const candidate = playerId("player:selected-lab-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro01",
    candidate,
  });
  const result = promoteYouthCandidatesToSeniorSquads({
    careerState,
    allowSelectedClubPromotion: true,
  });

  assert.equal(result.records[0]?.promoted, true);
  assert.equal(result.careerState.gameState.clubs[clubId("club:pro01")]?.playerIds.includes(candidate), true);
});

test("promoteYouthCandidatesToSeniorSquads skips full senior squads", () => {
  const candidate = playerId("player:full-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    seniorCount: 25,
  });
  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.promoted, false);
  assert.equal(result.records[0]?.reason, "senior_squad_full");
});

test("promoteYouthCandidatesToSeniorSquads promotes a goalkeeper specialist by role quality", () => {
  const candidate = playerId("player:goalkeeper-specialist");
  const abilities = roleShapedAbilities("goalkeeper", 14, 1);
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: abilities,
    candidatePotential: abilities,
    candidatePosition: "gk",
    candidateRole: "goalkeeper",
  });

  assert.equal(Number(rawDiagnosticAbilityAverage(abilities)) < 7.4, true);
  assert.equal(Number(roleCurrentAbility(abilities, getPlayerRoleProfile("goalkeeper"))) >= 7.4, true);

  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.reason, "promoted");
});

test("promoteYouthCandidatesToSeniorSquads ignores inflated attributes outside the primary role", () => {
  const candidate = playerId("player:irrelevant-attributes");
  const abilities = roleCoreSuppressedAbilities("central_midfielder", 10, 1);
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: abilities,
    candidatePotential: abilities,
  });

  assert.equal(Number(rawDiagnosticAbilityAverage(abilities)) >= 7.4, true);
  assert.equal(Number(roleCurrentAbility(abilities, getPlayerRoleProfile("central_midfielder"))) < 7.4, true);

  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  assert.equal(result.records[0]?.reason, "not_useful_enough");
});

test("promoteYouthCandidatesToSeniorSquads recognizes positive public-P50 room", () => {
  const candidate = playerId("player:role-potential-room");
  const current = roleShapedAbilities("central_midfielder", 4, 1);
  const potential = roleShapedAbilities("central_midfielder", 14, 1);
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: current,
    candidatePotential: potential,
  });

  const result = promoteYouthCandidatesToSeniorSquads({ careerState });

  const player = careerState.gameState.players[candidate];
  if (player === undefined) throw new Error("expected promotion candidate");
  const valuationConfig = playerValuationConfigFixture();
  const assessment = derivePublicPlayerAssessment({
    player,
    currentDate: careerState.gameState.calendar.currentDate,
    potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
    ratingScale: valuationConfig.ratingScale,
  });
  assert.equal(assessment.currentAbility < 7.4, true);
  assert.equal(assessment.p50Ability - assessment.currentAbility >= 0.8, true);
  assert.equal(result.records[0]?.reason, "promoted");
});

test("promotion decisions ignore stored ceiling differences outside the canonical public assessment", () => {
  const candidate = playerId("player:public-assessment-parity");
  const current = roleShapedAbilities("central_midfielder", 4, 1);
  const sameRoleCeiling = roleShapedAbilities("central_midfielder", 5, 1);
  const differentlyShapedEqualCeiling = mapPlayerAbilities(
    sameRoleCeiling,
    (value, key) => key === "technical.passing"
      ? abilityValue(6)
      : key === "technical.longPassing"
        ? abilityValue(4)
        : value,
  );
  const baseline = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: current,
    candidatePotential: sameRoleCeiling,
  });
  const differentStoredCeiling = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
    candidateAbilities: current,
    candidatePotential: differentlyShapedEqualCeiling,
  });
  const valuationConfig = playerValuationConfigFixture();
  const assessedOn = baseline.gameState.calendar.currentDate;
  const assess = (careerState: CareerState) => {
    const player = careerState.gameState.players[candidate];
    if (player === undefined) throw new Error("expected parity candidate");
    return derivePublicPlayerAssessment({
      player,
      currentDate: assessedOn,
      potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
  };

  assert.notDeepEqual(sameRoleCeiling, differentlyShapedEqualCeiling);
  assert.deepEqual(assess(baseline), assess(differentStoredCeiling));
  assert.equal(
    assess(baseline).p50Ability - assess(baseline).currentAbility < 0.8,
    true,
  );
  assert.equal(
    promoteYouthCandidatesToSeniorSquads({ careerState: baseline }).records[0]?.reason,
    "not_useful_enough",
  );
  assert.equal(
    promoteYouthCandidatesToSeniorSquads({ careerState: differentStoredCeiling }).records[0]?.reason,
    "not_useful_enough",
  );
});

test("promoteYouthCandidatesToSeniorSquads dates new terms at the explicit season boundary", () => {
  const candidate = playerId("player:next-season-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
  });
  const nextSeasonStart = gameDate(20_365);

  const result = promoteYouthCandidatesToSeniorSquads({
    careerState,
    occurredOn: nextSeasonStart,
  });
  const contract = result.careerState.seniorSquadState?.activeContractIds
    .map((id) => result.careerState.seniorSquadState?.contracts[id])
    .find((row) => row?.playerId === candidate);
  const registration = result.careerState.seniorSquadState?.registrationIds
    .map((id) => result.careerState.seniorSquadState?.registrations[id])
    .find((row) => row?.playerId === candidate);

  assert.equal(result.records[0]?.reason, "promoted");
  assert.equal(contract?.startsOn, nextSeasonStart);
  assert.ok((contract?.endsOn ?? nextSeasonStart) > nextSeasonStart);
  assert.equal(registration?.registeredOn, nextSeasonStart);
  assert.equal(
    result.careerState.youthAcademyState?.playerLifecycle[candidate]?.statusChangedAt,
    nextSeasonStart,
  );
});

test("promoteYouthCandidatesToSeniorSquads is not blocked by wages promised by an open renewal", () => {
  const candidate = playerId("player:reserved-wage-candidate");
  const careerState = careerStateFixture({
    selectedClubId: "club:pro01",
    candidateClubId: "club:pro02",
    candidate,
  });
  const aiClubId = clubId("club:pro02");
  const renewingPlayerId = careerState.gameState.clubs[aiClubId]?.playerIds[0];
  const account = careerState.clubFinanceState?.accounts[aiClubId];
  const currentContract = careerState.seniorSquadState?.activeContractIds
    .map((id) => careerState.seniorSquadState?.contracts[id])
    .find((contract) => contract?.playerId === renewingPlayerId);
  assert.ok(renewingPlayerId !== undefined && account !== undefined && currentContract !== undefined);
  if (renewingPlayerId === undefined || account === undefined || currentContract === undefined) return;

  const offered = offerContractRenewal({
    careerState,
    negotiationId: contractNegotiationId("contract-negotiation:youth-reserved-wage"),
    playerId: renewingPlayerId,
    clubId: aiClubId,
    offeredOn: careerState.gameState.calendar.currentDate,
    terms: {
      durationYears: 2,
      annualWage: nonNegativeMoney(
        account.annualWageBudget
          - account.committedAnnualWage
          + currentContract.annualWage,
      ),
      squadStatus: currentContract.squadStatus,
      bonuses: {
        signingBonus: nonNegativeMoney(0),
        appearanceBonus: nonNegativeMoney(0),
      },
    },
  });
  assert.equal(offered.status, "applied");
  if (offered.status !== "applied") return;

  const result = promoteYouthCandidatesToSeniorSquads({
    careerState: offered.careerState,
    occurredOn: gameDate(20_365),
  });

  // Phase 79 locked rule: an open renewal offer does not reserve wage budget,
  // so promotion is judged against committed contracts only and proceeds.
  assert.notEqual(result.records[0]?.reason, "contract_unaffordable");
  assert.equal(result.careerState.gameState.clubs[aiClubId]?.playerIds.includes(candidate), true);
});

function careerStateFixture(input: {
  readonly selectedClubId: string;
  readonly candidateClubId: string;
  readonly candidate: PlayerId;
  readonly seniorCount?: number;
  readonly candidateAbilities?: PlayerAbilities;
  readonly candidatePotential?: PlayerAbilities;
  readonly candidatePosition?: PlayerPosition;
  readonly candidateRole?: PlayerRole;
}): CareerState {
  const pro01 = clubId("club:pro01");
  const pro02 = clubId("club:pro02");
  const selectedClubId = clubId(input.selectedClubId);
  const candidateClubId = clubId(input.candidateClubId);
  const seniorCount = input.seniorCount ?? 22;
  const clubs: Record<Club["id"], Club> = {
    [pro01]: clubFixture(pro01, seniorPlayers("pro01", pro01 === candidateClubId ? seniorCount : 22)),
    [pro02]: clubFixture(pro02, seniorPlayers("pro02", pro02 === candidateClubId ? seniorCount : 22)),
  };
  const players: Record<PlayerId, Player> = {
    [input.candidate]: playerFixture(
      input.candidate,
      input.candidateAbilities ?? abilitySet(8),
      input.candidatePotential ?? abilitySet(13),
      input.candidatePosition ?? "cm",
      input.candidateRole ?? "central_midfielder",
    ),
  };
  const playerStates: Record<PlayerId, PlayerDynamicState> = {
    [input.candidate]: playerStateFixture(),
  };
  const playerIds: PlayerId[] = [input.candidate];

  for (const clubIdValue of [pro01, pro02]) {
    for (const seniorId of clubs[clubIdValue]?.playerIds ?? []) {
      players[seniorId] = playerFixture(
        seniorId,
        abilitySet(8),
        abilitySet(10),
        "cm",
        "central_midfielder",
      );
      playerStates[seniorId] = playerStateFixture();
      playerIds.push(seniorId);
    }
  }

  const gameState: GameState = {
    meta: {
      seed: "youth-promotion",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players,
    playerIds,
    playerStates,
    clubs,
    clubIds: [pro01, pro02],
    fixtures: {},
    fixtureIds: [],
  };
  const seniorSquadState = canonicalSeniorSquadState(gameState);

  return createCareerState({
    saveId: saveId("save:youth-promotion"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState,
    transferHistory: [],
    seniorSquadState,
    clubFinanceState: canonicalClubFinanceState(gameState, seniorSquadState),
    youthAcademyState: {
      clubRosters: {
        [pro01]: { clubId: pro01, playerIds: [] },
        [pro02]: { clubId: pro02, playerIds: [] },
      },
      clubRosterIds: [pro01, pro02],
      playerLifecycle: {
        [input.candidate]: {
          playerId: input.candidate,
          clubId: candidateClubId,
          status: "promotion_candidate",
          academyEntrySeasonId: seasonId("season:0001"),
          academyEntryDate: gameDate(19_000),
        },
      },
      playerLifecycleIds: [input.candidate],
    },
  });
}

function canonicalSeniorSquadState(gameState: GameState): SeniorSquadState {
  const registrations: Record<string, SeniorSquadState["registrations"][keyof SeniorSquadState["registrations"]]> = {};
  const registrationIds: SeniorSquadState["registrationIds"][number][] = [];
  const contracts: Record<string, SeniorSquadState["contracts"][keyof SeniorSquadState["contracts"]]> = {};
  const contractIds: SeniorSquadState["contractIds"][number][] = [];

  for (const clubIdValue of gameState.clubIds) {
    const club = gameState.clubs[clubIdValue];
    if (club === undefined) continue;
    for (let index = 0; index < club.playerIds.length; index += 1) {
      const seniorPlayerId = club.playerIds[index];
      if (seniorPlayerId === undefined) continue;
      const suffix = `${String(clubIdValue).slice(5)}:${String(seniorPlayerId).slice(7)}`;
      const registrationId = seniorSquadRegistrationId(`registration:${suffix}`);
      const contractId = playerContractId(`contract:${suffix}`);
      registrations[registrationId] = {
        id: registrationId,
        playerId: seniorPlayerId,
        clubId: clubIdValue,
        shirtNumber: index + 1,
        registeredOn: gameDate(19_000),
      };
      registrationIds.push(registrationId);
      contracts[contractId] = {
        id: contractId,
        playerId: seniorPlayerId,
        clubId: clubIdValue,
        type: "professional",
        startsOn: gameDate(19_000),
        endsOn: gameDate(22_000),
        annualWage: nonNegativeMoney(100_000_00),
        squadStatus: "squad_player",
        bonuses: {
          signingBonus: nonNegativeMoney(5_000_00),
          appearanceBonus: nonNegativeMoney(1_000_00),
        },
      };
      contractIds.push(contractId);
    }
  }

  return createSeniorSquadState(gameState, {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds: contractIds,
    contractHistory: {},
    contractHistoryEntryIds: [],
  });
}

function canonicalClubFinanceState(gameState: GameState, seniorSquadState: SeniorSquadState): ClubFinanceState {
  const accounts: Record<string, ClubFinanceState["accounts"][keyof ClubFinanceState["accounts"]]> = {};
  const ledgerEntries: Record<string, ClubFinanceState["ledgerEntries"][keyof ClubFinanceState["ledgerEntries"]]> = {};
  const ledgerEntryIds: ClubFinanceState["ledgerEntryIds"][number][] = [];
  for (const clubIdValue of gameState.clubIds) {
    const committedAnnualWage = seniorSquadState.activeContractIds.reduce((total, contractId) => {
      const contract = seniorSquadState.contracts[contractId];
      return contract?.clubId === clubIdValue ? total + contract.annualWage : total;
    }, 0);
    const cashBalance = nonNegativeMoney(100_000_000_00);
    accounts[clubIdValue] = {
      clubId: clubIdValue,
      currency: "EUR",
      cashBalance,
      annualTransferBudget: nonNegativeMoney(20_000_000_00),
      availableTransferBudget: nonNegativeMoney(20_000_000_00),
      annualWageBudget: nonNegativeMoney(50_000_000_00),
      committedAnnualWage: nonNegativeMoney(committedAnnualWage),
      seasonIncome: nonNegativeMoney(0),
      seasonExpenses: nonNegativeMoney(0),
    };
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:opening:${String(clubIdValue).slice(5)}`);
    ledgerEntries[entryId] = {
      id: entryId,
      sequenceNumber: ledgerEntryIds.length + 1,
      clubId: clubIdValue,
      occurredOn: gameDate(20_000),
      currency: "EUR",
      reason: "opening_capital",
      direction: "credit",
      amount: cashBalance,
      balanceAfter: cashBalance,
      referenceId: `opening:${clubIdValue}`,
    };
    ledgerEntryIds.push(entryId);
  }
  return createClubFinanceState(gameState, seniorSquadState, {
    currency: "EUR",
    accounts,
    clubIds: gameState.clubIds,
    ledgerEntries,
    ledgerEntryIds,
  });
}

function clubFixture(id: Club["id"], playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id),
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function seniorPlayers(prefix: string, count: number): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];

  for (let index = 1; index <= count; index += 1) {
    playerIds.push(playerId(`player:${prefix}-senior-${String(index).padStart(2, "0")}`));
  }

  return playerIds;
}

function playerFixture(
  id: PlayerId,
  abilities: PlayerAbilities,
  potential: PlayerAbilities,
  position: PlayerPosition,
  primaryRole: PlayerRole,
): Player {
  return {
    id,
    firstName: "Player",
    lastName: String(id),
    birthDate: gameDate(14_000),
    naturalPositions: [position],
    primaryRole,
    abilities,
    potential,
  };
}

function roleShapedAbilities(role: PlayerRole, relevantValue: number, baselineValue: number): PlayerAbilities {
  const profile = getPlayerRoleProfile(role);
  const relevantKeys = new Set([...profile.coreForRole, ...profile.secondaryForRole]);

  return mapPlayerAbilities(abilitySet(baselineValue), (value, key) =>
    relevantKeys.has(key) ? abilityValue(relevantValue) : value,
  );
}

function roleCoreSuppressedAbilities(role: PlayerRole, baselineValue: number, coreValue: number): PlayerAbilities {
  const coreKeys = new Set(getPlayerRoleProfile(role).coreForRole);

  return mapPlayerAbilities(abilitySet(baselineValue), (value, key) =>
    coreKeys.has(key) ? abilityValue(coreValue) : value,
  );
}

function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

function abilitySet(value: number): PlayerAbilities {
  const ability = value as PlayerAbilities["technical"]["finishing"];

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}
