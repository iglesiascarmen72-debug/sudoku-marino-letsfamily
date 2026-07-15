import { describe, expect, it } from 'vitest'
import { countSolutions, isComplete } from './engine'
import { PUZZLES } from './puzzles'

describe('curated puzzles', () => {
  it('contains eight playable puzzles', () => {
    expect(PUZZLES).toHaveLength(8)
    expect(new Set(PUZZLES.map((puzzle) => puzzle.id)).size).toBe(8)
  })

  it.each(PUZZLES)('$id has one solution and a valid guided move', (puzzle) => {
    expect(isComplete(puzzle.solution)).toBe(true)
    expect(countSolutions(puzzle.initial)).toBe(1)
    expect(puzzle.initial[puzzle.guidedCell]).toBeNull()
    expect(puzzle.solution[puzzle.guidedCell]).toBe(puzzle.guidedCreature)
  })
})