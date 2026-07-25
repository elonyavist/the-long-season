import type { WebPreferences } from "../app/preferences";

/** Explicit read-only precision supported by the shared currency formatter. */
export type MoneyDisplayPrecision = "whole" | "minor";

/**
 * Formats integer minor units without changing their stored precision.
 *
 * Callers must choose the visible precision so tables, profiles, and editable
 * monetary forms cannot silently drift into different defaults.
 */
export function formatMoneyFromMinorUnits(
  amount: number,
  currency: string,
  language: WebPreferences["language"],
  precision: MoneyDisplayPrecision,
): string {
  if (!Number.isSafeInteger(amount)) {
    throw new Error(`Money display requires integer minor units: ${amount}`);
  }

  const fractionDigits = precision === "minor" ? 2 : 0;
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount / 100);
}
