import { useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../game/formulas'
import { IconEnergyOrb } from './Icons'

interface Floater {
  id: number
  value: number
  x: number
}

let nextFloaterId = 0

export default function ClickGenerator() {
  const click = useGameStore((s) => s.click)
  const clickPower = useGameStore((s) => s.clickPower)
  const globalMultiplier = useGameStore((s) => s.globalMultiplier)
  const research = useGameStore((s) => s.research)

  const effectiveClick = clickPower * globalMultiplier
  const hasAutoClick = research.unlockedNodes.includes('res_auto_click')

  const [floaters, setFloaters] = useState<Floater[]>([])
  const [bouncing, setBouncing] = useState(false)

  const handleClick = useCallback(() => {
    click()
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

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative">
        <button
          onClick={handleClick}
          className={`w-28 h-28 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600
                     text-white shadow-lg shadow-orange-500/30
                     hover:from-yellow-400 hover:to-orange-500 hover:scale-105
                     active:scale-95 transition-all duration-100 select-none
                     flex items-center justify-center
                     ${bouncing ? 'animate-click-bounce' : ''}`}
        >
          <IconEnergyOrb className="w-16 h-16 text-yellow-300" />
        </button>
        {floaters.map((f) => (
          <span
            key={f.id}
            className="animate-float-up absolute top-0 left-1/2 text-yellow-300 font-bold text-sm whitespace-nowrap"
            style={{ transform: `translateX(calc(-50% + ${f.x}px))` }}
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
