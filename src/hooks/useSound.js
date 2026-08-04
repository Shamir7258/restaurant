import { useCallback, useRef } from 'react'

/**
 * Sound-hook architecture for future UI sfx (button taps, hover chimes,
 * ambience) — SOUND_MAP is empty today, so `play()` is a harmless no-op.
 * Call sites (Button, etc.) are wired now so Phase 3 can drop real audio
 * files into SOUND_MAP without touching them again. Playback only ever
 * happens from a real user-gesture handler (never on mount/hover-only) —
 * no autoplay.
 */
const SOUND_MAP = {
  // tap: '/sounds/tap.mp3',
  // hover: '/sounds/hover.mp3',
}

export function useSound() {
  const cache = useRef(new Map())

  const play = useCallback((name, { volume = 0.5 } = {}) => {
    const src = SOUND_MAP[name]
    if (!src) return

    let audio = cache.current.get(name)
    if (!audio) {
      audio = new Audio(src)
      cache.current.set(name, audio)
    }
    audio.volume = volume
    audio.currentTime = 0
    audio.play().catch(() => {
      // Autoplay-policy rejection or a still-missing file — sound is best-effort, never fatal.
    })
  }, [])

  return play
}
