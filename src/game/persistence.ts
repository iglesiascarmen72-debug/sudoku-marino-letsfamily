import type { PersistedGameV1 } from './types'

export const STORAGE_KEY = 'sudoku-marino:game:v1'

export function saveGame(game: PersistedGameV1) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  } catch {
    // Private browsing and disabled storage should never block the game.
  }
}

export function loadGame(): PersistedGameV1 | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isPersistedGameV1(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function isPersistedGameV1(value: unknown): value is PersistedGameV1 {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PersistedGameV1>
  return candidate.version === 1
    && typeof candidate.puzzleId === 'string'
    && !!candidate.placements
    && typeof candidate.placements === 'object'
    && ['welcome', 'guided', 'playing', 'completed'].includes(candidate.phase ?? '')
    && typeof candidate.guidedStepComplete === 'boolean'
    && typeof candidate.soundEnabled === 'boolean'
    && (candidate.level === undefined || ['guided', 'discovery'].includes(candidate.level))
}
