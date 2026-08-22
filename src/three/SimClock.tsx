import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type RefObject,
  type ReactNode,
} from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'

/** Reference epoch for spin continuity: 2000-01-01T12:00Z (J2000). */
export const EPOCH = Date.UTC(2000, 0, 1, 12)

const SimClockCtx = createContext<RefObject<Date>>({
  current: new Date(),
})

export const useSimDate = () => useContext(SimClockCtx)

/**
 * Owns the simulation date. Each frame it advances the clock by
 * (speed days/sec) and shares it via context. The HUD clock is updated at a
 * throttled ~5 Hz so it doesn't re-render React every frame.
 */
export function ClockDriver({ children }: { children: ReactNode }) {
  const dateRef = useRef(new Date())
  const accum = useRef(0)
  const nowToken = useStore((s) => s.nowToken)

  // reset the clock to the real current time when the user hits "Now"
  useEffect(() => {
    dateRef.current = new Date()
    useStore.getState().setSimDateMs(dateRef.current.getTime())
  }, [nowToken])

  useFrame((_, delta) => {
    const { speed, setSimDateMs } = useStore.getState()
    // clamp delta so tab-switching doesn't fast-forward wildly
    const d = Math.min(delta, 0.1)
    const advanceMs = d * speed * 86_400 * 1000
    dateRef.current = new Date(dateRef.current.getTime() + advanceMs)

    accum.current += delta
    if (accum.current > 0.2) {
      accum.current = 0
      setSimDateMs(dateRef.current.getTime())
    }
  })

  return (
    <SimClockCtx.Provider value={dateRef}>{children}</SimClockCtx.Provider>
  )
}
