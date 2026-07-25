import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, playerId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney } from "../value-objects/money.ts";
import { createNegotiationStageClock } from "./negotiation-stage-clock.ts";
import {
  createTransferNegotiationState,
  isOpenTransferNegotiation,
  TransferNegotiationStateError,
  transferNegotiationId,
  type AcceptedTransferNegotiation,
  type SubmittedTransferNegotiation,
} from "./transfer-negotiation.ts";

const BUYER = clubId("club:pro01");
const SELLER = clubId("club:pro18");
const TARGET = playerId("player:target");

function submitted(id: string, overrides: Partial<SubmittedTransferNegotiation> = {}): SubmittedTransferNegotiation {
  return {
    id: transferNegotiationId(id),
    status: "submitted",
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    submittedOn: gameDate(100),
    offeredFee: nonNegativeMoney(1_000_000),
    clock: createNegotiationStageClock({ submittedOn: gameDate(100), responseDelayDays: 2 }),
    ...overrides,
  };
}

function accepted(
  id: string,
  overrides: Partial<AcceptedTransferNegotiation> = {},
): AcceptedTransferNegotiation {
  return {
    id: transferNegotiationId(id),
    status: "accepted",
    buyingClubId: BUYER,
    sellingClubId: SELLER,
    playerId: TARGET,
    agreedFee: nonNegativeMoney(1_000_000),
    acceptedOn: gameDate(102),
    ...overrides,
  };
}

test("transferNegotiationId requires the transfer-negotiation namespace", () => {
  assert.throws(() => transferNegotiationId("negotiation:x"));
  assert.equal(String(transferNegotiationId("transfer-negotiation:x")), "transfer-negotiation:x");
});

test("a submitted or provisionally accepted negotiation is open", () => {
  assert.equal(isOpenTransferNegotiation(submitted("transfer-negotiation:1")), true);
  assert.equal(isOpenTransferNegotiation(accepted("transfer-negotiation:2")), true);
});

test("createTransferNegotiationState accepts a valid single negotiation", () => {
  const id = transferNegotiationId("transfer-negotiation:1");
  const state = createTransferNegotiationState({
    negotiations: { [id]: submitted("transfer-negotiation:1") },
    negotiationIds: [id],
  });
  assert.equal(state.negotiationIds.length, 1);
});

test("a non-positive offered fee is rejected", () => {
  const id = transferNegotiationId("transfer-negotiation:1");
  assert.throws(
    () =>
      createTransferNegotiationState({
        negotiations: { [id]: submitted("transfer-negotiation:1", { offeredFee: nonNegativeMoney(0) }) },
        negotiationIds: [id],
      }),
    (error: unknown) => error instanceof TransferNegotiationStateError && error.code === "invalid_offer_fee",
  );
});

test("a non-positive agreed fee is rejected before the player table starts", () => {
  const id = transferNegotiationId("transfer-negotiation:1");
  assert.throws(
    () =>
      createTransferNegotiationState({
        negotiations: {
          [id]: accepted("transfer-negotiation:1", {
            agreedFee: nonNegativeMoney(0),
          }),
        },
        negotiationIds: [id],
      }),
    (error: unknown) =>
      error instanceof TransferNegotiationStateError
      && error.code === "invalid_offer_fee",
  );
});

test("two open negotiations for the same buyer and player are rejected", () => {
  const a = transferNegotiationId("transfer-negotiation:1");
  const b = transferNegotiationId("transfer-negotiation:2");
  assert.throws(
    () =>
      createTransferNegotiationState({
        negotiations: { [a]: submitted("transfer-negotiation:1"), [b]: submitted("transfer-negotiation:2") },
        negotiationIds: [a, b],
      }),
    (error: unknown) =>
      error instanceof TransferNegotiationStateError && error.code === "duplicate_open_negotiation",
  );
});

test("buyer and seller must differ", () => {
  const id = transferNegotiationId("transfer-negotiation:1");
  assert.throws(
    () =>
      createTransferNegotiationState({
        negotiations: { [id]: submitted("transfer-negotiation:1", { sellingClubId: BUYER }) },
        negotiationIds: [id],
      }),
    (error: unknown) => error instanceof TransferNegotiationStateError && error.code === "same_club",
  );
});
