import { test } from "vitest";
import assert from "node:assert/strict";

import { clubId, playerId } from "../types/ids.ts";
import {
  createPermanentTransferIntent,
  TransferContractError,
} from "./transfer.entity.ts";

/**
 * Transfer entity tests cover only dependency-free market data invariants.
 *
 * Ownership, valuation, willingness, and state previews are engine
 * responsibilities and are intentionally not tested here.
 */
test("createPermanentTransferIntent rejects same-club transfers", () => {
  const pro01 = clubId("club:pro01");

  assertTransferContractError(
    () =>
      createPermanentTransferIntent({
        buyingClubId: pro01,
        sellingClubId: pro01,
        playerId: playerId("player:000001"),
      }),
    "same_club",
  );
});

test("createPermanentTransferIntent preserves explicit IDs", () => {
  const intent = createPermanentTransferIntent({
    buyingClubId: clubId("club:pro01"),
    sellingClubId: clubId("club:pro18"),
    playerId: playerId("player:000999"),
  });

  assert.deepEqual(JSON.parse(JSON.stringify(intent)), {
    buyingClubId: "club:pro01",
    sellingClubId: "club:pro18",
    playerId: "player:000999",
  });
});

/**
 * Asserts a typed transfer-domain failure and its stable machine code.
 */
function assertTransferContractError(
  action: () => void,
  code: TransferContractError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof TransferContractError && error.code === code,
  );
}
