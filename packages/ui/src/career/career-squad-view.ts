import {
  canonicalPlayerRoleDepartment,
  canonicalPlayerRoleOrder,
  type CanonicalPlayerRole,
  type CanonicalPlayerRoleDepartment,
  type CurrencyCode,
  type Money,
  type PositionSuitability,
} from "@game/domain";

import {
  compareCareerPlayerPotentialRanges,
  careerPlayerRatingSortScore,
  copyCareerPlayerPotentialRange,
  copyCareerPlayerRating,
  type CareerPlayerPotentialRangeView,
  type CareerPlayerRatingView,
} from "./career-player-rating.ts";

/** Durable match-plan placement kept separate from player availability. */
export type CareerSquadSelection = "starting_xi" | "substitute" | "unselected";

/** Reasons that make a selected player unavailable without removing him. */
export type CareerSquadAvailabilityReason = "injured" | "suspended";

/** Composite row status used by the compact Status column. */
export type CareerSquadCompositeStatus =
  | "injured"
  | "suspended"
  | "starting_xi"
  | "substitute"
  | "available";

/** Locked Senior Squad table columns in their product-approved order. */
export const CAREER_SQUAD_COLUMNS = [
  "number",
  "role",
  "placement",
  "player",
  "age",
  "condition",
  "morale",
  "status",
  "value",
  "current_level",
  "potential_level",
  "action",
] as const;

/** Stable column key for rendering, sorting, and accessibility metadata. */
export type CareerSquadColumnKey = (typeof CAREER_SQUAD_COLUMNS)[number];

/** Columns that have a deterministic framework-free comparator. */
export type CareerSquadSortKey = Exclude<CareerSquadColumnKey, "action">;

/** Supported deterministic sort direction. */
export type CareerSquadSortDirection = "ascending" | "descending";

/** Filter keys shared by the future Squad table and tests. */
export interface CareerSquadFilters {
  readonly query?: string;
  readonly department?: CanonicalPlayerRoleDepartment;
  readonly selection?: CareerSquadSelection;
  readonly availability?: "available" | "unavailable" | CareerSquadAvailabilityReason;
  readonly contract?: "expiring" | "secure";
}

/** Optional user sort applied after filtering. */
export interface CareerSquadSort {
  readonly key: CareerSquadSortKey;
  readonly direction: CareerSquadSortDirection;
}

/** One tactical destination available to an explicit field-player command. */
export interface CareerSquadSlotChoiceInput {
  readonly slotKey: string;
  readonly labelKey: string;
  readonly role: CanonicalPlayerRole;
  readonly suitability: PositionSuitability;
  readonly occupantPlayerId?: string;
  readonly occupantName?: string;
  readonly occupantCurrentRating?: CareerPlayerRatingView;
  readonly occupantCondition?: number;
}

/** Safe public facts required for one Senior Squad row. */
export interface CareerSquadPlayerInput {
  readonly playerId: string;
  readonly shirtNumber: number;
  readonly firstName: string;
  readonly lastName: string;
  /** Canonical integer age already derived by the adapter; never recomputed here. */
  readonly age: number;
  readonly primaryRole: CanonicalPlayerRole;
  readonly condition: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentRating: CareerPlayerRatingView;
  readonly potentialRange: CareerPlayerPotentialRangeView;
  /** The adapter owns the renewal-window rule and supplies only its public result. */
  readonly hasExpiringContract: boolean;
  readonly lineupSlotChoices: readonly CareerSquadSlotChoiceInput[];
  readonly selectedLineupSlotKey?: string;
  readonly selectedBenchSlotKey?: string;
  readonly availableBenchSlotKey?: string;
}

/** Render metadata for one locked table column. */
export interface CareerSquadColumnView {
  readonly key: CareerSquadColumnKey;
  readonly labelKey: string;
  readonly sortKey?: CareerSquadSortKey;
}

/** Explicit target for filling an empty slot or replacing its current player. */
export interface CareerSquadSlotChoiceView {
  readonly slotKey: string;
  readonly labelKey: string;
  readonly role: CanonicalPlayerRole;
  readonly suitability: Exclude<PositionSuitability, "invalid">;
  readonly isEmpty: boolean;
  readonly occupantPlayerId?: string;
  readonly occupantName?: string;
  readonly occupantCurrentRating?: CareerPlayerRatingView;
  readonly occupantCondition?: number;
}

/**
 * Stable native-select value for one Squad placement.
 *
 * The prefix keeps HTML values unambiguous while the option itself remains a
 * structured target, so renderers never have to infer football rules.
 */
export type CareerSquadPlacementValue =
  | "unselected"
  | `bench:${string}`
  | `lineup:${string}`;

/** The explicit `Non convocato` destination shared by every Squad row. */
export interface CareerSquadUnselectedPlacementOptionView {
  readonly kind: "unselected";
  readonly value: "unselected";
  readonly labelKey: "career.squad.placement.unselected";
}

/** One concrete bench destination exposed only when that move is possible. */
export interface CareerSquadBenchPlacementOptionView {
  readonly kind: "bench";
  readonly value: `bench:${string}`;
  readonly labelKey: "career.squad.placement.bench";
  readonly slotKey: string;
  readonly isEmpty: boolean;
  readonly occupantPlayerId?: string;
}

/** One legal real-XI destination, including its current occupant when present. */
export interface CareerSquadLineupPlacementOptionView extends CareerSquadSlotChoiceView {
  readonly kind: "lineup";
  readonly value: `lineup:${string}`;
}

/** One native-select option for changing a player's current placement. */
export type CareerSquadPlacementOptionView =
  | CareerSquadUnselectedPlacementOptionView
  | CareerSquadBenchPlacementOptionView
  | CareerSquadLineupPlacementOptionView;

/** Current value and truthful options for one Squad placement select. */
export interface CareerSquadPlacementView {
  readonly value: CareerSquadPlacementValue;
  readonly options: readonly CareerSquadPlacementOptionView[];
}

/** One fully projected row with no hidden numeric ability or potential. */
export interface CareerSquadPlayerRowView {
  readonly playerId: string;
  readonly shirtNumber: number;
  readonly displayName: string;
  /** Canonical integer age carried through unchanged for display and sorting. */
  readonly age: number;
  readonly primaryRole: CanonicalPlayerRole;
  readonly department: CanonicalPlayerRoleDepartment;
  readonly condition: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly compositeStatus: CareerSquadCompositeStatus;
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentRating: CareerPlayerRatingView;
  readonly potentialRange: CareerPlayerPotentialRangeView;
  readonly hasExpiringContract: boolean;
  readonly placement: CareerSquadPlacementView;
  /** Sorted legal XI targets retained for the detailed contextual-menu chooser. */
  readonly lineupChoices: readonly CareerSquadSlotChoiceView[];
}

/** Input for the complete framework-free Senior Squad table view. */
export interface BuildCareerSquadViewInput {
  readonly players: readonly CareerSquadPlayerInput[];
  readonly filters?: CareerSquadFilters;
  readonly sort?: CareerSquadSort;
}

/** Complete Senior Squad table contract consumed by a renderer. */
export interface CareerSquadView {
  readonly screenKey: "career.squad";
  readonly columns: readonly CareerSquadColumnView[];
  readonly rows: readonly CareerSquadPlayerRowView[];
  readonly totalPlayerCount: number;
  readonly visiblePlayerCount: number;
  readonly filters: CareerSquadFilters;
  readonly sort?: CareerSquadSort;
}

const COLUMN_VIEWS: readonly CareerSquadColumnView[] = CAREER_SQUAD_COLUMNS.map((key) => ({
  key,
  labelKey: `career.squad.column.${key}`,
  ...(key === "action" ? {} : { sortKey: key }),
}));

const SUITABILITY_ORDER: Readonly<Record<PositionSuitability, number>> = {
  natural: 0,
  adapted: 1,
  weak: 2,
  invalid: 3,
};

const PLACEMENT_ORDER: Readonly<Record<CareerSquadSelection, number>> = {
  starting_xi: 0,
  substitute: 1,
  unselected: 2,
};

/** Builds the stable Senior Squad table without mutating source facts. */
export function buildCareerSquadView(input: BuildCareerSquadViewInput): CareerSquadView {
  assertUniquePlayers(input.players);
  const rows = input.players.map(buildPlayerRow);
  const filteredRows = filterCareerSquadRows(rows, input.filters ?? {});
  const sortedRows = sortCareerSquadRows(filteredRows, input.sort);

  return {
    screenKey: "career.squad",
    columns: COLUMN_VIEWS,
    rows: sortedRows,
    totalPlayerCount: rows.length,
    visiblePlayerCount: sortedRows.length,
    filters: input.filters ?? {},
    ...(input.sort === undefined ? {} : { sort: input.sort }),
  };
}

/** Applies product-approved Squad filters without depending on a renderer. */
export function filterCareerSquadRows(
  rows: readonly CareerSquadPlayerRowView[],
  filters: CareerSquadFilters,
): readonly CareerSquadPlayerRowView[] {
  const query = filters.query?.trim().toLocaleLowerCase("en") ?? "";

  return rows.filter((row) => {
    if (query.length > 0 && !row.displayName.toLocaleLowerCase("en").includes(query)) return false;
    if (filters.department !== undefined && row.department !== filters.department) return false;
    if (filters.selection !== undefined && row.selection !== filters.selection) return false;
    if (filters.contract === "expiring" && !row.hasExpiringContract) return false;
    if (filters.contract === "secure" && row.hasExpiringContract) return false;
    if (filters.availability === "available" && row.availabilityReasons.length > 0) return false;
    if (filters.availability === "unavailable" && row.availabilityReasons.length === 0) return false;
    if (
      filters.availability !== undefined
      && filters.availability !== "available"
      && filters.availability !== "unavailable"
      && !row.availabilityReasons.includes(filters.availability)
    ) return false;
    return true;
  });
}

/** Sorts Squad rows with stable football-role and player-ID tie-breakers. */
export function sortCareerSquadRows(
  rows: readonly CareerSquadPlayerRowView[],
  sort?: CareerSquadSort,
): readonly CareerSquadPlayerRowView[] {
  return [...rows].sort((left, right) => {
    if (sort !== undefined) {
      if (sort.key === "potential_level") {
        return comparePotentialRows(left, right, sort.direction);
      }
      const compared = compareBySortKey(left, right, sort.key);
      if (compared !== 0) return sort.direction === "ascending" ? compared : -compared;
    }

    return canonicalPlayerRoleOrder(left.primaryRole) - canonicalPlayerRoleOrder(right.primaryRole)
      || left.shirtNumber - right.shirtNumber
      || left.playerId.localeCompare(right.playerId);
  });
}

function buildPlayerRow(player: CareerSquadPlayerInput): CareerSquadPlayerRowView {
  return {
    playerId: player.playerId,
    shirtNumber: player.shirtNumber,
    displayName: `${player.firstName} ${player.lastName}`.trim(),
    age: player.age,
    primaryRole: player.primaryRole,
    department: canonicalPlayerRoleDepartment(player.primaryRole),
    condition: player.condition,
    morale: player.morale,
    selection: player.selection,
    availabilityReasons: [...player.availabilityReasons],
    compositeStatus: compositeStatus(player),
    value: player.value,
    currency: player.currency,
    currentRating: copyCareerPlayerRating(player.currentRating),
    potentialRange: copyCareerPlayerPotentialRange(player.potentialRange),
    hasExpiringContract: player.hasExpiringContract,
    placement: buildPlacement(player),
    lineupChoices: buildDetailedLineupChoices(player),
  };
}

function buildPlacement(player: CareerSquadPlayerInput): CareerSquadPlacementView {
  const value = currentPlacementValue(player);
  const options: CareerSquadPlacementOptionView[] = [{
    kind: "unselected",
    value: "unselected",
    labelKey: "career.squad.placement.unselected",
  }];

  if (canOfferNewPlacement(player)) {
    const isCurrentBenchSlot = player.selection === "substitute";
    const benchSlotKey = isCurrentBenchSlot
      ? player.selectedBenchSlotKey
      : player.availableBenchSlotKey;
    if (benchSlotKey !== undefined) {
      options.push({
        kind: "bench",
        value: benchPlacementValue(benchSlotKey),
        labelKey: "career.squad.placement.bench",
        slotKey: benchSlotKey,
        isEmpty: !isCurrentBenchSlot,
        ...(isCurrentBenchSlot ? { occupantPlayerId: player.playerId } : {}),
      });
    }

    options.push(...legalLineupChoices(player).map(toLineupPlacementOption));
  }

  if (!options.some((option) => option.value === value)) {
    throw new Error(`Current Squad placement is not available for player: ${player.playerId}`);
  }

  return { value, options };
}

function buildDetailedLineupChoices(
  player: CareerSquadPlayerInput,
): readonly CareerSquadSlotChoiceView[] {
  if (!canOfferNewPlacement(player)) {
    return [];
  }

  return legalLineupChoices(player)
    .map(toSlotChoiceView)
    .sort(compareSlotChoices);
}

function canOfferNewPlacement(player: CareerSquadPlayerInput): boolean {
  return player.availabilityReasons.length === 0 || player.selection !== "unselected";
}

function legalLineupChoices(
  player: CareerSquadPlayerInput,
): readonly (CareerSquadSlotChoiceInput & {
  readonly suitability: Exclude<PositionSuitability, "invalid">;
})[] {
  return player.lineupSlotChoices.filter((choice): choice is CareerSquadSlotChoiceInput & {
    readonly suitability: Exclude<PositionSuitability, "invalid">;
  } => choice.suitability !== "invalid");
}

function currentPlacementValue(player: CareerSquadPlayerInput): CareerSquadPlacementValue {
  if (player.selection === "starting_xi") {
    if (player.selectedLineupSlotKey === undefined) {
      throw new Error(`Starting Squad player has no lineup slot: ${player.playerId}`);
    }
    return lineupPlacementValue(player.selectedLineupSlotKey);
  }

  if (player.selection === "substitute") {
    if (player.selectedBenchSlotKey === undefined) {
      throw new Error(`Substitute Squad player has no bench slot: ${player.playerId}`);
    }
    return benchPlacementValue(player.selectedBenchSlotKey);
  }

  return "unselected";
}

function lineupPlacementValue(slotKey: string): `lineup:${string}` {
  return `lineup:${slotKey}`;
}

function benchPlacementValue(slotKey: string): `bench:${string}` {
  return `bench:${slotKey}`;
}

function toLineupPlacementOption(
  choice: CareerSquadSlotChoiceInput & {
    readonly suitability: Exclude<PositionSuitability, "invalid">;
  },
): CareerSquadLineupPlacementOptionView {
  return {
    kind: "lineup",
    value: lineupPlacementValue(choice.slotKey),
    ...toSlotChoiceView(choice),
  };
}

function toSlotChoiceView(
  choice: CareerSquadSlotChoiceInput & { readonly suitability: Exclude<PositionSuitability, "invalid"> },
): CareerSquadSlotChoiceView {
  return {
    slotKey: choice.slotKey,
    labelKey: choice.labelKey,
    role: choice.role,
    suitability: choice.suitability,
    isEmpty: choice.occupantPlayerId === undefined,
    ...(choice.occupantPlayerId === undefined ? {} : { occupantPlayerId: choice.occupantPlayerId }),
    ...(choice.occupantName === undefined ? {} : { occupantName: choice.occupantName }),
    ...(choice.occupantCurrentRating === undefined
      ? {}
      : { occupantCurrentRating: copyCareerPlayerRating(choice.occupantCurrentRating) }),
    ...(choice.occupantCondition === undefined ? {} : { occupantCondition: choice.occupantCondition }),
  };
}

function compareSlotChoices(left: CareerSquadSlotChoiceView, right: CareerSquadSlotChoiceView): number {
  return Number(right.isEmpty) - Number(left.isEmpty)
    || SUITABILITY_ORDER[left.suitability] - SUITABILITY_ORDER[right.suitability]
    || compareOptionalRating(left.occupantCurrentRating, right.occupantCurrentRating)
    || compareOptionalNumber(left.occupantCondition, right.occupantCondition)
    || (left.occupantPlayerId ?? "").localeCompare(right.occupantPlayerId ?? "")
    || canonicalPlayerRoleOrder(left.role) - canonicalPlayerRoleOrder(right.role)
    || left.slotKey.localeCompare(right.slotKey);
}

function compareOptionalRating(
  left: CareerPlayerRatingView | undefined,
  right: CareerPlayerRatingView | undefined,
): number {
  return (left === undefined ? Number.MAX_SAFE_INTEGER : careerPlayerRatingSortScore(left))
    - (right === undefined ? Number.MAX_SAFE_INTEGER : careerPlayerRatingSortScore(right));
}

function compareOptionalNumber(left: number | undefined, right: number | undefined): number {
  return (left ?? Number.MAX_SAFE_INTEGER) - (right ?? Number.MAX_SAFE_INTEGER);
}

function compositeStatus(player: CareerSquadPlayerInput): CareerSquadCompositeStatus {
  if (player.availabilityReasons.includes("injured")) return "injured";
  if (player.availabilityReasons.includes("suspended")) return "suspended";
  if (player.selection === "starting_xi") return "starting_xi";
  if (player.selection === "substitute") return "substitute";
  return "available";
}

function compareBySortKey(
  left: CareerSquadPlayerRowView,
  right: CareerSquadPlayerRowView,
  key: CareerSquadSortKey,
): number {
  switch (key) {
    case "number": return left.shirtNumber - right.shirtNumber;
    case "role": return canonicalPlayerRoleOrder(left.primaryRole) - canonicalPlayerRoleOrder(right.primaryRole);
    case "player": return left.displayName.localeCompare(right.displayName);
    case "age": return left.age - right.age;
    case "condition": return left.condition - right.condition;
    case "morale": return left.morale - right.morale;
    case "status": return left.compositeStatus.localeCompare(right.compositeStatus);
    case "placement":
      return PLACEMENT_ORDER[left.selection] - PLACEMENT_ORDER[right.selection]
        || left.placement.value.localeCompare(right.placement.value);
    case "value": return Number(left.value) - Number(right.value);
    case "current_level":
      return careerPlayerRatingSortScore(left.currentRating)
        - careerPlayerRatingSortScore(right.currentRating);
    case "potential_level":
      return compareCareerPlayerPotentialRanges(
        left.potentialRange,
        right.potentialRange,
      );
  }
}

function comparePotentialRows(
  left: CareerSquadPlayerRowView,
  right: CareerSquadPlayerRowView,
  direction: CareerSquadSortDirection,
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

function assertUniquePlayers(players: readonly CareerSquadPlayerInput[]): void {
  const seen = new Set<string>();
  for (const player of players) {
    if (seen.has(player.playerId)) throw new Error(`Duplicate player in Squad view: ${player.playerId}`);
    seen.add(player.playerId);
  }
}
