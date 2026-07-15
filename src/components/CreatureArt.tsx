import type { CreatureId } from '../game/types'
import { CREATURE_LABELS } from '../game/creatureLabels'

export function CreatureArt({ creature, className = '' }: { creature: CreatureId; className?: string }) {
  return <span className={`creature-art creature-${creature} ${className}`} role="img" aria-label={CREATURE_LABELS[creature]} />
}