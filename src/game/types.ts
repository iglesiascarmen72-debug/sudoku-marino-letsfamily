export const CREATURES = ['fish', 'octopus', 'turtle', 'starfish'] as const

export type CreatureId = (typeof CREATURES)[number]
export type Cell = number
export type Board = Array<CreatureId | null>

export type GamePhase = 'welcome' | 'guided' | 'playing' | 'completed'

export type Puzzle = {
  id: string
  solution: Board
  initial: Board
  guidedCell: Cell
  guidedCreature: CreatureId
}

export type PersistedGameV1 = {
  version: 1
  puzzleId: string
  placements: Record<string, CreatureId>
  phase: GamePhase
  guidedStepComplete: boolean
  soundEnabled: boolean
}