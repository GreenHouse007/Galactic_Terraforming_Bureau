import { useGameStore } from '../store/gameStore'
import { UPGRADES } from '../game/upgrades'
import { getPlanetBonuses } from '../game/planets'
import { getAchievementBonuses } from '../game/achievements'
import {
  getUpgradeCost,
  getUpgradeEffect,
  getBuyAmount,
  formatNumber,
} from '../game/formulas'
import type { BuyQuantity } from '../game/types'
import { UPGRADE_ICONS } from './Icons'

const BUY_OPTIONS: { label: string; value: BuyQuantity }[] = [
  { label: 'x1', value: 1 },
  { label: 'x10', value: 10 },
  { label: 'x100', value: 100 },
  { label: 'Max', value: 'max' },
]

export default function UpgradesList() {
  const energy = useGameStore((s) => s.energy)
  const upgrades = useGameStore((s) => s.upgrades)
  const planets = useGameStore((s) => s.planets)
  const prestige = useGameStore((s) => s.prestige)
  const achievements = useGameStore((s) => s.achievements)
  const research = useGameStore((s) => s.research)
  const events = useGameStore((s) => s.events)
  const buyQuantity = useGameStore((s) => s.buyQuantity)
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade)
  const setBuyQuantity = useGameStore((s) => s.setBuyQuantity)

  const hasBulkBuy = research.unlockedNodes.includes('res_bulk_buy')
  const planetBonuses = getPlanetBonuses(planets)
  const achievementBonuses = getAchievementBonuses(achievements)

  // Filter out gated upgrades that aren't unlocked yet
  const visibleUpgrades = UPGRADES.filter((def) => {
    if (!def.gatedByResearch) return true
    return research.unlockedNodes.includes(def.gatedByResearch)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-300">Upgrades</h2>
        {hasBulkBuy && (
          <div className="flex gap-1 bg-gray-800/50 rounded-md p-0.5">
            {BUY_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setBuyQuantity(opt.value)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  buyQuantity === opt.value
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {visibleUpgrades.map((def) => {
          const state = upgrades.find((u) => u.id === def.id)
          const level = state?.level ?? 0
          const effectiveQty = hasBulkBuy ? buyQuantity : 1

          const { count, totalCost } = getBuyAmount(
            def, level, energy, effectiveQty,
            planetBonuses, achievementBonuses, prestige, events
          )
          const canAfford = count > 0
          const displayCost =
            count > 0
              ? totalCost
              : getUpgradeCost(def, level, planetBonuses, achievementBonuses, prestige, events)

          const currentEffect = getUpgradeEffect(def, level)
          const nextEffect = getUpgradeEffect(def, level + (count > 0 ? count : 1))

          return (
            <div
              key={def.id}
              className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex items-center justify-between">
                {(() => {
                  const Icon = UPGRADE_ICONS[def.id]
                  return Icon ? <Icon className="w-8 h-8 text-gray-300 shrink-0 mr-3" /> : null
                })()}
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-200 text-sm">
                      {def.name}
                    </span>
                    {level > 0 && (
                      <span className="text-xs bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded">
                        Lv.{level}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
                  {level > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Current: {formatNumber(currentEffect)}
                      {def.type === 'passive' && '/sec'}
                      {def.type === 'multiplier' && 'x'}
                      {' → '}
                      {formatNumber(nextEffect)}
                      {def.type === 'passive' && '/sec'}
                      {def.type === 'multiplier' && 'x'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => purchaseUpgrade(def.id)}
                  disabled={!canAfford}
                  className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    canAfford
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {count > 1 && `${count}x `}
                  {formatNumber(displayCost)}
                </button>
              </div>
              {def.type === 'passive' && level > 0 && (
                <div className="bg-gray-700/30 h-0.5 rounded-full mt-2">
                  <div
                    className="bg-blue-500/40 h-full rounded-full animate-fill-progress"
                    style={{
                      animationDuration: `${1 / currentEffect}s`,
                      animationIterationCount: 'infinite',
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
