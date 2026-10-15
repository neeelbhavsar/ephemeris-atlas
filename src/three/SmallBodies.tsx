import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { HALLEY, VOYAGER } from '../data/extras'
import { keplerPositionAu } from '../lib/kepler'
import { helioAu } from '../lib/bodyEphemeris'
import { auToUnits } from '../lib/scale'
import { useSimDate } from '../lib/simTime'
import { reportPosition } from './bodyPositions'
import { bodyHandlers } from './hoverHandlers'
import { getGlowTexture } from './textures'
import BodyMarker from './BodyMarker'
import OrbitPath from './OrbitPath'

/**
 * Halley's Comet on its real retrograde orbit. Its ion tail always points
 * directly away from the Sun and only grows inside a few AU — in 2026 it is
 * out past Neptune, so the tail is gone (try time-travelling to 2061).
 */
function Halley() {
  const dateRef = useSimDate()
  const ref = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Mesh>(null)
  const glow = getGlowTexture()
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const p = keplerPositionAu(HALLEY.elements, dateRef.current)
    g.position.set(auToUnits(p.x), auToUnits(p.y), auToUnits(p.z))
    reportPosition(HALLEY.id, g.position)

    const rAu = Math.hypot(p.x, p.y, p.z)
    const tail = tailRef.current
    if (tail) {
      const len = Math.min(6, 3.5 / (rAu * rAu)) // scene units, ~1/r²
      tail.visible = len > 0.05
      // cone apex (+Y) sits on the nucleus, the wide end streams anti-sunward
      dir.copy(g.position).normalize().negate()
      tail.quaternion.setFromUnitVectors(up, dir)
      dir.negate()
      tail.scale.set(1, len, 1)
      tail.position.copy(dir).multiplyScalar(len / 2)
    }
  })

  return (
    <>
      <OrbitPath id={HALLEY.id} elements={HALLEY.elements} color={HALLEY.color} opacity={0.18} />
      <group ref={ref}>
        <mesh {...bodyHandlers(HALLEY.id)}>
          <icosahedronGeometry args={[0.06, 1]} />
          <meshStandardMaterial color="#8f8a82" roughness={1} flatShading />
        </mesh>
        <sprite scale={0.5}>
          <spriteMaterial
            map={glow}
            color="#bfe6ff"
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <mesh ref={tailRef}>
          <coneGeometry args={[0.25, 1, 24, 1, true]} />
          <meshBasicMaterial
            color="#9fd8ff"
            transparent
            opacity={0.25}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <BodyMarker id={HALLEY.id} name="Halley" color={HALLEY.color} always />
      </group>
    </>
  )
}

/** Voyager 1, ~170 AU out — far beyond the frame of the planets. */
function Voyager() {
  const dateRef = useSimDate()
  const ref = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const p = helioAu(VOYAGER.id, dateRef.current)!
    g.position.set(auToUnits(p.x), auToUnits(p.y), auToUnits(p.z))
    g.lookAt(0, 0, 0) // high-gain antenna points home
    reportPosition(VOYAGER.id, g.position)
  })

  return (
    <group ref={ref}>
      <group scale={0.08} {...bodyHandlers(VOYAGER.id)}>
        {/* high-gain dish */}
        <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.8, 0.25, 0.5, 32, 1, true]} />
          <meshStandardMaterial color="#e9e4d8" side={THREE.DoubleSide} metalness={0.3} roughness={0.5} />
        </mesh>
        {/* bus */}
        <mesh position={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.6, 0.6, 0.5, 10]} />
          <meshStandardMaterial color="#c9a75a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* magnetometer boom */}
        <mesh position={[3, 0, -0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 6, 6]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
      </group>
      <BodyMarker id={VOYAGER.id} name="Voyager 1" color={VOYAGER.color} always />
    </group>
  )
}

export default function SmallBodies() {
  return (
    <>
      <Halley />
      <Voyager />
    </>
  )
}
