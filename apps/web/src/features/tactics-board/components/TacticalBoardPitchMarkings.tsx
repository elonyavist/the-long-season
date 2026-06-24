import type React from "react";

import { TACTICAL_BOARD_PITCH } from "../tactical-board-geometry";

const STRIPE_COUNT = 9;

/** Draws the shared vertical tactical-board pitch inside the fixed SVG viewBox. */
export function TacticalBoardPitchMarkings(): React.JSX.Element {
  const { viewBoxW: width, viewBoxH: height } = TACTICAL_BOARD_PITCH;
  const stripeWidth = width / STRIPE_COUNT;

  return (
    <>
      <defs>
        <filter id="tls-tactical-board-grass-texture" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves={2} seed={7} result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"
          />
        </filter>
        <radialGradient id="tls-tactical-board-vignette" cx="50%" cy="50%" r="62%">
          <stop offset="55%" stopColor="var(--tls-color-ink)" stopOpacity={0} />
          <stop offset="100%" stopColor="var(--tls-color-ink)" stopOpacity={0.26} />
        </radialGradient>
      </defs>

      {Array.from({ length: STRIPE_COUNT }, (_, index) => (
        <rect
          fill={index % 2 === 0 ? "var(--tls-color-pitch)" : "var(--tls-color-pitch-dark)"}
          height={height}
          key={index}
          width={stripeWidth}
          x={index * stripeWidth}
          y={0}
        />
      ))}
      <rect x={0} y={0} width={width} height={height} fill="none" filter="url(#tls-tactical-board-grass-texture)" />
      <rect x={0} y={0} width={width} height={height} fill="url(#tls-tactical-board-vignette)" />

      <g
        fill="none"
        stroke="var(--tls-color-paper-muted)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.46}
        strokeWidth={2.25}
      >
        <rect x={60} y={60} width={680} height={1050} />
        <line x1={60} y1={585} x2={740} y2={585} />
        <circle cx={400} cy={585} r={91.5} />
        <rect x={198.4} y={60} width={403.2} height={165} />
        <rect x={198.4} y={945} width={403.2} height={165} />
        <rect x={308.4} y={60} width={183.2} height={55} />
        <rect x={308.4} y={1055} width={183.2} height={55} />
        <path d="M 326.88 225 A 91.5 91.5 0 0 0 473.12 225" />
        <path d="M 326.88 945 A 91.5 91.5 0 0 1 473.12 945" />
        <circle cx={400} cy={585} r={3} fill="var(--tls-color-paper-muted)" fillOpacity={0.6} stroke="none" />
        <circle cx={400} cy={170} r={3} fill="var(--tls-color-paper-muted)" fillOpacity={0.6} stroke="none" />
        <circle cx={400} cy={1000} r={3} fill="var(--tls-color-paper-muted)" fillOpacity={0.6} stroke="none" />
      </g>
    </>
  );
}
