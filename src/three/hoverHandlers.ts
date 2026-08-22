import type { ThreeEvent } from '@react-three/fiber'
import type { Asteroid, Body } from '../data/solarSystem'
import type { NeighborGalaxy } from '../data/galaxies'
import { useStore, type HoverInfo } from '../store'

const KIND_LABEL: Record<string, string> = {
  star: 'Star',
  planet: 'Planet',
  dwarf: 'Dwarf planet',
  moon: 'Moon',
  asteroid: 'Asteroid',
}

export function infoFromBody(body: Body): HoverInfo {
  return {
    name: body.name,
    kind: KIND_LABEL[body.kind] ?? 'Body',
    subtitle: body.semiMajorAu
      ? `${body.semiMajorAu.toFixed(2)} AU from the Sun`
      : 'Center of the solar system',
    brief: body.brief,
    facts: body.facts,
    color: body.color,
    aeBody: body.aeBody,
  }
}

export function infoFromAsteroid(a: Asteroid): HoverInfo {
  return {
    name: a.name,
    kind: 'Asteroid belt',
    subtitle: `${a.semiMajorAu.toFixed(2)} AU from the Sun`,
    brief: a.brief,
    facts: a.facts,
    color: a.color,
  }
}

export function infoFromGalaxy(g: NeighborGalaxy): HoverInfo {
  return {
    name: g.name,
    kind: 'Galaxy',
    subtitle: g.type,
    brief: g.brief,
    facts: [
      { label: 'Distance', value: g.distance },
      { label: 'Diameter', value: g.diameter },
      { label: 'Stars', value: g.stars },
    ],
    color: g.color,
  }
}

/** Pointer event handlers that push hover state + cursor position to the store. */
export function makeHoverHandlers(info: HoverInfo) {
  const move = (e: ThreeEvent<PointerEvent>) => {
    useStore.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY)
  }
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      useStore.getState().setHover(info)
      useStore.getState().setPointer(e.nativeEvent.clientX, e.nativeEvent.clientY)
      document.body.style.cursor = 'pointer'
    },
    onPointerMove: move,
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      useStore.getState().setHover(null)
      document.body.style.cursor = 'auto'
    },
  }
}

/** Convenience for Sun / planets / moon. */
export function hoverHandlers(body: Body) {
  return makeHoverHandlers(infoFromBody(body))
}
