import * as THREE from 'three'
import { MILKY_WAY, NEIGHBOR_GALAXIES } from '../data/galaxies'
import { GALACTIC_CENTRE, GALACTIC_NORTH, galacticDirection } from '../lib/galactic'

/** A camera pose: look at `target` from `dist` along unit vector `dir`. */
export interface Pose {
  target: THREE.Vector3
  dir: THREE.Vector3
  dist: number
}

/**
 * World positions of the Local Group galaxies (Sun at the origin). The Milky
 * Way's centre is placed in its real direction and distance; neighbours sit in
 * their true sky directions at compressed distances.
 */
export const GALAXY_LAYOUT = [MILKY_WAY, ...NEIGHBOR_GALAXIES].map((g) => ({
  galaxy: g,
  position:
    g.id === 'milkyway'
      ? GALACTIC_CENTRE.clone()
      : galacticDirection(g.l, g.b).multiplyScalar(g.sceneDist),
}))

/**
 * Framing for the Local Group. Searches view directions for the one that fits
 * every galaxy tightest at the current aspect ratio (so portrait phones get
 * their own layout) while keeping the Milky Way's disc fairly face-on.
 */
export function galaxyPose(aspect: number, vfovDeg: number, out: Pose): Pose {
  const tanV = Math.tan(THREE.MathUtils.degToRad(vfovDeg) / 2)
  const tanH = tanV * aspect
  const centre = new THREE.Vector3()
  for (const { position } of GALAXY_LAYOUT) centre.add(position)
  centre.divideScalar(GALAXY_LAYOUT.length)

  const up = new THREE.Vector3(0, 1, 0)
  const d = new THREE.Vector3()
  const right = new THREE.Vector3()
  const camUp = new THREE.Vector3()
  const rel = new THREE.Vector3()
  let best = Infinity
  const N = 1200
  for (let k = 0; k < N; k++) {
    // Fibonacci sphere of candidate directions
    const y = 1 - (2 * (k + 0.5)) / N
    const r = Math.sqrt(1 - y * y)
    const phi = k * Math.PI * (3 - Math.sqrt(5))
    d.set(Math.cos(phi) * r, y, Math.sin(phi) * r)
    const faceOn = Math.abs(d.dot(GALACTIC_NORTH))
    if (faceOn < 0.5 || Math.abs(d.y) > 0.97) continue
    right.crossVectors(up, d).normalize()
    camUp.crossVectors(d, right)
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const { galaxy, position } of GALAXY_LAYOUT) {
      rel.subVectors(position, centre)
      const x = rel.dot(right)
      const yy = rel.dot(camUp)
      const g = galaxy.size * 0.9
      minX = Math.min(minX, x - g)
      maxX = Math.max(maxX, x + g)
      minY = Math.min(minY, yy - g)
      maxY = Math.max(maxY, yy + g)
    }
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    // perspective-aware: galaxies nearer the camera need more room
    let dist = 0
    for (const { galaxy, position } of GALAXY_LAYOUT) {
      rel.subVectors(position, centre)
      const z = rel.dot(d) // towards the camera
      const g = galaxy.size * 0.9
      dist = Math.max(
        dist,
        z + (Math.abs(rel.dot(right) - cx) + g) / tanH,
        z + (Math.abs(rel.dot(camUp) - cy) + g) / tanV,
      )
    }
    const score = dist * (1 + 0.6 * (1 - faceOn))
    if (score < best) {
      best = score
      out.dir.copy(d)
      out.target.copy(centre).addScaledVector(right, cx).addScaledVector(camUp, cy)
      // margin for the HUD (more on phones, where the UI takes more room)
      out.dist = dist * (aspect < 1 ? 1.3 : 1.12)
    }
  }
  // nudge the view so the scene sits a little above the bottom captions
  right.crossVectors(up, out.dir).normalize()
  camUp.crossVectors(out.dir, right)
  out.target.addScaledVector(camUp, -0.08 * out.dist * tanV)
  return out
}

/** Default (16:10) Local Group view direction — neighbours are inclined relative to it. */
const DEFAULT_VIEW = galaxyPose(1.6, 55, {
  target: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  dist: 1,
}).dir.clone()

/** Disc orientation for a neighbour galaxy from its inclination / position angle to the default view. */
export function neighbourQuaternion(inclinationDeg: number, paDeg: number): THREE.Quaternion {
  const up = new THREE.Vector3(0, 1, 0)
  const right = new THREE.Vector3().crossVectors(up, DEFAULT_VIEW).normalize()
  const camUp = new THREE.Vector3().crossVectors(DEFAULT_VIEW, right)
  const pa = THREE.MathUtils.degToRad(paDeg)
  const inc = THREE.MathUtils.degToRad(inclinationDeg)
  // tilt axis lies in the picture plane at the position angle
  const axis = right.multiplyScalar(Math.cos(pa)).addScaledVector(camUp, Math.sin(pa)).normalize()
  const normal = DEFAULT_VIEW.clone().applyAxisAngle(axis, inc)
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
}

