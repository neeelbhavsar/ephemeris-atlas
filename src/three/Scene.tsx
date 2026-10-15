import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Stars, useScroll, useTexture } from '@react-three/drei'
import SolarSystem from './SolarSystem'
import NeighborGalaxies from './NeighborGalaxies'
import CameraRig from './CameraRig'
import { ClockDriver } from './SimClock'
import { LensFlare, PostEffects, ScreenshotCapture } from './Effects'
import { STOPS } from './tour'
import { tourState } from './tourState'
import { useStore } from '../store'

/**
 * Equirectangular Milky Way sky on the inside of a huge sphere that travels
 * with the camera (so it is never "left behind"). It fades out as we leave
 * the galaxy — from outside, the Milky Way is the spiral, not the backdrop.
 */
function SkyDome() {
  const tex = useTexture('/textures/2k_stars_milky_way.webp')
  tex.colorSpace = THREE.SRGBColorSpace
  const ref = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position)
    if (mat.current) mat.current.opacity = 1 - tourState.galaxyBlend * 0.92
  })
  return (
    <mesh ref={ref} renderOrder={-1}>
      <sphereGeometry args={[30000, 48, 48]} />
      <meshBasicMaterial
        ref={mat}
        map={tex}
        side={THREE.BackSide}
        depthWrite={false}
        transparent
        color="#7a83a8"
      />
    </mesh>
  )
}

/** Distant stars, also camera-centred. */
function StarField() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ camera }) => ref.current?.position.copy(camera.position))
  return (
    <group ref={ref}>
      <Stars radius={1200} depth={120} count={6000} factor={6} saturation={0} fade speed={0} />
    </group>
  )
}

/** Bridges the store's scroll requests (nav clicks, keys, links) to the scroll container. */
function ScrollHandler() {
  const scroll = useScroll()
  const request = useStore((s) => s.scrollRequest)
  const clear = useStore((s) => s.clearScrollRequest)

  // drei attaches its scroll listener only once the event system is connected
  // to the scroll element (and skips the very first event) — jumping earlier,
  // e.g. for a deep link on load, would be silently lost
  const connected = useThree((s) => s.events.connected) === scroll.el

  // the flight outlives the request (which is cleared as soon as it starts)
  const flight = useRef(0)
  useEffect(() => () => cancelAnimationFrame(flight.current), [])

  useEffect(() => {
    if (request == null || !connected) return
    const el = scroll.el
    let raf = 0
    let frames = 0
    const start = () => {
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0 || frames++ < 2) {
        raf = requestAnimationFrame(start)
        return
      }
      clear()
      cancelAnimationFrame(flight.current)
      const from = el.scrollTop
      const to = (request.index / (STOPS.length - 1)) * max
      if (request.instant || useStore.getState().reducedMotion) {
        el.scrollTop = to
        return
      }
      // eased flight; crossing into / out of the Local Group gets time for the
      // light-year counter and scale bar to sweep through every unit
      const pageSpan = Math.abs(to - from) / (max / (STOPS.length - 1))
      const crossesGalaxy = Math.max(from, to) > max * ((STOPS.length - 2) / (STOPS.length - 1)) + 1
      const duration = Math.min(2200, 500 + pageSpan * 350) + (crossesGalaxy ? 2600 : 0)
      const t0 = performance.now()
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / duration)
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
        el.scrollTop = from + (to - from) * e
        if (k < 1) flight.current = requestAnimationFrame(step)
      }
      flight.current = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(start)
    return () => cancelAnimationFrame(raf)
  }, [request, scroll, clear, connected])

  // a real scroll gesture hands control back to the tour
  useEffect(() => {
    const el = scroll.el
    const release = () => {
      cancelAnimationFrame(flight.current)
      if (useStore.getState().focusOverride) useStore.getState().setFocusOverride(null)
    }
    el.addEventListener('wheel', release, { passive: true })
    el.addEventListener('touchmove', release, { passive: true })
    return () => {
      el.removeEventListener('wheel', release)
      el.removeEventListener('touchmove', release)
    }
  }, [scroll])

  return null
}

export default function Scene() {
  return (
    <Canvas
      camera={{ fov: 55, near: 0.02, far: 60000, position: [0, 400, 1400] }}
      gl={{
        antialias: false, // MSAA happens in the EffectComposer
        logarithmicDepthBuffer: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      onPointerMissed={() => {
        if (useStore.getState().selectedId) useStore.getState().select(null)
      }}
    >
      <color attach="background" args={['#05060d']} />
      <ambientLight intensity={0.12} />

      <Suspense fallback={null}>
        <SkyDome />
      </Suspense>
      <StarField />

      <ScrollControls pages={STOPS.length} damping={0.28}>
        <ClockDriver>
          <SolarSystem />
          <NeighborGalaxies />
          <CameraRig />
          <ScrollHandler />
        </ClockDriver>
      </ScrollControls>

      <LensFlare />
      <PostEffects />
      <ScreenshotCapture />
    </Canvas>
  )
}
