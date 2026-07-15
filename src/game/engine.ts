import { CREATURES } from './types'
import type { Board, Cell, CreatureId } from './types'

const SIZE = 4
const BLOCK_SIZE = 2

function rowOf(cell: Cell) {
  return Math.floor(cell / SIZE)
}

function colOf(cell: Cell) {
  return cell % SIZE
}

function peersFor(cell: Cell) {
  const row = rowOf(cell)
  const col = colOf(cell)
  const blockRow = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE
  const blockCol = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE
  const peers = new Set<number>()

  for (let index = 0; index < SIZE * SIZE; index += 1) {
    const candidateRow = rowOf(index)
    const candidateCol = colOf(index)
    const inRow = candidateRow === row
    const inColumn = candidateCol === col
    const inBlock = candidateRow >= blockRow && candidateRow < blockRow + BLOCK_SIZE
      && candidateCol >= blockCol && candidateCol < blockCol + BLOCK_SIZE

    if ((inRow || inColumn || inBlock) && index !== cell) {
      peers.add(index)
    }
  }

  return peers
}

export function getCandidates(board: Board, cell: Cell): CreatureId[] {
  if (board[cell] !== null) return []

  const used = new Set<CreatureId>()
  for (const peer of peersFor(cell)) {
    const value = board[peer]
    if (value) used.add(value)
  }

  return CREATURES.filter((creature) => !used.has(creature))
}

export function isValidPlacement(board: Board, cell: Cell, creature: CreatureId): boolean {
  if (board[cell] !== null) return false
  return !Array.from(peersFor(cell)).some((peer) => board[peer] === creature)
}

export function isComplete(board: Board): boolean {
  return board.length === SIZE * SIZE
    && board.every((value) => value !== null)
    && board.every((value, cell) => isValidCompletedValue(board, cell, value as CreatureId))
}

function isValidCompletedValue(board: Board, cell: Cell, creature: CreatureId) {
  const peers = peersFor(cell)
  return !Array.from(peers).some((peer) => board[peer] === creature)
}

export function countSolutions(board: Board): number {
  const nextCell = board.findIndex((value) => value === null)
  if (nextCell === -1) return isComplete(board) ? 1 : 0

  let count = 0
  for (const candidate of getCandidates(board, nextCell)) {
    board[nextCell] = candidate
    count += countSolutions(board)
    board[nextCell] = null
    if (count > 1) return count
  }

  return count
}

export function getBestHintCell(board: Board): Cell | null {
  let bestCell: Cell | null = null
  let bestCandidateCount = Number.POSITIVE_INFINITY

  board.forEach((value, cell) => {
    if (value !== null) return
    const candidateCount = getCandidates(board, cell).length
    if (candidateCount < bestCandidateCount) {
      bestCell = cell
      bestCandidateCount = candidateCount
    }
  })

  return bestCell
}