import { useGameStore } from '../store/gameStore'

const TWINKLE_CLASSES = ['twinkle-slow', 'twinkle-med', 'twinkle-fast'] as const

interface Star {
  cx: number
  cy: number
  r: number
  opacity: number
  twinkle: string
  delay: number
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

const stars: Star[] = (() => {
  const rand = seededRandom(42)
  const result: Star[] = []
  for (let i = 0; i < 220; i++) {
    result.push({
      cx: rand() * 1920,
      cy: rand() * 1080,
      r: 0.5 + rand() * 1,
      opacity: 0.15 + rand() * 0.25,
      twinkle: TWINKLE_CLASSES[Math.floor(rand() * 3)],
      delay: rand() * 5,
    })
  }
  return result
})()

const STAR_COUNTS = [80, 100, 120, 150, 180, 220] as const

export default function Starfield() {
  const planets = useGameStore((s) => s.planets)
  const unlockedCount = planets.filter((p) => p.unlocked).length
  const starCount = STAR_COUNTS[Math.min(unlockedCount, STAR_COUNTS.length - 1)]

  return (
    <svg
      className="fixed inset-0 z-0 pointer-events-none"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
    >
      {stars.slice(0, starCount).map((star, i) => (
        <circle
          key={i}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          fill="white"
          opacity={star.opacity}
          className={star.twinkle}
          style={{ animationDelay: `${star.delay}s` }}
        />
      ))}
    </svg>
  )
}
