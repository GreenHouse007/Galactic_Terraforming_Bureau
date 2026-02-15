import { useGameStore } from '../store/gameStore'
import { GENERATORS } from '../game/generators'
import { formatNumber } from '../game/formulas'
import { GENERATOR_ICONS } from './Icons'

export default function ManagerShop() {
  const energy = useGameStore((s) => s.energy)
  const generators = useGameStore((s) => s.generators)
  const research = useGameStore((s) => s.research)
  const buyManager = useGameStore((s) => s.buyManager)

  const hasTier2 = research.unlockedNodes.includes('res_tier2_unlock')

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-1">Managers</h2>
      <p className="text-xs text-gray-500 mb-3">
        Hire managers to automate your generators. Once hired, a generator runs continuously without clicking.
      </p>
      <div className="space-y-2">
        {GENERATORS.map((def, index) => {
          // Hide tier 2 generators if not researched
          if (index >= 5 && !hasTier2) return null

          const genState = generators.find((g) => g.id === def.id)
          if (!genState) return null

          const hired = genState.hasManager
          const canAfford = energy >= def.managerCost && !hired
          const Icon = GENERATOR_ICONS[def.id]

          return (
            <div
              key={def.id}
              className={`flex items-center justify-between bg-gray-800/60 rounded-lg p-3 border ${
                hired
                  ? 'border-emerald-600/40 bg-emerald-900/10'
                  : 'border-gray-700/50'
              } ${!hired && !canAfford ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {Icon && <Icon className={`w-7 h-7 shrink-0 ${hired ? 'text-emerald-400' : 'text-gray-400'}`} />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${hired ? 'text-emerald-300' : 'text-gray-200'}`}>
                      {def.managerName}
                    </span>
                    {hired && (
                      <span className="text-xs bg-emerald-600/30 text-emerald-300 px-1.5 py-0.5 rounded">
                        Hired
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automates {def.name}
                  </p>
                </div>
              </div>
              {hired ? (
                <span className="text-emerald-400 text-sm">&#10003;</span>
              ) : (
                <button
                  onClick={() => buyManager(def.id)}
                  disabled={!canAfford}
                  className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    canAfford
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Hire {formatNumber(def.managerCost)}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
