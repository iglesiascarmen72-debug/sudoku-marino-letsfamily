import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadGame, saveGame, STORAGE_KEY } from './persistence'
import type { PersistedGameV1 } from './types'

const savedGame: PersistedGameV1 = {
  version: 1,
  puzzleId: 'reef-1',
  placements: { 3: 'starfish' },
  phase: 'playing',
  guidedStepComplete: true,
  soundEnabled: false,
}

describe('game persistence', () => {
  beforeEach(() => localStorage.clear())

  it('stores and restores the minimal versioned game state', () => {
    saveGame(savedGame)
    expect(loadGame()).toEqual(savedGame)
  })

  it('returns null for malformed or outdated data', () => {
    localStorage.setItem(STORAGE_KEY, '{bad json')
    expect(loadGame()).toBeNull()

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...savedGame, version: 2 }))
    expect(loadGame()).toBeNull()
  })

  it('survives disabled storage without throwing', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })

    expect(() => saveGame(savedGame)).not.toThrow()
    setItem.mockRestore()
  })
})