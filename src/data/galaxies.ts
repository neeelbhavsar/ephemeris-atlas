/**
 * The Local Group — our galactic neighbourhood. Each galaxy sits in its TRUE
 * direction on the sky (galactic longitude/latitude) as seen from the Sun, but
 * at a compressed distance — Andromeda's real 2.5 million light-years would put
 * it ~16,000 Milky-Way-radii away. Real figures live in the info cards.
 *
 * The Milky Way itself is placed honestly: the Sun sits ~26,000 ly from its
 * centre, in an outer arm, with the disc tilted ~60° to the planets' orbits.
 */

export interface NeighborGalaxy {
  id: string
  name: string
  type: string
  /** distance from the Milky Way */
  distance: string
  diameter: string
  stars: string
  color: string
  /** galactic longitude / latitude of the galaxy as seen from the Sun, degrees */
  l: number
  b: number
  /** compressed distance from the Sun, galaxy scene units */
  sceneDist: number
  /** scene radius of the galactic disc */
  size: number
  shape: 'spiral' | 'barred' | 'irregular'
  /**
   * Neighbours' disc orientation relative to the default Local Group view:
   * inclination (0 = face-on, 90 = edge-on) and position angle, degrees.
   * The Milky Way ignores these — it uses the real galactic pole.
   */
  inclination: number
  pa: number
  brief: string
}

export const MILKY_WAY: NeighborGalaxy = {
  id: 'milkyway',
  name: 'Milky Way',
  type: 'Barred Spiral · SBbc',
  distance: '0 — you are here',
  diameter: '105,700 light-years',
  stars: '100–400 billion',
  color: '#cbb6ff',
  l: 0,
  b: 0,
  sceneDist: 0, // placed from the real Galactic Centre direction instead
  size: 340,
  shape: 'barred',
  inclination: 0,
  pa: 0,
  brief:
    'Our home galaxy. The Sun and its planets sit about 26,000 light-years from the core, on the Orion Arm, completing one galactic orbit every 225 million years.',
}

export const NEIGHBOR_GALAXIES: NeighborGalaxy[] = [
  {
    id: 'andromeda',
    name: 'Andromeda (M31)',
    type: 'Barred Spiral · SA(s)b',
    distance: '2.537 million ly',
    diameter: '220,000 light-years',
    stars: '~1 trillion',
    color: '#8ec5ff',
    l: 121.17,
    b: -21.57,
    sceneDist: 1700,
    size: 430,
    shape: 'spiral',
    inclination: 58,
    pa: 35,
    brief:
      'The nearest major galaxy and the largest in the Local Group. It is racing toward the Milky Way at 110 km/s and will merge with us in ~4.5 billion years.',
  },
  {
    id: 'triangulum',
    name: 'Triangulum (M33)',
    type: 'Spiral · SA(s)cd',
    distance: '2.73 million ly',
    diameter: '60,000 light-years',
    stars: '~40 billion',
    color: '#a0f0d0',
    l: 133.61,
    b: -31.33,
    sceneDist: 2050,
    size: 170,
    shape: 'spiral',
    inclination: 40,
    pa: 110,
    brief:
      'The third-largest galaxy in the Local Group and a possible satellite of Andromeda. A hotbed of star formation dense with glowing nebulae.',
  },
  {
    id: 'lmc',
    name: 'Large Magellanic Cloud',
    type: 'Dwarf Irregular · SB(s)m',
    distance: '158,200 ly',
    diameter: '32,200 light-years',
    stars: '~30 billion',
    color: '#ffd59e',
    l: 280.47,
    b: -32.89,
    sceneDist: 860,
    size: 105,
    shape: 'irregular',
    inclination: 35,
    pa: 70,
    brief:
      'A dwarf satellite galaxy orbiting the Milky Way, visible to the naked eye from the southern sky. Home to the Tarantula Nebula, the brightest star-forming region known.',
  },
  {
    id: 'smc',
    name: 'Small Magellanic Cloud',
    type: 'Dwarf Irregular · SB(s)m pec',
    distance: '199,000 ly',
    diameter: '18,900 light-years',
    stars: '~3 billion',
    color: '#ffb0c8',
    l: 302.8,
    b: -44.3,
    sceneDist: 960,
    size: 64,
    shape: 'irregular',
    inclination: 50,
    pa: 150,
    brief:
      'A companion dwarf galaxy to the Large Magellanic Cloud, being slowly torn apart by the Milky Way’s gravity into a trailing stream of gas.',
  },
]
