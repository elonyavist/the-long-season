import {
  type CareerState,
  type ClubId,
  type PlayerId,
  type YouthPlayerLifecycle,
} from "@game/domain";

import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";

/**
 * One player in the active football population used by stock-based systems.
 *
 * The source is deliberately exhaustive for the current career model. Phase
 * 80B can extend this union when loans introduce a canonical sporting
 * registration; that future association remains separate because a loan is
 * neither academy membership nor this short rollover reservation.
 */
export type CareerActivePlayerStockEntry =
  | {
      readonly playerId: PlayerId;
      readonly source: "senior";
      readonly clubId: ClubId;
    }
  | {
      readonly playerId: PlayerId;
      readonly source: "academy";
      readonly clubId: ClubId;
    }
  | {
      readonly playerId: PlayerId;
      /** Reserved between academy age-out and the same rollover's promotion. */
      readonly source: "promotion_candidate";
      readonly clubId: ClubId;
    }
  | {
      readonly playerId: PlayerId;
      readonly source: "free_agent";
    };

/**
 * Selects the canonical active football population in stable world order.
 *
 * Senior ownership, active academy rosters, the explicit promotion reservation,
 * and canonical free agency are the current sources. Promotion candidates must
 * stay active before annual intake because promotion runs later in the same
 * rollover; omitting them would create a false exceptional-stock vacancy.
 * Historical player rows stay outside the result. A player appearing in more
 * than one source is an invalid association and fails loudly instead of being
 * counted twice or assigned to whichever collection ran last.
 */
export function selectCareerActivePlayerStock(
  careerState: CareerState,
): readonly CareerActivePlayerStockEntry[] {
  const entryByPlayerId = new Map<PlayerId, CareerActivePlayerStockEntry>();

  for (const clubId of careerState.gameState.clubIds) {
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
      addUniqueEntry(entryByPlayerId, {
        playerId,
        source: "senior",
        clubId,
      });
    }
  }

  for (const clubId of careerState.youthAcademyState?.clubRosterIds ?? []) {
    for (
      const playerId
      of careerState.youthAcademyState?.clubRosters[clubId]?.playerIds ?? []
    ) {
      addUniqueEntry(entryByPlayerId, {
        playerId,
        source: "academy",
        clubId,
      });
    }
  }

  for (const playerId of careerState.youthAcademyState?.playerLifecycleIds ?? []) {
    const lifecycle = careerState.youthAcademyState?.playerLifecycle[playerId];
    if (lifecycle === undefined) {
      throw new Error(`Active player stock lifecycle is missing: ${playerId}`);
    }
    const promotionEntry = promotionCandidateStockEntry(lifecycle);
    if (promotionEntry !== undefined) {
      addUniqueEntry(entryByPlayerId, promotionEntry);
    }
  }

  for (const playerId of selectFreeAgentPlayerIds(careerState)) {
    addUniqueEntry(entryByPlayerId, {
      playerId,
      source: "free_agent",
    });
  }

  return careerState.gameState.playerIds.flatMap((playerId) => {
    const entry = entryByPlayerId.get(playerId);
    return entry === undefined ? [] : [entry];
  });
}

/**
 * Maps the exhaustive youth lifecycle into its one transitional stock source.
 *
 * A promotion candidate is associated with its academy club for allocation
 * policy only; this fact does not pretend that senior ownership or registration
 * has already moved. Future loans must add their own explicit source.
 */
function promotionCandidateStockEntry(
  lifecycle: YouthPlayerLifecycle,
): Extract<
  CareerActivePlayerStockEntry,
  { readonly source: "promotion_candidate" }
> | undefined {
  switch (lifecycle.status) {
    case "promotion_candidate":
      return {
        playerId: lifecycle.playerId,
        source: "promotion_candidate",
        clubId: lifecycle.clubId,
      };
    case "academy":
    case "external_move_candidate":
    case "promoted":
    case "released":
    case "aged_out":
      return undefined;
    default:
      return unreachableYouthPlayerStatus(lifecycle.status);
  }
}

function unreachableYouthPlayerStatus(status: never): never {
  throw new Error(`Unsupported youth player status: ${String(status)}`);
}

function addUniqueEntry(
  entries: Map<PlayerId, CareerActivePlayerStockEntry>,
  entry: CareerActivePlayerStockEntry,
): void {
  const existing = entries.get(entry.playerId);
  if (existing !== undefined) {
    throw new Error(
      `Active player stock association is ambiguous: ${entry.playerId}`
      + ` (${existing.source}, ${entry.source})`,
    );
  }
  entries.set(entry.playerId, entry);
}
