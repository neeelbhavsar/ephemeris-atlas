import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import type { Body } from '../data/solarSystem'
import { MOON } from '../data/solarSystem'
import { auToUnits, radiusToUnits } from '../lib/scale'
import {
  helioPositionAu,
  geoMoonDirection,
  spinAngle,
} from '../lib/ephemeris'
import { useStore } from '../store'
import { useSimDate, EPOCH } from './SimClock'
import { hoverHandlers } from './hoverHandlers'
import { reportPosition } from './bodyPositions'

const DEG = Math.PI / 180

function srgb(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function Planet3D({ body }: { body: Body }) {
  const scaleMode = useStore((s) => s.scaleMode)
  const dateRef = useSimDate()

  const groupRef = useRef<THREE.Group>(null)
  const spinRef = useRef<THREE.Mesh>(null)

  const map = srgb(useTexture(body.texture))
  const radius = radiusToUnits(body.radiusKm, body.kind, scaleMode)
  const tilt = body.axialTiltDeg * DEG

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const p = helioPositionAu(body.aeBody!, dateRef.current)
    g.position.set(auToUnits(p.x), auToUnits(p.y), auToUnits(p.z))
    if (spinRef.current) {
      spinRef.current.rotation.y = spinAngle(
        body.rotationHours,
        dateRef.current,
        EPOCH,
      )
    }
    // report live position so the camera tour can follow this body
    reportPosition(body.id, g.position)
  })

  return (
    <group ref={groupRef}>
      {/* tilted equatorial frame (holds spinning body + ring) */}
      <group rotation={[0, 0, tilt]}>
        <mesh ref={spinRef} {...hoverHandlers(body)}>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial map={map} roughness={1} metalness={0} />
        </mesh>
        {body.clouds && <Clouds url={body.clouds} radius={radius} />}
        {body.ring && (
          <PlanetRing
            url={body.ring.texture}
            inner={radius * body.ring.inner}
            outer={radius * body.ring.outer}
          />
        )}
      </group>

      {/* Earth's Moon orbits in the ecliptic plane (untilted frame) */}
      {body.id === 'earth' && <MoonBody parentRadius={radius} scaleMode={scaleMode} />}
    </group>
  )
}

function Clouds({ url, radius }: { url: string; radius: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const map = useTexture(url)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02
  })
  return (
    <mesh ref={ref} scale={1.02}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial
        map={map}
        transparent
        opacity={0.42}
        depthWrite={false}
      />
    </mesh>
  )
}

function PlanetRing({
  url,
  inner,
  outer,
}: {
  url: string
  inner: number
  outer: number
}) {
  const map = useTexture(url)
  // Build a ring whose UVs run radially so the ring texture maps correctly.
  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(inner, outer, 128)
    const pos = g.attributes.position
    const uv = g.attributes.uv
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const r = v.length()
      const t = (r - inner) / (outer - inner)
      uv.setXY(i, t, 0.5)
    }
    return g
  }, [inner, outer])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        map={map}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </mesh>
  )
}

function MoonBody({
  parentRadius,
  scaleMode,
}: {
  parentRadius: number
  scaleMode: 'explore' | 'true'
}) {
  const dateRef = useSimDate()
  const orbitRef = useRef<THREE.Group>(null)
  const spinRef = useRef<THREE.Mesh>(null)
  const map = srgb(useTexture(MOON.texture))
  const radius = Math.max(
    radiusToUnits(MOON.radiusKm, 'moon', scaleMode),
    parentRadius * 0.27,
  )
  // exaggerated but real-direction orbit so the Moon is visible next to Earth
  const orbitR = parentRadius * 2.6 + radius

  useFrame(() => {
    const dir = geoMoonDirection(dateRef.current)
    if (orbitRef.current) {
      orbitRef.current.position.set(
        dir.x * orbitR,
        dir.y * orbitR,
        dir.z * orbitR,
      )
    }
    if (spinRef.current) {
      spinRef.current.rotation.y = spinAngle(
        MOON.rotationHours,
        dateRef.current,
        EPOCH,
      )
    }
  })

  return (
    <group ref={orbitRef}>
      <mesh ref={spinRef} {...hoverHandlers(MOON)}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial map={map} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}
