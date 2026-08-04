import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaChevronDown } from 'react-icons/fa'
import { Button } from '../../components/ui'
import { useTheme } from '../../theme/ThemeProvider'
import { easeLuxury } from '../../animations'
import styles from './Hero.module.css'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1600&q=75&auto=format&fit=crop'

export function Hero() {
  const { prefersReducedMotion } = useTheme()

  const rise = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, ease: easeLuxury, delay },
        }

  return (
    <section className={styles.hero}>
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        role="img"
        aria-label="Elegant fine-dining restaurant interior"
      />
      <div className={styles.scrim} />

      <div className={[styles.content, 'container'].join(' ')}>
        <motion.p className={[styles.eyebrow, 'eyebrow'].join(' ')} {...rise(0.05)}>
          Fine Dining &amp; Wine
        </motion.p>
        <motion.h1 className={styles.title} {...rise(0.15)}>
          Aurum
        </motion.h1>
        <motion.p className={styles.tagline} {...rise(0.3)}>
          Where seasonal ingredients, quiet craftsmanship, and candlelight meet — an intimate table for those who savor slowly.
        </motion.p>
        <motion.div className={styles.actions} {...rise(0.45)}>
          <Button as={Link} to="/menu" size="lg">
            View Menu
          </Button>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollCue}
        aria-hidden="true"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: [0, 10, 0] }}
        transition={prefersReducedMotion ? {} : { opacity: { delay: 1, duration: 0.6 }, y: { delay: 1.2, duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <FaChevronDown />
      </motion.div>
    </section>
  )
}
