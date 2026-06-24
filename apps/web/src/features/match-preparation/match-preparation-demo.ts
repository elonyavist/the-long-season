import {
  CAREER_MATCH_PREPARATION_FORMATIONS,
  buildCareerMatchPreparationView,
  type BuildCareerMatchPreparationViewInput,
  type CareerMatchPreparationBenchSlotInput,
  type CareerDashboardPreparationInput,
  type CareerMatchPreparationFormationId,
  type CareerMatchPreparationFormationInput,
  type CareerMatchPreparationFormationSlotInput,
  type CareerMatchPreparationLineupSlotInput,
  type CareerMatchPreparationPlayerOptionInput,
  type CareerMatchPreparationTacticProfileInput,
  type CareerMatchPreparationView,
} from "@game/ui";

import { buildDemoCareerDashboardInput } from "../dashboard/build-demo-career-dashboard";
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
  tacticalBoardSelectedPlayerIdsBySlot,
  type TacticalBoardDraft,
} from "../tactics-board/tactical-board-state";
import type { TacticalBoardRoleCode } from "../tactics-board/tactical-board-types";
import {
  buildTacticalBoardSquadPlayers,
  type TacticalBoardSquadPlayer,
} from "../tactics-board/tactical-board-squad";

/** In-memory browser state for the deterministic match-preparation prototype. */
export interface DemoMatchPreparationState {
  /** Selected formation for the current match plan. */
  readonly selectedFormationId: CareerMatchPreparationFormationId;
  /** Shared tactical-board draft backing the XI selection. */
  readonly tacticalBoardDraft: TacticalBoardDraft;
  /** Player selected for each lineup slot; absent keys mean unresolved slots. */
  readonly selectedPlayerIdsBySlot: Readonly<Record<string, string>>;
  /** Substitute selected for each ordered bench slot; absent keys mean unresolved slots. */
  readonly selectedBenchPlayerIdsBySlot: Readonly<Record<string, string>>;
  /** Selected tactic profile, if the manager has chosen one. */
  readonly selectedTacticProfileId?: string;
  /** Whether the current complete preparation was explicitly saved. */
  readonly isSaved: boolean;
}

/** Result of attempting to save the current demo match preparation. */
export interface SaveDemoMatchPreparationResult {
  /** Updated in-memory state. */
  readonly state: DemoMatchPreparationState;
  /** View derived from the updated state. */
  readonly view: CareerMatchPreparationView;
}

/** Footedness fact used only by the current web match-preparation demo. */
export type DemoMatchPreparationPlayerFoot = "left" | "right";

/** UI-facing player facts that can later map to real career player state. */
export interface DemoMatchPreparationPlayerFact {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Current player age shown in compact squad lists. */
  readonly age: number;
  /** Preferred foot shown as a factual player detail. */
  readonly foot: DemoMatchPreparationPlayerFoot;
}

/** Explicit manager-triggered helper actions for demo match preparation. */
export type DemoMatchPreparationSelectionAction = "auto" | "fill_gaps" | "clear";

const DEMO_DEFAULT_FORMATION_ID: CareerMatchPreparationFormationId = "4-4-2";

const DEMO_BENCH_SLOT_KEYS = ["01", "02", "03", "04", "05", "06", "07", "08"] as const;

const DEMO_PLAYER_OPTIONS = [
  ["player:demo-01", "Davide Valentini", "goalkeeper", "gk", 100, 78],
  ["player:demo-02", "Enrico Magnani", "defender", "rb", 100, 72],
  ["player:demo-03", "Davide Romano", "defender", "cb", 100, 74],
  ["player:demo-04", "Luca Franchi", "defender", "cb", 100, 73],
  ["player:demo-05", "Marko Milosevic", "defender", "lb", 100, 71],
  ["player:demo-06", "Matteo Pavan", "midfielder", "cm", 100, 90],
  ["player:demo-07", "Giorgio Mazza", "midfielder", "cm", 100, 75],
  ["player:demo-08", "Enrico Rosati", "midfielder", "am", 100, 61],
  ["player:demo-09", "Dario Kovac", "midfielder", "am", 100, 65],
  ["player:demo-10", "Nico Rinaldi", "attacker", "st", 100, 79],
  ["player:demo-11", "Nico Morandi", "attacker", "st", 100, 76],
  ["player:demo-12", "Marco Esposito", "goalkeeper", "gk", 100, 66],
  ["player:demo-13", "Andrea Sala", "defender", "cb", 100, 69],
  ["player:demo-14", "Giorgio Bosco", "defender", "lb", 100, 64],
  ["player:demo-15", "Theo Rousseau", "midfielder", "cm", 100, 68],
  ["player:demo-16", "Ivan Radic", "attacker", "st", 100, 70],
  ["player:demo-17", "Kaito Tanaka", "midfielder", "wide", 100, 63],
  ["player:demo-18", "Nico Pavoni", "defender", "rb", 100, 67],
  ["player:demo-19", "Matteo Guerra", "midfielder", "dm", 100, 77],
  ["player:demo-20", "Enrico Bonacina", "attacker", "winger", 100, 74],
  ["player:demo-21", "Dario Ricci", "defender", "cb", 100, 62],
  ["player:demo-22", "Luca Moretti", "midfielder", "cm", 100, 58],
] as const;

const DEMO_PLAYER_FACTS = new Map<string, DemoMatchPreparationPlayerFact>([
  ["player:demo-01", { playerId: "player:demo-01", age: 28, foot: "right" }],
  ["player:demo-02", { playerId: "player:demo-02", age: 25, foot: "right" }],
  ["player:demo-03", { playerId: "player:demo-03", age: 27, foot: "right" }],
  ["player:demo-04", { playerId: "player:demo-04", age: 23, foot: "left" }],
  ["player:demo-05", { playerId: "player:demo-05", age: 29, foot: "left" }],
  ["player:demo-06", { playerId: "player:demo-06", age: 26, foot: "right" }],
  ["player:demo-07", { playerId: "player:demo-07", age: 24, foot: "left" }],
  ["player:demo-08", { playerId: "player:demo-08", age: 22, foot: "right" }],
  ["player:demo-09", { playerId: "player:demo-09", age: 30, foot: "right" }],
  ["player:demo-10", { playerId: "player:demo-10", age: 25, foot: "right" }],
  ["player:demo-11", { playerId: "player:demo-11", age: 21, foot: "left" }],
  ["player:demo-12", { playerId: "player:demo-12", age: 20, foot: "left" }],
  ["player:demo-13", { playerId: "player:demo-13", age: 24, foot: "right" }],
  ["player:demo-14", { playerId: "player:demo-14", age: 19, foot: "left" }],
  ["player:demo-15", { playerId: "player:demo-15", age: 23, foot: "right" }],
  ["player:demo-16", { playerId: "player:demo-16", age: 22, foot: "right" }],
  ["player:demo-17", { playerId: "player:demo-17", age: 20, foot: "left" }],
  ["player:demo-18", { playerId: "player:demo-18", age: 31, foot: "right" }],
  ["player:demo-19", { playerId: "player:demo-19", age: 27, foot: "right" }],
  ["player:demo-20", { playerId: "player:demo-20", age: 24, foot: "left" }],
  ["player:demo-21", { playerId: "player:demo-21", age: 32, foot: "right" }],
  ["player:demo-22", { playerId: "player:demo-22", age: 18, foot: "left" }],
]);

const DEMO_TACTIC_PROFILES: readonly CareerMatchPreparationTacticProfileInput[] = [
  {
    tacticProfileId: "tactic:balanced",
    labelKey: "career.matchPreparation.tactic.balanced",
    values: {
      mentality: "balanced",
      pressing: 0.5,
      directness: 0.5,
      width: 0.5,
      risk: 0.5,
    },
  },
  {
    tacticProfileId: "tactic:attacking",
    labelKey: "career.matchPreparation.tactic.attacking",
    values: {
      mentality: "attacking",
      pressing: 0.85,
      directness: 0.75,
      width: 0.8,
      risk: 0.7,
    },
  },
  {
    tacticProfileId: "tactic:defensive",
    labelKey: "career.matchPreparation.tactic.defensive",
    values: {
      mentality: "defensive",
      pressing: 0.35,
      directness: 0.3,
      width: 0.4,
      risk: 0.2,
    },
  },
];

/** Creates the initial incomplete state shown when a demo career starts. */
export function createInitialDemoMatchPreparationState(): DemoMatchPreparationState {
  const tacticalBoardDraft = createTacticalBoardDraft(DEMO_DEFAULT_FORMATION_ID);

  return {
    selectedFormationId: DEMO_DEFAULT_FORMATION_ID,
    tacticalBoardDraft,
    selectedPlayerIdsBySlot: {},
    selectedBenchPlayerIdsBySlot: {},
    isSaved: false,
  };
}

/** Returns the available formation IDs for web controls and tests. */
export function demoMatchPreparationFormationIds(): readonly CareerMatchPreparationFormationId[] {
  return CAREER_MATCH_PREPARATION_FORMATIONS.map((formation) => formation.formationId);
}

/** Returns the stable lineup slot keys for the selected demo formation. */
export function demoMatchPreparationSlotKeys(state?: DemoMatchPreparationState): readonly string[] {
  return getDemoFormation(state?.selectedFormationId ?? DEMO_DEFAULT_FORMATION_ID).slots.map((slot) => slot.slotKey);
}

/** Returns the stable ordered substitute slot keys used by the demo bench. */
export function demoMatchPreparationBenchSlotKeys(): readonly string[] {
  return DEMO_BENCH_SLOT_KEYS.map((slotKey) => `bench:${slotKey}`);
}

/** Returns optional demo player facts for web-only presentation details. */
export function getDemoMatchPreparationPlayerFact(
  playerId: string,
): DemoMatchPreparationPlayerFact | undefined {
  return DEMO_PLAYER_FACTS.get(playerId);
}

/** Returns the current demo squad mapped to the shared tactical-board player shape. */
export function buildDemoTacticalBoardSquadPlayers(): readonly TacticalBoardSquadPlayer[] {
  return buildTacticalBoardSquadPlayers(buildDemoPlayerOptions());
}

/** Selects or clears one player in one demo lineup slot. */
export function selectDemoMatchPreparationPlayer(
  state: DemoMatchPreparationState,
  slotKey: string,
  playerId: string | undefined,
): DemoMatchPreparationState {
  const tacticalBoardDraft = assignTacticalBoardPlayer(state.tacticalBoardDraft, slotKey, playerId);

  return {
    ...state,
    tacticalBoardDraft,
    selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft),
    isSaved: false,
  };
}

/** Moves one tactical-board slot while preserving selected players. */
export function moveDemoMatchPreparationBoardSlot(
  state: DemoMatchPreparationState,
  slotKey: string,
  nx: number,
  ny: number,
): DemoMatchPreparationState {
  return {
    ...state,
    tacticalBoardDraft: moveTacticalBoardSlot(state.tacticalBoardDraft, slotKey, nx, ny),
    isSaved: false,
  };
}

/** Changes one tactical-board slot role and keeps the lineup assignment. */
export function changeDemoMatchPreparationBoardSlotRole(
  state: DemoMatchPreparationState,
  slotKey: string,
  role: TacticalBoardRoleCode,
): DemoMatchPreparationState {
  const tacticalBoardDraft = changeTacticalBoardSlotRole(state.tacticalBoardDraft, slotKey, role);

  return {
    ...state,
    tacticalBoardDraft,
    selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft),
    isSaved: false,
  };
}

/** Clears one tactical-board assignment while preserving the slot role and position. */
export function clearDemoMatchPreparationBoardSlot(
  state: DemoMatchPreparationState,
  slotKey: string,
): DemoMatchPreparationState {
  const tacticalBoardDraft = clearTacticalBoardSlot(state.tacticalBoardDraft, slotKey);

  return {
    ...state,
    tacticalBoardDraft,
    selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft),
    isSaved: false,
  };
}

/** Selects a formation and keeps only player selections whose slot still exists. */
export function selectDemoMatchPreparationFormation(
  state: DemoMatchPreparationState,
  formationId: CareerMatchPreparationFormationId,
): DemoMatchPreparationState {
  if (state.selectedFormationId === formationId) {
    return state;
  }

  const tacticalBoardDraft = loadTacticalBoardBaseFormation(state.tacticalBoardDraft, formationId);

  return {
    ...state,
    selectedFormationId: formationId,
    tacticalBoardDraft,
    selectedPlayerIdsBySlot: tacticalBoardSelectedPlayerIdsBySlot(tacticalBoardDraft),
    isSaved: false,
  };
}

/** Selects or clears one player in one ordered demo bench slot. */
export function selectDemoMatchPreparationBenchPlayer(
  state: DemoMatchPreparationState,
  benchSlotKey: string,
  playerId: string | undefined,
): DemoMatchPreparationState {
  const nextSelectedPlayerIds = { ...state.selectedBenchPlayerIdsBySlot };

  if (playerId === undefined || playerId.length === 0) {
    delete nextSelectedPlayerIds[benchSlotKey];
  } else {
    nextSelectedPlayerIds[benchSlotKey] = playerId;
  }

  return {
    ...state,
    selectedBenchPlayerIdsBySlot: nextSelectedPlayerIds,
    isSaved: false,
  };
}

/** Selects or clears the tactic profile for the demo preparation. */
export function selectDemoMatchPreparationTactic(
  state: DemoMatchPreparationState,
  tacticProfileId: string | undefined,
): DemoMatchPreparationState {
  const { selectedTacticProfileId: _currentTacticProfileId, ...stateWithoutTactic } = state;

  return {
    ...stateWithoutTactic,
    ...(tacticProfileId === undefined || tacticProfileId.length === 0 ? {} : { selectedTacticProfileId: tacticProfileId }),
    isSaved: false,
  };
}

/** Applies one explicit manager-triggered lineup/bench helper action. */
export function applyDemoMatchPreparationSelectionAction(
  state: DemoMatchPreparationState,
  action: DemoMatchPreparationSelectionAction,
): DemoMatchPreparationState {
  if (action === "clear") {
    return clearDemoMatchPreparationSelection(state);
  }

  const shouldPreserveCurrentSelection = action === "fill_gaps";
  const selectedPlayerIdsBySlot = shouldPreserveCurrentSelection ? { ...state.selectedPlayerIdsBySlot } : {};
  const selectedBenchPlayerIdsBySlot = shouldPreserveCurrentSelection ? { ...state.selectedBenchPlayerIdsBySlot } : {};
  const usedPlayerIds = new Set([...Object.values(selectedPlayerIdsBySlot), ...Object.values(selectedBenchPlayerIdsBySlot)]);
  const formation = getDemoFormation(state.selectedFormationId);
  const playerOptions = buildDemoPlayerOptions();

  for (const slot of formation.slots) {
    if (selectedPlayerIdsBySlot[slot.slotKey] !== undefined) {
      continue;
    }

    const selectedPlayer = bestAvailablePlayerForLineupSlot(slot, playerOptions, usedPlayerIds);

    if (selectedPlayer !== undefined) {
      selectedPlayerIdsBySlot[slot.slotKey] = selectedPlayer.playerId;
      usedPlayerIds.add(selectedPlayer.playerId);
    }
  }

  fillDemoBenchSlots(selectedBenchPlayerIdsBySlot, playerOptions, usedPlayerIds);
  const tacticalBoardDraft = createTacticalBoardDraft(state.selectedFormationId, selectedPlayerIdsBySlot);

  return {
    ...state,
    tacticalBoardDraft,
    selectedPlayerIdsBySlot,
    selectedBenchPlayerIdsBySlot,
    isSaved: false,
  };
}

/** Attempts to save the preparation only when the derived view is valid. */
export function saveDemoMatchPreparation(state: DemoMatchPreparationState): SaveDemoMatchPreparationResult {
  const currentView = buildDemoMatchPreparationView(state);
  const nextState =
    currentView.saveAction.status === "available"
      ? {
          ...state,
          isSaved: true,
        }
      : state;

  return {
    state: nextState,
    view: buildDemoMatchPreparationView(nextState),
  };
}

/** Builds the explicit `@game/ui` input for the demo preparation view. */
export function buildDemoMatchPreparationInput(
  state: DemoMatchPreparationState,
): BuildCareerMatchPreparationViewInput {
  const dashboardInput = buildDemoCareerDashboardInput();

  return {
    saveId: dashboardInput.saveId,
    selectedClub: dashboardInput.selectedClub,
    ...(dashboardInput.nextFixture === undefined ? {} : { nextFixture: dashboardInput.nextFixture }),
    formations: CAREER_MATCH_PREPARATION_FORMATIONS,
    selectedFormationId: state.selectedFormationId,
    lineupSlots: buildDemoLineupSlots(state),
    benchSlots: buildDemoBenchSlots(state),
    tacticProfiles: DEMO_TACTIC_PROFILES,
    ...(state.selectedTacticProfileId === undefined ? {} : { selectedTacticProfileId: state.selectedTacticProfileId }),
    isSaved: state.isSaved,
  };
}

/** Builds the structured match-preparation view for the current demo state. */
export function buildDemoMatchPreparationView(state: DemoMatchPreparationState): CareerMatchPreparationView {
  return buildCareerMatchPreparationView(buildDemoMatchPreparationInput(state));
}

/** Converts demo preparation state into dashboard/Continue saved-preparation facts. */
export function buildDemoSavedPreparationInput(
  state: DemoMatchPreparationState,
): CareerDashboardPreparationInput {
  const dashboardInput = buildDemoCareerDashboardInput();
  const targetFixtureId = dashboardInput.nextFixture?.fixtureId;

  return {
    hasSavedLineup: state.isSaved,
    hasSavedTactic: state.isSaved,
    ...(targetFixtureId === undefined ? {} : { targetFixtureId }),
  };
}

/** Returns a complete but unsaved demo state useful for tests and future UI defaults. */
export function createCompleteUnsavedDemoMatchPreparationState(): DemoMatchPreparationState {
  const stateWithLineup = demoMatchPreparationSlotKeys().reduce<DemoMatchPreparationState>(
    (state, slotKey, index) => selectDemoMatchPreparationPlayer(state, slotKey, DEMO_PLAYER_OPTIONS[index]?.[0]),
    selectDemoMatchPreparationTactic(createInitialDemoMatchPreparationState(), "tactic:balanced"),
  );

  return demoMatchPreparationBenchSlotKeys().reduce<DemoMatchPreparationState>(
    (state, benchSlotKey, index) =>
      selectDemoMatchPreparationBenchPlayer(state, benchSlotKey, DEMO_PLAYER_OPTIONS[index + 11]?.[0]),
    stateWithLineup,
  );
}

/** Builds lineup slot inputs from current in-memory selected player IDs. */
function buildDemoLineupSlots(
  state: DemoMatchPreparationState,
): readonly CareerMatchPreparationLineupSlotInput[] {
  return getDemoFormation(state.selectedFormationId).slots.map((slot) => ({
    slotKey: slot.slotKey,
    labelKey: slot.labelKey,
    roleKey: slot.roleKey,
    ...(state.selectedPlayerIdsBySlot[slot.slotKey] === undefined
      ? {}
      : { selectedPlayerId: state.selectedPlayerIdsBySlot[slot.slotKey] }),
    playerOptions: buildDemoPlayerOptions(),
  }));
}

/** Builds ordered substitute slot inputs once bench state is active. */
function buildDemoBenchSlots(
  state: DemoMatchPreparationState,
): readonly CareerMatchPreparationBenchSlotInput[] {
  return DEMO_BENCH_SLOT_KEYS.map((slotKey) => {
    const benchSlotKey = `bench:${slotKey}`;
    const selectedPlayerId = state.selectedBenchPlayerIdsBySlot[benchSlotKey];

    return {
      slotKey: benchSlotKey,
      labelKey: `career.matchPreparation.benchSlot.${slotKey}`,
      ...(selectedPlayerId === undefined ? {} : { selectedPlayerId }),
      playerOptions: buildDemoPlayerOptions(),
    };
  });
}

/** Builds the shared demo player option list for lineup and bench controls. */
function buildDemoPlayerOptions(): CareerMatchPreparationLineupSlotInput["playerOptions"] {
  return DEMO_PLAYER_OPTIONS.map(([playerId, name, playerRoleKey, positionKey, fitness, currentAbility]) => ({
    playerId,
    name,
    roleKey: playerRoleKey,
    positionKey,
    fitness,
    currentAbility,
  }));
}

/** Clears only XI and bench selections while preserving formation and tactic. */
function clearDemoMatchPreparationSelection(state: DemoMatchPreparationState): DemoMatchPreparationState {
  return {
    ...state,
    tacticalBoardDraft: createTacticalBoardDraft(state.selectedFormationId),
    selectedPlayerIdsBySlot: {},
    selectedBenchPlayerIdsBySlot: {},
    isSaved: false,
  };
}

function bestAvailablePlayerForLineupSlot(
  slot: CareerMatchPreparationFormationSlotInput,
  playerOptions: readonly CareerMatchPreparationPlayerOptionInput[],
  usedPlayerIds: ReadonlySet<string>,
): CareerMatchPreparationPlayerOptionInput | undefined {
  return orderPlayerOptionsForLineupSlot(slot.slotKey, playerOptions).find((player) => !usedPlayerIds.has(player.playerId));
}

function fillDemoBenchSlots(
  selectedBenchPlayerIdsBySlot: Record<string, string>,
  playerOptions: readonly CareerMatchPreparationPlayerOptionInput[],
  usedPlayerIds: Set<string>,
): void {
  const missingBenchSlotKeys = demoMatchPreparationBenchSlotKeys().filter(
    (benchSlotKey) => selectedBenchPlayerIdsBySlot[benchSlotKey] === undefined,
  );

  for (const roleKey of ["goalkeeper", "defender", "midfielder", "attacker"]) {
    const nextBenchSlotKey = missingBenchSlotKeys.find((benchSlotKey) => selectedBenchPlayerIdsBySlot[benchSlotKey] === undefined);

    if (nextBenchSlotKey === undefined || benchAlreadyHasRole(selectedBenchPlayerIdsBySlot, playerOptions, roleKey)) {
      continue;
    }

    const player = bestAvailableBenchPlayer(playerOptions, usedPlayerIds, roleKey);

    if (player !== undefined) {
      selectedBenchPlayerIdsBySlot[nextBenchSlotKey] = player.playerId;
      usedPlayerIds.add(player.playerId);
    }
  }

  for (const benchSlotKey of missingBenchSlotKeys) {
    if (selectedBenchPlayerIdsBySlot[benchSlotKey] !== undefined) {
      continue;
    }

    const player = bestAvailableBenchPlayer(playerOptions, usedPlayerIds);

    if (player !== undefined) {
      selectedBenchPlayerIdsBySlot[benchSlotKey] = player.playerId;
      usedPlayerIds.add(player.playerId);
    }
  }
}

function benchAlreadyHasRole(
  selectedBenchPlayerIdsBySlot: Readonly<Record<string, string>>,
  playerOptions: readonly CareerMatchPreparationPlayerOptionInput[],
  roleKey: string,
): boolean {
  const playerById = new Map(playerOptions.map((player) => [player.playerId, player]));

  return Object.values(selectedBenchPlayerIdsBySlot).some((playerId) => playerById.get(playerId)?.roleKey === roleKey);
}

function bestAvailableBenchPlayer(
  playerOptions: readonly CareerMatchPreparationPlayerOptionInput[],
  usedPlayerIds: ReadonlySet<string>,
  roleKey?: string,
): CareerMatchPreparationPlayerOptionInput | undefined {
  const availablePlayers = playerOptions
    .filter((player) => !usedPlayerIds.has(player.playerId))
    .filter((player) => roleKey === undefined || player.roleKey === roleKey);

  return [...availablePlayers].sort(compareBenchPlayers)[0];
}

function compareBenchPlayers(
  left: CareerMatchPreparationPlayerOptionInput,
  right: CareerMatchPreparationPlayerOptionInput,
): number {
  const abilityComparison = (right.currentAbility ?? 0) - (left.currentAbility ?? 0);

  if (abilityComparison !== 0) {
    return abilityComparison;
  }

  const fitnessComparison = (right.fitness ?? 0) - (left.fitness ?? 0);

  if (fitnessComparison !== 0) {
    return fitnessComparison;
  }

  return comparePlayerOptionsByPosition(left, right);
}

/** Returns one formation from the shared UI catalog, falling back to the demo default. */
function getDemoFormation(
  formationId: CareerMatchPreparationFormationId,
): CareerMatchPreparationFormationInput {
  const formation =
    CAREER_MATCH_PREPARATION_FORMATIONS.find((formationOption) => formationOption.formationId === formationId) ??
    CAREER_MATCH_PREPARATION_FORMATIONS[0];

  if (formation === undefined) {
    throw new Error("Demo match preparation requires at least one formation.");
  }

  return formation;
}
