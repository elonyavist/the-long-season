import assert from "node:assert/strict";
import { test } from "vitest";

import { nonNegativeMoney } from "@game/domain";

import {
  buildCareerContractView,
  type BuildCareerContractViewInput,
  type CareerContractTermsInput,
} from "./career-contract-view.ts";

test("exposes annual wage facts, newest-first history, and real draft fields", () => {
  const input = contractInput();
  const view = buildCareerContractView(input);

  assert.equal(view.activeContract.annualWage, 1_200_000_00);
  assert.deepEqual(view.history.map((entry) => entry.sequenceNumber), [2, 1]);
  assert.equal(view.draftFields.find((field) => field.field === "annual_wage")?.valueType, "annual_money");
  assert.deepEqual(view.draftFields.map((field) => field.field), [
    "duration_years",
    "annual_wage",
    "squad_status",
    "signing_bonus",
    "appearance_bonus",
    "goal_bonus",
  ]);
  assert.equal(JSON.stringify(view).toLocaleLowerCase("en").includes("monthly"), false);
});

test("maps negotiation states to explicit commands without leaking demand evaluation", () => {
  const counterTerms = terms(1_450_000_00);
  const view = buildCareerContractView({
    ...contractInput(),
    negotiation: {
      negotiationId: "contract-negotiation:test",
      status: "countered",
      submittedOnIso: "2026-08-01",
      counterIssuedOnIso: "2026-08-04",
      counterExpiresOnIso: "2026-08-11",
      submittedTerms: terms(1_300_000_00),
      counterTerms,
    },
  });

  assert.deepEqual(view.actions.map((action) => action.actionId), [
    "accept_counter",
    "reject_counter",
    "revise_offer",
  ]);
  assert.equal(JSON.stringify(view).includes("currentAbility"), false);
  assert.equal(JSON.stringify(view).includes("reachablePotential"), false);
  assert.equal(JSON.stringify(view).includes("scoreBasisPoints"), false);
});

test("does not invent commands for a completed negotiation", () => {
  const view = buildCareerContractView({
    ...contractInput(),
    negotiation: {
      negotiationId: "contract-negotiation:accepted",
      status: "accepted",
      acceptedOnIso: "2026-08-05",
      acceptedTerms: terms(1_400_000_00),
      acceptedSource: "counter_offer",
    },
  });

  assert.deepEqual(view.actions, []);
});

function contractInput(): BuildCareerContractViewInput {
  return {
    activeContract: {
      contractId: "contract:test",
      type: "professional",
      startsOnIso: "2025-07-01",
      endsOnIso: "2027-06-30",
      annualWage: nonNegativeMoney(1_200_000_00),
      squadStatus: "regular_starter",
      bonuses: terms(1_200_000_00).bonuses,
      remainingDays: 243,
      hasExpiryAlert: true,
    },
    history: [
      {
        historyId: "history:one",
        sequenceNumber: 1,
        occurredOnIso: "2023-07-01",
        event: "signed",
        contractId: "contract:old",
      },
      {
        historyId: "history:two",
        sequenceNumber: 2,
        occurredOnIso: "2025-07-01",
        event: "renewed",
        contractId: "contract:test",
      },
    ],
    finance: {
      currency: "EUR",
      cashBalance: nonNegativeMoney(15_000_000_00),
      availableTransferBudget: nonNegativeMoney(4_000_000_00),
      annualWageBudget: nonNegativeMoney(8_000_000_00),
      committedAnnualWage: nonNegativeMoney(6_000_000_00),
      remainingAnnualWageBudget: nonNegativeMoney(2_000_000_00),
    },
    supportedBonusFields: ["signing_bonus", "appearance_bonus", "goal_bonus", "goal_bonus"],
  };
}

function terms(annualWage: number): CareerContractTermsInput {
  return {
    durationYears: 3,
    annualWage: nonNegativeMoney(annualWage),
    squadStatus: "regular_starter",
    bonuses: {
      signingBonus: nonNegativeMoney(100_000_00),
      appearanceBonus: nonNegativeMoney(5_000_00),
      goalBonus: nonNegativeMoney(10_000_00),
    },
  };
}
