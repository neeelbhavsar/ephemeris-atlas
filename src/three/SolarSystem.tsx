import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { PLANETS, PLUTO } from '../data/solarSystem'
import { useStore } from '../store'
import { stopIndex } from './tour'
import { tourState } from './tourState'
import { markerLayer } from './markerLayer'
import Sun from './Sun'
import Planet3D from './Planet3D'
import OrbitPath from './OrbitPath'
import AsteroidBelt from './AsteroidBelt'
import SmallBodies from './SmallBodies'
import Trail from './Trail'

const BODIES = [...PLANETS, PLUTO]

/**
 * Everything heliocentric. On the jump out to the Local Group the whole
 * system is scaled down about the Sun (to its true size against the galaxy —
 * a sub-pixel dot) and a "You are here" marker takes over.
 */
export default function SolarSystem() {
  const ref = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const s = tourState.solarScale
    g.scale.setScalar(s)
    g.visible = s > 1e-4
  })

  return (
    <>
      <group ref={ref}>
        <Suspense fallback={null}>
          <Sun />
        </Suspense>
        {BODIES.map((p) => (
          <group key={p.id}>
            <OrbitPath
              id={p.id}
              aeBody={p.aeBody!}
              periodDays={p.orbitalPeriodDays!}
              color={p.color}
              opacity={p.kind === 'dwarf' ? 0.18 : 0.28}
            />
            <Planet3D body={p} stop={stopIndex(p.id)} />
          </group>
        ))}
        <AsteroidBelt />
        <SmallBodies />
        <Trail />
      </group>
      <YouAreHere />
    </>
  )
}

/** Marks the Sun's place in the Milky Way once the solar system is a dot. */
function YouAreHere() {
  const show = useStore((s) => s.inGalaxyView)
  if (!show) return null
  return (
    <Html center portal={markerLayer} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="marker-fade flex flex-col items-center">
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className="absolute h-4 w-4 animate-ping rounded-full bg-amber-300/40 motion-reduce:animate-none" />
          <span className="h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_12px_#fcd34d]" />
        </span>
        <span className="mt-1 whitespace-nowrap rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200">
          You are here
        </span>
      </div>
    </Html>
  )
}
