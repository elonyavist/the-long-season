import { describe, expect, it } from "vitest";
import { careerNonNegativeMoneyFromMinorUnits as nonNegativeMoney } from "@game/ui";

import {
  contractTermsEqual,
  contractTermsToFormValues,
  createContractRenewalFormValues,
  normalizeContractMoneyInput,
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
  };

  it("uses age-aware duration and annual money in the active language", () => {
    expect(createContractRenewalFormValues({ age: 26, activeContract, language: "en" })).toEqual({
      durationYears: "3",
      annualWage: "1,200,000.00",
      squadStatus: "regular_starter",
      signingBonus: "50,000.00",
      appearanceBonus: "2,000.00",
      goalBonus: "5,000.00",
      cleanSheetBonus: "",
    });
    expect(
      createContractRenewalFormValues({ age: 26, activeContract, language: "it" }).annualWage,
    ).toBe("1.200.000,00");
    expect(
      createContractRenewalFormValues({ age: 19, activeContract, language: "en" }).durationYears,
    ).toBe("4");
    expect(
      createContractRenewalFormValues({ age: 34, activeContract, language: "en" }).durationYears,
    ).toBe("2");
  });

  it("parses locale grouping and decimals into exact integer minor units", () => {
    const result = validateContractRenewalForm({
      durationYears: "4",
      annualWage: "1.450.000,50",
      squadStatus: "key_player",
      signingBonus: "75000",
      appearanceBonus: "2.500,25",
      goalBonus: "6000",
      cleanSheetBonus: "",
    }, ["signing_bonus", "appearance_bonus", "goal_bonus"], "it");

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
      // Italian grouping is not English money, and "1,50" could mean two amounts.
      annualWage: "1.200.000",
      squadStatus: "squad_player",
      signingBonus: "",
      appearanceBonus: "1,50",
      goalBonus: "",
      cleanSheetBonus: "",
    }, ["signing_bonus", "appearance_bonus"], "en");

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

  it("round-trips complete terms and detects a changed annual wage in every language", () => {
    const terms = {
      durationYears: 3,
      annualWage: activeContract.annualWage,
      squadStatus: activeContract.squadStatus,
      bonuses: activeContract.bonuses,
    };

    for (const language of ["en", "it", "de", "es", "fr"] as const) {
      const parsed = validateContractRenewalForm(
        contractTermsToFormValues(terms, language),
        ["signing_bonus", "appearance_bonus", "goal_bonus"],
        language,
      );
      expect(parsed.status).toBe("valid");
      if (parsed.status !== "valid") return;
      expect(contractTermsEqual(parsed.terms, terms)).toBe(true);
      expect(
        contractTermsEqual({ ...parsed.terms, annualWage: nonNegativeMoney(1_300_000_00) }, terms),
      ).toBe(false);
    }
  });

  it("normalizes a readable draft on blur and keeps an unreadable one", () => {
    expect(normalizeContractMoneyInput("1200000", "en")).toBe("1,200,000.00");
    expect(normalizeContractMoneyInput("1200000", "it")).toBe("1.200.000,00");
    expect(normalizeContractMoneyInput("1,50", "en")).toBe("1,50");
    expect(normalizeContractMoneyInput("", "en")).toBe("");
  });
});
