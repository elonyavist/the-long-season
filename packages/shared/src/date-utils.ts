import { assertValue } from "./assert.ts";
import { assertSafeInteger } from "./number-utils.ts";

/**
 * Pure Gregorian date conversion helpers for game time.
 *
 * Runtime game time is an epoch-day integer. ISO `YYYY-MM-DD` is only an edge
 * format for content files, CLI output, UI, and debug dumps. This module never
 * uses JavaScript `Date` or timezone APIs.
 */

const ISO_DATE = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
const DAYS_BEFORE_UNIX_EPOCH = 719_468;

/**
 * Converts an ISO `YYYY-MM-DD` date to an epoch-day number.
 *
 * @example
 * const day = fromISO("1970-01-01"); // 0
 */
export function fromISO(isoDate: string): number {
  const match = ISO_DATE.exec(isoDate);
  assertValue(match !== null, `date must use YYYY-MM-DD format: ${isoDate}`);

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  assertValue(month >= 1 && month <= 12, `month must be between 01 and 12: ${isoDate}`);
  assertValue(day >= 1 && day <= daysInMonth(year, month), `day is invalid for month: ${isoDate}`);

  return daysFromCivil(year, month, day);
}

/**
 * Converts an epoch-day number to an ISO `YYYY-MM-DD` date.
 *
 * @example
 * const iso = toISO(0); // "1970-01-01"
 */
export function toISO(epochDay: number): string {
  assertSafeInteger(epochDay, "epochDay");

  const { year, month, day } = civilFromDays(epochDay);
  assertValue(year >= 0 && year <= 9999, `year is outside YYYY formatting range: ${year}`);

  return `${padNumber(year, 4)}-${padNumber(month, 2)}-${padNumber(day, 2)}`;
}

/**
 * Adds a whole number of days to an epoch-day number.
 *
 * @example
 * const nextWeek = addDays(fromISO("2026-08-01"), 7);
 */
export function addDays(epochDay: number, days: number): number {
  assertSafeInteger(epochDay, "epochDay");
  assertSafeInteger(days, "days");

  const result = epochDay + days;
  assertSafeInteger(result, "result epochDay");

  return result;
}

/**
 * Adds whole Gregorian civil years while preserving the month and day.
 *
 * If the destination year does not contain the source day, the result clamps
 * to that month's final day. For example, adding one year to February 29 lands
 * on February 28. The calculation operates only on epoch-day integers and is
 * therefore independent of JavaScript `Date`, local timezones, and DST.
 *
 * @example
 * const nextSeason = addCivilYears(fromISO("2027-08-01"), 1);
 * toISO(nextSeason); // "2028-08-01"
 */
export function addCivilYears(epochDay: number, years: number): number {
  assertSafeInteger(epochDay, "epochDay");
  assertSafeInteger(years, "years");

  const sourceDate = civilFromDays(epochDay);
  const destinationYear = sourceDate.year + years;
  assertSafeInteger(destinationYear, "destinationYear");

  const destinationDay = Math.min(
    sourceDate.day,
    daysInMonth(destinationYear, sourceDate.month),
  );
  const result = daysFromCivil(
    destinationYear,
    sourceDate.month,
    destinationDay,
  );
  assertSafeInteger(result, "result epochDay");

  return result;
}

/**
 * Returns the signed day distance from `fromEpochDay` to `toEpochDay`.
 *
 * @example
 * const gap = diffDays(fromISO("2026-08-08"), fromISO("2026-08-01")); // 7
 */
export function diffDays(toEpochDay: number, fromEpochDay: number): number {
  assertSafeInteger(toEpochDay, "toEpochDay");
  assertSafeInteger(fromEpochDay, "fromEpochDay");

  return toEpochDay - fromEpochDay;
}

/**
 * Returns completed Gregorian years between two epoch-day dates.
 *
 * A leap-day anniversary occurs on March 1 in non-leap years because February
 * never reaches day 29. Keeping this rule here gives every domain and content
 * caller the same exact age boundary without importing football concepts.
 */
export function completedCivilYears(
  birthEpochDay: number,
  currentEpochDay: number,
): number {
  assertSafeInteger(birthEpochDay, "birthEpochDay");
  assertSafeInteger(currentEpochDay, "currentEpochDay");
  assertValue(
    currentEpochDay >= birthEpochDay,
    `current epoch day must not precede birth epoch day: ${currentEpochDay} < ${birthEpochDay}`,
  );

  const birth = civilFromDays(birthEpochDay);
  const current = civilFromDays(currentEpochDay);
  const birthdayReached =
    current.month > birth.month
    || (current.month === birth.month && current.day >= birth.day);

  return current.year - birth.year - (birthdayReached ? 0 : 1);
}

/**
 * Reports whether a Gregorian year is leap.
 */
function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
 * Returns the number of days in one Gregorian month.
 */
function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

/**
 * Converts a Gregorian civil date to days since 1970-01-01.
 */
function daysFromCivil(year: number, month: number, day: number): number {
  const adjustedYear = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(adjustedYear / 400);
  const yearOfEra = adjustedYear - era * 400;
  const monthPrime = month + (month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * monthPrime + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;

  return era * 146_097 + dayOfEra - DAYS_BEFORE_UNIX_EPOCH;
}

/**
 * Converts days since 1970-01-01 to a Gregorian civil date.
 */
function civilFromDays(epochDay: number): { readonly year: number; readonly month: number; readonly day: number } {
  const shiftedDay = epochDay + DAYS_BEFORE_UNIX_EPOCH;
  const era = Math.floor(shiftedDay / 146_097);
  const dayOfEra = shiftedDay - era * 146_097;
  const yearOfEra = Math.floor(
    (dayOfEra - Math.floor(dayOfEra / 1_460) + Math.floor(dayOfEra / 36_524) - Math.floor(dayOfEra / 146_096)) /
      365,
  );
  const yearDay =
    dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPrime = Math.floor((5 * yearDay + 2) / 153);
  const day = yearDay - Math.floor((153 * monthPrime + 2) / 5) + 1;
  const month = monthPrime < 10 ? monthPrime + 3 : monthPrime - 9;
  const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0);

  return { year, month, day };
}

/**
 * Pads a positive integer for fixed-width ISO date output.
 */
function padNumber(value: number, width: number): string {
  return String(value).padStart(width, "0");
}
