import type { GeneratorDef, GeneratorState } from './types'

export const GENERATORS: GeneratorDef[] = [
  {
    id: 'solar_panel',
    name: 'Solar Panels',
    description: 'Basic energy collection from starlight',
    baseCost: 4,
    costScaling: 1.07,
    baseRevenue: 1,
    cycleTime: 0.6,
    managerName: 'Solar AI',
    managerCost: 1_000,
  },
  {
    id: 'wind_turbine',
    name: 'Orbital Turbines',
    description: 'Harness orbital momentum for energy',
    baseCost: 60,
    costScaling: 1.15,
    baseRevenue: 60,
    cycleTime: 3,
    managerName: 'Turbine Drone',
    managerCost: 15_000,
  },
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactors',
    description: 'Controlled fusion for massive output',
    baseCost: 720,
    costScaling: 1.14,
    baseRevenue: 540,
    cycleTime: 6,
    managerName: 'Fusion Engineer',
    managerCost: 100_000,
  },
  {
    id: 'quantum_harvester',
    name: 'Quantum Harvesters',
    description: 'Extract energy from quantum fluctuations',
    baseCost: 8_640,
    costScaling: 1.13,
    baseRevenue: 4_320,
    cycleTime: 12,
    managerName: 'Quantum Overseer',
    managerCost: 500_000,
  },
  {
    id: 'antimatter_plant',
    name: 'Antimatter Plants',
    description: 'Annihilate matter for pure energy',
    baseCost: 103_680,
    costScaling: 1.12,
    baseRevenue: 51_840,
    cycleTime: 24,
    managerName: 'Antimatter Warden',
    managerCost: 1_200_000,
  },
  {
    id: 'dark_energy_tap',
    name: 'Dark Energy Taps',
    description: 'Tap into the fabric of spacetime',
    baseCost: 1_244_160,
    costScaling: 1.11,
    baseRevenue: 622_080,
    cycleTime: 48,
    managerName: 'Dark Energy Sentinel',
    managerCost: 10_000_000,
  },
  {
    id: 'dyson_sphere',
    name: 'Dyson Spheres',
    description: 'Encase entire stars for energy',
    baseCost: 14_929_920,
    costScaling: 1.10,
    baseRevenue: 7_464_960,
    cycleTime: 96,
    managerName: 'Dyson Architect',
    managerCost: 111_111_111,
  },
  {
    id: 'cosmic_string',
    name: 'Cosmic Strings',
    description: 'Harvest energy from cosmic string vibrations',
    baseCost: 179_159_040,
    costScaling: 1.09,
    baseRevenue: 89_579_520,
    cycleTime: 384,
    managerName: 'Cosmic Weaver',
    managerCost: 555_555_555,
  },
]

export const MILESTONE_THRESHOLDS = [25, 50, 100, 200, 300, 400] as const

export function getMilestoneMultiplier(owned: number): number {
  let mult = 1
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (owned >= threshold) mult *= 2
  }
  return mult
}

export function getNextMilestone(owned: number): { quantity: number; multiplier: number } | null {
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (owned < threshold) {
      return { quantity: threshold, multiplier: 2 }
    }
  }
  return null
}

export function createInitialGeneratorStates(): GeneratorState[] {
  return GENERATORS.map((g) => ({
    id: g.id,
    owned: 0,
    running: false,
    progress: 0,
    hasManager: false,
    totalRevenue: 0,
  }))
}
