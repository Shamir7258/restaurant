import styles from './VegIndicator.module.css'

/** The classic Indian veg/non-veg square-in-square mark, used across grid, list, and details. */
export function VegIndicator({ veg = true, size = 16, className = '' }) {
  return (
    <span
      className={[styles.indicator, veg ? styles.veg : styles.nonveg, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      role="img"
      aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}
      title={veg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className={styles.dot} />
    </span>
  )
}
