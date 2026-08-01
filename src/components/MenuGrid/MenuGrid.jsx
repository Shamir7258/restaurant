import { motion } from 'framer-motion'
import { FaUtensils } from 'react-icons/fa'
import { staggerContainer, fadeInUp } from '../../animations'
import { useTheme } from '../../theme/ThemeProvider'
import { MenuCard } from './MenuCard'
import styles from './MenuGrid.module.css'

/**
 * Responsive grid of dish cards. Purely presentational — `items` is assumed
 * to already be filtered/sorted by the caller (Filters module).
 */
export function MenuGrid({ items, isFavorite, onToggleFavorite }) {
  const { prefersReducedMotion } = useTheme()

  if (!items || items.length === 0) {
    return (
      <div className={styles.empty}>
        <FaUtensils size={28} className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyTitle}>No dishes match your filters</p>
        <p className={styles.emptyHint}>Try adjusting your filters or search to see more of the menu.</p>
      </div>
    )
  }

  return (
    <motion.div
      className={styles.grid}
      variants={prefersReducedMotion ? undefined : staggerContainer(0.06)}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'show'}
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={prefersReducedMotion ? undefined : fadeInUp} className={styles.cell}>
          <MenuCard item={item} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
        </motion.div>
      ))}
    </motion.div>
  )
}
