import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ASTEROIDS, type Asteroid } from '../data/solarSystem'
import { auToUnits, radiusToUnits } from '../lib/scale'
import { keplerPositionAu } from '../lib/kepler'
import { spinAngle } from '../lib/ephemeris'
import { useStore } from '../store'
import { useSimDate, EPOCH, daysSinceEpoch } from '../lib/simTime'
import { bodyHandlers } from './hoverHandlers'
import { reportPosition } from './bodyPositions'
import BodyMarker from './BodyMarker'
import OrbitPath from './OrbitPath'

const BELT_COUNT = 1400
const BELT_INNER = 2.1
const BELT_OUTER = 3.3

/** A dense instanced ring of debris plus three named, hoverable asteroids. */
export default function AsteroidBelt() {
  const dateRef = useSimDate()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const beltRef = useRef<THREE.Group>(null)

  const instances = useMemo(() => {
    const arr: { pos: THREE.Vector3; scale: number; rot: THREE.Euler }[] = []
    // deterministic pseudo-random so it's stable across renders
    let seed = 1337
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < BELT_COUNT; i++) {
      const a = BELT_INNER + rnd() * (BELT_OUTER - BELT_INNER)
      const ang = rnd() * Math.PI * 2
      const r = auToUnits(a)
      const y = (rnd() - 0.5) * auToUnits(0.12)
      arr.push({
        pos: new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r),
        scale: 0.02 + rnd() * 0.06,
        rot: new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6),
      })
    }
    return arr
  }, [])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const s = new THREE.Vector3()
    instances.forEach((inst, i) => {
      q.setFromEuler(inst.rot)
      s.setScalar(inst.scale)
      m.compose(inst.pos, q, s)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [instances])

  useFrame(() => {
    // whole belt drifts slowly to hint orbital motion (cheap approximation —
    // the named asteroids below are on their real orbits)
    if (beltRef.current) {
      beltRef.current.rotation.y = (daysSinceEpoch(dateRef.current) / 1600) * Math.PI * 2
    }
  })

  return (
    <group>
      <group ref={beltRef}>
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, BELT_COUNT]}
          frustumCulled={false}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8a8072" roughness={1} metalness={0} />
        </instancedMesh>
      </group>

      {ASTEROIDS.map((a) => (
        <group key={a.id}>
          <OrbitPath id={a.id} elements={a.elements} color={a.color} opacity={0.12} />
          <NamedAsteroid asteroid={a} />
        </group>
      ))}
    </group>
  )
}

function NamedAsteroid({ asteroid }: { asteroid: Asteroid }) {
  const dateRef = useSimDate()
  const scaleMode = useStore((s) => s.scaleMode)
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const radius = radiusToUnits(asteroid.radiusKm, 'asteroid', scaleMode)

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const p = keplerPositionAu(asteroid.elements, dateRef.current)
    g.position.set(auToUnits(p.x), auToUnits(p.y), auToUnits(p.z))
    reportPosition(asteroid.id, g.position)
    if (meshRef.current) {
      meshRef.current.rotation.y = spinAngle(asteroid.rotationHours, dateRef.current, EPOCH)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} {...bodyHandlers(asteroid.id)}>
        <icosahedronGeometry args={[radius, 1]} />
        <meshStandardMaterial color={asteroid.color} roughness={1} metalness={0} flatShading />
      </mesh>
      <BodyMarker id={asteroid.id} name={asteroid.name} color={asteroid.color} radius={radius} />
    </group>
  )
}
