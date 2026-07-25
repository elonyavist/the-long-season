import assert from "node:assert/strict";
import { test } from "vitest";

import { nonNegativeMoney } from "@game/domain";

import {
  buildCareerMarketView,
  type CareerMarketFinanceView,
  type CareerMarketNegotiationInput,
  type CareerMarketReadyInput,
} from "./career-market-view.ts";

test("keeps loading and recoverable error states first-class", () => {
  assert.deepEqual(buildCareerMarketView({ status: "loading" }), {
    status: "loading",
    screenKey: "career.market",
  });
  assert.deepEqual(buildCareerMarketView({
    status: "error",
    messageKey: "career.market.error.unavailable",
  }), {
    status: "error",
    screenKey: "career.market",
    messageKey: "career.market.error.unavailable",
  });
});

test("keeps actual finance and informational pending exposure distinct", () => {
  const view = buildCareerMarketView(readyInput());

  assert.equal(view.status, "ready");
  if (view.status !== "ready") return;
  assert.equal(view.window.status, "open");
  assert.equal(view.finance.transferBudget, 5_000_000_00);
  assert.equal(view.finance.pendingExposure.transferFees, 7_000_000_00);
  assert.equal(view.finance.pendingExposure.openNegotiationCount, 2);
  assert.equal(view.offerPreview?.status, "ready");
  if (view.offerPreview?.status !== "ready") return;
  assert.equal(view.offerPreview.currentFinance.transferBudget, 5_000_000_00);
  assert.equal(view.offerPreview.projectedFinance.transferBudget, 3_500_000_00);
  assert.equal(view.offerPreview.existingPendingExposure.transferFees, 7_000_000_00);
});

test("supports closed-window ready states without inventing an opening date", () => {
  const input = readyInput();
  const view = buildCareerMarketView({
    ...input,
    window: { status: "closed", currentDateIso: "2026-09-01" },
  });

  assert.equal(view.status, "ready");
  if (view.status !== "ready") return;
  assert.deepEqual(view.window, {
    status: "closed",
    currentDateIso: "2026-09-01",
  });
});

test("classifies and orders pending negotiations before completed outcomes", () => {
  const view = buildCareerMarketView(readyInput());

  assert.equal(view.status, "ready");
  if (view.status !== "ready") return;
  assert.deepEqual(
    view.negotiations.map((negotiation) => [
      negotiation.negotiationId,
      negotiation.lifecycle,
    ]),
    [
      ["negotiation:counter", "pending"],
      ["negotiation:player", "pending"],
      ["negotiation:complete", "completed"],
    ],
  );
});

test("rejects unsafe finance values and duplicate negotiation identities", () => {
  const input = readyInput();

  assert.throws(
    () => buildCareerMarketView({
      ...input,
      finance: {
        ...input.finance,
        cashBalance: -1 as CareerMarketFinanceView["cashBalance"],
      },
    }),
    /non-negative integer minor units/,
  );
  assert.throws(
    () => buildCareerMarketView({
      ...input,
      negotiations: [input.negotiations[0]!, input.negotiations[0]!],
    }),
    /Duplicate market negotiation/,
  );
});

function readyInput(): CareerMarketReadyInput {
  const pendingExposure = {
    transferFees: nonNegativeMoney(7_000_000_00),
    annualWages: nonNegativeMoney(1_800_000_00),
    signingBonuses: nonNegativeMoney(300_000_00),
    immediateCash: nonNegativeMoney(7_300_000_00),
    openNegotiationCount: 2,
  };
  const currentFinance = {
    currency: "EUR" as const,
    cashBalance: nonNegativeMoney(20_000_000_00),
    transferBudget: nonNegativeMoney(5_000_000_00),
    annualWageBudget: nonNegativeMoney(10_000_000_00),
    committedAnnualWage: nonNegativeMoney(8_000_000_00),
    annualWageHeadroom: nonNegativeMoney(2_000_000_00),
  };
  const projectedFinance = {
    ...currentFinance,
    cashBalance: nonNegativeMoney(18_400_000_00),
    transferBudget: nonNegativeMoney(3_500_000_00),
    committedAnnualWage: nonNegativeMoney(8_500_000_00),
    annualWageHeadroom: nonNegativeMoney(1_500_000_00),
  };

  return {
    status: "ready",
    competitionName: "Demo Third Division",
    window: {
      status: "open",
      currentDateIso: "2026-08-01",
      closesOnIso: "2026-08-15",
    },
    finance: { ...currentFinance, pendingExposure },
    targets: [],
    offerPreview: {
      status: "ready",
      previewId: "preview:one",
      kind: "transfer_offer",
      transferFee: nonNegativeMoney(1_500_000_00),
      currentFinance,
      projectedFinance,
      existingPendingExposure: pendingExposure,
    },
    negotiations: negotiations(),
  };
}

function negotiations(): readonly CareerMarketNegotiationInput[] {
  return [
    {
      negotiationId: "negotiation:complete",
      playerId: "player:three",
      playerName: "Nico Gamma",
      stage: "player",
      status: "completed",
      openedOnIso: "2026-07-20",
      resolvedOnIso: "2026-07-23",
    },
    {
      negotiationId: "negotiation:player",
      playerId: "player:two",
      playerName: "Marco Beta",
      stage: "player",
      status: "player_offer_submitted",
      openedOnIso: "2026-08-01",
      deadlineOnIso: "2026-08-04",
    },
    {
      negotiationId: "negotiation:counter",
      playerId: "player:one",
      playerName: "Luca Alfa",
      counterpartClubName: "Alfa Calcio",
      stage: "club",
      status: "countered",
      openedOnIso: "2026-07-31",
      deadlineOnIso: "2026-08-03",
    },
  ];
}
