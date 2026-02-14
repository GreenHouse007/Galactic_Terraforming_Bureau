import { useState, useEffect, useRef } from 'react'
import { useAudioSettings } from '../audio/useAudioSettings'

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor">
      <path d="M456.7 242.27l-26.08-4.2a178.22 178.22 0 00-9.88-23.83l15.64-21.17a20.47 20.47 0 00-2.16-27.13l-27.22-27.22a20.47 20.47 0 00-27.13-2.16l-21.17 15.64a178.22 178.22 0 00-23.83-9.88l-4.2-26.08a20.47 20.47 0 00-20.24-17.24h-38.52a20.47 20.47 0 00-20.24 17.24l-4.2 26.08a178.22 178.22 0 00-23.83 9.88l-21.17-15.64a20.47 20.47 0 00-27.13 2.16l-27.22 27.22a20.47 20.47 0 00-2.16 27.13l15.64 21.17a178.22 178.22 0 00-9.88 23.83l-26.08 4.2A20.47 20.47 0 0099 262.51V301a20.47 20.47 0 0017.24 20.24l26.08 4.2a178.22 178.22 0 009.88 23.83l-15.64 21.17a20.47 20.47 0 002.16 27.13l27.22 27.22a20.47 20.47 0 0027.13 2.16l21.17-15.64a178.22 178.22 0 0023.83 9.88l4.2 26.08A20.47 20.47 0 00262.51 465H301a20.47 20.47 0 0020.24-17.24l4.2-26.08a178.22 178.22 0 0023.83-9.88l21.17 15.64a20.47 20.47 0 0027.13-2.16l27.22-27.22a20.47 20.47 0 002.16-27.13l-15.64-21.17a178.22 178.22 0 009.88-23.83l26.08-4.2A20.47 20.47 0 00465 301v-38.52a20.47 20.47 0 00-8.3-18.21zM281.76 363.48a81.72 81.72 0 1181.72-81.72 81.72 81.72 0 01-81.72 81.72z" />
    </svg>
  )
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const {
    musicVolume, sfxVolume, muted, musicEnabled, sfxEnabled,
    setMusicVolume, setSfxVolume, setMuted, setMusicEnabled, setSfxEnabled,
  } = useAudioSettings()

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
        title="Settings"
      >
        <GearIcon className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-4"
        >
          <h3 className="text-sm font-semibold text-gray-200 mb-3">Settings</h3>

          {/* Music volume */}
          <label className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span>Music</span>
              <input
                type="checkbox"
                checked={musicEnabled}
                onChange={(e) => setMusicEnabled(e.target.checked)}
                className="accent-blue-500"
              />
            </span>
            <span>{Math.round(musicVolume * 100)}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            disabled={!musicEnabled}
            className="w-full h-1.5 mb-3 accent-blue-500 bg-gray-700 rounded-full appearance-none cursor-pointer disabled:opacity-40"
          />

          {/* SFX volume */}
          <label className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span>SFX</span>
              <input
                type="checkbox"
                checked={sfxEnabled}
                onChange={(e) => setSfxEnabled(e.target.checked)}
                className="accent-blue-500"
              />
            </span>
            <span>{Math.round(sfxVolume * 100)}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sfxVolume}
            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
            disabled={!sfxEnabled}
            className="w-full h-1.5 mb-3 accent-blue-500 bg-gray-700 rounded-full appearance-none cursor-pointer disabled:opacity-40"
          />

          {/* Mute all */}
          <button
            onClick={() => setMuted(!muted)}
            className={`w-full py-1.5 text-xs font-medium rounded transition-colors ${
              muted
                ? 'bg-red-800/60 text-red-300 hover:bg-red-800/80'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {muted ? 'Unmute All' : 'Mute All'}
          </button>
        </div>
      )}
    </div>
  )
}
