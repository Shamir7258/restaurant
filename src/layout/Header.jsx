import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import { FaUtensils } from 'react-icons/fa'
import { fadeInUp } from '../animations'
import { useTheme } from '../theme/ThemeProvider'
import styles from './Header.module.css'

const mobileNavVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.08 },
  },
}

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
]

export function Header() {
  const { prefersReducedMotion } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
      <div className={[styles.bar, 'container'].join(' ')}>
        <NavLink to="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
          <motion.span
            className={styles.brandIcon}
            whileHover={prefersReducedMotion ? undefined : { rotate: -14, scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <FaUtensils aria-hidden="true" />
          </motion.span>
          <span>Aurum</span>
        </NavLink>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive &&
                    (prefersReducedMotion ? (
                      <span className={styles.underline} />
                    ) : (
                      <motion.span
                        layoutId="nav-underline"
                        className={styles.underline}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    ))}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            className={styles.mobileNav}
            variants={prefersReducedMotion ? undefined : mobileNavVariants}
            initial={prefersReducedMotion ? { opacity: 0, height: 0 } : 'hidden'}
            animate={prefersReducedMotion ? { opacity: 1, height: 'auto' } : 'show'}
            exit={prefersReducedMotion ? { opacity: 0, height: 0 } : 'hidden'}
          >
            {NAV_LINKS.map((link) => (
              <motion.div key={link.to} variants={prefersReducedMotion ? undefined : fadeInUp}>
                <NavLink to={link.to} end={link.end} onClick={() => setMenuOpen(false)} className={styles.mobileLink}>
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
