import { motion } from 'framer-motion'
import { OptimizedImage } from '../../components/ui'
import { fadeIn, staggerContainer, revealOnce, imageZoom } from '../../animations'
import styles from './Gallery.module.css'

const GALLERY_ITEMS = [
  { caption: 'The Dining Room', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=900&q=70&auto=format&fit=crop' },
  { caption: 'Plated with Care', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900&q=70&auto=format&fit=crop' },
  { caption: 'The Wine Cellar', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=900&q=70&auto=format&fit=crop' },
  { caption: 'Open Kitchen', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=900&q=70&auto=format&fit=crop' },
  { caption: 'Evening Light', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=70&auto=format&fit=crop' },
  { caption: 'Seasonal Ingredients', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=70&auto=format&fit=crop' },
  { caption: 'The Bar', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=900&q=70&auto=format&fit=crop' },
  { caption: 'Dessert Course', image: 'https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=900&q=70&auto=format&fit=crop' },
]

export function Gallery() {
  return (
    <section className={[styles.section, 'container'].join(' ')}>
      <div className={styles.heading}>
        <p className="eyebrow">Inside Aurum</p>
        <h2 className={styles.title}>Gallery</h2>
      </div>

      <motion.div className={styles.grid} variants={staggerContainer(0.06)} initial="hidden" whileInView="show" viewport={revealOnce}>
        {GALLERY_ITEMS.map((item) => (
          <motion.figure className={styles.tile} key={item.caption} variants={fadeIn}>
            <motion.div className={styles.tileInner} initial="rest" whileHover="hover" animate="rest">
              <motion.div variants={imageZoom} className={styles.imgMotion}>
                <OptimizedImage src={item.image} alt={item.caption} aspectRatio="1 / 1" />
              </motion.div>
              <figcaption className={styles.caption}>
                <span>{item.caption}</span>
              </figcaption>
            </motion.div>
          </motion.figure>
        ))}
      </motion.div>
    </section>
  )
}
