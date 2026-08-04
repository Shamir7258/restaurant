import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Shape/geometry helpers behind the procedural "dish" — a plated mound of
 * food standing in for menu items that don't carry a real glTF model (see
 * ThreeViewer.jsx). Extracted here so any scene (the dish viewer, the Home
 * hero) can generate the same deterministic, food-like geometry.
 */

export const SHAPE_CONFIG = {
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
export const SHAPE_GEOMETRY = {
  torus: { build: () => new THREE.TorusGeometry(0.72, 0.34, 28, 56), bumpScale: 0.34 },
  cone: { build: () => new THREE.ConeGeometry(0.82, 1.15, 40, 12), bumpScale: 0.82 },
  dome: { build: () => new THREE.SphereGeometry(0.95, 40, 28, 0, Math.PI * 2, 0, Math.PI / 2), bumpScale: 0.95 },
  ring: { build: () => new THREE.TorusGeometry(0.8, 0.24, 22, 48), bumpScale: 0.24 },
  sphere: { build: () => new THREE.SphereGeometry(0.85, 40, 30), bumpScale: 0.85 },
}

export function baseGeometryFor(shape) {
  return (SHAPE_GEOMETRY[shape] || SHAPE_GEOMETRY.sphere).build()
}

/** Deterministic string -> int hash, used to seed everything below so the same dish always looks the same. */
export function hashSeed(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return hash
}

/** Deterministic PRNG (mulberry32) — same seed always produces the same sequence. */
export function mulberry32(seed) {
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
export function makeLumpy(geometry, seedStr, bumpScale) {
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

export function useDishGeometry(shape, seedStr) {
  const geometry = useMemo(() => {
    const geo = baseGeometryFor(shape)
    const bumpScale = (SHAPE_GEOMETRY[shape] || SHAPE_GEOMETRY.sphere).bumpScale
    return makeLumpy(geo, seedStr, bumpScale)
  }, [shape, seedStr])

  useEffect(() => () => geometry.dispose(), [geometry])

  return geometry
}

/** Deterministic (not per-frame-random) spin offset so same-shape dishes don't look identical. */
export function hashSpin(seed) {
  const normalized = ((hashSeed(seed) % 360) + 360) % 360
  return (normalized * Math.PI) / 180
}

export function ProceduralDish({ shape, accent }) {
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
