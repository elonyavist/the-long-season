/**
 * Canonical match phases shared by engine, UI read models, and adapters.
 *
 * Extra time and penalties are present as future-safe data values only. The
 * current league flow must not activate them until cup rules exist.
 */
export const MATCH_PHASES = [
  "pre_match",
  "first_half",
  "half_time",
  "second_half",
  "full_time",
  "extra_time",
  "penalties",
] as const;

/** Canonical phase identifier for a football match lifecycle. */
export type MatchPhase = (typeof MATCH_PHASES)[number];

/** Phases currently supported by the regulation-time matchday flow. */
export type RegulationMatchPhase = Exclude<MatchPhase, "extra_time" | "penalties">;

/** Future phases that are intentionally inactive until cup rules exist. */
export type InactiveFutureMatchPhase = Extract<MatchPhase, "extra_time" | "penalties">;

/**
 * Reports whether a phase is a future placeholder rather than active gameplay.
 */
export function isInactiveFutureMatchPhase(phase: MatchPhase): phase is InactiveFutureMatchPhase {
  return phase === "extra_time" || phase === "penalties";
}
