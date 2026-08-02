import { Component, Suspense, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei'
import { OptimizedImage } from '../ui'
import { useTheme } from '../../theme/ThemeProvider'
import styles from './ThreeViewer.module.css'

/**
 * A handful of dishes carry a real, open-source glTF model (see
 * public/models/ — re-hosted at reduced texture size from Khronos'
 * glTF-Sample-Assets, CC0/CC-BY-4.0, only where the model's actual subject
 * matches the dish's real ingredients). Every other dish falls back to a
 * stylized procedural "dish" — no model exists for every possible menu item,
 * so each item's shape/accent from menu.json instead drives a generated
 * still-life (plate + a geometry standing in for the dish) lit with an HDRI
 * environment. Self-contained: nothing to fetch, nothing that can 404.
 *
 * The procedural base primitive per `shape` is only a silhouette — every
 * mesh gets its surface deformed into an irregular, lumpy mound (a handful
 * of smooth "bumps" at random-but-deterministic points, plus light micro-
 * noise) so it reads as a scoop/mound of food sitting on a plate rather than
 * a perfect geometric solid (which read as jewelry/sculpture, not a dish).
 */

const SHAPE_CONFIG = {
  sphere: { height: 1.55, baseRotation: [0, 0, 0] },
  cone: { height: 1.25, baseRotation: [0, 0, 0] },
  dome: { height: 0.95, baseRotation: [0, 0, 0] },
  torus: { height: 0.62, baseRotation: [Math.PI / 2, 0, 0] },
  ring: { height: 0.5, baseRotation: [Math.PI / 2, 0, 0] },
}

// bumpScale keeps displacement proportional to each shape's thinnest
// dimension — a torus/ring's tube is much thinner than a sphere's radius,
// so the same absolute displacement that reads as a gentle mound on a
// sphere would push a torus's tube walls through each other.
const SHAPE_GEOMETRY = {
  torus: { build: () => new THREE.TorusGeometry(0.72, 0.34, 28, 56), bumpScale: 0.34 },
  cone: { build: () => new THREE.ConeGeometry(0.82, 1.15, 40, 12), bumpScale: 0.82 },
  dome: { build: () => new THREE.SphereGeometry(0.95, 40, 28, 0, Math.PI * 2, 0, Math.PI / 2), bumpScale: 0.95 },
  ring: { build: () => new THREE.TorusGeometry(0.8, 0.24, 22, 48), bumpScale: 0.24 },
  sphere: { build: () => new THREE.SphereGeometry(0.85, 40, 30), bumpScale: 0.85 },
}

function baseGeometryFor(shape) {
  return (SHAPE_GEOMETRY[shape] || SHAPE_GEOMETRY.sphere).build()
}

/** Deterministic string -> int hash, used to seed everything below so the same dish always looks the same. */
function hashSeed(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return hash
}

/** Deterministic PRNG (mulberry32) — same seed always produces the same sequence. */
function mulberry32(seed) {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Deforms `geometry` in place into an irregular, food-like mound: a few
 * smooth localized bumps (like a scoop that's been plated by hand) plus a
 * touch of fine surface noise (texture, not spikes). Displacement follows
 * each vertex's own normal, so it works for spheres, cones, and toruses alike.
 */
function makeLumpy(geometry, seedStr, bumpScale) {
  const rand = mulberry32(hashSeed(seedStr) >>> 0)
  const position = geometry.attributes.position
  const normal = geometry.attributes.normal
  const v = new THREE.Vector3()
  const n = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const bumps = Array.from({ length: 4 + Math.floor(rand() * 3) }, () => ({
    theta: rand() * Math.PI * 2,
    phi: rand() * Math.PI,
    strength: (0.075 + rand() * 0.11) * bumpScale,
    falloff: 2 + rand() * 3,
  }))

  // Fine surface ripple, kept as a smooth function of position (not vertex
  // index) so vertices that share a position — a torus/sphere UV seam, a
  // cone's apex — pick up an identical offset instead of tearing apart.
  const rippleFreq = 5 + rand() * 3
  const ripplePhase = new THREE.Vector3(rand(), rand(), rand()).multiplyScalar(Math.PI * 2)
  const rippleAmp = 0.05 * bumpScale

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i)
    n.fromBufferAttribute(normal, i)
    dir.copy(v).normalize()

    let offset = 0
    for (const bump of bumps) {
      const bumpDir = new THREE.Vector3(
        Math.sin(bump.phi) * Math.cos(bump.theta),
        Math.cos(bump.phi),
        Math.sin(bump.phi) * Math.sin(bump.theta),
      )
      const influence = Math.max(0, dir.dot(bumpDir)) ** bump.falloff
      offset += influence * bump.strength
    }

    offset +=
      rippleAmp *
      Math.sin(dir.x * rippleFreq + ripplePhase.x) *
      Math.sin(dir.y * rippleFreq * 1.3 + ripplePhase.y) *
      Math.sin(dir.z * rippleFreq * 0.7 + ripplePhase.z)

    // Cone/sphere poles are several coincident vertices sharing one position
    // but pointing in different directions (needed for smooth shading) — full
    // per-normal displacement there would tear a single tip into a spiky
    // star. Fade displacement out near the central vertical axis instead.
    const radialDist = Math.sqrt(v.x * v.x + v.z * v.z)
    offset *= Math.min(1, radialDist / 0.12)

    v.addScaledVector(n, offset)
    position.setXYZ(i, v.x, v.y, v.z)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function useDishGeometry(shape, seedStr) {
  const geometry = useMemo(() => {
    const geo = baseGeometryFor(shape)
    const bumpScale = (SHAPE_GEOMETRY[shape] || SHAPE_GEOMETRY.sphere).bumpScale
    return makeLumpy(geo, seedStr, bumpScale)
  }, [shape, seedStr])

  useEffect(() => () => geometry.dispose(), [geometry])

  return geometry
}

/** Deterministic (not per-frame-random) spin offset so same-shape dishes don't look identical. */
function hashSpin(seed) {
  const normalized = ((hashSeed(seed) % 360) + 360) % 360
  return (normalized * Math.PI) / 180
}

function ProceduralDish({ shape, accent }) {
  const config = SHAPE_CONFIG[shape] || SHAPE_CONFIG.sphere
  const seedStr = `${shape}-${accent}`
  const geometry = useDishGeometry(shape, seedStr)
  const spin = useMemo(() => hashSpin(seedStr), [seedStr])
  const plateTopY = 0.06
  const meshY = plateTopY + config.height / 2 + 0.04
  const rotation = [config.baseRotation[0], config.baseRotation[1] + spin, config.baseRotation[2]]

  return (
    <mesh geometry={geometry} position={[0, meshY, 0]} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={accent} roughness={0.65} metalness={0} />
    </mesh>
  )
}

// Auto-fit (center + scale-to-1.5-units + rest-on-plate-at-bounding-box-min)
// looks right for a simple convex model like the avocado half. A splayed,
// non-convex model like the peeled orange has its true lowest point out on a
// stray curl of peel, off to the side of the visual mass — grounding on that
// technically-correct but visually-misleading point reads as floating. Rather
// than build general-purpose "resting point" detection for arbitrary meshes,
// nudge those specific known cases down by hand.
const GLTF_REST_NUDGE = {
  '/models/mandarin-orange/MandarinOrange.gltf': -0.32,
}

/** Loads a real glTF model, auto-centered and scaled to sit consistently on the plate. */
function GltfDish({ url }) {
  const { scene } = useGLTF(url)

  const prepared = useMemo(() => {
    const object = scene.clone(true)
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    const box = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    return { object, scale: 1.5 / maxDim, centerX: center.x, centerZ: center.z, minY: box.min.y }
  }, [scene])

  const restY = 0.06 + (GLTF_REST_NUDGE[url] || 0)

  return (
    <group position={[0, restY, 0]} scale={prepared.scale}>
      <primitive object={prepared.object} position={[-prepared.centerX, -prepared.minY, -prepared.centerZ]} />
    </group>
  )
}

function Dish({ shape, accent, gltfUrl }) {
  const proceduralFallback = <ProceduralDish shape={shape} accent={accent} />

  return (
    <group>
      {/* plate */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.3, 1.35, 0.12, 64]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.55} metalness={0.25} />
      </mesh>
      {/* dish — a real model if this item has one, the procedural mound otherwise
          (and as the fallback while a real model is still loading, or if it fails) */}
      {gltfUrl ? (
        <ThreeErrorBoundary fallback={proceduralFallback}>
          <Suspense fallback={proceduralFallback}>
            <GltfDish url={gltfUrl} />
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        proceduralFallback
      )}
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

export function ThreeViewer({
  shape = 'sphere',
  accent = '#d4af37',
  gltfUrl = null,
  fallbackImage,
  fallbackAlt = '',
  autoRotate = true,
  className = '',
}) {
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

            <Dish shape={shape} accent={accent} gltfUrl={gltfUrl} />

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
