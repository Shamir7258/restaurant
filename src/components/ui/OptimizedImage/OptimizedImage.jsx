import { useState } from 'react'
import { FaUtensils } from 'react-icons/fa'
import styles from './OptimizedImage.module.css'

/**
 * Lazy-loaded image with a shimmering placeholder and a graceful gradient
 * fallback if the source 404s or is slow/unavailable — used everywhere a
 * dish photo is rendered so a broken URL never shows a broken-image icon.
 * `alt` is required; pass alt="" only for purely decorative images.
 */
export function OptimizedImage({ src, alt, aspectRatio = '4 / 3', className = '', imgClassName = '', priority = false, sizes }) {
  const [status, setStatus] = useState('loading')

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')} style={{ aspectRatio }}>
      {status !== 'loaded' && (
        <div className={styles.placeholder} aria-hidden="true">
          {status === 'error' && <FaUtensils size={28} />}
        </div>
      )}
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={[styles.img, status === 'loaded' ? styles.loaded : '', imgClassName].filter(Boolean).join(' ')}
        />
      )}
    </div>
  )
}
