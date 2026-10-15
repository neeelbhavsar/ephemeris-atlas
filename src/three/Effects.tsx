import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useStore } from '../store'
import { tourState } from './tourState'
import { getGlowTexture } from './textures'

/**
 * Post-processing: bloom picks up anything brighter than 1.0 — the HDR Sun,
 * its corona and the galaxy cores — then ACES tone mapping (the composer
 * renders with tone mapping off, so it has to be applied here).
 */
export function PostEffects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.85} radius={0.65} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

const GHOSTS = [
  { k: 1, size: 0.5, color: '#ffd9a0', opacity: 0.25 },
  { k: 0.55, size: 0.07, color: '#9fd0ff', opacity: 0.22 },
  { k: 0.25, size: 0.14, color: '#ffb36b', opacity: 0.1 },
  { k: -0.2, size: 0.045, color: '#b6ffcf', opacity: 0.25 },
  { k: -0.55, size: 0.2, color: '#7aa8ff', opacity: 0.08 },
  { k: -0.9, size: 0.1, color: '#ff9ad5', opacity: 0.12 },
]

/** Subtle lens flare: ghosts strung along the line from the Sun through the screen centre. */
export function LensFlare() {
  const { camera, size } = useThree()
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const glow = getGlowTexture()
  const v = useMemo(() => new THREE.Vector3(), [])
  const ndc = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera
    ndc.set(0, 0, 0).project(cam)
    const behind = ndc.z > 1 || ndc.z < -1
    const edge = Math.max(Math.abs(ndc.x), Math.abs(ndc.y))
    // fade near the edges, when far away (the Sun is a dot) and in the galaxy view
    const camDist = cam.position.length()
    let strength = behind ? 0 : THREE.MathUtils.clamp(1.15 - edge, 0, 1)
    strength *= THREE.MathUtils.clamp((300 - camDist) / 200, 0, 1)
    strength *= 1 - tourState.galaxyBlend
    if (useStore.getState().intro !== 'done') strength = 0

    const tanY = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2)
    const tanX = tanY * (size.width / Math.max(1, size.height))
    GHOSTS.forEach((g, i) => {
      const s = refs.current[i]
      if (!s) return
      s.visible = strength > 0.01
      if (!s.visible) return
      v.set(ndc.x * g.k * tanX, ndc.y * g.k * tanY, -1).applyMatrix4(cam.matrixWorld)
      s.position.copy(v)
      s.scale.setScalar(g.size * tanY)
      ;(s.material as THREE.SpriteMaterial).opacity = g.opacity * strength
    })
  })

  return (
    <>
      {GHOSTS.map((g, i) => (
        <sprite key={i} ref={(el) => void (refs.current[i] = el)} renderOrder={1000}>
          <spriteMaterial
            map={glow}
            color={g.color}
            transparent
            depthTest={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </>
  )
}

/** Captures the canvas right after the composer renders (no preserveDrawingBuffer needed). */
export function ScreenshotCapture() {
  const token = useStore((s) => s.screenshotToken)
  const gl = useThree((s) => s.gl)
  const pending = useRef(false)

  useEffect(() => {
    if (token > 0) pending.current = true
  }, [token])

  useFrame(() => {
    if (!pending.current) return
    pending.current = false
    gl.domElement.toBlob((blob) => {
      if (!blob) return
      const d = new Date(useStore.getState().simDateMs).toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `ephemeris-atlas-${useStore.getState().focusId}-${d}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 2000)
      useStore.getState().showToast('Screenshot saved')
    }, 'image/png')
  }, 2) // after the EffectComposer's render (priority 1)

  return null
}
