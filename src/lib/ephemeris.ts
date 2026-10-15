import { Body, GeoVector, HelioVector, Rotation_EQJ_ECL } from 'astronomy-engine'

export interface Vec3 {
  x: number
  y: number
  z: number
}

/** Speed of light: seconds per AU. */
export const LIGHT_SECONDS_PER_AU = 499.004784

export function toBody(name: string): Body {
  return Body[name as keyof typeof Body]
}

// J2000 mean equator -> J2000 mean ecliptic. A fixed frame, so long orbit
// paths don't drift with precession and JPL small-body elements (also J2000
// ecliptic) line up exactly with the planets.
const R = Rotation_EQJ_ECL().rot

/** EQJ vector (AU) -> scene frame: ecliptic in XZ, ecliptic north = +Y. */
export function eqjToScene(v: Vec3): Vec3 {
  // same convention as astronomy-engine's RotateVector
  const x = R[0][0] * v.x + R[1][0] * v.y + R[2][0] * v.z
  const y = R[0][1] * v.x + R[1][1] * v.y + R[2][1] * v.z
  const z = R[0][2] * v.x + R[1][2] * v.y + R[2][2] * v.z
  return { x, y: z, z: -y }
}

/**
 * Real heliocentric position of a body at `date`, in AU, mapped into a
 * Three.js right-handed, Y-up scene where planetary orbits lie roughly in the
 * XZ plane.
 */
export function helioPositionAu(aeBody: string, date: Date): Vec3 {
  return eqjToScene(HelioVector(toBody(aeBody), date))
}

/** Real geocentric direction of the Moon (unit vector), same scene mapping. */
export function geoMoonDirection(date: Date): Vec3 {
  const v = eqjToScene(GeoVector(Body.Moon, date, false))
  const len = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

/** Spin angle (radians) about the pole for a body at `date`. */
export function spinAngle(
  rotationHours: number,
  date: Date,
  epoch: number,
): number {
  if (!rotationHours) return 0
  const hours = (date.getTime() - epoch) / 3_600_000
  return (hours / rotationHours) * Math.PI * 2
}

/** "12 min 40 s", "1 h 05 min", "23 h 51 min" … for a light-travel time. */
export function formatLightTime(au: number): string {
  const s = au * LIGHT_SECONDS_PER_AU
  if (s < 60) return `${s.toFixed(1)} s`
  if (s < 3600) {
    const m = Math.floor(s / 60)
    return `${m} min ${Math.round(s - m * 60)} s`
  }
  const h = Math.floor(s / 3600)
  const m = Math.round((s - h * 3600) / 60)
  return `${h} h ${String(m).padStart(2, '0')} min`
}
