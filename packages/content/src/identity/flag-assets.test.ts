import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "vitest";

import { NATIONALITY_CODES, type NationalityCode } from "@game/domain";

import { flagAssetForNationality } from "./flag-assets.ts";

/** Tests keep supported nationality metadata aligned with checked-in SVG assets. */

test("every supported nationality maps to a deterministic flag asset", () => {
  const assets = NATIONALITY_CODES.map((nationality) => flagAssetForNationality(nationality));
  const mappedNationalities = assets.map((asset) => asset.nationality);

  assert.deepEqual(mappedNationalities, NATIONALITY_CODES);
  assert.equal(flagAssetForNationality("italian").assetCode, "it");
  assert.equal(flagAssetForNationality("english").assetPath, "assets/flags/gb-eng.svg");
  assert.equal(flagAssetForNationality("south_korean").assetCode, "kr");
});

test("every supported nationality flag asset exists on disk", () => {
  for (const nationality of NATIONALITY_CODES) {
    const asset = flagAssetForNationality(nationality);
    const absolutePath = join(process.cwd(), asset.assetPath);

    assert.equal(existsSync(absolutePath), true, `missing flag asset for ${nationality}: ${asset.assetPath}`);
  }
});

test("flag helper accepts only supported nationality codes at compile time", () => {
  const nationality: NationalityCode = "ivorian";

  assert.deepEqual(flagAssetForNationality(nationality), {
    nationality: "ivorian",
    assetCode: "ci",
    assetPath: "assets/flags/ci.svg",
  });
});

