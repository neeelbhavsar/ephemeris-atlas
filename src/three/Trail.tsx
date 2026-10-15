import { useMemo, useRef, type ComponentRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { getEntry } from '../data/catalog'
import { helioAu } from '../lib/bodyEphemeris'
import { auToUnits } from '../lib/scale'
import { useSimDate, MS_PER_DAY } from '../lib/simTime'
import { useStore } from '../store'

const N = 90
const ZERO_POINTS = Array.from({ length: N }, () => new THREE.Vector3())

/**
 * A short fading trail behind the focused body: its real path over the
 * last few percent of its orbit, recomputed from the ephemeris.
 */
export default function Trail() {
  const id = useStore((s) => s.selectedId ?? s.focusId)
  const entry = getEntry(id)
  const period = entry?.orbitalPeriodDays
  const active = !!entry && !!period && !entry.galaxy && entry.bodyKind !== 'moon' && id !== 'sun'

  const dateRef = useSimDate()
  const lineRef = useRef<ComponentRef<typeof Line>>(null)
  const frame = useRef(0)
  const positions = useMemo(() => new Float32Array(N * 3), [])

  // fade to black along the trail = fade out under additive blending
  const colors = useMemo(() => {
    const c = new THREE.Color(entry?.info.color ?? '#ffffff')
    return Array.from({ length: N }, (_, i) => {
      const k = Math.pow(1 - i / (N - 1), 1.5) * 1.2
      return [c.r * k, c.g * k, c.b * k] as [number, number, number]
    })
  }, [entry])

  useFrame(() => {
    const line = lineRef.current
    if (!line) return
    line.visible = active
    if (!active || frame.current++ % 4 !== 0) return
    const span = Math.min(period! * 0.06, 3650) * MS_PER_DAY
    const now = dateRef.current.getTime()
    for (let i = 0; i < N; i++) {
      const p = helioAu(id, new Date(now - (i / (N - 1)) * span))
      if (!p) return
      positions[i * 3] = auToUnits(p.x)
      positions[i * 3 + 1] = auToUnits(p.y)
      positions[i * 3 + 2] = auToUnits(p.z)
    }
    line.geometry.setPositions(positions)
  })

  return (
    <Line
      ref={lineRef}
      points={ZERO_POINTS}
      vertexColors={colors}
      lineWidth={3}
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      frustumCulled={false}
    />
  )
}
