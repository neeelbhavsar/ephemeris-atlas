import type { Body, BodyKind, Fact } from './solarSystem'
import { ALL_PLANETS_AND_SUN, ASTEROIDS, MOON, type Asteroid } from './solarSystem'
import { GALILEAN_MOONS, HALLEY, JWST, VOYAGER } from './extras'
import { MILKY_WAY, NEIGHBOR_GALAXIES, type NeighborGalaxy } from './galaxies'
import { STOPS } from '../three/tour'
import { framingDistance, radiusToUnits, type ScaleMode } from '../lib/scale'

/** Everything the UI needs to describe a body (hover card, info panel, search). */
export interface BodyInfo {
  id: string
  name: string
  kind: string
  subtitle?: string
  brief: string
  facts: Fact[]
  color: string
}

export interface CatalogEntry {
  id: string
  info: BodyInfo
  /** index into STOPS, or -1 when the body isn't a tour stop */
  stop: number
  /** physical data for camera framing (solar-system bodies) */
  radiusKm?: number
  bodyKind?: BodyKind
  /** Enlarged-mode camera distance */
  exploreDist: number
  /** galaxies live in world space, not inside the solar system */
  galaxy?: boolean
  /** surface gravity (m/s²) for the compare panel */
  gravity?: number
  rotationHours?: number
  orbitalPeriodDays?: number
  keywords?: string
}

const KIND_LABEL: Record<BodyKind, string> = {
  star: 'Star',
  planet: 'Planet',
  dwarf: 'Dwarf planet',
  moon: 'Moon',
  asteroid: 'Asteroid',
}

function fromBody(body: Body): CatalogEntry {
  const stop = STOPS.findIndex((s) => s.id === body.id)
  return {
    id: body.id,
    info: {
      id: body.id,
      name: body.name,
      kind: KIND_LABEL[body.kind],
      subtitle: body.semiMajorAu
        ? body.kind === 'moon'
          ? 'Orbits Earth'
          : `${body.semiMajorAu.toFixed(2)} AU from the Sun`
        : 'Center of the solar system',
      brief: body.brief,
      facts: body.facts,
      color: body.color,
    },
    stop,
    radiusKm: body.radiusKm,
    bodyKind: body.kind,
    exploreDist:
      stop >= 0 ? STOPS[stop].dist : radiusToUnits(body.radiusKm, body.kind, 'explore') * 8,
    gravity: body.gravity,
    rotationHours: body.rotationHours,
    orbitalPeriodDays: body.orbitalPeriodDays,
  }
}

function fromAsteroid(a: Asteroid): CatalogEntry {
  return {
    id: a.id,
    info: {
      id: a.id,
      name: a.name,
      kind: a.id === 'ceres' ? 'Dwarf planet' : 'Asteroid',
      subtitle: `Main belt · ${a.semiMajorAu.toFixed(2)} AU from the Sun`,
      brief: a.brief,
      facts: a.facts,
      color: a.color,
    },
    stop: -1,
    radiusKm: a.radiusKm,
    bodyKind: 'asteroid',
    exploreDist: radiusToUnits(a.radiusKm, 'asteroid', 'explore') * 9,
    gravity: a.gravity,
    rotationHours: a.rotationHours,
    orbitalPeriodDays: a.orbitalPeriodDays,
    keywords: 'asteroid belt',
  }
}

function fromGalaxy(g: NeighborGalaxy): CatalogEntry {
  return {
    id: g.id,
    info: {
      id: g.id,
      name: g.name,
      kind: 'Galaxy',
      subtitle: g.type,
      brief: g.brief,
      facts: [
        { label: 'Distance', value: g.distance },
        { label: 'Diameter', value: g.diameter },
        { label: 'Stars', value: g.stars },
      ],
      color: g.color,
    },
    stop: g.id === 'milkyway' ? STOPS.length - 1 : -1,
    exploreDist: g.size * 2.6,
    galaxy: true,
    keywords: 'local group galaxy',
  }
}

export const CATALOG: CatalogEntry[] = [
  ...ALL_PLANETS_AND_SUN.map(fromBody),
  fromBody(MOON),
  ...GALILEAN_MOONS.map(
    (m): CatalogEntry => ({
      id: m.id,
      info: {
        id: m.id,
        name: m.name,
        kind: 'Moon',
        subtitle: 'Galilean moon of Jupiter',
        brief: m.brief,
        facts: m.facts,
        color: m.color,
      },
      stop: -1,
      radiusKm: m.radiusKm,
      bodyKind: 'moon',
      exploreDist: 1.2,
      gravity: m.gravity,
      orbitalPeriodDays: m.periodDays,
      keywords: 'jupiter galilean',
    }),
  ),
  ...ASTEROIDS.map(fromAsteroid),
  {
    id: HALLEY.id,
    info: {
      id: HALLEY.id,
      name: HALLEY.name,
      kind: 'Comet',
      subtitle: '1P/Halley · periodic comet',
      brief: HALLEY.brief,
      facts: HALLEY.facts,
      color: HALLEY.color,
    },
    stop: -1,
    exploreDist: 0.8,
    keywords: 'comet 1p',
  },
  {
    id: VOYAGER.id,
    info: {
      id: VOYAGER.id,
      name: VOYAGER.name,
      kind: 'Spacecraft',
      subtitle: 'Interstellar space',
      brief: VOYAGER.brief,
      facts: VOYAGER.facts,
      color: VOYAGER.color,
    },
    stop: -1,
    exploreDist: 0.9,
    keywords: 'spacecraft probe nasa',
  },
  {
    id: JWST.id,
    info: {
      id: JWST.id,
      name: JWST.name,
      kind: 'Spacecraft',
      subtitle: 'Sun–Earth L2',
      brief: JWST.brief,
      facts: JWST.facts,
      color: JWST.color,
    },
    stop: -1,
    exploreDist: 0.35,
    keywords: 'jwst webb telescope spacecraft',
  },
  fromGalaxy(MILKY_WAY),
  ...NEIGHBOR_GALAXIES.map(fromGalaxy),
]

const BY_ID = new Map(CATALOG.map((e) => [e.id, e]))

export function getEntry(id: string | null | undefined): CatalogEntry | undefined {
  return id ? BY_ID.get(id) : undefined
}

export function getInfo(id: string): BodyInfo | undefined {
  return BY_ID.get(id)?.info
}

/** Camera framing distance for a catalog entry in the given scale mode. */
export function entryDistance(e: CatalogEntry, mode: ScaleMode): number {
  if (!e.radiusKm || !e.bodyKind) return e.exploreDist
  return framingDistance(e.exploreDist, e.radiusKm, e.bodyKind, mode)
}
