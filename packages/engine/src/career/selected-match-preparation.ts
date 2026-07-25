import type {
  CareerMatchPreparation,
  CareerState,
  ClubId,
  PlayerId,
} from "@game/domain";

/**
 * Removes departed players from the selected club's durable match plan.
 *
 * Ownership-changing use cases share this boundary so they never choose a
 * replacement and never leave tactical-board geometry attached to a vacated
 * lineup slot.
 */
export function reconcileSelectedClubDeparturesFromMatchPreparation(input: {
  readonly careerState: CareerState;
  readonly departingClubId: ClubId;
  readonly playerIds: ReadonlySet<PlayerId>;
}): CareerMatchPreparation | undefined {
  const preparation = input.careerState.matchPreparation;
  if (
    preparation === undefined
    || input.playerIds.size === 0
    || input.careerState.selectedClubId !== input.departingClubId
  ) {
    return preparation;
  }

  const selectedLineup = preparation.selectedLineup;
  const remainingLineupSlots = selectedLineup?.slots.filter(
    (slot) => !input.playerIds.has(slot.playerId),
  );
  const remainingSlotKeys = new Set(remainingLineupSlots?.map((slot) => slot.slotKey) ?? []);
  const remainingBoardSlots = preparation.boardSlots?.filter(
    (slot) => remainingSlotKeys.has(slot.slotKey),
  );
  const remainingBenchSlots = preparation.benchSlots?.filter(
    (slot) => !input.playerIds.has(slot.playerId),
  );

  return {
    selectedClubId: preparation.selectedClubId,
    ...(preparation.targetFixtureId === undefined
      ? {}
      : { targetFixtureId: preparation.targetFixtureId }),
    ...(selectedLineup === undefined
      || remainingLineupSlots === undefined
      || remainingLineupSlots.length === 0
      ? {}
      : {
          selectedLineup: {
            clubId: selectedLineup.clubId,
            slots: remainingLineupSlots,
          },
        }),
    ...(preparation.tactic === undefined ? {} : { tactic: preparation.tactic }),
    ...(preparation.baseFormationId === undefined
      ? {}
      : { baseFormationId: preparation.baseFormationId }),
    ...(remainingBoardSlots === undefined || remainingLineupSlots?.length === 0
      ? {}
      : { boardSlots: remainingBoardSlots }),
    ...(remainingBenchSlots === undefined ? {} : { benchSlots: remainingBenchSlots }),
    updatedAt: preparation.updatedAt,
  };
}
