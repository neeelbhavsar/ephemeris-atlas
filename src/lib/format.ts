import { AU_KM } from '../data/solarSystem'
import { AU_PER_LY } from './galactic'

const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const one = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const two = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

/** Human distance: km → AU → light-years → thousand / million ly. */
export function formatDistance(au: number): string {
  if (au < 0.01) return `${int.format(au * AU_KM)} km`
  if (au < 10) return `${two.format(au)} AU`
  if (au < 5000) return `${int.format(au)} AU`
  const ly = au / AU_PER_LY
  if (ly < 1) return `${two.format(ly)} ly`
  if (ly < 1000) return `${one.format(ly)} ly`
  if (ly < 1e6) return `${int.format(ly)} ly`
  return `${two.format(ly / 1e6)} million ly`
}

export interface ScaleChoice {
  label: string
  au: number
}

const NICE = [1, 2, 5]

/** A round scale-bar length (in AU) that is between `minPx` and `maxPx` wide. */
export function niceScale(auPerPx: number, minPx = 60, maxPx = 150): ScaleChoice {
  const target = auPerPx * ((minPx + maxPx) / 2)
  // pick a unit: km, AU, ly, kly, Mly
  const units: { name: string; au: number }[] = [
    { name: 'km', au: 1 / AU_KM },
    { name: 'AU', au: 1 },
    { name: 'ly', au: AU_PER_LY },
    { name: 'kly', au: AU_PER_LY * 1e3 },
    { name: 'Mly', au: AU_PER_LY * 1e6 },
  ]
  let unit = units[0]
  for (const u of units) if (target >= u.au * 0.5) unit = u
  // km values get large — switch to "million km" style labels
  const inUnit = target / unit.au
  const exp = Math.floor(Math.log10(inUnit))
  let best = NICE[0] * 10 ** exp
  for (const n of NICE) {
    const v = n * 10 ** exp
    if (Math.abs(v - inUnit) < Math.abs(best - inUnit)) best = v
  }
  const label =
    unit.name === 'km' && best >= 1e6
      ? `${int.format(best / 1e6)} million km`
      : `${best >= 1 ? int.format(best) : best} ${unit.name}`
  return { label, au: best * unit.au }
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export function compass(azDeg: number): string {
  return COMPASS[Math.round((((azDeg % 360) + 360) % 360) / 45) % 8]
}

export const timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
export const dateFmt = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
export const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatHours(h: number): string {
  const a = Math.abs(h)
  if (a < 48) {
    const hh = Math.floor(a)
    const mm = Math.round((a - hh) * 60)
    return `${hh}h ${String(mm).padStart(2, '0')}m`
  }
  const days = a / 24
  return days < 1000 ? `${one.format(days)} days` : `${int.format(days)} days`
}

export function formatDays(d: number): string {
  if (d < 1000) return `${one.format(d)} days`
  return `${two.format(d / 365.25)} yrs`
}
