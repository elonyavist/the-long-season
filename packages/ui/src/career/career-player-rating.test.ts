import assert from "node:assert/strict";
import { test } from "vitest";

import {
  compareCareerPlayerPotentialRanges,
  copyCareerPlayerPotentialRange,
} from "./career-player-rating.ts";

test("copies ordered half-star potential ranges without exposing ability", () => {
  const input = { lowerStars: 3.5, upperStars: 5 } as const;
  const copied = copyCareerPlayerPotentialRange(input);

  assert.deepEqual(copied, input);
  assert.notEqual(copied, input);
  assert.equal(JSON.stringify(copied).includes("ability"), false);
});

test("compares conservative lower estimate before upper ceiling", () => {
  assert.equal(
    compareCareerPlayerPotentialRanges(
      { lowerStars: 2, upperStars: 6 },
      { lowerStars: 4, upperStars: 5.5 },
    ) < 0,
    true,
  );
  assert.equal(
    compareCareerPlayerPotentialRanges(
      { lowerStars: 4, upperStars: 5 },
      { lowerStars: 4, upperStars: 5.5 },
    ) < 0,
    true,
  );
});

test("rejects inverted or unsupported potential ranges", () => {
  assert.throws(
    () => copyCareerPlayerPotentialRange({
      lowerStars: 5,
      upperStars: 4,
    }),
    /inverted/,
  );
  assert.throws(
    () => copyCareerPlayerPotentialRange({
      lowerStars: 3,
      upperStars: 4.25 as 4.5,
    }),
    /Unsupported/,
  );
});
