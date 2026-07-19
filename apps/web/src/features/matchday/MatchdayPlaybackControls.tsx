import type { Translator } from "@game/i18n";
import * as m from "motion/react-m";

import { webMotion, webMotionTargets } from "../../shared/motion/web-motion";
import {
  MATCHDAY_PLAYBACK_SPEEDS,
  type MatchdayPlaybackSpeed,
} from "./matchday-playback";

/** Props for the presentation-only Matchday playback controls. */
export type MatchdayPlaybackControlsProps = Readonly<{
  paused: boolean;
  speed: MatchdayPlaybackSpeed;
  text: Translator;
  onPausedChange: (paused: boolean) => void;
  onSpeedChange: (speed: MatchdayPlaybackSpeed) => void;
}>;

/**
 * Lets the manager pause or accelerate an already-computed visual reveal.
 * The component owns no simulation, checkpoint, or persistence behavior.
 */
export function MatchdayPlaybackControls({
  paused,
  speed,
  text,
  onPausedChange,
  onSpeedChange,
}: MatchdayPlaybackControlsProps): React.JSX.Element {
  return (
    <section
      className="tls-matchday-playback-controls"
      aria-label={text("career.matchday.playback.controls")}
      data-paused={paused ? "true" : "false"}
      data-speed={`${speed}x`}
    >
      <m.button
        className="tls-matchday-playback-toggle"
        data-motion-control="playback-toggle"
        type="button"
        aria-pressed={paused}
        onClick={() => onPausedChange(!paused)}
        transition={webMotion.micro}
        whileTap={webMotionTargets.controlPress}
      >
        <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
        <span>{text(paused
          ? "career.matchday.playback.resume"
          : "career.matchday.playback.pause")}</span>
      </m.button>

      <fieldset className="tls-matchday-playback-speed">
        <legend className="tls-visually-hidden">
          {text("career.matchday.playback.speed")}
        </legend>
        {MATCHDAY_PLAYBACK_SPEEDS.map((option) => (
          <m.button
            aria-label={text("career.matchday.playback.speedOption", { speed: option })}
            aria-pressed={speed === option}
            className="tls-matchday-playback-speed-option"
            data-motion-control="playback-speed"
            key={option}
            type="button"
            onClick={() => onSpeedChange(option)}
            transition={webMotion.micro}
            whileTap={webMotionTargets.controlPress}
          >
            {option}x
          </m.button>
        ))}
      </fieldset>
    </section>
  );
}
