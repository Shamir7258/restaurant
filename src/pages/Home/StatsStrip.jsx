import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, revealOnce } from '../../animations'
import styles from './StatsStrip.module.css'

const STATS = [
  { value: '12', label: 'Years of Craft' },
  { value: '3', label: 'Michelin Mentions' },
  { value: '30+', label: 'Seasonal Dishes' },
  { value: '4.9', label: 'Guest Rating' },
]

export function StatsStrip() {
  return (
    <section className={styles.section}>
      <motion.div
        className={[styles.strip, 'glass', 'container'].join(' ')}
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={revealOnce}
      >
        {STATS.map((stat) => (
          <motion.div className={styles.stat} key={stat.label} variants={fadeInUp}>
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
