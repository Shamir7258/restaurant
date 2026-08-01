import { GiChiliPepper } from 'react-icons/gi'
import styles from './SpiceMeter.module.css'

/** Spice level indicator. level: 0-3 (0 = not spicy, 3 = very spicy). */
export function SpiceMeter({ level = 0, max = 3, size = 14, className = '' }) {
  if (level <= 0) return null
  const labels = ['Mild', 'Medium', 'Hot', 'Extra Hot']

  return (
    <span
      className={[styles.meter, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`Spice level: ${labels[Math.min(level, labels.length - 1)]}`}
      title={labels[Math.min(level, labels.length - 1)]}
    >
      {Array.from({ length: max }).map((_, i) => (
        <GiChiliPepper key={i} size={size} className={i < level ? styles.active : styles.inactive} aria-hidden="true" />
      ))}
    </span>
  )
}
