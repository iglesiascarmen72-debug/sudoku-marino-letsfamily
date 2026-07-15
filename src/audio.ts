let context: AudioContext | null = null

function getContext() {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

export function playTone(kind: 'select' | 'success' | 'gentle-error') {
  const audioContext = getContext()
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const now = audioContext.currentTime
  const frequency = kind === 'success' ? 660 : kind === 'gentle-error' ? 220 : 440
  oscillator.frequency.setValueAtTime(frequency, now)
  oscillator.type = 'sine'
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'success' ? 0.24 : 0.14))
  oscillator.connect(gain).connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.26)
}

export function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  utterance.rate = 0.9
  utterance.pitch = 1.1
  window.speechSynthesis.speak(utterance)
}