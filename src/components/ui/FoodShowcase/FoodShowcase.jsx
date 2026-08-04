import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Beef, Star, TrendingUp, Heart, Share2, ArrowLeft, Utensils, AlertTriangle } from 'lucide-react'
import { Badge } from '../Badge/Badge'
import { Rating } from '../Rating/Rating'
import { VegIndicator } from '../VegIndicator/VegIndicator'
import { Skeleton } from '../Skeleton/Skeleton'
import { DishVideo } from '../../DishVideo/DishVideo'
import { OptimizedImage } from '../OptimizedImage/OptimizedImage'
import { useFavorites } from '../../../hooks/useFavorites'
import { useTheme } from '../../../theme/ThemeProvider'
import { fadeInUp, staggerContainer, revealOnce } from '../../../animations'
import { getFeatureMetrics } from './adaptFoodItem'
import styles from './FoodShowcase.module.css'

// Dishes without a video fall back to a plain photo for now, not the 3D
// viewer — flip this back on once the Blender model library covers more of
// the menu. Keeping the ThreeViewer branch intact (not deleted) so that's a
// one-line change, not a rewrite.
const SHOW_3D_MODELS = false

/**
 * The dish detail centerpiece — adapted from a vendor "spatial product
 * showcase" component (originally an earbud L/R switcher). Keeps its
 * animation/interaction DNA (staggered reveal, sliding-indicator switcher,
 * floating circular visual, animated feature bars) but every Tailwind class
 * became a CSS Module rule against this site's design tokens, and every
 * "product" concept became a real menu.json field — see adaptFoodItem.js
 * for exactly which fields back the four feature bars.
 *
 * The Left/Right earbud switch became a Classic ↔ Chef's Table mood toggle:
 * same dish, same data, different accent/lighting — not two different
 * dishes, so nothing here is fabricated per item.
 */

const ThreeViewer = lazy(() => import('../../ThreeViewer/ThreeViewer'))

const FEATURE_ICONS = { spice: Flame, protein: Beef, rating: Star, popularity: TrendingUp }

const MODES = {
  classic: { id: 'classic', label: 'Classic', tagline: 'Classic Plating', accent: '#d4af37' },
  chefsTable: { id: 'chefsTable', label: "Chef's Table", tagline: "Chef's Table", accent: '#b23a63' },
}

// Deterministic scatter (no Math.random) so re-renders don't reshuffle the field — ported from the old FoodDetails Hero.
const PARTICLES = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 6) % 100}%`,
  top: `${(i * 53 + 12) % 100}%`,
  size: 3 + (i % 3) * 2,
  duration: 7 + (i % 4) * 2.2,
  delay: i * 0.35,
}))

const REVEAL = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 100, damping: 20 } },
    exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
  },
}

async function shareDish(item, onCopied) {
  const shareData = { title: item.name, text: item.description, url: window.location.href }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      // user cancelled the native share sheet, or it failed — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(window.location.href)
    onCopied()
  } catch {
    // clipboard unavailable too — nothing more we can do without a backend
  }
}

function BackgroundGlow({ mode }) {
  const isClassic = mode === 'classic'
  return (
    <div className={styles.bgLayer} aria-hidden="true">
      <motion.div
        animate={{
          background: isClassic
            ? 'radial-gradient(circle at 12% 45%, rgba(212, 175, 55, 0.16), transparent 55%)'
            : 'radial-gradient(circle at 88% 45%, rgba(178, 58, 99, 0.18), transparent 55%)',
        }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className={styles.bgGradient}
      />
    </div>
  )
}

function ParticleField({ reducedMotion }) {
  if (reducedMotion) return null
  return (
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
  )
}

function DishVisual({ item, mode, reducedMotion }) {
  const theme = MODES[mode]
  const fallback = <Skeleton variant="card" width="100%" height="100%" />

  return (
    <motion.div layout="position" className={styles.visualWrap}>
      <motion.div
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className={styles.ring}
        style={{ borderColor: `${theme.accent}40` }}
        aria-hidden="true"
      />
      <motion.div
        animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={styles.glow}
        style={{ background: theme.accent }}
        aria-hidden="true"
      />

      <motion.div
        animate={reducedMotion ? undefined : { y: [-8, 8, -8] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className={styles.visualStage}
      >
        <motion.div
          className={[styles.visualMotion, item.video || SHOW_3D_MODELS ? '' : styles.visualMotionCircle].filter(Boolean).join(' ')}
          layoutId={reducedMotion ? undefined : `dish-media-${item.id}`}
        >
          {item.video ? (
            <DishVideo src={item.video} poster={item.image} alt={item.name} className={styles.visualMedia} />
          ) : SHOW_3D_MODELS ? (
            <Suspense fallback={fallback}>
              <ThreeViewer
                shape={item.model3d?.shape}
                accent={theme.accent}
                gltfUrl={item.model3d?.gltf}
                category={item.category}
                dishId={item.id}
                fallbackImage={item.image}
                fallbackAlt={item.name}
                autoRotate
                className={styles.visualMedia}
              />
            </Suspense>
          ) : (
            <OptimizedImage src={item.image} alt={item.name} aspectRatio="1 / 1" className={styles.visualMedia} imgClassName={styles.visualImage} priority />
          )}
        </motion.div>
      </motion.div>

      <motion.div layout="position" className={styles.statusPill}>
        <span className={styles.statusDot} style={{ background: theme.accent }} aria-hidden="true" />
        {theme.tagline}
      </motion.div>
    </motion.div>
  )
}

function DishSummary({ item, mode, metrics }) {
  const theme = MODES[mode]
  const isClassic = mode === 'classic'

  return (
    <motion.div
      variants={REVEAL.container}
      initial="hidden"
      animate="show"
      exit="exit"
      className={[styles.summary, isClassic ? styles.alignStart : styles.alignEnd].join(' ')}
    >
      <motion.p variants={REVEAL.item} className={styles.eyebrow}>
        {item.category} &middot; {theme.tagline}
      </motion.p>
      <motion.div variants={REVEAL.item} className={styles.nameRow}>
        <h1 className={styles.name}>{item.name}</h1>
        <VegIndicator veg={item.veg} size={20} />
      </motion.div>
      <motion.p variants={REVEAL.item} className={styles.price} style={{ color: theme.accent }}>
        ${item.price}
      </motion.p>

      <motion.div variants={REVEAL.item} className={styles.badges}>
        {item.chefSpecial && <Badge tone="gold">Chef&rsquo;s Special</Badge>}
        {item.popular && <Badge tone="red">Popular</Badge>}
        {item.isNew && <Badge tone="success">New</Badge>}
        {item.availability === 'limited' && <Badge tone="neutral">Limited Availability</Badge>}
      </motion.div>

      <motion.p variants={REVEAL.item} className={styles.description}>
        {item.description}
      </motion.p>

      <motion.div variants={REVEAL.item} className={styles.metricsPanel}>
        {metrics.map((metric, idx) => {
          const Icon = FEATURE_ICONS[metric.key]
          return (
            <div key={metric.key} className={styles.metricRow}>
              <div className={styles.metricHead}>
                <span className={styles.metricLabel}>
                  <Icon size={14} aria-hidden="true" /> {metric.label}
                </span>
                <span className={styles.metricValue}>{metric.value}%</span>
              </div>
              <div className={styles.metricTrack}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + idx * 0.12 }}
                  className={styles.metricFill}
                  style={{ background: theme.accent }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

function ModeSwitcher({ mode, onChange, reducedMotion }) {
  const options = Object.values(MODES)
  return (
    <div className={styles.switcherWrap}>
      <div className={styles.switcher} role="radiogroup" aria-label="Presentation mode">
        {options.map((opt) => {
          const active = mode === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={styles.switchOption}
              onClick={() => onChange(opt.id)}
            >
              {active && (
                <motion.span
                  layoutId={reducedMotion ? undefined : 'showcase-mode-indicator'}
                  className={styles.switchIndicator}
                  style={{ background: opt.accent }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 32 }}
                />
              )}
              <span className={active ? styles.switchLabelActive : styles.switchLabel}>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FloatingActions({ favorite, onToggleFavorite, onShare, shareLabel, onBack, onViewSimilar }) {
  return (
    <>
      <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Back to menu">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Back</span>
      </button>

      <div className={styles.actionRail}>
        <button
          type="button"
          className={[styles.railBtn, favorite ? styles.railBtnActive : ''].filter(Boolean).join(' ')}
          aria-pressed={favorite}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={onToggleFavorite}
        >
          <Heart size={17} aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className={styles.railBtn} aria-label={shareLabel} onClick={onShare}>
          <Share2 size={17} aria-hidden="true" />
        </button>
        <button type="button" className={styles.railBtn} aria-label="View similar dishes" onClick={onViewSimilar}>
          <Utensils size={17} aria-hidden="true" />
        </button>
      </div>
    </>
  )
}

export function FoodShowcase({ item }) {
  const navigate = useNavigate()
  const { prefersReducedMotion } = useTheme()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [mode, setMode] = useState('classic')
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef(null)
  const favorite = isFavorite(item.id)
  const metrics = useMemo(() => getFeatureMetrics(item), [item])

  const handleCopied = () => {
    setCopied(true)
    window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2400)
  }

  function handleViewSimilar() {
    document.getElementById('related-dishes')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  const infoMotion = prefersReducedMotion
    ? {}
    : { variants: staggerContainer(0.07), initial: 'hidden', whileInView: 'show', viewport: revealOnce }
  const infoItemMotion = prefersReducedMotion ? {} : { variants: fadeInUp }

  return (
    <section className={styles.showcase}>
      <BackgroundGlow mode={mode} />
      <ParticleField reducedMotion={prefersReducedMotion} />

      <FloatingActions
        favorite={favorite}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onShare={() => shareDish(item, handleCopied)}
        shareLabel={copied ? 'Link copied' : 'Share'}
        onBack={() => navigate(-1)}
        onViewSimilar={handleViewSimilar}
      />

      <div className={styles.heroRow}>
        <motion.div
          layout
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.9 }}
          className={[styles.stage, mode === 'classic' ? styles.stageClassic : styles.stageChef].join(' ')}
        >
          <DishVisual item={item} mode={mode} reducedMotion={prefersReducedMotion} />

          <motion.div layout="position" className={styles.detailsCol}>
            <AnimatePresence mode="wait">
              <DishSummary key={mode} item={item} mode={mode} metrics={metrics} />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      <motion.div {...infoMotion} className={[styles.moreInfo, 'container'].join(' ')}>
        {item.ingredients?.length > 0 && (
          <motion.div {...infoItemMotion} className={styles.block}>
            <h2 className={styles.blockTitle}>Ingredients</h2>
            <ul className={styles.chips}>
              {item.ingredients.map((ing) => (
                <li key={ing} className={styles.chip}>
                  {ing}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div {...infoItemMotion} className={styles.block}>
          <h2 className={styles.blockTitle}>Nutrition &amp; Timing</h2>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{item.nutrition.calories}</span>
              <span className={styles.statLabel}>Calories</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{item.nutrition.protein}g</span>
              <span className={styles.statLabel}>Protein</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{item.nutrition.carbs}g</span>
              <span className={styles.statLabel}>Carbs</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{item.nutrition.fat}g</span>
              <span className={styles.statLabel}>Fat</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{item.prepTime}m</span>
              <span className={styles.statLabel}>Prep Time</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{item.cookingTime}m</span>
              <span className={styles.statLabel}>Cook Time</span>
            </div>
          </div>
        </motion.div>

        <motion.div {...infoItemMotion} className={styles.metaRow}>
          <Rating value={item.rating} count={item.reviewCount} size={15} />
        </motion.div>

        {item.allergens?.length > 0 && (
          <motion.div {...infoItemMotion} className={styles.allergens}>
            <AlertTriangle size={18} aria-hidden="true" />
            <p>
              <strong>Allergens:</strong> {item.allergens.join(', ')}
            </p>
          </motion.div>
        )}

        {item.reviews?.length > 0 && (
          <motion.div {...infoItemMotion} className={styles.block}>
            <h2 className={styles.blockTitle}>Guest Reviews</h2>
            <div className={styles.reviews}>
              {item.reviews.map((review) => (
                <div key={review.id} className={styles.review}>
                  <div className={styles.reviewHead}>
                    <span className={styles.reviewAuthor}>{review.author}</span>
                    <Rating value={review.rating} showValue={false} size={12} />
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                  <span className={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <ModeSwitcher mode={mode} onChange={setMode} reducedMotion={prefersReducedMotion} />
    </section>
  )
}

export default FoodShowcase
