import { describe, expect, it } from "vitest";

import {
  formatMoneyFromMinorUnits,
  formatMoneyInputFromMinorUnits,
  parseMoneyInputToMinorUnits,
} from "./format-money";

describe("shared money presentation", () => {
  it("formats stored minor units exactly with the requested precision", () => {
    expect(formatMoneyFromMinorUnits(1_250_75, "EUR", "en", "minor")).toBe("€1,250.75");
    expect(formatMoneyFromMinorUnits(1_250_75, "EUR", "en", "whole")).toBe("€1,251");
    expect(
      formatMoneyFromMinorUnits(150_000_000_00, "EUR", "it", "whole").replace(/ /g, " "),
    ).toBe("150.000.000 €");
    expect(formatMoneyFromMinorUnits(0, "EUR", "en", "whole")).toBe("€0");
  });

  it("never abbreviates and never loses a cent on large amounts", () => {
    const largest = 90_071_992_547_409;
    expect(formatMoneyFromMinorUnits(largest, "EUR", "en", "minor")).toBe("€900,719,925,474.09");
    expect(formatMoneyFromMinorUnits(largest, "EUR", "en", "minor")).not.toContain("M");
  });

  it("rejects a non-integer amount instead of rounding it", () => {
    expect(() => formatMoneyFromMinorUnits(10.5, "EUR", "en", "minor")).toThrow(/integer minor units/);
  });

  it("reads plain, grouped, and decimal input in the active language", () => {
    expect(parseMoneyInputToMinorUnits("1000", "en")).toEqual({ status: "valid", minorUnits: 100_000 });
    expect(parseMoneyInputToMinorUnits("1,250.75", "en")).toEqual({ status: "valid", minorUnits: 125_075 });
    expect(parseMoneyInputToMinorUnits("1.250,75", "it")).toEqual({ status: "valid", minorUnits: 125_075 });
    expect(parseMoneyInputToMinorUnits("1 234 567,89", "fr")).toEqual({
      status: "valid",
      minorUnits: 123_456_789,
    });
    expect(parseMoneyInputToMinorUnits("1,5", "it")).toEqual({ status: "valid", minorUnits: 150 });
    expect(parseMoneyInputToMinorUnits("  ", "en")).toEqual({ status: "empty" });
  });

  it("fails ambiguous or unsafe values instead of guessing them", () => {
    // "1,50" is not valid English grouping and "," is not the English decimal.
    expect(parseMoneyInputToMinorUnits("1,50", "en")).toEqual({ status: "invalid" });
    expect(parseMoneyInputToMinorUnits("1.50", "it")).toEqual({ status: "invalid" });
    expect(parseMoneyInputToMinorUnits("1.2.3", "en")).toEqual({ status: "invalid" });
    expect(parseMoneyInputToMinorUnits("10.123", "en")).toEqual({ status: "invalid" });
    expect(parseMoneyInputToMinorUnits("-5", "en")).toEqual({ status: "invalid" });
    expect(parseMoneyInputToMinorUnits("abc", "en")).toEqual({ status: "invalid" });
    expect(parseMoneyInputToMinorUnits("99999999999999999", "en")).toEqual({ status: "invalid" });
  });

  it("round-trips blur normalization back to the same minor units", () => {
    for (const language of ["en", "it", "de", "es", "fr"] as const) {
      for (const minorUnits of [0, 1, 150, 125_075, 150_000_000_00]) {
        const normalized = formatMoneyInputFromMinorUnits(minorUnits, language);
        expect(parseMoneyInputToMinorUnits(normalized, language)).toEqual({
          status: "valid",
          minorUnits,
        });
      }
    }
  });

  it("keeps English grouping English and Italian grouping Italian", () => {
    expect(formatMoneyInputFromMinorUnits(1_250_075_00, "en")).toBe("1,250,075.00");
    expect(formatMoneyInputFromMinorUnits(1_250_075_00, "it")).toBe("1.250.075,00");
    // Italian requires two grouping digits, so a four-digit amount stays
    // ungrouped there while English groups from one thousand.
    expect(formatMoneyInputFromMinorUnits(125_075, "en")).toBe("1,250.75");
    expect(formatMoneyInputFromMinorUnits(125_075, "it")).toBe("1250,75");
  });
});
