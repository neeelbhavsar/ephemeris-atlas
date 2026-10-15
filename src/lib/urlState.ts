import type { ScaleMode } from './scale'

/**
 * Shareable view state, e.g. `?t=2027-08-02&focus=mars&scale=true`.
 * `t` accepts a date (YYYY-MM-DD, taken as 00:00 UTC) or a full ISO timestamp.
 */
export interface UrlState {
  t?: number
  focus?: string
  scale?: ScaleMode
}

export function readUrlState(): UrlState {
  if (typeof window === 'undefined') return {}
  const q = new URLSearchParams(window.location.search)
  const out: UrlState = {}
  const t = q.get('t')
  if (t) {
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(t) ? `${t}T00:00:00Z` : t
    const ms = Date.parse(iso)
    if (Number.isFinite(ms)) out.t = ms
  }
  const focus = q.get('focus')
  if (focus) out.focus = focus.toLowerCase()
  const scale = q.get('scale')
  if (scale === 'true') out.scale = 'true'
  return out
}

/** Build a share URL for the given view. */
export function buildShareUrl(state: { t: number; focus: string; scale: ScaleMode }): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  const d = new Date(state.t)
  // minute precision keeps links short but exact enough to reproduce the view
  url.searchParams.set('t', d.toISOString().slice(0, 16) + 'Z')
  url.searchParams.set('focus', state.focus)
  if (state.scale === 'true') url.searchParams.set('scale', 'true')
  return url.toString()
}

/** Keep the address bar in sync without adding history entries. */
export function writeUrlState(state: { t?: number; focus: string; scale: ScaleMode }) {
  const url = new URL(window.location.href)
  if (state.t != null) url.searchParams.set('t', new Date(state.t).toISOString().slice(0, 16) + 'Z')
  else url.searchParams.delete('t')
  if (state.focus && state.focus !== 'sun') url.searchParams.set('focus', state.focus)
  else url.searchParams.delete('focus')
  if (state.scale === 'true') url.searchParams.set('scale', 'true')
  else url.searchParams.delete('scale')
  const next = url.pathname + (url.search ? url.search : '') + url.hash
  if (next !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(null, '', next)
  }
}
