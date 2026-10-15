import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { useStore } from '../store'

const today = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/**
 * Title card — "You are here · <date>" — shown while the first textures load,
 * then the camera sweeps down into the Sun. Any click, key or scroll skips it.
 * Doubles as the loading screen (outer-planet maps stream in later).
 */
export default function Intro() {
  const intro = useStore((s) => s.intro)
  const simDateMs = useStore((s) => s.simDateMs)
  const { active, progress } = useProgress()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!active && progress >= 100) setLoaded(true)
  }, [active, progress])

  // never strand the visitor on the title card if a load event goes missing
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 8000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (intro !== 'title' || !loaded) return
    const go = () => {
      const s = useStore.getState()
      if (s.intro !== 'title') return
      s.setIntro(s.reducedMotion ? 'done' : 'sweep')
    }
    // hold the card a moment once everything has loaded
    const timer = setTimeout(go, useStore.getState().reducedMotion ? 600 : 1800)
    window.addEventListener('keydown', go)
    window.addEventListener('pointerdown', go)
    window.addEventListener('wheel', go, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', go)
      window.removeEventListener('pointerdown', go)
      window.removeEventListener('wheel', go)
    }
  }, [intro, loaded])

  return (
    <AnimatePresence>
      {intro === 'title' && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.1 } }}
          className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center bg-gradient-to-b from-[#05060d]/80 via-[#05060d]/40 to-[#05060d]/80 px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="font-mono text-[11px] uppercase tracking-[0.5em] text-amber-200/90"
          >
            You are here · {today.format(new Date(simDateMs))}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 1 }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Ephemeris Atlas
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-3 max-w-md text-sm text-slate-300"
          >
            Every planet, moon and spacecraft where it really is — right now.
          </motion.p>
          <div className="mt-8 h-px w-48 overflow-hidden rounded bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cosmos-cyan via-cosmos-glow to-cosmos-rose transition-[width] duration-300"
              style={{ width: `${loaded ? 100 : progress}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {loaded ? 'Click to begin' : `Charting the solar system… ${progress.toFixed(0)}%`}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
