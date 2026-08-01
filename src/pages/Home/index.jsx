import { Hero } from './Hero'
import { StatsStrip } from './StatsStrip'
import { FeaturedDishes } from './FeaturedDishes'
import { ChefSection } from './ChefSection'
import { About } from './About'
import { Gallery } from './Gallery'
import { Testimonials } from './Testimonials'
import { ClosingCTA } from './ClosingCTA'

export function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <FeaturedDishes />
      <ChefSection />
      <About />
      <Gallery />
      <Testimonials />
      <ClosingCTA />
    </>
  )
}
