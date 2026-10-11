import type { RankedGroup } from '../lib/rank'
import type { Hardware } from '../lib/types'
import { ModelCard } from './ModelCard'

interface Props {
  groups: RankedGroup[]
  hw: Hardware
  loading: boolean
  error?: string
  hasMore: boolean
  /** Highlight the first runnable model as the recommendation. */
  highlightTop: boolean
  taskLabel: string
  onMore: () => void
}

export function ModelList({ groups, hw, loading, error, hasMore, highlightTop, taskLabel, onMore }: Props) {
  if (error) return <p class="status err">Couldn’t reach Hugging Face: {error}</p>
  if (!groups.length) {
    return <p class="status">{loading ? 'Asking Hugging Face…' : 'No models match. Try a different search or hide fewer.'}</p>
  }
  return (
    <>
      <div class="grid">
        {groups.map(({ lead, similar }, i) => (
          <ModelCard
            key={lead.model.id}
            ranked={lead}
            similar={similar}
            hw={hw}
            taskLabel={taskLabel}
            topPick={highlightTop && i === 0 && lead.evaluation.fit !== 'no'}
          />
        ))}
      </div>
      {hasMore && (
        <button type="button" class="btn more" onClick={onMore} disabled={loading}>
          {loading ? 'Loading…' : 'Load more from Hugging Face'}
        </button>
      )}
    </>
  )
}
