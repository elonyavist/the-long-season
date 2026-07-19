import assert from "node:assert/strict";
import { test } from "vitest";

import type { PlayerAbilities, PlayerDynamicState, RoleIdentifiedPlayer } from "../entities/player.entity.ts";
import { playerId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { abilityValue, stateValue, type AbilityValue } from "../value-objects/rating.ts";
import {
  createPlayer,
  PlayerConstructionError,
  type CreatePlayerInput,
  type PlayerConstructionErrorCode,
} from "./create-player.ts";
import { mapPlayerAbilities, type PlayerAbilityKey } from "./player-abilities.ts";

test("createPlayer returns the complete player and dynamic state without mutating input", () => {
  const input = validInput();
  const before = JSON.stringify(input);

  const created = createPlayer(input);

  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(created.player, playerFromInput(input));
  assert.deepEqual(created.dynamicState, input.dynamicState);
  assert.equal(created.player.primaryRole, "center_back");
});

test("createPlayer rejects invalid identity and birth facts with typed reasons", () => {
  assertConstructionError({ ...validInput(), id: "invalid" as CreatePlayerInput["id"] }, "invalid_player_id");
  assertConstructionError({ ...validInput(), firstName: "  " }, "invalid_name");
  assertConstructionError({ ...validInput(), birthDate: 2.5 as CreatePlayerInput["birthDate"] }, "invalid_birth_date");
  assertConstructionError(
    { ...validInput(), birthDate: gameDate(20_000), referenceDate: gameDate(20_000) },
    "birth_date_not_before_reference",
  );
});

test("createPlayer rejects missing invalid and duplicate natural positions", () => {
  assertConstructionError({ ...validInput(), naturalPositions: [] }, "missing_natural_position");
  assertConstructionError(
    { ...validInput(), naturalPositions: ["unknown"] as unknown as CreatePlayerInput["naturalPositions"] },
    "invalid_natural_position",
  );
  assertConstructionError({ ...validInput(), naturalPositions: ["cb", "cb"] }, "duplicate_natural_position");
});

test("createPlayer rejects incomplete malformed and position-inconsistent role identity", () => {
  assertConstructionError(
    { ...validInput(), primaryRole: undefined } as unknown as CreatePlayerInput,
    "incomplete_role_identity",
  );
  assertConstructionError(
    { ...validInput(), primaryRole: "sweeper" } as unknown as CreatePlayerInput,
    "invalid_role_identity",
  );
  assertConstructionError(
    { ...validInput(), archetype: "striker_poacher" },
    "invalid_role_identity",
  );
  assertConstructionError(
    {
      ...validInput(),
      primaryRole: "striker",
      archetype: "striker_poacher",
      naturalRoles: ["striker"],
      adaptedRoles: [],
      weakRoles: [],
      roleFamiliarity: { striker: "natural" },
    },
    "role_position_mismatch",
  );
});

test("createPlayer rejects invalid current and potential ability ranges", () => {
  assertConstructionError(
    { ...validInput(), abilities: withAbility(validInput().abilities, "technical.finishing", 0) },
    "invalid_current_ability",
  );
  assertConstructionError(
    { ...validInput(), potential: withAbility(validInput().potential, "technical.finishing", 21) },
    "invalid_potential_ability",
  );
});

test("createPlayer rejects potential below current and role hard-cap violations", () => {
  assertConstructionError(
    {
      ...validInput(),
      abilities: withAbility(validInput().abilities, "technical.finishing", 4),
      potential: withAbility(validInput().potential, "technical.finishing", 3),
    },
    "potential_below_current",
  );
  assertConstructionError(
    {
      ...validInput(),
      abilities: withAbility(validInput().abilities, "technical.finishing", 11),
      potential: withAbility(validInput().potential, "technical.finishing", 11),
    },
    "ability_exceeds_role_cap",
  );
});

test("createPlayer rejects dynamic state outside the canonical 0-100 range", () => {
  assertConstructionError(
    {
      ...validInput(),
      dynamicState: { ...validInput().dynamicState, fitness: -1 as PlayerDynamicState["fitness"] },
    },
    "invalid_dynamic_state",
  );
});

function validInput(): CreatePlayerInput {
  return {
    id: playerId("player:test-001"),
    firstName: "Ada",
    lastName: "Rossi",
    birthDate: gameDate(14_000),
    naturalPositions: ["cb"],
    primaryRole: "center_back",
    archetype: "center_back_stopper",
    naturalRoles: ["center_back"],
    adaptedRoles: ["full_back"],
    weakRoles: ["defensive_midfielder"],
    roleFamiliarity: {
      center_back: "natural",
      full_back: "adapted",
      defensive_midfielder: "weak",
    },
    abilities: filledAbilities(3),
    potential: filledAbilities(4),
    referenceDate: gameDate(20_000),
    dynamicState: {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    },
  };
}

function playerFromInput(input: CreatePlayerInput): RoleIdentifiedPlayer {
  const { referenceDate: _referenceDate, dynamicState: _dynamicState, ...player } = input;
  return player;
}

function assertConstructionError(input: CreatePlayerInput, code: PlayerConstructionErrorCode): void {
  assert.throws(
    () => createPlayer(input),
    (error) => error instanceof PlayerConstructionError && error.code === code,
  );
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

function withAbility(
  abilities: PlayerAbilities,
  key: PlayerAbilityKey,
  value: number,
): PlayerAbilities {
  return mapPlayerAbilities(abilities, (current, candidate) =>
    candidate === key ? value as AbilityValue : current,
  );
}
