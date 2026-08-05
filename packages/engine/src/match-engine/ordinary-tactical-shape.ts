import {
  abilityValue,
  evaluatePositionSuitability,
  FORMATIONS,
  TACTICAL_SHAPE_CAPACITIES,
  type CanonicalPlayerRole,
  type MatchTacticsCalibrationConfig,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type PlayerPosition,
  type TacticalShapeCapacity,
} from "@game/domain";

import { createLineupSlot, type RoleWeightProfile } from "./team-strength.ts";
import { deriveTeamShapeAndStrength } from "./tactic-team-context.ts";

/** One bounded number per locked football capacity, in `[0, 1)`. */
export type TacticalShapeCapacityValues = Readonly<Record<TacticalShapeCapacity, number>>;

/**
 * The ability every reference player is given, on the `0-20` scale.
 *
 * The midpoint is deliberate. The reference exists to describe *shape*, so the
 * eleven that produces it must be ordinary in every other respect; picking a
 * good or a poor eleven would fold squad quality into a number that is supposed
 * to contain none.
 */
export const ORDINARY_SHAPE_REFERENCE_ABILITY = 10;

/** Input for measuring what an ordinary curated eleven's shape looks like. */
export interface OrdinaryTacticalShapeReferenceInput {
  /** Role profile lookup covering every canonical role in the catalog. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Versioned calibration this reference belongs to. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}

/** Error categories exposed by the ordinary-shape reading. */
export type OrdinaryTacticalShapeErrorCode = "empty_reference" | "flat_profile";

/**
 * Typed error thrown when a shape cannot be read against an ordinary eleven.
 *
 * @example
 * if (error instanceof OrdinaryTacticalShapeError && error.code === "flat_profile") {
 *   // Every capacity was zero, so there is no profile to compare.
 * }
 */
export class OrdinaryTacticalShapeError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: OrdinaryTacticalShapeErrorCode;

  /** Creates an ordinary-shape reading error. */
  public constructor(code: OrdinaryTacticalShapeErrorCode, message: string) {
    super(message);
    this.name = "OrdinaryTacticalShapeError";
    this.code = code;
  }
}

/**
 * Measures the mean capacity an ordinary curated eleven produces.
 *
 * Every one of the curated formations is fielded by the same eleven ordinary
 * players and the results are averaged. That answers one question and only one:
 * *how much of a team's tactical weight normally sits in each capacity?* A team
 * always puts more into being present in the box than into covering a flank,
 * and that is a property of football, not a choice the manager made.
 *
 * It is derived rather than written down because it belongs to the calibration.
 * A frozen table of numbers here would keep answering for a balance asset that
 * content had since retuned, and nothing would say so.
 *
 * Determinism: `FORMATIONS` is the canonical ordered catalog view and every
 * player is identical, so the result depends on the calibration alone.
 *
 * @example
 * const reference = deriveOrdinaryTacticalShapeReference({ roleWeights, matchTacticsCalibration });
 * reference.left_coverage; // what an ordinary eleven puts into covering its left
 */
export function deriveOrdinaryTacticalShapeReference(
  input: OrdinaryTacticalShapeReferenceInput,
): TacticalShapeCapacityValues {
  const totals = {} as Record<TacticalShapeCapacity, number>;
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    totals[capacity] = 0;
  }

  for (const formation of FORMATIONS) {
    // No `side`, deliberately. A manager's saved lineup carries slot, player
    // and role and nothing else, so his central players split their lateral
    // work evenly. A reference that knew which flank each of its own central
    // players leaned to would be describing a lineup he cannot express.
    const lineup = formation.slots.map((slot) =>
      createLineupSlot({
        slotId: slot.slotKey,
        playerId: referencePlayerId(slot.slotKey),
        canonicalRole: slot.playerRole,
      }),
    );
    const players = Object.fromEntries(
      formation.slots.map((slot) => [
        referencePlayerId(slot.slotKey),
        ordinaryReferencePlayer(referencePlayerId(slot.slotKey), slot.playerRole),
      ]),
    ) as Readonly<Record<PlayerId, Player>>;
    const { shape } = deriveTeamShapeAndStrength({
      lineup,
      players,
      roleWeights: input.roleWeights,
      matchTacticsCalibration: input.matchTacticsCalibration,
    });

    for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
      totals[capacity] += shape.capacities[capacity];
    }
  }

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    totals[capacity] /= FORMATIONS.length;

    if (!(totals[capacity] > 0)) {
      throw new OrdinaryTacticalShapeError(
        "empty_reference",
        `Ordinary reference capacity must be positive: ${capacity}`,
      );
    }
  }

  return totals;
}

/**
 * Reads one eleven's shape as a departure from an ordinary eleven's, free of
 * squad quality.
 *
 * A capacity alone cannot be reported to a manager: a third-division side is
 * low in *every* capacity and a title contender is high in every one, so a raw
 * reading would describe his players, which he already knows, instead of his
 * shape, which is what he just chose. Two steps remove that:
 *
 * 1. divide each capacity by what an ordinary eleven puts there, which removes
 *    the fact that presence in the box is naturally a bigger number than cover
 *    on a flank;
 * 2. divide by this side's own mean of those ratios, which removes how good the
 *    players are, because better players lift every capacity together.
 *
 * What survives is the profile: `1` is where an ordinary eleven sits, below `1`
 * is a capacity this shape gives up, above `1` is one it concentrates in.
 *
 * The removal is not perfect. Capacities are bounded by `r / (r + reference)`,
 * which compresses high values more than low ones, so the same shape drifts by
 * roughly `0.08` between a squad of `4`s and a squad of `18`s. That is measured
 * and bounded, and it is why the thresholds that read this number sit well
 * outside the range every curated formation occupies.
 *
 * @example
 * const emphasis = deriveTacticalShapeEmphasis(team.shape.capacities, reference);
 * emphasis.left_coverage < 0.75; // this shape has given up its left flank
 */
export function deriveTacticalShapeEmphasis(
  capacities: TacticalShapeCapacityValues,
  reference: TacticalShapeCapacityValues,
): TacticalShapeCapacityValues {
  const ratios = {} as Record<TacticalShapeCapacity, number>;
  let total = 0;

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const referenceValue = reference[capacity];

    if (!(referenceValue > 0)) {
      throw new OrdinaryTacticalShapeError(
        "empty_reference",
        `Ordinary reference capacity must be positive: ${capacity}`,
      );
    }

    ratios[capacity] = capacities[capacity] / referenceValue;
    total += ratios[capacity];
  }

  const mean = total / TACTICAL_SHAPE_CAPACITIES.length;

  if (!(mean > 0)) {
    throw new OrdinaryTacticalShapeError(
      "flat_profile",
      "A shape with no capacity at all has no profile to read",
    );
  }

  const emphasis = {} as Record<TacticalShapeCapacity, number>;
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    emphasis[capacity] = ratios[capacity] / mean;
  }

  return emphasis;
}

/** Stable identifier for one reference player, unique inside its formation. */
function referencePlayerId(slotKey: string): PlayerId {
  return `player:ordinary-${slotKey}` as PlayerId;
}

/**
 * Builds one ordinary player, natural in the position he is about to occupy.
 *
 * Uniform attributes are the point: any spread would make the reference depend
 * on which slot happened to receive which strength.
 *
 * The natural position is not cosmetic. Suitability scales every `coordination`
 * task and leaves the two `presence` tasks alone, so a reference eleven of
 * players natural nowhere has its build-up, progression and coverage quietly
 * suppressed while its presence in the box is untouched - and every real team
 * measured against it then looks short of bodies in the box. That is exactly
 * what happened here: nine curated formations filled with real squads all read
 * as thin in the final third and blunt on the counter, which is a defect of the
 * reference and not a fact about those shapes.
 */
function ordinaryReferencePlayer(id: PlayerId, role: CanonicalPlayerRole): Player {
  return {
    id,
    firstName: "Ordinary",
    lastName: "Reference",
    birthDate: 0 as Player["birthDate"],
    naturalPositions: [naturalPositionForRole(role)],
    abilities: ordinaryAbilities(),
    potential: ordinaryAbilities(),
  };
}

/**
 * Every position a footballer can be natural in, in a stable order.
 *
 * Declared with `satisfies` so a new position is a build failure here. The
 * position-to-role *relation* is deliberately not restated: it is read back out
 * of the canonical suitability table below, which is the only place football
 * says which position covers which role.
 */
const REFERENCE_POSITIONS = [
  "gk",
  "rb",
  "cb",
  "lb",
  "rwb",
  "lwb",
  "dm",
  "cm",
  "am",
  "rw",
  "lw",
  "st",
] as const satisfies readonly PlayerPosition[];

/** Finds the position a footballer is natural in for one canonical role. */
function naturalPositionForRole(role: CanonicalPlayerRole): PlayerPosition {
  const position = REFERENCE_POSITIONS.find(
    (candidate) => evaluatePositionSuitability([candidate], { playerRole: role }) === "natural",
  );

  if (position === undefined) {
    throw new OrdinaryTacticalShapeError(
      "empty_reference",
      `No natural position covers the canonical role ${role}`,
    );
  }

  return position;
}

/** One uniform ability sheet, declared in full so a schema change fails here. */
function ordinaryAbilities(): PlayerAbilities {
  const value = abilityValue(ORDINARY_SHAPE_REFERENCE_ABILITY);

  return {
    technical: {
      finishing: value,
      passing: value,
      longPassing: value,
      crossing: value,
      dribbling: value,
      technique: value,
      tackling: value,
      penalties: value,
      freeKicks: value,
    },
    physical: { pace: value, strength: value, stamina: value, agility: value, heading: value },
    mental: {
      positioning: value,
      vision: value,
      anticipation: value,
      composure: value,
      determination: value,
      leadership: value,
    },
    goalkeeping: {
      reflexes: value,
      handling: value,
      rushingOut: value,
      goalkeeperPositioning: value,
      footwork: value,
    },
  };
}
