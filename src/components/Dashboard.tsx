import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../game/formulas'
import { ACHIEVEMENTS } from '../game/achievements'
import { EVENT_DEFINITIONS } from '../game/events'
import EnergyDisplay from './EnergyDisplay'
import ClickGenerator from './ClickGenerator'
import UpgradesList from './UpgradesList'
import PlanetsList from './PlanetsList'
import ResearchTree from './ResearchTree'
import PrestigePanel from './PrestigePanel'
import { IconTrophy, IconMedal, IconStar, EVENT_ICONS } from './Icons'
import SettingsMenu from './SettingsMenu'

type Tab = 'production' | 'research' | 'planets' | 'prestige'

export default function Dashboard() {
  const saveGameState = useGameStore((s) => s.saveGameState)
  const resetGame = useGameStore((s) => s.resetGame)
  const statistics = useGameStore((s) => s.statistics)
  const totalEnergyGenerated = useGameStore((s) => s.totalEnergyGenerated)
  const achievements = useGameStore((s) => s.achievements)
  const events = useGameStore((s) => s.events)
  const activateEvent = useGameStore((s) => s.activateEvent)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('production')

  const handleSave = async () => {
    setSaving(true)
    await saveGameState()
    setTimeout(() => setSaving(false), 800)
  }

  const handleReset = async () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      await resetGame()
    }
  }

  const formatPlaytime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  // Event banner
  const pendingEventDef = events.pendingEvent
    ? EVENT_DEFINITIONS.find((e) => e.id === events.pendingEvent!.eventId)
    : null
  const activeEventDef = events.activeEvent
    ? EVENT_DEFINITIONS.find((e) => e.id === events.activeEvent!.eventId)
    : null
  const activeEventRemaining = events.activeEvent
    ? Math.max(0, Math.ceil((events.activeEvent.endsAt - Date.now()) / 1000))
    : 0

  const tabs: { id: Tab; label: string }[] = [
    { id: 'production', label: 'Production' },
    { id: 'research', label: 'Research' },
    { id: 'planets', label: 'Planets' },
    { id: 'prestige', label: 'Prestige' },
  ]

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-4 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-100">
          Galactic Terraforming Bureau
        </h1>
        <div className="flex gap-2">
          <SettingsMenu />
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            {saving ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-red-800 text-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Always visible: Energy + Click */}
      <EnergyDisplay />
      <ClickGenerator />

      {/* Event banner */}
      {pendingEventDef && events.pendingEvent && (
        <div
          onClick={activateEvent}
          className="mt-2 p-3 rounded-lg bg-amber-900/40 border border-amber-500/50 cursor-pointer hover:bg-amber-900/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = EVENT_ICONS[events.pendingEvent!.eventId]
                return Icon ? <Icon className="w-8 h-8 text-amber-400 animate-pulse shrink-0" /> : null
              })()}
              <div>
                <p className="text-sm font-bold text-amber-300">
                  {pendingEventDef.name}
                </p>
                <p className="text-xs text-amber-400/70">
                  {pendingEventDef.description}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-200 bg-amber-600/40 px-2 py-1 rounded animate-pulse">
              Click to activate!
            </span>
          </div>
        </div>
      )}
      {activeEventDef && events.activeEvent && (
        <div className="mt-2 p-3 rounded-lg bg-cyan-900/40 border border-cyan-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = EVENT_ICONS[events.activeEvent!.eventId]
                return Icon ? <Icon className="w-8 h-8 text-cyan-400 animate-pulse shrink-0" /> : null
              })()}
              <div>
                <p className="text-sm font-bold text-cyan-300">
                  {activeEventDef.name}
                </p>
                <p className="text-xs text-cyan-400/70">
                  {activeEventDef.description}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-cyan-200 tabular-nums">
              {activeEventRemaining}s
            </span>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mt-4 mb-4 bg-gray-800/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {activeTab === 'production' && (
          <div>
            <UpgradesList />

            {/* Achievements section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-300 mb-3">
                Achievements ({achievements.length}/{ACHIEVEMENTS.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = achievements.includes(ach.id)
                  return (
                    <div
                      key={ach.id}
                      className={`p-2 rounded-lg border text-xs ${
                        unlocked
                          ? 'bg-yellow-900/20 border-yellow-600/40'
                          : 'bg-gray-900/30 border-gray-800/30 opacity-50'
                      }`}
                    >
                      <p
                        className={`font-medium flex items-center gap-1 ${unlocked ? 'text-yellow-300' : 'text-gray-500'}`}
                      >
                        {(() => {
                          const iconClass = `w-4 h-4 ${unlocked ? 'text-yellow-400' : 'text-gray-600'}`
                          if (ach.bonusType === 'click') return <IconTrophy className={iconClass} />
                          if (ach.bonusType === 'production' || ach.bonusType === 'costReduction') return <IconMedal className={iconClass} />
                          return <IconStar className={iconClass} />
                        })()}
                        {unlocked ? ach.name : '???'}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        {unlocked ? ach.bonusDescription : ach.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'research' && <ResearchTree />}
        {activeTab === 'planets' && <PlanetsList />}
        {activeTab === 'prestige' && <PrestigePanel />}
      </div>

      {/* Stats footer */}
      <footer className="mt-6 py-3 border-t border-gray-800">
        <div className="flex justify-center gap-6 text-xs text-gray-500">
          <span>Clicks: {statistics.totalClicks.toLocaleString()}</span>
          <span>Playtime: {formatPlaytime(statistics.playtime)}</span>
          <span>Total: {formatNumber(totalEnergyGenerated)}</span>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-1">
          Icons by <a href="https://game-icons.net" target="_blank" className="underline">game-icons.net</a> (CC BY 3.0)
        </p>
      </footer>
    </div>
  )
}
