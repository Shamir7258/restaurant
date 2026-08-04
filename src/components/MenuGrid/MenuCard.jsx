import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { Badge, OptimizedImage, Rating, VegIndicator } from '../ui'
import { imageZoom } from '../../animations'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './MenuCard.module.css'

/** Highest-priority badge only — chefSpecial > popular > isNew, per grid spec. */
function getBadge(item) {
  if (item.chefSpecial) return { label: "Chef's Special", tone: 'gold' }
  if (item.popular) return { label: 'Popular', tone: 'red' }
  if (item.isNew) return { label: 'New', tone: 'success' }
  return null
}

export function MenuCard({ item, isFavorite, onToggleFavorite }) {
  const { prefersReducedMotion } = useTheme()
  const favorite = isFavorite(item.id)
  const badge = getBadge(item)

  function handleFavoriteClick(e) {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite(item.id)
  }

  return (
    <motion.article
      className={styles.card}
      initial="rest"
      whileHover={prefersReducedMotion ? undefined : 'hover'}
      animate="rest"
    >
      <Link to={`/menu/${item.id}`} className={styles.link}>
        <motion.div className={styles.imageWrap} layoutId={prefersReducedMotion ? undefined : `dish-media-${item.id}`}>
          <motion.div className={styles.imageInner} variants={prefersReducedMotion ? undefined : imageZoom}>
            <OptimizedImage src={item.image} alt={item.name} aspectRatio="4 / 3" imgClassName={styles.image} />
          </motion.div>

          <div className={styles.imageOverlay} aria-hidden="true" />

          <div className={styles.topRow}>
            <VegIndicator veg={item.veg} size={16} className={styles.veg} />
            <button
              type="button"
              className={styles.favoriteBtn}
              aria-pressed={favorite}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={handleFavoriteClick}
            >
              {favorite ? <FaHeart className={styles.heartFilled} /> : <FaRegHeart className={styles.heartOutline} />}
            </button>
          </div>

          {badge && (
            <div className={styles.badgeRow}>
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </div>
          )}
        </motion.div>

        <div className={styles.body}>
          <h2 className={styles.name}>{item.name}</h2>
          <p className={styles.description}>{item.description}</p>

          <div className={styles.meta}>
            <Rating value={item.rating} count={item.reviewCount} size={12} />
            <span className={styles.calories}>{item.nutrition?.calories} kcal</span>
          </div>

          <div className={styles.footer}>
            <span className={styles.price}>${item.price}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
