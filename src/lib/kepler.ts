import type { Vec3 } from './ephemeris'

/**
 * Classical osculating orbital elements (J2000 mean ecliptic & equinox), as
 * published by the JPL Small-Body Database. Angles in degrees.
 */
export interface OrbitalElements {
  /** semi-major axis, AU */
  a: number
  /** eccentricity */
  e: number
  /** inclination */
  i: number
  /** longitude of ascending node (Ω) */
  om: number
  /** argument of perihelion (ω) */
  w: number
  /** mean anomaly at epoch */
  ma: number
  /** mean motion, degrees/day */
  n: number
  /** epoch of the elements, Julian Date (TDB) */
  epochJd: number
}

const DEG = Math.PI / 180

export function julianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5
}

export function orbitalPeriodDays(el: OrbitalElements): number {
  return 360 / el.n
}

/** Solve Kepler's equation M = E − e·sin E (elliptic orbits) by Newton's method. */
function eccentricAnomaly(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI
  for (let k = 0; k < 50; k++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < 1e-12) break
  }
  return E
}

/**
 * Heliocentric position for a given eccentric anomaly, in AU, mapped into the
 * scene frame (Y-up, ecliptic in the XZ plane) — same mapping as the planets.
 */
export function positionFromAnomaly(el: OrbitalElements, E: number): Vec3 {
  const xv = el.a * (Math.cos(E) - el.e)
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E)
  const cO = Math.cos(el.om * DEG)
  const sO = Math.sin(el.om * DEG)
  const cw = Math.cos(el.w * DEG)
  const sw = Math.sin(el.w * DEG)
  const ci = Math.cos(el.i * DEG)
  const si = Math.sin(el.i * DEG)
  // perifocal -> J2000 ecliptic
  const x = (cO * cw - sO * sw * ci) * xv + (-cO * sw - sO * cw * ci) * yv
  const y = (sO * cw + cO * sw * ci) * xv + (-sO * sw + cO * cw * ci) * yv
  const z = sw * si * xv + cw * si * yv
  return { x, y: z, z: -y }
}

/** Real heliocentric position at `date` from the orbital elements, AU. */
export function keplerPositionAu(el: OrbitalElements, date: Date): Vec3 {
  const days = julianDate(date) - el.epochJd
  let M = (el.ma + el.n * days) % 360
  if (M < 0) M += 360
  return positionFromAnomaly(el, eccentricAnomaly(M * DEG, el.e))
}
