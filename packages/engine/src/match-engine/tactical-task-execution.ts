import {
  PLAYER_ABILITY_KEYS,
  readPlayerAbility,
  TACTICAL_SHAPE_TASKS,
  type MatchTacticsCalibrationConfig,
  type Player,
  type TacticalShapeTask,
} from "@game/domain";

/** Attribute-specific execution quality for every tactical task. */
export type TacticalTaskExecution = Readonly<Record<TacticalShapeTask, number>>;

/**
 * Derives what one player can execute, independently of where a role allocates him.
 *
 * Role allocation answers how much work reaches a task. This function answers
 * how well this footballer performs that work. Every authored attribute row
 * sums to one, so task specialization changes identity without adding a second
 * team-strength bonus.
 */
export function deriveTacticalTaskExecution(input: {
  readonly player: Player;
  readonly calibration: MatchTacticsCalibrationConfig;
  readonly stateMultiplier: number;
}): TacticalTaskExecution {
  const result = {} as Record<TacticalShapeTask, number>;
  for (const task of TACTICAL_SHAPE_TASKS) {
    const weights = input.calibration.tacticalShape.taskAbilityWeightsBasisPointsByTask[task];
    let quality = 0;
    for (const key of PLAYER_ABILITY_KEYS) {
      quality += readPlayerAbility(input.player.abilities, key) * ((weights[key] ?? 0) / 10_000);
    }
    result[task] = quality * input.stateMultiplier;
  }
  return result;
}
