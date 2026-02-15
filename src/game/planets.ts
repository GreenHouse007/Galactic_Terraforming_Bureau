import type { PlanetDefinition, PlanetState, PlanetBonuses } from './types'

export const PLANETS: PlanetDefinition[] = [
  {
    id: 'mars',
    name: 'Mars',
    description: 'The Red Planet — first step in terraforming',
    unlockCost: 250,
    multiplier: 1.5,
    specialEffect: {
      type: 'cycleSpeed',
      value: 0.10,
      description: '-10% cycle times',
    },
  },
  {
    id: 'venus',
    name: 'Venus',
    description: 'Tame the acid clouds for massive gain',
    unlockCost: 5_000,
    multiplier: 2,
    specialEffect: {
      type: 'offlineEfficiency',
      value: 0.50,
      description: '+50% offline efficiency',
    },
  },
  {
    id: 'europa',
    name: 'Europa',
    description: "Jupiter's icy moon hides vast potential",
    unlockCost: 50_000,
    multiplier: 3,
    specialEffect: {
      type: 'upgradeCostReduction',
      value: 0.10,
      description: '-10% generator costs',
    },
  },
  {
    id: 'titan',
    name: 'Titan',
    description: "Saturn's largest moon, rich in resources",
    unlockCost: 500_000,
    multiplier: 5,
    specialEffect: {
      type: 'revenueBoost',
      value: 0.30,
      description: '+30% revenue',
    },
  },
  {
    id: 'proxima_b',
    name: 'Proxima Centauri b',
    description: 'The first interstellar colony',
    unlockCost: 5_000_000,
    multiplier: 10,
    specialEffect: {
      type: 'eventDuration',
      value: 15,
      description: 'Events last 15s longer',
    },
  },
]

export function createInitialPlanetStates(): PlanetState[] {
  return PLANETS.map((p) => ({ id: p.id, unlocked: false }))
}

export function getPlanetBonuses(planetStates: PlanetState[]): PlanetBonuses {
  const bonuses: PlanetBonuses = {
    cycleSpeed: 0,
    offlineEfficiency: 0,
    upgradeCostReduction: 0,
    revenueBoost: 0,
    eventDuration: 0,
  }

  for (const ps of planetStates) {
    if (!ps.unlocked) continue
    const def = PLANETS.find((p) => p.id === ps.id)
    if (!def) continue

    switch (def.specialEffect.type) {
      case 'cycleSpeed':
        bonuses.cycleSpeed += def.specialEffect.value
        break
      case 'offlineEfficiency':
        bonuses.offlineEfficiency += def.specialEffect.value
        break
      case 'upgradeCostReduction':
        bonuses.upgradeCostReduction += def.specialEffect.value
        break
      case 'revenueBoost':
        bonuses.revenueBoost += def.specialEffect.value
        break
      case 'eventDuration':
        bonuses.eventDuration += def.specialEffect.value
        break
    }
  }

  return bonuses
}
