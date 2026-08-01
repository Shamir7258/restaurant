import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import styles from './Rating.module.css'

/** Read-only star rating. value: 0-5 (decimals render half stars). count: optional review count. */
export function Rating({ value = 0, count, size = 14, showValue = true, className = '' }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div
      className={[styles.rating, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5${count != null ? ` from ${count} reviews` : ''}`}
    >
      <span className={styles.stars} aria-hidden="true" style={{ fontSize: size }}>
        {Array.from({ length: full }).map((_, i) => (
          <FaStar key={`f${i}`} />
        ))}
        {half && <FaStarHalfAlt />}
        {Array.from({ length: empty }).map((_, i) => (
          <FaRegStar key={`e${i}`} />
        ))}
      </span>
      {showValue && <span className={styles.value}>{value.toFixed(1)}</span>}
      {count != null && <span className={styles.count}>({count})</span>}
    </div>
  )
}
