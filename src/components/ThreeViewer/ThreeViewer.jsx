import { Component, Suspense, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { OptimizedImage } from '../ui'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './ThreeViewer.module.css'

/**
 * Stylized procedural "dish" scene — no real GLTF models exist for this
 * mockup, so each menu item's shape/accent from menu.json drives a small
 * generated still-life (plate + a geometry standing in for the dish) lit
 * with an HDRI environment. Self-contained: nothing to fetch, nothing
 * that can 404.
 */

const SHAPE_CONFIG = {
  sphere: { radius: 0.85, height: 1.7, baseRotation: [0, 0, 0] },
  cone: { radius: 0.85, height: 1.3, baseRotation: [0, 0, 0] },
  dome: { radius: 0.95, height: 0.95, baseRotation: [0, 0, 0] },
  torus: { radius: 1.05, height: 0.6, baseRotation: [Math.PI / 2, 0, 0] },
  ring: { radius: 1.04, height: 0.28, baseRotation: [Math.PI / 2, 0, 0] },
}

function DishGeometry({ shape }) {
  switch (shape) {
    case 'torus':
      return <torusGeometry args={[0.75, 0.3, 32, 64]} />
    case 'cone':
      return <coneGeometry args={[0.85, 1.3, 48]} />
    case 'dome':
      return <sphereGeometry args={[0.95, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
    case 'ring':
      return <torusGeometry args={[0.9, 0.14, 24, 48]} />
    case 'sphere':
    default:
      return <sphereGeometry args={[0.85, 48, 48]} />
  }
}

/** Deterministic (not per-frame-random) spin offset so same-shape dishes don't look identical. */
function hashSpin(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const normalized = ((hash % 360) + 360) % 360
  return (normalized * Math.PI) / 180
}

function Dish({ shape, accent }) {
  const config = SHAPE_CONFIG[shape] || SHAPE_CONFIG.sphere
  const spin = useMemo(() => hashSpin(`${shape}-${accent}`), [shape, accent])
  const plateTopY = 0.06
  const meshY = plateTopY + config.height / 2 + 0.04
  const rotation = [config.baseRotation[0], config.baseRotation[1] + spin, config.baseRotation[2]]

  return (
    <group>
      {/* plate */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.3, 1.35, 0.12, 64]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.55} metalness={0.25} />
      </mesh>
      {/* dish */}
      <mesh position={[0, meshY, 0]} rotation={rotation} castShadow receiveShadow>
        <DishGeometry shape={shape} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.15} />
      </mesh>
    </group>
  )
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('ThreeViewer failed to render:', error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export function ThreeViewer({ shape = 'sphere', accent = '#d4af37', fallbackImage, fallbackAlt = '', autoRotate = true, className = '' }) {
  const { prefersReducedMotion } = useTheme()
  const [webglOk] = useState(() => hasWebGL())

  const fallback = (
    <div className={styles.fallback}>
      <OptimizedImage src={fallbackImage} alt={fallbackAlt} aspectRatio="1 / 1" className={styles.fallbackImage} />
    </div>
  )

  if (!webglOk) {
    return <div className={[styles.viewer, className].filter(Boolean).join(' ')}>{fallback}</div>
  }

  return (
    <div className={[styles.viewer, className].filter(Boolean).join(' ')}>
      <ThreeErrorBoundary fallback={fallback}>
        <div className={styles.canvasWrap}>
          <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.4, 3.4], fov: 42 }} shadows>
            <ambientLight intensity={0.15} />
            <directionalLight position={[3, 5, 2]} intensity={1.3} color="#fff4e0" castShadow shadow-mapSize={[1024, 1024]} />
            <pointLight position={[-3, 1.4, -1.6]} intensity={1.6} color={accent} />

            <Dish shape={shape} accent={accent} />

            <Suspense fallback={null}>
              <Environment preset="night" />
              <ContactShadows position={[0, -0.07, 0]} opacity={0.55} scale={6} blur={2.4} far={2} resolution={512} color="#000000" />
            </Suspense>

            <OrbitControls
              enablePan={false}
              autoRotate={autoRotate && !prefersReducedMotion}
              autoRotateSpeed={1.2}
              minDistance={2.2}
              maxDistance={5}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>
        </div>
      </ThreeErrorBoundary>
    </div>
  )
}

export default ThreeViewer
