/**
 * Real solar-system data. Physical figures are the accepted mean values
 * (NASA planetary fact sheets). Positions are NOT stored here — they are
 * computed live from `astronomy-engine` (see src/lib/ephemeris.ts), so the
 * scene shows every body where it actually is right now.
 */

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
  texture: string
  /** clouds overlay (Earth) */
  clouds?: string
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
  texture: '/textures/2k_sun.jpg',
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
    texture: '/textures/2k_mercury.jpg',
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
    texture: '/textures/2k_venus_surface.jpg',
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
    texture: '/textures/2k_earth_daymap.jpg',
    clouds: '/textures/2k_earth_clouds.jpg',
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
    texture: '/textures/2k_mars.jpg',
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
    texture: '/textures/2k_jupiter.jpg',
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
    texture: '/textures/2k_saturn.jpg',
    ring: { texture: '/textures/2k_saturn_ring_alpha.png', inner: 1.2, outer: 2.3 },
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
    texture: '/textures/2k_uranus.jpg',
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
    texture: '/textures/2k_neptune.jpg',
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
  texture: '/textures/2k_moon.jpg',
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
 * Named asteroids in the main belt (between Mars and Jupiter). These have no
 * astronomy-engine ephemeris, so their positions use a simple circular orbit
 * (clearly an approximation) — enough to give each a moving, hoverable body.
 */
export interface Asteroid {
  id: string
  name: string
  radiusKm: number
  semiMajorAu: number
  orbitalPeriodDays: number
  /** phase offset so they don't all line up, degrees */
  phaseDeg: number
  color: string
  brief: string
  facts: Fact[]
}

export const ASTEROIDS: Asteroid[] = [
  {
    id: 'ceres',
    name: 'Ceres',
    radiusKm: 473,
    semiMajorAu: 2.77,
    orbitalPeriodDays: 1682,
    phaseDeg: 20,
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
    semiMajorAu: 2.36,
    orbitalPeriodDays: 1325,
    phaseDeg: 160,
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
    semiMajorAu: 2.77,
    orbitalPeriodDays: 1686,
    phaseDeg: 285,
    color: '#8f8577',
    brief:
      'The third-largest asteroid, on a steeply tilted orbit — a battered protoplanet left over from the early solar system.',
    facts: [
      { label: 'Class', value: 'Asteroid' },
      { label: 'Diameter', value: '512 km' },
      { label: 'Dist. Sun', value: '2.77 AU' },
      { label: 'Year', value: '4.6 yrs' },
    ],
  },
]

export const ALL_PLANETS_AND_SUN = [SUN, ...PLANETS]
