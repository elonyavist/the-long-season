import assert from "node:assert/strict";
import { test } from "vitest";

import { abilityValue, type PlayerAbilities } from "@game/domain";

import {
  buildCareerPlayerDetailView,
  type CareerPlayerDetailInput,
} from "./career-player-detail-view.ts";

test("keeps only natural/adapted role facts and the strongest duplicate suitability", () => {
  const view = buildCareerPlayerDetailView(detailInput("central_midfielder", [
    { role: "striker", suitability: "weak" },
    { role: "attacking_midfielder", suitability: "weak" },
    { role: "attacking_midfielder", suitability: "adapted" },
    { role: "defensive_midfielder", suitability: "invalid" },
    { role: "central_midfielder", suitability: "weak" },
  ]));

  assert.deepEqual(view.roles.map((role) => [role.role, role.suitability, role.isPrimary]), [
    ["central_midfielder", "natural", true],
    ["attacking_midfielder", "adapted", false],
  ]);
});

test("projects exact outfield attributes in technical, mental, physical relevance order", () => {
  const view = buildCareerPlayerDetailView(detailInput("central_midfielder", []));

  assert.deepEqual(view.attributeGroups.map((group) => group.family), [
    "technical",
    "mental",
    "physical",
  ]);
  assert.deepEqual(view.attributeGroups.map((group) => group.attributes.length), [9, 6, 5]);
  assert.deepEqual(view.attributeGroups.map((group) => group.attributes[0]?.key), [
    "technical.passing",
    "mental.vision",
    "physical.stamina",
  ]);
  assert.equal(view.attributeGroups[0]?.attributes[0]?.value, 11.25);
  assert.equal(view.attributeGroups.some((group) => group.family === "goalkeeping"), false);
});

test("projects goalkeepers to goalkeeping, mental, and physical current attributes", () => {
  const view = buildCareerPlayerDetailView(detailInput("goalkeeper", [
    { role: "center_back", suitability: "weak" },
  ]));

  assert.deepEqual(view.attributeGroups.map((group) => group.family), [
    "goalkeeping",
    "mental",
    "physical",
  ]);
  assert.deepEqual(view.attributeGroups.map((group) => group.attributes.length), [5, 6, 5]);
  assert.equal(view.attributeGroups.some((group) => group.family === "technical"), false);
  const events = view.statistics.currentSeason.events;
  assert.equal(events.coverage, "complete");
  assert.equal("saves" in events ? events.saves : undefined, 7);
});

function detailInput(
  primaryRole: CareerPlayerDetailInput["primaryRole"],
  roles: CareerPlayerDetailInput["roles"],
): CareerPlayerDetailInput {
  return {
    playerId: "player:test",
    primaryRole,
    roles,
    currentAbilities: abilities(11.25),
    statistics: {
      currentSeasonId: "season:current",
      currentSeason: {
        starts: 3,
        substituteAppearances: 1,
        appearances: 4,
        minutes: 290,
        averageRating: 7.4,
        goals: 1,
        assists: 2,
        saves: 7,
        participationCoverage: "complete",
        eventCoverage: "complete",
      },
      career: {
        starts: 20,
        substituteAppearances: 5,
        appearances: 25,
        minutes: 1_800,
        averageRating: 7.1,
        goals: 4,
        assists: 6,
        saves: 40,
        participationCoverage: "partial",
        eventCoverage: "partial",
      },
    },
  };
}

function abilities(value: number): PlayerAbilities {
  const score = abilityValue(value);
  return {
    technical: {
      finishing: score,
      passing: score,
      longPassing: score,
      crossing: score,
      dribbling: score,
      technique: score,
      tackling: score,
      penalties: score,
      freeKicks: score,
    },
    physical: {
      pace: score,
      strength: score,
      stamina: score,
      agility: score,
      heading: score,
    },
    mental: {
      positioning: score,
      vision: score,
      anticipation: score,
      composure: score,
      determination: score,
      leadership: score,
    },
    goalkeeping: {
      reflexes: score,
      handling: score,
      rushingOut: score,
      goalkeeperPositioning: score,
      footwork: score,
    },
  };
}
