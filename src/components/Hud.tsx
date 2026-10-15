import { motion } from 'framer-motion'
import { useStore, type PanelId } from '../store'
import { buildShareUrl } from '../lib/urlState'
import Icon, { type IconName } from './Icon'

const SPEEDS: { label: string; short: string; value: number }[] = [
  { label: 'Pause', short: '❚❚', value: 0 },
  { label: '1 day/s', short: '1d', value: 1 },
  { label: '1 wk/s', short: '1w', value: 7 },
  { label: '1 mo/s', short: '1m', value: 30 },
  { label: '1 yr/s', short: '1y', value: 365 },
]

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})

const TOOLS: { id: PanelId; icon: IconName; label: string; hint?: string }[] = [
  { id: 'search', icon: 'search', label: 'Search', hint: '⌘K' },
  { id: 'tonight', icon: 'telescope', label: 'Tonight' },
  { id: 'time', icon: 'clock', label: 'Time travel' },
  { id: 'compare', icon: 'scale', label: 'Compare' },
]

async function share() {
  const s = useStore.getState()
  const url = buildShareUrl({
    t: s.simDateMs,
    focus: s.selectedId ?? s.focusId,
    scale: s.scaleMode,
  })
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ title: 'Ephemeris Atlas', url })
      return
    }
    await navigator.clipboard.writeText(url)
    s.showToast('Link copied — it opens this exact moment and view')
  } catch {
    s.showToast(url)
  }
}

export default function Hud() {
  const speed = useStore((s) => s.speed)
  const setSpeed = useStore((s) => s.setSpeed)
  const scaleMode = useStore((s) => s.scaleMode)
  const setScaleMode = useStore((s) => s.setScaleMode)
  const simDateMs = useStore((s) => s.simDateMs)
  const resetNow = useStore((s) => s.resetNow)
  const panel = useStore((s) => s.panel)
  const togglePanel = useStore((s) => s.togglePanel)
  const requestScreenshot = useStore((s) => s.requestScreenshot)

  const d = new Date(simDateMs)
  const live = Math.abs(simDateMs - Date.now()) < 60_000 && speed !== 0

  const toolBtn = 'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[11px] transition-colors'

  return (
    <>
      {/* top bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <h1 className="whitespace-nowrap font-display text-base font-bold tracking-tight text-white sm:text-2xl">
            Ephemeris Atlas
          </h1>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-cosmos-glow sm:block">
            Real-time orbital atlas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-end gap-2"
        >
          <div className="glass pointer-events-auto rounded-xl px-3 py-1.5 text-right sm:px-4 sm:py-2">
            <p className="font-mono text-xs text-white sm:text-sm">
              {dateFmt.format(d)} · {timeFmt.format(d)} UTC
            </p>
            <button
              type="button"
              onClick={resetNow}
              className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-cosmos-cyan"
            >
              {live ? '● live' : '↺ reset to now'}
            </button>
          </div>

          <nav aria-label="Tools" className="glass pointer-events-auto flex items-center gap-0.5 rounded-xl p-1">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => togglePanel(t.id)}
                aria-pressed={panel === t.id}
                title={t.hint ? `${t.label} (${t.hint})` : t.label}
                className={`${toolBtn} ${
                  panel === t.id ? 'bg-cosmos-glow/30 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon name={t.icon} />
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            ))}
            <span className="mx-0.5 h-5 w-px bg-white/10" />
            <button type="button" onClick={share} title="Copy share link" className={`${toolBtn} text-slate-300 hover:text-white`}>
              <Icon name="share" />
              <span className="hidden lg:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={requestScreenshot}
              title="Save screenshot"
              className={`${toolBtn} text-slate-300 hover:text-white`}
            >
              <Icon name="camera" />
            </button>
          </nav>
        </motion.div>
      </div>

      {/* bottom-left controls (bottom row on phones) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 overflow-x-auto sm:inset-x-auto sm:bottom-5 sm:left-5 sm:flex-col sm:items-start sm:gap-3 sm:overflow-visible"
      >
        <div className="glass flex shrink-0 items-center gap-1 rounded-xl p-1 sm:p-1.5">
          {SPEEDS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSpeed(s.value)}
              aria-pressed={speed === s.value}
              aria-label={s.label}
              className={`whitespace-nowrap rounded-lg px-2 py-1.5 font-mono text-[10px] transition-colors sm:px-2.5 sm:text-[11px] ${
                speed === s.value ? 'bg-cosmos-glow/30 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="sm:hidden">{s.short}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="glass flex shrink-0 items-center gap-1 rounded-xl p-1 sm:p-1.5">
          <span className="hidden px-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:inline">
            Scale
          </span>
          {(['explore', 'true'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setScaleMode(m)}
              aria-pressed={scaleMode === m}
              className={`whitespace-nowrap rounded-lg px-2 py-1.5 font-mono text-[10px] transition-colors sm:px-2.5 sm:text-[11px] ${
                scaleMode === m ? 'bg-cosmos-cyan/25 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'explore' ? 'Enlarged' : (
                <>
                  True<span className="hidden sm:inline"> size</span>
                </>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )
}
