import type { GameDate } from "@game/domain";
import { completedCivilYears } from "@game/shared";

/** Stable failure raised when completed age is requested before a birth date. */
export class CompletedPlayerAgeError extends Error {
  /** Creates one explicit chronological validation failure. */
  public constructor(birthDate: GameDate, currentDate: GameDate) {
    super(
      `Player age date precedes birth date: ${String(currentDate)} < ${String(birthDate)}`,
    );
    this.name = "CompletedPlayerAgeError";
  }
}

/**
 * Returns completed civil years on an exact game date.
 *
 * Day-count divisors such as 365 or 365.2425 drift around birthdays and leap
 * years. This helper compares Gregorian month/day components so every engine
 * caller assigns the same age band on the birthday boundary.
 */
export function completedPlayerAge(
  birthDate: GameDate,
  currentDate: GameDate,
): number {
  if (currentDate < birthDate) {
    throw new CompletedPlayerAgeError(birthDate, currentDate);
  }

  return completedCivilYears(birthDate, currentDate);
}
