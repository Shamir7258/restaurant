import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui'
import { fadeInUp, revealOnce } from '../../animations'
import styles from './ClosingCTA.module.css'

export function ClosingCTA() {
  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div className={styles.band} variants={fadeInUp} initial="hidden" whileInView="show" viewport={revealOnce}>
          <p className="eyebrow">Reservations</p>
          <h2 className={styles.title}>Reserve Your Table</h2>
          <p className={styles.subtitle}>Seats are limited each evening — join us for a night worth savoring.</p>
          <div className={styles.actions}>
            <Button as={Link} to="/menu" size="lg">
              Reserve a Table
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
