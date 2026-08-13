import assert from "node:assert/strict";
import { test } from "vitest";

import { abilityValue, gameDate, playerId, type Player, type PlayerAbilities } from "@game/domain";

import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";
import { deriveTacticalTaskExecution } from "./tactical-task-execution.ts";

test("task execution changes with relevant attributes instead of one role score", () => {
  const base = playerFixture();
  const builder = withAbilities(base, {
    passing: 18,
    longPassing: 18,
    tackling: 5,
    positioning: 5,
  });
  const stopper = withAbilities(base, {
    passing: 5,
    longPassing: 5,
    tackling: 18,
    positioning: 18,
  });
  const calibration = matchTacticsCalibrationFixture();
  const builderTasks = deriveTacticalTaskExecution({ player: builder, calibration, stateMultiplier: 1 });
  const stopperTasks = deriveTacticalTaskExecution({ player: stopper, calibration, stateMultiplier: 1 });

  assert.notEqual(builderTasks.build_up, stopperTasks.build_up);
  assert.notEqual(builderTasks.central_coverage, stopperTasks.central_coverage);
});

test("dynamic state scales every task once", () => {
  const calibration = matchTacticsCalibrationFixture();
  const player = playerFixture();
  const fresh = deriveTacticalTaskExecution({ player, calibration, stateMultiplier: 1 });
  const tired = deriveTacticalTaskExecution({ player, calibration, stateMultiplier: 0.8 });

  assert.equal(tired.build_up, fresh.build_up * 0.8);
  assert.equal(tired.rest_defence, fresh.rest_defence * 0.8);
});

function withAbilities(
  player: Player,
  values: { readonly passing: number; readonly longPassing: number; readonly tackling: number; readonly positioning: number },
): Player {
  return {
    ...player,
    abilities: {
      ...player.abilities,
      technical: {
        ...player.abilities.technical,
        passing: abilityValue(values.passing),
        longPassing: abilityValue(values.longPassing),
        tackling: abilityValue(values.tackling),
      },
      mental: {
        ...player.abilities.mental,
        positioning: abilityValue(values.positioning),
      },
    },
  };
}

function playerFixture(): Player {
  const abilities = abilitySet(10);
  return {
    id: playerId("player:tactical-task-execution"),
    firstName: "Task",
    lastName: "Executor",
    birthDate: gameDate(1),
    naturalPositions: ["cm"],
    abilities,
    potential: abilities,
  };
}

function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);
  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}
