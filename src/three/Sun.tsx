import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard, useTexture } from '@react-three/drei'
import { SUN } from '../data/solarSystem'
import { radiusToUnits } from '../lib/scale'
import { useStore } from '../store'
import { spinAngle } from '../lib/ephemeris'
import { useSimDate, EPOCH } from '../lib/simTime'
import { bodyHandlers } from './hoverHandlers'
import { createCoronaMaterial, createSunMaterial } from './materials'
import { animDelta } from './anim'
import BodyMarker from './BodyMarker'

const CORONA_RATIO = 3.4

export default function Sun() {
  const scaleMode = useStore((s) => s.scaleMode)
  const dateRef = useSimDate()
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture(SUN.texture!)
  texture.colorSpace = THREE.SRGBColorSpace
  const radius = radiusToUnits(SUN.radiusKm, 'star', scaleMode)

  const sunMat = useMemo(() => createSunMaterial(texture), [texture])
  const coronaMat = useMemo(() => createCoronaMaterial(CORONA_RATIO), [])
  useEffect(() => () => {
    sunMat.dispose()
    coronaMat.dispose()
  }, [sunMat, coronaMat])

  const time = useRef(0)
  useFrame((_, dt) => {
    time.current += animDelta(dt)
    sunMat.uniforms.uTime.value = time.current
    coronaMat.uniforms.uTime.value = time.current
    if (meshRef.current) {
      meshRef.current.rotation.y = spinAngle(SUN.rotationHours, dateRef.current, EPOCH)
    }
  })

  return (
    <group>
      {/* The Sun is the scene's light source */}
      <pointLight intensity={4} distance={0} decay={0} color="#fff4e0" />
      <mesh ref={meshRef} material={sunMat} {...bodyHandlers('sun')}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>

      {/* animated corona */}
      <Billboard>
        <mesh scale={radius * 2 * CORONA_RATIO} material={coronaMat}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </Billboard>

      <BodyMarker id="sun" name="Sun" color={SUN.color} radius={radius} />
    </group>
  )
}
