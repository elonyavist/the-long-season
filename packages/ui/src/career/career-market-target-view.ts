import {
  canonicalPlayerRoleOrder,
  type CanonicalPlayerRole,
  type CurrencyCode,
  type Money,
  type PositionSuitability,
} from "@game/domain";

import { hasCareerContractExpiryAlert } from "./career-contract-expiry.ts";
import type { CareerSquadPlayerLevel } from "./career-squad-view.ts";

/** Stable market actions exposed by a target row or target detail. */
export type CareerMarketTargetAction =
  | "submit_transfer_offer"
  | "submit_free_agent_contract_offer"
  | "submit_preliminary_agreement";

/** Public reason why the next market action cannot currently be submitted. */
export type CareerMarketTargetBlockReason =
  | "outside_transfer_window"
  | "preliminary_agreement_not_yet_eligible"
  | "own_player"
  | "player_not_for_sale"
  | "negotiation_already_open"
  | "future_agreement_already_exists"
  | "registration_unavailable"
  | "unaffordable";

/** Engine-projected eligibility; the read model never recreates market policy. */
export type CareerMarketTargetEligibility =
  | {
      readonly status: "allowed";
      readonly action: CareerMarketTargetAction;
    }
  | {
      readonly status: "blocked";
      readonly reason: CareerMarketTargetBlockReason;
      readonly nextAllowedOnIso?: string;
    };

/** Public employment and contract facts for a market target. */
export type CareerMarketEmploymentInput =
  | {
      readonly status: "contracted";
      readonly clubId: string;
      readonly clubName: string;
      readonly contractEndsOnIso: string;
      readonly contractRemainingDays: number;
    }
  | {
      readonly status: "free_agent";
    };

/** Public transfer posture supplied by the canonical market query. */
export type CareerMarketAvailability =
  | "available"
  | "negotiable"
  | "not_for_sale"
  | "free_agent";

/** One role and the player's public suitability for it. */
export interface CareerMarketRoleFitInput {
  readonly role: CanonicalPlayerRole;
  readonly suitability: PositionSuitability;
  readonly isPrimary: boolean;
}

/** Complete public facts required to project one market target. */
export interface CareerMarketTargetInput {
  readonly playerId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly age: number;
  readonly primaryRole: CanonicalPlayerRole;
  readonly roleFits: readonly CareerMarketRoleFitInput[];
  readonly condition: number;
  readonly form: number;
  readonly morale: number;
  readonly currentLevel: CareerSquadPlayerLevel;
  readonly potentialLevel: CareerSquadPlayerLevel;
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly employment: CareerMarketEmploymentInput;
  readonly availability: CareerMarketAvailability;
  readonly eligibility: CareerMarketTargetEligibility;
}

/** Contract-horizon groups visible in the market filters. */
export type CareerMarketContractHorizon = "free_agent" | "expiring" | "secure";

/** Supported target-list filters. Every value affects visible output. */
export interface CareerMarketTargetFilters {
  readonly query?: string;
  readonly role?: CanonicalPlayerRole;
  readonly minimumAge?: number;
  readonly maximumAge?: number;
  readonly employment?: CareerMarketEmploymentInput["status"];
  readonly contractHorizon?: CareerMarketContractHorizon;
  readonly minimumValue?: Money;
  readonly maximumValue?: Money;
  readonly eligibility?: "actionable" | "blocked";
}

/** Stable target columns and deterministic sort keys. */
export type CareerMarketTargetSortKey =
  | "player"
  | "club"
  | "age"
  | "role"
  | "current_level"
  | "potential_level"
  | "value"
  | "contract"
  | "availability"
  | "eligibility";

/** Optional target-list ordering chosen by the manager. */
export interface CareerMarketTargetSort {
  readonly key: CareerMarketTargetSortKey;
  readonly direction: "ascending" | "descending";
}

/** One compact row for the market browser. */
export interface CareerMarketTargetRowView {
  readonly playerId: string;
  readonly displayName: string;
  readonly age: number;
  readonly primaryRole: CanonicalPlayerRole;
  readonly currentLevel: CareerSquadPlayerLevel;
  readonly potentialLevel: CareerSquadPlayerLevel;
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly employment: CareerMarketEmploymentInput;
  readonly contractHorizon: CareerMarketContractHorizon;
  readonly availability: CareerMarketAvailability;
  readonly eligibility: CareerMarketTargetEligibility;
}

/** Public target detail used by the full-screen market inspection surface. */
export interface CareerMarketTargetDetailView extends CareerMarketTargetRowView {
  readonly condition: number;
  readonly form: number;
  readonly morale: number;
  readonly roleFits: readonly CareerMarketRoleFitInput[];
}

/** Framework-free target catalog consumed by Market renderers. */
export interface CareerMarketTargetCatalogView {
  readonly status: "empty" | "populated";
  readonly rows: readonly CareerMarketTargetRowView[];
  readonly detailsByPlayerId: ReadonlyMap<string, CareerMarketTargetDetailView>;
  readonly totalTargetCount: number;
  readonly visibleTargetCount: number;
  readonly filters: CareerMarketTargetFilters;
  readonly sort?: CareerMarketTargetSort;
}

const LEVEL_ORDER: Readonly<Record<CareerSquadPlayerLevel, number>> = {
  depth: 0,
  squad: 1,
  first_team: 2,
  leading: 3,
};

/** Builds the public target catalog without exposing exact hidden ability. */
export function buildCareerMarketTargetCatalog(
  targets: readonly CareerMarketTargetInput[],
  filters: CareerMarketTargetFilters = {},
  sort?: CareerMarketTargetSort,
): CareerMarketTargetCatalogView {
  assertUniqueTargets(targets);
  const details = targets.map(buildTargetDetail);
  const rows = sortCareerMarketTargetRows(
    filterCareerMarketTargetRows(details, filters),
    sort,
  );

  return {
    status: rows.length === 0 ? "empty" : "populated",
    rows,
    detailsByPlayerId: new Map(details.map((detail) => [detail.playerId, detail])),
    totalTargetCount: details.length,
    visibleTargetCount: rows.length,
    filters,
    ...(sort === undefined ? {} : { sort }),
  };
}

/** Applies all target filters without relying on browser state. */
export function filterCareerMarketTargetRows(
  rows: readonly CareerMarketTargetRowView[],
  filters: CareerMarketTargetFilters,
): readonly CareerMarketTargetRowView[] {
  const query = filters.query?.trim().toLocaleLowerCase("en") ?? "";

  return rows.filter((row) => {
    if (
      query.length > 0
      && !row.displayName.toLocaleLowerCase("en").includes(query)
      && !employmentLabel(row.employment).toLocaleLowerCase("en").includes(query)
    ) return false;
    if (filters.role !== undefined && row.primaryRole !== filters.role) return false;
    if (filters.minimumAge !== undefined && row.age < filters.minimumAge) return false;
    if (filters.maximumAge !== undefined && row.age > filters.maximumAge) return false;
    if (filters.employment !== undefined && row.employment.status !== filters.employment) return false;
    if (filters.contractHorizon !== undefined && row.contractHorizon !== filters.contractHorizon) return false;
    if (filters.minimumValue !== undefined && row.value < filters.minimumValue) return false;
    if (filters.maximumValue !== undefined && row.value > filters.maximumValue) return false;
    if (filters.eligibility === "actionable" && row.eligibility.status !== "allowed") return false;
    if (filters.eligibility === "blocked" && row.eligibility.status !== "blocked") return false;
    return true;
  });
}

/** Sorts target rows with stable role, name, and player-ID tie-breakers. */
export function sortCareerMarketTargetRows(
  rows: readonly CareerMarketTargetRowView[],
  sort?: CareerMarketTargetSort,
): readonly CareerMarketTargetRowView[] {
  return [...rows].sort((left, right) => {
    if (sort !== undefined) {
      const compared = compareTargetRows(left, right, sort.key);
      if (compared !== 0) return sort.direction === "ascending" ? compared : -compared;
    }

    return canonicalPlayerRoleOrder(left.primaryRole) - canonicalPlayerRoleOrder(right.primaryRole)
      || left.displayName.localeCompare(right.displayName)
      || left.playerId.localeCompare(right.playerId);
  });
}

function buildTargetDetail(target: CareerMarketTargetInput): CareerMarketTargetDetailView {
  assertTarget(target);
  return {
    playerId: target.playerId,
    displayName: `${target.firstName} ${target.lastName}`.trim(),
    age: target.age,
    primaryRole: target.primaryRole,
    currentLevel: target.currentLevel,
    potentialLevel: target.potentialLevel,
    value: target.value,
    currency: target.currency,
    employment: copyEmployment(target.employment),
    contractHorizon: contractHorizon(target.employment),
    availability: target.availability,
    eligibility: copyEligibility(target.eligibility),
    condition: target.condition,
    form: target.form,
    morale: target.morale,
    roleFits: [...target.roleFits]
      .sort((left, right) => (
        Number(right.isPrimary) - Number(left.isPrimary)
        || canonicalPlayerRoleOrder(left.role) - canonicalPlayerRoleOrder(right.role)
      )),
  };
}

function contractHorizon(employment: CareerMarketEmploymentInput): CareerMarketContractHorizon {
  if (employment.status === "free_agent") return "free_agent";
  return hasCareerContractExpiryAlert(employment.contractRemainingDays) ? "expiring" : "secure";
}

function compareTargetRows(
  left: CareerMarketTargetRowView,
  right: CareerMarketTargetRowView,
  key: CareerMarketTargetSortKey,
): number {
  switch (key) {
    case "player": return left.displayName.localeCompare(right.displayName);
    case "club": return employmentLabel(left.employment).localeCompare(employmentLabel(right.employment));
    case "age": return left.age - right.age;
    case "role": return canonicalPlayerRoleOrder(left.primaryRole) - canonicalPlayerRoleOrder(right.primaryRole);
    case "current_level": return LEVEL_ORDER[left.currentLevel] - LEVEL_ORDER[right.currentLevel];
    case "potential_level": return LEVEL_ORDER[left.potentialLevel] - LEVEL_ORDER[right.potentialLevel];
    case "value": return left.value - right.value;
    case "contract": return remainingContractDays(left.employment) - remainingContractDays(right.employment);
    case "availability": return left.availability.localeCompare(right.availability);
    case "eligibility": return left.eligibility.status.localeCompare(right.eligibility.status);
  }
}

function employmentLabel(employment: CareerMarketEmploymentInput): string {
  return employment.status === "free_agent" ? "" : employment.clubName;
}

function remainingContractDays(employment: CareerMarketEmploymentInput): number {
  return employment.status === "free_agent" ? -1 : employment.contractRemainingDays;
}

function copyEmployment(employment: CareerMarketEmploymentInput): CareerMarketEmploymentInput {
  return employment.status === "free_agent" ? { status: "free_agent" } : { ...employment };
}

function copyEligibility(eligibility: CareerMarketTargetEligibility): CareerMarketTargetEligibility {
  return eligibility.status === "allowed"
    ? { ...eligibility }
    : {
        status: "blocked",
        reason: eligibility.reason,
        ...(eligibility.nextAllowedOnIso === undefined
          ? {}
          : { nextAllowedOnIso: eligibility.nextAllowedOnIso }),
      };
}

function assertUniqueTargets(targets: readonly CareerMarketTargetInput[]): void {
  const seen = new Set<string>();
  for (const target of targets) {
    if (seen.has(target.playerId)) throw new Error(`Duplicate market target: ${target.playerId}`);
    seen.add(target.playerId);
  }
}

function assertTarget(target: CareerMarketTargetInput): void {
  if (!Number.isInteger(target.age) || target.age < 15) {
    throw new Error(`Market target age must be an integer of at least 15: ${target.playerId}`);
  }
  if (
    target.employment.status === "contracted"
    && (!Number.isInteger(target.employment.contractRemainingDays)
      || target.employment.contractRemainingDays < 0)
  ) {
    throw new Error(`Contract remaining days must be a non-negative integer: ${target.playerId}`);
  }
}
