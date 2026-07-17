const DAY_IN_MILLISECONDS = 86_400_000;
const ORDINARY_DAY_DURATION_MS = 120;
const ORDINARY_DAY_COUNT = 7;
const MAX_TRANSITION_DURATION_MS = 1_800;
const MAX_ACCELERATED_FRAMES = 24;
const MAX_ACCELERATED_FRAME_DURATION_MS = 60;

/** One visible date change in the presentation-only calendar transition. */
export type CalendarAdvanceFrame = Readonly<{
  dateIso: string;
  delayMs: number;
}>;

/** Pure transition plan consumed inside the existing career command. */
export type CalendarAdvanceTransitionPlan = Readonly<{
  startDateIso: string;
  stopDateIso: string;
  initialDateIso: string;
  elapsedDays: number;
  totalDurationMs: number;
  frames: readonly CalendarAdvanceFrame[];
}>;

/**
 * Builds a bounded sequence of visible game dates without advancing the engine.
 *
 * The first week remains readable. Longer journeys sample later dates more
 * aggressively so a season break never turns Continue into a slow animation.
 */
export function buildCalendarAdvanceTransition(
  startDateIso: string,
  stopDateIso: string,
  reducedMotion = false,
): CalendarAdvanceTransitionPlan {
  const startEpochDay = parseCanonicalDate(startDateIso);
  const stopEpochDay = parseCanonicalDate(stopDateIso);
  const elapsedDays = stopEpochDay - startEpochDay;
  if (elapsedDays < 0) throw new RangeError("Calendar advancement cannot move backwards");

  if (elapsedDays === 0 || reducedMotion) {
    return {
      startDateIso,
      stopDateIso,
      initialDateIso: stopDateIso,
      elapsedDays,
      totalDurationMs: 0,
      frames: [],
    };
  }

  const ordinaryFrameCount = Math.min(elapsedDays, ORDINARY_DAY_COUNT);
  const frames: CalendarAdvanceFrame[] = Array.from(
    { length: ordinaryFrameCount },
    (_, index) => ({
      dateIso: formatEpochDay(startEpochDay + index + 1),
      delayMs: ORDINARY_DAY_DURATION_MS,
    }),
  );
  const remainingDays = elapsedDays - ordinaryFrameCount;

  if (remainingDays > 0) {
    const acceleratedFrameCount = Math.min(remainingDays, MAX_ACCELERATED_FRAMES);
    const remainingBudget = MAX_TRANSITION_DURATION_MS - (ordinaryFrameCount * ORDINARY_DAY_DURATION_MS);
    const acceleratedDelayMs = Math.min(
      MAX_ACCELERATED_FRAME_DURATION_MS,
      Math.floor(remainingBudget / acceleratedFrameCount),
    );

    for (let index = 1; index <= acceleratedFrameCount; index += 1) {
      const sampledOffset = ordinaryFrameCount
        + Math.ceil((index * remainingDays) / acceleratedFrameCount);
      frames.push({
        dateIso: formatEpochDay(startEpochDay + sampledOffset),
        delayMs: acceleratedDelayMs,
      });
    }
  }

  return {
    startDateIso,
    stopDateIso,
    initialDateIso: startDateIso,
    elapsedDays,
    totalDurationMs: frames.reduce((total, frame) => total + frame.delayMs, 0),
    frames,
  };
}

function parseCanonicalDate(dateIso: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (match === null) throw new RangeError(`Invalid canonical game date: ${dateIso}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const milliseconds = Date.UTC(year, month - 1, day);
  const parsed = new Date(milliseconds);
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) throw new RangeError(`Invalid canonical game date: ${dateIso}`);
  return Math.floor(milliseconds / DAY_IN_MILLISECONDS);
}

function formatEpochDay(epochDay: number): string {
  return new Date(epochDay * DAY_IN_MILLISECONDS).toISOString().slice(0, 10);
}
