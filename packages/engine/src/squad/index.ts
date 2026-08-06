/**
 * Public squad-analysis engine helpers.
 *
 * These helpers report deterministic squad and formation facts. They do not
 * pick lineups, mutate squads, or execute market actions.
 */
export * from "./formation-squad-fit.ts";
export * from "./player-potential-projection.ts";
export * from "./public-player-assessment.ts";
export * from "./squad-depth.ts";
export {
  FORMATION_CATALOG,
  FORMATION_KEYS,
  createSquadDepth,
  isFormationKey,
  playerSquadDepartment,
  type CanonicalPlayerRole,
  type FormationKey,
  type PlayerSquadDepartment,
} from "@game/domain";
