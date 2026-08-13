import assert from "node:assert/strict";
import { test } from "vitest";

import type { ClubId } from "../career/types.ts";
import { firstClubByIdentity, OWN_SQUAD_AGENCY_SEED_SETS } from "./own-squad-agency-section.ts";

test("locks two untouched disjoint Checkpoint D2 seed sets", () => {
  assert.deepEqual(OWN_SQUAD_AGENCY_SEED_SETS, [
    { setName: "d2-c", seedPrefix: "phase81a-specialised-own-squad-c" },
    { setName: "d2-d", seedPrefix: "phase81a-specialised-own-squad-d" },
  ]);
});

test("samples the first stable club for every declared identity", () => {
  const club = (value: string) => value as ClubId;
  const identities = new Map<ClubId, string>([
    [club("club:z"), "wide"],
    [club("club:b"), "central"],
    [club("club:a"), "wide"],
  ]);

  assert.deepEqual(firstClubByIdentity(identities, ["wide", "central"]), [
    club("club:a"),
    club("club:b"),
  ]);
  assert.throws(() => firstClubByIdentity(identities, ["missing"]), /did not observe/);
});
