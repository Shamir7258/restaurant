import { motion } from 'framer-motion'
import { Card, OptimizedImage } from '../../components/ui'
import { fadeInUp, fadeIn, staggerContainer, revealOnce } from '../../animations'
import styles from './ChefSection.module.css'

const CHEF_IMAGE = 'https://i.pravatar.cc/600?img=12'

export function ChefSection() {
  return (
    <section className={[styles.section, 'container'].join(' ')}>
      <motion.div className={styles.grid} variants={staggerContainer(0.12)} initial="hidden" whileInView="show" viewport={revealOnce}>
        <motion.div className={styles.portraitWrap} variants={fadeIn}>
          <OptimizedImage src={CHEF_IMAGE} alt="Portrait of Chef Elian Voss" aspectRatio="4 / 5" className={styles.portrait} />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card glass className={styles.panel}>
            <p className="eyebrow">Executive Chef</p>
            <h2 className={styles.name}>Elian Voss</h2>
            <p className={styles.bio}>
              Trained in Lyon and shaped by a decade across the kitchens of Copenhagen and Kyoto, Chef Voss brings a
              quiet discipline to Aurum's kitchen — sourcing obsessively, wasting nothing, and letting a single
              perfect ingredient carry the plate.
            </p>
            <p className={styles.bio}>
              "I want a guest to taste the season, not the technique," he says. It is this philosophy that has
              earned Aurum its reputation as a table for those who notice the details.
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  )
}
