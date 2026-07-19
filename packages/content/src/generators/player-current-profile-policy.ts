import {
  abilityValue,
  hardCapForRoleAbility,
  type ClubCategory,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerRole,
} from "@game/domain";

import {
  resolveEffectiveCurrentAbilityBandForRoleAbility,
  sampleCurrentAbilityInBand,
  type CurrentAbilityRarityLane,
} from "./player-current-ability-bands.ts";
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
  /** Current ability rarity lane for this player. */
  readonly rarityLane: CurrentAbilityRarityLane;
  /** Small squad-depth adjustment applied inside the resolved band. */
  readonly slotDepthAdjustment?: number;
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
  return {
    technical: {
      finishing: currentRating(input, "technical.finishing"),
      passing: currentRating(input, "technical.passing"),
      longPassing: currentRating(input, "technical.longPassing"),
      crossing: currentRating(input, "technical.crossing"),
      dribbling: currentRating(input, "technical.dribbling"),
      technique: currentRating(input, "technical.technique"),
      tackling: currentRating(input, "technical.tackling"),
      penalties: currentRating(input, "technical.penalties"),
      freeKicks: currentRating(input, "technical.freeKicks"),
    },
    physical: {
      pace: currentRating(input, "physical.pace"),
      strength: currentRating(input, "physical.strength"),
      stamina: currentRating(input, "physical.stamina"),
      agility: currentRating(input, "physical.agility"),
      heading: currentRating(input, "physical.heading"),
    },
    mental: {
      positioning: currentRating(input, "mental.positioning"),
      vision: currentRating(input, "mental.vision"),
      anticipation: currentRating(input, "mental.anticipation"),
      composure: currentRating(input, "mental.composure"),
      determination: currentRating(input, "mental.determination"),
      leadership: currentRating(input, "mental.leadership"),
    },
    goalkeeping: {
      reflexes: currentRating(input, "goalkeeping.reflexes"),
      handling: currentRating(input, "goalkeeping.handling"),
      rushingOut: currentRating(input, "goalkeeping.rushingOut"),
      goalkeeperPositioning: currentRating(input, "goalkeeping.goalkeeperPositioning"),
      footwork: currentRating(input, "goalkeeping.footwork"),
    },
  };
}

function currentRating(input: BuildCurrentPlayerProfileInput, abilityKey: PlayerAbilityKey) {
  const range = resolveEffectiveCurrentAbilityBandForRoleAbility({
    division: input.division,
    clubTier: input.clubTier,
    role: input.role,
    abilityKey,
    ageYears: input.ageYears,
    rarityLane: input.rarityLane,
  });
  const sampled = sampleCurrentAbilityInBand({
    seed: input.seed,
    streamName: "player-role-aware-current-ability",
    playerKey: `${input.playerKey}:${abilityKey}`,
    range,
  });
  const adjusted = sampled + (input.slotDepthAdjustment ?? 0);
  const capped = capByRole(clamp(adjusted, range.minInclusive, range.maxInclusive), input.role, abilityKey);
  const floored = isPhysicalAbility(abilityKey) ? Math.max(GENERATED_CURRENT_PHYSICAL_FLOOR, capped) : capped;

  return abilityValue(clamp(floored, 0, 20));
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
