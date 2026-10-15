import { getEntry } from '../data/catalog'
import { useStore } from '../store'
import { STOPS, stopIndex } from '../three/tour'

/** Tour stop to scroll to first when focusing a body that isn't itself a stop. */
const ANCHOR: Record<string, string> = {
  moon: 'earth',
  jwst: 'earth',
  io: 'jupiter',
  europa: 'jupiter',
  ganymede: 'jupiter',
  callisto: 'jupiter',
  ceres: 'mars',
  vesta: 'mars',
  pallas: 'mars',
  halley: 'pluto',
  voyager1: 'pluto',
}

/**
 * Select a body and fly the camera to it: tour stops scroll the tour; anything
 * else scrolls to a nearby stop and then overrides the camera target.
 */
export function focusBody(id: string) {
  const entry = getEntry(id)
  if (!entry) return
  const s = useStore.getState()
  if (entry.stop >= 0) {
    s.requestScrollTo(entry.stop)
    useStore.setState({ selectedId: id })
    return
  }
  const anchor = entry.galaxy ? STOPS.length - 1 : stopIndex(ANCHOR[id] ?? 'sun')
  useStore.setState({
    scrollRequest: { index: anchor, instant: false },
    focusOverride: id,
    selectedId: id,
  })
}

/** Move one tour stop forward / backward. */
export function stepStop(delta: number) {
  const s = useStore.getState()
  const current = Math.max(0, stopIndex(s.focusId))
  const next = Math.min(STOPS.length - 1, Math.max(0, current + delta))
  s.requestScrollTo(next)
}
