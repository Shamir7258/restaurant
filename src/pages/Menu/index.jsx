import { AnimatePresence, motion } from 'framer-motion'
import menuData from '../../data/menu.json'
import { useMenuFilters, FilterBar } from '../../components/Filters'
import { MenuGrid } from '../../components/MenuGrid/MenuGrid'
import { MenuList } from '../../components/MenuList/MenuList'
import { ViewToggle } from '../../components/ViewToggle/ViewToggle'
import { useFavorites } from '../../hooks/useFavorites'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useTheme } from '../../theme/ThemeProvider'
import { fadeInUp } from '../../animations'
import styles from './Menu.module.css'

export function Menu() {
  const { prefersReducedMotion } = useTheme()
  const [view, setView] = useLocalStorage('aurum:menu-view', 'grid')
  const { isFavorite, toggleFavorite } = useFavorites()
  const filters = useMenuFilters(menuData)
  const { filteredItems } = filters

  const ListComponent = view === 'grid' ? MenuGrid : MenuList

  return (
    <div className={styles.page}>
      <header className={[styles.header, 'container'].join(' ')}>
        <p className="eyebrow">The Full Menu</p>
        <h1 className={styles.title}>Our Menu</h1>
        <p className={styles.subtitle}>
          Thirty seasonal dishes, crafted with precision. Search, filter, and explore every plate in detail.
        </p>
      </header>

      <div className={['container', styles.controls].join(' ')}>
        <FilterBar {...filters} />

        <div className={styles.resultBar}>
          <p className={styles.resultCount}>
            {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
          </p>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      <div className={['container', styles.results].join(' ')}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            variants={prefersReducedMotion ? undefined : fadeInUp}
            initial={prefersReducedMotion ? undefined : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'show'}
            exit={prefersReducedMotion ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
          >
            <ListComponent items={filteredItems} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
