import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  nonNegativeMoney,
  type PlayerAbilities,
} from "@game/domain";

import {
  buildCareerPlayerProfileView,
  type CareerPlayerProfileInput,
} from "./career-player-profile-view.ts";

test("projects only the three outfield current-attribute families", () => {
  const view = buildCareerPlayerProfileView(profileInput());

  assert.deepEqual(view.attributeGroups.map((group) => [group.family, group.attributes.length]), [
    ["technical", 9],
    ["mental", 6],
    ["physical", 5],
  ]);
  assert.equal(view.attributeGroups.flatMap((group) => group.attributes).length, 20);
  assert.equal(view.attributeGroups[0]?.attributes[0]?.value, 11.25);
});

test("keeps selection and availability separate while preserving annual contract facts", () => {
  const view = buildCareerPlayerProfileView(profileInput());

  assert.equal(view.selection, "starting_xi");
  assert.deepEqual(view.availabilityReasons, ["injured"]);
  assert.equal(view.contract.activeContract.annualWage, 900_000_00);
  assert.equal(view.contract.draftFields.find((field) => field.field === "annual_wage")?.valueType, "annual_money");
});

test("serializes only the public potential range and copies half-star assessments", () => {
  const input = profileInput();
  const view = buildCareerPlayerProfileView(input);
  const serialized = JSON.stringify(view);

  assert.deepEqual(view.currentRating, { stars: 3.5 });
  assert.deepEqual(view.potentialRange, { p50Stars: 4, upperStars: 6 });
  assert.notEqual(view.currentRating, input.currentRating);
  assert.notEqual(view.potentialRange, input.potentialRange);
  assert.equal(serialized.includes("potentialAbilities"), false);
  assert.equal(serialized.includes("potentialAbility"), false);
  assert.equal(serialized.includes("reachablePotential"), false);
  assert.equal(serialized.includes("currentAbility"), false);
});

test("orders only natural/adapted roles canonically and keeps the primary role natural", () => {
  const view = buildCareerPlayerProfileView(profileInput());

  assert.deepEqual(view.roles.map((role) => [role.role, role.suitability, role.isPrimary]), [
    ["central_midfielder", "natural", true],
    ["attacking_midfielder", "adapted", false],
  ]);
});

function profileInput(): CareerPlayerProfileInput {
  return {
    playerId: "player:test",
    shirtNumber: 8,
    firstName: "Luca",
    lastName: "Bianchi",
    age: 26,
    primaryRole: "central_midfielder",
    roles: [
      { role: "striker", suitability: "weak" },
      { role: "attacking_midfielder", suitability: "adapted" },
      { role: "central_midfielder", suitability: "adapted" },
    ],
    currentAbilities: abilities(11.25),
    statistics: statisticsInput(),
    condition: 86,
    form: 63,
    morale: 68,
    selection: "starting_xi",
    availabilityReasons: ["injured"],
    value: nonNegativeMoney(3_500_000_00),
    currency: "EUR",
    currentRating: { stars: 3.5 },
    potentialRange: { p50Stars: 4, upperStars: 6 },
    contract: {
      activeContract: {
        contractId: "contract:test",
        type: "professional",
        startsOnIso: "2025-07-01",
        endsOnIso: "2027-06-30",
        annualWage: nonNegativeMoney(900_000_00),
        squadStatus: "regular_starter",
        bonuses: {
          signingBonus: nonNegativeMoney(80_000_00),
          appearanceBonus: nonNegativeMoney(4_000_00),
        },
        remainingDays: 243,
      },
      history: [],
      finance: {
        currency: "EUR",
        cashBalance: nonNegativeMoney(12_000_000_00),
        availableTransferBudget: nonNegativeMoney(3_000_000_00),
        annualWageBudget: nonNegativeMoney(7_000_000_00),
        committedAnnualWage: nonNegativeMoney(5_500_000_00),
        remainingAnnualWageBudget: nonNegativeMoney(1_500_000_00),
      },
      supportedBonusFields: ["signing_bonus", "appearance_bonus"],
    },
  };
}

function statisticsInput(): CareerPlayerProfileInput["statistics"] {
  return {
    currentSeasonId: "season:current",
    currentSeason: {
      starts: 4,
      substituteAppearances: 2,
      appearances: 6,
      minutes: 420,
      averageRating: 7.25,
      goals: 2,
      assists: 3,
      saves: 0,
      participationCoverage: "complete",
      eventCoverage: "complete",
    },
    career: {
      starts: 30,
      substituteAppearances: 8,
      appearances: 38,
      minutes: 2_700,
      averageRating: 7.1,
      goals: 8,
      assists: 12,
      saves: 0,
      participationCoverage: "partial",
      eventCoverage: "partial",
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
