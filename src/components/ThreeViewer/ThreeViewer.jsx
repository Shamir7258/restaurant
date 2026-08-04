import { Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, MeshReflectorMaterial, useGLTF } from '@react-three/drei'
import { EffectComposer, DepthOfField } from '@react-three/postprocessing'
import { OptimizedImage } from '../ui'
import { useTheme } from '../../theme/ThemeProvider'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { ProceduralDish, hashSeed, mulberry32 } from '../../three/proceduralDish'
import { hasWebGL, ThreeErrorBoundary } from '../../three/webgl'
import styles from './ThreeViewer.module.css'

// Categories where a rising-steam wisp would read as absurd (iced drinks, chilled desserts).
const NO_STEAM_CATEGORIES = new Set(['Desserts', 'Beverages'])
// A cold/cured dish can still land in a normally-hot category (e.g. ceviche and
// tartare are both "Appetizers") — catch those by name rather than category alone.
const COLD_DISH_KEYWORDS = ['ceviche', 'tartare', 'carpaccio', 'sashimi', 'chilled', 'salad']

/**
 * A handful of dishes carry a real glTF model (see public/models/ — each
 * authored from scratch in Blender, scripted headlessly via bpy, composed
 * of simple primitives + named PBR materials per component so the export
 * stays lightweight — no baked textures to fetch). Every other dish falls
 * back to a stylized procedural "dish" (see src/three/proceduralDish.js) —
 * no model exists for every possible menu item, so each item's shape/accent
 * from menu.json instead drives a generated still-life (plate + a geometry
 * standing in for the dish) lit with an HDRI environment. Self-contained:
 * nothing to fetch, nothing that can 404.
 */

// Auto-fit (center + scale-to-1.5-units + rest-on-plate-at-bounding-box-min)
// looks right for most models. A splayed, non-convex composition can have its
// true lowest point off to the side of the visual mass — grounding on that
// technically-correct but visually-misleading point reads as floating. Rather
// than build general-purpose "resting point" detection for arbitrary meshes,
// nudge those specific known cases down by hand as they come up.
const GLTF_REST_NUDGE = {}

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

/** Soft radial-gradient billboard, generated once on a canvas — gives steam a wispy falloff instead of a solid ball's hard edge. */
function useSoftParticleTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,0.85)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

/** A handful of soft, rising wisps — each loops up and fades rather than needing a real particle system. */
function Steam({ seed }) {
  const texture = useSoftParticleTexture()
  const rand = useMemo(() => mulberry32(hashSeed(seed) >>> 0), [seed])
  const wisps = useMemo(
    () =>
      Array.from({ length: 3 }, () => ({
        x: (rand() - 0.5) * 0.3,
        z: (rand() - 0.5) * 0.3,
        speed: 0.22 + rand() * 0.1,
        phase: rand() * 10,
        drift: (rand() - 0.5) * 0.2,
      })),
    [rand],
  )
  const refs = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    wisps.forEach((w, i) => {
      const sprite = refs.current[i]
      if (!sprite) return
      const progress = ((t * w.speed + w.phase) % 1.6) / 1.6
      sprite.position.set(w.x + Math.sin(t * 0.6 + w.phase) * w.drift * progress, 0.36 + progress * 0.3, w.z)
      sprite.scale.setScalar(0.1 + progress * 0.16)
      sprite.material.opacity = Math.sin(progress * Math.PI) * 0.09
    })
  })

  return (
    <>
      {wisps.map((w, i) => (
        <sprite key={i} ref={(el) => (refs.current[i] = el)}>
          <spriteMaterial map={texture} color="#fff8ec" transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </>
  )
}

/** A couple of small herb-leaf flecks, gently bobbing — plating garnish rather than the dish itself. */
function FloatingGarnish({ seed, reducedMotion }) {
  const rand = useMemo(() => mulberry32((hashSeed(seed) >>> 0) + 7), [seed])
  const leaves = useMemo(
    () =>
      Array.from({ length: 3 }, () => ({
        angle: rand() * Math.PI * 2,
        radius: 0.75 + rand() * 0.35,
        height: 0.35 + rand() * 0.3,
        speed: 0.3 + rand() * 0.2,
        phase: rand() * 10,
        spin: rand() * Math.PI,
      })),
    [rand],
  )
  const refs = useRef([])

  useFrame((state) => {
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    leaves.forEach((leaf, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      mesh.position.set(Math.cos(leaf.angle) * leaf.radius, leaf.height + Math.sin(t * leaf.speed + leaf.phase) * 0.05, Math.sin(leaf.angle) * leaf.radius)
      mesh.rotation.set(Math.PI / 2, leaf.spin + t * 0.15, 0)
    })
  })

  return (
    <>
      {leaves.map((leaf, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} castShadow>
          <circleGeometry args={[0.06, 6]} />
          <meshStandardMaterial color="#4a7a3f" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

/** Springs the dish in from a slightly smaller/lower rest on mount — a settle, not a fly-in. */
function MountSpring({ children, disabled }) {
  const groupRef = useRef(null)
  const start = useRef(null)

  useFrame((state) => {
    if (disabled || !groupRef.current) return
    if (start.current === null) start.current = state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - start.current
    const t = Math.min(elapsed / 0.9, 1)
    if (t >= 1) {
      groupRef.current.scale.setScalar(1)
      return
    }
    // easeOutBack — settles with a touch of overshoot, like a plate set down by hand.
    const c1 = 1.4
    const c3 = c1 + 1
    const eased = 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
    groupRef.current.scale.setScalar(0.82 + eased * 0.18)
  })

  return (
    <group ref={groupRef} scale={disabled ? 1 : 0.82}>
      {children}
    </group>
  )
}

function Dish({ shape, accent, gltfUrl, seed, showSteam, reducedMotion }) {
  const proceduralFallback = <ProceduralDish shape={shape} accent={accent} />

  return (
    <MountSpring disabled={reducedMotion}>
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
        <FloatingGarnish seed={seed} reducedMotion={reducedMotion} />
        {showSteam && !reducedMotion && <Steam seed={seed} />}
      </group>
    </MountSpring>
  )
}

export function ThreeViewer({
  shape = 'sphere',
  accent = '#d4af37',
  gltfUrl = null,
  category = null,
  dishId = null,
  fallbackImage,
  fallbackAlt = '',
  autoRotate = true,
  className = '',
}) {
  const { prefersReducedMotion } = useTheme()
  const isDesktop = useIsDesktop()
  const [webglOk] = useState(() => hasWebGL())
  const seed = `${dishId ?? ''}-${shape}-${accent}`
  const nameLower = fallbackAlt.toLowerCase()
  const isColdDish = COLD_DISH_KEYWORDS.some((word) => nameLower.includes(word))
  const showSteam = !isColdDish && (category ? !NO_STEAM_CATEGORIES.has(category) : true)

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
            <pointLight position={[0, 1.9, -2.6]} intensity={0.55} color="#bcd4ff" />

            <Dish shape={shape} accent={accent} gltfUrl={gltfUrl} seed={seed} showSteam={showSteam} reducedMotion={prefersReducedMotion} />

            {isDesktop && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
                <planeGeometry args={[8, 8]} />
                <MeshReflectorMaterial
                  blur={[300, 100]}
                  resolution={512}
                  mixBlur={1}
                  mixStrength={25}
                  roughness={1}
                  depthScale={1}
                  minDepthThreshold={0.4}
                  maxDepthThreshold={1.2}
                  color="#0c0c0c"
                  metalness={0.4}
                  mirror={0.25}
                />
              </mesh>
            )}

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

            {isDesktop && (
              <EffectComposer>
                <DepthOfField focusDistance={0.004} focalLength={0.02} bokehScale={0.7} height={480} />
              </EffectComposer>
            )}
          </Canvas>
        </div>
      </ThreeErrorBoundary>
    </div>
  )
}

export default ThreeViewer
