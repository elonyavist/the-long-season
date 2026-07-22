import type { Transition } from "motion/react";

const micro = {
  duration: 0.16,
  ease: [0.22, 1, 0.36, 1],
} satisfies Transition;

const transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} satisfies Transition;

const narrative = {
  duration: 0.42,
  ease: [0.16, 1, 0.3, 1],
} satisfies Transition;

/**
 * Shared semantic motion values for the browser presentation adapter.
 *
 * Consumers choose a product meaning rather than inventing screen-local
 * durations. Gameplay pacing remains owned by its existing runtime modules.
 */
export const webMotion = Object.freeze({
  micro,
  transition,
  narrative,
  matchClockRunning: {
    duration: 1.1,
    ease: "easeInOut",
    repeat: Infinity,
  } satisfies Transition,
  commandPending: {
    duration: 0.72,
    ease: "linear",
    repeat: Infinity,
  } satisfies Transition,
});

/** Shared visual targets for production-used motion states. */
export const webMotionTargets = Object.freeze({
  rest: { opacity: 1, scale: 1, x: 0, y: 0 },
  inboxDetailEnter: { opacity: 0.86, scale: 1, x: 6, y: 0 },
  attentionArrival: { opacity: 0.72, scale: 0.99, x: 0, y: 6 },
  calendarDateTickEnter: { opacity: 0.55, scale: 0.98, x: 0, y: 5 },
  dashboardTaskEnter: { opacity: 0.84, scale: 1, x: 0, y: 4 },
  dialogEnter: { opacity: 0.9, scale: 0.99, x: 0, y: 5 },
  footballContextEnter: { opacity: 0.88, scale: 1, x: 0, y: 3 },
  tacticalSelectionEnter: { opacity: 0.58, scale: 1, x: 0, y: 0 },
  tacticalPopoverEnter: { opacity: 0.86, scale: 0.985, x: 0, y: 2 },
  matchCommentaryEnter: { opacity: 0.72, scale: 1, x: 0, y: 3 },
  matchGoalCommentaryEnter: { opacity: 0.9, scale: 0.985, x: 0, y: 5 },
  matchClockTickEnter: { opacity: 0.62, scale: 0.94, x: 0, y: 2 },
  matchClockRunning: {
    opacity: [0.5, 1, 0.5],
    scale: [0.86, 1, 0.86],
    x: 0,
    y: 0,
  },
  matchScoreChangeEnter: { opacity: 1, scale: 1.16, x: 0, y: 0 },
  matchTabellinoGoalEnter: { opacity: 0.9, scale: 0.992, x: 0, y: 3 },
  matchTabellinoSecondaryEnter: { opacity: 0.76, scale: 1, x: 0, y: 2 },
  matchCheckpointEnter: { opacity: 0.94, scale: 0.997, x: 0, y: 6 },
  matchReviewEnter: { opacity: 0.94, scale: 1, x: 0, y: 5 },
  matchTabPanelEnter: { opacity: 0.88, scale: 1, x: 4, y: 0 },
  controlPress: { opacity: 1, scale: 0.97, x: 0, y: 0 },
  attentionCue: {
    opacity: [1, 0.84, 1],
    scale: [1, 1.012, 1],
    x: 0,
    y: 0,
  },
});
