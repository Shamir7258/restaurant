import { motion } from 'framer-motion'
import { FaQuoteLeft } from 'react-icons/fa'
import { Card, Rating } from '../../components/ui'
import { fadeInUp, staggerContainer, revealOnce } from '../../animations'
import styles from './Testimonials.module.css'

const TESTIMONIALS = [
  {
    name: 'Margaux R.',
    quote: 'Every course felt considered. The truffle burrata alone is worth the reservation — this is the finest table in the city.',
    rating: 5,
  },
  {
    name: 'Desmond K.',
    quote: 'Service that anticipates without hovering, and a wine pairing that genuinely elevated the tasting menu. Extraordinary.',
    rating: 5,
  },
  {
    name: 'Priya N.',
    quote: 'Aurum is where we celebrate everything now. The room, the light, the plating — it all feels like a quiet occasion.',
    rating: 4.5,
  },
  {
    name: 'Julian F.',
    quote: 'Ambitious cooking with real restraint. Nothing on the plate is there by accident. A standout evening from start to finish.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className={[styles.section, 'container'].join(' ')}>
      <div className={styles.heading}>
        <p className="eyebrow">Guest Notes</p>
        <h2 className={styles.title}>What Our Guests Say</h2>
      </div>

      <motion.div className={styles.grid} variants={staggerContainer(0.1)} initial="hidden" whileInView="show" viewport={revealOnce}>
        {TESTIMONIALS.map((t) => (
          <motion.div key={t.name} variants={fadeInUp}>
            <Card glass className={styles.card}>
              <FaQuoteLeft className={styles.quoteIcon} aria-hidden="true" />
              <p className={styles.quote}>{t.quote}</p>
              <div className={styles.footer}>
                <span className={styles.name}>{t.name}</span>
                <Rating value={t.rating} size={12} showValue={false} />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
