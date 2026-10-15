import {
  Body,
  Equator,
  Horizon,
  Illumination,
  Observer,
  SearchAltitude,
  SearchRiseSet,
} from 'astronomy-engine'

export interface Location {
  lat: number
  lon: number
  label?: string
}

export interface TonightBody {
  id: string
  name: string
  body: Body
  /** highest altitude reached during the night window, degrees */
  maxAlt: number
  bestTime: Date | null
  bestAz: number
  /** altitude / azimuth at the chart moment */
  chartAlt: number
  chartAz: number
  rise: Date | null
  set: Date | null
  mag: number
  visibility: 'naked-eye' | 'binoculars' | 'telescope' | 'below-horizon'
}

export interface TonightReport {
  start: Date
  end: Date
  /** moment the sky chart represents (now if it's dark, else an hour into the night) */
  chartTime: Date
  bodies: TonightBody[]
}

const TARGETS: { id: string; name: string; body: Body }[] = [
  { id: 'moon', name: 'Moon', body: Body.Moon },
  { id: 'mercury', name: 'Mercury', body: Body.Mercury },
  { id: 'venus', name: 'Venus', body: Body.Venus },
  { id: 'mars', name: 'Mars', body: Body.Mars },
  { id: 'jupiter', name: 'Jupiter', body: Body.Jupiter },
  { id: 'saturn', name: 'Saturn', body: Body.Saturn },
  { id: 'uranus', name: 'Uranus', body: Body.Uranus },
  { id: 'neptune', name: 'Neptune', body: Body.Neptune },
]

const TWILIGHT = -6 // civil dusk: the brighter planets are already showing
const HOUR = 3_600_000

function horizontal(body: Body, t: Date, obs: Observer) {
  const eq = Equator(body, t, obs, true, true)
  return Horizon(t, obs, eq.ra, eq.dec, 'normal')
}

/** The coming night (or the current one, if it is already dark) at `date`. */
export function nightWindow(date: Date, obs: Observer): { start: Date; end: Date } {
  const sunAlt = horizontal(Body.Sun, date, obs).altitude
  let start: Date
  if (sunAlt < TWILIGHT) {
    start = date
  } else {
    const dusk = SearchAltitude(Body.Sun, obs, -1, date, 1.1, TWILIGHT)
    // midnight sun: no real night — just look at the next 12 hours
    if (!dusk) return { start: date, end: new Date(date.getTime() + 12 * HOUR) }
    start = dusk.date
  }
  const dawn = SearchAltitude(Body.Sun, obs, +1, start, 1.1, TWILIGHT)
  const end = dawn ? dawn.date : new Date(start.getTime() + 12 * HOUR)
  return { start, end }
}

export function tonight(date: Date, loc: Location): TonightReport {
  const obs = new Observer(loc.lat, loc.lon, 0)
  const { start, end } = nightWindow(date, obs)
  const chartTime =
    date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
      ? date
      : new Date(Math.min(start.getTime() + HOUR, end.getTime()))

  const span = end.getTime() - start.getTime()
  const steps = Math.max(8, Math.round(span / (15 * 60_000)))

  const bodies = TARGETS.map((tgt): TonightBody => {
    let maxAlt = -90
    let bestTime: Date | null = null
    let bestAz = 0
    for (let k = 0; k <= steps; k++) {
      const t = new Date(start.getTime() + (k / steps) * span)
      const h = horizontal(tgt.body, t, obs)
      if (h.altitude > maxAlt) {
        maxAlt = h.altitude
        bestTime = t
        bestAz = h.azimuth
      }
    }
    const chart = horizontal(tgt.body, chartTime, obs)
    const from = new Date(start.getTime() - 12 * HOUR)
    const rise = SearchRiseSet(tgt.body, obs, +1, from, 1.5)?.date ?? null
    const set = SearchRiseSet(tgt.body, obs, -1, rise ?? from, 1.5)?.date ?? null
    const mag = Illumination(tgt.body, bestTime ?? chartTime).mag
    let visibility: TonightBody['visibility'] = 'below-horizon'
    if (maxAlt > 7) {
      visibility = mag < 5.3 ? 'naked-eye' : mag < 8.5 ? 'binoculars' : 'telescope'
    }
    return {
      ...tgt,
      maxAlt,
      bestTime: maxAlt > 0 ? bestTime : null,
      bestAz,
      chartAlt: chart.altitude,
      chartAz: chart.azimuth,
      rise,
      set,
      mag,
      visibility,
    }
  })

  return { start, end, chartTime, bodies }
}

const STORAGE_KEY = 'ephemeris-atlas.location'

export function loadLocation(): Location | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Location
    return Number.isFinite(v.lat) && Number.isFinite(v.lon) ? v : null
  } catch {
    return null
  }
}

export function saveLocation(loc: Location) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
  } catch {
    /* storage may be unavailable (private mode) — the panel still works */
  }
}
