import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, OptimizedImage, Rating } from '../../components/ui'
import { fadeInUp, staggerContainer, revealOnce } from '../../animations'
import { useTheme } from '../../theme/ThemeProvider'
import menuData from '../../data/menu.json'
import styles from './RelatedFoods.module.css'

const TARGET_COUNT = 4

function pickRelated(item) {
  const sameCategory = menuData.filter((i) => i.id !== item.id && i.category === item.category)
  if (sameCategory.length >= TARGET_COUNT) return sameCategory.slice(0, TARGET_COUNT)

  const rest = menuData.filter((i) => i.id !== item.id && i.category !== item.category)
  return [...sameCategory, ...rest].slice(0, TARGET_COUNT)
}

export function RelatedFoods({ item }) {
  const { prefersReducedMotion } = useTheme()
  const related = pickRelated(item)

  if (related.length === 0) return null

  const containerMotion = prefersReducedMotion
    ? {}
    : { variants: staggerContainer(0.08), initial: 'hidden', whileInView: 'show', viewport: revealOnce }
  const itemMotion = prefersReducedMotion ? {} : { variants: fadeInUp }

  return (
    <section id="related-dishes" className={[styles.section, 'container'].join(' ')}>
      <p className="eyebrow">You Might Also Like</p>
      <h2 className={styles.title}>Related Dishes</h2>

      <motion.div className={styles.grid} {...containerMotion}>
        {related.map((food) => (
          <motion.div key={food.id} {...itemMotion}>
            <Link to={`/menu/${food.id}`} className={styles.cardLink}>
              <Card glass hoverable className={styles.card}>
                <OptimizedImage src={food.image} alt={food.name} aspectRatio="4 / 3" />
                <div className={styles.body}>
                  <h3 className={styles.name}>{food.name}</h3>
                  <Rating value={food.rating} count={food.reviewCount} size={12} />
                  <p className={styles.price}>${food.price}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
