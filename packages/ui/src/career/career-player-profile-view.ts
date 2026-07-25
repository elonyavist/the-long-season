import {
  PLAYER_ABILITY_KEYS,
  canonicalPlayerRoleOrder,
  getPlayerRoleProfile,
  readPlayerAbility,
  type CanonicalPlayerRole,
  type CurrencyCode,
  type Money,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerRole,
  type PositionSuitability,
} from "@game/domain";

import {
  buildCareerContractView,
  type BuildCareerContractViewInput,
  type CareerContractView,
} from "./career-contract-view.ts";
import type {
  CareerSquadAvailabilityReason,
  CareerSquadPlayerLevel,
  CareerSquadSelection,
} from "./career-squad-view.ts";

/** Stable attribute families used by the full-screen player profile. */
export type CareerPlayerAttributeFamily = "technical" | "mental" | "physical" | "goalkeeping";

/** One exact current attribute; potential attributes never enter this contract. */
export interface CareerPlayerAttributeView {
  readonly key: PlayerAbilityKey;
  readonly labelKey: string;
  readonly value: number;
}

/** One current-attribute family in the agreed profile order. */
export interface CareerPlayerAttributeGroupView {
  readonly family: CareerPlayerAttributeFamily;
  readonly labelKey: string;
  readonly attributes: readonly CareerPlayerAttributeView[];
}

/** Public role familiarity shown without recalculating tactical suitability. */
export interface CareerPlayerRoleView {
  readonly role: CanonicalPlayerRole;
  readonly labelKey: string;
  readonly suitability: PositionSuitability;
  readonly isPrimary: boolean;
}

/** Safe football and contract facts required by the player profile. */
export interface CareerPlayerProfileInput {
  readonly playerId: string;
  readonly shirtNumber: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly age: number;
  readonly primaryRole: CanonicalPlayerRole;
  readonly roles: readonly {
    readonly role: CanonicalPlayerRole;
    readonly suitability: PositionSuitability;
  }[];
  /** Current visible attributes only. Never pass `Player.potential` here. */
  readonly currentAbilities: PlayerAbilities;
  readonly condition: number;
  readonly form: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentLevel: CareerSquadPlayerLevel;
  readonly potentialLevel: CareerSquadPlayerLevel;
  readonly contract: BuildCareerContractViewInput;
}

/** Complete public player profile with no hidden numeric potential. */
export interface CareerPlayerProfileView {
  readonly screenKey: "career.playerProfile";
  readonly playerId: string;
  readonly shirtNumber: number;
  readonly displayName: string;
  readonly age: number;
  readonly primaryRole: CanonicalPlayerRole;
  readonly roles: readonly CareerPlayerRoleView[];
  readonly attributeGroups: readonly CareerPlayerAttributeGroupView[];
  readonly condition: number;
  readonly form: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentLevel: CareerSquadPlayerLevel;
  readonly potentialLevel: CareerSquadPlayerLevel;
  readonly contract: CareerContractView;
}

const ATTRIBUTE_FAMILY_ORDER: readonly CareerPlayerAttributeFamily[] = [
  "technical",
  "mental",
  "physical",
  "goalkeeping",
];

/** Builds the complete safe profile from current football and annual contract facts. */
export function buildCareerPlayerProfileView(input: CareerPlayerProfileInput): CareerPlayerProfileView {
  assertValidProfileInput(input);
  return {
    screenKey: "career.playerProfile",
    playerId: input.playerId,
    shirtNumber: input.shirtNumber,
    displayName: `${input.firstName} ${input.lastName}`.trim(),
    age: input.age,
    primaryRole: input.primaryRole,
    roles: buildRoleViews(input),
    attributeGroups: buildAttributeGroups(input.currentAbilities, input.primaryRole),
    condition: input.condition,
    form: input.form,
    morale: input.morale,
    selection: input.selection,
    availabilityReasons: [...input.availabilityReasons],
    value: input.value,
    currency: input.currency,
    currentLevel: input.currentLevel,
    potentialLevel: input.potentialLevel,
    contract: buildCareerContractView(input.contract),
  };
}

function buildRoleViews(input: CareerPlayerProfileInput): readonly CareerPlayerRoleView[] {
  const roles = new Map<CanonicalPlayerRole, PositionSuitability>();
  roles.set(input.primaryRole, "natural");
  for (const role of input.roles) {
    if (roles.has(role.role)) continue;
    roles.set(role.role, role.suitability);
  }

  return [...roles.entries()]
    .sort(([left], [right]) => canonicalPlayerRoleOrder(left) - canonicalPlayerRoleOrder(right))
    .map(([role, suitability]) => ({
      role,
      labelKey: `career.player.role.${role}`,
      suitability,
      isPrimary: role === input.primaryRole,
    }));
}

function buildAttributeGroups(
  abilities: PlayerAbilities,
  primaryRole: CanonicalPlayerRole,
): readonly CareerPlayerAttributeGroupView[] {
  const profile = getPlayerRoleProfile(playerIdentityRole(primaryRole));
  return ATTRIBUTE_FAMILY_ORDER.map((family) => ({
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

function attributePriority(
  profile: ReturnType<typeof getPlayerRoleProfile>,
  key: PlayerAbilityKey,
): number {
  if (profile.coreForRole.includes(key)) return 0;
  if (profile.secondaryForRole.includes(key)) return 1;
  if (profile.allowedButLow.includes(key)) return 2;
  return 3;
}

function playerIdentityRole(role: CanonicalPlayerRole): PlayerRole {
  if (role === "right_full_back" || role === "left_full_back") return "full_back";
  if (role === "right_midfielder" || role === "left_midfielder") return "wide_midfielder";
  if (role === "right_winger" || role === "left_winger") return "winger";
  return role;
}

function attributeFamily(key: PlayerAbilityKey): CareerPlayerAttributeFamily {
  return key.slice(0, key.indexOf(".")) as CareerPlayerAttributeFamily;
}

function assertValidProfileInput(input: CareerPlayerProfileInput): void {
  if (!Number.isInteger(input.shirtNumber) || input.shirtNumber <= 0) {
    throw new RangeError(`Invalid shirt number for player profile: ${input.shirtNumber}`);
  }
  if (!Number.isInteger(input.age) || input.age < 15) {
    throw new RangeError(`Invalid player age for player profile: ${input.age}`);
  }
}
