import { useRef } from 'react'
import { useInView } from 'framer-motion'

/** Convenience wrapper around useInView for scroll-reveal sections. */
export function useScrollReveal(options = { once: true, amount: 0.25 }) {
  const ref = useRef(null)
  const inView = useInView(ref, options)
  return { ref, inView }
}
