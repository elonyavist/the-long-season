/**
 * Public squad-analysis engine helpers.
 *
 * These helpers report deterministic squad and formation facts. They do not
 * pick lineups, mutate squads, or execute market actions.
 */
export * from "./formation-squad-fit.ts";
export * from "./player-potential-projection.ts";
export * from "./public-player-assessment.ts";
export {
  FORMATION_CATALOG,
  FORMATION_KEYS,
  createSquadDepth,
  isFormationKey,
  type FormationKey,
} from "@game/domain";
