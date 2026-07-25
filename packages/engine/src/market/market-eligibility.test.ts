import assert from "node:assert/strict";
import {
  competitionId,
  gameDate,
  seasonId,
  seasonTransferWindows,
  type SeasonTransferWindows,
} from "@game/domain";
import { fromISO } from "@game/shared";
import { test } from "vitest";

import {
  evaluateMarketActionEligibility,
  PRELIMINARY_AGREEMENT_MAX_REMAINING_DAYS,
} from "./market-eligibility.ts";

function windows(): SeasonTransferWindows {
  return seasonTransferWindows({
    competitionId: competitionId("competition:demo-third-division"),
    seasonId: seasonId("season:demo-001"),
    windows: [
      { opensOn: gameDate(fromISO("2026-07-01")), closesOn: gameDate(fromISO("2026-09-01")) },
      { opensOn: gameDate(fromISO("2027-01-02")), closesOn: gameDate(fromISO("2027-02-01")) },
    ],
  });
}

test("inspection and renewal are allowed all year", () => {
  for (const action of ["market_inspection", "contract_renewal"] as const) {
    const closed = evaluateMarketActionEligibility({
      action,
      windows: windows(),
      asOf: gameDate(fromISO("2026-11-15")),
    });
    assert.equal(closed.status, "allowed");
  }
});

test("a permanent transfer offer is allowed inside an open window with a close date", () => {
  const eligibility = evaluateMarketActionEligibility({
    action: "permanent_transfer_offer",
    windows: windows(),
    asOf: gameDate(fromISO("2026-08-01")),
  });
  assert.equal(eligibility.status, "allowed");
  assert.equal(
    eligibility.status === "allowed" ? eligibility.closesOn : undefined,
    gameDate(fromISO("2026-09-01")),
  );
});

test("a permanent transfer is blocked outside a window with the next opening date", () => {
  const eligibility = evaluateMarketActionEligibility({
    action: "permanent_transfer_completion",
    windows: windows(),
    asOf: gameDate(fromISO("2026-11-15")),
  });
  assert.equal(eligibility.status, "blocked");
  assert.equal(
    eligibility.status === "blocked" ? eligibility.reason : undefined,
    "outside_transfer_window",
  );
  assert.equal(
    eligibility.status === "blocked" ? eligibility.nextOpensOn : undefined,
    gameDate(fromISO("2027-01-02")),
  );
});

test("an external free-agent registration follows the same window gate", () => {
  const eligibility = evaluateMarketActionEligibility({
    action: "external_free_agent_registration",
    windows: windows(),
    asOf: gameDate(fromISO("2026-08-15")),
  });
  assert.equal(eligibility.status, "allowed");
});

test("a preliminary agreement is blocked with more than six months remaining", () => {
  const eligibility = evaluateMarketActionEligibility({
    action: "preliminary_agreement",
    windows: windows(),
    asOf: gameDate(fromISO("2026-11-15")),
    targetContractRemainingDays: PRELIMINARY_AGREEMENT_MAX_REMAINING_DAYS + 1,
  });
  assert.equal(eligibility.status, "blocked");
  assert.equal(
    eligibility.status === "blocked" ? eligibility.reason : undefined,
    "preliminary_agreement_not_yet_eligible",
  );
});

test("a preliminary agreement is allowed all year within the final six months", () => {
  const eligibility = evaluateMarketActionEligibility({
    action: "preliminary_agreement",
    windows: windows(),
    asOf: gameDate(fromISO("2026-11-15")),
    targetContractRemainingDays: PRELIMINARY_AGREEMENT_MAX_REMAINING_DAYS,
  });
  assert.equal(eligibility.status, "allowed");
});
