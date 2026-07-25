/**
 * Presentation threshold for warning that a senior contract is close to expiry.
 *
 * The value preserves the product-approved eight-month approximation used by
 * the Squad table and player profile: 244 remaining days is still secure,
 * while 243 remaining days or fewer raises the alert.
 */
export const CAREER_CONTRACT_EXPIRY_ALERT_DAYS = 244;

/**
 * Returns whether a contract should carry the shared eight-month expiry alert.
 *
 * This is a presentation policy, not a renewal or market-eligibility rule.
 */
export function hasCareerContractExpiryAlert(remainingDays: number): boolean {
  if (!Number.isInteger(remainingDays) || remainingDays < 0) {
    throw new RangeError(`Contract remaining days must be a non-negative integer: ${remainingDays}`);
  }
  return remainingDays < CAREER_CONTRACT_EXPIRY_ALERT_DAYS;
}
