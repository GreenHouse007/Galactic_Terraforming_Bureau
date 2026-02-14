import type {
  UpgradeDefinition,
  UpgradeState,
  PlanetBonuses,
  AchievementBonuses,
  PrestigeState,
  EventState,
  BuyQuantity,
} from './types'
import { EVENT_DEFINITIONS } from './events'

export function getUpgradeCost(
  def: UpgradeDefinition,
  level: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): number {
  const baseCost = Math.floor(def.baseCost * Math.pow(def.costScaling, level))

  let reduction = 0
  if (planetBonuses) reduction += planetBonuses.upgradeCostReduction
  if (achievementBonuses) reduction += achievementBonuses.costReduction

  if (prestigeState) {
    const dustCost = prestigeState.dustUpgrades.find((u) => u.id === 'dust_cost')
    if (dustCost && dustCost.level > 0) {
      reduction += 0.05 * dustCost.level
    }
  }

  if (eventState?.activeEvent) {
    const eventDef = EVENT_DEFINITIONS.find((e) => e.id === eventState.activeEvent!.eventId)
    if (eventDef && eventDef.effectType === 'costReduction') {
      reduction += eventDef.effectValue
    }
  }

  return Math.floor(baseCost * Math.max(0.1, 1 - reduction))
}

export function getUpgradeEffect(def: UpgradeDefinition, level: number): number {
  if (level === 0) return 0
  if (def.type === 'click') {
    // Quadratic: baseEffect * (level + 0.2 * level * (level - 1))
    return def.baseEffect * (level + 0.2 * level * (level - 1))
  }
  if (def.type === 'passive') {
    return def.baseEffect * level * Math.pow(1 + def.effectScaling, level - 1)
  }
  if (def.type === 'multiplier') {
    return 1 + def.baseEffect * level
  }
  return 0
}

export function calculateClickPower(
  upgradeDefs: UpgradeDefinition[],
  upgradeStates: UpgradeState[],
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): number {
  let power = 1
  for (const state of upgradeStates) {
    const def = upgradeDefs.find((d) => d.id === state.id)
    if (def && def.type === 'click') {
      power += getUpgradeEffect(def, state.level)
    }
  }

  // Planet click bonus
  if (planetBonuses) power *= 1 + planetBonuses.clickPower

  // Achievement click bonus
  if (achievementBonuses) power *= 1 + achievementBonuses.click

  // Prestige dust_click bonus
  if (prestigeState) {
    const dustClick = prestigeState.dustUpgrades.find((u) => u.id === 'dust_click')
    if (dustClick && dustClick.level > 0) {
      power *= 1 + 0.50 * dustClick.level
    }
  }

  // Event click bonus
  if (eventState?.activeEvent) {
    const eventDef = EVENT_DEFINITIONS.find((e) => e.id === eventState.activeEvent!.eventId)
    if (eventDef && eventDef.effectType === 'click') {
      power *= eventDef.effectValue
    }
  }

  return power
}

export function calculatePassivePerSecond(
  upgradeDefs: UpgradeDefinition[],
  upgradeStates: UpgradeState[],
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  researchNodes?: string[],
  eventState?: EventState
): number {
  let passive = 0
  for (const state of upgradeStates) {
    const def = upgradeDefs.find((d) => d.id === state.id)
    if (def && def.type === 'passive') {
      passive += getUpgradeEffect(def, state.level)
    }
  }

  // Planet passive bonus
  if (planetBonuses) passive *= 1 + planetBonuses.passiveGeneration

  // Achievement production bonus
  if (achievementBonuses) passive *= 1 + achievementBonuses.production

  // Prestige dust_production bonus
  if (prestigeState) {
    const dustProd = prestigeState.dustUpgrades.find((u) => u.id === 'dust_production')
    if (dustProd && dustProd.level > 0) {
      passive *= 1 + 0.25 * dustProd.level
    }
  }

  // Research passive boost
  if (researchNodes?.includes('res_passive_boost')) {
    passive *= 1.20
  }

  // Event production bonus
  if (eventState?.activeEvent) {
    const eventDef = EVENT_DEFINITIONS.find((e) => e.id === eventState.activeEvent!.eventId)
    if (eventDef && eventDef.effectType === 'production') {
      passive *= eventDef.effectValue
    }
  }

  return passive
}

export function calculateGlobalMultiplier(
  upgradeDefs: UpgradeDefinition[],
  upgradeStates: UpgradeState[],
  planetStates: { id: string; unlocked: boolean; multiplier: number }[],
  achievementBonuses?: AchievementBonuses
): number {
  let mult = 1

  for (const state of upgradeStates) {
    const def = upgradeDefs.find((d) => d.id === state.id)
    if (def && def.type === 'multiplier' && state.level > 0) {
      mult *= getUpgradeEffect(def, state.level)
    }
  }

  for (const planet of planetStates) {
    if (planet.unlocked) {
      mult *= planet.multiplier
    }
  }

  if (achievementBonuses) {
    mult *= 1 + achievementBonuses.globalMult
  }

  return mult
}

export function getMultiBuyCost(
  def: UpgradeDefinition,
  currentLevel: number,
  quantity: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): number {
  let total = 0
  for (let i = 0; i < quantity; i++) {
    total += getUpgradeCost(def, currentLevel + i, planetBonuses, achievementBonuses, prestigeState, eventState)
  }
  return total
}

export function getMaxAffordable(
  def: UpgradeDefinition,
  currentLevel: number,
  energy: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): number {
  let count = 0
  let totalCost = 0
  for (let i = 0; i < 1000; i++) {
    const cost = getUpgradeCost(def, currentLevel + i, planetBonuses, achievementBonuses, prestigeState, eventState)
    if (totalCost + cost > energy) break
    totalCost += cost
    count++
  }
  return count
}

export function getBuyAmount(
  def: UpgradeDefinition,
  currentLevel: number,
  energy: number,
  buyQuantity: BuyQuantity,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): { count: number; totalCost: number } {
  if (buyQuantity === 'max') {
    const count = getMaxAffordable(def, currentLevel, energy, planetBonuses, achievementBonuses, prestigeState, eventState)
    const totalCost = getMultiBuyCost(def, currentLevel, count, planetBonuses, achievementBonuses, prestigeState, eventState)
    return { count, totalCost }
  }

  const count = buyQuantity as number
  const totalCost = getMultiBuyCost(def, currentLevel, count, planetBonuses, achievementBonuses, prestigeState, eventState)
  if (totalCost > energy) return { count: 0, totalCost: 0 }
  return { count, totalCost }
}

export function formatNumber(n: number): string {
  if (n < 1000) return n < 10 ? n.toFixed(1) : Math.floor(n).toString()
  if (n < 1_000_000) return (n / 1_000).toFixed(1) + 'K'
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n < 1_000_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  return (n / 1_000_000_000_000).toFixed(2) + 'T'
}
