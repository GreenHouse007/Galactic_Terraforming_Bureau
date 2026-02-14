import { useGameStore } from '../store/gameStore'
import { PLANETS } from '../game/planets'
import { formatNumber } from '../game/formulas'
import { PLANET_ICONS } from './Icons'

export default function PlanetsList() {
  const energy = useGameStore((s) => s.energy)
  const planets = useGameStore((s) => s.planets)
  const unlockPlanet = useGameStore((s) => s.unlockPlanet)

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-3">Planets</h2>
      <div className="space-y-2">
        {PLANETS.map((def) => {
          const state = planets.find((p) => p.id === def.id)
          const unlocked = state?.unlocked ?? false
          const canAfford = energy >= def.unlockCost

          return (
            <div
              key={def.id}
              className={`flex items-center justify-between rounded-lg p-3 border ${
                unlocked
                  ? 'bg-indigo-900/30 border-indigo-500/40'
                  : 'bg-gray-800/60 border-gray-700/50'
              }`}
            >
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = PLANET_ICONS[def.id]
                    return Icon ? <Icon className="w-8 h-8 shrink-0" /> : null
                  })()}
                  <span className="font-medium text-gray-200 text-sm">
                    {def.name}
                  </span>
                  {unlocked && (
                    <span className="text-xs bg-indigo-600/30 text-indigo-300 px-1.5 py-0.5 rounded">
                      {def.multiplier}x
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    unlocked ? 'text-indigo-400/80' : 'text-gray-500/70'
                  }`}
                >
                  {def.specialEffect.description}
                </p>
              </div>
              {unlocked ? (
                <span className="text-xs text-indigo-400 font-medium">
                  Terraformed
                </span>
              ) : (
                <button
                  onClick={() => unlockPlanet(def.id)}
                  disabled={!canAfford}
                  className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    canAfford
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {formatNumber(def.unlockCost)}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
