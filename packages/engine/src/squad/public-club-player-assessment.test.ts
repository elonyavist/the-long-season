import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  gameDate,
  playerId,
  type Player,
  type PlayerAbilities,
} from "@game/domain";

import {
  derivePublicClubPlayerAssessments,
  PublicClubPlayerAssessmentError,
} from "./public-club-player-assessment.ts";

test("classifies current and reachable ability against the club's current standard", () => {
  const players = Array.from({ length: 20 }, (_, index) => {
    const current = 20 - index;
    const potential = index === 19 ? 20 : current;
    return playerFixture(index + 1, current, potential);
  });

  const assessments = derivePublicClubPlayerAssessments(players);

  assert.deepEqual(assessments.slice(0, 3).map((assessment) => assessment.currentLevel), [
    "leading",
    "leading",
    "leading",
  ]);
  assert.equal(assessments[3]?.currentLevel, "first_team");
  assert.equal(assessments[10]?.currentLevel, "squad");
  assert.equal(assessments[17]?.currentLevel, "depth");
  assert.equal(assessments[19]?.potentialLevel, "leading");
});

test("returns public labels without serializing hidden ability numbers", () => {
  const assessment = derivePublicClubPlayerAssessments([playerFixture(1, 10, 14)])[0];

  assert.deepEqual(assessment, {
    playerId: playerId("player:assessment-01"),
    currentLevel: "leading",
    potentialLevel: "leading",
  });
  assert.equal(JSON.stringify(assessment).includes("Ability"), false);
  assert.equal(Object.values(assessment ?? {}).some((value) => typeof value === "number"), false);
});

test("rejects missing role identity and duplicate roster entries", () => {
  const { primaryRole: _primaryRole, ...missingRole } = playerFixture(1, 10, 12);

  assert.throws(
    () => derivePublicClubPlayerAssessments([missingRole]),
    (error) => error instanceof PublicClubPlayerAssessmentError && error.code === "missing_role_identity",
  );

  const duplicate = playerFixture(2, 10, 12);
  assert.throws(
    () => derivePublicClubPlayerAssessments([duplicate, duplicate]),
    (error) => error instanceof PublicClubPlayerAssessmentError && error.code === "duplicate_player",
  );
});

function playerFixture(sequence: number, current: number, potential: number): Player {
  const id = playerId(`player:assessment-${String(sequence).padStart(2, "0")}`);
  return {
    id,
    firstName: "Test",
    lastName: String(sequence),
    birthDate: gameDate(10_000),
    naturalPositions: ["st"],
    primaryRole: "striker",
    abilities: uniformAbilities(current),
    potential: uniformAbilities(potential),
  };
}

function uniformAbilities(value: number): PlayerAbilities {
  const rating = abilityValue(value);
  return {
    technical: {
      finishing: rating,
      passing: rating,
      longPassing: rating,
      crossing: rating,
      dribbling: rating,
      technique: rating,
      tackling: rating,
      penalties: rating,
      freeKicks: rating,
    },
    physical: {
      pace: rating,
      strength: rating,
      stamina: rating,
      agility: rating,
      heading: rating,
    },
    mental: {
      positioning: rating,
      vision: rating,
      anticipation: rating,
      composure: rating,
      determination: rating,
      leadership: rating,
    },
    goalkeeping: {
      reflexes: rating,
      handling: rating,
      rushingOut: rating,
      goalkeeperPositioning: rating,
      footwork: rating,
    },
  };
}
