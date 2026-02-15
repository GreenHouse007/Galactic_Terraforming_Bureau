import { useGameStore } from '../store/gameStore'
import { formatNumber, getGeneratorRevenue, getEffectiveCycleTime } from '../game/formulas'
import { GENERATORS } from '../game/generators'
import { getPlanetBonuses } from '../game/planets'
import { getAchievementBonuses } from '../game/achievements'
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
  const generators = useGameStore((s) => s.generators)
  const planets = useGameStore((s) => s.planets)
  const achievements = useGameStore((s) => s.achievements)
  const prestige = useGameStore((s) => s.prestige)
  const research = useGameStore((s) => s.research)
  const events = useGameStore((s) => s.events)
  const globalMultiplier = useGameStore((s) => s.globalMultiplier)
  const totalEnergyGenerated = useGameStore((s) => s.totalEnergyGenerated)

  const planetBonuses = getPlanetBonuses(planets)
  const achievementBonuses = getAchievementBonuses(achievements)

  // Calculate total per second from managed generators
  let totalPerSec = 0
  for (const gen of generators) {
    if (!gen.hasManager || gen.owned === 0) continue
    const def = GENERATORS.find((g) => g.id === gen.id)
    if (!def) continue
    const revenue = getGeneratorRevenue(
      def, gen.owned, globalMultiplier,
      planetBonuses, achievementBonuses, prestige,
      research.unlockedNodes, events
    )
    const cycleTime = getEffectiveCycleTime(def, planetBonuses, prestige)
    totalPerSec += revenue / cycleTime
  }

  const milestone = getEnergyStyle(totalEnergyGenerated)

  return (
    <div className="text-center py-4">
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
      {totalPerSec > 0 && (
        <p className="text-sm text-gray-400 mt-2">
          +{formatNumber(totalPerSec)}/sec
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
