import type { BodyKind } from '../data/solarSystem'
import { AU_KM } from '../data/solarSystem'

export type ScaleMode = 'explore' | 'true'

/**
 * Scene units per AU. Positions ALWAYS use this linear mapping, so every body
 * sits at its true relative distance from the Sun regardless of scale mode.
 * Only body *radii* (and how close the camera flies) change between modes.
 */
export const AU_UNITS = 9

// In "explore" mode Earth renders at ~0.36 units; bodies keep their true size
// ratios to one another, except the Sun which is clamped so it doesn't swallow
// the inner planets.
const EARTH_RADIUS_KM = 6371
export const KM_UNITS_EXPLORE = 0.36 / EARTH_RADIUS_KM
// Mercury orbits at 0.39 AU * AU_UNITS ≈ 3.5 units, so the Sun must render
// smaller than that or it would swallow Mercury.
const SUN_CLAMP_EXPLORE = 2.3
const SMALL_BODY_BOOST = 5
const MIN_VISIBLE = 0.11

export function auToUnits(au: number): number {
  return au * AU_UNITS
}

export function kmToUnitsTrue(km: number): number {
  return (km / AU_KM) * AU_UNITS
}

/** Radius of a body in scene units for the given scale mode. */
export function radiusToUnits(
  radiusKm: number,
  kind: BodyKind,
  mode: ScaleMode,
): number {
  if (mode === 'true') {
    // true proportion of radius to orbital distance — reveals how empty and
    // vast space really is (planets become tiny specks).
    return kmToUnitsTrue(radiusKm)
  }
  let r = radiusKm * KM_UNITS_EXPLORE
  if (kind === 'star') return Math.min(r, SUN_CLAMP_EXPLORE)
  if (kind === 'asteroid' || kind === 'dwarf') r *= SMALL_BODY_BOOST
  return Math.max(r, MIN_VISIBLE)
}

/**
 * Camera framing distance for a body: the "Enlarged" framing is authored per
 * stop; in "True size" mode the camera keeps the same framing *relative to the
 * body's radius*, so you fly right up to the (now tiny) planet.
 */
export function framingDistance(
  exploreDist: number,
  radiusKm: number,
  kind: BodyKind,
  mode: ScaleMode,
): number {
  if (mode === 'explore' || kind === 'star') return exploreDist
  const ratio = exploreDist / radiusToUnits(radiusKm, kind, 'explore')
  return ratio * radiusToUnits(radiusKm, kind, 'true')
}
