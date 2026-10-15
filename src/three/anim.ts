import { useStore } from '../store'

/**
 * Real-time delta for purely cosmetic animation (solar granulation, galaxy
 * spin…). Freezes when the simulation is paused or the user prefers reduced
 * motion, so "pause" really stops everything.
 */
export function animDelta(dt: number): number {
  const { speed, reducedMotion } = useStore.getState()
  return speed === 0 || reducedMotion ? 0 : Math.min(dt, 0.1)
}
