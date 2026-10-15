import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CATALOG } from '../../data/catalog'
import { focusBody } from '../../lib/focus'
import { useStore } from '../../store'

/** ⌘K / Ctrl-K palette: type to find any body, Enter to fly there. */
export default function SearchPalette() {
  const setPanel = useStore((s) => s.setPanel)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return CATALOG
    return CATALOG.filter((e) =>
      `${e.info.name} ${e.info.kind} ${e.keywords ?? ''}`.toLowerCase().includes(needle),
    ).sort(
      (a, b) =>
        Number(!a.info.name.toLowerCase().startsWith(needle)) -
        Number(!b.info.name.toLowerCase().startsWith(needle)),
    )
  }, [q])

  const choose = (id: string) => {
    setPanel(null)
    focusBody(id)
  }

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[55] flex items-start justify-center bg-black/40 px-3 pt-[12dvh] backdrop-blur-[2px]"
      onPointerDown={(e) => e.target === e.currentTarget && setPanel(null)}
    >
      <motion.div
        role="dialog"
        aria-label="Search bodies"
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.18 }}
        className="glass w-full max-w-md overflow-hidden rounded-2xl"
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(results.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(0, a - 1))
            } else if (e.key === 'Enter' && results[active]) {
              choose(results[active].id)
            } else if (e.key === 'Escape') {
              setPanel(null)
            }
          }}
          placeholder="Search planets, moons, spacecraft, galaxies…"
          aria-label="Search"
          className="w-full border-b border-white/10 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <ul role="listbox" className="max-h-[50dvh] overflow-y-auto p-1.5">
          {results.map((e, i) => (
            <li key={e.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onClick={() => choose(e.id)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  i === active ? 'bg-white/10' : ''
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: e.info.color, boxShadow: `0 0 8px ${e.info.color}` }}
                />
                <span className="flex-1 text-sm text-slate-100">{e.info.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {e.info.kind}
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-slate-500">Nothing out there by that name.</li>
          )}
        </ul>
        <p className="border-t border-white/10 px-4 py-2 font-mono text-[10px] text-slate-500">
          ↑↓ to choose · Enter to fly · Esc to close · ←→ / Space step through the tour
        </p>
      </motion.div>
    </div>
  )
}
