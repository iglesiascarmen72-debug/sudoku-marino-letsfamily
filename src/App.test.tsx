import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('Sudoku Marino experience', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('starts the guided game with the first cell selected', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Jugar' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }))

    expect(screen.getByRole('grid', { name: /Tablero de sudoku/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/casilla que brilla/i)
    expect(screen.getByRole('gridcell', { name: /Casilla 1 vacÃ­a/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('does not place a wrong creature and gives a gentle hint', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Elegir pulpo rosa' }))

    expect(screen.getByRole('status')).toHaveTextContent(/Casi/i)
    expect(screen.getByRole('gridcell', { name: /Casilla 1 vacÃ­a/i })).toBeInTheDocument()
  })

  it('accepts the guided answer and persists progress', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Elegir pez azul' }))

    expect(screen.getByRole('status')).toHaveTextContent(/siguiente casilla/i)
    expect(JSON.parse(localStorage.getItem('sudoku-marino:game:v1') ?? '{}')).toMatchObject({ guidedStepComplete: true, phase: 'playing' })
  })
})