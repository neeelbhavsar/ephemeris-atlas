import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { getEntry, entryDistance } from '../data/catalog'
import { SUN, ALL_PLANETS_AND_SUN } from '../data/solarSystem'
import { framingDistance, AU_UNITS } from '../lib/scale'
import { AU_PER_LY, GALACTIC_NORTH, LY_PER_GALAXY_UNIT } from '../lib/galactic'
import { useStore } from '../store'
import { getWorldPosition, hasPosition } from './bodyPositions'
import { galaxyPose } from './galaxyLayout'
import { STOPS, GALAXY_STOP } from './tour'
import { tourState } from './tourState'

import type { Pose } from './galaxyLayout'

const makePose = (): Pose => ({ target: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), dist: 1 })

function copyPose(a: Pose, out: Pose): Pose {
  out.target.copy(a.target)
  out.dir.copy(a.dir)
  out.dist = a.dist
  return out
}

/** Target and direction lerp; distance interpolates logarithmically so zooms feel even. */
function blendPose(a: Pose, b: Pose, u: number, out: Pose): Pose {
  out.target.lerpVectors(a.target, b.target, u)
  out.dir.lerpVectors(a.dir, b.dir, u)
  if (out.dir.lengthSq() < 1e-8) out.dir.copy(b.dir)
  out.dir.normalize()
  out.dist = Math.exp(THREE.MathUtils.lerp(Math.log(a.dist), Math.log(b.dist), u))
  return out
}

const smoothstep = (t: number) => {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** The whole solar system shrinks to its true size against the galaxy: 1 AU ≈ 1.6×10⁻⁸ galaxy units. */
const SOLAR_MIN_SCALE = 1 / (AU_UNITS * LY_PER_GALAXY_UNIT * AU_PER_LY)
const OVERVIEW_DIST = 900
const INTRO_SECONDS = 3.6

const RADIUS: Record<string, { km: number; kind: (typeof SUN)['kind'] }> = Object.fromEntries(
  ALL_PLANETS_AND_SUN.map((b) => [b.id, { km: b.radiusKm, kind: b.kind }]),
)

export default function CameraRig() {
  const scroll = useScroll()
  const { camera, size } = useThree()
  const persp = camera as THREE.PerspectiveCamera

  const p = useMemo(
    () => ({
      a: makePose(),
      b: makePose(),
      c: makePose(),
      tour: makePose(),
      override: makePose(),
      intro: makePose(),
      galaxy: makePose(),
      out: makePose(),
    }),
    [],
  )
  const state = useRef({
    modeBlend: useStore.getState().scaleMode === 'true' ? 1 : 0,
    overrideBlend: 0,
    introT: 0,
    time: 0,
    lastFocus: '',
    lastGalaxyView: false,
    portrait: 1,
  })

  useEffect(() => {
    galaxyPose(size.width / Math.max(1, size.height), persp.fov, p.galaxy)
  }, [size.width, size.height, persp.fov, p.galaxy])

  // cinematic intro start: high above the ecliptic, the planets a scatter of light
  useEffect(() => {
    p.intro.target.set(0, 0, 0)
    p.intro.dir.set(0.35, 0.8, 0.5).normalize()
    p.intro.dist = 1600
  }, [p.intro])

  /** Camera direction from an azimuth (radians about +Y) and elevation. */
  const azDir = (az: number, elevation: number, out: THREE.Vector3) =>
    out.set(Math.sin(az), elevation, Math.cos(az)).normalize()

  /**
   * Planet framing: look from ~55° off the Sun direction so the body is
   * three-quarters lit and its terminator (and Earth's city lights) shows.
   */
  const litDir = (target: THREE.Vector3, drift: number, elevation: number, out: THREE.Vector3) => {
    if (target.x * target.x + target.z * target.z < 1e-10) return azDir(0.6 + drift, elevation, out)
    const sunward = Math.atan2(-target.x, -target.z)
    return azDir(sunward + 0.95 + drift, elevation, out)
  }

  const stopPose = (i: number, drift: number, m: number, out: Pose): Pose => {
    if (i === GALAXY_STOP) {
      copyPose(p.galaxy, out)
      return out
    }
    const stop = STOPS[i]
    getWorldPosition(stop.id, out.target)
    litDir(out.target, drift, 0.42, out.dir)
    const r = RADIUS[stop.id]
    const dTrue = r ? framingDistance(stop.dist, r.km, r.kind, 'true') : stop.dist
    out.dist =
      Math.exp(THREE.MathUtils.lerp(Math.log(stop.dist), Math.log(dTrue), m)) * state.current.portrait
    return out
  }

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1)
    const s = state.current
    const store = useStore.getState()
    s.time += dt

    // smooth transitions between Enlarged / True size framing
    const modeGoal = store.scaleMode === 'true' ? 1 : 0
    s.modeBlend += (modeGoal - s.modeBlend) * (1 - Math.exp(-dt * 3))
    const m = s.modeBlend

    // gentle back-and-forth drift around the framing (none with reduced motion)
    const drift = store.reducedMotion ? 0 : Math.sin(s.time * 0.035) * 0.35
    const n = STOPS.length
    const t = scroll.offset * (n - 1)
    const aspect = size.width / Math.max(1, size.height)
    s.portrait = aspect < 1 ? Math.pow(1 / aspect, 0.7) : 1
    const i = Math.min(GALAXY_STOP - 1, Math.max(0, Math.floor(t)))
    const f = THREE.MathUtils.clamp(t - i, 0, 1)

    let solarScale = 1
    let galaxyBlend = 0

    if (i < GALAXY_STOP - 1) {
      blendPose(stopPose(i, drift, m, p.a), stopPose(i + 1, drift, m, p.b), smoothstep(f), p.tour)
    } else {
      // the big jump: pull back to see the whole solar system, then shrink it
      // to a dot as the Milky Way and its neighbours fade in around it
      stopPose(i, drift, m, p.a)
      p.c.target.set(0, 0, 0)
      azDir(0.6 + drift, 1.3, p.c.dir)
      p.c.dist = OVERVIEW_DIST
      if (f < 0.4) {
        blendPose(p.a, p.c, smoothstep(f / 0.4), p.tour)
      } else {
        const u = (f - 0.4) / 0.6
        const gal = p.b
        copyPose(p.galaxy, gal)
        if (!store.reducedMotion) {
          gal.dir.applyAxisAngle(GALACTIC_NORTH, Math.sin(s.time * 0.05) * 0.12)
        }
        blendPose(p.c, gal, smoothstep(u), p.tour)
        solarScale = Math.exp(Math.log(SOLAR_MIN_SCALE) * smoothstep(u * 1.1))
        galaxyBlend = smoothstep(u * 1.6)
      }
    }
    tourState.t = t
    tourState.solarScale = solarScale
    tourState.galaxyBlend = galaxyBlend

    // tap / search focus on a body that isn't a tour stop
    const ovId = store.focusOverride
    const ovGoal = ovId && hasPosition(ovId) ? 1 : 0
    s.overrideBlend += (ovGoal - s.overrideBlend) * (1 - Math.exp(-dt * 2.2))
    let pose = p.tour
    if (ovId && s.overrideBlend > 0.001) {
      const entry = getEntry(ovId)
      if (entry) {
        getWorldPosition(ovId, p.override.target)
        if (ovId === 'moon') {
          // look from Earth's side: the phase you see is the phase Earth sees
          getWorldPosition('earth', p.override.dir).sub(p.override.target).normalize()
          p.override.dir.y += 0.25
          p.override.dir.normalize()
        } else {
          litDir(p.override.target, drift, 0.42, p.override.dir)
        }
        if (entry.galaxy) p.override.dir.copy(p.galaxy.dir)
        const de = entryDistance(entry, 'explore')
        const dtr = entryDistance(entry, 'true')
        p.override.dist =
          Math.exp(THREE.MathUtils.lerp(Math.log(de), Math.log(dtr), m)) * (entry.galaxy ? 1 : s.portrait)
        pose = blendPose(p.tour, p.override, smoothstep(s.overrideBlend), p.out)
      }
    }

    // cinematic intro: hold high above, then sweep down into the Sun
    if (store.intro !== 'done') {
      if (store.intro === 'sweep') s.introT = Math.min(1, s.introT + dt / INTRO_SECONDS)
      if (s.introT >= 1) store.setIntro('done')
      pose = blendPose(p.intro, pose, easeInOut(s.introT), p.c)
    }

    camera.position.copy(pose.target).addScaledVector(pose.dir, pose.dist)
    camera.lookAt(pose.target)

    // keep depth precision sensible from 0.001 units (true-size planets) to 10⁴ (galaxies)
    const near = THREE.MathUtils.clamp(pose.dist * 0.02, 1e-6, 0.5)
    if (Math.abs(persp.near - near) / near > 0.1) {
      persp.near = near
      persp.updateProjectionMatrix()
    }

    // readouts for the scale bar / distance counter
    const unitsPerAu = AU_UNITS * solarScale
    tourState.camDistAu = camera.position.length() / unitsPerAu
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2) * pose.dist
    tourState.auPerPx = viewHeight / Math.max(1, size.height) / unitsPerAu

    // nav highlight + galaxy-view flag (store updates only on change)
    const focus = STOPS[Math.round(t)].id
    if (focus !== s.lastFocus) {
      s.lastFocus = focus
      store.setFocusId(focus)
    }
    const inGalaxy = galaxyBlend > 0.5
    if (inGalaxy !== s.lastGalaxyView) {
      s.lastGalaxyView = inGalaxy
      store.setInGalaxyView(inGalaxy)
    }
  })

  return null
}
