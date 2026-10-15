import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * Panel shell: a right-hand drawer on desktop, a bottom sheet on phones.
 */
export default function Sheet({
  title,
  subtitle,
  accent = '#8b5cf6',
  onClose,
  side = 'right',
  className = 'md:bottom-5',
  children,
}: {
  title: string
  subtitle?: string
  accent?: string
  onClose: () => void
  side?: 'left' | 'right'
  /** extra classes, e.g. desktop bottom offset */
  className?: string
  children: ReactNode
}) {
  const desktopSide =
    side === 'left' ? 'md:left-5 md:right-auto' : 'md:right-5 md:left-auto'
  return (
    <motion.section
      role="dialog"
      aria-label={title}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`glass pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex max-h-[72dvh] flex-col rounded-t-2xl md:inset-x-auto md:top-[8.75rem] md:max-h-none md:w-[23rem] md:rounded-2xl ${desktopSide} ${className}`}
      style={{ borderColor: `${accent}55`, boxShadow: `0 24px 70px -24px ${accent}88` }}
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 md:hidden" />
      <header className="flex items-start justify-between gap-3 px-5 pb-2 pt-3 md:pt-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
          {subtitle && (
            <p
              className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg px-2 py-1 font-mono text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
    </motion.section>
  )
}
