import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ASTEROIDS } from '../data/solarSystem'
import { auToUnits } from '../lib/scale'
import { useSimDate, EPOCH } from './SimClock'
import { makeHoverHandlers, infoFromAsteroid } from './hoverHandlers'

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
    // whole belt drifts slowly to hint orbital motion (cheap approximation)
    if (beltRef.current) {
      const days = (dateRef.current.getTime() - EPOCH) / 86_400_000
      beltRef.current.rotation.y = (days / 1600) * Math.PI * 2
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
        <NamedAsteroid key={a.id} asteroid={a} />
      ))}
    </group>
  )
}

function NamedAsteroid({
  asteroid,
}: {
  asteroid: (typeof ASTEROIDS)[number]
}) {
  const dateRef = useSimDate()
  const ref = useRef<THREE.Mesh>(null)
  const r = auToUnits(asteroid.semiMajorAu)
  const radius = Math.max(asteroid.radiusKm * 6e-5 * 6, 0.13)

  useFrame(() => {
    if (!ref.current) return
    const days = (dateRef.current.getTime() - EPOCH) / 86_400_000
    const ang =
      asteroid.phaseDeg * (Math.PI / 180) +
      (days / asteroid.orbitalPeriodDays) * Math.PI * 2
    ref.current.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r)
    ref.current.rotation.y += 0.01
  })

  return (
    <mesh ref={ref} {...makeHoverHandlers(infoFromAsteroid(asteroid))}>
      <icosahedronGeometry args={[radius, 1]} />
      <meshStandardMaterial color={asteroid.color} roughness={1} metalness={0} flatShading />
    </mesh>
  )
}
