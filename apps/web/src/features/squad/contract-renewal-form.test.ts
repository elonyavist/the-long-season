import { describe, expect, it } from "vitest";
import { careerNonNegativeMoneyFromMinorUnits as nonNegativeMoney } from "@game/ui";

import {
  contractTermsEqual,
  contractTermsToFormValues,
  createContractRenewalFormValues,
  validateContractRenewalForm,
} from "./contract-renewal-form";

describe("contract renewal form", () => {
  const activeContract = {
    contractId: "contract:1",
    type: "professional" as const,
    startsOnIso: "2026-07-01",
    endsOnIso: "2028-06-30",
    annualWage: nonNegativeMoney(1_200_000_00),
    squadStatus: "regular_starter" as const,
    bonuses: {
      signingBonus: nonNegativeMoney(50_000_00),
      appearanceBonus: nonNegativeMoney(2_000_00),
      goalBonus: nonNegativeMoney(5_000_00),
    },
    remainingDays: 699,
    hasExpiryAlert: false,
  };

  it("uses age-aware duration and annual money from the active agreement", () => {
    expect(createContractRenewalFormValues({ age: 26, activeContract })).toEqual({
      durationYears: "3",
      annualWage: "1200000.00",
      squadStatus: "regular_starter",
      signingBonus: "50000.00",
      appearanceBonus: "2000.00",
      goalBonus: "5000.00",
      cleanSheetBonus: "",
    });
    expect(createContractRenewalFormValues({ age: 19, activeContract }).durationYears).toBe("4");
    expect(createContractRenewalFormValues({ age: 34, activeContract }).durationYears).toBe("2");
  });

  it("parses comma decimals into exact integer minor units", () => {
    const result = validateContractRenewalForm({
      durationYears: "4",
      annualWage: "1450000,50",
      squadStatus: "key_player",
      signingBonus: "75000",
      appearanceBonus: "2500.25",
      goalBonus: "6000",
      cleanSheetBonus: "",
    }, ["signing_bonus", "appearance_bonus", "goal_bonus"]);

    expect(result).toEqual({
      status: "valid",
      terms: {
        durationYears: 4,
        annualWage: 145_000_050,
        squadStatus: "key_player",
        bonuses: {
          signingBonus: 7_500_000,
          appearanceBonus: 250_025,
          goalBonus: 600_000,
        },
      },
    });
  });

  it("rejects ambiguous money and durations outside the domain range", () => {
    const result = validateContractRenewalForm({
      durationYears: "6",
      annualWage: "1.200.000",
      squadStatus: "squad_player",
      signingBonus: "",
      appearanceBonus: "-1",
      goalBonus: "",
      cleanSheetBonus: "",
    }, ["signing_bonus", "appearance_bonus"]);

    expect(result).toEqual({
      status: "invalid",
      errors: {
        durationYears: "out_of_range",
        annualWage: "invalid",
        signingBonus: "required",
        appearanceBonus: "invalid",
      },
    });
  });

  it("round-trips complete terms and detects a changed annual wage", () => {
    const terms = {
      durationYears: 3,
      annualWage: activeContract.annualWage,
      squadStatus: activeContract.squadStatus,
      bonuses: activeContract.bonuses,
    };
    const parsed = validateContractRenewalForm(
      contractTermsToFormValues(terms),
      ["signing_bonus", "appearance_bonus", "goal_bonus"],
    );
    expect(parsed.status).toBe("valid");
    if (parsed.status !== "valid") return;
    expect(contractTermsEqual(parsed.terms, terms)).toBe(true);
    expect(contractTermsEqual({ ...parsed.terms, annualWage: nonNegativeMoney(1_300_000_00) }, terms)).toBe(false);
  });
});
