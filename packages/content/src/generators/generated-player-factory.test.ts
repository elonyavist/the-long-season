import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  createPersonIdentity,
  gameDate,
  playerId,
  readPlayerAbility,
  type PlayerAbilities,
} from "@game/domain";

import {
  assembleGeneratedPlayer,
  GeneratedPlayerAssemblyError,
  type GeneratedPlayerAssemblyInput,
} from "./generated-player-factory.ts";

test("assembleGeneratedPlayer creates complete role-aware identity and initial state", () => {
  const input = assemblyInput();
  const created = assembleGeneratedPlayer(input);

  assert.equal(created.player.id, input.id);
  assert.equal(created.player.firstName, "Ada");
  assert.equal(created.player.lastName, "Rossi");
  assert.equal(Number(created.player.birthDate), 20_000 - 18 * 365 - 42);
  assert.deepEqual(created.player.naturalPositions, ["cm"]);
  assert.equal(created.player.primaryRole, "central_midfielder");
  assert.equal(created.player.roleFamiliarity.central_midfielder, "natural");
  assert.deepEqual(created.dynamicState, { fitness: 100, form: 50, morale: 50 });
});

test("assembleGeneratedPlayer applies shared scale role-cap and potential invariants", () => {
  const input = assemblyInput();
  const created = assembleGeneratedPlayer({
    ...input,
    abilities: withGoalkeeping(input.abilities, 0, 0.5),
    potential: withGoalkeeping(input.potential, 0, 0),
  });

  assert.equal(Number(readPlayerAbility(created.player.abilities, "goalkeeping.reflexes")), 1);
  assert.equal(Number(readPlayerAbility(created.player.abilities, "goalkeeping.footwork")), 1);
  assert.equal(Number(readPlayerAbility(created.player.potential, "goalkeeping.reflexes")), 1);
  assert.equal(Number(readPlayerAbility(created.player.potential, "goalkeeping.footwork")), 1);
});

test("assembleGeneratedPlayer is deterministic and does not mutate producer facts", () => {
  const input = assemblyInput();
  const before = JSON.stringify(input);

  assert.deepEqual(assembleGeneratedPlayer(input), assembleGeneratedPlayer(input));
  assert.equal(JSON.stringify(input), before);
});

test("assembleGeneratedPlayer rejects malformed age policy facts with typed errors", () => {
  assert.throws(
    () => assembleGeneratedPlayer({ ...assemblyInput(), ageYears: 0 }),
    (error) => error instanceof GeneratedPlayerAssemblyError && error.code === "invalid_age",
  );
  assert.throws(
    () => assembleGeneratedPlayer({ ...assemblyInput(), birthDateJitterDays: 365 }),
    (error) => error instanceof GeneratedPlayerAssemblyError && error.code === "invalid_birth_date_jitter",
  );
});

function assemblyInput(): GeneratedPlayerAssemblyInput {
  return {
    id: playerId("player:generated-test"),
    identity: createPersonIdentity({
      firstName: "Ada",
      lastName: "Rossi",
      nationality: "italian",
      birthCountry: "italian",
      nameCulture: "italian",
    }),
    referenceDate: gameDate(20_000),
    ageYears: 18,
    birthDateJitterDays: 42,
    position: "cm",
    abilities: filledAbilities(5),
    potential: filledAbilities(8),
  };
}

function filledAbilities(value: number): PlayerAbilities {
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

function withGoalkeeping(abilities: PlayerAbilities, reflexes: number, footwork: number): PlayerAbilities {
  return {
    ...abilities,
    goalkeeping: {
      ...abilities.goalkeeping,
      reflexes: abilityValue(reflexes),
      footwork: abilityValue(footwork),
    },
  };
}
