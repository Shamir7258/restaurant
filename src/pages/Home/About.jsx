import { motion } from 'framer-motion'
import { fadeInUp, revealOnce } from '../../animations'
import styles from './About.module.css'

const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=1400&q=75&auto=format&fit=crop'

export function About() {
  return (
    <section className={styles.section}>
      <div className={styles.bg} style={{ backgroundImage: `url(${ABOUT_IMAGE})` }} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className="container">
        <motion.div
          className={[styles.panel, 'glass'].join(' ')}
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
        >
          <p className="eyebrow">Our Philosophy</p>
          <h2 className={styles.title}>A Table Set Slowly</h2>
          <p className={styles.copy}>
            Aurum was built on a simple belief — that a meal is a form of hospitality, not a transaction. Every
            dish begins with a relationship: a farmer we trust, a fishmonger who calls at dawn, a vineyard we've
            visited ourselves. We change our menu with the seasons because the seasons, not a calendar, decide
            when something is ready.
          </p>
          <p className={styles.copy}>
            Step inside and the pace changes. Candlelight, low conversation, unhurried service — everything here
            is designed so that time slows just enough for you to taste it.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
