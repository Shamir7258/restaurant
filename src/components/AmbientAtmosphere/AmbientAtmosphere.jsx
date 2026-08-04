import styles from './AmbientAtmosphere.module.css'

// Deterministic scatter (no Math.random) so re-renders don't reshuffle the field.
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${(i * 29 + 8) % 100}%`,
  top: `${(i * 47 + 15) % 100}%`,
  duration: 9 + (i % 4) * 2.4,
  delay: i * 0.6,
}))

/**
 * Fixed, decorative warmth behind every page — drifting gradient blobs and a
 * sprinkle of floating motes, all CSS keyframes (no JS render loop) so it's
 * cheap enough to stay mounted site-wide. Freezes under the global
 * prefers-reduced-motion override in src/styles/global.css.
 */
export function AmbientAtmosphere() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={[styles.blob, styles.blobGold].join(' ')} />
      <div className={[styles.blob, styles.blobOrange].join(' ')} />
      <div className={[styles.blob, styles.blobRed].join(' ')} />
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{ left: p.left, top: p.top, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  )
}

export default AmbientAtmosphere
