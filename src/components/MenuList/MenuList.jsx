import { AnimatePresence, motion } from 'framer-motion'
import { FaUtensils } from 'react-icons/fa'
import { staggerContainer } from '../../animations'
import { useTheme } from '../../theme/ThemeProvider'
import { MenuListItem } from './MenuListItem'
import styles from './MenuList.module.css'

/**
 * Vertical list of dish rows — the "list view" counterpart to MenuGrid.
 * Purely presentational: `items` is assumed to already be filtered/sorted
 * by the caller (Filters module). Rows animate in/out via AnimatePresence
 * so switching filters or toggling grid/list feels alive.
 */
export function MenuList({ items, isFavorite, onToggleFavorite }) {
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
    <motion.ul
      className={styles.list}
      variants={prefersReducedMotion ? undefined : staggerContainer(0.06)}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'show'}
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <MenuListItem key={item.id} item={item} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
