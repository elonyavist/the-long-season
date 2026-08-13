import assert from "node:assert/strict";
import { test } from "vitest";

import type { ClubId } from "../career/types.ts";
import { firstClubByIdentity, OWN_SQUAD_AGENCY_SEED_SETS } from "./own-squad-agency-section.ts";

test("locks two disjoint Checkpoint D seed sets", () => {
  assert.deepEqual(OWN_SQUAD_AGENCY_SEED_SETS, [
    { setName: "in-sample", seedPrefix: "phase81a-own-squad-agency-a" },
    { setName: "out-of-sample", seedPrefix: "phase81a-own-squad-agency-b" },
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
