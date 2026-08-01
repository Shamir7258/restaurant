import { motion } from 'framer-motion'
import styles from './Card.module.css'

/**
 * Shared surface for grid/list cards, panels, and modals.
 * glass: use the frosted-glass treatment instead of the solid surface color.
 * hoverable: lift + glow on hover (disabled automatically for reduced-motion via CSS).
 */
export function Card({ glass = false, hoverable = true, className = '', children, ...props }) {
  const classes = [styles.card, glass ? styles.glass : '', hoverable ? styles.hoverable : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.div className={classes} {...props}>
      {children}
    </motion.div>
  )
}
