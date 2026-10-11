import type { RankedModel } from '../lib/rank'
import type { Hardware } from '../lib/types'
import { ModelCard } from './ModelCard'

interface Props {
  items: RankedModel[]
  hw: Hardware
  loading: boolean
  error?: string
  hasMore: boolean
  /** Highlight the first runnable model as the recommendation. */
  highlightTop: boolean
  onMore: () => void
}

export function ModelList({ items, hw, loading, error, hasMore, highlightTop, onMore }: Props) {
  if (error) return <p class="status err">Couldn’t reach Hugging Face: {error}</p>
  if (!items.length) {
    return <p class="status">{loading ? 'Asking Hugging Face…' : 'No models match. Try a different search or hide fewer.'}</p>
  }
  return (
    <>
      <div class="grid">
        {items.map((r, i) => (
          <ModelCard key={r.model.id} ranked={r} hw={hw} topPick={highlightTop && i === 0 && r.evaluation.fit !== 'no'} />
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
