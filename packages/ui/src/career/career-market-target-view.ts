import {
  canonicalPlayerRoleOrder,
  type CanonicalPlayerRole,
  type ClubCategory,
  type CurrencyCode,
  type Money,
  type PositionSuitability,
} from "@game/domain";

import { hasCareerContractExpiryAlert } from "./career-contract-expiry.ts";
import {
  compareCareerPlayerPotentialRanges,
  careerPlayerRatingSortScore,
  copyCareerPlayerPotentialRange,
  copyCareerPlayerRating,
  type CareerPlayerPotentialRangeView,
  type CareerPlayerRatingView,
} from "./career-player-rating.ts";
import {
  buildCareerPlayerDetailView,
  type CareerPlayerDetailInput,
  type CareerPlayerDetailView,
} from "./career-player-detail-view.ts";

/** Fixed row count for every Market result page. */
export const CAREER_MARKET_PAGE_SIZE = 25;

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
      readonly competitionId: string;
      readonly competitionName: string;
      readonly sourceTier: ClubCategory;
      readonly contractEndsOnIso: string;
      readonly contractRemainingDays: number;
    }
  | {
      readonly status: "free_agent";
      readonly sourceTier: "free_agent";
    };

/** Persisted source tier exposed by every Market target. */
export type CareerMarketSourceTier = ClubCategory | "free_agent";

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
  readonly currentRating: CareerPlayerRatingView;
  readonly potentialRange: CareerPlayerPotentialRangeView;
  readonly publicValue: Money;
  /** Seller request for contracted players, frozen from the engine preview. */
  readonly askingPrice?: Money;
  /** Exact zero transfer fee shown only for a free-agent target. */
  readonly freeAgentTransferFee?: Money;
  readonly currency: CurrencyCode;
  readonly employment: CareerMarketEmploymentInput;
  readonly availability: CareerMarketAvailability;
  readonly eligibility: CareerMarketTargetEligibility;
  /**
   * Resolves exact current abilities and statistics only when this target is
   * opened. This presentation-only callback is never persisted or serialized.
   */
  readonly resolveDetail?: () => CareerMarketTargetDetailInput;
}

/**
 * Expensive per-player facts kept outside the light Market row contract.
 *
 * Reusing the shared detail input prevents Squad and Market from defining
 * separate attribute or statistics policies.
 */
export type CareerMarketTargetDetailInput = Pick<
  CareerPlayerDetailInput,
  "currentAbilities" | "statistics"
>;

/** Contract-horizon groups visible in the market filters. */
export type CareerMarketContractHorizon = "free_agent" | "expiring" | "secure";

/** Supported target-list filters. Every value affects visible output. */
export interface CareerMarketTargetFilters {
  readonly query?: string;
  readonly role?: CanonicalPlayerRole;
  readonly minimumAge?: number;
  readonly maximumAge?: number;
  readonly employment?: CareerMarketEmploymentInput["status"];
  readonly sourceTier?: CareerMarketSourceTier;
  readonly contractHorizon?: CareerMarketContractHorizon;
  readonly minimumValue?: Money;
  readonly maximumValue?: Money;
  readonly eligibility?: "actionable" | "blocked";
}

/** Stable target columns and deterministic sort keys. */
export type CareerMarketTargetSortKey =
  | "player"
  | "club"
  | "tier"
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
  readonly currentRating: CareerPlayerRatingView;
  readonly potentialRange: CareerPlayerPotentialRangeView;
  readonly publicValue: Money;
  readonly askingPrice?: Money;
  readonly freeAgentTransferFee?: Money;
  readonly currency: CurrencyCode;
  readonly employment: CareerMarketEmploymentInput;
  readonly contractHorizon: CareerMarketContractHorizon;
  readonly availability: CareerMarketAvailability;
  readonly eligibility: CareerMarketTargetEligibility;
}

/** Public target detail used by the full-screen market inspection surface. */
export interface CareerMarketTargetDetailView
  extends CareerMarketTargetRowView, CareerPlayerDetailView {
  readonly condition: number;
  readonly form: number;
  readonly morale: number;
}

/** Framework-free target catalog consumed by Market renderers. */
export interface CareerMarketTargetCatalogView {
  readonly status: "empty" | "populated";
  readonly rows: readonly CareerMarketTargetRowView[];
  readonly totalTargetCount: number;
  readonly visibleTargetCount: number;
  readonly filters: CareerMarketTargetFilters;
  readonly sort?: CareerMarketTargetSort;
  /**
   * Resolves and memoizes one opened target detail without precomputing the
   * exact attributes or archive statistics of every Market row. Unknown or
   * incomplete targets resolve to `undefined` instead of breaking the screen.
   */
  readonly resolveDetail: (
    playerId: string,
  ) => CareerMarketTargetDetailView | undefined;
}

/** One deterministic page sliced from an already filtered and sorted catalog. */
export interface CareerMarketTargetPageView {
  readonly rows: readonly CareerMarketTargetRowView[];
  readonly currentPage: number;
  readonly pageCount: number;
  readonly pageSize: typeof CAREER_MARKET_PAGE_SIZE;
  readonly matchingTargetCount: number;
  /** One-based position of the first row, or zero when no rows match. */
  readonly firstVisibleTarget: number;
  /** One-based position of the last row, or zero when no rows match. */
  readonly lastVisibleTarget: number;
}

/** Builds the public target catalog without exposing exact hidden ability. */
export function buildCareerMarketTargetCatalog(
  targets: readonly CareerMarketTargetInput[],
  filters: CareerMarketTargetFilters = {},
  sort?: CareerMarketTargetSort,
): CareerMarketTargetCatalogView {
  assertUniqueTargets(targets);
  const rowsByPlayerId = new Map(
    targets.map((target) => [target.playerId, target] as const),
  );
  const resolvedDetails = new Map<string, CareerMarketTargetDetailView>();
  const allRows = targets.map(buildTargetRow);
  const rows = sortCareerMarketTargetRows(
    filterCareerMarketTargetRows(allRows, filters),
    sort,
  );

  return {
    status: rows.length === 0 ? "empty" : "populated",
    rows,
    totalTargetCount: allRows.length,
    visibleTargetCount: rows.length,
    filters,
    ...(sort === undefined ? {} : { sort }),
    resolveDetail(playerId) {
      const resolved = resolvedDetails.get(playerId);
      if (resolved !== undefined) return resolved;
      const target = rowsByPlayerId.get(playerId);
      if (target === undefined || target.resolveDetail === undefined) return undefined;
      try {
        const detail = buildCareerMarketTargetDetailView(
          target,
          target.resolveDetail(),
        );
        resolvedDetails.set(playerId, detail);
        return detail;
      } catch {
        return undefined;
      }
    },
  };
}

/**
 * Slices one bounded page after the caller has applied canonical filtering and
 * sorting. Oversized requests clamp to the final page; empty results stay 1/1.
 */
export function paginateCareerMarketTargetRows(
  rows: readonly CareerMarketTargetRowView[],
  requestedPage = 1,
): CareerMarketTargetPageView {
  const pageCount = Math.max(1, Math.ceil(rows.length / CAREER_MARKET_PAGE_SIZE));
  const normalizedPage = Number.isSafeInteger(requestedPage) && requestedPage >= 1
    ? requestedPage
    : 1;
  const currentPage = Math.min(normalizedPage, pageCount);
  const startIndex = (currentPage - 1) * CAREER_MARKET_PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + CAREER_MARKET_PAGE_SIZE);

  return {
    rows: pageRows,
    currentPage,
    pageCount,
    pageSize: CAREER_MARKET_PAGE_SIZE,
    matchingTargetCount: rows.length,
    firstVisibleTarget: pageRows.length === 0 ? 0 : startIndex + 1,
    lastVisibleTarget: pageRows.length === 0 ? 0 : startIndex + pageRows.length,
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
      && !competitionLabel(row.employment).toLocaleLowerCase("en").includes(query)
    ) return false;
    if (filters.role !== undefined && row.primaryRole !== filters.role) return false;
    if (filters.minimumAge !== undefined && row.age < filters.minimumAge) return false;
    if (filters.maximumAge !== undefined && row.age > filters.maximumAge) return false;
    if (filters.employment !== undefined && row.employment.status !== filters.employment) return false;
    if (filters.sourceTier !== undefined && row.employment.sourceTier !== filters.sourceTier) return false;
    if (filters.contractHorizon !== undefined && row.contractHorizon !== filters.contractHorizon) return false;
    if (filters.minimumValue !== undefined && row.publicValue < filters.minimumValue) return false;
    if (filters.maximumValue !== undefined && row.publicValue > filters.maximumValue) return false;
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
      if (sort.key === "potential_level") {
        return comparePotentialRows(left, right, sort.direction);
      }
      const compared = compareTargetRows(left, right, sort.key);
      if (compared !== 0) return sort.direction === "ascending" ? compared : -compared;
    }

    return canonicalPlayerRoleOrder(left.primaryRole) - canonicalPlayerRoleOrder(right.primaryRole)
      || left.displayName.localeCompare(right.displayName)
      || left.playerId.localeCompare(right.playerId);
  });
}

/** Builds one opened target detail through the shared player-detail policy. */
export function buildCareerMarketTargetDetailView(
  target: CareerMarketTargetInput,
  detailInput: CareerMarketTargetDetailInput,
): CareerMarketTargetDetailView {
  const row = buildTargetRow(target);
  const detail = buildCareerPlayerDetailView({
    playerId: target.playerId,
    primaryRole: target.primaryRole,
    roles: target.roleFits.map((fit) => ({
      role: fit.role,
      suitability: fit.suitability,
    })),
    currentAbilities: detailInput.currentAbilities,
    statistics: detailInput.statistics,
  });

  return {
    ...row,
    ...detail,
    condition: target.condition,
    form: target.form,
    morale: target.morale,
  };
}

/** Copies only facts needed by the always-visible Market table. */
function buildTargetRow(target: CareerMarketTargetInput): CareerMarketTargetRowView {
  assertTarget(target);
  return {
    playerId: target.playerId,
    displayName: `${target.firstName} ${target.lastName}`.trim(),
    age: target.age,
    primaryRole: target.primaryRole,
    currentRating: copyCareerPlayerRating(target.currentRating),
    potentialRange: copyCareerPlayerPotentialRange(target.potentialRange),
    publicValue: target.publicValue,
    ...(target.askingPrice === undefined ? {} : { askingPrice: target.askingPrice }),
    ...(target.freeAgentTransferFee === undefined
      ? {}
      : { freeAgentTransferFee: target.freeAgentTransferFee }),
    currency: target.currency,
    employment: copyEmployment(target.employment),
    contractHorizon: contractHorizon(target.employment),
    availability: target.availability,
    eligibility: copyEligibility(target.eligibility),
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
    case "tier": return tierRank(left.employment.sourceTier) - tierRank(right.employment.sourceTier);
    case "age": return left.age - right.age;
    case "role": return canonicalPlayerRoleOrder(left.primaryRole) - canonicalPlayerRoleOrder(right.primaryRole);
    case "current_level":
      return careerPlayerRatingSortScore(left.currentRating)
        - careerPlayerRatingSortScore(right.currentRating);
    case "potential_level":
      return compareCareerPlayerPotentialRanges(
        left.potentialRange,
        right.potentialRange,
      );
    case "value": return left.publicValue - right.publicValue;
    case "contract": return remainingContractDays(left.employment) - remainingContractDays(right.employment);
    case "availability": return left.availability.localeCompare(right.availability);
    case "eligibility": return left.eligibility.status.localeCompare(right.eligibility.status);
  }
}

function comparePotentialRows(
  left: CareerMarketTargetRowView,
  right: CareerMarketTargetRowView,
  direction: CareerMarketTargetSort["direction"],
): number {
  const projectionOrder = compareCareerPlayerPotentialRanges(
    left.potentialRange,
    right.potentialRange,
  );
  const currentOrder = careerPlayerRatingSortScore(left.currentRating)
    - careerPlayerRatingSortScore(right.currentRating);
  const directionMultiplier = direction === "ascending" ? 1 : -1;
  return projectionOrder * directionMultiplier
    || currentOrder * directionMultiplier
    || left.playerId.localeCompare(right.playerId);
}

function employmentLabel(employment: CareerMarketEmploymentInput): string {
  return employment.status === "free_agent" ? "" : employment.clubName;
}

function competitionLabel(employment: CareerMarketEmploymentInput): string {
  return employment.status === "free_agent" ? "" : employment.competitionName;
}

function tierRank(tier: CareerMarketSourceTier): number {
  if (tier === "first_division") return 1;
  if (tier === "second_division") return 2;
  if (tier === "third_division") return 3;
  return 4;
}

function remainingContractDays(employment: CareerMarketEmploymentInput): number {
  return employment.status === "free_agent" ? -1 : employment.contractRemainingDays;
}

function copyEmployment(employment: CareerMarketEmploymentInput): CareerMarketEmploymentInput {
  return employment.status === "free_agent"
    ? { status: "free_agent", sourceTier: "free_agent" }
    : { ...employment };
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
