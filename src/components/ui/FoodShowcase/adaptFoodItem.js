import menuData from '../../../data/menu.json'

// A generous per-dish protein amount used only to normalize the feature bar
// into a 0-100 scale — not a nutritional claim about any specific dish.
const PROTEIN_CEILING_G = 40

// Popularity is measured relative to the loudest dish in the actual dataset,
// not an arbitrary constant — recomputed once at module load.
const MAX_REVIEW_COUNT = menuData.reduce((max, item) => Math.max(max, item.reviewCount || 0), 1)

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Derives the Food Showcase's four feature-bar values (0-100) from real
 * menu.json fields — every value traces back to an actual field on the item;
 * only the normalization ceiling (protein) and denominator (popularity) are
 * chosen constants, documented above. Nothing here is invented per dish.
 */
export function getFeatureMetrics(item) {
  return [
    { key: 'spice', label: 'Spice Level', value: Math.round(clamp((item.spiceLevel / 3) * 100)) },
    { key: 'protein', label: 'Protein', value: Math.round(clamp((item.nutrition.protein / PROTEIN_CEILING_G) * 100)) },
    { key: 'rating', label: 'Guest Rating', value: Math.round(clamp((item.rating / 5) * 100)) },
    { key: 'popularity', label: 'Popularity', value: Math.round(clamp((item.reviewCount / MAX_REVIEW_COUNT) * 100)) },
  ]
}
