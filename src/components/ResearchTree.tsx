import { useGameStore } from '../store/gameStore'
import { RESEARCH_NODES, canResearch } from '../game/research'
import { formatNumber } from '../game/formulas'
import { RESEARCH_ICONS } from './Icons'

export default function ResearchTree() {
  const energy = useGameStore((s) => s.energy)
  const research = useGameStore((s) => s.research)
  const purchaseResearch = useGameStore((s) => s.purchaseResearch)

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-3">Research</h2>
      <p className="text-xs text-gray-500 mb-3">
        Spend energy to unlock permanent abilities. Research persists across prestiges.
      </p>
      <div>
        {RESEARCH_NODES.map((node, index) => {
          const unlocked = research.unlockedNodes.includes(node.id)
          const available = canResearch(node.id, research)
          const canAfford = energy >= node.cost
          const prereqsMet = node.requires.every((r) =>
            research.unlockedNodes.includes(r)
          )
          const allPrereqsUnlocked = node.requires.every((r) =>
            research.unlockedNodes.includes(r)
          )
          const hasConnector = node.requires.length > 0

          return (
            <div key={node.id}>
              {hasConnector && (
                <div className="flex justify-center">
                  <div
                    className={`w-px h-4 ${
                      allPrereqsUnlocked ? 'bg-emerald-500/50' : 'bg-gray-600'
                    }`}
                  />
                  {node.requires.length > 1 && (
                    <div
                      className={`w-3 h-px mt-2 ${
                        allPrereqsUnlocked ? 'bg-emerald-500/50' : 'bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              )}
              {index > 0 && !hasConnector && <div className="h-2" />}
            <div
              className={`rounded-lg p-3 border ${
                unlocked
                  ? 'bg-emerald-900/30 border-emerald-500/40'
                  : available
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : 'bg-gray-900/40 border-gray-800/30 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = RESEARCH_ICONS[node.id]
                      return Icon ? <Icon className="w-6 h-6 text-emerald-400 shrink-0" /> : null
                    })()}
                    <span className="font-medium text-gray-200 text-sm">
                      {node.name}
                    </span>
                    {unlocked && (
                      <span className="text-xs bg-emerald-600/30 text-emerald-300 px-1.5 py-0.5 rounded">
                        Researched
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {node.description}
                  </p>
                  <p className="text-xs text-emerald-400/70 mt-0.5">
                    {node.effect}
                  </p>
                  {!prereqsMet && !unlocked && (
                    <p className="text-xs text-yellow-500/70 mt-0.5">
                      Requires:{' '}
                      {node.requires
                        .map((r) => RESEARCH_NODES.find((n) => n.id === r)?.name ?? r)
                        .join(', ')}
                    </p>
                  )}
                </div>
                {unlocked ? (
                  <span className="text-xs text-emerald-400 font-medium">
                    Done
                  </span>
                ) : (
                  <button
                    onClick={() => purchaseResearch(node.id)}
                    disabled={!available || !canAfford}
                    className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      available && canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {formatNumber(node.cost)}
                  </button>
                )}
              </div>
            </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
