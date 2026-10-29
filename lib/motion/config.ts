import { Variants, Transition } from "framer-motion";

/**
 * Standard spring and ease transition curves respecting transform and opacity only.
 */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
};

export const gentleTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export const instantTransition: Transition = {
  duration: 0.001,
};

/**
 * Standard staggered entrance variants for lists and grids.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const itemFadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

export const itemScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: gentleTransition,
  },
};

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

/**
 * Checkmark SVG draw animation variant.
 */
export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: "easeInOut",
    },
  },
};

