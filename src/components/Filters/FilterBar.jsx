import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaSearch, FaTimes, FaFilter, FaFire, FaCrown, FaStar } from 'react-icons/fa'
import { GiChiliPepper } from 'react-icons/gi'
import { Button, Badge } from '../ui'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './FilterBar.module.css'

const CALORIE_OPTIONS = [
  { label: 'Any calories', value: null },
  { label: '≤ 300 cal', value: 300 },
  { label: '≤ 500 cal', value: 500 },
  { label: '≤ 800 cal', value: 800 },
]

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Lowest Calorie', value: 'calories-asc' },
]

const SPICE_LEVELS = [1, 2, 3]

/**
 * Controlled filter/search/sort UI for the menu. Props are exactly the
 * object returned by useMenuFilters — spread it in: <FilterBar {...filtersState} />
 */
export function FilterBar(props) {
  const {
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    categories,
    dietFilter,
    setDietFilter,
    onlyPopular,
    setOnlyPopular,
    onlyChefSpecial,
    setOnlyChefSpecial,
    onlyNew,
    setOnlyNew,
    maxSpiceLevel,
    setMaxSpiceLevel,
    maxCalories,
    setMaxCalories,
    sortBy,
    setSortBy,
    activeFilterCount,
    resetFilters,
  } = props

  const { prefersReducedMotion } = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const uid = useId()

  const searchInputId = `${uid}-search`

  const renderSearch = (idSuffix) => (
    <div className={styles.searchField}>
      <FaSearch className={styles.searchIcon} aria-hidden="true" />
      <label htmlFor={`${searchInputId}-${idSuffix}`} className={styles.visuallyHidden}>
        Search menu by name, description or ingredient
      </label>
      <input
        id={`${searchInputId}-${idSuffix}`}
        type="text"
        className={styles.searchInput}
        placeholder="Search dishes, ingredients..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
        >
          <FaTimes aria-hidden="true" />
        </button>
      )}
    </div>
  )

  const renderControls = (idPrefix) => (
    <>
      <div className={styles.group} role="group" aria-label="Filter by category">
        <span className={styles.groupLabel}>Category</span>
        <div className={styles.pillRow}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={[styles.pill, category === cat ? styles.pillActive : ''].filter(Boolean).join(' ')}
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group} role="group" aria-label="Filter by diet">
        <span className={styles.groupLabel}>Diet</span>
        <div className={styles.segmented}>
          {[
            { value: 'all', label: 'All' },
            { value: 'veg', label: 'Veg' },
            { value: 'nonveg', label: 'Non-Veg' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={[styles.segment, dietFilter === opt.value ? styles.segmentActive : ''].filter(Boolean).join(' ')}
              aria-pressed={dietFilter === opt.value}
              onClick={() => setDietFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group} role="group" aria-label="Highlight filters">
        <span className={styles.groupLabel}>Highlights</span>
        <div className={styles.chipRow}>
          <button
            type="button"
            className={[styles.chip, onlyPopular ? styles.chipActive : ''].filter(Boolean).join(' ')}
            aria-pressed={onlyPopular}
            onClick={() => setOnlyPopular(!onlyPopular)}
          >
            <FaFire aria-hidden="true" />
            Popular
          </button>
          <button
            type="button"
            className={[styles.chip, onlyChefSpecial ? styles.chipActive : ''].filter(Boolean).join(' ')}
            aria-pressed={onlyChefSpecial}
            onClick={() => setOnlyChefSpecial(!onlyChefSpecial)}
          >
            <FaCrown aria-hidden="true" />
            Chef&apos;s Special
          </button>
          <button
            type="button"
            className={[styles.chip, onlyNew ? styles.chipActive : ''].filter(Boolean).join(' ')}
            aria-pressed={onlyNew}
            onClick={() => setOnlyNew(!onlyNew)}
          >
            <FaStar aria-hidden="true" />
            New
          </button>
        </div>
      </div>

      <div className={styles.group} role="group" aria-label="Maximum spice level">
        <span className={styles.groupLabel}>Spice</span>
        <div className={styles.segmented}>
          <button
            type="button"
            className={[styles.segment, maxSpiceLevel === null ? styles.segmentActive : ''].filter(Boolean).join(' ')}
            aria-pressed={maxSpiceLevel === null}
            onClick={() => setMaxSpiceLevel(null)}
          >
            Any
          </button>
          {SPICE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={[styles.segment, styles.spiceSegment, maxSpiceLevel === level ? styles.segmentActive : ''].filter(Boolean).join(' ')}
              aria-pressed={maxSpiceLevel === level}
              aria-label={`Up to spice level ${level}`}
              onClick={() => setMaxSpiceLevel(level)}
            >
              {Array.from({ length: level }).map((_, i) => (
                <GiChiliPepper key={i} aria-hidden="true" />
              ))}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <label htmlFor={`${idPrefix}-calories`} className={styles.groupLabel}>
          Calories
        </label>
        <select
          id={`${idPrefix}-calories`}
          className={styles.select}
          value={maxCalories === null ? 'any' : String(maxCalories)}
          onChange={(e) => setMaxCalories(e.target.value === 'any' ? null : Number(e.target.value))}
        >
          {CALORIE_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value === null ? 'any' : opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor={`${idPrefix}-sort`} className={styles.groupLabel}>
          Sort by
        </label>
        <select
          id={`${idPrefix}-sort`}
          className={styles.select}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {activeFilterCount > 0 && (
        <Button type="button" variant="ghost" size="sm" className={styles.resetBtn} onClick={resetFilters}>
          Reset filters
        </Button>
      )}
    </>
  )

  return (
    <div className={styles.bar}>
      <div className={styles.topRow}>
        {renderSearch('top')}
        <button
          type="button"
          className={styles.filterToggle}
          aria-expanded={drawerOpen}
          aria-controls={`${uid}-drawer`}
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <FaFilter aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <Badge tone="gold" className={styles.filterBadge}>
              {activeFilterCount}
            </Badge>
          )}
        </button>
      </div>

      <div className={styles.desktopControls}>{renderControls('d')}</div>

      <AnimatePresence initial={false}>
        {drawerOpen && (
          <motion.div
            id={`${uid}-drawer`}
            className={styles.drawer}
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.001 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.drawerInner}>{renderControls('m')}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
