import { FORMATIONS, type Formation } from "@game/domain";

import type { MatchTacticalDistributionInput } from "../match-engine/index.ts";

/**
 * Modulates a club's tactic by the shape it actually chose to line up in.
 *
 * Every AI club used to set out with identical sliders, so the only thing that
 * ever varied between opponents was who was on the pitch. A side playing three
 * at the back with two strikers and a side playing five at the back with one
 * were instructed to play exactly the same football.
 *
 * The three knobs a shape genuinely implies are read off the shape itself:
 *
 * - **width** from how many slots sit in a wide channel;
 * - **directness** from how few midfielders there are to play through;
 * - **risk** from the balance of attackers against defenders.
 *
 * `pressing` and `mentality` are left exactly as the caller set them. No fact
 * about a shape says how hard a side presses, and mentality is a ladder the
 * live policy already moves against score and minute - deriving it here as well
 * would price the same decision twice.
 *
 * Each knob is expressed as a **deviation from the average catalog shape**,
 * measured from the catalog rather than written down. That is what keeps this a
 * model of variation rather than a global rebalance: the average shape still
 * plays the caller's neutral setup, and Step 06's balance point is where it was.
 */
export function deriveShapeTacticalDistribution(
  formation: Formation,
  baseline: MatchTacticalDistributionInput,
): MatchTacticalDistributionInput {
  const shape = shapeRatios(formation);

  return {
    ...baseline,
    width: clampKnob(baseline.width + shape.width - CATALOG_MEAN_RATIOS.width),
    directness: clampKnob(baseline.directness + shape.directness - CATALOG_MEAN_RATIOS.directness),
    risk: clampKnob(baseline.risk + shape.risk - CATALOG_MEAN_RATIOS.risk),
  };
}

interface ShapeRatios {
  readonly width: number;
  readonly directness: number;
  readonly risk: number;
}

/**
 * Reduces one shape to the three ratios a tactic can honestly be read from.
 *
 * These are counts of slots the formation already declares, divided by counts
 * of slots the formation already declares. Nothing here is a tuned coefficient,
 * so there is no number in this file for content to own or for a later step to
 * discover has drifted.
 */
function shapeRatios(formation: Formation): ShapeRatios {
  const outfield = formation.slots.filter((slot) => slot.department !== "goalkeeping");
  const wide = outfield.filter((slot) => slot.side === "left" || slot.side === "right").length;
  const midfield = outfield.filter((slot) => slot.department === "midfield").length;
  const attack = outfield.filter((slot) => slot.department === "attack").length;
  const defence = outfield.filter((slot) => slot.department === "defense").length;
  const outfieldCount = Math.max(outfield.length, 1);

  return {
    width: wide / outfieldCount,
    directness: 1 - midfield / outfieldCount,
    risk: attack + defence === 0 ? 0.5 : attack / (attack + defence),
  };
}

/** The average curated shape, measured from the catalog rather than declared. */
const CATALOG_MEAN_RATIOS: ShapeRatios = ((): ShapeRatios => {
  const ratios = FORMATIONS.map(shapeRatios);
  const mean = (read: (value: ShapeRatios) => number): number =>
    ratios.reduce((total, value) => total + read(value), 0) / Math.max(ratios.length, 1);

  return {
    width: mean((value) => value.width),
    directness: mean((value) => value.directness),
    risk: mean((value) => value.risk),
  };
})();

/** Holds a derived knob inside the `0..1` scale every tactic input shares. */
function clampKnob(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
