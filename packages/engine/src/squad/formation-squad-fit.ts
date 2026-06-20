import {
  evaluatePositionSuitability,
  isCoveringSuitability,
  type Formation,
  type FormationDepartment,
  type FormationPositionFamily,
  type FormationSlot,
  type Player,
  type PlayerId,
  type PositionSuitability,
  type SquadDepth,
} from "@game/domain";

/** Stable market-planning hint keys produced by formation squad-fit reports. */
export type FormationSquadFitHint =
  | "need:left_full_back"
  | "need:right_full_back"
  | "need:center_back_depth"
  | "need:defensive_midfielder"
  | "need:attacking_midfielder"
  | "need:wide_midfielder"
  | "need:striker_depth"
  | "consider:defensive_midfielder"
  | "consider:attacking_midfielder"
  | "surplus:wide_players"
  | "surplus:center_backs";

/** Minimal player data required by the fit report. */
export type FormationFitPlayer = Pick<Player, "id" | "naturalPositions">;

/** Input for deterministic squad-vs-formation fit reporting. */
export interface BuildFormationSquadFitReportInput {
  /** Formation being inspected. */
  readonly formation: Formation;
  /** User/caller-selected squad depth snapshot. */
  readonly squadDepth: SquadDepth;
  /** Player lookup containing every squad player that should be inspected. */
  readonly players: Readonly<Record<PlayerId, FormationFitPlayer>>;
}

/** One candidate player for one formation slot. */
export interface FormationSlotCandidate {
  /** Candidate player ID. */
  readonly playerId: PlayerId;
  /** Best suitability for this exact slot. */
  readonly suitability: PositionSuitability;
}

/** Fit details for one formation slot. */
export interface FormationSlotFit {
  /** Stable formation slot key. */
  readonly slotKey: string;
  /** Required position family. */
  readonly positionFamily: FormationPositionFamily;
  /** Broad slot department. */
  readonly department: FormationDepartment;
  /** Best suitability found among all squad candidates. */
  readonly bestSuitability: PositionSuitability;
  /** Deterministically sorted candidate players that are not invalid for the slot. */
  readonly candidates: readonly FormationSlotCandidate[];
}

/** Depth counts for one required position family. */
export interface FormationPositionFamilyDepth {
  /** Position family being counted. */
  readonly positionFamily: FormationPositionFamily;
  /** Number of formation slots requiring this family. */
  readonly requiredSlots: number;
  /** Number of squad players naturally covering this family. */
  readonly naturalPlayerCount: number;
  /** Number of squad players adapted to this family. */
  readonly adaptedPlayerCount: number;
  /** Natural plus adapted players; weak fits are excluded. */
  readonly coveringPlayerCount: number;
  /** Number of weak but not covering players. */
  readonly weakPlayerCount: number;
}

/** Broad surplus group detected by the report. */
export interface FormationSurplusGroup {
  /** Stable surplus group key. */
  readonly key: "wide_players" | "center_backs";
  /** Number of matching squad players. */
  readonly playerCount: number;
  /** Number of matching formation slots. */
  readonly slotCount: number;
}

/** Deterministic report describing how a squad fits one formation. */
export interface FormationSquadFitReport {
  /** Formation key being inspected. */
  readonly formationKey: Formation["key"];
  /** Slots with natural or adapted coverage. */
  readonly coveredSlots: readonly FormationSlotFit[];
  /** Slots with no natural, adapted, or weak candidate. */
  readonly uncoveredSlots: readonly FormationSlotFit[];
  /** Covered slots whose best fit is adapted rather than natural. */
  readonly adaptedSlots: readonly FormationSlotFit[];
  /** Slots whose best fit is weak and therefore not real coverage. */
  readonly weakSlots: readonly FormationSlotFit[];
  /** Squad players who naturally fit at least one required slot. */
  readonly naturalFitPlayerIds: readonly PlayerId[];
  /** Squad players whose best slot fit is weak or invalid. */
  readonly forcedOutOfPositionPlayerIds: readonly PlayerId[];
  /** Depth counts by required position family. */
  readonly depthByPositionFamily: readonly FormationPositionFamilyDepth[];
  /** Broad surplus groups that future market logic can inspect. */
  readonly surplusGroups: readonly FormationSurplusGroup[];
  /** Stable future-facing market-planning hints. */
  readonly marketNeedHints: readonly FormationSquadFitHint[];
}

/** Builds a deterministic report for one user-selected squad against one formation. */
export function buildFormationSquadFitReport(input: BuildFormationSquadFitReportInput): FormationSquadFitReport {
  const squadPlayers = input.squadDepth.squadPlayerIds.map((playerId) => getPlayer(input.players, playerId));
  const slotFits = input.formation.slots.map((slot) => buildSlotFit(slot, squadPlayers));
  const depthByPositionFamily = buildDepthByPositionFamily(input.formation.slots, squadPlayers);
  const surplusGroups = buildSurplusGroups(input.formation.slots, squadPlayers);
  const marketNeedHints = buildMarketNeedHints(depthByPositionFamily, surplusGroups);

  return {
    formationKey: input.formation.key,
    coveredSlots: slotFits.filter((slotFit) => isCoveringSuitability(slotFit.bestSuitability)),
    uncoveredSlots: slotFits.filter((slotFit) => slotFit.bestSuitability === "invalid"),
    adaptedSlots: slotFits.filter((slotFit) => slotFit.bestSuitability === "adapted"),
    weakSlots: slotFits.filter((slotFit) => slotFit.bestSuitability === "weak"),
    naturalFitPlayerIds: playerIdsWithBestSuitability(squadPlayers, input.formation.slots, "natural"),
    forcedOutOfPositionPlayerIds: playerIdsForcedOutOfPosition(squadPlayers, input.formation.slots),
    depthByPositionFamily,
    surplusGroups,
    marketNeedHints,
  };
}

function buildSlotFit(slot: FormationSlot, squadPlayers: readonly FormationFitPlayer[]): FormationSlotFit {
  const candidates = squadPlayers
    .map((player) => ({
      playerId: player.id,
      suitability: evaluatePositionSuitability(player.naturalPositions, slot),
    }))
    .filter((candidate) => candidate.suitability !== "invalid")
    .sort(compareCandidates);

  return {
    slotKey: slot.slotKey,
    positionFamily: slot.positionFamily,
    department: slot.department,
    bestSuitability: bestSuitability(candidates.map((candidate) => candidate.suitability)),
    candidates,
  };
}

function buildDepthByPositionFamily(
  slots: readonly FormationSlot[],
  squadPlayers: readonly FormationFitPlayer[],
): readonly FormationPositionFamilyDepth[] {
  const requiredFamilies = uniqueSorted(slots.map((slot) => slot.positionFamily));

  return requiredFamilies.map((positionFamily) => {
    const suitabilities = squadPlayers.map((player) => evaluatePositionSuitability(player.naturalPositions, { positionFamily }));
    const naturalPlayerCount = suitabilities.filter((suitability) => suitability === "natural").length;
    const adaptedPlayerCount = suitabilities.filter((suitability) => suitability === "adapted").length;

    return {
      positionFamily,
      requiredSlots: slots.filter((slot) => slot.positionFamily === positionFamily).length,
      naturalPlayerCount,
      adaptedPlayerCount,
      coveringPlayerCount: naturalPlayerCount + adaptedPlayerCount,
      weakPlayerCount: suitabilities.filter((suitability) => suitability === "weak").length,
    };
  });
}

function buildSurplusGroups(
  slots: readonly FormationSlot[],
  squadPlayers: readonly FormationFitPlayer[],
): readonly FormationSurplusGroup[] {
  const widePlayerCount = squadPlayers.filter((player) =>
    player.naturalPositions.some((position) => position === "rw" || position === "lw" || position === "rwb" || position === "lwb"),
  ).length;
  const wideSlotCount = slots.filter((slot) =>
    slot.positionFamily === "right_winger" ||
    slot.positionFamily === "left_winger" ||
    slot.positionFamily === "right_midfielder" ||
    slot.positionFamily === "left_midfielder" ||
    slot.positionFamily === "right_wing_back" ||
    slot.positionFamily === "left_wing_back"
  ).length;
  const centerBackPlayerCount = squadPlayers.filter((player) => player.naturalPositions.includes("cb")).length;
  const centerBackSlotCount = slots.filter((slot) => slot.positionFamily === "center_back").length;
  const surplusGroups: FormationSurplusGroup[] = [];

  if (widePlayerCount > wideSlotCount + 1) {
    surplusGroups.push({ key: "wide_players", playerCount: widePlayerCount, slotCount: wideSlotCount });
  }

  if (centerBackPlayerCount > centerBackSlotCount + 2) {
    surplusGroups.push({ key: "center_backs", playerCount: centerBackPlayerCount, slotCount: centerBackSlotCount });
  }

  return surplusGroups;
}

function buildMarketNeedHints(
  depthRows: readonly FormationPositionFamilyDepth[],
  surplusGroups: readonly FormationSurplusGroup[],
): readonly FormationSquadFitHint[] {
  const hints = new Set<FormationSquadFitHint>();

  for (const row of depthRows) {
    if (row.coveringPlayerCount >= row.requiredSlots) {
      if (row.naturalPlayerCount < row.requiredSlots && row.adaptedPlayerCount > 0) {
        if (row.positionFamily === "defensive_midfielder") hints.add("consider:defensive_midfielder");
        if (row.positionFamily === "attacking_midfielder") hints.add("consider:attacking_midfielder");
      }

      continue;
    }

    if (row.positionFamily === "left_full_back") hints.add("need:left_full_back");
    if (row.positionFamily === "right_full_back") hints.add("need:right_full_back");
    if (row.positionFamily === "center_back") hints.add("need:center_back_depth");
    if (row.positionFamily === "defensive_midfielder") hints.add("need:defensive_midfielder");
    if (row.positionFamily === "attacking_midfielder") hints.add("need:attacking_midfielder");
    if (row.positionFamily === "left_midfielder" || row.positionFamily === "right_midfielder") hints.add("need:wide_midfielder");
    if (row.positionFamily === "striker") hints.add("need:striker_depth");
  }

  for (const group of surplusGroups) {
    if (group.key === "wide_players") hints.add("surplus:wide_players");
    if (group.key === "center_backs") hints.add("surplus:center_backs");
  }

  const orderedHints: readonly FormationSquadFitHint[] = [
    "need:left_full_back",
    "need:right_full_back",
    "need:center_back_depth",
    "need:defensive_midfielder",
    "need:attacking_midfielder",
    "need:wide_midfielder",
    "need:striker_depth",
    "consider:defensive_midfielder",
    "consider:attacking_midfielder",
    "surplus:wide_players",
    "surplus:center_backs",
  ];

  return orderedHints.filter((hint) => hints.has(hint));
}

function playerIdsWithBestSuitability(
  squadPlayers: readonly FormationFitPlayer[],
  slots: readonly FormationSlot[],
  targetSuitability: PositionSuitability,
): readonly PlayerId[] {
  return squadPlayers
    .filter((player) => bestPlayerSuitability(player, slots) === targetSuitability)
    .map((player) => player.id)
    .sort(comparePlayerIds);
}

function playerIdsForcedOutOfPosition(
  squadPlayers: readonly FormationFitPlayer[],
  slots: readonly FormationSlot[],
): readonly PlayerId[] {
  return squadPlayers
    .filter((player) => {
      const suitability = bestPlayerSuitability(player, slots);
      return suitability === "weak" || suitability === "invalid";
    })
    .map((player) => player.id)
    .sort(comparePlayerIds);
}

function bestPlayerSuitability(player: FormationFitPlayer, slots: readonly FormationSlot[]): PositionSuitability {
  return bestSuitability(slots.map((slot) => evaluatePositionSuitability(player.naturalPositions, slot)));
}

function bestSuitability(suitabilities: readonly PositionSuitability[]): PositionSuitability {
  if (suitabilities.includes("natural")) return "natural";
  if (suitabilities.includes("adapted")) return "adapted";
  if (suitabilities.includes("weak")) return "weak";
  return "invalid";
}

function getPlayer(players: Readonly<Record<PlayerId, FormationFitPlayer>>, playerId: PlayerId): FormationFitPlayer {
  const player = players[playerId];

  if (player === undefined) {
    throw new Error(`Formation squad-fit player lookup is missing squad player: ${playerId}`);
  }

  return player;
}

function uniqueSorted<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function compareCandidates(left: FormationSlotCandidate, right: FormationSlotCandidate): number {
  const suitabilityComparison = suitabilityRank(right.suitability) - suitabilityRank(left.suitability);

  if (suitabilityComparison !== 0) {
    return suitabilityComparison;
  }

  return comparePlayerIds(left.playerId, right.playerId);
}

function suitabilityRank(suitability: PositionSuitability): number {
  if (suitability === "natural") return 3;
  if (suitability === "adapted") return 2;
  if (suitability === "weak") return 1;
  return 0;
}

function comparePlayerIds(left: PlayerId, right: PlayerId): number {
  return left.localeCompare(right);
}
