import { useGameStore } from '../store/gameStore'
import { GENERATORS, getMilestoneMultiplier, getNextMilestone } from '../game/generators'
import { getPlanetBonuses } from '../game/planets'
import { getAchievementBonuses } from '../game/achievements'
import {
  getGeneratorCost,
  getGeneratorRevenue,
  getEffectiveCycleTime,
  getBuyAmount,
  formatNumber,
} from '../game/formulas'
import type { BuyQuantity } from '../game/types'
import { GENERATOR_ICONS } from './Icons'

const BUY_OPTIONS: { label: string; value: BuyQuantity }[] = [
  { label: 'x1', value: 1 },
  { label: 'x10', value: 10 },
  { label: 'x100', value: 100 },
  { label: 'Max', value: 'max' },
]

export default function GeneratorList() {
  const energy = useGameStore((s) => s.energy)
  const generators = useGameStore((s) => s.generators)
  const planets = useGameStore((s) => s.planets)
  const prestige = useGameStore((s) => s.prestige)
  const achievements = useGameStore((s) => s.achievements)
  const research = useGameStore((s) => s.research)
  const events = useGameStore((s) => s.events)
  const globalMultiplier = useGameStore((s) => s.globalMultiplier)
  const buyQuantity = useGameStore((s) => s.buyQuantity)
  const buyGenerator = useGameStore((s) => s.buyGenerator)
  const runGenerator = useGameStore((s) => s.runGenerator)
  const setBuyQuantity = useGameStore((s) => s.setBuyQuantity)

  const hasBulkBuy = research.unlockedNodes.includes('res_bulk_buy')
  const hasTier2 = research.unlockedNodes.includes('res_tier2_unlock')
  const planetBonuses = getPlanetBonuses(planets)
  const achievementBonuses = getAchievementBonuses(achievements)

  // Determine which generators are visible
  const visibleGenerators = GENERATORS.filter((def, index) => {
    // First 3 always visible
    if (index < 3) return true
    // Generators 4-5 visible when you can afford them or already own them
    if (index < 5) {
      const genState = generators.find((g) => g.id === def.id)
      if (genState && genState.owned > 0) return true
      const cost = getGeneratorCost(def, 0, planetBonuses, achievementBonuses, prestige, events)
      return energy >= cost * 0.1 // Show when within 10% of affording
    }
    // Generators 6-8 require research
    if (!hasTier2) return false
    const genState = generators.find((g) => g.id === def.id)
    if (genState && genState.owned > 0) return true
    const cost = getGeneratorCost(def, 0, planetBonuses, achievementBonuses, prestige, events)
    return energy >= cost * 0.1
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-300">Generators</h2>
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
        {visibleGenerators.map((def) => {
          const genState = generators.find((g) => g.id === def.id)
          if (!genState) return null
          const owned = genState.owned
          const effectiveQty = hasBulkBuy ? buyQuantity : 1

          const { count, totalCost } = getBuyAmount(
            def, owned, energy, effectiveQty,
            planetBonuses, achievementBonuses, prestige, events
          )
          const canAfford = count > 0
          const displayCost =
            count > 0
              ? totalCost
              : getGeneratorCost(def, owned, planetBonuses, achievementBonuses, prestige, events)

          const cycleTime = getEffectiveCycleTime(def, planetBonuses, prestige)
          const revenuePerCycle = getGeneratorRevenue(
            def, Math.max(owned, 1), globalMultiplier,
            planetBonuses, achievementBonuses, prestige,
            research.unlockedNodes, events
          )
          const effectivePerSec = owned > 0 ? revenuePerCycle / cycleTime : 0
          const milestoneMultiplier = getMilestoneMultiplier(owned)
          const nextMilestone = getNextMilestone(owned)

          const isLocked = owned === 0 && !canAfford
          const Icon = GENERATOR_ICONS[def.id]

          return (
            <div
              key={def.id}
              onClick={() => runGenerator(def.id)}
              className={`bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 transition-colors ${
                !genState.hasManager && owned > 0 && !genState.running
                  ? 'cursor-pointer hover:bg-gray-700/60'
                  : ''
              } ${isLocked ? 'opacity-50' : ''}`}
            >
              {/* Top row: icon, name, quantity, cost */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {Icon && <Icon className="w-7 h-7 text-gray-300 shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-200 text-sm">
                        {def.name}
                      </span>
                      {owned > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          nextMilestone && owned >= nextMilestone.quantity - 5
                            ? 'bg-yellow-600/30 text-yellow-300 animate-pulse'
                            : 'bg-blue-600/30 text-blue-300'
                        }`}>
                          x{owned}
                        </span>
                      )}
                      {milestoneMultiplier > 1 && (
                        <span className="text-xs bg-purple-600/30 text-purple-300 px-1.5 py-0.5 rounded">
                          {milestoneMultiplier}x
                        </span>
                      )}
                    </div>
                    {owned > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatNumber(revenuePerCycle)}/cycle ({formatNumber(effectivePerSec)}/sec)
                      </p>
                    )}
                    {owned === 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    buyGenerator(def.id)
                  }}
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

              {/* Progress bar */}
              {owned > 0 && (
                <div className="bg-gray-700/30 h-2 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-green-500/70 h-full rounded-full transition-all duration-75"
                    style={{ width: `${Math.min(genState.progress * 100, 100)}%` }}
                  />
                </div>
              )}

              {/* Bottom row: manager badge + milestone info */}
              {owned > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {genState.hasManager ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/30 text-center leading-3 text-[8px]">A</span>
                        {def.managerName}
                      </span>
                    ) : (
                      !genState.running && (
                        <span className="text-xs text-gray-500">Click to run</span>
                      )
                    )}
                    {genState.running && !genState.hasManager && (
                      <span className="text-xs text-yellow-400/70">
                        {Math.max(0, cycleTime * (1 - genState.progress)).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  {nextMilestone && (
                    <span className="text-xs text-gray-500">
                      Next: {nextMilestone.quantity} (x{nextMilestone.multiplier})
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
