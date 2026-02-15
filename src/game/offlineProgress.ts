import type { GeneratorState, PlanetBonuses, PrestigeState, AchievementBonuses } from './types'
import { GENERATORS } from './generators'
import { getGeneratorRevenue, getEffectiveCycleTime } from './formulas'

const MAX_OFFLINE_SECONDS = 86400 // 24 hours

export function calculateOfflineEnergy(
  lastSaveTime: number,
  generators: GeneratorState[],
  globalMultiplier: number,
  planetBonuses?: PlanetBonuses,
  achievementBonuses?: AchievementBonuses,
  prestigeState?: PrestigeState,
  hasResearchOffline?: boolean
): { energy: number; seconds: number } {
  const now = Date.now()
  const elapsedMs = now - lastSaveTime
  const elapsedSeconds = Math.min(elapsedMs / 1000, MAX_OFFLINE_SECONDS)

  if (elapsedSeconds < 1) {
    return { energy: 0, seconds: 0 }
  }

  let totalEnergy = 0

  // Only managed generators produce offline
  for (const genState of generators) {
    if (!genState.hasManager || genState.owned === 0) continue

    const def = GENERATORS.find((g) => g.id === genState.id)
    if (!def) continue

    const cycleTime = getEffectiveCycleTime(def, planetBonuses, prestigeState)
    const revenuePerCycle = getGeneratorRevenue(
      def, genState.owned, globalMultiplier,
      planetBonuses, achievementBonuses, prestigeState,
      undefined, // no research nodes needed here (already factored into globalMult)
      undefined  // no event bonus offline
    )

    const cycles = elapsedSeconds / cycleTime
    totalEnergy += cycles * revenuePerCycle
  }

  if (totalEnergy <= 0) {
    return { energy: 0, seconds: 0 }
  }

  let efficiency = 1

  // Venus offline bonus
  if (planetBonuses) efficiency += planetBonuses.offlineEfficiency

  // Prestige dust_offline bonus
  if (prestigeState) {
    const dustOffline = prestigeState.dustUpgrades.find((u) => u.id === 'dust_offline')
    if (dustOffline && dustOffline.level > 0) {
      efficiency += 0.20 * dustOffline.level
    }
  }

  // Research offline bonus
  if (hasResearchOffline) {
    efficiency += 0.50
  }

  const energy = totalEnergy * efficiency
  return { energy, seconds: Math.floor(elapsedSeconds) }
}
