import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../game/formulas'
import { IconEnergyBolt } from './Icons'

export default function EnergyDisplay() {
  const energy = useGameStore((s) => s.energy)
  const passivePerSecond = useGameStore((s) => s.passivePerSecond)
  const globalMultiplier = useGameStore((s) => s.globalMultiplier)

  const effectiveRate = passivePerSecond * globalMultiplier

  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
        <IconEnergyBolt className="w-4 h-4 text-green-400" />
        Terraforming Energy
      </p>
      <p className="text-5xl font-bold text-green-400 tabular-nums">
        {formatNumber(energy)}
      </p>
      {effectiveRate > 0 && (
        <p className="text-sm text-gray-400 mt-2">
          +{formatNumber(effectiveRate)}/sec
          {globalMultiplier > 1 && (
            <span className="text-blue-400 ml-2">
              ({formatNumber(globalMultiplier)}x)
            </span>
          )}
        </p>
      )}
    </div>
  )
}
