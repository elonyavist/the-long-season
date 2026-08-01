import assert from "node:assert/strict";
import { test } from "vitest";

import {
  compareCareerPlayerPotentialRanges,
  copyCareerPlayerPotentialRange,
} from "./career-player-rating.ts";

test("copies ordered half-star potential ranges without exposing ability", () => {
  const input = { p50Stars: 3.5, upperStars: 5 } as const;
  const copied = copyCareerPlayerPotentialRange(input);

  assert.deepEqual(copied, input);
  assert.notEqual(copied, input);
  assert.equal(JSON.stringify(copied).includes("ability"), false);
});

test("compares the explicit P50 estimate before the public upper", () => {
  assert.equal(
    compareCareerPlayerPotentialRanges(
      { p50Stars: 2, upperStars: 6 },
      { p50Stars: 4, upperStars: 5.5 },
    ) < 0,
    true,
  );
  assert.equal(
    compareCareerPlayerPotentialRanges(
      { p50Stars: 4, upperStars: 5 },
      { p50Stars: 4, upperStars: 5.5 },
    ) < 0,
    true,
  );
});

test("rejects inverted or unsupported potential ranges", () => {
  assert.throws(
    () => copyCareerPlayerPotentialRange({
      p50Stars: 5,
      upperStars: 4,
    }),
    /inverted/,
  );
  assert.throws(
    () => copyCareerPlayerPotentialRange({
      p50Stars: 3,
      upperStars: 4.25 as 4.5,
    }),
    /Unsupported/,
  );
});
