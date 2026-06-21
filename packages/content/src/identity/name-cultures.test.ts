import assert from "node:assert/strict";
import { test } from "vitest";

import { NAME_CULTURE_KEYS } from "@game/domain";

import { getNameCulturePool, NAME_CULTURE_POOL_KEYS, NAME_CULTURE_POOLS } from "./name-cultures.ts";

/** Verifies that fictional name pools cover every supported culture key. */

test("name culture pools cover every supported domain key in stable order", () => {
  assert.deepEqual(NAME_CULTURE_POOL_KEYS, NAME_CULTURE_KEYS);

  for (const key of NAME_CULTURE_KEYS) {
    const pool = getNameCulturePool(key);

    assert.equal(pool.key, key);
    assert.equal(pool, NAME_CULTURE_POOLS[key]);
  }
});

test("every name culture pool has enough first and last names", () => {
  for (const key of NAME_CULTURE_POOL_KEYS) {
    const pool = getNameCulturePool(key);

    assert.equal(pool.firstNames.length >= 6, true, `${key} first names`);
    assert.equal(pool.lastNames.length >= 6, true, `${key} last names`);
  }

  assert.equal(getNameCulturePool("italian").lastNames.length >= 180, true, "italian last names");
});

test("name pool entries are content names and not localization keys", () => {
  for (const key of NAME_CULTURE_POOL_KEYS) {
    const pool = getNameCulturePool(key);

    for (const name of [...pool.firstNames, ...pool.lastNames]) {
      assert.equal(name.trim(), name);
      assert.equal(name.length > 0, true);
      assert.equal(name.includes("."), false, `${name} should not look like an i18n key`);
      assert.equal(name.includes("{"), false, `${name} should not look like an interpolation template`);
    }
  }
});

test("name culture pools do not contain duplicate entries inside one pool", () => {
  for (const key of NAME_CULTURE_POOL_KEYS) {
    const pool = getNameCulturePool(key);

    assert.equal(new Set(pool.firstNames).size, pool.firstNames.length, `${key} first names`);
    assert.equal(new Set(pool.lastNames).size, pool.lastNames.length, `${key} last names`);
  }
});
