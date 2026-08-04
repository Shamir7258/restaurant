import { useRef, useState } from 'react'
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './DishVideo.module.css'

/**
 * A looping ambient clip of the plated dish, standing in for the 3D viewer
 * on dishes that have a video instead of a model. Muted by default (no
 * autoplay audio) with manual play/pause + mute controls so it doesn't read
 * as a pure downgrade from the interactive 3D viewer it replaces. Under
 * reduced motion it doesn't autoplay — the poster frame shows until the
 * guest opts in.
 */
export function DishVideo({ src, poster, alt, className = '' }) {
  const { prefersReducedMotion } = useTheme()
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(!prefersReducedMotion)
  const [muted, setMuted] = useState(true)

  function togglePlay() {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play()
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <video
        ref={videoRef}
        className={styles.video}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        autoPlay={!prefersReducedMotion}
        aria-label={alt}
      />
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <FaVolumeMute aria-hidden="true" /> : <FaVolumeUp aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

export default DishVideo
