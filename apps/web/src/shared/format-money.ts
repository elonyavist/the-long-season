import type { WebPreferences } from "../app/preferences";

/** Explicit read-only precision supported by the shared currency formatter. */
export type MoneyDisplayPrecision = "whole" | "minor";

/** Outcome of reading one editable money field written by the manager. */
export type MoneyInputParseResult =
  | Readonly<{ status: "empty" }>
  | Readonly<{ status: "invalid" }>
  | Readonly<{ status: "valid"; minorUnits: number }>;

/** Every space-like character a locale may use as a grouping separator. */
const SPACE_CHARACTERS = /[\s\u00A0\u202F\u2009]/g;

/**
 * Formats integer minor units without changing their stored precision.
 *
 * Callers must choose the visible precision so tables, profiles, and editable
 * monetary forms cannot silently drift into different defaults. The amount is
 * handed to `Intl` as an exact decimal string, so no floating-point division
 * ever sits between the stored minor units and the rendered amount.
 */
export function formatMoneyFromMinorUnits(
  amount: number,
  currency: string,
  language: WebPreferences["language"],
  precision: MoneyDisplayPrecision,
): string {
  const fractionDigits = precision === "minor" ? 2 : 0;
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(minorUnitsToDecimalString(amount));
}

/**
 * Reads one editable money field into safe integer minor units.
 *
 * Grouping and decimal characters come from the active language, so English
 * `1,250.75` and Italian `1.250,75` are both accepted while a value that could
 * mean two different amounts (`1,50` in English) is rejected instead of
 * guessed. The amount is assembled with string arithmetic, never with
 * floating-point multiplication.
 */
export function parseMoneyInputToMinorUnits(
  value: string,
  language: WebPreferences["language"],
): MoneyInputParseResult {
  const compact = value.replace(SPACE_CHARACTERS, "");
  if (compact.length === 0) return { status: "empty" };

  const { group, decimal } = localeSeparators(language);
  const [wholePart, fractionPart, extra] = splitOnDecimal(compact, decimal);
  if (extra !== undefined) return { status: "invalid" };
  if (fractionPart !== undefined && !/^\d{1,2}$/.test(fractionPart)) return { status: "invalid" };

  const wholeDigits = ungroup(wholePart, group);
  if (wholeDigits === undefined) return { status: "invalid" };

  // `padEnd` keeps `1,5` worth 50 cents instead of 5, and the concatenation
  // below is exact integer arithmetic expressed as text.
  const minorText = `${wholeDigits}${(fractionPart ?? "").padEnd(2, "0")}`.replace(/^0+(?=\d)/, "");
  const minorUnits = Number(minorText);
  if (!Number.isSafeInteger(minorUnits)) return { status: "invalid" };
  return { status: "valid", minorUnits };
}

/**
 * Renders integer minor units back into the locale text an input accepts.
 *
 * This is the blur-time normalization partner of
 * `parseMoneyInputToMinorUnits`: every value it produces parses back to the
 * same minor units in the same language.
 */
export function formatMoneyInputFromMinorUnits(
  amount: number,
  language: WebPreferences["language"],
): string {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minorUnitsToDecimalString(amount));
}

/**
 * Returns the exact decimal text of integer minor units without dividing.
 *
 * `Intl` accepts a decimal string, so the stored integer never has to pass
 * through a floating-point division on its way to the screen. The cast only
 * tells TypeScript that this generated text is a numeric literal.
 */
function minorUnitsToDecimalString(amount: number): Intl.StringNumericLiteral {
  if (!Number.isSafeInteger(amount)) {
    throw new Error(`Money display requires integer minor units: ${amount}`);
  }
  const sign = amount < 0 ? "-" : "";
  const digits = String(Math.abs(amount)).padStart(3, "0");
  return `${sign}${digits.slice(0, -2)}.${digits.slice(-2)}` as Intl.StringNumericLiteral;
}

/** Reads the grouping and decimal characters the active language really uses. */
function localeSeparators(
  language: WebPreferences["language"],
): Readonly<{ group: string; decimal: string }> {
  const parts = new Intl.NumberFormat(language).formatToParts(12345.6);
  return {
    group: parts.find((part) => part.type === "group")?.value ?? ",",
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
  };
}

/** Splits on the locale decimal mark and reports any second mark as extra. */
function splitOnDecimal(
  value: string,
  decimal: string,
): readonly [string, string | undefined, string | undefined] {
  const segments = value.split(decimal);
  return [segments[0] ?? "", segments[1], segments[2]];
}

/** Validates grouping and returns the bare digits, or `undefined` when unsafe. */
function ungroup(value: string, group: string): string | undefined {
  if (/^\d+$/.test(value)) return value;
  // A grouped value is only accepted with complete three-digit groups, so a
  // separator that could also be a decimal mark can never be guessed away.
  if (group.replace(SPACE_CHARACTERS, "").length === 0) return undefined;
  const segments = value.split(group);
  if (segments.length < 2) return undefined;
  const [lead, ...rest] = segments;
  if (lead === undefined || !/^\d{1,3}$/.test(lead)) return undefined;
  if (!rest.every((segment) => /^\d{3}$/.test(segment))) return undefined;
  return `${lead}${rest.join("")}`;
}
