import { create } from 'zustand'
import type { Fact } from './data/solarSystem'
import type { ScaleMode } from './lib/scale'

export interface HoverInfo {
  name: string
  kind: string
  subtitle?: string
  brief: string
  facts: Fact[]
  color: string
  /** astronomy-engine body name — enables a live "distance from Earth" readout */
  aeBody?: string
}

interface AppState {
  /** currently hovered body (null = nothing) */
  hover: HoverInfo | null
  setHover: (h: HoverInfo | null) => void

  /** last pointer position in px, for the floating hover card */
  pointer: { x: number; y: number }
  setPointer: (x: number, y: number) => void

  /** simulation speed, in days per real second */
  speed: number
  setSpeed: (s: number) => void

  scaleMode: ScaleMode
  setScaleMode: (m: ScaleMode) => void

  /** throttled simulation date, for the HUD clock */
  simDateMs: number
  setSimDateMs: (ms: number) => void

  /** body the camera is focused on (drives the top nav highlight) */
  focusId: string
  setFocusId: (id: string) => void

  /** request to scroll the tour to a given stop index */
  scrollRequest: number | null
  requestScrollTo: (index: number) => void
  clearScrollRequest: () => void

  /** bump to reset the simulation clock back to the real current time */
  nowToken: number
  resetNow: () => void
}

export const useStore = create<AppState>((set) => ({
  hover: null,
  setHover: (hover) => set({ hover }),

  pointer: { x: 0, y: 0 },
  setPointer: (x, y) => set({ pointer: { x, y } }),

  speed: 7, // 1 week per second by default — planets visibly move
  setSpeed: (speed) => set({ speed }),

  scaleMode: 'explore',
  setScaleMode: (scaleMode) => set({ scaleMode }),

  simDateMs: Date.now(),
  setSimDateMs: (simDateMs) => set({ simDateMs }),

  focusId: 'sun',
  setFocusId: (focusId) => set({ focusId }),

  scrollRequest: null,
  requestScrollTo: (index) => set({ scrollRequest: index }),
  clearScrollRequest: () => set({ scrollRequest: null }),

  nowToken: 0,
  resetNow: () => set((s) => ({ nowToken: s.nowToken + 1 })),
}))
