import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaRegHeart, FaShareAlt } from 'react-icons/fa'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { Card, Badge, Rating, SpiceMeter, VegIndicator } from '../../components/ui'
import { useFavorites } from '../../hooks/useFavorites'
import { useTheme } from '../../theme/ThemeProvider'
import { fadeInUp, staggerContainer, revealOnce } from '../../animations'
import styles from './InfoPanel.module.css'

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

export function InfoPanel({ item }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { prefersReducedMotion } = useTheme()
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef(null)
  const favorite = isFavorite(item.id)

  const handleCopied = () => {
    setCopied(true)
    window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2400)
  }

  const containerMotion = prefersReducedMotion
    ? {}
    : { variants: staggerContainer(0.07), initial: 'hidden', whileInView: 'show', viewport: revealOnce }
  const itemMotion = prefersReducedMotion ? {} : { variants: fadeInUp }

  return (
    <section className={[styles.section, 'container'].join(' ')}>
      <Card glass className={styles.panel}>
        <motion.div {...containerMotion} className={styles.content}>
          <motion.div {...itemMotion} className={styles.header}>
            <div className={styles.titleRow}>
              <div className={styles.titleCol}>
                <p className={[styles.eyebrow, 'eyebrow'].join(' ')}>{item.category}</p>
                <div className={styles.nameRow}>
                  <h1 className={styles.name}>{item.name}</h1>
                  <VegIndicator veg={item.veg} size={20} />
                </div>
              </div>
              <p className={styles.price}>${item.price}</p>
            </div>

            <div className={styles.badges}>
              {item.chefSpecial && <Badge tone="gold">Chef&rsquo;s Special</Badge>}
              {item.popular && <Badge tone="red">Popular</Badge>}
              {item.isNew && <Badge tone="success">New</Badge>}
              {item.availability === 'limited' && <Badge tone="neutral">Limited Availability</Badge>}
            </div>

            <div className={styles.metaRow}>
              <Rating value={item.rating} count={item.reviewCount} size={15} />
              {item.spiceLevel > 0 && <SpiceMeter level={item.spiceLevel} />}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={[styles.actionBtn, favorite ? styles.active : ''].filter(Boolean).join(' ')}
                aria-pressed={favorite}
                onClick={() => toggleFavorite(item.id)}
              >
                {favorite ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
                <span>{favorite ? 'Saved' : 'Save'}</span>
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => shareDish(item, handleCopied)}>
                <FaShareAlt aria-hidden="true" />
                <span>{copied ? 'Link copied' : 'Share'}</span>
              </button>
            </div>
          </motion.div>

          <motion.p {...itemMotion} className={styles.description}>
            {item.description}
          </motion.p>

          {item.ingredients?.length > 0 && (
            <motion.div {...itemMotion} className={styles.block}>
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

          <motion.div {...itemMotion} className={styles.block}>
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

          {item.allergens?.length > 0 && (
            <motion.div {...itemMotion} className={styles.allergens}>
              <HiOutlineExclamationCircle size={18} aria-hidden="true" />
              <p>
                <strong>Allergens:</strong> {item.allergens.join(', ')}
              </p>
            </motion.div>
          )}

          {item.reviews?.length > 0 && (
            <motion.div {...itemMotion} className={styles.block}>
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
      </Card>
    </section>
  )
}
