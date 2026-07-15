let context: AudioContext | null = null

function voiceScore(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.toLowerCase()
  const name = voice.name.toLowerCase()
  let score = 0
  if (lang === 'es-es') score += 6
  else if (lang.startsWith('es')) score += 3
  if (voice.localService) score += 3
  if (/microsoft|google|helena|monica|jorge|paulina/.test(name)) score += 1
  return score
}

export function pickSpanishVoice(voices: SpeechSynthesisVoice[]) {
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith('es'))
    .sort((a, b) => voiceScore(b) - voiceScore(a))[0]
}

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
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    const retry = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', retry)
      speak(text, enabled)
    }
    window.speechSynthesis.addEventListener('voiceschanged', retry, { once: true })
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  utterance.voice = pickSpanishVoice(voices) ?? null
  utterance.rate = 0.86
  utterance.pitch = 1.04
  utterance.volume = 0.95
  window.speechSynthesis.speak(utterance)
}