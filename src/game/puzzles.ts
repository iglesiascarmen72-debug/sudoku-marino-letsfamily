import type { Board, Puzzle } from './types'

const solution: Board = [
  'fish', 'octopus', 'turtle', 'starfish',
  'turtle', 'starfish', 'fish', 'octopus',
  'octopus', 'fish', 'starfish', 'turtle',
  'starfish', 'turtle', 'octopus', 'fish',
]

const blanks = [
  [0, 5, 10, 15],
  [3, 6, 9, 12],
  [0, 2, 5, 7, 8, 10, 13, 15],
  [1, 3, 4, 6, 9, 11, 12, 14],
  [1, 6, 11, 12],
  [2, 7, 8, 13],
  [0, 3, 4, 7, 8, 11, 12, 15],
  [1, 2, 5, 6, 9, 10, 13, 14],
] as const

function createInitial(blankCells: readonly number[]): Board {
  return solution.map((value, cell) => blankCells.includes(cell) ? null : value)
}

export const PUZZLES: Puzzle[] = blanks.map((blankCells, index) => ({
  id: `reef-${index + 1}`,
  solution: [...solution],
  initial: createInitial(blankCells),
  guidedCell: blankCells[0],
  guidedCreature: solution[blankCells[0]]!,
}))