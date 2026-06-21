import {
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
  LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM,
  LINEUP_DEMO_PROFILE_PRO01_ROTATED,
  type LineupDemoProfileKey,
  type SetupDemoProfileKey,
} from "../simulate-season/profile-keys.ts";
import type { CliCareerState, CliGameState, ClubId, PlayerId } from "./types.ts";

const CAREER_LINEUP_SIZE = 11;

type CareerMatchPreparation = NonNullable<CliCareerState["matchPreparation"]>;
type CliSelectedLineup = NonNullable<CareerMatchPreparation["selectedLineup"]>;
type CliTacticSetup = NonNullable<CareerMatchPreparation["tactic"]>;

/** One deterministic replacement made by a career lineup demo profile. */
export interface CareerLineupDemoPlayerChange {
  /** Stable selected-lineup slot key changed by the profile. */
  readonly slotKey: string;
  /** Previous first-team player in this slot. */
  readonly fromPlayerId: PlayerId;
  /** Replacement selected by the demo profile. */
  readonly toPlayerId: PlayerId;
  /** Role key preserved for this slot. */
  readonly roleKey: string;
}

/** Result of saving one explicit lineup choice into a career state. */
export interface SaveCareerLineupDemoResult {
  /** Updated career state ready to be persisted by the CLI storage adapter. */
  readonly careerState: CliCareerState;
  /** Profile key saved by the manager-facing CLI command. */
  readonly profileKey: LineupDemoProfileKey;
  /** Club receiving the saved lineup. */
  readonly clubId: ClubId;
  /** Next selected-club fixture, when the career has one. */
  readonly nextFixture: CliGameState["fixtures"][CliGameState["fixtureIds"][number]] | undefined;
  /** Saved selected lineup. */
  readonly selectedLineup: CliSelectedLineup;
  /** Changes made by the demo profile compared with the first-team lineup. */
  readonly playerChanges: readonly CareerLineupDemoPlayerChange[];
}

/** Result of saving one explicit tactic choice into a career state. */
export interface SaveCareerTacticDemoResult {
  /** Updated career state ready to be persisted by the CLI storage adapter. */
  readonly careerState: CliCareerState;
  /** Profile key saved by the manager-facing CLI command. */
  readonly profileKey: SetupDemoProfileKey;
  /** Club receiving the saved tactic. */
  readonly clubId: ClubId;
  /** Next selected-club fixture, when the career has one. */
  readonly nextFixture: CliGameState["fixtures"][CliGameState["fixtureIds"][number]] | undefined;
  /** Saved tactic values. */
  readonly tactic: CliTacticSetup;
}

/**
 * Saves a deterministic manager-selected lineup demo into the career state.
 *
 * The helper does not infer a best XI. It only maps an explicit demo profile to
 * player IDs already present in the selected club roster, then asks the domain
 * career-state contract to validate ownership and lineup ambiguity.
 */
export function saveCareerLineupDemo(
  careerState: CliCareerState,
  profileKey: LineupDemoProfileKey,
): SaveCareerLineupDemoResult {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];

  if (selectedClub === undefined) {
    throw new Error(`Cannot save lineup without selected club: ${careerState.selectedClubId}`);
  }

  const firstTeamLineup = buildFirstTeamSelectedLineup(careerState.selectedClubId, selectedClub.playerIds);
  const nextFixture = findNextSelectedClubFixture(careerState);
  const { selectedLineup, playerChanges } = applyLineupDemoProfile(firstTeamLineup, selectedClub.playerIds, profileKey);
  const updatedCareerState = {
    ...careerState,
    matchPreparation: {
      selectedClubId: careerState.selectedClubId,
      ...(nextFixture === undefined ? {} : { targetFixtureId: nextFixture.id }),
      selectedLineup,
      ...(careerState.matchPreparation?.tactic === undefined ? {} : { tactic: careerState.matchPreparation.tactic }),
      updatedAt: careerState.gameState.calendar.currentDate,
    },
  } as CliCareerState;

  return {
    careerState: updatedCareerState,
    profileKey,
    clubId: careerState.selectedClubId,
    nextFixture,
    selectedLineup,
    playerChanges,
  };
}

/**
 * Saves a deterministic manager-selected tactic demo into the career state.
 *
 * This persists only the pre-match tactic choice. It does not create automatic
 * tactical switching, extra tactic slots, or opponent-specific advice.
 */
export function saveCareerTacticDemo(
  careerState: CliCareerState,
  profileKey: SetupDemoProfileKey,
): SaveCareerTacticDemoResult {
  const selectedClub = careerState.gameState.clubs[careerState.selectedClubId];

  if (selectedClub === undefined) {
    throw new Error(`Cannot save tactic without selected club: ${careerState.selectedClubId}`);
  }

  const nextFixture = findNextSelectedClubFixture(careerState);
  const targetFixtureId = careerState.matchPreparation?.targetFixtureId ?? nextFixture?.id;
  const tactic = tacticForProfile(profileKey);
  const updatedCareerState = {
    ...careerState,
    matchPreparation: {
      selectedClubId: careerState.selectedClubId,
      ...(targetFixtureId === undefined ? {} : { targetFixtureId }),
      ...(careerState.matchPreparation?.selectedLineup === undefined
        ? {}
        : { selectedLineup: careerState.matchPreparation.selectedLineup }),
      tactic,
      updatedAt: careerState.gameState.calendar.currentDate,
    },
  } as CliCareerState;

  return {
    careerState: updatedCareerState,
    profileKey,
    clubId: careerState.selectedClubId,
    nextFixture,
    tactic,
  };
}

function applyLineupDemoProfile(
  firstTeamLineup: CliSelectedLineup,
  rosterPlayerIds: readonly PlayerId[],
  profileKey: LineupDemoProfileKey,
): {
  readonly selectedLineup: CliSelectedLineup;
  readonly playerChanges: readonly CareerLineupDemoPlayerChange[];
} {
  switch (profileKey) {
    case LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM:
      return { selectedLineup: firstTeamLineup, playerChanges: [] };

    case LINEUP_DEMO_PROFILE_PRO01_ROTATED:
      return buildRotatedLineup(firstTeamLineup, rosterPlayerIds);
  }
}

function tacticForProfile(profileKey: SetupDemoProfileKey): CliTacticSetup {
  switch (profileKey) {
    case DEMO_SETUP_PROFILE_PRO01_BALANCED:
      return {
        mentality: "balanced",
        pressing: 0.5,
        directness: 0.5,
        width: 0.5,
        risk: 0.5,
      };

    case DEMO_SETUP_PROFILE_PRO01_ATTACKING:
      return {
        mentality: "attacking",
        pressing: 0.85,
        directness: 0.75,
        width: 0.8,
        risk: 0.7,
      };

    case DEMO_SETUP_PROFILE_PRO01_DEFENSIVE:
      return {
        mentality: "defensive",
        pressing: 0.35,
        directness: 0.3,
        width: 0.4,
        risk: 0.2,
      };
  }
}

function buildFirstTeamSelectedLineup(clubId: ClubId, rosterPlayerIds: readonly PlayerId[]): CliSelectedLineup {
  const slots: CliSelectedLineup["slots"] = rosterPlayerIds.slice(0, CAREER_LINEUP_SIZE).map((playerId, index) => {
    const slotNumber = index + 1;

    return {
      slotKey: slotKey(slotNumber),
      playerId,
      roleKey: roleKeyForSlot(slotNumber),
    };
  });

  return {
    clubId,
    slots,
  };
}

function buildRotatedLineup(
  firstTeamLineup: CliSelectedLineup,
  rosterPlayerIds: readonly PlayerId[],
): {
  readonly selectedLineup: CliSelectedLineup;
  readonly playerChanges: readonly CareerLineupDemoPlayerChange[];
} {
  const replacementBySlotKey: Readonly<Record<string, PlayerId | undefined>> = {
    "slot:01": rosterPlayerIds[11],
    "slot:05": rosterPlayerIds[12],
    "slot:08": rosterPlayerIds[14],
    "slot:11": rosterPlayerIds[15],
  };
  const playerChanges: CareerLineupDemoPlayerChange[] = [];
  const slots = firstTeamLineup.slots.map((slot) => {
    const replacementPlayerId = replacementBySlotKey[slot.slotKey];

    if (replacementPlayerId === undefined) {
      return slot;
    }

    playerChanges.push({
      slotKey: slot.slotKey,
      fromPlayerId: slot.playerId,
      toPlayerId: replacementPlayerId,
      roleKey: slot.roleKey,
    });

    return {
      ...slot,
      playerId: replacementPlayerId,
    };
  });

  return {
    selectedLineup: {
      clubId: firstTeamLineup.clubId,
      slots,
    },
    playerChanges,
  };
}

function findNextSelectedClubFixture(
  careerState: CliCareerState,
): CliGameState["fixtures"][CliGameState["fixtureIds"][number]] | undefined {
  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];

    if (fixture === undefined || fixture.result?.played === true) {
      continue;
    }

    if (fixture.homeClubId === careerState.selectedClubId || fixture.awayClubId === careerState.selectedClubId) {
      return fixture;
    }
  }

  return undefined;
}

function slotKey(slotNumber: number): string {
  return `slot:${String(slotNumber).padStart(2, "0")}`;
}

function roleKeyForSlot(slotNumber: number): string {
  if (slotNumber === 1) {
    return "gk";
  }

  if (slotNumber <= 5) {
    return "defender";
  }

  if (slotNumber <= 9) {
    return "midfielder";
  }

  return "attacker";
}
