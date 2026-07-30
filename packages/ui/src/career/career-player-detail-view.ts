import {
  PLAYER_ABILITY_KEYS,
  canonicalPlayerRoleOrder,
  getPlayerRoleProfile,
  readPlayerAbility,
  type CanonicalPlayerRole,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerRole,
  type PositionSuitability,
} from "@game/domain";

import {
  buildCareerPlayerStatisticsView,
  type CareerPlayerStatisticsInput,
  type CareerPlayerStatisticsView,
} from "./career-player-statistics-view.ts";

/** Attribute families that can be shown in a role-aware player detail. */
export type CareerPlayerAttributeFamily = "technical" | "mental" | "physical" | "goalkeeping";

/** Suitability levels useful as compact player-identity facts. */
export type CareerPlayerVisibleSuitability = Extract<
  PositionSuitability,
  "natural" | "adapted"
>;

/** One exact current attribute; potential attributes never enter this contract. */
export interface CareerPlayerAttributeView {
  readonly key: PlayerAbilityKey;
  readonly labelKey: string;
  readonly value: number;
}

/** One role-appropriate current-attribute family. */
export interface CareerPlayerAttributeGroupView {
  readonly family: CareerPlayerAttributeFamily;
  readonly labelKey: string;
  readonly attributes: readonly CareerPlayerAttributeView[];
}

/** One compact natural/adapted role fact shown in a player detail. */
export interface CareerPlayerRoleView {
  readonly role: CanonicalPlayerRole;
  readonly labelKey: string;
  readonly suitability: CareerPlayerVisibleSuitability;
  readonly isPrimary: boolean;
}

/** Safe football facts shared by Squad and Market player details. */
export interface CareerPlayerDetailInput {
  readonly playerId: string;
  readonly primaryRole: CanonicalPlayerRole;
  readonly roles: readonly {
    readonly role: CanonicalPlayerRole;
    readonly suitability: PositionSuitability;
  }[];
  /** Current visible attributes only. Never pass `Player.potential` here. */
  readonly currentAbilities: PlayerAbilities;
  /** Canonical selector output for current-season and career totals. */
  readonly statistics: CareerPlayerStatisticsInput;
}

/** Shared role, current-attribute, and statistics facts for a player inspector. */
export interface CareerPlayerDetailView {
  readonly playerId: string;
  readonly primaryRole: CanonicalPlayerRole;
  readonly roles: readonly CareerPlayerRoleView[];
  readonly attributeGroups: readonly CareerPlayerAttributeGroupView[];
  readonly statistics: CareerPlayerStatisticsView;
}

/** Builds the exact shared player-detail facts without hidden potential. */
export function buildCareerPlayerDetailView(
  input: CareerPlayerDetailInput,
): CareerPlayerDetailView {
  if (input.playerId.trim().length === 0) {
    throw new RangeError("Player detail requires a player ID");
  }
  const isGoalkeeper = input.primaryRole === "goalkeeper";
  return {
    playerId: input.playerId,
    primaryRole: input.primaryRole,
    roles: buildRoleViews(input),
    attributeGroups: buildAttributeGroups(input.currentAbilities, input.primaryRole),
    statistics: buildCareerPlayerStatisticsView(input.statistics, { isGoalkeeper }),
  };
}

/** Keeps the strongest supplied suitability for each role and hides weak facts. */
function buildRoleViews(input: CareerPlayerDetailInput): readonly CareerPlayerRoleView[] {
  const roles = new Map<CanonicalPlayerRole, PositionSuitability>();
  roles.set(input.primaryRole, "natural");
  for (const role of input.roles) {
    if (role.role === input.primaryRole) continue;
    const current = roles.get(role.role);
    if (current === undefined || suitabilityPriority(role.suitability) < suitabilityPriority(current)) {
      roles.set(role.role, role.suitability);
    }
  }

  return [...roles.entries()]
    .filter(
      (entry): entry is [CanonicalPlayerRole, CareerPlayerVisibleSuitability] =>
        entry[1] === "natural" || entry[1] === "adapted",
    )
    .sort(([left], [right]) => canonicalPlayerRoleOrder(left) - canonicalPlayerRoleOrder(right))
    .map(([role, suitability]) => ({
      role,
      labelKey: `career.player.role.${role}`,
      suitability,
      isPrimary: role === input.primaryRole,
    }));
}

/** Orders stronger familiarity before weak/invalid duplicate input facts. */
function suitabilityPriority(suitability: PositionSuitability): number {
  switch (suitability) {
    case "natural": return 0;
    case "adapted": return 1;
    case "weak": return 2;
    case "invalid": return 3;
  }
}

/** Projects exactly three role-appropriate families in the agreed order. */
function buildAttributeGroups(
  abilities: PlayerAbilities,
  primaryRole: CanonicalPlayerRole,
): readonly CareerPlayerAttributeGroupView[] {
  const profile = getPlayerRoleProfile(playerIdentityRole(primaryRole));
  const familyOrder: readonly CareerPlayerAttributeFamily[] = primaryRole === "goalkeeper"
    ? ["goalkeeping", "mental", "physical"]
    : ["technical", "mental", "physical"];

  return familyOrder.map((family) => ({
    family,
    labelKey: `career.playerProfile.attributeGroup.${family}`,
    attributes: PLAYER_ABILITY_KEYS
      .filter((key) => attributeFamily(key) === family)
      .toSorted((left, right) => {
        const bucketDifference = attributePriority(profile, left) - attributePriority(profile, right);
        return bucketDifference !== 0
          ? bucketDifference
          : PLAYER_ABILITY_KEYS.indexOf(left) - PLAYER_ABILITY_KEYS.indexOf(right);
      })
      .map((key) => ({
        key,
        labelKey: `career.player.attribute.${key}`,
        value: Number(readPlayerAbility(abilities, key)),
      })),
  }));
}

/** Maps side-specific canonical identities to the shared role-weight profile. */
function playerIdentityRole(role: CanonicalPlayerRole): PlayerRole {
  if (role === "right_full_back" || role === "left_full_back") return "full_back";
  if (role === "right_midfielder" || role === "left_midfielder") return "wide_midfielder";
  if (role === "right_winger" || role === "left_winger") return "winger";
  return role;
}

/** Reads the family prefix from a canonical dotted ability key. */
function attributeFamily(key: PlayerAbilityKey): CareerPlayerAttributeFamily {
  return key.slice(0, key.indexOf(".")) as CareerPlayerAttributeFamily;
}

/** Ranks exact current attributes by their canonical role relevance. */
function attributePriority(
  profile: ReturnType<typeof getPlayerRoleProfile>,
  key: PlayerAbilityKey,
): number {
  if (profile.coreForRole.includes(key)) return 0;
  if (profile.secondaryForRole.includes(key)) return 1;
  if (profile.allowedButLow.includes(key)) return 2;
  return 3;
}
