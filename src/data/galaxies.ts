/**
 * The Local Group — our galactic neighbourhood. Distances and sizes are real;
 * the scene positions are a compressed, stylised layout (the true distances,
 * millions of light-years, cannot share a frame with a solar system). Real
 * figures live in the hover cards.
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
  /** stylised scene position (scene units, far from the Sun) */
  position: [number, number, number]
  /** scene radius of the galactic disc */
  size: number
  /** number of orbiting star-cluster sprites to hint at motion */
  clusters: number
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
  position: [0, -40, 0],
  size: 340,
  clusters: 0,
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
    position: [620, 210, -480],
    size: 240,
    clusters: 5,
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
    position: [-560, -140, -520],
    size: 130,
    clusters: 4,
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
    position: [-360, 180, 360],
    size: 90,
    clusters: 3,
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
    position: [420, -190, 420],
    size: 62,
    clusters: 2,
    brief:
      'A companion dwarf galaxy to the Large Magellanic Cloud, being slowly torn apart by the Milky Way’s gravity into a trailing stream of gas.',
  },
]
