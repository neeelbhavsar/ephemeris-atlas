import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Body as AeBody, GeoVector } from 'astronomy-engine'
import type { Body } from '../data/solarSystem'
import { MOON } from '../data/solarSystem'
import { JWST } from '../data/extras'
import { AU_UNITS, auToUnits, radiusToUnits, type ScaleMode } from '../lib/scale'
import { eqjToScene, helioPositionAu, spinAngle } from '../lib/ephemeris'
import { useStore } from '../store'
import { useSimDate, EPOCH, daysSinceEpoch } from '../lib/simTime'
import { bodyHandlers } from './hoverHandlers'
import { reportPosition } from './bodyPositions'
import { tourState } from './tourState'
import {
  applyNightLights,
  applyRingShadow,
  createAtmosphereMaterial,
  createRingMaterial,
  createRingShadowUniforms,
} from './materials'
import { getSurfaceTexture, SURFACES } from './textures'
import BodyMarker from './BodyMarker'
import GalileanMoons from './GalileanMoons'

const DEG = Math.PI / 180

function srgb<T extends THREE.Texture>(tex: T): T {
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Outer-planet textures are fetched lazily: when the tour approaches the stop,
 * when the body is selected, or a few seconds after the intro has finished.
 */
function useLazyGate(id: string, stop: number): boolean {
  const eager = stop <= 4
  const [ready, setReady] = useState(eager)
  useEffect(() => {
    if (ready) return
    let idleSince = 0
    const timer = setInterval(() => {
      const s = useStore.getState()
      if (s.intro === 'done' && !idleSince) idleSince = performance.now()
      if (
        tourState.t > stop - 2.5 ||
        s.selectedId === id ||
        (idleSince && performance.now() - idleSince > 4000)
      ) {
        setReady(true)
      }
    }, 300)
    return () => clearInterval(timer)
  }, [ready, id, stop])
  return ready
}

export default function Planet3D({ body, stop }: { body: Body; stop: number }) {
  const scaleMode = useStore((s) => s.scaleMode)
  const dateRef = useSimDate()
  const groupRef = useRef<THREE.Group>(null)
  const ready = useLazyGate(body.id, stop)

  const radius = radiusToUnits(body.radiusKm, body.kind, scaleMode)
  const tilt = body.axialTiltDeg * DEG

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const p = helioPositionAu(body.aeBody!, dateRef.current)
    g.position.set(auToUnits(p.x), auToUnits(p.y), auToUnits(p.z))
    // report live position so the camera tour can follow this body
    reportPosition(body.id, g.position)
  })

  const atmoMat = useMemo(
    () =>
      body.atmosphere
        ? createAtmosphereMaterial(body.atmosphere.color, body.atmosphere.strength)
        : null,
    [body.atmosphere],
  )
  useEffect(() => () => atmoMat?.dispose(), [atmoMat])

  const plain = <PlainSphere body={body} radius={radius} />

  return (
    <group ref={groupRef}>
      {/* tilted equatorial frame (holds spinning body + ring) */}
      <group rotation={[0, 0, tilt]}>
        {ready ? (
          <Suspense fallback={plain}>
            {body.texture ? (
              <TexturedSurface body={body} radius={radius} />
            ) : (
              <ProceduralSurface body={body} radius={radius} />
            )}
          </Suspense>
        ) : (
          plain
        )}
      </group>

      {atmoMat && (
        <mesh material={atmoMat} scale={1.04}>
          <sphereGeometry args={[radius, 48, 48]} />
        </mesh>
      )}

      {/* Earth's Moon + JWST orbit in the ecliptic frame (untilted) */}
      {body.id === 'earth' && (
        <Suspense fallback={null}>
          <MoonBody parentRadius={radius} scaleMode={scaleMode} />
          <Webb parentRadius={radius} scaleMode={scaleMode} />
        </Suspense>
      )}
      {body.id === 'jupiter' && <GalileanMoons parentRadius={radius} scaleMode={scaleMode} />}

      <BodyMarker id={body.id} name={body.name} color={body.color} radius={radius} />
    </group>
  )
}

/** Untextured stand-in while (or instead of) loading the real map. */
function PlainSphere({ body, radius }: { body: Body; radius: number }) {
  return (
    <mesh {...bodyHandlers(body.id)}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={body.color} roughness={1} metalness={0} />
    </mesh>
  )
}

/** Spins a mesh with the body's real sidereal rotation, in simulation time. */
function useSpin(rotationHours: number) {
  const dateRef = useSimDate()
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = spinAngle(rotationHours, dateRef.current, EPOCH)
  })
  return ref
}

function ProceduralSurface({ body, radius }: { body: Body; radius: number }) {
  const spinRef = useSpin(body.rotationHours)
  const map = getSurfaceTexture(body.id, SURFACES[body.id] ?? SURFACES.pluto)
  return (
    <mesh ref={spinRef} {...bodyHandlers(body.id)}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial map={map} roughness={1} metalness={0} />
    </mesh>
  )
}

function TexturedSurface({ body, radius }: { body: Body; radius: number }) {
  const spinRef = useSpin(body.rotationHours)
  const map = srgb(useTexture(body.texture!))
  const night = useTexture(body.night ?? body.texture!)
  const ringMap = useTexture(body.ring?.texture ?? body.texture!)

  const ringUniforms = useMemo(
    () => (body.ring ? createRingShadowUniforms(srgb(ringMap)) : null),
    [body.ring, ringMap],
  )

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0 })
    if (body.night) applyNightLights(m, srgb(night))
    if (ringUniforms) applyRingShadow(m, ringUniforms)
    return m
  }, [map, night, body.night, ringUniforms])
  useEffect(() => () => material.dispose(), [material])

  return (
    <>
      <mesh ref={spinRef} material={material} {...bodyHandlers(body.id)}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
      {body.clouds && (
        <Clouds url={body.clouds} radius={radius} rotationHours={body.rotationHours} />
      )}
      {body.ring && ringUniforms && (
        <PlanetRing
          map={ringMap}
          radius={radius}
          inner={radius * body.ring.inner}
          outer={radius * body.ring.outer}
          shadowUniforms={ringUniforms}
          planetMesh={spinRef}
        />
      )}
    </>
  )
}

function Clouds({
  url,
  radius,
  rotationHours,
}: {
  url: string
  radius: number
  rotationHours: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const dateRef = useSimDate()
  // greyscale cloud map drives opacity only — the clouds themselves are white
  const alpha = useTexture(url)
  useFrame(() => {
    if (!ref.current) return
    // clouds ride along with the planet's spin plus a slow drift, all in
    // simulation time — so they stop when the simulation is paused
    const days = daysSinceEpoch(dateRef.current)
    ref.current.rotation.y = spinAngle(rotationHours, dateRef.current, EPOCH) + days * 0.03
  })
  return (
    <mesh ref={ref} scale={1.012}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        alphaMap={alpha}
        color="white"
        transparent
        depthWrite={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

function PlanetRing({
  map,
  radius,
  inner,
  outer,
  shadowUniforms,
  planetMesh,
}: {
  map: THREE.Texture
  radius: number
  inner: number
  outer: number
  shadowUniforms: ReturnType<typeof createRingShadowUniforms>
  planetMesh: RefObject<THREE.Mesh | null>
}) {
  const ringRef = useRef<THREE.Mesh>(null)

  // Build a ring whose UVs run radially so the ring texture maps correctly.
  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(inner, outer, 160, 1)
    const pos = g.attributes.position
    const uv = g.attributes.uv
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5)
    }
    return g
  }, [inner, outer])

  const material = useMemo(
    () =>
      createRingMaterial(map, {
        uRingNormal: shadowUniforms.uRingNormal,
        uPlanetCenter: shadowUniforms.uPlanetCenter,
        uPlanetRadius: { value: radius },
      }),
    [map, shadowUniforms, radius],
  )
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => () => geometry.dispose(), [geometry])

  const q = useMemo(() => new THREE.Quaternion(), [])
  useFrame(() => {
    const ring = ringRef.current
    const planet = planetMesh.current
    if (!ring || !planet) return
    // shadows are computed in world space (the solar system can be scaled)
    const s = tourState.solarScale
    planet.getWorldPosition(shadowUniforms.uPlanetCenter.value)
    ring.getWorldQuaternion(q)
    shadowUniforms.uRingNormal.value.set(0, 0, 1).applyQuaternion(q)
    shadowUniforms.uRingInner.value = inner * s
    shadowUniforms.uRingOuter.value = outer * s
    material.uniforms.uPlanetRadius.value = radius * s
  })

  return (
    <mesh
      ref={ringRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
}

function MoonBody({
  parentRadius,
  scaleMode,
}: {
  parentRadius: number
  scaleMode: ScaleMode
}) {
  const dateRef = useSimDate()
  const orbitRef = useRef<THREE.Group>(null)
  const spinRef = useSpin(MOON.rotationHours)
  const map = srgb(useTexture(MOON.texture!))
  const radius =
    scaleMode === 'true'
      ? radiusToUnits(MOON.radiusKm, 'moon', 'true')
      : Math.max(radiusToUnits(MOON.radiusKm, 'moon', scaleMode), parentRadius * 0.27)
  // Enlarged: exaggerated but real-direction orbit so the Moon is visible
  // next to Earth. True size: its real distance (~60 Earth radii).
  const orbitR = parentRadius * 2.6 + radius
  const world = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const g = orbitRef.current
    if (!g) return
    const v = eqjToScene(GeoVector(AeBody.Moon, dateRef.current, false))
    if (scaleMode === 'true') {
      g.position.set(v.x * AU_UNITS, v.y * AU_UNITS, v.z * AU_UNITS)
    } else {
      const len = Math.hypot(v.x, v.y, v.z) || 1
      g.position.set((v.x / len) * orbitR, (v.y / len) * orbitR, (v.z / len) * orbitR)
    }
    if (g.parent) reportPosition('moon', world.copy(g.position).add(g.parent.position))
  })

  return (
    <group ref={orbitRef}>
      <mesh ref={spinRef} {...bodyHandlers('moon')}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial map={map} roughness={1} metalness={0} />
      </mesh>
      <BodyMarker id="moon" name="Moon" color={MOON.color} radius={radius} />
    </group>
  )
}

/** JWST at Sun–Earth L2: always on the night side of Earth, 1.5 million km out. */
function Webb({ parentRadius, scaleMode }: { parentRadius: number; scaleMode: ScaleMode }) {
  const dateRef = useSimDate()
  const ref = useRef<THREE.Group>(null)
  const world = useMemo(() => new THREE.Vector3(), [])
  const offset = scaleMode === 'true' ? JWST.l2Au * AU_UNITS : parentRadius * 4.2
  const size = scaleMode === 'true' ? 0.0004 : 0.045

  useFrame(() => {
    const g = ref.current
    if (!g || !g.parent) return
    const e = helioPositionAu('Earth', dateRef.current)
    const len = Math.hypot(e.x, e.y, e.z) || 1
    g.position.set((e.x / len) * offset, (e.y / len) * offset, (e.z / len) * offset)
    // sunshield faces the Sun
    g.lookAt(0, 0, 0)
    reportPosition(JWST.id, world.copy(g.position).add(g.parent.position))
  })

  return (
    <group ref={ref}>
      <group scale={size} {...bodyHandlers(JWST.id)}>
        {/* sunshield */}
        <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.15]}>
          <boxGeometry args={[2.2, 1.3, 0.05]} />
          <meshStandardMaterial color="#8d7aa6" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* gold hexagonal mirror */}
        <mesh position={[0, 0.3, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.06, 6]} />
          <meshStandardMaterial color="#f5c75a" metalness={1} roughness={0.2} emissive="#4a3200" />
        </mesh>
      </group>
      <BodyMarker id={JWST.id} name="JWST" color={JWST.color} always />
    </group>
  )
}
