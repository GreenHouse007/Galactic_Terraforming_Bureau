import type { ResearchNodeDefinition, ResearchState } from './types'

export const RESEARCH_NODES: ResearchNodeDefinition[] = [
  {
    id: 'res_bulk_buy',
    name: 'Mass Production',
    description: 'Unlock x10, x100, and Max buy options',
    cost: 750,
    requires: [],
    effect: 'Bulk buy generators',
  },
  {
    id: 'res_offline',
    name: 'Subspace Relay',
    description: 'Boost offline energy generation',
    cost: 2_000,
    requires: [],
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
    id: 'res_revenue_boost',
    name: 'Quantum Tunneling',
    description: 'Boost all generator revenue',
    cost: 8_000,
    requires: ['res_offline'],
    effect: '+20% all revenue',
  },
  {
    id: 'res_tier2_unlock',
    name: 'Dark Matter Theory',
    description: 'Unlock generators 6-8',
    cost: 10_000,
    requires: ['res_offline'],
    effect: 'Unlock Dark Energy Taps, Dyson Spheres, Cosmic Strings',
  },
  {
    id: 'res_prestige_boost',
    name: 'Stellar Cartography',
    description: 'Earn more Stellar Dust on prestige',
    cost: 20_000,
    requires: ['res_revenue_boost', 'res_planet_refund'],
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
