import { create } from 'zustand'
import type {
  GameState,
  SaveData,
  BuyQuantity,
  EventState,
} from '../game/types'
import { UPGRADES, createInitialUpgradeStates } from '../game/upgrades'
import { PLANETS, createInitialPlanetStates, getPlanetBonuses } from '../game/planets'
import { createInitialPrestigeState, calculateDustGain, getDustUpgradeCost, DUST_UPGRADES } from '../game/prestige'
import { createInitialResearchState, canResearch, RESEARCH_NODES } from '../game/research'
import { ACHIEVEMENTS, getAchievementBonuses, checkAchievements } from '../game/achievements'
import { getRandomEventTime, getRandomEvent, EVENT_DEFINITIONS } from '../game/events'
import {
  calculateClickPower,
  calculatePassivePerSecond,
  calculateGlobalMultiplier,
  getBuyAmount,
  formatNumber,
} from '../game/formulas'
import { calculateOfflineEnergy } from '../game/offlineProgress'
import { audioManager } from '../audio/audioManager'
import { saveGame, loadGame, deleteSave } from '../utils/persistence'

export type Toast = { id: number; message: string; type: 'achievement' | 'event' | 'prestige' }

interface GameActions {
  click: () => void
  purchaseUpgrade: (upgradeId: string) => void
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
    clickPower: 1,
    passivePerSecond: 0,
    globalMultiplier: 1,
    upgrades: createInitialUpgradeStates(),
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

  click: () => {
    const state = get()
    const gained = state.clickPower * state.globalMultiplier
    set({
      energy: state.energy + gained,
      totalEnergyGenerated: state.totalEnergyGenerated + gained,
      statistics: {
        ...state.statistics,
        totalClicks: state.statistics.totalClicks + 1,
      },
    })
    // Check achievements on click
    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const id of newAch) {
        const def = ACHIEVEMENTS.find((a) => a.id === id)
        if (def) get().addToast(`Achievement: ${def.name}!`, 'achievement')
      }
      get().recalcDerived()
    }
  },

  purchaseUpgrade: (upgradeId: string) => {
    const state = get()
    const upgState = state.upgrades.find((u) => u.id === upgradeId)
    const def = UPGRADES.find((u) => u.id === upgradeId)
    if (!upgState || !def) return

    // Check research gate
    if (def.gatedByResearch && !state.research.unlockedNodes.includes(def.gatedByResearch)) return

    const planetBonuses = getPlanetBonuses(state.planets)
    const achievementBonuses = getAchievementBonuses(state.achievements)
    const hasBulkBuy = state.research.unlockedNodes.includes('res_bulk_buy')
    const qty = hasBulkBuy ? state.buyQuantity : 1

    const { count, totalCost } = getBuyAmount(
      def, upgState.level, state.energy, qty,
      planetBonuses, achievementBonuses, state.prestige, state.events
    )
    if (count === 0) return

    const newUpgrades = state.upgrades.map((u) =>
      u.id === upgradeId ? { ...u, level: u.level + count } : u
    )

    set({ energy: state.energy - totalCost, upgrades: newUpgrades })
    get().recalcDerived()

    // Check achievements on purchase
    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const id of newAch) {
        const achDef = ACHIEVEMENTS.find((a) => a.id === id)
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

    // Research: planet refund
    if (state.research.unlockedNodes.includes('res_planet_refund')) {
      energyAfter += def.unlockCost * 0.25
    }

    set({ energy: energyAfter, planets: newPlanets })
    get().recalcDerived()
    audioManager.playSfx('purchase')

    // Check achievements
    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const id of newAch) {
        const achDef = ACHIEVEMENTS.find((a) => a.id === id)
        if (achDef) get().addToast(`Achievement: ${achDef.name}!`, 'achievement')
      }
      get().recalcDerived()
    }
  },

  tick: (deltaSec: number) => {
    const state = get()
    const now = Date.now()

    // Passive generation
    let gained = 0
    if (state.passivePerSecond > 0) {
      gained = state.passivePerSecond * state.globalMultiplier * deltaSec
    }

    // Auto-click (research)
    if (state.research.unlockedNodes.includes('res_auto_click')) {
      // Accumulate and fire click once per second via fractional tracking
      // Simple approach: add clickPower * globalMultiplier * deltaSec
      gained += state.clickPower * state.globalMultiplier * deltaSec
    }

    const updates: Partial<GameState> = {
      statistics: {
        ...state.statistics,
        playtime: state.statistics.playtime + deltaSec,
      },
    }

    if (gained > 0) {
      updates.energy = state.energy + gained
      updates.totalEnergyGenerated = state.totalEnergyGenerated + gained
    }

    // Event spawning
    if (!state.events.pendingEvent && !state.events.activeEvent && now >= state.events.nextEventTime) {
      const eventDef = getRandomEvent()
      updates.events = {
        ...state.events,
        pendingEvent: {
          eventId: eventDef.id,
          spawnedAt: now,
          expiresAt: now + 30_000, // 30s to click
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

    // Check achievements every ~5 seconds (check if playtime crossed a 5s boundary)
    const prevPlaytime = state.statistics.playtime
    const newPlaytime = prevPlaytime + deltaSec
    if (Math.floor(newPlaytime / 5) > Math.floor(prevPlaytime / 5)) {
      const newState = get()
      const newAch = checkAchievements(newState)
      if (newAch.length > 0) {
        set({ achievements: [...newState.achievements, ...newAch] })
        for (const id of newAch) {
          const achDef = ACHIEVEMENTS.find((a) => a.id === id)
          if (achDef) get().addToast(`Achievement: ${achDef.name}!`, 'achievement')
        }
        get().recalcDerived()
      }
    }
  },

  recalcDerived: () => {
    const state = get()
    const planetBonuses = getPlanetBonuses(state.planets)
    const achievementBonuses = getAchievementBonuses(state.achievements)
    const planetStatesWithMult = state.planets.map((p) => {
      const def = PLANETS.find((d) => d.id === p.id)
      return { ...p, multiplier: def?.multiplier ?? 1 }
    })

    set({
      clickPower: calculateClickPower(
        UPGRADES, state.upgrades, planetBonuses, achievementBonuses, state.prestige, state.events
      ),
      passivePerSecond: calculatePassivePerSecond(
        UPGRADES, state.upgrades, planetBonuses, achievementBonuses, state.prestige,
        state.research.unlockedNodes, state.events
      ),
      globalMultiplier: calculateGlobalMultiplier(
        UPGRADES, state.upgrades, planetStatesWithMult, achievementBonuses
      ),
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

    // Calculate starting energy from headstart
    const headstart = state.prestige.dustUpgrades.find((u) => u.id === 'dust_starting')
    const startingEnergy = headstart ? headstart.level * 100 : 0

    set({
      energy: startingEnergy,
      totalEnergyGenerated: 0,
      upgrades: createInitialUpgradeStates(),
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

    // Check prestige achievements
    const newState = get()
    const newAch = checkAchievements(newState)
    if (newAch.length > 0) {
      set({ achievements: [...newState.achievements, ...newAch] })
      for (const id of newAch) {
        const achDef = ACHIEVEMENTS.find((a) => a.id === id)
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

    // Migrate old saves
    const prestige = saved.prestige ?? createInitialPrestigeState()
    const achievements = saved.achievements ?? []
    const research = saved.research ?? createInitialResearchState()
    const events = saved.events ?? createInitialEventState()
    const buyQuantity = saved.buyQuantity ?? 1

    // Ensure new upgrades exist in saved state
    const savedUpgradeIds = new Set(saved.upgrades.map((u) => u.id))
    const migratedUpgrades = [...saved.upgrades]
    for (const def of UPGRADES) {
      if (!savedUpgradeIds.has(def.id)) {
        migratedUpgrades.push({ id: def.id, level: 0 })
      }
    }

    // Ensure dust upgrades exist
    const savedDustIds = new Set(prestige.dustUpgrades.map((u) => u.id))
    for (const def of DUST_UPGRADES) {
      if (!savedDustIds.has(def.id)) {
        prestige.dustUpgrades.push({ id: def.id, level: 0 })
      }
    }

    set({
      energy: saved.energy,
      totalEnergyGenerated: saved.totalEnergyGenerated,
      upgrades: migratedUpgrades,
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
    const hasResearchOffline = state.research.unlockedNodes.includes('res_offline')
    const offline = calculateOfflineEnergy(
      saved.lastSaveTime,
      state.passivePerSecond,
      state.globalMultiplier,
      planetBonuses,
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
      upgrades: state.upgrades,
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
