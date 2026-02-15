import { useGameStore } from '../store/gameStore'
import { calculateDustGain, getDustUpgradeCost, DUST_UPGRADES } from '../game/prestige'
import { getAchievementBonuses } from '../game/achievements'
import { formatNumber } from '../game/formulas'
import { IconStellarDust } from './Icons'

export default function PrestigePanel() {
  const totalEnergyGenerated = useGameStore((s) => s.totalEnergyGenerated)
  const prestige = useGameStore((s) => s.prestige)
  const achievements = useGameStore((s) => s.achievements)
  const research = useGameStore((s) => s.research)
  const stellarReset = useGameStore((s) => s.stellarReset)
  const purchaseDustUpgrade = useGameStore((s) => s.purchaseDustUpgrade)

  const achievementBonuses = getAchievementBonuses(achievements)
  const hasPrestigeBoost = research.unlockedNodes.includes('res_prestige_boost')
  const dustGain = calculateDustGain(
    totalEnergyGenerated,
    achievementBonuses.prestigeDust,
    hasPrestigeBoost
  )
  const canPrestige = dustGain > 0

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-3">
        Stellar Reset
      </h2>

      {/* Dust balance */}
      <div className="text-center py-4 mb-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          Stellar Dust
        </p>
        <p className="text-3xl font-bold text-purple-400 tabular-nums flex items-center justify-center gap-2">
          <IconStellarDust className="w-6 h-6 text-purple-400" />
          {formatNumber(prestige.stellarDust)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Prestiges: {prestige.timesPrestiged}
        </p>
      </div>

      {/* Prestige button */}
      <div className="mb-4">
        <button
          onClick={stellarReset}
          disabled={!canPrestige}
          className={`w-full py-3 rounded-lg text-sm font-bold transition-colors ${
            canPrestige
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canPrestige
            ? `Stellar Reset for ${formatNumber(dustGain)} Dust`
            : totalEnergyGenerated < 1_000_000
              ? `Need ${formatNumber(1_000_000)} total energy (have ${formatNumber(totalEnergyGenerated)})`
              : 'Cannot prestige'}
        </button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Resets energy, upgrades, and planets. Keeps dust, dust upgrades,
          achievements, and research.
        </p>
      </div>

      {/* Dust upgrades */}
      <h3 className="text-sm font-semibold text-gray-400 mb-2">
        Dust Upgrades
      </h3>
      <div className="space-y-2">
        {DUST_UPGRADES.map((def) => {
          const state = prestige.dustUpgrades.find((u) => u.id === def.id)
          const level = state?.level ?? 0
          const maxed = level >= def.maxLevel
          const cost = getDustUpgradeCost(def, level)
          const canAfford = prestige.stellarDust >= cost && !maxed

          return (
            <div
              key={def.id}
              className="flex items-center justify-between bg-gray-800/60 rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-200 text-sm">
                    {def.name}
                  </span>
                  <span className="text-xs bg-purple-600/30 text-purple-300 px-1.5 py-0.5 rounded">
                    {level}/{def.maxLevel}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {def.description}
                </p>
              </div>
              {maxed ? (
                <span className="text-xs text-purple-400 font-medium">
                  Maxed
                </span>
              ) : (
                <button
                  onClick={() => purchaseDustUpgrade(def.id)}
                  disabled={!canAfford}
                  className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    canAfford
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {formatNumber(cost)} dust
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
