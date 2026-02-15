export interface GeneratorDef {
  id: string
  name: string
  description: string
  baseCost: number
  costScaling: number
  baseRevenue: number
  cycleTime: number          // seconds
  managerName: string
  managerCost: number
}

export interface GeneratorState {
  id: string
  owned: number              // quantity purchased
  running: boolean           // is a cycle currently in progress?
  progress: number           // 0-1, fraction of current cycle complete
  hasManager: boolean        // auto-runs when true
  totalRevenue: number       // lifetime revenue from this generator
}

export type PlanetEffectType =
  | 'cycleSpeed'
  | 'offlineEfficiency'
  | 'upgradeCostReduction'
  | 'revenueBoost'
  | 'eventDuration'

export interface PlanetSpecialEffect {
  type: PlanetEffectType
  value: number
  description: string
}

export interface PlanetDefinition {
  id: string
  name: string
  description: string
  unlockCost: number
  multiplier: number
  specialEffect: PlanetSpecialEffect
}

export interface PlanetState {
  id: string
  unlocked: boolean
}

export interface PlanetBonuses {
  cycleSpeed: number
  offlineEfficiency: number
  upgradeCostReduction: number
  revenueBoost: number
  eventDuration: number
}

export interface DustUpgradeDefinition {
  id: string
  name: string
  description: string
  cost: number
  maxLevel: number
  effectPerLevel: number
}

export interface DustUpgradeState {
  id: string
  level: number
}

export interface PrestigeState {
  stellarDust: number
  dustUpgrades: DustUpgradeState[]
  timesPrestiged: number
}

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  condition: (state: GameState) => boolean
  bonusType: 'revenue' | 'production' | 'globalMult' | 'costReduction' | 'prestigeDust'
  bonusValue: number
  bonusDescription: string
}

export interface AchievementBonuses {
  revenue: number
  production: number
  globalMult: number
  costReduction: number
  prestigeDust: number
}

export interface ResearchNodeDefinition {
  id: string
  name: string
  description: string
  cost: number
  requires: string[]
  effect: string
}

export interface ResearchState {
  unlockedNodes: string[]
}

export type EventId = 'solar_flare' | 'meteor_shower' | 'wormhole' | 'nebula_burst'

export interface GameEventDefinition {
  id: EventId
  name: string
  description: string
  duration: number
  effectType: 'production' | 'revenue' | 'costReduction'
  effectValue: number
}

export interface PendingEvent {
  eventId: EventId
  spawnedAt: number
  expiresAt: number
}

export interface ActiveEvent {
  eventId: EventId
  activatedAt: number
  endsAt: number
}

export interface EventState {
  pendingEvent: PendingEvent | null
  activeEvent: ActiveEvent | null
  nextEventTime: number
}

export type BuyQuantity = 1 | 10 | 100 | 'max'

export interface Statistics {
  totalClicks: number
  playtime: number
}

export interface GameState {
  energy: number
  totalEnergyGenerated: number
  globalMultiplier: number
  generators: GeneratorState[]
  planets: PlanetState[]
  lastSaveTime: number
  statistics: Statistics
  prestige: PrestigeState
  achievements: string[]
  research: ResearchState
  events: EventState
  buyQuantity: BuyQuantity
}

export interface SaveData {
  energy: number
  totalEnergyGenerated: number
  generators: GeneratorState[]
  planets: PlanetState[]
  lastSaveTime: number
  statistics: Statistics
  prestige?: PrestigeState
  achievements?: string[]
  research?: ResearchState
  events?: EventState
  buyQuantity?: BuyQuantity
  // Old save format detection
  upgrades?: { id: string; level: number }[]
}
