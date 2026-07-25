import { NEGOTIATION_STAGE_MAX_DAYS, type GameDate } from "@game/domain";
import { deriveRng } from "@game/shared";

/**
 * Deterministically seeds one negotiation-stage reply delay in
 * `0..NEGOTIATION_STAGE_MAX_DAYS` days.
 *
 * Every stage-clocked negotiation family (club transfer, player transfer,
 * preliminary agreement) answers on the same bounded window; each caller only
 * supplies its own stable RNG stream key so the streams never collide. The
 * bound is derived from the shared stage constant rather than a literal so the
 * reply window and the stage deadline can never drift apart.
 */
export function deriveNegotiationStageResponseDelayDays(input: {
  readonly seed: string;
  readonly streamKey: string;
  readonly negotiationId: string;
  readonly submittedOn: GameDate;
}): number {
  return deriveRng(input.seed, input.streamKey, input.negotiationId, input.submittedOn)
    .nextInt(0, NEGOTIATION_STAGE_MAX_DAYS + 1);
}
