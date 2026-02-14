export type SfxName = 'click' | 'purchase' | 'achievement' | 'event' | 'prestige'

const SFX_FILES: SfxName[] = ['click', 'purchase', 'achievement', 'event', 'prestige']

class AudioManager {
  private music: HTMLAudioElement | null = null
  private sfxCache: Map<SfxName, HTMLAudioElement> = new Map()
  private musicVolume = 0.3
  private sfxVolume = 0.5
  private muted = false
  private musicEnabled = true
  private sfxEnabled = true
  private initialized = false

  init() {
    if (this.initialized) return
    this.initialized = true

    // Preload music
    this.music = new Audio('/audio/music.ogg')
    this.music.loop = true
    this.music.volume = this.muted ? 0 : this.musicVolume
    this.music.preload = 'auto'

    // Preload SFX (one template element per sound)
    for (const name of SFX_FILES) {
      const audio = new Audio(`/audio/${name}.ogg`)
      audio.preload = 'auto'
      audio.volume = this.muted ? 0 : this.sfxVolume
      this.sfxCache.set(name, audio)
    }
  }

  playMusic() {
    if (!this.music || !this.musicEnabled || this.muted) return
    this.music.volume = this.musicVolume
    this.music.play().catch(() => {
      // Autoplay blocked — will retry on next user interaction
    })
  }

  stopMusic() {
    if (!this.music) return
    this.music.pause()
    this.music.currentTime = 0
  }

  pauseMusic() {
    this.music?.pause()
  }

  playSfx(name: SfxName) {
    if (!this.sfxEnabled || this.muted || !this.initialized) return
    const template = this.sfxCache.get(name)
    if (!template) return
    // Clone so rapid plays don't cut each other off
    const clone = template.cloneNode(true) as HTMLAudioElement
    clone.volume = this.sfxVolume
    clone.play().catch(() => {})
  }

  setMusicVolume(v: number) {
    this.musicVolume = v
    if (this.music) {
      this.music.volume = this.muted ? 0 : v
    }
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.music) {
      this.music.volume = m ? 0 : this.musicVolume
      if (m) {
        this.music.pause()
      } else if (this.musicEnabled) {
        this.music.play().catch(() => {})
      }
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (!enabled) {
      this.pauseMusic()
    } else if (!this.muted) {
      this.playMusic()
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled
  }
}

export const audioManager = new AudioManager()
