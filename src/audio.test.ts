import { describe, expect, it } from 'vitest'
import { pickSpanishVoice } from './audio'

const voice = (name: string, lang: string, localService = false) => ({ name, lang, localService }) as SpeechSynthesisVoice

describe('Spanish voice selection', () => {
  it('prefers a local exact es-ES voice for a natural browser reading', () => {
    const selected = pickSpanishVoice([
      voice('English US', 'en-US', true),
      voice('Spanish Latin America', 'es-MX', true),
      voice('Google espaÃ±ol', 'es-ES'),
      voice('Microsoft Helena', 'es-ES', true),
    ])

    expect(selected?.name).toBe('Microsoft Helena')
  })

  it('falls back to any Spanish voice when es-ES is unavailable', () => {
    const selected = pickSpanishVoice([voice('English US', 'en-US'), voice('Spanish', 'es-MX')])
    expect(selected?.lang).toBe('es-MX')
  })
})