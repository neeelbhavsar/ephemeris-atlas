import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

export default function Toast() {
  const toast = useStore((s) => s.toast)
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-28 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass max-w-md break-all rounded-xl px-4 py-2 text-center font-mono text-[11px] text-slate-100"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
