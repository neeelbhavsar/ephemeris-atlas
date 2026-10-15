/** Ordered stops for the scroll-driven camera tour. */
export interface Stop {
  id: string
  label: string
  /** camera framing distance from the body in "Enlarged" mode, scene units */
  dist: number
  /** short story caption shown while at this stop */
  story: string
}

export const STOPS: Stop[] = [
  {
    id: 'sun',
    label: 'The Sun',
    dist: 16,
    story:
      'The sunlight you see is 8 min 20 s old — that is how long light takes to cross the 150 million km to Earth. The Sun holds 99.86% of all the mass in the solar system.',
  },
  {
    id: 'mercury',
    label: 'Mercury',
    dist: 1.0,
    story:
      'Mercury spins so slowly that one solar day (176 Earth days) lasts two of its years. Its spin is locked in a 3:2 dance with its orbit.',
  },
  {
    id: 'venus',
    label: 'Venus',
    dist: 2.2,
    story:
      'Venus spins backwards, and slower than it orbits — the Sun rises in the west. A giant early impact, or tides in its crushing atmosphere, may have flipped it over.',
  },
  {
    id: 'earth',
    label: 'Earth',
    dist: 2.6,
    story:
      'The line between day and night here is real: it is drawn from the Sun’s actual direction at this exact moment. The lit cities are on the side facing away from it.',
  },
  {
    id: 'mars',
    label: 'Mars',
    dist: 1.6,
    story:
      'Olympus Mons rises 2.5× higher than Everest, and Valles Marineris would stretch across the United States. Mars lost most of its air when its magnetic field died.',
  },
  {
    id: 'jupiter',
    label: 'Jupiter',
    dist: 22,
    story:
      'The four dots around Jupiter are its Galilean moons — Io, Europa, Ganymede and Callisto — placed where they really are right now. Galileo first saw them in 1610.',
  },
  {
    id: 'saturn',
    label: 'Saturn',
    dist: 17,
    story:
      'Saturn’s rings are 280,000 km across yet mostly only about 10 m thick. Look for the planet’s shadow falling across them, and theirs across its clouds.',
  },
  {
    id: 'uranus',
    label: 'Uranus',
    dist: 8,
    story:
      'Uranus rolls around the Sun on its side, tipped 98° — probably by an Earth-sized collision. Each pole gets 42 years of daylight, then 42 years of night.',
  },
  {
    id: 'neptune',
    label: 'Neptune',
    dist: 8,
    story:
      'Neptune was found with mathematics before anyone saw it: in 1846 Le Verrier predicted where it must be from tiny wobbles in Uranus’s orbit.',
  },
  {
    id: 'pluto',
    label: 'Pluto',
    dist: 1.1,
    story:
      'Pluto was reclassified as a dwarf planet in 2006. New Horizons found a heart-shaped glacier of nitrogen ice here in 2015 — Tombaugh Regio.',
  },
  {
    id: 'galaxies',
    label: 'The Local Group',
    dist: 0,
    story:
      'Zoomed out about a hundred million times: the Sun sits ~26,000 light-years from the Milky Way’s centre, in an outer arm, with its planets tilted ~60° to the galactic disc.',
  },
]

export const GALAXY_STOP = STOPS.length - 1

export function stopIndex(id: string): number {
  return STOPS.findIndex((s) => s.id === id)
}
