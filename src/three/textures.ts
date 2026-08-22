import * as THREE from 'three'

let circle: THREE.CanvasTexture | null = null

/** A soft round sprite used for galaxy star points (so they aren't squares). */
export function getCircleTexture(): THREE.CanvasTexture {
  if (circle) return circle
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  circle = new THREE.CanvasTexture(canvas)
  return circle
}
