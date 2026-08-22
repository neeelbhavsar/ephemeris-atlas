import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { auToUnits } from '../lib/scale'
import { helioPositionAu } from '../lib/ephemeris'
import { EPOCH } from './SimClock'

/**
 * The body's REAL orbit, traced by sampling the ephemeris across one full
 * orbital period. Because it uses the exact same position math as the planet
 * renderer, the planet always rides precisely on this line — ellipse,
 * eccentricity, inclination and all (a plain circle would leave eccentric
 * orbits like Mercury's visibly off the path).
 */
export default function OrbitPath({
  aeBody,
  periodDays,
  color,
  opacity = 0.3,
}: {
  aeBody: string
  periodDays: number
  color: string
  opacity?: number
}) {
  const points = useMemo(() => {
    const seg = 360
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= seg; i++) {
      const date = new Date(EPOCH + (i / seg) * periodDays * 86_400_000)
      const p = helioPositionAu(aeBody, date)
      pts.push(
        new THREE.Vector3(auToUnits(p.x), auToUnits(p.y), auToUnits(p.z)),
      )
    }
    return pts
  }, [aeBody, periodDays])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  )
}
