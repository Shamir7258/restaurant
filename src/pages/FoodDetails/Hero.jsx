import { lazy, Suspense, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HiArrowLeft } from 'react-icons/hi'
import { Skeleton } from '../../components/ui'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './Hero.module.css'

// Lazy-loaded so the (fairly heavy) three.js + fiber + drei chunk only
// downloads once a dish detail page is actually visited.
const ThreeViewer = lazy(() => import('../../components/ThreeViewer/ThreeViewer'))

// Deterministic scatter (no Math.random) so re-renders don't reshuffle the field.
const PARTICLES = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 6) % 100}%`,
  top: `${(i * 53 + 12) % 100}%`,
  size: 3 + (i % 3) * 2,
  duration: 7 + (i % 4) * 2.2,
  delay: i * 0.35,
}))

export function Hero({ item }) {
  const navigate = useNavigate()
  const { prefersReducedMotion } = useTheme()
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 110])

  return (
    <section className={styles.hero} ref={sectionRef}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      {!prefersReducedMotion && (
        <div className={styles.particles} aria-hidden="true">
          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className={styles.particle}
              style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
              animate={{ y: [0, -24, 0], opacity: [0.12, 0.5, 0.12] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}

      <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Go back to menu">
        <HiArrowLeft size={18} aria-hidden="true" />
        <span>Back</span>
      </button>

      <motion.div className={styles.viewerStage} style={{ y }}>
        <Suspense fallback={<Skeleton variant="card" width="100%" height="100%" />}>
          <ThreeViewer
            shape={item.model3d?.shape}
            accent={item.model3d?.accent}
            gltfUrl={item.model3d?.gltf}
            fallbackImage={item.image}
            fallbackAlt={item.name}
            autoRotate
            className={styles.viewer}
          />
        </Suspense>
      </motion.div>
    </section>
  )
}
