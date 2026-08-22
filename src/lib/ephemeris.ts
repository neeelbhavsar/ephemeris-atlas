import {
  Body,
  Ecliptic,
  GeoVector,
  HelioVector,
} from 'astronomy-engine'

export interface Vec3 {
  x: number
  y: number
  z: number
}

function toBody(name: string): Body {
  return Body[name as keyof typeof Body]
}

/**
 * Real heliocentric position of a body at `date`, in AU, mapped into a
 * Three.js right-handed, Y-up scene where planetary orbits lie roughly in the
 * XZ plane. Uses the J2000 ecliptic frame so the orbits form a flat disc.
 */
export function helioPositionAu(aeBody: string, date: Date): Vec3 {
  const eqj = HelioVector(toBody(aeBody), date)
  const ecl = Ecliptic(eqj).vec // ecliptic cartesian, AU
  // ecliptic: x -> vernal equinox, y -> in-plane, z -> ecliptic north
  return { x: ecl.x, y: ecl.z, z: -ecl.y }
}

/** Real geocentric direction of the Moon (unit-ish), AU, same scene mapping. */
export function geoMoonDirection(date: Date): Vec3 {
  const g = GeoVector(Body.Moon, date, false)
  const ecl = Ecliptic(g).vec
  const v = { x: ecl.x, y: ecl.z, z: -ecl.y }
  const len = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

/** Live distance from Earth, in AU (0 for Earth itself). */
export function distanceFromEarthAu(aeBody: string, date: Date): number {
  if (aeBody === 'Earth') return 0
  const g = GeoVector(toBody(aeBody), date, false)
  return Math.hypot(g.x, g.y, g.z)
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
