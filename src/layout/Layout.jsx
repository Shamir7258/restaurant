import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'
import { AmbientAtmosphere } from '../components/AmbientAtmosphere/AmbientAtmosphere'
import { pageTransition } from '../animations'
import { useTheme } from '../theme/ThemeProvider'

export function Layout() {
  const location = useLocation()
  const { prefersReducedMotion } = useTheme()

  // React Router doesn't reset scroll on navigation the way a full page
  // load would — without this, e.g. clicking "Menu" from partway down the
  // Home page lands you mid-scroll on the new page instead of at its top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AmbientAtmosphere />
      <Header />
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.main
            key={location.pathname}
            id="main-content"
            tabIndex={-1}
            initial={prefersReducedMotion ? false : pageTransition.initial}
            animate={prefersReducedMotion ? {} : pageTransition.animate}
            exit={prefersReducedMotion ? {} : pageTransition.exit}
            transition={pageTransition.transition}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </LayoutGroup>
      <Footer />
    </>
  )
}
