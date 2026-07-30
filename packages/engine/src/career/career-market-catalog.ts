import {
  type AgreedSquadStatus,
  type CareerState,
  type ClubCategory,
  type ClubId,
  type CompetitionId,
  type GameDate,
  type PlayerContractId,
  type PlayerId,
} from "@game/domain";

import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";

/** Public source tier carried by every canonical Market target. */
export type CareerMarketSourceTier = ClubCategory | "free_agent";

/** Contracted or unattached employment facts owned by the engine catalog. */
export type CareerMarketCatalogEmployment =
  | {
      readonly status: "contracted";
      readonly clubId: ClubId;
      readonly clubName: string;
      readonly clubReputation: number;
      readonly competitionId: CompetitionId;
      readonly competitionName: string;
      readonly sourceTier: ClubCategory;
      readonly contractId: PlayerContractId;
      readonly contractEndsOn: GameDate;
      readonly currentSquadStatus: AgreedSquadStatus;
    }
  | {
      readonly status: "free_agent";
      readonly sourceTier: "free_agent";
    };

/** One lightweight persisted-world target; player detail stays in the caller. */
export interface CareerMarketCatalogTarget {
  readonly playerId: PlayerId;
  readonly employment: CareerMarketCatalogEmployment;
}

/** Deterministic complete Market population for one selected-club career. */
export interface CareerMarketCatalog {
  readonly targets: readonly CareerMarketCatalogTarget[];
}

/**
 * Selects other-club seniors and canonical free agents from one career world.
 *
 * Current competition membership is read only from the domestic registry.
 * Selected-club players and academy players never enter the external Market.
 * Missing contracts or topology are rejected rather than converted into a
 * synthetic player pool.
 */
export function buildCareerMarketCatalog(
  careerState: CareerState,
): CareerMarketCatalog {
  const membershipByClubId = indexCanonicalMembership(careerState);
  const activeContractByPlayerId = indexActiveContracts(careerState);
  const freeAgentIds = new Set(selectFreeAgentPlayerIds(careerState));
  const ownerByPlayerId = indexPlayerOwners(careerState);
  const targets: CareerMarketCatalogTarget[] = [];
  const seen = new Set<PlayerId>();

  for (const playerId of careerState.gameState.playerIds) {
    if (careerState.gameState.players[playerId] === undefined) continue;
    const ownerId = ownerByPlayerId.get(playerId);
    if (ownerId === careerState.selectedClubId) continue;

    let employment: CareerMarketCatalogEmployment | undefined;
    if (ownerId !== undefined) {
      const club = careerState.gameState.clubs[ownerId];
      const membership = membershipByClubId.get(ownerId);
      const contract = activeContractByPlayerId.get(playerId);
      if (club === undefined || membership === undefined || contract === undefined) {
        throw new Error(`Contracted Market target is incomplete: ${String(playerId)}`);
      }
      employment = {
        status: "contracted",
        clubId: ownerId,
        clubName: club.name,
        clubReputation: club.reputation,
        competitionId: membership.competitionId,
        competitionName: membership.competitionName,
        sourceTier: membership.sourceTier,
        contractId: contract.id,
        contractEndsOn: contract.endsOn,
        currentSquadStatus: contract.squadStatus,
      };
    } else if (freeAgentIds.has(playerId)) {
      employment = { status: "free_agent", sourceTier: "free_agent" };
    }

    if (employment === undefined) continue;
    if (seen.has(playerId)) {
      throw new Error(`Duplicate canonical Market target: ${String(playerId)}`);
    }
    seen.add(playerId);
    targets.push({ playerId, employment });
  }

  return { targets };
}

function indexCanonicalMembership(
  careerState: CareerState,
): ReadonlyMap<ClubId, {
  readonly competitionId: CompetitionId;
  readonly competitionName: string;
  readonly sourceTier: ClubCategory;
}> {
  const world = careerState.gameState.domesticCompetitionWorld;
  if (world === undefined || world.competitionIds.length !== 3) {
    throw new Error("Canonical three-division Market topology is missing");
  }
  const sourceTiers = [
    "first_division",
    "second_division",
    "third_division",
  ] as const;
  const membership = new Map<ClubId, {
    readonly competitionId: CompetitionId;
    readonly competitionName: string;
    readonly sourceTier: ClubCategory;
  }>();

  for (let index = 0; index < world.competitionIds.length; index += 1) {
    const competitionId = world.competitionIds[index]!;
    const competition = world.competitions[competitionId];
    const sourceTier = sourceTiers[index];
    if (competition === undefined || sourceTier === undefined) {
      throw new Error(`Canonical Market competition is missing: ${String(competitionId)}`);
    }
    for (const clubId of competition.clubIds) {
      if (membership.has(clubId)) {
        throw new Error(`Duplicate canonical Market membership: ${String(clubId)}`);
      }
      const club = careerState.gameState.clubs[clubId];
      if (club === undefined || club.category !== sourceTier) {
        throw new Error(`Canonical Market tier does not match club category: ${String(clubId)}`);
      }
      membership.set(clubId, {
        competitionId,
        competitionName: competition.name,
        sourceTier,
      });
    }
  }

  return membership;
}

function indexPlayerOwners(careerState: CareerState): ReadonlyMap<PlayerId, ClubId> {
  const owners = new Map<PlayerId, ClubId>();
  for (const clubId of careerState.gameState.clubIds) {
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
      if (owners.has(playerId)) {
        throw new Error(`Player has duplicate canonical Market ownership: ${String(playerId)}`);
      }
      owners.set(playerId, clubId);
    }
  }
  return owners;
}

function indexActiveContracts(
  careerState: CareerState,
): ReadonlyMap<PlayerId, NonNullable<
  CareerState["seniorSquadState"]
>["contracts"][PlayerContractId]> {
  const contracts = new Map<PlayerId, NonNullable<
    CareerState["seniorSquadState"]
  >["contracts"][PlayerContractId]>();
  for (const contractId of careerState.seniorSquadState?.activeContractIds ?? []) {
    const contract = careerState.seniorSquadState?.contracts[contractId];
    if (contract !== undefined) contracts.set(contract.playerId, contract);
  }
  return contracts;
}
