import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  createPersonIdentity,
  gameDate,
  PlayerConstructionError,
  playerId,
  type PlayerAbilities,
  type PlayerConstructionErrorCode,
} from "@game/domain";
import { completedCivilYears, fromISO, toISO } from "@game/shared";

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
  assert.equal(toISO(Number(created.player.birthDate)), "2008-06-20");
  assert.equal(completedCivilYears(created.player.birthDate, input.referenceDate), 18);
  assert.deepEqual(created.player.naturalPositions, ["cm"]);
  assert.equal(created.player.primaryRole, "central_midfielder");
  assert.equal(created.player.roleFamiliarity.central_midfielder, "natural");
  assert.deepEqual(created.dynamicState, { fitness: 100, form: 50, morale: 50 });
});

test("assembleGeneratedPlayer passes coherent producer abilities through without rewriting them", () => {
  const input = assemblyInput();
  const created = assembleGeneratedPlayer(input);

  assert.equal(created.player.abilities, input.abilities);
  assert.equal(created.player.potential, input.potential);
});

test("assembleGeneratedPlayer propagates typed domain errors for ability ranges", () => {
  const input = assemblyInput();

  assertConstructionError(
    {
      ...input,
      abilities: withGoalkeeping(input.abilities, 0, 1),
    },
    "invalid_current_ability",
  );
  assertConstructionError(
    {
      ...input,
      potential: withGoalkeeping(input.potential, 0, 1),
    },
    "invalid_potential_ability",
  );
});

test("assembleGeneratedPlayer rejects role-cap violations instead of capping producer facts", () => {
  const input = assemblyInput();
  const invalid = {
    ...input,
    abilities: withGoalkeeping(input.abilities, 5, 1),
    potential: withGoalkeeping(input.potential, 5, 1),
  };
  const before = JSON.stringify(invalid);

  assertConstructionError(invalid, "ability_exceeds_role_cap");
  assert.equal(JSON.stringify(invalid), before);
});

test("assembleGeneratedPlayer rejects potential below current instead of raising the ceiling", () => {
  const input = assemblyInput();
  const invalid = {
    ...input,
    abilities: withGoalkeeping(input.abilities, 2, 1),
    potential: withGoalkeeping(input.potential, 1, 1),
  };
  const before = JSON.stringify(invalid);

  assertConstructionError(invalid, "potential_below_current");
  assert.equal(JSON.stringify(invalid), before);
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

test("assembleGeneratedPlayer preserves every requested civil age across the full jitter range", () => {
  for (const ageYears of [15, 16, 17, 18, 19, 20]) {
    for (const birthDateJitterDays of [0, 4, 364]) {
      const input = {
        ...assemblyInput(),
        ageYears,
        birthDateJitterDays,
      };
      const created = assembleGeneratedPlayer(input);

      assert.equal(
        completedCivilYears(created.player.birthDate, input.referenceDate),
        ageYears,
        `age ${ageYears}, jitter ${birthDateJitterDays}`,
      );
    }
  }
});

test("assembleGeneratedPlayer clamps a leap-day anniversary without changing completed age", () => {
  const referenceDate = gameDate(fromISO("2024-02-29"));
  const exactAnniversary = assembleGeneratedPlayer({
    ...assemblyInput(),
    referenceDate,
    ageYears: 18,
    birthDateJitterDays: 0,
  }).player;
  const endOfAgeYear = assembleGeneratedPlayer({
    ...assemblyInput(),
    referenceDate,
    ageYears: 18,
    birthDateJitterDays: 364,
  }).player;

  assert.equal(toISO(Number(exactAnniversary.birthDate)), "2006-02-28");
  assert.equal(toISO(Number(endOfAgeYear.birthDate)), "2005-03-01");
  assert.equal(completedCivilYears(exactAnniversary.birthDate, referenceDate), 18);
  assert.equal(completedCivilYears(endOfAgeYear.birthDate, referenceDate), 18);
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
    referenceDate: gameDate(fromISO("2026-08-01")),
    ageYears: 18,
    birthDateJitterDays: 42,
    position: "cm",
    abilities: withGoalkeeping(filledAbilities(5), 1, 1),
    potential: withGoalkeeping(filledAbilities(8), 1, 1),
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
      handling: abilityValue(1),
      rushingOut: abilityValue(1),
      goalkeeperPositioning: abilityValue(1),
      reflexes: abilityValue(reflexes),
      footwork: abilityValue(footwork),
    },
  };
}

/** Proves content assembly preserves the domain's typed validation vocabulary. */
function assertConstructionError(
  input: GeneratedPlayerAssemblyInput,
  expectedCode: PlayerConstructionErrorCode,
): void {
  assert.throws(
    () => assembleGeneratedPlayer(input),
    (error) => error instanceof PlayerConstructionError && error.code === expectedCode,
  );
}
