import {
  canonicalPlayerRoleDepartment,
  canonicalPlayerRoleOrder,
  type CanonicalPlayerRole,
  type CanonicalPlayerRoleDepartment,
  type CurrencyCode,
  type Money,
  type PositionSuitability,
} from "@game/domain";

/** Public club-relative level shown instead of hidden numeric ability. */
export type CareerSquadPlayerLevel = "leading" | "first_team" | "squad" | "depth";

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
  "player",
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
  readonly occupantCurrentLevel?: CareerSquadPlayerLevel;
  readonly occupantCondition?: number;
}

/** Safe public facts required for one Senior Squad row. */
export interface CareerSquadPlayerInput {
  readonly playerId: string;
  readonly shirtNumber: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly primaryRole: CanonicalPlayerRole;
  readonly condition: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentLevel: CareerSquadPlayerLevel;
  readonly potentialLevel: CareerSquadPlayerLevel;
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
  readonly occupantCurrentLevel?: CareerSquadPlayerLevel;
  readonly occupantCondition?: number;
}

/** Framework-free commands exposed by one player row. */
export type CareerSquadPlayerActionView =
  | {
      readonly actionId: "field_player";
      readonly labelKey: "career.squad.action.field";
      readonly mode: "direct" | "choose_slot";
      readonly choices: readonly CareerSquadSlotChoiceView[];
    }
  | {
      readonly actionId: "select_as_substitute";
      readonly labelKey: "career.squad.action.selectAsSubstitute";
      readonly slotKey: string;
    }
  | {
      readonly actionId: "remove_from_starting_xi";
      readonly labelKey: "career.squad.action.removeFromStartingXi";
      readonly slotKey: string;
    }
  | {
      readonly actionId: "remove_from_bench";
      readonly labelKey: "career.squad.action.removeFromBench";
      readonly slotKey: string;
    };

/** One fully projected row with no hidden numeric ability or potential. */
export interface CareerSquadPlayerRowView {
  readonly playerId: string;
  readonly shirtNumber: number;
  readonly displayName: string;
  readonly primaryRole: CanonicalPlayerRole;
  readonly department: CanonicalPlayerRoleDepartment;
  readonly condition: number;
  readonly morale: number;
  readonly selection: CareerSquadSelection;
  readonly availabilityReasons: readonly CareerSquadAvailabilityReason[];
  readonly compositeStatus: CareerSquadCompositeStatus;
  readonly value: Money;
  readonly currency: CurrencyCode;
  readonly currentLevel: CareerSquadPlayerLevel;
  readonly potentialLevel: CareerSquadPlayerLevel;
  readonly hasExpiringContract: boolean;
  readonly actions: readonly CareerSquadPlayerActionView[];
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

const LEVEL_ORDER: Readonly<Record<CareerSquadPlayerLevel, number>> = {
  depth: 0,
  squad: 1,
  first_team: 2,
  leading: 3,
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
    primaryRole: player.primaryRole,
    department: canonicalPlayerRoleDepartment(player.primaryRole),
    condition: player.condition,
    morale: player.morale,
    selection: player.selection,
    availabilityReasons: [...player.availabilityReasons],
    compositeStatus: compositeStatus(player),
    value: player.value,
    currency: player.currency,
    currentLevel: player.currentLevel,
    potentialLevel: player.potentialLevel,
    hasExpiringContract: player.hasExpiringContract,
    actions: buildActions(player),
  };
}

function buildActions(player: CareerSquadPlayerInput): readonly CareerSquadPlayerActionView[] {
  const actions: CareerSquadPlayerActionView[] = [];

  if (player.selection === "starting_xi" && player.selectedLineupSlotKey !== undefined) {
    actions.push({
      actionId: "remove_from_starting_xi",
      labelKey: "career.squad.action.removeFromStartingXi",
      slotKey: player.selectedLineupSlotKey,
    });
  } else if (player.selection === "substitute" && player.selectedBenchSlotKey !== undefined) {
    actions.push({
      actionId: "remove_from_bench",
      labelKey: "career.squad.action.removeFromBench",
      slotKey: player.selectedBenchSlotKey,
    });
  }

  const canEnterLineup = player.selection !== "starting_xi"
    && (player.availabilityReasons.length === 0 || player.selection === "substitute");
  if (canEnterLineup) {
    const compatibleChoices = player.lineupSlotChoices
      .filter((choice): choice is CareerSquadSlotChoiceInput & {
        readonly suitability: Exclude<PositionSuitability, "invalid">;
      } => choice.suitability !== "invalid")
      .map(toSlotChoiceView)
      .sort(compareSlotChoices);

    if (compatibleChoices.length > 0) {
      actions.push({
        actionId: "field_player",
        labelKey: "career.squad.action.field",
        mode: compatibleChoices.length === 1 ? "direct" : "choose_slot",
        choices: compatibleChoices,
      });
    }
  }

  if (player.selection !== "substitute" && player.availableBenchSlotKey !== undefined) {
    actions.push({
      actionId: "select_as_substitute",
      labelKey: "career.squad.action.selectAsSubstitute",
      slotKey: player.availableBenchSlotKey,
    });
  }
  return actions;
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
    ...(choice.occupantCurrentLevel === undefined ? {} : { occupantCurrentLevel: choice.occupantCurrentLevel }),
    ...(choice.occupantCondition === undefined ? {} : { occupantCondition: choice.occupantCondition }),
  };
}

function compareSlotChoices(left: CareerSquadSlotChoiceView, right: CareerSquadSlotChoiceView): number {
  return Number(right.isEmpty) - Number(left.isEmpty)
    || SUITABILITY_ORDER[left.suitability] - SUITABILITY_ORDER[right.suitability]
    || compareOptionalLevel(left.occupantCurrentLevel, right.occupantCurrentLevel)
    || compareOptionalNumber(left.occupantCondition, right.occupantCondition)
    || (left.occupantPlayerId ?? "").localeCompare(right.occupantPlayerId ?? "")
    || canonicalPlayerRoleOrder(left.role) - canonicalPlayerRoleOrder(right.role)
    || left.slotKey.localeCompare(right.slotKey);
}

function compareOptionalLevel(
  left: CareerSquadPlayerLevel | undefined,
  right: CareerSquadPlayerLevel | undefined,
): number {
  return (left === undefined ? Number.MAX_SAFE_INTEGER : LEVEL_ORDER[left])
    - (right === undefined ? Number.MAX_SAFE_INTEGER : LEVEL_ORDER[right]);
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
    case "condition": return left.condition - right.condition;
    case "morale": return left.morale - right.morale;
    case "status": return left.compositeStatus.localeCompare(right.compositeStatus);
    case "value": return Number(left.value) - Number(right.value);
    case "current_level": return LEVEL_ORDER[left.currentLevel] - LEVEL_ORDER[right.currentLevel];
    case "potential_level": return LEVEL_ORDER[left.potentialLevel] - LEVEL_ORDER[right.potentialLevel];
  }
}

function assertUniquePlayers(players: readonly CareerSquadPlayerInput[]): void {
  const seen = new Set<string>();
  for (const player of players) {
    if (seen.has(player.playerId)) throw new Error(`Duplicate player in Squad view: ${player.playerId}`);
    seen.add(player.playerId);
  }
}
