import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { AU_KM } from '../data/solarSystem'
import { GALILEAN_MOONS, type GalileanMoon } from '../data/extras'
import { galileanOffsetsAu } from '../lib/bodyEphemeris'
import { AU_UNITS, radiusToUnits, type ScaleMode } from '../lib/scale'
import { useSimDate } from '../lib/simTime'
import { reportPosition } from './bodyPositions'
import { bodyHandlers } from './hoverHandlers'
import { getSurfaceTexture, SURFACES } from './textures'
import BodyMarker from './BodyMarker'

const JUPITER_RADIUS_KM = 69_911

/**
 * Io, Europa, Ganymede and Callisto in their real current positions around
 * Jupiter (astronomy-engine `JupiterMoons`). In Enlarged mode their distances
 * are compressed (√-scaled) so all four fit next to the enlarged planet; in
 * True-size mode they sit at their real distances.
 */
export default function GalileanMoons({
  parentRadius,
  scaleMode,
}: {
  parentRadius: number
  scaleMode: ScaleMode
}) {
  const dateRef = useSimDate()
  const refs = useRef<(THREE.Group | null)[]>([])
  const world = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const offsets = galileanOffsetsAu(dateRef.current)
    GALILEAN_MOONS.forEach((m, i) => {
      const g = refs.current[i]
      if (!g || !g.parent) return
      const o = offsets[m.id]
      if (scaleMode === 'true') {
        g.position.set(o.x * AU_UNITS, o.y * AU_UNITS, o.z * AU_UNITS)
      } else {
        const au = Math.hypot(o.x, o.y, o.z) || 1
        const rj = (au * AU_KM) / JUPITER_RADIUS_KM
        const r = parentRadius * (1.25 + 0.55 * Math.sqrt(rj))
        g.position.set((o.x / au) * r, (o.y / au) * r, (o.z / au) * r)
      }
      // tidally locked: always the same face toward Jupiter
      g.lookAt(g.parent.getWorldPosition(world))
      reportPosition(m.id, world.copy(g.position).add(g.parent.position))
    })
  })

  return (
    <>
      {GALILEAN_MOONS.map((m, i) => (
        <group key={m.id} ref={(el) => void (refs.current[i] = el)}>
          <MoonSphere moon={m} scaleMode={scaleMode} />
          <BodyMarker
            id={m.id}
            name={m.name}
            color={m.color}
            radius={radiusToUnits(m.radiusKm, 'moon', scaleMode)}
          />
        </group>
      ))}
    </>
  )
}

function MoonSphere({ moon, scaleMode }: { moon: GalileanMoon; scaleMode: ScaleMode }) {
  const map = getSurfaceTexture(moon.id, SURFACES[moon.id])
  const radius = radiusToUnits(moon.radiusKm, 'moon', scaleMode)
  return (
    <mesh {...bodyHandlers(moon.id)}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial map={map} roughness={1} metalness={0} />
    </mesh>
  )
}
