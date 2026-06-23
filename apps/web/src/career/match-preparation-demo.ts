import {
  buildCareerMatchPreparationView,
  type BuildCareerMatchPreparationViewInput,
  type CareerDashboardPreparationInput,
  type CareerMatchPreparationLineupSlotInput,
  type CareerMatchPreparationTacticProfileInput,
  type CareerMatchPreparationView,
} from "@game/ui";

import { buildDemoCareerDashboardInput } from "./build-demo-career-dashboard";

/** In-memory browser state for the deterministic match-preparation prototype. */
export interface DemoMatchPreparationState {
  /** Player selected for each lineup slot; absent keys mean unresolved slots. */
  readonly selectedPlayerIdsBySlot: Readonly<Record<string, string>>;
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

const DEMO_LINEUP_SLOTS = [
  ["gk", "career.matchPreparation.slot.gk", "goalkeeper"],
  ["rb", "career.matchPreparation.slot.rb", "defender"],
  ["cb-right", "career.matchPreparation.slot.cbRight", "defender"],
  ["cb-left", "career.matchPreparation.slot.cbLeft", "defender"],
  ["lb", "career.matchPreparation.slot.lb", "defender"],
  ["cm-right", "career.matchPreparation.slot.cmRight", "midfielder"],
  ["cm-left", "career.matchPreparation.slot.cmLeft", "midfielder"],
  ["am-right", "career.matchPreparation.slot.amRight", "midfielder"],
  ["am-left", "career.matchPreparation.slot.amLeft", "midfielder"],
  ["st-right", "career.matchPreparation.slot.stRight", "attacker"],
  ["st-left", "career.matchPreparation.slot.stLeft", "attacker"],
] as const;

const DEMO_PLAYER_OPTIONS = [
  ["player:demo-01", "Davide Valentini", "goalkeeper", "gk", 100],
  ["player:demo-02", "Enrico Magnani", "defender", "rb", 100],
  ["player:demo-03", "Davide Romano", "defender", "cb", 100],
  ["player:demo-04", "Luca Franchi", "defender", "cb", 100],
  ["player:demo-05", "Marko Milosevic", "defender", "lb", 100],
  ["player:demo-06", "Matteo Pavan", "midfielder", "cm", 100],
  ["player:demo-07", "Giorgio Mazza", "midfielder", "cm", 100],
  ["player:demo-08", "Enrico Rosati", "midfielder", "am", 100],
  ["player:demo-09", "Dario Kovac", "midfielder", "am", 100],
  ["player:demo-10", "Nico Rinaldi", "attacker", "st", 100],
  ["player:demo-11", "Nico Morandi", "attacker", "st", 100],
  ["player:demo-12", "Marco Esposito", "goalkeeper", "gk", 100],
  ["player:demo-13", "Andrea Sala", "defender", "cb", 100],
  ["player:demo-14", "Giorgio Bosco", "defender", "lb", 100],
  ["player:demo-15", "Theo Rousseau", "midfielder", "cm", 100],
  ["player:demo-16", "Ivan Radic", "attacker", "st", 100],
  ["player:demo-17", "Kaito Tanaka", "midfielder", "wide", 100],
  ["player:demo-18", "Nico Pavoni", "defender", "rb", 100],
  ["player:demo-19", "Matteo Guerra", "midfielder", "dm", 100],
  ["player:demo-20", "Enrico Bonacina", "attacker", "winger", 100],
  ["player:demo-21", "Dario Ricci", "defender", "cb", 100],
  ["player:demo-22", "Luca Moretti", "midfielder", "cm", 100],
] as const;

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
  return {
    selectedPlayerIdsBySlot: {},
    isSaved: false,
  };
}

/** Returns the stable lineup slot keys used by the current web prototype. */
export function demoMatchPreparationSlotKeys(): readonly string[] {
  return DEMO_LINEUP_SLOTS.map(([slotKey]) => slotKey);
}

/** Selects or clears one player in one demo lineup slot. */
export function selectDemoMatchPreparationPlayer(
  state: DemoMatchPreparationState,
  slotKey: string,
  playerId: string | undefined,
): DemoMatchPreparationState {
  const nextSelectedPlayerIds = { ...state.selectedPlayerIdsBySlot };

  if (playerId === undefined || playerId.length === 0) {
    delete nextSelectedPlayerIds[slotKey];
  } else {
    nextSelectedPlayerIds[slotKey] = playerId;
  }

  return {
    ...state,
    selectedPlayerIdsBySlot: nextSelectedPlayerIds,
    isSaved: false,
  };
}

/** Selects or clears the tactic profile for the demo preparation. */
export function selectDemoMatchPreparationTactic(
  state: DemoMatchPreparationState,
  tacticProfileId: string | undefined,
): DemoMatchPreparationState {
  return {
    selectedPlayerIdsBySlot: state.selectedPlayerIdsBySlot,
    ...(tacticProfileId === undefined || tacticProfileId.length === 0 ? {} : { selectedTacticProfileId: tacticProfileId }),
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
    lineupSlots: buildDemoLineupSlots(state),
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
  return DEMO_LINEUP_SLOTS.reduce<DemoMatchPreparationState>(
    (state, [slotKey], index) =>
      selectDemoMatchPreparationPlayer(state, slotKey, DEMO_PLAYER_OPTIONS[index]?.[0]),
    selectDemoMatchPreparationTactic(createInitialDemoMatchPreparationState(), "tactic:balanced"),
  );
}

/** Builds lineup slot inputs from current in-memory selected player IDs. */
function buildDemoLineupSlots(
  state: DemoMatchPreparationState,
): readonly CareerMatchPreparationLineupSlotInput[] {
  return DEMO_LINEUP_SLOTS.map(([slotKey, labelKey, roleKey]) => ({
    slotKey,
    labelKey,
    roleKey,
    ...(state.selectedPlayerIdsBySlot[slotKey] === undefined
      ? {}
      : { selectedPlayerId: state.selectedPlayerIdsBySlot[slotKey] }),
    playerOptions: DEMO_PLAYER_OPTIONS.map(([playerId, name, playerRoleKey, positionKey, fitness]) => ({
      playerId,
      name,
      roleKey: playerRoleKey,
      positionKey,
      fitness,
    })),
  }));
}
