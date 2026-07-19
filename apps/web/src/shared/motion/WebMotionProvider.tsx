import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadDomAnimation = () => import("./dom-animation").then((module) => module.default);

/** Props for the single browser-level Motion configuration boundary. */
export type WebMotionProviderProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Loads the smallest current DOM feature bundle and follows the user's
 * operating-system reduced-motion preference for every web motion consumer.
 */
export function WebMotionProvider({ children }: WebMotionProviderProps): React.JSX.Element {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadDomAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
