import {
  TACTIC_KNOB_EXPOSED_ROUTE,
  TACTICAL_ROUTE_DEFINITION,
  TACTICAL_SHAPE_CAPACITIES,
  type TacticKnob,
  type MatchTacticalChapterChangeKind,
  type MatchTacticalChapterFact,
  type MatchTacticalChapterSideFact,
  type TacticalShapeCapacity,
} from "@game/domain";

/**
 * One eleven's shape read against an ordinary eleven's, per locked capacity.
 *
 * `1` is what an ordinary curated formation puts into a capacity, below `1` is
 * a capacity this shape gives up and above `1` is one it concentrates in. The
 * engine derives it; this package never computes it and never shows it.
 */
export type TacticalConsequenceShapeReading = Readonly<Record<TacticalShapeCapacity, number>>;

/** The manager's four numeric tactic instructions, on their own `0..1` scale. */
export type TacticalConsequenceTacticReading = Readonly<Record<TacticKnob, number>>;

/** Everything known about the plan a side is about to play, or is playing. */
export interface TacticalConsequenceReading {
  /** Shape read against an ordinary eleven. */
  readonly shape: TacticalConsequenceShapeReading;
  /**
   * Tactic knobs, absent while the manager has not chosen a tactic yet.
   *
   * Absent is a real state before kick-off, not a missing value to paper over:
   * rules that read a knob simply do not apply, and the shape still speaks.
   */
  readonly tactic?: TacticalConsequenceTacticReading;
}

/**
 * One structured football consequence of the current shape.
 *
 * The set is closed on purpose. A manager reading a screen needs a small number
 * of things he can act on, and an open list of every capacity that moved would
 * be a formula printed in words.
 */
export type TacticalConsequenceKey =
  | "weak_build_up"
  | "weak_central_connection"
  | "no_attacking_width"
  | "thin_box_presence"
  | "press_without_cover"
  | "open_centre"
  | "open_left_flank"
  | "open_right_flank"
  | "unprotected_box"
  | "blunt_counter"
  | "exposed_transition"
  | "left_overload"
  | "right_overload"
  | "heavy_box_presence"
  | "sharp_counter"
  | "packed_centre"
  | "deep_rest_defence";

/**
 * What kind of thing an observation is, which is also its priority.
 *
 * An `exposure` is a cost the shape is paying and the manager may not have
 * chosen deliberately, so it is reported first. An `overload` is a side he has
 * loaded at the other side's expense. An `emphasis` is where the shape
 * concentrates - not a warning, and never worth pushing an exposure off a small
 * screen.
 */
export type TacticalConsequenceKind = "exposure" | "overload" | "emphasis";

/**
 * How one observation is decided from the shape reading.
 *
 * `below` reads the mean of its capacities, which is how "no width at all" is
 * separated from "all the width on one side": the first collapses the mean and
 * the second leaves it alone. `dominates` compares two capacities against each
 * other and is therefore the one rule that needs no reference at all.
 *
 * `knobExposes` is the only rule that reads a tactic. It names a knob and
 * nothing else: *which* route that knob hands the opponent, and which of the
 * manager's own capacities have to resist it, are read from
 * `TACTIC_KNOB_EXPOSED_ROUTE` and `TACTICAL_ROUTE_DEFINITION` - the mappings
 * Step 06 owns. Restating either here would be the second owner of a football
 * fact that already has one.
 */
export type TacticalConsequenceRule =
  | { readonly rule: "below"; readonly capacities: readonly TacticalShapeCapacity[] }
  | { readonly rule: "above"; readonly capacity: TacticalShapeCapacity }
  | { readonly rule: "dominates"; readonly capacity: TacticalShapeCapacity; readonly over: TacticalShapeCapacity }
  | { readonly rule: "knobExposes"; readonly knob: TacticKnob };

/**
 * A capacity this far below ordinary is a consequence worth reporting.
 *
 * Measured, not chosen: across the curated formation catalog and squad
 * abilities from `4` to `18`, every capacity of every curated formation stays
 * inside `[0.75, 1.25)` with one deliberate exception - `3-3-3-1` fields three
 * central midfielders and no wide defender, so it really has given up its
 * flanks. A sane shape is therefore silent, and what the manager sees is
 * something he built himself.
 */
export const TACTICAL_CONSEQUENCE_EXPOSURE_BELOW = 0.75;

/** A capacity this far above ordinary is where the shape concentrates. */
export const TACTICAL_CONSEQUENCE_EMPHASIS_AT_LEAST = 1.25;

/**
 * One flank must carry this much more than the other to count as loaded.
 *
 * Every curated formation is mirror-symmetric and reads exactly `1`. Moving one
 * wide player across reaches roughly `1.5`, and the reading weakens as a squad
 * improves, so the threshold clears the weakest real imbalance rather than the
 * loudest.
 */
export const TACTICAL_CONSEQUENCE_OVERLOAD_RATIO = 1.25;

/**
 * A knob turned past this is an instruction, not a default.
 *
 * The scale is `0..1` with `0.5` neutral. The three shipped tactic profiles sit
 * at `0.5`, `0.85` and `0.35`, so today this reads as "the manager chose the
 * attacking profile" - the population is that coarse, and a wider set of
 * profiles is what would give this number finer meaning.
 */
export const TACTICAL_CONSEQUENCE_KNOB_ABOVE = 0.6;

/**
 * Floor used when one flank is empty, so the comparison stays finite.
 *
 * Small enough that reaching it already means the shape has abandoned that
 * side, and it only ever makes the reported imbalance *smaller* than the truth.
 */
const TACTICAL_CONSEQUENCE_MINIMUM_FLANK = 0.05;

/**
 * How many observations a screen may show.
 *
 * A broken shape produces six or seven at once. Printing all of them is a
 * diagnostic report, not a football briefing, and the manager stops reading.
 * One of the three is reserved for what the shape gained whenever it gained
 * anything - see `selectShownObservations`.
 */
export const MAX_TACTICAL_CONSEQUENCES = 3;

/**
 * Every observation with the rule that decides it and the kind that ranks it.
 *
 * Declared with `satisfies` over the closed key union, so a consequence cannot
 * be added without a rule. That is not the same as being *reachable*: a rule
 * whose threshold no eleven can cross compiles perfectly and reports nothing
 * forever, which is what `loose_press` did until it was swept. The gate for
 * that lives in `match-preparation-adapter.test.ts`, where shipped content is
 * in scope, and it is written per rule rather than per capacity.
 */
export const TACTICAL_CONSEQUENCE_RULES = {
  weak_build_up: { kind: "exposure", rule: "below", capacities: ["build_up"] },
  weak_central_connection: { kind: "exposure", rule: "below", capacities: ["central_progression"] },
  no_attacking_width: { kind: "exposure", rule: "below", capacities: ["left_progression", "right_progression"] },
  thin_box_presence: { kind: "exposure", rule: "below", capacities: ["final_third_presence"] },
  press_without_cover: { kind: "exposure", rule: "knobExposes", knob: "pressing" },
  open_centre: { kind: "exposure", rule: "below", capacities: ["central_coverage"] },
  open_left_flank: { kind: "exposure", rule: "below", capacities: ["left_coverage"] },
  open_right_flank: { kind: "exposure", rule: "below", capacities: ["right_coverage"] },
  unprotected_box: { kind: "exposure", rule: "below", capacities: ["box_protection"] },
  blunt_counter: { kind: "exposure", rule: "below", capacities: ["counter_threat"] },
  exposed_transition: { kind: "exposure", rule: "below", capacities: ["rest_defence"] },
  left_overload: { kind: "overload", rule: "dominates", capacity: "left_progression", over: "right_progression" },
  right_overload: { kind: "overload", rule: "dominates", capacity: "right_progression", over: "left_progression" },
  heavy_box_presence: { kind: "emphasis", rule: "above", capacity: "final_third_presence" },
  sharp_counter: { kind: "emphasis", rule: "above", capacity: "counter_threat" },
  packed_centre: { kind: "emphasis", rule: "above", capacity: "central_coverage" },
  deep_rest_defence: { kind: "emphasis", rule: "above", capacity: "rest_defence" },
} as const satisfies Readonly<
  Record<TacticalConsequenceKey, TacticalConsequenceRule & { readonly kind: TacticalConsequenceKind }>
>;

/**
 * Capacities no rule reads, and why - stated rather than left to be noticed.
 *
 * `pressing_cohesion` reads `[0.903, 1.910]` across every eleven a manager can
 * put on the board, measured over `3294` of them spanning three generated
 * worlds, nine formations, and every single-role and split-role composition.
 * It **cannot fall** below the `0.75` exposure band, so a `loose_press`
 * observation lived here until it was measured and could never once have fired.
 *
 * That direction is football rather than a modelling gap: how compact a press is
 * depends on the pressing knob, and shape barely lowers it. It rises freely -
 * ten strikers read `1.910` - but that is the normalization talking, not a gain:
 * they press together because everything else about that eleven collapsed.
 * Reporting it as a concentration would be flattery, so the capacity stays
 * unread in both directions rather than half-read.
 *
 * **What a manager is told about pressing comes from `press_without_cover`
 * instead**, which reads the knob against the route it concedes rather than
 * this capacity. That is where the football actually is: the cost of pressing
 * is not a limp press, it is the ball going over the top.
 */
export const TACTICAL_CONSEQUENCE_UNREAD_CAPACITIES = [
  "pressing_cohesion",
] as const satisfies readonly TacticalShapeCapacity[];

/**
 * Deterministic key order used as the final tie-break.
 *
 * Iteration follows this array, never the object keys above, because key order
 * is not a contract.
 */
export const TACTICAL_CONSEQUENCE_KEYS = [
  "weak_build_up",
  "weak_central_connection",
  "no_attacking_width",
  "thin_box_presence",
  "press_without_cover",
  "open_centre",
  "open_left_flank",
  "open_right_flank",
  "unprotected_box",
  "blunt_counter",
  "exposed_transition",
  "left_overload",
  "right_overload",
  "heavy_box_presence",
  "sharp_counter",
  "packed_centre",
  "deep_rest_defence",
] as const satisfies readonly TacticalConsequenceKey[];

/**
 * Translation key for one observation sentence.
 *
 * Written as a template type rather than `string` so that a consequence added
 * without its five translations fails to compile instead of throwing at the
 * moment a manager happens to build the shape that triggers it.
 */
export type TacticalConsequenceLabelKey =
  `career.tacticalConsequence.observation.${TacticalConsequenceKey}`;

/** Translation key for the visible kind word. */
export type TacticalConsequenceKindLabelKey =
  `career.tacticalConsequence.kind.${TacticalConsequenceKind}`;

/** Translation key for the section summary line. */
export type TacticalConsequenceSummaryKey =
  `career.tacticalConsequence.summary.${"balanced" | "some"}`;

/**
 * Which of the manager's capacities one observation actually reads.
 *
 * Derived from the rule rather than listed beside it, so a reachability gate can
 * ask "can anything ever cross this threshold" without restating the football.
 * For a `knobExposes` rule that means walking out to the route the knob concedes
 * and back to what resists it - two mappings this package reads and never owns.
 *
 * @example
 * tacticalConsequenceCapacities("press_without_cover"); // box protection, central coverage
 */
export function tacticalConsequenceCapacities(
  key: TacticalConsequenceKey,
): readonly TacticalShapeCapacity[] {
  const rule = TACTICAL_CONSEQUENCE_RULES[key];

  switch (rule.rule) {
    case "below":
      return rule.capacities;
    case "above":
      return [rule.capacity];
    case "dominates":
      return [rule.capacity, rule.over];
    case "knobExposes":
      return exposedResistance(rule.knob);
  }
}

/** One observation, as label keys only. */
export interface TacticalConsequenceObservationView {
  /** Stable observation identifier. */
  readonly observationKey: TacticalConsequenceKey;
  /** Whether this is a cost, a loaded side, or a concentration. */
  readonly kind: TacticalConsequenceKind;
  /** Translation key for the visible observation sentence. */
  readonly labelKey: TacticalConsequenceLabelKey;
  /** Translation key for the visible kind word, so meaning never rests on colour. */
  readonly kindLabelKey: TacticalConsequenceKindLabelKey;
}

/** Structured qualitative consequences of the current shape. */
export interface TacticalConsequenceView {
  /** Ordered observations, never more than `MAX_TACTICAL_CONSEQUENCES`. */
  readonly observations: readonly TacticalConsequenceObservationView[];
  /** Translation key for the section summary line. */
  readonly summaryKey: TacticalConsequenceSummaryKey;
}

/** Translation key describing why one observable match chapter began. */
export type TacticalChapterTriggerLabelKey =
  `career.tacticalChapter.trigger.${"kickoff" | "manager" | "ai" | "combined"}`;

/** Translation key for one accepted change kind. */
export type TacticalChapterChangeLabelKey =
  `career.tacticalChapter.change.${"substitution" | "formation" | "role" | "tactic"}`;

const TACTICAL_CHAPTER_CHANGE_LABEL_KEY = {
  substitution: "career.tacticalChapter.change.substitution",
  formation: "career.tacticalChapter.change.formation",
  role: "career.tacticalChapter.change.role",
  tactic: "career.tacticalChapter.change.tactic",
} as const satisfies Readonly<Record<MatchTacticalChapterChangeKind, TacticalChapterChangeLabelKey>>;

/** Presentation-safe chapter with selected club and opponent already oriented. */
export interface TacticalChapterView {
  readonly startMinute: number;
  readonly endMinute: number;
  readonly triggerLabelKey: TacticalChapterTriggerLabelKey;
  readonly changeLabelKeys: readonly TacticalChapterChangeLabelKey[];
  readonly selected: MatchTacticalChapterSideFact;
  readonly opponent: MatchTacticalChapterSideFact;
}

/** Orients canonical chapter facts without adding a football formula. */
export function buildTacticalChapterViews(
  chapters: readonly MatchTacticalChapterFact[],
  selectedSide: "home" | "away",
): readonly TacticalChapterView[] {
  return chapters.map((chapter) => ({
    startMinute: chapter.startMinute,
    endMinute: chapter.endMinute,
    triggerLabelKey: tacticalChapterTriggerLabelKey(chapter),
    changeLabelKeys: chapter.trigger.type === "kickoff"
      ? []
      : chapter.trigger.changeKinds.map((kind) => TACTICAL_CHAPTER_CHANGE_LABEL_KEY[kind]),
    selected: chapter[selectedSide],
    opponent: chapter[selectedSide === "home" ? "away" : "home"],
  }));
}

function tacticalChapterTriggerLabelKey(
  chapter: MatchTacticalChapterFact,
): TacticalChapterTriggerLabelKey {
  if (chapter.trigger.type === "kickoff") return "career.tacticalChapter.trigger.kickoff";
  if (chapter.trigger.owners.length > 1) return "career.tacticalChapter.trigger.combined";
  return chapter.trigger.owners[0] === "ai"
    ? "career.tacticalChapter.trigger.ai"
    : "career.tacticalChapter.trigger.manager";
}

/**
 * Projects one shape reading into the few things worth telling a manager.
 *
 * It reports consequences and never a solution. There is no best formation
 * here, no score, no capacity number, and nothing that ranks one shape above
 * another: an eleven that concentrates everything in the box is reported as
 * concentrating everything in the box and as leaving its own box unprotected,
 * and whether that is a good idea on Saturday is the manager's call.
 *
 * Ordering is total and deterministic: costs before loaded sides before
 * concentrations, then the largest departure from ordinary, then the frozen key
 * order. Departures are compared rounded, so two capacities that are equal in
 * football cannot swap places on a floating-point tail.
 *
 * What survives the cap is not simply the top of that order - see
 * `selectShownObservations`, which holds a slot for what the shape bought.
 *
 * @example
 * const view = buildTacticalConsequenceView({ shape, tactic });
 * view.observations[0]?.labelKey; // the one thing to say first, or nothing
 */
export function buildTacticalConsequenceView(
  reading: TacticalConsequenceReading,
): TacticalConsequenceView {
  const fired = TACTICAL_CONSEQUENCE_KEYS.flatMap((observationKey, keyIndex) => {
    const departure = departureFromOrdinary(TACTICAL_CONSEQUENCE_RULES[observationKey], reading);

    return departure === undefined
      ? []
      : [{
          observationKey,
          kind: TACTICAL_CONSEQUENCE_RULES[observationKey].kind as TacticalConsequenceKind,
          departure,
          keyIndex,
        }];
  });
  const observations = selectShownObservations(fired.toSorted(compareObservations))
    .map((observation): TacticalConsequenceObservationView => ({
      observationKey: observation.observationKey,
      kind: observation.kind,
      labelKey: `career.tacticalConsequence.observation.${observation.observationKey}`,
      kindLabelKey: `career.tacticalConsequence.kind.${observation.kind}`,
    }));

  return {
    observations,
    summaryKey: observations.length === 0
      ? "career.tacticalConsequence.summary.balanced"
      : "career.tacticalConsequence.summary.some",
  };
}

/** One fired observation before it becomes label keys. */
interface FiredObservation {
  readonly observationKey: TacticalConsequenceKey;
  readonly kind: TacticalConsequenceKind;
  readonly departure: number;
  readonly keyIndex: number;
}

/** Rank order of the three kinds; the array index is the priority. */
const KIND_ORDER: readonly TacticalConsequenceKind[] = ["exposure", "overload", "emphasis"];

/**
 * Chooses which of the fired observations a screen actually shows.
 *
 * Costs come first, but **one slot is held back for what the shape bought**
 * whenever there is both something to pay and something gained. Filling all
 * three with costs is what a broken shape would otherwise always do, and a tool
 * that only ever scolds stops being read by the third match: the manager who
 * fields five forwards knows he is attacking, and what he needs is the trade,
 * not the telling-off. This is the difference between "here is why that may
 * fail" and "here is why it may work *or* fail", which is the question this
 * screen exists to answer.
 *
 * With costs only, or gains only, all three slots go to whatever there is.
 */
function selectShownObservations(ordered: readonly FiredObservation[]): readonly FiredObservation[] {
  const gained = ordered.filter((observation) => observation.kind === "emphasis");
  const paid = ordered.filter((observation) => observation.kind !== "emphasis");
  const paidSlots = Math.min(
    paid.length,
    gained.length > 0 ? MAX_TACTICAL_CONSEQUENCES - 1 : MAX_TACTICAL_CONSEQUENCES,
  );

  // Both halves are already in comparator order and every cost outranks every
  // gain, so concatenating preserves the total order rather than needing it
  // rebuilt.
  return [...paid.slice(0, paidSlots), ...gained.slice(0, MAX_TACTICAL_CONSEQUENCES - paidSlots)];
}

/**
 * Decides whether one observation fires, and by how far.
 *
 * Returns `undefined` when the shape is ordinary in that respect. The number it
 * returns is only ever compared with other departures of the same kind, so the
 * three rules do not need one shared unit.
 */
function departureFromOrdinary(
  rule: (typeof TACTICAL_CONSEQUENCE_RULES)[TacticalConsequenceKey],
  reading: TacticalConsequenceReading,
): number | undefined {
  switch (rule.rule) {
    case "below": {
      const value = meanReading(rule.capacities, reading.shape);
      return value < TACTICAL_CONSEQUENCE_EXPOSURE_BELOW ? round(1 - value) : undefined;
    }
    case "above": {
      const value = reading.shape[rule.capacity];
      return value >= TACTICAL_CONSEQUENCE_EMPHASIS_AT_LEAST ? round(value - 1) : undefined;
    }
    case "dominates": {
      const value = reading.shape[rule.capacity];
      const other = reading.shape[rule.over];

      // A flank with nothing on it is the most one-sided a shape can be, so it
      // reports as such. Guarding the division by returning nothing instead is
      // how the loudest case in the whole model came to say the least: eleven
      // right backs put `0` down the left and produced no observation at all.
      if (!(other > 0)) {
        return value > 0 ? round(1 / TACTICAL_CONSEQUENCE_MINIMUM_FLANK) : undefined;
      }

      const ratio = value / Math.max(other, TACTICAL_CONSEQUENCE_MINIMUM_FLANK);
      return ratio >= TACTICAL_CONSEQUENCE_OVERLOAD_RATIO ? round(ratio - 1) : undefined;
    }
    case "knobExposes": {
      const setting = reading.tactic?.[rule.knob];

      if (setting === undefined || setting <= TACTICAL_CONSEQUENCE_KNOB_ABOVE) {
        return undefined;
      }

      const value = meanReading(exposedResistance(rule.knob), reading.shape);
      return value < TACTICAL_CONSEQUENCE_EXPOSURE_BELOW ? round(1 - value) : undefined;
    }
  }
}

/**
 * The manager's own capacities that have to hold up the route a knob concedes.
 *
 * Read straight out of Step 06's `TACTIC_KNOB_EXPOSED_ROUTE` and Step 04's
 * `TACTICAL_ROUTE_DEFINITION`, so this package never says which route a tactic
 * hands over or what resists it. Pressing today resolves to the `direct` route
 * and therefore to box protection and central coverage - push the line up and
 * the way to beat you is over the top.
 */
function exposedResistance(knob: TacticKnob): readonly TacticalShapeCapacity[] {
  return TACTICAL_ROUTE_DEFINITION[TACTIC_KNOB_EXPOSED_ROUTE[knob]].opponentResistance;
}

/** Mean reading across one rule's capacities, in the frozen capacity order. */
function meanReading(
  capacities: readonly TacticalShapeCapacity[],
  shape: TacticalConsequenceShapeReading,
): number {
  const ordered = TACTICAL_SHAPE_CAPACITIES.filter((capacity) => capacities.includes(capacity));

  return ordered.reduce((total, capacity) => total + shape[capacity], 0) / ordered.length;
}

/** Costs first, then the largest departure, then the frozen key order. */
function compareObservations(first: FiredObservation, second: FiredObservation): number {
  return KIND_ORDER.indexOf(first.kind) - KIND_ORDER.indexOf(second.kind)
    || second.departure - first.departure
    || first.keyIndex - second.keyIndex;
}

/** Rounds a departure so equal football cannot reorder on a floating-point tail. */
function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
