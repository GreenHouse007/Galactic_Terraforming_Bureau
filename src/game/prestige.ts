import type { DustUpgradeDefinition, PrestigeState } from './types'

export const DUST_UPGRADES: DustUpgradeDefinition[] = [
  {
    id: 'dust_starting',
    name: 'Headstart Protocol',
    description: 'Start with +100 energy per level after prestige',
    cost: 20,
    maxLevel: 20,
    effectPerLevel: 100,
  },
  {
    id: 'dust_click',
    name: 'Stardust Hands',
    description: '+50% click power per level',
    cost: 30,
    maxLevel: 10,
    effectPerLevel: 0.50,
  },
  {
    id: 'dust_production',
    name: 'Stellar Infusion',
    description: '+25% all production per level',
    cost: 50,
    maxLevel: 10,
    effectPerLevel: 0.25,
  },
  {
    id: 'dust_offline',
    name: 'Dark Matter Persistence',
    description: '+20% offline production per level',
    cost: 60,
    maxLevel: 10,
    effectPerLevel: 0.20,
  },
  {
    id: 'dust_cost',
    name: 'Cosmic Discount',
    description: '-5% upgrade costs per level',
    cost: 75,
    maxLevel: 5,
    effectPerLevel: 0.05,
  },
]

export function createInitialPrestigeState(): PrestigeState {
  return {
    stellarDust: 0,
    dustUpgrades: DUST_UPGRADES.map((u) => ({ id: u.id, level: 0 })),
    timesPrestiged: 0,
  }
}

export function calculateDustGain(totalEnergyGenerated: number, achievementPrestigeDustBonus: number, researchPrestigeBoost: boolean): number {
  if (totalEnergyGenerated < 1_000_000) return 0
  let dust = Math.floor(150 * Math.sqrt(totalEnergyGenerated / 1_000_000) - 0.5)

  // Achievement bonus for prestige dust
  if (achievementPrestigeDustBonus > 0) {
    dust = Math.floor(dust * (1 + achievementPrestigeDustBonus))
  }

  // Research prestige boost
  if (researchPrestigeBoost) {
    dust = Math.floor(dust * 1.15)
  }

  return Math.max(0, dust)
}

export function getDustUpgradeCost(def: DustUpgradeDefinition, currentLevel: number): number {
  return def.cost * (currentLevel + 1)
}
