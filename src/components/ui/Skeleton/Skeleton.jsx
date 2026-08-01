import styles from './Skeleton.module.css'

/** Loading placeholder. variant: 'text' | 'card' | 'circle' | 'image'. */
export function Skeleton({ variant = 'text', width, height, className = '' }) {
  return (
    <span
      className={[styles.skeleton, styles[variant], className].filter(Boolean).join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
