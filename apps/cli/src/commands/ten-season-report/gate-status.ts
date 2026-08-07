/** The three facts that decide whether a long-run gate run passed. */
export interface LongRunGateOutcomeFacts {
  /** Worlds whose own anomaly report came back failing. */
  readonly failedWorldCount: number;
  /** Player-economy gate violations pooled across every world. */
  readonly playerEconomyViolationCount: number;
  /** Whether the closing division value distribution fits its calibration. */
  readonly closingPlayerMarketFitStatus: "pass" | "fail";
}

/**
 * Decides a long-run gate run's status from the only three facts that decide it.
 *
 * Extracted so the rule can be *tested* rather than only observed through a
 * fifteen-minute command. It is deliberately **fail-closed**: any one failing
 * fact fails the run, and there is no sample-size term anywhere in it.
 *
 * That absence is the point. A test used to assert that a two-world run exits
 * `1`, under a comment saying two worlds cannot prove the cohort bands - but
 * nothing here counts worlds, so what that test actually caught was whether that
 * particular seed's population happened to contain a division-value outlier.
 * Change the population and the "gate" silently goes green. Read this function
 * before writing any test that expects a small sample to fail: it will not.
 *
 * @example
 * longRunGateStatus({
 *   failedWorldCount: 0,
 *   playerEconomyViolationCount: 0,
 *   closingPlayerMarketFitStatus: "fail",
 * }); // => "fail"
 */
export function longRunGateStatus(facts: LongRunGateOutcomeFacts): "pass" | "fail" {
  return facts.failedWorldCount > 0
      || facts.playerEconomyViolationCount > 0
      || facts.closingPlayerMarketFitStatus === "fail"
    ? "fail"
    : "pass";
}

/**
 * Maps a gate status onto the process exit code, in one place.
 *
 * The command used to spell this out inline, which left nothing to test but the
 * command itself. A gate that reports `fail` and exits `0` is worse than no
 * gate, so the mapping is total and has no third branch.
 *
 * @example
 * longRunGateExitCode("fail"); // => 1
 */
export function longRunGateExitCode(status: "pass" | "fail"): 0 | 1 {
  return status === "pass" ? 0 : 1;
}
