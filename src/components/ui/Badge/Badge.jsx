import styles from './Badge.module.css'

/** tone: 'gold' | 'red' | 'neutral' | 'success' */
export function Badge({ tone = 'gold', icon: Icon, children, className = '' }) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')}>
      {Icon && <Icon aria-hidden="true" size={11} />}
      {children}
    </span>
  )
}
