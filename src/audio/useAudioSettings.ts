import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioManager } from './audioManager'

interface AudioSettings {
  musicVolume: number
  sfxVolume: number
  muted: boolean
  musicEnabled: boolean
  sfxEnabled: boolean
}

interface AudioSettingsActions {
  setMusicVolume: (v: number) => void
  setSfxVolume: (v: number) => void
  setMuted: (m: boolean) => void
  setMusicEnabled: (e: boolean) => void
  setSfxEnabled: (e: boolean) => void
}

export const useAudioSettings = create<AudioSettings & AudioSettingsActions>()(
  persist(
    (set) => ({
      musicVolume: 0.3,
      sfxVolume: 0.5,
      muted: false,
      musicEnabled: true,
      sfxEnabled: true,

      setMusicVolume: (v: number) => {
        audioManager.setMusicVolume(v)
        set({ musicVolume: v })
      },
      setSfxVolume: (v: number) => {
        audioManager.setSfxVolume(v)
        set({ sfxVolume: v })
      },
      setMuted: (m: boolean) => {
        audioManager.setMuted(m)
        set({ muted: m })
      },
      setMusicEnabled: (e: boolean) => {
        audioManager.setMusicEnabled(e)
        set({ musicEnabled: e })
      },
      setSfxEnabled: (e: boolean) => {
        audioManager.setSfxEnabled(e)
        set({ sfxEnabled: e })
      },
    }),
    {
      name: 'audio-settings',
    }
  )
)
