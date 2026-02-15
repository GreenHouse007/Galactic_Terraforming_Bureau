import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../game/formulas'
import { IconEnergyBolt } from './Icons'

const ENERGY_MILESTONES = [
  { threshold: 1e9,  color: 'text-blue-300',    shadow: '0 0 16px rgba(147,197,253,0.5)' },
  { threshold: 1e7,  color: 'text-cyan-300',    shadow: '0 0 12px rgba(103,232,249,0.4)' },
  { threshold: 1e5,  color: 'text-teal-300',    shadow: '0 0 8px rgba(45,212,191,0.3)' },
  { threshold: 1e3,  color: 'text-emerald-400', shadow: undefined },
  { threshold: 0,    color: 'text-green-400',   shadow: undefined },
] as const

function getEnergyStyle(total: number) {
  for (const m of ENERGY_MILESTONES) {
    if (total >= m.threshold) return m
  }
  return ENERGY_MILESTONES[ENERGY_MILESTONES.length - 1]
}

export default function EnergyDisplay() {
  const energy = useGameStore((s) => s.energy)
  const passivePerSecond = useGameStore((s) => s.passivePerSecond)
  const globalMultiplier = useGameStore((s) => s.globalMultiplier)
  const totalEnergyGenerated = useGameStore((s) => s.totalEnergyGenerated)

  const effectiveRate = passivePerSecond * globalMultiplier
  const milestone = getEnergyStyle(totalEnergyGenerated)

  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
        <IconEnergyBolt className="w-4 h-4 text-green-400" />
        Terraforming Energy
      </p>
      <p
        className={`text-5xl font-bold ${milestone.color} tabular-nums`}
        style={{ textShadow: milestone.shadow, transition: 'color 0.5s ease, text-shadow 0.5s ease' }}
      >
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
