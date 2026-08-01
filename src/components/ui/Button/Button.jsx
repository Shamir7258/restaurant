import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import styles from './Button.module.css'

/**
 * Shared button used across the app.
 * variant: 'primary' | 'secondary' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
export const Button = forwardRef(function Button(
  { as = 'button', variant = 'primary', size = 'md', iconOnly = false, className = '', children, ...props },
  ref,
) {
  const Component = typeof as === 'string' ? motion[as] : motion(as)
  const classes = [styles.btn, styles[variant], size !== 'md' ? styles[size] : '', iconOnly ? styles.iconOnly : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Component ref={ref} className={classes} whileTap={{ scale: 0.96 }} {...props}>
      {children}
    </Component>
  )
})
