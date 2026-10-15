import * as THREE from 'three'
import {
  RotateVector,
  Rotation_GAL_EQJ,
  Spherical,
  VectorFromSphere,
} from 'astronomy-engine'
import { eqjToScene } from './ephemeris'

const GAL_EQJ = Rotation_GAL_EQJ()

/**
 * Direction of galactic coordinates (l, b in degrees) in the scene frame
 * (J2000 ecliptic, Y-up), as a unit vector. This is what tilts the Milky Way's
 * disc ~60° to the planets' orbital plane in the Local Group view.
 */
export function galacticDirection(l: number, b: number): THREE.Vector3 {
  const gal = VectorFromSphere(new Spherical(b, l, 1), new Date(0))
  const s = eqjToScene(RotateVector(GAL_EQJ, gal))
  return new THREE.Vector3(s.x, s.y, s.z).normalize()
}

/** Light-years per scene unit in the Local Group view (Milky Way radius ≈ 340 units ≈ 52,850 ly). */
export const LY_PER_GALAXY_UNIT = 155.5
export const AU_PER_LY = 63_241.077

/** Sun's distance from the Galactic Centre, in galaxy scene units (~26,000 ly). */
export const SUN_GC_UNITS = 26_000 / LY_PER_GALAXY_UNIT

/** Galactic Centre, relative to the Sun at the origin. */
export const GALACTIC_CENTRE = galacticDirection(0, 0).multiplyScalar(SUN_GC_UNITS)

/** North Galactic Pole — the Milky Way disc's normal. */
export const GALACTIC_NORTH = galacticDirection(0, 90)
