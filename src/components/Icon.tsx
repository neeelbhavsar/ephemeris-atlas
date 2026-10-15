const PATHS = {
  search: 'M11 4a7 7 0 1 0 4.4 12.4l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
  telescope:
    'M3 14.5 14.8 6l1.8 3.2L4.8 17.7 3 14.5Zm13.4-9.6 2.1-1.5 2.6 4.6-2.1 1.5-2.6-4.6ZM10 15l1.7-1 3.8 7h-2.2L10 15Zm-1 0-3.3 6H8l2.2-4.1L9 15Z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm-1 2v5.4l4.3 2.6 1-1.7-3.3-2V7h-2Z',
  scale:
    'M4 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm7-6a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM2.5 18a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z',
  share:
    'M18 3a3 3 0 0 0-2.9 3.7L8.8 10a3 3 0 1 0 0 4l6.3 3.3A3 3 0 1 0 16 15.6L9.7 12.3a3 3 0 0 0 0-.6L16 8.4A3 3 0 1 0 18 3Z',
  camera:
    'M9 4 7.5 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5L15 4H9Zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z',
} as const

export type IconName = keyof typeof PATHS

export default function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d={PATHS[name]} fillRule="evenodd" />
    </svg>
  )
}
