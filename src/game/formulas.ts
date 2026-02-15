import type {
  GeneratorDef,
  PlanetBonuses,
  AchievementBonuses,
  PrestigeState,
  EventState,
  BuyQuantity,
} from './types'
import { getMilestoneMultiplier } from './generators'
import { EVENT_DEFINITIONS } from './events'

export function getGeneratorCost(
  def: GeneratorDef,
  owned: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): number {
  const baseCost = Math.floor(def.baseCost * Math.pow(def.costScaling, owned))

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

  return Math.max(1, Math.floor(baseCost * Math.max(0.1, 1 - reduction)))
}

export function getGeneratorRevenue(
  def: GeneratorDef,
  owned: number,
  globalMultiplier: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  researchNodes?: string[],
  eventState?: EventState
): number {
  if (owned === 0) return 0

  let revenue = def.baseRevenue * owned * getMilestoneMultiplier(owned)

  // Planet revenue bonus
  if (planetBonuses) revenue *= 1 + planetBonuses.revenueBoost

  // Achievement production bonus
  if (achievementBonuses) revenue *= 1 + achievementBonuses.production

  // Achievement revenue bonus
  if (achievementBonuses) revenue *= 1 + achievementBonuses.revenue

  // Prestige dust_revenue bonus
  if (prestigeState) {
    const dustRevenue = prestigeState.dustUpgrades.find((u) => u.id === 'dust_revenue')
    if (dustRevenue && dustRevenue.level > 0) {
      revenue *= 1 + 0.25 * dustRevenue.level
    }
  }

  // Research revenue boost
  if (researchNodes?.includes('res_revenue_boost')) {
    revenue *= 1.20
  }

  // Event production bonus
  if (eventState?.activeEvent) {
    const eventDef = EVENT_DEFINITIONS.find((e) => e.id === eventState.activeEvent!.eventId)
    if (eventDef && (eventDef.effectType === 'production' || eventDef.effectType === 'revenue')) {
      revenue *= eventDef.effectValue
    }
  }

  // Global multiplier (from planets + achievements)
  revenue *= globalMultiplier

  return revenue
}

export function getEffectiveCycleTime(
  def: GeneratorDef,
  planetBonuses?: PlanetBonuses,
  prestigeState?: PrestigeState,
): number {
  let time = def.cycleTime

  // Planet cycle speed bonus
  if (planetBonuses) time *= Math.max(0.1, 1 - planetBonuses.cycleSpeed)

  // Prestige dust_speed bonus
  if (prestigeState) {
    const dustSpeed = prestigeState.dustUpgrades.find((u) => u.id === 'dust_speed')
    if (dustSpeed && dustSpeed.level > 0) {
      time *= Math.max(0.1, 1 - 0.05 * dustSpeed.level)
    }
  }

  return time
}

export function calculateGlobalMultiplier(
  planetStates: { id: string; unlocked: boolean; multiplier: number }[],
  achievementBonuses?: AchievementBonuses
): number {
  let mult = 1

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
  def: GeneratorDef,
  currentOwned: number,
  quantity: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): number {
  let total = 0
  for (let i = 0; i < quantity; i++) {
    total += getGeneratorCost(def, currentOwned + i, planetBonuses, achievementBonuses, prestigeState, eventState)
  }
  return total
}

export function getMaxAffordable(
  def: GeneratorDef,
  currentOwned: number,
  energy: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): number {
  let count = 0
  let totalCost = 0
  for (let i = 0; i < 1000; i++) {
    const cost = getGeneratorCost(def, currentOwned + i, planetBonuses, achievementBonuses, prestigeState, eventState)
    if (totalCost + cost > energy) break
    totalCost += cost
    count++
  }
  return count
}

export function getBuyAmount(
  def: GeneratorDef,
  currentOwned: number,
  energy: number,
  buyQuantity: BuyQuantity,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  eventState?: EventState
): { count: number; totalCost: number } {
  if (buyQuantity === 'max') {
    const count = getMaxAffordable(def, currentOwned, energy, planetBonuses, achievementBonuses, prestigeState, eventState)
    const totalCost = getMultiBuyCost(def, currentOwned, count, planetBonuses, achievementBonuses, prestigeState, eventState)
    return { count, totalCost }
  }

  const count = buyQuantity as number
  const totalCost = getMultiBuyCost(def, currentOwned, count, planetBonuses, achievementBonuses, prestigeState, eventState)
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
