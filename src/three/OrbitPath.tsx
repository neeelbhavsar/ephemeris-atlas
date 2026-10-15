import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { auToUnits } from '../lib/scale'
import { helioPositionAu } from '../lib/ephemeris'
import { positionFromAnomaly, type OrbitalElements } from '../lib/kepler'
import { EPOCH } from '../lib/simTime'
import { useStore } from '../store'

/**
 * The body's REAL orbit. Planets: traced by sampling the ephemeris across one
 * full orbital period, using the exact same position math as the renderer, so
 * the planet always rides precisely on this line. Small bodies: the Kepler
 * ellipse from their orbital elements.
 *
 * The focused / selected body's orbit is drawn brighter.
 */
export default function OrbitPath({
  id,
  aeBody,
  periodDays,
  elements,
  color,
  opacity = 0.28,
}: {
  id: string
  aeBody?: string
  periodDays?: number
  elements?: OrbitalElements
  color: string
  opacity?: number
}) {
  const highlighted = useStore((s) => s.focusId === id || s.selectedId === id)

  const points = useMemo(() => {
    const seg = elements ? 512 : 360
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= seg; i++) {
      const p = elements
        ? positionFromAnomaly(elements, (i / seg) * Math.PI * 2)
        : helioPositionAu(aeBody!, new Date(EPOCH + (i / seg) * periodDays! * 86_400_000))
      pts.push(new THREE.Vector3(auToUnits(p.x), auToUnits(p.y), auToUnits(p.z)))
    }
    return pts
  }, [aeBody, periodDays, elements])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={highlighted ? 1.8 : 1}
      transparent
      opacity={highlighted ? Math.min(0.85, opacity * 3) : opacity}
      depthWrite={false}
    />
  )
}
