import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Badge, Rating, OptimizedImage, Button } from '../../components/ui'
import { fadeInUp, staggerContainer, revealOnce, imageZoom } from '../../animations'
import { useTheme } from '../../theme/ThemeProvider'
import menuData from '../../data/menu.json'
import styles from './FeaturedDishes.module.css'

function pickFeatured() {
  const specials = menuData.filter((item) => item.chefSpecial)
  const popular = menuData.filter((item) => item.popular && !item.chefSpecial)
  const combined = [...specials, ...popular]
  return combined.slice(0, 6)
}

const FEATURED = pickFeatured()

export function FeaturedDishes() {
  const { prefersReducedMotion } = useTheme()

  return (
    <section className={[styles.section, 'container'].join(' ')}>
      <div className={styles.heading}>
        <p className="eyebrow">Signature Selections</p>
        <h2 className={styles.title}>Featured Dishes</h2>
        <p className={styles.subtitle}>A glimpse of the table — chef's specials and guest favorites, plated with intention.</p>
      </div>

      <motion.div className={styles.grid} variants={staggerContainer(0.08)} initial="hidden" whileInView="show" viewport={revealOnce}>
        {FEATURED.map((item) => (
          <motion.div key={item.id} variants={fadeInUp}>
            <Link to={`/menu/${item.id}`} className={styles.cardLink}>
              <Card glass className={styles.card}>
                <motion.div
                  className={styles.imageWrap}
                  layoutId={prefersReducedMotion ? undefined : `dish-media-${item.id}`}
                  initial="rest"
                  whileHover={prefersReducedMotion ? undefined : 'hover'}
                  animate="rest"
                >
                  <motion.div variants={prefersReducedMotion ? undefined : imageZoom}>
                    <OptimizedImage src={item.image} alt={item.name} aspectRatio="4 / 3" />
                  </motion.div>
                  <div className={styles.badges}>
                    {item.chefSpecial && <Badge tone="gold">Chef's Special</Badge>}
                    {item.popular && !item.chefSpecial && <Badge tone="red">Popular</Badge>}
                  </div>
                </motion.div>
                <div className={styles.body}>
                  <h3 className={styles.name}>{item.name}</h3>
                  <Rating value={item.rating} count={item.reviewCount} size={12} />
                  <p className={styles.price}>${item.price}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className={styles.cta}>
        <Button as={Link} to="/menu" variant="secondary" size="lg">
          View Full Menu
        </Button>
      </div>
    </section>
  )
}
