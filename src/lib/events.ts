import {
  AngleBetween,
  Body,
  GeoVector,
  Illumination,
  MoonPhase,
  SearchGlobalSolarEclipse,
  SearchLunarEclipse,
  SearchMaxElongation,
  SearchMoonPhase,
  SearchRelativeLongitude,
} from 'astronomy-engine'

export interface SkyEvent {
  id: string
  title: string
  detail: string
  date: Date
  /** body to focus the camera on when jumping */
  focus: string
  icon: string
}

const DAY = 86_400_000
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const CONJ_BODIES: { body: Body; name: string; id: string }[] = [
  { body: Body.Mercury, name: 'Mercury', id: 'mercury' },
  { body: Body.Venus, name: 'Venus', id: 'venus' },
  { body: Body.Mars, name: 'Mars', id: 'mars' },
  { body: Body.Jupiter, name: 'Jupiter', id: 'jupiter' },
  { body: Body.Saturn, name: 'Saturn', id: 'saturn' },
]

/** Close approaches of two bright planets on the sky (as seen from Earth), within `days`. */
export function findConjunctions(from: Date, days = 540, maxSepDeg = 2): SkyEvent[] {
  const n = CONJ_BODIES.length
  const sep = (t: Date, a: Body, b: Body) =>
    AngleBetween(GeoVector(a, t, true), GeoVector(b, t, true))
  // one geocentric vector per body per day, shared by every pair
  const daily = CONJ_BODIES.map((c) =>
    Array.from({ length: days + 1 }, (_, d) => GeoVector(c.body, new Date(from.getTime() + d * DAY), true)),
  )
  const out: SkyEvent[] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = CONJ_BODIES[i]
      const B = CONJ_BODIES[j]
      let prev2 = Infinity
      let prev = Infinity
      for (let d = 0; d <= days; d++) {
        const cur = AngleBetween(daily[i][d], daily[j][d])
        // local minimum at d-1
        if (prev < prev2 && prev <= cur && prev < maxSepDeg) {
          // refine hourly around the minimum
          let best = prev
          let bestT = from.getTime() + (d - 1) * DAY
          for (let h = -24; h <= 24; h++) {
            const t = from.getTime() + (d - 1) * DAY + h * 3_600_000
            const s = sep(new Date(t), A.body, B.body)
            if (s < best) {
              best = s
              bestT = t
            }
          }
          out.push({
            id: `conj-${A.id}-${B.id}-${bestT}`,
            title: `${A.name}–${B.name} conjunction`,
            detail: `${best.toFixed(2)}° apart in the sky`,
            date: new Date(bestT),
            focus: 'earth',
            icon: '☌',
          })
        }
        prev2 = prev
        prev = cur
      }
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/** Upcoming notable events after `from`, soonest first. */
export function upcomingEvents(from: Date): SkyEvent[] {
  const events: SkyEvent[] = []

  const lunar = SearchLunarEclipse(from)
  events.push({
    id: 'lunar',
    title: `${cap(lunar.kind)} lunar eclipse`,
    detail:
      lunar.sd_total > 0
        ? `Totality lasts ${Math.round(lunar.sd_total * 2)} min`
        : `${Math.round(lunar.obscuration * 100)}% of the Moon in Earth's shadow`,
    date: lunar.peak.date,
    focus: 'earth',
    icon: '◐',
  })

  const solar = SearchGlobalSolarEclipse(from)
  const where =
    solar.latitude != null && solar.longitude != null
      ? `Peak at ${Math.abs(solar.latitude).toFixed(0)}°${solar.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(solar.longitude).toFixed(0)}°${solar.longitude >= 0 ? 'E' : 'W'}`
      : 'Visible only as a partial eclipse'
  events.push({
    id: 'solar',
    title: `${cap(solar.kind)} solar eclipse`,
    detail: where,
    date: solar.peak.date,
    focus: 'earth',
    icon: '●',
  })

  for (const [body, name, id] of [
    [Body.Mars, 'Mars', 'mars'],
    [Body.Jupiter, 'Jupiter', 'jupiter'],
    [Body.Saturn, 'Saturn', 'saturn'],
  ] as const) {
    const t = SearchRelativeLongitude(body, 0, from)
    events.push({
      id: `opp-${id}`,
      title: `${name} at opposition`,
      detail: `Closest & brightest — mag ${Illumination(body, t).mag.toFixed(1)}`,
      date: t.date,
      focus: id,
      icon: '☍',
    })
  }

  const venus = SearchMaxElongation(Body.Venus, from)
  events.push({
    id: 'venus-elong',
    title: `Venus at greatest ${venus.visibility} elongation`,
    detail: `${venus.elongation.toFixed(1)}° from the Sun`,
    date: venus.time.date,
    focus: 'venus',
    icon: '✶',
  })

  const full = SearchMoonPhase(180, from, 40)
  if (full) {
    events.push({ id: 'full', title: 'Full Moon', detail: '', date: full.date, focus: 'moon', icon: '○' })
  }
  const nu = SearchMoonPhase(0, from, 40)
  if (nu) {
    events.push({ id: 'new', title: 'New Moon', detail: 'Darkest skies', date: nu.date, focus: 'moon', icon: '●' })
  }

  events.push(...findConjunctions(from).slice(0, 3))

  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

const PHASES = [
  'New Moon',
  'Waxing crescent',
  'First quarter',
  'Waxing gibbous',
  'Full Moon',
  'Waning gibbous',
  'Last quarter',
  'Waning crescent',
]

export function moonPhase(date: Date): { name: string; illumination: number; angle: number } {
  const angle = MoonPhase(date)
  const name = PHASES[Math.round(angle / 45) % 8]
  return { name, illumination: Illumination(Body.Moon, date).phase_fraction, angle }
}
