export type SfxName = 'purchase' | 'achievement' | 'event' | 'prestige'

const SFX_FILES: SfxName[] = ['purchase', 'achievement', 'event', 'prestige']

// ── Procedural Lofi Music Generator ──────────────────────────────────
// Uses Web Audio API to generate a warm lofi chord progression.
// Chord loop: Am7 → Dm7 → G7 → Cmaj7 at ~70 BPM (each chord ~3.43s)

const LOFI_CHORDS: number[][] = [
  [220.00, 261.63, 329.63, 392.00],   // Am7:   A3  C4  E4  G4
  [293.66, 349.23, 440.00, 523.25],   // Dm7:   D4  F4  A4  C5
  [196.00, 246.94, 293.66, 349.23],   // G7:    G3  B3  D4  F4
  [261.63, 329.63, 392.00, 493.88],   // Cmaj7: C4  E4  G4  B4
]

const BPM = 70
const BEATS_PER_CHORD = 4
const CHORD_DURATION = (60 / BPM) * BEATS_PER_CHORD // ~3.43s

class LofiGenerator {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private noiseGain: GainNode | null = null
  private activeOscillators: OscillatorNode[] = []
  private noiseSource: AudioBufferSourceNode | null = null
  private chordIndex = 0
  private chordTimer: ReturnType<typeof setTimeout> | null = null
  private running = false

  start(volume: number) {
    if (this.running) return
    this.running = true
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = volume
    this.masterGain.connect(this.ctx.destination)

    // Vinyl crackle noise layer
    this.startNoise()

    this.chordIndex = 0
    this.scheduleChord()
  }

  stop() {
    this.running = false
    if (this.chordTimer) {
      clearTimeout(this.chordTimer)
      this.chordTimer = null
    }
    this.killOscillators()
    if (this.noiseSource) {
      try { this.noiseSource.stop() } catch { /* already stopped */ }
      this.noiseSource = null
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
    this.masterGain = null
    this.noiseGain = null
  }

  setVolume(v: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = v
    }
  }

  suspend() {
    this.ctx?.suspend().catch(() => {})
  }

  resume() {
    this.ctx?.resume().catch(() => {})
  }

  private startNoise() {
    if (!this.ctx || !this.masterGain) return
    // Generate a short noise buffer and loop it
    const len = this.ctx.sampleRate * 2
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015 // very quiet
    }
    this.noiseSource = this.ctx.createBufferSource()
    this.noiseSource.buffer = buf
    this.noiseSource.loop = true

    // Bandpass filter for vinyl character
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 800
    bp.Q.value = 0.5

    this.noiseGain = this.ctx.createGain()
    this.noiseGain.gain.value = 0.8

    this.noiseSource.connect(bp)
    bp.connect(this.noiseGain)
    this.noiseGain.connect(this.masterGain)
    this.noiseSource.start()
  }

  private scheduleChord() {
    if (!this.running || !this.ctx || !this.masterGain) return

    this.killOscillators()

    const chord = LOFI_CHORDS[this.chordIndex % LOFI_CHORDS.length]
    const now = this.ctx.currentTime

    // Slight humanized offset per note
    for (const freq of chord) {
      const offset = Math.random() * 0.04
      const osc = this.ctx.createOscillator()
      // Alternate between triangle and sine for warmth
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine'
      osc.frequency.value = freq + (Math.random() - 0.5) * 1.5 // subtle detune

      // Low-pass filter for muffled lofi feel
      const lp = this.ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 900 + Math.random() * 300
      lp.Q.value = 0.7

      // Per-note gain with fade in/out envelope
      const noteGain = this.ctx.createGain()
      noteGain.gain.setValueAtTime(0, now + offset)
      noteGain.gain.linearRampToValueAtTime(0.09, now + offset + 0.3)
      noteGain.gain.setValueAtTime(0.09, now + CHORD_DURATION - 0.5)
      noteGain.gain.linearRampToValueAtTime(0, now + CHORD_DURATION)

      osc.connect(lp)
      lp.connect(noteGain)
      noteGain.connect(this.masterGain!)

      osc.start(now + offset)
      osc.stop(now + CHORD_DURATION + 0.05)
      this.activeOscillators.push(osc)
    }

    this.chordIndex++
    this.chordTimer = setTimeout(() => this.scheduleChord(), CHORD_DURATION * 1000)
  }

  private killOscillators() {
    for (const osc of this.activeOscillators) {
      try { osc.stop() } catch { /* already stopped */ }
      osc.disconnect()
    }
    this.activeOscillators = []
  }
}

// ── Audio Manager ────────────────────────────────────────────────────

class AudioManager {
  private lofi = new LofiGenerator()
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

    // Preload SFX
    for (const name of SFX_FILES) {
      const audio = new Audio(`/audio/${name}.ogg`)
      audio.preload = 'auto'
      audio.volume = this.muted ? 0 : this.sfxVolume
      this.sfxCache.set(name, audio)
    }
  }

  playMusic() {
    if (!this.musicEnabled || this.muted) return
    this.lofi.start(this.musicVolume)
  }

  stopMusic() {
    this.lofi.stop()
  }

  pauseMusic() {
    this.lofi.suspend()
  }

  playSfx(name: SfxName) {
    if (!this.sfxEnabled || this.muted || !this.initialized) return
    const template = this.sfxCache.get(name)
    if (!template) return
    const clone = template.cloneNode(true) as HTMLAudioElement
    clone.volume = this.sfxVolume
    clone.play().catch(() => {})
  }

  setMusicVolume(v: number) {
    this.musicVolume = v
    if (!this.muted) {
      this.lofi.setVolume(v)
    }
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v
  }

  setMuted(m: boolean) {
    this.muted = m
    if (m) {
      this.lofi.suspend()
    } else {
      if (this.musicEnabled) {
        this.lofi.resume()
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
