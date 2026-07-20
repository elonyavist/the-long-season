/**
 * Canonical match phases shared by engine, UI read models, and adapters.
 *
 * Legacy staged-match phases still consumed by current UI callers.
 *
 * New progressive code must use `LiveMatchPhase`, whose contract contains
 * only implemented regulation states. Step 02 begins the caller migration.
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

/** The complete phase vocabulary of the progressive Phase 77 live session. */
export type LiveMatchPhase = RegulationMatchPhase;

/** Future values retained only while legacy staged-match callers migrate. */
export type InactiveFutureMatchPhase = Exclude<MatchPhase, LiveMatchPhase>;

/**
 * Temporary migration seam for staged engine and UI callers.
 *
 * @deprecated Remove with the staged match progression in Phase 77 Step 02.
 */
export function isInactiveFutureMatchPhase(phase: MatchPhase): phase is InactiveFutureMatchPhase {
  return phase === "extra_time" || phase === "penalties";
}
