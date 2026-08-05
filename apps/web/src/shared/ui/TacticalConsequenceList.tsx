import type { Translator } from "@game/i18n";
import type { TacticalConsequenceView } from "@game/ui";

/** Props for the shared qualitative shape-consequence list. */
export interface TacticalConsequenceListProps {
  /**
   * Consequences of the eleven currently in force, or nothing to read.
   *
   * Absent is a real state: the board is incomplete before kick-off, or there
   * is no accepted engine team yet. It is deliberately not the same as an
   * eleven whose shape has no consequences worth naming.
   */
  readonly consequences?: TacticalConsequenceView;
  /** Stable id the owning workspace uses to label this region. */
  readonly headingId: string;
  readonly text: Translator;
}

/**
 * Renders the manager-facing consequences of the shape he has chosen.
 *
 * It renders label keys and nothing else. Every threshold, every priority and
 * the cap on how many observations exist at all live in the `@game/ui` read
 * model, so the preparation workspace and the live workspace - which mount this
 * same component from the same view - cannot describe one eleven two ways.
 *
 * Motion is classified `none`. These sit beside a board the manager is dragging
 * players around; anything that moved here would compete with the drag he is
 * actually looking at, and the facts are legible without it.
 *
 * Accessibility: the kind of each observation is written as a word, not only as
 * a colour, and the list is a real list inside a labelled region.
 */
export function TacticalConsequenceList({
  consequences,
  headingId,
  text,
}: TacticalConsequenceListProps): React.JSX.Element {
  return (
    <section className="tls-tactical-consequences" aria-labelledby={headingId}>
      <div className="tls-tactical-consequences-heading">
        <h3 id={headingId}>{text("career.tacticalConsequence.title")}</h3>
        <p>{text("career.tacticalConsequence.hint")}</p>
      </div>
      {consequences === undefined ? (
        <p className="tls-tactical-consequences-empty">{text("career.tacticalConsequence.incomplete")}</p>
      ) : consequences.observations.length === 0 ? (
        <p className="tls-tactical-consequences-empty">{text(consequences.summaryKey)}</p>
      ) : (
        <ul className="tls-tactical-consequences-list">
          {consequences.observations.map((observation) => (
            <li data-kind={observation.kind} key={observation.observationKey}>
              <span className="tls-tactical-consequence-kind">{text(observation.kindLabelKey)}</span>
              <span className="tls-tactical-consequence-label">{text(observation.labelKey)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
