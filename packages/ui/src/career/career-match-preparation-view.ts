import {
  FORMATION_CATALOG,
  type Formation,
  type FormationKey,
  type FormationSlot,
} from "@game/domain";

/** Stable side key for the selected club in the next fixture. */
export type CareerMatchPreparationFixtureSide = "home" | "away";

/** Stable preparation status for the match-preparation section. */
export type CareerMatchPreparationStatus = "blocked" | "ready_to_save" | "saved";

/** Supported formation identifiers shared with the domain formation catalog. */
export type CareerMatchPreparationFormationId = FormationKey;

/** Stable status for one lineup slot in the match-preparation section. */
export type CareerMatchPreparationLineupSlotStatus = "valid" | "missing_player" | "duplicate_player";

/** Stable status for one substitute bench slot in the match-preparation section. */
export type CareerMatchPreparationBenchSlotStatus =
  | "valid"
  | "missing_player"
  | "duplicate_player"
  | "lineup_player";

/** Stable blocker keys used by match-preparation views and actions. */
export type CareerMatchPreparationBlockerKey =
  | "no_next_fixture"
  | "missing_formation"
  | "no_lineup_slots"
  | "missing_lineup_slot"
  | "duplicate_lineup_player"
  | "missing_bench_slot"
  | "duplicate_bench_player"
  | "player_in_lineup_and_bench"
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

/** One tactical slot required by a selectable formation. */
export interface CareerMatchPreparationFormationSlotInput {
  /** Stable slot key that can map to a selected lineup slot. */
  readonly slotKey: string;
  /** Stable pitch placement key used by web layouts. */
  readonly pitchSlotKey: string;
  /** Translation key for the visible slot label. */
  readonly labelKey: string;
  /** Broad role expected by the slot. */
  readonly roleKey: string;
  /** More specific football position key, when known. */
  readonly positionKey: string;
}

/** Formation option exposed by the match-preparation read model. */
export interface CareerMatchPreparationFormationInput {
  /** Stable formation identifier. */
  readonly formationId: CareerMatchPreparationFormationId;
  /** Translation key for the visible formation label. */
  readonly labelKey: string;
  /** Ordered slot list for the formation. */
  readonly slots: readonly CareerMatchPreparationFormationSlotInput[];
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
  /** Current ability used by explicit manager helper actions when available. */
  readonly currentAbility?: number;
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

/** One input slot in the substitute bench. */
export interface CareerMatchPreparationBenchSlotInput {
  /** Stable bench slot key such as `bench:01`. */
  readonly slotKey: string;
  /** Translation key for the visible bench slot label. */
  readonly labelKey: string;
  /** Optional selected substitute player identifier. */
  readonly selectedPlayerId?: string;
  /** Player choices the adapter should show for this bench slot. */
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
  /** Supported formation options. Defaults to the MVP formation catalog. */
  readonly formations?: readonly CareerMatchPreparationFormationInput[];
  /** Current selected formation. Defaults to `4-4-2` for legacy callers. */
  readonly selectedFormationId?: CareerMatchPreparationFormationId;
  /** Ordered lineup slots in renderer order. */
  readonly lineupSlots: readonly CareerMatchPreparationLineupSlotInput[];
  /** Ordered substitute bench slots. Absent means the current caller does not use bench validation yet. */
  readonly benchSlots?: readonly CareerMatchPreparationBenchSlotInput[];
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

/** UI-facing formation with derived selected state. */
export interface CareerMatchPreparationFormationView extends CareerMatchPreparationFormationInput {
  /** Whether this formation is currently selected. */
  readonly isSelected: boolean;
}

/** UI-facing formation selection state. */
export interface CareerMatchPreparationFormationSelectionView {
  /** Available formations. */
  readonly formations: readonly CareerMatchPreparationFormationView[];
  /** Currently selected formation ID, when valid. */
  readonly selectedFormationId?: CareerMatchPreparationFormationId;
  /** Slot list for the selected formation. */
  readonly selectedSlots: readonly CareerMatchPreparationFormationSlotInput[];
}

/** UI-facing substitute bench slot with derived validation state. */
export interface CareerMatchPreparationBenchSlotView {
  /** Stable bench slot key. */
  readonly slotKey: string;
  /** Translation key for the visible bench slot label. */
  readonly labelKey: string;
  /** Optional selected player identifier. */
  readonly selectedPlayerId?: string;
  /** Derived validation state for the bench slot. */
  readonly status: CareerMatchPreparationBenchSlotStatus;
  /** Player choices in renderer order. */
  readonly playerOptions: readonly CareerMatchPreparationPlayerOptionView[];
}

/** UI-facing substitute bench preparation state. */
export interface CareerMatchPreparationBenchView {
  /** Ordered bench slots. */
  readonly slots: readonly CareerMatchPreparationBenchSlotView[];
  /** Number of bench slots with selected players. */
  readonly selectedSlotCount: number;
  /** Total required bench slots in this view. */
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
  /** Formation selection state. */
  readonly formation: CareerMatchPreparationFormationSelectionView;
  /** Ordered lineup state. */
  readonly lineup: CareerMatchPreparationLineupView;
  /** Substitute bench state. */
  readonly bench: CareerMatchPreparationBenchView;
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
  "missing_formation",
  "no_lineup_slots",
  "missing_lineup_slot",
  "duplicate_lineup_player",
  "missing_bench_slot",
  "duplicate_bench_player",
  "player_in_lineup_and_bench",
  "missing_tactic",
];

const CAREER_MATCH_PREPARATION_FORMATION_IDS = [
  "4-4-2",
  "4-3-3",
  "4-2-3-1",
  "4-3-1-2",
  "3-5-2",
  "3-4-3",
  "3-6-1",
  "5-3-2",
  "4-1-4-1",
] as const satisfies readonly FormationKey[];

/** UI formation catalog derived from the canonical domain formation catalog. */
export const CAREER_MATCH_PREPARATION_FORMATIONS: readonly CareerMatchPreparationFormationInput[] =
  CAREER_MATCH_PREPARATION_FORMATION_IDS.map((formationId) =>
    formationFromDomain(FORMATION_CATALOG[formationId]),
  );

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
  const duplicateBenchPlayerIds = findDuplicateBenchPlayerIds(input.benchSlots ?? []);
  const lineupPlayerIds = collectSelectedPlayerIds(input.lineupSlots);
  const benchLineupOverlapIds = findBenchLineupOverlapIds(input.benchSlots ?? [], lineupPlayerIds);
  const formation = buildFormationView(input.formations ?? CAREER_MATCH_PREPARATION_FORMATIONS, input.selectedFormationId ?? "4-4-2");
  const lineup = buildLineupView(input.lineupSlots, duplicatePlayerIds);
  const bench = buildBenchView(input.benchSlots ?? [], duplicateBenchPlayerIds, benchLineupOverlapIds);
  const tactic = buildTacticView(input.tacticProfiles, input.selectedTacticProfileId);
  const blockerKeys = buildBlockerKeys(input, formation, duplicatePlayerIds, duplicateBenchPlayerIds, benchLineupOverlapIds);
  const status = buildPreparationStatus(blockerKeys, input.isSaved === true);

  return {
    screenKey: "career.matchPreparation",
    saveId: input.saveId,
    selectedClub: input.selectedClub,
    ...(input.nextFixture === undefined ? {} : { nextFixture: input.nextFixture }),
    status,
    formation,
    lineup,
    bench,
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

/** Builds selectable formation state from a catalog and selected formation id. */
function buildFormationView(
  formations: readonly CareerMatchPreparationFormationInput[],
  selectedFormationId: CareerMatchPreparationFormationId | undefined,
): CareerMatchPreparationFormationSelectionView {
  const selectedFormation = formations.find((formationOption) => formationOption.formationId === selectedFormationId);

  return {
    formations: formations.map((formationOption) => ({
      ...formationOption,
      isSelected: formationOption.formationId === selectedFormation?.formationId,
    })),
    ...(selectedFormation === undefined ? {} : { selectedFormationId: selectedFormation.formationId }),
    selectedSlots: selectedFormation?.slots ?? [],
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

/** Builds aggregate bench state from ordered substitute slots. */
function buildBenchView(
  slots: readonly CareerMatchPreparationBenchSlotInput[],
  duplicatePlayerIds: ReadonlySet<string>,
  lineupOverlapIds: ReadonlySet<string>,
): CareerMatchPreparationBenchView {
  const slotViews = slots.map((slot) => buildBenchSlotView(slot, duplicatePlayerIds, lineupOverlapIds));

  return {
    slots: slotViews,
    selectedSlotCount: slotViews.filter((slot) => slot.selectedPlayerId !== undefined).length,
    requiredSlotCount: slots.length,
  };
}

/** Builds one bench slot and marks the selected player option. */
function buildBenchSlotView(
  slot: CareerMatchPreparationBenchSlotInput,
  duplicatePlayerIds: ReadonlySet<string>,
  lineupOverlapIds: ReadonlySet<string>,
): CareerMatchPreparationBenchSlotView {
  const selectedPlayerId = normalizeOptionalId(slot.selectedPlayerId);
  const status = benchSlotStatus(selectedPlayerId, duplicatePlayerIds, lineupOverlapIds);

  return {
    slotKey: slot.slotKey,
    labelKey: slot.labelKey,
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
  formation: CareerMatchPreparationFormationSelectionView,
  duplicatePlayerIds: ReadonlySet<string>,
  duplicateBenchPlayerIds: ReadonlySet<string>,
  benchLineupOverlapIds: ReadonlySet<string>,
): readonly CareerMatchPreparationBlockerKey[] {
  const blockers: CareerMatchPreparationBlockerKey[] = [];

  if (input.nextFixture === undefined) {
    blockers.push("no_next_fixture");
  }

  if (formation.selectedFormationId === undefined) {
    blockers.push("missing_formation");
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

  if ((input.benchSlots ?? []).some((slot) => normalizeOptionalId(slot.selectedPlayerId) === undefined)) {
    blockers.push("missing_bench_slot");
  }

  if (duplicateBenchPlayerIds.size > 0) {
    blockers.push("duplicate_bench_player");
  }

  if (benchLineupOverlapIds.size > 0) {
    blockers.push("player_in_lineup_and_bench");
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

/** Derives one bench slot validation status. */
function benchSlotStatus(
  selectedPlayerId: string | undefined,
  duplicatePlayerIds: ReadonlySet<string>,
  lineupOverlapIds: ReadonlySet<string>,
): CareerMatchPreparationBenchSlotStatus {
  if (selectedPlayerId === undefined) {
    return "missing_player";
  }

  if (duplicatePlayerIds.has(selectedPlayerId)) {
    return "duplicate_player";
  }

  if (lineupOverlapIds.has(selectedPlayerId)) {
    return "lineup_player";
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

/** Finds player IDs selected by more than one bench slot. */
function findDuplicateBenchPlayerIds(slots: readonly CareerMatchPreparationBenchSlotInput[]): ReadonlySet<string> {
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

/** Collects selected starting player IDs for cross-checking the bench. */
function collectSelectedPlayerIds(slots: readonly CareerMatchPreparationLineupSlotInput[]): ReadonlySet<string> {
  const playerIds = new Set<string>();

  for (const slot of slots) {
    const selectedPlayerId = normalizeOptionalId(slot.selectedPlayerId);

    if (selectedPlayerId !== undefined) {
      playerIds.add(selectedPlayerId);
    }
  }

  return playerIds;
}

/** Finds bench players who are already selected in the starting lineup. */
function findBenchLineupOverlapIds(
  benchSlots: readonly CareerMatchPreparationBenchSlotInput[],
  lineupPlayerIds: ReadonlySet<string>,
): ReadonlySet<string> {
  const overlapIds = new Set<string>();

  for (const benchSlot of benchSlots) {
    const selectedPlayerId = normalizeOptionalId(benchSlot.selectedPlayerId);

    if (selectedPlayerId !== undefined && lineupPlayerIds.has(selectedPlayerId)) {
      overlapIds.add(selectedPlayerId);
    }
  }

  return overlapIds;
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

function formationFromDomain(formation: Formation): CareerMatchPreparationFormationInput {
  return {
    formationId: formation.key,
    labelKey: `career.matchPreparation.formation.${formation.key}`,
    slots: formation.slots.map((slot) => formationSlotFromDomain(slot)),
  };
}

function formationSlotFromDomain(slot: FormationSlot): CareerMatchPreparationFormationSlotInput {
  return {
    slotKey: slot.slotKey,
    pitchSlotKey: slot.slotKey,
    labelKey: labelKeyForSlot(slot.slotKey),
    roleKey: roleKeyForDomainSlot(slot),
    positionKey: positionKeyForDomainSlot(slot),
  };
}

function labelKeyForSlot(slotKey: string): string {
  const slotLabelKeys: Readonly<Record<string, string>> = {
    "cb-right": "career.matchPreparation.slot.cbRight",
    "cb-center": "career.matchPreparation.slot.cbCenter",
    "cb-left": "career.matchPreparation.slot.cbLeft",
    "cm-right": "career.matchPreparation.slot.cmRight",
    "cm-center": "career.matchPreparation.slot.cmCenter",
    "cm-left": "career.matchPreparation.slot.cmLeft",
    dm: "career.matchPreparation.slot.dmCenter",
    "dm-right": "career.matchPreparation.slot.dmRight",
    "dm-center": "career.matchPreparation.slot.dmCenter",
    "dm-left": "career.matchPreparation.slot.dmLeft",
    "am-right": "career.matchPreparation.slot.amRight",
    "am-left": "career.matchPreparation.slot.amLeft",
    "st-right": "career.matchPreparation.slot.st",
    "st-left": "career.matchPreparation.slot.st",
  };

  return slotLabelKeys[slotKey] ?? `career.matchPreparation.slot.${slotKey}`;
}

function roleKeyForDomainSlot(slot: FormationSlot): string {
  if (slot.department === "goalkeeping") {
    return "goalkeeper";
  }

  if (slot.department === "defense") {
    return "defender";
  }

  if (slot.department === "attack") {
    return "attacker";
  }

  return "midfielder";
}

function positionKeyForDomainSlot(slot: FormationSlot): string {
  const positionKeyByRole: Readonly<Record<FormationSlot["playerRole"], string>> = {
    goalkeeper: "gk",
    right_full_back: "rb",
    center_back: "cb",
    left_full_back: "lb",
    defensive_midfielder: "dm",
    central_midfielder: "cm",
    right_midfielder: "rm",
    left_midfielder: "lm",
    attacking_midfielder: "am",
    right_winger: "rw",
    left_winger: "lw",
    striker: "st",
  };

  return positionKeyByRole[slot.playerRole];
}
