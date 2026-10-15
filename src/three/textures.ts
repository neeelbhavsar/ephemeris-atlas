import * as THREE from 'three'

let circle: THREE.CanvasTexture | null = null

/** A soft round sprite used for galaxy star points (so they aren't squares). */
export function getCircleTexture(): THREE.CanvasTexture {
  if (circle) return circle
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  circle = new THREE.CanvasTexture(canvas)
  return circle
}

let glow: THREE.CanvasTexture | null = null

/** A soft radial gradient for additive glow sprites (galaxy bulges, lens flare). */
export function getGlowTexture(): THREE.CanvasTexture {
  if (glow) return glow
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  glow = new THREE.CanvasTexture(canvas)
  return glow
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SurfaceRecipe {
  base: string
  spots: string[]
  /** number of blotches */
  count: number
  /** blotch size range, fraction of texture height */
  size: [number, number]
  /** draw thin crack lines (Europa) */
  lines?: string
  /** bright heart-shaped plain (Pluto's Tombaugh Regio) */
  heart?: string
  seed: number
}

const surfaceCache = new Map<string, THREE.CanvasTexture>()

/** Cheap equirectangular surface texture for bodies without a real map. */
export function getSurfaceTexture(key: string, r: SurfaceRecipe): THREE.CanvasTexture {
  const cached = surfaceCache.get(key)
  if (cached) return cached
  const w = 512
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const rnd = mulberry32(r.seed)
  ctx.fillStyle = r.base
  ctx.fillRect(0, 0, w, h)
  // soft-edged blotches read as terrain rather than stickers
  ctx.filter = 'blur(3px)'
  for (let i = 0; i < r.count; i++) {
    const x = rnd() * w
    const y = h * (0.08 + rnd() * 0.84)
    const s = h * (r.size[0] + rnd() * (r.size[1] - r.size[0]))
    ctx.globalAlpha = 0.25 + rnd() * 0.5
    ctx.fillStyle = r.spots[Math.floor(rnd() * r.spots.length)]
    ctx.beginPath()
    ctx.ellipse(x, y, s * (1 + rnd()), s, rnd() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
    // wrap around the seam
    if (x + s * 2 > w) {
      ctx.beginPath()
      ctx.ellipse(x - w, y, s * (1 + rnd()), s, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (r.lines) {
    ctx.strokeStyle = r.lines
    ctx.lineWidth = 1.2
    for (let i = 0; i < 70; i++) {
      ctx.globalAlpha = 0.25 + rnd() * 0.4
      ctx.beginPath()
      let x = rnd() * w
      let y = rnd() * h
      ctx.moveTo(x, y)
      for (let k = 0; k < 4; k++) {
        x += (rnd() - 0.5) * 140
        y += (rnd() - 0.5) * 60
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }
  if (r.heart) {
    ctx.globalAlpha = 0.9
    ctx.fillStyle = r.heart
    const cx = w * 0.5
    const cy = h * 0.55
    const s = h * 0.18
    ctx.beginPath()
    ctx.moveTo(cx, cy + s * 1.1)
    ctx.bezierCurveTo(cx - s * 2.2, cy - s * 0.2, cx - s * 0.9, cy - s * 1.6, cx, cy - s * 0.5)
    ctx.bezierCurveTo(cx + s * 0.9, cy - s * 1.6, cx + s * 2.0, cy - s * 0.2, cx, cy + s * 1.1)
    ctx.fill()
  }
  // fine speckle for surface texture
  ctx.filter = 'none'
  for (let i = 0; i < 2600; i++) {
    const v = rnd() < 0.5 ? 0 : 255
    ctx.globalAlpha = 0.04 + rnd() * 0.06
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2)
  }
  ctx.globalAlpha = 1
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  surfaceCache.set(key, tex)
  return tex
}

export const SURFACES: Record<string, SurfaceRecipe> = {
  pluto: {
    base: '#bfa486',
    spots: ['#8a6448', '#6b4a35', '#d9c7ad', '#a57f5e'],
    count: 260,
    size: [0.015, 0.06],
    heart: '#efe6d6',
    seed: 9,
  },
  io: {
    base: '#e3c75a',
    spots: ['#c9762a', '#f2e18e', '#3b2a1a', '#d89a3d'],
    count: 160,
    size: [0.01, 0.05],
    seed: 21,
  },
  europa: {
    base: '#dcd2bf',
    spots: ['#c9b89a', '#efe9de'],
    count: 40,
    size: [0.03, 0.1],
    lines: '#8a5a3c',
    seed: 33,
  },
  ganymede: {
    base: '#9d917f',
    spots: ['#6f6457', '#c6bcae', '#857868'],
    count: 110,
    size: [0.03, 0.1],
    seed: 45,
  },
  callisto: {
    base: '#5d544a',
    spots: ['#3f3831', '#8c8273', '#d8d0c3'],
    count: 260,
    size: [0.004, 0.03],
    seed: 57,
  },
}
