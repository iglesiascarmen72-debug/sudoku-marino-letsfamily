export function SoundIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d="M4 10v4h4l5 4V6l-5 4H4Z" fill="currentColor" />
      {muted ? <path d="m17 9 4 6m0-6-4 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M16 9.5a4 4 0 0 1 0 5m2-7a7 7 0 0 1 0 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  )
}

export function HintIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d="M9 20h6m-5 2h4M8.5 16.5c-1.3-1-2.5-2.6-2.5-5A6 6 0 0 1 18 11.5c0 2.4-1.2 4-2.5 5-.6.5-1 1.1-1 1.5h-5c0-.4-.4-1-1-1.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3V1m-6 4L4.5 3.5m13.5 1.5 1.5-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}