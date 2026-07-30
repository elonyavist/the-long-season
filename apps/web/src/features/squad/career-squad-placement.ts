/** One current XI or bench assignment read from the canonical preparation draft. */
export interface CareerSquadPlacementSlot {
  readonly slotKey: string;
  readonly playerId?: string;
}

/**
 * Destination selected in the Squad table.
 *
 * `expectedPlayerId` is optional because callers may plan directly from a
 * fresh snapshot. When supplied, `null` means that the rendered target was
 * empty and lets the planner reject a stale interaction explicitly.
 */
export type CareerSquadPlacementTarget =
  | Readonly<{
      kind: "lineup";
      slotKey: string;
      expectedPlayerId?: string | null;
    }>
  | Readonly<{
      kind: "bench";
      slotKey: string;
      expectedPlayerId?: string | null;
    }>
  | Readonly<{
      kind: "unselected";
    }>;

/** One existing synchronous callback invocation, applied in array order. */
export type CareerSquadPlacementOperation =
  | Readonly<{
      kind: "lineup";
      slotKey: string;
      playerId?: string;
    }>
  | Readonly<{
      kind: "bench";
      slotKey: string;
      playerId?: string;
    }>;

/** Explicit reason why a placement cannot be planned from the supplied snapshot. */
export type CareerSquadPlacementRejectionReason =
  | "invalid_player_id"
  | "invalid_snapshot"
  | "duplicate_slot_key"
  | "duplicate_player_assignment"
  | "unknown_target_slot"
  | "stale_target"
  | "bench_full"
  | "unsupported_bench_move";

/** Complete immutable input needed to plan one Squad placement change. */
export interface PlanCareerSquadPlacementInput {
  readonly playerId: string;
  readonly lineupSlots: readonly CareerSquadPlacementSlot[];
  readonly benchSlots: readonly CareerSquadPlacementSlot[];
  readonly target: CareerSquadPlacementTarget;
}

/**
 * Pure placement result.
 *
 * Planned operations must be dispatched sequentially. A no-op is a valid
 * already-selected destination, while rejected plans never contain commands.
 */
export type CareerSquadPlacementPlan =
  | Readonly<{
      status: "planned";
      operations: readonly CareerSquadPlacementOperation[];
    }>
  | Readonly<{
      status: "noop";
      operations: readonly [];
    }>
  | Readonly<{
      status: "rejected";
      reason: CareerSquadPlacementRejectionReason;
      operations: readonly [];
    }>;

type CurrentPlacement =
  | Readonly<{ kind: "lineup"; slotKey: string }>
  | Readonly<{ kind: "bench"; slotKey: string }>
  | Readonly<{ kind: "unselected" }>;

const NO_OPERATIONS: readonly [] = [];

/**
 * Plans a deterministic placement over the current synchronous XI/bench
 * callbacks without mutating their canonical draft.
 */
export function planCareerSquadPlacement(
  input: PlanCareerSquadPlacementInput,
): CareerSquadPlacementPlan {
  const snapshotRejection = validateSnapshot(input);
  if (snapshotRejection !== undefined) return rejected(snapshotRejection);

  const source = findCurrentPlacement(input);
  const target = input.target;
  if (target.kind === "unselected") {
    return planRemoval(source);
  }

  const targetSlots = target.kind === "lineup"
    ? input.lineupSlots
    : input.benchSlots;
  const targetSlot = targetSlots.find((slot) => slot.slotKey === target.slotKey);
  if (targetSlot === undefined) return rejected("unknown_target_slot");
  if (
    Object.prototype.hasOwnProperty.call(target, "expectedPlayerId")
    && (targetSlot.playerId ?? null) !== target.expectedPlayerId
  ) {
    return rejected("stale_target");
  }

  if (target.kind === "bench") {
    return planBenchPlacement(input, source, targetSlot);
  }
  return planLineupPlacement(input.playerId, source, targetSlot);
}

function planLineupPlacement(
  playerId: string,
  source: CurrentPlacement,
  targetSlot: CareerSquadPlacementSlot,
): CareerSquadPlacementPlan {
  if (source.kind === "lineup" && source.slotKey === targetSlot.slotKey) {
    return noop();
  }

  const displacedPlayerId = targetSlot.playerId;
  const operations: CareerSquadPlacementOperation[] = [
    {
      kind: "lineup",
      slotKey: targetSlot.slotKey,
      playerId,
    },
  ];

  if (displacedPlayerId !== undefined) {
    if (source.kind === "lineup") {
      operations.push({
        kind: "lineup",
        slotKey: source.slotKey,
        playerId: displacedPlayerId,
      });
    } else if (source.kind === "bench") {
      operations.push({
        kind: "bench",
        slotKey: source.slotKey,
        playerId: displacedPlayerId,
      });
    }
  }

  return { status: "planned", operations };
}

function planBenchPlacement(
  input: PlanCareerSquadPlacementInput,
  source: CurrentPlacement,
  targetSlot: CareerSquadPlacementSlot,
): CareerSquadPlacementPlan {
  if (source.kind === "bench") {
    return source.slotKey === targetSlot.slotKey
      ? noop()
      : rejected("unsupported_bench_move");
  }

  const firstFreeBenchSlot = input.benchSlots.find((slot) => slot.playerId === undefined);
  if (firstFreeBenchSlot === undefined) return rejected("bench_full");
  if (
    targetSlot.playerId !== undefined
    || targetSlot.slotKey !== firstFreeBenchSlot.slotKey
  ) {
    return rejected("stale_target");
  }

  return {
    status: "planned",
    operations: [{
      kind: "bench",
      slotKey: targetSlot.slotKey,
      playerId: input.playerId,
    }],
  };
}

function planRemoval(source: CurrentPlacement): CareerSquadPlacementPlan {
  if (source.kind === "unselected") return noop();

  return {
    status: "planned",
    operations: [{
      kind: source.kind,
      slotKey: source.slotKey,
    }],
  };
}

function findCurrentPlacement(input: PlanCareerSquadPlacementInput): CurrentPlacement {
  const lineupSlot = input.lineupSlots.find((slot) => slot.playerId === input.playerId);
  if (lineupSlot !== undefined) return { kind: "lineup", slotKey: lineupSlot.slotKey };

  const benchSlot = input.benchSlots.find((slot) => slot.playerId === input.playerId);
  return benchSlot === undefined
    ? { kind: "unselected" }
    : { kind: "bench", slotKey: benchSlot.slotKey };
}

function validateSnapshot(
  input: PlanCareerSquadPlacementInput,
): CareerSquadPlacementRejectionReason | undefined {
  if (input.playerId.trim().length === 0) return "invalid_player_id";

  const slotKeys = new Set<string>();
  const assignedPlayerIds = new Set<string>();
  for (const slot of [...input.lineupSlots, ...input.benchSlots]) {
    if (slot.slotKey.trim().length === 0 || slot.playerId?.trim().length === 0) {
      return "invalid_snapshot";
    }
    if (slotKeys.has(slot.slotKey)) return "duplicate_slot_key";
    slotKeys.add(slot.slotKey);

    if (slot.playerId !== undefined) {
      if (assignedPlayerIds.has(slot.playerId)) return "duplicate_player_assignment";
      assignedPlayerIds.add(slot.playerId);
    }
  }
  return undefined;
}

function noop(): CareerSquadPlacementPlan {
  return { status: "noop", operations: NO_OPERATIONS };
}

function rejected(
  reason: CareerSquadPlacementRejectionReason,
): CareerSquadPlacementPlan {
  return { status: "rejected", reason, operations: NO_OPERATIONS };
}
