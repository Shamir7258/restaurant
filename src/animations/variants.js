/**
 * Shared Framer Motion variants and transitions. Import these instead of
 * redefining ad hoc animation objects so motion feels consistent across
 * the app. All durations/eases trace back to src/styles/tokens.css.
 */

export const easeLuxury = [0.22, 1, 0.36, 1]
export const easeOut = [0.16, 1, 0.3, 1]

export const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeLuxury } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: easeOut } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeLuxury } },
}

/** Apply to a parent; children with a `show`/`hidden` variant will cascade. */
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
})

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -8, scale: 1.01, transition: { duration: 0.32, ease: easeLuxury } },
}

export const imageZoom = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.6, ease: easeOut } },
}

export const buttonTap = { scale: 0.96 }

/** Viewport options for scroll-reveal `whileInView` usage. */
export const revealOnce = { once: true, amount: 0.25 }

/** Standard page transition, consumed by src/layout/Layout.jsx. */
export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.42, ease: easeLuxury },
}

/** Returns motion-safe props: pass `disabled` (prefersReducedMotion) to strip animation. */
export function motionSafe(variants, disabled) {
  return disabled ? {} : { variants, initial: 'hidden', whileInView: 'show', viewport: revealOnce }
}
