import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { formatNumber } from './game/formulas'
import Dashboard from './components/Dashboard'
import Starfield from './components/Starfield'
import { audioManager } from './audio/audioManager'
import { useAudioSettings } from './audio/useAudioSettings'

const AUTO_SAVE_INTERVAL = 30_000

export default function App() {
  const tick = useGameStore((s) => s.tick)
  const loadGameState = useGameStore((s) => s.loadGameState)
  const saveGameState = useGameStore((s) => s.saveGameState)
  const toasts = useGameStore((s) => s.toasts)
  const [offlineMsg, setOfflineMsg] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load saved game on mount
  useEffect(() => {
    loadGameState().then(({ offlineSeconds, offlineEnergy }) => {
      if (offlineEnergy > 0) {
        const mins = Math.floor(offlineSeconds / 60)
        setOfflineMsg(
          `Welcome back! You earned ${formatNumber(offlineEnergy)} energy while away (${mins}m).`
        )
        setTimeout(() => setOfflineMsg(null), 5000)
      }
      setLoaded(true)
    })
  }, [loadGameState])

  // Initialize audio on first user interaction (browser autoplay policy)
  useEffect(() => {
    if (!loaded) return
    const settings = useAudioSettings.getState()
    const startAudio = () => {
      audioManager.setMusicVolume(settings.musicVolume)
      audioManager.setSfxVolume(settings.sfxVolume)
      audioManager.setMuted(settings.muted)
      audioManager.setMusicEnabled(settings.musicEnabled)
      audioManager.setSfxEnabled(settings.sfxEnabled)
      audioManager.init()
      if (settings.musicEnabled && !settings.muted) {
        audioManager.playMusic()
      }
      document.removeEventListener('click', startAudio)
      document.removeEventListener('touchstart', startAudio)
    }
    document.addEventListener('click', startAudio, { once: true })
    document.addEventListener('touchstart', startAudio, { once: true })
    return () => {
      document.removeEventListener('click', startAudio)
      document.removeEventListener('touchstart', startAudio)
    }
  }, [loaded])

  // rAF game loop
  useEffect(() => {
    if (!loaded) return
    let lastTime = performance.now()
    let rafId: number

    const loop = (now: number) => {
      const deltaSec = (now - lastTime) / 1000
      lastTime = now
      if (deltaSec > 0 && deltaSec < 1) {
        tick(deltaSec)
      }
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [loaded, tick])

  // Auto-save interval
  useEffect(() => {
    if (!loaded) return
    const id = setInterval(() => saveGameState(), AUTO_SAVE_INTERVAL)
    return () => clearInterval(id)
  }, [loaded, saveGameState])

  // Save on page unload
  useEffect(() => {
    const handler = () => saveGameState()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [saveGameState])

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    )
  }

  return (
    <>
      <Starfield />
      {/* Toast stack */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {offlineMsg && (
          <div className="bg-blue-900/90 text-blue-200 px-4 py-2 rounded-lg text-sm shadow-lg max-w-sm text-center pointer-events-auto">
            {offlineMsg}
          </div>
        )}
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg text-sm shadow-lg max-w-sm text-center pointer-events-auto animate-fade-in ${
              toast.type === 'achievement'
                ? 'bg-yellow-900/90 text-yellow-200'
                : toast.type === 'prestige'
                  ? 'bg-purple-900/90 text-purple-200'
                  : 'bg-amber-900/90 text-amber-200'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <Dashboard />
    </>
  )
}
