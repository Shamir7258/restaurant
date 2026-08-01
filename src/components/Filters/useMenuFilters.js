import { useMemo, useState, useCallback } from 'react'

const DEFAULTS = {
  searchQuery: '',
  category: 'All',
  dietFilter: 'all',
  onlyPopular: false,
  onlyChefSpecial: false,
  onlyNew: false,
  maxSpiceLevel: null,
  maxCalories: null,
  sortBy: 'relevance',
}

/**
 * Drives search / filter / sort state for the menu and derives the final
 * filtered + sorted item list. Pure UI-agnostic logic — consumed by
 * FilterBar (controls) and wired by the Menu page into MenuGrid/MenuList
 * (display only).
 */
export function useMenuFilters(items) {
  const source = useMemo(() => items || [], [items])

  const [searchQuery, setSearchQuery] = useState(DEFAULTS.searchQuery)
  const [category, setCategory] = useState(DEFAULTS.category)
  const [dietFilter, setDietFilter] = useState(DEFAULTS.dietFilter)
  const [onlyPopular, setOnlyPopular] = useState(DEFAULTS.onlyPopular)
  const [onlyChefSpecial, setOnlyChefSpecial] = useState(DEFAULTS.onlyChefSpecial)
  const [onlyNew, setOnlyNew] = useState(DEFAULTS.onlyNew)
  const [maxSpiceLevel, setMaxSpiceLevel] = useState(DEFAULTS.maxSpiceLevel)
  const [maxCalories, setMaxCalories] = useState(DEFAULTS.maxCalories)
  const [sortBy, setSortBy] = useState(DEFAULTS.sortBy)

  const categories = useMemo(() => {
    const unique = new Set(source.map((item) => item.category))
    return ['All', ...Array.from(unique)]
  }, [source])

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    let result = source.filter((item) => {
      if (query) {
        const haystack = [item.name, item.description, ...(item.ingredients || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }

      if (category !== 'All' && item.category !== category) return false

      if (dietFilter === 'veg' && item.veg !== true) return false
      if (dietFilter === 'nonveg' && item.veg !== false) return false

      if (onlyPopular && !item.popular) return false
      if (onlyChefSpecial && !item.chefSpecial) return false
      if (onlyNew && !item.isNew) return false

      if (maxSpiceLevel !== null && maxSpiceLevel !== undefined) {
        if ((item.spiceLevel ?? 0) > maxSpiceLevel) return false
      }

      if (maxCalories !== null && maxCalories !== undefined) {
        if ((item.nutrition?.calories ?? 0) > maxCalories) return false
      }

      return true
    })

    const sorted = [...result]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case 'calories-asc':
        sorted.sort((a, b) => (a.nutrition?.calories ?? 0) - (b.nutrition?.calories ?? 0))
        break
      case 'relevance':
      default:
        sorted.sort((a, b) => {
          const scoreA = (a.rating ?? 0) * (a.reviewCount ?? 0)
          const scoreB = (b.rating ?? 0) * (b.reviewCount ?? 0)
          return scoreB - scoreA
        })
        break
    }

    return sorted
  }, [source, searchQuery, category, dietFilter, onlyPopular, onlyChefSpecial, onlyNew, maxSpiceLevel, maxCalories, sortBy])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery.trim() !== '') count += 1
    if (category !== DEFAULTS.category) count += 1
    if (dietFilter !== DEFAULTS.dietFilter) count += 1
    if (onlyPopular) count += 1
    if (onlyChefSpecial) count += 1
    if (onlyNew) count += 1
    if (maxSpiceLevel !== null && maxSpiceLevel !== undefined) count += 1
    if (maxCalories !== null && maxCalories !== undefined) count += 1
    if (sortBy !== DEFAULTS.sortBy) count += 1
    return count
  }, [searchQuery, category, dietFilter, onlyPopular, onlyChefSpecial, onlyNew, maxSpiceLevel, maxCalories, sortBy])

  const resetFilters = useCallback(() => {
    setSearchQuery(DEFAULTS.searchQuery)
    setCategory(DEFAULTS.category)
    setDietFilter(DEFAULTS.dietFilter)
    setOnlyPopular(DEFAULTS.onlyPopular)
    setOnlyChefSpecial(DEFAULTS.onlyChefSpecial)
    setOnlyNew(DEFAULTS.onlyNew)
    setMaxSpiceLevel(DEFAULTS.maxSpiceLevel)
    setMaxCalories(DEFAULTS.maxCalories)
    setSortBy(DEFAULTS.sortBy)
  }, [])

  return {
    filteredItems,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    categories,
    dietFilter,
    setDietFilter,
    onlyPopular,
    setOnlyPopular,
    onlyChefSpecial,
    setOnlyChefSpecial,
    onlyNew,
    setOnlyNew,
    maxSpiceLevel,
    setMaxSpiceLevel,
    maxCalories,
    setMaxCalories,
    sortBy,
    setSortBy,
    activeFilterCount,
    resetFilters,
  }
}
