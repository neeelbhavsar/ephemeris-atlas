import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { getPosition } from './bodyPositions'
import { STOPS } from './tour'
import { useStore } from '../store'

const GALAXY_LOOK = new THREE.Vector3(140, 30, -150)
const GALAXY_CAM = new THREE.Vector3(0, 300, 760)

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

/** Live look-at target for stop `i`. */
function stopTarget(i: number, out: THREE.Vector3): THREE.Vector3 {
  const stop = STOPS[i]
  if (stop.id === 'galaxies') return out.copy(GALAXY_LOOK)
  if (stop.id === 'sun') return out.set(0, 0, 0)
  return out.copy(getPosition(stop.id))
}

/** Desired camera position for stop `i`, given its (already computed) target. */
function stopCamera(
  i: number,
  target: THREE.Vector3,
  azimuth: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  if (STOPS[i].id === 'galaxies') return out.copy(GALAXY_CAM)
  const d = STOPS[i].dist
  const dir = new THREE.Vector3(
    Math.sin(azimuth),
    0.42,
    Math.cos(azimuth),
  ).normalize()
  return out.copy(target).addScaledVector(dir, d)
}

export default function CameraRig() {
  const scroll = useScroll()
  const { camera } = useThree()

  const targetA = useRef(new THREE.Vector3())
  const targetB = useRef(new THREE.Vector3())
  const camA = useRef(new THREE.Vector3())
  const camB = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const desiredCam = useRef(new THREE.Vector3())
  const lookAt = useRef(new THREE.Vector3())
  const lastFocus = useRef('')

  useEffect(() => {
    camera.position.set(0, 12, 30)
  }, [camera])

  useFrame((state) => {
    const n = STOPS.length
    const t = scroll.offset * (n - 1)
    const i = Math.min(n - 2, Math.max(0, Math.floor(t)))
    const f = smoothstep(THREE.MathUtils.clamp(t - i, 0, 1))
    const azimuth = state.clock.elapsedTime * 0.04

    stopTarget(i, targetA.current)
    stopTarget(i + 1, targetB.current)
    target.current.copy(targetA.current).lerp(targetB.current, f)

    stopCamera(i, targetA.current, azimuth, camA.current)
    stopCamera(i + 1, targetB.current, azimuth, camB.current)
    desiredCam.current.copy(camA.current).lerp(camB.current, f)

    // buttery approach; faster during big galaxy jump so it keeps up
    const lerp = f > 0 && STOPS[i + 1].id === 'galaxies' ? 0.06 : 0.09
    camera.position.lerp(desiredCam.current, lerp)
    lookAt.current.lerp(target.current, 0.12)
    camera.lookAt(lookAt.current)

    // update nav highlight (throttled by change only)
    const focus = STOPS[Math.round(t)].id
    if (focus !== lastFocus.current) {
      lastFocus.current = focus
      useStore.getState().setFocusId(focus)
    }
  })

  return null
}
