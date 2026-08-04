import { motion } from 'framer-motion'
import { popIn } from '../../../animations'
import { useTheme } from '../../../theme/ThemeProvider'
import styles from './VegIndicator.module.css'

/** The classic Indian veg/non-veg square-in-square mark, used across grid, list, and details. */
export function VegIndicator({ veg = true, size = 16, className = '' }) {
  const { prefersReducedMotion } = useTheme()

  return (
    <motion.span
      className={[styles.indicator, veg ? styles.veg : styles.nonveg, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      role="img"
      aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}
      title={veg ? 'Vegetarian' : 'Non-vegetarian'}
      variants={prefersReducedMotion ? undefined : popIn}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'show'}
    >
      <span className={styles.dot} />
    </motion.span>
  )
}
