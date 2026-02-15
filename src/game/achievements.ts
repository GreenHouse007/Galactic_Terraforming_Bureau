import type { AchievementDefinition, AchievementBonuses, GameState } from './types'

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_generator',
    name: 'First Generator',
    description: 'Buy any generator',
    condition: (s) => s.generators.some((g) => g.owned > 0),
    bonusType: 'costReduction',
    bonusValue: 0.02,
    bonusDescription: '-2% generator costs',
  },
  {
    id: 'mass_production',
    name: 'Mass Production',
    description: 'Own 100 of any generator',
    condition: (s) => s.generators.some((g) => g.owned >= 100),
    bonusType: 'revenue',
    bonusValue: 0.25,
    bonusDescription: '+25% revenue',
  },
  {
    id: 'automation_complete',
    name: 'Automation Complete',
    description: 'Hire all 8 managers',
    condition: (s) => s.generators.every((g) => g.hasManager),
    bonusType: 'production',
    bonusValue: 0.50,
    bonusDescription: '+50% production',
  },
  {
    id: 'energy_1k',
    name: 'Spark of Power',
    description: 'Generate 1,000 total energy',
    condition: (s) => s.totalEnergyGenerated >= 1_000,
    bonusType: 'production',
    bonusValue: 0.05,
    bonusDescription: '+5% production',
  },
  {
    id: 'energy_100k',
    name: 'Power Surge',
    description: 'Generate 100,000 total energy',
    condition: (s) => s.totalEnergyGenerated >= 100_000,
    bonusType: 'production',
    bonusValue: 0.10,
    bonusDescription: '+10% production',
  },
  {
    id: 'energy_1m',
    name: 'Megawatt Milestone',
    description: 'Generate 1,000,000 total energy',
    condition: (s) => s.totalEnergyGenerated >= 1_000_000,
    bonusType: 'production',
    bonusValue: 0.15,
    bonusDescription: '+15% production',
  },
  {
    id: 'energy_1b',
    name: 'Gigawatt Glory',
    description: 'Generate 1,000,000,000 total energy',
    condition: (s) => s.totalEnergyGenerated >= 1_000_000_000,
    bonusType: 'globalMult',
    bonusValue: 0.10,
    bonusDescription: '+10% global multiplier',
  },
  {
    id: 'full_fleet',
    name: 'Full Fleet',
    description: 'Own at least 1 of every generator',
    condition: (s) => s.generators.every((g) => g.owned > 0),
    bonusType: 'costReduction',
    bonusValue: 0.05,
    bonusDescription: '-5% generator costs',
  },
  {
    id: 'first_planet',
    name: 'Planetary Pioneer',
    description: 'Terraform your first planet',
    condition: (s) => s.planets.some((p) => p.unlocked),
    bonusType: 'globalMult',
    bonusValue: 0.05,
    bonusDescription: '+5% global multiplier',
  },
  {
    id: 'three_planets',
    name: 'Galactic Expansion',
    description: 'Terraform 3 planets',
    condition: (s) => s.planets.filter((p) => p.unlocked).length >= 3,
    bonusType: 'globalMult',
    bonusValue: 0.10,
    bonusDescription: '+10% global multiplier',
  },
  {
    id: 'all_planets',
    name: 'Master Terraformer',
    description: 'Terraform all planets',
    condition: (s) => s.planets.every((p) => p.unlocked),
    bonusType: 'prestigeDust',
    bonusValue: 0.25,
    bonusDescription: '+25% prestige dust',
  },
  {
    id: 'first_prestige',
    name: 'Stellar Rebirth',
    description: 'Perform your first prestige',
    condition: (s) => s.prestige.timesPrestiged >= 1,
    bonusType: 'prestigeDust',
    bonusValue: 0.10,
    bonusDescription: '+10% prestige dust',
  },
  {
    id: 'prestige_5',
    name: 'Cosmic Cycle',
    description: 'Prestige 5 times',
    condition: (s) => s.prestige.timesPrestiged >= 5,
    bonusType: 'globalMult',
    bonusValue: 0.15,
    bonusDescription: '+15% global multiplier',
  },
]

export function getAchievementBonuses(unlockedIds: string[]): AchievementBonuses {
  const bonuses: AchievementBonuses = {
    revenue: 0,
    production: 0,
    globalMult: 0,
    costReduction: 0,
    prestigeDust: 0,
  }

  for (const id of unlockedIds) {
    const def = ACHIEVEMENTS.find((a) => a.id === id)
    if (!def) continue
    bonuses[def.bonusType] += def.bonusValue
  }

  return bonuses
}

export function checkAchievements(state: GameState): string[] {
  const newlyUnlocked: string[] = []
  for (const ach of ACHIEVEMENTS) {
    if (state.achievements.includes(ach.id)) continue
    if (ach.condition(state)) {
      newlyUnlocked.push(ach.id)
    }
  }
  return newlyUnlocked
}
