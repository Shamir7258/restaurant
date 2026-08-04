import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { Badge, Button, OptimizedImage, Rating, SpiceMeter, VegIndicator } from '../ui'
import { easeLuxury, easeOut } from '../../animations'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './MenuListItem.module.css'

/** All badges that apply, in priority order — a row can wear more than one. */
function getBadges(item) {
  const badges = []
  if (item.chefSpecial) badges.push({ label: "Chef's Special", tone: 'gold' })
  if (item.popular) badges.push({ label: 'Popular', tone: 'red' })
  if (item.isNew) badges.push({ label: 'New', tone: 'success' })
  return badges
}

const rowVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeLuxury } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.28, ease: easeOut } },
}

/** A single horizontal dish row used by MenuList. */
export function MenuListItem({ item, isFavorite, onToggleFavorite }) {
  const { prefersReducedMotion } = useTheme()
  const favorite = isFavorite(item.id)
  const badges = getBadges(item)
  const { nutrition } = item
  const detailsHref = `/menu/${item.id}`

  function handleFavoriteClick() {
    onToggleFavorite(item.id)
  }

  return (
    <motion.li
      className={styles.row}
      layout={prefersReducedMotion ? false : 'position'}
      variants={prefersReducedMotion ? undefined : rowVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
      exit={prefersReducedMotion ? undefined : 'exit'}
    >
      <Link to={detailsHref} className={styles.thumbLink}>
        <motion.div className={styles.thumbMotion} layoutId={prefersReducedMotion ? undefined : `dish-media-${item.id}`}>
          <OptimizedImage src={item.image} alt={item.name} aspectRatio="4 / 3" className={styles.thumbWrap} />
        </motion.div>
        {badges.length > 0 && (
          <div className={styles.badgeRow}>
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <VegIndicator veg={item.veg} size={14} />
            <Link to={detailsHref} className={styles.name}>
              {item.name}
            </Link>
            <SpiceMeter level={item.spiceLevel} />
          </div>

          <button
            type="button"
            className={styles.favoriteBtn}
            aria-pressed={favorite}
            aria-label={favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
            onClick={handleFavoriteClick}
          >
            {favorite ? (
              <FaHeart className={styles.heartFilled} aria-hidden="true" />
            ) : (
              <FaRegHeart className={styles.heartOutline} aria-hidden="true" />
            )}
          </button>
        </div>

        <p className={styles.description}>{item.description}</p>

        {nutrition && (
          <div
            className={styles.nutrition}
            aria-label={`${nutrition.calories} calories, ${nutrition.protein} grams protein, ${nutrition.carbs} grams carbs, ${nutrition.fat} grams fat`}
          >
            <span className={styles.nutriChip}>{nutrition.calories} kcal</span>
            <span className={styles.nutriChip}>{nutrition.protein}g protein</span>
            <span className={styles.nutriChip}>{nutrition.carbs}g carbs</span>
            <span className={styles.nutriChip}>{nutrition.fat}g fat</span>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <Rating value={item.rating} count={item.reviewCount} size={13} />
            <span className={styles.price}>${item.price}</span>
          </div>

          <Button as={Link} to={detailsHref} variant="secondary" size="sm" className={styles.detailsBtn}>
            View Details
          </Button>
        </div>
      </div>
    </motion.li>
  )
}
