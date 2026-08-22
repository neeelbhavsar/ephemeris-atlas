import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { MILKY_WAY, NEIGHBOR_GALAXIES, type NeighborGalaxy } from '../data/galaxies'
import { makeHoverHandlers, infoFromGalaxy } from './hoverHandlers'
import { getCircleTexture } from './textures'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SpiralData {
  positions: Float32Array
  colors: Float32Array
}

/**
 * A logarithmic two/three-arm spiral: dense warm bulge in the middle, cooler
 * arm colour outward, with occasional bright blue and pink star-forming
 * sprinkles so it reads like a real galaxy rather than a flat blob.
 */
function buildSpiral(count: number, radius: number, colorHex: string, seed: number): SpiralData {
  const rnd = mulberry32(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const arm = new THREE.Color(colorHex)
  const core = new THREE.Color('#ffdf9e')
  const blue = new THREE.Color('#a9c7ff')
  const pink = new THREE.Color('#ff9ec7')
  const arms = 2
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const t = Math.pow(rnd(), 0.55) // concentrate toward centre
    const r = t * radius
    const armAngle = ((i % arms) / arms) * Math.PI * 2
    const spin = (r / radius) * 4.2 // arm winding
    const spread = (1 - t) * 0.35 + 0.06
    const ang = armAngle + spin + (rnd() - 0.5) * spread
    const jitter = (rnd() - 0.5) * radius * 0.06 * (1 - t) + (rnd() - 0.5) * radius * 0.02
    const rr = r + (rnd() - 0.5) * radius * 0.05
    positions[i * 3] = Math.cos(ang) * rr + jitter
    positions[i * 3 + 1] = (rnd() - 0.5) * radius * 0.05 * (1 - t * 0.7)
    positions[i * 3 + 2] = Math.sin(ang) * rr + jitter

    c.copy(core).lerp(arm, Math.min(1, t * 1.15))
    const roll = rnd()
    if (t > 0.35 && roll > 0.94) c.lerp(blue, 0.7)
    else if (t > 0.35 && roll < 0.05) c.lerp(pink, 0.6)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  return { positions, colors }
}

function Galaxy({
  galaxy,
  count,
  interactive = true,
  spin = 0.02,
}: {
  galaxy: NeighborGalaxy
  count: number
  interactive?: boolean
  spin?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const seed = useMemo(
    () => galaxy.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 7),
    [galaxy.id],
  )
  const { positions, colors } = useMemo(
    () => buildSpiral(count, galaxy.size, galaxy.color, seed),
    [count, galaxy.size, galaxy.color, seed],
  )

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [positions, colors])

  const sprite = getCircleTexture()

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * spin
  })

  const clusters = useMemo(
    () =>
      Array.from({ length: galaxy.clusters }, (_, i) => ({
        // kept well inside the disc so they never fly out of the galaxy
        radius: galaxy.size * Math.min(0.28 + i * 0.11, 0.68),
        phase: (i / Math.max(1, galaxy.clusters)) * Math.PI * 2,
        speed: 0.25 + i * 0.08,
      })),
    [galaxy.clusters, galaxy.size],
  )

  return (
    <group position={galaxy.position}>
      {/* disc tilted so galaxies aren't all edge-on */}
      <group ref={groupRef} rotation={[0.5, 0, 0.2]}>
        <points geometry={geom}>
          <pointsMaterial
            map={sprite}
            size={1.7}
            sizeAttenuation={false}
            vertexColors
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* glowing central bulge (capped small so a nearby galaxy can't
            flood the screen with additive haze) */}
        <Billboard>
          <mesh scale={Math.min(galaxy.size * 0.12, 12)}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={sprite}
              color="#ffe9bf"
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Billboard>

        {/* orbiting star clusters — motion within the galaxy */}
        {clusters.map((cl, i) => (
          <OrbitingCluster
            key={i}
            radius={cl.radius}
            phase={cl.phase}
            speed={cl.speed}
            color={galaxy.color}
            size={galaxy.size * 0.05}
            sprite={sprite}
          />
        ))}
      </group>

      {/* invisible but raycastable hover target */}
      {interactive && (
        <mesh {...makeHoverHandlers(infoFromGalaxy(galaxy))}>
          <sphereGeometry args={[galaxy.size * 0.9, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

function OrbitingCluster({
  radius,
  phase,
  speed,
  color,
  size,
  sprite,
}: {
  radius: number
  phase: number
  speed: number
  color: string
  size: number
  sprite: THREE.Texture
}) {
  const ref = useRef<THREE.Group>(null)
  const tRef = useRef(phase)
  useFrame((_, dt) => {
    tRef.current += dt * speed * 0.3
    if (ref.current) {
      ref.current.position.set(
        Math.cos(tRef.current) * radius,
        0,
        Math.sin(tRef.current) * radius,
      )
    }
  })
  return (
    <group ref={ref}>
      <Billboard>
        <mesh scale={size}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={sprite}
            color={color}
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>
    </group>
  )
}

export default function NeighborGalaxies() {
  return (
    <group>
      <Galaxy galaxy={MILKY_WAY} count={14000} spin={0.008} />
      {NEIGHBOR_GALAXIES.map((g) => (
        <Galaxy key={g.id} galaxy={g} count={6000} />
      ))}
    </group>
  )
}
