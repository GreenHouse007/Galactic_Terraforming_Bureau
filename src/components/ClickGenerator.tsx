import { useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../game/formulas'
import { IconEnergyOrb } from './Icons'
import { PLANET_ICONS } from './Icons'
import { audioManager } from '../audio/audioManager'

interface Floater {
  id: number
  value: number
  x: number
}

let nextFloaterId = 0

const BUTTON_TIERS = [
  { threshold: 0,   from: '#eab308', to: '#ea580c', shadow: 'rgba(249,115,22,0.3)', size: '7rem',   ring: 'none',              iconColor: 'text-yellow-300', pulse: false },
  { threshold: 5,   from: '#f59e0b', to: '#ea580c', shadow: 'rgba(249,115,22,0.4)', size: '7rem',   ring: '2px solid #f59e0b', iconColor: 'text-yellow-200', pulse: false },
  { threshold: 15,  from: '#ea580c', to: '#dc2626', shadow: 'rgba(239,68,68,0.4)',  size: '7.5rem', ring: '2px solid #ef4444', iconColor: 'text-orange-200', pulse: false },
  { threshold: 35,  from: '#dc2626', to: '#9333ea', shadow: 'rgba(147,51,234,0.4)', size: '8rem',   ring: '2px solid #a855f7', iconColor: 'text-purple-200', pulse: false },
  { threshold: 70,  from: '#9333ea', to: '#2563eb', shadow: 'rgba(59,130,246,0.5)', size: '8rem',   ring: '4px solid #3b82f6', iconColor: 'text-blue-200',   pulse: true },
  { threshold: 120, from: '#2563eb', to: '#06b6d4', shadow: 'rgba(6,182,212,0.6)',  size: '8.5rem', ring: '4px solid #22d3ee', iconColor: 'text-cyan-200',   pulse: true },
] as const

function getTier(totalLevels: number) {
  for (let i = BUTTON_TIERS.length - 1; i >= 0; i--) {
    if (totalLevels >= BUTTON_TIERS[i].threshold) return BUTTON_TIERS[i]
  }
  return BUTTON_TIERS[0]
}

const ORBIT_RADIUS = 90
const PLANET_ANGLE_START = -Math.PI / 2 // top

export default function ClickGenerator() {
  const click = useGameStore((s) => s.click)
  const clickPower = useGameStore((s) => s.clickPower)
  const globalMultiplier = useGameStore((s) => s.globalMultiplier)
  const research = useGameStore((s) => s.research)
  const upgrades = useGameStore((s) => s.upgrades)
  const planets = useGameStore((s) => s.planets)
  const timesPrestiged = useGameStore((s) => s.prestige.timesPrestiged)

  const effectiveClick = clickPower * globalMultiplier
  const hasAutoClick = research.unlockedNodes.includes('res_auto_click')

  const totalUpgradeLevels = upgrades.reduce((sum, u) => sum + u.level, 0)
  const tier = getTier(totalUpgradeLevels)
  const unlockedPlanets = planets.filter((p) => p.unlocked)

  const [floaters, setFloaters] = useState<Floater[]>([])
  const [bouncing, setBouncing] = useState(false)

  const handleClick = useCallback(() => {
    click()
    audioManager.playSfx('click')
    setBouncing(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setBouncing(false))
    })

    const id = nextFloaterId++
    const x = -20 + Math.random() * 40
    setFloaters((prev) => {
      const next = [...prev, { id, value: effectiveClick, x }]
      if (next.length > 15) next.shift()
      return next
    })
  }, [click, effectiveClick])

  const removeFloater = useCallback((id: number) => {
    setFloaters((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const buttonStyle: React.CSSProperties = {
    background: `linear-gradient(to bottom right, ${tier.from}, ${tier.to})`,
    boxShadow: `0 10px 15px -3px ${tier.shadow}${tier.pulse ? `, 0 0 30px ${tier.shadow}` : ''}`,
    width: tier.size,
    height: tier.size,
    outline: tier.ring === 'none' ? undefined : tier.ring,
    outlineOffset: '3px',
    transition: 'all 0.5s ease',
  }

  if (timesPrestiged >= 1) {
    buttonStyle.outline = `${tier.ring === 'none' ? '2px' : tier.ring.split(' ')[0]} solid #fbbf24`
    buttonStyle.outlineOffset = tier.ring === 'none' ? '3px' : '7px'
  }

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Planet orbit ring */}
        {unlockedPlanets.length > 0 && (
          <div className="absolute inset-0 animate-orbit">
            {unlockedPlanets.map((planet, i) => {
              const angle = PLANET_ANGLE_START + (i * 2 * Math.PI) / 5
              const x = Math.cos(angle) * ORBIT_RADIUS
              const y = Math.sin(angle) * ORBIT_RADIUS
              const PlanetIcon = PLANET_ICONS[planet.id]
              if (!PlanetIcon) return null
              return (
                <div
                  key={planet.id}
                  className="absolute animate-planet-appear"
                  style={{
                    left: `calc(50% + ${x}px - 16px)`,
                    top: `calc(50% + ${y}px - 16px)`,
                  }}
                >
                  <div style={{ animation: 'orbit-rotate 60s linear infinite reverse' }}>
                    <PlanetIcon className="w-8 h-8 drop-shadow-lg" />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Click button */}
        <button
          onClick={handleClick}
          style={buttonStyle}
          className={`rounded-full text-white
                     hover:scale-105 active:scale-95 transition-transform duration-100 select-none
                     flex items-center justify-center
                     ${bouncing ? 'animate-click-bounce' : ''}
                     ${tier.pulse ? 'animate-pulse-glow' : ''}`}
        >
          <IconEnergyOrb className={`w-16 h-16 ${tier.iconColor}`} />
        </button>

        {/* Floater damage numbers */}
        {floaters.map((f) => (
          <span
            key={f.id}
            className="animate-float-up absolute top-1/2 left-1/2 text-yellow-300 font-bold text-sm whitespace-nowrap"
            style={{ transform: `translate(calc(-50% + ${f.x}px), -50%)` }}
            onAnimationEnd={() => removeFloater(f.id)}
          >
            +{formatNumber(f.value)}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-400 mt-3">
        +{formatNumber(effectiveClick)} per click
      </p>
      {hasAutoClick && (
        <p className="text-xs text-emerald-400/70 mt-1">
          Auto-clicking 1/sec
        </p>
      )}
    </div>
  )
}
