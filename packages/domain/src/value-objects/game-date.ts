import { brand, type Brand } from "../types/brand.ts";

/**
 * Game date represented as an integer number of days from 1970-01-01.
 *
 * ISO strings are only an edge format for content/UI/debug. Domain and engine
 * code should use this compact numeric representation.
 */
export type GameDate = Brand<number, "GameDate">;

/**
 * Builds a validated game date.
 *
 * @example
 * const openingDay = gameDate(20_000);
 */
export function gameDate(epochDay: number): GameDate {
  if (!Number.isSafeInteger(epochDay)) {
    throw new Error(`GameDate must be a safe integer epoch-day: ${epochDay}`);
  }

  return brand<number, "GameDate">(epochDay);
}
