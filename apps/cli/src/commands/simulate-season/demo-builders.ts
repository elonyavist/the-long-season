import { createLineupSlot, type CanonicalPlayerRole } from "@game/engine";
import type { FakeLeagueSystem } from "@game/content";
import type {
  LineupSlot,
  MatchTacticalDistributionInput,
  SimulateSeasonFixtureLineupOverride,
  SimulateSeasonSetupOverride,
  simulateSeason,
} from "@game/engine";
import {
  CONDITION_DEMO_PROFILE_PRO01_SEASON,
  DEMO_SETUP_PROFILE_PRO01_ATTACKING,
  DEMO_SETUP_PROFILE_PRO01_BALANCED,
  DEMO_SETUP_PROFILE_PRO01_DEFENSIVE,
  LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM,
  LINEUP_DEMO_PROFILE_PRO01_ROTATED,
  type ConditionDemoProfileKey,
  type LineupDemoProfileKey,
  type SetupDemoProfileKey,
} from "./profile-keys.ts";

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];

/** Player ID type derived from fake content without importing domain directly. */
type PlayerId = FakeLeagueSystem["playerIds"][number];

/** Fixture type derived from the exported season simulation. */
type Fixture = ReturnType<typeof simulateSeason>["fixtures"][number];

/** Fake lineup slot type derived from generated content. */
type FakeLineupSlotForCli = FakeLeagueSystem["lineupsByClubId"][ClubId][number];

/** Match event side marker used by durable fixture report events. */
export type MatchEventSide = "home" | "away";

/**
 * CLI-owned description of the deterministic selected setup demo.
 */
export interface CliSetupDemo {
  /** Stable profile key requested by the user. */
  readonly profileKey: SetupDemoProfileKey;
  /** Club whose setup is overridden. */
  readonly clubId: ClubId;
  /** Tactic setup applied to the selected club. */
  readonly tactic: SimulateSeasonSetupOverride["tactic"];
  /** Role changes applied relative to the generated fake lineup. */
  readonly roleChanges: readonly CliSetupDemoRoleChange[];
  /** Engine input passed through `simulateSeason.setupOverrides`. */
  readonly override: SimulateSeasonSetupOverride;
}

/**
 * CLI-owned manual tactic switch from one setup demo profile to another.
 */
export interface CliManualTacticSwitch {
  /** First minute where the target profile should apply. */
  readonly minute: number;
  /** Target setup demo selected by the caller. */
  readonly targetSetupDemo: CliSetupDemo;
}

/**
 * CLI-owned condition demo for one selected club's season fitness lifecycle.
 */
export interface CliConditionDemo {
  /** Stable profile key requested by the user. */
  readonly profileKey: ConditionDemoProfileKey;
  /** Club whose player condition should be inspected. */
  readonly clubId: ClubId;
  /** Generated fixed lineup inspected by the condition demo. */
  readonly lineup: readonly LineupSlot[];
}

/**
 * CLI-owned selected-lineup demo profile for manual inspection.
 */
export interface CliLineupDemo {
  /** Stable profile key requested by the user. */
  readonly profileKey: LineupDemoProfileKey;
  /** Club whose lineup is being inspected. */
  readonly clubId: ClubId;
  /** Ordered selected starters for this profile. */
  readonly lineup: readonly LineupSlot[];
  /** Differences from the generated first-team lineup. */
  readonly playerChanges: readonly CliLineupDemoPlayerChange[];
}

/**
 * CLI-owned inspection state for applying one lineup profile to one fixture.
 */
export interface CliLineupFixtureInspection {
  /** Selected lineup profile key requested by the user. */
  readonly profileKey: LineupDemoProfileKey;
  /** Selected club controlled by the lineup profile. */
  readonly clubId: ClubId;
  /** Fixture ID string requested by the user. */
  readonly fixtureValue: string;
  /** Ordered starters selected by this profile. */
  readonly lineup: readonly LineupSlot[];
  /** Player changes relative to the first-team lineup. */
  readonly playerChanges: readonly CliLineupDemoPlayerChange[];
  /** Whether the selected club participates in the requested fixture. */
  readonly appliesToFixture: boolean;
  /** Engine override passed only when the selected club plays the fixture. */
  readonly fixtureLineupOverride?: SimulateSeasonFixtureLineupOverride;
}

/**
 * One explicit player replacement rendered by the lineup-demo output.
 */
export interface CliLineupDemoPlayerChange {
  /** Slot changed by the profile. */
  readonly slotId: string;
  /** First-team player originally occupying this slot. */
  readonly fromPlayerId: PlayerId;
  /** Selected replacement player occupying this slot. */
  readonly toPlayerId: PlayerId;
  /** Canonical role preserved for the selected slot. */
  readonly canonicalRole: CanonicalPlayerRole;
}

/**
 * One selected-lineup role change rendered by the CLI inspection output.
 */
export interface CliSetupDemoRoleChange {
  /** Slot key changed by the demo setup. */
  readonly slotKey: string;
  /** Player occupying the changed slot. */
  readonly playerId: PlayerId;
  /** Original generated canonical role. */
  readonly fromCanonicalRole: CanonicalPlayerRole;
  /** Canonical role the demo profile selected. */
  readonly toCanonicalRole: CanonicalPlayerRole;
}

/**
 * Builds one deterministic condition demo from generated fake content.
 */
export function buildConditionDemo(league: FakeLeagueSystem, profileKey: ConditionDemoProfileKey): CliConditionDemo {
  switch (profileKey) {
    case CONDITION_DEMO_PROFILE_PRO01_SEASON: {
      const clubId = league.clubIds[0];

      if (clubId === undefined) {
        throw new Error("Cannot build condition demo without a generated club");
      }

      const lineup = league.lineupsByClubId[clubId];

      if (lineup === undefined) {
        throw new Error(`Cannot build condition demo without a lineup for club: ${clubId}`);
      }

      return {
        profileKey,
        clubId,
        lineup: lineup.map((slot) => createLineupSlot(slot)),
      };
    }
  }
}

/**
 * Builds one deterministic lineup demo from generated fake content.
 */
export function buildLineupDemo(league: FakeLeagueSystem, profileKey: LineupDemoProfileKey): CliLineupDemo {
  const clubId = firstGeneratedClubId(league, "lineup demo");
  const firstTeamLineup = firstGeneratedClubLineup(league, clubId, "lineup demo");

  switch (profileKey) {
    case LINEUP_DEMO_PROFILE_PRO01_FIRST_TEAM:
      return {
        profileKey,
        clubId,
        lineup: firstTeamLineup,
        playerChanges: [],
      };

    case LINEUP_DEMO_PROFILE_PRO01_ROTATED:
      return buildRotatedPro01LineupDemo(league, clubId, firstTeamLineup);
  }
}

/**
 * Builds fixture-scoped inspection data for one manually selected lineup demo.
 */
export function buildLineupFixtureInspection(
  league: FakeLeagueSystem,
  result: { readonly fixtures: readonly Fixture[] },
  fixtureValue: string,
  lineupDemo: CliLineupDemo,
): CliLineupFixtureInspection {
  const fixture = findFixtureByValue(result.fixtures, fixtureValue);

  if (fixture === undefined) {
    throw new Error(`Cannot build lineup fixture inspection for missing fixture: ${fixtureValue}`);
  }

  const appliesToFixture = selectedSetupSideForFixture(fixture, lineupDemo.clubId) !== undefined;

  return {
    profileKey: lineupDemo.profileKey,
    clubId: lineupDemo.clubId,
    fixtureValue,
    lineup: lineupDemo.lineup,
    playerChanges: lineupDemo.playerChanges,
    appliesToFixture,
    ...(appliesToFixture
      ? { fixtureLineupOverride: buildFixtureLineupOverrideForCli(league, fixture, lineupDemo) }
      : {}),
  };
}

/**
 * Builds one deterministic selected setup used for CLI inspection.
 */
export function buildSetupDemo(league: FakeLeagueSystem, profileKey: SetupDemoProfileKey): CliSetupDemo {
  switch (profileKey) {
    case DEMO_SETUP_PROFILE_PRO01_BALANCED:
      return buildPro01SetupDemo(league, {
        profileKey,
        tactic: {
          mentality: "balanced",
          pressing: 0.5,
          directness: 0.5,
          width: 0.5,
          risk: 0.5,
        },
        selectedCanonicalRole: pro01BalancedCanonicalRole,
      });

    case DEMO_SETUP_PROFILE_PRO01_ATTACKING:
      return buildPro01SetupDemo(league, {
        profileKey,
        tactic: {
          mentality: "attacking",
          pressing: 0.85,
          directness: 0.75,
          width: 0.8,
          risk: 0.7,
        },
        selectedCanonicalRole: pro01AttackingCanonicalRole,
      });

    case DEMO_SETUP_PROFILE_PRO01_DEFENSIVE:
      return buildPro01SetupDemo(league, {
        profileKey,
        tactic: {
          mentality: "defensive",
          pressing: 0.35,
          directness: 0.3,
          width: 0.4,
          risk: 0.2,
        },
        selectedCanonicalRole: pro01DefensiveCanonicalRole,
      });
  }
}

/**
 * Finds the side where the selected demo club participates in a fixture.
 */
export function selectedSetupSideForFixture(fixture: Fixture, selectedClubId: ClubId): MatchEventSide | undefined {
  if (fixture.homeClubId === selectedClubId) {
    return "home";
  }

  if (fixture.awayClubId === selectedClubId) {
    return "away";
  }

  return undefined;
}

/**
 * Definition used to build one deterministic CLI setup-demo profile.
 */
interface CliSetupDemoDefinition {
  /** Stable profile key requested by the user. */
  readonly profileKey: SetupDemoProfileKey;
  /** Tactic setup applied by this profile. */
  readonly tactic: SimulateSeasonSetupOverride["tactic"];
  /** Resolves the selected role key for a generated fake lineup slot. */
  readonly selectedCanonicalRole: (slot: LineupSlot) => CanonicalPlayerRole;
}

/**
 * Builds the engine fixture-lineup override for one applicable CLI inspection.
 */
function buildFixtureLineupOverrideForCli(
  league: FakeLeagueSystem,
  fixture: Fixture,
  lineupDemo: CliLineupDemo,
): SimulateSeasonFixtureLineupOverride {
  return {
    fixtureId: fixture.id,
    clubId: lineupDemo.clubId,
    lineup: lineupDemo.lineup,
    requiredLineupSize: lineupDemo.lineup.length,
    players: league.players,
    roleWeights: league.roleWeights,
    playerStates: league.playerStates,
    stateMultiplierCurves: league.stateMultiplierCurves,
  };
}

/**
 * Builds the first rotated PRO01 demo lineup from deterministic reserve players.
 */
function buildRotatedPro01LineupDemo(
  league: FakeLeagueSystem,
  clubId: ClubId,
  firstTeamLineup: readonly LineupSlot[],
): CliLineupDemo {
  const replacementBySlotId: Readonly<Record<string, PlayerId>> = {
    "slot:01": reservePlayerId(league, clubId, "12"),
    "slot:05": reservePlayerId(league, clubId, "13"),
    "slot:08": reservePlayerId(league, clubId, "15"),
    "slot:11": reservePlayerId(league, clubId, "16"),
  };
  const playerChanges: CliLineupDemoPlayerChange[] = [];
  const lineup = firstTeamLineup.map((slot) => {
    const replacementPlayerId = replacementBySlotId[slot.slotId];

    if (replacementPlayerId === undefined) {
      return slot;
    }

    playerChanges.push({
      slotId: slot.slotId,
      fromPlayerId: slot.playerId,
      toPlayerId: replacementPlayerId,
      canonicalRole: slot.canonicalRole,
    });

    return {
      ...slot,
      playerId: replacementPlayerId,
    };
  });

  return {
    profileKey: LINEUP_DEMO_PROFILE_PRO01_ROTATED,
    clubId,
    lineup,
    playerChanges,
  };
}

/**
 * Reads the first generated club ID for deterministic PRO01 demo profiles.
 */
function firstGeneratedClubId(league: FakeLeagueSystem, label: string): ClubId {
  const clubId = league.clubIds[0];

  if (clubId === undefined) {
    throw new Error(`Cannot build ${label} without a generated club`);
  }

  return clubId;
}

/**
 * Reads the generated first-team lineup for one demo club.
 */
function firstGeneratedClubLineup(league: FakeLeagueSystem, clubId: ClubId, label: string): readonly LineupSlot[] {
  const lineup = league.lineupsByClubId[clubId];

  if (lineup === undefined) {
    throw new Error(`Cannot build ${label} without a lineup for club: ${clubId}`);
  }

  return lineup.map((slot) => createLineupSlot(slot));
}

/**
 * Finds one deterministic reserve player by final generated ID suffix.
 */
function reservePlayerId(league: FakeLeagueSystem, clubId: ClubId, suffix: string): PlayerId {
  const club = league.clubsById[clubId];

  if (club === undefined) {
    throw new Error(`Cannot find reserve player without a generated club: ${clubId}`);
  }

  for (const playerId of club.playerIds) {
    if (String(playerId).endsWith(`-${suffix}`)) {
      return playerId;
    }
  }

  throw new Error(`Missing reserve player ${suffix} for club: ${clubId}`);
}

/**
 * Builds a PRO01 demo setup from generated fake content.
 */
function buildPro01SetupDemo(league: FakeLeagueSystem, definition: CliSetupDemoDefinition): CliSetupDemo {
  const clubId = firstGeneratedClubId(league, "setup demo");
  const baseLineup = firstGeneratedClubLineup(league, clubId, "setup demo");

  const roleChanges: CliSetupDemoRoleChange[] = [];
  const selectedSlots = baseLineup.map((slot) => {
    const canonicalRole = definition.selectedCanonicalRole(slot);

    if (slot.canonicalRole !== canonicalRole) {
      roleChanges.push({
        slotKey: slot.slotId,
        playerId: slot.playerId,
        fromCanonicalRole: slot.canonicalRole,
        toCanonicalRole: canonicalRole,
      });
    }

    return {
      slotKey: slot.slotId,
      playerId: slot.playerId,
      canonicalRole,
    };
  });

  return {
    profileKey: definition.profileKey,
    clubId,
    tactic: definition.tactic,
    roleChanges,
    override: {
      clubId,
      lineup: {
        clubId,
        slots: selectedSlots,
      },
      tactic: definition.tactic,
      requiredLineupSize: baseLineup.length,
      players: league.players,
      roleWeights: league.roleWeights,
      playerStates: league.playerStates,
      stateMultiplierCurves: league.stateMultiplierCurves,
    },
  };
}

/**
 * Keeps the generated PRO01 lineup roles unchanged for the balanced demo.
 */
function pro01BalancedCanonicalRole(slot: LineupSlot): CanonicalPlayerRole {
  return slot.canonicalRole;
}

/**
 * Pushes two wide midfield slots into attacking roles for the attacking demo.
 */
function pro01AttackingCanonicalRole(slot: LineupSlot): CanonicalPlayerRole {
  if (slot.slotId === "slot:08" || slot.slotId === "slot:09") {
    return "striker";
  }

  return slot.canonicalRole;
}

/**
 * Pulls both striker slots into midfield roles for the defensive demo.
 */
function pro01DefensiveCanonicalRole(slot: LineupSlot): CanonicalPlayerRole {
  if (slot.slotId === "slot:10" || slot.slotId === "slot:11") {
    return "central_midfielder";
  }

  return slot.canonicalRole;
}

/**
 * Finds one fixture by its string ID value.
 */
function findFixtureByValue(fixtures: readonly Fixture[], fixtureValue: string): Fixture | undefined {
  for (const fixture of fixtures) {
    if (String(fixture.id) === fixtureValue) {
      return fixture;
    }
  }

  return undefined;
}
