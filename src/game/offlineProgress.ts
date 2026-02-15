import type { PlanetBonuses, PrestigeState } from './types'

const MAX_OFFLINE_SECONDS = 86400 // 24 hours

export function calculateOfflineEnergy(
  lastSaveTime: number,
  passivePerSecond: number,
  globalMultiplier: number,
  planetBonuses?: PlanetBonuses,
  prestigeState?: PrestigeState,
  hasResearchOffline?: boolean
): { energy: number; seconds: number } {
  const now = Date.now()
  const elapsedMs = now - lastSaveTime
  const elapsedSeconds = Math.min(elapsedMs / 1000, MAX_OFFLINE_SECONDS)

  if (elapsedSeconds < 1 || passivePerSecond <= 0) {
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

  const energy = elapsedSeconds * passivePerSecond * globalMultiplier * efficiency
  return { energy, seconds: Math.floor(elapsedSeconds) }
}
