import { motion } from 'framer-motion'
import { GiChiliPepper } from 'react-icons/gi'
import { popIn, staggerContainer } from '../../../animations'
import { useTheme } from '../../../theme/ThemeProvider'
import styles from './SpiceMeter.module.css'

/** Spice level indicator. level: 0-3 (0 = not spicy, 3 = very spicy). */
export function SpiceMeter({ level = 0, max = 3, size = 14, className = '' }) {
  const { prefersReducedMotion } = useTheme()
  if (level <= 0) return null
  const labels = ['Mild', 'Medium', 'Hot', 'Extra Hot']

  return (
    <motion.span
      className={[styles.meter, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`Spice level: ${labels[Math.min(level, labels.length - 1)]}`}
      title={labels[Math.min(level, labels.length - 1)]}
      variants={prefersReducedMotion ? undefined : staggerContainer(0.09)}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'show'}
    >
      {Array.from({ length: max }).map((_, i) => (
        <motion.span key={i} variants={prefersReducedMotion ? undefined : popIn} style={{ display: 'inline-flex' }}>
          <GiChiliPepper size={size} className={i < level ? styles.active : styles.inactive} aria-hidden="true" />
        </motion.span>
      ))}
    </motion.span>
  )
}
