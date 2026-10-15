import * as THREE from 'three'
import { tourState } from './tourState'

/**
 * Live scene positions of every body, written each frame by the renderers and
 * read by the camera rig so the tour can follow bodies as they actually move.
 *
 * Solar-system bodies report heliocentric scene units (before the solar
 * system's zoom-out scale is applied); galaxies report world positions.
 */
interface Entry {
  pos: THREE.Vector3
  solar: boolean
}

const bodyPositions = new Map<string, Entry>()

export function reportPosition(id: string, v: THREE.Vector3, solar = true) {
  const existing = bodyPositions.get(id)
  if (existing) existing.pos.copy(v)
  else bodyPositions.set(id, { pos: v.clone(), solar })
}

export function hasPosition(id: string): boolean {
  return bodyPositions.has(id)
}

/** World-space position of a body (the Sun / unknown ids → origin). */
export function getWorldPosition(id: string, out: THREE.Vector3): THREE.Vector3 {
  const e = bodyPositions.get(id)
  if (!e) return out.set(0, 0, 0)
  out.copy(e.pos)
  if (e.solar) out.multiplyScalar(tourState.solarScale)
  return out
}
