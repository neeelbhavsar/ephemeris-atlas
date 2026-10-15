import type { OrbitalElements } from '../lib/kepler'
import type { Fact } from './solarSystem'

/** Jupiter's four Galilean moons — positions from astronomy-engine's JupiterMoons(). */
export interface GalileanMoon {
  id: 'io' | 'europa' | 'ganymede' | 'callisto'
  name: string
  radiusKm: number
  /** mean orbital radius, km */
  orbitKm: number
  periodDays: number
  gravity: number
  color: string
  brief: string
  facts: Fact[]
}

export const GALILEAN_MOONS: GalileanMoon[] = [
  {
    id: 'io',
    name: 'Io',
    radiusKm: 1821.6,
    orbitKm: 421_700,
    periodDays: 1.769,
    gravity: 1.8,
    color: '#e8c95a',
    brief:
      'The most volcanically active world known — over 400 active volcanoes, squeezed and heated by Jupiter’s tides.',
    facts: [
      { label: 'Diameter', value: '3,643 km' },
      { label: 'Orbit', value: '1.77 days' },
      { label: 'Dist. Jupiter', value: '421,700 km' },
      { label: 'Volcanoes', value: '400+' },
    ],
  },
  {
    id: 'europa',
    name: 'Europa',
    radiusKm: 1560.8,
    orbitKm: 671_034,
    periodDays: 3.551,
    gravity: 1.31,
    color: '#d9cdb8',
    brief:
      'An ice-shelled moon hiding a global salt-water ocean with twice the water of Earth’s oceans — a prime target in the search for life.',
    facts: [
      { label: 'Diameter', value: '3,122 km' },
      { label: 'Orbit', value: '3.55 days' },
      { label: 'Dist. Jupiter', value: '671,000 km' },
      { label: 'Ice shell', value: '15–25 km' },
    ],
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    radiusKm: 2634.1,
    orbitKm: 1_070_412,
    periodDays: 7.155,
    gravity: 1.43,
    color: '#a99c8c',
    brief:
      'The largest moon in the solar system — bigger than Mercury — and the only moon with its own magnetic field.',
    facts: [
      { label: 'Diameter', value: '5,268 km' },
      { label: 'Orbit', value: '7.15 days' },
      { label: 'Dist. Jupiter', value: '1.07 million km' },
      { label: 'Rank', value: 'Largest moon' },
    ],
  },
  {
    id: 'callisto',
    name: 'Callisto',
    radiusKm: 2410.3,
    orbitKm: 1_882_709,
    periodDays: 16.689,
    gravity: 1.24,
    color: '#6f6457',
    brief:
      'The most heavily cratered surface in the solar system — an ancient, geologically dead face that has barely changed in 4 billion years.',
    facts: [
      { label: 'Diameter', value: '4,821 km' },
      { label: 'Orbit', value: '16.7 days' },
      { label: 'Dist. Jupiter', value: '1.88 million km' },
      { label: 'Surface age', value: '~4 billion yrs' },
    ],
  },
]

/** 1P/Halley — JPL SBDB elements (epoch JD 2439875.5, J2000 ecliptic). */
export const HALLEY = {
  id: 'halley',
  name: "Halley's Comet",
  radiusKm: 5.5,
  color: '#bfe6ff',
  elements: {
    a: 17.92863504856923,
    e: 0.9679359956953211,
    i: 162.1905300439129,
    om: 59.09894720612437,
    w: 112.2414314637764,
    ma: 274.3823371366792,
    n: 0.01298324443268444,
    epochJd: 2439875.5,
  } satisfies OrbitalElements,
  brief:
    'The most famous periodic comet, returning every ~76 years on a backwards (retrograde) orbit. It passed aphelion beyond Neptune in late 2023 and will next brighten our skies in 2061.',
  facts: [
    { label: 'Nucleus', value: '15 × 8 km' },
    { label: 'Period', value: '~76 yrs' },
    { label: 'Perihelion', value: '0.59 AU' },
    { label: 'Aphelion', value: '35 AU' },
    { label: 'Last seen', value: '1986' },
    { label: 'Next', value: 'July 2061' },
  ] as Fact[],
}

/**
 * Voyager 1 — heading out of the solar system toward Ophiuchus (RA 17h13m,
 * Dec +12°). Distance is a linear fit to NASA/JPL telemetry: it reached one
 * light-day (173.1 AU) in mid-November 2026, receding at ~3.57 AU/year.
 */
export const VOYAGER = {
  id: 'voyager1',
  name: 'Voyager 1',
  color: '#ffe9a8',
  raDeg: 258.2,
  decDeg: 12.1,
  refDistAu: 173.14,
  refDateMs: Date.UTC(2026, 10, 15),
  auPerYear: 3.57,
  brief:
    'Launched in 1977, the most distant human-made object. It crossed into interstellar space in 2012 and is now about one light-day from Earth — its radio signal takes nearly 24 hours to reach us.',
  facts: [
    { label: 'Launched', value: '5 Sep 1977' },
    { label: 'Speed', value: '17 km/s' },
    { label: 'Interstellar', value: 'since Aug 2012' },
    { label: 'Power', value: 'RTG (decaying)' },
  ] as Fact[],
}

/** James Webb Space Telescope, orbiting the Sun–Earth L2 point (1.5 million km anti-sunward). */
export const JWST = {
  id: 'jwst',
  name: 'James Webb Space Telescope',
  color: '#f5c75a',
  l2Au: 0.01,
  brief:
    'The largest space telescope ever launched, parked 1.5 million km from Earth on the far side from the Sun, where its tennis-court-sized sunshield keeps it at −233 °C.',
  facts: [
    { label: 'Launched', value: '25 Dec 2021' },
    { label: 'Mirror', value: '6.5 m (18 hexes)' },
    { label: 'Orbit', value: 'Sun–Earth L2' },
    { label: 'Dist. Earth', value: '~1.5 million km' },
  ] as Fact[],
}
