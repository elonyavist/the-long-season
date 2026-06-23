/** Stable side key for the selected club in the next fixture. */
export type CareerMatchPreparationFixtureSide = "home" | "away";

/** Stable preparation status for the match-preparation section. */
export type CareerMatchPreparationStatus = "blocked" | "ready_to_save" | "saved";

/** Stable status for one lineup slot in the match-preparation section. */
export type CareerMatchPreparationLineupSlotStatus = "valid" | "missing_player" | "duplicate_player";

/** Stable blocker keys used by match-preparation views and actions. */
export type CareerMatchPreparationBlockerKey =
  | "no_next_fixture"
  | "no_lineup_slots"
  | "missing_lineup_slot"
  | "duplicate_lineup_player"
  | "missing_tactic";

/** Stable action identifiers available from the match-preparation section. */
export type CareerMatchPreparationActionId = "save_preparation";

/** Availability status for match-preparation actions. */
export type CareerMatchPreparationActionStatus = "available" | "blocked";

/** Club identity used by the match-preparation view without importing domain state. */
export interface CareerMatchPreparationClubInput {
  /** Stable club identifier. */
  readonly clubId: string;
  /** Display name already stored in content/save data. */
  readonly name: string;
}

/** Next fixture context shown by match preparation. */
export interface CareerMatchPreparationFixtureInput {
  /** Stable fixture identifier. */
  readonly fixtureId: string;
  /** Fixture date in display-ready ISO shape. */
  readonly dateIso: string;
  /** Competition round number. */
  readonly round: number;
  /** Home club. */
  readonly homeClub: CareerMatchPreparationClubInput;
  /** Away club. */
  readonly awayClub: CareerMatchPreparationClubInput;
  /** Whether the selected club plays home or away. */
  readonly selectedClubSide: CareerMatchPreparationFixtureSide;
}

/** Player option that a browser adapter can render in one or more lineup slots. */
export interface CareerMatchPreparationPlayerOptionInput {
  /** Stable player identifier. */
  readonly playerId: string;
  /** Existing generated player display name. */
  readonly name: string;
  /** Current broad role key such as `goalkeeper`, `defender`, or `attacker`. */
  readonly roleKey: string;
  /** Optional position or formation-family key owned by caller data. */
  readonly positionKey?: string;
  /** Current fitness on the 0..100 scale when available. */
  readonly fitness?: number;
}

/** One input slot in the editable preparation lineup. */
export interface CareerMatchPreparationLineupSlotInput {
  /** Stable slot key such as `slot:01`, `gk`, or `cb-left`. */
  readonly slotKey: string;
  /** Translation key for the visible slot label. */
  readonly labelKey: string;
  /** Role key required by the selected slot. */
  readonly roleKey: string;
  /** Optional selected player identifier. */
  readonly selectedPlayerId?: string;
  /** Player choices the adapter should show for this slot. */
  readonly playerOptions: readonly CareerMatchPreparationPlayerOptionInput[];
}

/** Tactic setup values shown in the preparation screen. */
export interface CareerMatchPreparationTacticValuesInput {
  /** Broad mentality key. */
  readonly mentality: string;
  /** Pressing intensity on the current 0..1 MVP scale. */
  readonly pressing: number;
  /** Build-up directness on the current 0..1 MVP scale. */
  readonly directness: number;
  /** Attacking width on the current 0..1 MVP scale. */
  readonly width: number;
  /** Attacking risk on the current 0..1 MVP scale. */
  readonly risk: number;
}

/** Selectable tactic profile for match preparation. */
export interface CareerMatchPreparationTacticProfileInput {
  /** Stable profile identifier. */
  readonly tacticProfileId: string;
  /** Translation key for the visible profile label. */
  readonly labelKey: string;
  /** Tactic values shown to the user. */
  readonly values: CareerMatchPreparationTacticValuesInput;
}

/** Input required to build a match-preparation section view. */
export interface BuildCareerMatchPreparationViewInput {
  /** Stable save identifier. */
  readonly saveId: string;
  /** Selected club. */
  readonly selectedClub: CareerMatchPreparationClubInput;
  /** Next selected-club fixture. */
  readonly nextFixture?: CareerMatchPreparationFixtureInput;
  /** Ordered lineup slots in renderer order. */
  readonly lineupSlots: readonly CareerMatchPreparationLineupSlotInput[];
  /** Available tactic profiles. */
  readonly tacticProfiles: readonly CareerMatchPreparationTacticProfileInput[];
  /** Current selected tactic profile. */
  readonly selectedTacticProfileId?: string;
  /** Whether this preparation has already been saved. */
  readonly isSaved?: boolean;
}

/** UI-facing player option for match preparation. */
export interface CareerMatchPreparationPlayerOptionView extends CareerMatchPreparationPlayerOptionInput {
  /** Whether this option is selected in the owning slot. */
  readonly isSelected: boolean;
}

/** UI-facing lineup slot with derived validation state. */
export interface CareerMatchPreparationLineupSlotView {
  /** Stable slot key. */
  readonly slotKey: string;
  /** Translation key for the visible slot label. */
  readonly labelKey: string;
  /** Role key required by the selected slot. */
  readonly roleKey: string;
  /** Optional selected player identifier. */
  readonly selectedPlayerId?: string;
  /** Derived validation state for the slot. */
  readonly status: CareerMatchPreparationLineupSlotStatus;
  /** Player choices in renderer order. */
  readonly playerOptions: readonly CareerMatchPreparationPlayerOptionView[];
}

/** UI-facing lineup preparation state. */
export interface CareerMatchPreparationLineupView {
  /** Ordered lineup slots. */
  readonly slots: readonly CareerMatchPreparationLineupSlotView[];
  /** Number of slots with selected players. */
  readonly selectedSlotCount: number;
  /** Total required slots in this view. */
  readonly requiredSlotCount: number;
}

/** UI-facing tactic profile with derived selected state. */
export interface CareerMatchPreparationTacticProfileView extends CareerMatchPreparationTacticProfileInput {
  /** Whether this tactic profile is currently selected. */
  readonly isSelected: boolean;
}

/** UI-facing tactic selection state. */
export interface CareerMatchPreparationTacticView {
  /** Available tactic profiles. */
  readonly profiles: readonly CareerMatchPreparationTacticProfileView[];
  /** Optional selected tactic profile ID. */
  readonly selectedTacticProfileId?: string;
}

/** Save action availability for match preparation. */
export interface CareerMatchPreparationActionView {
  /** Stable action identifier. */
  readonly actionId: CareerMatchPreparationActionId;
  /** Whether the action can currently be selected. */
  readonly status: CareerMatchPreparationActionStatus;
  /** Blockers preventing action availability. */
  readonly blockerKeys: readonly CareerMatchPreparationBlockerKey[];
  /** Translation key for the visible action label. */
  readonly labelKey: string;
}

/** Structured match-preparation section view. */
export interface CareerMatchPreparationView {
  /** Stable screen key for routing and tests. */
  readonly screenKey: "career.matchPreparation";
  /** Stable save identifier. */
  readonly saveId: string;
  /** Selected club context. */
  readonly selectedClub: CareerMatchPreparationClubInput;
  /** Next fixture context when available. */
  readonly nextFixture?: CareerMatchPreparationFixtureInput;
  /** Overall preparation status. */
  readonly status: CareerMatchPreparationStatus;
  /** Ordered lineup state. */
  readonly lineup: CareerMatchPreparationLineupView;
  /** Tactic selection state. */
  readonly tactic: CareerMatchPreparationTacticView;
  /** Current preparation blockers. */
  readonly blockerKeys: readonly CareerMatchPreparationBlockerKey[];
  /** Save action state. */
  readonly saveAction: CareerMatchPreparationActionView;
  /** Translation key for the primary section summary. */
  readonly summaryKey: string;
}

const BLOCKER_ORDER: readonly CareerMatchPreparationBlockerKey[] = [
  "no_next_fixture",
  "no_lineup_slots",
  "missing_lineup_slot",
  "duplicate_lineup_player",
  "missing_tactic",
];

/**
 * Builds the framework-free match-preparation view.
 *
 * Callers provide explicit lineup slots and tactic profiles. The builder only
 * derives visible UI status: missing players, duplicate players, missing
 * tactic, and save availability. It does not choose players, recommend tactics,
 * persist data, or run engine simulation.
 */
export function buildCareerMatchPreparationView(
  input: BuildCareerMatchPreparationViewInput,
): CareerMatchPreparationView {
  const duplicatePlayerIds = findDuplicatePlayerIds(input.lineupSlots);
  const lineup = buildLineupView(input.lineupSlots, duplicatePlayerIds);
  const tactic = buildTacticView(input.tacticProfiles, input.selectedTacticProfileId);
  const blockerKeys = buildBlockerKeys(input, duplicatePlayerIds);
  const status = buildPreparationStatus(blockerKeys, input.isSaved === true);

  return {
    screenKey: "career.matchPreparation",
    saveId: input.saveId,
    selectedClub: input.selectedClub,
    ...(input.nextFixture === undefined ? {} : { nextFixture: input.nextFixture }),
    status,
    lineup,
    tactic,
    blockerKeys,
    saveAction: {
      actionId: "save_preparation",
      status: blockerKeys.length === 0 ? "available" : "blocked",
      blockerKeys,
      labelKey: "career.matchPreparation.action.save",
    },
    summaryKey: summaryKeyForStatus(status),
  };
}

/** Builds aggregate lineup state from ordered editable slots. */
function buildLineupView(
  slots: readonly CareerMatchPreparationLineupSlotInput[],
  duplicatePlayerIds: ReadonlySet<string>,
): CareerMatchPreparationLineupView {
  const slotViews = slots.map((slot) => buildLineupSlotView(slot, duplicatePlayerIds));

  return {
    slots: slotViews,
    selectedSlotCount: slotViews.filter((slot) => slot.selectedPlayerId !== undefined).length,
    requiredSlotCount: slots.length,
  };
}

/** Builds one lineup slot and marks the selected player option. */
function buildLineupSlotView(
  slot: CareerMatchPreparationLineupSlotInput,
  duplicatePlayerIds: ReadonlySet<string>,
): CareerMatchPreparationLineupSlotView {
  const selectedPlayerId = normalizeOptionalId(slot.selectedPlayerId);
  const status = slotStatus(selectedPlayerId, duplicatePlayerIds);

  return {
    slotKey: slot.slotKey,
    labelKey: slot.labelKey,
    roleKey: slot.roleKey,
    ...(selectedPlayerId === undefined ? {} : { selectedPlayerId }),
    status,
    playerOptions: slot.playerOptions.map((option) => ({
      ...option,
      isSelected: option.playerId === selectedPlayerId,
    })),
  };
}

/** Builds the tactic profile list with one optional selected profile. */
function buildTacticView(
  profiles: readonly CareerMatchPreparationTacticProfileInput[],
  selectedTacticProfileId: string | undefined,
): CareerMatchPreparationTacticView {
  const selectedProfileId = normalizeOptionalId(selectedTacticProfileId);

  return {
    profiles: profiles.map((profile) => ({
      ...profile,
      isSelected: profile.tacticProfileId === selectedProfileId,
    })),
    ...(selectedProfileId === undefined ? {} : { selectedTacticProfileId: selectedProfileId }),
  };
}

/** Derives blocker keys that prevent saving a complete match preparation. */
function buildBlockerKeys(
  input: BuildCareerMatchPreparationViewInput,
  duplicatePlayerIds: ReadonlySet<string>,
): readonly CareerMatchPreparationBlockerKey[] {
  const blockers: CareerMatchPreparationBlockerKey[] = [];

  if (input.nextFixture === undefined) {
    blockers.push("no_next_fixture");
  }

  if (input.lineupSlots.length === 0) {
    blockers.push("no_lineup_slots");
  }

  if (input.lineupSlots.some((slot) => normalizeOptionalId(slot.selectedPlayerId) === undefined)) {
    blockers.push("missing_lineup_slot");
  }

  if (duplicatePlayerIds.size > 0) {
    blockers.push("duplicate_lineup_player");
  }

  if (normalizeOptionalId(input.selectedTacticProfileId) === undefined) {
    blockers.push("missing_tactic");
  }

  return sortBlockers(blockers);
}

/** Derives the top-level preparation status from blockers and saved state. */
function buildPreparationStatus(
  blockerKeys: readonly CareerMatchPreparationBlockerKey[],
  isSaved: boolean,
): CareerMatchPreparationStatus {
  if (blockerKeys.length > 0) {
    return "blocked";
  }

  return isSaved ? "saved" : "ready_to_save";
}

/** Returns the translation key for the status summary. */
function summaryKeyForStatus(status: CareerMatchPreparationStatus): string {
  return `career.matchPreparation.summary.${status}`;
}

/** Derives one slot validation status. */
function slotStatus(
  selectedPlayerId: string | undefined,
  duplicatePlayerIds: ReadonlySet<string>,
): CareerMatchPreparationLineupSlotStatus {
  if (selectedPlayerId === undefined) {
    return "missing_player";
  }

  if (duplicatePlayerIds.has(selectedPlayerId)) {
    return "duplicate_player";
  }

  return "valid";
}

/** Finds player IDs selected by more than one lineup slot. */
function findDuplicatePlayerIds(slots: readonly CareerMatchPreparationLineupSlotInput[]): ReadonlySet<string> {
  const seenPlayerIds = new Set<string>();
  const duplicatePlayerIds = new Set<string>();

  for (const slot of slots) {
    const selectedPlayerId = normalizeOptionalId(slot.selectedPlayerId);

    if (selectedPlayerId === undefined) {
      continue;
    }

    if (seenPlayerIds.has(selectedPlayerId)) {
      duplicatePlayerIds.add(selectedPlayerId);
      continue;
    }

    seenPlayerIds.add(selectedPlayerId);
  }

  return duplicatePlayerIds;
}

/** Sorts blocker keys into stable UI order. */
function sortBlockers(
  blockerKeys: readonly CareerMatchPreparationBlockerKey[],
): readonly CareerMatchPreparationBlockerKey[] {
  const uniqueKeys = new Set(blockerKeys);
  return BLOCKER_ORDER.filter((key) => uniqueKeys.has(key));
}

/** Normalizes empty string identifiers to absent optional identifiers. */
function normalizeOptionalId(value: string | undefined): string | undefined {
  if (value === undefined || value.length === 0) {
    return undefined;
  }

  return value;
}
