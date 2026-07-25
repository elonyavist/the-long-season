import assert from "node:assert/strict";
import { test } from "vitest";

import { gameDate } from "../value-objects/game-date.ts";
import {
  counterResponseClock,
  createNegotiationStageClock,
  isNegotiationStageDue,
  isNegotiationStageExpired,
  NEGOTIATION_STAGE_MAX_DAYS,
  NegotiationStageClockError,
} from "./negotiation-stage-clock.ts";

test("a stage deadline is at most three days after submission", () => {
  const clock = createNegotiationStageClock({ submittedOn: gameDate(100), responseDelayDays: 2 });
  assert.equal(clock.submittedOn, gameDate(100));
  assert.equal(clock.responseDueOn, gameDate(102));
  assert.equal(clock.deadline, gameDate(100 + NEGOTIATION_STAGE_MAX_DAYS));
});

test("the deadline is capped at a window close before three days", () => {
  const clock = createNegotiationStageClock({
    submittedOn: gameDate(100),
    responseDelayDays: 3,
    windowClosesOn: gameDate(101),
  });
  assert.equal(clock.deadline, gameDate(101));
  // The response date cannot fall after the capped deadline.
  assert.equal(clock.responseDueOn, gameDate(101));
});

test("a non-window hard deadline caps a stage before contract expiry", () => {
  const clock = createNegotiationStageClock({
    submittedOn: gameDate(100),
    responseDelayDays: 3,
    mustResolveBy: gameDate(101),
  });
  assert.equal(clock.deadline, gameDate(101));
  assert.equal(clock.responseDueOn, gameDate(101));
});

test("a counteroffer keeps the original stage deadline", () => {
  const clock = createNegotiationStageClock({ submittedOn: gameDate(100), responseDelayDays: 1 });
  const countered = counterResponseClock(clock, 3);
  assert.equal(countered.deadline, clock.deadline);
  assert.equal(countered.responseDueOn, clock.deadline);
});

test("a stage is due on or after its response date and expired only past its deadline", () => {
  const clock = createNegotiationStageClock({ submittedOn: gameDate(100), responseDelayDays: 2 });
  assert.equal(isNegotiationStageDue(clock, gameDate(101)), false);
  assert.equal(isNegotiationStageDue(clock, gameDate(102)), true);
  assert.equal(isNegotiationStageExpired(clock, gameDate(103)), false);
  assert.equal(isNegotiationStageExpired(clock, gameDate(104)), true);
});

test("a negative response delay is rejected", () => {
  assert.throws(
    () => createNegotiationStageClock({ submittedOn: gameDate(100), responseDelayDays: -1 }),
    (error: unknown) =>
      error instanceof NegotiationStageClockError && error.code === "invalid_response_delay",
  );
});

test("a window that closed before submission is rejected", () => {
  assert.throws(
    () =>
      createNegotiationStageClock({
        submittedOn: gameDate(100),
        responseDelayDays: 1,
        windowClosesOn: gameDate(99),
      }),
    (error: unknown) =>
      error instanceof NegotiationStageClockError && error.code === "closed_before_submission",
  );
});
