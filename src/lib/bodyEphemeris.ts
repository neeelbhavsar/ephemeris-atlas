import { Body, HelioVector, JupiterMoons } from 'astronomy-engine'
import { ALL_PLANETS_AND_SUN, ASTEROIDS, MOON } from '../data/solarSystem'
import { GALILEAN_MOONS, HALLEY, JWST, VOYAGER } from '../data/extras'
import { eqjToScene, helioPositionAu, type Vec3 } from './ephemeris'
import { keplerPositionAu } from './kepler'

const DEG = Math.PI / 180

const AE_BODY = new Map<string, string>()
for (const b of [...ALL_PLANETS_AND_SUN, MOON]) if (b.aeBody) AE_BODY.set(b.id, b.aeBody)

const ELEMENTS = new Map(ASTEROIDS.map((a) => [a.id, a.elements]))
ELEMENTS.set(HALLEY.id, HALLEY.elements)

// Voyager 1's outbound direction (J2000 equatorial RA/Dec -> scene frame)
const VOYAGER_DIR = (() => {
  const ra = VOYAGER.raDeg * DEG
  const dec = VOYAGER.decDeg * DEG
  const v = eqjToScene({
    x: Math.cos(dec) * Math.cos(ra),
    y: Math.cos(dec) * Math.sin(ra),
    z: Math.sin(dec),
  })
  const len = Math.hypot(v.x, v.y, v.z)
  return { x: v.x / len, y: v.y / len, z: v.z / len }
})()

export function voyagerDistanceAu(date: Date): number {
  const years = (date.getTime() - VOYAGER.refDateMs) / (365.25 * 86_400_000)
  return Math.max(1, VOYAGER.refDistAu + years * VOYAGER.auPerYear)
}

function scale(v: Vec3, k: number): Vec3 {
  return { x: v.x * k, y: v.y * k, z: v.z * k }
}

/** Jupiter-centred positions of the Galilean moons, AU, scene frame. */
export function galileanOffsetsAu(date: Date): Record<string, Vec3> {
  const m = JupiterMoons(date)
  return {
    io: eqjToScene(m.io),
    europa: eqjToScene(m.europa),
    ganymede: eqjToScene(m.ganymede),
    callisto: eqjToScene(m.callisto),
  }
}

/** True heliocentric position (AU, scene frame) of any body in the atlas, or null. */
export function helioAu(id: string, date: Date): Vec3 | null {
  if (id === 'sun') return { x: 0, y: 0, z: 0 }
  const ae = AE_BODY.get(id)
  if (ae) return helioPositionAu(ae, date)
  const el = ELEMENTS.get(id)
  if (el) return keplerPositionAu(el, date)
  if (GALILEAN_MOONS.some((m) => m.id === id)) {
    const j = helioPositionAu('Jupiter', date)
    const o = galileanOffsetsAu(date)[id]
    return { x: j.x + o.x, y: j.y + o.y, z: j.z + o.z }
  }
  if (id === VOYAGER.id) return scale(VOYAGER_DIR, voyagerDistanceAu(date))
  if (id === JWST.id) {
    // L2: along the Sun→Earth line, 0.01 AU beyond Earth
    const e = eqjToScene(HelioVector(Body.Earth, date))
    const len = Math.hypot(e.x, e.y, e.z)
    return scale(e, (len + JWST.l2Au) / len)
  }
  return null
}

/** Live distance from Earth in AU (null when not applicable, e.g. galaxies). */
export function distanceFromEarthAu(id: string, date: Date): number | null {
  if (id === 'earth') return null
  const p = helioAu(id, date)
  if (!p) return null
  const e = helioPositionAu('Earth', date)
  return Math.hypot(p.x - e.x, p.y - e.y, p.z - e.z)
}
