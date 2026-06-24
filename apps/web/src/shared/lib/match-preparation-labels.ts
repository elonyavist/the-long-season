import type { MessageKey, Translator } from "@game/i18n";
import type { CareerMatchPreparationBenchSlotStatus, CareerMatchPreparationLineupSlotStatus } from "@game/ui";

/** Preferred-foot values shown in tactical squad surfaces. */
export type TacticalPlayerFoot = "left" | "right";

/** Selection status used by squad-picking tables. */
export type TacticalSquadStatus = "selected" | "bench" | "available";

/** Minimal player option shape needed by tactical select labels. */
export interface TacticalPlayerOptionLabelInput {
  /** Player display name. */
  readonly name: string;
  /** Broad role key used for localized role labels. */
  readonly roleKey: string;
  /** Current fitness, when known. */
  readonly fitness?: number;
}

/** Formats an optional integer player fact. */
export function formatOptionalNumber(value: number | undefined, text: Translator): string {
  return value === undefined ? text("common.unknown") : `${value}`;
}

/** Formats player fitness facts for compact tables and details. */
export function formatFitness(value: number | undefined, text: Translator): string {
  return value === undefined ? text("common.unknown") : `${value}`;
}

/** Formats player fitness as a compact percentage for picker rows. */
export function formatFitnessPercent(value: number | undefined, text: Translator): string {
  return value === undefined ? text("common.unknown") : `${value}%`;
}

/** Formats preferred-foot facts through localized labels. */
export function formatFoot(foot: TacticalPlayerFoot | undefined, text: Translator): string {
  if (foot === undefined) {
    return text("common.unknown");
  }

  return text(`career.matchPreparation.foot.${foot}` as MessageKey);
}

/** Maps broad role keys to existing localized role labels. */
export function roleLabelKey(roleKey: string): MessageKey {
  if (roleKey === "goalkeeper") {
    return "lineup.role.gk";
  }

  if (roleKey === "defender" || roleKey === "midfielder" || roleKey === "attacker") {
    return `lineup.role.${roleKey}` as MessageKey;
  }

  return "common.unknown";
}

/** Maps compact squad row status to a localized label key. */
export function squadStatusLabelKey(status: TacticalSquadStatus): MessageKey {
  return `career.matchPreparation.playerStatus.${status}`;
}

/** Formats a player option with role and condition facts. */
export function formatTacticalPlayerOption(player: TacticalPlayerOptionLabelInput, text: Translator): string {
  return text("career.matchPreparation.playerOption", {
    player: player.name,
    role: text(roleLabelKey(player.roleKey)),
    fitness: player.fitness ?? text("common.unknown"),
  });
}

/** Maps lineup slot status to a localized label key. */
export function slotStatusLabelKey(status: CareerMatchPreparationLineupSlotStatus): MessageKey {
  return `career.matchPreparation.slotStatus.${status}`;
}

/** Maps bench slot status to a localized label key. */
export function benchStatusLabelKey(status: CareerMatchPreparationBenchSlotStatus): MessageKey {
  return `career.matchPreparation.benchStatus.${status}`;
}
