import { describe, expect, it } from 'vitest'
import {
  countSolutions,
  getBestHintCell,
  getCandidates,
  isComplete,
  isValidPlacement,
} from './engine'
import type { Board } from './types'

const solution: Board = [
  'fish', 'octopus', 'turtle', 'starfish',
  'turtle', 'starfish', 'fish', 'octopus',
  'octopus', 'fish', 'starfish', 'turtle',
  'starfish', 'turtle', 'octopus', 'fish',
]

describe('sudoku engine', () => {
  it('rejects a creature already present in the row, column, or block', () => {
    const board: Board = [...solution]
    board[5] = null

    expect(isValidPlacement(board, 5, 'turtle')).toBe(false)
    expect(isValidPlacement(board, 5, 'octopus')).toBe(false)
    expect(isValidPlacement(board, 5, 'fish')).toBe(false)
    expect(isValidPlacement(board, 5, 'starfish')).toBe(true)
  })

  it('returns only legal candidates for an empty cell', () => {
    const board: Board = [...solution]
    board[5] = null

    expect(getCandidates(board, 5)).toEqual(['starfish'])
  })

  it('recognises only a fully valid board as complete', () => {
    expect(isComplete(solution)).toBe(true)
    expect(isComplete(solution.with(0, null))).toBe(false)
    expect(isComplete(solution.with(0, 'octopus'))).toBe(false)
  })

  it('counts solutions without mutating the original board', () => {
    const board: Board = [...solution]
    board[1] = null
    board[4] = null
    const snapshot = [...board]

    expect(countSolutions(board)).toBe(1)
    expect(board).toEqual(snapshot)
  })

  it('selects an empty cell with the fewest candidates for a hint', () => {
    const board: Board = [...solution]
    board[0] = null
    board[5] = null

    expect(getBestHintCell(board)).toBe(0)
  })
})