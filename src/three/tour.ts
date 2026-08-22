/** Ordered stops for the scroll-driven camera tour. */
export interface Stop {
  id: string
  label: string
  /** camera framing distance from the body, scene units */
  dist: number
}

export const STOPS: Stop[] = [
  { id: 'sun', label: 'The Sun', dist: 16 },
  { id: 'mercury', label: 'Mercury', dist: 1.0 },
  { id: 'venus', label: 'Venus', dist: 2.2 },
  { id: 'earth', label: 'Earth', dist: 2.6 },
  { id: 'mars', label: 'Mars', dist: 1.6 },
  { id: 'jupiter', label: 'Jupiter', dist: 14 },
  { id: 'saturn', label: 'Saturn', dist: 17 },
  { id: 'uranus', label: 'Uranus', dist: 8 },
  { id: 'neptune', label: 'Neptune', dist: 8 },
  { id: 'galaxies', label: 'The Local Group', dist: 0 },
]
