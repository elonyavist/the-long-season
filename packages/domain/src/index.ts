/**
 * Public domain package surface.
 *
 * Re-export only pure data contracts and value-object constructors. Domain must
 * remain dependency-free and must not expose engine, content, storage, or UI
 * concepts.
 */
export * from "./entities/club.entity.ts";
export * from "./entities/match.entity.ts";
export * from "./entities/match-event.entity.ts";
export * from "./entities/player.entity.ts";
export * from "./state/game-state.ts";
export * from "./types/brand.ts";
export * from "./types/ids.ts";
export * from "./value-objects/game-date.ts";
export * from "./value-objects/money.ts";
export * from "./value-objects/rating.ts";
