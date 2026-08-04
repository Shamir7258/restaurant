import { motion } from 'framer-motion'
import { popIn } from '../../../animations'
import { useTheme } from '../../../theme/ThemeProvider'
import styles from './Badge.module.css'

/** tone: 'gold' | 'red' | 'neutral' | 'success' */
export function Badge({ tone = 'gold', icon: Icon, children, className = '' }) {
  const { prefersReducedMotion } = useTheme()

  return (
    <motion.span
      className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')}
      variants={prefersReducedMotion ? undefined : popIn}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'show'}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
    >
      {Icon && <Icon aria-hidden="true" size={11} />}
      {children}
    </motion.span>
  )
}
