import type { MatchTeamContext } from "./match-context.ts";
import type { MatchSide } from "./match-simulation-state.ts";
import type { OccasionResolution, OccasionResolver, ResolveOccasionInput } from "./occasion-resolver.ts";
import type { Rng } from "@game/shared";

/**
 * Aggregate opportunity resolver for the first match-engine slice.
 *
 * It maps team strength and configured conversion bands to shot outcomes. It
 * intentionally does not inspect individual players or produce duel chains.
 *
 * @example
 * const resolver = new AggregateOccasionResolver();
 */
export class AggregateOccasionResolver implements OccasionResolver {
  /**
   * Resolves one opportunity from aggregate team strengths.
   */
  public resolveOccasion(input: ResolveOccasionInput, rng: Rng): OccasionResolution {
    const attackingTeam = teamBySide(input.simulation, input.attackingSide);
    const defendingTeam = teamBySide(input.simulation, input.defendingSide);
    const quality = deriveOpportunityQuality(
      attackingTeam,
      defendingTeam,
      input.attackingSide,
      input.simulation.context.engineConfig.homeAdvantageFactor,
      rng,
    );
    const goalProbability = resolveGoalProbability(input.simulation.context.engineConfig.conversionBands, quality);

    if (rng.nextFloat() < goalProbability) {
      return {
        outcome: "goal",
        quality,
        isShotOnTarget: true,
      };
    }

    const nonGoalRoll = rng.nextFloat();
    const blockProbability = clamp(0.08 + (defendingTeam.strength.defense - attackingTeam.strength.attack) / 120, 0.04, 0.28);
    const saveProbability = clamp(0.22 + defendingTeam.strength.goalkeeper / 80 - attackingTeam.strength.attack / 140, 0.12, 0.58);

    if (nonGoalRoll < blockProbability) {
      return {
        outcome: "block",
        quality,
        isShotOnTarget: false,
      };
    }

    if (nonGoalRoll < blockProbability + saveProbability) {
      return {
        outcome: "save",
        quality,
        isShotOnTarget: true,
      };
    }

    return {
      outcome: "miss",
      quality,
      isShotOnTarget: false,
    };
  }
}

/**
 * Reads one team context by explicit side.
 */
function teamBySide(simulation: ResolveOccasionInput["simulation"], side: MatchSide): MatchTeamContext {
  return side === "home" ? simulation.context.home : simulation.context.away;
}

/**
 * Derives a bounded opportunity quality score from aggregate strengths.
 */
function deriveOpportunityQuality(
  attackingTeam: MatchTeamContext,
  defendingTeam: MatchTeamContext,
  attackingSide: MatchSide,
  homeAdvantageFactor: number,
  rng: Rng,
): number {
  const homeFactor = attackingSide === "home" ? homeAdvantageFactor : 1;
  const attackingScore = (attackingTeam.strength.attack * 0.7 + attackingTeam.strength.midfield * 0.3) * homeFactor;
  const defendingScore = defendingTeam.strength.defense * 0.45 + defendingTeam.strength.goalkeeper * 0.4 + defendingTeam.strength.midfield * 0.15;
  const strengthEdge = (attackingScore - defendingScore) / 40;
  const randomTexture = (rng.nextFloat() - 0.5) * 0.3;

  return clamp(0.5 + strengthEdge + randomTexture, 0, 1);
}

/**
 * Resolves the configured conversion probability for one quality value.
 */
function resolveGoalProbability(
  bands: ResolveOccasionInput["simulation"]["context"]["engineConfig"]["conversionBands"],
  quality: number,
): number {
  for (const band of bands) {
    if (quality >= band.minQualityInclusive && quality < band.maxQualityExclusive) {
      return band.goalProbability;
    }
  }

  const lastBand = bands[bands.length - 1];
  return lastBand === undefined ? 0 : lastBand.goalProbability;
}

/**
 * Clamps a number into an inclusive range.
 */
function clamp(value: number, minInclusive: number, maxInclusive: number): number {
  return Math.min(maxInclusive, Math.max(minInclusive, value));
}
