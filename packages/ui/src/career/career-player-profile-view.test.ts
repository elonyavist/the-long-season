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

test("projects all 25 exact current attributes in the agreed families", () => {
  const view = buildCareerPlayerProfileView(profileInput());

  assert.deepEqual(view.attributeGroups.map((group) => [group.family, group.attributes.length]), [
    ["technical", 9],
    ["mental", 6],
    ["physical", 5],
    ["goalkeeping", 5],
  ]);
  assert.equal(view.attributeGroups.flatMap((group) => group.attributes).length, 25);
  assert.equal(view.attributeGroups[0]?.attributes[0]?.value, 11.25);
  assert.equal(view.attributeGroups[3]?.attributes[4]?.key, "goalkeeping.footwork");
});

test("keeps selection and availability separate while preserving annual contract facts", () => {
  const view = buildCareerPlayerProfileView(profileInput());

  assert.equal(view.selection, "starting_xi");
  assert.deepEqual(view.availabilityReasons, ["injured"]);
  assert.equal(view.contract.activeContract.annualWage, 900_000_00);
  assert.equal(view.contract.draftFields.find((field) => field.field === "annual_wage")?.valueType, "annual_money");
});

test("serializes only categorical potential assessment and current attributes", () => {
  const view = buildCareerPlayerProfileView(profileInput());
  const serialized = JSON.stringify(view);

  assert.equal(view.potentialLevel, "leading");
  assert.equal(serialized.includes("potentialAbilities"), false);
  assert.equal(serialized.includes("potentialAbility"), false);
  assert.equal(serialized.includes("reachablePotential"), false);
  assert.equal(serialized.includes("currentAbility"), false);
});

test("orders roles canonically and keeps the primary role natural", () => {
  const view = buildCareerPlayerProfileView(profileInput());

  assert.deepEqual(view.roles.map((role) => [role.role, role.suitability, role.isPrimary]), [
    ["central_midfielder", "natural", true],
    ["attacking_midfielder", "adapted", false],
    ["striker", "weak", false],
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
    condition: 86,
    form: 63,
    morale: 68,
    selection: "starting_xi",
    availabilityReasons: ["injured"],
    value: nonNegativeMoney(3_500_000_00),
    currency: "EUR",
    currentLevel: "first_team",
    potentialLevel: "leading",
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
