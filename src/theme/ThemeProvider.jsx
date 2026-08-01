import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

/**
 * Dark Luxury is the only theme this app ships, but the provider still
 * exposes `prefersReducedMotion` so animation-heavy components (Framer
 * Motion, R3F) can degrade gracefully without each one re-implementing
 * the media query.
 */
export function ThemeProvider({ children }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const value = useMemo(
    () => ({
      theme: 'dark-luxury',
      prefersReducedMotion,
    }),
    [prefersReducedMotion],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
