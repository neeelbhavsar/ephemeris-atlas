import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { SUN } from '../data/solarSystem'
import { radiusToUnits } from '../lib/scale'
import { useStore } from '../store'
import { spinAngle } from '../lib/ephemeris'
import { useSimDate, EPOCH } from './SimClock'
import { hoverHandlers } from './hoverHandlers'

export default function Sun() {
  const scaleMode = useStore((s) => s.scaleMode)
  const dateRef = useSimDate()
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useLoader(THREE.TextureLoader, SUN.texture)
  const radius = radiusToUnits(SUN.radiusKm, 'star', scaleMode)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = spinAngle(
        SUN.rotationHours,
        dateRef.current,
        EPOCH,
      )
    }
  })

  return (
    <group>
      {/* The Sun is the scene's light source */}
      <pointLight intensity={4} distance={0} decay={0} color="#fff4e0" />
      <mesh ref={meshRef} {...hoverHandlers(SUN)}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* corona glow */}
      <Billboard>
        <mesh scale={radius * 2.6}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color="#ffcf6b"
            opacity={0.35}
            map={useRadialGlow()}
          />
        </mesh>
      </Billboard>
    </group>
  )
}

/** A soft radial gradient texture generated once, for additive glow sprites. */
let cachedGlow: THREE.CanvasTexture | null = null
function useRadialGlow(): THREE.CanvasTexture {
  if (cachedGlow) return cachedGlow
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,220,150,0.7)')
  grad.addColorStop(1, 'rgba(255,180,80,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  cachedGlow = new THREE.CanvasTexture(canvas)
  return cachedGlow
}
