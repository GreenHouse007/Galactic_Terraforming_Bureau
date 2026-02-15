import { create } from 'zustand'
import type {
  GameState,
  SaveData,
  BuyQuantity,
  EventState,
  GeneratorState,
} from '../game/types'
import { GENERATORS, createInitialGeneratorStates } from '../game/generators'
import { PLANETS, createInitialPlanetStates, getPlanetBonuses } from '../game/planets'
import { createInitialPrestigeState, calculateDustGain, getDustUpgradeCost, DUST_UPGRADES } from '../game/prestige'
import { createInitialResearchState, canResearch, RESEARCH_NODES } from '../game/research'
import { ACHIEVEMENTS, getAchievementBonuses, checkAchievements } from '../game/achievements'
import { getRandomEventTime, getRandomEvent, EVENT_DEFINITIONS } from '../game/events'
import {
  calculateGlobalMultiplier,
  getGeneratorRevenue,
  getEffectiveCycleTime,
  getBuyAmount,
  formatNumber,
} from '../game/formulas'
import { calculateOfflineEnergy } from '../game/offlineProgress'
import { audioManager } from '../audio/audioManager'
import { saveGame, loadGame, deleteSave } from '../utils/persistence'

export type Toast = { id: number; message: string; type: 'achievement' | 'event' | 'prestige' }

interface GameActions {
  runGenerator: (id: string) => void
  buyGenerator: (id: string) => void
  buyManager: (id: string) => void
  unlockPlanet: (planetId: string) => void
  tick: (deltaSec: number) => void
  loadGameState: () => Promise<{ offlineSeconds: number; offlineEnergy: number }>
  saveGameState: () => Promise<void>
  resetGame: () => Promise<void>
  recalcDerived: () => void
  setBuyQuantity: (qty: BuyQuantity) => void
  stellarReset: () => void
  purchaseDustUpgrade: (upgradeId: string) => void
  purchaseResearch: (nodeId: string) => void
  activateEvent: () => void
  dismissEvent: () => void
  toasts: Toast[]
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: number) => void
}

type Store = GameState & GameActions

let toastCounter = 0

function createInitialEventState(): EventState {
  return {
    pendingEvent: null,
    activeEvent: null,
    nextEventTime: getRandomEventTime(),
  }
}

function createInitialState(): GameState {
  return {
    energy: 0,
    totalEnergyGenerated: 0,
    globalMultiplier: 1,
    generators: createInitialGeneratorStates(),
    planets: createInitialPlanetStates(),
    lastSaveTime: Date.now(),
    statistics: { totalClicks: 0, playtime: 0 },
    prestige: createInitialPrestigeState(),
    achievements: [],
    research: createInitialResearchState(),
    events: createInitialEventState(),
    buyQuantity: 1,
  }
}

export const useGameStore = create<Store>((set, get) => ({
  ...createInitialState(),
  toasts: [],

  addToast: (message: string, type: Toast['type']) => {
    const id = ++toastCounter
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 3000)
    if (type === 'achievement') audioManager.playSfx('achievement')
  },

  removeToast: (id: number) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },

  runGenerator: (id: string) => {
    const state = get()
    const gen = state.generators.find((g) => g.id === id)
    if (!gen || gen.running || gen.owned === 0 || gen.hasManager) return

    set({
      generators: state.generators.map((g) =>
        g.id === id ? { ...g, running: true, progress: 0 } : g
      ),
    })
  },

  buyGenerator: (id: string) => {
    const state = get()
    const genState = state.generators.find((g) => g.id === id)
    const def = GENERATORS.find((g) => g.id === id)
    if (!genState || !def) return

    // Check research gate for tier 2 generators (index >= 5)
    const genIndex = GENERATORS.indexOf(def)
    if (genIndex >= 5 && !state.research.unlockedNodes.includes('res_tier2_unlock')) return

    const planetBonuses = getPlanetBonuses(state.planets)
    const achievementBonuses = getAchievementBonuses(state.achievements)
    const hasBulkBuy = state.research.unlockedNodes.includes('res_bulk_buy')
    const qty = hasBulkBuy ? state.buyQuantity : 1

    const { count, totalCost } = getBuyAmount(
      def, genState.owned, state.energy, qty,
      planetBonuses, achievementBonuses, state.prestige, state.events
    )
    if (count === 0) return

    const newGenerators = state.generators.map((g) =>
      g.id === id ? { ...g, owned: g.owned + count } : g
    )

    set({ energy: state.energy - totalCost, generators: newGenerators })
    audioManager.playSfx('purchase')

    // Check achievements
    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const achId of newAch) {
        const achDef = ACHIEVEMENTS.find((a) => a.id === achId)
        if (achDef) get().addToast(`Achievement: ${achDef.name}!`, 'achievement')
      }
      get().recalcDerived()
    }
  },

  buyManager: (id: string) => {
    const state = get()
    const def = GENERATORS.find((g) => g.id === id)
    const genState = state.generators.find((g) => g.id === id)
    if (!def || !genState || genState.hasManager) return
    if (state.energy < def.managerCost) return

    const newGenerators = state.generators.map((g) =>
      g.id === id ? { ...g, hasManager: true, running: g.owned > 0, progress: 0 } : g
    )

    set({
      energy: state.energy - def.managerCost,
      generators: newGenerators,
    })
    audioManager.playSfx('purchase')

    // Check achievements
    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const achId of newAch) {
        const achDef = ACHIEVEMENTS.find((a) => a.id === achId)
        if (achDef) get().addToast(`Achievement: ${achDef.name}!`, 'achievement')
      }
      get().recalcDerived()
    }
  },

  unlockPlanet: (planetId: string) => {
    const state = get()
    const planetState = state.planets.find((p) => p.id === planetId)
    const def = PLANETS.find((p) => p.id === planetId)
    if (!planetState || !def || planetState.unlocked) return
    if (state.energy < def.unlockCost) return

    const newPlanets = state.planets.map((p) =>
      p.id === planetId ? { ...p, unlocked: true } : p
    )

    let energyAfter = state.energy - def.unlockCost

    if (state.research.unlockedNodes.includes('res_planet_refund')) {
      energyAfter += def.unlockCost * 0.25
    }

    set({ energy: energyAfter, planets: newPlanets })
    get().recalcDerived()
    audioManager.playSfx('purchase')

    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const achId of newAch) {
        const achDef = ACHIEVEMENTS.find((a) => a.id === achId)
        if (achDef) get().addToast(`Achievement: ${achDef.name}!`, 'achievement')
      }
      get().recalcDerived()
    }
  },

  tick: (deltaSec: number) => {
    const state = get()
    const now = Date.now()
    const planetBonuses = getPlanetBonuses(state.planets)
    const achievementBonuses = getAchievementBonuses(state.achievements)

    let energyGained = 0
    const newGenerators: GeneratorState[] = state.generators.map((gen) => {
      if (!gen.running || gen.owned === 0) return gen

      const def = GENERATORS.find((g) => g.id === gen.id)
      if (!def) return gen

      const cycleTime = getEffectiveCycleTime(def, planetBonuses, state.prestige)
      const progressDelta = deltaSec / cycleTime
      let newProgress = gen.progress + progressDelta
      const updated = { ...gen }

      if (newProgress >= 1) {
        // Collect revenue
        const revenue = getGeneratorRevenue(
          def, gen.owned, state.globalMultiplier,
          planetBonuses, achievementBonuses, state.prestige,
          state.research.unlockedNodes, state.events
        )
        energyGained += revenue
        updated.totalRevenue = gen.totalRevenue + revenue

        if (gen.hasManager) {
          // Auto-restart: handle multiple completions in one tick
          const extraProgress = newProgress - 1
          updated.progress = extraProgress % 1
          updated.running = true

          // If more than one full cycle completed, collect those too
          const extraCycles = Math.floor(extraProgress)
          if (extraCycles > 0) {
            const extraRevenue = revenue * extraCycles
            energyGained += extraRevenue
            updated.totalRevenue += extraRevenue
          }
        } else {
          updated.running = false
          updated.progress = 0
        }
      } else {
        updated.progress = newProgress
      }

      return updated
    })

    const updates: Partial<GameState> = {
      generators: newGenerators,
      statistics: {
        ...state.statistics,
        playtime: state.statistics.playtime + deltaSec,
      },
    }

    if (energyGained > 0) {
      updates.energy = state.energy + energyGained
      updates.totalEnergyGenerated = state.totalEnergyGenerated + energyGained
    }

    // Event spawning
    if (!state.events.pendingEvent && !state.events.activeEvent && now >= state.events.nextEventTime) {
      const eventDef = getRandomEvent()
      updates.events = {
        ...state.events,
        pendingEvent: {
          eventId: eventDef.id,
          spawnedAt: now,
          expiresAt: now + 30_000,
        },
        nextEventTime: getRandomEventTime(),
      }
      get().addToast(`Event: ${eventDef.name}! Click to activate!`, 'event')
      audioManager.playSfx('event')
    }

    // Pending event expiry
    if (state.events.pendingEvent && now >= state.events.pendingEvent.expiresAt) {
      updates.events = {
        ...(updates.events ?? state.events),
        pendingEvent: null,
      }
    }

    // Active event expiry
    if (state.events.activeEvent && now >= state.events.activeEvent.endsAt) {
      updates.events = {
        ...(updates.events ?? state.events),
        activeEvent: null,
      }
      set(updates as GameState)
      get().recalcDerived()
      return
    }

    set(updates as GameState)

    // Check achievements every ~5 seconds
    const prevPlaytime = state.statistics.playtime
    const newPlaytime = prevPlaytime + deltaSec
    if (Math.floor(newPlaytime / 5) > Math.floor(prevPlaytime / 5)) {
      const newState = get()
      const newAch = checkAchievements(newState)
      if (newAch.length > 0) {
        set({ achievements: [...newState.achievements, ...newAch] })
        for (const achId of newAch) {
          const achDef = ACHIEVEMENTS.find((a) => a.id === achId)
          if (achDef) get().addToast(`Achievement: ${achDef.name}!`, 'achievement')
        }
        get().recalcDerived()
      }
    }
  },

  recalcDerived: () => {
    const state = get()
    const achievementBonuses = getAchievementBonuses(state.achievements)
    const planetStatesWithMult = state.planets.map((p) => {
      const def = PLANETS.find((d) => d.id === p.id)
      return { ...p, multiplier: def?.multiplier ?? 1 }
    })

    set({
      globalMultiplier: calculateGlobalMultiplier(planetStatesWithMult, achievementBonuses),
    })
  },

  setBuyQuantity: (qty: BuyQuantity) => {
    set({ buyQuantity: qty })
  },

  stellarReset: () => {
    const state = get()
    const achievementBonuses = getAchievementBonuses(state.achievements)
    const hasPrestigeBoost = state.research.unlockedNodes.includes('res_prestige_boost')
    const dustGain = calculateDustGain(
      state.totalEnergyGenerated,
      achievementBonuses.prestigeDust,
      hasPrestigeBoost
    )
    if (dustGain <= 0) return

    const headstart = state.prestige.dustUpgrades.find((u) => u.id === 'dust_starting')
    const startingEnergy = headstart ? headstart.level * 100 : 0

    set({
      energy: startingEnergy,
      totalEnergyGenerated: 0,
      generators: createInitialGeneratorStates(),
      planets: createInitialPlanetStates(),
      prestige: {
        ...state.prestige,
        stellarDust: state.prestige.stellarDust + dustGain,
        timesPrestiged: state.prestige.timesPrestiged + 1,
      },
      events: createInitialEventState(),
    })
    get().recalcDerived()
    get().addToast(`Stellar Reset! Earned ${formatNumber(dustGain)} dust`, 'prestige')
    audioManager.playSfx('prestige')

    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const achId of newAch) {
        const achDef = ACHIEVEMENTS.find((a) => a.id === achId)
        if (achDef) get().addToast(`Achievement: ${achDef.name}!`, 'achievement')
      }
    }
  },

  purchaseDustUpgrade: (upgradeId: string) => {
    const state = get()
    const upgState = state.prestige.dustUpgrades.find((u) => u.id === upgradeId)
    const def = DUST_UPGRADES.find((u) => u.id === upgradeId)
    if (!upgState || !def) return
    if (upgState.level >= def.maxLevel) return

    const cost = getDustUpgradeCost(def, upgState.level)
    if (state.prestige.stellarDust < cost) return

    const newDustUpgrades = state.prestige.dustUpgrades.map((u) =>
      u.id === upgradeId ? { ...u, level: u.level + 1 } : u
    )

    set({
      prestige: {
        ...state.prestige,
        stellarDust: state.prestige.stellarDust - cost,
        dustUpgrades: newDustUpgrades,
      },
    })
    get().recalcDerived()
  },

  purchaseResearch: (nodeId: string) => {
    const state = get()
    if (!canResearch(nodeId, state.research)) return
    const def = RESEARCH_NODES.find((n) => n.id === nodeId)
    if (!def || state.energy < def.cost) return

    set({
      energy: state.energy - def.cost,
      research: {
        unlockedNodes: [...state.research.unlockedNodes, nodeId],
      },
    })
    get().recalcDerived()
  },

  activateEvent: () => {
    const state = get()
    if (!state.events.pendingEvent) return
    const eventDef = EVENT_DEFINITIONS.find((e) => e.id === state.events.pendingEvent!.eventId)
    if (!eventDef) return

    const planetBonuses = getPlanetBonuses(state.planets)
    const duration = (eventDef.duration + planetBonuses.eventDuration) * 1000
    const now = Date.now()

    set({
      events: {
        ...state.events,
        pendingEvent: null,
        activeEvent: {
          eventId: eventDef.id,
          activatedAt: now,
          endsAt: now + duration,
        },
      },
    })
    get().recalcDerived()
  },

  dismissEvent: () => {
    const state = get()
    set({
      events: {
        ...state.events,
        pendingEvent: null,
      },
    })
  },

  loadGameState: async () => {
    const saved = await loadGame()
    if (!saved) return { offlineSeconds: 0, offlineEnergy: 0 }

    // Migrate old saves (had upgrades, no generators)
    const isOldSave = saved.upgrades && !saved.generators
    const generators = isOldSave
      ? createInitialGeneratorStates()
      : (saved.generators ?? createInitialGeneratorStates())

    const prestige = saved.prestige ?? createInitialPrestigeState()
    const achievements = saved.achievements ?? []
    const research = saved.research ?? createInitialResearchState()
    const events = saved.events ?? createInitialEventState()
    const buyQuantity = saved.buyQuantity ?? 1

    // Ensure all generators exist in saved state
    const savedGenIds = new Set(generators.map((g) => g.id))
    for (const def of GENERATORS) {
      if (!savedGenIds.has(def.id)) {
        generators.push({
          id: def.id,
          owned: 0,
          running: false,
          progress: 0,
          hasManager: false,
          totalRevenue: 0,
        })
      }
    }

    // Ensure dust upgrades exist
    const savedDustIds = new Set(prestige.dustUpgrades.map((u) => u.id))
    for (const def of DUST_UPGRADES) {
      if (!savedDustIds.has(def.id)) {
        prestige.dustUpgrades.push({ id: def.id, level: 0 })
      }
    }

    // Migrate old dust upgrade IDs
    for (const du of prestige.dustUpgrades) {
      if (du.id === 'dust_click') du.id = 'dust_speed'
      if (du.id === 'dust_production') du.id = 'dust_revenue'
    }

    set({
      energy: saved.energy,
      totalEnergyGenerated: saved.totalEnergyGenerated,
      generators,
      planets: saved.planets,
      lastSaveTime: saved.lastSaveTime,
      statistics: saved.statistics,
      prestige,
      achievements,
      research,
      events,
      buyQuantity,
    })
    get().recalcDerived()

    // Calculate offline progress
    const state = get()
    const planetBonuses = getPlanetBonuses(state.planets)
    const achievementBonuses = getAchievementBonuses(state.achievements)
    const hasResearchOffline = state.research.unlockedNodes.includes('res_offline')
    const offline = calculateOfflineEnergy(
      saved.lastSaveTime,
      state.generators,
      state.globalMultiplier,
      planetBonuses,
      achievementBonuses,
      state.prestige,
      hasResearchOffline
    )

    if (offline.energy > 0) {
      set({
        energy: state.energy + offline.energy,
        totalEnergyGenerated: state.totalEnergyGenerated + offline.energy,
      })
    }

    return { offlineSeconds: offline.seconds, offlineEnergy: offline.energy }
  },

  saveGameState: async () => {
    const state = get()
    const data: SaveData = {
      energy: state.energy,
      totalEnergyGenerated: state.totalEnergyGenerated,
      generators: state.generators,
      planets: state.planets,
      lastSaveTime: Date.now(),
      statistics: state.statistics,
      prestige: state.prestige,
      achievements: state.achievements,
      research: state.research,
      events: state.events,
      buyQuantity: state.buyQuantity,
    }
    await saveGame(data)
    set({ lastSaveTime: data.lastSaveTime })
  },

  resetGame: async () => {
    await deleteSave()
    set(createInitialState())
  },
}))
