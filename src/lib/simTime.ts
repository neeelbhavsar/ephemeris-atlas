import { createContext, useContext, type RefObject } from 'react'

/** Reference epoch for spin continuity: 2000-01-01T12:00Z (J2000). */
export const EPOCH = Date.UTC(2000, 0, 1, 12)

export const MS_PER_DAY = 86_400_000

/** Shared, mutable simulation date (owned by `ClockDriver`). */
export const SimClockCtx = createContext<RefObject<Date>>({
  current: new Date(),
})

export const useSimDate = () => useContext(SimClockCtx)

/** Days elapsed since J2000 for `date`. */
export function daysSinceEpoch(date: Date): number {
  return (date.getTime() - EPOCH) / MS_PER_DAY
}
