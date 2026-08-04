import { createLineupSlot } from "../match-engine/index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  clubId,
  createCareerState,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  type CareerState,
  type Player,
  type PlayerFixtureParticipationContribution,
  type PlayerId,
} from "@game/domain";

import type { MatchTeamContext, PlayerMatchRatingRow } from "../match-engine/index.ts";
import {
  accrueCommittedFixtureParticipation,
  accrueFixtureParticipationContributions,
  buildFixtureParticipationContributions,
} from "./player-participation.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";


/** Tests for authoritative fixture participation accrual from committed facts. */

test("buildFixtureParticipationContributions records starters, substitutes, and unused bench players", () => {
  const result = buildFixtureParticipationContributions({
    fixtureId: FIXTURE_ID,
    seasonId: SEASON_ID,
    fixtureDate: gameDate(20_000),
    finalMinute: 90,
    sides: [{
      side: "home",
      initialContext: initialHomeContext(),
      finalContext: finalHomeContext(),
      benchPlayerIds: [HOME_SUB, HOME_UNUSED],
    }],
    appliedSubstitutions: [{
      side: "home",
      minute: 45,
      outgoingPlayerId: HOME_STARTER,
      incomingPlayerId: HOME_SUB,
      slotId: "slot:home:field",
      reasonKey: "half_time_manager_decision",
    }],
    playerRatings: ratingsFixture(),
  });

  assert.deepEqual(slimContributions(result.contributions), [
    {
      playerId: HOME_GOALKEEPER,
      clubId: clubId("club:home"),
      started: true,
      substituteAppearance: false,
      minutes: 90,
      rating: 6.5,
      playedRoleMinutes: { goalkeeper: 90 },
    },
    {
      playerId: HOME_STARTER,
      clubId: clubId("club:home"),
      started: true,
      substituteAppearance: false,
      minutes: 45,
      rating: 5.6,
      playedRoleMinutes: { center_back: 45 },
    },
    {
      playerId: HOME_SUB,
      clubId: clubId("club:home"),
      started: false,
      substituteAppearance: true,
      minutes: 45,
      rating: 6.8,
      playedRoleMinutes: { center_back: 45 },
    },
    {
      playerId: HOME_UNUSED,
      clubId: clubId("club:home"),
      started: false,
      substituteAppearance: false,
      minutes: 0,
      rating: undefined,
      playedRoleMinutes: {},
    },
  ]);
});

test("accrueCommittedFixtureParticipation writes committed fixture facts once", () => {
  const careerState = careerStateFixture();
  const accrued = accrueCommittedFixtureParticipation({
    careerState,
    fixtureId: FIXTURE_ID,
    seasonId: SEASON_ID,
    fixtureDate: gameDate(20_000),
    finalMinute: 90,
    sides: [{
      side: "home",
      initialContext: initialHomeContext(),
      finalContext: finalHomeContext(),
      benchPlayerIds: [HOME_SUB, HOME_UNUSED],
    }],
    appliedSubstitutions: [{
      side: "home",
      minute: 45,
      outgoingPlayerId: HOME_STARTER,
      incomingPlayerId: HOME_SUB,
      slotId: "slot:home:field",
      reasonKey: "half_time_manager_decision",
    }],
    playerRatings: ratingsFixture(),
  });

  assert.equal(careerState.playerParticipationLedger, undefined);
  assert.equal(accrued.playerParticipationLedger?.rowKeys.length, 4);

  assert.throws(
    () => accrueCommittedFixtureParticipation({
      careerState: accrued,
      fixtureId: FIXTURE_ID,
      seasonId: SEASON_ID,
      fixtureDate: gameDate(20_000),
      finalMinute: 90,
      sides: [{
        side: "home",
        initialContext: initialHomeContext(),
        finalContext: finalHomeContext(),
        benchPlayerIds: [HOME_SUB, HOME_UNUSED],
      }],
    }),
    /fixture already accrued/,
  );
});

test("accrueFixtureParticipationContributions reuses domain ledger validation", () => {
  const contributions = buildFixtureParticipationContributions({
    fixtureId: FIXTURE_ID,
    seasonId: SEASON_ID,
    fixtureDate: gameDate(20_000),
    finalMinute: 90,
    sides: [{
      side: "home",
      initialContext: initialHomeContext(),
      finalContext: initialHomeContext(),
    }],
    playerRatings: ratingsFixture(),
  }).contributions;
  const accrued = accrueFixtureParticipationContributions({
    careerState: careerStateFixture(),
    contributions,
  });

  assert.equal(accrued.playerParticipationLedger?.rowKeys.length, 2);
  assert.equal(
    accrued.playerParticipationLedger?.rows[
      accrued.playerParticipationLedger.rowKeys[0] ?? ""
    ]?.minutes,
    90,
  );
  assert.throws(
    () => accrueFixtureParticipationContributions({
      careerState: accrued,
      contributions,
    }),
    /fixture already accrued/,
  );
});

/**
 * Fixes the attribution rule this phase committed to (A8).
 *
 * A match fact belongs to the club a player was *fielded by*, never to the club
 * holding his contract. The two coincide today, so the rule can only be fixed by
 * a case where they do not: here the borrowed player is on `club:parent`'s
 * roster and lines up for `club:home`.
 *
 * This is deliberately not a loan model - Phase 82A owns that. It is the
 * assertion that stops the sourcing from being quietly changed to ownership
 * before then, because by the time the first loan exists the recorded history
 * already does, and a wrong attribution would have to be rewritten rather than
 * extended.
 */
test("participation credits the club a borrowed player was fielded by, not his contract club", () => {
  const { contributions } = buildFixtureParticipationContributions({
    fixtureId: FIXTURE_ID,
    seasonId: SEASON_ID,
    fixtureDate: gameDate(20_000),
    finalMinute: 90,
    sides: [{
      side: "home",
      initialContext: contextWithBorrowedPlayer(),
      finalContext: contextWithBorrowedPlayer(),
    }],
  });
  const borrowed = contributions.find((contribution) => contribution.playerId === BORROWED);

  assert.equal(borrowed?.clubId, clubId("club:home"));

  const accrued = accrueFixtureParticipationContributions({
    careerState: careerStateWithParentClub(),
    contributions,
  });
  const row = accrued.playerParticipationLedger?.rows[
    `${SEASON_ID}|2024-10|${BORROWED}`
  ];

  assert.equal(row?.starts, 1);
  assert.deepEqual(row?.clubMinutes, { [clubId("club:home")]: 90 });
  assert.equal(row?.clubMinutes[clubId("club:parent")], undefined);
});

const FIXTURE_ID = fixtureId("fixture:participation-000001");
const SEASON_ID = seasonId("season:participation");
const HOME_GOALKEEPER = playerId("player:home-gk");
const HOME_STARTER = playerId("player:home-starter");
const HOME_SUB = playerId("player:home-sub");
const HOME_UNUSED = playerId("player:home-unused");
const BORROWED = playerId("player:borrowed");

function initialHomeContext(): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId("club:home"),
    lineup: [
      createLineupSlot({ slotId: "slot:home:gk", playerId: HOME_GOALKEEPER, canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: "slot:home:field", playerId: HOME_STARTER, canonicalRole: "center_back" }),
    ],
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: { directness: 0, pressing: 0, width: 0, risk: 0, mentality: "balanced" },
  });
}

/** One eleven containing a player another club holds the contract for. */
function contextWithBorrowedPlayer(): MatchTeamContext {
  return withNeutralIncidentProfiles({
    ...initialHomeContext(),
    lineup: [
      createLineupSlot({ slotId: "slot:home:gk", playerId: HOME_GOALKEEPER, canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: "slot:home:field", playerId: BORROWED, canonicalRole: "center_back" }),
    ],
  });
}

function finalHomeContext(): MatchTeamContext {
  return {
    ...initialHomeContext(),
    lineup: [
      createLineupSlot({ slotId: "slot:home:gk", playerId: HOME_GOALKEEPER, canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: "slot:home:field", playerId: HOME_SUB, canonicalRole: "center_back" }),
    ],
  };
}

function ratingsFixture(): readonly PlayerMatchRatingRow[] {
  return [
    ratingFixture(HOME_GOALKEEPER, 6.5),
    ratingFixture(HOME_STARTER, 5.6),
    ratingFixture(HOME_SUB, 6.8),
  ];
}

function ratingFixture(player: PlayerId, rating: number): PlayerMatchRatingRow {
  return {
    playerId: player,
    side: "home",
    goals: 0,
    assists: 0,
    chancesCreated: 0,
    shots: 0,
    shotsOnTarget: 0,
    saves: 0,
    blocks: 0,
    misses: 0,
    blockedShots: 0,
    rating,
  };
}

function slimContributions(contributions: readonly PlayerFixtureParticipationContribution[]) {
  return contributions.map((contribution) => ({
    playerId: contribution.playerId,
    clubId: contribution.clubId,
    started: contribution.started,
    substituteAppearance: contribution.substituteAppearance,
    minutes: contribution.minutes,
    rating: contribution.rating,
    playedRoleMinutes: contribution.playedRoleMinutes,
  }));
}

function careerStateFixture(): CareerState {
  return createCareerState({
    saveId: saveId("save:participation"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: clubId("club:home"),
    gameState: {
      meta: { seed: "participation", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
      calendar: { currentDate: gameDate(20_000), currentSeasonId: SEASON_ID },
      players: {
        [HOME_GOALKEEPER]: playerFixture(HOME_GOALKEEPER),
        [HOME_STARTER]: playerFixture(HOME_STARTER),
        [HOME_SUB]: playerFixture(HOME_SUB),
        [HOME_UNUSED]: playerFixture(HOME_UNUSED),
      } as CareerState["gameState"]["players"],
      playerIds: [HOME_GOALKEEPER, HOME_STARTER, HOME_SUB, HOME_UNUSED],
      playerStates: {},
      clubs: {
        [clubId("club:home")]: {
          id: clubId("club:home"),
          name: "Home",
          shortName: "HOME",
          category: "third_division",
          reputation: 5,
          playerIds: [HOME_GOALKEEPER, HOME_STARTER, HOME_SUB, HOME_UNUSED],
        },
      },
      clubIds: [clubId("club:home")],
      fixtures: {},
      fixtureIds: [],
    },
    transferHistory: [],
  });
}

/** A career where the borrowed player's contract sits at a second club. */
function careerStateWithParentClub(): CareerState {
  // The tier state is rebuilt rather than carried over, because it is derived
  // from the club list this fixture is about to extend.
  const { clubCompetitiveTierState: _tierState, ...base } = careerStateFixture();

  return createCareerState({
    ...base,
    gameState: {
      ...base.gameState,
      players: {
        ...base.gameState.players,
        [BORROWED]: playerFixture(BORROWED),
      } as CareerState["gameState"]["players"],
      playerIds: [...base.gameState.playerIds, BORROWED],
      clubs: {
        ...base.gameState.clubs,
        [clubId("club:parent")]: {
          id: clubId("club:parent"),
          name: "Parent",
          shortName: "PRNT",
          category: "third_division",
          reputation: 5,
          playerIds: [BORROWED],
        },
      },
      clubIds: [...base.gameState.clubIds, clubId("club:parent")],
    },
  });
}

function playerFixture(id: PlayerId): Player {
  const value = abilityValue(10);
  const abilities: Player["abilities"] = {
    technical: { finishing: value, passing: value, longPassing: value, crossing: value, dribbling: value, technique: value, tackling: value, penalties: value, freeKicks: value },
    physical: { pace: value, strength: value, stamina: value, agility: value, heading: value },
    mental: { positioning: value, vision: value, anticipation: value, composure: value, determination: value, leadership: value },
    goalkeeping: { reflexes: value, handling: value, rushingOut: value, goalkeeperPositioning: value, footwork: value },
  };

  return {
    id,
    firstName: "Test",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions: ["cm"],
    abilities,
    potential: abilities,
  };
}
