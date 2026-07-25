import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_CONTRACT_EXPIRY_ALERT_DAYS,
  hasCareerContractExpiryAlert,
} from "./career-contract-expiry.ts";

test("uses one exact contract-expiry boundary for every career surface", () => {
  assert.equal(CAREER_CONTRACT_EXPIRY_ALERT_DAYS, 244);
  assert.equal(hasCareerContractExpiryAlert(243), true);
  assert.equal(hasCareerContractExpiryAlert(244), false);
  assert.equal(hasCareerContractExpiryAlert(245), false);
});

test("rejects invalid remaining-day facts instead of hiding corrupt input", () => {
  assert.throws(() => hasCareerContractExpiryAlert(-1), RangeError);
  assert.throws(() => hasCareerContractExpiryAlert(2.5), RangeError);
});
