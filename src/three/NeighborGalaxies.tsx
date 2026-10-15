import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { MILKY_WAY, type NeighborGalaxy } from '../data/galaxies'
import { GALACTIC_CENTRE, GALACTIC_NORTH } from '../lib/galactic'
import { GALAXY_LAYOUT, neighbourQuaternion } from './galaxyLayout'
import { useStore } from '../store'
import { bodyHandlers } from './hoverHandlers'
import { reportPosition } from './bodyPositions'
import { getCircleTexture, getGlowTexture } from './textures'
import { tourState } from './tourState'
import { animDelta } from './anim'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface GalaxyCloud {
  stars: { positions: Float32Array; colors: Float32Array }
  dust: { positions: Float32Array; colors: Float32Array }
}

interface BuildOptions {
  count: number
  radius: number
  color: string
  seed: number
  shape: NeighborGalaxy['shape']
  /** rotation of the arm pattern about the disc normal, radians */
  angleOffset?: number
}

const ARM_PITCH = THREE.MathUtils.degToRad(13)
const ARM_R0 = 0.12 // arms start just outside the bulge, × radius
const ARMS = [
  { base: 0, weight: 0.32 },
  { base: Math.PI * 0.5, weight: 0.18 }, // minor arm — the Sun sits on this one
  { base: Math.PI, weight: 0.32 },
  { base: Math.PI * 1.5, weight: 0.18 },
]

/** Log-spiral arm angle at radius `r` (fraction of disc radius). */
function armAngle(base: number, r: number) {
  return base + Math.log(Math.max(r, ARM_R0) / ARM_R0) / Math.tan(ARM_PITCH)
}

function pickArm(u: number) {
  let acc = 0
  for (const a of ARMS) {
    acc += a.weight
    if (u <= acc) return a
  }
  return ARMS[0]
}

/**
 * Point-cloud galaxy. Spirals get a dense warm bulge, an optional bar, four
 * wide log-spiral arms (two major, two minor) dotted with blue young stars and
 * pink HII regions, a diffuse disc, and dark dust lanes hugging the inner edge
 * of each arm. Irregulars are clumpy, elongated star clouds.
 */
function buildGalaxy(o: BuildOptions): GalaxyCloud {
  const rnd = mulberry32(o.seed)
  const gauss = () => {
    const u = Math.max(rnd(), 1e-9)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
  }
  const R = o.radius
  const off = o.angleOffset ?? 0
  const pos: number[] = []
  const col: number[] = []
  const dPos: number[] = []
  const dCol: number[] = []

  const tint = new THREE.Color(o.color)
  const core = new THREE.Color('#ffd9a0')
  const disc = new THREE.Color('#dfe6ff').lerp(tint, 0.35)
  const blue = new THREE.Color('#9fbfff')
  const pink = new THREE.Color('#ff8fbf')
  const dust = new THREE.Color('#140b06')
  const c = new THREE.Color()

  const push = (x: number, y: number, z: number, color: THREE.Color, k = 1) => {
    pos.push(x, y, z)
    col.push(color.r * k, color.g * k, color.b * k)
  }

  if (o.shape === 'irregular') {
    const clumps = Array.from({ length: 7 }, () => ({
      x: gauss() * R * 0.4,
      z: gauss() * R * 0.18,
      s: R * (0.08 + rnd() * 0.12),
    }))
    for (let i = 0; i < o.count; i++) {
      let x: number
      let z: number
      if (rnd() < 0.55) {
        const cl = clumps[Math.floor(rnd() * clumps.length)]
        x = cl.x + gauss() * cl.s
        z = cl.z + gauss() * cl.s
      } else {
        x = gauss() * R * 0.42
        z = gauss() * R * 0.17
      }
      const y = gauss() * R * 0.06
      c.copy(disc).lerp(core, Math.max(0, 0.6 - Math.hypot(x, z) / R))
      const roll = rnd()
      if (roll > 0.93) c.lerp(blue, 0.7)
      else if (roll < 0.05) c.lerp(pink, 0.75)
      push(x, y, z, c)
    }
    return {
      stars: { positions: new Float32Array(pos), colors: new Float32Array(col) },
      dust: { positions: new Float32Array(0), colors: new Float32Array(0) },
    }
  }

  const nBulge = Math.floor(o.count * 0.24)
  const nBar = o.shape === 'barred' ? Math.floor(o.count * 0.07) : 0
  const nDisc = Math.floor(o.count * 0.14)
  const nArms = o.count - nBulge - nBar - nDisc

  // bulge: dense, warm, slightly flattened
  for (let i = 0; i < nBulge; i++) {
    const r = Math.abs(gauss()) * R * 0.09
    const th = rnd() * Math.PI * 2
    const ph = Math.acos(2 * rnd() - 1)
    c.copy(core).lerp(disc, Math.min(1, r / (R * 0.25)) * 0.4)
    push(
      r * Math.sin(ph) * Math.cos(th),
      r * Math.cos(ph) * 0.55,
      r * Math.sin(ph) * Math.sin(th),
      c,
      1.15,
    )
  }
  // bar
  for (let i = 0; i < nBar; i++) {
    const t = gauss() * R * 0.13
    const w = gauss() * R * 0.035
    const a = off + Math.PI * 0.25
    push(
      Math.cos(a) * t - Math.sin(a) * w,
      gauss() * R * 0.015,
      Math.sin(a) * t + Math.cos(a) * w,
      core,
      0.95,
    )
  }
  // diffuse exponential disc between the arms
  for (let i = 0; i < nDisc; i++) {
    const r = Math.min(R, -Math.log(Math.max(rnd(), 1e-6)) * R * 0.3)
    const a = rnd() * Math.PI * 2
    c.copy(disc).lerp(core, Math.max(0, 0.5 - r / R))
    push(Math.cos(a) * r, gauss() * R * 0.012, Math.sin(a) * r, c, 0.55)
  }
  // arms (+ dust on their inner edge)
  for (let i = 0; i < nArms; i++) {
    const arm = pickArm(rnd())
    const rf = ARM_R0 + Math.pow(rnd(), 0.85) * (1 - ARM_R0)
    const spread = 0.22 + 0.12 * (1 - rf) // wide, softer arms
    const a = armAngle(arm.base, rf) + off + gauss() * spread
    const r = (rf + gauss() * 0.025) * R
    const y = gauss() * R * 0.012 * (1.4 - rf)
    c.copy(disc).lerp(core, Math.max(0, 0.45 - rf))
    const roll = rnd()
    if (roll > 0.9) c.lerp(blue, 0.75)
    else if (roll < 0.045) c.lerp(pink, 0.8)
    push(Math.cos(a) * r, y, Math.sin(a) * r, c, arm.weight > 0.2 ? 1 : 0.8)

    // dust lane: trails just inside the arm crest
    if (rf > 0.18 && rf < 0.85 && rnd() < 0.22) {
      const da = armAngle(arm.base, rf) + off - 0.16 + gauss() * 0.05
      const dr = (rf + gauss() * 0.012) * R
      dPos.push(Math.cos(da) * dr, gauss() * R * 0.004, Math.sin(da) * dr)
      dCol.push(dust.r, dust.g, dust.b)
    }
  }

  return {
    stars: { positions: new Float32Array(pos), colors: new Float32Array(col) },
    dust: { positions: new Float32Array(dPos), colors: new Float32Array(dCol) },
  }
}

function makeGeometry(d: { positions: Float32Array; colors: Float32Array }) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(d.positions, 3))
  g.setAttribute('color', new THREE.BufferAttribute(d.colors, 3))
  return g
}

/** Where the Sun sits in the Milky Way disc's local frame. */
const MW_QUAT = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 1, 0),
  GALACTIC_NORTH,
)
const MW_SUN_OFFSET = (() => {
  // align the minor arm so it passes through the Sun's position
  const sunLocal = GALACTIC_CENTRE.clone().negate().applyQuaternion(MW_QUAT.clone().invert())
  const rf = Math.hypot(sunLocal.x, sunLocal.z) / MILKY_WAY.size
  return Math.atan2(sunLocal.z, sunLocal.x) - armAngle(ARMS[1].base, rf)
})()

const HDR_CORE = new THREE.Color('#ffe1b0').multiplyScalar(1.7)

function Galaxy({
  galaxy,
  position,
  count,
}: {
  galaxy: NeighborGalaxy
  position: THREE.Vector3
  count: number
}) {
  const spinRef = useRef<THREE.Group>(null)
  const isMilkyWay = galaxy.id === 'milkyway'
  const interactive = useStore((s) => s.inGalaxyView)

  const seed = useMemo(
    () => galaxy.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 7),
    [galaxy.id],
  )
  const cloud = useMemo(
    () =>
      buildGalaxy({
        count,
        radius: galaxy.size,
        color: galaxy.color,
        seed,
        shape: galaxy.shape,
        angleOffset: isMilkyWay ? MW_SUN_OFFSET : 0,
      }),
    [count, galaxy, seed, isMilkyWay],
  )
  const starGeom = useMemo(() => makeGeometry(cloud.stars), [cloud])
  const dustGeom = useMemo(() => makeGeometry(cloud.dust), [cloud])
  useEffect(
    () => () => {
      starGeom.dispose()
      dustGeom.dispose()
    },
    [starGeom, dustGeom],
  )

  const sprite = getCircleTexture()
  const glow = getGlowTexture()
  const starMat = useRef<THREE.PointsMaterial>(null)
  const dustMat = useRef<THREE.PointsMaterial>(null)
  const coreMat = useRef<THREE.MeshBasicMaterial>(null)

  const quaternion = useMemo(
    () => (isMilkyWay ? MW_QUAT : neighbourQuaternion(galaxy.inclination, galaxy.pa)),
    [isMilkyWay, galaxy.inclination, galaxy.pa],
  )

  useEffect(() => {
    reportPosition(galaxy.id, position, false)
  }, [galaxy.id, position])

  useFrame((_, dt) => {
    // the Milky Way holds still so the Sun stays on its arm; neighbours turn slowly
    if (spinRef.current && !isMilkyWay) spinRef.current.rotation.y += animDelta(dt) * 0.01
    const fade = tourState.galaxyBlend
    if (starMat.current) starMat.current.opacity = 0.95 * fade
    if (dustMat.current) dustMat.current.opacity = 0.6 * fade
    if (coreMat.current) coreMat.current.opacity = 0.6 * fade
  })

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={spinRef}>
        <points geometry={starGeom}>
          <pointsMaterial
            ref={starMat}
            map={sprite}
            size={isMilkyWay ? 1.9 : 1.6}
            sizeAttenuation={false}
            vertexColors
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        {cloud.dust.positions.length > 0 && (
          <points geometry={dustGeom} renderOrder={2}>
            <pointsMaterial
              ref={dustMat}
              map={sprite}
              size={3.2}
              sizeAttenuation={false}
              vertexColors
              transparent
              depthWrite={false}
            />
          </points>
        )}

        {/* HDR core glow — picked up by bloom */}
        <Billboard>
          <mesh scale={galaxy.size * (galaxy.shape === 'irregular' ? 0.22 : 0.3)}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              ref={coreMat}
              map={glow}
              color={HDR_CORE}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </group>

      {/* invisible but raycastable target (only while in the galaxy view) */}
      {interactive && (
        <mesh {...bodyHandlers(galaxy.id)}>
          <sphereGeometry args={[galaxy.size * 0.8, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

const COUNTS: Record<string, number> = {
  milkyway: 32000,
  andromeda: 16000,
  triangulum: 7000,
  lmc: 4500,
  smc: 2800,
}

/** Only rendered while flying out to / sitting at the Local Group stop. */
export default function NeighborGalaxies() {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.visible = tourState.galaxyBlend > 0.001
  })
  return (
    <group ref={ref} visible={false}>
      {GALAXY_LAYOUT.map(({ galaxy, position }) => (
        <Galaxy key={galaxy.id} galaxy={galaxy} position={position} count={COUNTS[galaxy.id] ?? 4000} />
      ))}
    </group>
  )
}
