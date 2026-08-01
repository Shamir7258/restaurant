import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

/** Shared favorites/wishlist state, persisted to localStorage, keyed by item id. */
export function useFavorites() {
  const [ids, setIds] = useLocalStorage('aurum:favorites', [])

  const toggleFavorite = useCallback(
    (id) => {
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    },
    [setIds],
  )

  const isFavorite = useCallback((id) => ids.includes(id), [ids])

  return useMemo(() => ({ favoriteIds: ids, isFavorite, toggleFavorite }), [ids, isFavorite, toggleFavorite])
}
