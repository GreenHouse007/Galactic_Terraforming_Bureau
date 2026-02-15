import type { GameEventDefinition } from './types'

export const EVENT_DEFINITIONS: GameEventDefinition[] = [
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    description: 'A burst of solar energy doubles all revenue!',
    duration: 30,
    effectType: 'production',
    effectValue: 2,
  },
  {
    id: 'meteor_shower',
    name: 'Meteor Shower',
    description: 'Meteor fragments triple all revenue!',
    duration: 60,
    effectType: 'revenue',
    effectValue: 3,
  },
  {
    id: 'wormhole',
    name: 'Wormhole Discount',
    description: 'A wormhole reduces generator costs by 30%!',
    duration: 45,
    effectType: 'costReduction',
    effectValue: 0.30,
  },
  {
    id: 'nebula_burst',
    name: 'Nebula Energy Burst',
    description: 'A nebula explosion boosts revenue 5x!',
    duration: 15,
    effectType: 'production',
    effectValue: 5,
  },
]

export function getRandomEventTime(): number {
  // 5-10 minutes from now
  const minMs = 5 * 60 * 1000
  const maxMs = 10 * 60 * 1000
  return Date.now() + minMs + Math.random() * (maxMs - minMs)
}

export function getRandomEvent(): GameEventDefinition {
  return EVENT_DEFINITIONS[Math.floor(Math.random() * EVENT_DEFINITIONS.length)]
}
