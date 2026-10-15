import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { distanceFromEarthAu } from '../lib/bodyEphemeris'

/** Live distance from Earth (AU) for a body, recomputed as the simulation advances. */
export function useLiveDistance(id: string | undefined): number | null {
  const simDateMs = useStore((s) => s.simDateMs)
  if (!id) return null
  try {
    return distanceFromEarthAu(id, new Date(simDateMs))
  } catch {
    return null
  }
}

/** Tracks a CSS media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}
