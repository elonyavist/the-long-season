import {
  createSeniorSquadState,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  seniorSquadRegistrationId,
  type AgreedSquadStatus,
  type Club,
  type ClubId,
  type GameDate,
  type PlayerContractBonuses,
  type PlayerContractHistoryEntry,
  type PlayerContractHistoryEntryId,
  type PlayerContractId,
  type PlayerRole,
  type RoleIdentifiedPlayer,
  type SeniorSquadRegistration,
  type SeniorSquadRegistrationId,
  type SeniorSquadState,
} from "@game/domain";
import { deriveRng } from "@game/shared";

/** Inputs required to generate all initial senior registrations and contracts. */
export interface InitialSeniorSquadGenerationInput {
  readonly worldSeed: string;
  readonly referenceDate: GameDate;
  readonly clubs: Readonly<Record<ClubId, Club>>;
  readonly clubIds: readonly ClubId[];
  readonly players: Readonly<Record<RoleIdentifiedPlayer["id"], RoleIdentifiedPlayer>>;
  readonly playerIds: readonly RoleIdentifiedPlayer["id"][];
}

/**
 * Generates deterministic shirt registrations and funded contract obligations.
 *
 * The policy lives beside world generation because these are starting-world
 * facts. Runtime renewals and transfers must use career-engine policies.
 */
export function generateInitialSeniorSquadState(input: InitialSeniorSquadGenerationInput): SeniorSquadState {
  const registrations: Record<SeniorSquadRegistrationId, SeniorSquadRegistration> = {};
  const registrationIds: SeniorSquadRegistrationId[] = [];
  const contracts: Record<PlayerContractId, SeniorSquadState["contracts"][PlayerContractId]> = {};
  const contractIds: PlayerContractId[] = [];
  const contractHistory: Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry> = {};
  const contractHistoryEntryIds: PlayerContractHistoryEntryId[] = [];
  let historySequence = 1;

  for (const clubId of input.clubIds) {
    const club = input.clubs[clubId];
    if (club === undefined) throw new Error(`Cannot generate contracts for missing club: ${clubId}`);
    const allocatedShirts = new Set<number>();
    const squadLevels = club.playerIds.map((playerId) => currentRoleLevel(requiredPlayer(input, playerId)));
    const squadRanks = new Map(
      club.playerIds
        .map((playerId, rosterIndex) => ({
          playerId,
          rosterIndex,
          level: squadLevels[rosterIndex] ?? currentRoleLevel(requiredPlayer(input, playerId)),
        }))
        .sort((left, right) => right.level - left.level || left.rosterIndex - right.rosterIndex)
        .map((candidate, rankIndex) => [candidate.playerId, rankIndex + 1] as const),
    );

    for (let rosterIndex = 0; rosterIndex < club.playerIds.length; rosterIndex += 1) {
      const playerId = club.playerIds[rosterIndex];
      if (playerId === undefined) continue;
      const player = requiredPlayer(input, playerId);
      const shirtNumber = allocateShirtNumber(player, allocatedShirts);
      allocatedShirts.add(shirtNumber);

      const registrationId = seniorSquadRegistrationId(`registration:${String(clubId).slice(5)}:${String(playerId).slice(7)}`);
      registrations[registrationId] = {
        id: registrationId,
        playerId,
        clubId,
        shirtNumber,
        registeredOn: input.referenceDate,
      };
      registrationIds.push(registrationId);

      const level = squadLevels[rosterIndex] ?? currentRoleLevel(player);
      const contract = initialPlayerContract({
        worldSeed: input.worldSeed,
        referenceDate: input.referenceDate,
        club,
        player,
        squadRank: squadRanks.get(playerId) ?? club.playerIds.length,
        currentLevel: level,
        potentialLevel: potentialRoleLevel(player),
      });
      contracts[contract.id] = contract;
      contractIds.push(contract.id);

      const historyId = playerContractHistoryEntryId(`contract-history:${String(playerId).slice(7)}:initial`);
      contractHistory[historyId] = {
        id: historyId,
        sequenceNumber: historySequence,
        occurredOn: contract.startsOn,
        event: "signed",
        contractId: contract.id,
        playerId,
        clubId,
      };
      contractHistoryEntryIds.push(historyId);
      historySequence += 1;
    }
  }

  return createSeniorSquadState(
    { players: input.players, playerIds: input.playerIds, clubs: input.clubs, clubIds: input.clubIds },
    {
      registrations,
      registrationIds,
      contracts,
      contractIds,
      activeContractIds: contractIds,
      contractHistory,
      contractHistoryEntryIds,
    },
  );
}

function initialPlayerContract(input: {
  readonly worldSeed: string;
  readonly referenceDate: GameDate;
  readonly club: Club;
  readonly player: RoleIdentifiedPlayer;
  readonly squadRank: number;
  readonly currentLevel: number;
  readonly potentialLevel: number;
}): SeniorSquadState["contracts"][PlayerContractId] {
  const age = Math.max(15, Math.floor((input.referenceDate - input.player.birthDate) / 365.2425));
  const rng = deriveRng(input.worldSeed, "initial-senior-contract", input.club.id, input.player.id);
  const startsOn = (input.referenceDate - rng.nextInt(30, 541)) as GameDate;
  const durationYears = contractDurationYears(age, input.squadRank, input.potentialLevel - input.currentLevel);
  const endsOn = (input.referenceDate + durationYears * 365 + rng.nextInt(0, 121)) as GameDate;
  const squadStatus = generatedSquadStatus(age, input.squadRank, input.potentialLevel - input.currentLevel);
  const annualWage = annualWageFor(input.club, input.currentLevel, input.potentialLevel, age, squadStatus);
  const id = playerContractId(`contract:${String(input.player.id).slice(7)}:initial`);

  return {
    id,
    playerId: input.player.id,
    clubId: input.club.id,
    type: age < 18 ? "youth" : "professional",
    startsOn,
    endsOn,
    annualWage,
    squadStatus,
    bonuses: contractBonuses(input.player.primaryRole, annualWage, squadStatus),
  };
}

function annualWageFor(
  club: Club,
  currentLevel: number,
  potentialLevel: number,
  age: number,
  status: AgreedSquadStatus,
): ReturnType<typeof nonNegativeMoney> {
  const divisionFactor = club.category === "first_division" ? 4 : club.category === "second_division" ? 2 : 1;
  const statusFactor: Record<AgreedSquadStatus, number> = {
    key_player: 1.35,
    regular_starter: 1.15,
    squad_player: 0.9,
    fringe_player: 0.7,
    prospect: 0.6,
  };
  const potentialPremium = age <= 23 ? Math.max(0, potentialLevel - currentLevel) * 5_000_00 : 0;
  const annualMinorUnits =
    (30_000_00 + Math.round(currentLevel * currentLevel * 2_100_00) + club.reputation * 4_000_00 + potentialPremium)
    * divisionFactor
    * statusFactor[status];
  return nonNegativeMoney(roundMoney(annualMinorUnits, 10_000));
}

function contractBonuses(
  role: PlayerRole,
  annualWage: ReturnType<typeof nonNegativeMoney>,
  status: AgreedSquadStatus,
): PlayerContractBonuses {
  const signingMultiplier = status === "key_player" ? 0.14 : status === "regular_starter" ? 0.1 : 0.06;
  const appearanceBonus = nonNegativeMoney(roundMoney(annualWage / 110, 100));
  const result: {
    signingBonus: ReturnType<typeof nonNegativeMoney>;
    appearanceBonus: ReturnType<typeof nonNegativeMoney>;
    goalBonus?: ReturnType<typeof nonNegativeMoney>;
    cleanSheetBonus?: ReturnType<typeof nonNegativeMoney>;
  } = {
    signingBonus: nonNegativeMoney(roundMoney(annualWage * signingMultiplier, 1_000)),
    appearanceBonus,
  };
  if (role !== "goalkeeper") result.goalBonus = nonNegativeMoney(roundMoney(appearanceBonus * 1.4, 100));
  if (["goalkeeper", "center_back", "full_back", "wing_back", "defensive_midfielder"].includes(role)) {
    result.cleanSheetBonus = nonNegativeMoney(roundMoney(appearanceBonus, 100));
  }
  return result;
}

function generatedSquadStatus(age: number, rank: number, potentialRoom: number): AgreedSquadStatus {
  if (age <= 21 && potentialRoom >= 2) return "prospect";
  if (rank <= 3) return "key_player";
  if (rank <= 11) return "regular_starter";
  if (rank <= 17) return "squad_player";
  return "fringe_player";
}

function contractDurationYears(age: number, rank: number, potentialRoom: number): number {
  if (age <= 21 && potentialRoom >= 2) return 4;
  if (age <= 27) return rank <= 11 ? 3 : 2;
  if (age <= 31) return 2;
  return 1;
}

function allocateShirtNumber(player: RoleIdentifiedPlayer, allocated: ReadonlySet<number>): number {
  for (const number of preferredShirts(player.primaryRole)) {
    if (!allocated.has(number)) return number;
  }
  for (let number = 1; number <= 99; number += 1) {
    if (!allocated.has(number)) return number;
  }
  throw new Error("A senior squad cannot allocate more than 99 unique shirt numbers");
}

function preferredShirts(role: PlayerRole): readonly number[] {
  switch (role) {
    case "goalkeeper": return [1, 12, 22, 30];
    case "full_back": return [2, 3, 13, 14, 17, 18];
    case "wing_back": return [2, 3, 7, 11, 17, 18];
    case "center_back": return [4, 5, 13, 14, 15, 16];
    case "defensive_midfielder": return [6, 16, 18, 20];
    case "central_midfielder": return [8, 6, 15, 18, 20];
    case "attacking_midfielder": return [10, 8, 19, 20];
    case "wide_midfielder": return [7, 11, 17, 18];
    case "winger": return [7, 11, 17, 19];
    case "striker": return [9, 10, 19, 20, 21];
  }
}

function currentRoleLevel(player: RoleIdentifiedPlayer): number {
  return average(roleAbilityValues(player.primaryRole, player.abilities));
}

function potentialRoleLevel(player: RoleIdentifiedPlayer): number {
  return average(roleAbilityValues(player.primaryRole, player.potential));
}

function roleAbilityValues(role: PlayerRole, abilities: RoleIdentifiedPlayer["abilities"]): readonly number[] {
  const { technical, physical, mental, goalkeeping } = abilities;
  switch (role) {
    case "goalkeeper": return [goalkeeping.reflexes, goalkeeping.handling, goalkeeping.rushingOut, goalkeeping.goalkeeperPositioning, goalkeeping.footwork, mental.anticipation, physical.agility];
    case "center_back": return [technical.tackling, physical.strength, physical.heading, mental.positioning, mental.anticipation, mental.composure];
    case "full_back": return [technical.tackling, technical.crossing, physical.pace, physical.stamina, mental.positioning, mental.anticipation];
    case "wing_back": return [technical.crossing, technical.dribbling, physical.pace, physical.stamina, physical.agility, mental.determination];
    case "defensive_midfielder": return [technical.tackling, technical.passing, physical.stamina, mental.positioning, mental.anticipation, mental.composure];
    case "central_midfielder": return [technical.passing, technical.technique, technical.longPassing, physical.stamina, mental.vision, mental.determination];
    case "attacking_midfielder": return [technical.passing, technical.technique, technical.dribbling, technical.finishing, mental.vision, mental.composure];
    case "wide_midfielder": return [technical.crossing, technical.passing, physical.pace, physical.stamina, mental.vision, mental.determination];
    case "winger": return [technical.crossing, technical.dribbling, technical.technique, physical.pace, physical.agility, mental.vision];
    case "striker": return [technical.finishing, technical.technique, physical.pace, physical.heading, mental.anticipation, mental.composure];
  }
}

function requiredPlayer(input: InitialSeniorSquadGenerationInput, id: RoleIdentifiedPlayer["id"]): RoleIdentifiedPlayer {
  const player = input.players[id];
  if (player === undefined) throw new Error(`Cannot generate senior contract for missing player: ${id}`);
  return player;
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundMoney(value: number, precision: number): number {
  return Math.max(0, Math.round(value / precision) * precision);
}
