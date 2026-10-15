/**
 * Real solar-system data. Physical figures are the accepted mean values
 * (NASA planetary fact sheets). Positions are NOT stored here — they are
 * computed live from `astronomy-engine` (see src/lib/ephemeris.ts), so the
 * scene shows every body where it actually is right now.
 */

import type { OrbitalElements } from '../lib/kepler'

export type BodyKind = 'star' | 'planet' | 'dwarf' | 'moon' | 'asteroid'

export interface Fact {
  label: string
  value: string
}

export interface Ring {
  texture: string
  /** ring inner/outer radius as a multiple of the planet radius */
  inner: number
  outer: number
}

export interface Body {
  id: string
  name: string
  kind: BodyKind
  /** astronomy-engine body name for real ephemeris; undefined => manual orbit */
  aeBody?: string
  /** mean radius, km */
  radiusKm: number
  /** semi-major axis, AU (heliocentric). undefined for the Sun */
  semiMajorAu?: number
  /** sidereal orbital period, days */
  orbitalPeriodDays?: number
  /** sidereal rotation period, hours. Negative = retrograde spin */
  rotationHours: number
  /** axial tilt / obliquity, degrees */
  axialTiltDeg: number
  moons: number
  /** surface gravity, m/s² (cloud tops for the giants) */
  gravity: number
  /** surface map; omitted => procedural texture */
  texture?: string
  /** clouds overlay (Earth) — used as an alpha map */
  clouds?: string
  /** city-lights map shown on the night side (Earth) */
  night?: string
  /** fresnel atmosphere rim */
  atmosphere?: { color: string; strength: number }
  ring?: Ring
  /** UI accent + emissive tint */
  color: string
  brief: string
  facts: Fact[]
}

export const AU_KM = 149_597_870.7

export const SUN: Body = {
  id: 'sun',
  name: 'The Sun',
  kind: 'star',
  aeBody: 'Sun',
  radiusKm: 696_340,
  rotationHours: 609.12, // ~25.38 days at the equator
  axialTiltDeg: 7.25,
  moons: 0,
  gravity: 274,
  texture: '/textures/2k_sun.webp',
  color: '#ffcc55',
  brief:
    'A G-type main-sequence star holding 99.86% of the mass of the entire solar system. Its gravity commands every world that follows.',
  facts: [
    { label: 'Type', value: 'G2V star' },
    { label: 'Diameter', value: '1,392,700 km' },
    { label: 'Surface', value: '5,505 °C' },
    { label: 'Core', value: '15 million °C' },
    { label: 'Rotation', value: '25.4 days' },
    { label: 'Age', value: '4.6 billion yrs' },
  ],
}

export const PLANETS: Body[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    kind: 'planet',
    aeBody: 'Mercury',
    radiusKm: 2439.7,
    semiMajorAu: 0.387,
    orbitalPeriodDays: 87.97,
    rotationHours: 1407.6,
    axialTiltDeg: 0.03,
    moons: 0,
    gravity: 3.7,
    texture: '/textures/2k_mercury.webp',
    color: '#b7a89a',
    brief:
      'The smallest planet and closest to the Sun — a cratered, airless world of brutal temperature swings.',
    facts: [
      { label: 'Diameter', value: '4,879 km' },
      { label: 'Dist. Sun', value: '0.39 AU' },
      { label: 'Year', value: '88 days' },
      { label: 'Day', value: '58.6 days' },
      { label: 'Temp', value: '−173 to 427 °C' },
      { label: 'Moons', value: '0' },
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    kind: 'planet',
    aeBody: 'Venus',
    radiusKm: 6051.8,
    semiMajorAu: 0.723,
    orbitalPeriodDays: 224.7,
    rotationHours: -5832.5, // retrograde
    axialTiltDeg: 177.4,
    moons: 0,
    gravity: 8.87,
    atmosphere: { color: '#ffd9a0', strength: 1.1 },
    texture: '/textures/2k_venus_surface.webp',
    color: '#d9a066',
    brief:
      'A scorched twin of Earth cloaked in thick CO₂ clouds. A runaway greenhouse makes it the hottest planet of all.',
    facts: [
      { label: 'Diameter', value: '12,104 km' },
      { label: 'Dist. Sun', value: '0.72 AU' },
      { label: 'Year', value: '225 days' },
      { label: 'Day', value: '243 days (retro)' },
      { label: 'Temp', value: '465 °C' },
      { label: 'Moons', value: '0' },
    ],
  },
  {
    id: 'earth',
    name: 'Earth',
    kind: 'planet',
    aeBody: 'Earth',
    radiusKm: 6371.0,
    semiMajorAu: 1.0,
    orbitalPeriodDays: 365.256,
    rotationHours: 23.934,
    axialTiltDeg: 23.44,
    moons: 1,
    gravity: 9.81,
    atmosphere: { color: '#6fb6ff', strength: 1.2 },
    texture: '/textures/2k_earth_daymap.webp',
    clouds: '/textures/2k_earth_clouds.webp',
    night: '/textures/2k_earth_nightmap.webp',
    color: '#4a90d9',
    brief:
      'Our home — the only known world with liquid-water oceans and life. Reference point for every distance shown here.',
    facts: [
      { label: 'Diameter', value: '12,742 km' },
      { label: 'Dist. Sun', value: '1.00 AU' },
      { label: 'Year', value: '365.25 days' },
      { label: 'Day', value: '23h 56m' },
      { label: 'Temp', value: '15 °C avg' },
      { label: 'Moons', value: '1' },
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    kind: 'planet',
    aeBody: 'Mars',
    radiusKm: 3389.5,
    semiMajorAu: 1.524,
    orbitalPeriodDays: 686.98,
    rotationHours: 24.62,
    axialTiltDeg: 25.19,
    moons: 2,
    gravity: 3.71,
    texture: '/textures/2k_mars.webp',
    color: '#c1440e',
    brief:
      'The rusty red planet, home to the largest volcano and canyon in the solar system, and prime target in the search for past life.',
    facts: [
      { label: 'Diameter', value: '6,779 km' },
      { label: 'Dist. Sun', value: '1.52 AU' },
      { label: 'Year', value: '687 days' },
      { label: 'Day', value: '24h 37m' },
      { label: 'Temp', value: '−65 °C avg' },
      { label: 'Moons', value: '2 (Phobos, Deimos)' },
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    kind: 'planet',
    aeBody: 'Jupiter',
    radiusKm: 69_911,
    semiMajorAu: 5.203,
    orbitalPeriodDays: 4332.6,
    rotationHours: 9.925,
    axialTiltDeg: 3.13,
    moons: 95,
    gravity: 24.79,
    texture: '/textures/2k_jupiter.webp',
    color: '#d8a678',
    brief:
      'The king of planets — a gas giant more massive than all others combined, ruled by the centuries-old Great Red Spot storm.',
    facts: [
      { label: 'Diameter', value: '139,820 km' },
      { label: 'Dist. Sun', value: '5.20 AU' },
      { label: 'Year', value: '11.86 yrs' },
      { label: 'Day', value: '9h 56m' },
      { label: 'Temp', value: '−110 °C' },
      { label: 'Moons', value: '95' },
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    kind: 'planet',
    aeBody: 'Saturn',
    radiusKm: 58_232,
    semiMajorAu: 9.537,
    orbitalPeriodDays: 10_759,
    rotationHours: 10.66,
    axialTiltDeg: 26.73,
    moons: 146,
    gravity: 10.44,
    texture: '/textures/2k_saturn.webp',
    ring: { texture: '/textures/2k_saturn_ring_alpha.webp', inner: 1.2, outer: 2.3 },
    color: '#e3c07a',
    brief:
      'The jewel of the solar system, girdled by a dazzling system of ice rings spanning hundreds of thousands of kilometres.',
    facts: [
      { label: 'Diameter', value: '116,460 km' },
      { label: 'Dist. Sun', value: '9.54 AU' },
      { label: 'Year', value: '29.4 yrs' },
      { label: 'Day', value: '10h 40m' },
      { label: 'Temp', value: '−140 °C' },
      { label: 'Moons', value: '146' },
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    kind: 'planet',
    aeBody: 'Uranus',
    radiusKm: 25_362,
    semiMajorAu: 19.191,
    orbitalPeriodDays: 30_687,
    rotationHours: -17.24, // retrograde
    axialTiltDeg: 97.77,
    moons: 28,
    gravity: 8.69,
    atmosphere: { color: '#b8f1ff', strength: 0.7 },
    texture: '/textures/2k_uranus.webp',
    color: '#a9dbe6',
    brief:
      'An ice giant tipped completely on its side, rolling around the Sun so that each pole sees 42 years of continuous sunlight.',
    facts: [
      { label: 'Diameter', value: '50,724 km' },
      { label: 'Dist. Sun', value: '19.19 AU' },
      { label: 'Year', value: '84 yrs' },
      { label: 'Day', value: '17h 14m (retro)' },
      { label: 'Tilt', value: '97.8°' },
      { label: 'Moons', value: '28' },
    ],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    kind: 'planet',
    aeBody: 'Neptune',
    radiusKm: 24_622,
    semiMajorAu: 30.07,
    orbitalPeriodDays: 60_190,
    rotationHours: 16.11,
    axialTiltDeg: 28.32,
    moons: 16,
    gravity: 11.15,
    atmosphere: { color: '#5a8cff', strength: 1.1 },
    texture: '/textures/2k_neptune.webp',
    color: '#3d6ef2',
    brief:
      'The windiest world known — a deep-blue ice giant at the dark edge of the planetary realm, with supersonic 2,100 km/h storms.',
    facts: [
      { label: 'Diameter', value: '49,244 km' },
      { label: 'Dist. Sun', value: '30.07 AU' },
      { label: 'Year', value: '164.8 yrs' },
      { label: 'Day', value: '16h 6m' },
      { label: 'Winds', value: '2,100 km/h' },
      { label: 'Moons', value: '16' },
    ],
  },
]

/** Pluto — a dwarf planet, but with a real ephemeris and its own tour stop. */
export const PLUTO: Body = {
  id: 'pluto',
  name: 'Pluto',
  kind: 'dwarf',
  aeBody: 'Pluto',
  radiusKm: 1188.3,
  semiMajorAu: 39.48,
  orbitalPeriodDays: 90_560,
  rotationHours: -153.29, // retrograde
  axialTiltDeg: 122.53,
  moons: 5,
  gravity: 0.62,
  color: '#d8c3a5',
  brief:
    'A dwarf planet in the Kuiper Belt with a heart-shaped glacier of nitrogen ice, mountains of water ice and a hazy blue sky.',
  facts: [
    { label: 'Diameter', value: '2,377 km' },
    { label: 'Dist. Sun', value: '39.5 AU' },
    { label: 'Year', value: '248 yrs' },
    { label: 'Day', value: '6.4 days (retro)' },
    { label: 'Temp', value: '−229 °C' },
    { label: 'Moons', value: '5 (Charon…)' },
  ],
}

/** Earth's Moon — rendered as a child of Earth with an exaggerated orbit. */
export const MOON: Body = {
  id: 'moon',
  name: 'The Moon',
  kind: 'moon',
  aeBody: 'Moon',
  radiusKm: 1737.4,
  semiMajorAu: 0.00257, // ~384,400 km
  orbitalPeriodDays: 27.32,
  rotationHours: 655.7, // tidally locked
  axialTiltDeg: 6.68,
  moons: 0,
  gravity: 1.62,
  texture: '/textures/2k_moon.webp',
  color: '#cfcfcf',
  brief:
    "Earth's only natural satellite and the only other world humans have walked on. Tidally locked, so it always shows us one face.",
  facts: [
    { label: 'Diameter', value: '3,474 km' },
    { label: 'Dist. Earth', value: '384,400 km' },
    { label: 'Orbit', value: '27.3 days' },
    { label: 'Gravity', value: '0.17 g' },
    { label: 'Landings', value: '6 crewed' },
  ],
}

/**
 * Named asteroids in the main belt (between Mars and Jupiter). astronomy-engine
 * has no ephemeris for them, so they are propagated from their real JPL
 * Small-Body Database osculating elements (J2000 ecliptic) with a Kepler solver.
 */
export interface Asteroid {
  id: string
  name: string
  radiusKm: number
  semiMajorAu: number
  orbitalPeriodDays: number
  rotationHours: number
  gravity: number
  elements: OrbitalElements
  color: string
  brief: string
  facts: Fact[]
}

export const ASTEROIDS: Asteroid[] = [
  {
    id: 'ceres',
    name: 'Ceres',
    radiusKm: 473,
    semiMajorAu: 2.766,
    orbitalPeriodDays: 1680,
    rotationHours: 9.07,
    gravity: 0.28,
    // JPL SBDB, epoch JD 2461200.5
    elements: {
      a: 2.765552595034094,
      e: 0.07969229514816586,
      i: 10.58802780183462,
      om: 80.24862682043221,
      w: 73.29421453021587,
      ma: 274.4193463761342,
      n: 0.21430445064843,
      epochJd: 2461200.5,
    },
    color: '#9a8f80',
    brief:
      'The largest object in the asteroid belt and the closest dwarf planet — round enough for its own gravity to have shaped it.',
    facts: [
      { label: 'Class', value: 'Dwarf planet' },
      { label: 'Diameter', value: '940 km' },
      { label: 'Dist. Sun', value: '2.77 AU' },
      { label: 'Year', value: '4.6 yrs' },
    ],
  },
  {
    id: 'vesta',
    name: 'Vesta',
    radiusKm: 262,
    semiMajorAu: 2.361,
    orbitalPeriodDays: 1325,
    rotationHours: 5.34,
    gravity: 0.25,
    elements: {
      a: 2.361365965127599,
      e: 0.09020374382834395,
      i: 7.143925545058711,
      om: 103.701293265032,
      w: 151.4686478221564,
      ma: 81.19015607686903,
      n: 0.2716183613599909,
      epochJd: 2461200.5,
    },
    color: '#b3a894',
    brief:
      'The second-largest asteroid and the brightest — occasionally visible from Earth with the naked eye.',
    facts: [
      { label: 'Class', value: 'Asteroid' },
      { label: 'Diameter', value: '525 km' },
      { label: 'Dist. Sun', value: '2.36 AU' },
      { label: 'Year', value: '3.6 yrs' },
    ],
  },
  {
    id: 'pallas',
    name: 'Pallas',
    radiusKm: 256,
    semiMajorAu: 2.770,
    orbitalPeriodDays: 1684,
    rotationHours: 7.81,
    gravity: 0.21,
    elements: {
      a: 2.769559010737709,
      e: 0.2307000995648547,
      i: 34.93279321851542,
      om: 172.8866193357694,
      w: 310.9699161652136,
      ma: 254.2496521742734,
      n: 0.2138396029251949,
      epochJd: 2461200.5,
    },
    color: '#8f8577',
    brief:
      'The third-largest asteroid, on an orbit tilted a steep 34.9° to the planets — a battered protoplanet left over from the early solar system.',
    facts: [
      { label: 'Class', value: 'Asteroid' },
      { label: 'Diameter', value: '512 km' },
      { label: 'Dist. Sun', value: '2.77 AU' },
      { label: 'Inclination', value: '34.9°' },
    ],
  },
]

export const ALL_PLANETS_AND_SUN = [SUN, ...PLANETS, PLUTO]
