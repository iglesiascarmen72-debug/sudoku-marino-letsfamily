import { CreatureArt } from './CreatureArt'
import type { Board, Cell, CreatureId } from '../game/types'

type BoardProps = {
  board: Board
  selectedCell: Cell | null
  hintCell: Cell | null
  guidedCell: Cell
  errorCell: Cell | null
  onCellSelect: (cell: Cell) => void
}

export function Board({ board, selectedCell, hintCell, guidedCell, errorCell, onCellSelect }: BoardProps) {
  return (
    <div className="sudoku-board" role="grid" aria-label="Tablero de sudoku marino de cuatro por cuatro">
      {board.map((creature, cell) => {
        const isEditable = cell !== guidedCell || creature !== null
        const classNames = [
          'board-cell',
          cell % 4 === 1 ? 'block-right' : '',
          cell % 4 === 3 ? 'block-edge' : '',
          Math.floor(cell / 4) === 1 ? 'block-bottom' : '',
          Math.floor(cell / 4) === 3 ? 'board-bottom' : '',
          selectedCell === cell ? 'is-selected' : '',
          hintCell === cell ? 'is-hinted' : '',
          errorCell === cell ? 'is-error' : '',
          creature ? 'is-filled' : 'is-empty',
          !isEditable ? 'is-guided' : '',
        ].filter(Boolean).join(' ')

        return (
          <button
            key={cell}
            type="button"
            className={classNames}
            role="gridcell"
            aria-label={creature ? `Casilla ${cell + 1}: ${creature}` : `Casilla ${cell + 1} vacía`}
            aria-selected={selectedCell === cell}
            onClick={() => onCellSelect(cell)}
          >
            {creature ? <CreatureArt creature={creature as CreatureId} className="board-art" /> : <span className="empty-cell-mark" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}
