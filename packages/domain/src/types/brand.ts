/**
 * Creates a nominal type on top of a primitive TypeScript type.
 *
 * Runtime value stays unchanged, but the compiler treats each brand name as a
 * distinct type. This prevents accidental mixups between values that are both
 * strings or numbers.
 *
 * @example
 * type PlayerId = Brand<string, "PlayerId">;
 * type ClubId = Brand<string, "ClubId">;
 *
 * const player = "player:000001" as PlayerId;
 * const club = "club:perugia" as ClubId;
 *
 * // TypeScript rejects this assignment:
 * // const wrong: PlayerId = club;
 */
export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

/**
 * Casts a validated runtime value to a branded type.
 *
 * This function does not validate by itself. Keep validation in the public
 * constructor function for each value, then call `brand` only at the end.
 *
 * @example
 * function playerId(value: string): PlayerId {
 *   return brand<string, "PlayerId">(namespacedId(value, "player:"));
 * }
 */
export function brand<Value, Name extends string>(value: Value): Brand<Value, Name> {
  return value as Brand<Value, Name>;
}
