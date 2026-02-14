import type { ComponentType } from 'react'

interface IconProps {
  className?: string
}

// ── Upgrade Icons ──

export function IconExtractor({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M14 2l-3 8h4l-5 12 2-8H8z" />
      <path d="M6 22l2-4h8l2 4H6z" opacity={0.5} />
    </svg>
  )
}

export function IconSolarPanel({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="3" y="6" width="18" height="12" rx="1" opacity={0.3} />
      <path d="M3 6h18v12H3V6zm0 4h18M3 14h18M9 6v12M15 6v12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="2" r="1.5" />
      <path d="M12 3.5V6M8 2.5l1.5 2M16 2.5l-1.5 2" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export function IconFusionReactor({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.5} />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" opacity={0.3} />
      <circle cx="12" cy="4" r="1" />
      <circle cx="18.9" cy="16" r="1" />
      <circle cx="5.1" cy="16" r="1" />
    </svg>
  )
}

export function IconEfficiency({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14z" opacity={0.3} />
      <path d="M12 7l1.5 3h-3L12 7zm0 10l-1.5-3h3L12 17z" />
      <path d="M9 9.5L7.5 12l1.5 2.5M15 9.5l1.5 2.5-1.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}

export function IconQuantumHarvester({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.5} />
      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.5} transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.5} transform="rotate(120 12 12)" />
    </svg>
  )
}

export function IconGravityLens({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4a8 8 0 010 16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.6} />
      <path d="M12 6a6 6 0 010 12" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.4} />
      <path d="M12 4a8 8 0 000 16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.6} />
      <path d="M12 6a6 6 0 000 12" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.4} />
    </svg>
  )
}

export function IconSynergyMatrix({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <line x1="12" y1="7.5" x2="5" y2="15.5" stroke="currentColor" strokeWidth="1.5" opacity={0.5} />
      <line x1="12" y1="7.5" x2="19" y2="15.5" stroke="currentColor" strokeWidth="1.5" opacity={0.5} />
      <line x1="7.5" y1="18" x2="16.5" y2="18" stroke="currentColor" strokeWidth="1.5" opacity={0.5} />
    </svg>
  )
}

export function IconAntimatter({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="3" opacity={0.6} />
      <path d="M12 2v4M12 18v4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5l3 3M16 16l3 3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 19l3-3M16 8l3-3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

// ── Planet Icons (hardcoded fills) ──

export function IconMars({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#ef4444" />
      <circle cx="8" cy="9" r="2" fill="#dc2626" opacity={0.6} />
      <circle cx="15" cy="14" r="1.5" fill="#dc2626" opacity={0.5} />
      <circle cx="13" cy="7" r="1" fill="#dc2626" opacity={0.4} />
    </svg>
  )
}

export function IconVenus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#f59e0b" />
      <path d="M2 10q5 2 10 0t10 2" fill="none" stroke="#d97706" strokeWidth="1.5" opacity={0.5} />
      <path d="M2 14q5-2 10 0t10-2" fill="none" stroke="#d97706" strokeWidth="1.5" opacity={0.4} />
      <path d="M2 17q5 1 10-1t10 1" fill="none" stroke="#d97706" strokeWidth="1" opacity={0.3} />
    </svg>
  )
}

export function IconEuropa({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#93c5fd" />
      <path d="M5 8l6 4-3 6M14 4l-2 7 5 3" fill="none" stroke="#bfdbfe" strokeWidth="1" opacity={0.7} />
      <path d="M18 9l-4 2 1 6" fill="none" stroke="#bfdbfe" strokeWidth="0.8" opacity={0.5} />
    </svg>
  )
}

export function IconTitan({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#d97706" />
      <circle cx="12" cy="12" r="10" fill="#fbbf24" opacity={0.15} />
      <path d="M3 10q4.5 2 9 0t9 2" fill="none" stroke="#92400e" strokeWidth="1.2" opacity={0.4} />
      <path d="M3 14q4.5-1 9 1t9-1" fill="none" stroke="#92400e" strokeWidth="1" opacity={0.3} />
    </svg>
  )
}

export function IconProximaB({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="8" fill="#f87171" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#f87171" strokeWidth="0.5" opacity={0.4} />
      <circle cx="20" cy="8" r="1.5" fill="#fca5a5" />
      <line x1="12" y1="12" x2="20" y2="8" stroke="#f87171" strokeWidth="0.5" opacity={0.3} strokeDasharray="2 2" />
    </svg>
  )
}

// ── Research Icons ──

export function IconAutoExtractor({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15 2l-2 6h3l-4 8 1.5-5H11l2.5-9h1.5z" />
      <rect x="4" y="16" width="16" height="6" rx="1" opacity={0.3} />
      <path d="M8 16v-3a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function IconBulkBuy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3 5H9l3-5z" />
      <path d="M12 7l3 5H9l3-5z" opacity={0.7} />
      <path d="M12 12l3 5H9l3-5z" opacity={0.4} />
      <rect x="8" y="19" width="8" height="3" rx="1" opacity={0.3} />
    </svg>
  )
}

export function IconSubspaceRelay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="4" cy="12" r="2" />
      <path d="M8 12q4-6 8-6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.7} />
      <path d="M8 12q4 0 8-3" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.5} />
      <path d="M8 12q4 6 8 6" fill="none" stroke="currentColor" strokeWidth="1" opacity={0.3} />
      <circle cx="20" cy="12" r="2" />
    </svg>
  )
}

export function IconPlanetarySalvage({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="4" y="8" width="16" height="12" rx="1" opacity={0.4} />
      <path d="M4 8l4-4h8l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function IconQuantumTunnel({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <ellipse cx="7" cy="12" rx="5" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.6} />
      <ellipse cx="17" cy="12" rx="5" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.6} />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function IconAntimatterTheory({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="8" cy="8" r="2" opacity={0.6} />
      <ellipse cx="8" cy="8" rx="5" ry="2" fill="none" stroke="currentColor" strokeWidth="1" opacity={0.4} />
      <rect x="13" y="10" width="9" height="12" rx="1" opacity={0.3} />
      <line x1="15" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="1" opacity={0.5} />
      <line x1="15" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="1" opacity={0.5} />
      <line x1="15" y1="20" x2="18" y2="20" stroke="currentColor" strokeWidth="1" opacity={0.5} />
    </svg>
  )
}

export function IconStellarCartography({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5" cy="5" r="1.5" />
      <circle cx="18" cy="4" r="1" />
      <circle cx="12" cy="10" r="1.5" />
      <circle cx="20" cy="14" r="1" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="16" cy="20" r="1" />
      <line x1="5" y1="5" x2="12" y2="10" stroke="currentColor" strokeWidth="0.8" opacity={0.4} />
      <line x1="18" y1="4" x2="12" y2="10" stroke="currentColor" strokeWidth="0.8" opacity={0.4} />
      <line x1="12" y1="10" x2="7" y2="18" stroke="currentColor" strokeWidth="0.8" opacity={0.4} />
      <line x1="12" y1="10" x2="20" y2="14" stroke="currentColor" strokeWidth="0.8" opacity={0.4} />
      <line x1="7" y1="18" x2="16" y2="20" stroke="currentColor" strokeWidth="0.8" opacity={0.4} />
    </svg>
  )
}

// ── Event Icons ──

export function IconSolarFlare({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
      <path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function IconMeteorShower({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="6" cy="10" r="2" />
      <path d="M8 8l8-6" stroke="currentColor" strokeWidth="1.5" opacity={0.5} />
      <circle cx="14" cy="14" r="1.5" />
      <path d="M15.5 12.5l5-5" stroke="currentColor" strokeWidth="1.2" opacity={0.4} />
      <circle cx="10" cy="18" r="1" />
      <path d="M11 17l4-4" stroke="currentColor" strokeWidth="1" opacity={0.3} />
    </svg>
  )
}

export function IconWormhole({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity={0.2} />
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.35} />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity={0.5} />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.7} />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

export function IconNebulaBurst({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="4" opacity={0.6} />
      <circle cx="8" cy="8" r="3" opacity={0.25} />
      <circle cx="16" cy="8" r="2.5" opacity={0.2} />
      <circle cx="7" cy="15" r="2.5" opacity={0.2} />
      <circle cx="17" cy="15" r="3" opacity={0.25} />
      <circle cx="12" cy="18" r="2" opacity={0.15} />
      <circle cx="12" cy="6" r="1.5" opacity={0.15} />
    </svg>
  )
}

// ── Achievement Icons ──

export function IconTrophy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 4h10v6a5 5 0 01-10 0V4z" opacity={0.7} />
      <path d="M7 6H4a1 1 0 00-1 1v1a3 3 0 003 3h1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 6h3a1 1 0 011 1v1a3 3 0 01-3 3h-1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="14" width="4" height="4" rx="0.5" opacity={0.4} />
      <rect x="8" y="18" width="8" height="2" rx="1" opacity={0.5} />
    </svg>
  )
}

export function IconMedal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9 2l3 6 3-6" opacity={0.3} />
      <circle cx="12" cy="14" r="7" opacity={0.5} />
      <circle cx="12" cy="14" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3l-6.1 3.3 1.4-6.8L2.2 9.1l6.9-.8z" />
    </svg>
  )
}

// ── UI Icons ──

export function IconStellarDust({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3 7.5h-2l3 7.5h-2l3 5H7l3-5H8l3-7.5H9l3-7.5z" opacity={0.7} />
      <path d="M12 4l2 5.5h-1.5l2 5.5h-1.5l2 4H9l2-4H9.5l2-5.5H10l2-5.5z" />
    </svg>
  )
}

export function IconEnergyBolt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L5 14h6l-2 8 10-12h-6l2-8z" />
    </svg>
  )
}

export function IconEnergyOrb({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" opacity={0.3} />
      <circle cx="12" cy="12" r="7" opacity={0.5} />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 5l1.5 4h-3L12 5zm0 14l-1.5-4h3L12 19z" opacity={0.8} />
      <path d="M5 12l4 1.5v-3L5 12zm14 0l-4-1.5v3L19 12z" opacity={0.8} />
    </svg>
  )
}

// ── Lookup Maps ──

export const UPGRADE_ICONS: Record<string, ComponentType<IconProps>> = {
  click_boost_1: IconExtractor,
  generator_solar: IconSolarPanel,
  generator_fusion: IconFusionReactor,
  multiplier_efficiency: IconEfficiency,
  generator_quantum: IconQuantumHarvester,
  click_boost_2: IconGravityLens,
  multiplier_synergy: IconSynergyMatrix,
  generator_antimatter: IconAntimatter,
}

export const PLANET_ICONS: Record<string, ComponentType<IconProps>> = {
  mars: IconMars,
  venus: IconVenus,
  europa: IconEuropa,
  titan: IconTitan,
  proxima_b: IconProximaB,
}

export const RESEARCH_ICONS: Record<string, ComponentType<IconProps>> = {
  res_auto_click: IconAutoExtractor,
  res_bulk_buy: IconBulkBuy,
  res_offline: IconSubspaceRelay,
  res_planet_refund: IconPlanetarySalvage,
  res_passive_boost: IconQuantumTunnel,
  res_antimatter_unlock: IconAntimatterTheory,
  res_prestige_boost: IconStellarCartography,
}

export const EVENT_ICONS: Record<string, ComponentType<IconProps>> = {
  solar_flare: IconSolarFlare,
  meteor_shower: IconMeteorShower,
  wormhole: IconWormhole,
  nebula_burst: IconNebulaBurst,
}
