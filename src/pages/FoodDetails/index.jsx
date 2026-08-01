import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import menuData from '../../data/menu.json'
import { Hero } from './Hero'
import { InfoPanel } from './InfoPanel'
import { RelatedFoods } from './RelatedFoods'
import styles from './FoodDetails.module.css'

export function FoodDetails() {
  const { id } = useParams()
  const item = menuData.find((i) => String(i.id) === id)

  if (!item) {
    return (
      <div className={[styles.notFound, 'container'].join(' ')}>
        <p className="eyebrow">404</p>
        <h1 className={styles.notFoundTitle}>Dish not found</h1>
        <p className={styles.notFoundText}>The dish you&rsquo;re looking for isn&rsquo;t on tonight&rsquo;s menu.</p>
        <Button as={Link} to="/menu" size="lg">
          Back to Menu
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Hero item={item} />
      <InfoPanel item={item} />
      <RelatedFoods item={item} />
    </div>
  )
}
