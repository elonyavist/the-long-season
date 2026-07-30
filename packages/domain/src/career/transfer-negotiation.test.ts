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
  type CompletedTransferNegotiation,
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
    publicValue: nonNegativeMoney(900_000),
    initialAskingPrice: nonNegativeMoney(1_100_000),
    currentAskingPrice: nonNegativeMoney(1_100_000),
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
    publicValue: nonNegativeMoney(900_000),
    initialAskingPrice: nonNegativeMoney(1_100_000),
    currentAskingPrice: nonNegativeMoney(1_100_000),
    offeredFee: nonNegativeMoney(1_000_000),
    agreedFee: nonNegativeMoney(1_000_000),
    acceptedOn: gameDate(102),
    clock: createNegotiationStageClock({ submittedOn: gameDate(100), responseDelayDays: 2 }),
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

test("commercial snapshot remains structurally distinct after club acceptance", () => {
  const negotiation = accepted("transfer-negotiation:commercial");
  assert.equal(negotiation.publicValue, 900_000);
  assert.equal(negotiation.initialAskingPrice, 1_100_000);
  assert.equal(negotiation.currentAskingPrice, 1_100_000);
  assert.equal(negotiation.offeredFee, 1_000_000);
  assert.equal(negotiation.agreedFee, 1_000_000);
});

test("completed fee must equal the agreed fee", () => {
  const acceptedNegotiation = accepted("transfer-negotiation:completed");
  const completed: CompletedTransferNegotiation = {
    ...acceptedNegotiation,
    status: "completed",
    completedOn: gameDate(103),
    completedFee: nonNegativeMoney(999_999),
    acceptedTerms: {
      durationYears: 3,
      annualWage: nonNegativeMoney(100_000),
      squadStatus: "squad_player",
      bonuses: {
        signingBonus: nonNegativeMoney(10_000),
        appearanceBonus: nonNegativeMoney(1_000),
      },
    },
    acceptedSource: "submitted_offer",
    evaluation: {
      decision: "accepted",
      scoreBasisPoints: 10_000,
      reasons: [],
      demand: {} as CompletedTransferNegotiation["evaluation"]["demand"],
    },
    activatedContractId: "contract:completed" as CompletedTransferNegotiation["activatedContractId"],
    transferHistorySequence: 1,
  };
  assert.throws(
    () => createTransferNegotiationState({
      negotiations: { [completed.id]: completed },
      negotiationIds: [completed.id],
    }),
    (error: unknown) =>
      error instanceof TransferNegotiationStateError
      && error.code === "completed_fee_mismatch",
  );
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
