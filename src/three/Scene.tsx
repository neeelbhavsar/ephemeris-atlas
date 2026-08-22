import { Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Stars, useScroll, useTexture } from '@react-three/drei'
import SolarSystem from './SolarSystem'
import NeighborGalaxies from './NeighborGalaxies'
import CameraRig from './CameraRig'
import { ClockDriver } from './SimClock'
import { STOPS } from './tour'
import { useStore } from '../store'

/** Equirectangular Milky Way sky, rendered on the inside of a huge sphere. */
function SkyDome() {
  const tex = useTexture('/textures/2k_stars_milky_way.jpg')
  return (
    <mesh>
      <sphereGeometry args={[6000, 48, 48]} />
      <meshBasicMaterial
        map={tex}
        side={THREE.BackSide}
        depthWrite={false}
        color="#8891b5"
      />
    </mesh>
  )
}

/** Bridges the store's scroll requests (nav clicks) to the scroll container. */
function ScrollHandler() {
  const scroll = useScroll()
  const request = useStore((s) => s.scrollRequest)
  const clear = useStore((s) => s.clearScrollRequest)

  useEffect(() => {
    if (request == null) return
    const el = scroll.el
    const max = el.scrollHeight - el.clientHeight
    el.scrollTo({
      top: (request / (STOPS.length - 1)) * max,
      behavior: 'smooth',
    })
    clear()
  }, [request, scroll, clear])

  return null
}

export default function Scene() {
  return (
    <Canvas
      camera={{ fov: 55, near: 0.02, far: 8000, position: [0, 12, 30] }}
      gl={{
        antialias: true,
        logarithmicDepthBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#05060d']} />
      <ambientLight intensity={0.12} />

      <Suspense fallback={null}>
        <SkyDome />
      </Suspense>
      <Stars radius={1200} depth={120} count={6000} factor={6} saturation={0} fade speed={0.4} />

      <ScrollControls pages={STOPS.length} damping={0.28}>
        <ClockDriver>
          <SolarSystem />
          <NeighborGalaxies />
          <CameraRig />
          <ScrollHandler />
        </ClockDriver>
      </ScrollControls>
    </Canvas>
  )
}
