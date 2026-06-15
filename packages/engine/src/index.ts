/**
 * Public entrypoint for deterministic simulation rules.
 *
 * Engine code may import only `@game/domain` and `@game/shared`. This file is
 * intentionally limited to pure deterministic simulation helpers.
 */
export * from "./match-engine/index.ts";
