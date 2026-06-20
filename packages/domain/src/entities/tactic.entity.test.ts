import { test } from "vitest";
import assert from "node:assert/strict";

import { clubId, playerId } from "../types/ids.ts";
import {
  createSelectedLineup,
  createTacticSetup,
  isTacticMentalityKey,
  TacticContractError,
  type SelectedLineup,
  type TacticSetup,
} from "./tactic.entity.ts";

/**
 * Tactic contract tests protect only the dependency-free domain language.
 *
 * Engine interpretation, required lineup size, and role-weight resolution are
 * intentionally covered by the later builder step.
 */
test("createSelectedLineup preserves explicit slot order", () => {
  const lineup = createSelectedLineup({
    clubId: clubId("club:pro01"),
    slots: [
      { slotKey: "gk", playerId: playerId("player:000001"), roleKey: "gk" },
      { slotKey: "cb-left", playerId: playerId("player:000002"), roleKey: "defender" },
      { slotKey: "st-right", playerId: playerId("player:000009"), roleKey: "attacker" },
    ],
  });

  assert.deepEqual(
    lineup.slots.map((slot) => slot.slotKey),
    ["gk", "cb-left", "st-right"],
  );
});

test("createSelectedLineup rejects empty lineups", () => {
  assertTacticContractError(
    () =>
      createSelectedLineup({
        clubId: clubId("club:pro01"),
        slots: [],
      }),
    "empty_lineup",
  );
});

test("createSelectedLineup rejects duplicate players", () => {
  const duplicatedPlayerId = playerId("player:000001");

  assertTacticContractError(
    () =>
      createSelectedLineup({
        clubId: clubId("club:pro01"),
        slots: [
          { slotKey: "cm-left", playerId: duplicatedPlayerId, roleKey: "midfielder" },
          { slotKey: "cm-right", playerId: duplicatedPlayerId, roleKey: "midfielder" },
        ],
      }),
    "duplicate_player",
  );
});

test("createSelectedLineup rejects missing players", () => {
  assertTacticContractError(
    () =>
      createSelectedLineup({
        clubId: clubId("club:pro01"),
        slots: [
          {
            slotKey: "gk",
            playerId: undefined as unknown as ReturnType<typeof playerId>,
            roleKey: "gk",
          },
        ],
      }),
    "missing_player",
  );
});

test("createSelectedLineup rejects ambiguous slot and role keys", () => {
  assertTacticContractError(
    () =>
      createSelectedLineup({
        clubId: clubId("club:pro01"),
        slots: [{ slotKey: "", playerId: playerId("player:000001"), roleKey: "gk" }],
      }),
    "missing_slot_key",
  );

  assertTacticContractError(
    () =>
      createSelectedLineup({
        clubId: clubId("club:pro01"),
        slots: [
          { slotKey: "cm", playerId: playerId("player:000001"), roleKey: "midfielder" },
          { slotKey: "cm", playerId: playerId("player:000002"), roleKey: "midfielder" },
        ],
      }),
    "duplicate_slot_key",
  );

  assertTacticContractError(
    () =>
      createSelectedLineup({
        clubId: clubId("club:pro01"),
        slots: [{ slotKey: "cm", playerId: playerId("player:000001"), roleKey: "" }],
      }),
    "missing_role_key",
  );
});

test("createTacticSetup accepts bounded serializable tactic values", () => {
  const tactic = createTacticSetup({
    mentality: "balanced",
    pressing: 0,
    directness: 0.25,
    width: 0.75,
    risk: 1,
  });

  assert.deepEqual(tactic, {
    mentality: "balanced",
    pressing: 0,
    directness: 0.25,
    width: 0.75,
    risk: 1,
  });
});

test("createTacticSetup rejects unsupported mentality keys", () => {
  assertTacticContractError(
    () =>
      createTacticSetup({
        mentality: "reckless" as TacticSetup["mentality"],
        pressing: 0.5,
        directness: 0.5,
        width: 0.5,
        risk: 0.5,
      }),
    "invalid_mentality",
  );
});

test("createTacticSetup rejects bad numeric tactic values", () => {
  assertTacticContractError(
    () =>
      createTacticSetup({
        mentality: "balanced",
        pressing: -0.1,
        directness: 0.5,
        width: 0.5,
        risk: 0.5,
      }),
    "invalid_tactic_value",
  );

  assertTacticContractError(
    () =>
      createTacticSetup({
        mentality: "balanced",
        pressing: 0.5,
        directness: Number.NaN,
        width: 0.5,
        risk: 0.5,
      }),
    "invalid_tactic_value",
  );
});

test("isTacticMentalityKey narrows only supported keys", () => {
  assert.equal(isTacticMentalityKey("very_defensive"), true);
  assert.equal(isTacticMentalityKey("balanced"), true);
  assert.equal(isTacticMentalityKey("reckless"), false);
});

test("selected lineup and tactic contracts are plain serializable data", () => {
  const setup = {
    lineup: createSelectedLineup(selectedLineupFixture()),
    tactic: createTacticSetup({
      mentality: "attacking",
      pressing: 0.7,
      directness: 0.6,
      width: 0.8,
      risk: 0.65,
    }),
  };

  assert.deepEqual(JSON.parse(JSON.stringify(setup)), {
    lineup: {
      clubId: "club:pro01",
      slots: [
        { slotKey: "gk", playerId: "player:000001", roleKey: "gk" },
        { slotKey: "st", playerId: "player:000009", roleKey: "attacker" },
      ],
    },
    tactic: {
      mentality: "attacking",
      pressing: 0.7,
      directness: 0.6,
      width: 0.8,
      risk: 0.65,
    },
  });
});

/**
 * Builds a compact valid lineup fixture for serializability tests.
 */
function selectedLineupFixture(): SelectedLineup {
  return {
    clubId: clubId("club:pro01"),
    slots: [
      { slotKey: "gk", playerId: playerId("player:000001"), roleKey: "gk" },
      { slotKey: "st", playerId: playerId("player:000009"), roleKey: "attacker" },
    ],
  };
}

/**
 * Asserts a typed tactic-contract failure and its stable machine code.
 */
function assertTacticContractError(action: () => void, code: TacticContractError["code"]): void {
  assert.throws(
    action,
    (error: unknown) => error instanceof TacticContractError && error.code === code,
  );
}
