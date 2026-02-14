import type { ResearchNodeDefinition, ResearchState } from './types'

export const RESEARCH_NODES: ResearchNodeDefinition[] = [
  {
    id: 'res_auto_click',
    name: 'Auto-Extractors',
    description: 'Automatically click once per second',
    cost: 500,
    requires: [],
    effect: 'Auto-click 1/sec',
  },
  {
    id: 'res_bulk_buy',
    name: 'Mass Production',
    description: 'Unlock x10, x100, and Max buy options',
    cost: 750,
    requires: [],
    effect: 'Bulk buy upgrades',
  },
  {
    id: 'res_offline',
    name: 'Subspace Relay',
    description: 'Boost offline energy generation',
    cost: 2_000,
    requires: ['res_auto_click'],
    effect: '+50% offline efficiency',
  },
  {
    id: 'res_planet_refund',
    name: 'Planetary Salvage',
    description: 'Refund 25% energy when unlocking planets',
    cost: 5_000,
    requires: ['res_bulk_buy'],
    effect: '25% planet cost refund',
  },
  {
    id: 'res_passive_boost',
    name: 'Quantum Tunneling',
    description: 'Boost all passive energy generation',
    cost: 8_000,
    requires: ['res_offline'],
    effect: '+20% passive generation',
  },
  {
    id: 'res_antimatter_unlock',
    name: 'Antimatter Theory',
    description: 'Unlock Antimatter Converters upgrade',
    cost: 10_000,
    requires: ['res_offline'],
    effect: 'Unlock Antimatter Converters',
  },
  {
    id: 'res_prestige_boost',
    name: 'Stellar Cartography',
    description: 'Earn more Stellar Dust on prestige',
    cost: 20_000,
    requires: ['res_passive_boost', 'res_planet_refund'],
    effect: '+15% Stellar Dust',
  },
]

export function createInitialResearchState(): ResearchState {
  return {
    unlockedNodes: [],
  }
}

export function canResearch(nodeId: string, researchState: ResearchState): boolean {
  if (researchState.unlockedNodes.includes(nodeId)) return false
  const def = RESEARCH_NODES.find((n) => n.id === nodeId)
  if (!def) return false
  return def.requires.every((req) => researchState.unlockedNodes.includes(req))
}
