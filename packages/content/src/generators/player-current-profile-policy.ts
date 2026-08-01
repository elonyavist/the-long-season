import {
  abilityValue,
  hardCapForRoleAbility,
  PLAYER_ABILITY_KEYS,
  roleAttributeBucket,
  type ClubCategory,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerRole,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import {
  resolveEffectiveCurrentAbilityBandForRoleAbility,
  sampleCurrentAbilityInBand,
  type CurrentAbilityRarityLane,
} from "./player-current-ability-bands.ts";
import {
  resolveGeneratedCurrentAbilityRarityLane,
  resolveGeneratedCurrentQualityProfile,
  type GeneratedCurrentQualityProfile,
  type GeneratedRoutinePlayerArchetypeKey,
} from "./player-archetypes.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";

/** Minimum current physical floor for generated footballers. */
export const GENERATED_CURRENT_PHYSICAL_FLOOR = 7;

/** Input for deterministic role-aware current profile generation. */
export interface BuildCurrentPlayerProfileInput {
  /** Stable seed controlling deterministic ability sampling. */
  readonly seed: string;
  /** Stable generated player key. */
  readonly playerKey: string;
  /** Division where the player's club plays. */
  readonly division: ClubCategory;
  /** Club tier inside the division. */
  readonly clubTier: PlayerGenerationClubTier;
  /** Stable role identity driving ability buckets and hard caps. */
  readonly role: PlayerRole;
  /** Player age in years. Youth ages use youth bands, senior ages use senior bands. */
  readonly ageYears: number;
  /** Current ability rarity lane selected by the caller's generation context. */
  readonly rarityLane: CurrentAbilityRarityLane;
  /** Speaking current-quality role, kept independent from potential class. */
  readonly currentQualityProfile: GeneratedCurrentQualityProfile;
  /** Small squad-depth adjustment applied inside the resolved band. */
  readonly slotDepthAdjustment?: number;
}

/** @internal Input for the joint owner's deterministic current-band construction. */
export interface BuildCurrentPlayerProfileAtBandPositionInput
  extends BuildCurrentPlayerProfileInput {
  /** Closed `0..1` position shared by every role-template ability band. */
  readonly bandPosition: number;
  /** Whether explicit ceiling policy may open a raw role-defining lower edge. */
  readonly minimumBandPolicy: "authored" | "ceiling_conditioned_raw";
}

/** Input for current generation when no explicit contextual ceiling exists. */
export interface BuildRoutineCurrentPlayerProfileInput
  extends Omit<BuildCurrentPlayerProfileInput, "currentQualityProfile"> {
  /** Routine archetype whose current-quality semantics own the profile. */
  readonly archetypeKey: GeneratedRoutinePlayerArchetypeKey;
}

/**
 * Builds generated current abilities from role, division, club tier, age, and attribute family.
 *
 * This is the single current-profile policy for content generators. It keeps
 * weak divisions weak, lets rare youth show one or two advanced traits, applies
 * canonical role caps, and prevents generated physical attributes from falling
 * below the minimum credible footballer floor.
 */
export function buildCurrentPlayerProfile(input: BuildCurrentPlayerProfileInput): PlayerAbilities {
  return buildCurrentPlayerAbilities(input, (abilityKey) => sampledCurrentRating(input, abilityKey));
}

/**
 * Constructs a current profile at one explicit point inside every role band.
 *
 * The joint prospect owner uses this monotone construction seam to find the
 * exact interval where a sampled ceiling is both reachable and still at least
 * one public star above current ability. It is not a post-generation clamp:
 * every ability is authored inside its resolved division/tier/role band.
 *
 * @internal The package barrel exposes only the joint-profile boundary.
 */
export function buildCurrentPlayerProfileAtBandPosition(
  input: BuildCurrentPlayerProfileAtBandPositionInput,
): PlayerAbilities {
  if (!Number.isFinite(input.bandPosition) || input.bandPosition < 0 || input.bandPosition > 1) {
    throw new RangeError(`Current-profile band position must be between 0 and 1: ${input.bandPosition}`);
  }

  const bandShapeOffsets = sampleBandShapeOffsets(input);
  return buildCurrentPlayerAbilities(
    input,
    (abilityKey) => positionedCurrentRating(
      input,
      abilityKey,
      bandShapeOffsets.get(abilityKey) ?? 0,
    ),
  );
}

function buildCurrentPlayerAbilities(
  input: BuildCurrentPlayerProfileInput,
  abilityForKey: (abilityKey: PlayerAbilityKey) => ReturnType<typeof abilityValue>,
): PlayerAbilities {
  return {
    technical: {
      finishing: abilityForKey("technical.finishing"),
      passing: abilityForKey("technical.passing"),
      longPassing: abilityForKey("technical.longPassing"),
      crossing: abilityForKey("technical.crossing"),
      dribbling: abilityForKey("technical.dribbling"),
      technique: abilityForKey("technical.technique"),
      tackling: abilityForKey("technical.tackling"),
      penalties: abilityForKey("technical.penalties"),
      freeKicks: abilityForKey("technical.freeKicks"),
    },
    physical: {
      pace: abilityForKey("physical.pace"),
      strength: abilityForKey("physical.strength"),
      stamina: abilityForKey("physical.stamina"),
      agility: abilityForKey("physical.agility"),
      heading: abilityForKey("physical.heading"),
    },
    mental: {
      positioning: abilityForKey("mental.positioning"),
      vision: abilityForKey("mental.vision"),
      anticipation: abilityForKey("mental.anticipation"),
      composure: abilityForKey("mental.composure"),
      determination: abilityForKey("mental.determination"),
      leadership: abilityForKey("mental.leadership"),
    },
    goalkeeping: {
      reflexes: abilityForKey("goalkeeping.reflexes"),
      handling: abilityForKey("goalkeeping.handling"),
      rushingOut: abilityForKey("goalkeeping.rushingOut"),
      goalkeeperPositioning: abilityForKey("goalkeeping.goalkeeperPositioning"),
      footwork: abilityForKey("goalkeeping.footwork"),
    },
  };
}

/**
 * Builds one archetype-aware current profile without rejection sampling.
 *
 * The joint-profile owner is the composition boundary for generated players.
 * This lower-level routine branch keeps archetype current semantics in one
 * place while explicit prospects use the ceiling-conditioned construction
 * seam below.
 */
export function buildRoutineCurrentPlayerProfile(
  input: BuildRoutineCurrentPlayerProfileInput,
): PlayerAbilities {
  const effectiveRarityLane = resolveGeneratedCurrentAbilityRarityLane({
    archetypeKey: input.archetypeKey,
    requestedLane: input.rarityLane,
  });
  return buildCurrentPlayerProfile({
    ...input,
    currentQualityProfile: resolveGeneratedCurrentQualityProfile({
      archetypeKey: input.archetypeKey,
      effectiveRarityLane,
    }),
    rarityLane: effectiveRarityLane,
  });
}

function sampledCurrentRating(
  input: BuildCurrentPlayerProfileInput,
  abilityKey: PlayerAbilityKey,
): ReturnType<typeof abilityValue> {
  const range = resolvedCurrentAbilityRange(input, abilityKey);
  const sampled = sampleCurrentAbilityInBand({
    seed: input.seed,
    streamName: "player-role-aware-current-ability",
    playerKey: `${input.playerKey}:${abilityKey}`,
    range,
  });

  return finalizeCurrentAbility(sampled, input, abilityKey, range);
}

function positionedCurrentRating(
  input: BuildCurrentPlayerProfileAtBandPositionInput,
  abilityKey: PlayerAbilityKey,
  bandShapeOffset: number,
): ReturnType<typeof abilityValue> {
  const authoredRange = resolvedCurrentAbilityRange(input, abilityKey);
  const bucket = roleAttributeBucket(input.role, abilityKey);
  const range = input.minimumBandPolicy === "ceiling_conditioned_raw"
      && (bucket === "coreForRole" || bucket === "secondaryForRole")
    ? { minInclusive: 1, maxInclusive: authoredRange.maxInclusive }
    : authoredRange;
  const positionedBandPosition = shapedBandPosition(input, bandShapeOffset);
  const positioned = range.minInclusive
    + positionedBandPosition * (range.maxInclusive - range.minInclusive);

  return finalizeCurrentAbility(positioned, input, abilityKey, range);
}

/**
 * Adds stable per-ability shape without breaking the monotone envelope seam.
 *
 * The taper is zero at both endpoints, so position `0` and `1` remain the
 * exact profile bounds used by feasibility checks. Inside the interval, the
 * small fixed offset prevents every attribute in one bucket from collapsing
 * to the same number. Its bounded derivative keeps every ability monotone as
 * the shared profile position rises.
 */
function shapedBandPosition(
  input: BuildCurrentPlayerProfileAtBandPositionInput,
  bandShapeOffset: number,
): number {
  const endpointTaper = 4 * input.bandPosition * (1 - input.bandPosition);
  return clamp(input.bandPosition + bandShapeOffset * endpointTaper, 0, 1);
}

/** Samples one order-explicit shape map so attribute construction order is irrelevant. */
function sampleBandShapeOffsets(
  input: BuildCurrentPlayerProfileAtBandPositionInput,
): ReadonlyMap<PlayerAbilityKey, number> {
  const rng = deriveRng(
    input.seed,
    "player-contextual-current-profile-shape",
    input.playerKey,
  );
  const offsets = new Map<PlayerAbilityKey, number>();
  for (const abilityKey of PLAYER_ABILITY_KEYS) {
    offsets.set(
      abilityKey,
      (rng.nextFloat() * 2 - 1) * MAXIMUM_BAND_SHAPE_OFFSET,
    );
  }
  return offsets;
}

function resolvedCurrentAbilityRange(
  input: BuildCurrentPlayerProfileInput,
  abilityKey: PlayerAbilityKey,
) {
  return resolveEffectiveCurrentAbilityBandForRoleAbility({
    division: input.division,
    clubTier: input.clubTier,
    role: input.role,
    abilityKey,
    ageYears: input.ageYears,
    rarityLane: input.rarityLane,
    currentQualityProfile: input.currentQualityProfile,
  });
}

function finalizeCurrentAbility(
  sampled: number,
  input: BuildCurrentPlayerProfileInput,
  abilityKey: PlayerAbilityKey,
  range: ReturnType<typeof resolvedCurrentAbilityRange>,
): ReturnType<typeof abilityValue> {
  const adjusted = clamp(
    sampled + (input.slotDepthAdjustment ?? 0),
    range.minInclusive,
    range.maxInclusive,
  );
  const floored = isPhysicalAbility(abilityKey)
    ? Math.max(GENERATED_CURRENT_PHYSICAL_FLOOR, adjusted)
    : adjusted;
  // Role incoherence is stricter than the generic footballer floor. For
  // example, a goalkeeper's heading cap remains 6 instead of being raised to 7.
  const capped = capByRole(floored, input.role, abilityKey);

  return abilityValue(clamp(capped, 0, 20));
}

function capByRole(value: number, role: PlayerRole, abilityKey: PlayerAbilityKey): number {
  const cap = hardCapForRoleAbility(role, abilityKey);
  return cap === undefined ? value : Math.min(value, cap);
}

function isPhysicalAbility(abilityKey: PlayerAbilityKey): boolean {
  return abilityKey.startsWith("physical.");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const MAXIMUM_BAND_SHAPE_OFFSET = 0.08;
