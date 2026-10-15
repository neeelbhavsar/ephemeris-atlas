import { create } from 'zustand'
import type { BodyInfo } from './data/catalog'
import type { ScaleMode } from './lib/scale'
import { readUrlState } from './lib/urlState'

export type HoverInfo = BodyInfo

export type PanelId = 'search' | 'tonight' | 'time' | 'compare'

export type IntroPhase = 'title' | 'sweep' | 'done'

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const initialUrl = readUrlState()
const reduced = prefersReducedMotion()

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

  /** request to move the simulation clock to a date (token bumps each time) */
  dateRequest: { ms: number; token: number } | null
  jumpToDate: (ms: number) => void
  resetNow: () => void

  /** tour stop the camera is at (drives the nav highlight) */
  focusId: string
  setFocusId: (id: string) => void

  /** request to scroll the tour to a given stop index */
  scrollRequest: { index: number; instant: boolean } | null
  requestScrollTo: (index: number, instant?: boolean) => void
  clearScrollRequest: () => void

  /** body picked by click / tap / search — shows the info panel */
  selectedId: string | null
  /** non-stop body the camera is flying to (overrides the scroll tour) */
  focusOverride: string | null
  select: (id: string | null) => void
  setFocusOverride: (id: string | null) => void

  /** which side panel is open */
  panel: PanelId | null
  setPanel: (p: PanelId | null) => void
  togglePanel: (p: PanelId) => void

  /** user prefers reduced motion — start paused, no camera drift / intro sweep */
  reducedMotion: boolean
  setReducedMotion: (r: boolean) => void

  intro: IntroPhase
  setIntro: (p: IntroPhase) => void

  /** true while the camera is out in the Local Group view */
  inGalaxyView: boolean
  setInGalaxyView: (v: boolean) => void

  /** bump to capture a PNG of the canvas on the next frame */
  screenshotToken: number
  requestScreenshot: () => void

  toast: string | null
  showToast: (msg: string) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useStore = create<AppState>((set, get) => ({
  hover: null,
  setHover: (hover) => set({ hover }),

  pointer: { x: 0, y: 0 },
  setPointer: (x, y) => set({ pointer: { x, y } }),

  // 1 week per second by default so planets visibly move; a shared link with a
  // fixed time, or a reduced-motion preference, starts paused.
  speed: reduced || initialUrl.t != null ? 0 : 7,
  setSpeed: (speed) => set({ speed }),

  scaleMode: initialUrl.scale ?? 'explore',
  setScaleMode: (scaleMode) => set({ scaleMode }),

  simDateMs: initialUrl.t ?? Date.now(),
  setSimDateMs: (simDateMs) => set({ simDateMs }),

  dateRequest: initialUrl.t != null ? { ms: initialUrl.t, token: 0 } : null,
  jumpToDate: (ms) =>
    set((s) => ({ dateRequest: { ms, token: (s.dateRequest?.token ?? 0) + 1 }, simDateMs: ms })),
  resetNow: () => get().jumpToDate(Date.now()),

  focusId: 'sun',
  setFocusId: (focusId) => set({ focusId }),

  scrollRequest: null,
  requestScrollTo: (index, instant = false) =>
    set({ scrollRequest: { index, instant }, focusOverride: null }),
  clearScrollRequest: () => set({ scrollRequest: null }),

  selectedId: null,
  focusOverride: null,
  select: (selectedId) => set({ selectedId, ...(selectedId ? {} : { focusOverride: null }) }),
  setFocusOverride: (focusOverride) => set({ focusOverride }),

  panel: null,
  setPanel: (panel) => set({ panel }),
  togglePanel: (p) => set((s) => ({ panel: s.panel === p ? null : p })),

  reducedMotion: reduced,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  intro: 'title',
  setIntro: (intro) => set({ intro }),

  inGalaxyView: false,
  setInGalaxyView: (inGalaxyView) => set({ inGalaxyView }),

  screenshotToken: 0,
  requestScreenshot: () => set((s) => ({ screenshotToken: s.screenshotToken + 1 })),

  toast: null,
  showToast: (toast) => {
    clearTimeout(toastTimer)
    set({ toast })
    toastTimer = setTimeout(() => set({ toast: null }), 2600)
  },
}))

/** The deep-link focus requested by the URL at load time (consumed once). */
export const initialFocus = initialUrl.focus
