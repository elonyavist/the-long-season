import {
  findNextCareerFixture,
  summarizePlayerDevelopmentAbilities,
} from "@game/engine";
import { toISO } from "@game/shared";
import {
  CAREER_MATCH_PREPARATION_FORMATIONS,
  buildCareerMatchPreparationView,
  type CareerMatchPreparationBenchSlotInput,
  type CareerMatchPreparationFormationId,
  type CareerMatchPreparationFormationInput,
  type CareerMatchPreparationFormationSlotInput,
  type CareerMatchPreparationPlayerOptionInput,
  type CareerMatchPreparationTacticProfileInput,
  type CareerMatchPreparationView,
} from "@game/ui";

import type { WebCareerState } from "../../runtime/web-career-runtime";
import {
  comparePlayerOptionsByPosition,
  orderPlayerOptionsForLineupSlot,
} from "../../shared/lib/player-position-ordering";
import {
  assignTacticalBoardPlayer,
  changeTacticalBoardSlotRole,
  clearTacticalBoardSlot,
  createTacticalBoardDraft,
  loadTacticalBoardBaseFormation,
  moveTacticalBoardSlot,
  removeTacticalBoardPlayer,
  tacticalBoardSelectedPlayerIdsBySlot,
  type TacticalBoardDraft,
} from "../tactics-board/tactical-board-state";
import { TACTICAL_BOARD_ROLE_CODES, TACTICAL_BOARD_ROLES } from "../tactics-board/tactical-board-roles";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";
import {
  buildTacticalBoardSquadPlayers,
  type TacticalBoardSquadPlayer,
} from "../tactics-board/tactical-board-squad";

/** Explicit manager helper commands supported by the preparation workspace. */
export type MatchPreparationSelectionAction = "auto" | "fill_gaps" | "clear";

/** Editable browser draft; durable authority remains `CareerState.matchPreparation`. */
export interface MatchPreparationDraft {
  readonly selectedFormationId: CareerMatchPreparationFormationId;
  readonly tacticalBoardDraft: TacticalBoardDraft;
  readonly selectedPlayerIdsBySlot: Readonly<Record<string, string>>;
  readonly selectedBenchPlayerIdsBySlot: Readonly<Record<string, string>>;
  readonly selectedTacticProfileId?: string;
  readonly isSaved: boolean;
}

/** Current player facts used by the compact squad list. */
export interface MatchPreparationPlayerFact {
  readonly playerId: string;
  readonly age: number;
}

/** Validated durable preparation payload produced by an explicit save action. */
export type DurableMatchPreparation = NonNullable<WebCareerState["matchPreparation"]>;

const DEFAULT_FORMATION_ID: CareerMatchPreparationFormationId = "4-4-2";
const BENCH_SLOT_KEYS = ["01", "02", "03", "04", "05", "06", "07", "08"] as const;

/** Current bounded tactic choices backed by the existing domain contract. */
export const MATCH_PREPARATION_TACTIC_PROFILES: readonly CareerMatchPreparationTacticProfileInput[] = [
  { tacticProfileId: "tactic:balanced", labelKey: "career.matchPreparation.tactic.balanced", values: { mentality: "balanced", pressing: 0.5, directness: 0.5, width: 0.5, risk: 0.5 } },
  { tacticProfileId: "tactic:attacking", labelKey: "career.matchPreparation.tactic.attacking", values: { mentality: "attacking", pressing: 0.85, directness: 0.75, width: 0.8, risk: 0.7 } },
  { tacticProfileId: "tactic:defensive", labelKey: "career.matchPreparation.tactic.defensive", values: { mentality: "defensive", pressing: 0.35, directness: 0.3, width: 0.4, risk: 0.2 } },
];

/** Creates the editable draft from the loaded durable career, preserving exact board geometry. */
export function createMatchPreparationDraft(career: WebCareerState): MatchPreparationDraft {
  const preparation = career.matchPreparation;
  const isConfirmedForCurrentTask = preparationTargetsCurrentTask(
    career,
    preparation?.targetFixtureId,
  );
  const selectedFormationId = formationIdOrDefault(preparation?.baseFormationId);
  const selectedPlayerIdsBySlot = Object.fromEntries(
    preparation?.selectedLineup?.slots.map((slot) => [slot.slotKey, slot.playerId]) ?? [],
  );
  const initialBoard = createTacticalBoardDraft(selectedFormationId, selectedPlayerIdsBySlot);
  const persistedBoardBySlot = new Map(preparation?.boardSlots?.map((slot) => [slot.slotKey, slot]) ?? []);
  const tacticalBoardDraft: TacticalBoardDraft = {
    ...initialBoard,
    slots: initialBoard.slots.map((slot) => {
      const persisted = persistedBoardBySlot.get(slot.slotId);
      if (persisted === undefined || !isTacticalBoardRoleCode(persisted.roleKey)) return slot;
      const role = TACTICAL_BOARD_ROLES[persisted.roleKey];
      return { ...slot, nx: persisted.nx, ny: persisted.ny, role: persisted.roleKey, canonicalRole: role.canonicalRole };
    }),
  };
  const selectedTacticProfileId = profileIdForTactic(preparation?.tactic);

  return {
    selectedFormationId,
    tacticalBoardDraft,
    selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft),
    selectedBenchPlayerIdsBySlot: Object.fromEntries(
      preparation?.benchSlots?.map((slot) => [slot.slotKey, slot.playerId]) ?? [],
    ),
    ...(selectedTacticProfileId === undefined ? {} : { selectedTacticProfileId }),
    isSaved: isConfirmedForCurrentTask
      && preparation?.selectedLineup !== undefined
      && preparation.tactic !== undefined,
  };
}

/**
 * Distinguishes a confirmed match plan from an unscoped draft carried forward
 * after the manager has reviewed a completed fixture.
 */
function preparationTargetsCurrentTask(
  career: WebCareerState,
  targetFixtureId: DurableMatchPreparation["targetFixtureId"] | undefined,
): boolean {
  if (targetFixtureId === undefined) return false;
  if (career.activeMatchCheckpoint?.fixtureId === targetFixtureId) return true;
  if (career.gameState.fixtures[targetFixtureId]?.result?.played === true) return true;

  const nextFixture = findNextCareerFixture(career);
  return nextFixture.status === "found" && nextFixture.fixture.id === targetFixtureId;
}

/** Builds the existing UI read model from a loaded career and its current draft. */
export function buildMatchPreparationView(career: WebCareerState, draft: MatchPreparationDraft): CareerMatchPreparationView {
  const selectedClub = requiredSelectedClub(career);
  const nextFixtureResult = findNextCareerFixture(career);
  const nextFixture = nextFixtureResult.status === "found" ? nextFixtureResult.fixture : undefined;
  const playerOptions = buildCareerPlayerOptions(career);
  const formation = getFormation(draft.selectedFormationId);

  return buildCareerMatchPreparationView({
    saveId: career.saveId,
    selectedClub: { clubId: selectedClub.id, name: selectedClub.name },
    ...(nextFixture === undefined ? {} : {
      nextFixture: {
        fixtureId: nextFixture.id,
        dateIso: toISO(nextFixture.date),
        round: nextFixture.roundNumber,
        homeClub: clubInput(career, nextFixture.homeClubId),
        awayClub: clubInput(career, nextFixture.awayClubId),
        selectedClubSide: nextFixture.homeClubId === career.selectedClubId ? "home" : "away",
      },
    }),
    formations: CAREER_MATCH_PREPARATION_FORMATIONS,
    selectedFormationId: draft.selectedFormationId,
    lineupSlots: formation.slots.map((slot) => ({
      slotKey: slot.slotKey,
      labelKey: slot.labelKey,
      roleKey: slot.roleKey,
      ...(draft.selectedPlayerIdsBySlot[slot.slotKey] === undefined ? {} : { selectedPlayerId: draft.selectedPlayerIdsBySlot[slot.slotKey] }),
      playerOptions,
    })),
    benchSlots: matchPreparationBenchSlotKeys().map((slotKey) => ({
      slotKey,
      labelKey: `career.matchPreparation.benchSlot.${slotKey.slice(-2)}`,
      ...(draft.selectedBenchPlayerIdsBySlot[slotKey] === undefined ? {} : { selectedPlayerId: draft.selectedBenchPlayerIdsBySlot[slotKey] }),
      playerOptions,
    })),
    tacticProfiles: MATCH_PREPARATION_TACTIC_PROFILES,
    ...(draft.selectedTacticProfileId === undefined ? {} : { selectedTacticProfileId: draft.selectedTacticProfileId }),
    isSaved: draft.isSaved,
  });
}

/** Returns whether durable preparation facts differ from the loaded career baseline. */
export function isMatchPreparationDraftDirty(
  career: WebCareerState,
  draft: MatchPreparationDraft,
): boolean {
  return preparationDraftFingerprint(draft) !== preparationDraftFingerprint(
    createMatchPreparationDraft(career),
  );
}

/** Reconciles the legacy saved marker after an edit returns exactly to baseline. */
export function reconcileMatchPreparationDraft(
  career: WebCareerState,
  draft: MatchPreparationDraft,
): MatchPreparationDraft {
  const baseline = createMatchPreparationDraft(career);
  const isSaved = !isMatchPreparationDraftDirty(career, draft) && baseline.isSaved;
  return draft.isSaved === isSaved ? draft : { ...draft, isSaved };
}

/** Converts current career players into the approved shared tactical-board shape. */
export function buildCareerTacticalBoardPlayers(career: WebCareerState): readonly TacticalBoardSquadPlayer[] {
  return buildTacticalBoardSquadPlayers(buildCareerPlayerOptions(career));
}

/** Returns current display facts for one selected-club player. */
export function getCareerMatchPreparationPlayerFact(career: WebCareerState, requestedPlayerId: string): MatchPreparationPlayerFact | undefined {
  const player = career.gameState.players[requestedPlayerId as keyof typeof career.gameState.players];
  if (player === undefined) return undefined;
  return { playerId: player.id, age: Math.max(15, Math.floor((career.gameState.calendar.currentDate - player.birthDate) / 365.2425)) };
}

/** Selects or clears one XI player and enforces XI/bench exclusivity. */
export function selectMatchPreparationPlayer(draft: MatchPreparationDraft, slotKey: string, playerId: string | undefined): MatchPreparationDraft {
  const tacticalBoardDraft = assignTacticalBoardPlayer(draft.tacticalBoardDraft, slotKey, playerId);
  return changedDraft(draft, {
    tacticalBoardDraft,
    selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft),
    selectedBenchPlayerIdsBySlot: removePlayerFromSelection(draft.selectedBenchPlayerIdsBySlot, playerId),
  });
}

/** Selects or clears one bench player and enforces bench/XI exclusivity. */
export function selectMatchPreparationBenchPlayer(draft: MatchPreparationDraft, slotKey: string, playerId: string | undefined): MatchPreparationDraft {
  const selectedBenchPlayerIdsBySlot = { ...draft.selectedBenchPlayerIdsBySlot };
  for (const [candidateSlotKey, candidatePlayerId] of Object.entries(selectedBenchPlayerIdsBySlot)) {
    if (playerId !== undefined && candidatePlayerId === playerId) delete selectedBenchPlayerIdsBySlot[candidateSlotKey];
  }
  if (playerId === undefined) delete selectedBenchPlayerIdsBySlot[slotKey];
  else selectedBenchPlayerIdsBySlot[slotKey] = playerId;
  const tacticalBoardDraft = playerId === undefined ? draft.tacticalBoardDraft : removeTacticalBoardPlayer(draft.tacticalBoardDraft, playerId);
  return changedDraft(draft, { tacticalBoardDraft, selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft), selectedBenchPlayerIdsBySlot });
}

/** Changes base formation while retaining only compatible board assignments. */
export function selectMatchPreparationFormation(draft: MatchPreparationDraft, formationId: CareerMatchPreparationFormationId): MatchPreparationDraft {
  const tacticalBoardDraft = loadTacticalBoardBaseFormation(draft.tacticalBoardDraft, formationId);
  return changedDraft(draft, { selectedFormationId: formationId, tacticalBoardDraft, selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft) });
}

/** Selects one existing tactic profile. */
export function selectMatchPreparationTactic(draft: MatchPreparationDraft, tacticProfileId: string | undefined): MatchPreparationDraft {
  if (tacticProfileId !== undefined) return changedDraft(draft, { selectedTacticProfileId: tacticProfileId });
  return {
    selectedFormationId: draft.selectedFormationId,
    tacticalBoardDraft: draft.tacticalBoardDraft,
    selectedPlayerIdsBySlot: draft.selectedPlayerIdsBySlot,
    selectedBenchPlayerIdsBySlot: draft.selectedBenchPlayerIdsBySlot,
    isSaved: false,
  };
}

/** Moves one board slot while retaining normalized role-zone constraints. */
export function moveMatchPreparationBoardSlot(draft: MatchPreparationDraft, slotKey: string, nx: number, ny: number): MatchPreparationDraft {
  return changedDraft(draft, { tacticalBoardDraft: moveTacticalBoardSlot(draft.tacticalBoardDraft, slotKey, nx, ny) });
}

/** Changes one board role while retaining current assignment. */
export function changeMatchPreparationBoardSlotRole(draft: MatchPreparationDraft, slotKey: string, role: TacticalBoardRoleCode): MatchPreparationDraft {
  return changedDraft(draft, { tacticalBoardDraft: changeTacticalBoardSlotRole(draft.tacticalBoardDraft, slotKey, role) });
}

/** Clears one XI assignment without changing slot geometry. */
export function clearMatchPreparationBoardSlot(draft: MatchPreparationDraft, slotKey: string): MatchPreparationDraft {
  const tacticalBoardDraft = clearTacticalBoardSlot(draft.tacticalBoardDraft, slotKey);
  return changedDraft(draft, { tacticalBoardDraft, selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft) });
}

/** Applies only an explicit manager-requested auto/fill/clear command. */
export function applyMatchPreparationSelectionAction(
  career: WebCareerState,
  draft: MatchPreparationDraft,
  action: MatchPreparationSelectionAction,
): MatchPreparationDraft {
  if (action === "clear") {
    return changedDraft(draft, { tacticalBoardDraft: createTacticalBoardDraft(draft.selectedFormationId), selectedPlayerIdsBySlot: {}, selectedBenchPlayerIdsBySlot: {} });
  }
  const playerOptions = buildCareerPlayerOptions(career);
  const formation = getFormation(draft.selectedFormationId);
  let tacticalBoardDraft = draft.tacticalBoardDraft;
  const bench = { ...draft.selectedBenchPlayerIdsBySlot };
  const used = new Set<string>([...Object.values(draft.selectedPlayerIdsBySlot), ...Object.values(bench)]);

  for (const slot of formation.slots) {
    if (tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft)[slot.slotKey] !== undefined) continue;
    const player = orderPlayerOptionsForLineupSlot(slot.slotKey, playerOptions).find((candidate) => !used.has(candidate.playerId));
    if (player !== undefined) {
      tacticalBoardDraft = assignTacticalBoardPlayer(tacticalBoardDraft, slot.slotKey, player.playerId);
      used.add(player.playerId);
    }
  }
  fillBench(bench, playerOptions, used);
  return changedDraft(draft, { tacticalBoardDraft, selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft), selectedBenchPlayerIdsBySlot: bench });
}

/** Produces complete structured domain input only when the current view is valid. */
export function buildDurableMatchPreparation(career: WebCareerState, draft: MatchPreparationDraft): DurableMatchPreparation | undefined {
  if (buildMatchPreparationView(career, draft).saveAction.status !== "available") return undefined;
  const tacticProfile = MATCH_PREPARATION_TACTIC_PROFILES.find((profile) => profile.tacticProfileId === draft.selectedTacticProfileId);
  const nextFixture = findNextCareerFixture(career);
  if (tacticProfile === undefined || nextFixture.status !== "found") return undefined;

  return {
    selectedClubId: career.selectedClubId,
    targetFixtureId: nextFixture.fixture.id,
    selectedLineup: {
      clubId: career.selectedClubId,
      slots: draft.tacticalBoardDraft.slots.map((slot) => ({
        slotKey: slot.slotId,
        playerId: requiredPlayerId(slot.slotId, slot.playerId),
        roleKey: slot.canonicalRole,
      })),
    },
    tactic: { ...tacticProfile.values } as NonNullable<DurableMatchPreparation["tactic"]>,
    baseFormationId: draft.tacticalBoardDraft.baseFormationId,
    boardSlots: draft.tacticalBoardDraft.slots.map((slot) => ({ slotKey: slot.slotId, nx: slot.nx, ny: slot.ny, roleKey: slot.role })),
    benchSlots: matchPreparationBenchSlotKeys().map((slotKey) => ({ slotKey, playerId: requiredPlayerId(slotKey, draft.selectedBenchPlayerIdsBySlot[slotKey]) })),
    updatedAt: career.gameState.calendar.currentDate,
  };
}

/** Ordered stable substitute keys shared by read, edit, and persistence paths. */
export function matchPreparationBenchSlotKeys(): readonly string[] {
  return BENCH_SLOT_KEYS.map((key) => `bench:${key}`);
}

function buildCareerPlayerOptions(career: WebCareerState): readonly CareerMatchPreparationPlayerOptionInput[] {
  const club = requiredSelectedClub(career);
  return club.playerIds.flatMap((playerId, index) => {
    const player = career.gameState.players[playerId];
    if (player === undefined) return [];
    const dynamic = career.gameState.playerStates[playerId];
    const positionKey = player.naturalPositions[0];
    return [{
      playerId,
      name: `${player.firstName} ${player.lastName}`,
      roleKey: broadRole(player.primaryRole),
      ...(positionKey === undefined ? {} : { positionKey }),
      ...(dynamic === undefined ? {} : { fitness: dynamic.fitness }),
      currentAbility: currentRoleStrength(player),
      number: index + 1,
    } as CareerMatchPreparationPlayerOptionInput];
  });
}

function fillBench(selected: Record<string, string>, players: readonly CareerMatchPreparationPlayerOptionInput[], used: Set<string>): void {
  const selectedPlayerIds = new Set(Object.values(selected));
  const hasGoalkeeper = players.some((player) => player.roleKey === "goalkeeper" && selectedPlayerIds.has(player.playerId));
  if (!hasGoalkeeper) {
    const goalkeeper = players
      .filter((player) => player.roleKey === "goalkeeper" && !used.has(player.playerId))
      .sort(compareBenchPlayers)[0];
    const firstEmptySlot = matchPreparationBenchSlotKeys().find((slotKey) => selected[slotKey] === undefined);
    if (goalkeeper !== undefined && firstEmptySlot !== undefined) {
      selected[firstEmptySlot] = goalkeeper.playerId;
      used.add(goalkeeper.playerId);
    }
  }

  for (const slotKey of matchPreparationBenchSlotKeys()) {
    if (selected[slotKey] !== undefined) continue;
    const candidate = [...players].filter((player) => !used.has(player.playerId)).sort(compareBenchPlayers)[0];
    if (candidate === undefined) break;
    selected[slotKey] = candidate.playerId;
    used.add(candidate.playerId);
  }
}

function compareBenchPlayers(left: CareerMatchPreparationPlayerOptionInput, right: CareerMatchPreparationPlayerOptionInput): number {
  return (right.currentAbility ?? 0) - (left.currentAbility ?? 0) || (right.fitness ?? 0) - (left.fitness ?? 0) || comparePlayerOptionsByPosition(left, right);
}

function removePlayerFromSelection(selection: Readonly<Record<string, string>>, playerId: string | undefined): Readonly<Record<string, string>> {
  if (playerId === undefined) return selection;
  return Object.fromEntries(Object.entries(selection).filter(([, selectedPlayerId]) => selectedPlayerId !== playerId));
}

function changedDraft(draft: MatchPreparationDraft, changes: Partial<MatchPreparationDraft>): MatchPreparationDraft {
  return { ...draft, ...changes, isSaved: false };
}

/** Produces a stable comparison shape without transient menu or drag state. */
function preparationDraftFingerprint(draft: MatchPreparationDraft): string {
  return JSON.stringify({
    formationId: draft.selectedFormationId,
    slots: draft.tacticalBoardDraft.slots.map((slot) => [
      slot.slotId,
      slot.nx,
      slot.ny,
      slot.role,
      slot.playerId ?? null,
    ]),
    bench: Object.entries(draft.selectedBenchPlayerIdsBySlot)
      .sort(([left], [right]) => left.localeCompare(right)),
    tacticProfileId: draft.selectedTacticProfileId ?? null,
  });
}

function formationIdOrDefault(value: string | undefined): CareerMatchPreparationFormationId {
  return CAREER_MATCH_PREPARATION_FORMATIONS.some((formation) => formation.formationId === value)
    ? value as CareerMatchPreparationFormationId
    : DEFAULT_FORMATION_ID;
}

function getFormation(id: CareerMatchPreparationFormationId): CareerMatchPreparationFormationInput {
  const formation = CAREER_MATCH_PREPARATION_FORMATIONS.find((candidate) => candidate.formationId === id);
  if (formation === undefined) throw new Error(`Unsupported match preparation formation: ${id}`);
  return formation;
}

function requiredSelectedClub(career: WebCareerState): WebCareerState["gameState"]["clubs"][keyof WebCareerState["gameState"]["clubs"]] {
  const club = career.gameState.clubs[career.selectedClubId];
  if (club === undefined) throw new Error(`Selected career club is missing: ${career.selectedClubId}`);
  return club;
}

function clubInput(career: WebCareerState, clubId: string): { readonly clubId: string; readonly name: string } {
  const club = career.gameState.clubs[clubId as keyof typeof career.gameState.clubs];
  if (club === undefined) throw new Error(`Fixture club is missing: ${clubId}`);
  return { clubId: club.id, name: club.name };
}

function profileIdForTactic(tactic: DurableMatchPreparation["tactic"] | undefined): string | undefined {
  return MATCH_PREPARATION_TACTIC_PROFILES.find((profile) => tactic !== undefined && Object.entries(profile.values).every(([key, value]) => tactic[key as keyof typeof tactic] === value))?.tacticProfileId;
}

function isTacticalBoardRoleCode(value: string): value is TacticalBoardRoleCode {
  return (TACTICAL_BOARD_ROLE_CODES as readonly string[]).includes(value);
}

function requiredPlayerId(slotKey: string, playerId: string | null | undefined): NonNullable<DurableMatchPreparation["selectedLineup"]>["slots"][number]["playerId"] {
  if (playerId === undefined || playerId === null) throw new Error(`Complete preparation is missing player: ${slotKey}`);
  return playerId as NonNullable<DurableMatchPreparation["selectedLineup"]>["slots"][number]["playerId"];
}

function broadRole(role: string | undefined): string {
  if (role === "goalkeeper") return "goalkeeper";
  if (role === "center_back" || role === "full_back" || role === "wing_back") return "defender";
  if (role === "striker") return "attacker";
  return "midfielder";
}

/** Projects canonical role ability onto the existing `0..100` web strength scale. */
function currentRoleStrength(
  player: WebCareerState["gameState"]["players"][keyof WebCareerState["gameState"]["players"]],
): number {
  return Math.round(summarizePlayerDevelopmentAbilities(player).currentAbility * 5);
}
