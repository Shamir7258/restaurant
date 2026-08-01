import { motion } from 'framer-motion'
import { HiOutlineSquares2X2, HiOutlineListBullet } from 'react-icons/hi2'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './ViewToggle.module.css'

const OPTIONS = [
  { value: 'grid', label: 'Grid view', Icon: HiOutlineSquares2X2 },
  { value: 'list', label: 'List view', Icon: HiOutlineListBullet },
]

/**
 * Pill-shaped segmented control for switching between grid and list menu
 * layouts. The active option is highlighted by a single indicator that
 * morphs between positions via a shared framer-motion layoutId.
 */
export function ViewToggle({ view, onChange }) {
  const { prefersReducedMotion } = useTheme()

  function selectOption(value) {
    if (value !== view) onChange(value)
  }

  function handleKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const currentIndex = OPTIONS.findIndex((option) => option.value === view)
    const delta = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (currentIndex + delta + OPTIONS.length) % OPTIONS.length
    selectOption(OPTIONS[nextIndex].value)
  }

  return (
    <div className={styles.toggle} role="radiogroup" aria-label="Menu view" onKeyDown={handleKeyDown}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = view === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            tabIndex={active ? 0 : -1}
            className={styles.option}
            onClick={() => selectOption(value)}
          >
            {active && (
              <motion.span
                layoutId="view-toggle-indicator"
                className={styles.indicator}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 420, damping: 38 }
                }
              />
            )}
            <Icon className={styles.icon} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
