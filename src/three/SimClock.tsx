import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { SimClockCtx } from '../lib/simTime'

/**
 * Owns the simulation date. Each frame it advances the clock by
 * (speed days/sec) and shares it via context. The HUD clock is updated at a
 * throttled ~5 Hz so it doesn't re-render React every frame.
 */
export function ClockDriver({ children }: { children: ReactNode }) {
  const dateRef = useRef(new Date(useStore.getState().simDateMs))
  const accum = useRef(0)
  const dateRequest = useStore((s) => s.dateRequest)

  // jump the clock (reset to now, time travel, shared links)
  useEffect(() => {
    if (!dateRequest) return
    dateRef.current = new Date(dateRequest.ms)
    useStore.getState().setSimDateMs(dateRequest.ms)
  }, [dateRequest])

  useFrame((_, delta) => {
    const { speed, setSimDateMs, intro } = useStore.getState()
    // the clock starts once the title card is gone, so "now" really is now
    if (speed !== 0 && intro === 'done') {
      // clamp delta so tab-switching doesn't fast-forward wildly
      const d = Math.min(delta, 0.1)
      const advanceMs = d * speed * 86_400 * 1000
      dateRef.current = new Date(dateRef.current.getTime() + advanceMs)
    }

    accum.current += delta
    if (accum.current > 0.2) {
      accum.current = 0
      const ms = dateRef.current.getTime()
      if (ms !== useStore.getState().simDateMs) setSimDateMs(ms)
    }
  })

  return (
    <SimClockCtx.Provider value={dateRef}>{children}</SimClockCtx.Provider>
  )
}
