import { useEffect, useMemo, useState } from 'react'
import { Board } from './components/Board'
import { CreatureArt } from './components/CreatureArt'
import { HintIcon, SoundIcon } from './components/Icons'
import { playTone, speak } from './audio'
import { getBestHintCell, getCandidates, isComplete } from './game/engine'
import { loadGame, saveGame } from './game/persistence'
import { PUZZLES } from './game/puzzles'
import { CREATURES } from './game/types'
import { CREATURE_LABELS } from './game/creatureLabels'
import type { Board as GameBoard, Cell, CreatureId, GamePhase, PersistedGameV1, Puzzle } from './game/types'
import './styles.css'

type GameState = {
  puzzle: Puzzle
  board: GameBoard
  phase: GamePhase
  selectedCell: Cell | null
  hintCell: Cell | null
  hintStage: 0 | 1 | 2
  errorCell: Cell | null
  message: string
  soundEnabled: boolean
  guidedStepComplete: boolean
}

function puzzleFor(id: string) {
  return PUZZLES.find((puzzle) => puzzle.id === id) ?? PUZZLES[0]
}

function fromPersisted(saved: PersistedGameV1): GameState {
  const puzzle = puzzleFor(saved.puzzleId)
  const board = [...puzzle.initial]
  Object.entries(saved.placements).forEach(([cell, creature]) => { board[Number(cell)] = creature })
  return {
    puzzle,
    board,
    phase: saved.phase,
    selectedCell: saved.phase === 'guided' ? puzzle.guidedCell : null,
    hintCell: null,
    hintStage: 0,
    errorCell: null,
    message: saved.phase === 'completed' ? '¡Lo hiciste fantástico!' : 'Elige una casilla brillante para empezar.',
    soundEnabled: saved.soundEnabled,
    guidedStepComplete: saved.guidedStepComplete,
  }
}

function createNewGame(soundEnabled = true): GameState {
  const puzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)]
  return {
    puzzle,
    board: [...puzzle.initial],
    phase: 'guided',
    selectedCell: puzzle.guidedCell,
    hintCell: puzzle.guidedCell,
    hintStage: 1,
    errorCell: null,
    message: 'Toca la casilla que brilla. Después, elige una criatura.',
    soundEnabled,
    guidedStepComplete: false,
  }
}

function toPersisted(state: GameState): PersistedGameV1 {
  const placements: Record<string, CreatureId> = {}
  state.board.forEach((creature, cell) => {
    if (creature && state.puzzle.initial[cell] === null) placements[cell] = creature
  })
  return {
    version: 1,
    puzzleId: state.puzzle.id,
    placements,
    phase: state.phase,
    guidedStepComplete: state.guidedStepComplete,
    soundEnabled: state.soundEnabled,
  }
}

function App() {
  const saved = useMemo(() => loadGame(), [])
  const [state, setState] = useState<GameState | null>(() => saved ? fromPersisted(saved) : null)
  const [soundPreference, setSoundPreference] = useState(saved?.soundEnabled ?? true)

  useEffect(() => {
    if (state && state.phase !== 'welcome') saveGame(toPersisted(state))
  }, [state])

  const start = () => {
    const next = state?.phase === 'guided' || state?.phase === 'playing' ? { ...state, soundEnabled: soundPreference } : createNewGame(soundPreference)
    setState(next)
    playTone('select')
    speak(next.phase === 'guided' ? 'Toca la casilla que brilla. Después, elige una criatura.' : '¡Continuamos!', next.soundEnabled)
  }

  const goHome = () => setState(null)

  const setSound = (enabled: boolean) => {
    setSoundPreference(enabled)
    setState((current) => current ? { ...current, soundEnabled: enabled } : current)
    if (enabled) { playTone('select'); speak('Sonido activado', true) }
  }

  if (!state || state.phase === 'welcome') {
    return <WelcomeScreen hasSaved={Boolean(saved)} soundEnabled={soundPreference} onStart={start} onSound={setSound} />
  }

  if (state.phase === 'completed') {
    return <VictoryScreen soundEnabled={state.soundEnabled} onSound={() => setSound(!state.soundEnabled)} onReplay={() => { const next = createNewGame(state.soundEnabled); setState(next); speak(next.message, next.soundEnabled) }} onHome={goHome} />
  }

  const selectCell = (cell: Cell) => {
    if (state.phase === 'guided' && cell !== state.puzzle.guidedCell) {
      setState({ ...state, message: 'Prueba con la casilla que brilla.', selectedCell: state.puzzle.guidedCell, errorCell: null })
      speak('Prueba con la casilla que brilla', state.soundEnabled)
      return
    }
    if (state.board[cell] !== null) return
    setState({ ...state, selectedCell: cell, errorCell: null, hintCell: state.hintCell === cell ? state.hintCell : null, hintStage: state.hintCell === cell ? state.hintStage : 0, message: 'Ahora toca la criatura que quieres colocar.' })
    playTone('select')
  }

  const selectCreature = (creature: CreatureId) => {
    if (state.selectedCell === null) {
      setState({ ...state, message: 'Primero toca una casilla vacía.' })
      speak('Primero toca una casilla vacía', state.soundEnabled)
      return
    }
    const cell = state.selectedCell
    if (state.puzzle.solution[cell] !== creature) {
      setState({ ...state, errorCell: cell, hintCell: cell, hintStage: 1, message: 'Casi. Mira qué criaturas todavía pueden entrar aquí.' })
      playTone('gentle-error')
      speak('Casi. Mira qué criaturas todavía pueden entrar aquí', state.soundEnabled)
      return
    }

    const board = [...state.board]
    board[cell] = creature
    const complete = isComplete(board)
    const next: GameState = {
      ...state,
      board,
      phase: complete ? 'completed' : state.phase === 'guided' ? 'playing' : 'playing',
      guidedStepComplete: true,
      selectedCell: null,
      hintCell: null,
      hintStage: 0,
      errorCell: null,
      message: complete ? '¡Lo hiciste fantástico!' : '¡Muy bien! Busca la siguiente casilla.',
    }
    setState(next)
    playTone(complete ? 'success' : 'select')
    speak(next.message, next.soundEnabled)
  }

  const showHint = () => {
    const cell = state.hintCell ?? state.selectedCell ?? getBestHintCell(state.board)
    if (cell === null) return
    const stage = state.hintCell === cell && state.hintStage === 1 ? 2 : 1
    const message = stage === 2 ? 'Mira la criatura que brilla. Esa puede entrar aquí.' : 'Mira la fila, la columna y el bloque. Algunas criaturas ya están ahí.'
    setState({ ...state, hintCell: cell, selectedCell: cell, hintStage: stage, errorCell: null, message })
    speak(message, state.soundEnabled)
  }

  const candidates = state.selectedCell === null ? [] : getCandidates(state.board, state.selectedCell)

  return (
    <main className="app-shell game-shell">
      <div className="game-surface">
        <Header soundEnabled={state.soundEnabled} onSound={() => setSound(!state.soundEnabled)} />
        <div className="progress-row" aria-label="Progreso de la partida"><span className="progress-star is-on">✦</span><span className="progress-star">✦</span><span className="progress-star">✦</span><span className="progress-star">✦</span></div>
        <div className="game-layout">
          <section className="board-column" aria-label="Zona de juego">
            <div className="coach-bubble"><div className="coach-avatar"><CreatureArt creature="turtle" /></div><p role="status" aria-live="polite">{state.message}</p></div>
            <Board board={state.board} selectedCell={state.selectedCell} hintCell={state.hintCell} guidedCell={state.puzzle.guidedCell} errorCell={state.errorCell} onCellSelect={selectCell} />
          </section>
          <aside className="controls-column" aria-label="Criaturas y pistas">
            <div className="tray" role="group" aria-label="Elige una criatura">
              {CREATURES.map((creature) => {
                const disabled = state.selectedCell !== null && !candidates.includes(creature)
                const isAnswerHint = state.hintStage === 2 && state.selectedCell !== null && state.puzzle.solution[state.selectedCell] === creature
                return <button key={creature} type="button" className={`creature-choice ${disabled ? 'is-disabled' : ''} ${isAnswerHint ? 'is-answer-hint' : ''}`} aria-label={`Elegir ${CREATURE_LABELS[creature]}`} aria-disabled={disabled} onClick={() => selectCreature(creature)}><CreatureArt creature={creature} /></button>
              })}
            </div>
            <button type="button" className="hint-button" onClick={showHint}><HintIcon /> <span>Pista</span></button>
            <p className="helper-copy">Toca una casilla vacía y después una criatura.</p>
          </aside>
        </div>
      </div>
    </main>
  )
}

function Header({ soundEnabled, onSound }: { soundEnabled: boolean; onSound: () => void }) {
  return <header className="game-header"><div className="title-lockup"><strong>Sudoku<br /><span>Marino</span></strong><img src={`${import.meta.env.BASE_URL}assets/logo-letsfamily.svg`} alt="LetsFamily.es" /></div><button type="button" className="sound-button" aria-label={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'} onClick={onSound}><SoundIcon muted={!soundEnabled} /></button></header>
}

function WelcomeScreen({ hasSaved, soundEnabled, onStart, onSound }: { hasSaved: boolean; soundEnabled: boolean; onStart: () => void; onSound: (enabled: boolean) => void }) {
  return <main className="app-shell welcome-shell"><section className="welcome-card"><Header soundEnabled={soundEnabled} onSound={() => onSound(!soundEnabled)} /><div className="welcome-art" aria-hidden="true"><div className="welcome-creature welcome-turtle"><CreatureArt creature="turtle" /></div><div className="welcome-creature welcome-fish"><CreatureArt creature="fish" /></div><div className="welcome-creature welcome-octopus"><CreatureArt creature="octopus" /></div><div className="welcome-creature welcome-starfish"><CreatureArt creature="starfish" /></div></div><h1>Sudoku<br /><span>Marino</span></h1><p className="welcome-copy">Completa el océano con tus criaturas favoritas.</p><button type="button" className="primary-button" onClick={onStart}>{hasSaved ? 'Continuar' : 'Jugar'}</button></section></main>
}

function VictoryScreen({ soundEnabled, onSound, onReplay, onHome }: { soundEnabled: boolean; onSound: () => void; onReplay: () => void; onHome: () => void }) {
  return <main className="app-shell victory-shell"><section className="victory-card"><Header soundEnabled={soundEnabled} onSound={onSound} /><div className="victory-art"><CreatureArt creature="starfish" /></div><h1>¡Lo hiciste<br /><span>fantástico!</span></h1><p className="celebration-copy">El océano está completo.</p><div className="victory-actions"><button type="button" className="primary-button" onClick={onReplay}>Jugar otra vez</button><button type="button" className="secondary-button" onClick={onHome}>Inicio</button></div></section></main>
}

export default App
