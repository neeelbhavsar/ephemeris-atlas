import * as THREE from 'three'

/**
 * Live scene positions of every body, written each frame by the renderers and
 * read by the camera rig so the tour can follow bodies as they actually move.
 */
export const bodyPositions = new Map<string, THREE.Vector3>()

export function reportPosition(id: string, v: THREE.Vector3) {
  const existing = bodyPositions.get(id)
  if (existing) existing.copy(v)
  else bodyPositions.set(id, v.clone())
}

export function getPosition(id: string): THREE.Vector3 {
  return bodyPositions.get(id) ?? new THREE.Vector3()
}
